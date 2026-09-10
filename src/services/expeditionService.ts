import { supabase, supabaseAdmin } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { EXPEDITION_ROUTES, FLEET_DATA } from '../lib/constants';
import { normalizeExternalMediaUrl } from './cmsService';

export type ExpeditionRouteRow = Database['public']['Tables']['expedition_routes']['Row'];
export type VesselRow = Database['public']['Tables']['vessels']['Row'];
export type DepartureRow = Database['public']['Tables']['expedition_departures']['Row'] & {
  name?: string;
  headline?: string;
  location?: string;
  image?: string;
  description?: string;
  tempEstimate?: string;
  brochureUrl?: string;
  brochure_url?: string;
  policyUrl?: string;
  policy_url?: string;
  bestViewTime?: string;
  route?: any;
  vessel?: any;
  isFeatured?: boolean;
  highlights?: string;
  includedServices?: string;
  policies?: ExpeditionPolicySection[] | string;
};
export type ExpeditionBookingRow = Database['public']['Tables']['expedition_bookings']['Row'];

export interface ExpeditionPolicySection {
  id?: string;
  title: string;
  content: string;
}

export const DEFAULT_EXPEDITION_POLICIES: ExpeditionPolicySection[] = [
  {
    id: 'policy-1',
    title: '1. Modalidad de Reserva y Pagos',
    content: 'Para garantizar y bloquear los cupos en la expedición seleccionada, se requiere un abono correspondiente al 50% del valor total mediante transferencia bancaria. El 50% restante deberá ser cancelado a más tardar 30 días antes de la fecha fijada de zarpe o check-in.',
  },
  {
    id: 'policy-2',
    title: '2. Políticas de Cancelación y Reprogramación',
    content: '• Cancelaciones con más de 45 días de anticipación: Reembolso del 90% del monto abonado o reprogramación sin costo sujeta a cupos.\n• Cancelaciones entre 44 y 21 días antes del zarpe: Retención del 30% del total por concepto de gastos operacionales e insumos náuticos, o posibilidad de endosar el cupo a otro pasajero previa notificación.\n• Cancelaciones con menos de 20 días: No reembolsable debido a la logística de tripulación y aprovisionamiento insular.',
  },
  {
    id: 'policy-3',
    title: '3. Meteorología, Seguridad y Navegación de Alta Mar',
    content: 'La seguridad de la tripulación y los pasajeros es la máxima prioridad. Los planes de navegación, rutas y desembarcos en caletas están condicionados a las autorizaciones de la Capitanía de Puerto y las condiciones meteorológicas imperantes evaluadas por el Capitán de Ultramar.',
  },
  {
    id: 'policy-4',
    title: '4. Seguros y Certificaciones',
    content: 'Todas las embarcaciones de Yates Chile cuentan con seguros de navegación marítima y equipamiento salvavidas certificado por DIRECTEMAR (Armada de Chile), incluyendo botes auxiliares Zodiac, radiobalizas satelitales EPIRB y conexión Starlink 24/7.',
  },
];

/**
 * Transforms external storage / cloud URLs (Google Drive, Dropbox, OneDrive)
 * into embeddable URLs suitable for iframes and in-browser PDF viewers.
 */
export function getEmbeddablePdfUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive preview URL (permits iframe embedding)
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch && driveOpenMatch[1]) {
    return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;
  }
  const driveDocsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (driveDocsMatch && driveDocsMatch[1]) {
    return `https://docs.google.com/document/d/${driveDocsMatch[1]}/preview`;
  }

  // Dropbox raw mode
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/([?&])dl=[01]/, '$1raw=1');
  }

  // OneDrive embed
  if (trimmed.includes('onedrive.live.com') && !trimmed.includes('embed')) {
    return trimmed.replace('view.aspx', 'embed.aspx');
  }

  return trimmed;
}

/**
 * Returns a clean direct URL for opening in a new tab or downloading.
 */
export function getDirectPdfUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/view?usp=sharing`;
  }
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch && driveOpenMatch[1]) {
    return `https://drive.google.com/file/d/${driveOpenMatch[1]}/view?usp=sharing`;
  }
  const driveDocsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (driveDocsMatch && driveDocsMatch[1]) {
    return `https://docs.google.com/document/d/${driveDocsMatch[1]}/edit?usp=sharing`;
  }
  return trimmed;
}

export interface PublicExpedition {
  id: string;
  name: string;
  headline?: string;
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
  highlights?: string;
  includedServices?: string;
  policies?: ExpeditionPolicySection[] | string;
}

export const getExpeditionAvailableSpots = (exp?: Partial<PublicExpedition> | any | null): number => {
  if (!exp) return 0;
  if (
    exp.spotsLeft === 'completo' ||
    exp.spotsLeft === 'bloqueado' ||
    exp.status === 'completed' ||
    exp.status === 'cancelled'
  ) {
    return 0;
  }
  if (exp.availableSlots !== undefined && exp.availableSlots !== null && exp.availableSlots !== '') {
    const num = Number(exp.availableSlots);
    if (!isNaN(num)) return Math.max(0, num);
  }
  if (exp.available_slots !== undefined && exp.available_slots !== null && exp.available_slots !== '') {
    const num = Number(exp.available_slots);
    if (!isNaN(num)) return Math.max(0, num);
  }
  if (exp.availablePax !== undefined && exp.availablePax !== null && exp.availablePax !== '') {
    const num = Number(exp.availablePax);
    if (!isNaN(num)) return Math.max(0, num);
  }
  if (exp.spotsLeft !== undefined && exp.spotsLeft !== null && exp.spotsLeft !== '') {
    const num = Number(exp.spotsLeft);
    if (!isNaN(num)) return Math.max(0, num);
  }
  const fallback = Number(exp.totalSlots || exp.total_slots);
  return !isNaN(fallback) && fallback > 0 ? fallback : (exp.vesselId === 'terranova' ? 8 : 6);
};

export const isExpeditionSoldOut = (exp?: Partial<PublicExpedition> | any | null): boolean => {
  if (!exp) return false;
  return getExpeditionAvailableSpots(exp) <= 0;
};

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
    image: '/cabo-de-hornos.png',
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
    image: '/cabo-de-hornos.png',
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
    image: '/cabo-de-hornos.png',
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

const ROUTE_NAMES_MAP: Record<string, string> = {
  'ruta-juan-fernandez': 'Expedición Robinson Crusoe',
  'ruta-cabo-hornos': 'Expedición Cabo de Hornos',
  'ruta-fiordos-glaciares': 'Fiordos Secretos & Glaciares',
  'ruta-selkirk': 'Desafío Alejandro Selkirk',
};

const ROUTE_LOCATION_MAP: Record<string, string> = {
  'ruta-juan-fernandez': 'Archipiélago Juan Fernández',
  'ruta-cabo-hornos': 'Canal Beagle & Cabo de Hornos',
  'ruta-fiordos-glaciares': 'Canales Australes & Ventisqueros',
  'ruta-selkirk': 'Isla Alejandro Selkirk (Más Afuera)',
};

const ROUTE_IMAGE_MAP: Record<string, string> = {
  'ruta-juan-fernandez': '/travesia-robinson.jpg',
  'ruta-cabo-hornos': '/cabo-de-hornos.png',
  'ruta-fiordos-glaciares': '/zarpe-archipielago.jpg',
  'ruta-selkirk': '/juan-fernandez-selkirk.jpg',
};

export const PUBLIC_EXPEDITIONS_CACHE_KEY = 'yates_public_expeditions_cache';

export const getCachedPublicExpeditions = (): PublicExpedition[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PUBLIC_EXPEDITIONS_CACHE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizePublicExpedition);
      }
    }
  } catch {}
  return [];
};

const formatRouteDepartureTitle = (d: any, matchedLocal?: any): string => {
  if (d.name && !d.name.startsWith('Ruta ')) return d.name;
  if (matchedLocal?.name && !matchedLocal.name.startsWith('Ruta ')) return matchedLocal.name;
  const baseTitle =
    ROUTE_NAMES_MAP[d.route_id] ||
    (d.route?.title ? d.route.title.replace(/^Ruta \d+:\s*/i, '').split(' & ')[0] : 'Expedición Robinson Crusoe');

  if (d.departure_date) {
    const [year, month] = d.departure_date.split('-');
    const mStr = MONTH_MAP[month] ? (MONTH_MAP[month].charAt(0).toUpperCase() + MONTH_MAP[month].slice(1)) : '';
    if (mStr && year) {
      return `${baseTitle} - ${mStr} ${year}`;
    }
  }
  return baseTitle;
};

const isValidUuid = (id?: string | null): boolean =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
  const rawImg = e.image || (isTerranova ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg');
  const image = normalizeExternalMediaUrl(rawImg);

  const rawAvail = e.availableSlots;
  const numAvail = (rawAvail !== undefined && rawAvail !== null && String(rawAvail).trim() !== '') ? Number(rawAvail) : undefined;
  const isSoldOut = (numAvail !== undefined && numAvail <= 0) || e.spotsLeft === 'completo';
  const availableSlots = isSoldOut ? 0 : (numAvail ?? (isTerranova ? 8 : 6));
  const spotsLeft = (e.status === 'cancelled' || e.spotsLeft === 'bloqueado')
    ? ('bloqueado' as const)
    : isSoldOut
    ? ('completo' as const)
    : (typeof e.spotsLeft === 'number' ? e.spotsLeft : availableSlots);

  return {
    ...e,
    name,
    vessel,
    vesselId,
    image,
    availableSlots,
    spotsLeft,
    status: (isSoldOut && e.status !== 'cancelled') ? 'guaranteed' : (e.status || 'scheduled'),
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
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
        } catch {}
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
    const cloudOverrides: Record<string, any> = {};

    try {
      const { data: cloudData } = await supabase
        .from('site_content')
        .select('section_key, title, media_url, body_text, metadata')
        .ilike('section_key', 'expedition_departure_%');
      if (cloudData && cloudData.length > 0) {
        cloudData.forEach((row: any) => {
          const depId = row.section_key.replace('expedition_departure_', '');
          const meta = (row.metadata && typeof row.metadata === 'object') ? row.metadata : {};
          cloudOverrides[depId] = {
            image: normalizeExternalMediaUrl(row.media_url || meta.image),
            name: meta.name || row.title,
            headline: meta.headline,
            location: meta.location,
            description: meta.description || row.body_text,
            tempEstimate: meta.tempEstimate,
            highlights: meta.highlights,
            includedServices: meta.includedServices,
            brochureUrl: meta.brochureUrl || meta.brochure_url,
            totalSlots: meta.totalSlots !== undefined ? Number(meta.totalSlots) : undefined,
            availableSlots: meta.availableSlots !== undefined ? Number(meta.availableSlots) : undefined,
            status: meta.status,
            pricePerPaxClp: meta.pricePerPaxClp !== undefined ? Number(meta.pricePerPaxClp) : undefined,
            policies: meta.policies,
            policyUrl: meta.policyUrl || meta.policy_url || meta.policies_pdf_url || meta.policiesUrl,
            policy_url: meta.policyUrl || meta.policy_url || meta.policies_pdf_url || meta.policiesUrl,
          };
        });
      }
    } catch {}

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
        brochureUrl: e.brochureUrl || (e as any).brochure_url,
        brochure_url: e.brochureUrl || (e as any).brochure_url,
        policyUrl: cloudOverrides[e.id]?.policyUrl || e.policyUrl || (e as any).policy_url,
        policy_url: cloudOverrides[e.id]?.policyUrl || e.policyUrl || (e as any).policy_url,
        bestViewTime: e.bestViewTime,
        isFeatured: e.isFeatured ?? false,
        highlights: e.highlights,
        includedServices: e.includedServices,
        policies: e.policies || DEFAULT_EXPEDITION_POLICIES,
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

      const { data: allBookingsData } = await supabase
        .from('expedition_bookings')
        .select('id, departure_id, pax_count, status')
        .neq('status', 'cancelled');

      let localBookings: any[] = [];
      try {
        if (typeof window !== 'undefined') {
          const rawB = localStorage.getItem('yates_bookings');
          if (rawB) localBookings = JSON.parse(rawB);
        }
      } catch {}

      if (!error && data && data.length > 0) {
        const mappedDb = (data as any[]).map((d) => {
          const matchedLocal = local.find((l) => l.id === d.id);
          const cloud = cloudOverrides[d.id];
          const isTerranova = d.vessel_id === 'terranova' || (d.vessel?.name && d.vessel.name.toLowerCase().includes('terranova')) || (d.name && d.name.toLowerCase().includes('terranova'));
          const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
          const vesselType = isTerranova ? 'Hatteras 65ft LRC' : 'Dufour 52.5 ft Francés';
          const routeName = cloud?.name || formatRouteDepartureTitle(d, matchedLocal);
          const routeLoc = cloud?.location || matchedLocal?.location || ROUTE_LOCATION_MAP[d.route_id] || 'Archipiélago Juan Fernández';
          const routeImg = cloud?.image || matchedLocal?.image || ROUTE_IMAGE_MAP[d.route_id] || (isTerranova ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg');

          const matchedDbBookings = (allBookingsData || []).filter(
            (b: any) => b.departure_id === d.id && b.status !== 'cancelled'
          );
          const allDepBookings = [...matchedDbBookings];
          localBookings.forEach((lb: any) => {
            if (
              (lb.departure_id === d.id || lb.departureId === d.id) &&
              lb.status !== 'cancelled' &&
              !allDepBookings.some((b) => b.id === lb.id || (b as any).booking_code === lb.booking_code)
            ) {
              allDepBookings.push(lb);
            }
          });

          const realBookedPax = allDepBookings.reduce(
            (sum: number, b: any) => sum + (Number(b.pax_count) || 1),
            0
          );
          const totalSlots = cloud?.totalSlots !== undefined
            ? Number(cloud.totalSlots)
            : (d.total_slots || (isTerranova ? 8 : 6));
          const calculatedAvail = Math.max(0, totalSlots - realBookedPax);

          const configuredRaw = cloud?.availableSlots !== undefined
            ? cloud.availableSlots
            : (d.available_slots !== undefined && d.available_slots !== null ? d.available_slots : matchedLocal?.availableSlots);
          const configuredAvail = configuredRaw !== undefined && configuredRaw !== null && String(configuredRaw).trim() !== ''
            ? Math.max(0, Number(configuredRaw))
            : undefined;

          const availSlots = configuredAvail !== undefined
            ? Math.min(configuredAvail, calculatedAvail)
            : calculatedAvail;
          const isSoldOut = availSlots <= 0 || realBookedPax >= totalSlots;
          const effectiveStatus = (isSoldOut && (cloud?.status || d.status) !== 'cancelled')
            ? 'guaranteed'
            : (cloud?.status || d.status || 'scheduled');

          return {
            ...d,
            available_slots: availSlots,
            total_slots: cloud?.totalSlots !== undefined ? Number(cloud.totalSlots) : (d.total_slots || (isTerranova ? 8 : 6)),
            status: effectiveStatus,
            name: routeName,
            location: routeLoc,
            image: routeImg,
            description: cloud?.description || matchedLocal?.description || d.route?.description || 'Expedición náutica oceánica.',
            tempEstimate: cloud?.tempEstimate || matchedLocal?.tempEstimate || '14°C - 18°C',
            bestViewTime: matchedLocal?.bestViewTime || 'Zarpe matutino',
            isFeatured: matchedLocal?.isFeatured ?? false,
            highlights: cloud?.highlights || matchedLocal?.highlights,
            includedServices: cloud?.includedServices || matchedLocal?.includedServices,
            brochureUrl: cloud?.brochureUrl || matchedLocal?.brochureUrl || (d as any).brochure_url,
            brochure_url: cloud?.brochureUrl || matchedLocal?.brochureUrl || (d as any).brochure_url,
            policies: cloud?.policies || matchedLocal?.policies || DEFAULT_EXPEDITION_POLICIES,
            policyUrl: cloud?.policyUrl || matchedLocal?.policyUrl || (d as any).policy_url || (d as any).policyUrl,
            policy_url: cloud?.policyUrl || matchedLocal?.policyUrl || (d as any).policy_url || (d as any).policyUrl,
            vessel_id: isTerranova ? 'terranova' : 'vegvisir',
            vessel: {
              id: isTerranova ? 'terranova' : 'vegvisir',
              name: vesselName,
              type: vesselType,
            },
          };
        }) as DepartureRow[];

        const extraLocal = local
          .filter((l) => !l.id.startsWith('exp-') && !data.some((d: any) => d.id === l.id))
          .map(mapLocalToRow);

        return [...mappedDb, ...extraLocal];
      }
    } catch {}

    return local.map(mapLocalToRow);
  },

  async getPublicExpeditions(): Promise<PublicExpedition[]> {
    const local = getStoredDepartures();
    const cloudOverrides: Record<string, any> = {};

    try {
      const { data: cloudData } = await supabase
        .from('site_content')
        .select('section_key, title, media_url, body_text, metadata')
        .ilike('section_key', 'expedition_departure_%');
      if (cloudData && cloudData.length > 0) {
        cloudData.forEach((row: any) => {
          const depId = row.section_key.replace('expedition_departure_', '');
          const meta = (row.metadata && typeof row.metadata === 'object') ? row.metadata : {};
          cloudOverrides[depId] = {
            image: normalizeExternalMediaUrl(row.media_url || meta.image),
            name: meta.name || row.title,
            headline: meta.headline,
            location: meta.location,
            description: meta.description || row.body_text,
            tempEstimate: meta.tempEstimate,
            highlights: meta.highlights,
            includedServices: meta.includedServices,
            brochureUrl: meta.brochureUrl || meta.brochure_url,
            totalSlots: meta.totalSlots !== undefined ? Number(meta.totalSlots) : undefined,
            availableSlots: meta.availableSlots !== undefined ? Number(meta.availableSlots) : undefined,
            status: meta.status,
            pricePerPaxClp: meta.pricePerPaxClp !== undefined ? Number(meta.pricePerPaxClp) : undefined,
            policies: meta.policies,
            policyUrl: meta.policyUrl || meta.policy_url || meta.policies_pdf_url || meta.policiesUrl,
            policy_url: meta.policyUrl || meta.policy_url || meta.policies_pdf_url || meta.policiesUrl,
          };
        });
      }
    } catch {}

    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('expedition_departures')
        .select('*, route:expedition_routes(*), vessel:vessels(*)')
        .gte('return_date', todayIso)
        .order('departure_date', { ascending: true });

      const { data: allBookingsData } = await supabase
        .from('expedition_bookings')
        .select('id, departure_id, pax_count, status')
        .neq('status', 'cancelled');

      let localBookings: any[] = [];
      try {
        if (typeof window !== 'undefined') {
          const rawB = localStorage.getItem('yates_bookings');
          if (rawB) localBookings = JSON.parse(rawB);
        }
      } catch {}

      if (!error && data && data.length > 0) {
        const mapped: PublicExpedition[] = data.map((d: any) => {
          const matchedLocal = local.find((l) => l.id === d.id);
          const cloud = cloudOverrides[d.id];
          const isTerranova = d.vessel_id === 'terranova' || (d.vessel?.name && d.vessel.name.toLowerCase().includes('terranova')) || (d.name && d.name.toLowerCase().includes('terranova'));
          const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
          const vesselId = isTerranova ? 'terranova' : 'vegvisir';
          const routeTitle = cloud?.name || formatRouteDepartureTitle(d, matchedLocal);
          const depYear = parseInt(d.departure_date?.split('-')[0] || '2026', 10);
          const months = getMonthsFromDates(d.departure_date, d.return_date);

          const matchedDbBookings = (allBookingsData || []).filter(
            (b: any) => b.departure_id === d.id && b.status !== 'cancelled'
          );
          const allDepBookings = [...matchedDbBookings];
          localBookings.forEach((lb: any) => {
            if (
              (lb.departure_id === d.id || lb.departureId === d.id) &&
              lb.status !== 'cancelled' &&
              !allDepBookings.some((b) => b.id === lb.id || (b as any).booking_code === lb.booking_code)
            ) {
              allDepBookings.push(lb);
            }
          });

          const realBookedPax = allDepBookings.reduce(
            (sum: number, b: any) => sum + (Number(b.pax_count) || 1),
            0
          );
          const totalSlots = cloud?.totalSlots !== undefined
            ? Number(cloud.totalSlots)
            : (d.total_slots || (isTerranova ? 8 : 6));
          const calculatedAvail = Math.max(0, totalSlots - realBookedPax);

          const configuredRaw = cloud?.availableSlots !== undefined
            ? cloud.availableSlots
            : (d.available_slots !== undefined && d.available_slots !== null ? d.available_slots : matchedLocal?.availableSlots);
          const configuredAvail = configuredRaw !== undefined && configuredRaw !== null && String(configuredRaw).trim() !== ''
            ? Math.max(0, Number(configuredRaw))
            : undefined;

          const availSlots = configuredAvail !== undefined
            ? Math.min(configuredAvail, calculatedAvail)
            : calculatedAvail;
          const isSoldOut = availSlots <= 0 || realBookedPax >= totalSlots;
          const effectiveStatus = (isSoldOut && (cloud?.status || d.status) !== 'cancelled')
            ? 'guaranteed'
            : (cloud?.status || d.status || 'scheduled');
          const spots = effectiveStatus === 'cancelled'
            ? ('bloqueado' as const)
            : isSoldOut
            ? ('completo' as const)
            : availSlots;

          return {
            id: d.id,
            name: routeTitle,
            headline: cloud?.headline || matchedLocal?.headline,
            startDate: formatDateSpan(d.departure_date),
            endDate: formatDateSpan(d.return_date),
            departureDate: d.departure_date,
            returnDate: d.return_date,
            monthsActive: months.length > 0 ? months : [10],
            year: isNaN(depYear) ? 2026 : depYear,
            spotsLeft: spots,
            totalSlots: cloud?.totalSlots !== undefined ? Number(cloud.totalSlots) : (d.total_slots || (isTerranova ? 8 : 6)),
            availableSlots: availSlots,
            pricePerPaxClp: cloud?.pricePerPaxClp !== undefined ? Number(cloud.pricePerPaxClp) : (Number(d.price_per_pax_clp) || (isTerranova ? 2350000 : 1950000)),
            priceCharterFullClp: Number(d.price_charter_full_clp) || (isTerranova ? 18800000 : 11700000),
            vessel: vesselName,
            vesselId: vesselId,
            routeId: d.route_id || 'ruta-juan-fernandez',
            description: cloud?.description || matchedLocal?.description || d.route?.description || 'Expedición náutica oceánica.',
            location: cloud?.location || matchedLocal?.location || ROUTE_LOCATION_MAP[d.route_id] || 'Archipiélago Juan Fernández',
            image: cloud?.image || normalizeExternalMediaUrl(matchedLocal?.image) || normalizeExternalMediaUrl(d.image) || ROUTE_IMAGE_MAP[d.route_id] || (isTerranova ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg'),
            bestViewTime: matchedLocal?.bestViewTime || 'Zarpe matutino',
            tempEstimate: cloud?.tempEstimate || matchedLocal?.tempEstimate || '14°C - 18°C',
            highlights: cloud?.highlights || matchedLocal?.highlights,
            includedServices: cloud?.includedServices || matchedLocal?.includedServices,
            brochureUrl: cloud?.brochureUrl || matchedLocal?.brochureUrl || (d as any).brochure_url,
            brochure_url: cloud?.brochureUrl || matchedLocal?.brochureUrl || (d as any).brochure_url,
            policyUrl: cloud?.policyUrl || matchedLocal?.policyUrl || (d as any).policy_url || (d as any).policyUrl,
            policy_url: cloud?.policyUrl || matchedLocal?.policyUrl || (d as any).policy_url || (d as any).policyUrl,
            policies: cloud?.policies || matchedLocal?.policies || DEFAULT_EXPEDITION_POLICIES,
            status: effectiveStatus,
          };
        });

        const extraLocal = local.filter((l) => !l.id.startsWith('exp-') && !data.some((d: any) => d.id === l.id));
        const allPublic = [...mapped, ...extraLocal];
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(PUBLIC_EXPEDITIONS_CACHE_KEY, JSON.stringify(allPublic));
          }
        } catch {}
        return allPublic;
      }
    } catch {}

    const cached = getCachedPublicExpeditions();
    if (cached.length > 0) return cached.map(c => ({ ...c, policies: c.policies || DEFAULT_EXPEDITION_POLICIES }));
    return local.map((l) => ({ ...l, image: normalizeExternalMediaUrl(l.image), policies: l.policies || DEFAULT_EXPEDITION_POLICIES }));
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
            status: b.payment_status === 'partial' || b.status === 'partial' ? 'partial' : b.status === 'pendiente_transferencia' ? 'pending_transfer' : (b.status || 'pending_transfer'),
            payment_status: b.payment_status || (b.status === 'partial' ? 'partial' : undefined),
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

    // Merge and deduplicate by booking_code / id, preserving local enrichment
    const map = new Map<string, ExpeditionBookingRow>();
    supabaseRows.forEach((item) => {
      const key = item.booking_code || item.id;
      map.set(key, item);
    });
    localRows.forEach((item) => {
      const key = item.booking_code || item.id;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, ...item, status: item.status || existing.status });
      } else {
        map.set(key, item);
      }
    });

    // Auto-sync any orphaned local bookings to Supabase in the background so they are permanently preserved
    if (localRows.length > 0) {
      for (const localB of localRows) {
        const alreadyInSb = supabaseRows.some(
          (sb) => sb.booking_code === localB.booking_code || sb.id === localB.id
        );
        if (!alreadyInSb && localB.guest_name) {
          try {
            const validDepId = isValidUuid(localB.departure_id) ? localB.departure_id : null;
            const validVessel = (localB.vessel_id === 'terranova' || localB.vessel_id === 'vegvisir') ? localB.vessel_id : 'vegvisir';
            const validRoute = ['ruta-juan-fernandez', 'ruta-cabo-hornos', 'ruta-fiordos-glaciares', 'ruta-selkirk'].includes(localB.route_id || '')
              ? localB.route_id
              : 'ruta-juan-fernandez';

            const { data: insertedB } = await supabase
              .from('expedition_bookings')
              .insert({
                booking_code: localB.booking_code || `EXP-${Date.now()}`,
                departure_id: validDepId,
                route_id: validRoute,
                vessel_id: validVessel,
                guest_name: localB.guest_name,
                guest_email: localB.guest_email || 'contacto@yateschile.cl',
                guest_phone: localB.guest_phone || '+56 9 5333 2492',
                guest_rut_passport: localB.guest_rut_passport || null,
                booking_type: (localB.booking_type as any) || 'per_pax',
                pax_count: Number(localB.pax_count) || 1,
                total_amount: Number(localB.total_amount) || 0,
                status: (localB.status as any) || 'pending_transfer',
                dietary_medical_notes: localB.dietary_medical_notes || null,
              })
              .select()
              .single();

            if (insertedB) {
              supabaseRows.push(insertedB);
            }
          } catch (syncErr) {
            console.warn('Auto-sync local booking notice:', syncErr);
          }
        }
      }
    }

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

      let validDepartureId: string | null = isValidUuid(params.departureId) ? (params.departureId as string) : null;

      if (!validDepartureId && (params.departureDate || params.departureId)) {
        try {
          const { data: matchedDep } = await supabase
            .from('expedition_departures')
            .select('id')
            .eq('departure_date', params.departureDate || '')
            .limit(1)
            .single();
          if (matchedDep?.id) {
            validDepartureId = matchedDep.id;
          }
        } catch {}
      }

      // Pre-validation: do not allow booking if expedition is sold out or has 0 available spots
      const stored = getStoredDepartures();
      const localDep = params.departureId ? stored.find(e => e.id === params.departureId) : undefined;
      let availSpots = localDep ? getExpeditionAvailableSpots(localDep) : 8;

      if (validDepartureId || params.departureDate || params.departureId) {
        try {
          let query = supabase.from('expedition_departures').select('id, available_slots, total_slots, status');
          if (validDepartureId) {
            query = query.eq('id', validDepartureId);
          } else if (params.departureDate) {
            query = query.eq('departure_date', params.departureDate);
          }
          const { data: depCheck } = await query.limit(1).maybeSingle();
          if (depCheck) {
            if (depCheck.available_slots !== null && depCheck.available_slots !== undefined && String(depCheck.available_slots).trim() !== '') {
              availSpots = Math.max(0, Number(depCheck.available_slots));
            } else if (depCheck.total_slots !== null && depCheck.total_slots !== undefined) {
              availSpots = Math.max(0, Number(depCheck.total_slots));
            }
          }
        } catch {}
      }

      if (availSpots <= 0) {
        return {
          success: false,
          error: 'Esta expedición se encuentra completa (0 cupos disponibles). No es posible realizar reservas.',
        };
      }

      const validRouteId = (params.routeId && ['ruta-juan-fernandez', 'ruta-cabo-hornos', 'ruta-fiordos-glaciares', 'ruta-selkirk'].includes(params.routeId))
        ? params.routeId
        : 'ruta-juan-fernandez';

      const validVesselId = (params.vesselId === 'terranova' || params.vesselId === 'vegvisir')
        ? params.vesselId
        : 'vegvisir';

      // 1. Try Supabase first
      try {
        const { data: booking, error: bookErr } = await supabase
          .from('expedition_bookings')
          .insert({
            booking_code: bookingCode,
            departure_id: validDepartureId,
            route_id: validRouteId,
            vessel_id: validVesselId,
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

        if (bookErr) {
          console.error('Supabase booking insert error:', bookErr);
        } else if (booking) {
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
          if (validDepartureId) {
            const { data: depData } = await supabase
              .from('expedition_departures')
              .select('available_slots, total_slots')
              .eq('id', validDepartureId)
              .single();
            if (depData) {
              const currentAvail = depData.available_slots ?? depData.total_slots ?? 8;
              const nextAvail = Math.max(0, currentAvail - params.paxCount);
              const depUpdatePayload: any = { available_slots: nextAvail };
              if (nextAvail <= 0) {
                depUpdatePayload.status = 'guaranteed';
              }
              await supabase
                .from('expedition_departures')
                .update(depUpdatePayload)
                .eq('id', validDepartureId);

              // Also sync site_content to prevent stale metadata overrides
              try {
                const { data: scData } = await supabase
                  .from('site_content')
                  .select('metadata')
                  .eq('section_key', `expedition_departure_${validDepartureId}`)
                  .maybeSingle();
                if (scData) {
                  const existingMeta = (scData.metadata && typeof scData.metadata === 'object' && !Array.isArray(scData.metadata))
                    ? (scData.metadata as Record<string, any>)
                    : {};
                  const updatedMeta = {
                    ...existingMeta,
                    availableSlots: nextAvail,
                    spotsLeft: nextAvail <= 0 ? 'completo' : nextAvail,
                    status: nextAvail <= 0 ? 'guaranteed' : (existingMeta.status || 'scheduled'),
                  };
                  await supabase
                    .from('site_content')
                    .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
                    .eq('section_key', `expedition_departure_${validDepartureId}`);
                }
              } catch {}

              try {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(PUBLIC_EXPEDITIONS_CACHE_KEY);
                }
              } catch {}
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
              status: (nextAvail === 0 && e.status !== 'cancelled') ? 'guaranteed' : e.status,
            };
          }
          return e;
        });
        saveStoredDepartures(updated);

        try {
          if (typeof window !== 'undefined') {
            const cached = getCachedPublicExpeditions();
            if (cached && cached.length > 0) {
              const updatedCache = cached.map((c) => {
                if (c.id === params.departureId) {
                  const cur = typeof c.availableSlots === 'number' ? c.availableSlots : c.totalSlots;
                  const nextAvail = Math.max(0, cur - params.paxCount);
                  return {
                    ...c,
                    availableSlots: nextAvail,
                    spotsLeft: nextAvail <= 0 ? ('completo' as const) : nextAvail,
                    status: (nextAvail <= 0 && c.status !== 'cancelled') ? 'guaranteed' : c.status,
                  };
                }
                return c;
              });
              localStorage.setItem(PUBLIC_EXPEDITIONS_CACHE_KEY, JSON.stringify(updatedCache));
            }
          }
        } catch {}
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
          status: params.status === 'partial' ? 'partial' : sbStatus,
          payment_status: params.status === 'partial' ? 'partial' : ((params.status === 'approved' || params.status === 'paid' || params.status === 'completed') ? 'paid' : 'pending'),
        };
        bookingsList.unshift(newBookingItem);
        localStorage.setItem('yates_bookings', JSON.stringify(bookingsList));
      } catch (_) {}

      // Save installments into localStorage as well
      try {
        const storedInst = localStorage.getItem('yates_installments');
        const instList = storedInst ? JSON.parse(storedInst) : [];
        const deposit = Math.round(params.totalAmount * 0.5);
        const balance = params.totalAmount - deposit;
        const isFullPaid = params.status === 'approved' || params.status === 'paid' || params.status === 'completed';
        const isPartialPaid = params.status === 'partial';
        const newInsts = [
          {
            id: `inst-${createdId}-1`,
            booking_id: createdId,
            booking_type: 'expedition',
            installment_number: 1,
            total_installments: 2,
            concept: 'Pie de Reserva (50% Requerido)',
            amount_expected: deposit,
            amount_paid: (isFullPaid || isPartialPaid) ? deposit : 0,
            status: (isFullPaid || isPartialPaid) ? 'approved' : 'pending_upload',
            created_at: new Date().toISOString(),
          },
          {
            id: `inst-${createdId}-2`,
            booking_id: createdId,
            booking_type: 'expedition',
            installment_number: 2,
            total_installments: 2,
            concept: 'Saldo Final (50% antes del embarque)',
            amount_expected: balance,
            amount_paid: isFullPaid ? balance : 0,
            status: isFullPaid ? 'approved' : 'pending_upload',
            created_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem('yates_installments', JSON.stringify([...newInsts, ...instList]));
        window.dispatchEvent(new CustomEvent('yates_installments_updated'));
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
      publicHeadline?: string;
      publicLocation?: string;
      publicCoverImage?: string;
      publicDescription?: string;
      publicTempEstimate?: string;
      publicHighlights?: string;
      publicIncludedServices?: string;
      publicBrochureUrl?: string;
      publicPolicyUrl?: string;
      publicPolicies?: ExpeditionPolicySection[] | string;
    }
  ): Promise<{ success: boolean; data?: DepartureRow; error?: string }> {
    try {
      const vesselObj = params.vesselId ? FLEET_DATA.find((v) => v.id === params.vesselId) : undefined;
      const vesselName = vesselObj?.name || (params.vesselId === 'terranova' ? 'Yate Terranova' : params.vesselId === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');

      // Update Supabase
      try {
        const safeTotalSlots = params.totalSlots !== undefined ? Number(params.totalSlots) : undefined;
        const safeAvailSlots = params.availableSlots !== undefined ? Math.max(0, Number(params.availableSlots)) : undefined;
        const isSoldOutDb = safeAvailSlots !== undefined && safeAvailSlots <= 0;
        const effectiveStatus = (isSoldOutDb && params.status !== 'cancelled') ? 'guaranteed' : params.status;

        const updateData: any = {};
        if (params.routeId) updateData.route_id = params.routeId;
        if (params.vesselId) updateData.vessel_id = params.vesselId;
        if (params.departureDate) updateData.departure_date = params.departureDate;
        if (params.returnDate) updateData.return_date = params.returnDate;
        if (safeTotalSlots !== undefined) updateData.total_slots = safeTotalSlots;
        if (safeAvailSlots !== undefined) updateData.available_slots = safeAvailSlots;
        if (params.pricePerPaxClp !== undefined) updateData.price_per_pax_clp = Number(params.pricePerPaxClp);
        if (params.priceCharterFullClp !== undefined) updateData.price_charter_full_clp = Number(params.priceCharterFullClp);
        if (params.publicBrochureUrl !== undefined) updateData.brochure_url = params.publicBrochureUrl;
        if (effectiveStatus) updateData.status = effectiveStatus;

        await supabase
          .from('expedition_departures')
          .update(updateData)
          .eq('id', departureId);
      } catch {}

      // Update localStorage
      const stored = getStoredDepartures();
      let found = false;
      const updated = stored.map((e) => {
        if (e.id === departureId) {
          found = true;
          const depDate = params.departureDate || e.departureDate;
          const retDate = params.returnDate || e.returnDate;
          const startFormatted = depDate ? formatDateSpan(depDate) : e.startDate;
          const endFormatted = retDate ? formatDateSpan(retDate) : e.endDate;
          const months = depDate && retDate ? getMonthsFromDates(depDate, retDate) : e.monthsActive;
          const year = depDate ? parseInt(depDate.split('-')[0], 10) || e.year : e.year;
          const totSlots = params.totalSlots !== undefined ? Number(params.totalSlots) : e.totalSlots;
          const availSlots = params.availableSlots !== undefined ? Math.max(0, Number(params.availableSlots)) : e.availableSlots;
          const isSoldOut = availSlots <= 0;
          const stat = (isSoldOut && (params.status || e.status) !== 'cancelled') ? 'guaranteed' : (params.status || e.status);

          return {
            ...e,
            name: params.publicName || e.name,
            headline: params.publicHeadline !== undefined ? params.publicHeadline : e.headline,
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
            spotsLeft: stat === 'cancelled' ? ('bloqueado' as const) : availSlots <= 0 ? ('completo' as const) : availSlots,
            pricePerPaxClp: params.pricePerPaxClp !== undefined ? Number(params.pricePerPaxClp) : e.pricePerPaxClp,
            priceCharterFullClp: params.priceCharterFullClp !== undefined ? Number(params.priceCharterFullClp) : e.priceCharterFullClp,
            status: stat,
            description: params.publicDescription !== undefined ? params.publicDescription : e.description,
            location: params.publicLocation !== undefined ? params.publicLocation : e.location,
            image: params.publicCoverImage !== undefined ? normalizeExternalMediaUrl(params.publicCoverImage) : e.image,
            tempEstimate: params.publicTempEstimate !== undefined ? params.publicTempEstimate : e.tempEstimate,
            highlights: params.publicHighlights !== undefined ? params.publicHighlights : e.highlights,
            includedServices: params.publicIncludedServices !== undefined ? params.publicIncludedServices : e.includedServices,
            brochureUrl: params.publicBrochureUrl !== undefined ? params.publicBrochureUrl : e.brochureUrl,
            brochure_url: params.publicBrochureUrl !== undefined ? params.publicBrochureUrl : (e as any).brochure_url,
            policyUrl: params.publicPolicyUrl !== undefined ? params.publicPolicyUrl : (e.policyUrl || (e as any).policy_url),
            policy_url: params.publicPolicyUrl !== undefined ? params.publicPolicyUrl : (e.policyUrl || (e as any).policy_url),
            policies: params.publicPolicies !== undefined ? params.publicPolicies : (e as any).policies,
          };
        }
        return e;
      });

      if (!found) {
        const depDate = params.departureDate || '2026-10-01';
        const retDate = params.returnDate || '2026-10-08';
        const totSlots = params.totalSlots !== undefined ? Number(params.totalSlots) : 6;
        const availSlots = params.availableSlots !== undefined ? Math.max(0, Number(params.availableSlots)) : 6;
        const isSoldOut = availSlots <= 0;
        const stat = (isSoldOut && params.status !== 'cancelled') ? 'guaranteed' : (params.status || 'scheduled');
        updated.push({
          id: departureId,
          name: params.publicName || 'Expedición Archipiélago',
          headline: params.publicHeadline,
          startDate: formatDateSpan(depDate),
          endDate: formatDateSpan(retDate),
          departureDate: depDate,
          returnDate: retDate,
          monthsActive: getMonthsFromDates(depDate, retDate),
          year: parseInt(depDate.split('-')[0], 10) || 2026,
          spotsLeft: stat === 'cancelled' ? 'bloqueado' : isSoldOut ? 'completo' : availSlots,
          totalSlots: totSlots,
          availableSlots: availSlots,
          pricePerPaxClp: params.pricePerPaxClp !== undefined ? Number(params.pricePerPaxClp) : 1950000,
          priceCharterFullClp: params.priceCharterFullClp !== undefined ? Number(params.priceCharterFullClp) : 11700000,
          vessel: vesselName,
          vesselId: params.vesselId || 'vegvisir',
          routeId: params.routeId || 'ruta-juan-fernandez',
          description: params.publicDescription || 'Expedición náutica oceánica.',
          location: params.publicLocation || 'Archipiélago Juan Fernández',
          image: params.publicCoverImage ? normalizeExternalMediaUrl(params.publicCoverImage) : '/travesia-robinson.jpg',
          tempEstimate: params.publicTempEstimate || '14°C - 18°C',
          status: stat as any,
          highlights: params.publicHighlights,
          includedServices: params.publicIncludedServices,
          brochureUrl: params.publicBrochureUrl,
          brochure_url: params.publicBrochureUrl,
          policyUrl: params.publicPolicyUrl,
          policy_url: params.publicPolicyUrl,
          policies: params.publicPolicies !== undefined ? params.publicPolicies : DEFAULT_EXPEDITION_POLICIES,
        });
      }

      saveStoredDepartures(updated);

      // Persist custom fields (cover image, highlights, capacity, brochureUrl, etc.) to Supabase site_content table
      try {
        const normImg = params.publicCoverImage !== undefined ? normalizeExternalMediaUrl(params.publicCoverImage) : undefined;
        const safeAvail = params.availableSlots !== undefined ? Math.max(0, Number(params.availableSlots)) : undefined;
        const isSoldOutLocal = safeAvail !== undefined && safeAvail <= 0;
        const effectiveStatusMeta = (isSoldOutLocal && params.status !== 'cancelled') ? 'guaranteed' : params.status;

        const metaPayload: Record<string, any> = {
          departureId,
          updated_at: new Date().toISOString(),
        };
        if (params.publicName !== undefined) metaPayload.name = params.publicName;
        if (params.publicHeadline !== undefined) metaPayload.headline = params.publicHeadline;
        if (params.publicLocation !== undefined) metaPayload.location = params.publicLocation;
        if (params.publicDescription !== undefined) metaPayload.description = params.publicDescription;
        if (normImg !== undefined) metaPayload.image = normImg;
        if (params.publicTempEstimate !== undefined) metaPayload.tempEstimate = params.publicTempEstimate;
        if (params.publicHighlights !== undefined) metaPayload.highlights = params.publicHighlights;
        if (params.publicIncludedServices !== undefined) metaPayload.includedServices = params.publicIncludedServices;
        if (params.publicBrochureUrl !== undefined) metaPayload.brochureUrl = params.publicBrochureUrl;
        if (params.publicPolicyUrl !== undefined) {
          metaPayload.policyUrl = params.publicPolicyUrl;
          metaPayload.policy_url = params.publicPolicyUrl;
        }
        if (params.publicPolicies !== undefined) metaPayload.policies = params.publicPolicies;
        if (params.totalSlots !== undefined) metaPayload.totalSlots = Number(params.totalSlots);
        if (safeAvail !== undefined) {
          metaPayload.availableSlots = safeAvail;
          metaPayload.spotsLeft = safeAvail <= 0 ? 'completo' : safeAvail;
        }
        if (effectiveStatusMeta !== undefined) metaPayload.status = effectiveStatusMeta;
        if (params.pricePerPaxClp !== undefined) metaPayload.pricePerPaxClp = Number(params.pricePerPaxClp);
        if (params.priceCharterFullClp !== undefined) metaPayload.priceCharterFullClp = Number(params.priceCharterFullClp);

        await supabase
          .from('site_content')
          .upsert({
            section_key: `expedition_departure_${departureId}`,
            title: params.publicName || 'Expedición Personalizada',
            media_url: normImg !== undefined ? (normImg || null) : undefined,
            body_text: params.publicDescription || null,
            metadata: metaPayload,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'section_key' });
      } catch (err) {
        console.warn('Could not sync departure to Supabase site_content:', err);
      }

      // Sync PUBLIC_EXPEDITIONS_CACHE_KEY in localStorage for instant frontend update
      try {
        if (typeof window !== 'undefined') {
          const cached = getCachedPublicExpeditions();
          if (cached && cached.length > 0) {
            const safeAvail = params.availableSlots !== undefined ? Math.max(0, Number(params.availableSlots)) : undefined;
            const updatedCache = cached.map((c) => {
              if (c.id === departureId) {
                const depDate = params.departureDate || c.departureDate;
                const retDate = params.returnDate || c.returnDate;
                const totSlots = params.totalSlots !== undefined ? Number(params.totalSlots) : c.totalSlots;
                const availSlots = safeAvail !== undefined ? safeAvail : c.availableSlots;
                const isSoldOut = availSlots <= 0;
                const stat = (isSoldOut && (params.status || c.status) !== 'cancelled') ? 'guaranteed' : (params.status || c.status);
                return {
                  ...c,
                  name: params.publicName || c.name,
                  headline: params.publicHeadline !== undefined ? params.publicHeadline : c.headline,
                  vessel: params.vesselId ? vesselName : c.vessel,
                  vesselId: params.vesselId || c.vesselId,
                  routeId: params.routeId || c.routeId,
                  departureDate: depDate,
                  returnDate: retDate,
                  totalSlots: totSlots,
                  availableSlots: availSlots,
                  spotsLeft: stat === 'cancelled' ? ('bloqueado' as const) : isSoldOut ? ('completo' as const) : availSlots,
                  status: stat,
                  pricePerPaxClp: params.pricePerPaxClp !== undefined ? Number(params.pricePerPaxClp) : c.pricePerPaxClp,
                  priceCharterFullClp: params.priceCharterFullClp !== undefined ? Number(params.priceCharterFullClp) : c.priceCharterFullClp,
                  description: params.publicDescription !== undefined ? params.publicDescription : c.description,
                  location: params.publicLocation !== undefined ? params.publicLocation : c.location,
                  image: params.publicCoverImage !== undefined ? normalizeExternalMediaUrl(params.publicCoverImage) : c.image,
                  tempEstimate: params.publicTempEstimate !== undefined ? params.publicTempEstimate : c.tempEstimate,
                  highlights: params.publicHighlights !== undefined ? params.publicHighlights : c.highlights,
                  includedServices: params.publicIncludedServices !== undefined ? params.publicIncludedServices : c.includedServices,
                  brochureUrl: params.publicBrochureUrl !== undefined ? params.publicBrochureUrl : c.brochureUrl,
                  policyUrl: params.publicPolicyUrl !== undefined ? params.publicPolicyUrl : (c.policyUrl || (c as any).policy_url),
                  policy_url: params.publicPolicyUrl !== undefined ? params.publicPolicyUrl : (c.policyUrl || (c as any).policy_url),
                  policies: params.publicPolicies !== undefined ? params.publicPolicies : (c as any).policies,
                };
              }
              return c;
            });
            localStorage.setItem(PUBLIC_EXPEDITIONS_CACHE_KEY, JSON.stringify(updatedCache));
          }
        }
      } catch {}

      return { 
        success: true,
        data: updated.find((e) => e.id === departureId) as any
      };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async uploadBrochurePdf(file: File, departureId?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        return { success: false, error: 'El archivo seleccionado debe ser un documento en formato PDF (.pdf).' };
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const depSlug = departureId ? `${departureId}_` : '';
      const path = `brochures/${depSlug}${timestamp}_${sanitizedName}`;

      // 1. Intentar subida directa a Supabase Storage (bucket site-media)
      try {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client.storage
          .from('site-media')
          .upload(path, file, { contentType: 'application/pdf', upsert: true, cacheControl: '31536000' });

        if (!error && data) {
          const { data: publicData } = client.storage.from('site-media').getPublicUrl(data.path);
          return { success: true, url: publicData.publicUrl };
        }
      } catch (storageErr) {
        console.warn('Error en storage directo Supabase, activando fallback local:', storageErr);
      }

      // 2. Fallback de alta resiliencia: Codificación Base64 Data URL (funciona siempre)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ success: true, url: reader.result as string });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'No se pudo leer el archivo PDF localmente.' });
        };
        reader.readAsDataURL(file);
      });
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
              ? { ...b, status: status === 'partial' ? 'partial' : sbStatus, payment_status: status }
              : b
          );
          localStorage.setItem('yates_bookings', JSON.stringify(updated));
        }
      } catch (_) {}

      // Synchronize installments in Supabase and localStorage
      try {
        if (status === 'approved' || status === 'completed') {
          await supabase
            .from('payment_installments')
            .update({ status: 'approved' })
            .eq('booking_id', bookingId);
        } else if (status === 'partial') {
          await supabase
            .from('payment_installments')
            .update({ status: 'approved' })
            .eq('booking_id', bookingId)
            .eq('installment_number', 1);
          await supabase
            .from('payment_installments')
            .update({ status: 'pending_upload', amount_paid: 0 })
            .eq('booking_id', bookingId)
            .eq('installment_number', 2);
        } else if (status === 'cancelled') {
          await supabase
            .from('payment_installments')
            .update({ status: 'rejected' })
            .eq('booking_id', bookingId);
        }
      } catch (_) {}

      try {
        const storedInst = localStorage.getItem('yates_installments');
        if (storedInst) {
          const instList = JSON.parse(storedInst);
          const updatedInstList = instList.map((inst: any) => {
            if (inst.booking_id === bookingId) {
              if (status === 'approved' || status === 'completed') {
                return { ...inst, status: 'approved', amount_paid: inst.amount_expected || 0 };
              } else if (status === 'partial') {
                if (inst.installment_number === 1) {
                  return { ...inst, status: 'approved', amount_paid: inst.amount_expected || 0 };
                } else {
                  return { ...inst, status: 'pending_upload', amount_paid: 0 };
                }
              } else if (status === 'cancelled') {
                return { ...inst, status: 'rejected' };
              }
            }
            return inst;
          });
          localStorage.setItem('yates_installments', JSON.stringify(updatedInstList));
        }
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_expeditions_updated'));
        window.dispatchEvent(new CustomEvent('yates_bookings_updated'));
        window.dispatchEvent(new CustomEvent('yates_installments_updated'));
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

            try {
              const { data: scData } = await supabase
                .from('site_content')
                .select('metadata')
                .eq('section_key', `expedition_departure_${targetDepartureId}`)
                .maybeSingle();
              if (scData) {
                const existingMeta = (scData.metadata && typeof scData.metadata === 'object' && !Array.isArray(scData.metadata))
                  ? (scData.metadata as Record<string, any>)
                  : {};
                const updatedMeta = {
                  ...existingMeta,
                  availableSlots: restored,
                  spotsLeft: restored <= 0 ? 'completo' : restored,
                  status: restored <= 0 ? 'guaranteed' : (existingMeta.status || 'scheduled'),
                };
                await supabase
                  .from('site_content')
                  .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
                  .eq('section_key', `expedition_departure_${targetDepartureId}`);
              }
            } catch {}

            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(PUBLIC_EXPEDITIONS_CACHE_KEY);
              }
            } catch {}
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
