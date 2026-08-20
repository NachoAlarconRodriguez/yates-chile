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

export const lodgeService = {
  async getRooms(): Promise<LodgeRoom[]> {
    try {
      const { data, error } = await supabase
        .from('lodge_rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_ROOMS;
      }
      return data;
    } catch {
      return FALLBACK_ROOMS;
    }
  },

  async getBookingsAndBlocks(): Promise<LodgeBooking[]> {
    try {
      const { data, error } = await supabase
        .from('lodge_bookings')
        .select('*')
        .in('status', ['pending_transfer', 'approved', 'blocked'])
        .order('check_in', { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('lodge_bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['pending_transfer', 'approved', 'blocked'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

      if (error) return true;
      return data.length === 0;
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

      const { data: booking, error: bookingErr } = await supabase
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

      if (bookingErr || !booking) {
        return { success: false, error: bookingErr?.message || 'Error al registrar la reserva.' };
      }

      // Generate 2 payment installments: 50% deposit and 50% balance
      const depositAmount = Math.round(params.totalAmount * 0.5);
      const balanceAmount = params.totalAmount - depositAmount;

      await supabase.from('payment_installments').insert([
        {
          booking_type: 'lodge',
          booking_id: booking.id,
          installment_number: 1,
          total_installments: 2,
          concept: 'Pie de Reserva (50% Requerido para confirmar)',
          amount_expected: depositAmount,
          status: 'pending_upload',
        },
        {
          booking_type: 'lodge',
          booking_id: booking.id,
          installment_number: 2,
          total_installments: 2,
          concept: 'Saldo Restante (50% previo al Check-In)',
          amount_expected: balanceAmount,
          status: 'pending_upload',
        },
      ]);

      return { success: true, bookingCode, bookingId: booking.id };
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

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteBookingOrBlock(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('lodge_bookings').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
