import { supabase } from '../lib/supabase';
import type { CustomerProfile, CustomerAdminNote, CustomerTimelineItem } from '../pages/AdminPage';

export interface CrmClientRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  rut_or_passport: string | null;
  birth_date: string | null;
  nationality: string | null;
  city: string | null;
  category: 'vip' | 'regular' | 'prospect';
  tags: string[];
  total_spent_clp: number;
  bookings_count: number;
  last_activity_date: string | null;
  dietary_preferences: string | null;
  diving_level: string | null;
  beverage_preference: string | null;
  emergency_contact: string | null;
  notes: string | null;
  admin_notes: CustomerAdminNote[];
  timeline: CustomerTimelineItem[];
  created_at?: string;
  updated_at?: string;
}

const LOCAL_CRM_CACHE_KEY = 'yates_chile_crm_clients';

const mapRowToProfile = (row: any): CustomerProfile => ({
  id: row.id,
  fullName: row.full_name || 'Cliente sin nombre',
  email: row.email || '',
  phone: row.phone || '',
  rutOrPassport: row.rut_or_passport || '',
  birthDate: row.birth_date || '',
  nationality: row.nationality || '',
  city: row.city || '',
  category: (row.category as any) || 'regular',
  tags: Array.isArray(row.tags) ? row.tags : [],
  totalSpentClp: Number(row.total_spent_clp) || 0,
  bookingsCount: Number(row.bookings_count) || 0,
  lastActivityDate: row.last_activity_date || new Date().toISOString().split('T')[0],
  dietaryPreferences: row.dietary_preferences || '',
  divingLevel: row.diving_level || '',
  beveragePreference: row.beverage_preference || '',
  emergencyContact: row.emergency_contact || '',
  notes: row.notes || '',
  adminNotes: Array.isArray(row.admin_notes) ? row.admin_notes : [],
  timeline: Array.isArray(row.timeline) ? row.timeline : [],
});

const isValidUuid = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};

const mapProfileToRow = (p: Partial<CustomerProfile>): Record<string, any> => {
  const row: Record<string, any> = {};
  if (p.id && isValidUuid(p.id)) row.id = p.id;
  if (p.fullName !== undefined) row.full_name = p.fullName.trim();
  if (p.email !== undefined) row.email = p.email.trim();
  if (p.phone !== undefined) row.phone = p.phone.trim();
  if (p.rutOrPassport !== undefined) row.rut_or_passport = p.rutOrPassport.trim();
  if (p.birthDate !== undefined) row.birth_date = p.birthDate;
  if (p.nationality !== undefined) row.nationality = p.nationality.trim();
  if (p.city !== undefined) row.city = p.city.trim();
  if (p.category !== undefined) row.category = p.category;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.totalSpentClp !== undefined) row.total_spent_clp = p.totalSpentClp;
  if (p.bookingsCount !== undefined) row.bookings_count = p.bookingsCount;
  if (p.lastActivityDate !== undefined) row.last_activity_date = p.lastActivityDate;
  if (p.dietaryPreferences !== undefined) row.dietary_preferences = p.dietaryPreferences.trim();
  if (p.divingLevel !== undefined) row.diving_level = p.divingLevel.trim();
  if (p.beveragePreference !== undefined) row.beverage_preference = p.beveragePreference.trim();
  if (p.emergencyContact !== undefined) row.emergency_contact = p.emergencyContact.trim();
  if (p.notes !== undefined) row.notes = p.notes.trim();
  if (p.adminNotes !== undefined) row.admin_notes = p.adminNotes;
  if (p.timeline !== undefined) row.timeline = p.timeline;
  row.updated_at = new Date().toISOString();
  return row;
};

export const crmService = {
  async getAllClients(): Promise<CustomerProfile[]> {
    let remoteClients: CustomerProfile[] = [];
    try {
      const { data, error } = await (supabase as any)
        .from('crm_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        remoteClients = data.map(mapRowToProfile);
      }
    } catch (err) {
      console.warn('CRM fetch Supabase error:', err);
    }

    // Combine remote data with local cache to guarantee zero loss of unsynced items
    try {
      const raw = localStorage.getItem(LOCAL_CRM_CACHE_KEY);
      if (raw) {
        const localList: CustomerProfile[] = JSON.parse(raw);
        if (Array.isArray(localList) && localList.length > 0) {
          if (remoteClients.length === 0) return localList;

          const merged = [...remoteClients];
          localList.forEach((localCust) => {
            const exists = merged.some(
              (m) =>
                (m.id && localCust.id && m.id === localCust.id) ||
                (m.email && localCust.email && m.email.toLowerCase() === localCust.email.toLowerCase()) ||
                (m.rutOrPassport && localCust.rutOrPassport && m.rutOrPassport !== 'Sin documento' && m.rutOrPassport.toLowerCase() === localCust.rutOrPassport.toLowerCase()) ||
                (m.fullName.trim().toLowerCase() === localCust.fullName.trim().toLowerCase())
            );
            if (!exists) {
              merged.push(localCust);
            }
          });

          localStorage.setItem(LOCAL_CRM_CACHE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {}

    if (remoteClients.length > 0) {
      try {
        localStorage.setItem(LOCAL_CRM_CACHE_KEY, JSON.stringify(remoteClients));
      } catch {}
      return remoteClients;
    }

    return [];
  },

  async createClient(profile: Omit<CustomerProfile, 'id'> & { id?: string }): Promise<CustomerProfile> {
    const row = mapProfileToRow(profile);

    try {
      const { data, error } = await (supabase as any)
        .from('crm_clients')
        .insert(row)
        .select()
        .single();

      if (!error && data) {
        return mapRowToProfile(data);
      }
      if (error) {
        console.warn('Supabase create client warning:', error);
      }
    } catch (err) {
      console.warn('Supabase create client exception:', err);
    }

    const fallbackProfile: CustomerProfile = {
      ...profile,
      id: profile.id || `cli-${Date.now()}`,
    } as CustomerProfile;

    return fallbackProfile;
  },

  async updateClient(id: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const row = mapProfileToRow(updates);

    try {
      let query = (supabase as any).from('crm_clients').update(row);
      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else if (updates.email) {
        query = query.eq('email', updates.email.trim());
      } else if (updates.rutOrPassport && updates.rutOrPassport !== 'Sin documento') {
        query = query.eq('rut_or_passport', updates.rutOrPassport.trim());
      } else if (updates.fullName) {
        query = query.eq('full_name', updates.fullName.trim());
      } else {
        query = query.eq('id', id);
      }

      const { data, error } = await query.select().single();

      if (!error && data) {
        return mapRowToProfile(data);
      }
      if (error) {
        console.warn('Supabase update client error:', error);
      }
    } catch (err) {
      console.warn('Supabase update client error:', err);
    }

    return { id, ...updates } as CustomerProfile;
  },

  async deleteClient(id: string, fullName?: string, email?: string, rut?: string): Promise<{ success: boolean; error?: string }> {
    try {
      let query = (supabase as any).from('crm_clients').delete();
      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else if (email && email.includes('@')) {
        query = query.eq('email', email.trim());
      } else if (rut && rut !== 'Sin documento') {
        query = query.eq('rut_or_passport', rut.trim());
      } else if (fullName) {
        query = query.eq('full_name', fullName.trim());
      } else {
        query = query.eq('id', id);
      }

      const { error } = await query;
      if (error) {
        console.warn('Supabase delete client warning:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase delete client exception:', err);
      return { success: false, error: err?.message || 'Error al eliminar cliente' };
    }
  },
};
