import { supabase, supabaseAdmin } from '../lib/supabase';

export interface WaitlistEntry {
  id: string;
  departureId: string;
  departureName: string;
  departureDates: string;
  vesselId?: string;
  vesselName?: string;
  fullName: string;
  phone: string;
  email: string;
  paxCount: number;
  createdAt: string;
  status: 'waiting' | 'contacted' | 'promoted' | 'cancelled';
  notes?: string;
}

const WAITLIST_STORAGE_KEY = 'yates_expedition_waitlist';

export const waitlistService = {
  getStoredWaitlist(): WaitlistEntry[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  },

  saveStoredWaitlist(entries: WaitlistEntry[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
      window.dispatchEvent(new CustomEvent('yates_waitlist_updated'));
      window.dispatchEvent(new CustomEvent('storage'));
    } catch (_) {}
  },

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    const local = this.getStoredWaitlist();
    const cloudMap: Record<string, WaitlistEntry> = {};

    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('site_content')
        .select('section_key, title, metadata, updated_at')
        .ilike('section_key', 'expedition_waitlist_%');

      if (!error && data && data.length > 0) {
        data.forEach((row: any) => {
          const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
          const id = meta.id || row.section_key.replace('expedition_waitlist_', '');
          if (id) {
            cloudMap[id] = {
              id,
              departureId: meta.departureId || '',
              departureName: meta.departureName || row.title || 'Expedición',
              departureDates: meta.departureDates || '',
              vesselId: meta.vesselId || '',
              vesselName: meta.vesselName || '',
              fullName: meta.fullName || '',
              phone: meta.phone || '',
              email: meta.email || '',
              paxCount: Number(meta.paxCount) || 1,
              createdAt: meta.createdAt || row.updated_at || new Date().toISOString(),
              status: meta.status || 'waiting',
              notes: meta.notes || '',
            };
          }
        });
      }
    } catch (err) {
      console.warn('Could not fetch waitlist from Supabase site_content:', err);
    }

    // Merge cloud and local
    const mergedMap = new Map<string, WaitlistEntry>();
    local.forEach((l) => mergedMap.set(l.id, l));
    Object.values(cloudMap).forEach((c) => mergedMap.set(c.id, c));

    const result = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    this.saveStoredWaitlist(result);
    return result;
  },

  async createWaitlistEntry(params: {
    departureId: string;
    departureName: string;
    departureDates: string;
    vesselId?: string;
    vesselName?: string;
    fullName: string;
    phone: string;
    email: string;
    paxCount?: number;
    notes?: string;
  }): Promise<{ success: boolean; data?: WaitlistEntry; error?: string }> {
    try {
      const newId = `wl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const entry: WaitlistEntry = {
        id: newId,
        departureId: params.departureId,
        departureName: params.departureName,
        departureDates: params.departureDates,
        vesselId: params.vesselId,
        vesselName: params.vesselName,
        fullName: params.fullName.trim(),
        phone: params.phone.trim(),
        email: params.email.trim().toLowerCase(),
        paxCount: Math.max(1, params.paxCount || 1),
        createdAt: new Date().toISOString(),
        status: 'waiting',
        notes: params.notes || '',
      };

      // 1. Guardar en Supabase site_content con respaldo completo de metadatos
      try {
        const client = supabaseAdmin || supabase;
        await client
          .from('site_content')
          .upsert({
            section_key: `expedition_waitlist_${newId}`,
            title: `${entry.fullName} — ${entry.departureName}`,
            body_text: `Lista de Espera: ${entry.paxCount} cupo(s) solicitados por ${entry.fullName} (${entry.phone}, ${entry.email})`,
            metadata: entry as any,
            updated_at: entry.createdAt,
          }, { onConflict: 'section_key' });
      } catch (sbErr) {
        console.warn('Could not persist waitlist entry to Supabase site_content:', sbErr);
      }

      // 2. Registrar simultáneamente en tabla 'leads' para visibilidad en CRM de clientes
      try {
        const client = supabaseAdmin || supabase;
        await (client as any)
          .from('leads')
          .insert({
            full_name: entry.fullName,
            email: entry.email,
            phone: entry.phone,
            origin: 'lista_espera',
            origin_details: `Lista de Espera: ${entry.departureName} (${entry.departureDates}) - ${entry.paxCount} cupo(s)`,
            status: 'nuevo',
            interest_type: 'expediciones',
            estimated_pax: entry.paxCount,
            tentative_date: entry.departureDates,
            notes: `Inscripción en Lista de Espera Prioritaria para ${entry.departureName}. Tel: ${entry.phone}, Email: ${entry.email}.`,
          });
      } catch (leadErr) {
        console.warn('Could not auto-register waitlist in leads table:', leadErr);
      }

      // 3. Guardar en cache local y emitir evento reactivo
      const current = this.getStoredWaitlist();
      const updated = [...current.filter((e) => e.id !== newId), entry];
      this.saveStoredWaitlist(updated);

      return { success: true, data: entry };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al inscribirse en la lista de espera' };
    }
  },

  async updateWaitlistEntryStatus(
    id: string,
    status: WaitlistEntry['status'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const current = this.getStoredWaitlist();
      let target: WaitlistEntry | undefined;
      const updated = current.map((e) => {
        if (e.id === id) {
          target = {
            ...e,
            status,
            notes: notes !== undefined ? notes : e.notes,
          };
          return target;
        }
        return e;
      });

      this.saveStoredWaitlist(updated);

      if (target) {
        try {
          const client = supabaseAdmin || supabase;
          await client
            .from('site_content')
            .upsert({
              section_key: `expedition_waitlist_${id}`,
              title: `${target.fullName} — ${target.departureName}`,
              metadata: target as any,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'section_key' });
        } catch (sbErr) {
          console.warn('Could not update waitlist entry in Supabase:', sbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar estado' };
    }
  },

  async deleteWaitlistEntry(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const current = this.getStoredWaitlist();
      const updated = current.filter((e) => e.id !== id);
      this.saveStoredWaitlist(updated);

      try {
        const client = supabaseAdmin || supabase;
        await client
          .from('site_content')
          .delete()
          .eq('section_key', `expedition_waitlist_${id}`);
      } catch (sbErr) {
        console.warn('Could not delete waitlist entry from Supabase:', sbErr);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar registro' };
    }
  }
};
