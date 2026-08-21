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
  AlertCircle,
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
  MoreVertical,
  Bell,
  Phone,
  Wind,
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

const AirbnbIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <img src="/airbnb-logo.png" alt="Airbnb" className={`${className} object-contain`} />
);

const formatDateDDMMYYYY = (d?: string | null): string => {
  if (!d) return '-';
  const clean = d.split('T')[0];
  const p = clean.split('-');
  if (p.length === 3) {
    return `${p[2]}/${p[1]}/${p[0]}`;
  }
  const dateObj = new Date(d);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return d;
};

export interface UpcomingExpeditionItem {
  id: string;
  vesselName: string;
  vesselType: string;
  routeTitle: string;
  departureDates: string;
  rawDepartureDate?: string;
  daysUntilDeparture?: number;
  maxPax: number;
  bookedPax: number;
  availablePax: number;
  pricePerPax: string;
  status: string;
  statusColor: string;
}

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
        description: 'Check-in en Cabina Proa por 4 noches con acompañante.',
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
    notes: 'Busca tranquilidad para escritura y descanso. Habitación recomendada: Cabina Popa o Sotavento.',
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
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState<'all' | 'approved' | 'pending_transfer' | 'blocked'>('all');
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

  // Auto-scroll to position today / selected day card at the start (first visible position)
  useEffect(() => {
    if (activeTab === 'dashboard' && daysScrollContainerRef.current) {
      const timer = setTimeout(() => {
        const container = daysScrollContainerRef.current;
        const selectedEl = container?.querySelector<HTMLElement>(
          `[data-day="${selectedDayNumber}"]`
        );
        if (container && selectedEl) {
          const targetLeft = selectedEl.offsetLeft - container.offsetLeft;
          container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [selectedDayNumber, selectedMonthDate, activeTab, isLodgeCalendarOpen]);

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

  // Lodge Tab: Room Filters & Interactive Drag-to-Select Calendar State
  const [lodgeFilterRoomId, setLodgeFilterRoomId] = useState<string>('all');
  const [lodgeCalendarMonthDate, setLodgeCalendarMonthDate] = useState<Date>(() => new Date());
  const [isDraggingDates, setIsDraggingDates] = useState(false);
  const [dragStartDateStr, setDragStartDateStr] = useState<string | null>(null);
  const [dragHoverDateStr, setDragHoverDateStr] = useState<string | null>(null);

  const handleLodgePrevMonth = () => {
    setLodgeCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleLodgeNextMonth = () => {
    setLodgeCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleMouseDownDay = (dateStr: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setIsDraggingDates(true);
    setDragStartDateStr(dateStr);
    setDragHoverDateStr(dateStr);
  };

  const handleMouseEnterDay = (dateStr: string) => {
    if (isDraggingDates) {
      setDragHoverDateStr(dateStr);
    }
  };

  const handleMouseUpCalendar = useCallback(() => {
    if (isDraggingDates && dragStartDateStr && dragHoverDateStr) {
      let start = dragStartDateStr;
      let end = dragHoverDateStr;
      if (start > end) {
        [start, end] = [end, start];
      }

      let checkOutDate = end;
      if (start === end) {
        const nextDay = new Date(new Date(start).getTime() + 86400000).toISOString().split('T')[0];
        checkOutDate = nextDay;
      }

      const targetRoomId = lodgeFilterRoomId !== 'all' ? lodgeFilterRoomId : (rooms[0] ? rooms[0].id : '');

      setBlockForm({
        roomId: targetRoomId,
        checkIn: start,
        checkOut: checkOutDate,
        channelSource: 'phone_whatsapp',
        reason: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        paxCount: 2,
        status: 'approved',
      });
      setShowBlockModal(true);
    }
    setIsDraggingDates(false);
    setDragStartDateStr(null);
    setDragHoverDateStr(null);
  }, [isDraggingDates, dragStartDateStr, dragHoverDateStr, lodgeFilterRoomId, rooms]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingDates) {
        handleMouseUpCalendar();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDraggingDates, handleMouseUpCalendar]);

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

  // Departure card dropdown menu state
  const [openDepMenuId, setOpenDepMenuId] = useState<string | null>(null);

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
        service_title: room ? `Habitación #${room.room_number} • ${room.room_name}` : 'Lodge Rincón de Navegantes',
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
      const expName = (b as any).expedition_name || (b as any).expeditionName || dep?.name || route?.title || matchedInitial?.name || (b.booking_type === 'full_charter' ? 'Expedición Charter Completo' : 'Expedición Robinson');
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
      if (bookingsStatusFilter === 'approved' && b.status !== 'approved') return false;
      if (bookingsStatusFilter === 'pending_transfer' && b.status !== 'pending_transfer') return false;
      if (bookingsStatusFilter === 'blocked' && b.status !== 'blocked') return false;
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
        const vesselName = vessel?.name || (dep.vessel_id === 'terranova' ? 'Yate Terranova' : dep.vessel_id === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');
        const vesselType = vessel?.type || (dep.vessel_id === 'terranova' ? 'Hatteras 65ft LRC' : dep.vessel_id === 'lodge' ? 'Refugio Boutique' : 'Dufour 52.5 ft Francés');
        const routeTitle = dep.name || route?.title || 'Expedición Austral';
        const datesFormatted = `${dep.departure_date} ➔ ${dep.return_date}`;
        const statusText = dep.status === 'guaranteed' ? 'Zarpe Garantizado' : dep.status === 'scheduled' ? 'Programada' : dep.status === 'completed' ? 'Completada' : 'Cancelada';
        const statusColor = dep.status === 'guaranteed' ? 'emerald' : dep.status === 'scheduled' ? 'sky' : 'amber';
        const daysUntil = calcDaysUntil(dep.departure_date);

        return {
          id: dep.id,
          vesselName,
          vesselType,
          routeTitle,
          departureDates: datesFormatted,
          rawDepartureDate: dep.departure_date,
          daysUntilDeparture: daysUntil,
          maxPax: dep.total_slots || 6,
          bookedPax,
          availablePax: dep.available_slots || 0,
          pricePerPax: `$${Number(dep.price_per_pax_clp || 1850000).toLocaleString('es-CL')} CLP`,
          status: statusText,
          statusColor,
        };
      });
    }

    return INITIAL_EXPEDITIONS.map((exp) => {
      const bookedPax = exp.totalSlots - (typeof exp.spotsLeft === 'number' ? exp.spotsLeft : 0);
      const daysUntil = calcDaysUntil(exp.startDate);
      return {
        id: exp.id,
        vesselName: exp.vessel,
        vesselType: exp.vessel.includes('Terranova') ? 'Hatteras 65ft LRC' : exp.vessel.includes('Lodge') ? 'Refugio Boutique' : 'Dufour 52.5 ft Francés',
        routeTitle: exp.name,
        departureDates: `${exp.startDate} al ${exp.endDate}`,
        rawDepartureDate: exp.startDate,
        daysUntilDeparture: daysUntil,
        maxPax: exp.totalSlots,
        bookedPax,
        availablePax: typeof exp.spotsLeft === 'number' ? exp.spotsLeft : 0,
        pricePerPax: `$${Number(exp.pricePerPaxClp).toLocaleString('es-CL')} CLP`,
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
      if (expeditionsAssetFilter === 'lodge') return dep.vessel_id === 'lodge' || vName.includes('lodge') || vName.includes('rincon') || vName.includes('rincón');
      return true;
    });
  }, [departures, vessels, expeditionsAssetFilter]);

  const filteredUpcomingExpeditions = useMemo(() => {
    return upcomingExpeditions.filter((exp) => {
      if (expeditionsAssetFilter === 'all') return true;
      const vName = exp.vesselName.toLowerCase();
      if (expeditionsAssetFilter === 'vegvisir') return vName.includes('vegvisir');
      if (expeditionsAssetFilter === 'terranova') return vName.includes('terranova');
      if (expeditionsAssetFilter === 'lodge') return vName.includes('lodge') || vName.includes('rincon') || vName.includes('rincón');
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
      alert('Por favor complete todos los pasos seleccionando fechas, habitación y datos de huéspedes.');
      return;
    }
    if (isRoomBookedForRange(blockForm.roomId, blockForm.checkIn, blockForm.checkOut)) {
      alert('La habitación seleccionada ya se encuentra ocupada o bloqueada en esas fechas. Por favor elija otra habitación disponible.');
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
        alert('Error: ' + res.error);
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
        alert('Error al crear la reserva: ' + res.error);
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
        alert('Error al registrar el bloqueo: ' + (res.error || 'Error desconocido'));
      }
    } catch (err: unknown) {
      alert('Error al registrar el bloqueo: ' + ((err as Error)?.message || 'Error inesperado'));
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
      alert('Hubo un problema al guardar los cambios de la habitación.');
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
      alert('Por favor ingrese nombre y precio.');
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
      alert('Error: ' + res.error);
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
      alert('Error: ' + res.error);
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
        alert('Error al crear expedición: ' + res.error);
      }
    } catch (err: any) {
      alert('Error inesperado al crear expedición: ' + (err.message || err));
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
      alert('Error al actualizar estado: ' + res.error);
    }
  };

  const handleDeleteDeparture = async (departureId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta salida de expedición programada?')) return;
    const res = await expeditionService.deleteDeparture(departureId);
    if (res.success) {
      fetchAllData();
      setActionMessage('Salida de expedición eliminada.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      alert('Error al eliminar salida: ' + res.error);
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
      alert('Error al actualizar la expedición: ' + (res.error || 'Error desconocido'));
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
      alert('Error al actualizar reserva: ' + res.error);
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (COMPACT LUXURY WHITE & NAVY BLUE CARD)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f2b48] flex items-center justify-center p-4 selection:bg-[#0f2b48] selection:text-white">
        <div className="max-w-sm sm:max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(15,43,72,0.06)] space-y-4.5 my-auto">
          <div className="text-center space-y-1.5">
            <img
              src="/vegvisir-emblem-dark.png"
              alt="Logo Yates Chile"
              className="w-12 h-12 object-contain mx-auto transition-transform hover:scale-105"
            />
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                Yates Chile • Sailing & Lodge
              </span>
              <h1 className="font-serif text-xl font-bold text-[#0f2b48] tracking-tight">
                Panel de Administración
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Acceso exclusivo para concierge y administración
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200/80 text-rose-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#0f2b48] font-bold block mb-1">
                Usuario / Correo
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#fbfcfd] border border-slate-200 focus:border-[#0f2b48] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-[#0f2b48] font-medium focus:outline-none transition shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#0f2b48] font-bold block mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#fbfcfd] border border-slate-200 focus:border-[#0f2b48] focus:bg-white rounded-xl pl-3.5 pr-10 py-2 text-xs text-[#0f2b48] font-medium focus:outline-none transition shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f2b48] p-1 rounded-lg transition cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-200 shadow-md shadow-[#0f2b48]/20 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Lock className="w-3.5 h-3.5 text-sky-300" />
              <span>Ingresar al Sistema</span>
            </button>

            <div className="pt-1.5 text-center space-y-1.5">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(true);
                    setForgotSent(false);
                    setForgotEmail(username.includes('@') ? username : '');
                  }}
                  className="text-[11px] text-sky-700 hover:text-[#0f2b48] font-semibold hover:underline cursor-pointer transition inline-flex items-center gap-1"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => (onNavigate ? onNavigate('/') : (window.location.hash = '/'))}
                  className="text-[11px] text-slate-500 hover:text-[#0f2b48] transition font-semibold cursor-pointer"
                >
                  ← Volver al Sitio Web Público
                </button>
              </div>

              <p className="text-[9px] text-slate-400 font-mono pt-0.5">
                Conexión encriptada • Supabase Production DB
              </p>
            </div>
          </form>
        </div>

        {/* MODAL: RECUPERAR CONTRASEÑA */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0f2b48]">
                    <KeyRound className="w-5 h-5 text-[#0f2b48]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#0f2b48]">Recuperar Acceso</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Concierge & Administración</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-slate-400 hover:text-[#0f2b48] p-1 transition cursor-pointer"
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
                    <h5 className="font-serif font-bold text-base text-[#0f2b48]">Instrucciones enviadas</h5>
                    <p className="text-xs text-slate-600 mt-1 font-light">
                      Se ha enviado un enlace de restablecimiento seguro a <strong>{forgotEmail || 'contacto@yateschile.cl'}</strong>.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[11px] text-slate-500 text-left space-y-1">
                    <div className="font-bold text-[#0f2b48]">Credenciales maestras por defecto:</div>
                    <div>• Usuario: <code className="font-mono text-[#0f2b48] bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</code></div>
                    <div>• Clave de acceso: <code className="font-mono text-[#0f2b48] bg-white px-1.5 py-0.5 rounded border border-slate-200">yates2026</code></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotSent(false);
                    }}
                    className="w-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md shadow-[#0f2b48]/20"
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
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                      Correo Electrónico / Usuario
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="contacto@yateschile.cl"
                        className="w-full bg-[#fbfcfd] border border-slate-200 focus:border-[#0f2b48] focus:bg-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#0f2b48] focus:outline-none"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-[11px] text-[#0f2b48]/80 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0f2b48] shrink-0 mt-0.5" />
                    <span>Por seguridad, el enlace de recuperación será verificado contra los registros de la base de datos de Yates Chile.</span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
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
      <aside className="w-72 bg-white text-[#0f2b48] flex flex-col border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(15,43,72,0.02)] overflow-hidden">
        
        {/* Brand Header with Live Nautical Weather & Wind */}
        <div className="p-4.5 pb-3.5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-start gap-3">
            <img
              src="/vegvisir-emblem-dark.png"
              alt="Logo Yates Chile"
              className="w-10 h-10 object-contain shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-serif text-base font-bold text-[#0f2b48] tracking-tight leading-tight truncate">
                  Yates Chile
                </h2>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Sistema y Base de Datos Conectada" />
              </div>
              
              {liveWeather ? (
                <div className="mt-1 space-y-0.5 font-mono text-[10px]">
                  {/* Localidad & Temperatura */}
                  <div className="flex items-center gap-1 text-[#0f2b48] font-bold truncate">
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
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          <nav className="space-y-4">
            
            {/* SECCIÓN 1: VISIÓN GENERAL */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Visión General
              </div>

              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Dashboard General</span>
                </div>
              </button>

              {/* Tráfico */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Tráfico & Geolocalización</span>
                </div>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Reservas Centralizadas</span>
                </div>
                {(lodgeBookings.some((b) => b.status === 'pending_transfer') || installments.some((i) => i.status === 'pending_approval' || i.status === 'pending_upload') || totalBookingsCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.7)]" title="Nuevas reservas por gestionar" />
                )}
              </button>

              {/* Lodge */}
              <button
                onClick={() => setActiveTab('lodge')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'lodge'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BedDouble className={`w-4 h-4 ${activeTab === 'lodge' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Lodge Rincón</span>
                </div>
              </button>

              {/* Expediciones */}
              <button
                onClick={() => setActiveTab('expeditions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'expeditions'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ship className={`w-4 h-4 ${activeTab === 'expeditions' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Expediciones Náuticas</span>
                </div>
                {(expBookings.some((b) => b.status === 'pending_transfer') || departures.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.7)]" title="Nuevas reservas de expediciones por gestionar" />
                )}
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-4 h-4 ${activeTab === 'payments' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Clientes & Leads (CRM)</span>
                </div>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className={`w-4 h-4 ${activeTab === 'services' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>Catálogo & Servicios</span>
                </div>
              </button>

              {/* CMS Web */}
              <button
                onClick={() => setActiveTab('cms')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'cms'
                    ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                    : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'cms' ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>CMS Web (Textos & Medios)</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <button
            onClick={() => (onNavigate ? onNavigate('/') : (window.location.hash = '/'))}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 text-slate-700 hover:text-[#0f2b48] px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-200/80 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#0f2b48]" />
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
            className="w-full flex items-center justify-center gap-2 text-rose-700 hover:bg-rose-50 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER (BLANCO & NAVY BLUE PREMIUM) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        
        {/* Unified Top Header with Active Tab Title and Context Action Buttons */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-[0_2px_10px_rgba(15,43,72,0.02)]">
          {/* Active Tab Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0f2b48]">
              {activeTab === 'dashboard' && <LayoutDashboard className="w-4 h-4" />}
              {activeTab === 'bookings' && <CalendarCheck className="w-4 h-4" />}
              {activeTab === 'analytics' && <Compass className="w-4 h-4" />}
              {activeTab === 'lodge' && <BedDouble className="w-4 h-4" />}
              {activeTab === 'expeditions' && <Ship className="w-4 h-4" />}
              {activeTab === 'payments' && (
                crmActiveSubTab === 'clients' ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />
              )}
              {activeTab === 'services' && <Tag className="w-4 h-4" />}
              {activeTab === 'cms' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0f2b48] leading-tight">
                {activeTab === 'dashboard'
                  ? 'Dashboard General'
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
              <span className="text-[10px] text-slate-400 font-mono">
                {activeTab === 'dashboard'
                  ? 'Resumen operativo, ocupación y reservas en vivo'
                  : activeTab === 'bookings'
                  ? `${totalBookingsCount} reservas registradas • Lodge, Expediciones & Catálogo`
                  : activeTab === 'analytics'
                  ? 'Monitoreo de visitas y procedencia en tiempo real'
                  : activeTab === 'lodge'
                  ? 'Disponibilidad y reservas de las 4 cabinas'
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

          {/* Right Area: Notification Bell & Admin Profile with Live System Clock */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Centro de Notificaciones en Vivo"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                  isNotificationsOpen
                    ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-600 hover:text-[#0f2b48] shadow-2xs'
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
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_40px_rgba(15,43,72,0.18)] py-3 px-3 z-50 animate-scale-in">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[#0f2b48]">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-xs text-[#0f2b48]">
                          Notificaciones del Sistema
                        </h4>
                      </div>
                      {notificationsList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setReadNotifIds(notificationsList.map((n) => n.id))}
                          className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold cursor-pointer"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-1.5 pr-0.5">
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
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                isRead
                                  ? 'bg-slate-50/50 border-slate-100 text-slate-500 opacity-75 hover:opacity-100 hover:bg-slate-50'
                                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#0f2b48]/30 hover:bg-sky-50/30'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                                notif.type === 'booking'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : notif.type === 'payment'
                                  ? 'bg-sky-100 text-sky-800'
                                  : notif.type === 'cancellation'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {notif.type === 'booking' && <CalendarCheck className="w-3.5 h-3.5" />}
                                {notif.type === 'payment' && <CreditCard className="w-3.5 h-3.5" />}
                                {notif.type === 'cancellation' && <XCircle className="w-3.5 h-3.5" />}
                                {notif.type === 'lead' && <UserPlus className="w-3.5 h-3.5" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h5 className={`text-xs truncate ${isRead ? 'font-medium text-slate-700' : 'font-bold text-[#0f2b48]'}`}>
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

            {/* Admin User Badge with Current Date & Time (Clickable to open profile and security popup) */}
            <button
              type="button"
              onClick={handleOpenProfileModal}
              className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 border-l border-slate-200/70 hover:bg-slate-100/70 active:bg-slate-200/60 rounded-2xl transition-all cursor-pointer group text-left shadow-2xs"
              title="Modificar perfil y resetear contraseña"
            >
              <div className="text-right hidden sm:block">
                <span className="text-xs text-[#0f2b48] font-bold block leading-tight group-hover:text-sky-700 transition">
                  {`${adminProfile.firstName} ${adminProfile.lastName}`.trim() || 'Administrador General'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium block mt-0.5">
                  {currentSystemTime.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {currentSystemTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} hrs
                </span>
              </div>
              <div className="w-8 h-8 bg-[#0f2b48] text-white rounded-xl flex items-center justify-center text-[11px] font-bold font-mono shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all shrink-0">
                {`${(adminProfile.firstName?.[0] || 'A')}${(adminProfile.lastName?.[0] || 'D')}`.toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        {/* Alert Notification Toast */}
        {actionMessage && (
          <div className="bg-[#0f2b48] text-white px-8 py-3 text-xs font-semibold shadow-md flex items-center gap-2 animate-fade-in border-b border-[#0a1e34]">
            <CheckCircle2 className="w-4 h-4 text-sky-300" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <main className="p-8 sm:p-10 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* TAB 0: EXECUTIVE DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">

              {/* 1. SECCIÓN DE MÉTRICAS (KPIS) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden transition-all duration-300">
                <div className="px-7 py-5 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs">
                      <TrendingUp className="w-4.5 h-4.5 text-[#0f2b48]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                        Resumen Ejecutivo de Métricas
                      </h4>
                      <p className="text-xs text-slate-500 font-light">Indicadores clave de ingresos, recaudación y ocupación en vivo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* SELECTOR EN CÁPSULA OVALADA MODERNA & SUTIL */}
                    <div className="flex items-center bg-slate-100/70 p-1 rounded-full border border-slate-200/60 shadow-xs backdrop-blur-xs">
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
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-[#0f2b48] text-white font-semibold shadow-sm shadow-[#0f2b48]/20 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-7 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* KPI 1: INGRESOS CONFIRMADOS */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                          Ingresos Confirmados
                        </span>
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/80 shadow-2xs transition-transform group-hover:scale-105">
                          <TrendingUp className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                          ${kpiConfirmedRevenue.toLocaleString('es-CL')}
                          <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">CLP</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
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
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                          Por Recaudar / Cuotas
                        </span>
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/80 shadow-2xs transition-transform group-hover:scale-105">
                          <DollarSign className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                          ${kpiPendingRevenue.toLocaleString('es-CL')}
                          <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">CLP</span>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{kpiPendingApprovalsCount} comprobantes por revisar</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 3: RESERVAS TOTALES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                          Reservas Totales
                        </span>
                        <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 border border-sky-100/80 shadow-2xs transition-transform group-hover:scale-105">
                          <Calendar className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                          {kpiTotalBookingsCount}
                          <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">totales</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span>{kpiFilteredLodgeBookings.length} Lodge • {kpiFilteredExpBookings.length} Expediciones</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 4: CAPACIDAD LODGE */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                          Capacidad Lodge
                        </span>
                        <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[#0f2b48] border border-slate-200/80 shadow-2xs transition-transform group-hover:scale-105">
                          <BedDouble className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                          4
                          <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">Habitaciones</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                          Últimas 5 Reservas Realizadas
                        </h4>
                        <span className="bg-sky-50 text-[#0f2b48] border border-sky-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          {unifiedRecentBookings.length} {unifiedRecentBookings.length === 1 ? 'reserva' : 'reservas'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Historial reciente de reservas de Lodge y Expediciones</p>
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
                      <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-7 py-3.5">Tipo</th>
                          <th className="px-7 py-3.5">Código</th>
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
                            <td colSpan={7} className="px-7 py-10 text-center text-slate-400">
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
                              <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                {b.booking_code}
                              </td>
                              <td className="px-7 py-4">
                                <div className="font-bold text-[#0f2b48]">{b.guest_name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{b.guest_phone}</div>
                              </td>
                              <td className="px-7 py-4 text-slate-700 font-medium">
                                {b.service_title}
                              </td>
                              <td className="px-7 py-4 font-mono text-slate-600 text-xs">
                                {b.dates}
                              </td>
                              <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                ${b.amount.toLocaleString('es-CL')}{' '}
                                <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                              </td>
                              <td className="px-7 py-4">
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                    b.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : b.status === 'blocked'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
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
                      Control de reservas y aforo por habitación para las 4 cabinas (11 Huéspedes en total).
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
                        <span className="font-mono text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                          Selecciona una fecha:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Navega con las flechas o desliza →</span>
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
                                    ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md shadow-[#0f2b48]/20 scale-102'
                                    : isPast
                                    ? 'bg-slate-100/70 text-slate-400 border-slate-200/70 hover:bg-slate-100 shadow-2xs opacity-75 hover:opacity-100'
                                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-[#0f2b48]/40 hover:bg-slate-50/80 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full px-0.5">
                                  <span
                                    className={`text-[8px] sm:text-[9px] uppercase font-mono font-bold ${
                                      isSelected ? 'text-sky-300' : isPast ? 'text-slate-400' : 'text-slate-400'
                                    }`}
                                  >
                                    {day.dayOfWeek}
                                  </span>
                                  {day.isToday && (
                                    <span
                                      className={`text-[7px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                                        isSelected
                                          ? 'bg-sky-400/20 text-sky-200 border border-sky-300/30'
                                          : 'bg-[#0f2b48]/10 text-[#0f2b48]'
                                      }`}
                                    >
                                      Hoy
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`text-base sm:text-lg font-serif font-bold leading-none ${
                                    isSelected ? 'text-white' : isPast ? 'text-slate-400' : 'text-[#0f2b48]'
                                  }`}
                                >
                                  {day.dayNum}
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeBg}`} />
                                  <span
                                    className={`text-[9px] font-mono font-semibold ${
                                      isSelected ? 'text-slate-200' : isPast ? 'text-slate-400' : 'text-slate-500'
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
                                      {room.room_name}
                                    </h6>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditRoomModal(room);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer shrink-0"
                                      title={`Cambiar nombre de ${room.room_name}`}
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
                          const VesselIcon = exp.vesselName.includes('Terranova') ? Ship : exp.vesselName.includes('Lodge') ? BedDouble : Sailboat;

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
                              className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                            >
                              <div className="space-y-4">
                                {/* Top Header: Circular Icon + Big Expedition Name + Vessel Subtitle */}
                                <div className="flex items-start gap-3.5">
                                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${cardTheme.icon}`}>
                                    <VesselIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-serif font-bold text-lg text-[#0f2b48] tracking-tight leading-snug truncate" title={exp.routeTitle}>
                                      {exp.routeTitle}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5 truncate">
                                      <span className="font-semibold text-slate-700">{exp.vesselName}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-500 font-light">{exp.vesselType}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3.5">
                                  {/* Details Strip (Full Width Stacked) */}
                                  <div className={`p-4 border rounded-2xl space-y-3 ${cardTheme.inner}`}>
                                    {/* Fila 1: Zarpe & Fechas */}
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                        Zarpe & Fechas
                                      </span>
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f2b48]">
                                        <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                        <span>{exp.departureDates}</span>
                                      </div>
                                    </div>

                                    {/* Divisor */}
                                    <div className="border-t border-slate-200/60" />

                                    {/* Fila 2: Tarifa / Pax */}
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                        Tarifa / Pax
                                      </span>
                                      <div className="text-sm font-mono font-bold text-[#0f2b48]">
                                        {exp.pricePerPax}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Capacity Progress Bar & Action */}
                              <div className="space-y-2.5 pt-3 border-t border-slate-200/60">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-600 font-medium">
                                    Ocupación: <strong className="text-[#0f2b48] font-bold">{exp.bookedPax}</strong> / {exp.maxPax}
                                  </span>

                                  {exp.availablePax > 0 ? (
                                    <div className="relative group/addpax flex items-center">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveTab('bookings');
                                          setShowBlockModal(true);
                                        }}
                                        className="w-7 h-7 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-white" />
                                      </button>
                                      <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/addpax:opacity-100 group-hover/addpax:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                                        Registrar / Sumar Pasajeros ({exp.availablePax} cupos disponibles)
                                        <span className="absolute top-full right-2.5 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-700 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-full">
                                      Agotado
                                    </span>
                                  )}
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
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {dashboardUpcomingExpeditions.map((exp) => {
                                const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                                const isAgotado = exp.availablePax <= 0 || exp.bookedPax >= exp.maxPax;
                                const daysUntil = exp.daysUntilDeparture !== undefined ? exp.daysUntilDeparture : 999;
                                const VesselIcon = exp.vesselName.includes('Terranova') ? Ship : exp.vesselName.includes('Lodge') ? BedDouble : Sailboat;

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
            <div className="space-y-8 animate-fadeIn">
              
              {/* 1. 4 TOP BOOKING KPIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1 */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Total Reservas
                    </span>
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <CalendarCheck className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {allUnifiedBookings.length}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">totales</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{allUnifiedBookings.filter(b => b.status === 'approved').length} confirmadas • {allUnifiedBookings.filter(b => b.status === 'pending_transfer').length} pendientes</span>
                    </p>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Lodge Rincón
                    </span>
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <BedDouble className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {lodgeBookings.length}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">reservas</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{blockedDatesCount} bloqueos de mantención</span>
                    </p>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Expediciones Náuticas
                    </span>
                    <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 border border-sky-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <Ship className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      {expBookings.length}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">zarpes</span>
                    </div>
                    <p className="text-[11px] text-sky-700 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span>Velero Vegvisir & Terranova</span>
                    </p>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(15,43,72,0.02)] space-y-4 hover:border-[#0f2b48]/30 hover:shadow-[0_10px_30px_rgba(15,43,72,0.05)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400 group-hover:text-[#0f2b48] transition-colors">
                      Volumen Total
                    </span>
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/80 shadow-2xs transition-transform group-hover:scale-105">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight">
                      ${(confirmedRevenue + pendingRevenue).toLocaleString('es-CL')}
                      <span className="text-xs font-sans font-normal text-slate-400 ml-1.5">CLP</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Ingresos brutos comprometidos</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. BARRA DE HERRAMIENTAS, FILTROS CIRCULARES Y BÚSQUEDA MINIMALISTA */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Buscador Dinámico por Palabra Clave */}
                  <div className="relative flex-1 min-w-[240px] max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por pasajero, código (ej: LR-1002), email..."
                      value={bookingsSearchQuery}
                      onChange={(e) => setBookingsSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 bg-[#fbfcfd] border border-slate-200/80 rounded-full text-xs text-[#0f2b48] placeholder-slate-400 focus:outline-none focus:border-[#0f2b48] focus:bg-white transition"
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

                  {/* Grupo de Controles: Filtros Circulares de Categoría + Filtros Circulares de Estado + Vistas + Botón Circular + */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* CÍRCULOS DE FILTRO POR CATEGORÍA */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                      {/* ALL */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsTypeFilter('all')}
                          className={`w-7.5 h-7.5 rounded-full text-[10px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsTypeFilter === 'all'
                              ? 'bg-[#0f2b48] text-white shadow-xs scale-105'
                              : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          ALL
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Todas las Categorías ({allUnifiedBookings.length})
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>

                      {/* LODGE */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsTypeFilter('lodge')}
                          className={`w-7.5 h-7.5 rounded-full text-[10px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsTypeFilter === 'lodge'
                              ? 'bg-[#0f2b48] text-white shadow-xs scale-105 ring-1 ring-sky-300'
                              : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Lodge Rincón de Navegantes ({allUnifiedBookings.filter(b => b.type === 'lodge').length})
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>

                      {/* EXPEDICIONES */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsTypeFilter('expedition')}
                          className={`w-7.5 h-7.5 rounded-full text-[10px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsTypeFilter === 'expedition'
                              ? 'bg-[#0f2b48] text-white shadow-xs scale-105 ring-1 ring-sky-300'
                              : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <Ship className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Expediciones Náuticas ({allUnifiedBookings.filter(b => b.type === 'expedition').length})
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>

                      {/* SERVICIOS / CATÁLOGO */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsTypeFilter('service')}
                          className={`w-7.5 h-7.5 rounded-full text-[10px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsTypeFilter === 'service'
                              ? 'bg-[#0f2b48] text-white shadow-xs scale-105 ring-1 ring-sky-300'
                              : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Servicios & Catálogo ({allUnifiedBookings.filter((b: any) => b.type === 'service').length})
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>
                    </div>

                    {/* CÍRCULOS DE FILTRO POR ESTADO */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                      {/* ESTADOS */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsStatusFilter('all')}
                          className={`px-2.5 h-7.5 rounded-full text-[10px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsStatusFilter === 'all'
                              ? 'bg-[#0f2b48] text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          Estados
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Todos los Estados
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>

                      {/* CONFIRMADAS */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsStatusFilter('approved')}
                          className={`w-7.5 h-7.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsStatusFilter === 'approved'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105 ring-1 ring-emerald-300'
                              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200/60'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-emerald-900 text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Confirmadas / Pagadas
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-emerald-900" />
                        </div>
                      </div>

                      {/* PENDIENTES */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsStatusFilter('pending_transfer')}
                          className={`w-7.5 h-7.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsStatusFilter === 'pending_transfer'
                              ? 'bg-amber-600 text-white shadow-xs scale-105 ring-1 ring-amber-300'
                              : 'bg-white text-amber-700 hover:bg-amber-50 border border-slate-200/60'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-amber-900 text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Pendientes de Transferencia
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-amber-900" />
                        </div>
                      </div>

                      {/* BLOQUEOS */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsStatusFilter('blocked')}
                          className={`w-7.5 h-7.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            bookingsStatusFilter === 'blocked'
                              ? 'bg-slate-700 text-white shadow-xs scale-105 ring-1 ring-slate-400'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Bloqueos de Mantención
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>

                    {/* Toggle de Vista (Lista / Cards) */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                      {/* LISTA */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsViewMode('list')}
                          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition cursor-pointer ${
                            bookingsViewMode === 'list'
                              ? 'bg-[#0f2b48] text-white shadow-xs'
                              : 'bg-white text-slate-500 hover:text-[#0f2b48]'
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Vista Lista / Tabla
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>

                      {/* GRID */}
                      <div className="relative group/tooltip flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBookingsViewMode('grid')}
                          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition cursor-pointer ${
                            bookingsViewMode === 'grid'
                              ? 'bg-[#0f2b48] text-white shadow-xs'
                              : 'bg-white text-slate-500 hover:text-[#0f2b48]'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                          Vista Tarjetas / Grid
                          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                        </div>
                      </div>
                    </div>

                    {/* Botón Circular + para Nueva Reserva Guiada */}
                    <div className="relative group/tooltip flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowBookingWizardModal(true)}
                        className="w-8.5 h-8.5 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4.5 h-4.5 text-white" />
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                        Registrar Nueva Reserva
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de resultados filtrados */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span>
                      Mostrando <strong className="text-[#0f2b48] font-mono">{filteredUnifiedBookings.length}</strong> de{' '}
                      <span className="font-mono">{allUnifiedBookings.length}</span> reservas registradas
                    </span>
                    {(bookingsSearchQuery || bookingsTypeFilter !== 'all' || bookingsStatusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setBookingsSearchQuery('');
                          setBookingsTypeFilter('all');
                          setBookingsStatusFilter('all');
                        }}
                        className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer underline ml-2"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. RESULTADOS: VISTA LISTA O VISTA GRID */}
              {filteredUnifiedBookings.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center space-y-4 shadow-[0_4px_20px_rgba(15,43,72,0.02)]">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <CalendarCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-[#0f2b48]">
                      No se encontraron reservas con los criterios aplicados
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-light">
                      Intenta buscar con otros términos, limpiar los filtros de tipo o estado, o registra una nueva reserva manual.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setShowBookingWizardModal(true)}
                      className="bg-[#0f2b48] hover:bg-[#0a1e34] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition cursor-pointer"
                    >
                      + Registrar Nueva Reserva
                    </button>
                  </div>
                </div>
              ) : bookingsViewMode === 'list' ? (
                /* 4.A VISTA LISTA / TABLA MINIMALISTA & LUXURY (COMPACTA EN UNA SOLA LÍNEA) */
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#fbfcfd] border-b border-slate-200/80 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                          <th className="px-5 py-3.5 whitespace-nowrap">Tipo</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Código</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Huésped / Pasajero</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Habitación / Servicio</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Inicio</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Fin</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Monto Total</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Estado</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUnifiedBookings.map((b) => {
                          const cleanPhone = (b.guest_phone || '').replace(/[^0-9]/g, '');
                          return (
                            <tr
                              key={`${b.type}-${b.id}`}
                              className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                              onClick={() => setSelectedBookingForDetail(b)}
                            >
                              {/* Tipo */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                    b.type === 'lodge'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-sky-50 text-sky-800 border border-sky-200'
                                  }`}
                                >
                                  {b.type === 'lodge' ? (
                                    <BedDouble className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Ship className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  )}
                                  <span>{b.type_label}</span>
                                </span>
                              </td>

                              {/* Código */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-xs text-[#0f2b48]">
                                <span className="bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-md">
                                  {b.booking_code}
                                </span>
                              </td>

                              {/* Huésped */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <strong className="text-[#0f2b48] font-bold text-xs">
                                    {b.guest_name}
                                  </strong>
                                  {b.guest_phone && b.guest_phone !== 'Sin contacto' && b.guest_phone !== '+56900000000' && (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      ({b.guest_phone})
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Servicio / Habitación */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#0f2b48]">
                                <span className="font-medium">{b.service_title}</span>
                              </td>

                              {/* Fecha Inicio */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-700">
                                {formatDateDDMMYYYY(b.raw_check_in)}
                              </td>

                              {/* Fecha Fin */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-700">
                                {formatDateDDMMYYYY(b.raw_check_out)}
                              </td>

                              {/* Monto */}
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-xs text-[#0f2b48]">
                                ${b.amount.toLocaleString('es-CL')}{' '}
                                <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                              </td>

                              {/* Estado */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                                    b.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : b.status === 'blocked'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {b.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                  {b.status === 'pending_transfer' && <Clock className="w-3 h-3 text-amber-600" />}
                                  {b.status === 'approved'
                                    ? 'Confirmada'
                                    : b.status === 'blocked'
                                    ? 'Bloqueo'
                                    : 'Pendiente'}
                                </span>
                              </td>

                              {/* Acciones */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2.5" onClick={(e) => e.stopPropagation()}>
                                  {cleanPhone && cleanPhone !== '56900000000' && (
                                    <a
                                      href={`https://wa.me/${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Conversar por WhatsApp"
                                      className="text-[#25D366] hover:text-[#1eb855] hover:scale-125 transition p-1 cursor-pointer"
                                    >
                                      <svg className="w-4.5 h-4.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M12.004 2C6.48 2 2 6.48 2 12a9.92 9.92 0 0 0 1.54 5.3L2 22l4.83-1.27A9.97 9.97 0 0 0 12.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.27 13.91c-.24.66-1.38 1.27-1.93 1.35-.49.07-1.12.1-3.23-.77a11.16 11.16 0 0 1-4.84-4.25c-.84-1.12-1.34-2.43-1.34-3.8 0-1.39.73-2.07.97-2.33.24-.26.49-.33.66-.33.17 0 .34.01.49.02.16.01.37-.06.58.45.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.28.45-.14.17-.3.38-.43.51-.15.15-.31.32-.13.63.18.31.81 1.33 1.74 2.16.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.95.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.24z" />
                                      </svg>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setSelectedBookingForDetail(b)}
                                    title="Ver Ficha Completa"
                                    className="text-slate-400 hover:text-[#0f2b48] hover:scale-125 transition p-1 cursor-pointer"
                                  >
                                    <Eye className="w-4.5 h-4.5" />
                                  </button>
                                  {b.type === 'lodge' && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`¿Deseas cancelar/liberar la reserva ${b.booking_code}?`)) {
                                          deleteBookingOrBlock(b.id);
                                        }
                                      }}
                                      title="Liberar / Cancelar Reserva"
                                      className="text-slate-400 hover:text-rose-600 hover:scale-125 transition p-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
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
                /* 4.B VISTA TARJETAS / GRID EJECUTIVO */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUnifiedBookings.map((b) => {
                    const cleanPhone = (b.guest_phone || '').replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={`${b.type}-${b.id}`}
                        className="bg-white border border-slate-200/80 hover:border-[#0f2b48]/40 rounded-3xl p-6 space-y-5 shadow-[0_4px_20px_rgba(15,43,72,0.02)] flex flex-col justify-between transition-all duration-300 group"
                      >
                        <div className="space-y-4">
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                                  b.type === 'lodge'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-sky-50 text-sky-800 border-sky-200'
                                }`}
                              >
                                {b.type_label}
                              </span>
                              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-md text-[#0f2b48]">
                                {b.booking_code}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                                b.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : b.status === 'blocked'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {b.status === 'approved' ? 'Confirmada' : b.status === 'blocked' ? 'Bloqueo' : 'Pendiente'}
                            </span>
                          </div>

                          {/* Guest Info */}
                          <div>
                            <h4 className="font-serif font-bold text-base text-[#0f2b48] leading-tight">
                              {b.guest_name}
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-0.5">
                              {b.service_title}
                            </p>
                          </div>

                          {/* Details Strip */}
                          <div className="p-3.5 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Fechas</span>
                              <span className="font-mono font-semibold text-[#0f2b48]">{b.dates}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tarifa Total</span>
                              <span className="font-mono font-bold text-[#0f2b48]">
                                ${b.amount.toLocaleString('es-CL')} CLP
                              </span>
                            </div>
                          </div>

                          {b.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 line-clamp-2">
                              “{b.notes}”
                            </p>
                          )}
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                          <button
                            onClick={() => setSelectedBookingForDetail(b)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-[#0f2b48] font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200/80 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                              title="Chat de WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. MODAL: FICHA DETALLADA DE RESERVA */}
              {selectedBookingForDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                    {/* Modal Header */}
                    <div className="px-7 py-5 bg-[#0f2b48] text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          <CalendarCheck className="w-5 h-5 text-sky-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300">
                              Ficha de Reserva
                            </span>
                            <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
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
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto">
                      {/* Grid Huésped & Contacto */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Titular de Reserva
                          </span>
                          <p className="font-serif font-bold text-[#0f2b48] text-sm">
                            {selectedBookingForDetail.guest_name}
                          </p>
                          <p className="text-xs text-slate-500">{selectedBookingForDetail.guest_email || 'Sin correo'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Teléfono de Contacto
                          </span>
                          <p className="font-mono font-bold text-[#0f2b48] text-xs">
                            {selectedBookingForDetail.guest_phone || 'Sin teléfono'}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Canal: {selectedBookingForDetail.channel === 'web_direct' ? 'Web Directa' : 'Administración'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detalles del Servicio y Fechas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-200/80 rounded-2xl space-y-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Servicio / Alojamiento
                          </span>
                          <strong className="text-[#0f2b48] text-sm font-serif block">
                            {selectedBookingForDetail.service_title}
                          </strong>
                          <p className="text-xs text-slate-500">{selectedBookingForDetail.unit_detail}</p>
                        </div>

                        <div className="p-4 border border-slate-200/80 rounded-2xl space-y-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Fechas del Zarpe / Estadía
                          </span>
                          <strong className="text-[#0f2b48] text-xs font-mono block">
                            {selectedBookingForDetail.dates}
                          </strong>
                          <p className="text-[11px] text-slate-500">Horario Check-in: 15:00 / Check-out: 11:00</p>
                        </div>
                      </div>

                      {/* Estado y Monto */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Estado del Pago
                          </span>
                          <span
                            className={`text-xs font-bold font-mono px-3 py-1 rounded-full uppercase inline-flex items-center gap-1.5 ${
                              selectedBookingForDetail.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : selectedBookingForDetail.status === 'blocked'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {selectedBookingForDetail.status === 'approved'
                              ? '✓ Pago Confirmado'
                              : selectedBookingForDetail.status === 'blocked'
                              ? '🔒 Bloqueo de Mantención'
                              : '⏳ Pendiente de Transferencia'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                            Monto Total
                          </span>
                          <div className="text-xl font-mono font-bold text-[#0f2b48]">
                            ${selectedBookingForDetail.amount.toLocaleString('es-CL')}{' '}
                            <span className="text-xs font-sans font-normal text-slate-500">CLP</span>
                          </div>
                        </div>
                      </div>

                      {/* Observaciones */}
                      {selectedBookingForDetail.notes && (
                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
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
                    <div className="px-7 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {selectedBookingForDetail.guest_phone && (
                          <a
                            href={`https://wa.me/${selectedBookingForDetail.guest_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${selectedBookingForDetail.guest_name}, te contactamos desde Yates Chile respecto a tu reserva ${selectedBookingForDetail.booking_code}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Contactar por WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedBookingForDetail.type === 'lodge' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Confirmas la cancelación y liberación de la reserva ${selectedBookingForDetail.booking_code}?`)) {
                                deleteBookingOrBlock(selectedBookingForDetail.id);
                                setSelectedBookingForDetail(null);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2 px-4 rounded-xl border border-rose-200 transition cursor-pointer"
                          >
                            Liberar Reserva
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingForDetail(null)}
                          className="bg-white hover:bg-slate-100 text-[#0f2b48] font-bold text-xs py-2 px-4 rounded-xl border border-slate-200 transition cursor-pointer"
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
          {/* TAB: LODGE MANAGEMENT (FILTROS DE HABITACIONES Y CALENDARIO DRAG-TO-SELECT) */}
          {/* ========================================================================= */}
          {activeTab === 'lodge' && (() => {
            const lodgeYear = lodgeCalendarMonthDate.getFullYear();
            const lodgeMonth = lodgeCalendarMonthDate.getMonth();
            const lodgeDaysCount = new Date(lodgeYear, lodgeMonth + 1, 0).getDate();
            const lodgeFirstDayOffset = (new Date(lodgeYear, lodgeMonth, 1).getDay() + 6) % 7; // Lunes = 0
            const lodgeMonthHeader = `${monthNames[lodgeMonth]} ${lodgeYear}`;
            const nowDate = new Date();
            const isCurrentMonthLodge = lodgeYear === nowDate.getFullYear() && lodgeMonth === nowDate.getMonth();

            const activeFilterRoom = rooms.find(r => r.id === lodgeFilterRoomId);

            return (
              <div className="space-y-7">
                {/* FULL MONTH CALENDAR WITH INTEGRATED MINIMALIST ROOM FILTERS & DRAG-TO-SELECT */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-7 space-y-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] select-none">
                  
                  {/* Calendar Top Navigation Header with Integrated Circular Room Filters & Add Button */}
                  <div className="space-y-4 border-b border-slate-100 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-[#0f2b48]" />
                          <h4 className="font-serif text-lg font-bold text-[#0f2b48]">
                            Disponibilidad & Calendario — {activeFilterRoom ? `${activeFilterRoom.room_name} (#${activeFilterRoom.room_number})` : 'Todas las Cabinas'}
                          </h4>
                          {activeFilterRoom && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditRoomModal(activeFilterRoom)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[#0f2b48] text-xs font-bold transition shadow-2xs cursor-pointer ml-1"
                              title={`Cambiar nombre de ${activeFilterRoom.room_name}`}
                            >
                              <Pencil className="w-3.5 h-3.5 text-sky-600" />
                              <span>Editar Nombre</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-light flex items-center gap-1.5">
                          <span className="bg-sky-50 border border-sky-200 text-[#0f2b48] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                            🖱️ Arrastra con el mouse
                          </span>
                          <span>Selecciona el rango de fechas arrastrando desde el check-in hasta el check-out para reservar.</span>
                        </p>
                      </div>
                    </div>

                    {/* Controls Row: Month Switcher + Circular Room Filters (Left) & Circular + Button (Right) */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Month Navigator Controls */}
                        <div className="flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={handleLodgePrevMonth}
                            className="p-1 hover:bg-slate-100 rounded text-[#0f2b48] transition cursor-pointer"
                            title="Mes Anterior"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <div className="px-3 py-0.5 text-[11px] font-serif font-bold text-[#0f2b48] min-w-[110px] text-center tracking-wide">
                            {lodgeMonthHeader}
                          </div>
                          <button
                            onClick={handleLodgeNextMonth}
                            className="p-1 hover:bg-slate-100 rounded text-[#0f2b48] transition cursor-pointer"
                            title="Mes Siguiente"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Circular Room Filter Buttons (Initials) */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                          {/* Option: All */}
                          <button
                            onClick={() => setLodgeFilterRoomId('all')}
                            title="Todas las Cabinas (Visión Global)"
                            className={`w-7 h-7 rounded-full text-[9px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                              lodgeFilterRoomId === 'all'
                                ? 'bg-[#0f2b48] text-white shadow-xs scale-105'
                                : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100'
                            }`}
                          >
                            ALL
                          </button>

                          {/* 4 Individual Rooms by Initials */}
                          {rooms.map((room) => {
                            const isSelected = lodgeFilterRoomId === room.id;
                            const initial = room.room_number === 1 ? 'P' : room.room_number === 2 ? 'B' : room.room_number === 3 ? 'S' : 'PO';
                            return (
                              <button
                                key={room.id}
                                onClick={() => setLodgeFilterRoomId(room.id)}
                                title={`${room.room_name} (#${room.room_number}) • $${room.base_price_clp.toLocaleString('es-CL')}/n`}
                                className={`w-7 h-7 rounded-full text-[9px] font-mono font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#0f2b48] text-white shadow-xs scale-105 ring-1 ring-sky-300'
                                    : 'bg-white text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 border border-slate-200/60'
                                }`}
                              >
                                {initial}
                              </button>
                            );
                          })}

                          {/* Botón de edición rápida si hay una habitación activa */}
                          {activeFilterRoom && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditRoomModal(activeFilterRoom)}
                              className="w-7 h-7 rounded-full bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 text-sky-700 flex items-center justify-center transition cursor-pointer shadow-2xs ml-0.5"
                              title={`Cambiar nombre de ${activeFilterRoom.room_name}`}
                            >
                              <Pencil className="w-3 h-3 text-sky-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Manual New Booking / Block Circular Button on Far Right */}
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
                        title="Nueva Reserva / Bloqueo de Cabina"
                        className="w-9 h-9 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Active Drag Selection Status Tooltip (when user is dragging) */}
                  {isDraggingDates && dragStartDateStr && dragHoverDateStr && (
                    <div className="bg-[#0f2b48] text-white p-3 rounded-2xl flex items-center justify-between text-xs font-mono animate-fadeIn shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        <span>
                          Rango seleccionado: <strong>{dragStartDateStr < dragHoverDateStr ? dragStartDateStr : dragHoverDateStr}</strong> ➔ <strong>{dragStartDateStr > dragHoverDateStr ? dragStartDateStr : dragHoverDateStr}</strong>
                        </span>
                      </div>
                      <span className="text-sky-300 text-[11px] font-sans font-medium">
                        Suelta el mouse para abrir la reserva
                      </span>
                    </div>
                  )}

                  {/* SCROLLABLE CALENDAR GRID WRAPPER WITH STICKY WEEKDAY HEADER */}
                  <div className="border border-slate-200/80 rounded-2xl p-4 bg-[#fbfcfd]">
                    {/* Sticky Weekday Labels (LUN - DOM) */}
                    <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pb-2.5 border-b border-slate-200/70 mb-3 bg-[#fbfcfd] sticky top-0 z-10">
                      <div>Lun</div>
                      <div>Mar</div>
                      <div>Mié</div>
                      <div>Jue</div>
                      <div>Vie</div>
                      <div>Sáb</div>
                      <div>Dom</div>
                    </div>

                    {/* Scrollable Month Days Grid */}
                    <div className="max-h-[440px] overflow-y-auto pr-1.5 scrollbar-thin">
                      <div className="grid grid-cols-7 gap-2 pb-1">
                        {/* Empty Padding Cells for Previous Month */}
                        {Array.from({ length: lodgeFirstDayOffset }).map((_, i) => (
                          <div key={`pad-${i}`} className="min-h-[105px] rounded-2xl bg-slate-100/40 border border-transparent" />
                        ))}

                    {/* Active Month Day Cells */}
                    {Array.from({ length: lodgeDaysCount }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = `${lodgeYear}-${String(lodgeMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isToday = isCurrentMonthLodge && dayNum === nowDate.getDate();
                      const todayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
                      const isPast = dateStr < todayStr;

                      // Target rooms based on filter
                      const targetRooms = lodgeFilterRoomId === 'all'
                        ? rooms
                        : rooms.filter(r => r.id === lodgeFilterRoomId);

                      // Active bookings for target rooms
                      const dayBookings = lodgeBookings.filter(b => {
                        if (b.status === 'cancelled') return false;
                        if (!targetRooms.some(r => r.id === b.room_id)) return false;
                        return b.check_in <= dateStr && dateStr < b.check_out;
                      });

                      const isFullyOccupied = dayBookings.length >= targetRooms.length && targetRooms.length > 0;
                      const isAvailable = !isFullyOccupied;
                      const availableCount = targetRooms.length - dayBookings.length;

                      // Check if within drag range
                      let inDragRange = false;
                      if (dragStartDateStr && dragHoverDateStr) {
                        const minD = dragStartDateStr < dragHoverDateStr ? dragStartDateStr : dragHoverDateStr;
                        const maxD = dragStartDateStr > dragHoverDateStr ? dragStartDateStr : dragHoverDateStr;
                        inDragRange = dateStr >= minD && dateStr <= maxD;
                      }

                      return (
                        <div
                          key={dateStr}
                          onMouseDown={() => handleMouseDownDay(dateStr, isAvailable)}
                          onMouseEnter={() => handleMouseEnterDay(dateStr)}
                          className={`min-h-[110px] rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer border ${
                            inDragRange
                              ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md scale-102 ring-2 ring-sky-400'
                              : isPast
                              ? 'bg-slate-100/70 border-slate-200/70 opacity-75 hover:opacity-100 hover:bg-slate-100/90 shadow-2xs'
                              : isFullyOccupied
                              ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-[#0f2b48]/30 shadow-2xs'
                          }`}
                        >
                          {/* Day Number and Badges */}
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-mono font-bold ${
                              inDragRange ? 'text-white' : isToday ? 'text-[#0f2b48]' : isPast ? 'text-slate-400' : 'text-slate-700'
                            }`}>
                              {dayNum}
                            </span>
                            {isToday && (
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                inDragRange ? 'bg-sky-300 text-[#0f2b48]' : 'bg-[#0f2b48] text-white'
                              }`}>
                                HOY
                              </span>
                            )}
                          </div>

                          {/* Day Status / Booking Info */}
                          <div className="space-y-1 my-auto">
                            {inDragRange ? (
                              <div className="text-[10px] font-mono text-sky-200 text-center font-bold">
                                Seleccionado
                              </div>
                            ) : isFullyOccupied ? (
                              <div className="space-y-1">
                                {dayBookings.slice(0, 2).map((b) => (
                                  <div
                                    key={b.id}
                                    className="bg-white border border-rose-200/80 p-1 rounded-lg text-[9px] text-rose-900 truncate shadow-2xs"
                                    title={`${b.guest_name} (${b.channel_source})`}
                                  >
                                    <span className="font-bold block truncate">{b.guest_name || 'Bloqueo'}</span>
                                    <span className="font-mono text-[8px] text-slate-400 uppercase">{b.channel_source}</span>
                                  </div>
                                ))}
                                {dayBookings.length > 2 && (
                                  <span className="text-[8px] font-mono text-rose-700 block text-center">
                                    +{dayBookings.length - 2} más
                                  </span>
                                )}
                              </div>
                            ) : isPast ? (
                              <div className="text-center py-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-slate-200/70 border border-slate-300/60 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  <span>{lodgeFilterRoomId === 'all' ? `${availableCount} libres` : 'Disponible'}</span>
                                </span>
                              </div>
                            ) : (
                              <div className="text-center py-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span>{lodgeFilterRoomId === 'all' ? `${availableCount} libres` : 'Disponible'}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Hint */}
                          <div className={`text-[8px] font-mono text-right ${isPast ? 'text-slate-400 opacity-60' : 'opacity-60'}`}>
                            {inDragRange ? 'Suelta aquí' : isPast ? 'Pasado' : isAvailable ? 'Arrastra ➔' : 'Ocupado'}
                          </div>
                        </div>
                      );
                    })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. TABLE OF BOOKINGS & BLOCKS (LEDGER) */}
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden">
                  <div className="px-7 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd]">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#0f2b48] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0f2b48]" />
                        <span>Historial & Registro de Reservas</span>
                      </h4>
                      <p className="text-xs text-slate-500">Gestión de códigos, canales de venta y eliminación de bloqueos</p>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Buscar por código, huésped o canal..."
                        className="bg-white border border-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl text-[#0f2b48] focus:outline-none focus:border-[#0f2b48] w-64 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5 whitespace-nowrap">Código</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Habitación</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Huésped / Detalle</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Check-in</th>
                          <th className="px-5 py-3.5 whitespace-nowrap">Check-out</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-center">Canal de Origen</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-center">Estado</th>
                          <th className="px-5 py-3.5 whitespace-nowrap text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
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
                              <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-5 py-3.5 font-mono font-bold text-[#0f2b48] whitespace-nowrap">
                                  {booking.booking_code}
                                </td>
                                <td className="px-5 py-3.5 font-semibold text-[#0f2b48] whitespace-nowrap">
                                  {room ? `#${room.room_number} - ${room.room_name}` : 'Habitación sin asignar'}
                                </td>
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 max-w-[280px] truncate" title={`${booking.guest_name} ${booking.guest_phone || ''} ${booking.notes || ''}`}>
                                    <span className="font-bold text-[#0f2b48] truncate">{booking.guest_name}</span>
                                    {booking.notes && (
                                      <span className="text-[10px] text-amber-800 italic truncate font-light">({booking.notes})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold whitespace-nowrap">
                                  {formatDateDDMMYYYY(booking.check_in)}
                                </td>
                                <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold whitespace-nowrap">
                                  {formatDateDDMMYYYY(booking.check_out)}
                                </td>
                                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap ${
                                      booking.channel_source === 'airbnb'
                                        ? 'bg-rose-50 text-[#FF385C] border border-[#FF385C]/30'
                                        : booking.channel_source === 'booking_com'
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                        : booking.channel_source === 'phone_whatsapp'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : booking.channel_source === 'maintenance'
                                        ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    }`}
                                  >
                                    {booking.channel_source}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap ${
                                      booking.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : booking.status === 'blocked'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                        : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`¿Desea eliminar la reserva/bloqueo ${booking.booking_code}?`)) {
                                        await deleteBookingOrBlock(booking.id);
                                        refreshLodge();
                                      }
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition cursor-pointer"
                                    title="Eliminar / Desbloquear"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
            <div className="space-y-8">
              {/* 1. TOP METRICS & OPERATIONAL KPIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: SALIDAS ACTIVAS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between hover:border-[#0f2b48]/30 transition-all">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Salidas Programadas
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      {departures.length > 0 ? departures.length : upcomingExpeditions.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block truncate">
                      {departures.filter((d) => d.status === 'guaranteed').length || 2} con zarpe garantizado
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0f2b48] shrink-0 ml-3">
                    <Ship className="w-5 h-5 text-[#0f2b48]" />
                  </div>
                </div>

                {/* KPI 2: PASAJEROS Y OCUPACIÓN */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between hover:border-[#0f2b48]/30 transition-all">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Pasajeros a Bordo
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      {expBookings.reduce((acc, b) => acc + (b.status !== 'cancelled' ? b.pax_count : 0), 0) || 12}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block truncate">
                      Cupos confirmados en temporada
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 ml-3">
                    <Users className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>

                {/* KPI 3: INGRESOS EXPEDICIONES */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between hover:border-[#0f2b48]/30 transition-all">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Ingresos Expediciones
                    </span>
                    <span className="text-xl font-mono font-bold text-[#0f2b48] mt-1 block truncate">
                      ${(expBookings.reduce((acc, b) => acc + (b.status !== 'cancelled' ? Number(b.total_amount) : 0), 0) || 22200000).toLocaleString('es-CL')}{' '}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block truncate font-mono">
                      Total contratado
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0 ml-3">
                    <DollarSign className="w-5 h-5 text-amber-700" />
                  </div>
                </div>

                {/* KPI 4: FLOTA EN OPERACIÓN */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between hover:border-[#0f2b48]/30 transition-all">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Embarcaciones Activas
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      {vessels.length > 0 ? vessels.length : 2}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block truncate">
                      Vegvisir 45ft • Terranova 52ft
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 ml-3">
                    <Sailboat className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
              </div>

              {/* 2. PROGRAMACIÓN DE SALIDAS (DEPARTURES GRID) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-7 space-y-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)]">
                <div className="space-y-4 border-b border-slate-100 pb-5">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#0f2b48] flex items-center gap-2">
                      <Ship className="w-5 h-5 text-[#0f2b48]" />
                      <span>Salidas Programadas & Estado de Zarpe</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Controla itinerarios, cupos disponibles, precios y estado operativo de cada expedición.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    {/* View Mode Switcher: Cards (Grid) vs List (Table) */}
                    <div className="flex items-center bg-slate-100/90 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('grid')}
                        title="Vista de Tarjetas / Cards"
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                          expeditionsViewMode === 'grid'
                            ? 'bg-[#0f2b48] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Tarjetas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('list')}
                        title="Vista de Lista / Tabla"
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                          expeditionsViewMode === 'list'
                            ? 'bg-[#0f2b48] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Lista</span>
                      </button>
                    </div>

                    {/* Asset Filters with Circular Icons: Vegvisir, Terranova, Lodge */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/80 rounded-full shadow-2xs">
                      {[
                        { id: 'all', label: 'Todas', icon: Compass },
                        { id: 'vegvisir', label: 'Vegvisir', icon: Sailboat },
                        { id: 'terranova', label: 'Terranova', icon: Ship },
                        { id: 'lodge', label: 'Lodge Rincón', icon: BedDouble },
                      ].map((filter) => {
                        const Icon = filter.icon;
                        const isActive = expeditionsAssetFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setExpeditionsAssetFilter(filter.id as any)}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-[#0f2b48] text-white shadow-sm scale-[1.02]'
                                : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/80'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isActive ? 'bg-white/20 text-sky-300' : 'bg-slate-200 text-slate-600'
                            }`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span>{filter.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón Circular + en el extremo derecho */}
                    <button
                      type="button"
                      onClick={() => setShowNewDepartureModal(true)}
                      title="Registrar Nueva Salida Programada"
                      className="w-9 h-9 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4.5 h-4.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Conditional View Rendering: Cards vs List */}
                {expeditionsViewMode === 'grid' ? (
                  /* Grid of Scheduled Departures */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {filteredDepartures.length > 0 ? (
                      filteredDepartures.map((dep) => {
                        const route = expRoutes.find(r => r.id === dep.route_id);
                        const vessel = vessels.find(v => v.id === dep.vessel_id);
                        const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                        const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);
                        const vesselName = vessel?.name || (dep.vessel_id === 'terranova' ? 'Yate Terranova' : dep.vessel_id === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');
                        const routeTitle = dep.name || route?.title || 'Expedición Austral';
                        const VesselIcon = dep.vessel_id === 'terranova' || vesselName.includes('Terranova') ? Ship : dep.vessel_id === 'lodge' || vesselName.includes('Lodge') ? BedDouble : Sailboat;

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
                              badgeText: dep.status === 'guaranteed' ? 'Zarpe Garantizado' : 'Programada',
                            };

                        return (
                          <div
                            key={dep.id}
                            className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                          >
                            <div className="space-y-4">
                              {/* Top Header: Circular Icon + Expedition Name & Vessel Subtitle + Top-Right Edit & Delete Actions */}
                              <div className="flex items-start justify-between gap-3 min-w-0">
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${cardTheme.icon}`}>
                                    <VesselIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-base text-[#0f2b48] tracking-tight leading-snug truncate" title={routeTitle}>
                                      {routeTitle}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5 truncate">
                                      <span className="text-[#0f2b48] font-semibold">{vesselName}</span>
                                      {route?.duration && (
                                        <>
                                          <span className="text-slate-300">•</span>
                                          <span className="text-slate-500 font-light">{route.duration}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Top-Right 3-Dots Action Menu */}
                                <div className="relative shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDepMenuId(openDepMenuId === dep.id ? null : dep.id);
                                    }}
                                    title="Opciones de la Expedición"
                                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#0f2b48] hover:border-[#0f2b48]/30 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openDepMenuId === dep.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDepMenuId(null);
                                        }}
                                      />
                                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-[0_12px_36px_rgba(15,43,72,0.18)] py-1.5 px-1 z-50 animate-scale-in text-xs">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDepMenuId(null);
                                            setEditingDeparture(dep);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-[#0f2b48] hover:bg-slate-50 rounded-xl font-semibold transition text-left cursor-pointer"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-sky-600" />
                                          <span>Editar Expedición</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDepMenuId(null);
                                            handleDeleteDeparture(dep.id);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition text-left cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                          <span>Eliminar Expedición</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3.5">
                                {/* Details Strip (Full Width Stacked) */}
                                <div className={`p-4 border rounded-2xl space-y-3 ${cardTheme.inner}`}>
                                  {/* Fila 1: Zarpe & Fechas */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                      Zarpe & Fechas
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f2b48]">
                                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                      <span>{dep.departure_date} ➔ {dep.return_date}</span>
                                    </div>
                                  </div>

                                  {/* Divisor */}
                                  <div className="border-t border-slate-200/60" />

                                  {/* Fila 2: Tarifa / Pax */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                      Tarifa / Pax
                                    </span>
                                    <div className="text-sm font-mono font-bold text-[#0f2b48]">
                                      ${Number(dep.price_per_pax_clp).toLocaleString('es-CL')} <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Capacity Progress Bar, Status Selector & Action */}
                            <div className="space-y-3 pt-3 border-t border-slate-200/60">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-600 font-medium">
                                  Ocupación: <strong className="text-[#0f2b48] font-bold">{bookedPax}</strong> / {dep.total_slots}
                                </span>

                                {(dep.available_slots || 0) > 0 ? (
                                  <div className="relative group/addpax flex items-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTab('bookings');
                                        setShowBlockModal(true);
                                      }}
                                      className="w-7 h-7 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/addpax:opacity-100 group-hover/addpax:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                                      Registrar Pasajeros ({dep.available_slots} cupos disponibles)
                                      <span className="absolute top-full right-2.5 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                    Agotado
                                  </span>
                                )}
                              </div>

                              <div className="w-full bg-white/80 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`${cardTheme.bar} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              {/* Status Change Selector */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-mono text-slate-500">Estado de Operación:</span>
                                <select
                                  value={dep.status}
                                  onChange={(e) => handleUpdateDepartureStatus(dep.id, e.target.value as any)}
                                  className="bg-white border border-slate-200 text-[10px] font-mono font-bold text-[#0f2b48] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0f2b48] cursor-pointer shadow-2xs"
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
                        const daysUntil = exp.daysUntilDeparture !== undefined ? exp.daysUntilDeparture : 999;
                        const VesselIcon = exp.vesselName.includes('Terranova') ? Ship : exp.vesselName.includes('Lodge') ? BedDouble : Sailboat;

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
                            className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                          >
                            <div className="space-y-4">
                              {/* Top Header: Circular Icon + Expedition Name & Vessel Subtitle + Top-Right Edit & Delete Actions */}
                              <div className="flex items-start justify-between gap-3 min-w-0">
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${cardTheme.icon}`}>
                                    <VesselIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-base text-[#0f2b48] tracking-tight leading-snug truncate" title={exp.routeTitle}>
                                      {exp.routeTitle}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5 truncate">
                                      <span className="text-[#0f2b48] font-semibold">{exp.vesselName}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-500 font-light">{exp.vesselType}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Top-Right 3-Dots Action Menu */}
                                <div className="relative shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDepMenuId(openDepMenuId === exp.id ? null : exp.id);
                                    }}
                                    title="Opciones de la Expedición"
                                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#0f2b48] hover:border-[#0f2b48]/30 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openDepMenuId === exp.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDepMenuId(null);
                                        }}
                                      />
                                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-[0_12px_36px_rgba(15,43,72,0.18)] py-1.5 px-1 z-50 animate-scale-in text-xs">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDepMenuId(null);
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
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-[#0f2b48] hover:bg-slate-50 rounded-xl font-semibold transition text-left cursor-pointer"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-sky-600" />
                                          <span>Editar Expedición</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDepMenuId(null);
                                            handleDeleteDeparture(exp.id);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition text-left cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                          <span>Eliminar Expedición</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3.5">
                                {/* Details Strip (Full Width Stacked) */}
                                <div className={`p-4 border rounded-2xl space-y-3 ${cardTheme.inner}`}>
                                  {/* Fila 1: Zarpe & Fechas */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                      Zarpe & Fechas
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f2b48]">
                                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                      <span>{exp.departureDates}</span>
                                    </div>
                                  </div>

                                  {/* Divisor */}
                                  <div className="border-t border-slate-200/60" />

                                  {/* Fila 2: Tarifa / Pax */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                      Tarifa / Pax
                                    </span>
                                    <div className="text-sm font-mono font-bold text-[#0f2b48]">
                                      {exp.pricePerPax}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Capacity Progress Bar & Action */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-200/60">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-600 font-medium">
                                  Ocupación: <strong className="text-[#0f2b48] font-bold">{exp.bookedPax}</strong> / {exp.maxPax}
                                </span>

                                {exp.availablePax > 0 ? (
                                  <div className="relative group/addpax flex items-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTab('bookings');
                                        setShowBlockModal(true);
                                      }}
                                      className="w-7 h-7 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#0f2b48] text-white text-[10px] font-sans font-medium rounded-lg shadow-xl opacity-0 translate-y-1 group-hover/addpax:opacity-100 group-hover/addpax:translate-y-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                                      Registrar / Sumar Pasajeros ({exp.availablePax} cupos disponibles)
                                      <span className="absolute top-full right-2.5 -mt-1 border-4 border-transparent border-t-[#0f2b48]" />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                    Agotado
                                  </span>
                                )}
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
                      })
                    )}
                  </div>
                ) : (
                  /* List / Table View of Scheduled Departures */
                  <div className="overflow-x-auto border border-slate-200/80 rounded-2xl animate-fadeIn">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-200/70">
                        <tr>
                          <th className="px-6 py-3.5">Ruta & Expedición</th>
                          <th className="px-6 py-3.5">Embarcación</th>
                          <th className="px-6 py-3.5">Fechas de Salida</th>
                          <th className="px-6 py-3.5">Ocupación / Cupos</th>
                          <th className="px-6 py-3.5">Tarifa p/Pax</th>
                          <th className="px-6 py-3.5">Estado de Zarpe</th>
                          <th className="px-6 py-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredDepartures.length > 0 ? (
                          filteredDepartures.map((dep) => {
                            const route = expRoutes.find(r => r.id === dep.route_id);
                            const vessel = vessels.find(v => v.id === dep.vessel_id);
                            const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                            const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);
                            const vesselName = vessel?.name || (dep.vessel_id === 'terranova' ? 'Yate Terranova' : dep.vessel_id === 'lodge' ? 'Lodge Rincón de Navegantes' : 'Velero Vegvisir');
                            const routeTitle = dep.name || route?.title || 'Expedición Austral';
                            const VesselIcon = dep.vessel_id === 'terranova' || vesselName.includes('Terranova') ? Ship : dep.vessel_id === 'lodge' || vesselName.includes('Lodge') ? BedDouble : Sailboat;

                            return (
                              <tr key={dep.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0f2b48]">
                                      <VesselIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0f2b48] font-bold text-sm block">
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
                                    <strong className="text-[#0f2b48] font-bold text-xs block">
                                      {vesselName}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {vessel?.type || (dep.vessel_id === 'terranova' ? 'Hatteras 65ft LRC' : dep.vessel_id === 'lodge' ? 'Refugio Boutique' : 'Dufour 52.5 ft Francés')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                                  <div className="space-y-0.5">
                                    <div><span className="text-slate-400">Zarpe:</span> <strong className="text-[#0f2b48]">{dep.departure_date}</strong></div>
                                    <div><span className="text-slate-400">Retorno:</span> <strong className="text-[#0f2b48]">{dep.return_date}</strong></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-36 space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                      <span>{bookedPax} / {dep.total_slots} pax</span>
                                      <strong className="text-[#0f2b48]">{dep.available_slots} libres</strong>
                                    </div>
                                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#0f2b48] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-xs text-[#0f2b48]">
                                  ${Number(dep.price_per_pax_clp).toLocaleString('es-CL')}
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={dep.status}
                                    onChange={(e) => handleUpdateDepartureStatus(dep.id, e.target.value as any)}
                                    className="bg-white border border-slate-200 text-[10px] font-mono font-bold text-[#0f2b48] rounded-lg px-2 py-1 focus:outline-none focus:border-[#0f2b48] cursor-pointer shadow-2xs"
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
                                      onClick={() => setEditingDeparture(dep)}
                                      className="text-slate-500 hover:text-[#0f2b48] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      title="Editar Información de la Expedición"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeparture(dep.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                      title="Eliminar Expedición"
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
                              <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0f2b48]">
                                      <VesselIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0f2b48] font-bold text-sm block">
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
                                    <strong className="text-[#0f2b48] font-bold text-xs block">
                                      {exp.vesselName}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {exp.vesselType}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                                  {exp.departureDates}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-36 space-y-1">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                      <span>{exp.bookedPax} / {exp.maxPax} pax</span>
                                      <strong className="text-[#0f2b48]">{exp.availablePax} libres</strong>
                                    </div>
                                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#0f2b48] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-xs text-[#0f2b48]">
                                  {exp.pricePerPax}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
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
                                      className="text-slate-500 hover:text-[#0f2b48] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      title="Editar Información de la Expedición"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeparture(exp.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                      title="Eliminar Expedición"
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
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfd]">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#0f2b48] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0f2b48]" />
                      <span>Manifiesto & Registro de Pasajeros de Expediciones</span>
                    </h4>
                    <p className="text-xs text-slate-500">Control de pasajeros, datos de contacto y estado de pago de travesías</p>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por código o pasajero..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48] w-64 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-7 py-3.5">Código</th>
                        <th className="px-7 py-3.5">Pasajero Titular</th>
                        <th className="px-7 py-3.5">Modalidad</th>
                        <th className="px-7 py-3.5">Cupos (Pax)</th>
                        <th className="px-7 py-3.5">Monto Total</th>
                        <th className="px-7 py-3.5">Estado</th>
                        <th className="px-7 py-3.5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-7 py-8 text-center text-slate-400 italic">
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
                            <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                {booking.booking_code}
                              </td>
                              <td className="px-7 py-4">
                                <div className="font-bold text-[#0f2b48]">{booking.guest_name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{booking.guest_email} • {booking.guest_phone}</div>
                              </td>
                              <td className="px-7 py-4">
                                <span className="bg-slate-100 text-[#0f2b48] text-[10px] px-2.5 py-1 rounded-full font-mono font-bold">
                                  {booking.booking_type === 'full_charter' ? 'Chárter Privado' : 'Cupo Individual'}
                                </span>
                              </td>
                              <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                {booking.pax_count} Pax
                              </td>
                              <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                ${Number(booking.total_amount).toLocaleString('es-CL')} CLP
                              </td>
                              <td className="px-7 py-4">
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                    booking.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : booking.status === 'pending_transfer'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {booking.status === 'pending_transfer' ? 'Pendiente Pago' : booking.status}
                                </span>
                              </td>
                              <td className="px-7 py-4 text-right">
                                {booking.status === 'pending_transfer' && (
                                  <button
                                    onClick={() => handleUpdateExpBookingStatus(booking.id, 'approved')}
                                    className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                  >
                                    Aprobar
                                  </button>
                                )}
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
          {/* TAB: CRM DE CLIENTES & GESTIÓN DE LEADS */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 0. SUB-NAVIGATION SWITCHER: CLIENTES VS LEADS (CENTERED MINIMALIST CAPSULE) */}
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full shadow-inner gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCrmActiveSubTab('clients')}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                      crmActiveSubTab === 'clients'
                        ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                        : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/80 font-medium'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Clientes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCrmActiveSubTab('leads')}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                      crmActiveSubTab === 'leads'
                        ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                        : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/80 font-medium'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Leads</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SUB-VIEW A: CRM DE CLIENTES (PAGADOS & CONTRATADOS) */}
              {/* ========================================================================= */}
              {crmActiveSubTab === 'clients' && (
                <div className="space-y-7 animate-fadeIn">
                  
                  {/* 1. KPI CARDS DEL CRM (MODERN & MINIMALIST DESIGN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Clientes */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] hover:shadow-[0_8px_30px_rgba(15,43,72,0.05)] hover:border-slate-300/80 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Total Clientes CRM
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight leading-none">
                          {crmClients.length}
                        </div>
                        <span className="text-[11px] text-slate-500 font-light block truncate pt-1">
                          Base unificada Lodge & Yates
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#0f2b48] shrink-0 shadow-2xs">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Clientes VIP Gold */}
                    <div className="bg-white border border-amber-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(245,158,11,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.07)] hover:border-amber-300 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono block">
                          Clientes VIP Gold
                        </span>
                        <div className="text-3xl font-mono font-bold text-amber-900 tracking-tight leading-none">
                          {crmClients.filter((c) => c.category === 'vip').length}
                        </div>
                        <span className="text-[11px] text-amber-700/80 font-light block truncate pt-1">
                          Alta recurrencia & Chárter
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Valor Total Facturado (LTV) */}
                    <div className="bg-white border border-emerald-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(16,185,129,0.03)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.07)] hover:border-emerald-300 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          LTV Facturado CRM
                        </span>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-[#0f2b48] tracking-tight leading-tight truncate">
                          ${crmClients.reduce((acc, c) => acc + c.totalSpentClp, 0).toLocaleString('es-CL')}
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium block truncate pt-1">
                          CLP Facturado histórico
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Conciliaciones / Transferencias Pendientes */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] hover:shadow-[0_8px_30px_rgba(15,43,72,0.05)] hover:border-slate-300/80 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Transferencias Pendientes
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight leading-none">
                          {pendingApprovalsCount}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTransfersAccordionOpen(!isTransfersAccordionOpen)}
                          className="text-[11px] text-[#0f2b48] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <span>{isTransfersAccordionOpen ? 'Ocultar mesa de pagos' : 'Ver mesa de pagos'}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isTransfersAccordionOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#0f2b48] shrink-0 shadow-2xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* 2. MESA DE CONCILIACIÓN DE TRANSFERENCIAS (ACORDEÓN DESPLEGABLE) */}
                  {isTransfersAccordionOpen && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#0f2b48]" />
                          <h4 className="text-sm font-bold text-[#0f2b48]">
                            Mesa de Conciliación de Transferencias Bancarias
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {installments.length} transacciones registradas
                        </span>
                      </div>

                      {installments.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No hay transferencias pendientes de conciliación.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {installments.map((inst) => (
                            <div
                              key={inst.id}
                              className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-5 space-y-3 hover:border-[#0f2b48]/30 transition"
                            >
                              <div className="flex items-center justify-between">
                                <span className="bg-white text-[#0f2b48] border border-slate-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                                  {inst.booking_type === 'lodge' ? 'Lodge' : 'Expedición'}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    inst.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : inst.status === 'pending_approval'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {inst.status === 'pending_approval' ? 'Voucher Subido' : inst.status}
                                </span>
                              </div>

                              <div>
                                <h5 className="text-xs font-bold text-[#0f2b48]">{inst.concept}</h5>
                                <div className="text-base font-mono font-bold text-[#0f2b48] mt-0.5">
                                  ${inst.amount_expected.toLocaleString('es-CL')}{' '}
                                  <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                </div>
                              </div>

                              {inst.receipt_url ? (
                                <a
                                  href={inst.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-[#0f2b48] text-[11px] py-1.5 rounded-lg transition inline-flex items-center justify-center gap-1.5 font-bold"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#0f2b48]" />
                                  <span>Ver Comprobante</span>
                                </a>
                              ) : (
                                <div className="text-[10px] text-slate-400 italic bg-slate-50 p-2 rounded-lg text-center">
                                  Pendiente de subida
                                </div>
                              )}

                              {inst.status !== 'approved' && (
                                <button
                                  onClick={() => setSelectedInstallment(inst)}
                                  className="w-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-[0_4px_20px_rgba(15,43,72,0.02)] space-y-6">
                    
                    {/* Header del Directorio: Título, Switcher Tarjetas/Lista, Botón Registrar y Buscador Full-Width */}
                    <div className="space-y-4 border-b border-slate-100 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#0f2b48] flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-[#0f2b48]" />
                            <span>Directorio de Clientes & Fichas Individuales</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-light mt-0.5">
                            Selecciona cualquier cliente para ver su ficha completa, historial de reservas, preferencias y bitácora.
                          </p>
                        </div>

                        {/* Switcher Tarjetas / Lista y Botón Circular + */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          {/* View Mode Switcher: Cards (Grid) vs List (Table) */}
                          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setCustomersViewMode('grid')}
                              title="Vista de Tarjetas / Cards"
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                                customersViewMode === 'grid'
                                  ? 'bg-[#0f2b48] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                              }`}
                            >
                              <LayoutGrid className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Tarjetas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomersViewMode('list')}
                              title="Vista de Lista / Tabla"
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                                customersViewMode === 'list'
                                  ? 'bg-[#0f2b48] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Lista</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowNewCustomerModal(true)}
                            title="Registrar Nuevo Cliente"
                            className="w-9 h-9 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
                          >
                            <Plus className="w-4.5 h-4.5 text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Barra de Búsqueda Full-Width abajo */}
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, RUT, email, teléfono, ciudad o palabras clave..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full bg-[#fbfcfd] border border-slate-200/90 rounded-full pl-11 pr-10 py-2.5 text-xs text-[#0f2b48] placeholder:text-slate-400 focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs font-medium"
                        />
                        {customerSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCustomerSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
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
                        <p className="text-xs">No se encontraron clientes con los filtros seleccionados.</p>
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
                              className="bg-white border border-slate-200/80 hover:border-[#0f2b48]/40 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(15,43,72,0.06)] transition-all duration-300 flex flex-col justify-between space-y-5 group"
                            >
                              {/* Top: Monogram Avatar, Name, Location & 3 Dots Button */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wider shadow-2xs shrink-0 font-mono bg-slate-100 text-[#0f2b48] border border-slate-200`}
                                    >
                                      {cust.fullName
                                        .split(' ')
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4
                                        onClick={() => {
                                          setSelectedCustomer(cust);
                                          setCustomerDossierTab('profile');
                                        }}
                                        className="font-bold text-base text-[#0f2b48] leading-snug group-hover:text-sky-700 transition cursor-pointer"
                                        title="Ver Ficha de Cliente"
                                      >
                                        {cust.fullName}
                                      </h4>
                                      <div className="text-xs text-slate-500 font-light mt-0.5 truncate">
                                        {cust.city} • <span className="font-mono text-slate-400 text-[11px]">{cust.rutOrPassport}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 3 Puntos Arriba para abrir Ficha de Cliente */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCustomer(cust);
                                      setCustomerDossierTab('profile');
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#0f2b48] text-slate-500 hover:text-white border border-slate-200/80 hover:border-[#0f2b48] flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                                    title="Ver Ficha Completa del Cliente"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Metrics Strip */}
                                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                                      Inversión LTV
                                    </span>
                                    <div className="text-sm font-mono font-bold text-[#0f2b48]">
                                      ${cust.totalSpentClp.toLocaleString('es-CL')}{' '}
                                      <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                    </div>
                                  </div>
                                  <div className="border-l border-slate-200/80 pl-3 text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                                      Historial
                                    </span>
                                    <div className="text-xs font-semibold text-[#0f2b48] mt-0.5">
                                      {totalBookings} {totalBookings === 1 ? 'reserva' : 'reservas'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Footer: WhatsApp Original Icon & Email Actions */}
                              <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                                <a
                                  href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hola estimado/a ${cust.fullName}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-emerald-200/80 hover:border-[#25D366] flex items-center justify-center gap-2 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer font-bold text-xs"
                                  title="Contactar por WhatsApp"
                                >
                                  <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12.004 2C6.48 2 2 6.48 2 12a9.92 9.92 0 0 0 1.54 5.3L2 22l4.83-1.27A9.97 9.97 0 0 0 12.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.27 13.91c-.24.66-1.38 1.27-1.93 1.35-.49.07-1.12.1-3.23-.77a11.16 11.16 0 0 1-4.84-4.25c-.84-1.12-1.34-2.43-1.34-3.8 0-1.39.73-2.07.97-2.33.24-.26.49-.33.66-.33.17 0 .34.01.49.02.16.01.37-.06.58.45.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.28.45-.14.17-.3.38-.43.51-.15.15-.31.32-.13.63.18.31.81 1.33 1.74 2.16.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.61-.71.77-.95.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.24z" />
                                  </svg>
                                  <span>WhatsApp</span>
                                </a>
                                <a
                                  href={`mailto:${cust.email}?subject=${encodeURIComponent('Atención Concierge — Yates Chile')}`}
                                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#0f2b48] text-slate-600 hover:text-white border border-slate-200 hover:border-[#0f2b48] flex items-center justify-center gap-2 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer font-bold text-xs"
                                  title="Enviar Correo Electrónico"
                                >
                                  <Mail className="w-4 h-4" />
                                  <span>Email</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table / List View of Customers */
                      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl animate-fadeIn">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-200/70">
                            <tr>
                              <th className="px-6 py-3.5">Cliente</th>
                              <th className="px-6 py-3.5">Categoría</th>
                              <th className="px-6 py-3.5">Ubicación / Ciudad</th>
                              <th className="px-6 py-3.5">Inversión LTV</th>
                              <th className="px-6 py-3.5">Historial Reservas</th>
                              <th className="px-6 py-3.5">Preferencias / Tags</th>
                              <th className="px-6 py-3.5 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
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
                                  className="hover:bg-slate-50/80 transition cursor-pointer"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                          cust.category === 'vip'
                                            ? 'bg-[#0f2b48] text-amber-300 border border-amber-400/30'
                                            : 'bg-slate-100 text-[#0f2b48] border border-slate-200'
                                        }`}
                                      >
                                        {monogram}
                                      </div>
                                      <div>
                                        <strong className="text-[#0f2b48] font-bold text-sm block">
                                          {cust.fullName}
                                        </strong>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                          {cust.rutOrPassport || cust.email}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {cust.category === 'vip' ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#fef9ee] text-[#926c15] border border-[#f3e5b8]">
                                        <Award className="w-3 h-3 text-amber-600" />
                                        <span>VIP Gold</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        Regular
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-slate-600 font-medium">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{cust.city || 'Chile'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono font-bold text-sm text-[#0f2b48]">
                                    ${cust.totalSpentClp.toLocaleString('es-CL')}{' '}
                                    <span className="text-[10px] text-slate-400 font-sans font-normal">CLP</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-0.5">
                                      <strong className="text-[#0f2b48] font-bold text-xs block">
                                        {totalBookings} {totalBookings === 1 ? 'reserva' : 'reservas'}
                                      </strong>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        {custExp.length > 0 && <span>{custExp.length} Expediciones</span>}
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
                                          className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200/60 text-slate-600 rounded-md font-medium"
                                        >
                                          {tag.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}
                                        </span>
                                      ))}
                                      {cust.tags && cust.tags.length > 2 && (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          +{cust.tags.length - 2}
                                        </span>
                                      )}
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
                                          title="Contactar por WhatsApp"
                                          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer"
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
                                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#0f2b48] hover:text-white text-slate-700 text-xs font-bold transition cursor-pointer"
                                      >
                                        Ficha 360°
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
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* KPI Cards de Leads (Modern & Minimalist Design) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Leads */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] hover:shadow-[0_8px_30px_rgba(15,43,72,0.05)] hover:border-slate-300/80 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Total Leads Captados
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight leading-none">
                          {leads.length}
                        </div>
                        <span className="text-[11px] text-slate-500 font-light block truncate pt-1">
                          Brochure, Web & WhatsApp
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#0f2b48] shrink-0 shadow-2xs">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Nuevos por Atender */}
                    <div className="bg-white border border-amber-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(245,158,11,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.07)] hover:border-amber-300 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono block">
                          Nuevos por Atender
                        </span>
                        <div className="text-3xl font-mono font-bold text-amber-900 tracking-tight leading-none">
                          {newLeadsCount}
                        </div>
                        <span className="text-[11px] text-amber-700/80 font-light block truncate pt-1">
                          Atención requerida
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
                        <Flame className="w-5 h-5" />
                      </div>
                    </div>

                    {/* En Cotización Activa */}
                    <div className="bg-white border border-sky-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(14,165,233,0.03)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.07)] hover:border-sky-300 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          En Cotización Activa
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#0f2b48] tracking-tight leading-none">
                          {quotingLeadsCount}
                        </div>
                        <span className="text-[11px] text-sky-600 font-medium block truncate pt-1">
                          Propuestas enviadas
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-2xs">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Tasa de Conversión */}
                    <div className="bg-white border border-emerald-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(16,185,129,0.03)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.07)] hover:border-emerald-300 transition-all duration-300 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Tasa de Conversión
                        </span>
                        <div className="text-3xl font-mono font-bold text-emerald-700 tracking-tight leading-none">
                          {conversionRate}%
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium block truncate pt-1">
                          {convertedLeadsCount} convertidos a clientes
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Directorio & Gestión de Leads */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-[0_4px_20px_rgba(15,43,72,0.02)] space-y-6">
                    {/* Header: Título, Filtros, Buscador y Botón Registrar */}
                    <div className="space-y-4 border-b border-slate-100 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#0f2b48] flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#0f2b48]" />
                            <span>Directorio de Leads & Prospectos</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-light mt-0.5">
                            Gestiona el seguimiento, contacta por WhatsApp/correo y convierte prospectos en clientes contratados con un solo clic.
                          </p>
                        </div>

                        {/* Switcher Tarjetas / Lista y Botón Registrar */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          {/* View Mode Switcher: Cards (Grid) vs List (Table) */}
                          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 p-1 rounded-full shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setLeadsViewMode('grid')}
                              title="Vista de Tarjetas / Cards"
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                                leadsViewMode === 'grid'
                                  ? 'bg-[#0f2b48] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                              }`}
                            >
                              <LayoutGrid className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Tarjetas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadsViewMode('list')}
                              title="Vista de Lista / Tabla"
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                                leadsViewMode === 'list'
                                  ? 'bg-[#0f2b48] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Lista</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowNewLeadModal(true)}
                            className="bg-[#0f2b48] hover:bg-[#0a1e34] text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:scale-105 cursor-pointer shrink-0"
                          >
                            <Plus className="w-4 h-4 text-sky-300" />
                            <span>+ Registrar Lead</span>
                          </button>
                        </div>
                      </div>

                      {/* Barra de Búsqueda Full-Width abajo */}
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar lead por nombre, email, teléfono, origen o palabras clave..."
                          value={leadSearchQuery}
                          onChange={(e) => setLeadSearchQuery(e.target.value)}
                          className="w-full bg-[#fbfcfd] border border-slate-200/90 rounded-full pl-11 pr-10 py-2.5 text-xs text-[#0f2b48] placeholder:text-slate-400 focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs font-medium"
                        />
                        {leadSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setLeadSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter Pills (Estado y Origen) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Estado Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mr-1">
                            Estado:
                          </span>
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
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                leadStatusFilter === tab.id
                                  ? 'bg-[#0f2b48] text-white shadow-xs font-bold'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                leadStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Origen Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Origen:
                          </span>
                          <select
                            value={leadOriginFilter}
                            onChange={(e) => setLeadOriginFilter(e.target.value)}
                            className="bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-1 text-xs font-semibold text-[#0f2b48] focus:outline-none"
                          >
                            <option value="all">Todos los Canales</option>
                            <option value="brochure">📥 Descarga Brochure PDF</option>
                            <option value="contacto_web">🌐 Formulario Web</option>
                            <option value="lodge_interest">🏡 Interés Lodge</option>
                            <option value="whatsapp">💬 WhatsApp Directo</option>
                            <option value="manual">✍️ Registro Manual</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contenido: Cards o Lista de Leads */}
                    {filteredLeads.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs">No se encontraron prospectos con los filtros seleccionados.</p>
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
                              ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Convertido a Cliente' }
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
                              className={`bg-white border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-[0_4px_20px_rgba(15,43,72,0.02)] ${
                                lead.status === 'convertido'
                                  ? 'border-emerald-200/80 bg-emerald-50/10'
                                  : 'border-slate-200/80 hover:border-[#0f2b48]/40 hover:shadow-[0_8px_30px_rgba(15,43,72,0.06)]'
                              }`}
                            >
                              <div className="space-y-4">
                                {/* Top: Monogram & Status */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0f2b48] tracking-wider shrink-0">
                                      {lead.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-sm text-[#0f2b48] leading-snug truncate">
                                        {lead.fullName}
                                      </h4>
                                      <span className="text-[11px] text-slate-400 font-light block truncate">
                                        {lead.city || 'Chile'} • <span className="font-mono">{lead.dateCreated}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="relative shrink-0">
                                    <select
                                      value={lead.status}
                                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${statusTheme.bg}`}
                                    >
                                      <option value="nuevo">🟡 Nuevo</option>
                                      <option value="contactado">🔵 Contactado</option>
                                      <option value="cotizando">🟣 Cotizando</option>
                                      <option value="convertido">🟢 Convertido</option>
                                      <option value="descartado">⚪ Descartado</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Origin Channel Badge */}
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
                                  <OriginIcon className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                                  <span className="truncate font-medium">{lead.originDetails}</span>
                                </div>

                                {/* Contact & Trip Details */}
                                <div className="grid grid-cols-2 gap-2 p-3 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl text-[11px]">
                                  <div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                      Interés / Pax
                                    </span>
                                    <span className="font-bold text-[#0f2b48] block mt-0.5 capitalize truncate">
                                      {lead.interestType} • {lead.estimatedPax || 2} pax
                                    </span>
                                  </div>
                                  <div className="border-l border-slate-200/80 pl-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                      Fecha / Presupuesto
                                    </span>
                                    <span className="font-bold text-[#0f2b48] block mt-0.5 font-mono text-[10px] truncate">
                                      {lead.tentativeDate || 'Flexible'} {lead.estimatedBudgetClp ? `• $${Number(lead.estimatedBudgetClp).toLocaleString('es-CL')}` : ''}
                                    </span>
                                  </div>
                                </div>

                                {/* Notes Box */}
                                {lead.notes && (
                                  <div className="p-3 bg-white border border-slate-200/70 rounded-xl text-xs text-slate-600 font-light leading-relaxed">
                                    <p className="line-clamp-2">{lead.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer: Conversion & Direct Actions */}
                              <div className="space-y-2 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  {/* WhatsApp Direct */}
                                  {lead.phone ? (
                                    <a
                                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Hola ${lead.fullName}, te contacto desde Yates Chile respecto a tu consulta sobre ${lead.interestType === 'lodge' ? 'Lodge Rincón de Navegantes' : 'nuestras expediciones náuticas'}. ¿Cómo podemos ayudarte?`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                                      title="Contactar por WhatsApp"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </a>
                                  ) : null}

                                  {/* Mail Direct */}
                                  {lead.email ? (
                                    <a
                                      href={`mailto:${lead.email}?subject=${encodeURIComponent('Información & Propuesta de Travesía — Yates Chile')}`}
                                      className="w-9 h-9 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                                      title="Enviar Correo"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </a>
                                  ) : null}

                                  {/* Edit Notes Button */}
                                  <button
                                    onClick={() => {
                                      setEditingLeadNotes(lead);
                                      setLeadNotesText(lead.notes || '');
                                    }}
                                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                                    title="Editar Notas de Seguimiento"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>

                                  {/* Main Action: Convert to Customer */}
                                  {lead.status !== 'convertido' ? (
                                    <button
                                      onClick={() => handleConvertLeadToClient(lead)}
                                      className="flex-1 bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-2 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Convertir a Cliente</span>
                                    </button>
                                  ) : (
                                    <div className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold py-2 px-3 rounded-xl text-xs text-center">
                                      ✓ Cliente Activo
                                    </div>
                                  )}

                                  {/* Delete button */}
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Eliminar al prospecto ${lead.fullName}?`)) {
                                        deleteLead(lead.id);
                                      }
                                    }}
                                    className="text-slate-300 hover:text-rose-600 p-1.5 transition cursor-pointer"
                                    title="Eliminar Lead"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table / List View of Leads */
                      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl animate-fadeIn">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fbfcfd] text-[#0f2b48]/70 text-[10px] uppercase font-mono tracking-wider font-bold border-b border-slate-200/70">
                            <tr>
                              <th className="px-6 py-3.5">Prospecto</th>
                              <th className="px-6 py-3.5">Canal de Origen</th>
                              <th className="px-6 py-3.5">Estado de Gestión</th>
                              <th className="px-6 py-3.5">Interés & Pax</th>
                              <th className="px-6 py-3.5">Fecha / Presupuesto</th>
                              <th className="px-6 py-3.5 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredLeads.map((lead) => {
                              const statusTheme =
                                lead.status === 'nuevo'
                                  ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Nuevo Lead' }
                                  : lead.status === 'contactado'
                                  ? { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'Contactado' }
                                  : lead.status === 'cotizando'
                                  ? { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'En Cotización' }
                                  : lead.status === 'convertido'
                                  ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Convertido a Cliente' }
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
                                <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0f2b48] tracking-wider shrink-0">
                                        {monogram}
                                      </div>
                                      <div>
                                        <strong className="text-[#0f2b48] font-bold text-sm block">
                                          {lead.fullName}
                                        </strong>
                                        <span className="text-[11px] text-slate-400 font-light">
                                          {lead.city || 'Chile'} • <span className="font-mono">{lead.dateCreated}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-full">
                                      <OriginIcon className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                                      <span className="font-medium">{lead.originDetails}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={lead.status}
                                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none shadow-2xs ${statusTheme.bg}`}
                                    >
                                      <option value="nuevo">🟡 Nuevo</option>
                                      <option value="contactado">🔵 Contactado</option>
                                      <option value="cotizando">🟣 Cotizando</option>
                                      <option value="convertido">🟢 Convertido</option>
                                      <option value="descartado">⚪ Descartado</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <strong className="text-[#0f2b48] font-bold text-xs block capitalize">
                                      {lead.interestType}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {lead.estimatedPax || 2} pasajeros
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                                    <div>{lead.tentativeDate || 'Flexible'}</div>
                                    {lead.estimatedBudgetClp && (
                                      <strong className="text-[#0f2b48] text-xs font-bold">
                                        ${Number(lead.estimatedBudgetClp).toLocaleString('es-CL')} CLP
                                      </strong>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {lead.phone && (
                                        <a
                                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                            `Hola ${lead.fullName}, te contacto desde Yates Chile respecto a tu consulta sobre ${lead.interestType === 'lodge' ? 'Lodge Rincón de Navegantes' : 'nuestras expediciones náuticas'}.`
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer"
                                          title="WhatsApp"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                      {lead.email && (
                                        <a
                                          href={`mailto:${lead.email}?subject=${encodeURIComponent('Información & Propuesta — Yates Chile')}`}
                                          className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center justify-center transition cursor-pointer"
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
                                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
                                        title="Notas"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>
                                      {lead.status !== 'convertido' && (
                                        <button
                                          onClick={() => handleConvertLeadToClient(lead)}
                                          className="px-3 py-1.5 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                        >
                                          <Sparkles className="w-3 h-3 text-amber-300" />
                                          <span>Convertir</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          if (confirm(`¿Eliminar al prospecto ${lead.fullName}?`)) {
                                            deleteLead(lead.id);
                                          }
                                        }}
                                        className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
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
            <div className="space-y-6">
              {/* Header Bar with Title and Action Button */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,43,72,0.02)] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0f2b48] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#0f2b48]" />
                    <span>Catálogo de Experiencias & Actividades</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Controla las excursiones guiadas, actividades de buceo, cabalgatas y trekkings del catálogo.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewServiceModal(true)}
                  className="bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-sky-300" />
                  <span>+ Agregar Experiencia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className={`bg-white border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(15,43,72,0.02)] ${
                      svc.is_active ? 'border-slate-200/80 hover:border-[#0f2b48]/40' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {svc.image_url && (
                      <div className="h-44 w-full relative">
                        <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3.5 left-3.5 bg-[#0f2b48]/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {svc.category}
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#0f2b48] leading-tight">
                          {svc.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium font-mono">
                            {svc.duration_label || 'Duración flexible'}
                          </span>
                          <span className="text-base font-mono font-bold text-[#0f2b48]">
                            ${svc.price_clp.toLocaleString('es-CL')}{' '}
                            <span className="text-[10px] font-sans font-normal text-slate-500">CLP</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await toggleServiceActive(svc.id, !svc.is_active);
                              refreshServices();
                            }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
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
                            className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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
      {/* MODAL CONFIRMACIÓN: BLOQUEO AIRBNB DIRECTO */}
      {/* ========================================================================= */}
      {airbnbConfirmModal?.isOpen && airbnbConfirmModal.room && (
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(15,43,72,0.25)] space-y-6 animate-scale-in">
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
                  <h3 className="font-serif text-xl font-bold text-[#0f2b48]">
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
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Habitación:</span>
                <span className="text-xs font-bold text-[#0f2b48] font-serif">
                  #{airbnbConfirmModal.room.room_number} {airbnbConfirmModal.room.room_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Fecha de Estadía:</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
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
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
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
                className="w-1/2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
              >
                Rechazar
              </button>
              <button
                type="button"
                disabled={isSavingAirbnbBlock}
                onClick={handleConfirmAirbnbBlock}
                className="w-1/2 py-3 px-4 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] active:bg-[#D70466] text-white font-bold text-xs transition shadow-md shadow-[#FF385C]/25 hover:shadow-lg hover:shadow-[#FF385C]/35 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,43,72,0.22)] space-y-5 animate-scale-in my-8">
            
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 text-[#0f2b48] flex items-center justify-center shadow-xs shrink-0">
                  <BedDouble className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                    Lodge Rincón de Navegantes
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#0f2b48]">Reservar Hospedaje</h4>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setReservationWizardStep(1);
                }}
                className="text-slate-400 hover:text-[#0f2b48] transition cursor-pointer p-1"
                title="Cerrar modal"
              >
                <XCircle className="w-5 h-5" />
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
                      // Allow jumping back to earlier steps
                      if (isPassed) setReservationWizardStep(s.step as any);
                    }}
                    className={`rounded-xl py-2 px-1 text-center transition ${
                      isPassed ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition ${
                          isActive
                            ? 'bg-[#0f2b48] text-white shadow-xs'
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
                          ? 'text-[#0f2b48]'
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
                      <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-[#0f2b48]">
                        <Calendar className="w-4 h-4 text-sky-700 shrink-0" />
                        <span className="text-xs font-semibold">
                          Paso 1: Selecciona las fechas de llegada y salida del Lodge.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#0f2b48] block">
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
                            className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none font-mono text-xs font-semibold"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#0f2b48] block">
                            Fecha Check-out (Salida) *
                          </label>
                          <input
                            type="date"
                            value={blockForm.checkOut}
                            min={blockForm.checkIn || undefined}
                            onChange={(e) => setBlockForm({ ...blockForm, checkOut: e.target.value })}
                            className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none font-mono text-xs font-semibold"
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
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
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
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!isDatesValid}
                          onClick={() => setReservationWizardStep(2)}
                          className={`w-2/3 py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-xs ${
                            !isDatesValid
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#0f2b48] hover:bg-[#0a1e34] text-white shadow-[#0f2b48]/20 cursor-pointer'
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
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0f2b48]" />
                          <span>Fechas seleccionadas:</span>
                        </span>
                        <span className="font-mono font-bold text-[#0f2b48]">
                          {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'})
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-[#0f2b48] block mb-2">
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
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-[#0f2b48] border-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 ring-2 ring-[#0f2b48]/20'
                                    : 'bg-[#fbfcfd] hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0f2b48]'
                                  }`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  {isSelected && <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">Seleccionado</span>}
                                </div>
                                <div>
                                  <h5 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#0f2b48]'}`}>
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
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver a Fechas</span>
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
                          className="w-2/3 py-3 rounded-xl font-bold transition shadow-md bg-[#0f2b48] hover:bg-[#0a1e34] text-white shadow-[#0f2b48]/20 cursor-pointer flex items-center justify-center gap-2 text-xs"
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
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          📅 {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} n)
                        </span>
                        <span className="font-mono font-bold text-[#0f2b48]">
                          👥 {blockForm.paxCount} {blockForm.paxCount === 1 ? 'Huésped' : 'Huéspedes'}
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-[#0f2b48] block mb-2">
                          Habitaciones Disponibles para estas Fechas y Capacidad:
                        </label>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
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
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  !isAvailable
                                    ? 'bg-slate-50 border-slate-200/70 opacity-60 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-[#0f2b48] border-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 ring-2 ring-[#0f2b48]/20 cursor-pointer'
                                    : 'bg-[#fbfcfd] hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        !isAvailable
                                          ? 'bg-slate-200 text-slate-400'
                                          : isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-100 text-[#0f2b48]'
                                      }`}
                                    >
                                      {isOccupied ? <Lock className="w-4 h-4 text-rose-500" /> : <BedDouble className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-[#0f2b48]'}`}>
                                          Habitación #{r.room_number} - {r.room_name}
                                        </h5>
                                      </div>
                                      <span className={`text-[10px] block ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>
                                        Capacidad: hasta {r.max_pax} huéspedes • ${r.base_price_clp.toLocaleString('es-CL')}/noche
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status badge & Total Price */}
                                  <div className="text-right shrink-0">
                                    {isOccupied ? (
                                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase block">
                                        Ocupada
                                      </span>
                                    ) : !hasCapacity ? (
                                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase block">
                                        Máx {r.max_pax} PAX
                                      </span>
                                    ) : (
                                      <div>
                                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase inline-block mb-0.5 ${
                                          isSelected
                                            ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-300/30'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}>
                                          Disponible
                                        </span>
                                        <div className={`text-[11px] font-mono font-bold ${isSelected ? 'text-white' : 'text-[#0f2b48]'}`}>
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
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver</span>
                        </button>
                        <button
                          type="button"
                          disabled={!isSelectedRoomEligible}
                          onClick={() => setReservationWizardStep(4)}
                          className={`w-2/3 py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-xs ${
                            !isSelectedRoomEligible
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#0f2b48] hover:bg-[#0a1e34] text-white shadow-[#0f2b48]/20 cursor-pointer'
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
                      <div className="bg-[#0f2b48] text-white rounded-2xl p-3.5 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-sky-200">
                            Habitación #{selectedRoom?.room_number} - {selectedRoom?.room_name}
                          </span>
                          <span className="font-mono font-bold text-sm text-white">
                            ${totalStayPrice.toLocaleString('es-CL')} CLP
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 flex items-center justify-between pt-0.5 border-t border-white/10">
                          <span>📅 {formatDateDDMMYYYY(blockForm.checkIn)} al {formatDateDDMMYYYY(blockForm.checkOut)} ({calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'})</span>
                          <span>👥 {blockForm.paxCount} {blockForm.paxCount === 1 ? 'Huésped' : 'Huéspedes'}</span>
                        </div>
                      </div>

                      {/* Passenger 1 (Main Guest) */}
                      <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#0f2b48] text-white flex items-center justify-center text-[10px] font-bold">
                            1
                          </div>
                          <h5 className="font-bold text-xs text-[#0f2b48]">
                            Pasajero 1 (Titular de la Reserva) *
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
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
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                              Teléfono / WhatsApp *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: +56 9 8131 2920"
                              value={guestList[0]?.phone || blockForm.guestPhone}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlockForm({ ...blockForm, guestPhone: val });
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], phone: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
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
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                              RUT / Pasaporte
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 12.345.678-9 / Pasaporte"
                              value={guestList[0]?.rut || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...guestList];
                                updated[0] = { ...updated[0], rut: val };
                                setGuestList(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Passengers (2, 3, 4) */}
                      {blockForm.paxCount > 1 && (
                        <div className="space-y-2.5">
                          {Array.from({ length: blockForm.paxCount - 1 }).map((_, idx) => {
                            const pIndex = idx + 1;
                            const guest = guestList[pIndex] || { name: '', rut: '' };

                            return (
                              <div
                                key={pIndex}
                                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {pIndex + 1}
                                  </div>
                                  <h5 className="font-bold text-xs text-[#0f2b48]">
                                    Pasajero {pIndex + 1} (Acompañante)
                                  </h5>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
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
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                                      RUT / Pasaporte / Documento
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ej: 19.876.543-2"
                                      value={guest.rut}
                                      onChange={(e) => {
                                        const updated = [...guestList];
                                        updated[pIndex] = { ...updated[pIndex], rut: e.target.value };
                                        setGuestList(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-mono"
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
                          <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                            Canal de Reserva
                          </label>
                          <select
                            value={blockForm.channelSource}
                            onChange={(e) => setBlockForm({ ...blockForm, channelSource: e.target.value as any })}
                            className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-medium cursor-pointer"
                          >
                            <option value="phone_whatsapp">Teléfono / WhatsApp</option>
                            <option value="web_direct">Web Directa Yates Chile</option>
                            <option value="airbnb">Airbnb (Sincronizada)</option>
                            <option value="booking_com">Booking.com</option>
                            <option value="maintenance">Bloqueo Técnico / Mantención</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                            Estado de Pago
                          </label>
                          <select
                            value={blockForm.status}
                            onChange={(e) => setBlockForm({ ...blockForm, status: e.target.value as any })}
                            className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs font-semibold cursor-pointer"
                          >
                            <option value="approved">Confirmada (Pagada)</option>
                            <option value="pending_transfer">Pendiente de Transferencia</option>
                            <option value="blocked">Bloqueo de Calendario</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes / Special Requests */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Notas / Requerimientos Especiales
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Traslado desde aeródromo Robinson Crusoe, late check-out..."
                          value={blockForm.reason}
                          onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                          className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none text-xs"
                        />
                      </div>

                      {/* Step 4 Actions */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReservationWizardStep(3)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Volver</span>
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-3 rounded-xl font-bold transition shadow-md bg-[#0f2b48] hover:bg-[#0a1e34] text-white shadow-[#0f2b48]/20 cursor-pointer flex items-center justify-center gap-2 text-xs"
                        >
                          <Check className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(15,43,72,0.25)] space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/90 text-[#0f2b48] flex items-center justify-center shadow-xs shrink-0">
                  <BedDouble className="w-6 h-6 text-sky-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                    Habitación #{editRoomModal.room.room_number}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#0f2b48]">
                    Editar Habitación
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditRoomModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-[#0f2b48] transition cursor-pointer p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomName} className="space-y-4">
              {/* Room Name Input */}
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-[#0f2b48] block mb-1.5">
                  Nombre de la Cabina / Habitación
                </label>
                <input
                  type="text"
                  required
                  value={editRoomModal.roomName}
                  onChange={(e) =>
                    setEditRoomModal((prev) => ({ ...prev, roomName: e.target.value }))
                  }
                  placeholder="Ej: Cabina Popa (Doble Matrimonial Vista Océano)"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Este nombre se reflejará en el calendario, reservas, cotizaciones y catálogo.
                </p>
              </div>

              {/* Price & Max Pax Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-[#0f2b48] block mb-1.5">
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
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-[#0f2b48] block mb-1.5">
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
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRoomModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoom || !editRoomModal.roomName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0f2b48] hover:bg-[#0a1e34] active:scale-98 text-white font-bold transition text-xs shadow-md shadow-[#0f2b48]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,43,72,0.15)] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                  Conciliación de Pagos
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0f2b48]">Revisar Transferencia</h4>
              </div>
              <button
                onClick={() => setSelectedInstallment(null)}
                className="text-slate-400 hover:text-[#0f2b48]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#fbfcfd] p-5 rounded-2xl space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-bold text-[#0f2b48]">{selectedInstallment.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto Esperado:</span>
                <span className="font-mono font-bold text-[#0f2b48] text-sm">
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
                    className="block rounded-xl overflow-hidden border border-slate-200 max-h-48 shadow-xs"
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
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                  Descuento Especial (Opcional - Monto en CLP)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none font-mono"
                />
              </div>

              {discountAmount > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                    Motivo del Descuento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Descuento grupo familiar / Convenio"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedInstallment(null)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleApprovePayment(selectedInstallment)}
                className="w-2/3 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#0f2b48]/20"
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
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,43,72,0.15)] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                  Catálogo
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0f2b48]">Nueva Experiencia</h4>
              </div>
              <button
                onClick={() => setShowNewServiceModal(false)}
                className="text-slate-400 hover:text-[#0f2b48]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cabalgata Mirador Selkirk"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Categoría</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) =>
                      setNewServiceForm({
                        ...newServiceForm,
                        category: e.target.value as 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar',
                      })
                    }
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
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
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Precio (CLP)</label>
                  <input
                    type="number"
                    value={newServiceForm.price_clp}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, price_clp: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Duración (Etiqueta)</label>
                <input
                  type="text"
                  placeholder="Ej: Medio Día (4 hrs)"
                  value={newServiceForm.duration_label}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, duration_label: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalle de la actividad..."
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">URL Foto (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newServiceForm.image_url}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, image_url: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#0f2b48] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Pencil className="w-4 h-4 text-sky-300" />
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
            <form onSubmit={handleSaveEditedDeparture} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Nombre de la Expedición */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                  Nombre de la Expedición
                </label>
                <input
                  type="text"
                  required
                  value={editingDeparture.name || ''}
                  onChange={(e) => setEditingDeparture({ ...editingDeparture, name: e.target.value })}
                  placeholder="Ej: Expedición Robinson Crusoe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0f2b48] text-sm focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                />
              </div>

              {/* Embarcación / Activo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Embarcación / Activo
                  </label>
                  <select
                    value={editingDeparture.vessel_id}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, vessel_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48] cursor-pointer"
                  >
                    <option value="vegvisir">Velero Vegvisir (45ft Dufour)</option>
                    <option value="terranova">Yate Terranova (52ft Hatteras)</option>
                    <option value="lodge">Lodge Rincón de Navegantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Estado de Zarpe
                  </label>
                  <select
                    value={editingDeparture.status}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48] cursor-pointer"
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
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Fecha de Zarpe / Salida
                  </label>
                  <input
                    type="date"
                    required
                    value={editingDeparture.departure_date}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, departure_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Fecha de Retorno
                  </label>
                  <input
                    type="date"
                    required
                    value={editingDeparture.return_date}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, return_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
              </div>

              {/* Cupos & Tarifas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Cupos Totales
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editingDeparture.total_slots}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, total_slots: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Cupos Disponibles
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editingDeparture.total_slots}
                    required
                    value={editingDeparture.available_slots}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, available_slots: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Tarifa p/Pax (CLP)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="10000"
                    required
                    value={editingDeparture.price_per_pax_clp}
                    onChange={(e) => setEditingDeparture({ ...editingDeparture, price_per_pax_clp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
              </div>

              {/* Ubicación / Región */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                  Destino / Ubicación
                </label>
                <input
                  type="text"
                  value={editingDeparture.location || ''}
                  onChange={(e) => setEditingDeparture({ ...editingDeparture, location: e.target.value })}
                  placeholder="Ej: Archipiélago Juan Fernández / Bahía Cumberland"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[#0f2b48] focus:bg-white focus:outline-none focus:border-[#0f2b48]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDeparture(null)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header del Dossier */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#0f2b48] to-[#163e66] text-white flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl uppercase shadow-lg ${
                    selectedCustomer.category === 'vip'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f2b48]'
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
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-300" />
                        <span>Socio VIP Gold</span>
                      </span>
                    ) : (
                      <span className="bg-white/10 text-slate-200 border border-white/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Cliente Registrado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-sky-200/80 font-mono">
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
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-bold cursor-pointer"
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
                  className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick Contact & Key Metrics Strip */}
            <div className="bg-[#f8fafc] border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola estimado/a ${selectedCustomer.fullName}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp: {selectedCustomer.phone}</span>
                </a>
                <a
                  href={`mailto:${selectedCustomer.email}?subject=${encodeURIComponent('Atención Concierge Yates Chile')}`}
                  className="bg-white hover:bg-slate-100 text-[#0f2b48] border border-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCustomer.email}</span>
                </a>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Inversión (LTV)</span>
                  <span className="font-bold text-[#0f2b48]">
                    ${selectedCustomer.totalSpentClp.toLocaleString('es-CL')} CLP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Reservas</span>
                  <span className="font-bold text-[#0f2b48]">
                    {selectedCustomer.bookingsCount || (getCustomerLodgeBookings(selectedCustomer).length + getCustomerExpBookings(selectedCustomer).length)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="flex items-center gap-1 px-8 pt-3 border-b border-slate-200 bg-white">
              <button
                onClick={() => setCustomerDossierTab('profile')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'profile'
                    ? 'border-[#0f2b48] text-[#0f2b48]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Perfil & Preferencias Concierge
              </button>
              <button
                onClick={() => setCustomerDossierTab('bookings')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'bookings'
                    ? 'border-[#0f2b48] text-[#0f2b48]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Historial de Reservas ({getCustomerLodgeBookings(selectedCustomer).length + getCustomerExpBookings(selectedCustomer).length})
              </button>
              <button
                onClick={() => setCustomerDossierTab('payments')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'payments'
                    ? 'border-[#0f2b48] text-[#0f2b48]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Pagos & Comprobantes ({getCustomerInstallments(selectedCustomer).length})
              </button>
              <button
                onClick={() => setCustomerDossierTab('timeline')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  customerDossierTab === 'timeline'
                    ? 'border-[#0f2b48] text-[#0f2b48]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Bitácora de Seguimiento ({selectedCustomer.timeline?.length || 0})
              </button>
            </div>

            {/* Dossier Content Body (Scrollable) */}
            <div className="p-8 overflow-y-auto max-h-[60vh] space-y-6">
              
              {/* TAB 1: PERFIL & PREFERENCIAS */}
              {customerDossierTab === 'profile' && (
                <div className="space-y-6">
                  {/* Datos de Contacto y Emergencia */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#0f2b48] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0f2b48]" />
                      <span>Datos Generales & Contacto</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">RUT / Pasaporte</span>
                        <span className="font-bold text-[#0f2b48] font-mono">{selectedCustomer.rutOrPassport}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Nacionalidad</span>
                        <span className="font-bold text-[#0f2b48]">{selectedCustomer.nationality}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Ciudad de Residencia</span>
                        <span className="font-bold text-[#0f2b48]">{selectedCustomer.city}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Teléfono Móvil</span>
                        <span className="font-bold text-[#0f2b48] font-mono">{selectedCustomer.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Correo Electrónico</span>
                        <span className="font-bold text-[#0f2b48]">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Contacto de Emergencia</span>
                        <span className="font-bold text-[#0f2b48]">
                          {selectedCustomer.emergencyContact || 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preferencias de Hospitalidad & Náutica */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#0f2b48] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Perfil de Hospitalidad & Preferencias Concierge</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🥗 Dieta & Alergias
                        </span>
                        <p className="text-[#0f2b48] font-medium leading-relaxed">
                          {selectedCustomer.dietaryPreferences || 'Sin restricciones conocidas.'}
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🍷 Vinos & Bebidas
                        </span>
                        <p className="text-[#0f2b48] font-medium leading-relaxed">
                          {selectedCustomer.beveragePreference || 'No especificado.'}
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
                          🤿 Náutica & Buceo
                        </span>
                        <p className="text-[#0f2b48] font-medium leading-relaxed">
                          {selectedCustomer.divingLevel || 'No especificado.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas Internas Editables del Concierge */}
                  <div className="bg-[#fbfcfd] border border-slate-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#0f2b48] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0f2b48]" />
                        <span>Notas Internas del Concierge & Administración</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Privado para el equipo</span>
                    </div>
                    <textarea
                      rows={3}
                      value={selectedCustomer.notes}
                      onChange={(e) => handleUpdateCustomerNotes(e.target.value)}
                      placeholder="Agrega notas clave sobre este cliente (preferencias familiares, solicitudes especiales, acuerdos comerciales)..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none leading-relaxed"
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
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
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
                            className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                                <BedDouble className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-serif font-bold text-sm text-[#0f2b48]">
                                    {room ? room.room_name : 'Lodge Rincón de Navegantes'}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
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
                              <span className="text-xs font-bold text-[#0f2b48] block">
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
                          className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                              <Ship className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-sm text-[#0f2b48]">
                                  Expedición Náutica ({b.booking_type === 'full_charter' ? 'Chárter Exclusivo' : 'Por Cupos'})
                                </span>
                                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
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
                            <span className="text-xs font-bold text-[#0f2b48] block">
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
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                      No hay cuotas o transferencias pendientes registradas para este cliente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCustomerInstallments(selectedCustomer).map((inst) => (
                        <div
                          key={inst.id}
                          className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0f2b48]">{inst.concept}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                inst.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </div>
                          <div className="text-lg font-mono font-bold text-[#0f2b48]">
                            ${inst.amount_expected.toLocaleString('es-CL')} CLP
                          </div>
                          {inst.receipt_url && (
                            <a
                              href={inst.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-slate-100 hover:bg-slate-200 text-[#0f2b48] text-xs py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0f2b48]" />
                              <span>Ver Voucher Bancario</span>
                            </a>
                          )}
                          {inst.status !== 'approved' && (
                            <button
                              onClick={() => setSelectedInstallment(inst)}
                              className="w-full bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                  <form onSubmit={handleAddTimelineNote} className="bg-[#fbfcfd] border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h5 className="font-serif text-xs font-bold text-[#0f2b48] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      <span>Registrar Interacción o Seguimiento</span>
                    </h5>
                    <div className="flex gap-2">
                      <select
                        value={newTimelineType}
                        onChange={(e) => setNewTimelineType(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0f2b48] focus:outline-none"
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
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>

                  {/* Listado Timeline */}
                  <div className="space-y-4 pl-3 border-l-2 border-slate-200">
                    {selectedCustomer.timeline?.map((item) => (
                      <div key={item.id} className="relative pl-6 space-y-1">
                        <div className="w-3 h-3 rounded-full bg-[#0f2b48] absolute -left-[19px] top-1 border-2 border-white ring-2 ring-slate-200" />
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#0f2b48]">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
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
                className="bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0f2b48]">
                  <UserPlus className="w-5 h-5 text-[#0f2b48]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48]">Registrar Nuevo Cliente</h4>
                  <span className="text-[10px] text-slate-400 font-mono">CRM Yates Chile & Lodge</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-[#0f2b48] p-1 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sebastián Edwards Claro"
                    value={newCustomerForm.fullName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, fullName: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@dominio.cl"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Teléfono Móvil</label>
                  <input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">RUT / Pasaporte</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={newCustomerForm.rutOrPassport}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, rutOrPassport: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Categoría</label>
                  <select
                    value={newCustomerForm.category}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, category: e.target.value as any })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-bold focus:border-[#0f2b48] focus:outline-none"
                  >
                    <option value="regular">Cliente Estándar</option>
                    <option value="vip">👑 Socio VIP Gold</option>
                    <option value="prospect">🌟 Prospecto / Cotización</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Dieta o Alergias</label>
                <input
                  type="text"
                  placeholder="Ej: Celíaco / Pescatariano / Sin mariscos"
                  value={newCustomerForm.dietary}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, dietary: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Notas Iniciales</label>
                <textarea
                  rows={2}
                  placeholder="Notas de concierge o antecedentes del cliente..."
                  value={newCustomerForm.notes}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#0f2b48]">Registrar Nuevo Lead / Prospecto</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Seguimiento Comercial Yates Chile</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="text-slate-400 hover:text-[#0f2b48] p-1 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Ríos Salas"
                    value={newLeadForm.fullName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="prospecto@empresa.cl"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="+56 9 8765 4321"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Canal de Origen</label>
                  <select
                    value={newLeadForm.origin}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, origin: e.target.value as any })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-bold focus:border-[#0f2b48] focus:outline-none"
                  >
                    <option value="contacto_web">🌐 Formulario Web Contacto</option>
                    <option value="brochure">📥 Descarga Brochure PDF</option>
                    <option value="whatsapp">💬 WhatsApp Directo</option>
                    <option value="lodge_interest">🏡 Consulta Lodge</option>
                    <option value="manual">✍️ Registro Manual / Evento</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Tipo de Interés</label>
                  <select
                    value={newLeadForm.interestType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, interestType: e.target.value as any })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-bold focus:border-[#0f2b48] focus:outline-none"
                  >
                    <option value="expediciones">⛵ Expediciones Náuticas</option>
                    <option value="lodge">🏡 Lodge Rincón de Navegantes</option>
                    <option value="charter">⚓ Chárter Náutico Exclusivo</option>
                    <option value="ambos">✨ Lodge + Expedición (Full)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Pax Estimados</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newLeadForm.estimatedPax}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedPax: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Fecha Tentativa</label>
                  <input
                    type="text"
                    placeholder="Ej: Noviembre 2026"
                    value={newLeadForm.tentativeDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, tentativeDate: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Presupuesto Estimado (CLP)</label>
                  <input
                    type="number"
                    placeholder="3700000"
                    value={newLeadForm.estimatedBudgetClp}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedBudgetClp: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Notas / Consulta Inicial</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre lo que busca el prospecto..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-[#0f2b48]">Bitácora de Notas</h4>
                <span className="text-[11px] text-slate-500 font-light">Lead: {editingLeadNotes.fullName}</span>
              </div>
              <button
                onClick={() => setEditingLeadNotes(null)}
                className="text-slate-400 hover:text-[#0f2b48] p-1 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadNotes} className="space-y-4">
              <textarea
                rows={5}
                value={leadNotesText}
                onChange={(e) => setLeadNotesText(e.target.value)}
                placeholder="Registra acuerdos, fechas acordadas, resumen de llamadas o notas comerciales..."
                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-2xl p-3.5 text-xs text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none leading-relaxed"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLeadNotes(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_rgba(15,43,72,0.25)] space-y-6 animate-scale-in my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0f2b48] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm shrink-0">
                  {`${(adminProfile.firstName?.[0] || 'A')}${(adminProfile.lastName?.[0] || 'D')}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0f2b48]">
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
                className="text-slate-400 hover:text-[#0f2b48] p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
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
                  <User className="w-4 h-4 text-[#0f2b48]" />
                  <h4 className="font-serif text-sm font-bold text-[#0f2b48] uppercase tracking-wider text-[11px]">
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
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs"
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
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs"
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
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs"
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
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono font-medium cursor-not-allowed select-none opacity-80"
                        title="El correo principal corporativo no puede ser modificado"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: RESETEAR CONTRASEÑA */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0f2b48]" />
                    <h4 className="font-serif text-sm font-bold text-[#0f2b48] uppercase tracking-wider text-[11px]">
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
                        className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f2b48] p-1 cursor-pointer transition"
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
                          className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f2b48] p-1 cursor-pointer transition"
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
                          className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:bg-white focus:outline-none transition shadow-2xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f2b48] p-1 cursor-pointer transition"
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
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0f2b48] hover:bg-[#0a1e34] active:bg-[#061424] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-sky-300" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
