import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Copy
} from 'lucide-react';
import { useLodge } from '../hooks/useLodge';
import { useCatalogServices } from '../hooks/useCatalogServices';
import { useSiteContent } from '../hooks/useSiteContent';
import { paymentService, type PaymentInstallment } from '../services/paymentService';
import { BookingWizardModal, type BookingWizardData } from '../components/admin/BookingWizardModal';
import { VisualCmsEditor } from '../components/admin/VisualCmsEditor';
import {
  expeditionService,
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
  const { rooms, bookings: lodgeBookings, refreshLodge, adminBlockRoom, deleteBookingOrBlock } = useLodge();
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
  const [crmClients, setCrmClients] = useState<CustomerProfile[]>(INITIAL_CRM_CLIENTS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerDossierTab, setCustomerDossierTab] = useState<'profile' | 'bookings' | 'payments' | 'timeline'>('profile');
  const [customerFilter] = useState<'all' | 'vip' | 'expeditions' | 'lodge' | 'pending_payment'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSortBy] = useState<'ltv_desc' | 'name_asc' | 'date_desc'>('ltv_desc');
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

  // Modal para nueva salida de expedición
  const [showNewDepartureModal, setShowNewDepartureModal] = useState(false);
  const [newDepartureForm, setNewDepartureForm] = useState({
    routeId: '',
    vesselId: '',
    departureDate: '',
    returnDate: '',
    totalSlots: 10,
    pricePerPaxClp: 1850000,
    priceCharterFullClp: 15000000,
    status: 'scheduled' as 'scheduled' | 'guaranteed' | 'completed' | 'cancelled',
  });

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
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDayNumber, selectedMonthDate, activeTab, isLodgeCalendarOpen]);

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
        channelSource: 'airbnb',
        reason: '',
        guestName: '',
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

  // Modals state
  const [showBookingWizardModal, setShowBookingWizardModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlockRoomDropdownOpen, setIsBlockRoomDropdownOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    channelSource: 'airbnb' as 'airbnb' | 'booking_com' | 'phone_whatsapp' | 'maintenance',
    reason: '',
    guestName: '',
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

      // Auto-refresh cuando la ventana o pestaña recupera el foco
      const handleFocus = () => {
        fetchAllData();
        refreshLodge();
        refreshServices();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
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

  // Unified All Bookings (Lodge & Expeditions)
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
        dates: `${b.check_in} ➔ ${b.check_out}`,
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
      const route = expRoutes.find((r) => r.id === b.route_id);
      const vessel = vessels.find((v) => v.id === b.vessel_id);
      return {
        id: b.id,
        type: 'expedition' as const,
        type_label: 'Expedición Náutica',
        booking_code: b.booking_code,
        guest_name: b.guest_name,
        guest_email: b.guest_email || 'navegante@yateschile.cl',
        guest_phone: b.guest_phone || 'Sin contacto',
        service_title: route ? route.title : (b.booking_type === 'full_charter' ? 'Expedición Charter Completo' : 'Expedición Selkirk'),
        unit_detail: vessel ? `${vessel.name} (${vessel.type})` : 'Velero Vegvisir',
        dates: 'Zarpe Programado',
        raw_check_in: b.created_at,
        raw_check_out: b.created_at,
        channel: 'web_direct' as const,
        status: b.status,
        amount: b.total_amount || 1850000,
        notes: `Modalidad: ${b.booking_type}`,
        created_at: b.created_at || new Date().toISOString(),
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

  // Upcoming Expeditions Capacity Schedule
  const upcomingExpeditions = [
    {
      id: 'exp-1',
      vesselName: 'Velero Vegvisir',
      vesselType: 'Dufour 52.5 ft Francés',
      routeTitle: 'Expedición Selkirk & Robinson Crusoe',
      departureDates: '15 Oct - 22 Oct 2026 (7 días)',
      maxPax: 6,
      bookedPax: 4,
      availablePax: 2,
      pricePerPax: '$1.850.000 CLP',
      status: 'Confirmada para Zarpe',
      statusColor: 'emerald',
    },
    {
      id: 'exp-2',
      vesselName: 'Yate Terranova',
      vesselType: 'Yate Oceánico 60 ft',
      routeTitle: 'Travesía Alejandro Selkirk Extremo',
      departureDates: '05 Nov - 12 Nov 2026 (8 días)',
      maxPax: 8,
      bookedPax: 3,
      availablePax: 5,
      pricePerPax: '$2.100.000 CLP',
      status: 'En Reserva Activa',
      statusColor: 'sky',
    },
    {
      id: 'exp-3',
      vesselName: 'Velero Vegvisir',
      vesselType: 'Dufour 52.5 ft Francés',
      routeTitle: 'Vuelta al Archipiélago & Buceo con Lobos',
      departureDates: '20 Nov - 27 Nov 2026 (7 días)',
      maxPax: 6,
      bookedPax: 1,
      availablePax: 5,
      pricePerPax: '$1.750.000 CLP',
      status: 'Zarpe Abierto',
      statusColor: 'amber',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username === 'admin' || username === 'admin@yateschile.cl') &&
      (password === 'yates2026' || password === 'admin123')
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
      alert('Por favor seleccione la habitación y las fechas de check-in / check-out.');
      return;
    }
    const res = await adminBlockRoom({
      roomId: blockForm.roomId,
      checkIn: blockForm.checkIn,
      checkOut: blockForm.checkOut,
      channelSource: 'maintenance',
      reason: blockForm.reason || 'Bloqueo Manual / Mantenimiento',
      guestName: blockForm.reason || 'Bloqueo Manual Panel',
    });
    if (res.success) {
      setShowBlockModal(false);
      setBlockForm({
        roomId: '',
        checkIn: '',
        checkOut: '',
        channelSource: 'maintenance',
        reason: '',
        guestName: '',
      });
      refreshLodge();
      setActionMessage('Bloqueo de habitación registrado exitosamente.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleAirbnbBlock = async () => {
    if (!blockForm.roomId || !blockForm.checkIn || !blockForm.checkOut) {
      alert('Por favor seleccione la habitación y las fechas de check-in / check-out primero.');
      return;
    }
    const res = await adminBlockRoom({
      roomId: blockForm.roomId,
      checkIn: blockForm.checkIn,
      checkOut: blockForm.checkOut,
      channelSource: 'airbnb',
      reason: blockForm.reason ? `Airbnb: ${blockForm.reason}` : 'Reserva Sincronizada Airbnb',
      guestName: blockForm.reason ? `Airbnb: ${blockForm.reason}` : 'Huésped Airbnb',
    });
    if (res.success) {
      setShowBlockModal(false);
      setBlockForm({
        roomId: '',
        checkIn: '',
        checkOut: '',
        channelSource: 'maintenance',
        reason: '',
        guestName: '',
      });
      refreshLodge();
      setActionMessage('Habitación bloqueada exitosamente como Reserva Airbnb.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert('Error: ' + res.error);
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
  const handleCreateDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartureForm.routeId || !newDepartureForm.vesselId || !newDepartureForm.departureDate || !newDepartureForm.returnDate) {
      alert('Por favor completa todos los campos requeridos (Ruta, Embarcación y Fechas).');
      return;
    }
    const res = await expeditionService.createDeparture({
      routeId: newDepartureForm.routeId,
      vesselId: newDepartureForm.vesselId,
      departureDate: newDepartureForm.departureDate,
      returnDate: newDepartureForm.returnDate,
      totalSlots: Number(newDepartureForm.totalSlots),
      pricePerPaxClp: Number(newDepartureForm.pricePerPaxClp),
      priceCharterFullClp: Number(newDepartureForm.priceCharterFullClp),
      status: newDepartureForm.status,
    });
    if (res.success) {
      setShowNewDepartureModal(false);
      setNewDepartureForm({
        routeId: '',
        vesselId: '',
        departureDate: '',
        returnDate: '',
        totalSlots: 10,
        pricePerPaxClp: 1850000,
        priceCharterFullClp: 15000000,
        status: 'scheduled',
      });
      fetchAllData();
      setActionMessage('Nueva salida de expedición programada y guardada con éxito.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert('Error al crear salida: ' + res.error);
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
      <aside className="w-72 bg-white text-[#0f2b48] flex flex-col justify-between border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(15,43,72,0.02)]">
        
        {/* Brand Header */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/vegvisir-emblem-dark.png"
              alt="Logo Yates Chile"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="font-serif text-base font-bold text-[#0f2b48] tracking-tight leading-tight">
                Yates Chile
              </h2>
              <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Conectado</span>
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-3">
            Navegación Principal
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            
            {/* 1. DASHBOARD */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
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

            {/* 2. RESERVAS (NUEVA PESTAÑA CENTRALIZADA) */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Reservas</span>
              </div>
              <span className="bg-sky-100 text-[#0f2b48] text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                {totalBookingsCount}
              </span>
            </button>

            {/* 3. TRÁFICO & ANALÍTICA (PESTAÑA DEDICADA) */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Tráfico & Geolocalización</span>
              </div>
              <span className="bg-sky-100 text-[#0f2b48] text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                {analyticsSummary?.totalViews || 0}
              </span>
            </button>

            {/* 4. LODGE */}
            <button
              onClick={() => setActiveTab('lodge')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'lodge'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <BedDouble className={`w-4 h-4 ${activeTab === 'lodge' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Lodge</span>
              </div>
              {lodgeBookings.filter((b) => b.status === 'pending_transfer').length > 0 && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {lodgeBookings.filter((b) => b.status === 'pending_transfer').length}
                </span>
              )}
            </button>

            {/* 5. EXPEDICIONES NÁUTICAS (NUEVA PESTAÑA) */}
            <button
              onClick={() => setActiveTab('expeditions')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'expeditions'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ship className={`w-4 h-4 ${activeTab === 'expeditions' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Expediciones Náuticas</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {departures.length > 0 ? departures.length : 3}
              </span>
            </button>

            {/* 6. CLIENTES (CRM) */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className={`w-4 h-4 ${activeTab === 'payments' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Clientes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {crmClients.length}
              </span>
            </button>

            {/* 7. CATÁLOGO */}
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20 font-bold'
                  : 'text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className={`w-4 h-4 ${activeTab === 'services' ? 'text-sky-300' : 'text-slate-400'}`} />
                <span>Catálogo & Servicios</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {services.length}
              </span>
            </button>

            {/* 8. CMS */}
            <button
              onClick={() => setActiveTab('cms')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
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
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-6 border-t border-slate-100 space-y-2.5">
          <button
            onClick={() => (onNavigate ? onNavigate('/') : (window.location.hash = '/'))}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 text-slate-700 hover:text-[#0f2b48] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition border border-slate-200/80 cursor-pointer"
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
            className="w-full flex items-center justify-center gap-2 text-rose-700 hover:bg-rose-50 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border border-transparent hover:border-rose-200"
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
              {activeTab === 'payments' && <UserCheck className="w-4 h-4" />}
              {activeTab === 'services' && <Tag className="w-4 h-4" />}
              {activeTab === 'cms' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0f2b48] leading-tight">
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
                  ? 'CRM de Clientes & Concierge'
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
                  ? `${crmClients.length} clientes registrados • Fichas individuales y conciliación`
                  : activeTab === 'services'
                  ? `${services.length} experiencias activas en catálogo`
                  : 'Editor de portada y contenidos públicos'}
              </span>
            </div>
          </div>

          {/* Right Area: Admin Profile */}
          <div className="flex items-center gap-4">
            {/* Admin User Badge */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-[#0f2b48] font-bold block leading-tight">
                  Administrador General
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Yates Chile SpA</span>
              </div>
              <div className="w-8 h-8 bg-[#0f2b48] text-white rounded-xl flex items-center justify-center text-[11px] font-bold font-mono shadow-sm">
                AD
              </div>
            </div>
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
                                  : 'bg-slate-50/80 border-slate-200 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-xs text-[#0f2b48]">
                                    #{room.room_number}
                                  </span>
                                  <span
                                    className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                                      isAvailable
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                  >
                                    {isAvailable ? 'Disponible' : 'Ocupada'}
                                  </span>
                                </div>
                                <div>
                                  <h6 className="font-serif font-bold text-sm text-[#0f2b48] leading-snug">
                                    {room.room_name}
                                  </h6>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Hasta {room.max_pax} Huéspedes • ${room.base_price_clp.toLocaleString('es-CL')}/noche
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100">
                                {isAvailable ? (
                                  <button
                                    onClick={() => {
                                      setBlockForm({
                                        roomId: room.id,
                                        checkIn: selectedDayData?.dateStr || new Date().toISOString().split('T')[0],
                                        checkOut: new Date(new Date(selectedDayData?.dateStr || Date.now()).getTime() + 86400000)
                                          .toISOString()
                                          .split('T')[0],
                                        channelSource: 'airbnb',
                                        reason: '',
                                        guestName: '',
                                      });
                                      setShowBlockModal(true);
                                    }}
                                    className="w-full bg-[#f8fafc] hover:bg-[#0f2b48] text-slate-700 hover:text-white border border-slate-200 font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Bloquear Fecha</span>
                                  </button>
                                ) : (
                                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-700 space-y-0.5">
                                    <span className="font-bold block truncate text-[#0f2b48]">
                                      {booking?.guest_name || 'Bloqueo Administrativo'}
                                    </span>
                                    <div className="flex items-center justify-between font-mono text-[9px] text-slate-400">
                                      <span className="uppercase">{booking?.channel_source || 'Directo'}</span>
                                      <span>{booking?.booking_code}</span>
                                    </div>
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
                      /* VISTA TARJETAS (GRID) */
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {upcomingExpeditions.map((exp) => {
                          const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                          
                          const cardTheme = 
                            exp.statusColor === 'emerald'
                              ? {
                                  container: 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.04)]',
                                  icon: 'bg-white text-emerald-800 border-emerald-200/80 shadow-2xs',
                                  inner: 'bg-white/80 border-emerald-100',
                                  bar: 'bg-emerald-600',
                                }
                              : exp.statusColor === 'sky'
                              ? {
                                  container: 'bg-sky-50/50 border-sky-200/90 hover:border-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.04)]',
                                  icon: 'bg-white text-sky-800 border-sky-200/80 shadow-2xs',
                                  inner: 'bg-white/80 border-sky-100',
                                  bar: 'bg-sky-600',
                                }
                              : {
                                  container: 'bg-amber-50/50 border-amber-200/90 hover:border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.04)]',
                                  icon: 'bg-white text-amber-800 border-amber-200/80 shadow-2xs',
                                  inner: 'bg-white/80 border-amber-100',
                                  bar: 'bg-amber-500',
                                };

                          return (
                            <div
                              key={exp.id}
                              className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${cardTheme.icon}`}>
                                    <Ship className="w-5 h-5" />
                                  </div>
                                  <h4 className="font-serif font-bold text-lg text-[#0f2b48] tracking-tight">
                                    {exp.vesselName}
                                  </h4>
                                </div>

                                <div className="space-y-3.5">
                                  <div>
                                    <h5 className="font-serif font-bold text-base text-[#0f2b48] leading-snug">
                                      {exp.routeTitle}
                                    </h5>
                                  </div>

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
                        })}
                      </div>
                    ) : (
                      /* VISTA LISTA / TABLA */
                      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                                <th className="py-3 px-4">Embarcación</th>
                                <th className="py-3 px-4">Expedición & Fechas</th>
                                <th className="py-3 px-4">Estado</th>
                                <th className="py-3 px-4">Ocupación / Cupos</th>
                                <th className="py-3 px-4 text-right">Tarifa / Pax</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {upcomingExpeditions.map((exp) => {
                                const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                                return (
                                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#0f2b48] shrink-0">
                                          <Ship className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <strong className="text-[#0f2b48] font-serif font-bold block text-xs">
                                            {exp.vesselName}
                                          </strong>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {exp.vesselType}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div>
                                        <strong className="text-[#0f2b48] font-serif font-semibold block text-xs">
                                          {exp.routeTitle}
                                        </strong>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                                          <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                                          <span>{exp.departureDates}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span
                                        className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-block ${
                                          exp.statusColor === 'emerald'
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                            : exp.statusColor === 'sky'
                                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                                        }`}
                                      >
                                        {exp.status}
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
                                            className="bg-[#0f2b48] h-full rounded-full"
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
                /* 4.A VISTA LISTA / TABLA MINIMALISTA & LUXURY */
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,43,72,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#fbfcfd] border-b border-slate-200/80 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                          <th className="px-6 py-4">Tipo & Unidad</th>
                          <th className="px-6 py-4">Código</th>
                          <th className="px-6 py-4">Huésped / Pasajero</th>
                          <th className="px-6 py-4">Servicio / Detalle</th>
                          <th className="px-6 py-4">Fechas & Estadía</th>
                          <th className="px-6 py-4">Monto Total</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
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
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      b.type === 'lodge'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                                    }`}
                                  >
                                    {b.type === 'lodge' ? (
                                      <BedDouble className="w-3.5 h-3.5" />
                                    ) : (
                                      <Ship className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <div>
                                    <strong className="text-[#0f2b48] font-serif font-bold text-xs block leading-tight">
                                      {b.type_label}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {b.channel === 'web_direct' ? 'Web Directa' : 'Admin'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Código */}
                              <td className="px-6 py-4 font-mono font-bold text-xs text-[#0f2b48]">
                                <span className="bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                  {b.booking_code}
                                </span>
                              </td>

                              {/* Huésped */}
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <strong className="text-[#0f2b48] font-bold text-xs block">
                                    {b.guest_name}
                                  </strong>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                    <span>{b.guest_phone}</span>
                                    {b.guest_email && <span>• {b.guest_email}</span>}
                                  </div>
                                </div>
                              </td>

                              {/* Servicio / Habitación */}
                              <td className="px-6 py-4">
                                <div>
                                  <span className="font-medium text-[#0f2b48] text-xs block">
                                    {b.service_title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {b.unit_detail}
                                  </span>
                                </div>
                              </td>

                              {/* Fechas */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-mono text-xs text-[#0f2b48]">
                                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  <span>{b.dates}</span>
                                </div>
                              </td>

                              {/* Monto */}
                              <td className="px-6 py-4 font-mono font-bold text-xs text-[#0f2b48]">
                                ${b.amount.toLocaleString('es-CL')}{' '}
                                <span className="text-[10px] font-sans font-normal text-slate-400">CLP</span>
                              </td>

                              {/* Estado */}
                              <td className="px-6 py-4">
                                <span
                                  className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                                    b.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : b.status === 'blocked'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {b.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                  {b.status === 'pending_transfer' && <Clock className="w-3 h-3" />}
                                  {b.status === 'approved'
                                    ? 'Confirmada'
                                    : b.status === 'blocked'
                                    ? 'Bloqueo'
                                    : 'Pendiente Pago'}
                                </span>
                              </td>

                              {/* Acciones */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Conversar por WhatsApp"
                                      className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition cursor-pointer"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setSelectedBookingForDetail(b)}
                                    title="Ver Ficha Completa"
                                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0f2b48] border border-slate-200 flex items-center justify-center transition cursor-pointer"
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
                                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition cursor-pointer"
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
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-[#0f2b48]" />
                          <h4 className="font-serif text-lg font-bold text-[#0f2b48]">
                            Disponibilidad & Calendario — {activeFilterRoom ? `${activeFilterRoom.room_name} (#${activeFilterRoom.room_number})` : 'Todas las Cabinas'}
                          </h4>
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
                            channelSource: 'airbnb',
                            reason: '',
                            guestName: '',
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
                          <th className="px-7 py-3.5">Código</th>
                          <th className="px-7 py-3.5">Habitación</th>
                          <th className="px-7 py-3.5">Huésped / Detalle</th>
                          <th className="px-7 py-3.5">Fechas (Check-in / Out)</th>
                          <th className="px-7 py-3.5">Canal de Origen</th>
                          <th className="px-7 py-3.5">Estado</th>
                          <th className="px-7 py-3.5 text-right">Acción</th>
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
                                <td className="px-7 py-4 font-mono font-bold text-[#0f2b48]">
                                  {booking.booking_code}
                                </td>
                                <td className="px-7 py-4 font-semibold text-[#0f2b48]">
                                  {room ? `#${room.room_number} - ${room.room_name}` : 'Habitación sin asignar'}
                                </td>
                                <td className="px-7 py-4">
                                  <div className="font-bold text-[#0f2b48]">{booking.guest_name}</div>
                                  <div className="text-[10px] text-slate-500">{booking.guest_phone}</div>
                                  {booking.notes && (
                                    <div className="text-[10px] text-amber-800 italic mt-0.5">{booking.notes}</div>
                                  )}
                                </td>
                                <td className="px-7 py-4 font-mono text-slate-700 font-medium">
                                  {booking.check_in} ➔ {booking.check_out}
                                </td>
                                <td className="px-7 py-4">
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                      booking.channel_source === 'airbnb'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
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
                                <td className="px-7 py-4">
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
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
                                <td className="px-7 py-4 text-right">
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

                  <div className="flex items-center justify-between gap-4 w-full">
                    {/* View Mode Switcher: Cards (Grid) vs List (Table) */}
                    <div className="flex items-center bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setExpeditionsViewMode('grid')}
                        title="Vista de Tarjetas / Cards"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                          expeditionsViewMode === 'list'
                            ? 'bg-[#0f2b48] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/60'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Lista</span>
                      </button>
                    </div>

                    {/* Botón Circular + en el extremo derecho */}
                    <button
                      type="button"
                      onClick={() => {
                        const defaultRouteId = expRoutes[0]?.id || 'juan-fernandez';
                        const defaultVesselId = vessels[0]?.id || 'vegvisir';
                        const defaultDepDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
                        const defaultRetDate = new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0];
                        setNewDepartureForm({
                          routeId: defaultRouteId,
                          vesselId: defaultVesselId,
                          departureDate: defaultDepDate,
                          returnDate: defaultRetDate,
                          totalSlots: 10,
                          pricePerPaxClp: 1850000,
                          priceCharterFullClp: 15000000,
                          status: 'scheduled',
                        });
                        setShowNewDepartureModal(true);
                      }}
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
                    {departures.length > 0 ? (
                      departures.map((dep) => {
                        const route = expRoutes.find(r => r.id === dep.route_id);
                        const vessel = vessels.find(v => v.id === dep.vessel_id);
                        const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                        const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);

                        const cardTheme = 
                          dep.status === 'guaranteed'
                            ? {
                                container: 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.04)]',
                                icon: 'bg-white text-emerald-800 border-emerald-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-emerald-100',
                                bar: 'bg-emerald-600',
                              }
                            : dep.status === 'scheduled'
                            ? {
                                container: 'bg-sky-50/50 border-sky-200/90 hover:border-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.04)]',
                                icon: 'bg-white text-sky-800 border-sky-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-sky-100',
                                bar: 'bg-sky-600',
                              }
                            : {
                                container: 'bg-amber-50/50 border-amber-200/90 hover:border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.04)]',
                                icon: 'bg-white text-amber-800 border-amber-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-amber-100',
                                bar: 'bg-amber-500',
                              };

                        return (
                          <div
                            key={dep.id}
                            className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${cardTheme.icon}`}>
                                  <Ship className="w-5 h-5" />
                                </div>
                                <h4 className="font-serif font-bold text-lg text-[#0f2b48] tracking-tight">
                                  {vessel?.name || 'Velero Vegvisir'}
                                </h4>
                              </div>

                              <div className="space-y-3.5">
                                <div>
                                  <h5 className="font-serif font-bold text-base text-[#0f2b48] leading-snug">
                                    {route?.title || 'Expedición Selkirk & Robinson Crusoe'}
                                  </h5>
                                  {route?.duration && (
                                    <p className="text-xs text-slate-500 font-light flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{route.duration}</span>
                                    </p>
                                  )}
                                </div>

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

                              {/* Status Change & Delete Button */}
                              <div className="flex items-center justify-between pt-1">
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

                                <button
                                  onClick={() => handleDeleteDeparture(dep.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                                  title="Eliminar Salida"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      upcomingExpeditions.map((exp) => {
                        const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                        
                        const cardTheme = 
                          exp.statusColor === 'emerald'
                            ? {
                                container: 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.04)]',
                                icon: 'bg-white text-emerald-800 border-emerald-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-emerald-100',
                                bar: 'bg-emerald-600',
                              }
                            : exp.statusColor === 'sky'
                            ? {
                                container: 'bg-sky-50/50 border-sky-200/90 hover:border-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.04)]',
                                icon: 'bg-white text-sky-800 border-sky-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-sky-100',
                                bar: 'bg-sky-600',
                              }
                            : {
                                container: 'bg-amber-50/50 border-amber-200/90 hover:border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.04)]',
                                icon: 'bg-white text-amber-800 border-amber-200/80 shadow-2xs',
                                inner: 'bg-white/80 border-amber-100',
                                bar: 'bg-amber-500',
                              };

                        return (
                          <div
                            key={exp.id}
                            className={`border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all duration-300 ${cardTheme.container}`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${cardTheme.icon}`}>
                                  <Ship className="w-5 h-5" />
                                </div>
                                <h4 className="font-serif font-bold text-lg text-[#0f2b48] tracking-tight">
                                  {exp.vesselName}
                                </h4>
                              </div>

                              <div className="space-y-3.5">
                                <div>
                                  <h5 className="font-serif font-bold text-base text-[#0f2b48] leading-snug">
                                    {exp.routeTitle}
                                  </h5>
                                </div>

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
                          <th className="px-6 py-3.5">Embarcación</th>
                          <th className="px-6 py-3.5">Ruta & Itinerario</th>
                          <th className="px-6 py-3.5">Fechas de Salida</th>
                          <th className="px-6 py-3.5">Ocupación / Cupos</th>
                          <th className="px-6 py-3.5">Tarifa p/Pax</th>
                          <th className="px-6 py-3.5">Estado de Zarpe</th>
                          <th className="px-6 py-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {departures.length > 0 ? (
                          departures.map((dep) => {
                            const route = expRoutes.find(r => r.id === dep.route_id);
                            const vessel = vessels.find(v => v.id === dep.vessel_id);
                            const bookedPax = (dep.total_slots || 10) - (dep.available_slots || 0);
                            const percent = Math.round((bookedPax / (dep.total_slots || 10)) * 100);

                            return (
                              <tr key={dep.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0f2b48]">
                                      <Ship className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0f2b48] font-serif font-bold text-sm block">
                                        {vessel?.name || 'Embarcación Yates Chile'}
                                      </strong>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {vessel?.type || 'Yate Oceánico'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <strong className="text-[#0f2b48] font-serif font-bold text-xs block">
                                      {route?.title || 'Ruta Juan Fernández'}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {route?.duration || '8 Días / 7 Noches'}
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
                                  <button
                                    onClick={() => handleDeleteDeparture(dep.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title="Eliminar Salida"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          upcomingExpeditions.map((exp) => {
                            const percent = Math.round((exp.bookedPax / exp.maxPax) * 100);
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0f2b48]">
                                      <Ship className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-[#0f2b48] font-serif font-bold text-sm block">
                                        {exp.vesselName}
                                      </strong>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {exp.vesselType}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <strong className="text-[#0f2b48] font-serif font-bold text-xs block">
                                      {exp.routeTitle}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {exp.departureDates}
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
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                                    {exp.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-slate-400 text-xs font-mono">—</span>
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
          {/* TAB: CRM DE CLIENTES & CONCIERGE (FICHAS DE CLIENTES) */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-7 animate-fadeIn">
              
              {/* 1. KPI CARDS DEL CRM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Clientes */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Total Clientes CRM
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      {crmClients.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                      Base unificada Lodge & Expediciones
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0f2b48]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Clientes VIP */}
                <div className="bg-white border border-amber-200/60 bg-gradient-to-br from-white to-amber-50/20 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono block">
                      Clientes VIP Gold
                    </span>
                    <span className="text-2xl font-mono font-bold text-amber-900 mt-1 block">
                      {crmClients.filter((c) => c.category === 'vip').length}
                    </span>
                    <span className="text-[10px] text-amber-700/80 font-medium mt-0.5 block">
                      Alta recurrencia & Chárter
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                {/* Valor Total Facturado (LTV) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      LTV Acumulado CRM
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      ${crmClients.reduce((acc, c) => acc + c.totalSpentClp, 0).toLocaleString('es-CL')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block font-mono">
                      CLP Facturado
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                {/* Conciliaciones Pendientes */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,43,72,0.02)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Transferencias Pendientes
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#0f2b48] mt-1 block">
                      {pendingApprovalsCount}
                    </span>
                    <button
                      onClick={() => setIsTransfersAccordionOpen(!isTransfersAccordionOpen)}
                      className="text-[10px] text-[#0f2b48] font-bold hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isTransfersAccordionOpen ? 'Ocultar mesa de pagos' : 'Ver mesa de pagos'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isTransfersAccordionOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0f2b48]">
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
                      <h4 className="font-serif text-sm font-bold text-[#0f2b48]">
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
                            <h5 className="font-serif text-xs font-bold text-[#0f2b48]">{inst.concept}</h5>
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
                
                {/* Header del Directorio: Buscador y Botón Circular + al extremo derecho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0f2b48] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[#0f2b48]" />
                      <span>Directorio de Clientes & Fichas Individuales</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Selecciona cualquier cliente para ver su ficha completa, historial de reservas, preferencias y bitácora.
                    </p>
                  </div>

                  {/* Search input + Circular + Button on the far right */}
                  <div className="flex items-center gap-3">
                    <div className="relative min-w-[240px] sm:min-w-[280px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, RUT, email..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full bg-[#fbfcfd] border border-slate-200/80 rounded-full pl-9 pr-8 py-2 text-xs text-[#0f2b48] placeholder:text-slate-400 focus:border-[#0f2b48] focus:bg-white focus:outline-none transition"
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

                {/* Grid de Fichas de Clientes */}
                {filteredCustomers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <User className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">No se encontraron clientes con los filtros seleccionados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredCustomers.map((cust) => {
                      const custLodge = getCustomerLodgeBookings(cust);
                      const custExp = getCustomerExpBookings(cust);
                      const totalBookings = cust.bookingsCount || (custLodge.length + custExp.length);

                      return (
                        <div
                          key={cust.id}
                          className="bg-white border border-slate-200/80 hover:border-[#0f2b48]/40 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(15,43,72,0.06)] transition-all duration-300 flex flex-col justify-between space-y-5 group"
                        >
                          {/* Top: Monogram Avatar, Name, Location & Status */}
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-sm tracking-wider shadow-2xs shrink-0 ${
                                    cust.category === 'vip'
                                      ? 'bg-[#0f2b48] text-amber-300 border border-amber-400/30'
                                      : 'bg-slate-100 text-[#0f2b48] border border-slate-200'
                                  }`}
                                >
                                  {cust.fullName
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join('')}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-serif text-base font-bold text-[#0f2b48] leading-snug group-hover:text-sky-700 transition truncate">
                                    {cust.fullName}
                                  </h4>
                                  <div className="text-xs text-slate-500 font-light mt-0.5 truncate">
                                    {cust.city} • <span className="font-mono text-slate-400 text-[11px]">{cust.rutOrPassport}</span>
                                  </div>
                                </div>
                              </div>

                              {cust.category === 'vip' && (
                                <span className="bg-[#fef9ee] text-[#926c15] border border-[#f3e5b8] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 font-mono">
                                  VIP Gold
                                </span>
                              )}
                            </div>

                            {/* Clean Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {cust.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-50 text-slate-600 border border-slate-200/70 text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                                >
                                  {tag.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}
                                </span>
                              ))}
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

                          {/* Card Footer: Quick Contact Actions + Main Dossier Button */}
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <a
                              href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hola estimado/a ${cust.fullName}, le contactamos desde Yates Chile & Lodge Rincón de Navegantes.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                              title="Contactar por WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                            <a
                              href={`mailto:${cust.email}?subject=${encodeURIComponent('Atención Concierge — Yates Chile')}`}
                              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                              title="Enviar Correo Electrónico"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomerDossierTab('profile');
                              }}
                              className="flex-1 bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Ver Ficha de Cliente</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
      {/* MODAL: BLOQUEAR HABITACIÓN (LUXURY LIGHT/NAVY THEME) */}
      {/* ========================================================================= */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-[#0a1e34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,43,72,0.15)] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                  Lodge Rincón de Navegantes
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0f2b48]">Bloquear Fechas</h4>
              </div>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-slate-400 hover:text-[#0f2b48] transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* BOTÓN SUPERIOR DE BLOQUEO RÁPIDO AIRBNB */}
            <div className="bg-[#FF385C]/5 border border-[#FF385C]/20 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FF385C] flex items-center justify-center text-white shadow-xs shrink-0">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 32 32">
                      <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.315 7.1 14.733 1.364 3.376.671 7.151-1.745 9.507-2.146 2.091-5.118 2.809-7.989 1.944l-.65-.214c-1.332-.477-2.613-1.428-4-2.883-1.387 1.455-2.668 2.406-4 2.883l-.65.214c-2.871.865-5.843.147-7.989-1.944-2.416-2.356-3.109-6.131-1.745-9.507.986-2.418 5.146-10.903 7.1-14.733l.533-1.025C9.237 1.963 10.692 1 12.7 1h3.3zm0 2.667h-3.3c-1.127 0-2.029.569-2.996 2.373l-.53 1.02C7.26 10.776 3.167 19.123 2.298 21.272c-.895 2.215-.417 4.717 1.202 6.294 1.493 1.455 3.593 1.941 5.617 1.33l.564-.188c1.397-.502 2.871-1.724 4.319-3.523.58-.722 1.353-1.185 2-1.185s1.42.463 2 1.185c1.448 1.799 2.922 3.021 4.319 3.523l.564.188c2.024.611 4.124.125 5.617-1.33 1.619-1.577 2.097-4.079 1.202-6.294-.869-2.149-4.962-10.496-6.876-14.212l-.53-1.02c-.967-1.804-1.869-2.373-2.996-2.373H16z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#FF385C] text-xs leading-none">Reserva desde Airbnb</h5>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5">Sincroniza y bloquea el día seleccionado</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAirbnbBlock}
                className="w-full bg-[#FF385C] hover:bg-[#E00B41] active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-[#FF385C]/20 cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 32 32">
                  <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.315 7.1 14.733 1.364 3.376.671 7.151-1.745 9.507-2.146 2.091-5.118 2.809-7.989 1.944l-.65-.214c-1.332-.477-2.613-1.428-4-2.883-1.387 1.455-2.668 2.406-4 2.883l-.65.214c-2.871.865-5.843.147-7.989-1.944-2.416-2.356-3.109-6.131-1.745-9.507.986-2.418 5.146-10.903 7.1-14.733l.533-1.025C9.237 1.963 10.692 1 12.7 1h3.3zm0 2.667h-3.3c-1.127 0-2.029.569-2.996 2.373l-.53 1.02C7.26 10.776 3.167 19.123 2.298 21.272c-.895 2.215-.417 4.717 1.202 6.294 1.493 1.455 3.593 1.941 5.617 1.33l.564-.188c1.397-.502 2.871-1.724 4.319-3.523.58-.722 1.353-1.185 2-1.185s1.42.463 2 1.185c1.448 1.799 2.922 3.021 4.319 3.523l.564.188c2.024.611 4.124.125 5.617-1.33 1.619-1.577 2.097-4.079 1.202-6.294-.869-2.149-4.962-10.496-6.876-14.212l-.53-1.02c-.967-1.804-1.869-2.373-2.996-2.373H16z" />
                </svg>
                <span>Bloquear como Reserva Airbnb</span>
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              {/* SELECTOR PERSONALIZADO DE HABITACIÓN */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                  Selecciona la Habitación
                </label>
                {(() => {
                  const selectedRoom = rooms.find((r) => r.id === blockForm.roomId);
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsBlockRoomDropdownOpen(!isBlockRoomDropdownOpen)}
                        className="w-full bg-[#fbfcfd] hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-medium flex items-center justify-between transition shadow-2xs cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#0f2b48]/5 border border-[#0f2b48]/10 flex items-center justify-center text-[#0f2b48] shrink-0">
                            <BedDouble className="w-3.5 h-3.5" />
                          </div>
                          {selectedRoom ? (
                            <span className="font-semibold text-xs text-[#0f2b48] truncate">
                              Habitación #{selectedRoom.room_number} - {selectedRoom.room_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-normal">
                              Seleccione Habitación...
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                            isBlockRoomDropdownOpen ? 'rotate-180 text-[#0f2b48]' : ''
                          }`}
                        />
                      </button>

                      {/* POPUP DE OPCIONES PERSONALIZADO */}
                      {isBlockRoomDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsBlockRoomDropdownOpen(false)} 
                          />
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-[0_12px_36px_rgba(15,43,72,0.18)] p-1.5 z-50 space-y-1 animate-scale-in max-h-60 overflow-y-auto">
                            {rooms.map((r) => {
                              const isSelected = blockForm.roomId === r.id;
                              return (
                                <div
                                  key={r.id}
                                  onClick={() => {
                                    setBlockForm({ ...blockForm, roomId: r.id });
                                    setIsBlockRoomDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#0f2b48] text-white shadow-xs'
                                      : 'hover:bg-slate-50 text-slate-700 hover:text-[#0f2b48]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-100 text-[#0f2b48]'
                                      }`}
                                    >
                                      <BedDouble className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className={`block text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold text-[#0f2b48]'}`}>
                                        Habitación #{r.room_number} - {r.room_name}
                                      </span>
                                      <span className={`block text-[10px] font-mono ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                                        Hasta {r.max_pax} huéspedes • ${r.base_price_clp.toLocaleString('es-CL')}/noche
                                      </span>
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <Check className="w-4 h-4 text-sky-300 shrink-0 ml-2" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Check-in</label>
                  <input
                    type="date"
                    value={blockForm.checkIn}
                    onChange={(e) => setBlockForm({ ...blockForm, checkIn: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Check-out</label>
                  <input
                    type="date"
                    value={blockForm.checkOut}
                    onChange={(e) => setBlockForm({ ...blockForm, checkOut: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                  Motivo / Detalle del Bloqueo Manual
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mantenimiento programado, veda o reserva telefónica"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
                >
                  Confirmar Bloqueo
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
      {/* MODAL: PROGRAMAR NUEVA SALIDA DE EXPEDICIÓN */}
      {showNewDepartureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#0f2b48]/70 font-bold block">
                  Flota & Rutas Náuticas
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0f2b48]">Programar Salida de Expedición</h4>
              </div>
              <button
                onClick={() => setShowNewDepartureModal(false)}
                className="text-slate-400 hover:text-[#0f2b48] transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeparture} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                    Embarcación
                  </label>
                  <select
                    value={newDepartureForm.vesselId}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, vesselId: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:outline-none"
                    required
                  >
                    <option value="">Seleccione barco...</option>
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                    {vessels.length === 0 && (
                      <>
                        <option value="vegvisir">Catamarán Vegvisir (45ft)</option>
                        <option value="terranova">Monocasco Terranova (52ft)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                    Ruta / Itinerario
                  </label>
                  <select
                    value={newDepartureForm.routeId}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, routeId: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:outline-none"
                    required
                  >
                    <option value="">Seleccione ruta...</option>
                    {expRoutes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                    {expRoutes.length === 0 && (
                      <>
                        <option value="juan-fernandez">Archipiélago Juan Fernández (8 Días)</option>
                        <option value="rapa-nui">Travesía Polinesia Rapa Nui (14 Días)</option>
                        <option value="fiordos-patagonia">Fiordos & Glaciares Patagónicos (10 Días)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Fecha de Zarpe</label>
                  <input
                    type="date"
                    value={newDepartureForm.departureDate}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, departureDate: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Fecha de Retorno</label>
                  <input
                    type="date"
                    value={newDepartureForm.returnDate}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, returnDate: e.target.value })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Cupos Totales (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newDepartureForm.totalSlots}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, totalSlots: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Estado de Salida</label>
                  <select
                    value={newDepartureForm.status}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, status: e.target.value as any })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-medium focus:border-[#0f2b48] focus:outline-none"
                  >
                    <option value="scheduled">Programada (Abierta a cupos)</option>
                    <option value="guaranteed">Zarpe Garantizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Precio / Pasajero (CLP)</label>
                  <input
                    type="number"
                    value={newDepartureForm.pricePerPaxClp}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, pricePerPaxClp: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">Precio Chárter Full (CLP)</label>
                  <input
                    type="number"
                    value={newDepartureForm.priceCharterFullClp}
                    onChange={(e) => setNewDepartureForm({ ...newDepartureForm, priceCharterFullClp: Number(e.target.value) })}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewDepartureModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#0f2b48] hover:bg-[#0a1e34] text-white py-3 rounded-xl font-bold transition shadow-md shadow-[#0f2b48]/20 cursor-pointer"
                >
                  Guardar & Publicar Salida
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

      {/* 8. WIZARD MODAL DE NUEVA RESERVA GUIADA EN 6 PASOS */}
      {showBookingWizardModal && (
        <BookingWizardModal
          isOpen={showBookingWizardModal}
          onClose={() => setShowBookingWizardModal(false)}
          onConfirmBooking={handleConfirmBookingWizard}
        />
      )}
    </div>
  );
};
