import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { EXPEDITION_ROUTES, FLEET_DATA } from '../lib/constants';

export type ExpeditionRouteRow = Database['public']['Tables']['expedition_routes']['Row'];
export type VesselRow = Database['public']['Tables']['vessels']['Row'];
export type DepartureRow = Database['public']['Tables']['expedition_departures']['Row'];
export type ExpeditionBookingRow = Database['public']['Tables']['expedition_bookings']['Row'];

export const expeditionService = {
  async getRoutes() {
    try {
      const { data, error } = await supabase
        .from('expedition_routes')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return EXPEDITION_ROUTES;
      }
      return data;
    } catch {
      return EXPEDITION_ROUTES;
    }
  },

  async getVessels() {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return FLEET_DATA;
      }
      return data;
    } catch {
      return FLEET_DATA;
    }
  },

  async getDepartures() {
    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .order('departure_date', { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async getAllBookings(): Promise<ExpeditionBookingRow[]> {
    try {
      const { data, error } = await supabase
        .from('expedition_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async createBooking(params: {
    departureId?: string;
    routeId?: string;
    vesselId?: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestRutPassport?: string;
    bookingType: 'per_pax' | 'full_charter';
    paxCount: number;
    totalAmount: number;
    dietaryMedicalNotes?: string;
    passengers?: Array<{ fullName: string; docId: string; nationality?: string; emergencyContact?: string; medicalNotes?: string }>;
  }): Promise<{ success: boolean; bookingCode?: string; bookingId?: string; error?: string }> {
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `EXP-${new Date().getFullYear()}-${randomSuffix}`;

      const { data: booking, error: bookErr } = await supabase
        .from('expedition_bookings')
        .insert({
          booking_code: bookingCode,
          departure_id: params.departureId || null,
          route_id: params.routeId || null,
          vessel_id: params.vesselId || null,
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          guest_phone: params.guestPhone,
          guest_rut_passport: params.guestRutPassport || null,
          booking_type: params.bookingType,
          pax_count: params.paxCount,
          total_amount: params.totalAmount,
          status: 'pending_transfer',
          dietary_medical_notes: params.dietaryMedicalNotes || null,
        })
        .select()
        .single();

      if (bookErr || !booking) {
        return { success: false, error: bookErr?.message || 'Error al registrar la reserva.' };
      }

      // Add passengers if provided
      if (params.passengers && params.passengers.length > 0) {
        const passengerRows = params.passengers.map((p) => ({
          booking_id: booking.id,
          full_name: p.fullName,
          doc_id: p.docId,
          nationality: p.nationality || 'Chilena',
          emergency_contact: p.emergencyContact || null,
          medical_notes: p.medicalNotes || null,
        }));
        await supabase.from('expedition_passengers').insert(passengerRows);
      }

      // Generate 2 payment installments: 50% deposit and 50% balance
      const deposit = Math.round(params.totalAmount * 0.5);
      const balance = params.totalAmount - deposit;

      await supabase.from('payment_installments').insert([
        {
          booking_type: 'expedition',
          booking_id: booking.id,
          installment_number: 1,
          total_installments: 2,
          concept: 'Pie de Reserva (50% Requerido para asegurar cupo)',
          amount_expected: deposit,
          status: 'pending_upload',
        },
        {
          booking_type: 'expedition',
          booking_id: booking.id,
          installment_number: 2,
          total_installments: 2,
          concept: 'Saldo Final (50% restante a 15 días del zarpe)',
          amount_expected: balance,
          status: 'pending_upload',
        },
      ]);

      return { success: true, bookingCode, bookingId: booking.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Error al crear reserva.' };
    }
  },

  async createDeparture(params: {
    routeId: string;
    vesselId: string;
    departureDate: string;
    returnDate: string;
    totalSlots: number;
    pricePerPaxClp: number;
    priceCharterFullClp?: number;
    status?: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
  }): Promise<{ success: boolean; data?: DepartureRow; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .insert({
          route_id: params.routeId,
          vessel_id: params.vesselId,
          departure_date: params.departureDate,
          return_date: params.returnDate,
          total_slots: params.totalSlots,
          available_slots: params.totalSlots,
          price_per_pax_clp: params.pricePerPaxClp,
          price_charter_full_clp: params.priceCharterFullClp || params.pricePerPaxClp * params.totalSlots,
          status: params.status || 'scheduled',
        })
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async updateDepartureStatus(
    departureId: string,
    status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('expedition_departures')
        .update({ status })
        .eq('id', departureId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteDeparture(departureId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('expedition_departures')
        .delete()
        .eq('id', departureId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async updateBookingStatus(bookingId: string, status: 'approved' | 'cancelled' | 'completed'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('expedition_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
