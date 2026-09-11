import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type LodgeRoom = Database['public']['Tables']['lodge_rooms']['Row'] & {
  description?: string;
  image_url?: string;
  amenities?: string[];
  rates_by_pax?: Record<number, number>;
};
export type LodgeBooking = Database['public']['Tables']['lodge_bookings']['Row'];

export const FALLBACK_ROOMS: LodgeRoom[] = [
  {
    id: '9cd4b007-da25-423d-91cf-3a4d042f5110',
    room_number: 1,
    room_name: 'Albatros',
    room_type: 'doble',
    max_pax: 2,
    base_price_clp: 250000,
    rates_by_pax: { 1: 220000, 2: 250000 },
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
    image_url: '/rincon-de-navegantes.jpg',
    description: 'Habitación doble superior con cama matrimonial king, baño en suite de mármol y ventanal panorámico con vista a Bahía Cumberland.',
    amenities: ['Cama King / Doble', 'Baño en suite privado', 'Vista panorámica al mar', 'Calefacción central', 'Starlink WiFi']
  },
  {
    id: '219bc857-4594-4811-9bcc-dce8cd3e4f77',
    room_number: 2,
    room_name: 'Cumberland',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 260000,
    rates_by_pax: { 1: 210000, 2: 240000, 3: 260000 },
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
    image_url: '/jf-noviembre.jpg',
    description: 'Habitación triple espaciosa ideal para familias o pequeños grupos, con cama matrimonial y cama single, baño privado y vista a la bahía.',
    amenities: ['1 Cama King + 1 Single', 'Baño privado completo', 'Vista a Bahía Cumberland', 'Ropa de cama premium', 'Starlink WiFi']
  },
  {
    id: 'aebcfa0e-0add-465c-9c86-307422051eee',
    room_number: 3,
    room_name: 'Selkirk',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 260000,
    rates_by_pax: { 1: 210000, 2: 240000, 3: 260000 },
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
    image_url: '/juan-fernandez-selkirk.jpg',
    description: 'Acogedora habitación triple con maderas nobles nativas, vista a los acantilados y al mar, equipada para el máximo descanso tras un día de expedición.',
    amenities: ['3 Camas o 1 Matrimonial + 1 Single', 'Baño en suite', 'Vista a acantilados y mar', 'Calefacción', 'Starlink WiFi']
  },
  {
    id: '605b5ec1-819c-4537-b883-8d653aadbfe6',
    room_number: 4,
    room_name: 'Vidriola',
    room_type: 'triple',
    max_pax: 3,
    base_price_clp: 260000,
    rates_by_pax: { 1: 210000, 2: 240000, 3: 260000 },
    has_ocean_view: true,
    is_active: true,
    created_at: new Date().toISOString(),
    image_url: '/jf-marzo.jpg',
    description: 'Habitación triple con terraza exterior y acceso directo al muelle de la bahía. Bautizada en honor al pez rey de Juan Fernández.',
    amenities: ['Capacidad 3 huéspedes', 'Terraza exterior privada', 'Baño en suite', 'Vista a la bahía', 'Starlink WiFi']
  },
];

export const LODGE_TOTAL_MAX_PAX = 11; // 2 (Albatros) + 3 (Cumberland) + 3 (Selkirk) + 3 (Vidriola)

export const isRoomSuitableForPax = (room: LodgeRoom, pax: number): boolean => {
  return (room.max_pax ?? 3) >= pax;
};

/**
 * Calculates the nightly rate for a room based on occupancy (rates_by_pax).
 * Falls back cleanly to base_price_clp if occupancy pricing is not specifically set.
 */
export const getRoomNightlyRate = (room?: LodgeRoom | null, pax: number = 2): number => {
  if (!room) return 240000;
  if (room.rates_by_pax && typeof room.rates_by_pax === 'object') {
    const targetPax = Math.max(1, Math.round(pax));
    if (room.rates_by_pax[targetPax] != null && Number(room.rates_by_pax[targetPax]) > 0) {
      return Number(room.rates_by_pax[targetPax]);
    }
    const keys = Object.keys(room.rates_by_pax).map(Number).sort((a, b) => a - b);
    if (keys.length > 0) {
      if (targetPax > keys[keys.length - 1]) return Number(room.rates_by_pax[keys[keys.length - 1]]);
      if (targetPax < keys[0]) return Number(room.rates_by_pax[keys[0]]);
    }
  }
  return Number(room.base_price_clp) || 240000;
};

const LOCAL_STORAGE_BOOKINGS_KEY = 'yates_lodge_bookings_v3';
const LOCAL_STORAGE_ROOMS_KEY = 'yates_lodge_rooms_v4';

const getCachedRooms = (): LodgeRoom[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(FALLBACK_ROOMS));
      return FALLBACK_ROOMS;
    }
    const parsed: LodgeRoom[] = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_ROOMS;
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
      const [roomsRes, ratesRes] = await Promise.all([
        supabase
          .from('lodge_rooms')
          .select('*')
          .order('room_number', { ascending: true }),
        supabase
          .from('site_content')
          .select('metadata')
          .eq('section_key', 'lodge_room_rates')
          .maybeSingle(),
      ]);

      const data = roomsRes.data;
      if (roomsRes.error || !data || data.length === 0) {
        return local;
      }

      const ratesMetadata = (ratesRes.data?.metadata as Record<string, any>) || {};

      const enriched: LodgeRoom[] = data.map((room) => {
        const fallback = FALLBACK_ROOMS.find((f) => f.room_number === room.room_number);
        const localRoom = local.find((l) => l.id === room.id || l.room_number === room.room_number);

        // Saved rates by priority:
        // 1. Supabase site_content ratesMetadata by room.id
        // 2. Supabase site_content ratesMetadata by room_{room_number}
        // 3. Local cached room rates_by_pax
        // 4. Fallback room rates_by_pax
        const savedRates =
          ratesMetadata[room.id] ||
          ratesMetadata[`room_${room.room_number}`] ||
          localRoom?.rates_by_pax ||
          fallback?.rates_by_pax;

        const effectiveRates: Record<number, number> = {};
        if (savedRates && typeof savedRates === 'object') {
          Object.entries(savedRates).forEach(([k, v]) => {
            const paxNum = Number(k);
            const rateVal = Number(v);
            if (!isNaN(paxNum) && !isNaN(rateVal) && rateVal > 0) {
              effectiveRates[paxNum] = rateVal;
            }
          });
        }

        const maxPax = room.max_pax || fallback?.max_pax || 2;
        const base = Number(room.base_price_clp) || fallback?.base_price_clp || 240000;

        // Ensure every pax from 1 to maxPax has a rate defined
        for (let p = 1; p <= maxPax; p++) {
          if (!effectiveRates[p]) {
            if (p === 1) effectiveRates[p] = Math.round((base * 0.88) / 1000) * 1000;
            else if (p === 2) effectiveRates[p] = base;
            else effectiveRates[p] = base + (p - 2) * 40000;
          }
        }

        return {
          ...fallback,
          ...localRoom,
          ...room,
          base_price_clp: base,
          rates_by_pax: effectiveRates,
          description: (room as any).description || localRoom?.description || fallback?.description || 'Habitación en Lodge Bahía Cumberland.',
          image_url: (room as any).image_url || localRoom?.image_url || fallback?.image_url || '/rincon-de-navegantes.jpg',
          amenities: (room as any).amenities || localRoom?.amenities || fallback?.amenities || ['Baño privado en suite', 'Vista al mar', 'Starlink WiFi'],
        };
      });

      saveCachedRooms(enriched);
      return enriched;
    } catch {
      return local;
    }
  },

  async createRoom(newRoomData: Partial<LodgeRoom>): Promise<LodgeRoom> {
    const current = getCachedRooms();
    const newId = newRoomData.id || `room-${Date.now()}`;
    const nextNumber = newRoomData.room_number || (current.length > 0 ? Math.max(...current.map(r => r.room_number)) + 1 : 1);
    
    const newRoom: LodgeRoom = {
      id: newId,
      room_number: nextNumber,
      room_name: newRoomData.room_name || `Habitación ${nextNumber}`,
      room_type: newRoomData.room_type || 'doble',
      max_pax: newRoomData.max_pax || 2,
      base_price_clp: Number(newRoomData.base_price_clp) || 220000,
      has_ocean_view: newRoomData.has_ocean_view !== undefined ? newRoomData.has_ocean_view : true,
      is_active: newRoomData.is_active !== undefined ? newRoomData.is_active : true,
      created_at: new Date().toISOString(),
      description: newRoomData.description || 'Habitación con vista al mar y baño en suite en Lodge Bahía Cumberland.',
      image_url: newRoomData.image_url || '/rincon-de-navegantes.jpg',
      amenities: newRoomData.amenities || ['Baño privado en suite', 'Vista al mar', 'Starlink WiFi'],
      rates_by_pax: newRoomData.rates_by_pax || { 1: Math.round(((newRoomData.base_price_clp || 220000) * 0.88) / 1000) * 1000, 2: newRoomData.base_price_clp || 220000 }
    };

    const updated = [...current, newRoom].sort((a, b) => a.room_number - b.room_number);
    saveCachedRooms(updated);

    try {
      const dbRoom = {
        room_number: newRoom.room_number,
        room_name: newRoom.room_name,
        room_type: newRoom.room_type,
        max_pax: newRoom.max_pax,
        base_price_clp: newRoom.base_price_clp,
        has_ocean_view: newRoom.has_ocean_view,
        is_active: newRoom.is_active,
      };
      const { data: createdRoom } = await (supabase.from('lodge_rooms') as any).insert([dbRoom]).select().single();
      const actualId = createdRoom?.id || newId;

      if (newRoom.rates_by_pax) {
        const { data: existingContent } = await supabase
          .from('site_content')
          .select('metadata')
          .eq('section_key', 'lodge_room_rates')
          .maybeSingle();

        const currentMeta = (existingContent?.metadata as Record<string, any>) || {};
        const updatedMeta = {
          ...currentMeta,
          [actualId]: newRoom.rates_by_pax,
          [`room_${nextNumber}`]: newRoom.rates_by_pax,
        };

        await supabase.from('site_content').upsert(
          {
            section_key: 'lodge_room_rates',
            title: 'Tarifas por Pasajero Lodge',
            metadata: updatedMeta,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'section_key' }
        );
      }
    } catch {}

    return newRoom;
  },

  async updateRoom(roomId: string, updates: Partial<LodgeRoom>): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Update local cache immediately for instant UI responsiveness
      const current = getCachedRooms();
      const updatedList = current.map((r) => (r.id === roomId ? { ...r, ...updates } : r));
      saveCachedRooms(updatedList);

      const targetRoom = current.find((r) => r.id === roomId);
      const roomNumber = targetRoom?.room_number ?? updates.room_number;

      // 2. Persist columns into public.lodge_rooms
      const dbFields: Record<string, any> = {};
      if (updates.room_name !== undefined) dbFields.room_name = updates.room_name;
      if (updates.room_number !== undefined) dbFields.room_number = updates.room_number;
      if (updates.room_type !== undefined) dbFields.room_type = updates.room_type;
      if (updates.max_pax !== undefined) dbFields.max_pax = Number(updates.max_pax);
      if (updates.base_price_clp !== undefined) dbFields.base_price_clp = Number(updates.base_price_clp);
      if (updates.has_ocean_view !== undefined) dbFields.has_ocean_view = updates.has_ocean_view;
      if (updates.is_active !== undefined) dbFields.is_active = updates.is_active;

      if (Object.keys(dbFields).length > 0) {
        const { error: dbErr } = await (supabase.from('lodge_rooms') as any)
          .update(dbFields)
          .eq('id', roomId);
        if (dbErr) {
          console.warn('Error updating lodge_rooms on Supabase:', dbErr.message);
        }
      }

      // 3. Persist rates_by_pax into public.site_content ('lodge_room_rates')
      if (updates.rates_by_pax) {
        try {
          const { data: existingContent } = await supabase
            .from('site_content')
            .select('metadata')
            .eq('section_key', 'lodge_room_rates')
            .maybeSingle();

          const currentMeta = (existingContent?.metadata as Record<string, any>) || {};
          const updatedMeta = {
            ...currentMeta,
            [roomId]: updates.rates_by_pax,
            ...(roomNumber ? { [`room_${roomNumber}`]: updates.rates_by_pax } : {}),
          };

          await supabase.from('site_content').upsert(
            {
              section_key: 'lodge_room_rates',
              title: 'Tarifas por Pasajero Lodge',
              metadata: updatedMeta,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'section_key' }
          );
        } catch (ratesErr) {
          console.warn('Error persisting rates_by_pax in site_content:', ratesErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al actualizar habitación.' };
    }
  },

  async deleteRoom(roomId: string): Promise<{ success: boolean; message?: string }> {
    const current = getCachedRooms();
    const filtered = current.filter(r => r.id !== roomId);
    saveCachedRooms(filtered);

    try {
      await supabase.from('lodge_rooms').delete().eq('id', roomId);
    } catch {}

    return { success: true };
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
