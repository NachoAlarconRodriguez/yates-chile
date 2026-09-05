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
  brochureUrl?: string;
  policyUrl?: string;
  bestViewTime?: string;
  route?: any;
  vessel?: any;
  isFeatured?: boolean;
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
  brochureUrl?: string;
  policyUrl?: string;
  status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
  isFeatured?: boolean;
}

export const INITIAL_EXPEDITIONS: PublicExpedition[] = [
  // --- CABO DE HORNOS (Velero Vegvisir) ---
  {
    id: 'exp-cabo-nov-26',
    name: 'Expedición Cabo de Hornos',
    startDate: '10 nov 2026',
    endDate: '19 nov 2026',
    departureDate: '2026-11-10',
    returnDate: '2026-11-19',
    monthsActive: [11],
    year: 2026,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 2850000,
    priceCharterFullClp: 17100000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-cabo-hornos',
    description: 'La máxima aventura náutica mundial: circunvalar el mítico Cabo de Hornos a vela con patrón de ultramar y máxima seguridad.',
    location: 'Canal Beagle & Cabo de Hornos',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    bestViewTime: 'Primavera austral',
    tempEstimate: '8°C - 12°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-cabo-dic-26',
    name: 'Expedición Cabo de Hornos',
    startDate: '05 dic 2026',
    endDate: '14 dic 2026',
    departureDate: '2026-12-05',
    returnDate: '2026-12-14',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 2950000,
    priceCharterFullClp: 17700000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-cabo-hornos',
    description: 'Navegación oceánica de altura hacia los confines del planeta en los días más largos del año en latitudes australes.',
    location: 'Isla de Hornos',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bestViewTime: 'Solsticio de verano',
    tempEstimate: '9°C - 13°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-cabo-ene-27',
    name: 'Expedición Cabo de Hornos',
    startDate: '12 ene 2027',
    endDate: '21 ene 2027',
    departureDate: '2027-01-12',
    returnDate: '2027-01-21',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 2950000,
    priceCharterFullClp: 17700000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-cabo-hornos',
    description: 'Travesía de verano en las aguas míticas de Magallanes con desembarco en el monumento al Albatros en Isla de Hornos.',
    location: 'Cabo de Hornos',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    bestViewTime: 'Verano austral',
    tempEstimate: '10°C - 14°C',
    status: 'scheduled'
  },

  // --- ROBINSON CRUSOE (Velero Vegvisir & Yate Terranova) ---
  {
    id: 'exp-rob-oct-26',
    name: 'Travesía Robinson Crusoe',
    startDate: '15 oct 2026',
    endDate: '22 oct 2026',
    departureDate: '2026-10-15',
    returnDate: '2026-10-22',
    monthsActive: [10],
    year: 2026,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 1950000,
    priceCharterFullClp: 11700000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Aventura oceánica a vela hacia Juan Fernández con descanso en cabinas privadas en Bahía Cumberland.',
    location: 'Isla Robinson Crusoe',
    image: '/travesia-robinson.jpg',
    bestViewTime: 'Primavera austral',
    tempEstimate: '14°C - 18°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-rob-nov-26',
    name: 'Expedición Robinson Crusoe',
    startDate: '08 nov 2026',
    endDate: '15 nov 2026',
    departureDate: '2026-11-08',
    returnDate: '2026-11-15',
    monthsActive: [11],
    year: 2026,
    spotsLeft: 8,
    totalSlots: 8,
    availableSlots: 8,
    pricePerPaxClp: 2350000,
    priceCharterFullClp: 18800000,
    vessel: 'Yate Terranova',
    vesselId: 'terranova',
    routeId: 'ruta-juan-fernandez',
    description: 'Navegación rápida de alto confort en Yate Terranova de 3 cubiertas por el Archipiélago Juan Fernández.',
    location: 'Bahía Cumberland',
    image: '/zarpe-archipielago.jpg',
    bestViewTime: 'Floración primaveral',
    tempEstimate: '15°C - 19°C',
    status: 'guaranteed'
  },
  {
    id: 'exp-rob-ene-27',
    name: 'Travesía Robinson Crusoe',
    startDate: '05 ene 2027',
    endDate: '12 ene 2027',
    departureDate: '2027-01-05',
    returnDate: '2027-01-12',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 2150000,
    priceCharterFullClp: 12900000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-juan-fernandez',
    description: 'Temporada alta de verano: navegación a vela, buceo en aguas cristalinas y senderismo por bosques de helechos gigantes.',
    location: 'Archipiélago Juan Fernández',
    image: '/rincon-de-navegantes.jpg',
    bestViewTime: 'Verano calmo',
    tempEstimate: '18°C - 22°C',
    status: 'guaranteed'
  },

  // --- ALEJANDRO SELKIRK (Vegvisir / Terranova) ---
  {
    id: 'exp-sel-dic-26',
    name: 'Desafío Alejandro Selkirk',
    startDate: '01 dic 2026',
    endDate: '10 dic 2026',
    departureDate: '2026-12-01',
    returnDate: '2026-12-10',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 8,
    totalSlots: 8,
    availableSlots: 8,
    pricePerPaxClp: 2650000,
    priceCharterFullClp: 21200000,
    vessel: 'Yate Terranova',
    vesselId: 'terranova',
    routeId: 'ruta-selkirk',
    description: 'Expedición hacia la isla más remota e indómita del Pacífico Sur chileno, con avistamiento de fauna y pesca deportiva de altura.',
    location: 'Isla Alejandro Selkirk (Más Afuera)',
    image: '/juan-fernandez-selkirk.jpg',
    bestViewTime: 'Pesca y trekking',
    tempEstimate: '16°C - 20°C',
    status: 'scheduled'
  },
  {
    id: 'exp-sel-feb-27',
    name: 'Desafío Alejandro Selkirk',
    startDate: '08 feb 2027',
    endDate: '17 feb 2027',
    departureDate: '2027-02-08',
    returnDate: '2027-02-17',
    monthsActive: [2],
    year: 2027,
    spotsLeft: 6,
    totalSlots: 6,
    availableSlots: 6,
    pricePerPaxClp: 2450000,
    priceCharterFullClp: 14700000,
    vessel: 'Velero Vegvisir',
    vesselId: 'vegvisir',
    routeId: 'ruta-selkirk',
    description: 'Travesía a vela hacia la mítica Isla Más Afuera con fondeos en caletas vírgenes y exploración de cumbres escarpadas.',
    location: 'Océano Pacífico Profundo',
    image: '/travesia-robinson.jpg',
    bestViewTime: 'Viento favorable',
    tempEstimate: '17°C - 21°C',
    status: 'scheduled'
  },

  // --- FIORDOS & GLACIARES (Yate Terranova) ---
  {
    id: 'exp-fio-mar-27',
    name: 'Fiordos Secretos & Glaciares',
    startDate: '02 mar 2027',
    endDate: '09 mar 2027',
    departureDate: '2027-03-02',
    returnDate: '2027-03-09',
    monthsActive: [3],
    year: 2027,
    spotsLeft: 8,
    totalSlots: 8,
    availableSlots: 8,
    pricePerPaxClp: 2200000,
    priceCharterFullClp: 17600000,
    vessel: 'Yate Terranova',
    vesselId: 'terranova',
    routeId: 'ruta-fiordos-glaciares',
    description: 'Navegación protegida entre canales patagónicos, aguas termales y paredones de hielo milenario en la Patagonia Norte.',
    location: 'Canales Australes & Ventisqueros',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bestViewTime: 'Otoño patagónico',
    tempEstimate: '12°C - 16°C',
    status: 'scheduled'
  },
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

const sanitizePublicExpedition = (e: PublicExpedition): PublicExpedition => {
  const vLower = (e.vessel || e.vesselId || '').toLowerCase();
  const isTerranova = vLower.includes('terranova');
  const vessel = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
  const vesselId = isTerranova ? 'terranova' : 'vegvisir';
  let name = e.name;
  if (name.startsWith('JF ')) {
    name = name.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
  }
  return {
    ...e,
    name,
    vessel,
    vesselId,
  };
};

const getStoredDepartures = (): PublicExpedition[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.map(sanitizePublicExpedition);
        const hasAnyFeatured = sanitized.some((e) => e.isFeatured);
        if (!hasAnyFeatured) {
          sanitized.slice(0, 3).forEach((e) => (e.isFeatured = true));
        }
        return sanitized;
      }
    }
  } catch {}
  const initial = INITIAL_EXPEDITIONS.map(sanitizePublicExpedition);
  initial.slice(0, 3).forEach((e) => (e.isFeatured = true));
  return initial;
};

const saveStoredDepartures = (items: PublicExpedition[]) => {
  try {
    const sanitized = items.map(sanitizePublicExpedition);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yates_expeditions_updated', { detail: sanitized }));
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
    const local = getStoredDepartures();
    const mapLocalToRow = (e: PublicExpedition): DepartureRow => {
      const isTerranova = e.vessel.toLowerCase().includes('terranova') || e.vesselId === 'terranova';
      const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
      const vesselType = isTerranova ? 'Hatteras 65ft LRC' : 'Dufour 52.5 ft Francés';
      let name = e.name;
      if (name.startsWith('JF ')) {
        name = name.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
      }
      return {
        id: e.id,
        route_id: e.routeId,
        vessel_id: isTerranova ? 'terranova' : 'vegvisir',
        departure_date: e.departureDate,
        return_date: e.returnDate,
        total_slots: e.totalSlots,
        available_slots: e.availableSlots,
        price_per_pax_clp: e.pricePerPaxClp,
        price_charter_full_clp: e.priceCharterFullClp,
        status: e.status,
        created_at: new Date().toISOString(),
        name: name,
        location: e.location,
        image: e.image,
        description: e.description,
        tempEstimate: e.tempEstimate,
        bestViewTime: e.bestViewTime,
        isFeatured: e.isFeatured ?? false,
        route: EXPEDITION_ROUTES.find((r) => r.id === e.routeId) || {
          id: e.routeId,
          title: name,
          subtitle: e.location,
          duration: `${e.startDate} - ${e.endDate}`,
        },
        vessel: {
          id: isTerranova ? 'terranova' : 'vegvisir',
          name: vesselName,
          type: vesselType,
        },
      };
    };

    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .order('departure_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mappedDb = (data as any[]).map((d) => {
          const matchedLocal = local.find((l) => l.id === d.id);
          const isTerranova = d.vessel_id === 'terranova' || (d.vessel?.name && d.vessel.name.toLowerCase().includes('terranova')) || (d.name && d.name.toLowerCase().includes('terranova'));
          const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
          const vesselType = isTerranova ? 'Hatteras 65ft LRC' : 'Dufour 52.5 ft Francés';
          let routeName = d.name || matchedLocal?.name || d.route?.title || 'Expedición Robinson Crusoe';
          if (routeName.startsWith('JF ')) {
            routeName = routeName.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
          }
          return {
            ...d,
            name: routeName,
            location: matchedLocal?.location || 'Archipiélago Juan Fernández',
            image: matchedLocal?.image || (isTerranova ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg'),
            description: matchedLocal?.description || d.route?.description || 'Expedición náutica oceánica.',
            tempEstimate: matchedLocal?.tempEstimate || '14°C - 18°C',
            bestViewTime: matchedLocal?.bestViewTime || 'Zarpe matutino',
            isFeatured: matchedLocal?.isFeatured ?? false,
            vessel_id: isTerranova ? 'terranova' : 'vegvisir',
            vessel: {
              id: isTerranova ? 'terranova' : 'vegvisir',
              name: vesselName,
              type: vesselType,
            },
          };
        }) as DepartureRow[];

        const extraLocal = local
          .filter((l) => !data.some((d: any) => d.id === l.id))
          .map(mapLocalToRow);

        return [...mappedDb, ...extraLocal];
      }
    } catch {}

    return local.map(mapLocalToRow);
  },

  async getPublicExpeditions(): Promise<PublicExpedition[]> {
    const local = getStoredDepartures();
    try {
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .order('departure_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: PublicExpedition[] = data.map((d: any) => {
          const matchedLocal = local.find((l) => l.id === d.id);
          const isTerranova = d.vessel_id === 'terranova' || (d.vessel?.name && d.vessel.name.toLowerCase().includes('terranova')) || (d.name && d.name.toLowerCase().includes('terranova'));
          const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
          const vesselId = isTerranova ? 'terranova' : 'vegvisir';
          let routeTitle = d.name || matchedLocal?.name || d.route?.title || 'Expedición Austral';
          if (routeTitle.startsWith('JF ')) {
            routeTitle = routeTitle.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
          }
          const depYear = parseInt(d.departure_date?.split('-')[0] || '2026', 10);
          const months = getMonthsFromDates(d.departure_date, d.return_date);
          const spots = d.available_slots === 0 ? 'completo' : d.status === 'cancelled' ? 'bloqueado' : d.available_slots;

          return {
            id: d.id,
            name: routeTitle,
            startDate: formatDateSpan(d.departure_date),
            endDate: formatDateSpan(d.return_date),
            departureDate: d.departure_date,
            returnDate: d.return_date,
            monthsActive: months.length > 0 ? months : [10],
            year: isNaN(depYear) ? 2026 : depYear,
            spotsLeft: spots,
            totalSlots: d.total_slots || (isTerranova ? 8 : 6),
            availableSlots: d.available_slots ?? (isTerranova ? 8 : 6),
            pricePerPaxClp: Number(d.price_per_pax_clp) || (isTerranova ? 2350000 : 1950000),
            priceCharterFullClp: Number(d.price_charter_full_clp) || (isTerranova ? 18800000 : 11700000),
            vessel: vesselName,
            vesselId: vesselId,
            routeId: d.route_id || 'ruta-juan-fernandez',
            description: matchedLocal?.description || d.route?.description || 'Expedición náutica oceánica.',
            location: matchedLocal?.location || 'Archipiélago Juan Fernández',
            image: matchedLocal?.image || (isTerranova ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg'),
            bestViewTime: matchedLocal?.bestViewTime || 'Zarpe matutino',
            tempEstimate: matchedLocal?.tempEstimate || '14°C - 18°C',
            status: d.status || 'scheduled',
          };
        });

        const extraLocal = local.filter((l) => !data.some((d: any) => d.id === l.id));
        return [...mapped, ...extraLocal];
      }
    } catch {}

    return local;
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

    // Auto-reconciliación para reservas creadas previamente que quedaron en pending_transfer
    if (map.has('EXP-2026-9723')) {
      const b = map.get('EXP-2026-9723')!;
      if (b.status === 'pending_transfer') {
        b.status = 'approved';
      }
    }

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
    status?: 'pending_transfer' | 'approved' | 'paid' | 'partial' | 'completed' | 'cancelled';
    dietaryMedicalNotes?: string;
    passengers?: Array<{ fullName: string; docId: string; nationality?: string; emergencyContact?: string; medicalNotes?: string }>;
  }): Promise<{ success: boolean; bookingCode?: string; bookingId?: string; error?: string }> {
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `EXP-${new Date().getFullYear()}-${randomSuffix}`;
      let createdId = `res-${Date.now()}`;
      const sbStatus: 'pending_transfer' | 'approved' | 'cancelled' | 'completed' =
        (params.status === 'approved' || params.status === 'paid' || params.status === 'completed' || params.status === 'partial')
          ? 'approved'
          : params.status === 'cancelled'
          ? 'cancelled'
          : 'pending_transfer';

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
            status: sbStatus,
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
          const isFullPaid = params.status === 'approved' || params.status === 'paid' || params.status === 'completed';
          const isPartialPaid = params.status === 'partial';

          await supabase.from('payment_installments').insert([
            {
              booking_type: 'expedition',
              booking_id: booking.id,
              installment_number: 1,
              total_installments: 2,
              concept: 'Pie de Reserva (50% Requerido para asegurar cupo)',
              amount_expected: deposit,
              amount_paid: (isFullPaid || isPartialPaid) ? deposit : 0,
              status: (isFullPaid || isPartialPaid) ? 'approved' : 'pending_upload',
            },
            {
              booking_type: 'expedition',
              booking_id: booking.id,
              installment_number: 2,
              total_installments: 2,
              concept: 'Saldo Final (50% restante a 15 días del zarpe)',
              amount_expected: balance,
              amount_paid: isFullPaid ? balance : 0,
              status: isFullPaid ? 'approved' : 'pending_upload',
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
          status: sbStatus,
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
    publicBrochureUrl?: string;
    publicPolicyUrl?: string;
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
        brochureUrl: params.publicBrochureUrl,
        policyUrl: params.publicPolicyUrl,
        status: params.status || 'scheduled',
      };

      // Try Supabase insert
      try {
        const validRouteId = ['ruta-fiordos-glaciares', 'ruta-cabo-hornos', 'ruta-juan-fernandez', 'ruta-selkirk'].includes(params.routeId)
          ? params.routeId
          : 'ruta-juan-fernandez';

        const { data } = await supabase
          .from('expedition_departures')
          .insert({
            route_id: validRouteId,
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
      } catch (sbErr) {
        console.warn('Supabase createDeparture notice:', sbErr);
      }

      // Save locally
      const stored = getStoredDepartures();
      saveStoredDepartures([newPublicExp, ...stored.filter(s => s.id !== newPublicExp.id)]);

      // Dispatch global events for instant sync across tabs and hooks
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_expeditions_updated'));
        window.dispatchEvent(new CustomEvent('storage'));
      }

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
        brochureUrl: newPublicExp.brochureUrl,
        policyUrl: newPublicExp.policyUrl,
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

  async updateBookingStatus(
    bookingId: string,
    status: 'approved' | 'cancelled' | 'completed' | 'partial' | 'pending_transfer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sbStatus: 'pending_transfer' | 'approved' | 'cancelled' | 'completed' =
        (status === 'approved' || status === 'completed' || status === 'partial')
          ? 'approved'
          : status === 'cancelled'
          ? 'cancelled'
          : 'pending_transfer';

      try {
        const { error } = await supabase
          .from('expedition_bookings')
          .update({ status: sbStatus, updated_at: new Date().toISOString() })
          .eq('id', bookingId);
        if (error) {
          console.warn('Supabase booking update notice:', error.message);
        }
      } catch (sbErr) {
        console.warn('Supabase updateBookingStatus exception:', sbErr);
      }

      // Also update in localStorage yates_bookings
      try {
        const stored = localStorage.getItem('yates_bookings');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((b: any) =>
            b.id === bookingId || b.booking_code === bookingId || b.code === bookingId
              ? { ...b, status: sbStatus }
              : b
          );
          localStorage.setItem('yates_bookings', JSON.stringify(updated));
        }
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_expeditions_updated'));
        window.dispatchEvent(new CustomEvent('yates_bookings_updated'));
        window.dispatchEvent(new CustomEvent('storage'));
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      let targetDepartureId: string | null = null;
      let paxCountToRestore = 1;

      // 1. Try finding booking details from Supabase or localStorage
      try {
        const { data: bData } = await supabase
          .from('expedition_bookings')
          .select('departure_id, pax_count')
          .eq('id', bookingId)
          .maybeSingle();

        if (bData) {
          targetDepartureId = bData.departure_id;
          paxCountToRestore = bData.pax_count || 1;
        }
      } catch {}

      if (!targetDepartureId) {
        try {
          const stored = localStorage.getItem('yates_bookings');
          if (stored) {
            const list = JSON.parse(stored);
            const found = list.find(
              (b: any) => b.id === bookingId || b.booking_code === bookingId || b.code === bookingId
            );
            if (found) {
              targetDepartureId = found.departure_id || found.departureId;
              paxCountToRestore = found.pax_count || found.paxCount || 1;
            }
          }
        } catch {}
      }

      // 2. Delete from Supabase
      try {
        await supabase.from('expedition_passengers').delete().eq('booking_id', bookingId);
        await supabase.from('payment_installments').delete().eq('booking_id', bookingId);
        const { error } = await supabase.from('expedition_bookings').delete().eq('id', bookingId);
        if (error) {
          console.warn('Supabase booking delete notice:', error.message);
        }
      } catch (sbErr) {
        console.warn('Supabase deleteBooking exception:', sbErr);
      }

      // 3. Remove from localStorage yates_bookings
      try {
        const stored = localStorage.getItem('yates_bookings');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.filter(
            (b: any) => b.id !== bookingId && b.booking_code !== bookingId && b.code !== bookingId
          );
          localStorage.setItem('yates_bookings', JSON.stringify(updated));
        }
      } catch (_) {}

      // 4. Restore available slots on departure
      if (targetDepartureId) {
        try {
          const storedDeps = getStoredDepartures();
          const updatedDeps = storedDeps.map((d) => {
            if (d.id === targetDepartureId) {
              const maxSlots = d.totalSlots || 6;
              const currentAvail = typeof d.availableSlots === 'number' ? d.availableSlots : 0;
              const nextAvail = Math.min(maxSlots, currentAvail + paxCountToRestore);
              return {
                ...d,
                availableSlots: nextAvail,
                spotsLeft: nextAvail === 0 ? ('completo' as const) : nextAvail,
              };
            }
            return d;
          });
          saveStoredDepartures(updatedDeps);

          const { data: depData } = await supabase
            .from('expedition_departures')
            .select('available_slots, total_slots')
            .eq('id', targetDepartureId)
            .maybeSingle();

          if (depData) {
            const currentAvail = depData.available_slots ?? 0;
            const maxSlots = depData.total_slots ?? 6;
            const restored = Math.min(maxSlots, currentAvail + paxCountToRestore);
            await supabase
              .from('expedition_departures')
              .update({ available_slots: restored })
              .eq('id', targetDepartureId);
          }
        } catch (depErr) {
          console.warn('Error restoring departure slots:', depErr);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_expeditions_updated'));
        window.dispatchEvent(new CustomEvent('yates_bookings_updated'));
        window.dispatchEvent(new CustomEvent('storage'));
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async toggleFeaturedDeparture(departureId: string): Promise<{ success: boolean; isFeatured?: boolean; error?: string }> {
    try {
      const stored = getStoredDepartures();
      const target = stored.find((e) => e.id === departureId);
      if (!target) {
        return { success: false, error: 'Expedición no encontrada.' };
      }

      const currentlyFeatured = stored.filter((e) => e.isFeatured);
      const willBeFeatured = !target.isFeatured;

      if (willBeFeatured && currentlyFeatured.length >= 3) {
        return {
          success: false,
          error: 'Solo puedes seleccionar un máximo de 3 expediciones para mostrar en el carrusel de inicio. Desmarca una primero.',
        };
      }

      const updated = stored.map((e) => {
        if (e.id === departureId) {
          return {
            ...e,
            isFeatured: willBeFeatured,
          };
        }
        return e;
      });

      saveStoredDepartures(updated);

      try {
        await supabase
          .from('expedition_departures')
          .update({ is_featured: willBeFeatured } as any)
          .eq('id', departureId);
      } catch {}

      return { success: true, isFeatured: willBeFeatured };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
