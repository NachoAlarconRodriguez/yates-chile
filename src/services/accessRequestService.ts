import { supabase } from '../lib/supabase';

export interface AdminAccessRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
}

const LOCAL_STORAGE_KEY = 'yates_admin_access_requests_v1';

const INITIAL_REQUESTS: AdminAccessRequest[] = [];

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const getCachedRequests = (): AdminAccessRequest[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REQUESTS;
  }
};

const saveCachedRequests = (list: AdminAccessRequest[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving access requests:', err);
  }
};

export const accessRequestService = {
  async getRequests(): Promise<AdminAccessRequest[]> {
    const local = getCachedRequests();
    try {
      const { data, error } = await (supabase as any)
        .from('admin_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized: AdminAccessRequest[] = data.map((item: any) => ({
          id: item.id,
          fullName: item.full_name || item.fullName,
          email: item.email,
          phone: item.phone,
          status: item.status || 'pending',
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          reviewedAt: item.reviewed_at || item.reviewedAt,
          notes: item.notes
        }));

        saveCachedRequests(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Supabase getRequests notice:', err);
    }
    return local;
  },

  async createRequest(data: { fullName: string; email: string; phone: string; notes?: string }): Promise<AdminAccessRequest> {
    const current = getCachedRequests();
    let assignedId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      const { data: dbData, error } = await (supabase as any).from('admin_access_requests').insert([{
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        status: 'pending',
        notes: data.notes?.trim() || null
      }]).select().single();

      if (!error && dbData) {
        assignedId = dbData.id;
      }
    } catch (err) {
      console.warn('Supabase createRequest notice:', err);
    }

    const newRequest: AdminAccessRequest = {
      id: assignedId,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: data.notes?.trim()
    };

    const updated = [newRequest, ...current.filter(r => r.id !== assignedId)];
    saveCachedRequests(updated);

    return newRequest;
  },

  async updateRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<AdminAccessRequest | null> {
    const current = getCachedRequests();
    let updatedItem: AdminAccessRequest | null = null;

    const updated = current.map((req) => {
      if (req.id === id) {
        updatedItem = {
          ...req,
          status,
          reviewedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return req;
    });

    if (!updatedItem) return null;

    saveCachedRequests(updated);

    if (isValidUuid(id)) {
      try {
        await (supabase as any)
          .from('admin_access_requests')
          .update({
            status,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateRequestStatus notice:', err);
      }
    }

    return updatedItem;
  },

  async deleteRequest(id: string): Promise<boolean> {
    const current = getCachedRequests();
    const filtered = current.filter(r => r.id !== id);
    saveCachedRequests(filtered);

    if (isValidUuid(id)) {
      try {
        await (supabase as any)
          .from('admin_access_requests')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteRequest notice:', err);
      }
    }

    return true;
  }
};
