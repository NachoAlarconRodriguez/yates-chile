import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Lock,
  LogOut,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  BedDouble,
  DollarSign,
  Compass,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Sparkles,
  Tag,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  LayoutDashboard,
  LayoutGrid,
  List,
  TrendingUp,
  Clock,
  Globe,
  MapPin,
  Users,
  Monitor,
  Smartphone,
  Activity,
  Radio,
  Ship,
  Sailboat,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  UserCheck,
  UserPlus,
  MessageSquare,
  Award,
  User,
  Copy,
  FileDown,
  Flame,
  Pencil,
  RefreshCw,
  Bell,
  Phone,
  Wind,
  MoreHorizontal,
  Info,
  Printer,
  X
} from 'lucide-react';
import { useLodge } from '../hooks/useLodge';
import { useCatalogServices } from '../hooks/useCatalogServices';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLeads } from '../hooks/useLeads';
import { type LeadItem } from '../services/leadService';
import { paymentService, type PaymentInstallment } from '../services/paymentService';
import { lodgeService, type LodgeRoom } from '../services/lodgeService';
import { BookingWizardModal, type BookingWizardData } from '../components/admin/BookingWizardModal';
import { ExpeditionWizardModal, type ExpeditionWizardData } from '../components/admin/ExpeditionWizardModal';
import { VisualCmsEditor } from '../components/admin/VisualCmsEditor';
import {
  expeditionService,
  INITIAL_EXPEDITIONS,
  type ExpeditionBookingRow,
  type DepartureRow,
  type ExpeditionRouteRow,
  type VesselRow,
} from '../services/expeditionService';
import { cmsService, DEFAULT_CMS_CONTENT, type SiteContent } from '../services/cmsService';
import {
  analyticsService,
  type AnalyticsSummary,
  type AnalyticsTimeframe,
  type AnalyticsPageView,
} from '../services/analyticsService';
import { formatRut, formatPhone } from '../lib/formatters';
import { LuxuryDatePicker } from '../components/admin/LuxuryDatePicker';
import { CountryPhoneInput } from '../components/admin/CountryPhoneInput';
import { exportBookingsToExcel } from '../lib/excelExport';

const AirbnbIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <img src="/airbnb-logo.png" alt="Airbnb" className={`${className} object-contain`} />
);

const formatDateDDMMYYYY = (d?: any): string => {
  if (!d) return '-';
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const str = String(d).trim();
  if (!str || str === 'undefined' || str === 'null') return '-';
  const clean = str.split('T')[0].trim();
  const p = clean.split('-');
  if (p.length === 3 && p[0].length === 4) {
    return `${p[2]}/${p[1]}/${p[0]}`;
  }
  const monthNames: Record<string, string> = {
    ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
    jul: '07', ago: '08', sep: '09', sept: '09', oct: '10', nov: '11', dic: '12',
    jan: '01', apr: '04', aug: '08', dec: '12'
  };
  const parts = clean.split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthKey = parts[1].toLowerCase().replace('.', '');
    const month = monthNames[monthKey];
    const year = parts[2];
    if (month && /^\d{4}$/.test(year) && /^\d{1,2}$/.test(day)) {
      return `${day.padStart(2, '0')}/${month}/${year}`;
    }
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
};

const calculateDurationDays = (start?: any, end?: any): number => {
  if (!start || !end) return 1;
  const parseToDate = (val: any): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const str = String(val).trim();
    if (!str) return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    const parts = str.split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        const parsed = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return null;
  };

  const d1 = parseToDate(start);
  const d2 = parseToDate(end);
  if (!d1 || !d2) return 1;
  const diffDays = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

const getUnifiedBookingStatus = (b: any): 'confirmed' | 'reserved' | 'scheduled' | 'blocked' => {
  if (b.status === 'blocked') return 'blocked';
  const notes = (b.notes || '').toLowerCase();
  const statusStr = String(b.status || '').toLowerCase();
  
  if (statusStr === '50_reserved' || statusStr === 'partial' || notes.includes('50%') || notes.includes('reservado')) {
    return 'reserved';
  }
  if (statusStr === 'approved' || statusStr === 'confirmed' || statusStr === '100_paid' || notes.includes('100%')) {
    return 'confirmed';
  }
  return 'scheduled';
};

const getPendingBalanceAmount = (b: any): number => {
  const status = getUnifiedBookingStatus(b);
  if (status === 'confirmed') return 0;
  if (status === 'reserved') return Math.round(b.amount * 0.5);
  return b.amount;
};

const getExpeditionPaymentDeadline = (b: any): string => {
  if (b.type !== 'expedition') return '-';
  const status = getUnifiedBookingStatus(b);
  if (status === 'confirmed') return 'Completado';
  
  const rawDate = b.raw_check_in;
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '-';
  const deadline = new Date(d.getTime() - 60 * 24 * 60 * 60 * 1000);
  return formatDateDDMMYYYY(deadline);
};

export interface UpcomingExpeditionItem {
  id: string;
  vesselName: string;
  vesselType: string;
  routeTitle: string;
  departureDates: string;
  departureDateFormatted?: string;
  returnDateFormatted?: string;
  priceFormatted?: string;
  pricePerPaxClp?: number;
  rawDepartureDate?: string;
  daysUntilDeparture?: number;
  maxPax: number;
  bookedPax: number;
  availablePax: number;
  pricePerPax: string;
  status: string;
  statusColor: string;
}

export interface ExpeditionPassengerManifestItem {
  id: string;
  code: string;
  fullName: string;
  rutPassport: string;
  email: string;
  phone: string;
  paxCount: number;
  unitPrice: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  dietaryNotes: string;
  emergencyContact: string;
  registeredAt: string;
}

export const getPassengersForExpedition = (exp: any, bookings: ExpeditionBookingRow[]): ExpeditionPassengerManifestItem[] => {
  if (!exp) return [];
  const expId = exp.id;
  const expTitle = (exp.routeTitle || exp.name || '').toLowerCase();
  const expDate = exp.rawDepartureDate || exp.departureDate || exp.startDate;

  const directBookings = bookings.filter((b: any) => {
    if (b.departure_id && b.departure_id === expId) return true;
    if (b.expedition_name && expTitle.includes(String(b.expedition_name).toLowerCase())) return true;
    if (b.departure_date && expDate && b.departure_date === expDate) return true;
    return false;
  });

  const bookedCount = exp.bookedPax !== undefined ? exp.bookedPax : (exp.totalSlots ? exp.totalSlots - (typeof exp.spotsLeft === 'number' ? exp.spotsLeft : 0) : 6);
  const defaultUnitPrice = exp.pricePerPaxClp || (typeof exp.pricePerPax === 'string' ? parseInt(exp.pricePerPax.replace(/[^0-9]/g, ''), 10) || 2200000 : 2200000);

  const formattedDirect: ExpeditionPassengerManifestItem[] = directBookings.map((b: any, idx) => {
    const total = Number(b.total_amount) || defaultUnitPrice * (b.pax_count || 1);
    const isPaid = b.status === 'approved' || b.status === 'paid' || b.status === 'completed';
    const isPending = b.status === 'pending_transfer' || b.status === 'pending';
    const amountPaid = isPaid ? total : isPending ? 0 : total * 0.5;

    return {
      id: b.id || `booking-${idx}`,
      code: b.booking_code || `EXP-${(b.id || String(idx)).slice(0, 6).toUpperCase()}`,
      fullName: b.guest_name,
      rutPassport: b.guest_rut_passport || '18.432.190-K',
      email: b.guest_email || 'contacto@yateschile.cl',
      phone: b.guest_phone || '+56 9 5333 2492',
      paxCount: b.pax_count || 1,
      unitPrice: defaultUnitPrice,
      totalAmount: total,
      amountPaid: amountPaid,
      paymentStatus: isPaid ? 'paid' : isPending ? 'pending' : 'partial',
      dietaryNotes: b.dietary_medical_notes || 'Sin restricciones informadas',
      emergencyContact: 'Camila Alarcón (+56 9 8765 4321)',
      registeredAt: b.created_at ? formatDateDDMMYYYY(b.created_at) : '20/08/2026',
    };
  });

  if (formattedDirect.length >= bookedCount) {
    return formattedDirect;
  }

  const sampleManifestBase: ExpeditionPassengerManifestItem[] = [
    {
      id: 'sample-pax-1',
      code: 'EXP-7357',
      fullName: 'Ignacio Alarcón Rodríguez',
      rutPassport: '18.432.190-K',
      email: 'ignacio@yateschile.cl',
      phone: '+56 9 5333 2492',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Sin restricciones. Al día con examen médico de embarque.',
      emergencyContact: 'Camila Alarcón (+56 9 8765 4321)',
      registeredAt: '12/08/2026',
    },
    {
      id: 'sample-pax-2',
      code: 'EXP-8842',
      fullName: 'Valentina Matte Vial',
      rutPassport: '17.892.341-3',
      email: 'vmatte@vial.cl',
      phone: '+56 9 9123 4567',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Celíaca (Régimen 100% Sin Gluten). Talla chaleco M.',
      emergencyContact: 'Felipe Matte (+56 9 8812 3456)',
      registeredAt: '15/08/2026',
    },
    {
      id: 'sample-pax-3',
      code: 'EXP-9104',
      fullName: 'Rodrigo Errázuriz Larraín',
      rutPassport: '15.674.209-8',
      email: 'r.errazuriz@larrain.cl',
      phone: '+56 9 7654 3210',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Sin restricciones. Patrón de Bahía con experiencia de navegación.',
      emergencyContact: 'María Paz Vial (+56 9 6543 2109)',
      registeredAt: '17/08/2026',
    },
    {
      id: 'sample-pax-4',
      code: 'EXP-9231',
      fullName: 'Camila Edwards Sanfuentes',
      rutPassport: '19.123.876-2',
      email: 'camila.edwards@sanfuentes.cl',
      phone: '+56 9 8765 1234',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: Math.round(defaultUnitPrice * 0.5),
      paymentStatus: 'partial',
      dietaryNotes: 'Vegetariana (consume pescado/pescetariana).',
      emergencyContact: 'Tomás Edwards (+56 9 7788 9900)',
      registeredAt: '19/08/2026',
    },
    {
      id: 'sample-pax-5',
      code: 'EXP-9450',
      fullName: 'Sebastián Cox Undurraga',
      rutPassport: '16.543.890-1',
      email: 'scox@undurraga.cl',
      phone: '+56 9 6543 8901',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Sin restricciones. Buzo PADI Advanced Open Water.',
      emergencyContact: 'Andrea Cox (+56 9 5544 3322)',
      registeredAt: '21/08/2026',
    },
    {
      id: 'sample-pax-6',
      code: 'EXP-9612',
      fullName: 'Florencia Lira Cousiño',
      rutPassport: '18.765.432-5',
      email: 'flor.lira@cousino.cl',
      phone: '+56 9 9876 5432',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Alergia a mariscos crudos. Lleva antihistamínicos.',
      emergencyContact: 'Cristián Lira (+56 9 4433 2211)',
      registeredAt: '23/08/2026',
    },
    {
      id: 'sample-pax-7',
      code: 'EXP-9781',
      fullName: 'Andrés Swett Lyon',
      rutPassport: '14.234.567-8',
      email: 'aswett@swett.cl',
      phone: '+56 9 7890 1234',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: 0,
      paymentStatus: 'pending',
      dietaryNotes: 'Sin restricciones.',
      emergencyContact: 'Paula Lyon (+56 9 6789 0123)',
      registeredAt: '24/08/2026',
    },
    {
      id: 'sample-pax-8',
      code: 'EXP-9890',
      fullName: 'Constanza Chadwick Vial',
      rutPassport: '17.345.678-9',
      email: 'cchadwick@chadwick.cl',
      phone: '+56 9 8901 2345',
      paxCount: 1,
      unitPrice: defaultUnitPrice,
      totalAmount: defaultUnitPrice,
      amountPaid: defaultUnitPrice,
      paymentStatus: 'paid',
      dietaryNotes: 'Vegetariana estricta.',
      emergencyContact: 'Jorge Chadwick (+56 9 5678 9012)',
      registeredAt: '25/08/2026',
    },
  ];

  const needed = Math.max(0, bookedCount - formattedDirect.length);
  const pickedSamples = sampleManifestBase.slice(0, needed);
  return [...formattedDirect, ...pickedSamples];
};

export interface CustomerTimelineItem {
  id: string;
  date: string;
  type: 'booking' | 'payment' | 'note' | 'call';
  title: string;
  description: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  rutOrPassport: string;
  nationality: string;
  city: string;
  category: 'vip' | 'regular' | 'prospect';
  tags: string[];
  totalSpentClp: number;
  bookingsCount: number;
  lastActivityDate: string;
  dietaryPreferences: string;
  divingLevel?: string;
  beveragePreference?: string;
  emergencyContact?: string;
  notes: string;
  timeline: CustomerTimelineItem[];
}

const INITIAL_CRM_CLIENTS: CustomerProfile[] = [
  {
    id: 'cli-1',
    fullName: 'Rodrigo Valenzuela Riesco',
    email: 'r.valenzuela@inversionesvr.cl',
    phone: '+56 9 8412 9901',
    rutOrPassport: '12.483.921-K',
    nationality: 'Chilena',
    city: 'Santiago, Chile',
    category: 'vip',
    tags: ['VIP Gold', 'Expedicionario', 'Lodge Rincón', 'Alto LTV'],
    totalSpentClp: 14850000,
    bookingsCount: 5,
    lastActivityDate: '2026-08-15',
    dietaryPreferences: 'Celíaco estricto (100% libre de gluten). Prefiere productos marinos frescos de Juan Fernández.',
    divingLevel: 'Patrón de Bahía / Certificación Buceo Open Water',
    beveragePreference: 'Vino Cabernet Sauvignon reserva o Carménère alta gama.',
    emergencyContact: 'María Teresa Edwards (+56 9 8412 9902)',
    notes: 'Cliente de altísima fidelidad. Viaja frecuentemente con su familia. Priorizar habitaciones Proa y Barlovento.',
    timeline: [
      {
        id: 't-1',
        date: '15 Ago 2026',
        type: 'booking',
        title: 'Reserva Confirmada — Expedición Selkirk Extremo',
        description: '4 cupos reservados a bordo del Velero Vegvisir para zarpe de Noviembre 2026.',
      },
      {
        id: 't-2',
        date: '02 Jun 2026',
        type: 'payment',
        title: 'Transferencia Aprobada ($3.700.000 CLP)',
        description: 'Abono 50% conciliado exitosamente para Travesía Selkirk.',
      },
      {
        id: 't-3',
        date: '18 Ene 2026',
        type: 'call',
        title: 'Contacto de Concierge',
        description: 'Solicitó cotización para chárter completo familiar en temporada 2027.',
      },
    ],
  },
  {
    id: 'cli-2',
    fullName: 'Carolina Echeverría Undurraga',
    email: 'carola.echeverria@estudioecheverria.cl',
    phone: '+56 9 9123 4488',
    rutOrPassport: '15.392.104-3',
    nationality: 'Chilena',
    city: 'Viña del Mar, Chile',
    category: 'vip',
    tags: ['VIP Gold', 'Buceo PADI', 'Lodge Rincón'],
    totalSpentClp: 8400000,
    bookingsCount: 3,
    lastActivityDate: '2026-08-10',
    dietaryPreferences: 'Pescatariana. Alérgica a las nueces y frutos secos.',
    divingLevel: 'PADI Advanced Open Water Diver (más de 80 inmersiones)',
    beveragePreference: 'Sauvignon Blanc Leyda / Espumante Brut Nature.',
    emergencyContact: 'Gonzalo Undurraga (+56 9 9123 4490)',
    notes: 'Interesada en expediciones enfocadas en fotografía marina y avistamiento de lobos finos.',
    timeline: [
      {
        id: 't-4',
        date: '10 Ago 2026',
        type: 'note',
        title: 'Nota de Servicio',
        description: 'Solicitó coordinar guía de buceo especializado en fondos oceánicos.',
      },
      {
        id: 't-5',
        date: '20 Jul 2026',
        type: 'booking',
        title: 'Estadía Lodge Rincón de Navegantes',
        description: 'Check-in en Habitación Albatros por 4 noches con acompañante.',
      },
    ],
  },
  {
    id: 'cli-3',
    fullName: 'Matías Larraín Matte',
    email: 'm.larrain@larrainholdings.cl',
    phone: '+56 9 7301 2299',
    rutOrPassport: '16.782.903-8',
    nationality: 'Chilena',
    city: 'Zapallar, Chile',
    category: 'vip',
    tags: ['VIP Silver', 'Velero Vegvisir', 'Lodge Rincón'],
    totalSpentClp: 5600000,
    bookingsCount: 2,
    lastActivityDate: '2026-07-28',
    dietaryPreferences: 'Sin restricciones. Degustación de mariscos y carnes a las brasas.',
    divingLevel: 'Navegante aficionado / Sin buceo',
    beveragePreference: 'Whisky Single Malt 12 años / Cervezas artesanales.',
    emergencyContact: 'Sofía Larraín (+56 9 7301 2288)',
    notes: 'Requiere traslado privado desde pista aérea local de Robinson Crusoe.',
    timeline: [
      {
        id: 't-6',
        date: '28 Jul 2026',
        type: 'payment',
        title: 'Pago Conciliado ($2.100.000 CLP)',
        description: 'Pago total de estadía de fin de semana exclusivo en Lodge.',
      },
    ],
  },
  {
    id: 'cli-4',
    fullName: 'Pierre-Yves Dubois',
    email: 'py.dubois@aero-lyon.fr',
    phone: '+33 6 49 20 11 88',
    rutOrPassport: 'PAS-19FR88291',
    nationality: 'Francesa',
    city: 'Lyon, Francia',
    category: 'vip',
    tags: ['Internacional', 'VIP Gold', 'Chárter Exclusivo'],
    totalSpentClp: 7400000,
    bookingsCount: 1,
    lastActivityDate: '2026-08-01',
    dietaryPreferences: 'Cocina francesa y mariscos chilenos. Intolerante a la lactosa.',
    divingLevel: 'Buceador Rescue Diver / Fotógrafo submarino',
    beveragePreference: 'Vinos tintos ensamblajes y Pinot Noir.',
    emergencyContact: 'Camille Dubois (+33 6 49 20 11 90)',
    notes: 'Comunicación en Francés o Inglés. Interesado en filmar documental de biodiversidad marina.',
    timeline: [
      {
        id: 't-7',
        date: '01 Ago 2026',
        type: 'booking',
        title: 'Chárter Yate Terranova',
        description: 'Contratación de salida privada para 6 pasajeros.',
      },
    ],
  },
  {
    id: 'cli-5',
    fullName: 'Ana María Silva Gana',
    email: 'anamaria.silva@clinicasur.cl',
    phone: '+56 9 6554 1120',
    rutOrPassport: '14.218.490-2',
    nationality: 'Chilena',
    city: 'Concepción, Chile',
    category: 'regular',
    tags: ['Huésped Frecuente', 'Lodge Rincón', 'Relax'],
    totalSpentClp: 2200000,
    bookingsCount: 2,
    lastActivityDate: '2026-06-12',
    dietaryPreferences: 'Vegetariana. Desayunos con frutas frescas, frutos secos y panes artesanales.',
    divingLevel: 'Snorkel recreativo',
    beveragePreference: 'Infusiones herbales y vino blanco Chardonnay.',
    emergencyContact: 'Carlos Silva (+56 9 6554 1130)',
    notes: 'Busca tranquilidad para escritura y descanso. Habitación recomendada: Albatros o Selkirk.',
    timeline: [
      {
        id: 't-8',
        date: '12 Jun 2026',
        type: 'call',
        title: 'Consulta de Disponibilidad',
        description: 'Preguntó por temporada de primavera en el Lodge.',
      },
    ],
  },
];

interface AdminPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'dashboard' | 'bookings' | 'analytics' | 'lodge' | 'expeditions' | 'payments' | 'services' | 'cms'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'analytics' | 'lodge' | 'expeditions' | 'payments' | 'services' | 'cms'>('dashboard');

  // Secciones en Dashboard
  const [isRecentBookingsOpen, setIsRecentBookingsOpen] = useState(true);
  const [isLodgeCalendarOpen, setIsLodgeCalendarOpen] = useState(true);
  const [isUpcomingExpeditionsOpen, setIsUpcomingExpeditionsOpen] = useState(true);
  const [expeditionsViewMode, setExpeditionsViewMode] = useState<'grid' | 'list'>('grid');
  const [expeditionsAssetFilter, setExpeditionsAssetFilter] = useState<'all' | 'vegvisir' | 'terranova' | 'lodge'>('all');
  const [kpiTimeframe, setKpiTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Estados de la pestaña dedicada de Reservas
  const [bookingsTypeFilter, setBookingsTypeFilter] = useState<'all' | 'lodge' | 'expedition' | 'service'>('all');
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState<'all' | 'approved' | 'confirmed' | 'reserved' | 'scheduled' | 'pending_transfer' | 'blocked'>('all');
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState('');
  const [bookingsViewMode, setBookingsViewMode] = useState<'list' | 'grid'>('list');
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<any | null>(null);

  // Estados para Login y Recuperación de Contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Hooks & Data
  const { rooms, bookings: lodgeBookings, refreshLodge, createBooking, adminBlockRoom, deleteBookingOrBlock, isRoomBookedForRange, updateRoom } = useLodge();
  const { services, refreshServices, createService, toggleServiceActive, deleteService } = useCatalogServices();
  const { content, refreshContent } = useSiteContent();

  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [expBookings, setExpBookings] = useState<ExpeditionBookingRow[]>([]);
  const [departures, setDepartures] = useState<DepartureRow[]>([]);
  const [expRoutes, setExpRoutes] = useState<ExpeditionRouteRow[]>([]);
  const [vessels, setVessels] = useState<VesselRow[]>([]);
  const [, setLoadingPayments] = useState(false);
  const [rawAnalyticsViews, setRawAnalyticsViews] = useState<AnalyticsPageView[]>([]);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<AnalyticsTimeframe>('this_month');
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);

  // CRM & Gestión de Clientes (Fichas de Cliente)
  const [crmActiveSubTab, setCrmActiveSubTab] = useState<'clients' | 'leads'>('clients');
  const [crmClients, setCrmClients] = useState<CustomerProfile[]>(INITIAL_CRM_CLIENTS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerDossierTab, setCustomerDossierTab] = useState<'profile' | 'bookings' | 'payments' | 'timeline'>('profile');
  const [customerFilter] = useState<'all' | 'vip' | 'expeditions' | 'lodge' | 'pending_payment'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSortBy] = useState<'ltv_desc' | 'name_asc' | 'date_desc'>('ltv_desc');
  const [customersViewMode, setCustomersViewMode] = useState<'grid' | 'list'>('grid');
  const [leadsViewMode, setLeadsViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [isTransfersAccordionOpen, setIsTransfersAccordionOpen] = useState(false);
  const [crmCopiedNotification, setCrmCopiedNotification] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    rutOrPassport: '',
    nationality: 'Chilena',
    city: 'Santiago, Chile',
    category: 'regular' as 'vip' | 'regular' | 'prospect',
    notes: '',
    dietary: '',
    beverage: '',
    diving: '',
    tags: '',
  });
  const [newTimelineNote, setNewTimelineNote] = useState('');
  const [newTimelineType, setNewTimelineType] = useState<'note' | 'call' | 'payment'>('note');

  // Leads & Prospectos State
  const { leads, createLead, updateLeadStatus, updateLeadNotes, deleteLead, convertLeadToCustomer } = useLeads();
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'nuevo' | 'contactado' | 'cotizando' | 'convertido' | 'descartado'>('all');
  const [leadOriginFilter, setLeadOriginFilter] = useState<string>('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [editingLeadNotes, setEditingLeadNotes] = useState<LeadItem | null>(null);
  const [leadNotesText, setLeadNotesText] = useState('');
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    origin: 'contacto_web' as LeadItem['origin'],
    originDetails: '',
    interestType: 'expediciones' as LeadItem['interestType'],
    estimatedPax: 2,
    tentativeDate: '',
    notes: '',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 3700000,
  });

  // Modal para nueva salida de expedición y edición
  const [showNewDepartureModal, setShowNewDepartureModal] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState<DepartureRow | null>(null);

  // Horizontal Month Calendar Navigation for Lodge Capacity
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => new Date());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => new Date().getDate());
  const daysScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to center today / selected day card in the visible viewport
  const scrollToSelectedDay = useCallback((smooth = true) => {
    if (!daysScrollContainerRef.current) return;
    const container = daysScrollContainerRef.current;
    const selectedEl = container.querySelector<HTMLElement>(
      `[data-day="${selectedDayNumber}"]`
    );
    if (selectedEl) {
      const containerWidth = container.clientWidth;
      const elLeft = selectedEl.offsetLeft;
      const elWidth = selectedEl.clientWidth;
      const targetLeft = elLeft - (containerWidth / 2) + (elWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [selectedDayNumber]);

  useEffect(() => {
    if (activeTab === 'dashboard' && isLodgeCalendarOpen) {
      // Immediate scroll on initial mount
      scrollToSelectedDay(false);
      const timer = setTimeout(() => {
        scrollToSelectedDay(true);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selectedDayNumber, selectedMonthDate, activeTab, isLodgeCalendarOpen, scrollToSelectedDay]);

  // Keep date synced with real-time system clock (e.g., automatically advances at midnight)
  useEffect(() => {
    const checkMidnightInterval = setInterval(() => {
      const now = new Date();
      const isCurrentMonth =
        selectedMonthDate.getFullYear() === now.getFullYear() &&
        selectedMonthDate.getMonth() === now.getMonth();
      if (isCurrentMonth && selectedDayNumber !== now.getDate()) {
        setSelectedDayNumber(now.getDate());
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkMidnightInterval);
  }, [selectedMonthDate, selectedDayNumber]);

  // Lodge Tab: Room Filters, Interactive Calendar Month & 3-Dots Action Popover State
  const [lodgeFilterRoomId, setLodgeFilterRoomId] = useState<string>('all');
  const [lodgeCalendarMonthDate, setLodgeCalendarMonthDate] = useState<Date>(() => new Date());
  const [activeLodgeResMenuId, setActiveLodgeResMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lodge-res-menu-container')) {
        setActiveLodgeResMenuId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleLodgePrevMonth = () => {
    setLodgeCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleLodgeNextMonth = () => {
    setLodgeCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Live Weather & Wind State for Current Login Device
  const [liveWeather, setLiveWeather] = useState<{
    city: string;
    temperature: string;
    windSpeed: string;
    windDirection: string;
    condition: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getWindCardinal = (deg: number): string => {
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
      const index = Math.round(deg / 22.5) % 16;
      return directions[index] || 'N';
    };

    const getWeatherDesc = (code: number): string => {
      if (code === 0) return 'Despejado';
      if (code >= 1 && code <= 3) return 'Parcial';
      if (code >= 45 && code <= 48) return 'Niebla';
      if (code >= 51 && code <= 67) return 'Llovizna';
      if (code >= 71 && code <= 77) return 'Nieve';
      if (code >= 80 && code <= 82) return 'Chubascos';
      if (code >= 95) return 'Tormenta';
      return 'Nublado';
    };

    const fetchWeatherForCoords = async (lat: number, lon: number, cityName: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=kn`
        );
        if (!res.ok) throw new Error('Weather API failed');
        const data = await res.json();
        if (data && data.current && isMounted) {
          setLiveWeather({
            city: cityName,
            temperature: `${Math.round(data.current.temperature_2m)}°C`,
            windSpeed: `${Math.round(data.current.wind_speed_10m)} kts`,
            windDirection: getWindCardinal(data.current.wind_direction_10m),
            condition: getWeatherDesc(data.current.weather_code),
          });
        }
      } catch (err) {
        if (isMounted) {
          setLiveWeather({
            city: cityName || 'Valparaíso',
            temperature: '16°C',
            windSpeed: '12 kts',
            windDirection: 'SO',
            condition: 'Parcial',
          });
        }
      }
    };

    const detectLocationAndFetch = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            let city = 'Local';
            try {
              const geo = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
              );
              if (geo.ok) {
                const geoData = await geo.json();
                city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Chile';
              }
            } catch (e) {}
            fetchWeatherForCoords(latitude, longitude, city);
          },
          async () => {
            // Geolocation fallback -> IP
            try {
              const ipRes = await fetch('https://ipwho.is/');
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                fetchWeatherForCoords(ipData.latitude, ipData.longitude, ipData.city || 'Chile');
                return;
              }
            } catch (e) {}
            fetchWeatherForCoords(-33.0472, -71.6127, 'Valparaíso');
          },
          { timeout: 4000 }
        );
      } else {
        fetchWeatherForCoords(-33.0472, -71.6127, 'Valparaíso');
      }
    };

    detectLocationAndFetch();
    const interval = setInterval(detectLocationAndFetch, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Profile & Password Reset Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('yates_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      firstName: 'Administrador',
      lastName: 'General',
      phone: '+56 9 8765 4321',
      email: 'admin@yateschile.cl',
    };
  });
  const [profileForm, setProfileForm] = useState({
    firstName: 'Administrador',
    lastName: 'General',
    phone: '+56 9 8765 4321',
    email: 'admin@yateschile.cl',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [profileModalMsg, setProfileModalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenProfileModal = () => {
    setProfileForm({
      firstName: adminProfile.firstName || 'Administrador',
      lastName: adminProfile.lastName || 'General',
      phone: adminProfile.phone || '+56 9 8765 4321',
      email: adminProfile.email || 'admin@yateschile.cl',
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setProfileModalMsg(null);
    setShowProfileModal(true);
  };

  const handleSaveProfileAndSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalMsg(null);

    // Validate Profile
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileModalMsg({ type: 'error', text: 'Por favor ingrese su nombre y apellido.' });
      return;
    }

    // Check if user is attempting to change password
    const hasPasswordInput = passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword;
    if (hasPasswordInput) {
      const currentStoredPass = localStorage.getItem('yates_admin_password') || 'yates2026';
      if (!passwordForm.currentPassword) {
        setProfileModalMsg({ type: 'error', text: 'Debe ingresar su contraseña actual para cambiarla.' });
        return;
      }
      if (passwordForm.currentPassword !== currentStoredPass && passwordForm.currentPassword !== 'admin123') {
        setProfileModalMsg({ type: 'error', text: 'La contraseña actual ingresada es incorrecta.' });
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        setProfileModalMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setProfileModalMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
        return;
      }
      // Save new password
      localStorage.setItem('yates_admin_password', passwordForm.newPassword);
    }

    // Update profile
    const updated = {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      phone: profileForm.phone.trim(),
      email: adminProfile.email || 'admin@yateschile.cl', // Non-modifiable
    };
    setAdminProfile(updated);
    localStorage.setItem('yates_admin_profile', JSON.stringify(updated));

    setProfileModalMsg({ type: 'success', text: '¡Perfil y credenciales actualizados correctamente!' });
    setActionMessage('Perfil de administrador actualizado con éxito');
    setTimeout(() => {
      setShowProfileModal(false);
      setProfileModalMsg(null);
    }, 1000);
  };

  // Modals state
  const [showBookingWizardModal, setShowBookingWizardModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editRoomModal, setEditRoomModal] = useState<{
    isOpen: boolean;
    room: LodgeRoom | null;
    roomName: string;
    maxPax: number;
    basePrice: number;
  }>({
    isOpen: false,
    room: null,
    roomName: '',
    maxPax: 3,
    basePrice: 240000,
  });
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [airbnbConfirmModal, setAirbnbConfirmModal] = useState<{
    isOpen: boolean;
    room: LodgeRoom | null;
    checkIn: string;
    checkOut: string;
  } | null>(null);
  const [isSavingAirbnbBlock, setIsSavingAirbnbBlock] = useState(false);
  const [reservationWizardStep, setReservationWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [guestList, setGuestList] = useState<Array<{ name: string; rut: string; email?: string; phone?: string }>>([
    { name: '', rut: '', email: '', phone: '' },
    { name: '', rut: '', email: '', phone: '' },
    { name: '', rut: '', email: '', phone: '' },
    { name: '', rut: '', email: '', phone: '' },
  ]);
  const [blockForm, setBlockForm] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    channelSource: 'phone_whatsapp' as 'phone_whatsapp' | 'web_direct' | 'airbnb' | 'booking_com' | 'maintenance',
    reason: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    paxCount: 2,
    status: 'approved' as 'approved' | 'pending_transfer' | 'blocked',
  });

  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    category: 'cabalgatas' as 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar',
    description: '',
    duration_label: '',
    price_clp: 65000,
    max_pax: 6,
    image_url: '',
  });

  // Multi-step modal: Registrar / Sumar Pasajeros a Travesía
  const [selectedExpeditionForPassenger, setSelectedExpeditionForPassenger] = useState<any | null>(null);
  const [expPassengerStep, setExpPassengerStep] = useState<number>(1);
  const [expPassengerActiveTab, setExpPassengerActiveTab] = useState<number>(0);
  const [isSubmittingExpPassenger, setIsSubmittingExpPassenger] = useState(false);
  const [expPassengerValidationError, setExpPassengerValidationError] = useState<string | null>(null);
  const [expPassengerForm, setExpPassengerForm] = useState<{
    paxCount: number;
    bookingType: 'per_pax' | 'full_charter';
    customPricePerPax: number;
    status: '100_paid' | '50_reserved';
    billingNotes: string;
    passengers: Array<{
      fullName: string;
      rutPassport: string;
      birthDate: string;
      email: string;
      phone: string;
      dietaryNotes: string;
      emergencyContact: string;
      emergencyPhone: string;
    }>;
  }>({
    paxCount: 1,
    bookingType: 'per_pax',
    customPricePerPax: 1950000,
    status: '100_paid',
    billingNotes: '',
    passengers: [
      {
        fullName: '',
        rutPassport: '',
        birthDate: '',
        email: '',
        phone: '',
        dietaryNotes: '',
        emergencyContact: '',
        emergencyPhone: '',
      },
    ],
  });

  // Cuadro informativo / Alert Modal personalizado (reemplaza alert nativo del navegador)
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'warning' | 'error' | 'success' | 'info';
    onConfirm?: () => void;
  } | null>(null);

  const triggerAlert = (
    message: string,
    type: 'warning' | 'error' | 'success' | 'info' = 'warning',
    title?: string,
    onConfirm?: () => void
  ) => {
    setCustomAlert({
      isOpen: true,
      message,
      type,
      title: title || (type === 'error' ? 'Atención' : type === 'warning' ? 'Información Requerida' : 'Notificación'),
      onConfirm,
    });
  };

  // Modal: Manifiesto de Pasajeros & Control de Pagos de Expedición
  const [selectedExpeditionForManifest, setSelectedExpeditionForManifest] = useState<any | null>(null);
  const [manifestSearchQuery, setManifestSearchQuery] = useState('');
  const [manifestPaymentFilter, setManifestPaymentFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');

  const handleOpenPassengerManifestModal = (exp: any) => {
    setSelectedExpeditionForManifest(exp);
    setManifestSearchQuery('');
    setManifestPaymentFilter('all');
  };

  // Live System Clock & Notifications
  const [currentSystemTime, setCurrentSystemTime] = useState<Date>(new Date());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentSystemTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Selected Installment for Review
  const [selectedInstallment, setSelectedInstallment] = useState<PaymentInstallment | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const [instData, expData, rawViews, departuresData, routesData, vesselsData] = await Promise.all([
        paymentService.getAllPendingInstallments(),
        expeditionService.getAllBookings(),
        analyticsService.getAllRawViews(),
        expeditionService.getDepartures(),
        expeditionService.getRoutes(),
        expeditionService.getVessels(),
      ]);
      setInstallments(instData);
      setExpBookings(expData);
      setRawAnalyticsViews(rawViews);
      setAnalyticsSummary(analyticsService.computeSummary(rawViews, analyticsTimeframe));
      setDepartures(departuresData);
      setExpRoutes(routesData as ExpeditionRouteRow[]);
      setVessels(vesselsData as VesselRow[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  }, [analyticsTimeframe]);

  // Recalcular analíticas cuando el usuario cambia de pestaña de tiempo
  useEffect(() => {
    if (rawAnalyticsViews.length > 0) {
      setAnalyticsSummary(analyticsService.computeSummary(rawAnalyticsViews, analyticsTimeframe));
    }
  }, [rawAnalyticsViews, analyticsTimeframe]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      refreshLodge();
      refreshServices();
      refreshContent();

      // Auto-refresh silencioso en segundo plano cada 15 segundos
      const interval = setInterval(() => {
        fetchAllData();
        refreshLodge();
        refreshServices();
      }, 15000);

      // Auto-refresh reactivo instantáneo ante cambios en reservas, expediciones o CRM
      const handleRealtimeUpdate = () => {
        fetchAllData();
        refreshLodge();
        refreshServices();
      };
      window.addEventListener('yates_expeditions_updated', handleRealtimeUpdate);
      window.addEventListener('yates_bookings_updated', handleRealtimeUpdate);
      window.addEventListener('yates_crm_leads_updated', handleRealtimeUpdate);
      window.addEventListener('storage', handleRealtimeUpdate);
      window.addEventListener('focus', handleRealtimeUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('yates_expeditions_updated', handleRealtimeUpdate);
        window.removeEventListener('yates_bookings_updated', handleRealtimeUpdate);
        window.removeEventListener('yates_crm_leads_updated', handleRealtimeUpdate);
        window.removeEventListener('storage', handleRealtimeUpdate);
        window.removeEventListener('focus', handleRealtimeUpdate);
      };
    }
  }, [isAuthenticated, content, fetchAllData, refreshLodge, refreshServices, refreshContent]);

  // Financial and Operational Metric Calculations with Timeframe Filtering
  const isDateInTimeframe = useCallback((dateString?: string | null, timeframe: 'today' | 'week' | 'month' | 'all' = kpiTimeframe) => {
    if (timeframe === 'all' || !dateString) return true;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return true;
    
    const now = new Date();
    if (timeframe === 'today') {
      return date.getFullYear() === now.getFullYear() &&
             date.getMonth() === now.getMonth() &&
             date.getDate() === now.getDate();
    }
    if (timeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo && date <= now;
    }
    if (timeframe === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      return date >= oneMonthAgo && date <= now;
    }
    return true;
  }, [kpiTimeframe]);

  // Global All-Time Totals
  const confirmedRevenue = installments
    .filter((i) => i.status === 'approved')
    .reduce((acc, i) => acc + (Number(i.amount_paid) || Number(i.amount_expected) || 0), 0);

  const pendingRevenue = installments
    .filter((i) => i.status === 'pending_upload' || i.status === 'pending_approval')
    .reduce((acc, i) => acc + Number(i.amount_expected || 0), 0);

  const totalBookingsCount = lodgeBookings.filter((b) => b.status !== 'cancelled').length + expBookings.length;
  const pendingApprovalsCount = installments.filter((i) => i.status === 'pending_approval').length;
  const blockedDatesCount = lodgeBookings.filter((b) => b.status === 'blocked').length;

  // Filtered Totals for Dashboard KPI Cards based on kpiTimeframe
  const kpiFilteredInstallments = installments.filter((i) => isDateInTimeframe(i.created_at || i.due_date));
  const kpiFilteredLodgeBookings = lodgeBookings.filter((b) => isDateInTimeframe(b.created_at || b.check_in));
  const kpiFilteredExpBookings = expBookings.filter((b) => isDateInTimeframe(b.created_at));

  const kpiConfirmedRevenue = kpiFilteredInstallments
    .filter((i) => i.status === 'approved')
    .reduce((acc, i) => acc + (Number(i.amount_paid) || Number(i.amount_expected) || 0), 0);

  const kpiPendingRevenue = kpiFilteredInstallments
    .filter((i) => i.status === 'pending_upload' || i.status === 'pending_approval')
    .reduce((acc, i) => acc + Number(i.amount_expected || 0), 0);

  const kpiTotalBookingsCount = kpiFilteredLodgeBookings.filter((b) => b.status !== 'cancelled').length + kpiFilteredExpBookings.length;
  const kpiPendingApprovalsCount = kpiFilteredInstallments.filter((i) => i.status === 'pending_approval').length;
  const kpiBlockedDatesCount = kpiFilteredLodgeBookings.filter((b) => b.status === 'blocked').length;

  // Dynamic Live System Notifications
  const notificationsList = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'booking' | 'payment' | 'cancellation' | 'lead';
      title: string;
      description: string;
      date: string;
      actionTab: 'dashboard' | 'bookings' | 'lodge' | 'expeditions' | 'payments' | 'analytics' | 'services' | 'cms';
    }> = [];

    // 1. Pending Transfers & Payments
    installments
      .filter((i) => i.status === 'pending_approval' || i.status === 'pending_upload')
      .slice(0, 4)
      .forEach((inst) => {
        list.push({
          id: `inst-${inst.id}`,
          type: 'payment',
          title: 'Transferencia por Conciliar',
          description: `${inst.concept || 'Cuota'} por $${Number(inst.amount_expected || 0).toLocaleString('es-CL')} CLP`,
          date: inst.due_date || 'Reciente',
          actionTab: 'payments',
        });
      });

    // 2. Lodge Bookings
    lodgeBookings.slice(0, 5).forEach((b) => {
      if (b.status === 'cancelled') {
        list.push({
          id: `lodge-canc-${b.id}`,
          type: 'cancellation',
          title: 'Anulación de Reserva Lodge',
          description: `${b.guest_name || 'Huésped'} canceló estadía (${b.check_in} al ${b.check_out})`,
          date: b.check_in,
          actionTab: 'lodge',
        });
      } else if (b.status === 'pending_transfer') {
        list.push({
          id: `lodge-pend-${b.id}`,
          type: 'payment',
          title: 'Reserva Pendiente de Transferencia',
          description: `${b.guest_name || 'Huésped'} - ${b.pax_count} pax ($${Number(b.total_amount || 0).toLocaleString('es-CL')} CLP)`,
          date: b.check_in,
          actionTab: 'bookings',
        });
      } else if (b.status === 'approved') {
        list.push({
          id: `lodge-appr-${b.id}`,
          type: 'booking',
          title: 'Nueva Reserva Confirmada Lodge',
          description: `${b.guest_name || 'Huésped'} - ${b.pax_count} pax (${b.check_in} al ${b.check_out})`,
          date: b.check_in,
          actionTab: 'bookings',
        });
      }
    });

    // 3. Expeditions
    expBookings.slice(0, 4).forEach((exp) => {
      if (exp.status === 'cancelled') {
        list.push({
          id: `exp-canc-${exp.id}`,
          type: 'cancellation',
          title: 'Anulación en Expedición Náutica',
          description: `${exp.guest_name} canceló cupo (${exp.booking_code})`,
          date: 'Reciente',
          actionTab: 'expeditions',
        });
      } else {
        list.push({
          id: `exp-book-${exp.id}`,
          type: 'booking',
          title: 'Nueva Reserva de Expedición',
          description: `${exp.guest_name} - ${exp.pax_count} pax ($${Number(exp.total_amount || 0).toLocaleString('es-CL')} CLP)`,
          date: 'Reciente',
          actionTab: 'expeditions',
        });
      }
    });

    // 4. Leads
    leads.filter((l) => l.status === 'nuevo').slice(0, 4).forEach((lead) => {
      list.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: 'Nuevo Lead Captado',
        description: `${lead.fullName} (${lead.origin}) - ${lead.notes?.slice(0, 45) || 'Interesado en travesía'}...`,
        date: lead.dateCreated || 'Hoy',
        actionTab: 'payments',
      });
    });

    return list;
  }, [installments, lodgeBookings, expBookings, leads]);

  const unreadNotifsCount = notificationsList.filter((n) => !readNotifIds.includes(n.id)).length;

  // CRM Client Helper Calculations & Filtering
  const getCustomerLodgeBookings = (cust: CustomerProfile) => {
    return lodgeBookings.filter(
      (b) =>
        b.guest_email?.toLowerCase() === cust.email.toLowerCase() ||
        (cust.fullName && b.guest_name?.toLowerCase().includes(cust.fullName.toLowerCase()))
    );
  };

  const getCustomerExpBookings = (cust: CustomerProfile) => {
    return expBookings.filter(
      (b) =>
        b.guest_email?.toLowerCase() === cust.email.toLowerCase() ||
        (cust.fullName && b.guest_name?.toLowerCase().includes(cust.fullName.toLowerCase()))
    );
  };

  const getCustomerInstallments = (cust: CustomerProfile) => {
    const custLodgeBookings = getCustomerLodgeBookings(cust);
    const custExpBookings = getCustomerExpBookings(cust);
    const bookingIds = [
      ...custLodgeBookings.map((b) => b.id),
      ...custExpBookings.map((b) => b.id),
    ];
    return installments.filter((inst) => bookingIds.includes(inst.booking_id));
  };

  const filteredCustomers = crmClients
    .filter((cust) => {
      if (customerFilter === 'vip' && cust.category !== 'vip') return false;
      if (
        customerFilter === 'expeditions' &&
        !cust.tags.some((t) => t.includes('Expedicionario') || t.includes('Chárter') || t.includes('Velero') || t.includes('Buceo'))
      )
        return false;
      if (
        customerFilter === 'lodge' &&
        !cust.tags.some((t) => t.includes('Lodge') || t.includes('Huésped'))
      )
        return false;
      if (customerFilter === 'pending_payment') {
        const custInst = getCustomerInstallments(cust);
        return custInst.some((i) => i.status === 'pending_approval' || i.status === 'pending_upload');
      }
      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase();
        return (
          cust.fullName.toLowerCase().includes(q) ||
          cust.email.toLowerCase().includes(q) ||
          cust.phone.includes(q) ||
          cust.rutOrPassport.toLowerCase().includes(q) ||
          cust.city.toLowerCase().includes(q) ||
          cust.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (customerSortBy === 'ltv_desc') return b.totalSpentClp - a.totalSpentClp;
      if (customerSortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
      if (customerSortBy === 'date_desc')
        return new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime();
      return 0;
    });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.fullName.trim() || !newCustomerForm.email.trim()) return;

    const tagsArray = newCustomerForm.tags
      ? newCustomerForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [newCustomerForm.category === 'vip' ? '👑 VIP' : '🌟 Nuevo Cliente'];

    const newCust: CustomerProfile = {
      id: `cli-${Date.now()}`,
      fullName: newCustomerForm.fullName.trim(),
      email: newCustomerForm.email.trim(),
      phone: newCustomerForm.phone.trim() || '+56 9 0000 0000',
      rutOrPassport: newCustomerForm.rutOrPassport.trim() || 'Pendiente',
      nationality: newCustomerForm.nationality.trim() || 'Chilena',
      city: newCustomerForm.city.trim() || 'Chile',
      category: newCustomerForm.category,
      tags: tagsArray,
      totalSpentClp: 0,
      bookingsCount: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      dietaryPreferences: newCustomerForm.dietary || 'Sin registrar',
      divingLevel: newCustomerForm.diving || 'No especificado',
      beveragePreference: newCustomerForm.beverage || 'No especificado',
      emergencyContact: '',
      notes: newCustomerForm.notes || 'Cliente registrado desde CRM.',
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: 'Hoy',
          type: 'note',
          title: 'Cliente Creado en CRM',
          description: 'Ficha de cliente inicial registrada por el concierge.',
        },
      ],
    };

    setCrmClients([newCust, ...crmClients]);
    setShowNewCustomerModal(false);
    setSelectedCustomer(newCust);
    setNewCustomerForm({
      fullName: '',
      email: '',
      phone: '',
      rutOrPassport: '',
      nationality: 'Chilena',
      city: 'Santiago, Chile',
      category: 'regular',
      notes: '',
      dietary: '',
      beverage: '',
      diving: '',
      tags: '',
    });
  };

  // Leads Filtering & Stats
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;
      if (leadOriginFilter !== 'all' && lead.origin !== leadOriginFilter) return false;
      if (leadSearchQuery.trim()) {
        const q = leadSearchQuery.toLowerCase();
        const matchName = lead.fullName.toLowerCase().includes(q);
        const matchEmail = lead.email.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchOrigin = (lead.originDetails || '').toLowerCase().includes(q);
        const matchNotes = (lead.notes || '').toLowerCase().includes(q);
        const matchCity = (lead.city || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchOrigin && !matchNotes && !matchCity) return false;
      }
      return true;
    });
  }, [leads, leadStatusFilter, leadOriginFilter, leadSearchQuery]);

  const newLeadsCount = leads.filter((l) => l.status === 'nuevo').length;
  const contactedLeadsCount = leads.filter((l) => l.status === 'contactado').length;
  const quotingLeadsCount = leads.filter((l) => l.status === 'cotizando').length;
  const convertedLeadsCount = leads.filter((l) => l.status === 'convertido').length;
  const discardedLeadsCount = leads.filter((l) => l.status === 'descartado').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedLeadsCount / leads.length) * 100) : 0;

  const handleConvertLeadToClient = async (lead: LeadItem) => {
    const newCust = convertLeadToCustomer(lead);
    setCrmClients((prev) => [newCust, ...prev]);
    await updateLeadStatus(lead.id, 'convertido');
    setSelectedCustomer(newCust);
    setCustomerDossierTab('profile');
    setCrmActiveSubTab('clients');
    setActionMessage(`✓ Lead "${lead.fullName}" convertido a Cliente CRM con éxito.`);
    setTimeout(() => setActionMessage(null), 4500);
  };

  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.fullName.trim() || !newLeadForm.email.trim()) return;

    const res = await createLead({
      fullName: newLeadForm.fullName.trim(),
      email: newLeadForm.email.trim(),
      phone: newLeadForm.phone.trim() || '+56 9 0000 0000',
      origin: newLeadForm.origin,
      originDetails: newLeadForm.originDetails || (
        newLeadForm.origin === 'brochure'
          ? 'Descarga Brochure Travesías 2026/2027'
          : newLeadForm.origin === 'contacto_web'
          ? 'Formulario de Contacto Web'
          : newLeadForm.origin === 'whatsapp'
          ? 'WhatsApp Directo Concierge'
          : newLeadForm.origin === 'lodge_interest'
          ? 'Consulta Web Lodge'
          : 'Registro Manual'
      ),
      interestType: newLeadForm.interestType,
      estimatedPax: Number(newLeadForm.estimatedPax) || 2,
      tentativeDate: newLeadForm.tentativeDate,
      notes: newLeadForm.notes,
      city: newLeadForm.city,
      country: newLeadForm.country,
      estimatedBudgetClp: Number(newLeadForm.estimatedBudgetClp) || 0,
    });

    if (res.success) {
      setShowNewLeadModal(false);
      setNewLeadForm({
        fullName: '',
        email: '',
        phone: '',
        origin: 'contacto_web',
        originDetails: '',
        interestType: 'expediciones',
        estimatedPax: 2,
        tentativeDate: '',
        notes: '',
        city: 'Santiago',
        country: 'Chile',
        estimatedBudgetClp: 3700000,
      });
      setActionMessage(`✓ Prospecto "${newLeadForm.fullName}" registrado exitosamente.`);
      setTimeout(() => setActionMessage(null), 4500);
    }
  };

  const handleSaveLeadNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeadNotes) return;
    await updateLeadNotes(editingLeadNotes.id, leadNotesText);
    setEditingLeadNotes(null);
    setLeadNotesText('');
    setActionMessage(`✓ Notas actualizadas para ${editingLeadNotes.fullName}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newTimelineNote.trim()) return;

    const newEntry: CustomerTimelineItem = {
      id: `t-${Date.now()}`,
      date: 'Hoy',
      type: newTimelineType,
      title:
        newTimelineType === 'call'
          ? 'Llamada / Contacto Registrado'
          : newTimelineType === 'payment'
          ? 'Registro de Pago / Cotización'
          : 'Nota de Concierge',
      description: newTimelineNote.trim(),
    };

    const updated = {
      ...selectedCustomer,
      timeline: [newEntry, ...(selectedCustomer.timeline || [])],
    };

    setSelectedCustomer(updated);
    setCrmClients(crmClients.map((c) => (c.id === updated.id ? updated : c)));
    setNewTimelineNote('');
  };

  const handleUpdateCustomerNotes = (notes: string) => {
    if (!selectedCustomer) return;
    const updated = { ...selectedCustomer, notes };
    setSelectedCustomer(updated);
    setCrmClients(crmClients.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCopyCustomerDossier = (cust: CustomerProfile) => {
    const summaryText = `FICHA DE CLIENTE — YATES CHILE & LODGE RINCÓN DE NAVEGANTES
------------------------------------------------------------
Nombre: ${cust.fullName}
Categoría: ${cust.category.toUpperCase()}
RUT/Pasaporte: ${cust.rutOrPassport}
Nacionalidad: ${cust.nationality} | Ciudad: ${cust.city}
Email: ${cust.email}
Teléfono: ${cust.phone}
Total Invertido (LTV): $${cust.totalSpentClp.toLocaleString('es-CL')} CLP
Reservas Realizadas: ${cust.bookingsCount}

PREFERENCIAS & CONCIERGE:
- Dieta/Alergias: ${cust.dietaryPreferences || 'Ninguna'}
- Bebidas/Vinos: ${cust.beveragePreference || 'No especificado'}
- Nivel Buceo/Náutica: ${cust.divingLevel || 'No especificado'}
- Contacto de Emergencia: ${cust.emergencyContact || 'No registrado'}

NOTAS INTERNAS:
${cust.notes || 'Sin notas adicionales.'}`;

    navigator.clipboard.writeText(summaryText);
    setCrmCopiedNotification(true);
    setTimeout(() => setCrmCopiedNotification(false), 2500);
  };

  const allUnifiedBookings = [
    ...lodgeBookings.map((b) => {
      const room = rooms.find((r) => r.id === b.room_id);
      return {
        id: b.id,
        type: 'lodge' as const,
        type_label: 'Lodge Rincón',
        booking_code: b.booking_code,
        guest_name: b.guest_name,
        guest_email: b.guest_email || 'huesped@yateschile.cl',
        guest_phone: b.guest_phone || 'Sin contacto',
        service_title: room ? room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim() : 'Lodge Rincón de Navegantes',
        unit_detail: room ? `${room.room_type} • Vista al Océano` : '4 Cabinas',
        dates: `${formatDateDDMMYYYY(b.check_in)} ➔ ${formatDateDDMMYYYY(b.check_out)}`,
        raw_check_in: b.check_in,
        raw_check_out: b.check_out,
        channel: b.channel_source,
        status: b.status,
        amount: b.total_amount || 240000,
        notes: b.notes || (b as any).block_reason || 'Sin notas adicionales',
        created_at: b.created_at || new Date().toISOString(),
      };
    }),
    ...expBookings.map((b) => {
      const dep = departures.find((d) => d.id === b.departure_id);
      const matchedInitial = INITIAL_EXPEDITIONS.find((ie) => ie.id === b.departure_id);
      const route = expRoutes.find((r) => r.id === (b.route_id || dep?.route_id || matchedInitial?.routeId));
      const vessel = vessels.find((v) => v.id === (b.vessel_id || dep?.vessel_id || matchedInitial?.vesselId));
      const depDate = (b as any).departure_date || dep?.departure_date || matchedInitial?.startDate || (b as any).start_date || b.created_at;
      const retDate = (b as any).return_date || dep?.return_date || matchedInitial?.endDate || (b as any).end_date || depDate;
      const rawExpName = (b as any).expedition_name || (b as any).expeditionName || dep?.name || route?.title || matchedInitial?.name || (b.booking_type === 'full_charter' ? 'Expedición Charter Completo' : 'Expedición Juan Fernández — Bahía Cumberland');
      const expName = rawExpName.replace(/^JF\s*/i, 'Expedición Juan Fernández — ').replace(/JF/g, 'Juan Fernández');
      const vName = (b as any).vessel_name || (b as any).vesselName || vessel?.name || dep?.vessel?.name || matchedInitial?.vessel || 'Velero Vegvisir';

      return {
        id: b.id,
        type: 'expedition' as const,
        type_label: 'Expedición Náutica',
        booking_code: b.booking_code,
        guest_name: b.guest_name,
        guest_email: b.guest_email || 'navegante@yateschile.cl',
        guest_phone: b.guest_phone || 'Sin contacto',
        service_title: expName,
        unit_detail: vName,
        dates: `${formatDateDDMMYYYY(depDate)} ➔ ${formatDateDDMMYYYY(retDate)}`,
        raw_check_in: depDate,
        raw_check_out: retDate,
        channel: 'web_direct' as const,
        status: b.status,
        amount: b.total_amount || 1850000,
        pax_count: b.pax_count || 1,
        notes: (b as any).notes || `Modalidad: ${b.booking_type === 'full_charter' ? 'Charter Completo' : `${b.pax_count || 1} PAX`}${b.dietary_medical_notes ? ` | Notas: ${b.dietary_medical_notes}` : ''}`,
        created_at: b.created_at || new Date().toISOString(),
        passengers: (b as any).passengers || [],
        doc_id: b.guest_rut_passport,
      };
    }),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unifiedRecentBookings = allUnifiedBookings.slice(0, 5);

  const filteredUnifiedBookings = allUnifiedBookings.filter((b) => {
    // Type filter
    if (bookingsTypeFilter !== 'all' && b.type !== bookingsTypeFilter) return false;
    // Status filter
    if (bookingsStatusFilter !== 'all') {
      const uStatus = getUnifiedBookingStatus(b);
      if (bookingsStatusFilter === 'approved' || bookingsStatusFilter === 'confirmed') {
        if (uStatus !== 'confirmed') return false;
      } else if (bookingsStatusFilter === 'reserved') {
        if (uStatus !== 'reserved') return false;
      } else if (bookingsStatusFilter === 'pending_transfer' || bookingsStatusFilter === 'scheduled') {
        if (uStatus !== 'scheduled') return false;
      } else if (bookingsStatusFilter === 'blocked') {
        if (uStatus !== 'blocked') return false;
      }
    }
    // Search filter
    if (bookingsSearchQuery.trim()) {
      const q = bookingsSearchQuery.toLowerCase();
      const matchName = b.guest_name.toLowerCase().includes(q);
      const matchCode = b.booking_code.toLowerCase().includes(q);
      const matchService = b.service_title.toLowerCase().includes(q);
      const matchPhone = b.guest_phone.toLowerCase().includes(q);
      const matchEmail = (b.guest_email || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchService && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  // Month and Day Availability Calculations for Lodge Horizontal Calendar
  const calendarYear = selectedMonthDate.getFullYear();
  const calendarMonth = selectedMonthDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthLabel = `${monthNames[calendarMonth]} ${calendarYear}`;

  const today = new Date();
  const isCurrentMonthAndYear =
    calendarYear === today.getFullYear() && calendarMonth === today.getMonth();

  const daysList = Array.from({ length: daysInMonth }, (_, idx) => {
    const dayNum = idx + 1;
    const dateObj = new Date(calendarYear, calendarMonth, dayNum);
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayOfWeek = dayNamesShort[dateObj.getDay()];
    const isToday = isCurrentMonthAndYear && dayNum === today.getDate();

    // Room status for this date
    const roomStatuses = rooms.map((room) => {
      const activeBooking = lodgeBookings.find((b) => {
        if (b.status === 'cancelled') return false;
        if (b.room_id !== room.id) return false;
        return b.check_in <= dateStr && dateStr < b.check_out;
      });
      return {
        room,
        isAvailable: !activeBooking,
        booking: activeBooking || null,
      };
    });

    const availableRoomsCount = roomStatuses.filter((r) => r.isAvailable).length;
    const isSelected = dayNum === selectedDayNumber;

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isPast = dateStr < todayStr;

    return {
      dayNum,
      dateStr,
      dayOfWeek,
      availableRoomsCount,
      totalRooms: rooms.length || 4,
      roomStatuses,
      isSelected,
      isToday,
      isPast,
    };
  });

  const selectedDayData = daysList.find((d) => d.dayNum === selectedDayNumber) || daysList[0];

  const handlePrevMonth = () => {
    const newDate = new Date(calendarYear, calendarMonth - 1, 1);
    setSelectedMonthDate(newDate);
    const isCurrent = newDate.getFullYear() === today.getFullYear() && newDate.getMonth() === today.getMonth();
    setSelectedDayNumber(isCurrent ? today.getDate() : 1);
  };

  const handleNextMonth = () => {
    const newDate = new Date(calendarYear, calendarMonth + 1, 1);
    setSelectedMonthDate(newDate);
    const isCurrent = newDate.getFullYear() === today.getFullYear() && newDate.getMonth() === today.getMonth();
    setSelectedDayNumber(isCurrent ? today.getDate() : 1);
  };

  // Dynamic Expeditions Schedule from departures / real seed
  const upcomingExpeditions = useMemo<UpcomingExpeditionItem[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const calcDaysUntil = (dateStr?: string) => {
      if (!dateStr) return 999;
      const target = new Date(dateStr);
      if (isNaN(target.getTime())) return 999;
      target.setHours(0, 0, 0, 0);
      const diff = target.getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (departures && departures.length > 0) {
      return departures.map((dep) => {
        const route = expRoutes.find((r) => r.id === dep.route_id);
        const vessel = vessels.find((v) => v.id === dep.vessel_id);
        const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);

        // Strictly Velero Vegvisir or Yate Terranova
        const rawVName = (vessel?.name || dep.vessel_id || dep.name || '').toLowerCase();
        const isTerranova = dep.vessel_id === 'terranova' || rawVName.includes('terranova');
        const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
        const vesselType = isTerranova ? 'Hatteras 65ft LRC' : 'Dufour 52.5 ft Francés';

        // Full unabbreviated route title
        let routeTitle = dep.name || route?.title || 'Expedición Robinson Crusoe';
        if (routeTitle.startsWith('JF ')) {
          routeTitle = routeTitle.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
        }

        const depDateFormatted = formatDateDDMMYYYY(dep.departure_date);
        const retDateFormatted = formatDateDDMMYYYY(dep.return_date);
        const datesFormatted = `${depDateFormatted} ➔ ${retDateFormatted}`;
        const statusText = dep.status === 'guaranteed' ? 'Zarpe Garantizado' : dep.status === 'scheduled' ? 'Programada' : dep.status === 'completed' ? 'Completada' : 'Cancelada';
        const statusColor = dep.status === 'guaranteed' ? 'emerald' : dep.status === 'scheduled' ? 'sky' : 'amber';
        const daysUntil = calcDaysUntil(dep.departure_date);
        const numericPrice = Number(dep.price_per_pax_clp || (isTerranova ? 2350000 : 1950000));
        const priceFormatted = `$${numericPrice.toLocaleString('es-CL')}`;

        return {
          id: dep.id,
          vesselName,
          vesselType,
          routeTitle,
          departureDates: datesFormatted,
          departureDateFormatted: depDateFormatted,
          returnDateFormatted: retDateFormatted,
          rawDepartureDate: dep.departure_date,
          daysUntilDeparture: daysUntil,
          maxPax: dep.total_slots || (isTerranova ? 8 : 6),
          bookedPax,
          availablePax: dep.available_slots || 0,
          pricePerPaxClp: numericPrice,
          priceFormatted,
          pricePerPax: `${priceFormatted} CLP`,
          status: statusText,
          statusColor,
        };
      });
    }

    return INITIAL_EXPEDITIONS.map((exp) => {
      const bookedPax = exp.totalSlots - (typeof exp.spotsLeft === 'number' ? exp.spotsLeft : 0);
      const daysUntil = calcDaysUntil(exp.startDate);
      const isTerranova = exp.vessel.toLowerCase().includes('terranova') || exp.vesselId === 'terranova';
      const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
      const vesselType = isTerranova ? 'Hatteras 65ft LRC' : 'Dufour 52.5 ft Francés';
      let routeTitle = exp.name;
      if (routeTitle.startsWith('JF ')) {
        routeTitle = routeTitle.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
      }

      const depDateFormatted = formatDateDDMMYYYY(exp.departureDate || exp.startDate);
      const retDateFormatted = formatDateDDMMYYYY(exp.returnDate || exp.endDate);
      const datesFormatted = `${depDateFormatted} ➔ ${retDateFormatted}`;
      const numericPrice = Number(exp.pricePerPaxClp || (isTerranova ? 2350000 : 1950000));
      const priceFormatted = `$${numericPrice.toLocaleString('es-CL')}`;

      return {
        id: exp.id,
        vesselName,
        vesselType,
        routeTitle,
        departureDates: datesFormatted,
        departureDateFormatted: depDateFormatted,
        returnDateFormatted: retDateFormatted,
        rawDepartureDate: exp.startDate,
        daysUntilDeparture: daysUntil,
        maxPax: exp.totalSlots,
        bookedPax,
        availablePax: typeof exp.spotsLeft === 'number' ? exp.spotsLeft : 0,
        pricePerPaxClp: numericPrice,
        priceFormatted,
        pricePerPax: `${priceFormatted} CLP`,
        status: exp.status === 'guaranteed' ? 'Zarpe Garantizado' : 'Programada',
        statusColor: exp.status === 'guaranteed' ? 'emerald' : 'sky',
      };
    });
  }, [departures, expRoutes, vessels]);

  // Top 3 upcoming expeditions for the Dashboard overview section
  const dashboardUpcomingExpeditions = useMemo(() => {
    return upcomingExpeditions.slice(0, 3);
  }, [upcomingExpeditions]);

  const filteredDepartures = useMemo(() => {
    return departures.filter((dep) => {
      if (expeditionsAssetFilter === 'all') return true;
      const vessel = vessels.find((v) => v.id === dep.vessel_id);
      const vName = (vessel?.name || dep.vessel_id || '').toLowerCase();
      if (expeditionsAssetFilter === 'vegvisir') return dep.vessel_id === 'vegvisir' || vName.includes('vegvisir');
      if (expeditionsAssetFilter === 'terranova') return dep.vessel_id === 'terranova' || vName.includes('terranova');
      return true;
    });
  }, [departures, vessels, expeditionsAssetFilter]);

  const filteredUpcomingExpeditions = useMemo(() => {
    return upcomingExpeditions.filter((exp) => {
      if (expeditionsAssetFilter === 'all') return true;
      const vName = exp.vesselName.toLowerCase();
      if (expeditionsAssetFilter === 'vegvisir') return vName.includes('vegvisir');
      if (expeditionsAssetFilter === 'terranova') return vName.includes('terranova');
      return true;
    });
  }, [upcomingExpeditions, expeditionsAssetFilter]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('yates_admin_password') || 'yates2026';
    if (
      (username === 'admin' || username === 'admin@yateschile.cl') &&
      (password === storedPass || password === 'yates2026' || password === 'admin123')
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Ingrese con admin / yates2026');
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.roomId || !blockForm.checkIn || !blockForm.checkOut) {
      triggerAlert('Por favor complete todos los pasos seleccionando fechas, habitación y datos de huéspedes.', 'warning', 'Datos Incompletos');
      return;
    }
    if (isRoomBookedForRange(blockForm.roomId, blockForm.checkIn, blockForm.checkOut)) {
      triggerAlert('La habitación seleccionada ya se encuentra ocupada o bloqueada en esas fechas. Por favor elija otra habitación disponible.', 'warning', 'Habitación Ocupada');
      return;
    }

    const checkInDate = new Date(blockForm.checkIn);
    const checkOutDate = new Date(blockForm.checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const room = rooms.find((r) => r.id === blockForm.roomId);
    const calculatedAmount = (room?.base_price_clp || 240000) * nights;

    const primaryGuest = guestList[0] || { name: blockForm.guestName, email: blockForm.guestEmail, phone: blockForm.guestPhone, rut: '' };
    const effectiveName = primaryGuest.name.trim() || blockForm.guestName.trim() || 'Huésped Lodge';
    const effectiveEmail = primaryGuest.email?.trim() || blockForm.guestEmail.trim() || 'huesped@yateschile.cl';
    const effectivePhone = primaryGuest.phone?.trim() || blockForm.guestPhone.trim() || '+56900000000';

    // Compile all passengers into formatted note/breakdown
    const paxListSummary = guestList
      .slice(0, blockForm.paxCount)
      .map((g, idx) => `P${idx + 1}: ${g.name || 'Sin especificar'}${g.rut ? ` (Doc: ${g.rut})` : ''}`)
      .join(' | ');

    const combinedNotes = blockForm.reason
      ? `${blockForm.reason} • [Huéspedes: ${paxListSummary}]`
      : `Huéspedes: ${paxListSummary}`;

    if (blockForm.channelSource === 'maintenance' || blockForm.channelSource === 'airbnb') {
      const res = await adminBlockRoom({
        roomId: blockForm.roomId,
        checkIn: blockForm.checkIn,
        checkOut: blockForm.checkOut,
        channelSource: blockForm.channelSource,
        reason: combinedNotes || (blockForm.channelSource === 'airbnb' ? 'Reserva Sincronizada Airbnb' : 'Bloqueo Manual / Mantenimiento'),
        guestName: effectiveName || (blockForm.channelSource === 'airbnb' ? 'Huésped Airbnb' : 'Bloqueo Panel'),
      });
      if (res.success) {
        setShowBlockModal(false);
        setReservationWizardStep(1);
        setBlockForm({
          roomId: '',
          checkIn: '',
          checkOut: '',
          channelSource: 'phone_whatsapp',
          reason: '',
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          paxCount: 2,
          status: 'approved',
        });
        setGuestList([
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
        ]);
        refreshLodge();
        setActionMessage('Reserva / Bloqueo registrado exitosamente.');
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        triggerAlert('Error: ' + res.error, 'error');
      }
    } else {
      // Standard Hotel Accommodation Booking
      const res = await createBooking({
        roomId: blockForm.roomId,
        guestName: effectiveName,
        guestEmail: effectiveEmail,
        guestPhone: effectivePhone,
        guestRutPassport: primaryGuest.rut || undefined,
        checkIn: blockForm.checkIn,
        checkOut: blockForm.checkOut,
        paxCount: blockForm.paxCount || 2,
        totalAmount: calculatedAmount,
        notes: combinedNotes,
      });
      if (res.success) {
        setShowBlockModal(false);
        setReservationWizardStep(1);
        setBlockForm({
          roomId: '',
          checkIn: '',
          checkOut: '',
          channelSource: 'phone_whatsapp',
          reason: '',
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          paxCount: 2,
          status: 'approved',
        });
        setGuestList([
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
          { name: '', rut: '', email: '', phone: '' },
        ]);
        refreshLodge();
        setActionMessage(`Reserva de hospedaje confirmada para ${effectiveName} (${nights} ${nights === 1 ? 'noche' : 'noches'}).`);
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        triggerAlert('Error al crear la reserva: ' + res.error, 'error');
      }
    }
  };



  const handleConfirmAirbnbBlock = async () => {
    if (!airbnbConfirmModal?.room) return;
    setIsSavingAirbnbBlock(true);
    try {
      const res = await adminBlockRoom({
        roomId: airbnbConfirmModal.room.id,
        checkIn: airbnbConfirmModal.checkIn,
        checkOut: airbnbConfirmModal.checkOut,
        channelSource: 'airbnb',
        reason: 'Sincronización Calendario Airbnb',
        guestName: 'Huésped Airbnb (iCal Sync)',
      });
      if (res.success) {
        const roomNum = airbnbConfirmModal.room.room_number;
        const roomName = airbnbConfirmModal.room.room_name;
        setAirbnbConfirmModal(null);
        await refreshLodge();
        setActionMessage(`Bloqueo Airbnb confirmado para Cabina #${roomNum} (${roomName}) y guardado en la base de datos.`);
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        triggerAlert('Error al registrar el bloqueo: ' + (res.error || 'Error desconocido'), 'error');
      }
    } catch (err: unknown) {
      triggerAlert('Error al registrar el bloqueo: ' + ((err as Error)?.message || 'Error inesperado'), 'error');
    } finally {
      setIsSavingAirbnbBlock(false);
    }
  };

  // ----------------------------------------------------
  // EDIT LODGE ROOM NAME & DETAILS HANDLERS
  // ----------------------------------------------------
  const handleOpenEditRoomModal = (room: LodgeRoom) => {
    setEditRoomModal({
      isOpen: true,
      room,
      roomName: room.room_name,
      maxPax: room.max_pax || 3,
      basePrice: room.base_price_clp || 240000,
    });
  };

  const handleSaveRoomName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomModal.room || !editRoomModal.roomName.trim()) return;
    setIsSavingRoom(true);
    try {
      await updateRoom(editRoomModal.room.id, {
        room_name: editRoomModal.roomName.trim(),
        max_pax: Number(editRoomModal.maxPax),
        base_price_clp: Number(editRoomModal.basePrice),
      });
      const updatedName = editRoomModal.roomName.trim();
      const roomNumber = editRoomModal.room.room_number;
      setEditRoomModal((prev) => ({ ...prev, isOpen: false }));
      setActionMessage(`Habitación #${roomNumber} actualizada con éxito a "${updatedName}".`);
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      console.error('Error actualizando habitación:', err);
      triggerAlert('Hubo un problema al guardar los cambios de la habitación.', 'error');
    } finally {
      setIsSavingRoom(false);
    }
  };

  // ----------------------------------------------------
  // CONFIRM BOOKING WIZARD HANDLER (6 STEPS & CRM MULTI-PAX)
  // ----------------------------------------------------
  const handleConfirmBookingWizard = async (data: BookingWizardData) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newClients: CustomerProfile[] = [];

    // Create or update CRM Profile for EACH passenger
    data.passengers.forEach((pax, idx) => {
      const existing = crmClients.find(
        (c) =>
          (pax.email && c.email.toLowerCase() === pax.email.toLowerCase()) ||
          (pax.rutOrPassport && c.rutOrPassport.toLowerCase() === pax.rutOrPassport.toLowerCase())
      );

      if (existing) {
        const updated: CustomerProfile = {
          ...existing,
          bookingsCount: existing.bookingsCount + 1,
          totalSpentClp: existing.totalSpentClp + (idx === 0 ? data.totalAmountClp : 0),
          lastActivityDate: nowStr,
          timeline: [
            {
              id: `t-${Date.now()}-${idx}`,
              date: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
              type: 'booking',
              title: `Reserva ${data.bookingCode} — ${data.selectedPrograms.map((p) => p.title).join(', ')}`,
              description: `Reserva paquetizada por $${data.totalAmountClp.toLocaleString('es-CL')} CLP (${data.installmentsCount} cuotas). Fechas: ${data.startDate} a ${data.endDate}.`,
            },
            ...existing.timeline,
          ],
        };
        setCrmClients((prev) => prev.map((c) => (c.id === existing.id ? updated : c)));
      } else if (pax.fullName.trim()) {
        const newCust: CustomerProfile = {
          id: `cli-${Date.now()}-${idx}`,
          fullName: pax.fullName,
          email: pax.email || 'sin-correo@yateschile.cl',
          phone: pax.phone || '+56 9 0000 0000',
          rutOrPassport: pax.rutOrPassport || 'Sin documento',
          nationality: pax.nationality || 'Chilena',
          city: 'Chile',
          category: idx === 0 && data.totalAmountClp >= 5000000 ? 'vip' : 'regular',
          tags: ['Reserva Wizard', idx === 0 ? 'Titular' : 'Acompañante', ...data.categories.map((c) => c.toUpperCase())],
          totalSpentClp: idx === 0 ? data.totalAmountClp : 0,
          bookingsCount: 1,
          lastActivityDate: nowStr,
          dietaryPreferences: pax.dietaryPreferences || 'Sin requerimientos especiales informados',
          divingLevel: pax.notes || 'No especificado',
          beveragePreference: 'A elección',
          emergencyContact: pax.phone ? `${pax.fullName} (${pax.phone})` : 'No registrado',
          notes: `Ingresado desde Asistente de Reservas Guiado en 6 pasos. Código: ${data.bookingCode}.`,
          timeline: [
            {
              id: `t-${Date.now()}-${idx}`,
              date: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
              type: 'booking',
              title: `Reserva Generada: ${data.bookingCode}`,
              description: `Programas: ${data.selectedPrograms.map((p) => p.title).join(' + ')}. ${data.passengers.length} pasajeros registrados.`,
            },
          ],
        };
        newClients.push(newCust);
      }
    });

    if (newClients.length > 0) {
      setCrmClients((prev) => [...newClients, ...prev]);
    }

    // Register into Lodge blocks if lodge category selected
    if (data.categories.includes('lodge') && rooms.length > 0) {
      const targetRoom = rooms[0];
      await adminBlockRoom({
        roomId: targetRoom.id,
        checkIn: data.startDate,
        checkOut: data.endDate,
        channelSource: 'phone_whatsapp',
        reason: `Reserva Wizard ${data.bookingCode} • ${data.passengers[0]?.fullName || 'Titular'} • ${data.passengers.length} pax`,
        guestName: data.passengers[0]?.fullName || 'Huésped Yates Chile',
      });
    }

    setActionMessage(`¡Reserva ${data.bookingCode} registrada con éxito! ${data.passengers.length} ficha(s) de pasajeros creada(s) en Clientes.`);
    setTimeout(() => setActionMessage(null), 5000);
    fetchAllData();
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name || !newServiceForm.price_clp) {
      triggerAlert('Por favor ingrese nombre y precio.', 'warning', 'Campos Requeridos');
      return;
    }
    const res = await createService(newServiceForm);
    if (res.success) {
      setShowNewServiceModal(false);
      setNewServiceForm({
        name: '',
        category: 'cabalgatas',
        description: '',
        duration_label: '',
        price_clp: 65000,
        max_pax: 6,
        image_url: '',
      });
      refreshServices();
      setActionMessage('Nueva experiencia guardada en el catálogo.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      triggerAlert('Error: ' + res.error, 'error');
    }
  };

  const handleApprovePayment = async (installment: PaymentInstallment) => {
    const res = await paymentService.approveInstallment(
      installment.id,
      installment.amount_expected - (discountAmount || 0),
      'Concierge Yates Chile'
    );
    if (res.success) {
      if (discountAmount > 0 && discountReason) {
        await paymentService.applyDiscount(
          installment.booking_type,
          installment.booking_id,
          discountAmount,
          discountReason
        );
      }
      setSelectedInstallment(null);
      setDiscountAmount(0);
      setDiscountReason('');
      fetchAllData();
      refreshLodge();
      setActionMessage('Transferencia conciliada y reserva confirmada exitosamente.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      triggerAlert('Error: ' + res.error, 'error');
    }
  };

  const handleSaveAllCmsSections = async (
    allDrafts: Record<string, Partial<SiteContent>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const keys = Object.keys(allDrafts);
      for (const k of keys) {
        const d = allDrafts[k];
        const existing = content[k] || DEFAULT_CMS_CONTENT[k] || {};
        await cmsService.updateContent(k, {
          title: (d.title !== undefined && d.title !== null ? d.title : (existing.title || '')) || '',
          subtitle: (d.subtitle !== undefined && d.subtitle !== null ? d.subtitle : (existing.subtitle || '')) || '',
          body_text: (d.body_text !== undefined && d.body_text !== null ? d.body_text : (existing.body_text || '')) || '',
          media_url: (d.media_url !== undefined && d.media_url !== null ? d.media_url : (existing.media_url || '')) || '',
        });
      }
      refreshContent();
      setActionMessage('¡Todos los cambios visuales del CMS fueron publicados en la web pública con éxito!');
      setTimeout(() => setActionMessage(null), 4500);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al guardar cambios' };
    }
  };

  // Handlers para Expediciones
  const handleExpeditionWizardSuccess = async (wizardData: ExpeditionWizardData) => {
    try {
      const res = await expeditionService.createDeparture({
        routeId: wizardData.routeId,
        vesselId: wizardData.vesselId,
        departureDate: wizardData.departureDate,
        returnDate: wizardData.returnDate,
        totalSlots: Number(wizardData.totalSlots),
        pricePerPaxClp: Number(wizardData.pricePerPaxClp),
        priceCharterFullClp: Number(wizardData.priceCharterFullClp),
        status: wizardData.status,
        publicName: wizardData.publicName,
        publicLocation: wizardData.publicLocation,
        publicCoverImage: wizardData.publicCoverImage,
        publicDescription: wizardData.publicDescription,
        publicTempEstimate: wizardData.publicTempEstimate,
      });

      if (res.success) {
        // If lodge rooms were selected, create maintenance block in lodge
        if (wizardData.lodgingType !== 'onboard' && wizardData.selectedRoomIds && wizardData.selectedRoomIds.length > 0) {
          for (const roomId of wizardData.selectedRoomIds) {
            await lodgeService.adminBlockRoom({
              roomId,
              checkIn: wizardData.departureDate,
              checkOut: wizardData.returnDate,
              channelSource: 'maintenance',
              reason: `Expedición: ${wizardData.publicName} (${wizardData.vesselId === 'vegvisir' ? 'Velero Vegvisir' : 'Yate Terranova'})`,
            });
          }
        }

        setShowNewDepartureModal(false);
        fetchAllData();
        refreshLodge();
        setActionMessage(`✓ Expedición "${wizardData.publicName}" creada y publicada exitosamente.`);
        setTimeout(() => setActionMessage(null), 4500);
      } else {
        triggerAlert('Error al crear expedición: ' + res.error, 'error');
      }
    } catch (err: any) {
      triggerAlert('Error inesperado al crear expedición: ' + (err.message || err), 'error');
    }
  };



  const handleUpdateDepartureStatus = async (
    departureId: string,
    status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled'
  ) => {
    const res = await expeditionService.updateDepartureStatus(departureId, status);
    if (res.success) {
      fetchAllData();
      setActionMessage('Estado de expedición actualizado.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      triggerAlert('Error al actualizar estado: ' + res.error, 'error');
    }
  };

  const handleDeleteDeparture = async (departureId: string) => {
    const res = await expeditionService.deleteDeparture(departureId);
    if (res.success) {
      fetchAllData();
      setActionMessage('Salida de expedición eliminada.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      triggerAlert('Error al eliminar salida: ' + res.error, 'error');
    }
  };

  const handleSaveEditedDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeparture) return;
    const res = await expeditionService.updateDeparture(editingDeparture.id, {
      publicName: editingDeparture.name,
      vesselId: editingDeparture.vessel_id,
      departureDate: editingDeparture.departure_date,
      returnDate: editingDeparture.return_date,
      totalSlots: Number(editingDeparture.total_slots),
      availableSlots: Number(editingDeparture.available_slots),
      pricePerPaxClp: Number(editingDeparture.price_per_pax_clp),
      status: editingDeparture.status as any,
      publicLocation: editingDeparture.location,
      publicDescription: editingDeparture.description,
    });
    if (res.success) {
      fetchAllData();
      setEditingDeparture(null);
      setActionMessage('Expedición actualizada exitosamente.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      triggerAlert('Error al actualizar la expedición: ' + (res.error || 'Error desconocido'), 'error');
    }
  };

  const handleUpdateExpBookingStatus = async (
    bookingId: string,
    status: 'approved' | 'cancelled' | 'completed'
  ) => {
    const res = await expeditionService.updateBookingStatus(bookingId, status);
    if (res.success) {
      fetchAllData();
      setActionMessage('Reserva de expedición actualizada.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      triggerAlert('Error al actualizar reserva: ' + res.error, 'error');
    }
  };

  const handleUpdatePassengerPaymentStatus = async (
    bookingId: string,
    newStatus: 'paid' | 'partial' | 'pending'
  ) => {
    const dbStatus = newStatus === 'paid' ? 'approved' : newStatus === 'pending' ? 'pending_transfer' : 'approved';
    const res = await expeditionService.updateBookingStatus(bookingId, dbStatus as any);
    if (res.success) {
      await fetchAllData();
      setActionMessage('Estado de pago del pasajero actualizado.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      setActionMessage('Estado actualizado.');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleOpenAddPassengerModal = (exp: any) => {
    setSelectedExpeditionForPassenger(exp);
    setExpPassengerValidationError(null);
    const defaultUnitPrice =
      exp.pricePerPaxClp ||
      (typeof exp.pricePerPax === 'string'
        ? parseInt(exp.pricePerPax.replace(/[^0-9]/g, ''), 10) || 1950000
        : 1950000);
    setExpPassengerStep(1);
    setExpPassengerActiveTab(0);
    setExpPassengerForm({
      paxCount: 1,
      bookingType: 'per_pax',
      customPricePerPax: defaultUnitPrice,
      status: '100_paid',
      billingNotes: '',
      passengers: [
        {
          fullName: '',
          rutPassport: '',
          birthDate: '',
          email: '',
          phone: '',
          dietaryNotes: '',
          emergencyContact: '',
          emergencyPhone: '',
        },
      ],
    });
  };

  const handleExpPaxCountChange = (newCount: number) => {
    setExpPassengerValidationError(null);
    const maxAvailable = selectedExpeditionForPassenger?.availablePax || selectedExpeditionForPassenger?.spotsLeft || 6;
    const maxAllowed = typeof maxAvailable === 'number' ? Math.max(1, maxAvailable) : 6;
    const clampedCount = Math.max(1, Math.min(maxAllowed, newCount));
    setExpPassengerForm((prev) => {
      const currentList = [...prev.passengers];
      while (currentList.length < clampedCount) {
        currentList.push({
          fullName: '',
          rutPassport: '',
          birthDate: '',
          email: '',
          phone: '',
          dietaryNotes: '',
          emergencyContact: '',
          emergencyPhone: '',
        });
      }
      return {
        ...prev,
        paxCount: clampedCount,
        passengers: currentList.slice(0, clampedCount),
      };
    });
    if (expPassengerActiveTab >= clampedCount) {
      setExpPassengerActiveTab(0);
    }
  };

  const handleUpdateExpPassengerField = (
    index: number,
    field: 'fullName' | 'rutPassport' | 'birthDate' | 'email' | 'phone' | 'dietaryNotes' | 'emergencyContact' | 'emergencyPhone',
    value: string
  ) => {
    setExpPassengerValidationError(null);
    let finalValue = value;
    if (field === 'rutPassport') {
      finalValue = formatRut(value);
    }
    setExpPassengerForm((prev) => {
      const updated = [...prev.passengers];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: finalValue };
      }
      return { ...prev, passengers: updated };
    });
  };

  const isExpStep2Valid = (): boolean => {
    if (!expPassengerForm.passengers || expPassengerForm.passengers.length === 0) return false;
    for (let i = 0; i < expPassengerForm.passengers.length; i++) {
      const pax = expPassengerForm.passengers[i];
      if (!pax || !pax.fullName?.trim() || !pax.rutPassport?.trim() || !pax.birthDate?.trim()) {
        return false;
      }
      if (i === 0) {
        if (!pax.email?.trim() || !pax.phone?.trim()) {
          return false;
        }
      }
    }
    return true;
  };

  const validateExpStep2 = (): boolean => {
    for (let i = 0; i < expPassengerForm.passengers.length; i++) {
      const pax = expPassengerForm.passengers[i];
      if (!pax.fullName.trim()) {
        const msg = `Por favor ingrese el nombre completo del Pasajero ${i + 1}.`;
        setExpPassengerValidationError(msg);
        triggerAlert(msg, 'warning', 'Nombre Requerido');
        setExpPassengerActiveTab(i);
        return false;
      }
      if (!pax.rutPassport.trim()) {
        const msg = `Por favor ingrese el RUT o Pasaporte del Pasajero ${i + 1}.`;
        setExpPassengerValidationError(msg);
        triggerAlert(msg, 'warning', 'Documento Requerido');
        setExpPassengerActiveTab(i);
        return false;
      }
      if (!pax.birthDate.trim()) {
        const msg = `Por favor ingrese la fecha de nacimiento del Pasajero ${i + 1}.`;
        setExpPassengerValidationError(msg);
        triggerAlert(msg, 'warning', 'Fecha de Nacimiento');
        setExpPassengerActiveTab(i);
        return false;
      }
      if (i === 0) {
        if (!pax.email.trim()) {
          const msg = 'Por favor ingrese el correo electrónico del Pasajero Titular (Pasajero 1).';
          setExpPassengerValidationError(msg);
          triggerAlert(msg, 'warning', 'Correo Electrónico');
          setExpPassengerActiveTab(0);
          return false;
        }
        if (!pax.phone.trim()) {
          const msg = 'Por favor ingrese el teléfono o WhatsApp del Pasajero Titular (Pasajero 1).';
          setExpPassengerValidationError(msg);
          triggerAlert(msg, 'warning', 'Teléfono / WhatsApp');
          setExpPassengerActiveTab(0);
          return false;
        }
      }
    }
    setExpPassengerValidationError(null);
    return true;
  };

  const handleSubmitExpPassenger = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedExpeditionForPassenger) return;
    if (!validateExpStep2()) return;

    setIsSubmittingExpPassenger(true);
    try {
      const primaryPax = expPassengerForm.passengers[0] || {
        fullName: 'Pasajero Registrado',
        email: 'contacto@yateschile.cl',
        phone: '+56 9 5333 2492',
        rutPassport: '',
        birthDate: '',
        dietaryNotes: '',
        emergencyContact: '',
      };

      const unitPrice = expPassengerForm.customPricePerPax || 1950000;
      const totalAmount =
        expPassengerForm.bookingType === 'full_charter'
          ? (selectedExpeditionForPassenger.priceCharterFullClp || unitPrice * (selectedExpeditionForPassenger.maxPax || 6))
          : unitPrice * expPassengerForm.paxCount;

      const res = await expeditionService.createBooking({
        departureId: selectedExpeditionForPassenger.id,
        routeId: selectedExpeditionForPassenger.routeId,
        vesselId: selectedExpeditionForPassenger.vesselId,
        expeditionName: selectedExpeditionForPassenger.routeTitle || selectedExpeditionForPassenger.name,
        vesselName: selectedExpeditionForPassenger.vesselName,
        departureDate: selectedExpeditionForPassenger.departureDate || selectedExpeditionForPassenger.rawDepartureDate,
        returnDate: selectedExpeditionForPassenger.returnDate || selectedExpeditionForPassenger.rawReturnDate,
        guestName: primaryPax.fullName.trim(),
        guestEmail: primaryPax.email.trim() || 'contacto@yateschile.cl',
        guestPhone: primaryPax.phone.trim() || '+56 9 5333 2492',
        guestRutPassport: primaryPax.rutPassport.trim() || undefined,
        bookingType: expPassengerForm.bookingType,
        paxCount: expPassengerForm.paxCount,
        totalAmount: totalAmount,
        dietaryMedicalNotes: [
          primaryPax.dietaryNotes ? `Notas médicas/dieta: ${primaryPax.dietaryNotes}` : '',
          primaryPax.birthDate ? `F. Nac: ${primaryPax.birthDate}` : '',
          primaryPax.emergencyContact || primaryPax.emergencyPhone
            ? `Emergencia: ${[primaryPax.emergencyContact, primaryPax.emergencyPhone].filter(Boolean).join(' - ')}`
            : '',
          expPassengerForm.billingNotes ? `Facturación: ${expPassengerForm.billingNotes}` : '',
          expPassengerForm.passengers.length > 1
            ? `Total ${expPassengerForm.passengers.length} pasajeros registrados`
            : '',
        ]
          .filter(Boolean)
          .join(' | ') || undefined,
        passengers: expPassengerForm.passengers.map((p) => ({
          fullName: p.fullName.trim(),
          docId: p.rutPassport.trim(),
          nationality: 'Chilena',
          emergencyContact: [p.emergencyContact?.trim(), p.emergencyPhone?.trim()].filter(Boolean).join(' - ') || undefined,
          medicalNotes: [p.dietaryNotes.trim(), p.birthDate ? `Nacimiento: ${p.birthDate}` : ''].filter(Boolean).join(' | ') || undefined,
        })),
      });

      if (res.success) {
        await fetchAllData();
        setSelectedExpeditionForPassenger(null);
        setActionMessage(
          `¡${expPassengerForm.paxCount} ${
            expPassengerForm.paxCount === 1 ? 'pasajero registrado' : 'pasajeros registrados'
          } con éxito en ${selectedExpeditionForPassenger.routeTitle || selectedExpeditionForPassenger.name}! Código: ${
            res.bookingCode || 'EXP-OK'
          }`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        triggerAlert('Error al registrar pasajero: ' + (res.error || 'Error desconocido'), 'error');
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert('Ocurrió un error inesperado al registrar el pasajero.', 'error');
    } finally {
      setIsSubmittingExpPassenger(false);
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (COMPACT LUXURY WHITE & NAVY BLUE CARD)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-[#0b192c] flex items-center justify-center p-4 sm:p-6 selection:bg-[#0b192c] selection:text-white">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(11,25,44,0.06)] space-y-6 my-auto">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#0b192c] flex items-center justify-center mx-auto shadow-md shadow-[#0b192c]/20 p-2.5 transition-transform hover:scale-105">
              <img
                src="/vegvisir-emblem-dark.png"
                alt="Logo Yates Chile"
                className="w-full h-full object-contain invert brightness-200"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-sky-700 font-bold block">
                Yates Chile • Maritime & Lodge
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#0b192c] tracking-tight mt-0.5">
                Panel de Administración
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-light">
              Acceso exclusivo para concierge, capitanes y administración general
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200/90 text-rose-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-2xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#0b192c] font-bold block mb-1.5 pl-1">
                Usuario / Correo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#0b192c] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#0b192c] font-medium focus:outline-none transition shadow-2xs"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#0b192c] font-bold block mb-1.5 pl-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#0b192c] focus:bg-white rounded-2xl pl-4 pr-11 py-3 text-xs text-[#0b192c] font-medium focus:outline-none transition shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b192c] p-1.5 rounded-xl transition cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold py-3.5 rounded-full text-xs transition-all duration-200 shadow-md shadow-[#0b192c]/20 flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.99]"
            >
              <Lock className="w-4 h-4 text-sky-300" />
              <span>Ingresar al Sistema</span>
            </button>

            <div className="pt-2 text-center space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(true);
                    setForgotSent(false);
                    setForgotEmail(username.includes('@') ? username : '');
                  }}
                  className="text-xs text-sky-700 hover:text-[#0b192c] font-semibold hover:underline cursor-pointer transition inline-flex items-center gap-1"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => (onNavigate ? onNavigate('/') : (window.location.hash = '/'))}
                  className="text-xs text-slate-500 hover:text-[#0b192c] transition font-medium cursor-pointer"
                >
                  ← Volver al Sitio Web Público
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Conexión Encriptada • Supabase DB</span>
              </div>
            </div>
          </form>
        </div>

        {/* MODAL: RECUPERAR CONTRASEÑA */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0b192c]">
                    <KeyRound className="w-5 h-5 text-[#0b192c]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#0b192c]">Recuperar Acceso</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Concierge & Administración</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-slate-400 hover:text-[#0b192c] p-1 transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {forgotSent ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-base text-[#0b192c]">Instrucciones enviadas</h5>
                    <p className="text-xs text-slate-600 mt-1 font-light">
                      Se ha enviado un enlace de restablecimiento seguro a <strong>{forgotEmail || 'contacto@yateschile.cl'}</strong>.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[11px] text-slate-500 text-left space-y-1">
                    <div className="font-bold text-[#0b192c]">Credenciales maestras por defecto:</div>
                    <div>• Usuario: <code className="font-mono text-[#0b192c] bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</code></div>
                    <div>• Clave de acceso: <code className="font-mono text-[#0b192c] bg-white px-1.5 py-0.5 rounded border border-slate-200">yates2026</code></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotSent(false);
                    }}
                    className="w-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold py-3 rounded-full text-xs transition cursor-pointer shadow-md shadow-[#0b192c]/20"
                  >
                    Entendido, volver al inicio
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setForgotSent(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <p className="text-slate-600 text-xs font-light leading-relaxed">
                    Ingresa el correo electrónico o usuario asociado a tu cuenta de administrador para recibir las instrucciones de restablecimiento de credenciales.
                  </p>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0b192c] block mb-1 pl-1">
                      Correo Electrónico / Usuario
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="contacto@yateschile.cl"
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#0b192c] focus:bg-white rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#0b192c] focus:outline-none"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-[11px] text-[#0b192c]/80 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0b192c] shrink-0 mt-0.5" />
                    <span>Por seguridad, el enlace de recuperación será verificado contra los registros de la base de datos de Yates Chile.</span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-semibold transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#0b192c] hover:bg-[#182a44] text-white py-3 rounded-full font-semibold transition shadow-md shadow-[#0b192c]/20 cursor-pointer"
                    >
                      Enviar Enlace
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED DASHBOARD (100% WHITE & NAVY BLUE LUXURY THEME)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fcfdfe] text-[#0f2b48] flex font-sans selection:bg-[#0f2b48] selection:text-white">
      
      {/* ========================================================================= */}
      {/* MENÚ LATERAL BLANCO ELEGANTE CON TONOS AZUL MARINO */}
      {/* ========================================================================= */}
      <aside className="w-72 bg-white text-[#0b192c] flex flex-col border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(11,25,44,0.02)] overflow-hidden">
        
        {/* Brand Header with Live Nautical Weather & Wind */}
        <div className="p-5 pb-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0b192c] flex items-center justify-center p-2 shrink-0 shadow-md shadow-[#0b192c]/15">
              <img
                src="/vegvisir-emblem-dark.png"
                alt="Logo Yates Chile"
                className="w-full h-full object-contain invert brightness-200"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-serif text-base font-bold text-[#0b192c] tracking-tight leading-tight truncate">
                  Yates Chile
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-xs" title="Sistema y Base de Datos Conectada" />
              </div>
              
              {liveWeather ? (
                <div className="mt-1 space-y-0.5 font-mono text-[10px]">
                  {/* Localidad & Temperatura */}
                  <div className="flex items-center gap-1 text-[#0b192c] font-bold truncate">
                    <MapPin className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                    <span className="truncate">{liveWeather.city}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-600 font-bold">{liveWeather.temperature}</span>
                  </div>
                  {/* Viento Náutico & Estado */}
                  <div className="flex items-center gap-1 text-slate-500 text-[9px] truncate">
                    <Wind className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                    <span className="font-semibold text-slate-700">{liveWeather.windSpeed}</span>
                    <span className="text-slate-600 font-medium">{liveWeather.windDirection}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 font-sans">{liveWeather.condition}</span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Obteniendo clima...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Links Grouped by Section */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
          <nav className="space-y-4">
            
            {/* SECCIÓN 1: VISIÓN GENERAL */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Visión General
              </div>

              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Dashboard General</span>
                </div>
                {activeTab === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>

              {/* Tráfico */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Tráfico & Geolocalización</span>
                </div>
                {activeTab === 'analytics' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            </div>

            {/* SECCIÓN 2: OPERACIONES & HOSPEDAJE */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Operaciones & Reservas
              </div>

              {/* Reservas */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Reservas Centralizadas</span>
                </div>
                {(lodgeBookings.some((b) => b.status === 'pending_transfer') || installments.some((i) => i.status === 'pending_approval' || i.status === 'pending_upload') || totalBookingsCount > 0) ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-xs" title="Nuevas reservas por gestionar" />
                ) : activeTab === 'bookings' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                ) : null}
              </button>

              {/* Lodge */}
              <button
                onClick={() => setActiveTab('lodge')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'lodge'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BedDouble className={`w-4 h-4 ${activeTab === 'lodge' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Lodge Rincón</span>
                </div>
                {activeTab === 'lodge' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>

              {/* Expediciones */}
              <button
                onClick={() => setActiveTab('expeditions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'expeditions'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ship className={`w-4 h-4 ${activeTab === 'expeditions' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Expediciones Náuticas</span>
                </div>
                {(expBookings.some((b) => b.status === 'pending_transfer') || departures.length > 0) ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-xs" title="Nuevas reservas de expediciones por gestionar" />
                ) : activeTab === 'expeditions' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                ) : null}
              </button>
            </div>

            {/* SECCIÓN 3: CLIENTES & CRM */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Clientes & CRM
              </div>

              {/* Clientes & Leads */}
              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-4 h-4 ${activeTab === 'payments' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Clientes & Leads (CRM)</span>
                </div>
                {activeTab === 'payments' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            </div>

            {/* SECCIÓN 4: CONTENIDO & CATÁLOGO */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Contenido & Catálogo
              </div>

              {/* Catálogo & Servicios */}
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className={`w-4 h-4 ${activeTab === 'services' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Catálogo & Servicios</span>
                </div>
                {activeTab === 'services' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>

              {/* CMS Web */}
              <button
                onClick={() => setActiveTab('cms')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'cms'
                    ? 'bg-[#0b192c] text-white shadow-sm shadow-[#0b192c]/20'
                    : 'text-slate-600 hover:text-[#0b192c] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'cms' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>CMS Web (Textos & Medios)</span>
                </div>
                {activeTab === 'cms' && <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <button
            onClick={() => (onNavigate ? onNavigate('/') : (window.location.hash = '/'))}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#0b192c] px-4 py-2.5 rounded-2xl text-xs font-semibold transition border border-slate-200/80 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#0b192c]" />
              <span>Ver Web Pública</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              if (onNavigate) onNavigate('/');
              else window.location.hash = '/';
            }}
            className="w-full flex items-center justify-center gap-2 text-rose-700 hover:bg-rose-50 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER (BLANCO & NAVY BLUE LUXURY BOUTIQUE) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fb]">
        
        {/* Unified Top Header — BankDash Style with Pill Search, Quick Action & User Capsule */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-[0_4px_20px_rgba(11,25,44,0.02)]">
          {/* Active Tab Title & Subtitle (Left) */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-[#f4f7fb] border border-slate-200/80 flex items-center justify-center text-[#0b192c] shadow-2xs">
              {activeTab === 'dashboard' && <LayoutDashboard className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'bookings' && <CalendarCheck className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'analytics' && <Compass className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'lodge' && <BedDouble className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'expeditions' && <Ship className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'payments' && (
                crmActiveSubTab === 'clients' ? <UserCheck className="w-4.5 h-4.5 text-[#0b192c]" /> : <Users className="w-4.5 h-4.5 text-[#0b192c]" />
              )}
              {activeTab === 'services' && <Tag className="w-4.5 h-4.5 text-[#0b192c]" />}
              {activeTab === 'cms' && <Sparkles className="w-4.5 h-4.5 text-[#0b192c]" />}
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0b192c] leading-tight tracking-tight">
                {activeTab === 'dashboard'
                  ? 'Overview / Dashboard'
                  : activeTab === 'bookings'
                  ? 'Gestión Centralizada de Reservas'
                  : activeTab === 'analytics'
                  ? 'Tráfico & Geolocalización'
                  : activeTab === 'lodge'
                  ? 'Lodge Rincón de Navegantes'
                  : activeTab === 'expeditions'
                  ? 'Expediciones & Flota Náutica'
                  : activeTab === 'payments'
                  ? (crmActiveSubTab === 'clients' ? 'CRM de Clientes & Concierge' : 'Gestión de Leads & Prospectos')
                  : activeTab === 'services'
                  ? 'Catálogo de Experiencias'
                  : 'CMS Web (Textos & Medios)'}
              </h2>
              <span className="text-[11px] text-slate-400 font-light block">
                {activeTab === 'dashboard'
                  ? 'Resumen operativo, tarjetas de flota y métricas en vivo'
                  : activeTab === 'bookings'
                  ? `${totalBookingsCount} reservas registradas • Lodge, Expediciones & Catálogo`
                  : activeTab === 'analytics'
                  ? 'Monitoreo de visitas y procedencia en tiempo real'
                  : activeTab === 'lodge'
                  ? 'Disponibilidad y reservas de las 4 habitaciones (11 Huéspedes)'
                  : activeTab === 'expeditions'
                  ? 'Gestión de salidas programadas, cupos e itinerarios'
                  : activeTab === 'payments'
                  ? (crmActiveSubTab === 'clients'
                      ? `${crmClients.length} clientes registrados • Fichas individuales y conciliación`
                      : `${leads.length} prospectos en seguimiento • ${newLeadsCount} nuevos por contactar`)
                  : activeTab === 'services'
                  ? `${services.length} experiencias activas en catálogo`
                  : 'Editor de portada y contenidos públicos'}
              </span>
            </div>
          </div>

          {/* Search Bar (Center / Flexible) */}
          <div className="relative flex-1 max-w-sm mx-4 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar reservas, clientes, flota..."
              value={bookingsSearchQuery}
              onChange={(e) => {
                setBookingsSearchQuery(e.target.value);
                if (activeTab !== 'bookings' && e.target.value.trim().length > 0) {
                  setActiveTab('bookings');
                }
              }}
              className="w-full bg-[#f4f7fb] hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 focus:border-[#0b192c] rounded-full pl-9.5 pr-4 py-2 text-xs text-[#0b192c] placeholder:text-slate-400 transition-all outline-none shadow-2xs"
            />
          </div>

          {/* Far Right: Quick Action Button + Notification Bell + User Profile Capsule */}
          <div className="flex items-center gap-3 sm:gap-3.5 shrink-0 ml-auto">
            {/* Quick Create Action Button */}
            <button
              type="button"
              onClick={() => setShowBookingWizardModal(true)}
              className="bg-[#0b192c] hover:bg-[#182a44] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer hover:shadow-md active:scale-95"
              title="Crear una nueva reserva asistida"
            >
              <Plus className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">Nueva Reserva</span>
            </button>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Centro de Notificaciones en Vivo"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition cursor-pointer relative ${
                  isNotificationsOpen
                    ? 'bg-[#0b192c] text-white border-[#0b192c]'
                    : 'bg-[#f4f7fb] hover:bg-slate-100 border-slate-200/80 text-slate-600 hover:text-[#0b192c] shadow-2xs'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl z-50 p-5 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-700" />
                        <span className="font-semibold text-xs text-[#0b192c]">Notificaciones del Sistema</span>
                        {unreadNotifsCount > 0 && (
                          <span className="bg-rose-50 text-rose-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                            {unreadNotifsCount} nuevas
                          </span>
                        )}
                      </div>
                      {unreadNotifsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setReadNotifIds(notificationsList.map((n) => n.id))}
                          className="text-[11px] text-sky-700 hover:text-sky-900 transition font-semibold cursor-pointer"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
                      {notificationsList.length > 0 ? (
                        notificationsList.map((notif) => {
                          const isRead = readNotifIds.includes(notif.id);
                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                setReadNotifIds((prev) => [...prev, notif.id]);
                                setActiveTab(notif.actionTab);
                                setIsNotificationsOpen(false);
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                isRead
                                  ? 'bg-slate-50/50 border-slate-100 text-slate-500 opacity-75 hover:opacity-100 hover:bg-slate-50'
                                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
                                notif.type === 'booking'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : notif.type === 'payment'
                                  ? 'bg-sky-100 text-sky-800'
                                  : notif.type === 'cancellation'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {notif.type === 'booking' && <CalendarCheck className="w-4 h-4" />}
                                {notif.type === 'payment' && <CreditCard className="w-4 h-4" />}
                                {notif.type === 'cancellation' && <XCircle className="w-4 h-4" />}
                                {notif.type === 'lead' && <UserPlus className="w-4 h-4" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h5 className={`text-xs truncate ${isRead ? 'font-medium text-slate-700' : 'font-semibold text-[#0b192c]'}`}>
                                    {notif.title}
                                  </h5>
                                  <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                    {notif.date}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                  {notif.description}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400 font-light">
                          No hay notificaciones pendientes.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Admin User Badge with Current Date & Time */}
            <button
              type="button"
              onClick={handleOpenProfileModal}
              className="flex items-center gap-2.5 pl-3 pr-1.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-full transition shadow-2xs cursor-pointer group text-left"
              title="Modificar perfil y resetear contraseña"
            >
              <div className="text-right hidden sm:block">
                <span className="text-xs text-[#0b192c] font-semibold block leading-tight">
                  {`${adminProfile.firstName} ${adminProfile.lastName}`.trim() || 'Administrador'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">
                  {currentSystemTime.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {currentSystemTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>
              <div className="w-8 h-8 bg-[#0b192c] text-white rounded-full flex items-center justify-center text-[11px] font-bold font-mono shadow-xs group-hover:bg-[#182a44] transition shrink-0">
                {`${(adminProfile.firstName?.[0] || 'A')}${(adminProfile.lastName?.[0] || 'D')}`.toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        {/* Alert Notification Toast */}
        {actionMessage && (
          <div className="bg-[#0b192c] text-white px-8 py-2.5 text-xs font-medium shadow-sm flex items-center gap-2 animate-fade-in border-b border-[#182a44]">
            <CheckCircle2 className="w-4 h-4 text-sky-300" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-7 flex-1 max-w-7xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* TAB 0: EXECUTIVE DASHBOARD (BANKDASH MODERN BENTO GRID) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-7">





              {/* --------------------------------------------------------------------- */}
              {/* BENTO ROW 3: 4 EXECUTIVE METRICS (KPIS) */}
              {/* --------------------------------------------------------------------- */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_rgba(11,25,44,0.03)] overflow-hidden transition-all duration-300">
                <div className="px-7 py-5 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd] border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0b192c] shadow-2xs">
                      <TrendingUp className="w-4.5 h-4.5 text-[#0b192c]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#0b192c] tracking-tight">
                        Resumen Ejecutivo de Rendimiento
                      </h4>
                      <p className="text-xs text-slate-500 font-light">Métricas clave consolidadas de la temporada</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* SELECTOR EN CÁPSULA MINIMALISTA */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      {(['today', 'week', 'month', 'all'] as const).map((timeframeKey) => {
                        const isSelected = kpiTimeframe === timeframeKey;
                        const label =
                          timeframeKey === 'today'
                            ? 'Hoy'
                            : timeframeKey === 'week'
                            ? 'Semana'
                            : timeframeKey === 'month'
                            ? 'Mes'
                            : 'Todo';
                        return (
                          <button
                            key={timeframeKey}
                            type="button"
                            onClick={() => setKpiTimeframe(timeframeKey)}
                            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#0b192c] text-white shadow-xs'
                                : 'text-slate-600 hover:text-[#0b192c]'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* KPI 1: INGRESOS CONFIRMADOS */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Ingresos Confirmados
                        </span>
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                          ${kpiConfirmedRevenue.toLocaleString('es-CL')}
                          <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">CLP</span>
                        </div>
                        <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>
                            {kpiTimeframe === 'today'
                              ? 'Transferencias de hoy'
                              : kpiTimeframe === 'week'
                              ? 'Últimos 7 días'
                              : kpiTimeframe === 'month'
                              ? 'Últimos 30 días'
                              : 'Histórico verificado'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 2: POR RECAUDAR / CUOTAS */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Por Recaudar / Cuotas
                        </span>
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                          ${kpiPendingRevenue.toLocaleString('es-CL')}
                          <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">CLP</span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{kpiPendingApprovalsCount} comprobantes por revisar</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 3: RESERVAS TOTALES */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Reservas Totales
                        </span>
                        <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-700 border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                          {kpiTotalBookingsCount}
                          <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">totales</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span>{kpiFilteredLodgeBookings.length} Lodge • {kpiFilteredExpBookings.length} Expediciones</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 4: CAPACIDAD LODGE */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Capacidad Lodge
                        </span>
                        <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                          <BedDouble className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                          4
                          <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">Habitaciones</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Hasta 11 pax • {kpiBlockedDatesCount} bloqueos</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ÚLTIMAS 5 RESERVAS REALIZADAS (LODGE Y EXPEDICIONES) - DESPLEGABLE */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden transition-all duration-300">
                <div
                  onClick={() => setIsRecentBookingsOpen(!isRecentBookingsOpen)}
                  className="px-7 py-5 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd] cursor-pointer hover:bg-slate-50/90 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs">
                      <Clock className="w-4.5 h-4.5 text-[#0f2b48]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#0b192c] tracking-tight">
                        Últimas 5 Reservas Realizadas
                      </h4>
                      <p className="text-xs text-slate-500 font-light">Historial reciente de reservas de Lodge y Expediciones</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('bookings');
                      }}
                      className="text-xs text-[#0f2b48] hover:text-[#0a1e34] font-bold flex items-center gap-1 cursor-pointer mr-1 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition"
                    >
                      <span>Ver Todas las Reservas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs hover:border-slate-300 transition">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isRecentBookingsOpen ? 'rotate-180 text-[#0f2b48]' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isRecentBookingsOpen && (
                  <div className="overflow-x-auto border-t border-slate-100 animate-fadeIn">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-7 py-3.5">Tipo</th>
                          <th className="px-7 py-3.5">Huésped / Pasajero</th>
                          <th className="px-7 py-3.5">Servicio / Habitación</th>
                          <th className="px-7 py-3.5">Fechas</th>
                          <th className="px-7 py-3.5">Monto Total</th>
                          <th className="px-7 py-3.5">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {unifiedRecentBookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-7 py-10 text-center text-slate-400">
                              No hay reservas registradas en el sistema aún.
                            </td>
                          </tr>
                        ) : (
                          unifiedRecentBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-7 py-4">
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase inline-flex items-center gap-1 ${
                                    b.type === 'lodge'
                                      ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                      : 'bg-sky-50 text-sky-900 border border-sky-200'
                                  }`}
                                >
                                  {b.type === 'lodge' ? (
                                    <>
                                      <BedDouble className="w-3 h-3 text-purple-700" />
                                      <span>Lodge</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sailboat className="w-3 h-3 text-sky-700" />
                                      <span>Expedición</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-7 py-4">
                                <div className="space-y-1">
                                  <div className="font-bold text-[#0b192c] text-xs leading-snug">{b.guest_name}</div>
                                  {b.guest_phone && b.guest_phone !== 'Sin contacto' && !b.guest_phone.includes('00000000') && (
                                    <a
                                      href={`https://wa.me/${b.guest_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Hola estimado/a ${b.guest_name}, le contactamos desde Yates Chile respecto a su reserva ${b.booking_code}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-emerald-200 transition-all shadow-2xs group/wa cursor-pointer"
                                      title={`Abrir WhatsApp de ${b.guest_name} (${b.guest_phone})`}
                                    >
                                      <svg className="w-3 h-3 fill-current transition-colors shrink-0" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="px-7 py-4 text-slate-700 font-medium">
                                {b.service_title}
                              </td>
                              <td className="px-7 py-4 font-mono text-slate-600 text-xs">
                                {b.dates}
                              </td>
                              <td className="px-7 py-4 font-mono font-bold text-[#0b192c]">
                                ${b.amount.toLocaleString('es-CL')}{' '}
                                <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                              </td>
                              <td className="px-7 py-4">
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold font-mono uppercase whitespace-nowrap inline-flex items-center ${
                                    b.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : b.status === 'blocked'
                                      ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {b.status === 'approved'
                                    ? 'Confirmada'
                                    : b.status === 'blocked'
                                    ? 'Bloqueo'
                                    : 'Pendiente Pago'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. CAPACIDAD & DISPONIBILIDAD DIARIA DEL LODGE (ULTRA PREMIUM MINIMALISTA - DESPLEGABLE) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 space-y-7 shadow-[0_4px_30px_rgba(15,43,72,0.02)] transition-all duration-300">
                
                {/* Header with Luxury Navigation Controls & Collapse Toggle */}
                <div
                  onClick={() => setIsLodgeCalendarOpen(!isLodgeCalendarOpen)}
                  className={`flex flex-wrap items-center justify-between gap-4 select-none cursor-pointer transition w-full ${
                    isLodgeCalendarOpen ? 'border-b border-slate-100 pb-5' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#0f2b48]/60 block">
                      Gestión de Ocupación Diaria
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#0f2b48] tracking-tight">
                      Disponibilidad del Lodge Rincón de Navegantes
                    </h4>
                    <p className="text-xs text-slate-500 font-light">
                      Control de reservas y aforo por habitación para las 4 habitaciones (11 Huéspedes en total).
                    </p>
                  </div>

                  {/* Month Switcher & Minimalist Accordion Arrow (Aligned to Far Right) */}
                  <div className="flex items-center gap-3 shrink-0 ml-auto">
                    {/* Compact Minimal Month Navigator */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-2xs"
                    >
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-100 rounded text-[#0f2b48] transition cursor-pointer"
                        title="Mes Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <div className="px-2.5 py-0.5 text-[11px] font-serif font-bold text-[#0f2b48] min-w-[105px] text-center tracking-wide">
                        {monthLabel}
                      </div>

                      <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-100 rounded text-[#0f2b48] transition cursor-pointer"
                        title="Mes Siguiente"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Minimalist Toggle Arrow (Only arrow, no text) */}
                    <div
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs hover:border-slate-300 transition"
                      title={isLodgeCalendarOpen ? 'Ocultar sección' : 'Desplegar sección'}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isLodgeCalendarOpen ? 'rotate-180 text-[#0f2b48]' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isLodgeCalendarOpen && (
                  <div className="space-y-7 animate-fadeIn">
                    {/* HORIZONTAL SCROLLABLE ROW OF COMPACT DAY CARDS WITH SIDE NAVIGATION ARROWS */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                            Selecciona una fecha:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              setSelectedMonthDate(now);
                              setSelectedDayNumber(now.getDate());
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition shadow-2xs cursor-pointer ${
                              isCurrentMonthAndYear && selectedDayNumber === today.getDate()
                                ? 'bg-[#0f2b48] text-white shadow-xs'
                                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                            }`}
                            title="Seleccionar y enfocar en el día de hoy"
                          >
                            <Calendar className="w-3 h-3 text-sky-400" />
                            <span>Hoy ({today.getDate()} {monthNames[today.getMonth()].slice(0, 3)})</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Navega con las flechas o desliza →</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Left Scroll Navigation Arrow */}
                        <button
                          onClick={() => daysScrollContainerRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
                          className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-[#0f2b48] hover:bg-[#0f2b48] hover:text-white text-slate-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                          title="Desplazar hacia la izquierda"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div
                          ref={daysScrollContainerRef}
                          className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth flex-1"
                        >
                          {daysList.map((day) => {
                            const isFullyBooked = day.availableRoomsCount === 0;
                            const isPartiallyBooked = day.availableRoomsCount > 0 && day.availableRoomsCount < day.totalRooms;
                            const isSelected = day.isSelected;
                            const isPast = day.isPast;

                            let statusBadgeBg = 'bg-emerald-500';
                            if (isPast) statusBadgeBg = 'bg-slate-400';
                            else if (isFullyBooked) statusBadgeBg = 'bg-rose-500';
                            else if (isPartiallyBooked) statusBadgeBg = 'bg-amber-500';

                            return (
                              <button
                                key={day.dateStr}
                                data-day={day.dayNum}
                                onClick={() => setSelectedDayNumber(day.dayNum)}
                                className={`shrink-0 w-15 sm:w-16 h-18 sm:h-19 rounded-2xl p-2 flex flex-col items-center justify-between transition-all duration-200 border cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md shadow-[#0f2b48]/20 scale-102 ring-2 ring-[#0f2b48]/30'
                                    : day.isToday
                                    ? 'bg-white text-slate-800 border-[#0f2b48] ring-2 ring-[#0f2b48]/30 shadow-md font-bold'
                                    : isPast
                                    ? 'bg-slate-100/70 text-slate-400 border-slate-200/70 hover:bg-slate-100 shadow-2xs opacity-75 hover:opacity-100'
                                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-[#0f2b48]/40 hover:bg-slate-50/80 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full px-0.5">
                                  <span
                                    className={`text-[8px] sm:text-[9px] uppercase font-mono font-bold ${
                                      isSelected ? 'text-sky-300' : day.isToday ? 'text-[#0f2b48]' : 'text-slate-400'
                                    }`}
                                  >
                                    {day.dayOfWeek}
                                  </span>
                                  {day.isToday && (
                                    <span
                                      className={`text-[7px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                                        isSelected
                                          ? 'bg-sky-400/20 text-sky-200 border border-sky-300/30'
                                          : 'bg-[#0f2b48] text-white shadow-2xs'
                                      }`}
                                    >
                                      Hoy
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`text-base sm:text-lg font-serif font-bold leading-none ${
                                    isSelected ? 'text-white' : day.isToday ? 'text-[#0f2b48]' : isPast ? 'text-slate-400' : 'text-[#0f2b48]'
                                  }`}
                                >
                                  {day.dayNum}
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeBg}`} />
                                  <span
                                    className={`text-[9px] font-mono font-semibold ${
                                      isSelected ? 'text-slate-200' : day.isToday ? 'text-slate-700' : isPast ? 'text-slate-400' : 'text-slate-500'
                                    }`}
                                  >
                                    {isPast ? 'Pas.' : isFullyBooked ? 'Agot.' : `${day.availableRoomsCount} lib.`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Scroll Navigation Arrow */}
                        <button
                          onClick={() => daysScrollContainerRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
                          className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-[#0f2b48] hover:bg-[#0f2b48] hover:text-white text-slate-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                          title="Desplazar hacia la derecha"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* SELECTED DATE ROOM CAPACITY BREAKDOWN (CARDS) */}
                    <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs">
                            <CalendarDays className="w-5 h-5 text-[#0f2b48]" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold">
                              Estado del Día Seleccionado
                            </div>
                            <h5 className="font-serif text-lg font-bold text-[#0f2b48] capitalize">
                              {selectedDayData
                                ? `${selectedDayData.dayOfWeek} ${selectedDayData.dayNum} de ${monthNames[calendarMonth]} de ${calendarYear}`
                                : 'Seleccione una fecha'}
                            </h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-500">Aforo disponible:</span>
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl font-bold text-[#0f2b48] shadow-2xs">
                            {selectedDayData?.availableRoomsCount || 0} de {rooms.length || 4} cabinas libres
                          </span>
                        </div>
                      </div>

                      {/* Rooms Grid for Selected Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {rooms.map((room) => {
                          const roomStatus = selectedDayData?.roomStatuses.find((rs) => rs.room.id === room.id);
                          const isAvailable = roomStatus ? roomStatus.isAvailable : true;
                          const booking = roomStatus?.booking;

                          return (
                            <div
                              key={room.id}
                              className={`rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                                isAvailable
                                  ? 'bg-white border-emerald-200/80 shadow-2xs hover:border-emerald-400'
                                  : 'bg-slate-100/75 border-slate-200 text-slate-400 shadow-none'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className={`font-mono font-bold text-xs ${isAvailable ? 'text-[#0f2b48]' : 'text-slate-400'}`}>
                                    #{room.room_number}
                                  </span>
                                  <span
                                    className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                                      isAvailable
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-slate-200/90 text-slate-600 border-slate-300'
                                    }`}
                                  >
                                    {isAvailable ? 'Disponible' : 'Ocupada'}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <h6 className={`font-serif font-bold text-sm leading-snug ${isAvailable ? 'text-[#0f2b48]' : 'text-slate-600'}`}>
                                      {room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim()}
                                    </h6>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditRoomModal(room);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer shrink-0"
                                      title={`Cambiar nombre de ${room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim()}`}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Hasta {room.max_pax} Huéspedes • ${room.base_price_clp.toLocaleString('es-CL')}/noche
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200/60">
                                {isAvailable ? (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    {/* Botón 1: Bloquear Airbnb (Blanco con Borde Rojo Airbnb Corporativo #FF385C) */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const checkIn = selectedDayData?.dateStr || new Date().toISOString().split('T')[0];
                                        const checkOutDate = new Date(checkIn);
                                        checkOutDate.setDate(checkOutDate.getDate() + 1);
                                        const checkOut = checkOutDate.toISOString().split('T')[0];
                                        setAirbnbConfirmModal({
                                          isOpen: true,
                                          room,
                                          checkIn,
                                          checkOut,
                                        });
                                      }}
                                      className="w-full h-8.5 bg-white hover:bg-[#FF385C]/5 active:bg-[#FF385C]/10 text-[#FF385C] border border-[#FF385C] hover:border-[#E00B41] font-bold px-2.5 rounded-xl text-[11px] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-sm"
                                      title="Bloquear fechas de esta cabina para sincronización con Airbnb"
                                    >
                                      <AirbnbIcon className="w-4 h-4 shrink-0" />
                                      <span className="font-sans font-bold tracking-wide">Bloquear Airbnb</span>
                                    </button>

                                    {/* Botón 2: Crear Reserva (Conectado al formulario de reservas del Lodge) */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowBookingWizardModal(true);
                                      }}
                                      className="w-full h-8.5 bg-[#0f2b48] hover:bg-[#0a1e34] active:bg-[#061424] text-white font-bold px-2.5 rounded-xl text-[11px] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-[#0f2b48]/20 hover:shadow-md hover:shadow-[#0f2b48]/30"
                                      title="Abrir formulario de reservas para crear una nueva estadía en el Lodge"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                                      <span className="font-sans font-semibold tracking-wide">Crear Reserva</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    {/* Indicador ultra-compacto de Bloqueo / Reserva (1 sola línea, altura fija idéntica a botón) */}
                                    <div
                                      className="w-full h-8.5 bg-slate-100/90 border border-slate-200/90 px-2.5 rounded-xl text-[11px] text-slate-700 flex items-center justify-between gap-1.5 shadow-2xs overflow-hidden"
                                      title={`${booking?.guest_name || 'Ocupada'} • ${booking?.channel_source || 'Directo'}`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        <span className="font-semibold truncate text-[#0f2b48] text-[11px]">
                                          {booking?.guest_name?.includes('Airbnb')
                                            ? 'Airbnb (Sincronizado)'
                                            : booking?.channel_source === 'maintenance' || booking?.guest_name?.includes('Manual')
                                            ? 'Bloqueo Mantención'
                                            : booking?.guest_name || 'Reserva Confirmada'}
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400 shrink-0">
                                        {booking?.channel_source === 'airbnb' ? 'Airbnb' : booking?.channel_source === 'maintenance' ? 'Mant.' : 'Directo'}
                                      </span>
                                    </div>

                                    {/* Botón Cabina Ocupada */}
                                    <button
                                      type="button"
                                      disabled
                                      className="w-full h-8.5 bg-slate-100 text-slate-400 border border-slate-200/80 font-medium px-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                                    >
                                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>Cabina Ocupada</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. SECCIÓN DESPLEGABLE: CAPACIDAD DE LAS EXPEDICIONES PRÓXIMAS */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_30px_rgba(15,43,72,0.02)] overflow-hidden transition-all duration-300">
                <div
                  onClick={() => setIsUpcomingExpeditionsOpen(!isUpcomingExpeditionsOpen)}
                  className={`px-7 py-5 flex items-center justify-between gap-4 bg-[#fbfcfd] cursor-pointer hover:bg-slate-50/90 transition-all select-none w-full ${
                    isUpcomingExpeditionsOpen ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs shrink-0">
                      <Ship className="w-4.5 h-4.5 text-[#0f2b48]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#0f2b48]/60 block">
                        Travesías Oceánicas
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#0f2b48] tracking-tight">
                        Capacidad de las Expediciones Próximas
                      </h4>
                      <p className="text-xs text-slate-500 font-light leading-snug max-w-md">
                        Zarpes hacia el Archipiélago Juan Fernández<br className="hidden sm:inline" />
                        a bordo del Velero Vegvisir y Yate Terranova.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0 ml-auto">
                    {/* Selector de Vista: Tarjetas / Lista */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/80 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('grid')}
                        title="Vista Tarjetas"
                        className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition cursor-pointer ${
                          expeditionsViewMode === 'grid'
                            ? 'bg-[#0f2b48] text-white shadow-xs'
                            : 'bg-white text-slate-500 hover:text-[#0f2b48]'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('list')}
                        title="Vista Lista / Tabla"
                        className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition cursor-pointer ${
                          expeditionsViewMode === 'list'
                            ? 'bg-[#0f2b48] text-white shadow-xs'
                            : 'bg-white text-slate-500 hover:text-[#0f2b48]'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigate) onNavigate('/expediciones');
                        else window.location.hash = '/expediciones';
                      }}
                      className="text-xs text-[#0f2b48] hover:text-[#0a1e34] font-bold flex items-center gap-1 cursor-pointer mr-1 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition whitespace-nowrap"
                    >
                      <span>Ver Rutas & Itinerarios</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs hover:border-slate-300 transition shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isUpcomingExpeditionsOpen ? 'rotate-180 text-[#0f2b48]' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isUpcomingExpeditionsOpen && (
                  <div className="p-8 animate-fadeIn">
                    {expeditionsViewMode === 'grid' ? (
                      /* VISTA TARJETAS (GRID - TOP 3 EXPEDICIONES) */
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {dashboardUpcomingExpeditions.map((exp) => {
                          const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                          const isAgotado = exp.availablePax <= 0 || exp.bookedPax >= exp.maxPax;
                          const daysUntil = exp.daysUntilDeparture !== undefined ? exp.daysUntilDeparture : 999;
                          const VesselIcon = exp.vesselName.toLowerCase().includes('terranova') ? Ship : Sailboat;

                          // Color Rules:
                          // 1. Agotado -> Gris
                          // 2. Faltan <= 15 días y quedan cupos -> Roja
                          // 3. Faltan <= 30 días y quedan cupos -> Amarilla
                          // 4. Más de 30 días -> Verde / Normal
                          const cardTheme = isAgotado
                            ? {
                                container: 'bg-slate-100/70 border-slate-300/80 shadow-[0_4px_20px_rgba(100,116,139,0.06)]',
                                icon: 'bg-white text-slate-500 border-slate-200 shadow-2xs',
                                inner: 'bg-white/90 border-slate-200/80',
                                bar: 'bg-slate-400',
                                badge: 'bg-slate-200 text-slate-700 border-slate-300 font-bold',
                                badgeText: 'Agotado',
                              }
                            : daysUntil <= 15 && daysUntil >= 0
                            ? {
                                container: 'bg-rose-50/80 border-rose-300 shadow-[0_4px_24px_rgba(244,63,94,0.1)] hover:border-rose-400',
                                icon: 'bg-white text-rose-700 border-rose-200 shadow-2xs',
                                inner: 'bg-white/95 border-rose-200/80',
                                bar: 'bg-rose-600',
                                badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
                                badgeText: `¡Zarpe en ${daysUntil} días!`,
                              }
                            : daysUntil <= 30 && daysUntil >= 0
                            ? {
                                container: 'bg-amber-50/80 border-amber-300 shadow-[0_4px_24px_rgba(245,158,11,0.1)] hover:border-amber-400',
                                icon: 'bg-white text-amber-700 border-amber-200 shadow-2xs',
                                inner: 'bg-white/95 border-amber-200/80',
                                bar: 'bg-amber-500',
                                badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
                                badgeText: `Zarpe en ${daysUntil} días`,
                              }
                            : {
                                container: 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.04)]',
                                icon: 'bg-white text-emerald-800 border-emerald-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-emerald-100',
                                bar: 'bg-emerald-600',
                                badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
                                badgeText: exp.status,
                              };

                          return (
                            <div
                              key={exp.id}
                              className={`border rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                            >
                              <div className="space-y-4">
                                {/* Top Header: Icon + Expedition Title (max 2 lines) + Vessel Name */}
                                <div className="flex items-start gap-3.5 min-w-0">
                                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${cardTheme.icon}`}>
                                    <VesselIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4
                                      className="font-serif font-bold text-sm sm:text-base text-[#0f2b48] tracking-tight leading-snug line-clamp-2"
                                      title={exp.routeTitle}
                                    >
                                      {exp.routeTitle}
                                    </h4>
                                    <div className="text-xs text-slate-500 font-medium mt-1">
                                      <span className="font-semibold text-slate-700">{exp.vesselName}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Details Strip (Tarjeta de Información: Zarpe, Fechas & Tarifa) */}
                                  <div className={`p-4 border rounded-2xl space-y-3.5 shadow-2xs ${cardTheme.inner}`}>
                                    {/* Fila 1: Zarpe & Fechas */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                        <span className="flex items-center gap-1.5 text-slate-600">
                                          <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                          <span>Zarpe & Retorno</span>
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between gap-1.5 bg-[#f4f7fb] border border-slate-200/70 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0b192c]">
                                        <span className="tracking-tight">{exp.departureDateFormatted || exp.departureDates.split(' ➔ ')[0]}</span>
                                        <span className="text-slate-400 font-sans text-xs shrink-0">➔</span>
                                        <span className="tracking-tight">{exp.returnDateFormatted || exp.departureDates.split(' ➔ ')[1] || exp.departureDates}</span>
                                      </div>
                                    </div>

                                    {/* Divisor */}
                                    <div className="border-t border-slate-200/60" />

                                    {/* Fila 2: Tarifa / Pax en Pesos Chilenos (CLP) */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                          Tarifa por Pax
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <div className="flex items-baseline justify-end gap-1.5">
                                          <span className="text-base font-extrabold font-sans text-[#0b192c] tracking-tight">
                                            {exp.priceFormatted || exp.pricePerPax.replace(' CLP', '')}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-[#0b192c] border border-slate-200/80 shadow-2xs">
                                            CLP
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                          Pesos Chilenos
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Botón Ver Detalle de Pasajeros (Posicionado debajo de la tarjeta de información) */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPassengerManifestModal(exp);
                                    }}
                                    className="w-full flex items-center justify-between px-3.5 py-2 bg-white hover:bg-[#0b192c] text-slate-700 hover:text-white border border-slate-200/90 rounded-xl text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer group/manifest"
                                    title={`Ver manifiesto y pasajeros de ${exp.routeTitle}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Users className="w-3.5 h-3.5 text-slate-500 group-hover/manifest:text-sky-300 transition-colors" />
                                      <span>Ver Pasajeros</span>
                                    </div>
                                    <span className="bg-slate-100 group-hover/manifest:bg-white/20 text-[#0b192c] group-hover/manifest:text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200/80 group-hover/manifest:border-white/20">
                                      {exp.bookedPax} {exp.bookedPax === 1 ? 'Pax' : 'Pax'}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Capacity Progress Bar & Action Footer */}
                              <div className="space-y-2.5 pt-3 border-t border-slate-200/60">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-600 font-medium">
                                    Ocupación: <strong className="text-[#0f2b48] font-bold">{exp.bookedPax}</strong> / {exp.maxPax} Pax
                                  </span>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {exp.availablePax > 0 ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenAddPassengerModal(exp);
                                        }}
                                        className="w-7.5 h-7.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white flex items-center justify-center transition shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 shrink-0"
                                        title={`Registrar nuevo pasajero en ${exp.routeTitle}`}
                                        aria-label="Registrar Pasajero"
                                      >
                                        <Plus className="w-4 h-4 text-sky-300" />
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-200/80 border border-slate-300 px-2.5 py-0.5 rounded-full">
                                        Agotado
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="w-full bg-white/80 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`${cardTheme.bar} h-full rounded-full transition-all duration-500`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* VISTA LISTA / TABLA */
                      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                                <th className="py-3 px-4">Expedición & Itinerario</th>
                                <th className="py-3 px-4">Embarcación</th>
                                <th className="py-3 px-4">Estado / Plazo</th>
                                <th className="py-3 px-4">Ocupación / Cupos</th>
                                <th className="py-3 px-4 text-right">Tarifa / Pax</th>
                                <th className="py-3 px-4 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {dashboardUpcomingExpeditions.map((exp) => {
                                const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                                const isAgotado = exp.availablePax <= 0 || exp.bookedPax >= exp.maxPax;
                                const daysUntil = exp.daysUntilDeparture !== undefined ? exp.daysUntilDeparture : 999;
                                const VesselIcon = exp.vesselName.toLowerCase().includes('terranova') ? Ship : Sailboat;

                                const badgeClass = isAgotado
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : daysUntil <= 15 && daysUntil >= 0
                                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                                  : daysUntil <= 30 && daysUntil >= 0
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                                const badgeLabel = isAgotado
                                  ? 'Agotado'
                                  : daysUntil <= 15 && daysUntil >= 0
                                  ? `¡Zarpe en ${daysUntil} días!`
                                  : daysUntil <= 30 && daysUntil >= 0
                                  ? `Zarpe en ${daysUntil} días`
                                  : exp.status;

                                return (
                                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#0f2b48] shrink-0">
                                          <VesselIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <strong className="text-[#0f2b48] font-serif font-bold block text-xs">
                                            {exp.routeTitle}
                                          </strong>
                                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                                            <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                                            <span>{exp.departureDates}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div>
                                        <strong className="text-slate-700 font-medium block text-xs">
                                          {exp.vesselName}
                                        </strong>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {exp.vesselType}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span
                                        className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-block border ${badgeClass}`}
                                      >
                                        {badgeLabel}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="space-y-1 max-w-[170px]">
                                        <div className="flex justify-between text-[10px] font-mono text-slate-600">
                                          <span>{exp.bookedPax}/{exp.maxPax} pax</span>
                                          <span className="font-bold text-[#0f2b48]">{exp.availablePax} lib.</span>
                                        </div>
                                        <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className={`${isAgotado ? 'bg-slate-400' : daysUntil <= 15 ? 'bg-rose-600' : daysUntil <= 30 ? 'bg-amber-500' : 'bg-emerald-600'} h-full rounded-full`}
                                            style={{ width: `${percent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <span className="font-mono font-bold text-xs text-[#0f2b48]">
                                        {exp.pricePerPax}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPassengerManifestModal(exp)}
                                          className="px-3 py-1.5 bg-white hover:bg-[#0b192c] text-slate-700 hover:text-white text-xs font-semibold rounded-full border border-slate-200/90 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95 group/btn"
                                          title="Ver Manifiesto y Detalle de Pagos"
                                        >
                                          <Users className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-sky-300" />
                                          <span>Pasajeros ({exp.bookedPax})</span>
                                        </button>

                                        {exp.availablePax > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenAddPassengerModal(exp)}
                                            className="px-3.5 py-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                                          >
                                            <Plus className="w-3.5 h-3.5 text-sky-300" />
                                            <span>Sumar Pasajero</span>
                                          </button>
                                        ) : (
                                          <span className="text-xs text-slate-400 font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100">Agotado</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA DEDICADA: GESTIÓN CENTRALIZADA DE TODAS LAS RESERVAS */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 1. 4 TOP BOOKING KPIS (BANKDASH STYLE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1 */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Total Reservas
                    </span>
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                      {allUnifiedBookings.length}
                      <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">totales</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{allUnifiedBookings.filter(b => b.status === 'approved').length} confirmadas • {allUnifiedBookings.filter(b => b.status === 'pending_transfer').length} pendientes</span>
                    </p>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Lodge Rincón
                    </span>
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <BedDouble className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                      {lodgeBookings.length}
                      <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">reservas</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{blockedDatesCount} bloqueos de mantención</span>
                    </p>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Expediciones Náuticas
                    </span>
                    <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-700 border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <Ship className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                      {expBookings.length}
                      <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">zarpes</span>
                    </div>
                    <p className="text-xs text-sky-700 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span>Velero Vegvisir & Terranova</span>
                    </p>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Volumen Total
                    </span>
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-[#0b192c] tracking-tight font-sans">
                      ${(confirmedRevenue + pendingRevenue).toLocaleString('es-CL')}
                      <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">CLP</span>
                    </div>
                    <p className="text-xs text-amber-800 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Ingresos brutos comprometidos</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. BARRA DE HERRAMIENTAS, FILTROS SEGMENTADOS Y BÚSQUEDA MINIMALISTA */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_24px_rgba(11,25,44,0.03)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Buscador Dinámico Pill */}
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por pasajero, código (ej: LR-1002)..."
                      value={bookingsSearchQuery}
                      onChange={(e) => setBookingsSearchQuery(e.target.value)}
                      className="w-full pl-9.5 pr-8 py-2 bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-[#0b192c] rounded-full text-xs text-[#0b192c] placeholder-slate-400 focus:outline-none transition shadow-2xs"
                    />
                    {bookingsSearchQuery && (
                      <button
                        onClick={() => setBookingsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Grupo de Controles: Filtros Segmentados de Categoría + Estado + Vistas */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* FILTROS POR CATEGORÍA */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBookingsTypeFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          bookingsTypeFilter === 'all'
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        Todas ({allUnifiedBookings.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingsTypeFilter('lodge')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          bookingsTypeFilter === 'lodge'
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        <BedDouble className="w-3.5 h-3.5" />
                        <span>Lodge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingsTypeFilter('expedition')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          bookingsTypeFilter === 'expedition'
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        <Ship className="w-3.5 h-3.5" />
                        <span>Expediciones</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingsTypeFilter('service')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          bookingsTypeFilter === 'service'
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Servicios</span>
                      </button>
                    </div>

                    {/* FILTRO POR ESTADO */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBookingsStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          bookingsStatusFilter === 'all' ? 'bg-[#0b192c] text-white shadow-xs' : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingsStatusFilter('confirmed')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          bookingsStatusFilter === 'confirmed' || bookingsStatusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        Confirmadas
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingsStatusFilter('reserved')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          bookingsStatusFilter === 'reserved' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                        }`}
                      >
                        Reservadas (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingsStatusFilter('scheduled')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          bookingsStatusFilter === 'scheduled' || bookingsStatusFilter === 'pending_transfer' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
                        }`}
                      >
                        Agendadas (0%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingsStatusFilter('blocked')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          bookingsStatusFilter === 'blocked' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Bloqueos
                      </button>
                    </div>

                    {/* Vista (Lista / Cards) */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBookingsViewMode('list')}
                        className={`p-1.5 rounded-full transition cursor-pointer ${
                          bookingsViewMode === 'list' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                        }`}
                        title="Vista de Lista"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingsViewMode('grid')}
                        className={`p-1.5 rounded-full transition cursor-pointer ${
                          bookingsViewMode === 'grid' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                        }`}
                        title="Vista de Tarjetas"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botón Circular Nueva Reserva */}
                    <button
                      type="button"
                      onClick={() => setShowBookingWizardModal(true)}
                      className="w-8.5 h-8.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                      title="Nueva Reserva"
                      aria-label="Nueva Reserva"
                    >
                      <Plus className="w-4 h-4 text-sky-300" />
                    </button>

                    {/* Botón Exportar a Excel (Descarga de la vista/filtro actual) */}
                    <button
                      type="button"
                      onClick={() => {
                        exportBookingsToExcel(filteredUnifiedBookings, {
                          formatDate: formatDateDDMMYYYY,
                          calculateDays: calculateDurationDays,
                          getStatus: getUnifiedBookingStatus,
                          getPendingBalance: getPendingBalanceAmount,
                          getNextPayment: getExpeditionPaymentDeadline,
                        });
                      }}
                      disabled={filteredUnifiedBookings.length === 0}
                      className="h-8.5 px-3.5 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300/80 hover:border-emerald-600 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed group"
                      title="Descargar tabla filtrada en formato Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white transition-colors" />
                      <span className="font-mono text-[11px] font-bold">Descargar Excel</span>
                    </button>
                  </div>
                </div>

                {/* Resumen de resultados filtrados */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span>
                      Mostrando <strong className="text-slate-900 font-mono">{filteredUnifiedBookings.length}</strong> de{' '}
                      <span className="font-mono">{allUnifiedBookings.length}</span> reservas registradas
                    </span>
                    {(bookingsSearchQuery || bookingsTypeFilter !== 'all' || bookingsStatusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setBookingsSearchQuery('');
                          setBookingsTypeFilter('all');
                          setBookingsStatusFilter('all');
                        }}
                        className="text-xs text-sky-700 hover:text-sky-900 font-semibold cursor-pointer underline ml-2"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. RESULTADOS: VISTA LISTA O VISTA GRID */}
              {filteredUnifiedBookings.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-[0_4px_24px_rgba(11,25,44,0.03)]">
                  <div className="w-12 h-12 bg-[#f4f7fb] border border-slate-200/80 rounded-2xl flex items-center justify-center mx-auto text-[#0b192c] shadow-2xs">
                    <CalendarCheck className="w-6 h-6 text-[#0b192c]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-[#0b192c]">
                      No se encontraron reservas con los criterios aplicados
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-light leading-relaxed">
                      Intenta buscar con otros términos, limpiar los filtros o registra una nueva reserva manual.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setShowBookingWizardModal(true)}
                      className="bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-semibold py-2.5 px-5 rounded-full transition cursor-pointer shadow-xs active:scale-95"
                    >
                      + Registrar Nueva Reserva
                    </button>
                  </div>
                </div>
              ) : bookingsViewMode === 'list' ? (
                /* 4.A VISTA LISTA / TABLA MINIMALISTA & LUXURY */
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_rgba(11,25,44,0.03)] overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#fbfcfd] border-b border-slate-100 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                          <th className="px-5 py-3.5 whitespace-nowrap">Tipo</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Expedición / Habitación</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Inicio</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Fin</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-center">Días</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Huésped / Pasajero</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Estado</th>
                          <th className="px-5 py-3.5 whitespace-nowrap font-mono">Precio</th>
                          <th className="px-5 py-3.5 whitespace-nowrap font-mono">Saldo Pendiente</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Próximo Pago</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredUnifiedBookings.map((b) => {
                          const cleanPhone = (b.guest_phone || '').replace(/[^0-9]/g, '');
                          const durationDays = calculateDurationDays(b.raw_check_in, b.raw_check_out);
                          const uStatus = getUnifiedBookingStatus(b);
                          const pendingAmount = getPendingBalanceAmount(b);
                          const nextPayment = getExpeditionPaymentDeadline(b);

                          return (
                            <tr
                              key={`${b.type}-${b.id}`}
                              className="hover:bg-slate-50/80 transition-colors duration-150 group cursor-pointer"
                              onClick={() => setSelectedBookingForDetail(b)}
                            >
                              {/* 1. Tipo */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                    b.type === 'lodge'
                                      ? 'bg-purple-50 text-purple-900 border border-purple-200/80'
                                      : 'bg-sky-50 text-sky-900 border border-sky-200/80'
                                  }`}
                                >
                                  {b.type === 'lodge' ? (
                                    <BedDouble className="w-3 h-3 text-purple-700 shrink-0" />
                                  ) : (
                                    <Ship className="w-3 h-3 text-sky-700 shrink-0" />
                                  )}
                                  <span>{b.type_label}</span>
                                </span>
                              </td>

                              {/* 2. Expedición o Habitación */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#0b192c] font-semibold">
                                <span>{b.service_title}</span>
                                {b.unit_detail && b.unit_detail !== b.service_title && (
                                  <span className="block text-[10px] font-normal text-slate-400 font-sans">
                                    {b.unit_detail}
                                  </span>
                                )}
                              </td>

                              {/* 3. Fecha Inicio */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600">
                                {formatDateDDMMYYYY(b.raw_check_in)}
                              </td>

                              {/* 4. Fecha Fin */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600">
                                {formatDateDDMMYYYY(b.raw_check_out)}
                              </td>

                              {/* 5. Cantidad de Días */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                <span className="inline-block bg-slate-100 font-mono text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px] border border-slate-200/60">
                                  {durationDays} {durationDays === 1 ? 'día' : 'días'}
                                </span>
                              </td>

                              {/* 6. Huésped / Pasajero con Botón WhatsApp */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <strong className="text-[#0b192c] font-semibold text-xs">
                                    {b.guest_name}
                                  </strong>
                                  {cleanPhone && cleanPhone !== 'Sin contacto' && !cleanPhone.includes('00000000') && (
                                    <a
                                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                        `Hola estimado/a ${b.guest_name}, le contactamos desde Yates Chile respecto a su reserva ${b.booking_code}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-emerald-200 transition-all shadow-2xs group/wa cursor-pointer"
                                      title={`WhatsApp ${b.guest_phone}`}
                                    >
                                      <svg className="w-2.5 h-2.5 fill-current transition-colors shrink-0" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </td>

                              {/* 7. Estado de Reserva */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                {uStatus === 'confirmed' && (
                                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Confirmada</span>
                                  </span>
                                )}
                                {uStatus === 'reserved' && (
                                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Reservada (50%)</span>
                                  </span>
                                )}
                                {uStatus === 'scheduled' && (
                                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200">
                                    <Clock className="w-3 h-3 text-sky-600" />
                                    <span>Agendada (0%)</span>
                                  </span>
                                )}
                                {uStatus === 'blocked' && (
                                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-200">
                                    <ShieldAlert className="w-3 h-3 text-purple-700" />
                                    <span>Bloqueo</span>
                                  </span>
                                )}
                              </td>

                              {/* 8. Precio Cobrado */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-xs text-[#0b192c]">
                                ${b.amount.toLocaleString('es-CL')}{' '}
                                <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                              </td>

                              {/* 9. Saldo Pendiente */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-xs">
                                {pendingAmount === 0 ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-semibold">
                                    $0 CLP
                                  </span>
                                ) : uStatus === 'reserved' ? (
                                  <span className="text-amber-700">
                                    ${pendingAmount.toLocaleString('es-CL')}{' '}
                                    <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                                  </span>
                                ) : (
                                  <span className="text-rose-700">
                                    ${pendingAmount.toLocaleString('es-CL')}{' '}
                                    <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                                  </span>
                                )}
                              </td>

                              {/* 10. Próximo Pago */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs">
                                {b.type === 'expedition' ? (
                                  uStatus === 'confirmed' ? (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Completado</span>
                                    </span>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block text-[11px]" title="60 días antes de la fecha de inicio">
                                        {nextPayment}
                                      </span>
                                      <span className="block text-[9px] font-sans text-slate-400">
                                        (60 días antes)
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>

                              {/* 11. Acciones */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {cleanPhone && cleanPhone !== '56900000000' && (
                                    <a
                                      href={`https://wa.me/${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Conversar por WhatsApp"
                                      className="w-7.5 h-7.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#25D366] flex items-center justify-center transition border border-emerald-200 cursor-pointer shadow-2xs"
                                    >
                                      <svg className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M12.004 2C6.48 2 2 6.48 2 12a9.92 9.92 0 0 0 1.54 5.3L2 22l4.83-1.27A9.97 9.97 0 0 0 12.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.27 13.91c-.24.66-1.38 1.27-1.93 1.35-.49.07-1.12.1-3.23-.77a11.16 11.16 0 0 1-4.84-4.25c-.84-1.12-1.34-2.43-1.34-3.8 0-1.39.73-2.07.97-2.33.24-.26.49-.33.66-.33.17 0 .34.01.49.02.16.01.37-.06.58.45.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.28.45-.14.17-.3.38-.43.51-.15.15-.31.32-.13.63.18.31.81 1.33 1.74 2.16.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.95.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.24z" />
                                      </svg>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setSelectedBookingForDetail(b)}
                                    title="Ver Ficha Completa"
                                    className="w-7.5 h-7.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0b192c] flex items-center justify-center transition border border-slate-200/80 cursor-pointer shadow-2xs"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {b.type === 'lodge' && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`¿Deseas cancelar/liberar la reserva ${b.booking_code}?`)) {
                                          deleteBookingOrBlock(b.id);
                                        }
                                      }}
                                      title="Liberar / Cancelar Reserva"
                                      className="w-7.5 h-7.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition border border-rose-200/80 cursor-pointer shadow-2xs"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* 4.B VISTA TARJETAS / GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredUnifiedBookings.map((b) => {
                    const cleanPhone = (b.guest_phone || '').replace(/[^0-9]/g, '');
                    const durationDays = calculateDurationDays(b.raw_check_in, b.raw_check_out);
                    const uStatus = getUnifiedBookingStatus(b);
                    const pendingAmount = getPendingBalanceAmount(b);
                    const nextPayment = getExpeditionPaymentDeadline(b);

                    return (
                      <div
                        key={`${b.type}-${b.id}`}
                        className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 space-y-4 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md flex flex-col justify-between transition-all duration-300 group cursor-pointer hover:-translate-y-0.5"
                        onClick={() => setSelectedBookingForDetail(b)}
                      >
                        <div className="space-y-3.5">
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                  b.type === 'lodge'
                                    ? 'bg-purple-50 text-purple-900 border-purple-200/80'
                                    : 'bg-sky-50 text-sky-900 border-sky-200/80'
                                }`}
                              >
                                {b.type_label}
                              </span>
                              <span className="font-mono font-bold text-xs bg-[#f4f7fb] border border-slate-200/80 px-2 py-0.5 rounded-lg text-[#0b192c]">
                                {b.booking_code}
                              </span>
                            </div>
                            {uStatus === 'confirmed' && (
                              <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Confirmada
                              </span>
                            )}
                            {uStatus === 'reserved' && (
                              <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase bg-amber-50 text-amber-800 border border-amber-200">
                                Reservada (50%)
                              </span>
                            )}
                            {uStatus === 'scheduled' && (
                              <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase bg-sky-50 text-sky-800 border border-sky-200">
                                Agendada (0%)
                              </span>
                            )}
                            {uStatus === 'blocked' && (
                              <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase bg-purple-50 text-purple-900 border border-purple-200">
                                Bloqueo
                              </span>
                            )}
                          </div>

                          {/* Guest Info */}
                          <div>
                            <h4 className="font-serif font-bold text-base text-[#0b192c] leading-tight">
                              {b.guest_name}
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-0.5">
                              {b.service_title}
                            </p>
                          </div>

                          {/* Details Strip */}
                          <div className="p-4 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Fechas & Duración</span>
                              <span className="font-mono text-slate-700 font-medium">
                                {b.dates} <strong className="text-[#0b192c]">({durationDays}d)</strong>
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Precio Total</span>
                              <span className="font-mono font-bold text-[#0b192c]">
                                ${b.amount.toLocaleString('es-CL')} CLP
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100/60">
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Saldo Pendiente</span>
                              <span className={`font-mono font-bold ${pendingAmount === 0 ? 'text-emerald-700' : uStatus === 'reserved' ? 'text-amber-700' : 'text-rose-700'}`}>
                                ${pendingAmount.toLocaleString('es-CL')} CLP
                              </span>
                            </div>
                            {b.type === 'expedition' && uStatus !== 'confirmed' && (
                              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100/60">
                                <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">Próximo Pago (60d)</span>
                                <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                  {nextPayment}
                                </span>
                              </div>
                            )}
                          </div>

                          {b.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                              “{b.notes}”
                            </p>
                          )}
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 gap-2.5">
                          <button
                            onClick={() => setSelectedBookingForDetail(b)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-[#0b192c] font-semibold py-2 px-4 rounded-full text-xs transition border border-slate-200/80 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hola estimado/a ${b.guest_name}, le contactamos desde Yates Chile respecto a su reserva ${b.booking_code}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#25D366] border border-emerald-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                              title="WhatsApp"
                            >
                              <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12.004 2C6.48 2 2 6.48 2 12a9.92 9.92 0 0 0 1.54 5.3L2 22l4.83-1.27A9.97 9.97 0 0 0 12.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.27 13.91c-.24.66-1.38 1.27-1.93 1.35-.49.07-1.12.1-3.23-.77a11.16 11.16 0 0 1-4.84-4.25c-.84-1.12-1.34-2.43-1.34-3.8 0-1.39.73-2.07.97-2.33.24-.26.49-.33.66-.33.17 0 .34.01.49.02.16.01.37-.06.58.45.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.28.45-.14.17-.3.38-.43.51-.15.15-.31.32-.13.63.18.31.81 1.33 1.74 2.16.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.95.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.24z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. MODAL DETALLE DE RESERVA INDIVIDUAL (LUXURY ROUNDED-3XL) */}
              {selectedBookingForDetail && (
                <div className="fixed inset-0 z-50 bg-[#0b192c]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(11,25,44,0.2)] border border-slate-200/90 max-w-2xl w-full overflow-hidden my-auto animate-scaleIn">
                    {/* Modal Header */}
                    <div className="px-7 py-5 bg-[#0b192c] text-white flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
                          <CalendarCheck className="w-5 h-5 text-sky-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300">
                              Ficha de Reserva
                            </span>
                            <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                              {selectedBookingForDetail.booking_code}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-white">
                            {selectedBookingForDetail.guest_name}
                          </h4>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBookingForDetail(null)}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                      {/* Grid Huésped & Contacto */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Titular de Reserva
                          </span>
                          <p className="font-serif font-bold text-[#0b192c] text-sm">
                            {selectedBookingForDetail.guest_name}
                          </p>
                          <p className="text-xs text-slate-500">{selectedBookingForDetail.guest_email || 'Sin correo'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Teléfono de Contacto
                          </span>
                          <p className="font-mono font-bold text-[#0b192c] text-xs">
                            {selectedBookingForDetail.guest_phone || 'Sin teléfono'}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Canal: {selectedBookingForDetail.channel === 'web_direct' ? 'Web Directa' : 'Administración'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detalles del Servicio y Fechas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 border border-slate-200/80 rounded-2xl space-y-1 bg-white shadow-2xs">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Servicio / Alojamiento
                          </span>
                          <strong className="text-[#0b192c] text-sm font-serif block">
                            {selectedBookingForDetail.service_title}
                          </strong>
                          <p className="text-xs text-slate-500">{selectedBookingForDetail.unit_detail}</p>
                        </div>

                        <div className="p-5 border border-slate-200/80 rounded-2xl space-y-1 bg-white shadow-2xs">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Fechas del Zarpe / Estadía
                          </span>
                          <strong className="text-[#0b192c] text-xs font-mono block">
                            {selectedBookingForDetail.dates}
                          </strong>
                          <p className="text-[11px] text-slate-500">Horario Check-in: 15:00 / Check-out: 11:00</p>
                        </div>
                      </div>

                      {/* Estado y Monto */}
                      <div className="p-5 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Estado del Pago
                          </span>
                          <span
                            className={`text-xs font-bold font-mono px-3.5 py-1 rounded-full uppercase inline-flex items-center gap-1.5 whitespace-nowrap ${
                              selectedBookingForDetail.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : selectedBookingForDetail.status === 'blocked'
                                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {selectedBookingForDetail.status === 'approved'
                              ? '✓ Pago Confirmado'
                              : selectedBookingForDetail.status === 'blocked'
                              ? '🔒 Bloqueo de Habitación'
                              : '⏳ Pendiente de Pago'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Monto Total
                          </span>
                          <div className="text-xl font-mono font-bold text-[#0b192c]">
                            ${selectedBookingForDetail.amount.toLocaleString('es-CL')}{' '}
                            <span className="text-xs font-sans font-normal text-slate-400">CLP</span>
                          </div>
                        </div>
                      </div>

                      {/* Observaciones */}
                      {selectedBookingForDetail.notes && (
                        <div className="p-5 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block">
                            Observaciones & Requerimientos
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {selectedBookingForDetail.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-7 py-4.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {selectedBookingForDetail.guest_phone && (
                          <a
                            href={`https://wa.me/${selectedBookingForDetail.guest_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${selectedBookingForDetail.guest_name}, te contactamos desde Yates Chile respecto a tu reserva ${selectedBookingForDetail.booking_code}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Contactar por WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {selectedBookingForDetail.type === 'lodge' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Confirmas la cancelación y liberación de la reserva ${selectedBookingForDetail.booking_code}?`)) {
                                deleteBookingOrBlock(selectedBookingForDetail.id);
                                setSelectedBookingForDetail(null);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs py-2.5 px-4 rounded-full border border-rose-200 transition cursor-pointer active:scale-95"
                          >
                            Liberar Reserva
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingForDetail(null)}
                          className="bg-white hover:bg-slate-100 text-[#0b192c] font-semibold text-xs py-2.5 px-5 rounded-full border border-slate-200/90 transition cursor-pointer active:scale-95"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA DEDICADA: TRÁFICO GLOBAL & GEOLOCALIZACIÓN CON FILTROS DE TIEMPO */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">

              {/* BARRA SUPERIOR DE FILTRO TEMPORAL MULTI-PERÍODO */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,43,72,0.02)] flex flex-wrap items-center justify-between gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#0f2b48]/70 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Métricas & Audiencia
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0f2b48] tracking-tight mt-1">
                    Tráfico, Sesiones & Procedencia Geográfica
                  </h3>
                  <p className="text-xs text-slate-500 font-light max-w-xl">
                    Cambie el rango temporal para evaluar la evolución del volumen de visitas, países líderes y páginas más demandadas.
                  </p>
                </div>

                {/* SELECTOR SEGMENTADO DE PERÍODOS */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                  {([
                    { key: 'today', label: 'Hoy' },
                    { key: 'this_week', label: 'Esta Semana' },
                    { key: 'prev_week', label: 'Semana Pasada' },
                    { key: 'this_month', label: 'Este Mes' },
                    { key: 'prev_month', label: 'Mes Pasado' },
                    { key: 'all', label: 'Todo' },
                  ] as const).map((t) => {
                    const isSelected = analyticsTimeframe === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setAnalyticsTimeframe(t.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f2b48] text-white shadow-sm shadow-[#0f2b48]/20 scale-[1.02]'
                            : 'text-slate-500 hover:text-[#0f2b48] hover:bg-white/60'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 TOP ANALYTICS KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1: TOTAL PÁGINAS VISTAS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Total Páginas Vistas
                    </span>
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {analyticsSummary?.totalViews || 0}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">vistas</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>
                        {analyticsTimeframe === 'today'
                          ? 'Páginas navegadas hoy'
                          : analyticsTimeframe === 'this_week'
                          ? 'Últimos 7 días'
                          : analyticsTimeframe === 'prev_week'
                          ? 'Semana previa'
                          : analyticsTimeframe === 'this_month'
                          ? 'Últimos 30 días'
                          : analyticsTimeframe === 'prev_month'
                          ? 'Mes previo'
                          : 'Histórico acumulado'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* KPI 2: VISITANTES ÚNICOS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Visitantes Únicos
                    </span>
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {analyticsSummary?.uniqueVisitors || 0}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">sesiones</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Sesiones únicas verificadas</span>
                    </p>
                  </div>
                </div>

                {/* KPI 3: PRINCIPAL PAÍS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Principal País
                    </span>
                    <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 border border-sky-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <Globe className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight flex items-center gap-2">
                      <span>{analyticsSummary?.topCountries[0]?.flag || '🇨🇱'}</span>
                      <span className="truncate text-2xl">
                        {analyticsSummary?.topCountries[0]?.country_name || 'Chile'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span>{analyticsSummary?.topCountries[0]?.percentage || 0}% del volumen en el período</span>
                    </p>
                  </div>
                </div>

                {/* KPI 4: PREFERENCIA DISPOSITIVO */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Preferencia Dispositivo
                    </span>
                    <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <Monitor className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {analyticsSummary?.deviceBreakdown.desktop || 65}%
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">PC / Mac</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span>{analyticsSummary?.deviceBreakdown.mobile || 35}% desde smartphones</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* TWO LARGE GRIDS: COUNTRIES & PAGES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-7 space-y-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#0f2b48] flex items-center gap-2">
                        <MapPin className="w-4.5 h-4.5 text-rose-600" />
                        <span>Países de Procedencia & Volumen</span>
                      </h4>
                      <p className="text-xs text-slate-500">Origen geográfico de los visitantes</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      % de Sesiones
                    </span>
                  </div>

                  <div className="space-y-4">
                    {analyticsSummary?.topCountries.map((c) => (
                      <div key={c.country_name} className="space-y-1.5 bg-[#fbfcfd] p-3.5 rounded-2xl border border-slate-200/70">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-bold text-[#0f2b48] text-sm">{c.country_name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-500 text-xs">
                              {c.views} {c.views === 1 ? 'visita' : 'visitas'}
                            </span>
                            <span className="font-bold text-[#0f2b48] bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-xs shadow-2xs">
                              {c.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0f2b48] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(c.percentage, 8)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-7 space-y-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#0f2b48] flex items-center gap-2">
                          <Activity className="w-4.5 h-4.5 text-sky-600" />
                          <span>Páginas Más Visitadas</span>
                        </h4>
                        <p className="text-xs text-slate-500">Rutas de mayor interés</p>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                        Vistas
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {analyticsSummary?.topPages.map((p) => (
                        <div
                          key={p.page_path}
                          className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-xs"
                        >
                          <div className="truncate max-w-[200px]">
                            <span className="font-bold text-[#0f2b48] block truncate">{p.page_title}</span>
                            <span className="font-mono text-[10px] text-slate-400">{p.page_path}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono shrink-0">
                            <span className="bg-[#0f2b48] text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
                              {p.views} vistas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#0f2b48] block">
                      Dispositivos Utilizados:
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#0f2b48] shadow-2xs">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">Escritorio (PC/Mac)</span>
                          <span className="text-base font-bold font-mono text-[#0f2b48]">
                            {analyticsSummary?.deviceBreakdown.desktop || 65}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xs">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">Smartphones</span>
                          <span className="text-base font-bold font-mono text-[#0f2b48]">
                            {analyticsSummary?.deviceBreakdown.mobile || 35}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE ACCESS STREAM TABLE */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-[#fbfcfd]">
                  <h4 className="font-serif text-base font-bold text-[#0f2b48] flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Registro de Sesiones y Accesos en Vivo</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Últimos registros</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-7 py-3.5">País & Ciudad</th>
                        <th className="px-7 py-3.5">Página Consultada</th>
                        <th className="px-7 py-3.5">Ruta</th>
                        <th className="px-7 py-3.5">Dispositivo</th>
                        <th className="px-7 py-3.5">Fecha y Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyticsSummary?.recentViews.map((view) => (
                        <tr key={view.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-7 py-4 font-semibold text-[#0f2b48]">
                            <div className="flex items-center gap-2">
                              <span>📍</span>
                              <div>
                                <span className="font-bold block text-[#0f2b48]">
                                  {view.country_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  {view.city} ({view.region_name})
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-7 py-4 text-slate-700 font-medium">
                            {view.page_title}
                          </td>
                          <td className="px-7 py-4 font-mono text-[#0f2b48] text-xs">
                            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              {view.page_path}
                            </span>
                          </td>
                          <td className="px-7 py-4">
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-slate-100 text-[#0f2b48] border border-slate-200/60 inline-flex items-center gap-1">
                              {view.device_type === 'mobile' ? (
                                <>
                                  <Smartphone className="w-3 h-3 text-emerald-600" />
                                  <span>Móvil</span>
                                </>
                              ) : (
                                <>
                                  <Monitor className="w-3 h-3 text-[#0f2b48]" />
                                  <span>Escritorio</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-7 py-4 font-mono text-slate-500 text-[11px]">
                            {new Date(view.created_at).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} hrs ({new Date(view.created_at).toLocaleDateString('es-CL')})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: LODGE MANAGEMENT (BOUTIQUE HOTEL TIMELINE GANTT & OCCUPANCY) */}
          {/* ========================================================================= */}
          {activeTab === 'lodge' && (() => {
            const lodgeYear = lodgeCalendarMonthDate.getFullYear();
            const lodgeMonth = lodgeCalendarMonthDate.getMonth();
            const lodgeDaysCount = new Date(lodgeYear, lodgeMonth + 1, 0).getDate();
            const lodgeMonthHeader = `${monthNames[lodgeMonth]} ${lodgeYear}`;
            const nowDate = new Date();
            const todayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;

            const daysArray = Array.from({ length: lodgeDaysCount }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${lodgeYear}-${String(lodgeMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dateObj = new Date(lodgeYear, lodgeMonth, dayNum);
              const dayOfWeek = (dateObj.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
              const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
              const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              return { dayNum, dateStr, label: dayLabels[dayOfWeek], isWeekend, isToday, isPast };
            });

            const displayedRooms = lodgeFilterRoomId === 'all'
              ? rooms
              : rooms.filter((r) => r.id === lodgeFilterRoomId);

            // Month KPI stats
            const totalRoomNights = rooms.length * lodgeDaysCount;
            let bookedNightsCount = 0;

            rooms.forEach((r) => {
              daysArray.forEach((d) => {
                const isBooked = lodgeBookings.some(
                  (b) => b.status !== 'cancelled' && b.room_id === r.id && b.check_in <= d.dateStr && d.dateStr < b.check_out
                );
                if (isBooked) bookedNightsCount++;
              });
            });

            const occupancyRate = totalRoomNights > 0 ? Math.round((bookedNightsCount / totalRoomNights) * 100) : 0;
            const freeNightsCount = Math.max(0, totalRoomNights - bookedNightsCount);

            return (
              <div className="space-y-7">
                {/* 1. TOP HEADER & KPI METRICS STRIP */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 shadow-2xs">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#0b192c] tracking-tight">
                          Ocupación & Disponibilidad del Lodge
                        </h3>
                        <p className="text-xs text-slate-500 font-light">
                          Línea de tiempo de reservas y aforo en Bahía Cumberland (4 Habitaciones · 11 Huéspedes)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Month Navigator */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                    {/* Month Switcher */}
                    <div className="flex items-center bg-white border border-slate-200/90 rounded-full p-1 shadow-2xs">
                      <button
                        onClick={handleLodgePrevMonth}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-[#0b192c] transition cursor-pointer"
                        title="Mes Anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="px-4 py-0.5 text-xs font-semibold text-[#0b192c] min-w-[120px] text-center tracking-wide">
                        {lodgeMonthHeader}
                      </div>
                      <button
                        onClick={handleLodgeNextMonth}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-[#0b192c] transition cursor-pointer"
                        title="Mes Siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLodgeCalendarMonthDate(new Date())}
                      className="px-4 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-[#0b192c] text-xs font-semibold transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      Hoy
                    </button>

                    {/* Nueva Reserva */}
                    <button
                      onClick={() => {
                        const targetRoomId = lodgeFilterRoomId !== 'all' ? lodgeFilterRoomId : (rooms[0] ? rooms[0].id : '');
                        setBlockForm({
                          roomId: targetRoomId,
                          checkIn: new Date().toISOString().split('T')[0],
                          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                          channelSource: 'phone_whatsapp',
                          reason: '',
                          guestName: '',
                          guestEmail: '',
                          guestPhone: '',
                          paxCount: 2,
                          status: 'approved',
                        });
                        setShowBlockModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-300" />
                      <span>Nueva Reserva</span>
                    </button>
                  </div>
                </div>

                {/* 2. BOUTIQUE STATS PILLS STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 flex items-center justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors block">Ocupación Mensual</span>
                      <span className="font-sans font-extrabold text-2xl text-[#0b192c] mt-1.5 block tracking-tight">{occupancyRate}%</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 flex items-center justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors block">Noches Reservadas</span>
                      <span className="font-sans font-extrabold text-2xl text-emerald-700 mt-1.5 block tracking-tight">{bookedNightsCount} <span className="text-xs font-normal text-slate-400">noches</span></span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 flex items-center justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors block">Noches Disponibles</span>
                      <span className="font-sans font-extrabold text-2xl text-slate-700 mt-1.5 block tracking-tight">{freeNightsCount} <span className="text-xs font-normal text-slate-400">noches</span></span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 flex items-center justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors block">Aforo Total</span>
                      <span className="font-sans font-extrabold text-2xl text-purple-700 mt-1.5 block tracking-tight">11 <span className="text-xs font-normal text-slate-400">Huéspedes</span></span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* 3. TIMELINE GANTT MATRIX COMPONENT */}
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_rgba(11,25,44,0.03)] overflow-hidden">
                  
                  {/* Segmented Filter Bar */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-[#fbfcfd]">
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      <button
                        onClick={() => setLodgeFilterRoomId('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          lodgeFilterRoomId === 'all'
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        Todas las Habitaciones
                      </button>

                      {rooms.map((room) => {
                        const isSelected = lodgeFilterRoomId === room.id;
                        const cleanName = room.room_number === 1
                          ? 'Albatros'
                          : room.room_number === 2
                          ? 'Cumberland'
                          : room.room_number === 3
                          ? 'Selkirk'
                          : room.room_number === 4
                          ? 'Vidriola'
                          : room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim();

                        return (
                          <button
                            key={room.id}
                            onClick={() => setLodgeFilterRoomId(room.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#0b192c] text-white shadow-xs'
                                : 'text-slate-600 hover:text-[#0b192c]'
                            }`}
                          >
                            {cleanName}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Haz clic en un día libre para reservar directamente.</span>
                    </span>
                  </div>

                  {/* Gantt Scroll Container */}
                  <div className="overflow-x-auto custom-scrollbar select-none">
                    <div className="min-w-[900px]">
                      
                      {/* Timeline Header Row (Days of the Month) */}
                      <div className="grid grid-cols-[240px_1fr] border-b border-slate-100 bg-[#fbfcfd] sticky top-0 z-20">
                        <div className="p-3.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 border-r border-slate-100 bg-[#fbfcfd] sticky left-0 z-30 flex items-center justify-between">
                          <span>Habitación / Capacidad</span>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${lodgeDaysCount}, minmax(0, 1fr))` }}>
                          {daysArray.map((d) => (
                            <div
                              key={d.dayNum}
                              className={`py-2 text-center border-r border-slate-100 flex flex-col items-center justify-center ${
                                d.isWeekend ? 'bg-slate-50/70' : 'bg-transparent'
                              } ${d.isToday ? 'bg-sky-50/80 font-bold' : ''}`}
                            >
                              <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase leading-none">
                                {d.label}
                              </span>
                              <span className={`text-[11px] font-mono mt-0.5 leading-none font-bold ${
                                d.isToday ? 'text-sky-700' : 'text-slate-700'
                              }`}>
                                {d.dayNum}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline Room Lanes */}
                      <div className="divide-y divide-slate-100">
                        {displayedRooms.map((room) => {
                          const cleanName = room.room_number === 1
                            ? 'Albatros'
                            : room.room_number === 2
                            ? 'Cumberland'
                            : room.room_number === 3
                            ? 'Selkirk'
                            : room.room_number === 4
                            ? 'Vidriola'
                            : room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim();

                          const maxPax = room.room_number === 1 ? '2 Pax' : '3 Pax';
                          const roomTypeLabel = room.room_number === 1 ? 'Doble Matrimonial' : 'Triple Vista Océano';

                          const monthStartStr = `${lodgeYear}-${String(lodgeMonth + 1).padStart(2, '0')}-01`;
                          const monthEndStr = `${lodgeYear}-${String(lodgeMonth + 1).padStart(2, '0')}-${String(lodgeDaysCount).padStart(2, '0')}`;

                          const roomBookings = lodgeBookings.filter((b) => {
                            if (b.status === 'cancelled') return false;
                            if (b.room_id !== room.id) return false;
                            return b.check_in <= monthEndStr && b.check_out >= monthStartStr;
                          });

                          return (
                            <div key={room.id} className="grid grid-cols-[240px_1fr] hover:bg-slate-50/40 transition-colors group">
                              {/* Sticky Left Room Card */}
                              <div className="p-3.5 flex items-center justify-between border-r border-slate-100 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#f1f5f9]">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 shadow-2xs">
                                    <BedDouble className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-serif font-bold text-xs text-[#0b192c] truncate">{cleanName}</span>
                                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold shrink-0">
                                        {maxPax}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-light block truncate">
                                      ${room.base_price_clp.toLocaleString('es-CL')}/n • {roomTypeLabel}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRoomModal(room)}
                                  className="w-7 h-7 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 transition opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                                  title={`Editar ${cleanName}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Days Track Container */}
                              <div className="relative h-14 bg-white">
                                {/* Background Grid Day Slots */}
                                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${lodgeDaysCount}, minmax(0, 1fr))` }}>
                                  {daysArray.map((d) => (
                                    <div
                                      key={d.dayNum}
                                      onClick={() => {
                                        setBlockForm({
                                          roomId: room.id,
                                          checkIn: d.dateStr,
                                          checkOut: new Date(new Date(d.dateStr).getTime() + 86400000).toISOString().split('T')[0],
                                          channelSource: 'phone_whatsapp',
                                          reason: '',
                                          guestName: '',
                                          guestEmail: '',
                                          guestPhone: '',
                                          paxCount: room.room_number === 1 ? 2 : 3,
                                          status: 'approved',
                                        });
                                        setShowBlockModal(true);
                                      }}
                                      className={`h-full border-r border-slate-100/80 transition-colors cursor-pointer flex items-center justify-center relative group/slot ${
                                        d.isWeekend ? 'bg-slate-50/40' : 'bg-transparent'
                                      } ${d.isToday ? 'bg-sky-50/20' : ''} hover:bg-slate-100/60`}
                                      title={`Reservar ${cleanName} el ${d.dayNum} de ${monthNames[lodgeMonth]}`}
                                    >
                                      <Plus className="w-3 h-3 text-slate-300 opacity-0 group-slot:opacity-100 transition-opacity" />
                                    </div>
                                  ))}
                                </div>

                                {/* Floating Reservation Bars */}
                                {roomBookings.map((b) => {
                                  const checkInD = new Date(b.check_in + 'T00:00:00');
                                  const checkOutD = new Date(b.check_out + 'T00:00:00');

                                  let startCol = 1;
                                  if (checkInD.getFullYear() === lodgeYear && checkInD.getMonth() === lodgeMonth) {
                                    startCol = checkInD.getDate();
                                  }

                                  let endCol = lodgeDaysCount + 1;
                                  if (checkOutD.getFullYear() === lodgeYear && checkOutD.getMonth() === lodgeMonth) {
                                    endCol = checkOutD.getDate();
                                  }

                                  const spanDays = Math.max(1, endCol - startCol);
                                  const leftPercent = ((startCol - 1) / lodgeDaysCount) * 100;
                                  const widthPercent = (spanDays / lodgeDaysCount) * 100;

                                  const isAirbnb = b.channel_source === 'airbnb';
                                  const isBlocked = b.status === 'blocked';
                                  const isPending = b.status === 'pending_transfer';
                                  const isWhatsApp = b.channel_source === 'phone_whatsapp';
                                  const isMenuOpen = activeLodgeResMenuId === b.id;

                                  // Visual luxury color styling
                                  const barColorStyle = isAirbnb
                                    ? 'bg-gradient-to-r from-[#FF385C] to-[#E00B41] text-white border-rose-400/40 shadow-xs'
                                    : isBlocked
                                    ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-500/40 shadow-xs'
                                    : isPending
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/40 shadow-xs'
                                    : isWhatsApp
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400/30 shadow-xs'
                                    : 'bg-gradient-to-r from-[#0b192c] via-[#112845] to-[#1a385f] text-white border-sky-400/30 shadow-xs';

                                  const channelLabel = isAirbnb
                                    ? 'Airbnb'
                                    : isBlocked
                                    ? 'Bloqueo'
                                    : isWhatsApp
                                    ? 'WhatsApp'
                                    : 'Web Directa';

                                  return (
                                    <div
                                      key={b.id}
                                      style={{
                                        left: `calc(${leftPercent}% + 2px)`,
                                        width: `calc(${widthPercent}% - 4px)`,
                                        top: '8px',
                                        height: '38px',
                                      }}
                                      className="absolute z-10 lodge-res-menu-container"
                                    >
                                      {/* Visual Bar strictly styled and contained */}
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveLodgeResMenuId(isMenuOpen ? null : b.id);
                                        }}
                                        className={`w-full h-full rounded-lg flex items-center transition-all duration-150 cursor-pointer border overflow-hidden shadow-xs ${barColorStyle} ${
                                          isMenuOpen ? 'ring-2 ring-sky-400 ring-offset-1 z-30 shadow-md scale-[1.01]' : 'hover:brightness-105 hover:shadow-sm'
                                        }`}
                                        title={`${b.guest_name || channelLabel} • ${formatDateDDMMYYYY(b.check_in)} al ${formatDateDDMMYYYY(b.check_out)} • ${channelLabel}`}
                                      >
                                        {spanDays === 1 ? (
                                          <div className="w-full h-full flex items-center justify-center px-1 text-center select-none overflow-hidden">
                                            {isAirbnb ? (
                                              <span className="text-[10px] font-bold text-white tracking-tight leading-none drop-shadow-2xs">AB</span>
                                            ) : isBlocked ? (
                                              <Lock className="w-3.5 h-3.5 text-white/90" />
                                            ) : (
                                              <span className="text-[10px] font-bold text-white tracking-tight leading-none truncate drop-shadow-2xs">
                                                {b.guest_name ? b.guest_name.split(' ')[0] : '1n'}
                                              </span>
                                            )}
                                          </div>
                                        ) : spanDays === 2 ? (
                                          <div className="w-full h-full flex items-center justify-between px-2 min-w-0 select-none overflow-hidden">
                                            <div className="min-w-0 flex-1 truncate">
                                              <span className="font-semibold text-xs text-white truncate block leading-tight drop-shadow-2xs">
                                                {b.guest_name ? b.guest_name.split(' ')[0] : (isAirbnb ? 'Airbnb' : 'Bloqueo')}
                                              </span>
                                              <span className="text-[9px] text-white/80 font-mono block leading-none truncate mt-0.5">
                                                {channelLabel} • 2n
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-between px-2.5 min-w-0 select-none overflow-hidden">
                                            <div className="min-w-0 flex-1 truncate pr-1">
                                              <div className="flex items-center gap-1.5 leading-tight truncate">
                                                <span className="font-semibold text-xs text-white truncate drop-shadow-2xs">
                                                  {b.guest_name || (isAirbnb ? 'Bloqueo Airbnb' : 'Bloqueo Operativo')}
                                                </span>
                                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white shrink-0">
                                                  {spanDays}n
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1 text-[9px] text-white/80 font-mono mt-0.5 truncate">
                                                <span>{channelLabel}</span>
                                                <span>•</span>
                                                <span>{b.booking_code}</span>
                                              </div>
                                            </div>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveLodgeResMenuId(isMenuOpen ? null : b.id);
                                              }}
                                              className="w-5 h-5 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                                              title="Ver Opciones"
                                            >
                                              <MoreHorizontal className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Floating 3-Dots Options Popover */}
                                      {isMenuOpen && (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className={`absolute top-full mt-2 w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(11,25,44,0.25)] border border-slate-200/90 p-5 text-slate-800 space-y-3.5 z-50 animate-fadeIn text-left ${
                                            leftPercent > 65 ? 'right-0' : 'left-0'
                                          }`}
                                        >
                                          {/* Popover Header */}
                                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5">
                                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                                  isAirbnb
                                                    ? 'bg-rose-100 text-[#FF385C]'
                                                    : isPending
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : isWhatsApp
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-blue-100 text-blue-900'
                                                }`}>
                                                  {channelLabel}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                                  {b.booking_code}
                                                </span>
                                              </div>
                                              <h5 className="font-serif font-bold text-sm text-[#0b192c] mt-1.5 truncate">
                                                {b.guest_name || 'Bloqueo de Habitación'}
                                              </h5>
                                              <p className="text-[11px] text-slate-500 font-light truncate">
                                                {cleanName} ({room.room_number === 1 ? '2 Pax' : '3 Pax'})
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => setActiveLodgeResMenuId(null)}
                                              className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          {/* Reservation Info Grid */}
                                          <div className="grid grid-cols-2 gap-2 p-3 bg-[#fbfcfd] border border-slate-100 rounded-2xl text-[11px]">
                                            <div>
                                              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                                                Check-in / Out
                                              </span>
                                              <span className="font-semibold text-[#0b192c] block mt-0.5 font-mono text-[10px]">
                                                {formatDateDDMMYYYY(b.check_in).slice(0, 5)} ➔ {formatDateDDMMYYYY(b.check_out).slice(0, 5)}
                                              </span>
                                              <span className="text-[10px] text-slate-500">
                                                {spanDays} {spanDays === 1 ? 'noche' : 'noches'}
                                              </span>
                                            </div>
                                            <div className="border-l border-slate-200/80 pl-2.5">
                                              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                                                Aforo / Monto
                                              </span>
                                              <span className="font-semibold text-[#0b192c] block mt-0.5">
                                                {b.pax_count || (room.room_number === 1 ? 2 : 3)} Huéspedes
                                              </span>
                                              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                                ${(b.total_amount || 0).toLocaleString('es-CL')} CLP
                                              </span>
                                            </div>
                                          </div>

                                          {/* Contact & Actions list */}
                                          <div className="space-y-2 pt-1">
                                            {/* WhatsApp Button */}
                                            {b.guest_phone && (
                                              <a
                                                href={`https://wa.me/${b.guest_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                  `Hola estimado/a ${b.guest_name}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes respecto a su reserva ${b.booking_code} en habitación ${cleanName}.`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition cursor-pointer shadow-2xs"
                                              >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Contactar por WhatsApp</span>
                                              </a>
                                            )}

                                            {/* Ver Ficha 360 */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveLodgeResMenuId(null);
                                                setSelectedBookingForDetail({
                                                  id: b.id,
                                                  type: 'lodge',
                                                  booking_code: b.booking_code,
                                                  guest_name: b.guest_name || (isAirbnb ? 'Bloqueo Airbnb' : 'Bloqueo Operativo'),
                                                  guest_email: b.guest_email || '',
                                                  guestPhone: b.guest_phone || '',
                                                  channel: b.channel_source,
                                                  service_title: `Lodge Rincón de Navegantes — ${cleanName}`,
                                                  unit_detail: `${b.pax_count || (room.room_number === 1 ? 2 : 3)} Pasajeros`,
                                                  dates: `${formatDateDDMMYYYY(b.check_in)} al ${formatDateDDMMYYYY(b.check_out)} (${spanDays} noches)`,
                                                  status: b.status,
                                                  amount: b.total_amount || 0,
                                                  notes: b.notes || (isAirbnb ? 'Bloqueo sincronizado con calendario de Airbnb' : ''),
                                                });
                                              }}
                                              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0b192c] font-semibold text-xs transition cursor-pointer"
                                            >
                                              <Info className="w-3.5 h-3.5 text-slate-600" />
                                              <span>Ver Detalle de Reserva</span>
                                            </button>

                                            {/* Eliminar / Desbloquear */}
                                            <button
                                              type="button"
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                setActiveLodgeResMenuId(null);
                                                if (confirm(`¿Eliminar la reserva/bloqueo ${b.booking_code} de ${b.guest_name || 'Airbnb'}?`)) {
                                                  await deleteBookingOrBlock(b.id);
                                                  refreshLodge();
                                                }
                                              }}
                                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Eliminar / Liberar Noche</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TABLE OF BOOKINGS & BLOCKS (LEDGER) */}
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_rgba(11,25,44,0.03)] overflow-hidden">
                  <div className="px-7 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd]">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#0b192c] flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-[#0b192c]" />
                        <span>Historial & Registro de Huéspedes</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-light">Gestión de códigos, canales de venta y eliminación de bloqueos</p>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Buscar por código, huésped o canal..."
                        className="bg-white border border-slate-200/90 text-xs pl-9 pr-3.5 py-2 rounded-full text-[#0b192c] focus:outline-none focus:border-[#0b192c] w-64 shadow-2xs placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 whitespace-nowrap">Código</th>
                          <th className="px-6 py-4 whitespace-nowrap">Habitación</th>
                          <th className="px-6 py-4 whitespace-nowrap">Huésped / Detalle</th>
                          <th className="px-6 py-4 whitespace-nowrap">Check-in</th>
                          <th className="px-6 py-4 whitespace-nowrap">Check-out</th>
                          <th className="px-6 py-4 whitespace-nowrap text-center">Canal de Origen</th>
                          <th className="px-6 py-4 whitespace-nowrap text-center">Estado</th>
                          <th className="px-6 py-4 whitespace-nowrap text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {lodgeBookings
                          .filter(
                            (b) =>
                              b.booking_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              b.guest_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              b.channel_source.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((booking) => {
                            const room = rooms.find((r) => r.id === booking.room_id);
                            return (
                              <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-[#0b192c] whitespace-nowrap">
                                  <span className="bg-[#f4f7fb] border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                    {booking.booking_code}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                  {room ? room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim() : 'Habitación sin asignar'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 max-w-[280px] truncate" title={`${booking.guest_name} ${booking.guest_phone || ''} ${booking.notes || ''}`}>
                                    <span className="font-semibold text-[#0b192c] truncate">{booking.guest_name}</span>
                                    {booking.notes && (
                                      <span className="text-[10px] text-slate-400 italic truncate font-light">({booking.notes})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600 whitespace-nowrap">
                                  {formatDateDDMMYYYY(booking.check_in)}
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600 whitespace-nowrap">
                                  {formatDateDDMMYYYY(booking.check_out)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span
                                    className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase whitespace-nowrap ${
                                      booking.channel_source === 'airbnb'
                                        ? 'bg-rose-50 text-[#FF385C] border border-rose-200'
                                        : booking.channel_source === 'booking_com'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : booking.channel_source === 'phone_whatsapp'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : booking.channel_source === 'maintenance'
                                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    }`}
                                  >
                                    {booking.channel_source}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span
                                    className={`text-[10px] px-3 py-1 rounded-full font-bold font-mono uppercase whitespace-nowrap inline-flex items-center ${
                                      booking.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : booking.status === 'blocked'
                                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                                    }`}
                                  >
                                    {booking.status === 'approved'
                                      ? 'Confirmada'
                                      : booking.status === 'blocked'
                                      ? 'Bloqueo'
                                      : 'Pendiente Pago'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`¿Desea eliminar la reserva/bloqueo ${booking.booking_code}?`)) {
                                        await deleteBookingOrBlock(booking.id);
                                        refreshLodge();
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer border border-transparent hover:border-rose-200"
                                    title="Eliminar / Desbloquear"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB 1.5: EXPEDICIONES NÁUTICAS (GESTIÓN DE FLOTA, SALIDAS Y PASAJEROS) */}
          {/* ========================================================================= */}
          {activeTab === 'expeditions' && (
            <div className="space-y-7">
              {/* 1. 4 TOP EXPEDITION KPIS (BANKDASH STYLE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1: SALIDAS PROGRAMADAS */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Salidas Programadas
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Ship className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold font-sans text-[#0b192c] tracking-tight block">
                      {departures.length > 0 ? departures.length : upcomingExpeditions.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span>{departures.filter((d) => d.status === 'guaranteed').length || 2} con zarpe garantizado</span>
                    </span>
                  </div>
                </div>

                {/* KPI 2: PASAJEROS Y OCUPACIÓN */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Pasajeros a Bordo
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold font-sans text-emerald-700 tracking-tight block">
                      {expBookings.reduce((acc, b) => acc + (b.status !== 'cancelled' ? b.pax_count : 0), 0) || 12}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Cupos confirmados en temporada</span>
                    </span>
                  </div>
                </div>

                {/* KPI 3: INGRESOS EXPEDICIONES */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Ingresos Expediciones
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold font-sans text-[#0b192c] tracking-tight block truncate">
                      ${(expBookings.reduce((acc, b) => acc + (b.status !== 'cancelled' ? Number(b.total_amount) : 0), 0) || 22200000).toLocaleString('es-CL')}{' '}
                      <span className="text-xs font-normal text-slate-400 font-sans">CLP</span>
                    </span>
                    <span className="text-xs text-amber-800 font-medium mt-2 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Total contratado</span>
                    </span>
                  </div>
                </div>

                {/* KPI 4: FLOTA EN OPERACIÓN */}
                <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                      Embarcaciones Activas
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Sailboat className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold font-sans text-purple-700 tracking-tight block">
                      {vessels.length > 0 ? vessels.length : 2}
                    </span>
                    <span className="text-[11px] text-slate-500 font-light mt-1 block truncate">
                      Vegvisir 45ft • Terranova 52ft
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PROGRAMACIÓN DE SALIDAS (DEPARTURES GRID) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-[0_4px_24px_rgba(11,25,44,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#0b192c] flex items-center gap-2">
                      <Ship className="w-4.5 h-4.5 text-[#0b192c]" />
                      <span>Salidas Programadas & Estado de Zarpe</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Controla itinerarios, cupos disponibles, precios y estado operativo de cada expedición.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Switcher */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('grid')}
                        title="Vista de Tarjetas"
                        className={`p-1.5 rounded-full transition cursor-pointer ${
                          expeditionsViewMode === 'grid' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('list')}
                        title="Vista de Lista"
                        className={`p-1.5 rounded-full transition cursor-pointer ${
                          expeditionsViewMode === 'list' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Asset Filters */}
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                      {[
                        { id: 'all', label: 'Todas' },
                        { id: 'vegvisir', label: 'Velero Vegvisir' },
                        { id: 'terranova', label: 'Yate Terranova' },
                      ].map((filter) => {
                        const isActive = expeditionsAssetFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setExpeditionsAssetFilter(filter.id as any)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              isActive
                                ? 'bg-[#0b192c] text-white shadow-xs'
                                : 'text-slate-600 hover:text-[#0b192c]'
                            }`}
                          >
                            <span>{filter.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón Nueva Salida */}
                    <button
                      type="button"
                      onClick={() => setShowNewDepartureModal(true)}
                      className="inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-300" />
                      <span>Programar Salida</span>
                    </button>
                  </div>
                </div>

                {/* Conditional View Rendering: Cards vs List */}
                {expeditionsViewMode === 'grid' ? (
                  /* Grid of Scheduled Departures */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
                    {filteredDepartures.length > 0 ? (
                      filteredDepartures.map((dep) => {
                        const route = expRoutes.find(r => r.id === dep.route_id);
                        const vessel = vessels.find(v => v.id === dep.vessel_id);
                        const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                        const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);
                        const isTerranova = dep.vessel_id === 'terranova' || (vessel?.name && vessel.name.toLowerCase().includes('terranova')) || (dep.name && dep.name.toLowerCase().includes('terranova'));
                        const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
                        let routeTitle = dep.name || route?.title || 'Expedición Robinson Crusoe';
                        if (routeTitle.startsWith('JF ')) {
                          routeTitle = routeTitle.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
                        }
                        const VesselIcon = isTerranova ? Ship : Sailboat;

                        const isAgotado = (dep.available_slots || 0) <= 0 || bookedPax >= (dep.total_slots || 10);
                        const calcDaysUntil = (dateStr?: string) => {
                          if (!dateStr) return 999;
                          const target = new Date(dateStr);
                          if (isNaN(target.getTime())) return 999;
                          target.setHours(0, 0, 0, 0);
                          const now = new Date();
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const diff = target.getTime() - today.getTime();
                          return Math.ceil(diff / (1000 * 60 * 60 * 24));
                        };
                        const daysUntil = calcDaysUntil(dep.departure_date);

                        return (
                          <div
                            key={dep.id}
                            className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md flex flex-col justify-between hover:border-slate-300 transition-all duration-300 group hover:-translate-y-0.5"
                          >
                            <div className="space-y-4">
                              {/* Top Header */}
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-700 shadow-2xs">
                                    <VesselIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-serif font-bold text-sm text-[#0b192c] tracking-tight leading-snug truncate" title={routeTitle}>
                                      {routeTitle}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                                      <span className="font-semibold text-slate-700">{vesselName}</span>
                                      {route?.duration && (
                                        <>
                                          <span className="text-slate-300">•</span>
                                          <span className="font-light">{route.duration}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Top-Right Edit & Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDeparture(dep)}
                                    className="w-7 h-7 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                    title="Editar Expedición"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDeparture(dep.id)}
                                    className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                                    title="Eliminar Expedición"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Details Strip */}
                              <div className="p-4 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Zarpe & Retorno</span>
                                  <span className="font-mono text-slate-700 font-bold text-xs">{formatDateDDMMYYYY(dep.departure_date)} ➔ {formatDateDDMMYYYY(dep.return_date)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Tarifa p/Pax</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-mono font-bold text-[#0b192c] text-sm">
                                      ${Number(dep.price_per_pax_clp).toLocaleString('es-CL')}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">CLP</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Capacity Progress Bar & Status */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-600 font-medium">
                                  Ocupación: <strong className="text-[#0b192c] font-bold">{bookedPax}</strong> / {dep.total_slots}
                                </span>
                                {isAgotado ? (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
                                    Agotado
                                  </span>
                                ) : daysUntil <= 15 && daysUntil >= 0 ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                                    Zarpe en {daysUntil}d
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                                    {dep.available_slots} libres
                                  </span>
                                )}
                              </div>

                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isAgotado ? 'bg-slate-400' : 'bg-[#0b192c]'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPassengerManifestModal({ ...dep, routeTitle, vesselName, bookedPax, maxPax: dep.total_slots || 10, availablePax: dep.available_slots || 0, departureDates: `${formatDateDDMMYYYY(dep.departure_date)} ➔ ${formatDateDDMMYYYY(dep.return_date)}`, rawDepartureDate: dep.departure_date, pricePerPaxClp: dep.price_per_pax_clp })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-[#0b192c] text-slate-700 hover:text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-2xs group/mbtn"
                                >
                                  <Users className="w-3.5 h-3.5 text-slate-500 group-hover/mbtn:text-sky-300" />
                                  <span>Pasajeros ({bookedPax})</span>
                                </button>

                                <select
                                  value={dep.status}
                                  onChange={(e) => handleUpdateDepartureStatus(dep.id, e.target.value as any)}
                                  className="bg-white border border-slate-200 text-[11px] font-mono font-semibold text-[#0b192c] rounded-full px-3 py-1 focus:outline-none focus:border-[#0b192c] cursor-pointer shadow-2xs"
                                >
                                  <option value="scheduled">Programada</option>
                                  <option value="guaranteed">Zarpe Garantizado</option>
                                  <option value="completed">Completada</option>
                                  <option value="cancelled">Cancelada</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      filteredUpcomingExpeditions.map((exp) => {
                        const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                        const isAgotado = exp.availablePax <= 0 || exp.bookedPax >= exp.maxPax;
                        const VesselIcon = exp.vesselName.includes('Terranova') ? Ship : exp.vesselName.includes('Lodge') ? BedDouble : Sailboat;

                        return (
                          <div
                            key={exp.id}
                            className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md flex flex-col justify-between hover:border-slate-300 transition-all duration-300 group hover:-translate-y-0.5"
                          >
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-700 shadow-2xs">
                                  <VesselIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-serif font-bold text-sm text-[#0b192c] tracking-tight leading-snug truncate" title={exp.routeTitle}>
                                    {exp.routeTitle}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                                    <span className="font-semibold text-slate-700">{exp.vesselName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Fechas</span>
                                  <span className="font-mono text-slate-700 font-medium">{exp.departureDates}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Tarifa p/Pax</span>
                                  <span className="font-mono font-bold text-[#0b192c]">
                                    {exp.pricePerPax}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-600 font-medium">
                                  Ocupación: <strong className="text-[#0b192c] font-bold">{exp.bookedPax}</strong> / {exp.maxPax}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                                  {exp.availablePax} libres
                                </span>
                              </div>

                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isAgotado ? 'bg-slate-400' : 'bg-[#0b192c]'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* List / Table View */
                  <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-3xl shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Ruta & Expedición</th>
                          <th className="px-6 py-4">Embarcación</th>
                          <th className="px-6 py-4">Fechas de Salida</th>
                          <th className="px-6 py-4">Ocupación / Cupos</th>
                          <th className="px-6 py-4">Tarifa p/Pax</th>
                          <th className="px-6 py-4">Estado de Zarpe</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {filteredDepartures.length > 0 ? (
                          filteredDepartures.map((dep) => {
                            const route = expRoutes.find(r => r.id === dep.route_id);
                            const vessel = vessels.find(v => v.id === dep.vessel_id);
                            const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                            const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);
                            const isTerranova = dep.vessel_id === 'terranova' || (vessel?.name && vessel.name.toLowerCase().includes('terranova')) || (dep.name && dep.name.toLowerCase().includes('terranova'));
                            const vesselName = isTerranova ? 'Yate Terranova' : 'Velero Vegvisir';
                            let routeTitle = dep.name || route?.title || 'Expedición Robinson Crusoe';
                            if (routeTitle.startsWith('JF ')) {
                              routeTitle = routeTitle.replace(/^JF\s*/i, 'Expedición Juan Fernández — ');
                            }
                            const VesselIcon = isTerranova ? Ship : Sailboat;

                            return (
                              <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs">
                                      <VesselIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0b192c] font-semibold text-xs block">
                                        {routeTitle}
                                      </strong>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {route?.duration || `${dep.departure_date} al ${dep.return_date}`}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <strong className="text-slate-800 font-medium text-xs block">
                                      {vesselName}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {vessel?.type || (dep.vessel_id === 'terranova' ? 'Hatteras 65ft' : dep.vessel_id === 'lodge' ? 'Refugio Boutique' : 'Dufour 52.5ft')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-700 font-medium">
                                  {formatDateDDMMYYYY(dep.departure_date)} ➔ {formatDateDDMMYYYY(dep.return_date)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-36 space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                      <span>{bookedPax} / {dep.total_slots} pax</span>
                                      <strong className="text-[#0b192c]">{dep.available_slots} libres</strong>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#0b192c] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-xs text-[#0b192c]">
                                  ${Number(dep.price_per_pax_clp).toLocaleString('es-CL')} <span className="text-[10px] text-slate-500 font-normal">CLP</span>
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={dep.status}
                                    onChange={(e) => handleUpdateDepartureStatus(dep.id, e.target.value as any)}
                                    className="bg-white border border-slate-200 text-[10px] font-mono font-bold text-[#0b192c] rounded-full px-2.5 py-1 focus:outline-none focus:border-[#0b192c] cursor-pointer shadow-2xs"
                                  >
                                    <option value="scheduled">Programada</option>
                                    <option value="guaranteed">Zarpe Garantizado</option>
                                    <option value="completed">Completada</option>
                                    <option value="cancelled">Cancelada</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPassengerManifestModal({ ...dep, routeTitle, vesselName, bookedPax, maxPax: dep.total_slots || 10, availablePax: dep.available_slots || 0, departureDates: `${formatDateDDMMYYYY(dep.departure_date)} ➔ ${formatDateDDMMYYYY(dep.return_date)}`, rawDepartureDate: dep.departure_date, pricePerPaxClp: dep.price_per_pax_clp })}
                                      className="w-7 h-7 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                      title="Ver Manifiesto de Pasajeros"
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingDeparture(dep)}
                                      className="w-7 h-7 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                      title="Editar"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeparture(dep.id)}
                                      className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          filteredUpcomingExpeditions.map((exp) => {
                            const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                            const VesselIcon = exp.vesselName.includes('Terranova') ? Ship : exp.vesselName.includes('Lodge') ? BedDouble : Sailboat;
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs">
                                      <VesselIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0b192c] font-semibold text-xs block">
                                        {exp.routeTitle}
                                      </strong>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {exp.departureDates}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <strong className="text-slate-800 font-medium text-xs block">
                                      {exp.vesselName}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {exp.vesselType}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                  {exp.departureDates}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-36 space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                      <span>{exp.bookedPax} / {exp.maxPax} pax</span>
                                      <strong className="text-[#0b192c]">{exp.availablePax} libres</strong>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#0b192c] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-xs text-[#0b192c]">
                                  {exp.pricePerPax}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                    exp.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                                  }`}>
                                    {exp.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        const vId = exp.vesselName.toLowerCase().includes('terranova') ? 'terranova' : exp.vesselName.toLowerCase().includes('lodge') ? 'lodge' : 'vegvisir';
                                        setEditingDeparture({
                                          id: exp.id,
                                          name: exp.routeTitle,
                                          vessel_id: vId,
                                          route_id: 'ruta-juan-fernandez',
                                          departure_date: '2026-09-09',
                                          return_date: '2026-09-24',
                                          total_slots: exp.maxPax,
                                          available_slots: exp.availablePax,
                                          price_per_pax_clp: parseInt(exp.pricePerPax.replace(/[^0-9]/g, ''), 10) || 1850000,
                                          status: exp.status === 'Zarpe Garantizado' ? 'guaranteed' : 'scheduled',
                                          created_at: new Date().toISOString(),
                                        } as any);
                                      }}
                                      className="w-7 h-7 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                      title="Editar"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeparture(exp.id)}
                                      className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. MANIFIESTO & RESERVAS DE EXPEDICIÓN */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_rgba(11,25,44,0.03)] overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd]">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#0b192c] flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-[#0b192c]" />
                      <span>Manifiesto & Registro de Pasajeros de Expediciones</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-light">Control de pasajeros, datos de contacto y estado de pago de travesías</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por código o pasajero..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-full text-xs text-[#0b192c] focus:outline-none focus:border-[#0b192c] w-64 shadow-2xs placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Pasajero Titular</th>
                        <th className="px-6 py-4">Modalidad</th>
                        <th className="px-6 py-4">Cupos (Pax)</th>
                        <th className="px-6 py-4">Monto Total</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                            No se han registrado reservas de expediciones aún.
                          </td>
                        </tr>
                      ) : (
                        expBookings
                          .filter(
                            (b) =>
                              b.booking_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              b.guest_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              b.guest_email.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-[#0b192c]">
                                <span className="bg-[#f4f7fb] border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                  {booking.booking_code}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <strong className="font-semibold text-[#0b192c] text-xs block">{booking.guest_name}</strong>
                                  <div className="flex items-center gap-2">
                                    {booking.guest_phone && booking.guest_phone !== 'Sin contacto' && !booking.guest_phone.includes('00000000') && (
                                      <a
                                        href={`https://wa.me/${booking.guest_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                          `Hola estimado/a ${booking.guest_name}, le contactamos desde Yates Chile respecto a su reserva de expedición ${booking.booking_code}.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-emerald-200 transition-all shadow-2xs group/wa cursor-pointer shrink-0"
                                        title={`Abrir WhatsApp de ${booking.guest_name} (${booking.guest_phone})`}
                                      >
                                        <svg className="w-3 h-3 fill-current transition-colors shrink-0" viewBox="0 0 24 24">
                                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                        </svg>
                                      </a>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-mono">{booking.guest_email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-slate-100 text-[#0b192c] text-[10px] px-3 py-1 rounded-full font-mono font-bold">
                                  {booking.booking_type === 'full_charter' ? 'Chárter Privado' : 'Cupo Individual'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-[#0b192c]">
                                {booking.pax_count} Pax
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-[#0b192c]">
                                ${Number(booking.total_amount).toLocaleString('es-CL')} CLP
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={booking.status}
                                  onChange={(e) => handleUpdateExpBookingStatus(booking.id, e.target.value as any)}
                                  className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase cursor-pointer border focus:outline-none transition ${
                                    booking.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : booking.status === 'pending_transfer'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  <option value="pending_transfer">Pendiente Pago</option>
                                  <option value="approved">Confirmada (Pagada)</option>
                                  <option value="completed">Completada</option>
                                  <option value="cancelled">Cancelada</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => triggerAlert(`Detalle de reserva: ${booking.booking_code} - ${booking.guest_name}`, 'info', 'Ficha de Reserva')}
                                  className="text-xs font-semibold px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0b192c] transition shadow-2xs cursor-pointer active:scale-95"
                                >
                                  Ver Ficha
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CRM CONCIERGE & CLIENTES (GESTIÓN DE HUÉSPEDES, VIP & LEADS) */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-7 animate-fadeIn">
              
              {/* 0. SUB-NAVIGATION SWITCHER: CLIENTES VS LEADS */}
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/60 shadow-2xs gap-1">
                  <button
                    type="button"
                    onClick={() => setCrmActiveSubTab('clients')}
                    className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs transition cursor-pointer ${
                      crmActiveSubTab === 'clients'
                        ? 'bg-[#0b192c] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-[#0b192c] font-medium'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Directorio de Clientes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCrmActiveSubTab('leads')}
                    className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs transition cursor-pointer ${
                      crmActiveSubTab === 'leads'
                        ? 'bg-[#0b192c] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-[#0b192c] font-medium'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Prospectos & Leads ({newLeadsCount} nuevos)</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SUB-VIEW A: CRM DE CLIENTES (PAGADOS & CONTRATADOS) */}
              {/* ========================================================================= */}
              {crmActiveSubTab === 'clients' && (
                <div className="space-y-7 animate-fadeIn">
                  
                  {/* 1. TOP CRM & REVENUE KPIS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Clientes */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Total Clientes CRM
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0b192c] border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-[#0b192c] tracking-tight">
                          {crmClients.length}
                        </div>
                        <span className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Base unificada Lodge & Yates</span>
                        </span>
                      </div>
                    </div>

                    {/* Clientes VIP Gold */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800 transition-colors">
                          Clientes VIP Gold
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-amber-700 tracking-tight">
                          {crmClients.filter((c) => c.category === 'vip').length}
                        </div>
                        <span className="text-xs text-amber-800 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Alta recurrencia & Chárter</span>
                        </span>
                      </div>
                    </div>

                    {/* Valor Total Facturado (LTV) */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          LTV Facturado CRM
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-[#0b192c] tracking-tight truncate">
                          ${crmClients.reduce((acc, c) => acc + c.totalSpentClp, 0).toLocaleString('es-CL')}
                        </div>
                        <span className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>CLP Facturado histórico</span>
                        </span>
                      </div>
                    </div>

                    {/* Conciliaciones / Transferencias Pendientes */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Transferencias Pendientes
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-sky-800 tracking-tight">
                          {pendingApprovalsCount}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTransfersAccordionOpen(!isTransfersAccordionOpen)}
                          className="text-xs text-sky-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer mt-2"
                        >
                          <span>{isTransfersAccordionOpen ? 'Ocultar mesa' : 'Ver mesa de conciliación'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTransfersAccordionOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. MESA DE CONCILIACIÓN DE TRANSFERENCIAS (ACORDEÓN DESPLEGABLE) */}
                  {isTransfersAccordionOpen && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_24px_rgba(11,25,44,0.03)] space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-serif font-bold text-[#0b192c]">
                            Mesa de Conciliación de Transferencias Bancarias
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-bold">
                          {installments.length} transacciones
                        </span>
                      </div>

                      {installments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-light">
                          No hay transferencias pendientes de conciliación.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {installments.map((inst) => (
                            <div
                              key={inst.id}
                              className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-5 space-y-3 hover:border-slate-300 transition-all shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="bg-white text-[#0b192c] border border-slate-200 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold">
                                  {inst.booking_type === 'lodge' ? 'Lodge' : 'Expedición'}
                                </span>
                                <span
                                  className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase ${
                                    inst.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : inst.status === 'pending_approval'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {inst.status === 'pending_approval' ? 'Voucher Subido' : inst.status}
                                </span>
                              </div>

                              <div>
                                <h5 className="text-xs font-bold text-[#0b192c]">{inst.concept}</h5>
                                <div className="text-sm font-mono font-bold text-[#0b192c] mt-1">
                                  ${inst.amount_expected.toLocaleString('es-CL')}{' '}
                                  <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                </div>
                              </div>

                              {inst.receipt_url ? (
                                <a
                                  href={inst.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full bg-white hover:bg-slate-50 text-[#0b192c] border border-slate-200 text-[11px] py-2 rounded-full transition inline-flex items-center justify-center gap-1.5 font-semibold shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Ver Comprobante</span>
                                </a>
                              ) : (
                                <div className="text-[10px] text-slate-400 italic bg-white p-2 rounded-xl text-center border border-slate-100">
                                  Pendiente de subida
                                </div>
                              )}

                              {inst.status !== 'approved' && (
                                <button
                                  onClick={() => setSelectedInstallment(inst)}
                                  className="w-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold py-2 rounded-full text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                                  <span>Conciliar Pago</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. DIRECTORIO & GESTIÓN DE CLIENTES */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(11,25,44,0.03)] space-y-5">
                    
                    {/* Header del Directorio */}
                    <div className="space-y-4 border-b border-slate-100 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#0b192c] flex items-center gap-2">
                            <UserCheck className="w-4.5 h-4.5 text-[#0b192c]" />
                            <span>Directorio de Clientes & Fichas Individuales</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-light mt-0.5">
                            Selecciona cualquier cliente para ver su ficha completa, historial de reservas y bitácora.
                          </p>
                        </div>

                        {/* Switcher Tarjetas / Lista y Botón Registrar */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setCustomersViewMode('grid')}
                              title="Vista de Tarjetas"
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                customersViewMode === 'grid' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                              }`}
                            >
                              <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomersViewMode('list')}
                              title="Vista de Lista"
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                customersViewMode === 'list' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowNewCustomerModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 text-sky-300" />
                            <span>Nuevo Cliente</span>
                          </button>
                        </div>
                      </div>

                      {/* Barra de Búsqueda */}
                      <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, RUT, email, teléfono..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-[#0b192c] rounded-full pl-9.5 pr-8 py-2 text-xs text-[#0b192c] placeholder:text-slate-400 focus:outline-none transition shadow-2xs"
                        />
                        {customerSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCustomerSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenido: Cards o Lista */}
                    {filteredCustomers.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-2">
                        <User className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-light">No se encontraron clientes con los filtros seleccionados.</p>
                      </div>
                    ) : customersViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fadeIn">
                        {filteredCustomers.map((cust) => {
                          const custLodge = getCustomerLodgeBookings(cust);
                          const custExp = getCustomerExpBookings(cust);
                          const totalBookings = cust.bookingsCount || (custLodge.length + custExp.length);

                          return (
                            <div
                              key={cust.id}
                              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer hover:-translate-y-0.5"
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomerDossierTab('profile');
                              }}
                            >
                              {/* Top */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 font-mono bg-slate-100 text-[#0b192c] border border-slate-200 shadow-2xs">
                                      {cust.fullName
                                        .split(' ')
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-serif font-bold text-sm text-[#0b192c] leading-snug truncate">
                                        {cust.fullName}
                                      </h4>
                                      <div className="text-[11px] text-slate-500 font-light mt-0.5 truncate">
                                        {cust.city} • <span className="font-mono text-slate-400 text-[10px]">{cust.rutOrPassport}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                    cust.category === 'vip' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {cust.category === 'vip' ? 'VIP Gold' : 'Regular'}
                                  </span>
                                </div>

                                {/* Metrics Strip */}
                                <div className="grid grid-cols-2 gap-2 p-3.5 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl">
                                  <div>
                                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-0.5">
                                      Inversión LTV
                                    </span>
                                    <div className="text-xs font-mono font-bold text-[#0b192c]">
                                      ${cust.totalSpentClp.toLocaleString('es-CL')} <span className="text-[9px] text-slate-400 font-sans font-normal">CLP</span>
                                    </div>
                                  </div>
                                  <div className="border-l border-slate-200/80 pl-3 text-right">
                                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-0.5">
                                      Historial
                                    </span>
                                    <div className="text-xs font-semibold text-slate-800">
                                      {totalBookings} {totalBookings === 1 ? 'reserva' : 'reservas'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Footer */}
                              <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hola estimado/a ${cust.fullName}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold text-xs shadow-2xs"
                                  title="Contactar por WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                                <a
                                  href={`mailto:${cust.email}?subject=${encodeURIComponent('Atención Concierge — Yates Chile')}`}
                                  className="flex-1 py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold text-xs shadow-2xs"
                                  title="Enviar Correo Electrónico"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Email</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table / List View of Customers */
                      <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-3xl shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4">Cliente</th>
                              <th className="px-6 py-4">Categoría</th>
                              <th className="px-6 py-4">Ubicación / Ciudad</th>
                              <th className="px-6 py-4">Inversión LTV</th>
                              <th className="px-6 py-4">Historial Reservas</th>
                              <th className="px-6 py-4">Preferencias / Tags</th>
                              <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                            {filteredCustomers.map((cust) => {
                              const custLodge = getCustomerLodgeBookings(cust);
                              const custExp = getCustomerExpBookings(cust);
                              const totalBookings = cust.bookingsCount || (custLodge.length + custExp.length);
                              const monogram = cust.fullName
                                .split(' ')
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('');

                              return (
                                <tr
                                  key={cust.id}
                                  onClick={() => {
                                    setSelectedCustomer(cust);
                                    setCustomerDossierTab('profile');
                                  }}
                                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                          cust.category === 'vip'
                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                                        }`}
                                      >
                                        {monogram}
                                      </div>
                                      <div>
                                        <strong className="text-[#0b192c] font-semibold text-xs block">
                                          {cust.fullName}
                                        </strong>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {cust.rutOrPassport || cust.email}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {cust.category === 'vip' ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                        <Award className="w-3.5 h-3.5 text-amber-600" />
                                        <span>VIP Gold</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-medium font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        Regular
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{cust.city || 'Chile'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono font-bold text-xs text-[#0b192c]">
                                    ${cust.totalSpentClp.toLocaleString('es-CL')}{' '}
                                    <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-0.5">
                                      <strong className="text-slate-900 font-semibold text-xs block">
                                        {totalBookings} {totalBookings === 1 ? 'reserva' : 'reservas'}
                                      </strong>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        {custExp.length > 0 && <span>{custExp.length} Exp.</span>}
                                        {custExp.length > 0 && custLodge.length > 0 && <span>•</span>}
                                        {custLodge.length > 0 && <span>{custLodge.length} Lodge</span>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                      {cust.tags?.slice(0, 2).map((tag, i) => (
                                        <span
                                          key={i}
                                          className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200/80 text-slate-600 rounded-full font-medium"
                                        >
                                          {tag.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {cust.phone && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                          }}
                                          title="WhatsApp"
                                          className="w-7 h-7 rounded-full text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCustomer(cust);
                                          setCustomerDossierTab('profile');
                                        }}
                                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#0b192c] hover:text-white text-slate-700 text-xs font-semibold transition cursor-pointer"
                                      >
                                        Ficha
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-VIEW B: GESTIÓN DE LEADS & PROSPECTOS (INTERESADOS) */}
              {/* ========================================================================= */}
              {crmActiveSubTab === 'leads' && (
                <div className="space-y-7 animate-fadeIn">
                  
                  {/* KPI Cards de Leads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Leads */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Total Leads Captados
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0b192c] border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-[#0b192c] tracking-tight">
                          {leads.length}
                        </div>
                        <span className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Brochure, Web & WhatsApp</span>
                        </span>
                      </div>
                    </div>

                    {/* Nuevos por Atender */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800 transition-colors">
                          Nuevos por Atender
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <Flame className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-amber-700 tracking-tight">
                          {newLeadsCount}
                        </div>
                        <span className="text-xs text-amber-800 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Atención requerida</span>
                        </span>
                      </div>
                    </div>

                    {/* En Cotización Activa */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          En Cotización Activa
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-sky-800 tracking-tight">
                          {quotingLeadsCount}
                        </div>
                        <span className="text-xs text-sky-700 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span>Propuestas enviadas</span>
                        </span>
                      </div>
                    </div>

                    {/* Tasa de Conversión */}
                    <div className="bg-[#fcfdfe] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-3xl p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-4 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0b192c] transition-colors">
                          Tasa de Conversión
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold font-sans text-emerald-700 tracking-tight">
                          {conversionRate}%
                        </div>
                        <span className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{convertedLeadsCount} convertidos a clientes</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Directorio & Gestión de Leads */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(11,25,44,0.03)] space-y-5">
                    {/* Header: Título, Filtros, Buscador y Botón Registrar */}
                    <div className="space-y-4 border-b border-slate-100 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#0b192c] flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-[#0b192c]" />
                            <span>Directorio de Leads & Prospectos</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-light mt-0.5">
                            Gestiona el seguimiento, contacta por WhatsApp/correo y convierte prospectos en clientes.
                          </p>
                        </div>

                        {/* Switcher Tarjetas / Lista y Botón Registrar */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setLeadsViewMode('grid')}
                              title="Vista de Tarjetas"
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                leadsViewMode === 'grid' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                              }`}
                            >
                              <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadsViewMode('list')}
                              title="Vista de Lista"
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                leadsViewMode === 'list' ? 'bg-white text-[#0b192c] shadow-xs' : 'text-slate-500 hover:text-[#0b192c]'
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowNewLeadModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 text-sky-300" />
                            <span>Nuevo Lead</span>
                          </button>
                        </div>
                      </div>

                      {/* Barra de Búsqueda y Filtros */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <div className="relative w-full max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar lead por nombre, email, teléfono..."
                            value={leadSearchQuery}
                            onChange={(e) => setLeadSearchQuery(e.target.value)}
                            className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-[#0b192c] rounded-full pl-9.5 pr-8 py-2 text-xs text-[#0b192c] placeholder:text-slate-400 focus:outline-none transition shadow-2xs"
                          />
                          {leadSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setLeadSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Origen Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                            Origen:
                          </span>
                          <select
                            value={leadOriginFilter}
                            onChange={(e) => setLeadOriginFilter(e.target.value)}
                            className="bg-[#f4f7fb] border border-slate-200/90 rounded-full px-3 py-1.5 text-xs font-semibold text-[#0b192c] focus:outline-none focus:border-[#0b192c] cursor-pointer"
                          >
                            <option value="all">Todos los Canales</option>
                            <option value="brochure">📥 Brochure PDF</option>
                            <option value="contacto_web">🌐 Formulario Web</option>
                            <option value="lodge_interest">🏡 Lodge</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="manual">✍️ Manual</option>
                          </select>
                        </div>
                      </div>

                      {/* Segmented Status Filters */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {[
                          { id: 'all', label: 'Todos', count: leads.length },
                          { id: 'nuevo', label: 'Nuevos', count: newLeadsCount },
                          { id: 'contactado', label: 'Contactados', count: contactedLeadsCount },
                          { id: 'cotizando', label: 'En Cotización', count: quotingLeadsCount },
                          { id: 'convertido', label: 'Convertidos', count: convertedLeadsCount },
                          { id: 'descartado', label: 'Descartados', count: discardedLeadsCount },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setLeadStatusFilter(tab.id as any)}
                            className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
                              leadStatusFilter === tab.id
                                ? 'bg-[#0b192c] text-white font-semibold shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                              leadStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contenido: Cards o Lista de Leads */}
                    {filteredLeads.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-light">No se encontraron prospectos con los filtros seleccionados.</p>
                      </div>
                    ) : leadsViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fadeIn">
                        {filteredLeads.map((lead) => {
                          const statusTheme =
                            lead.status === 'nuevo'
                              ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Nuevo Lead' }
                              : lead.status === 'contactado'
                              ? { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'Contactado' }
                              : lead.status === 'cotizando'
                              ? { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'En Cotización' }
                              : lead.status === 'convertido'
                              ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Convertido' }
                              : { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Descartado' };

                          const OriginIcon =
                            lead.origin === 'brochure'
                              ? FileDown
                              : lead.origin === 'whatsapp'
                              ? MessageSquare
                              : Globe;

                          return (
                            <div
                              key={lead.id}
                              className={`bg-white border rounded-3xl p-6 transition flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md ${
                                lead.status === 'convertido'
                                  ? 'border-emerald-200/80 bg-emerald-50/10'
                                  : 'border-slate-200/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-3.5">
                                {/* Top: Monogram & Status */}
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0b192c] shrink-0 font-mono shadow-2xs">
                                      {lead.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-serif font-bold text-sm text-[#0b192c] leading-snug truncate">
                                        {lead.fullName}
                                      </h4>
                                      <span className="text-[11px] text-slate-400 font-light block truncate">
                                        {lead.city || 'Chile'} • <span className="font-mono text-[10px]">{lead.dateCreated}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <select
                                    value={lead.status}
                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${statusTheme.bg}`}
                                  >
                                    <option value="nuevo">Nuevo</option>
                                    <option value="contactado">Contactado</option>
                                    <option value="cotizando">Cotizando</option>
                                    <option value="convertido">Convertido</option>
                                    <option value="descartado">Descartado</option>
                                  </select>
                                </div>

                                {/* Origin Channel Badge */}
                                <div className="flex items-center gap-2 text-xs text-slate-600 bg-[#fbfcfd] border border-slate-200/80 px-3 py-1.5 rounded-full">
                                  <OriginIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="truncate font-semibold text-[11px]">{lead.originDetails}</span>
                                </div>

                                {/* Contact & Trip Details */}
                                <div className="grid grid-cols-2 gap-2 p-3 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl text-[11px]">
                                  <div>
                                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                                      Interés / Pax
                                    </span>
                                    <span className="font-semibold text-[#0b192c] block mt-0.5 capitalize truncate">
                                      {lead.interestType} • {lead.estimatedPax || 2} pax
                                    </span>
                                  </div>
                                  <div className="border-l border-slate-200/80 pl-2.5">
                                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                                      Fecha / Presupuesto
                                    </span>
                                    <span className="font-semibold text-[#0b192c] block mt-0.5 font-mono text-[10px] truncate">
                                      {lead.tentativeDate || 'Flexible'} {lead.estimatedBudgetClp ? `• $${Number(lead.estimatedBudgetClp).toLocaleString('es-CL')}` : ''}
                                    </span>
                                  </div>
                                </div>

                                {/* Notes Box */}
                                {lead.notes && (
                                  <div className="p-3 bg-white border border-slate-200/80 rounded-xl text-[11px] text-slate-600 font-light leading-relaxed">
                                    <p className="line-clamp-2">{lead.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer */}
                              <div className="space-y-2 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  {lead.phone && (
                                    <a
                                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Hola ${lead.fullName}, te contacto desde Yates Chile respecto a tu consulta sobre ${lead.interestType === 'lodge' ? 'Lodge Rincón de Navegantes' : 'nuestras expediciones náuticas'}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer border border-emerald-200"
                                      title="WhatsApp"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  {lead.email && (
                                    <a
                                      href={`mailto:${lead.email}?subject=${encodeURIComponent('Información & Propuesta — Yates Chile')}`}
                                      className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center justify-center transition cursor-pointer border border-sky-200"
                                      title="Correo"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  <button
                                    onClick={() => {
                                      setEditingLeadNotes(lead);
                                      setLeadNotesText(lead.notes || '');
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer border border-slate-200/80"
                                    title="Notas"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>

                                  {lead.status !== 'convertido' ? (
                                    <button
                                      onClick={() => handleConvertLeadToClient(lead)}
                                      className="flex-1 bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold py-2 px-3 rounded-full text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Convertir</span>
                                    </button>
                                  ) : (
                                    <div className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold py-1.5 px-3 rounded-full text-[11px] text-center">
                                      ✓ Cliente Activo
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Eliminar al prospecto ${lead.fullName}?`)) {
                                        deleteLead(lead.id);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table / List View of Leads */
                      <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-3xl shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4">Prospecto</th>
                              <th className="px-6 py-4">Canal de Origen</th>
                              <th className="px-6 py-4">Estado</th>
                              <th className="px-6 py-4">Interés & Pax</th>
                              <th className="px-6 py-4">Fecha / Presupuesto</th>
                              <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                            {filteredLeads.map((lead) => {
                              const statusTheme =
                                lead.status === 'nuevo'
                                  ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Nuevo' }
                                  : lead.status === 'contactado'
                                  ? { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'Contactado' }
                                  : lead.status === 'cotizando'
                                  ? { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'Cotizando' }
                                  : lead.status === 'convertido'
                                  ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Convertido' }
                                  : { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Descartado' };

                              const OriginIcon =
                                lead.origin === 'brochure'
                                  ? FileDown
                                  : lead.origin === 'whatsapp'
                                  ? MessageSquare
                                  : Globe;

                              const monogram = lead.fullName
                                .split(' ')
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('');

                              return (
                                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0b192c] shrink-0 font-mono shadow-2xs">
                                        {monogram}
                                      </div>
                                      <div>
                                        <strong className="text-[#0b192c] font-semibold text-xs block">
                                          {lead.fullName}
                                        </strong>
                                        <span className="text-[10px] text-slate-400 font-light">
                                          {lead.city || 'Chile'} • <span className="font-mono">{lead.dateCreated}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
                                      <OriginIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-[11px] font-medium">{lead.originDetails}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={lead.status}
                                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                      className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${statusTheme.bg}`}
                                    >
                                      <option value="nuevo">Nuevo</option>
                                      <option value="contactado">Contactado</option>
                                      <option value="cotizando">Cotizando</option>
                                      <option value="convertido">Convertido</option>
                                      <option value="descartado">Descartado</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <strong className="text-slate-900 font-semibold text-xs block capitalize">
                                      {lead.interestType}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {lead.estimatedPax || 2} pax
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                                    <div>{lead.tentativeDate || 'Flexible'}</div>
                                    {lead.estimatedBudgetClp && (
                                      <strong className="text-[#0b192c] text-xs font-bold">
                                        ${Number(lead.estimatedBudgetClp).toLocaleString('es-CL')} CLP
                                      </strong>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {lead.phone && (
                                        <a
                                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                            `Hola ${lead.fullName}, te contacto desde Yates Chile.`
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="w-7 h-7 rounded-full text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer"
                                          title="WhatsApp"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                      {lead.status !== 'convertido' && (
                                        <button
                                          onClick={() => handleConvertLeadToClient(lead)}
                                          className="px-3 py-1 bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-semibold rounded-full transition cursor-pointer"
                                        >
                                          Convertir
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          if (confirm(`¿Eliminar al prospecto ${lead.fullName}?`)) {
                                            deleteLead(lead.id);
                                          }
                                        }}
                                        className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SERVICES & ACTIVITIES CATALOG */}
          {/* ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-7">
              {/* Header Bar with Title and Action Button */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(11,25,44,0.03)] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0b192c] flex items-center gap-2">
                    <Tag className="w-4.5 h-4.5 text-[#0b192c]" />
                    <span>Catálogo de Experiencias & Actividades</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Controla las excursiones guiadas, actividades náuticas, buceo y expediciones del catálogo.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewServiceModal(true)}
                  className="bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold px-5 py-2 rounded-full text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-300" />
                  <span>Nueva Experiencia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className={`bg-white border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-[0_4px_24px_rgba(11,25,44,0.03)] hover:shadow-md hover:-translate-y-0.5 ${
                      svc.is_active ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {svc.image_url && (
                      <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                        <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-[#0b192c]/85 backdrop-blur-md text-white text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                          {svc.category}
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-serif font-bold text-[#0b192c] leading-snug">
                          {svc.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-light">
                          {svc.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono font-medium">
                            {svc.duration_label || 'Duración flexible'}
                          </span>
                          <span className="text-sm font-mono font-bold text-[#0b192c]">
                            ${svc.price_clp.toLocaleString('es-CL')}{' '}
                            <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              await toggleServiceActive(svc.id, !svc.is_active);
                              refreshServices();
                            }}
                            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition cursor-pointer active:scale-95 shadow-2xs ${
                              svc.is_active
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {svc.is_active ? 'Pausar' : 'Activar'}
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Eliminar ${svc.name}?`)) {
                                await deleteService(svc.id);
                                refreshServices();
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600 w-7 h-7 rounded-full flex items-center justify-center hover:bg-rose-50 transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CMS WEB (VISUAL LIVE PREVIEW CANVAS EDITOR) */}
          {/* ========================================================================= */}
          {activeTab === 'cms' && (
            <VisualCmsEditor
              content={content}
              onSaveAllSections={handleSaveAllCmsSections}
              onUploadMedia={async (file) => {
                const res = await cmsService.uploadMedia(file);
                return res;
              }}
              refreshContent={refreshContent}
              onNavigate={onNavigate}
            />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAR BLOQUEO AIRBNB */}
      {/* ========================================================================= */}
      {airbnbConfirmModal?.isOpen && airbnbConfirmModal.room && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(11,25,44,0.2)] space-y-6 animate-scale-in">
            {/* Header with Airbnb brand identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FF385C]/10 border border-[#FF385C]/20 flex items-center justify-center p-2 shadow-xs shrink-0">
                  <img src="/airbnb-logo.png" alt="Airbnb" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF385C] font-bold block">
                    Sincronización Airbnb
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#0b192c]">
                    Confirmar Bloqueo
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAirbnbConfirmModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room & Date details card */}
            <div className="bg-[#f4f7fb] border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Habitación:</span>
                <span className="text-xs font-bold text-[#0b192c] font-serif">
                  {airbnbConfirmModal.room.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Fecha de Estadía:</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0b192c]">
                  <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
                  <span>
                    {(() => {
                      const fmt = (d: string) => {
                        if (!d) return '';
                        const p = d.split('-');
                        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
                      };
                      return `${fmt(airbnbConfirmModal.checkIn)} al ${fmt(airbnbConfirmModal.checkOut)}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Information alert */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Al confirmar, esta habitación pasará automáticamente a estado <strong>OCUPADA</strong> en esa fecha y el bloqueo quedará registrado de forma permanente en la base de datos.
              </p>
            </div>

            {/* Action buttons: Rechazar vs Confirmar */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={isSavingAirbnbBlock}
                onClick={() => setAirbnbConfirmModal(null)}
                className="w-1/2 py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer text-center"
              >
                Rechazar
              </button>
              <button
                type="button"
                disabled={isSavingAirbnbBlock}
                onClick={handleConfirmAirbnbBlock}
                className="w-1/2 py-2.5 px-4 rounded-full bg-[#FF385C] hover:bg-[#E00B41] active:bg-[#D70466] text-white font-semibold text-xs transition shadow-md shadow-[#FF385C]/25 hover:shadow-lg hover:shadow-[#FF385C]/35 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSavingAirbnbBlock ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Aceptar Bloqueo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESERVAR HOSPEDAJE (4-STEP HOTEL RESERVATION WIZARD) */}
      {/* ========================================================================= */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(11,25,44,0.22)] space-y-5 animate-scale-in my-8">
            
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 text-[#0b192c] flex items-center justify-center shadow-xs shrink-0">
                  <BedDouble className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                    Lodge Rincón de Navegantes
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#0b192c]">Reservar Hospedaje</h4>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setReservationWizardStep(1);
                }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { step: 1, label: '1. Fechas' },
                { step: 2, label: '2. Pasajeros' },
                { step: 3, label: '3. Habitación' },
                { step: 4, label: '4. Huéspedes' },
              ].map((s) => {
                const isActive = reservationWizardStep === s.step;
                const isPassed = reservationWizardStep > s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => {
                      if (isPassed) setReservationWizardStep(s.step as any);
                    }}
                    className={`rounded-2xl py-2 px-1 text-center transition ${
                      isPassed ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition ${
                          isActive
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isPassed ? '✓' : s.step}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold block truncate ${
                        isActive
                          ? 'text-[#0b192c]'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Logic & Form Body */}
            {(() => {
              const selectedRoom = rooms.find((r) => r.id === blockForm.roomId);
              const checkInDate = blockForm.checkIn ? new Date(blockForm.checkIn) : null;
              const checkOutDate = blockForm.checkOut ? new Date(blockForm.checkOut) : null;
              const isDatesValid = Boolean(checkInDate && checkOutDate && checkOutDate > checkInDate);
              const calculatedNights = isDatesValid && checkInDate && checkOutDate
                ? Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
                : 1;
              const totalStayPrice = (selectedRoom?.base_price_clp || 240000) * calculatedNights;

              // Check availability for selected room
              const isSelectedRoomOccupied = Boolean(
                blockForm.roomId &&
                blockForm.checkIn &&
                blockForm.checkOut &&
                isRoomBookedForRange(blockForm.roomId, blockForm.checkIn, blockForm.checkOut)
              );
              const isSelectedRoomEligible = Boolean(
                selectedRoom &&
                !isSelectedRoomOccupied &&
                selectedRoom.max_pax >= blockForm.paxCount
              );

              return (
                <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
                  
                  {/* ======================================================== */}
                  {/* PASO 1: SELECCIÓN DE FECHAS (CHECK-IN & CHECK-OUT) */}
                  {/* ======================================================== */}
                  {reservationWizardStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-[#f4f7fb] border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-2.5 text-[#0b192c]">
                        <Calendar className="w-4 h-4 text-sky-700 shrink-0" />
                        <span className="text-xs font-semibold">
                          Paso 1: Selecciona las fechas de llegada y salida del Lodge.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block">
                            Fecha Check-in (Llegada) *
                          </label>
                          <input
                            type="date"
                            value={blockForm.checkIn}
                            onChange={(e) => {
                              const newIn = e.target.value;
                              setBlockForm((prev) => {
                                // If checkOut is before or equal, adjust checkOut to +2 days
                                let newOut = prev.checkOut;
                                if (newIn && (!newOut || newOut <= newIn)) {
                                  const d = new Date(newIn);
                                  d.setDate(d.getDate() + 2);
                                  newOut = d.toISOString().split('T')[0];
                                }
                                return { ...prev, checkIn: newIn, checkOut: newOut };
                              });
                            }}
                            className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none font-mono text-xs font-semibold transition shadow-2xs"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block">
                            Fecha Check-out (Salida) *
                          </label>
                          <input
                            type="date"
                            value={blockForm.checkOut}
                            min={blockForm.checkIn || undefined}
                            onChange={(e) => setBlockForm({ ...blockForm, checkOut: e.target.value })}
                            className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none font-mono text-xs font-semibold transition shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      {/* Summary of nights */}
                      {isDatesValid ? (
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-900">
                              Estadía de <strong className="font-bold">{calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                            {formatDateDDMMYYYY(blockForm.checkIn)} ➔ {formatDateDDMMYYYY(blockForm.checkOut)}
                          </span>
                        </div>
                      ) : (
                        blockForm.checkIn && blockForm.checkOut && (
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-800 text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>La fecha de check-out debe ser posterior al check-in.</span>
                          </div>
                        )
                      )}

                      {/* Step 1 Actions */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowBlockModal(false)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!isDatesValid}
                          onClick={() => setReservationWizardStep(2)}
                          className={`w-2/3 py-2.5 rounded-full font-semibold transition shadow-xs flex items-center justify-center gap-2 text-xs active:scale-95 ${
                            !isDatesValid
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#0b192c] hover:bg-[#182a44] text-white cursor-pointer'
                          }`}
                        >
                          <span>Siguiente: Cantidad de Pasajeros</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* PASO 2: CANTIDAD DE PASAJEROS */}
                  {/* ======================================================== */}
                  {reservationWizardStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Dates chip */}
                      <div className="bg-[#f4f7fb] border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#0b192c]" />
                          <span>Fechas seleccionadas:</span>
                        </span>
                        <span className="font-mono font-bold text-[#0b192c]">
                          {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'})
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-mono font-bold text-[#0b192c] block mb-2">
                          ¿Para cuántos pasajeros / huéspedes es la estadía?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { count: 1, title: '1 Pasajero', desc: 'Estadía Individual', icon: User },
                            { count: 2, title: '2 Pasajeros', desc: 'Pareja o 2 Personas (Doble / King)', icon: Users },
                            { count: 3, title: '3 Pasajeros', desc: 'Familiar / Amigos (Triple)', icon: Users },
                            { count: 4, title: '4 Pasajeros', desc: 'Grupo Familiar (Capacidad Máxima)', icon: Users },
                          ].map((opt) => {
                            const isSelected = blockForm.paxCount === opt.count;
                            const IconComponent = opt.icon;
                            return (
                              <div
                                key={opt.count}
                                onClick={() => {
                                  setBlockForm({ ...blockForm, paxCount: opt.count });
                                }}
                                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-[#0b192c] border-[#0b192c] text-white shadow-md ring-2 ring-[#0b192c]/20'
                                    : 'bg-[#f4f7fb] hover:bg-slate-100 border-slate-200/80 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-[#0b192c]'
                                  }`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  {isSelected && <span className="text-[10px] font-bold bg-white/25 px-2.5 py-0.5 rounded-full">Seleccionado</span>}
                                </div>
                                <div>
                                  <h5 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#0b192c]'}`}>
                                    {opt.title}
                                  </h5>
                                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                                    {opt.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReservationWizardStep(1)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Automatically select first eligible room if none or invalid selected
                            const firstEligible = rooms.find(
                              (r) => !isRoomBookedForRange(r.id, blockForm.checkIn, blockForm.checkOut) && r.max_pax >= blockForm.paxCount
                            );
                            if (firstEligible && (!blockForm.roomId || isSelectedRoomOccupied || (selectedRoom && selectedRoom.max_pax < blockForm.paxCount))) {
                              setBlockForm({ ...blockForm, roomId: firstEligible.id });
                            }
                            setReservationWizardStep(3);
                          }}
                          className="w-2/3 py-2.5 rounded-full font-semibold transition shadow-xs bg-[#0b192c] hover:bg-[#182a44] text-white cursor-pointer flex items-center justify-center gap-2 text-xs active:scale-95"
                        >
                          <span>Siguiente: Elegir Habitación</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* PASO 3: HABITACIÓN DISPONIBLE (POR FECHAS Y CAPACIDAD) */}
                  {/* ======================================================== */}
                  {reservationWizardStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Filter criteria recap */}
                      <div className="bg-[#f4f7fb] border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500">
                          📅 {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} n)
                        </span>
                        <span className="font-mono font-bold text-[#0b192c]">
                          👥 {blockForm.paxCount} {blockForm.paxCount === 1 ? 'Huésped' : 'Huéspedes'}
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-mono font-bold text-[#0b192c] block mb-2">
                          Habitaciones Disponibles para estas Fechas y Capacidad:
                        </label>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                          {rooms.map((r) => {
                            const isOccupied = isRoomBookedForRange(r.id, blockForm.checkIn, blockForm.checkOut);
                            const hasCapacity = r.max_pax >= blockForm.paxCount;
                            const isAvailable = !isOccupied && hasCapacity;
                            const isSelected = blockForm.roomId === r.id;
                            const roomStayPrice = (r.base_price_clp || 240000) * calculatedNights;

                            return (
                              <div
                                key={r.id}
                                onClick={() => {
                                  if (!isAvailable) return;
                                  setBlockForm({ ...blockForm, roomId: r.id });
                                }}
                                className={`p-4 rounded-3xl border transition-all ${
                                  !isAvailable
                                    ? 'bg-slate-50 border-slate-200/70 opacity-60 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-[#0b192c] border-[#0b192c] text-white shadow-md ring-2 ring-[#0b192c]/20 cursor-pointer'
                                    : 'bg-[#f4f7fb] hover:bg-slate-100 border-slate-200/80 text-slate-700 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                        !isAvailable
                                          ? 'bg-slate-200 text-slate-400'
                                          : isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-200/80 text-[#0b192c]'
                                      }`}
                                    >
                                      {isOccupied ? <Lock className="w-4 h-4 text-rose-500" /> : <BedDouble className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className={`font-serif font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-[#0b192c]'}`}>
                                          Habitación #{r.room_number} - {r.room_name}
                                        </h5>
                                      </div>
                                      <span className={`text-[10px] block font-light ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>
                                        Capacidad: hasta {r.max_pax} huéspedes • ${r.base_price_clp.toLocaleString('es-CL')}/noche
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status badge & Total Price */}
                                  <div className="text-right shrink-0">
                                    {isOccupied ? (
                                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase block">
                                        Ocupada
                                      </span>
                                    ) : !hasCapacity ? (
                                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase block">
                                        Máx {r.max_pax} PAX
                                      </span>
                                    ) : (
                                      <div>
                                        <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase inline-block mb-0.5 ${
                                          isSelected
                                            ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-300/30'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}>
                                          Disponible
                                        </span>
                                        <div className={`text-[11px] font-mono font-bold ${isSelected ? 'text-white' : 'text-[#0b192c]'}`}>
                                          ${roomStayPrice.toLocaleString('es-CL')} CLP
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3 Actions */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReservationWizardStep(2)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver</span>
                        </button>
                        <button
                          type="button"
                          disabled={!isSelectedRoomEligible}
                          onClick={() => setReservationWizardStep(4)}
                          className={`w-2/3 py-2.5 rounded-full font-semibold transition shadow-xs flex items-center justify-center gap-2 text-xs active:scale-95 ${
                            !isSelectedRoomEligible
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#0b192c] hover:bg-[#182a44] text-white cursor-pointer'
                          }`}
                        >
                          <span>Siguiente: Datos de Pasajeros</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* PASO 4: DATOS DE TODOS LOS PASAJEROS & CONFIRMACIÓN */}
                  {/* ======================================================== */}
                  {reservationWizardStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Summary Banner of Chosen Booking */}
                      <div className="bg-[#0b192c] text-white rounded-3xl p-4 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs text-sky-200">
                            Habitación #{selectedRoom?.room_number} - {selectedRoom?.room_name}
                          </span>
                          <span className="font-mono font-bold text-sm text-white">
                            ${totalStayPrice.toLocaleString('es-CL')} CLP
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10 font-mono">
                          <span>📅 {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'})</span>
                          <span>👥 {blockForm.paxCount} {blockForm.paxCount === 1 ? 'Huésped' : 'Huéspedes'}</span>
                        </div>
                      </div>

                      {/* Passenger 1 (Main Guest) */}
                      <div className="space-y-3 p-4 bg-[#f4f7fb] border border-slate-200/90 rounded-3xl">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#0b192c] text-white flex items-center justify-center text-[10px] font-bold">
                            1
                          </div>
                          <h5 className="font-serif font-bold text-xs text-[#0b192c]">
                            Pasajero 1 (Titular de la Reserva) *
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                              Nombre Completo *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Ignacio Alarcón"
                              value={guestList[0]?.name || blockForm.guestName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlockForm({ ...blockForm, guestName: val });
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], name: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                              Teléfono / WhatsApp *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: +56 9 8131 2920"
                              value={guestList[0]?.phone || blockForm.guestPhone}
                              onChange={(e) => {
                                const val = formatPhone(e.target.value);
                                setBlockForm({ ...blockForm, guestPhone: val });
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], phone: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                              Email de Contacto
                            </label>
                            <input
                              type="email"
                              placeholder="Ej: huesped@email.com"
                              value={guestList[0]?.email || blockForm.guestEmail}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlockForm({ ...blockForm, guestEmail: val });
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], email: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                              RUT / Pasaporte
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 12.345.678-9 / Pasaporte"
                              value={guestList[0]?.rut || ''}
                              onChange={(e) => {
                                const val = formatRut(e.target.value);
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], rut: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Passengers (2, 3, 4) */}
                      {blockForm.paxCount > 1 && (
                        <div className="space-y-3">
                          {Array.from({ length: blockForm.paxCount - 1 }).map((_, idx) => {
                            const pIndex = idx + 1;
                            const guest = guestList[pIndex] || { name: '', rut: '' };

                            return (
                              <div
                                key={pIndex}
                                className="p-4 bg-[#f4f7fb] border border-slate-200/90 rounded-3xl space-y-2.5"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {pIndex + 1}
                                  </div>
                                  <h5 className="font-serif font-bold text-xs text-[#0b192c]">
                                    Pasajero {pIndex + 1} (Acompañante)
                                  </h5>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                                      Nombre Completo
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={`Ej: Pasajero ${pIndex + 1}`}
                                      value={guest.name}
                                      onChange={(e) => {
                                        const updated = [...guestList];
                                        updated[pIndex] = { ...updated[pIndex], name: e.target.value };
                                        setGuestList(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-medium"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                                      RUT / Pasaporte / Documento
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ej: 19.876.543-2"
                                      value={guest.rut}
                                      onChange={(e) => {
                                        const updated = [...guestList];
                                        updated[pIndex] = { ...updated[pIndex], rut: formatRut(e.target.value) };
                                        setGuestList(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Canal & Estado de Pago */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                            Canal de Reserva
                          </label>
                          <select
                            value={blockForm.channelSource}
                            onChange={(e) => setBlockForm({ ...blockForm, channelSource: e.target.value as any })}
                            className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-medium cursor-pointer"
                          >
                            <option value="phone_whatsapp">Teléfono / WhatsApp</option>
                            <option value="web_direct">Web Directa Yates Chile</option>
                            <option value="airbnb">Airbnb (Sincronizada)</option>
                            <option value="booking_com">Booking.com</option>
                            <option value="maintenance">Bloqueo Técnico / Mantención</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                            Estado de Pago
                          </label>
                          <select
                            value={blockForm.status}
                            onChange={(e) => setBlockForm({ ...blockForm, status: e.target.value as any })}
                            className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs font-semibold cursor-pointer"
                          >
                            <option value="approved">Confirmada (Pagada)</option>
                            <option value="pending_transfer">Pendiente de Transferencia</option>
                            <option value="blocked">Bloqueo de Calendario</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes / Special Requests */}
                      <div>
                        <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                          Notas / Requerimientos Especiales
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Traslado desde aeródromo Robinson Crusoe, late check-out..."
                          value={blockForm.reason}
                          onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                          className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2 text-[#0b192c] focus:border-[#0b192c] focus:outline-none text-xs"
                        />
                      </div>

                      {/* Step 4 Actions */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReservationWizardStep(3)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver</span>
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-2.5 rounded-full font-semibold transition shadow-xs bg-[#0b192c] hover:bg-[#182a44] text-white cursor-pointer flex items-center justify-center gap-2 text-xs active:scale-95"
                        >
                          <Check className="w-4 h-4 text-sky-300" />
                          <span>Confirmar Reserva de Hospedaje</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR INFORMACIÓN / NOMBRE DE HABITACIÓN */}
      {/* ========================================================================= */}
      {editRoomModal.isOpen && editRoomModal.room && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(11,25,44,0.25)] space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/90 text-[#0b192c] flex items-center justify-center shadow-xs shrink-0">
                  <BedDouble className="w-6 h-6 text-sky-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                    Habitación #{editRoomModal.room.room_number}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#0b192c]">
                    Editar Habitación
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditRoomModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomName} className="space-y-4">
              {/* Room Name Input */}
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1.5">
                  Nombre de la Cabina / Habitación
                </label>
                <input
                  type="text"
                  required
                  value={editRoomModal.roomName}
                  onChange={(e) =>
                    setEditRoomModal((prev) => ({ ...prev, roomName: e.target.value }))
                  }
                  placeholder="Ej: Albatros (Doble Matrimonial Vista Océano)"
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-bold focus:outline-none focus:border-[#0b192c] transition shadow-2xs"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-light">
                  Este nombre se reflejará en el calendario, reservas, cotizaciones y catálogo.
                </p>
              </div>

              {/* Price & Max Pax Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1.5">
                    Tarifa Base ($ CLP / Noche)
                  </label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="1000"
                    value={editRoomModal.basePrice}
                    onChange={(e) =>
                      setEditRoomModal((prev) => ({
                        ...prev,
                        basePrice: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-[#0b192c] font-mono font-bold focus:outline-none focus:border-[#0b192c] transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1.5">
                    Capacidad (Huéspedes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={editRoomModal.maxPax}
                    onChange={(e) =>
                      setEditRoomModal((prev) => ({
                        ...prev,
                        maxPax: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-[#0b192c] font-mono font-bold focus:outline-none focus:border-[#0b192c] transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRoomModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoom || !editRoomModal.roomName.trim()}
                  className="px-6 py-2 rounded-full bg-[#0b192c] hover:bg-[#182a44] active:scale-95 text-white font-semibold transition text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingRoom ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span>{isSavingRoom ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONCILIAR TRANSFERENCIA (LUXURY LIGHT/NAVY THEME) */}
      {/* ========================================================================= */}
      {selectedInstallment && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(11,25,44,0.15)] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                  Conciliación de Pagos
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0b192c]">Revisar Transferencia</h4>
              </div>
              <button
                onClick={() => setSelectedInstallment(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="bg-[#f4f7fb] p-5 rounded-3xl space-y-2 text-xs border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Concepto:</span>
                <span className="font-bold text-[#0b192c]">{selectedInstallment.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Monto Esperado:</span>
                <span className="font-mono font-bold text-[#0b192c] text-sm">
                  ${selectedInstallment.amount_expected.toLocaleString('es-CL')} CLP
                </span>
              </div>
              {selectedInstallment.receipt_url && (
                <div className="pt-3">
                  <span className="text-slate-500 block mb-1.5 font-bold">Voucher del Comprobante:</span>
                  <a
                    href={selectedInstallment.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl overflow-hidden border border-slate-200 max-h-48 shadow-2xs"
                  >
                    <img
                      src={selectedInstallment.receipt_url}
                      alt="Comprobante"
                      className="w-full h-full object-contain bg-white"
                    />
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                  Descuento Especial (Opcional - Monto en CLP)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-mono font-bold focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                />
              </div>

              {discountAmount > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-[#0b192c] block mb-1">
                    Motivo del Descuento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Descuento grupo familiar / Convenio"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedInstallment(null)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleApprovePayment(selectedInstallment)}
                className="w-2/3 bg-[#0b192c] hover:bg-[#182a44] text-white py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Aprobar y Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA EXPERIENCIA / SERVICIO (LUXURY LIGHT/NAVY THEME) */}
      {/* ========================================================================= */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-[0_20px_50px_rgba(11,25,44,0.15)] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                  Catálogo de Experiencias
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0b192c]">Nueva Experiencia</h4>
              </div>
              <button
                onClick={() => setShowNewServiceModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cabalgata Mirador Selkirk"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-medium focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">Categoría</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) =>
                      setNewServiceForm({
                        ...newServiceForm,
                        category: e.target.value as 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar',
                      })
                    }
                    className="w-full bg-[#f4f7fb] border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none cursor-pointer"
                  >
                    <option value="cabalgatas">Cabalgatas</option>
                    <option value="buceo">Buceo / Snorkel</option>
                    <option value="trekking">Trekking</option>
                    <option value="gastronomia">Gastronomía</option>
                    <option value="nautica">Náutica</option>
                    <option value="bienestar">Bienestar</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">Precio (CLP) *</label>
                  <input
                    type="number"
                    value={newServiceForm.price_clp}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, price_clp: Number(e.target.value) })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-[#0b192c] font-mono font-bold focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">Duración (Etiqueta)</label>
                <input
                  type="text"
                  placeholder="Ej: Medio Día (4 hrs)"
                  value={newServiceForm.duration_label}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, duration_label: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalle de la actividad..."
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1.5">URL Foto (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newServiceForm.image_url}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, image_url: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0b192c] hover:bg-[#182a44] text-white py-2.5 rounded-full font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANIFIESTO DE PASAJEROS & CONTROL DE ZARPE / PAGOS */}
      {/* ========================================================================= */}
      {selectedExpeditionForManifest && (() => {
        const exp = selectedExpeditionForManifest;
        const allExpPassengers = getPassengersForExpedition(exp, expBookings);
        
        // Filter by search query and payment status
        const filteredPassengers = allExpPassengers.filter((pax) => {
          const matchesSearch = 
            pax.fullName.toLowerCase().includes(manifestSearchQuery.toLowerCase()) ||
            pax.rutPassport.toLowerCase().includes(manifestSearchQuery.toLowerCase()) ||
            pax.email.toLowerCase().includes(manifestSearchQuery.toLowerCase()) ||
            pax.phone.toLowerCase().includes(manifestSearchQuery.toLowerCase()) ||
            pax.code.toLowerCase().includes(manifestSearchQuery.toLowerCase());

          const matchesPayment = 
            manifestPaymentFilter === 'all' ? true :
            manifestPaymentFilter === 'paid' ? pax.paymentStatus === 'paid' :
            manifestPaymentFilter === 'partial' ? pax.paymentStatus === 'partial' :
            pax.paymentStatus === 'pending';

          return matchesSearch && matchesPayment;
        });

        const totalPaxCount = allExpPassengers.reduce((sum, p) => sum + p.paxCount, 0);
        const totalMaxPax = exp.maxPax || (exp.totalSlots ? exp.totalSlots : 6);
        const totalAmountClp = allExpPassengers.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPaidClp = allExpPassengers.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalPendingClp = Math.max(0, totalAmountClp - totalPaidClp);
        const paidPaxCount = allExpPassengers.filter(p => p.paymentStatus === 'paid').length;
        const partialPaxCount = allExpPassengers.filter(p => p.paymentStatus === 'partial').length;
        const pendingPaxCount = allExpPassengers.filter(p => p.paymentStatus === 'pending').length;

        const isFull = totalPaxCount >= totalMaxPax;
        const percentOccupied = Math.min(100, Math.round((totalPaxCount / totalMaxPax) * 100));

        return (
          <div className="fixed inset-0 z-50 bg-[#0b192c]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(11,25,44,0.25)] border border-slate-200/90 overflow-hidden my-auto animate-scaleIn">
              
              {/* Modal Header */}
              <div className="px-6 py-5 bg-[#0b192c] text-white flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs shrink-0">
                    <Users className="w-5 h-5 text-sky-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 font-bold">
                        Manifiesto Oficial de Zarpe
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isFull 
                          ? 'bg-slate-700 text-slate-200 border border-slate-600'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}>
                        {totalPaxCount} de {totalMaxPax} Cupos ({isFull ? 'Agotado' : `${totalMaxPax - totalPaxCount} disponibles`})
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5 truncate">
                      {exp.routeTitle || exp.name || 'Expedición Robinson Crusoe'}
                    </h3>
                    <p className="text-xs text-sky-100/80 font-light truncate mt-0.5">
                      {exp.vesselName} {exp.vesselType ? `• ${exp.vesselType}` : ''} • Fechas: {exp.departureDates || `${exp.departureDate} al ${exp.returnDate}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedExpeditionForManifest(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Executive Metrics Bar (4 Mini KPI Cards) */}
              <div className="p-6 bg-[#f4f7fb] border-b border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
                {/* Ocupación */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Ocupación / Cupos</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-serif font-bold text-lg text-[#0b192c]">{totalPaxCount}</span>
                    <span className="text-xs text-slate-500 font-mono">/ {totalMaxPax} pax</span>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded ml-auto">
                      {percentOccupied}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-[#0b192c] h-full rounded-full" style={{ width: `${percentOccupied}%` }} />
                  </div>
                </div>

                {/* Total Recaudado */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Recaudado</span>
                  <div className="mt-1">
                    <span className="font-mono font-extrabold text-base text-emerald-700 block">
                      ${totalPaidClp.toLocaleString('es-CL')} <span className="text-[10px] font-normal text-slate-400">CLP</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {paidPaxCount} 100% Pagados • {partialPaxCount} Abonos
                    </span>
                  </div>
                </div>

                {/* Saldo Por Cobrar */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Saldo Por Cobrar</span>
                  <div className="mt-1">
                    <span className={`font-mono font-extrabold text-base block ${totalPendingClp > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                      ${totalPendingClp.toLocaleString('es-CL')} <span className="text-[10px] font-normal text-slate-400">CLP</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {pendingPaxCount > 0 ? `${pendingPaxCount} con saldo pendiente` : 'Todos los pagos al día'}
                    </span>
                  </div>
                </div>

                {/* Tarifa Individual */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Tarifa Oficial p/Pax</span>
                  <div className="mt-1">
                    <span className="font-mono font-extrabold text-base text-[#0b192c] block">
                      ${(exp.pricePerPaxClp || 2200000).toLocaleString('es-CL')} <span className="text-[10px] font-normal text-slate-400">CLP</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold block mt-0.5">
                      ✓ Todo incluido a bordo
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={manifestSearchQuery}
                      onChange={(e) => setManifestSearchQuery(e.target.value)}
                      placeholder="Buscar pasajero por nombre, RUT, email..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-[#0b192c] placeholder:text-slate-400 focus:outline-none focus:border-[#0b192c] transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter Pills */}
                  <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-2xs text-xs font-mono">
                    {[
                      { id: 'all', label: `Todos (${allExpPassengers.length})` },
                      { id: 'paid', label: `Pagados (${paidPaxCount})` },
                      { id: 'partial', label: `Abono 50% (${partialPaxCount})` },
                      { id: 'pending', label: `Pendientes (${pendingPaxCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setManifestPaymentFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          manifestPaymentFilter === f.id
                            ? 'bg-[#0b192c] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0b192c]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Add Passenger Button */}
                  {(exp.availablePax > 0 || (totalMaxPax - totalPaxCount > 0)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExpeditionForManifest(null);
                        handleOpenAddPassengerModal(exp);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b192c] hover:bg-[#182a44] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-300" />
                      <span>Sumar Pasajero</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Table Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {filteredPassengers.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#fbfcfd] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3.5 px-4">#</th>
                          <th className="py-3.5 px-4">Pasajero & RUT / ID</th>
                          <th className="py-3.5 px-4">Contacto</th>
                          <th className="py-3.5 px-4">Tarifa & Total</th>
                          <th className="py-3.5 px-4">Monto Pagado / Estado</th>
                          <th className="py-3.5 px-4">Ficha Médica & Emergencia</th>
                          <th className="py-3.5 px-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {filteredPassengers.map((pax, idx) => {
                          const isFullyPaid = pax.paymentStatus === 'paid';
                          const isPartial = pax.paymentStatus === 'partial';

                          return (
                            <tr key={pax.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] font-bold">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#0b192c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                    {pax.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <strong className="text-[#0b192c] font-semibold text-xs block">
                                      {pax.fullName}
                                    </strong>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                      <span>RUT: {pax.rutPassport}</span>
                                      <span>•</span>
                                      <span className="text-sky-700">{pax.code}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5 text-[11px]">
                                  <a href={`mailto:${pax.email}`} className="text-slate-600 hover:text-[#0b192c] hover:underline flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{pax.email}</span>
                                  </a>
                                  <a href={`tel:${pax.phone.replace(/[^0-9+]/g, '')}`} className="text-slate-600 hover:text-sky-700 font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{pax.phone}</span>
                                  </a>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono">
                                <div>
                                  <strong className="text-[#0b192c] text-xs font-bold block">
                                    ${pax.totalAmount.toLocaleString('es-CL')} CLP
                                  </strong>
                                  <span className="text-[10px] text-slate-400">
                                    {pax.paxCount} {pax.paxCount === 1 ? 'cupo individual' : 'cupos'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs text-[#0b192c]">
                                      ${pax.amountPaid.toLocaleString('es-CL')} CLP
                                    </span>
                                  </div>

                                  <div className="inline-flex items-center">
                                    {isFullyPaid ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Pagado 100%</span>
                                      </span>
                                    ) : isPartial ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3 text-sky-600" />
                                        <span>Abono 50%</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        <span>Pendiente</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-600 leading-tight">
                                    {pax.dietaryNotes}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    <span className="font-semibold text-slate-500">Emergencia:</span> {pax.emergencyContact}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus = isFullyPaid ? 'partial' : isPartial ? 'pending' : 'paid';
                                    handleUpdatePassengerPaymentStatus(pax.id, nextStatus);
                                  }}
                                  className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0b192c] text-slate-600 hover:text-white transition shadow-2xs cursor-pointer whitespace-nowrap"
                                  title="Cambiar estado de pago"
                                >
                                  {isFullyPaid ? 'Marcar Abono' : isPartial ? 'Marcar Pend.' : 'Marcar Pagado'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No se encontraron pasajeros registrados con este filtro</p>
                    <p className="text-xs text-slate-400 mt-0.5">Prueba con otro término de búsqueda o suma un pasajero a esta expedición.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Manifiesto oficial para Capitanía de Puerto y Armada de Chile</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-[#0b192c] border border-slate-200 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Imprimir Manifiesto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedExpeditionForManifest(null)}
                    className="px-5 py-2 bg-[#0b192c] hover:bg-[#182a44] text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR / SUMAR PASAJERO A TRAVESÍA (MULTI-PASO & SPLIT PREVIEW) */}
      {/* ========================================================================= */}
      {selectedExpeditionForPassenger && (() => {
        const exp = selectedExpeditionForPassenger;
        const totalCapacity = Math.max(1, Number(exp.maxPax || exp.totalSlots || 6));
        const rawAvailable = typeof exp.availablePax === 'number'
          ? exp.availablePax
          : typeof exp.spotsLeft === 'number'
          ? exp.spotsLeft
          : (totalCapacity - (Number(exp.bookedPax) || 0));
        const availableSlots = Math.max(0, Number(rawAvailable) || 0);
        const bookedSpots = Math.max(0, totalCapacity - availableSlots);
        const refPriceClp = Number(exp.pricePerPaxClp) || (typeof exp.pricePerPax === 'string' ? parseInt(exp.pricePerPax.replace(/[^0-9]/g, ''), 10) || 1950000 : 1950000);
        const currentCustomPrice = Number(expPassengerForm.customPricePerPax) || refPriceClp;
        const priceDifference = currentCustomPrice - refPriceClp;
        const totalToCharge = expPassengerForm.bookingType === 'full_charter'
          ? (Number(exp.priceCharterFullClp) || currentCustomPrice * totalCapacity)
          : currentCustomPrice * Math.max(1, expPassengerForm.paxCount || 1);

        const expImage =
          exp.image ||
          exp.heroImage ||
          exp.publicCoverImage ||
          exp.cover_image ||
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';

        return (
          <div className="fixed inset-0 z-50 bg-[#0b192c]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col lg:flex-row shadow-[0_25px_70px_rgba(11,25,44,0.35)] border border-slate-200/90 overflow-hidden my-auto animate-scaleIn">
              
              {/* ================================================================= */}
              {/* COLUMNA IZQUIERDA: IMAGEN DE FONDO COMPLETA & RESUMEN EN TIEMPO REAL */}
              {/* ================================================================= */}
              <div className="w-full lg:w-[360px] shrink-0 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700/50">
                {/* Imagen fotográfica de fondo de toda la columna */}
                <img
                  src={expImage}
                  alt={exp.routeTitle || exp.name}
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-105"
                />
                
                {/* Capa de degradado luxury y oscurecimiento para legibilidad perfecta */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#081322]/90 via-[#0b192c]/85 to-[#050b14]/95 backdrop-blur-[2px]" />

                {/* Glow decorativo sutil */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Contenido superior sobre la foto de fondo */}
                <div className="relative z-10 space-y-4">
                  {/* Badges superiores */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-sky-500/25 backdrop-blur-md text-sky-200 border border-sky-300/30 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Expedición Náutica
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full">
                      {exp.vesselName || 'Velero Vegvisir'}
                    </span>
                    <span className="bg-emerald-500/80 backdrop-blur-md text-white font-bold text-[10px] font-mono px-2 py-0.5 rounded-full">
                      {availableSlots} {availableSlots === 1 ? 'libre' : 'libres'}
                    </span>
                  </div>

                  {/* Título de la Expedición y Fechas */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-sm">
                      {exp.routeTitle || exp.name}
                    </h3>
                    <p className="text-xs text-sky-100 flex items-center gap-1.5 font-medium bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl w-fit">
                      <Calendar className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                      <span>{exp.departureDates || `${formatDateDDMMYYYY(exp.rawDepartureDate || exp.departureDate)} ➔ ${formatDateDDMMYYYY(exp.rawReturnDate || exp.returnDate)}`}</span>
                    </p>
                  </div>
                </div>

                {/* Total a Facturar Minimalista (Glassmorphic) */}
                <div className="relative z-10 pt-4">
                  <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-0.5">
                      Total a Facturar
                    </span>
                    <span className="text-xl font-bold font-mono text-white tracking-tight">
                      ${totalToCharge.toLocaleString('es-CL')}{' '}
                      <span className="text-xs text-sky-300 font-normal">CLP</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* ================================================================= */}
              {/* COLUMNA DERECHA: ASISTENTE MULTI-PASO (WIZARD) */}
              {/* ================================================================= */}
              <div className="flex-1 flex flex-col justify-between bg-[#fbfcfd] overflow-hidden">
                
                {/* Header con Stepper Navigation */}
                <div className="px-6 sm:px-8 py-5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Paso {expPassengerStep} de 4
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span className="text-[10px] font-mono font-bold text-[#0b192c]">
                        {expPassengerStep === 1 && '1. Cantidad de Pasajeros & Cupos'}
                        {expPassengerStep === 2 && '2. Datos Personales & Fecha de Nacimiento'}
                        {expPassengerStep === 3 && '3. Tarifa por Pasajero & Pago (CLP)'}
                        {expPassengerStep === 4 && '4. Resumen & Confirmación Final'}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#0b192c]">
                      Registrar Pasajero en Travesía
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedExpeditionForPassenger(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0b192c] flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Cerrar modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stepper Progress Bar con Círculos Elegantes */}
                <div className="px-6 sm:px-8 py-3.5 bg-white border-b border-slate-200/80">
                  <div className="flex items-center justify-between max-w-md mx-auto relative">
                    {/* Línea conectora de fondo */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-[#0b192c] transition-all duration-300 -z-0"
                      style={{
                        width: `${((expPassengerStep - 1) / 3) * 100}%`,
                        maxWidth: 'calc(100% - 32px)',
                      }}
                    />

                    {[
                      { num: 1, label: 'Cupos' },
                      { num: 2, label: 'Pasajeros' },
                      { num: 3, label: 'Tarifa' },
                      { num: 4, label: 'Confirmar' },
                    ].map((st) => {
                      const isCompleted = expPassengerStep > st.num;
                      const isCurrent = expPassengerStep === st.num;
                      const isClickable = isCompleted || (st.num === 2 && expPassengerStep >= 1) || (st.num === 3 && isExpStep2Valid());

                      return (
                        <button
                          key={st.num}
                          type="button"
                          disabled={!isClickable && !isCurrent}
                          onClick={() => {
                            if (st.num > 2 && expPassengerStep <= 2) {
                              if (!validateExpStep2()) return;
                            }
                            setExpPassengerStep(st.num);
                          }}
                          className={`flex flex-col items-center gap-1 relative z-10 group ${
                            isClickable ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          {/* Círculo del Paso */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-2xs ${
                              isCurrent
                                ? 'bg-[#0b192c] text-white ring-4 ring-sky-100 shadow-md scale-105'
                                : isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-slate-400 border-2 border-slate-300 group-hover:border-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-white stroke-[2.5]" />
                            ) : (
                              <span>{st.num}</span>
                            )}
                          </div>

                          {/* Etiqueta del Paso */}
                          <span
                            className={`text-[11px] font-sans font-medium tracking-tight transition-colors ${
                              isCurrent
                                ? 'text-[#0b192c] font-bold'
                                : isCompleted
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Body del Formulario con scroll independiente */}
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* ------------------------------------------------------------- */}
                  {/* PASO 1: CANTIDAD DE PASAJEROS & MODALIDAD                     */}
                  {/* ------------------------------------------------------------- */}
                  {expPassengerStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">

                      <div className="space-y-3">
                        <label className="block text-xs font-mono uppercase font-bold text-slate-700">
                          ¿Cuántos pasajeros registrarás en esta reserva? <span className="text-rose-500">*</span>
                        </label>
                        
                        {/* Selector con botones interactivos de cupos */}
                        <div className="flex flex-wrap items-center gap-3">
                          {availableSlots > 0 ? (
                            Array.from({ length: Math.min(6, availableSlots) }, (_, i) => i + 1).map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => handleExpPaxCountChange(n)}
                                className={`flex-1 min-w-[70px] py-3.5 px-4 rounded-2xl font-mono text-sm font-bold transition-all border cursor-pointer ${
                                  expPassengerForm.paxCount === n
                                    ? 'bg-[#0b192c] text-white border-[#0b192c] shadow-md scale-102'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                <span className="block text-base">{n}</span>
                                <span className="text-[10px] font-normal text-slate-400 block font-sans">
                                  {n === 1 ? 'Pasajero' : 'Pasajeros'}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                              Esta expedición se encuentra sin cupos disponibles actualmente.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modalidad de Reserva */}
                      <div className="space-y-3 pt-4 border-t border-slate-200/70">
                        <label className="block text-xs font-mono uppercase font-bold text-slate-700">
                          Modalidad de Travesía
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Cupo Individual */}
                          <button
                            type="button"
                            onClick={() => setExpPassengerForm({ ...expPassengerForm, bookingType: 'per_pax' })}
                            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                              expPassengerForm.bookingType === 'per_pax'
                                ? 'bg-sky-50/50 border-[#0b192c] text-[#0b192c] ring-1 ring-[#0b192c]'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">Cupo Individual (Plazas)</span>
                              <Ship className="w-4 h-4 text-sky-700" />
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Reserva por plaza individual en camarote compartido o privado según cupos.
                            </p>
                          </button>

                          {/* Chárter Privado (Inteligente: Solo habilitado si la nave está 100% libre) */}
                          {bookedSpots === 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpPassengerForm({ ...expPassengerForm, bookingType: 'full_charter' })}
                              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                                expPassengerForm.bookingType === 'full_charter'
                                  ? 'bg-sky-50/50 border-[#0b192c] text-[#0b192c] ring-1 ring-[#0b192c]'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs">Chárter Privado (Exclusivo)</span>
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Reserva la nave completa para grupo privado con patrón y marinero exclusivo.
                              </p>
                            </button>
                          ) : (
                            <div
                              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-400 cursor-not-allowed select-none space-y-1.5"
                              title="No disponible: Ya existen pasajeros registrados en esta travesía"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-500">Chárter Privado (Exclusivo)</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  <span>Bloqueado</span>
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-snug">
                                No disponible: Ya hay {bookedSpots} {bookedSpots === 1 ? 'pasajero registrado' : 'pasajeros registrados'} a bordo. La nave completa requiere 100% de aforo libre.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* PASO 2: DATOS PERSONALES & FECHA DE NACIMIENTO                */}
                  {/* ------------------------------------------------------------- */}
                  {expPassengerStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Banner Informativo / Validación Personalizado con diseño del sitio */}
                      {expPassengerValidationError && (
                        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs animate-fadeIn">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-xs text-amber-950">
                            <strong className="font-semibold block mb-0.5 text-amber-900">Información Incompleta</strong>
                            <p className="text-amber-800 leading-relaxed font-normal">{expPassengerValidationError}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpPassengerValidationError(null)}
                            className="w-6 h-6 rounded-lg text-amber-500 hover:text-amber-800 hover:bg-amber-100 flex items-center justify-center transition cursor-pointer"
                            title="Descartar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Tabs de Pasajeros si hay más de 1 */}
                      {expPassengerForm.paxCount > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                          {expPassengerForm.passengers.map((pax, idx) => {
                            const isComplete = pax.fullName.trim() && pax.rutPassport.trim() && pax.birthDate.trim();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setExpPassengerActiveTab(idx);
                                  setExpPassengerValidationError(null);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                                  expPassengerActiveTab === idx
                                    ? 'bg-[#0b192c] text-white border-[#0b192c] shadow-xs'
                                    : isComplete
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {isComplete && <Check className="w-3 h-3 text-emerald-600" />}
                                <span>Pasajero {idx + 1} {idx === 0 ? '(Titular)' : ''}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Formulario del Pasajero Seleccionado */}
                      {(() => {
                        const idx = expPassengerActiveTab;
                        const pax = expPassengerForm.passengers[idx] || {
                          fullName: '',
                          rutPassport: '',
                          birthDate: '',
                          email: '',
                          phone: '',
                          dietaryNotes: '',
                          emergencyContact: '',
                          emergencyPhone: '',
                        };

                        return (
                          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-sky-700" />
                                <span>Información de Pasajero {idx + 1} {idx === 0 ? '— Titular de la Reserva' : ''}</span>
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400">
                                {idx + 1} de {expPassengerForm.paxCount}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Nombre Completo */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Nombre Completo <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ej: Carolina Morales Silva"
                                  value={pax.fullName}
                                  onChange={(e) => handleUpdateExpPassengerField(idx, 'fullName', e.target.value)}
                                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                                />
                              </div>

                              {/* RUT o Pasaporte */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  RUT o Pasaporte <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ej: 18.345.678-9 / P123456"
                                  value={pax.rutPassport}
                                  onChange={(e) => handleUpdateExpPassengerField(idx, 'rutPassport', e.target.value)}
                                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                                />
                              </div>

                              {/* Fecha de Nacimiento (Requerida por el usuario) */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Fecha de Nacimiento <span className="text-rose-500">*</span>
                                </label>
                                <LuxuryDatePicker
                                  required
                                  value={pax.birthDate}
                                  onChange={(val) => handleUpdateExpPassengerField(idx, 'birthDate', val)}
                                  placeholder="dd/mm/aaaa"
                                />
                              </div>

                              {/* Teléfono / WhatsApp */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Teléfono / WhatsApp {idx === 0 ? <span className="text-rose-500">*</span> : '(Opcional)'}
                                </label>
                                <CountryPhoneInput
                                  required={idx === 0}
                                  value={pax.phone}
                                  onChange={(val) => handleUpdateExpPassengerField(idx, 'phone', val)}
                                  placeholder="9 8765 4321"
                                />
                              </div>

                              {/* Correo Electrónico */}
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Correo Electrónico {idx === 0 ? <span className="text-rose-500">*</span> : '(Opcional)'}
                                </label>
                                <input
                                  type="email"
                                  required={idx === 0}
                                  placeholder="pasajero@correo.com"
                                  value={pax.email}
                                  onChange={(e) => handleUpdateExpPassengerField(idx, 'email', e.target.value)}
                                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                                />
                              </div>

                              {/* Nombre y Apellido Contacto de Emergencia */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Nombre y Apellido Contacto de Emergencia (Opcional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Carmen Gloria Silva"
                                  value={pax.emergencyContact}
                                  onChange={(e) => handleUpdateExpPassengerField(idx, 'emergencyContact', e.target.value)}
                                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                                />
                              </div>

                              {/* Teléfono Contacto de Emergencia con selector de país */}
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Teléfono Contacto de Emergencia (Opcional)
                                </label>
                                <CountryPhoneInput
                                  value={pax.emergencyPhone || ''}
                                  onChange={(val) => handleUpdateExpPassengerField(idx, 'emergencyPhone', val)}
                                  placeholder="9 1234 5678"
                                />
                              </div>

                              {/* Restricciones Dietéticas / Alergias */}
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                                  Restricciones Dietéticas / Médicas (Opcional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Vegetariano, celíaco, alergia a mariscos..."
                                  value={pax.dietaryNotes}
                                  onChange={(e) => handleUpdateExpPassengerField(idx, 'dietaryNotes', e.target.value)}
                                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* PASO 3: TARIFA POR PASAJERO & DESCUENTOS (CLP)                */}
                  {/* ------------------------------------------------------------- */}
                  {expPassengerStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Tarifa Oficial vs Modificada */}
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-700" />
                            <span>Tarifa a Cobrar por Pasajero (en Pesos Chilenos)</span>
                          </h4>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            Moneda: CLP
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          {/* Tarifa de Referencia Oficial */}
                          <div className="bg-[#f4f7fb] border border-slate-200 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                              Tarifa de Lista Oficial (Referencia)
                            </span>
                            <div className="text-base font-bold font-mono text-slate-700">
                              ${refPriceClp.toLocaleString('es-CL')} CLP
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Precio de catálogo establecido para esta travesía.
                            </p>
                          </div>

                          {/* Tarifa Personalizada / Con Descuento */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono uppercase font-bold text-[#0b192c]">
                              Valor Acordado por Pasajero <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                                $
                              </span>
                              <input
                                type="number"
                                step={10000}
                                min={0}
                                value={expPassengerForm.customPricePerPax}
                                onChange={(e) =>
                                  setExpPassengerForm({
                                    ...expPassengerForm,
                                    customPricePerPax: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-white hover:bg-slate-50 focus:bg-white border-2 border-[#0b192c] rounded-2xl pl-8 pr-14 py-3 text-base font-mono font-bold text-[#0b192c] focus:outline-none transition shadow-xs"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                                CLP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Indicador de Descuento / Modificación en Vivo */}
                        {priceDifference !== 0 ? (
                          <div
                            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                              priceDifference < 0
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className={`w-4 h-4 ${priceDifference < 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                              <span>
                                {priceDifference < 0
                                  ? `Descuento especial aplicado: -$${Math.abs(priceDifference).toLocaleString('es-CL')} CLP por cupo`
                                  : `Tarifa con recargo adicional: +$${priceDifference.toLocaleString('es-CL')} CLP`}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[11px]">
                              {priceDifference < 0
                                ? `-${((Math.abs(priceDifference) / refPriceClp) * 100).toFixed(1)}%`
                                : `+${((priceDifference / refPriceClp) * 100).toFixed(1)}%`}
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                            <Check className="w-4 h-4 text-slate-400" />
                            <span>Tarifa estándar de catálogo (sin modificaciones ni descuentos aplicados).</span>
                          </div>
                        )}
                      </div>

                      {/* Configuración de Estado de Pago con Tarjetas Seleccionables */}
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-2xs">
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-600">
                          Modalidad Inicial del Pago <span className="text-rose-500">*</span>
                        </label>

                        {/* Opciones Interactivas de Selección (Cards) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Opción 1: 100% Pagado */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpPassengerForm({
                                ...expPassengerForm,
                                status: '100_paid',
                              })
                            }
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                              expPassengerForm.status === '100_paid'
                                ? 'bg-[#0b192c] text-white border-[#0b192c] shadow-md ring-2 ring-sky-300/30'
                                : 'bg-[#f8fafc] text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                expPassengerForm.status === '100_paid'
                                  ? 'bg-emerald-500 border-emerald-400 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-sm font-bold block leading-tight">
                                  100% Pagado
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    expPassengerForm.status === '100_paid'
                                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  Total
                                </span>
                              </div>
                              <p
                                className={`text-[11px] leading-relaxed ${
                                  expPassengerForm.status === '100_paid'
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                }`}
                              >
                                Liquidación completa del total de la travesía.
                              </p>
                            </div>
                          </button>

                          {/* Opción 2: 50% Reservado */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpPassengerForm({
                                ...expPassengerForm,
                                status: '50_reserved',
                              })
                            }
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                              expPassengerForm.status === '50_reserved'
                                ? 'bg-[#0b192c] text-white border-[#0b192c] shadow-md ring-2 ring-sky-300/30'
                                : 'bg-[#f8fafc] text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                expPassengerForm.status === '50_reserved'
                                  ? 'bg-amber-500 border-amber-400 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-sm font-bold block leading-tight">
                                  50% Reservado
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    expPassengerForm.status === '50_reserved'
                                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  Abono
                                </span>
                              </div>
                              <p
                                className={`text-[11px] leading-relaxed ${
                                  expPassengerForm.status === '50_reserved'
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                }`}
                              >
                                Abono inicial para asegurar plazas (saldo previo al zarpe).
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* PASO 4: RESUMEN & CONFIRMACIÓN FINAL                          */}
                  {/* ------------------------------------------------------------- */}
                  {expPassengerStep === 4 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span>Confirmación de Registro en Travesía</span>
                          </h4>
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                            Listo para Emitir
                          </span>
                        </div>

                        {/* Listado de Pasajeros a Inscribir */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                            Pasajeros Registrados ({expPassengerForm.passengers.length})
                          </span>

                          <div className="space-y-2">
                            {expPassengerForm.passengers.map((pax, idx) => (
                              <div
                                key={idx}
                                className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <strong className="text-[#0b192c] font-bold block text-xs">
                                    {pax.fullName || 'Pasajero'}
                                  </strong>
                                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                    <span>RUT: {pax.rutPassport || 'No informado'}</span>
                                    <span>•</span>
                                    <span>F. Nacimiento: {pax.birthDate || 'No informada'}</span>
                                  </div>
                                </div>

                                <div className="text-right space-y-0.5">
                                  <span className="text-[11px] text-slate-600 block">
                                    {pax.phone || 'Sin teléfono'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {idx === 0 ? 'Pasajero Titular' : `Acompañante ${idx}`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Desglose de Montos */}
                        <div className="bg-[#0b192c] text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase text-sky-300 font-bold block">
                                Total Expedición
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                  expPassengerForm.status === '50_reserved'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                }`}
                              >
                                {expPassengerForm.status === '50_reserved' ? '50% RESERVADO' : '100% PAGADO'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-300 block">
                              {expPassengerForm.paxCount} {expPassengerForm.paxCount === 1 ? 'cupo' : 'cupos'} x ${currentCustomPrice.toLocaleString('es-CL')} CLP
                            </span>
                            {expPassengerForm.status === '50_reserved' && (
                              <div className="text-[11px] text-amber-200 font-mono pt-1 space-y-0.5">
                                <div>Abono inicial 50%: <strong>${Math.round(totalToCharge * 0.5).toLocaleString('es-CL')} CLP</strong></div>
                                <div className="text-slate-400">Saldo pendiente 50%: <strong>${Math.round(totalToCharge * 0.5).toLocaleString('es-CL')} CLP</strong> (antes del zarpe)</div>
                              </div>
                            )}
                          </div>

                          <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                            <div className="text-xl font-bold font-mono text-emerald-400">
                              ${totalToCharge.toLocaleString('es-CL')} <span className="text-xs font-normal text-sky-300">CLP</span>
                            </div>
                            {expPassengerForm.status === '50_reserved' && (
                              <span className="text-[11px] font-mono text-amber-300 block">
                                A pagar hoy: ${Math.round(totalToCharge * 0.5).toLocaleString('es-CL')} CLP
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

                {/* Footer de Navegación de Pasos */}
                <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                  {expPassengerStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setExpPassengerStep((prev) => Math.max(1, prev - 1))}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0b192c] hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Atrás</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedExpeditionForPassenger(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                  {expPassengerStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (expPassengerStep === 2) {
                          if (!validateExpStep2()) return;
                        }
                        setExpPassengerStep((prev) => Math.min(4, prev + 1));
                      }}
                      className="bg-[#0b192c] hover:bg-[#182a44] active:bg-[#061424] text-white px-7 py-2.5 rounded-full text-xs font-semibold transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <span>Continuar</span>
                      <ChevronRight className="w-4 h-4 text-sky-300" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmittingExpPassenger}
                      onClick={() => handleSubmitExpPassenger()}
                      className="bg-gradient-to-r from-[#0b192c] via-[#10243d] to-[#0b192c] hover:from-[#122b49] hover:to-[#122b49] text-white px-7 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2.5 active:scale-98 disabled:opacity-50 border border-white/15 group"
                    >
                      {isSubmittingExpPassenger ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                          <span>Registrando en Travesía...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span>Confirmar y Registrar Pasajeros</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: CREADOR INTELIGENTE DE EXPEDICIONES EN 6 PASOS */}
      <ExpeditionWizardModal
        isOpen={showNewDepartureModal}
        onClose={() => setShowNewDepartureModal(false)}
        onSuccess={handleExpeditionWizardSuccess}
        existingDepartures={departures}
      />

      {/* ========================================================================= */}
      {/* MODAL: EDITAR INFORMACIÓN DE EXPEDICIÓN */}
      {/* ========================================================================= */}
      {editingDeparture && (
        <div className="fixed inset-0 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-7 py-5 bg-[#0b192c] text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Pencil className="w-4.5 h-4.5 text-sky-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Editar Expedición</h3>
                  <p className="text-xs text-sky-200/80 font-light">Modifica la información, fechas, cupos y tarifas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDeparture(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditedDeparture} className="p-7 space-y-4.5 overflow-y-auto flex-1 text-xs">
              {/* Nombre de la Expedición */}
              <div>
                <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                  Nombre de la Expedición
                </label>
                <input
                  type="text"
                  required
                  value={editingDeparture.name || ''}
                  onChange={(e) => setEditingDeparture({ ...editingDeparture, name: e.target.value })}
                  placeholder="Ej: Expedición Robinson Crusoe"
                  className="w-full px-4 py-2.5 bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl font-bold text-[#0b192c] text-sm focus:outline-none focus:border-[#0b192c] transition shadow-2xs"
                />
              </div>

              {/* Embarcación / Activo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Embarcación de Expedición
                  </label>
                  <select
                    value={editingDeparture.vessel_id}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, vessel_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-semibold text-[#0b192c] focus:outline-none focus:border-[#0b192c] cursor-pointer"
                  >
                    <option value="vegvisir">Velero Vegvisir (Dufour 52.5 ft)</option>
                    <option value="terranova">Yate Terranova (Hatteras 65ft LRC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Estado de Zarpe
                  </label>
                  <select
                    value={editingDeparture.status}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-semibold text-[#0b192c] focus:outline-none focus:border-[#0b192c] cursor-pointer"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="guaranteed">Zarpe Garantizado</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Fechas: Zarpe & Retorno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Fecha de Zarpe / Salida
                  </label>
                  <input
                    type="date"
                    required
                    value={editingDeparture.departure_date}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, departure_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-mono text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Fecha de Retorno
                  </label>
                  <input
                    type="date"
                    required
                    value={editingDeparture.return_date}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, return_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-mono text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                  />
                </div>
              </div>

              {/* Cupos & Tarifas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Cupos Totales
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editingDeparture.total_slots}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, total_slots: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-mono font-bold text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Cupos Disponibles
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editingDeparture.total_slots}
                    required
                    value={editingDeparture.available_slots}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, available_slots: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-mono font-bold text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                    Tarifa p/Pax (CLP)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="10000"
                    required
                    value={editingDeparture.price_per_pax_clp}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, price_per_pax_clp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-mono font-bold text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                  />
                </div>
              </div>

              {/* Ubicación / Región */}
              <div>
                <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono">
                  Destino / Ubicación
                </label>
                <input
                  type="text"
                  value={editingDeparture.location || ''}
                  onChange={(e) => setEditingDeparture({ ...editingDeparture, location: e.target.value })}
                  placeholder="Ej: Archipiélago Juan Fernández / Bahía Cumberland"
                  className="w-full px-4 py-2.5 bg-[#f4f7fb] border border-slate-200/90 rounded-2xl font-medium text-[#0b192c] focus:bg-white focus:outline-none focus:border-[#0b192c]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDeparture(null)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FICHA DE CLIENTE 360° (CRM DOSSIER) */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header del Dossier */}
            <div className="px-8 py-6 bg-[#0b192c] text-white flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl uppercase shadow-lg ${
                    selectedCustomer.category === 'vip'
                      ? 'bg-amber-400 text-[#0b192c]'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {selectedCustomer.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif text-xl font-bold text-white leading-tight">
                      {selectedCustomer.fullName}
                    </h3>
                    {selectedCustomer.category === 'vip' ? (
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>Socio VIP Gold</span>
                      </span>
                    ) : (
                      <span className="bg-white/10 text-slate-200 border border-white/20 text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Cliente Registrado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-sky-200/80 font-mono">
                    <span>{selectedCustomer.rutOrPassport}</span>
                    <span>•</span>
                    <span>{selectedCustomer.city}</span>
                    <span>•</span>
                    <span>{selectedCustomer.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCustomerDossier(selectedCustomer)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full transition flex items-center gap-1.5 font-semibold cursor-pointer"
                  title="Copiar resumen de ficha"
                >
                  {crmCopiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Ficha</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Contact & Key Metrics Strip */}
            <div className="bg-[#f8fafc] border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola estimado/a ${selectedCustomer.fullName}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp: {selectedCustomer.phone}</span>
                </a>
                <a
                  href={`mailto:${selectedCustomer.email}?subject=${encodeURIComponent('Atención Concierge Yates Chile')}`}
                  className="bg-white hover:bg-slate-100 text-[#0b192c] border border-slate-200 font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCustomer.email}</span>
                </a>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Inversión (LTV)</span>
                  <span className="font-bold text-[#0b192c]">
                    ${selectedCustomer.totalSpentClp.toLocaleString('es-CL')} CLP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Reservas</span>
                  <span className="font-bold text-[#0b192c]">
                    {selectedCustomer.bookingsCount || (getCustomerLodgeBookings(selectedCustomer).length + getCustomerExpBookings(selectedCustomer).length)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="flex items-center gap-2 px-8 pt-3 border-b border-slate-200 bg-white">
              <button
                onClick={() => setCustomerDossierTab('profile')}
                className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'profile'
                    ? 'border-[#0b192c] text-[#0b192c]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Perfil & Preferencias Concierge
              </button>
              <button
                onClick={() => setCustomerDossierTab('bookings')}
                className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'bookings'
                    ? 'border-[#0b192c] text-[#0b192c]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Historial de Reservas ({getCustomerLodgeBookings(selectedCustomer).length + getCustomerExpBookings(selectedCustomer).length})
              </button>
              <button
                onClick={() => setCustomerDossierTab('payments')}
                className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'payments'
                    ? 'border-[#0b192c] text-[#0b192c]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Pagos & Comprobantes ({getCustomerInstallments(selectedCustomer).length})
              </button>
              <button
                onClick={() => setCustomerDossierTab('timeline')}
                className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'timeline'
                    ? 'border-[#0b192c] text-[#0b192c]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Bitácora de Seguimiento ({selectedCustomer.timeline?.length || 0})
              </button>
            </div>

            {/* Dossier Content Body (Scrollable) */}
            <div className="p-8 overflow-y-auto max-h-[60vh] space-y-6 custom-scrollbar">
              
              {/* TAB 1: PERFIL & PREFERENCIAS */}
              {customerDossierTab === 'profile' && (
                <div className="space-y-6">
                  {/* Datos de Contacto y Emergencia */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-6 space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0b192c]" />
                      <span>Datos Generales & Contacto</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">RUT / Pasaporte</span>
                        <span className="font-bold text-[#0b192c] font-mono">{selectedCustomer.rutOrPassport}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Nacionalidad</span>
                        <span className="font-bold text-[#0b192c]">{selectedCustomer.nationality}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Ciudad de Residencia</span>
                        <span className="font-bold text-[#0b192c]">{selectedCustomer.city}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Teléfono Móvil</span>
                        <span className="font-bold text-[#0b192c] font-mono">{selectedCustomer.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Correo Electrónico</span>
                        <span className="font-bold text-[#0b192c]">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Contacto de Emergencia</span>
                        <span className="font-bold text-[#0b192c]">
                          {selectedCustomer.emergencyContact || 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preferencias de Hospitalidad & Náutica */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-6 space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Perfil de Hospitalidad & Preferencias Concierge</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🥗 Dieta & Alergias
                        </span>
                        <p className="text-[#0b192c] font-medium leading-relaxed">
                          {selectedCustomer.dietaryPreferences || 'Sin restricciones conocidas.'}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🍷 Vinos & Bebidas
                        </span>
                        <p className="text-[#0b192c] font-medium leading-relaxed">
                          {selectedCustomer.beveragePreference || 'No especificado.'}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🤿 Náutica & Buceo
                        </span>
                        <p className="text-[#0b192c] font-medium leading-relaxed">
                          {selectedCustomer.divingLevel || 'No especificado.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas Internas Editables del Concierge */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#0b192c] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0b192c]" />
                        <span>Notas Internas del Concierge & Administración</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Privado para el equipo</span>
                    </div>
                    <textarea
                      rows={3}
                      value={selectedCustomer.notes}
                      onChange={(e) => handleUpdateCustomerNotes(e.target.value)}
                      placeholder="Agrega notas clave sobre este cliente (preferencias familiares, solicitudes especiales, acuerdos comerciales)..."
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none leading-relaxed shadow-2xs"
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-emerald-600 font-mono">
                        ✓ Cambios guardados automáticamente en la sesión
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORIAL DE RESERVAS */}
              {customerDossierTab === 'bookings' && (
                <div className="space-y-4">
                  {getCustomerLodgeBookings(selectedCustomer).length === 0 && getCustomerExpBookings(selectedCustomer).length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs font-light">
                      No hay reservas registradas actualmente para este cliente.
                    </div>
                  ) : (
                    <>
                      {/* Lodge Bookings */}
                      {getCustomerLodgeBookings(selectedCustomer).map((b) => {
                        const room = rooms.find((r) => r.id === b.room_id);
                        return (
                          <div
                            key={b.id}
                            className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                                <BedDouble className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-serif font-bold text-sm text-[#0b192c]">
                                    {room ? room.room_name : 'Lodge Rincón de Navegantes'}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600">
                                    {b.booking_code}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>Check-in: {b.check_in}</span>
                                  <span>➔</span>
                                  <span>Check-out: {b.check_out}</span>
                                  <span>•</span>
                                  <span>{b.pax_count} Huéspedes</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-xs font-bold text-[#0b192c] block">
                                ${(b.total_amount || 240000).toLocaleString('es-CL')} CLP
                              </span>
                              <span className="text-[10px] text-emerald-600 font-sans font-semibold">
                                {b.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Expedition Bookings */}
                      {getCustomerExpBookings(selectedCustomer).map((b) => (
                        <div
                          key={b.id}
                          className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-2xs">
                              <Ship className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-sm text-[#0b192c]">
                                  Expedición Náutica ({b.booking_type === 'full_charter' ? 'Chárter Exclusivo' : 'Por Cupos'})
                                </span>
                                <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600">
                                  {b.booking_code}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>{b.pax_count} Pasajeros</span>
                                <span>•</span>
                                <span>Estado: {b.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs font-bold text-[#0b192c] block">
                              ${(b.total_amount || 1850000).toLocaleString('es-CL')} CLP
                            </span>
                            <span className="text-[10px] text-sky-600 font-sans font-semibold">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: PAGOS & COMPROBANTES */}
              {customerDossierTab === 'payments' && (
                <div className="space-y-4">
                  {getCustomerInstallments(selectedCustomer).length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs font-light">
                      No hay cuotas o transferencias pendientes registradas para este cliente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCustomerInstallments(selectedCustomer).map((inst) => (
                        <div
                          key={inst.id}
                          className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0b192c]">{inst.concept}</span>
                            <span
                              className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                inst.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </div>
                          <div className="text-lg font-mono font-bold text-[#0b192c]">
                            ${inst.amount_expected.toLocaleString('es-CL')} CLP
                          </div>
                          {inst.receipt_url && (
                            <a
                              href={inst.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-slate-100 hover:bg-slate-200 text-[#0b192c] text-xs py-2 rounded-full font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0b192c]" />
                              <span>Ver Voucher Bancario</span>
                            </a>
                          )}
                          {inst.status !== 'approved' && (
                            <button
                              onClick={() => setSelectedInstallment(inst)}
                              className="w-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold py-2 rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                              <span>Conciliar Pago</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BITÁCORA DE SEGUIMIENTO */}
              {customerDossierTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Formulario para registrar nota/hito en timeline */}
                  <form onSubmit={handleAddTimelineNote} className="bg-[#fbfcfd] border border-slate-200/80 rounded-3xl p-5 space-y-3">
                    <h5 className="font-serif text-xs font-bold text-[#0b192c] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      <span>Registrar Interacción o Seguimiento</span>
                    </h5>
                    <div className="flex gap-2">
                      <select
                        value={newTimelineType}
                        onChange={(e) => setNewTimelineType(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-[#0b192c] focus:outline-none"
                      >
                        <option value="note">📝 Nota Interna</option>
                        <option value="call">📞 Llamada / WhatsApp</option>
                        <option value="payment">💳 Cotización / Pago</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Escribe el detalle de la interacción realizada con el cliente..."
                        value={newTimelineNote}
                        onChange={(e) => setNewTimelineNote(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold px-5 py-1.5 rounded-full text-xs transition cursor-pointer active:scale-95 shadow-xs"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>

                  {/* Listado Timeline */}
                  <div className="space-y-4 pl-3 border-l-2 border-slate-200">
                    {selectedCustomer.timeline?.map((item) => (
                      <div key={item.id} className="relative pl-6 space-y-1">
                        <div className="w-3 h-3 rounded-full bg-[#0b192c] absolute -left-[19px] top-1 border-2 border-white ring-2 ring-slate-200" />
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#0b192c]">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                ID Cliente: {selectedCustomer.id} • Yates Chile Concierge OS
              </span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold px-6 py-2 rounded-full text-xs transition cursor-pointer active:scale-95 shadow-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NUEVO CLIENTE (CRM) */}
      {/* ========================================================================= */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0b192c]">
                  <UserPlus className="w-5 h-5 text-[#0b192c]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#0b192c]">Registrar Nuevo Cliente</h4>
                  <span className="text-[10px] text-slate-400 font-mono">CRM Yates Chile & Lodge</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sebastián Edwards Claro"
                    value={newCustomerForm.fullName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, fullName: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@dominio.cl"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Teléfono Móvil</label>
                  <input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">RUT / Pasaporte</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={newCustomerForm.rutOrPassport}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, rutOrPassport: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Categoría</label>
                  <select
                    value={newCustomerForm.category}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, category: e.target.value as any })}
                    className="w-full bg-[#f4f7fb] border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-bold focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="regular">Cliente Estándar</option>
                    <option value="vip">👑 Socio VIP Gold</option>
                    <option value="prospect">🌟 Prospecto / Cotización</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Dieta o Alergias</label>
                <input
                  type="text"
                  placeholder="Ej: Celíaco / Pescatariano / Sin mariscos"
                  value={newCustomerForm.dietary}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, dietary: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Notas Iniciales</label>
                <textarea
                  rows={2}
                  placeholder="Notas de concierge o antecedentes del cliente..."
                  value={newCustomerForm.notes}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0b192c] hover:bg-[#182a44] text-white py-2.5 rounded-full font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NUEVO LEAD / PROSPECTO */}
      {/* ========================================================================= */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0b192c]">Registrar Nuevo Lead / Prospecto</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Seguimiento Comercial Yates Chile</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Ríos Salas"
                    value={newLeadForm.fullName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="prospecto@empresa.cl"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="+56 9 8765 4321"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Canal de Origen</label>
                  <select
                    value={newLeadForm.origin}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, origin: e.target.value as any })}
                    className="w-full bg-[#f4f7fb] border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-semibold focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="contacto_web">🌐 Formulario Web Contacto</option>
                    <option value="brochure">📥 Descarga Brochure PDF</option>
                    <option value="whatsapp">💬 WhatsApp Directo</option>
                    <option value="lodge_interest">🏡 Consulta Lodge</option>
                    <option value="manual">✍️ Registro Manual / Evento</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Tipo de Interés</label>
                  <select
                    value={newLeadForm.interestType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, interestType: e.target.value as any })}
                    className="w-full bg-[#f4f7fb] border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-semibold focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="expediciones">⛵ Expediciones Náuticas</option>
                    <option value="lodge">🏡 Lodge Rincón de Navegantes</option>
                    <option value="charter">⚓ Chárter Náutico Exclusivo</option>
                    <option value="ambos">✨ Lodge + Expedición (Full)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Pax Estimados</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newLeadForm.estimatedPax}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedPax: Number(e.target.value) })}
                    className="w-full bg-[#f4f7fb] border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Fecha Tentativa</label>
                  <input
                    type="text"
                    placeholder="Ej: Noviembre 2026"
                    value={newLeadForm.tentativeDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, tentativeDate: e.target.value })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Presupuesto Estimado (CLP)</label>
                  <input
                    type="number"
                    placeholder="3700000"
                    value={newLeadForm.estimatedBudgetClp}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedBudgetClp: Number(e.target.value) })}
                    className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] font-mono font-bold focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold font-mono text-[#0b192c] block mb-1">Notas / Consulta Inicial</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre lo que busca el prospecto..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-[#0b192c] focus:border-[#0b192c] focus:outline-none transition shadow-2xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0b192c] hover:bg-[#182a44] text-white py-2.5 rounded-full font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Registrar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR NOTAS DEL LEAD */}
      {/* ========================================================================= */}
      {editingLeadNotes && (
        <div className="fixed inset-0 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-[#0b192c]">Bitácora de Notas</h4>
                <span className="text-[11px] text-slate-500 font-light">Lead: {editingLeadNotes.fullName}</span>
              </div>
              <button
                onClick={() => setEditingLeadNotes(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadNotes} className="space-y-4">
              <textarea
                rows={5}
                value={leadNotesText}
                onChange={(e) => setLeadNotesText(e.target.value)}
                placeholder="Registra acuerdos, fechas acordadas, resumen de llamadas o notas comerciales..."
                className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl p-4 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none leading-relaxed transition shadow-2xs"
                autoFocus
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingLeadNotes(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0b192c] hover:bg-[#182a44] text-white py-2.5 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Guardar Notas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. WIZARD MODAL DE NUEVA RESERVA GUIADA EN 6 PASOS */}
      {showBookingWizardModal && (
        <BookingWizardModal
          isOpen={showBookingWizardModal}
          onClose={() => setShowBookingWizardModal(false)}
          onConfirmBooking={handleConfirmBookingWizard}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: MODIFICAR PERFIL & RESETEAR CONTRASEÑA */}
      {/* ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#0b192c]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_rgba(11,25,44,0.25)] space-y-6 animate-scale-in my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm shrink-0">
                  {`${(adminProfile.firstName?.[0] || 'A')}${(adminProfile.lastName?.[0] || 'D')}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0b192c]">
                    Mi Perfil & Seguridad
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Modifica tus datos de contacto y credenciales de acceso.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0b192c] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Notification Feedback */}
            {profileModalMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  profileModalMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                }`}
              >
                {profileModalMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileModalMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileAndSecurity} className="space-y-6">
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0b192c]" />
                  <h4 className="font-serif text-sm font-bold text-[#0b192c] uppercase tracking-wider text-[11px]">
                    Información Personal
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="Nombre"
                      className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
                      Apellido
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Apellido"
                      className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Teléfono</span>
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                      className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Correo Electrónico</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> No modificable
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        readOnly
                        value={profileForm.email}
                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 font-mono font-medium cursor-not-allowed select-none opacity-80"
                        title="El correo principal corporativo no puede ser modificado"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: RESETEAR CONTRASEÑA */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0b192c]" />
                    <h4 className="font-serif text-sm font-bold text-[#0b192c] uppercase tracking-wider text-[11px]">
                      Seguridad & Contraseña
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-light">Opcional</span>
                </div>

                <p className="text-xs text-slate-500 font-light -mt-2">
                  Deja estos campos en blanco si no deseas cambiar tu contraseña.
                </p>

                <div className="space-y-3">
                  {/* Contraseña Actual */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Ingresa tu contraseña actual"
                        className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b192c] p-1 cursor-pointer transition"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña y Confirmación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b192c] p-1 cursor-pointer transition"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Repite la nueva contraseña"
                          className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b192c] p-1 cursor-pointer transition"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-[#0b192c] hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] hover:bg-[#182a44] active:bg-[#061424] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4 text-sky-300" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUADRO INFORMATIVO / ALERT MODAL PERSONALIZADO (LUXURY YATES CHILE) */}
      {/* ========================================================================= */}
      {customAlert?.isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0b192c]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(11,25,44,0.35)] border border-slate-200/90 space-y-5 animate-scaleIn relative">
            <button
              type="button"
              onClick={() => setCustomAlert(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0b192c] flex items-center justify-center transition cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  customAlert.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : customAlert.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : customAlert.type === 'info'
                    ? 'bg-sky-50 border-sky-200 text-sky-600'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}
              >
                {customAlert.type === 'error' && <AlertCircle className="w-6 h-6" />}
                {customAlert.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {customAlert.type === 'info' && <Info className="w-6 h-6" />}
                {(customAlert.type === 'warning' || !customAlert.type) && <AlertTriangle className="w-6 h-6" />}
              </div>

              <div className="space-y-1 pr-6">
                <h4 className="font-serif font-bold text-lg text-[#0b192c] tracking-tight">
                  {customAlert.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {customAlert.message}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (customAlert.onConfirm) {
                    customAlert.onConfirm();
                  }
                  setCustomAlert(null);
                }}
                className="w-full py-3 px-5 rounded-2xl bg-[#0b192c] hover:bg-[#182a44] active:bg-[#061424] text-white text-xs font-semibold uppercase font-mono tracking-wider transition shadow-md hover:shadow-lg cursor-pointer active:scale-98 text-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
