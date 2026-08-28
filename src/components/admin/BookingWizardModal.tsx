import React, { useState, useMemo, useEffect } from 'react';
import {
  XCircle,
  Ship,
  BedDouble,
  Plane,
  Compass,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Percent,
  Sparkles,
  ShieldCheck,
  Sailboat,
  AlertCircle,
  Check,
  Clock
} from 'lucide-react';
import { useLodge } from '../../hooks/useLodge';
import { formatPhone, formatRut } from '../../lib/formatters';

export interface BookingWizardData {
  bookingCode: string;
  categories: string[];
  selectedPrograms: {
    id: string;
    title: string;
    categoryLabel: string;
    priceClp: number;
    unitType: 'pax' | 'fixed' | 'night';
  }[];
  startDate: string;
  endDate: string;
  durationNights: number;
  passengersCount: number;
  passengers: {
    fullName: string;
    rutOrPassport: string;
    birthDate?: string;
    email: string;
    phone: string;
    nationality: string;
    dietaryPreferences?: string;
    notes?: string;
  }[];
  paymentMethod: 'transfer' | 'credit_card' | 'cash' | 'airbnb' | 'invoice';
  discountType: 'none' | 'percent' | 'amount';
  discountValue: number;
  installmentsCount: number;
  specialNotes?: string;
  totalAmountClp: number;
}

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (data: BookingWizardData) => void;
  departures?: any[];
  rooms?: any[];
}

// PROGRAM CATALOG WITH INCLUDED ASSETS TAGS
export const ASSET_META: Record<string, { label: string; icon: any; color: string }> = {
  vegvisir: { label: 'Velero Vegvisir', icon: Sailboat, color: 'bg-sky-50 text-sky-800 border-sky-200' },
  terranova: { label: 'Yate Terranova', icon: Ship, color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  lodge: { label: 'Lodge Rincón', icon: BedDouble, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  servicios: { label: 'Excursiones', icon: Compass, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  aeronave: { label: 'Aeronave / Vuelo', icon: Plane, color: 'bg-purple-50 text-purple-800 border-purple-200' },
};

const CATALOG_PROGRAMS = [
  // ----------------------------------------------------
  // PAQUETES COMBINADOS (MÚLTIPLES ACTIVOS SIMULTÁNEOS)
  // ----------------------------------------------------
  {
    id: 'prog-combo-veg-lodge',
    title: 'Paquete Mar & Refugio: Expedición Velero Vegvisir + Estadía en Lodge Rincón',
    category: 'combo',
    categoryLabel: 'Paquete Combinado (Velero + Lodge)',
    includedAssets: ['vegvisir', 'lodge'],
    duration: '8 Días / 7 Noches',
    priceClp: 2450000,
    unitType: 'pax' as const,
    description: 'Navegación oceánica a vela por el archipiélago y descanso en cabinas privadas frente al mar con pensión completa.',
    paxLimit: 6,
  },
  {
    id: 'prog-combo-terra-lodge',
    title: 'Travesía Alejandro Selkirk en Yate Terranova + Estadía en Lodge Rincón',
    category: 'combo',
    categoryLabel: 'Paquete Combinado (Terranova + Lodge)',
    includedAssets: ['terranova', 'lodge'],
    duration: '9 Días / 8 Noches',
    priceClp: 2750000,
    unitType: 'pax' as const,
    description: 'Expedición en yate motorizado de 60 ft hacia Isla Más Afuera combinado con hospedaje de lujo en Bahía Cumberland.',
    paxLimit: 8,
  },
  {
    id: 'prog-combo-lodge-serv',
    title: 'Pack Aventura Terrestre & Submarina: Lodge Rincón + Buceo & Cabalgatas',
    category: 'combo',
    categoryLabel: 'Paquete Combinado (Lodge + Excursiones)',
    includedAssets: ['lodge', 'servicios'],
    duration: '5 Días / 4 Noches',
    priceClp: 980000,
    unitType: 'pax' as const,
    description: 'Hospedaje en Lodge Rincón de Navegantes con salidas de buceo con lobos marinos y cabalgatas a los miradores.',
    paxLimit: 8,
  },
  {
    id: 'prog-combo-veg-serv',
    title: 'Expedición Náutica a Vela Vegvisir + Jornadas de Buceo & Pesca de Altura',
    category: 'combo',
    categoryLabel: 'Paquete Combinado (Velero + Excursiones)',
    includedAssets: ['vegvisir', 'servicios'],
    duration: '7 Días / 6 Noches',
    priceClp: 1950000,
    unitType: 'pax' as const,
    description: 'Travesía a bordo del catamarán Vegvisir con inmersiones de buceo PADI y expedición marina guiada.',
    paxLimit: 6,
  },
  {
    id: 'prog-combo-veg-lodge-aero',
    title: 'Paquete All-Inclusive: Vuelo Regular Santiago ⇄ Isla + Velero Vegvisir + Lodge Rincón',
    category: 'combo',
    categoryLabel: 'Paquete Integral (Vuelo + Velero + Lodge)',
    includedAssets: ['vegvisir', 'lodge', 'aeronave'],
    duration: '8 Días / 7 Noches',
    priceClp: 3150000,
    unitType: 'pax' as const,
    description: 'Experiencia completa que cubre traslados aéreos ida y vuelta, expedición náutica a vela y noches en el Lodge.',
    paxLimit: 6,
  },
  {
    id: 'prog-combo-terra-lodge-aero',
    title: 'Gran Expedición VIP: Vuelo Privado King Air + Yate Terranova + Lodge Rincón',
    category: 'combo',
    categoryLabel: 'Paquete Integral (Vuelo + Terranova + Lodge)',
    includedAssets: ['terranova', 'lodge', 'aeronave'],
    duration: '9 Días / 8 Noches',
    priceClp: 3600000,
    unitType: 'pax' as const,
    description: 'Chárter aéreo ejecutivo privado, navegación en yate de 60 ft y hospedaje exclusivo con chef privado.',
    paxLimit: 8,
  },
  {
    id: 'prog-combo-full-360',
    title: 'Experiencia Máxima Robinson Crusoe 360° (Vuelo + Velero + Lodge + Excursiones)',
    category: 'combo',
    categoryLabel: 'Paquete Total 360°',
    includedAssets: ['vegvisir', 'lodge', 'servicios', 'aeronave'],
    duration: '8 Días / 7 Noches',
    priceClp: 3650000,
    unitType: 'pax' as const,
    description: 'Paquete todo incluido con vuelos, expedición a vela Vegvisir, descanso en Lodge Rincón y todas las excursiones guiadas.',
    paxLimit: 6,
  },
  {
    id: 'prog-combo-terra-full-360',
    title: 'Experiencia Gran Oceánica Terranova 360° (Vuelo + Yate Terranova + Lodge + Excursiones)',
    category: 'combo',
    categoryLabel: 'Paquete Total 360°',
    includedAssets: ['terranova', 'lodge', 'servicios', 'aeronave'],
    duration: '9 Días / 8 Noches',
    priceClp: 3950000,
    unitType: 'pax' as const,
    description: 'El paquete más exclusivo del archipiélago: vuelo directo, crucero de expedición en Terranova, Lodge y gastronomía de autor.',
    paxLimit: 8,
  },

  // ----------------------------------------------------
  // OPCIONES INDIVIDUALES (UN SOLO ACTIVO)
  // ----------------------------------------------------
  // VEGVISIR SOLO
  {
    id: 'prog-veg-1',
    title: 'Expedición Selkirk & Robinson Crusoe (Velero Vegvisir)',
    category: 'vegvisir',
    categoryLabel: 'Velero Vegvisir',
    includedAssets: ['vegvisir'],
    duration: '7 Días / 6 Noches',
    priceClp: 1850000,
    unitType: 'pax' as const,
    description: 'Navegación a vela por el archipiélago histórico con avistamiento y trekking.',
    paxLimit: 6,
  },
  {
    id: 'prog-veg-2',
    title: 'Vuelta al Archipiélago & Buceo con Lobos (Velero Vegvisir)',
    category: 'vegvisir',
    categoryLabel: 'Velero Vegvisir',
    includedAssets: ['vegvisir'],
    duration: '7 Días / 6 Noches',
    priceClp: 1750000,
    unitType: 'pax' as const,
    description: 'Inmersiones en aguas cristalinas y circunnavegación de Santa Clara.',
    paxLimit: 6,
  },
  {
    id: 'prog-veg-3',
    title: 'Chárter Exclusivo Privado Velero Vegvisir',
    category: 'vegvisir',
    categoryLabel: 'Velero Vegvisir',
    includedAssets: ['vegvisir'],
    duration: '7 Días / 6 Noches',
    priceClp: 11000000,
    unitType: 'fixed' as const,
    description: 'Barco completo con patrón y chef privado para hasta 6 navegantes.',
    paxLimit: 6,
  },

  // TERRANOVA SOLO
  {
    id: 'prog-terra-1',
    title: 'Travesía Alejandro Selkirk Extremo (Yate Terranova)',
    category: 'terranova',
    categoryLabel: 'Yate Terranova',
    includedAssets: ['terranova'],
    duration: '8 Días / 7 Noches',
    priceClp: 2100000,
    unitType: 'pax' as const,
    description: 'Navegación oceánica de alto confort hacia la remota Isla Más Afuera.',
    paxLimit: 8,
  },
  {
    id: 'prog-terra-2',
    title: 'Chárter Ejecutivo Oceánico Yate Terranova',
    category: 'terranova',
    categoryLabel: 'Yate Terranova',
    includedAssets: ['terranova'],
    duration: '8 Días / 7 Noches',
    priceClp: 14500000,
    unitType: 'fixed' as const,
    description: 'Yate oceánico exclusivo de 60 pies para grupos privados de hasta 8 personas.',
    paxLimit: 8,
  },

  // LODGE SOLO
  {
    id: 'prog-lodge-1',
    title: 'Habitación Albatros #1 (Doble Matrimonial, Máx 2 Pax) — Lodge Rincón',
    category: 'lodge',
    categoryLabel: 'Lodge Rincón',
    includedAssets: ['lodge'],
    duration: 'Por noche',
    priceClp: 210000,
    unitType: 'night' as const,
    description: 'Suite íntima con cama matrimonial frente al mar en Bahía Cumberland, baño privado y terraza.',
    paxLimit: 2,
  },
  {
    id: 'prog-lodge-2',
    title: 'Habitación Cumberland #2 (Triple Vista Océano, Máx 3 Pax) — Lodge Rincón',
    category: 'lodge',
    categoryLabel: 'Lodge Rincón',
    includedAssets: ['lodge'],
    duration: 'Por noche',
    priceClp: 240000,
    unitType: 'night' as const,
    description: 'Habitación panorámica con vista al mar, baño privado y chimenea a leña.',
    paxLimit: 3,
  },
  {
    id: 'prog-lodge-3',
    title: 'Habitación Selkirk #3 (Triple Vista Océano, Máx 3 Pax) — Lodge Rincón',
    category: 'lodge',
    categoryLabel: 'Lodge Rincón',
    includedAssets: ['lodge'],
    duration: 'Por noche',
    priceClp: 240000,
    unitType: 'night' as const,
    description: 'Espaciosa habitación con baño privado y vistas a los farellones y al mar.',
    paxLimit: 3,
  },
  {
    id: 'prog-lodge-4',
    title: 'Habitación Vidriola #4 (Triple Vista Océano, Máx 3 Pax) — Lodge Rincón',
    category: 'lodge',
    categoryLabel: 'Lodge Rincón',
    includedAssets: ['lodge'],
    duration: 'Por noche',
    priceClp: 240000,
    unitType: 'night' as const,
    description: 'Cómoda habitación triple con baño en suite y vista privilegiada al horizonte.',
    paxLimit: 3,
  },

  // SERVICIOS SOLO
  {
    id: 'prog-serv-1',
    title: 'Expedición de Buceo con Lobos Marinos de Dos Pelos',
    category: 'servicios',
    categoryLabel: 'Servicios & Excursiones',
    includedAssets: ['servicios'],
    duration: '4 horas',
    priceClp: 120000,
    unitType: 'pax' as const,
    description: 'Incluye equipo completo, lancha de apoyo y guía biólogo marino.',
    paxLimit: 6,
  },
  {
    id: 'prog-serv-2',
    title: 'Cabalgata al Mirador de Selkirk & Cerro Pascua',
    category: 'servicios',
    categoryLabel: 'Servicios & Excursiones',
    includedAssets: ['servicios'],
    duration: '5 horas',
    priceClp: 65000,
    unitType: 'pax' as const,
    description: 'Ruta ecuestre por los senderos de bosque nativo y miradores oceánicos.',
    paxLimit: 8,
  },
  {
    id: 'prog-serv-3',
    title: 'Degustación Gastronómica de Langosta de Juan Fernández',
    category: 'servicios',
    categoryLabel: 'Servicios & Excursiones',
    includedAssets: ['servicios'],
    duration: 'Cena / Almuerzo',
    priceClp: 85000,
    unitType: 'pax' as const,
    description: 'Menú maridado con vinos chilenos de alta gama en el comedor del Lodge.',
    paxLimit: 12,
  },

  // AERONAVE SOLO
  {
    id: 'prog-aero-1',
    title: 'Vuelo Regular Santiago (SCL) ⇄ Juan Fernández (SCIR)',
    category: 'aeronave',
    categoryLabel: 'Aeronave & Vuelos',
    includedAssets: ['aeronave'],
    duration: '2.5 hrs por tramo',
    priceClp: 650000,
    unitType: 'pax' as const,
    description: 'Pasaje aéreo ida y vuelta con 15kg de equipaje por pasajero.',
    paxLimit: 9,
  },
  {
    id: 'prog-aero-2',
    title: 'Vuelo Charter Privado Ejecutivo King Air B200',
    category: 'aeronave',
    categoryLabel: 'Aeronave & Vuelos',
    includedAssets: ['aeronave'],
    duration: '2 hrs por tramo',
    priceClp: 4800000,
    unitType: 'fixed' as const,
    description: 'Aeronave biturbina presurizada exclusiva para itinerarios a medida.',
    paxLimit: 7,
  },
];

export interface ProgramDeparture {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  durationLabel: string;
  status: 'confirmada' | 'abierta' | 'ultimos_cupos';
  availableSlots: number;
}

const DEFAULT_PROGRAM_DEPARTURES: ProgramDeparture[] = [
  {
    id: 'dep-oct-1',
    startDate: '2026-10-15',
    endDate: '2026-10-22',
    label: '15 Octubre — 22 Octubre 2026',
    durationLabel: '8 Días / 7 Noches',
    status: 'confirmada',
    availableSlots: 4,
  },
  {
    id: 'dep-nov-1',
    startDate: '2026-11-05',
    endDate: '2026-11-12',
    label: '05 Noviembre — 12 Noviembre 2026',
    durationLabel: '8 Días / 7 Noches',
    status: 'confirmada',
    availableSlots: 6,
  },
  {
    id: 'dep-nov-2',
    startDate: '2026-11-20',
    endDate: '2026-11-27',
    label: '20 Noviembre — 27 Noviembre 2026',
    durationLabel: '8 Días / 7 Noches',
    status: 'ultimos_cupos',
    availableSlots: 2,
  },
  {
    id: 'dep-dic-1',
    startDate: '2026-12-10',
    endDate: '2026-12-17',
    label: '10 Diciembre — 17 Diciembre 2026',
    durationLabel: '8 Días / 7 Noches',
    status: 'abierta',
    availableSlots: 8,
  },
  {
    id: 'dep-ene-1',
    startDate: '2027-01-08',
    endDate: '2027-01-15',
    label: '08 Enero — 15 Enero 2027',
    durationLabel: '8 Días / 7 Noches',
    status: 'abierta',
    availableSlots: 6,
  },
  {
    id: 'dep-feb-1',
    startDate: '2027-02-05',
    endDate: '2027-02-12',
    label: '05 Febrero — 12 Febrero 2027',
    durationLabel: '8 Días / 7 Noches',
    status: 'abierta',
    availableSlots: 6,
  },
];

// Helper to guarantee Chilean Date format DD/MM/YYYY
export const formatDateDDMMYYYY = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const cleanStr = String(dateStr).split('T')[0].trim();
  if (cleanStr.includes('/')) return cleanStr;
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  return cleanStr;
};

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  onConfirmBooking,
  departures = [],
  rooms = [],
}) => {
  // Main Modality: 'expedition' | 'lodge' | 'custom'
  const [mainModality, setMainModality] = useState<'expedition' | 'lodge' | 'custom' | null>(null);

  // Month filter for expeditions in Step 2
  const [expeditionMonthFilter, setExpeditionMonthFilter] = useState<string>('all');

  // Step state (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 2: Selected Program IDs
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);

  // Step 3: Dates & Selected Departure ID
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Step 4: Passengers
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [passengers, setPassengers] = useState<
    {
      fullName: string;
      rutOrPassport: string;
      birthDate: string;
      email: string;
      phone: string;
      nationality: string;
      dietaryPreferences: string;
      notes: string;
    }[]
  >([
    {
      fullName: '',
      rutOrPassport: '',
      birthDate: '',
      email: '',
      phone: '',
      nationality: 'Chilena',
      dietaryPreferences: '',
      notes: '',
    },
  ]);

  // Step 5: Payment & Installments
  const paymentMethod: 'transfer' | 'credit_card' | 'cash' | 'airbnb' | 'invoice' = 'transfer';
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'amount'>('none');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Custom In-App Notification State
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, title = 'Atención Requerida', type: 'warning' | 'error' | 'info' = 'warning') => {
    setNotification({ title, message, type });
  };

  // Reset wizard whenever modal opens so nothing is preselected
  useEffect(() => {
    if (isOpen) {
      setMainModality(null);
      setExpeditionMonthFilter('all');
      setCurrentStep(1);
      setSelectedCategories([]);
      setSelectedProgramIds([]);
      setSelectedDepartureId('');
      setStartDate('');
      setEndDate('');
      setPassengersCount(1);
      setPassengers([
        {
          fullName: '',
          rutOrPassport: '',
          birthDate: '',
          email: '',
          phone: '',
          nationality: 'Chilena',
          dietaryPreferences: '',
          notes: '',
        },
      ]);
      setDiscountType('none');
      setDiscountPercent(0);
      setDiscountAmount(0);
      setInstallmentsCount(2);
      setSpecialNotes('');
      setNotification(null);
    }
  }, [isOpen]);

  // Toggle category in Step 1 (for Custom Mode)
  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Helper booleans for dynamic wizard mode
  const isOnlyLodge = mainModality === 'lodge' || (selectedCategories.length === 1 && selectedCategories[0] === 'lodge');
  const isExpedition = mainModality === 'expedition';
  const { isRoomBookedForRange } = useLodge();

  const getRoomIdFromProgId = (progId: string): string => {
    if (progId === 'prog-lodge-1' || progId.toLowerCase().includes('albatros') || progId.toLowerCase().includes('room-1')) return 'room-1';
    if (progId === 'prog-lodge-2' || progId.toLowerCase().includes('cumberland') || progId.toLowerCase().includes('room-2')) return 'room-2';
    if (progId === 'prog-lodge-3' || progId.toLowerCase().includes('selkirk') || progId.toLowerCase().includes('room-3')) return 'room-3';
    if (progId === 'prog-lodge-4' || progId.toLowerCase().includes('vidriola') || progId.toLowerCase().includes('room-4')) return 'room-4';
    return progId;
  };

  // Dynamic Programs List based on Main Modality or Custom Asset Scope
  const availablePrograms = useMemo(() => {
    // 1. Expedición Náutica: created departures + catalog expeditions
    if (mainModality === 'expedition') {
      if (departures && departures.length > 0) {
        return departures.map((d: any) => {
          const numPrice = typeof d.pricePerPax === 'number'
            ? d.pricePerPax
            : parseInt(String(d.pricePerPax || '').replace(/[^0-9]/g, ''), 10) || 1950000;
          const vName = d.vessel?.name || (d.vessel_id?.toLowerCase().includes('terranova') ? 'Yate Terranova' : 'Velero Vegvisir');
          const isVegvisir = vName.toLowerCase().includes('vegvisir');

          return {
            id: d.id,
            title: d.routeTitle || d.name || 'Expedición Archipiélago Juan Fernández',
            category: isVegvisir ? 'vegvisir' : 'terranova',
            categoryLabel: vName,
            includedAssets: isVegvisir ? ['vegvisir'] : ['terranova'],
            duration: d.departure_date && d.return_date ? `${formatDateDDMMYYYY(d.departure_date)} ➔ ${formatDateDDMMYYYY(d.return_date)}` : '7 Días / 6 Noches',
            priceClp: numPrice,
            unitType: 'pax' as const,
            description: `${vName} • ${d.availablePax ?? 6} cupos disponibles de ${d.maxPax ?? 6} PAX.`,
            paxLimit: d.maxPax ?? 6,
            departureDate: d.departure_date,
            returnDate: d.return_date,
          };
        });
      }
      return CATALOG_PROGRAMS.filter((p) => p.includedAssets.includes('vegvisir') || p.includedAssets.includes('terranova'));
    }

    // 2. Lodge Rincón: configured rooms
    if (mainModality === 'lodge') {
      if (rooms && rooms.length > 0) {
        return rooms.map((r: any) => {
          const numPrice = typeof r.price_per_night === 'number'
            ? r.price_per_night
            : parseInt(String(r.price_per_night || '').replace(/[^0-9]/g, ''), 10) || 240000;
          return {
            id: r.id,
            title: `Habitación ${r.room_name} (${r.room_type || 'Vista Océano'}) — Lodge Rincón`,
            category: 'lodge',
            categoryLabel: 'Lodge Rincón',
            includedAssets: ['lodge'],
            duration: 'Por noche',
            priceClp: numPrice,
            unitType: 'night' as const,
            description: `Cabina frente al mar • Capacidad máx: ${r.capacity || 3} Huéspedes • Baño en suite y terraza panorámica.`,
            paxLimit: r.capacity || 3,
          };
        });
      }
      return CATALOG_PROGRAMS.filter((p) => p.includedAssets.includes('lodge') && p.includedAssets.length === 1);
    }

    // 3. Custom Mode: match selected categories
    if (selectedCategories.length === 0) return [];

    return CATALOG_PROGRAMS.filter((prog) => {
      const matchesAll = selectedCategories.every((catId) => prog.includedAssets.includes(catId));
      if (!matchesAll) return false;

      if (selectedCategories.length === 1) {
        return prog.includedAssets.length === 1 && prog.includedAssets[0] === selectedCategories[0];
      }

      return true;
    });
  }, [mainModality, departures, rooms, selectedCategories]);

  // Compute available months for expeditions in Step 2
  const availableExpeditionMonths = useMemo(() => {
    if (mainModality !== 'expedition') return [];
    const monthMap = new Map<string, string>();

    availablePrograms.forEach((p: any) => {
      if (p.departureDate) {
        const cleanDate = String(p.departureDate).split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length >= 2) {
          const key = `${parts[0]}-${parts[1]}`;
          const year = parseInt(parts[0], 10);
          const monthIndex = parseInt(parts[1], 10) - 1;
          const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          const monthName = monthNames[monthIndex] || `Mes ${parts[1]}`;
          monthMap.set(key, `${monthName} ${year}`);
        }
      }
    });

    return Array.from(monthMap.entries()).map(([key, label]) => ({ key, label }));
  }, [mainModality, availablePrograms]);

  // Filter displayed programs in Step 2 based on selected month
  const displayedProgramsInStep2 = useMemo(() => {
    if (mainModality !== 'expedition' || expeditionMonthFilter === 'all') {
      return availablePrograms;
    }
    return availablePrograms.filter((p: any) => {
      if (!p.departureDate) return true;
      const cleanDate = String(p.departureDate).split('T')[0];
      return cleanDate.startsWith(expeditionMonthFilter);
    });
  }, [mainModality, expeditionMonthFilter, availablePrograms]);

  // Single selection of program in Step 2 (Radio behavior: only 1 package at a time)
  const selectProgram = (progId: string, autoAdvance = true) => {
    setSelectedProgramIds([progId]);
    const found = availablePrograms.find((p) => p.id === progId);
    if (found && (found as any).departureDate && (found as any).returnDate) {
      setStartDate((found as any).departureDate);
      setEndDate((found as any).returnDate);
      setSelectedDepartureId(found.id);
    }
    if (autoAdvance) {
      setTimeout(() => {
        setCurrentStep(3);
      }, 150);
    }
  };

  // Selected program data
  const selectedProgramsData = useMemo(() => {
    return availablePrograms.filter((p) => selectedProgramIds.includes(p.id));
  }, [availablePrograms, selectedProgramIds]);

  const activeSelectedProgram = selectedProgramsData[0] || availablePrograms[0] || CATALOG_PROGRAMS[0];

  // Check if currently active selected lodge room is booked for the date range
  const isSelectedLodgeRoomBooked = useMemo(() => {
    if (!isOnlyLodge || !startDate || !endDate) return false;
    const targetRoomId = getRoomIdFromProgId(activeSelectedProgram?.id || '');
    if (!targetRoomId) return false;
    return isRoomBookedForRange(targetRoomId, startDate, endDate);
  }, [isOnlyLodge, startDate, endDate, activeSelectedProgram, isRoomBookedForRange]);

  // Sync selectedProgramIds when availablePrograms change
  useEffect(() => {
    if (availablePrograms.length > 0) {
      const hasValidSelection = selectedProgramIds.some((id) =>
        availablePrograms.some((p) => p.id === id)
      );
      if (!hasValidSelection) {
        setSelectedProgramIds([availablePrograms[0].id]);
        const first = availablePrograms[0] as any;
        if (first && first.departureDate && first.returnDate) {
          setStartDate(first.departureDate);
          setEndDate(first.returnDate);
          setSelectedDepartureId(first.id);
        }
      }
    } else {
      setSelectedProgramIds([]);
    }
  }, [availablePrograms]);

  // Pre-fill default dates for Lodge when entering Step 3
  useEffect(() => {
    if (isOnlyLodge && currentStep === 3 && !startDate) {
      const todayObj = new Date();
      const startStr = todayObj.toISOString().split('T')[0];
      const endObj = new Date();
      endObj.setDate(endObj.getDate() + 2);
      const endStr = endObj.toISOString().split('T')[0];
      setStartDate(startStr);
      setEndDate(endStr);
    }
  }, [isOnlyLodge, currentStep, startDate]);

  // Select departure handler in Step 3
  const handleSelectDeparture = (dep: ProgramDeparture) => {
    setSelectedDepartureId(dep.id);
    setStartDate(dep.startDate);
    setEndDate(dep.endDate);
    setTimeout(() => {
      setCurrentStep(4);
    }, 150);
  };

  // Sync passengers list length with passengersCount
  const handlePaxCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(12, newCount));
    setPassengersCount(clamped);
    if (clamped > passengers.length) {
      const added = Array.from({ length: clamped - passengers.length }, () => ({
        fullName: '',
        rutOrPassport: '',
        birthDate: '',
        email: '',
        phone: '',
        nationality: 'Chilena',
        dietaryPreferences: '',
        notes: '',
      }));
      setPassengers([...passengers, ...added]);
    } else if (clamped < passengers.length) {
      setPassengers(passengers.slice(0, clamped));
    }
  };

  const updatePassengerField = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    let finalValue = value;
    if (field === 'rutOrPassport') {
      finalValue = formatRut(value);
    } else if (field === 'phone') {
      finalValue = formatPhone(value);
    }
    updated[index] = { ...updated[index], [field]: finalValue };
    setPassengers(updated);
  };

  // Calculation of Nights
  const calculatedNights = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [startDate, endDate]);

  // Financial Calculations
  const subtotalClp = useMemo(() => {
    return selectedProgramsData.reduce((acc, prog) => {
      if (prog.unitType === 'pax') {
        return acc + prog.priceClp * passengersCount;
      } else if (prog.unitType === 'night') {
        return acc + prog.priceClp * calculatedNights;
      } else {
        return acc + prog.priceClp; // fixed
      }
    }, 0);
  }, [selectedProgramsData, passengersCount, calculatedNights]);

  const calculatedDiscountClp = useMemo(() => {
    if (discountType === 'percent') {
      return Math.round((subtotalClp * discountPercent) / 100);
    } else if (discountType === 'amount') {
      return Math.min(subtotalClp, discountAmount);
    }
    return 0;
  }, [subtotalClp, discountType, discountPercent, discountAmount]);

  const totalFinalClp = Math.max(0, subtotalClp - calculatedDiscountClp);
  const installmentAmountClp = Math.round(totalFinalClp / installmentsCount);

  // Validation before advancing
  const canProceed = () => {
    if (currentStep === 1) {
      if (!mainModality) return false;
      if (mainModality === 'custom') return selectedCategories.length > 0;
      return true;
    }
    if (currentStep === 2) return selectedProgramIds.length > 0;
    if (currentStep === 3) {
      if (isOnlyLodge && isSelectedLodgeRoomBooked) return false;
      return Boolean(startDate && endDate && startDate <= endDate);
    }
    if (currentStep === 4) {
      // Must at least have Passenger 1 (Lead passenger) filled
      const lead = passengers[0];
      return Boolean(lead && lead.fullName.trim() && (lead.email.trim() || lead.phone.trim()));
    }
    if (currentStep === 5) return true;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 1) {
        if (!mainModality) {
          showNotification('Por favor selecciona una modalidad de reserva (Expedición Náutica, Lodge o Personalizado).', 'Selección Requerida');
        } else if (mainModality === 'custom' && selectedCategories.length === 0) {
          showNotification('Por favor activa al menos uno de los íconos circulares para componer la reserva personalizada.', 'Servicios Requeridos');
        }
      } else if (currentStep === 2) {
        showNotification(
          mainModality === 'lodge'
            ? 'Debe seleccionar una habitación del Lodge para continuar.'
            : mainModality === 'expedition'
            ? 'Debe seleccionar una expedición programada para continuar.'
            : 'Debe seleccionar un programa o paquete para continuar.',
          'Selección Requerida'
        );
      } else if (currentStep === 3) {
        if (isOnlyLodge) {
          if (isSelectedLodgeRoomBooked) {
            showNotification(`La cabina "${activeSelectedProgram?.title}" no está disponible en las fechas seleccionadas (${startDate} al ${endDate}) porque ya cuenta con una reserva u ocupación confirmada. Por favor modifica las fechas o regresa al Paso 2 para elegir otra habitación.`, 'Habitación no disponible');
          } else {
            showNotification('Por favor seleccione una fecha de check-in y check-out válida (mínimo 1 noche).', 'Fechas de Estadía Requeridas');
          }
        } else {
          showNotification('Por favor seleccione una fecha de salida programada para continuar.', 'Fecha Requerida');
        }
      } else if (currentStep === 4) {
        showNotification('Por favor complete al menos el nombre y teléfono/correo del pasajero principal (Titular de Reserva).', 'Datos Requeridos');
      } else {
        showNotification('Por favor complete los campos requeridos para continuar.', 'Atención');
      }
      return;
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    const randomCode = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalData: BookingWizardData = {
      bookingCode: randomCode,
      categories: selectedCategories,
      selectedPrograms: selectedProgramsData.map((p) => ({
        id: p.id,
        title: p.title,
        categoryLabel: p.categoryLabel,
        priceClp: p.priceClp,
        unitType: p.unitType,
      })),
      startDate,
      endDate,
      durationNights: calculatedNights,
      passengersCount,
      passengers: passengers.slice(0, passengersCount),
      paymentMethod,
      discountType,
      discountValue: discountType === 'percent' ? discountPercent : discountAmount,
      installmentsCount,
      specialNotes,
      totalAmountClp: totalFinalClp,
    };

    onConfirmBooking(finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b192c]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* IN-APP LUXURY ALERT NOTIFICATION POPUP */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 max-w-md w-full px-4 animate-slideDown">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-4.5 shadow-[0_20px_50px_rgba(245,158,11,0.25)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h5 className="font-serif font-bold text-sm text-[#0b192c] leading-tight">
                {notification.title}
              </h5>
              <p className="text-xs text-slate-600 font-light mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-[#0b192c] p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL WRAPPER */}
      <div className="max-w-4xl w-full bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_rgba(11,25,44,0.2)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* HEADER MODAL */}
        <div className="px-7 py-4.5 bg-[#fbfcfd] border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center shadow-md shadow-[#0b192c]/15">
              <Sparkles className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400 block">
                  Asistente de Reservas Yates Chile
                </span>
                <span className="text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-mono">
                  Paso {currentStep} de 6
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0b192c] leading-tight">
                Registrar Nueva Reserva Oficial
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#0b192c] p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-6 gap-2">
            {[
              { step: 1, label: '1. Modalidad' },
              { step: 2, label: mainModality === 'lodge' ? '2. Cabina' : mainModality === 'expedition' ? '2. Zarpes' : '2. Programas' },
              { step: 3, label: mainModality === 'lodge' ? '3. Estadía' : '3. Fechas' },
              { step: 4, label: '4. Pasajeros' },
              { step: 5, label: '5. Pago' },
              { step: 6, label: '6. Resumen' },
            ].map((s) => {
              const isDone = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <div key={s.step} className="flex flex-col gap-1 text-center">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-[#0f2b48]'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono font-bold truncate ${
                      isCurrent
                        ? 'text-[#0f2b48]'
                        : isDone
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
        </div>

        {/* BODY CONTAINER (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs">
          
          {/* ========================================================================= */}
          {/* PASO 1: SELECCIONAR MODALIDAD PRINCIPAL (EXPEDICIÓN / LODGE / PERSONALIZADO) */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 py-2 animate-fadeIn">
              <div className="space-y-1 text-center max-w-xl mx-auto">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  Paso 1 de 6 • Selección de Servicio
                </span>
                <h4 className="font-serif text-xl font-bold text-[#0f2b48]">
                  ¿Qué tipo de reserva deseas registrar?
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Selecciona una de las 3 opciones para configurar la reserva guiada.
                </p>
              </div>

              {/* 3 OPCIONES PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Opción 1: Expedición Náutica */}
                <button
                  type="button"
                  onClick={() => {
                    setMainModality('expedition');
                    setSelectedCategories(['vegvisir']);
                    setTimeout(() => {
                      setCurrentStep(2);
                    }, 120);
                  }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                    mainModality === 'expedition'
                      ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-lg ring-4 ring-sky-100 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        mainModality === 'expedition'
                          ? 'bg-sky-400/20 text-sky-300'
                          : 'bg-sky-50 text-sky-700 group-hover:bg-sky-100'
                      }`}
                    >
                      <Sailboat className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        mainModality === 'expedition'
                          ? 'bg-sky-400/20 text-sky-200 border-sky-300/30'
                          : 'bg-sky-100 text-sky-800 border-sky-200'
                      }`}
                    >
                      Zarpes Activos
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif text-base font-bold leading-tight">
                      Expedición Náutica
                    </h5>
                    <p
                      className={`text-xs leading-relaxed font-light ${
                        mainModality === 'expedition' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Travesías creadas con zarpes programados en Velero Vegvisir o Yate Terranova.
                    </p>
                  </div>

                  <div
                    className={`pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                      mainModality === 'expedition'
                        ? 'border-white/10 text-sky-200'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{departures?.length || 2} zarpes disponibles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Opción 2: Lodge Rincón */}
                <button
                  type="button"
                  onClick={() => {
                    setMainModality('lodge');
                    setSelectedCategories(['lodge']);
                    setTimeout(() => {
                      setCurrentStep(2);
                    }, 120);
                  }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                    mainModality === 'lodge'
                      ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-lg ring-4 ring-emerald-100 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        mainModality === 'lodge'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                      }`}
                    >
                      <BedDouble className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        mainModality === 'lodge'
                          ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      4 Cabinas
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif text-base font-bold leading-tight">
                      Lodge Rincón
                    </h5>
                    <p
                      className={`text-xs leading-relaxed font-light ${
                        mainModality === 'lodge' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Estadía en cabinas privadas frente a Bahía Cumberland con tarifas por noche.
                    </p>
                  </div>

                  <div
                    className={`pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                      mainModality === 'lodge'
                        ? 'border-white/10 text-emerald-200'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>Cabinas configuradas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Opción 3: Personalizado */}
                <button
                  type="button"
                  onClick={() => {
                    setMainModality('custom');
                  }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                    mainModality === 'custom'
                      ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-lg ring-4 ring-amber-100 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        mainModality === 'custom'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-amber-50 text-amber-700 group-hover:bg-amber-100'
                      }`}
                    >
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        mainModality === 'custom'
                          ? 'bg-amber-400/20 text-amber-200 border-amber-300/30'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      Multi-Servicio
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif text-base font-bold leading-tight">
                      Personalizado
                    </h5>
                    <p
                      className={`text-xs leading-relaxed font-light ${
                        mainModality === 'custom' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Composición libre de múltiples servicios: Velero, Yate, Lodge, Buceo y Vuelos.
                    </p>
                  </div>

                  <div
                    className={`pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                      mainModality === 'custom'
                        ? 'border-white/10 text-amber-200'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>Compositor a medida</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* SI SE ELIGE PERSONALIZADO: MOSTRAR ÍCONOS CIRCULARES */}
              {mainModality === 'custom' && (
                <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                  <div className="text-center space-y-0.5">
                    <h5 className="font-serif text-sm font-bold text-[#0f2b48]">
                      Selecciona los servicios que compondrán esta experiencia
                    </h5>
                    <p className="text-slate-500 text-[11px] font-light">
                      Haz clic en los íconos circulares para activar o desactivar cada componente:
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2">
                    {[
                      { id: 'vegvisir', title: 'Velero Vegvisir', icon: Sailboat },
                      { id: 'terranova', title: 'Yate Terranova', icon: Ship },
                      { id: 'lodge', title: 'Lodge Rincón', icon: BedDouble },
                      { id: 'servicios', title: 'Excursiones & Buceo', icon: Compass },
                      { id: 'aeronave', title: 'Aeronave & Vuelos', icon: Plane },
                    ].map((item) => {
                      const isSelected = selectedCategories.includes(item.id);
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="relative group/iconbtn flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleCategory(item.id)}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-110 active:scale-95 relative border-2 ${
                              isSelected
                                ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-lg shadow-[#0f2b48]/30 scale-105 ring-4 ring-sky-100'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-[#0f2b48]/40 hover:text-[#0f2b48] hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white animate-scale-in">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                          <span className="text-[10px] font-medium text-slate-600 text-center">
                            {item.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mensaje de guía inferior */}
              <div
                className={`border p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium max-w-lg mx-auto text-center transition-all ${
                  mainModality
                    ? 'bg-sky-50/70 border-sky-200/80 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 shrink-0 ${mainModality ? 'text-sky-600' : 'text-slate-400'}`}
                />
                <span>
                  {mainModality === 'expedition' && (
                    <>Modalidad <strong>Expedición Náutica</strong> seleccionada. Presiona <em>Siguiente Paso</em> para elegir el zarpe programado.</>
                  )}
                  {mainModality === 'lodge' && (
                    <>Modalidad <strong>Lodge Rincón</strong> seleccionada. Presiona <em>Siguiente Paso</em> para elegir la cabina.</>
                  )}
                  {mainModality === 'custom' && (
                    <>
                      {selectedCategories.length > 0
                        ? <>{selectedCategories.length} {selectedCategories.length === 1 ? 'servicio activo' : 'servicios activos'}. Presiona <em>Siguiente Paso</em> para ver los programas disponibles.</>
                        : 'Activa al menos un servicio con los íconos circulares para continuar.'}
                    </>
                  )}
                  {!mainModality && 'Elige una de las 3 modalidades de reserva arriba para comenzar.'}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: PROGRAMAS O CABINAS DEL LODGE (DINÁMICO SEGÚN PASO 1) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      mainModality === 'lodge'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : mainModality === 'expedition'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {mainModality === 'lodge'
                        ? 'Lodge Rincón de Navegantes'
                        : mainModality === 'expedition'
                        ? 'Expediciones Náuticas Creadas'
                        : 'Catálogo Personalizado'}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                    {mainModality === 'lodge'
                      ? 'Paso 2: Selecciona la cabina o habitación del Lodge'
                      : mainModality === 'expedition'
                      ? 'Paso 2: Selecciona la expedición náutica programada'
                      : 'Paso 2: Selecciona los programas o servicios a incluir'}
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    {mainModality === 'lodge'
                      ? 'Selecciona una de las 4 cabinas privadas frente a Bahía Cumberland para esta estadía.'
                      : mainModality === 'expedition'
                      ? 'Selecciona una de las expediciones con zarpes configurados para asignar los pasajeros.'
                      : 'Se muestran los programas y servicios disponibles según las opciones seleccionadas.'}
                  </p>
                </div>

                {/* FILTRO DE FECHA (MES) PARA EXPEDICIONES */}
                {mainModality === 'expedition' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3.5 py-2 rounded-2xl shadow-2xs">
                    <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Mes:</span>
                    <select
                      value={expeditionMonthFilter}
                      onChange={(e) => setExpeditionMonthFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#0f2b48] focus:outline-hidden cursor-pointer pr-1 font-mono"
                    >
                      <option value="all">Todos los meses ({availablePrograms.length})</option>
                      {availableExpeditionMonths.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                {displayedProgramsInStep2.length > 0 ? (
                  displayedProgramsInStep2.map((prog) => {
                    const isSelected = selectedProgramIds.includes(prog.id);
                    return (
                      <div
                        key={prog.id}
                        onClick={() => selectProgram(prog.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none ${
                          isSelected
                            ? 'bg-sky-50/40 border-sky-400 ring-1 ring-sky-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#0f2b48] border-[#0f2b48] text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>

                          {/* Icon badge if Lodge or Vessel */}
                          {isOnlyLodge && (
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                              <BedDouble className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-serif font-bold text-sm text-[#0f2b48] truncate">
                                {prog.title}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                • {prog.duration}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-light line-clamp-1 mt-0.5">
                              {prog.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                            Tarifa
                          </span>
                          <div className="text-sm font-mono font-bold text-[#0f2b48]">
                            ${prog.priceClp.toLocaleString('es-CL')}{' '}
                            <span className="text-[10px] font-normal text-slate-500 font-sans">
                              {prog.unitType === 'pax' ? 'CLP / pax' : prog.unitType === 'night' ? 'CLP / noche' : 'CLP total'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-sm text-slate-700">
                        No hay programas o expediciones disponibles para esta selección
                      </h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {mainModality === 'expedition'
                          ? 'Prueba cambiando el filtro de mes a "Todos los meses" para ver todas las salidas programadas.'
                          : 'Puedes regresar al Paso 1 para ajustar las opciones seleccionadas.'}
                      </p>
                    </div>
                    {mainModality === 'expedition' && expeditionMonthFilter !== 'all' ? (
                      <button
                        type="button"
                        onClick={() => setExpeditionMonthFilter('all')}
                        className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold transition hover:bg-sky-700 cursor-pointer"
                      >
                        Ver todos los meses
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-xl bg-[#0f2b48] text-white text-xs font-bold transition hover:bg-[#0a1e34] cursor-pointer"
                      >
                        ← Volver al Paso Anterior
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: FECHAS (DINÁMICO SEGÚN LODGE O EXPEDICIÓN) */}
          {/* ========================================================================= */}
          {currentStep === 3 && isOnlyLodge && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {activeSelectedProgram?.title || 'Habitación Lodge'}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 3: Selecciona las fechas de estadía (Check-in & Check-out)
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Ingresa las fechas de ingreso y salida en Lodge Rincón de Navegantes para calcular automáticamente las noches y tarifa total.
                </p>
              </div>

              {/* DATE PICKERS GRID FOR LODGE */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Check-In */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha de Check-in (Ingreso) *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setStartDate(newStart);
                          if (!endDate || endDate <= newStart) {
                            const d = new Date(newStart);
                            d.setDate(d.getDate() + 2);
                            setEndDate(d.toISOString().split('T')[0]);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300/80 focus:border-[#0f2b48] focus:bg-white rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#0f2b48] focus:outline-hidden transition"
                      />
                    </div>
                  </div>

                  {/* Check-Out */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha de Check-out (Salida) *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300/80 focus:border-[#0f2b48] focus:bg-white rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#0f2b48] focus:outline-hidden transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SUMMARY & NIGHTS CALCULATION */}
                {isSelectedLodgeRoomBooked ? (
                  <div className="bg-rose-50 border border-rose-200/90 p-4 rounded-2xl flex items-start gap-3 text-rose-900 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-bold text-xs block text-rose-950">
                        Habitación no disponible en estas fechas
                      </strong>
                      <p className="text-[11px] leading-relaxed text-rose-800">
                        La cabina <strong>{activeSelectedProgram?.title}</strong> ya cuenta con una reserva u ocupación confirmada entre el <strong>{formatDateDDMMYYYY(startDate)}</strong> y el <strong>{formatDateDDMMYYYY(endDate)}</strong>. Por favor modifica las fechas o regresa al Paso 2 para elegir otra habitación disponible.
                      </p>
                    </div>
                  </div>
                ) : startDate && endDate && startDate < endDate ? (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-emerald-950 block">
                          {calculatedNights} {calculatedNights === 1 ? 'Noche de Estadía' : 'Noches de Estadía'} Calculadas
                        </span>
                        <span className="text-[11px] text-emerald-800 font-mono">
                          Del {formatDateDDMMYYYY(startDate)} al {formatDateDDMMYYYY(endDate)} ({activeSelectedProgram?.title})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 block">Subtotal Estadía</span>
                      <span className="text-base font-mono font-bold text-emerald-950">
                        ${((activeSelectedProgram?.priceClp || 240000) * calculatedNights).toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-xs text-slate-500">
                    Selecciona las fechas de Check-in y Check-out para calcular automáticamente las noches y tarifa.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && !isOnlyLodge && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded-md">
                    {activeSelectedProgram?.title || 'Paquete Seleccionado'}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  {isExpedition
                    ? 'Paso 3: Fechas de Zarpe y Desembarque de la Expedición'
                    : 'Paso 3: Selecciona la Fecha de Salida Programada'}
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  {isExpedition
                    ? 'Revisa el itinerario y fechas programadas para esta travesía náutica.'
                    : 'Este paquete opera en fechas fijas de zarpe y expedición. Selecciona la salida que prefieras:'}
                </p>
              </div>

              {isExpedition ? (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-[#fbfcfd] border border-slate-200/80 rounded-2xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                        <Sailboat className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-sm text-[#0f2b48]">
                          {activeSelectedProgram?.title}
                        </h5>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {activeSelectedProgram?.categoryLabel} • Tarifa: ${activeSelectedProgram?.priceClp.toLocaleString('es-CL')} CLP / PAX
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0">
                      Itinerario Programado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                        Fecha de Zarpe (Inicio)
                      </span>
                      <span className="text-sm font-mono font-bold text-[#0f2b48] block">
                        {formatDateDDMMYYYY(startDate) || '31/10/2026'}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                        Fecha de Desembarque (Fin)
                      </span>
                      <span className="text-sm font-mono font-bold text-[#0f2b48] block">
                        {formatDateDDMMYYYY(endDate) || '11/11/2026'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* LIST OF SCHEDULED FIXED DEPARTURES */
                <div className="space-y-2.5 pt-1">
                  {DEFAULT_PROGRAM_DEPARTURES.map((dep) => {
                    const isSelected = selectedDepartureId === dep.id;
                    return (
                      <div
                        key={dep.id}
                        onClick={() => handleSelectDeparture(dep)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none ${
                          isSelected
                            ? 'bg-sky-50/40 border-[#0f2b48] ring-2 ring-[#0f2b48]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#0f2b48] border-[#0f2b48] text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                              <strong className="text-sm font-mono font-bold text-[#0f2b48]">
                                {formatDateDDMMYYYY(dep.startDate)} al {formatDateDDMMYYYY(dep.endDate)}
                              </strong>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                              Duración: {dep.durationLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono text-xs font-bold text-[#0f2b48] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                            {dep.availableSlots} cupos disponibles
                          </span>

                          <span
                            className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase ${
                              dep.status === 'confirmada'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : dep.status === 'ultimos_cupos'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {dep.status === 'confirmada' ? 'Confirmada para zarpe' : dep.status === 'ultimos_cupos' ? 'Últimos cupos' : 'Salida abierta'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0f2b48] block">Fecha de Salida Seleccionada</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatDateDDMMYYYY(startDate)} ➔ {formatDateDDMMYYYY(endDate)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  Salida Programada Activa
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: PASAJEROS & DATOS PERSONALES */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                    Paso 4: Cantidad de Pasajeros y Fichas de Clientes
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Cada pasajero será creado automáticamente en la base de datos de Clientes CRM.
                  </p>
                </div>

                {/* MODERN LUXURY PAX STEPPER */}
                <div className="flex items-center bg-[#f4f7fa] border border-slate-200/90 rounded-2xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handlePaxCountChange(passengersCount - 1)}
                    disabled={passengersCount <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:text-[#0f2b48] hover:border-slate-300 hover:shadow-xs active:scale-95 flex items-center justify-center font-bold text-base disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Disminuir pasajero"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-1.5 px-3.5 min-w-[110px] justify-center select-none">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-mono font-bold text-sm text-[#0f2b48]">
                      {passengersCount}
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans font-medium">
                      {passengersCount === 1 ? 'Pasajero' : 'Pasajeros'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaxCountChange(passengersCount + 1)}
                    disabled={passengersCount >= 12}
                    className="w-8 h-8 rounded-xl bg-[#0f2b48] text-white hover:bg-[#0a1e34] hover:shadow-xs active:scale-95 flex items-center justify-center font-bold text-base disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Agregar pasajero"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* DYNAMIC FORMS FOR EACH PASSENGER */}
              <div className="space-y-3.5 pt-1">
                {passengers.slice(0, passengersCount).map((pax, idx) => (
                  <div
                    key={idx}
                    className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#0f2b48] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                          #{idx + 1}
                        </div>
                        <h6 className="font-bold text-xs text-[#0f2b48]">
                          {idx === 0 ? 'Pasajero Principal (Titular de Reserva)' : `Pasajero Acompañante #${idx + 1}`}
                        </h6>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {idx === 0 ? 'Contacto Facturación' : 'Pasajero Registrado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Juan Pérez Mackenna"
                          value={pax.fullName}
                          onChange={(e) => updatePassengerField(idx, 'fullName', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          RUT o Pasaporte *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 15.342.891-K"
                          value={pax.rutOrPassport}
                          onChange={(e) => updatePassengerField(idx, 'rutOrPassport', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          value={pax.birthDate || ''}
                          onChange={(e) => updatePassengerField(idx, 'birthDate', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={pax.email}
                          onChange={(e) => updatePassengerField(idx, 'email', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          placeholder="+56 9 1234 5678"
                          value={pax.phone}
                          onChange={(e) => updatePassengerField(idx, 'phone', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Preferencias Alimentarias / Alergias (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Celíaco, vegetariano, alérgico a nueces"
                          value={pax.dietaryPreferences}
                          onChange={(e) => updatePassengerField(idx, 'dietaryPreferences', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#0f2b48] block mb-1">
                          Notas Médicas / Buceo (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Certificación PADI Advanced, talla L"
                          value={pax.notes}
                          onChange={(e) => updatePassengerField(idx, 'notes', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 5: FORMA DE PAGO, DESCUENTOS & CUOTAS */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 5: Plan de Cuotas y Descuentos
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Configura la cantidad de cuotas flexibles y condiciones financieras de la reserva.
                </p>
              </div>

              {/* MÉTODO DE PAGO OFICIAL: TRANSFERENCIA BANCARIA */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0f2b48] text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-5 h-5 text-sky-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-sky-800 tracking-wider block">
                      Método de Pago Oficial
                    </span>
                    <h5 className="font-serif font-bold text-xs sm:text-sm text-[#0f2b48]">
                      Transferencia Bancaria Electrónica (Banco de Chile / Santander)
                    </h5>
                    <span className="text-[11px] text-slate-500 font-light">
                      Conciliación directa institucional con comprobante oficial de transferencia.
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold rounded-full">
                    Transferencia Bancaria
                  </span>
                </div>
              </div>

              {/* CONFIGURADOR MODERNO Y FLEXIBLE DE CUOTAS */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-4 h-4 text-sky-600" />
                      <span>Plan de Cuotificación Flexible</span>
                    </label>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Selecciona o ajusta libremente la cantidad de cuotas para el cliente.
                    </p>
                  </div>

                  {/* Modern Stepper Counter */}
                  <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xs">
                    <span className="text-[11px] uppercase font-mono font-bold text-slate-500 pl-2">
                      N° de Cuotas:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInstallmentsCount((prev) => Math.max(1, prev - 1))}
                        disabled={installmentsCount <= 1}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-[#0f2b48] font-bold text-sm flex items-center justify-center transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-mono font-bold text-sm text-[#0f2b48]">
                        {installmentsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInstallmentsCount((prev) => Math.min(12, prev + 1))}
                        disabled={installmentsCount >= 12}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-[#0f2b48] font-bold text-sm flex items-center justify-center transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Selection Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Opciones Rápidas:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { count: 1, label: '100% Contado' },
                      { count: 2, label: '2 Cuotas (50/50)' },
                      { count: 3, label: '3 Cuotas' },
                      { count: 4, label: '4 Cuotas' },
                      { count: 6, label: '6 Cuotas' },
                      { count: 8, label: '8 Cuotas' },
                      { count: 10, label: '10 Cuotas' },
                      { count: 12, label: '12 Cuotas' },
                    ].map((pill) => {
                      const isActive = installmentsCount === pill.count;
                      return (
                        <button
                          key={pill.count}
                          type="button"
                          onClick={() => setInstallmentsCount(pill.count)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer ${
                            isActive
                              ? 'bg-[#0f2b48] text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Dynamic Breakdown */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-[#0f2b48]">
                      Desglose de Pago Programado:
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {installmentsCount === 1
                        ? '1 Pago de $' + totalFinalClp.toLocaleString('es-CL') + ' CLP'
                        : `${installmentsCount} cuotas de $${installmentAmountClp.toLocaleString('es-CL')} CLP cada una`}
                    </span>
                  </div>

                  {/* Installment cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {Array.from({ length: installmentsCount }).map((_, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === installmentsCount - 1;
                      const amount =
                        idx === installmentsCount - 1
                          ? totalFinalClp - installmentAmountClp * (installmentsCount - 1)
                          : installmentAmountClp;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition ${
                            isFirst
                              ? 'bg-sky-50/70 border-sky-200 shadow-2xs'
                              : 'bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                            <span>Cuota #{idx + 1}</span>
                            <span className={isFirst ? 'text-sky-700' : 'text-slate-400'}>
                              {isFirst ? 'Pie / Reserva' : isLast ? 'Saldo Final' : 'Cuota Intermedia'}
                            </span>
                          </div>
                          <div className="text-sm font-mono font-bold text-[#0f2b48]">
                            ${amount.toLocaleString('es-CL')} <span className="text-[10px] font-normal text-slate-500">CLP</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-light block mt-0.5">
                            {isFirst
                              ? 'Al momento de confirmar reserva'
                              : isLast
                              ? 'Previo al zarpe / check-in'
                              : `Programado correlativo (#${idx + 1})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DESCUENTOS Y BENEFICIOS ESPECIALES */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 p-4 rounded-2xl space-y-3 shadow-2xs">
                <label className="text-[10px] uppercase font-bold text-[#0f2b48] flex items-center gap-1.5 font-mono">
                  <Percent className="w-3.5 h-3.5 text-sky-600" />
                  <span>Descuentos y Beneficios Especiales</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setDiscountType('none'); setDiscountPercent(0); setDiscountAmount(0); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      discountType === 'none'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sin Descuento (Tarifa Estándar)
                  </button>

                  <div
                    onClick={() => setDiscountType('percent')}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                      discountType === 'percent'
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#0f2b48]">Porcentaje:</span>
                    <select
                      value={discountPercent}
                      onChange={(e) => {
                        setDiscountType('percent');
                        setDiscountPercent(Number(e.target.value));
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#0f2b48] focus:outline-none"
                    >
                      <option value="5">5% Descuento</option>
                      <option value="10">10% Descuento (VIP)</option>
                      <option value="15">15% Descuento</option>
                      <option value="20">20% Preventa</option>
                    </select>
                  </div>

                  <div
                    onClick={() => setDiscountType('amount')}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                      discountType === 'amount'
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#0f2b48] whitespace-nowrap">Monto Fijo:</span>
                    <input
                      type="number"
                      placeholder="$ CLP"
                      value={discountAmount || ''}
                      onChange={(e) => {
                        setDiscountType('amount');
                        setDiscountAmount(Number(e.target.value));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#0f2b48] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* FINANCIAL SUMMARY BOX */}
              <div className="bg-[#0f2b48] text-white p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-md">
                <div className="flex justify-between text-xs text-sky-200 font-mono">
                  <span>Subtotal bruto ({passengersCount} pax / {calculatedNights} días):</span>
                  <span>${subtotalClp.toLocaleString('es-CL')} CLP</span>
                </div>
                {calculatedDiscountClp > 0 && (
                  <div className="flex justify-between text-xs text-emerald-300 font-mono">
                    <span>Descuento aplicado:</span>
                    <span>-${calculatedDiscountClp.toLocaleString('es-CL')} CLP</span>
                  </div>
                )}
                <div className="border-t border-sky-800/80 pt-2 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-sm font-serif font-bold block">TOTAL FINAL A COBRAR:</span>
                    <span className="text-xs text-sky-200 font-mono font-light">
                      {installmentsCount === 1 ? '1 Pago al 100% Contado' : `${installmentsCount} cuotas de $${installmentAmountClp.toLocaleString('es-CL')} CLP`}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-sky-300">
                    ${totalFinalClp.toLocaleString('es-CL')} <span className="text-xs text-sky-200 font-normal">CLP</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 6: RESUMEN EJECUTIVO & CONFIRMACIÓN */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 6: Resumen Ejecutivo y Creación de Reserva
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Revisa los datos consolidados antes de registrar la reserva y generar las fichas de cliente.
                </p>
              </div>

              <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-5 space-y-4">
                
                {/* HEAD DETAILS */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#0f2b48]/70 block">
                      Reserva Oficial Yates Chile
                    </span>
                    <h5 className="font-serif text-lg font-bold text-[#0f2b48]">
                      {passengers[0]?.fullName || 'Titular de Reserva'}
                    </h5>
                    <span className="text-xs text-slate-500 font-mono">
                      {passengers[0]?.email} • {passengers[0]?.phone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Total a Facturar
                    </span>
                    <div className="text-xl font-mono font-bold text-[#0f2b48]">
                      ${totalFinalClp.toLocaleString('es-CL')} CLP
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {installmentsCount === 1 ? '100% Contado' : `${installmentsCount} cuotas de $${installmentAmountClp.toLocaleString('es-CL')}`}
                    </span>
                  </div>
                </div>

                {/* ASSETS & PROGRAMS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                      Programas & Servicios Incluidos
                    </span>
                    <ul className="space-y-1">
                      {selectedProgramsData.map((prog) => (
                        <li key={prog.id} className="text-xs font-semibold text-[#0f2b48] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{prog.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                      Fechas & Pasajeros
                    </span>
                    <div className="text-xs text-[#0f2b48] space-y-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span><strong>Fechas:</strong> {formatDateDDMMYYYY(startDate)} ➔ {formatDateDDMMYYYY(endDate)} ({calculatedNights} días)</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span><strong>Pasajeros:</strong> {passengersCount} personas</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span><strong>Pago:</strong> {paymentMethod === 'transfer' ? 'Transferencia' : paymentMethod === 'credit_card' ? 'Tarjeta' : paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PASSENGERS MINI LIST */}
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    Fichas Individuales de Pasajeros a Crear ({passengersCount})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {passengers.slice(0, passengersCount).map((pax, i) => (
                      <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px]">
                        <div className="font-bold text-[#0f2b48] truncate">{pax.fullName || `Pasajero #${i + 1}`}</div>
                        <div className="text-slate-500 font-mono text-[10px] truncate">{pax.rutOrPassport || 'Sin RUT'}</div>
                        <div className="text-slate-400 text-[10px] truncate">{pax.email || 'Sin correo'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SPECIAL NOTES */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                    Notas Internas / Instrucciones para Concierge
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones especiales para el traslado, bienvenida en muelle o requerimientos del cliente..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48]"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-[#fbfcfd] border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0f2b48] hover:bg-slate-100 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Paso Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold transition shadow-md shadow-[#0b192c]/20 flex items-center gap-2 cursor-pointer text-xs active:scale-95"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4 text-sky-300" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer text-xs"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Confirmar y Registrar Reserva Oficial</span>
              </button>
            )}
          </div>
        </div>

        {/* CUSTOM IN-APP NOTIFICATION MODAL */}
        {notification && (
          <div className="fixed inset-0 z-70 bg-[#0a1e34]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(15,43,72,0.25)] space-y-4 text-center animate-scale-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <h5 className="font-serif font-bold text-base text-[#0f2b48]">
                  {notification.title}
                </h5>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0f2b48] hover:bg-[#0a1e34] active:scale-98 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
