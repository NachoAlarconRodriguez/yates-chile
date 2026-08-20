import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type LodgeRoom = Database['public']['Tables']['lodge_rooms']['Row'];
export type LodgeBooking = Database['public']['Tables']['lodge_bookings']['Row'];

export const FALLBACK_ROOMS: LodgeRoom[] = [
  {
    id: 'room-1',
    room_number: 1,
    room_name: 'Cabina Proa (Triple)',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 240000,
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'room-2',
    room_number: 2,
    room_name: 'Cabina Barlovento (Triple)',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 240000,
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'room-3',
    room_number: 3,
    room_name: 'Cabina Sotavento (Triple)',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 240000,
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'room-4',
    room_number: 4,
    room_name: 'Cabina Popa (Doble Matrimonial)',
    room_type: 'doble',
    max_pax: 2,
    base_price_clp: 210000,
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_BOOKINGS_KEY = 'yates_lodge_bookings_cache';
const LOCAL_STORAGE_ROOMS_KEY = 'yates_lodge_rooms_cache';

const getCachedRooms = (): LodgeRoom[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
    return raw ? JSON.parse(raw) : FALLBACK_ROOMS;
  } catch {
    return FALLBACK_ROOMS;
  }
};

const saveCachedRooms = (list: LodgeRoom[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(list));
  } catch {}
};

const getCachedBookings = (): LodgeBooking[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCachedBookings = (list: LodgeBooking[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(list));
  } catch {}
};

export const lodgeService = {
  async getRooms(): Promise<LodgeRoom[]> {
    const local = getCachedRooms();
    try {
      const { data, error } = await supabase
        .from('lodge_rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error || !data || data.length === 0) {
        return local;
      }
      saveCachedRooms(data);
      return data;
    } catch {
      return local;
    }
  },

  async updateRoom(roomId: string, updates: Partial<LodgeRoom>): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Update local cache immediately
      const current = getCachedRooms();
      const updatedList = current.map((r) => (r.id === roomId ? { ...r, ...updates } : r));
      saveCachedRooms(updatedList);

      // 2. Update Supabase
      const { error } = await supabase
        .from('lodge_rooms')
        .update(updates)
        .eq('id', roomId);

      if (error) {
        console.warn('Lodge room update on Supabase warning, preserved in cache:', error);
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  async getBookingsAndBlocks(): Promise<LodgeBooking[]> {
    const local = getCachedBookings();
    try {
      const { data, error } = await supabase
        .from('lodge_bookings')
        .select('*')
        .in('status', ['pending_transfer', 'approved', 'blocked'])
        .order('check_in', { ascending: true });

      if (error || !data) return local;

      // Merge remote and local without duplicates (keyed by id or booking_code)
      const mergedMap = new Map<string, LodgeBooking>();
      local.forEach((b) => mergedMap.set(b.id || b.booking_code, b));
      data.forEach((b) => mergedMap.set(b.id || b.booking_code, b));
      const mergedList = Array.from(mergedMap.values()).sort((a, b) => a.check_in.localeCompare(b.check_in));
      saveCachedBookings(mergedList);
      return mergedList;
    } catch {
      return local;
    }
  },

  async checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const allBookings = await this.getBookingsAndBlocks();
      const hasConflict = allBookings.some((b) => {
        if (b.room_id !== roomId) return false;
        if (!['pending_transfer', 'approved', 'blocked'].includes(b.status)) return false;
        return b.check_in < checkOut && b.check_out > checkIn;
      });
      return !hasConflict;
    } catch {
      return true;
    }
  },

  async createBooking(params: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestRutPassport?: string;
    checkIn: string;
    checkOut: string;
    paxCount: number;
    totalAmount: number;
    notes?: string;
  }): Promise<{ success: boolean; bookingCode?: string; error?: string; bookingId?: string }> {
    try {
      const isAvailable = await this.checkAvailability(params.roomId, params.checkIn, params.checkOut);
      if (!isAvailable) {
        return { success: false, error: 'La habitación ya se encuentra reservada o bloqueada en esas fechas.' };
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `LODGE-${new Date().getFullYear()}-${randomSuffix}`;
      const newId = `lodge-${Date.now()}-${randomSuffix}`;

      const newBooking: LodgeBooking = {
        id: newId,
        booking_code: bookingCode,
        room_id: params.roomId,
        guest_name: params.guestName,
        guest_email: params.guestEmail,
        guest_phone: params.guestPhone,
        guest_rut_passport: params.guestRutPassport || null,
        check_in: params.checkIn,
        check_out: params.checkOut,
        pax_count: params.paxCount,
        channel_source: 'web_direct',
        status: 'pending_transfer',
        total_amount: params.totalAmount,
        discount_amount: 0,
        discount_reason: null,
        notes: params.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update local storage cache
      const cached = getCachedBookings();
      saveCachedBookings([...cached, newBooking]);

      const { data: booking } = await supabase
        .from('lodge_bookings')
        .insert({
          booking_code: bookingCode,
          room_id: params.roomId,
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          guest_phone: params.guestPhone,
          guest_rut_passport: params.guestRutPassport || null,
          check_in: params.checkIn,
          check_out: params.checkOut,
          pax_count: params.paxCount,
          channel_source: 'web_direct',
          status: 'pending_transfer',
          total_amount: params.totalAmount,
          notes: params.notes || null,
        })
        .select()
        .single();

      const createdBookingId = booking?.id || newId;

      // Generate 2 payment installments: 50% deposit and 50% balance
      const depositAmount = Math.round(params.totalAmount * 0.5);
      const balanceAmount = params.totalAmount - depositAmount;

      try {
        await supabase.from('payment_installments').insert([
          {
            booking_type: 'lodge',
            booking_id: createdBookingId,
            installment_number: 1,
            total_installments: 2,
            concept: 'Pie de Reserva (50% Requerido para confirmar)',
            amount_expected: depositAmount,
            status: 'pending_upload',
          },
          {
            booking_type: 'lodge',
            booking_id: createdBookingId,
            installment_number: 2,
            total_installments: 2,
            concept: 'Saldo Restante (50% previo al Check-In)',
            amount_expected: balanceAmount,
            status: 'pending_upload',
          },
        ]);
      } catch {}

      return { success: true, bookingCode, bookingId: createdBookingId };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Error inesperado.' };
    }
  },

  async adminBlockRoom(params: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    channelSource: 'airbnb' | 'booking_com' | 'phone_whatsapp' | 'maintenance';
    reason: string;
    guestName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const code = `BLK-${params.channelSource.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const localId = `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newBlock: LodgeBooking = {
        id: localId,
        booking_code: code,
        room_id: params.roomId,
        guest_name: params.guestName || `Bloqueo ${params.channelSource}`,
        guest_email: 'admin@yateschile.cl',
        guest_phone: '+56900000000',
        guest_rut_passport: null,
        check_in: params.checkIn,
        check_out: params.checkOut,
        pax_count: 1,
        channel_source: params.channelSource,
        status: 'blocked',
        total_amount: 0,
        discount_amount: 0,
        discount_reason: null,
        notes: params.reason,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Always save to local cache for instant UI feedback
      const currentCached = getCachedBookings();
      saveCachedBookings([...currentCached, newBlock]);

      // Attempt to save to Supabase
      try {
        const { error } = await supabase.from('lodge_bookings').insert({
          booking_code: code,
          room_id: params.roomId,
          guest_name: params.guestName || `Bloqueo ${params.channelSource}`,
          guest_email: 'admin@yateschile.cl',
          guest_phone: '+56900000000',
          check_in: params.checkIn,
          check_out: params.checkOut,
          pax_count: 1,
          channel_source: params.channelSource,
          status: 'blocked',
          notes: params.reason,
        });

        if (error) {
          console.warn('Supabase lodge block insert notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase DB error, using local persistence:', dbErr);
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteBookingOrBlock(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove from local cache
      const currentCached = getCachedBookings().filter((b) => b.id !== id && b.booking_code !== id);
      saveCachedBookings(currentCached);

      try {
        const { error } = await supabase.from('lodge_bookings').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete notice:', error.message);
        }
      } catch {}

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
