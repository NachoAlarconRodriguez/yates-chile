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
  rutOrPassport: row.rut_or_passport || 'Sin documento',
  birthDate: row.birth_date || '',
  nationality: row.nationality || 'Chilena',
  city: row.city || 'Chile',
  category: (row.category as any) || 'regular',
  tags: Array.isArray(row.tags) ? row.tags : [],
  totalSpentClp: Number(row.total_spent_clp) || 0,
  bookingsCount: Number(row.bookings_count) || 0,
  lastActivityDate: row.last_activity_date || new Date().toISOString().split('T')[0],
  dietaryPreferences: row.dietary_preferences || 'Sin notas adicionales.',
  divingLevel: row.diving_level || 'Principiante',
  beveragePreference: row.beverage_preference || '',
  emergencyContact: row.emergency_contact || '',
  notes: row.notes || '',
  adminNotes: Array.isArray(row.admin_notes) ? row.admin_notes : [],
  timeline: Array.isArray(row.timeline) ? row.timeline : [],
});

const mapProfileToRow = (p: Partial<CustomerProfile>): Record<string, any> => {
  const row: Record<string, any> = {};
  if (p.id) row.id = p.id;
  if (p.fullName !== undefined) row.full_name = p.fullName.trim();
  if (p.email !== undefined) row.email = p.email.trim();
  if (p.phone !== undefined) row.phone = p.phone.trim();
  if (p.rutOrPassport !== undefined) row.rut_or_passport = p.rutOrPassport.trim();
  if (p.birthDate !== undefined) row.birth_date = p.birthDate;
  if (p.nationality !== undefined) row.nationality = p.nationality;
  if (p.city !== undefined) row.city = p.city;
  if (p.category !== undefined) row.category = p.category;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.totalSpentClp !== undefined) row.total_spent_clp = p.totalSpentClp;
  if (p.bookingsCount !== undefined) row.bookings_count = p.bookingsCount;
  if (p.lastActivityDate !== undefined) row.last_activity_date = p.lastActivityDate;
  if (p.dietaryPreferences !== undefined) row.dietary_preferences = p.dietaryPreferences;
  if (p.divingLevel !== undefined) row.diving_level = p.divingLevel;
  if (p.beveragePreference !== undefined) row.beverage_preference = p.beveragePreference;
  if (p.emergencyContact !== undefined) row.emergency_contact = p.emergencyContact;
  if (p.notes !== undefined) row.notes = p.notes;
  if (p.adminNotes !== undefined) row.admin_notes = p.adminNotes;
  if (p.timeline !== undefined) row.timeline = p.timeline;
  row.updated_at = new Date().toISOString();
  return row;
};

export const crmService = {
  async getAllClients(): Promise<CustomerProfile[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('crm_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapRowToProfile);
        try {
          localStorage.setItem(LOCAL_CRM_CACHE_KEY, JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('CRM fetch Supabase error:', err);
    }

    // Fallback to local cache if Supabase table is not yet created or offline
    try {
      const raw = localStorage.getItem(LOCAL_CRM_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

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
      const { data, error } = await (supabase as any)
        .from('crm_clients')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return mapRowToProfile(data);
      }
    } catch (err) {
      console.warn('Supabase update client error:', err);
    }

    return { id, ...updates } as CustomerProfile;
  },

  async deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any)
        .from('crm_clients')
        .delete()
        .eq('id', id);

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
