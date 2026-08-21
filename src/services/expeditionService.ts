import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { EXPEDITION_ROUTES, FLEET_DATA } from '../lib/constants';

export type ExpeditionRouteRow = Database['public']['Tables']['expedition_routes']['Row'];
export type VesselRow = Database['public']['Tables']['vessels']['Row'];
export type DepartureRow = Database['public']['Tables']['expedition_departures']['Row'] & {
  name?: string;
  location?: string;
  image?: string;
  description?: string;
  tempEstimate?: string;
  bestViewTime?: string;
  route?: any;
  vessel?: any;
};
export type ExpeditionBookingRow = Database['public']['Tables']['expedition_bookings']['Row'];

export interface PublicExpedition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  departureDate: string;
  returnDate: string;
  monthsActive: number[];
  year: number;
  spotsLeft: number | 'completo' | 'bloqueado';
  totalSlots: number;
  availableSlots: number;
  pricePerPaxClp: number;
  priceCharterFullClp: number;
  vessel: string;
  vesselId: string;
  routeId: string;
  description: string;
  location: string;
  image: string;
  bestViewTime?: string;
  tempEstimate?: string;
  status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
}

export const INITIAL_EXPEDITIONS: PublicExpedition[] = [
  {
    id: 'exp-rob-1',
    name: 'Expedición Robinson',
    startDate: '09 sept 2026',
    endDate: '24 sept 2026',
    departureDate: '2026-09-09',
    returnDate: '2026-09-24',
    monthsActive: [9],
    year: 2026,
    spotsLeft: 'completo',
    totalSlots: 6,
    availableSlots: 0,
    pricePerPaxClp: 2200000,
    priceCharterFullClp: 13200000,
    vessel: 'Lodge Rincón de Navegantes',
    vesselId: 'lodge',
    routeId: 'ruta-juan-fernandez',
    description: 'Estadía de exploración botánica e inmersión histórica en el archipiélago de Juan Fernández, hospedándose en nuestro santuario privado de Cumberland.',
    location: 'Isla Robinson Crusoe',
    image: '/rincon-de-navegantes.jpg',
    bestViewTime: 'Primavera austral',
    tempEstimate: '13°C - 16°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-rob-2',
    name: 'Travesía Robinson',
    startDate: '30 sept 2026',
    endDate: '14 oct 2026',
    departureDate: '2026-09-30',
    returnDate: '2026-10-14',
    monthsActive: [9, 10],
    year: 2026,
    spotsLeft: 4,
    totalSlots: 6,
    availableSlots: 4,
    pricePerPaxClp: 1850000,
    priceCharterFullClp: 11100000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Aventura oceánica de ida y vuelta navegando a vela hacia Juan Fernández. Ideal para navegantes apasionados que buscan el reto del mar abierto.',
    location: 'Océano Pacífico Sur',
    image: '/travesia-robinson.jpg',
    bestViewTime: 'Zarpe de primavera',
    tempEstimate: '12°C - 15°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-jf-nov',
    name: 'JF 1 de Noviembre',
    startDate: '31 oct 2026',
    endDate: '11 nov 2026',
    departureDate: '2026-10-31',
    returnDate: '2026-11-11',
    monthsActive: [10, 11],
    year: 2026,
    spotsLeft: 4,
    totalSlots: 6,
    availableSlots: 4,
    pricePerPaxClp: 1950000,
    priceCharterFullClp: 11700000,
    vessel: 'Lodge Rincón de Navegantes',
    vesselId: 'lodge',
    routeId: 'ruta-juan-fernandez',
    description: 'Travesía de descanso en primavera tardía. Recorra senderos rodeados de helechos gigantes y disfrute de la primera pesca de langosta de la temporada.',
    location: 'Bahía Cumberland',
    image: '/jf-noviembre.jpg',
    bestViewTime: 'Mañana templada',
    tempEstimate: '14°C - 18°C',
    status: 'scheduled'
  },
  {
    id: 'exp-zar-dic',
    name: 'Zarpe Archipiélago',
    startDate: '01 dic 2026',
    endDate: '15 dic 2026',
    departureDate: '2026-12-01',
    returnDate: '2026-12-15',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 2,
    totalSlots: 8,
    availableSlots: 2,
    pricePerPaxClp: 2450000,
    priceCharterFullClp: 19600000,
    vessel: 'Yate Terranova',
    vesselId: 'terranova',
    routeId: 'ruta-juan-fernandez',
    description: 'Travesía rápida y confortable a motor a bordo de nuestro yate de alta velocidad. Explora caletas solitarias con la comodidad y el lujo que ofrece el Terranova.',
    location: 'Juan Fernández',
    image: '/zarpe-archipielago.jpg',
    bestViewTime: 'Atardecer en flybridge',
    tempEstimate: '16°C - 20°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-sel-dic',
    name: 'Juan Fernández-Selkirk',
    startDate: '05 dic 2026',
    endDate: '12 dic 2026',
    departureDate: '2026-12-05',
    returnDate: '2026-12-12',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 3,
    totalSlots: 6,
    availableSlots: 3,
    pricePerPaxClp: 2100000,
    priceCharterFullClp: 12600000,
    vessel: 'Lodge & Velero',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Expedición combinada marítimo-terrestre en busca de los vestigios del histórico navegante Alejandro Selkirk. Incluye navegación en velero e itinerarios de trekking exigentes.',
    location: 'Santuario Selkirk',
    image: '/juan-fernandez-selkirk.jpg',
    bestViewTime: 'Jornada de día completo',
    tempEstimate: '15°C - 19°C',
    status: 'scheduled'
  },
  {
    id: 'exp-jf-ene',
    name: 'Archipiélago Juan Fernández',
    startDate: '01 ene 2027',
    endDate: '16 ene 2027',
    departureDate: '2027-01-01',
    returnDate: '2027-01-16',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 'completo',
    totalSlots: 6,
    availableSlots: 0,
    pricePerPaxClp: 2400000,
    priceCharterFullClp: 14400000,
    vessel: 'Lodge Rincón de Navegantes',
    vesselId: 'lodge',
    routeId: 'ruta-juan-fernandez',
    description: 'Expedición en temporada alta de verano. Senderismo de montaña, buceo con lobos marinos de dos pelos y degustación gastronómica en nuestro refugio Cumberland.',
    location: 'Robinson Crusoe',
    image: '/rincon-de-navegantes.jpg',
    bestViewTime: 'Verano austral',
    tempEstimate: '18°C - 22°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-sel-ene',
    name: 'Selkirk Colombia',
    startDate: '20 ene 2027',
    endDate: '28 ene 2027',
    departureDate: '2027-01-20',
    returnDate: '2027-01-28',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 5,
    totalSlots: 6,
    availableSlots: 5,
    pricePerPaxClp: 1850000,
    priceCharterFullClp: 11100000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Navegación deportiva, pesca de altura y avistamiento de cetáceos en el Pacífico Sur profundo. Una ruta desafiante con el sello de Yates Chile.',
    location: 'Isla Alejandro Selkirk',
    image: '/travesia-robinson.jpg',
    bestViewTime: 'Navegación matutina',
    tempEstimate: '17°C - 21°C',
    status: 'scheduled'
  },
  {
    id: 'exp-pes-ene',
    name: 'Grupo Pesca Selkirk (España)',
    startDate: '28 ene 2027',
    endDate: '04 feb 2027',
    departureDate: '2027-01-28',
    returnDate: '2027-02-04',
    monthsActive: [1, 2],
    year: 2027,
    spotsLeft: 'completo',
    totalSlots: 8,
    availableSlots: 0,
    pricePerPaxClp: 2600000,
    priceCharterFullClp: 20800000,
    vessel: 'Yate Terranova',
    vesselId: 'terranova',
    routeId: 'ruta-juan-fernandez',
    description: 'Chárter de pesca deportiva exclusivo reservado para delegación internacional. Rutas de trolling de alta gama y servicios de lujo de chef a bordo.',
    location: 'Archipiélago Juan Fernández',
    image: '/zarpe-archipielago.jpg',
    bestViewTime: 'Pesca de amanecer',
    tempEstimate: '18°C - 22°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-col-mar',
    name: 'Colombia Selkirk',
    startDate: '08 mar 2027',
    endDate: '17 mar 2027',
    departureDate: '2027-03-08',
    returnDate: '2027-03-17',
    monthsActive: [3],
    year: 2027,
    spotsLeft: 'bloqueado',
    totalSlots: 6,
    availableSlots: 0,
    pricePerPaxClp: 2200000,
    priceCharterFullClp: 13200000,
    vessel: 'Lodge Rincón de Navegantes',
    vesselId: 'lodge',
    routeId: 'ruta-juan-fernandez',
    description: 'Reserva exclusiva bloqueada para misión de investigación científica, filmación de documentales y monitoreo de aves terrestres en peligro de extinción.',
    location: 'Bahía Cumberland',
    image: '/jf-noviembre.jpg',
    bestViewTime: 'Reserva científica',
    tempEstimate: '16°C - 20°C',
    status: 'scheduled'
  },
  {
    id: 'exp-zar-mar',
    name: 'Zarpe Especial del Archipiélago',
    startDate: '14 mar 2027',
    endDate: '29 mar 2027',
    departureDate: '2027-03-14',
    returnDate: '2027-03-29',
    monthsActive: [3],
    year: 2027,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 1950000,
    priceCharterFullClp: 11700000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Expedición marítima de fin de verano recorriendo las caletas más inaccesibles y bahías protegidas del archipiélago con excelentes vientos de retorno.',
    location: 'Juan Fernández',
    image: '/juan-fernandez-selkirk.jpg',
    bestViewTime: 'Navegación al atardecer',
    tempEstimate: '15°C - 19°C',
    status: 'scheduled'
  }
];

const LOCAL_STORAGE_KEY = 'yates_departures_store';

const MONTH_MAP: Record<string, string> = {
  '01': 'ene', '02': 'feb', '03': 'mar', '04': 'abr', '05': 'may', '06': 'jun',
  '07': 'jul', '08': 'ago', '09': 'sept', '10': 'oct', '11': 'nov', '12': 'dic'
};

const formatDateSpan = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTH_MAP[m] || m} ${y}`;
};

const getMonthsFromDates = (startStr: string, endStr: string): number[] => {
  const months = new Set<number>();
  if (startStr) {
    const m1 = parseInt(startStr.split('-')[1], 10);
    if (!isNaN(m1)) months.add(m1);
  }
  if (endStr) {
    const m2 = parseInt(endStr.split('-')[1], 10);
    if (!isNaN(m2)) months.add(m2);
  }
  return Array.from(months);
};

const getStoredDepartures = (): PublicExpedition[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_EXPEDITIONS;
};

const saveStoredDepartures = (items: PublicExpedition[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yates_expeditions_updated', { detail: items }));
    }
  } catch {}
};

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

  async getDepartures(): Promise<DepartureRow[]> {
    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .order('departure_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as DepartureRow[];
      }
    } catch {}

    // Convert local public expeditions into DepartureRow format
    const local = getStoredDepartures();
    return local.map((e) => ({
      id: e.id,
      route_id: e.routeId,
      vessel_id: e.vesselId,
      departure_date: e.departureDate,
      return_date: e.returnDate,
      total_slots: e.totalSlots,
      available_slots: e.availableSlots,
      price_per_pax_clp: e.pricePerPaxClp,
      price_charter_full_clp: e.priceCharterFullClp,
      status: e.status,
      created_at: new Date().toISOString(),
      name: e.name,
      location: e.location,
      image: e.image,
      description: e.description,
      tempEstimate: e.tempEstimate,
      bestViewTime: e.bestViewTime,
      route: EXPEDITION_ROUTES.find((r) => r.id === e.routeId) || {
        id: e.routeId,
        title: e.name,
        subtitle: e.location,
        duration: `${e.startDate} - ${e.endDate}`,
      },
      vessel: FLEET_DATA.find((v) => v.id === e.vesselId) || {
        id: e.vesselId,
        name: e.vessel,
        type: e.vessel.includes('Velero') ? 'Velero de Expedición' : 'Yate de Expedición',
      },
    })) as DepartureRow[];
  },

  async getPublicExpeditions(): Promise<PublicExpedition[]> {
    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .order('departure_date', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map Supabase rows
        const local = getStoredDepartures();
        const mapped: PublicExpedition[] = data.map((d: any) => {
          const matchedLocal = local.find((l) => l.id === d.id);
          const vesselName = d.vessel?.name || (d.vessel_id === 'terranova' ? 'Yate Terranova' : d.vessel_id === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');
          const routeTitle = d.route?.title || matchedLocal?.name || 'Expedición Austral';
          const depYear = parseInt(d.departure_date?.split('-')[0] || '2026', 10);
          const months = getMonthsFromDates(d.departure_date, d.return_date);
          const spots = d.available_slots === 0 ? 'completo' : d.status === 'cancelled' ? 'bloqueado' : d.available_slots;

          return {
            id: d.id,
            name: matchedLocal?.name || routeTitle,
            startDate: formatDateSpan(d.departure_date),
            endDate: formatDateSpan(d.return_date),
            departureDate: d.departure_date,
            returnDate: d.return_date,
            monthsActive: months.length > 0 ? months : [10],
            year: isNaN(depYear) ? 2026 : depYear,
            spotsLeft: spots,
            totalSlots: d.total_slots || 8,
            availableSlots: d.available_slots ?? 8,
            pricePerPaxClp: Number(d.price_per_pax_clp) || 1850000,
            priceCharterFullClp: Number(d.price_charter_full_clp) || 14800000,
            vessel: vesselName,
            vesselId: d.vessel_id || 'vegvisir',
            routeId: d.route_id || 'ruta-juan-fernandez',
            description: matchedLocal?.description || d.route?.description || 'Expedición exclusiva por las aguas prístinas y fiordos del archipiélago.',
            location: matchedLocal?.location || 'Archipiélago Juan Fernández',
            image: matchedLocal?.image || (d.vessel_id === 'terranova' ? '/yate-terranova.jpg' : '/travesia-robinson.jpg'),
            bestViewTime: matchedLocal?.bestViewTime || 'Zarpe matutino',
            tempEstimate: matchedLocal?.tempEstimate || '14°C - 18°C',
            status: d.status || 'scheduled',
          };
        });
        return mapped;
      }
    } catch {}

    return getStoredDepartures();
  },

  async getAllBookings(): Promise<ExpeditionBookingRow[]> {
    let supabaseRows: ExpeditionBookingRow[] = [];
    try {
      const { data, error } = await supabase
        .from('expedition_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseRows = data;
      }
    } catch {}

    // Also get stored local bookings
    let localRows: ExpeditionBookingRow[] = [];
    try {
      const stored = localStorage.getItem('yates_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localRows = parsed.map((b: any) => ({
            id: b.id,
            booking_code: b.code || b.booking_code || b.id,
            departure_id: b.departure_id || b.departureId,
            route_id: b.route_id,
            vessel_id: b.vessel_id,
            guest_name: b.fullName || b.guest_name,
            guest_email: b.email || b.guest_email,
            guest_phone: b.phone || b.guest_phone,
            guest_rut_passport: b.docId || b.guest_rut_passport,
            booking_type: b.booking_type || 'per_pax',
            pax_count: b.guestsCount || b.pax_count || 1,
            total_amount: b.totalAmount || b.total_amount || 0,
            status: b.status === 'pendiente_transferencia' ? 'pending_transfer' : (b.status || 'pending_transfer'),
            dietary_medical_notes: b.dietaryMedicalNotes || b.dietary_medical_notes,
            created_at: b.created_at || (b.dateCreated ? `${b.dateCreated}T12:00:00.000Z` : new Date().toISOString()),
            expedition_name: b.expeditionName || b.expedition_name,
            vessel_name: b.vesselName || b.vessel_name,
            departure_date: b.departure_date,
            return_date: b.return_date,
            passengers: b.passengers || [],
          })) as any;
        }
      }
    } catch {}

    // Merge and deduplicate by booking_code / id
    const map = new Map<string, ExpeditionBookingRow>();
    [...supabaseRows, ...localRows].forEach((item) => {
      const key = item.booking_code || item.id;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  },

  async createBooking(params: {
    departureId?: string;
    routeId?: string;
    vesselId?: string;
    expeditionName?: string;
    vesselName?: string;
    departureDate?: string;
    returnDate?: string;
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
      let createdId = `res-${Date.now()}`;

      // 1. Try Supabase first
      try {
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

        if (!bookErr && booking) {
          createdId = booking.id;
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

          // Deduct spots in Supabase departure row
          if (params.departureId) {
            const { data: depData } = await supabase
              .from('expedition_departures')
              .select('available_slots, total_slots')
              .eq('id', params.departureId)
              .single();
            if (depData) {
              const currentAvail = depData.available_slots ?? depData.total_slots ?? 8;
              const nextAvail = Math.max(0, currentAvail - params.paxCount);
              await supabase
                .from('expedition_departures')
                .update({ available_slots: nextAvail })
                .eq('id', params.departureId);
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase booking insert notice:', sbErr);
      }

      // 2. Always deduct spots in local storage departures
      if (params.departureId) {
        const stored = getStoredDepartures();
        const updated = stored.map((e) => {
          if (e.id === params.departureId) {
            const currentSlots = typeof e.availableSlots === 'number' ? e.availableSlots : (typeof e.spotsLeft === 'number' ? e.spotsLeft : e.totalSlots);
            const nextAvail = Math.max(0, currentSlots - params.paxCount);
            return {
              ...e,
              availableSlots: nextAvail,
              spotsLeft: nextAvail === 0 ? ('completo' as const) : nextAvail,
            };
          }
          return e;
        });
        saveStoredDepartures(updated);
      }

      // 3. Always save booking into localStorage for local instant sync & admin view
      try {
        const storedBookings = localStorage.getItem('yates_bookings');
        const bookingsList = storedBookings ? JSON.parse(storedBookings) : [];
        const newBookingItem = {
          id: createdId,
          code: bookingCode,
          booking_code: bookingCode,
          departure_id: params.departureId,
          route_id: params.routeId,
          vessel_id: params.vesselId,
          expeditionName: params.expeditionName,
          expedition_name: params.expeditionName,
          vesselName: params.vesselName,
          vessel_name: params.vesselName,
          departure_date: params.departureDate,
          return_date: params.returnDate,
          fullName: params.guestName,
          guest_name: params.guestName,
          docId: params.guestRutPassport,
          guest_rut_passport: params.guestRutPassport,
          phone: params.guestPhone,
          guest_phone: params.guestPhone,
          email: params.guestEmail,
          guest_email: params.guestEmail,
          booking_type: params.bookingType,
          guestsCount: params.paxCount,
          pax_count: params.paxCount,
          passengers: params.passengers || [],
          totalAmount: params.totalAmount,
          total_amount: params.totalAmount,
          depositAmount: Math.round(params.totalAmount * 0.5),
          deposit_amount: Math.round(params.totalAmount * 0.5),
          dietary_medical_notes: params.dietaryMedicalNotes,
          dateCreated: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          status: 'pending_transfer',
        };
        bookingsList.unshift(newBookingItem);
        localStorage.setItem('yates_bookings', JSON.stringify(bookingsList));
      } catch (_) {}

      // 4. Dispatch events for real-time reactive UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_expeditions_updated'));
        window.dispatchEvent(new CustomEvent('yates_bookings_updated'));
        window.dispatchEvent(new CustomEvent('storage'));
      }

      return { success: true, bookingCode, bookingId: createdId };
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
    publicName?: string;
    publicLocation?: string;
    publicCoverImage?: string;
    publicDescription?: string;
    publicTempEstimate?: string;
  }): Promise<{ success: boolean; data?: DepartureRow; error?: string }> {
    try {
      const newId = `exp-dep-${Date.now()}`;
      const vesselObj = FLEET_DATA.find((v) => v.id === params.vesselId);
      const vesselName = vesselObj?.name || (params.vesselId === 'terranova' ? 'Yate Terranova' : 'Velero Vegvisir');
      const startFormatted = formatDateSpan(params.departureDate);
      const endFormatted = formatDateSpan(params.returnDate);
      const months = getMonthsFromDates(params.departureDate, params.returnDate);
      const year = parseInt(params.departureDate.split('-')[0], 10) || 2026;

      const newPublicExp: PublicExpedition = {
        id: newId,
        name: params.publicName || `${vesselName} — ${startFormatted}`,
        startDate: startFormatted,
        endDate: endFormatted,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        monthsActive: months.length > 0 ? months : [10],
        year,
        spotsLeft: params.totalSlots,
        totalSlots: params.totalSlots,
        availableSlots: params.totalSlots,
        pricePerPaxClp: params.pricePerPaxClp,
        priceCharterFullClp: params.priceCharterFullClp || params.pricePerPaxClp * params.totalSlots,
        vessel: vesselName,
        vesselId: params.vesselId,
        routeId: params.routeId,
        description: params.publicDescription || 'Expedición programada en aguas australes con tripulación y servicios de alto nivel.',
        location: params.publicLocation || 'Archipiélago Juan Fernández',
        image: params.publicCoverImage || (params.vesselId === 'terranova' ? '/yate-terranova.jpg' : '/travesia-robinson.jpg'),
        bestViewTime: 'Zarpe matutino',
        tempEstimate: params.publicTempEstimate || '14°C - 18°C',
        status: params.status || 'scheduled',
      };

      // Try Supabase insert
      try {
        const { data } = await supabase
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

        if (data) {
          newPublicExp.id = data.id;
        }
      } catch {}

      // Save locally
      const stored = getStoredDepartures();
      saveStoredDepartures([newPublicExp, ...stored]);

      const depRow: DepartureRow = {
        id: newPublicExp.id,
        route_id: newPublicExp.routeId,
        vessel_id: newPublicExp.vesselId,
        departure_date: newPublicExp.departureDate,
        return_date: newPublicExp.returnDate,
        total_slots: newPublicExp.totalSlots,
        available_slots: newPublicExp.availableSlots,
        price_per_pax_clp: newPublicExp.pricePerPaxClp,
        price_charter_full_clp: newPublicExp.priceCharterFullClp,
        status: newPublicExp.status,
        created_at: new Date().toISOString(),
        name: newPublicExp.name,
        location: newPublicExp.location,
        image: newPublicExp.image,
        description: newPublicExp.description,
        tempEstimate: newPublicExp.tempEstimate,
        bestViewTime: newPublicExp.bestViewTime,
        route: EXPEDITION_ROUTES.find((r) => r.id === newPublicExp.routeId),
        vessel: FLEET_DATA.find((v) => v.id === newPublicExp.vesselId),
      };

      return { success: true, data: depRow };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async updateDeparture(
    departureId: string,
    params: {
      routeId?: string;
      vesselId?: string;
      departureDate?: string;
      returnDate?: string;
      totalSlots?: number;
      availableSlots?: number;
      pricePerPaxClp?: number;
      priceCharterFullClp?: number;
      status?: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
      publicName?: string;
      publicLocation?: string;
      publicCoverImage?: string;
      publicDescription?: string;
      publicTempEstimate?: string;
    }
  ): Promise<{ success: boolean; data?: DepartureRow; error?: string }> {
    try {
      const vesselObj = params.vesselId ? FLEET_DATA.find((v) => v.id === params.vesselId) : undefined;
      const vesselName = vesselObj?.name || (params.vesselId === 'terranova' ? 'Yate Terranova' : params.vesselId === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');

      // Update Supabase
      try {
        const updateData: any = {};
        if (params.routeId) updateData.route_id = params.routeId;
        if (params.vesselId) updateData.vessel_id = params.vesselId;
        if (params.departureDate) updateData.departure_date = params.departureDate;
        if (params.returnDate) updateData.return_date = params.returnDate;
        if (params.totalSlots !== undefined) updateData.total_slots = params.totalSlots;
        if (params.availableSlots !== undefined) updateData.available_slots = params.availableSlots;
        if (params.pricePerPaxClp !== undefined) updateData.price_per_pax_clp = params.pricePerPaxClp;
        if (params.priceCharterFullClp !== undefined) updateData.price_charter_full_clp = params.priceCharterFullClp;
        if (params.status) updateData.status = params.status;

        await supabase
          .from('expedition_departures')
          .update(updateData)
          .eq('id', departureId);
      } catch {}

      // Update localStorage
      const stored = getStoredDepartures();
      const updated = stored.map((e) => {
        if (e.id === departureId) {
          const depDate = params.departureDate || e.departureDate;
          const retDate = params.returnDate || e.returnDate;
          const startFormatted = depDate ? formatDateSpan(depDate) : e.startDate;
          const endFormatted = retDate ? formatDateSpan(retDate) : e.endDate;
          const months = depDate && retDate ? getMonthsFromDates(depDate, retDate) : e.monthsActive;
          const year = depDate ? parseInt(depDate.split('-')[0], 10) || e.year : e.year;
          const totSlots = params.totalSlots !== undefined ? params.totalSlots : e.totalSlots;
          const availSlots = params.availableSlots !== undefined ? params.availableSlots : e.availableSlots;
          const stat = params.status || e.status;

          return {
            ...e,
            name: params.publicName || e.name,
            vessel: params.vesselId ? vesselName : e.vessel,
            vesselId: params.vesselId || e.vesselId,
            routeId: params.routeId || e.routeId,
            departureDate: depDate,
            returnDate: retDate,
            startDate: startFormatted,
            endDate: endFormatted,
            monthsActive: months,
            year,
            totalSlots: totSlots,
            availableSlots: availSlots,
            spotsLeft: stat === 'cancelled' ? ('bloqueado' as const) : availSlots === 0 ? ('completo' as const) : availSlots,
            pricePerPaxClp: params.pricePerPaxClp !== undefined ? params.pricePerPaxClp : e.pricePerPaxClp,
            priceCharterFullClp: params.priceCharterFullClp !== undefined ? params.priceCharterFullClp : e.priceCharterFullClp,
            status: stat,
            description: params.publicDescription || e.description,
            location: params.publicLocation || e.location,
            image: params.publicCoverImage || e.image,
            tempEstimate: params.publicTempEstimate || e.tempEstimate,
          };
        }
        return e;
      });
      saveStoredDepartures(updated);

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async updateDepartureStatus(
    departureId: string,
    status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      try {
        await supabase
          .from('expedition_departures')
          .update({ status })
          .eq('id', departureId);
      } catch {}

      const stored = getStoredDepartures();
      const updated = stored.map((e) => {
        if (e.id === departureId) {
          return {
            ...e,
            status,
            spotsLeft: status === 'cancelled' ? ('bloqueado' as const) : e.availableSlots === 0 ? ('completo' as const) : e.availableSlots,
          };
        }
        return e;
      });
      saveStoredDepartures(updated);

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteDeparture(departureId: string): Promise<{ success: boolean; error?: string }> {
    try {
      try {
        await supabase
          .from('expedition_departures')
          .delete()
          .eq('id', departureId);
      } catch {}

      const stored = getStoredDepartures();
      const updated = stored.filter((e) => e.id !== departureId);
      saveStoredDepartures(updated);

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
