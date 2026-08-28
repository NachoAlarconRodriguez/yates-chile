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
  Clock,
  Plus,
  Minus
} from 'lucide-react';
import { useLodge } from '../../hooks/useLodge';
import { formatPhone, formatRut } from '../../lib/formatters';
import { LuxuryDatePicker } from './LuxuryDatePicker';

export interface BookingWizardData {
  bookingCode: string;
  mainModality: 'expedition' | 'lodge' | 'custom';
  selectedProgramIds?: string[];
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
  paymentScheme: '100' | '50' | '0';
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

  // Step 3: Dates
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
  const [paymentScheme, setPaymentScheme] = useState<'100' | '50' | '0'>('50');
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [customPriceOverrides, setCustomPriceOverrides] = useState<Record<string, number>>({});

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
      setCustomPriceOverrides({});
      setStartDate('');
      setEndDate('');
      setPassengersCount(1);
      setPaymentScheme('50');
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
      setIsDiscountEnabled(false);
      setDiscountPercent(0);
      setSpecialNotes('');
      setNotification(null);
    }
  }, [isOpen]);

  // Toggle category in Step 2 (for Custom Mode)
  const toggleCategory = (catId: string) => {
    if (!selectedCategories.includes(catId)) {
      if (catId === 'vegvisir' && passengersCount > 6) {
        showNotification(
          `El Velero Vegvisir tiene capacidad máxima de 6 personas (actualmente hay ${passengersCount} pasajeros configurados). Ajusta los pasajeros a 6 o menos para incluir el velero.`,
          'Capacidad Excedida'
        );
        return;
      }
      if (catId === 'terranova' && passengersCount > 8) {
        showNotification(
          `El Yate Terranova tiene capacidad máxima de 8 personas (actualmente hay ${passengersCount} pasajeros configurados). Ajusta los pasajeros a 8 o menos para incluir el yate.`,
          'Capacidad Excedida'
        );
        return;
      }
      setSelectedCategories([...selectedCategories, catId]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    }
  };

  // Helper booleans for dynamic wizard mode
  const isOnlyLodge = mainModality === 'lodge' || (selectedCategories.length === 1 && selectedCategories[0] === 'lodge');
  const { isRoomBookedForRange, isDateBookedForRoom, bookings: lodgeBookings, rooms: lodgeRooms } = useLodge();

  const getRoomIdFromProgId = (progId: string): string => {
    if (progId === 'prog-lodge-1' || progId.toLowerCase().includes('albatros') || progId.toLowerCase().includes('room-1')) return 'room-1';
    if (progId === 'prog-lodge-2' || progId.toLowerCase().includes('cumberland') || progId.toLowerCase().includes('room-2')) return 'room-2';
    if (progId === 'prog-lodge-3' || progId.toLowerCase().includes('selkirk') || progId.toLowerCase().includes('room-3')) return 'room-3';
    if (progId === 'prog-lodge-4' || progId.toLowerCase().includes('vidriola') || progId.toLowerCase().includes('room-4')) return 'room-4';
    return progId;
  };

  // =========================================================================
  // MOTOR INTELIGENTE DE DISPONIBILIDAD DE ACTIVOS (VELERO, YATE, LODGE)
  // =========================================================================
  const getVesselDisabledRanges = (vesselKeyword: 'vegvisir' | 'terranova') => {
    const ranges: { start: string; end: string; reason: string }[] = [];
    const isMatch = (nameOrId?: string) => Boolean(nameOrId && nameOrId.toLowerCase().includes(vesselKeyword));

    (departures || []).forEach((d: any) => {
      const vName = d.vessel?.name || d.vessel_id || d.vessel || '';
      const cat = d.category || '';
      if (isMatch(vName) || isMatch(cat)) {
        const s = (d.departure_date || d.departureDate || '').split('T')[0];
        const e = (d.return_date || d.returnDate || '').split('T')[0];
        const status = d.status || '';
        if (s && e && status !== 'cancelled') {
          const vTitle = vesselKeyword === 'vegvisir' ? 'Velero Vegvisir' : 'Yate Terranova';
          ranges.push({
            start: s,
            end: e,
            reason: `${vTitle} ocupado en travesía (${formatDateDDMMYYYY(s)} al ${formatDateDDMMYYYY(e)})`,
          });
        }
      }
    });
    return ranges;
  };

  // Rangos bloqueados para las embarcaciones seleccionadas en el modo personalizado
  const customDisabledDateRanges = useMemo(() => {
    if (mainModality !== 'custom') return [];
    const ranges: { start: string; end: string; reason: string }[] = [];

    if (selectedCategories.includes('vegvisir')) {
      ranges.push(...getVesselDisabledRanges('vegvisir'));
    }
    if (selectedCategories.includes('terranova')) {
      ranges.push(...getVesselDisabledRanges('terranova'));
    }

    return ranges;
  }, [mainModality, selectedCategories, departures]);

  // Verificar si un día individual está bloqueado por falta de activos seleccionados
  const isCustomDateBlocked = (dateIso: string) => {
    // 1. Embarcaciones (Velero / Yate)
    for (const r of customDisabledDateRanges) {
      if (dateIso >= r.start && dateIso <= r.end) {
        return { disabled: true, reason: r.reason };
      }
    }

    // 2. Capacidad del Lodge Rincón si está seleccionado
    if (selectedCategories.includes('lodge')) {
      const cabinsNeeded = Math.max(1, Math.ceil(passengersCount / 3));
      const totalRooms = (rooms && rooms.length > 0 ? rooms.length : (lodgeRooms && lodgeRooms.length > 0 ? lodgeRooms.length : 4));
      
      const bookedRoomsOnDate = (lodgeBookings || []).filter((b) => {
        if (!['pending_transfer', 'approved', 'blocked'].includes(b.status)) return false;
        return dateIso >= b.check_in && dateIso < b.check_out;
      }).length;

      const availableCount = Math.max(0, totalRooms - bookedRoomsOnDate);
      if (availableCount < cabinsNeeded) {
        return {
          disabled: true,
          reason: `Lodge Rincón: Solo ${availableCount} ${availableCount === 1 ? 'cabina disponible' : 'cabinas disponibles'} (se requieren ${cabinsNeeded})`,
        };
      }
    }

    return false;
  };

  // Verificar disponibilidad de un activo específico en un rango de fechas
  const checkAssetAvailabilityForRange = (catId: string, sDate: string, eDate: string): { available: boolean; reason?: string; assetName: string } => {
    const meta = ASSET_META[catId] || { label: catId };
    if (!sDate || !eDate || sDate >= eDate) {
      return { available: true, assetName: meta.label };
    }

    if (catId === 'vegvisir') {
      const vegRanges = getVesselDisabledRanges('vegvisir');
      const conflict = vegRanges.find((r) => r.start < eDate && r.end > sDate);
      if (conflict) {
        return { available: false, reason: conflict.reason, assetName: 'Velero Vegvisir' };
      }
      return { available: true, assetName: 'Velero Vegvisir' };
    }

    if (catId === 'terranova') {
      const terraRanges = getVesselDisabledRanges('terranova');
      const conflict = terraRanges.find((r) => r.start < eDate && r.end > sDate);
      if (conflict) {
        return { available: false, reason: conflict.reason, assetName: 'Yate Terranova' };
      }
      return { available: true, assetName: 'Yate Terranova' };
    }

    if (catId === 'lodge') {
      const cabinsNeeded = Math.max(1, Math.ceil(passengersCount / 3));
      const totalRooms = (rooms && rooms.length > 0 ? rooms.length : (lodgeRooms && lodgeRooms.length > 0 ? lodgeRooms.length : 4));
      
      const s = new Date(sDate);
      const e = new Date(eDate);
      const curr = new Date(s);
      while (curr < e) {
        const iso = curr.toISOString().split('T')[0];
        const bookedCount = (lodgeBookings || []).filter((b) => {
          if (!['pending_transfer', 'approved', 'blocked'].includes(b.status)) return false;
          return iso >= b.check_in && iso < b.check_out;
        }).length;

        if (totalRooms - bookedCount < cabinsNeeded) {
          return {
            available: false,
            reason: `Sin cabinas suficientes el ${formatDateDDMMYYYY(iso)} (${Math.max(0, totalRooms - bookedCount)} disponibles de ${cabinsNeeded} requeridas)`,
            assetName: 'Lodge Rincón',
          };
        }
        curr.setDate(curr.getDate() + 1);
      }
      return { available: true, assetName: 'Lodge Rincón' };
    }

    if (catId === 'aeronave') {
      return { available: true, assetName: 'Traslado en Avioneta' };
    }

    if (catId === 'servicios') {
      return { available: true, assetName: 'Excursiones & Buceo' };
    }

    return { available: true, assetName: meta.label };
  };

  // Resumen global de conflictos en el rango para el modo personalizado
  const customRangeConflict = useMemo(() => {
    if (mainModality !== 'custom' || !startDate || !endDate || startDate >= endDate) return null;
    for (const catId of selectedCategories) {
      const check = checkAssetAvailabilityForRange(catId, startDate, endDate);
      if (!check.available) {
        return check;
      }
    }
    return null;
  }, [mainModality, startDate, endDate, selectedCategories, departures, lodgeBookings, rooms, lodgeRooms, passengersCount]);

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

          const rawMax = typeof d.maxPax === 'number'
            ? d.maxPax
            : typeof d.total_slots === 'number'
            ? d.total_slots
            : typeof d.max_pax === 'number'
            ? d.max_pax
            : 6;

          const rawAvailable = typeof d.availablePax === 'number'
            ? d.availablePax
            : typeof d.available_slots === 'number'
            ? d.available_slots
            : typeof d.spotsLeft === 'number'
            ? d.spotsLeft
            : typeof d.bookedPax === 'number'
            ? Math.max(0, rawMax - d.bookedPax)
            : 6;

          const isSoldOut = rawAvailable <= 0 || (typeof d.status === 'string' && (d.status === 'sold_out' || d.status === 'completed' || d.status === 'closed'));

          return {
            id: d.id,
            title: d.routeTitle || d.name || 'Expedición Archipiélago Juan Fernández',
            category: isVegvisir ? 'vegvisir' : 'terranova',
            categoryLabel: vName,
            includedAssets: isVegvisir ? ['vegvisir'] : ['terranova'],
            duration: d.departure_date && d.return_date ? `${formatDateDDMMYYYY(d.departure_date)} ➔ ${formatDateDDMMYYYY(d.return_date)}` : '7 Días / 6 Noches',
            priceClp: numPrice,
            unitType: 'pax' as const,
            description: `${vName} • ${rawAvailable} ${rawAvailable === 1 ? 'cupo disponible' : 'cupos disponibles'} de ${rawMax} PAX.`,
            paxLimit: rawMax,
            availablePax: rawAvailable,
            isSoldOut,
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

    return [];
  }, [mainModality, departures, rooms]);

  // Compute upcoming 12 months for expedition filtering in Step 2
  const upcoming12Months = useMemo(() => {
    if (mainModality !== 'expedition') return [];

    const now = new Date();
    let baseYear = now.getFullYear();
    let baseMonth = now.getMonth();

    // Check if any active departures start earlier in the season
    availablePrograms.forEach((p: any) => {
      if (p.departureDate) {
        const cleanDate = String(p.departureDate).split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const depTime = new Date(y, m, 1).getTime();
          const currBaseTime = new Date(baseYear, baseMonth, 1).getTime();
          if (depTime < currBaseTime && y >= now.getFullYear() - 1) {
            baseYear = y;
            baseMonth = m;
          }
        }
      }
    });

    const months: { key: string; shortLabel: string; fullLabel: string; count: number }[] = [];
    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthNamesFull = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    for (let i = 0; i < 12; i++) {
      const d = new Date(baseYear, baseMonth + i, 1);
      const year = d.getFullYear();
      const mIdx = d.getMonth();
      const monthStr = String(mIdx + 1).padStart(2, '0');
      const key = `${year}-${monthStr}`;

      const count = availablePrograms.filter((p: any) => {
        if (!p.departureDate) return false;
        const cleanDate = String(p.departureDate).split('T')[0];
        return cleanDate.startsWith(key);
      }).length;

      months.push({
        key,
        shortLabel: `${monthNamesShort[mIdx]} ${year}`,
        fullLabel: `${monthNamesFull[mIdx]} ${year}`,
        count,
      });
    }

    return months;
  }, [mainModality, availablePrograms]);

  const upcomingMonths = useMemo(() => upcoming12Months.slice(0, 6), [upcoming12Months]);

  // Filter displayed programs in Step 2 based on selected month
  const displayedProgramsInStep2 = useMemo(() => {
    if (mainModality === 'expedition') {
      if (expeditionMonthFilter === 'all') return availablePrograms;
      return availablePrograms.filter((prog: any) => {
        if (!prog.departureDate) return false;
        const cleanDate = String(prog.departureDate).split('T')[0];
        return cleanDate.startsWith(expeditionMonthFilter);
      });
    }
    return availablePrograms;
  }, [mainModality, availablePrograms, expeditionMonthFilter]);

  // Select a single program
  const selectProgram = (progId: string, autoAdvance = true) => {
    const found = availablePrograms.find((p) => p.id === progId);
    if (found && (found as any).isSoldOut) {
      showNotification(
        `El programa "${found.title}" se encuentra totalmente agotado. Por favor selecciona otra opción disponible.`,
        'Cupos Agotados'
      );
      return;
    }
    if (mainModality === 'expedition' && found && typeof (found as any).availablePax === 'number' && (found as any).availablePax < passengersCount) {
      showNotification(
        `La expedición "${found.title}" solo cuenta con ${(found as any).availablePax} cupos disponibles y has configurado ${passengersCount} pasajeros. Selecciona otra expedición con cupos suficientes.`,
        'Cupos Insuficientes'
      );
      return;
    }
    setSelectedProgramIds([progId]);
    if (found && (found as any).departureDate && (found as any).returnDate) {
      setStartDate((found as any).departureDate);
      setEndDate((found as any).returnDate);
    }
    if (autoAdvance) {
      setTimeout(() => {
        if (mainModality === 'lodge') {
          setCurrentStep(3);
        } else if (mainModality === 'expedition') {
          setCurrentStep(4);
        } else {
          setCurrentStep(3);
        }
      }, 150);
    }
  };

  // Custom Mode dynamic line items calculation
  // Custom Mode dynamic line items calculation with custom pricing support
  const customProgramsData = useMemo(() => {
    if (mainModality !== 'custom') return [];
    const items: {
      id: string;
      title: string;
      categoryLabel: string;
      defaultPriceClp: number;
      priceClp: number;
      unitType: 'pax' | 'fixed' | 'night';
      description: string;
      pricingUnitLabel: string;
    }[] = [];

    if (selectedCategories.includes('vegvisir')) {
      const defaultPrice = 11100000;
      const effectivePrice = typeof customPriceOverrides['custom-vegvisir'] === 'number'
        ? customPriceOverrides['custom-vegvisir']
        : defaultPrice;
      items.push({
        id: 'custom-vegvisir',
        title: 'Chárter Exclusivo Privado Velero Vegvisir',
        categoryLabel: 'Velero Vegvisir',
        defaultPriceClp: defaultPrice,
        priceClp: effectivePrice,
        unitType: 'fixed',
        description: 'Barco completo a vela con patrón y tripulación (Capacidad máx: 6 PAX)',
        pricingUnitLabel: 'Total Chárter Barco Completo',
      });
    }

    if (selectedCategories.includes('terranova')) {
      const defaultPrice = 16800000;
      const effectivePrice = typeof customPriceOverrides['custom-terranova'] === 'number'
        ? customPriceOverrides['custom-terranova']
        : defaultPrice;
      items.push({
        id: 'custom-terranova',
        title: 'Chárter Exclusivo Privado Yate Terranova',
        categoryLabel: 'Yate Terranova',
        defaultPriceClp: defaultPrice,
        priceClp: effectivePrice,
        unitType: 'fixed',
        description: 'Yate oceánico motorizado de 60 ft exclusivo (Capacidad máx: 8 PAX)',
        pricingUnitLabel: 'Total Chárter Barco Completo',
      });
    }

    if (selectedCategories.includes('lodge')) {
      const cabinsNeeded = Math.max(1, Math.ceil(passengersCount / 3));
      const defaultPrice = cabinsNeeded * 240000;
      const effectivePrice = typeof customPriceOverrides['custom-lodge'] === 'number'
        ? customPriceOverrides['custom-lodge']
        : defaultPrice;
      items.push({
        id: 'custom-lodge',
        title: `Estadía Lodge Rincón (${cabinsNeeded} ${cabinsNeeded === 1 ? 'Cabina' : 'Cabinas'})`,
        categoryLabel: 'Lodge Rincón',
        defaultPriceClp: defaultPrice,
        priceClp: effectivePrice,
        unitType: 'night',
        description: `Hospedaje frente al mar (${cabinsNeeded} cabinas para ${passengersCount} huéspedes)`,
        pricingUnitLabel: 'Tarifa por Noche (Total Cabinas)',
      });
    }

    if (selectedCategories.includes('aeronave')) {
      const defaultPrice = 650000;
      const effectivePrice = typeof customPriceOverrides['custom-aeronave'] === 'number'
        ? customPriceOverrides['custom-aeronave']
        : defaultPrice;
      items.push({
        id: 'custom-aeronave',
        title: 'Traslado Aéreo Santiago ⇄ Isla Robinson Crusoe',
        categoryLabel: 'Aeronave & Vuelos',
        defaultPriceClp: defaultPrice,
        priceClp: effectivePrice,
        unitType: 'pax',
        description: `Vuelo ida y vuelta con 15kg equipaje (${passengersCount} PAX)`,
        pricingUnitLabel: 'Tarifa por Pasajero',
      });
    }

    if (selectedCategories.includes('servicios')) {
      const defaultPrice = 270000;
      const effectivePrice = typeof customPriceOverrides['custom-servicios'] === 'number'
        ? customPriceOverrides['custom-servicios']
        : defaultPrice;
      items.push({
        id: 'custom-servicios',
        title: 'Pack de Excursiones, Buceo & Actividades',
        categoryLabel: 'Excursiones & Actividades',
        defaultPriceClp: defaultPrice,
        priceClp: effectivePrice,
        unitType: 'pax',
        description: `Buceo con lobos marinos, cabalgatas y gastronomía (${passengersCount} PAX)`,
        pricingUnitLabel: 'Tarifa por Pasajero',
      });
    }

    return items;
  }, [mainModality, selectedCategories, passengersCount, customPriceOverrides]);

  // Selected program data
  const selectedProgramsData = useMemo(() => {
    if (mainModality === 'custom') {
      return customProgramsData;
    }
    return availablePrograms.filter((p) => selectedProgramIds.includes(p.id));
  }, [mainModality, customProgramsData, availablePrograms, selectedProgramIds]);

  const activeSelectedProgram = selectedProgramsData[0] || availablePrograms[0] || CATALOG_PROGRAMS[0];

  // Check if currently active selected lodge room is booked for the date range
  const isSelectedLodgeRoomBooked = useMemo(() => {
    if (!isOnlyLodge || !startDate || !endDate || selectedProgramIds.length === 0) return false;
    const targetRoomId = getRoomIdFromProgId(selectedProgramIds[0] || '');
    if (!targetRoomId) return false;
    return isRoomBookedForRange(targetRoomId, startDate, endDate);
  }, [isOnlyLodge, startDate, endDate, selectedProgramIds, isRoomBookedForRange]);

  // Sync selectedProgramIds when availablePrograms change (clear if invalid or sold out)
  useEffect(() => {
    if (availablePrograms.length > 0 && selectedProgramIds.length > 0) {
      const hasValidSelection = selectedProgramIds.some((id) =>
        availablePrograms.some((p) => p.id === id && !(p as any).isSoldOut)
      );
      if (!hasValidSelection) {
        setSelectedProgramIds([]);
      }
    }
  }, [availablePrograms, selectedProgramIds]);

  // Sync passengers list length with passengersCount
  const handlePaxCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(12, newCount));
    setPassengersCount(clamped);

    // Si el nuevo recuento de pasajeros supera la capacidad de una nave ya seleccionada, deseleccionarla
    if (clamped > 6 && selectedCategories.includes('vegvisir')) {
      setSelectedCategories((prev) => prev.filter((c) => c !== 'vegvisir'));
    }
    if (clamped > 8 && selectedCategories.includes('terranova')) {
      setSelectedCategories((prev) => prev.filter((c) => c !== 'terranova'));
    }

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
    if (isDiscountEnabled && discountPercent > 0) {
      const validPercent = Math.min(100, Math.max(0, discountPercent));
      return Math.round((subtotalClp * validPercent) / 100);
    }
    return 0;
  }, [subtotalClp, isDiscountEnabled, discountPercent]);

  const totalFinalClp = Math.max(0, subtotalClp - calculatedDiscountClp);

  // 60-day deadline calculation for the 2nd installment (50/50 payment scheme)
  const secondInstallmentInfo = useMemo(() => {
    if (!startDate) return null;
    try {
      const zarpeDate = new Date(`${startDate}T12:00:00`);
      if (isNaN(zarpeDate.getTime())) return null;

      const dueDate = new Date(zarpeDate);
      dueDate.setDate(dueDate.getDate() - 60);

      const formattedDueDate = dueDate.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const formattedZarpeDate = zarpeDate.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isDueSoonOrPassed = dueDate.getTime() <= today.getTime();

      return {
        formattedDueDate,
        formattedZarpeDate,
        isDueSoonOrPassed,
      };
    } catch {
      return null;
    }
  }, [startDate]);

  // Validation before advancing
  const canProceed = () => {
    if (currentStep === 1) {
      return Boolean(mainModality);
    }

    // EXPEDICIÓN NÁUTICA
    if (mainModality === 'expedition') {
      if (currentStep === 2) {
        // Step 2: Passenger form (lead passenger required)
        const lead = passengers[0];
        return Boolean(lead && lead.fullName.trim() && (lead.email.trim() || lead.phone.trim()));
      }
      if (currentStep === 3) {
        // Step 3: Expedition selection (must have available spots >= passengersCount)
        if (selectedProgramIds.length === 0) return false;
        const target = availablePrograms.find((p: any) => p.id === selectedProgramIds[0]) as any;
        if (!target || target.isSoldOut) return false;
        if (typeof target.availablePax === 'number' && target.availablePax < passengersCount) return false;
        return Boolean(startDate && endDate);
      }
      if (currentStep === 4) return true; // Payment
      if (currentStep === 5) return true; // Summary
      return true;
    }

    // LODGE RINCÓN
    if (mainModality === 'lodge') {
      if (currentStep === 2) {
        // Step 2: Dates + Available Room
        if (!startDate || !endDate || startDate >= endDate) return false;
        if (selectedProgramIds.length === 0) return false;
        if (isSelectedLodgeRoomBooked) return false;
        if (passengersCount > ((activeSelectedProgram as any)?.paxLimit || 3)) return false;
        return true;
      }
      if (currentStep === 3) {
        // Step 3: Guest form (lead guest required)
        const lead = passengers[0];
        return Boolean(lead && lead.fullName.trim() && (lead.email.trim() || lead.phone.trim()));
      }
      if (currentStep === 4) return true; // Payment
      if (currentStep === 5) return true; // Summary
      return true;
    }

    // PERSONALIZADO
    if (mainModality === 'custom') {
      if (currentStep === 2) {
        // Step 2: Pasajeros (requiere datos del titular)
        const lead = passengers[0];
        return Boolean(lead && lead.fullName.trim() && (lead.email.trim() || lead.phone.trim()));
      }
      if (currentStep === 3) {
        // Step 3: Servicios (al menos 1 activo)
        return selectedCategories.length > 0;
      }
      if (currentStep === 4) {
        // Step 4: Fechas (fechas válidas y sin conflictos de disponibilidad en los activos elegidos)
        if (!startDate || !endDate || startDate >= endDate) return false;
        if (customRangeConflict !== null) return false;
        return true;
      }
      if (currentStep === 5) return true; // Payment
      if (currentStep === 6) return true; // Summary
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 1) {
        showNotification('Por favor selecciona una modalidad de reserva (Expedición Náutica, Lodge o Personalizado).', 'Selección Requerida');
      } else if (mainModality === 'expedition') {
        if (currentStep === 2) {
          showNotification('Por favor completa al menos el nombre y teléfono/correo del pasajero titular para continuar a la selección de expedición.', 'Datos de Pasajero Requeridos');
        } else if (currentStep === 3) {
          const target = availablePrograms.find((p: any) => p.id === selectedProgramIds[0]) as any;
          if (target && typeof target.availablePax === 'number' && target.availablePax < passengersCount) {
            showNotification(`La expedición seleccionada solo tiene ${target.availablePax} cupos disponibles y has configurado ${passengersCount} pasajeros. Elige una expedición con cupos suficientes.`, 'Cupos Insuficientes');
          } else {
            showNotification('Por favor selecciona una expedición con cupos disponibles para continuar.', 'Selección Requerida');
          }
        }
      } else if (mainModality === 'lodge') {
        if (currentStep === 2) {
          if (!startDate || !endDate || startDate >= endDate) {
            showNotification('Por favor selecciona una fecha de Check-in y Check-out válida (mínimo 1 noche) para consultar disponibilidad.', 'Fechas Requeridas');
          } else if (selectedProgramIds.length === 0) {
            showNotification('Por favor selecciona una de las habitaciones disponibles para continuar.', 'Habitación Requerida');
          } else if (isSelectedLodgeRoomBooked) {
            showNotification(`La cabina seleccionada no está disponible en las fechas (${formatDateDDMMYYYY(startDate)} al ${formatDateDDMMYYYY(endDate)}). Elige otra habitación disponible.`, 'Habitación no disponible');
          } else if (passengersCount > ((activeSelectedProgram as any)?.paxLimit || 3)) {
            showNotification(`La habitación seleccionada tiene capacidad máxima para ${(activeSelectedProgram as any)?.paxLimit || 3} huéspedes (solicitados: ${passengersCount}). Elige una habitación con mayor capacidad.`, 'Capacidad Excedida');
          }
        } else if (currentStep === 3) {
          showNotification('Por favor completa los datos del huésped principal.', 'Datos Requeridos');
        }
      } else if (mainModality === 'custom') {
        if (currentStep === 2) {
          showNotification('Por favor completa al menos el nombre y teléfono/correo del pasajero titular para continuar a la selección de servicios.', 'Datos de Pasajero Requeridos');
        } else if (currentStep === 3) {
          showNotification('Por favor activa al menos uno de los servicios (Velero, Yate, Lodge, Vuelo o Excursiones) para continuar.', 'Servicios Requeridos');
        } else if (currentStep === 4) {
          if (!startDate || !endDate || startDate >= endDate) {
            showNotification('Por favor define las fechas de inicio y término de la travesía (mínimo 1 noche).', 'Fechas Requeridas');
          } else if (customRangeConflict) {
            showNotification(`Conflicto de disponibilidad en ${customRangeConflict.assetName}: ${customRangeConflict.reason || 'Ocupado en las fechas seleccionadas'}. Por favor selecciona otro rango de fechas.`, 'Fechas No Disponibles');
          }
        }
      } else {
        showNotification('Por favor complete los campos requeridos para continuar.', 'Atención');
      }
      return;
    }

    const maxStep = mainModality === 'custom' ? 6 : 5;
    setCurrentStep((prev) => Math.min(maxStep, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    const randomCode = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalData: BookingWizardData = {
      bookingCode: randomCode,
      mainModality: mainModality || 'custom',
      selectedProgramIds: selectedProgramIds,
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
      paymentScheme,
      discountType: isDiscountEnabled && discountPercent > 0 ? 'percent' : 'none',
      discountValue: isDiscountEnabled ? discountPercent : 0,
      installmentsCount: paymentScheme === '100' ? 1 : paymentScheme === '50' ? 2 : 0,
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
                  Paso {currentStep} de {mainModality === 'custom' ? 6 : 5}
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
          <div className={`grid gap-2 ${mainModality === 'custom' ? 'grid-cols-6' : 'grid-cols-5'}`}>
            {(mainModality === 'expedition'
              ? [
                  { step: 1, label: '1. Modalidad' },
                  { step: 2, label: '2. Pasajeros' },
                  { step: 3, label: '3. Zarpes' },
                  { step: 4, label: '4. Pago' },
                  { step: 5, label: '5. Resumen' },
                ]
              : mainModality === 'lodge'
              ? [
                  { step: 1, label: '1. Modalidad' },
                  { step: 2, label: '2. Estadía & Cabina' },
                  { step: 3, label: '3. Huéspedes' },
                  { step: 4, label: '4. Pago' },
                  { step: 5, label: '5. Resumen' },
                ]
              : [
                  { step: 1, label: '1. Modalidad' },
                  { step: 2, label: '2. Pasajeros' },
                  { step: 3, label: '3. Servicios' },
                  { step: 4, label: '4. Fechas' },
                  { step: 5, label: '5. Pago' },
                  { step: 6, label: '6. Resumen' },
                ]
            ).map((s) => {
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
                  Paso 1 • Selección de Modalidad
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
                    setSelectedProgramIds([]);
                    setStartDate('');
                    setEndDate('');
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
                    setSelectedCategories([]);
                    setSelectedProgramIds([]);
                    setStartDate('');
                    setEndDate('');
                    setTimeout(() => {
                      setCurrentStep(2);
                    }, 120);
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

              {/* Mensaje de guía inferior */}
              <div className="border p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium max-w-lg mx-auto text-center bg-slate-50 border-slate-200 text-slate-500">
                <Sparkles className="w-4 h-4 shrink-0 text-sky-600" />
                <span>Haz clic en cualquiera de las 3 modalidades de reserva para avanzar automáticamente al siguiente paso.</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: LODGE RINCÓN — DISPONIBILIDAD REAL, FECHAS & CANTIDAD DE HUÉSPEDES */}
          {/* ========================================================================= */}
          {currentStep === 2 && mainModality === 'lodge' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                    Lodge Rincón de Navegantes
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 2: Parámetros de Estadía & Disponibilidad en Tiempo Real
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Selecciona la cantidad de huéspedes y las fechas de check-in / check-out para consultar las cabinas con disponibilidad real y capacidad adecuada.
                </p>
              </div>

              {/* CARD DE CONTROL: HUÉSPEDES Y FECHAS DE ESTADÍA */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Cantidad de Huéspedes */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Cantidad de Pasajeros *
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePaxCountChange(num)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                            passengersCount === num
                              ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {num} {num === 1 ? 'PAX' : 'PAX'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha Check-In */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha Check-in (Entrada) *
                    </label>
                    <LuxuryDatePicker
                      value={startDate}
                      defaultYear={new Date().getFullYear()}
                      minDate={new Date().toISOString().split('T')[0]}
                      isDateDisabled={(dIso) =>
                        selectedProgramIds.length > 0
                          ? isDateBookedForRoom(getRoomIdFromProgId(selectedProgramIds[0]), dIso)
                          : false
                      }
                      onChange={(newStart) => {
                        setStartDate(newStart);
                        if (endDate && endDate <= newStart) {
                          setEndDate('');
                        }
                      }}
                      inputClassName="bg-white border-slate-300 focus:border-[#0f2b48] py-2 px-3 text-xs font-mono font-bold text-[#0f2b48]"
                    />
                  </div>

                  {/* Fecha Check-Out */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha Check-out (Salida) *
                    </label>
                    <LuxuryDatePicker
                      value={endDate}
                      defaultYear={new Date().getFullYear()}
                      minDate={startDate || new Date().toISOString().split('T')[0]}
                      isDateDisabled={(dIso) =>
                        selectedProgramIds.length > 0
                          ? isDateBookedForRoom(getRoomIdFromProgId(selectedProgramIds[0]), dIso)
                          : false
                      }
                      onChange={(val) => setEndDate(val)}
                      inputClassName="bg-white border-slate-300 focus:border-[#0f2b48] py-2 px-3 text-xs font-mono font-bold text-[#0f2b48]"
                    />
                  </div>
                </div>

                {/* Resumen dinámico de Noches */}
                {startDate && endDate && startDate < endDate ? (
                  <div className="bg-sky-50/70 border border-sky-200/80 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-sky-950">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        <strong>{calculatedNights} {calculatedNights === 1 ? 'Noche de Estadía' : 'Noches de Estadía'}</strong>: del {formatDateDDMMYYYY(startDate)} al {formatDateDDMMYYYY(endDate)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100/90 border border-sky-200 px-2.5 py-0.5 rounded-full">
                      Filtro activo: {passengersCount} {passengersCount === 1 ? 'Huésped' : 'Huéspedes'}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 border border-amber-200 px-4 py-2 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Selecciona las fechas de Check-in y Check-out para verificar disponibilidad.</span>
                  </div>
                )}
              </div>

              {/* LISTADO DE CABINAS CON DISPONIBILIDAD REAL */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Habitaciones Configuradas ({availablePrograms.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Selecciona una cabina disponible para avanzar
                  </span>
                </div>

                {availablePrograms.map((room) => {
                  const roomId = getRoomIdFromProgId(room.id);
                  const hasDates = Boolean(startDate && endDate && startDate < endDate);
                  const isOccupied = hasDates ? isRoomBookedForRange(roomId, startDate, endDate) : false;
                  const isCapacityExceeded = passengersCount > (room.paxLimit || 3);
                  const isRoomAvailable = hasDates && !isOccupied && !isCapacityExceeded;
                  const isSelected = selectedProgramIds.includes(room.id);
                  const totalRoomStay = (room.priceClp || 240000) * (hasDates ? calculatedNights : 1);

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (!hasDates) {
                          showNotification(
                            'Por favor selecciona las fechas de Check-in y Check-out para consultar disponibilidad y reservar.',
                            'Fechas Requeridas'
                          );
                          return;
                        }
                        if (!isRoomAvailable) {
                          if (isOccupied) {
                            showNotification(
                              `La cabina "${room.title}" no está disponible entre el ${formatDateDDMMYYYY(startDate)} y el ${formatDateDDMMYYYY(endDate)} porque ya tiene una reserva u ocupación confirmada.`,
                              'Habitación Ocupada'
                            );
                          } else if (isCapacityExceeded) {
                            showNotification(
                              `La cabina "${room.title}" tiene capacidad máxima de ${room.paxLimit} huéspedes y has configurado ${passengersCount} pasajeros.`,
                              'Capacidad Insuficiente'
                            );
                          } else {
                            showNotification('Ingresa fechas de entrada y salida válidas para reservar.', 'Fechas Requeridas');
                          }
                          return;
                        }
                        selectProgram(room.id, true);
                      }}
                      className={`p-4.5 rounded-2xl border transition-all duration-200 flex flex-wrap items-center justify-between gap-3 select-none ${
                        !hasDates
                          ? isCapacityExceeded
                            ? 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer'
                          : !isRoomAvailable
                          ? 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-300/40 shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                            isSelected && isRoomAvailable
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isSelected && isRoomAvailable && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>

                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                          <BedDouble className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-serif font-bold text-sm text-[#0f2b48] truncate">
                              {room.title}
                            </h5>
                            {hasDates ? (
                              isRoomAvailable ? (
                                <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  ✓ Disponible para {passengersCount} PAX
                                </span>
                              ) : isOccupied ? (
                                <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                                  ✕ Ocupada en estas fechas
                                </span>
                              ) : isCapacityExceeded ? (
                                <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                  ⚠ Capacidad máx: {room.paxLimit} PAX
                                </span>
                              ) : null
                            ) : isCapacityExceeded ? (
                              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                ⚠ Capacidad máx: {room.paxLimit} PAX
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                                Ingresa fechas para verificar disponibilidad
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-light line-clamp-1">
                            {room.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          {hasDates
                            ? `Total ${calculatedNights} ${calculatedNights === 1 ? 'Noche' : 'Noches'}`
                            : 'Tarifa por Noche'}
                        </span>
                        <div className="text-sm font-mono font-bold text-[#0f2b48]">
                          ${(hasDates ? totalRoomStay : (room.priceClp || 240000)).toLocaleString('es-CL')}{' '}
                          <span className="text-[10px] font-normal text-slate-500 font-sans">CLP</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          ${(room.priceClp || 240000).toLocaleString('es-CL')} / noche
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: EXPEDICIÓN NÁUTICA — ZARPES PROGRAMADOS CON CUPOS PARA X PASAJEROS */}
          {/* ========================================================================= */}
          {currentStep === 3 && mainModality === 'expedition' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                      Zarpes para {passengersCount} {passengersCount === 1 ? 'Pasajero' : 'Pasajeros'}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                    Paso 3: Selecciona la expedición náutica programada
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Se muestran los zarpes configurados. Las travesías con cupos disponibles para {passengersCount} {passengersCount === 1 ? 'pasajero' : 'pasajeros'} están listas para selección con 1 clic.
                  </p>
                </div>

                {/* FILTRO DE MESES DIRECTOS */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {/* Botón Todos los meses */}
                  <button
                    type="button"
                    onClick={() => setExpeditionMonthFilter('all')}
                    className={`h-8 px-3.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 border select-none ${
                      expeditionMonthFilter === 'all'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/70 hover:text-[#0f2b48]'
                    }`}
                  >
                    <span>Todos los meses</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        expeditionMonthFilter === 'all'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {availablePrograms.length}
                    </span>
                  </button>

                  {/* Meses como Botones Directos */}
                  {upcomingMonths.map((m) => {
                    const isActive = expeditionMonthFilter === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setExpeditionMonthFilter(m.key)}
                        className={`h-8 px-3 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 border select-none ${
                          isActive
                            ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/70 hover:text-[#0f2b48]'
                        }`}
                      >
                        <span>{m.shortLabel}</span>
                        {m.count > 0 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {m.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {displayedProgramsInStep2.length > 0 ? (
                  displayedProgramsInStep2.map((prog: any) => {
                    const isSelected = selectedProgramIds.includes(prog.id);
                    const isSoldOut = Boolean(prog.isSoldOut || (typeof prog.availablePax === 'number' && prog.availablePax <= 0));
                    const availableSpots = typeof prog.availablePax === 'number' ? prog.availablePax : 6;
                    const maxSpots = prog.paxLimit || 6;
                    const hasCapacity = !isSoldOut && availableSpots >= passengersCount;

                    return (
                      <div
                        key={prog.id}
                        onClick={() => {
                          if (!hasCapacity) {
                            if (isSoldOut || availableSpots <= 0) {
                              showNotification(
                                `La expedición "${prog.title}" (${prog.duration}) ya tiene todos sus cupos reservados (Agotada). Selecciona otra expedición con cupos disponibles.`,
                                'Expedición Agotada'
                              );
                            } else {
                              showNotification(
                                `La expedición "${prog.title}" solo cuenta con ${availableSpots} ${availableSpots === 1 ? 'cupo libre' : 'cupos libres'} y has solicitado ${passengersCount} pasajeros. Por favor elige una expedición con al menos ${passengersCount} cupos o regresa al Paso 2 para ajustar la cantidad de pasajeros.`,
                                'Cupos Insuficientes'
                              );
                            }
                            return;
                          }
                          selectProgram(prog.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-wrap items-center justify-between gap-3 select-none ${
                          !hasCapacity
                            ? 'bg-slate-50/80 border-slate-200 opacity-60 cursor-not-allowed text-slate-400'
                            : isSelected
                            ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-300/40 shadow-xs cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              !hasCapacity
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : isSelected
                                ? 'bg-[#0f2b48] border-[#0f2b48] text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {isSelected && hasCapacity && <div className="w-2 h-2 bg-white rounded-full" />}
                            {!hasCapacity && <span className="text-[10px] leading-none font-bold text-slate-500">✕</span>}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className={`font-serif font-bold text-sm truncate ${!hasCapacity ? 'text-slate-500' : 'text-[#0f2b48]'}`}>
                                {prog.title}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                • {prog.duration}
                              </span>
                              {isSoldOut || availableSpots <= 0 ? (
                                <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                                  ✕ Agotada (0 cupos)
                                </span>
                              ) : availableSpots < passengersCount ? (
                                <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                  ⚠ Cupos insuficientes ({availableSpots} {availableSpots === 1 ? 'libre' : 'libres'} vs {passengersCount} PAX)
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  ✓ Disponible ({availableSpots} de {maxSpots} PAX libres)
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] font-light line-clamp-1 ${!hasCapacity ? 'text-slate-400' : 'text-slate-500'}`}>
                              {prog.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                            Tarifa
                          </span>
                          <div className={`text-sm font-mono font-bold ${!hasCapacity ? 'text-slate-400' : 'text-[#0f2b48]'}`}>
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
                        No hay expediciones disponibles para esta selección
                      </h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Prueba cambiando el filtro de mes a "Todos los meses" para ver todas las salidas programadas.
                      </p>
                    </div>
                    {expeditionMonthFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setExpeditionMonthFilter('all')}
                        className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold transition hover:bg-sky-700 cursor-pointer"
                      >
                        Ver todos los meses
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: PERSONALIZADO — SELECCIÓN DE ACTIVOS / SERVICIOS (ÍCONOS CIRCULARES) */}
          {/* ========================================================================= */}
          {currentStep === 3 && mainModality === 'custom' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                    Expedición Personalizada a Medida
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                    {passengersCount} {passengersCount === 1 ? 'Pasajero configurado' : 'Pasajeros configurados'}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 3: Selecciona los servicios de esta expedición personalizada
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Haz clic en los íconos circulares para activar o desactivar cada componente que integrará esta travesía:
                </p>
              </div>

              {/* SELECTOR DE SERVICIOS CON ÍCONOS CIRCULARES */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-2">
                  {[
                    { id: 'vegvisir', title: 'Velero Vegvisir', desc: 'Travesía oceánica', maxPax: 6, icon: Sailboat },
                    { id: 'terranova', title: 'Yate Terranova', desc: 'Yate a motor', maxPax: 8, icon: Ship },
                    { id: 'lodge', title: 'Lodge Rincón', desc: 'Cabinas & Estadía', maxPax: 12, icon: BedDouble },
                    { id: 'servicios', title: 'Excursiones & Buceo', desc: 'Actividades & Tours', maxPax: 12, icon: Compass },
                    { id: 'aeronave', title: 'Aeronave & Vuelos', desc: 'Vuelos Robinson Crusoe', maxPax: 12, icon: Plane },
                  ].map((item) => {
                    const isSelected = selectedCategories.includes(item.id);
                    const isOverCapacity = Boolean(item.maxPax && passengersCount > item.maxPax);
                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="relative group/iconbtn flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isOverCapacity) {
                              showNotification(
                                `El ${item.title} tiene una capacidad máxima de ${item.maxPax} pasajeros y has configurado ${passengersCount} personas en el grupo.`,
                                'Capacidad Excedida'
                              );
                              return;
                            }
                            toggleCategory(item.id);
                          }}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95 relative border-2 ${
                            isOverCapacity
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50 shadow-none hover:scale-100'
                              : isSelected
                              ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-lg shadow-[#0f2b48]/30 scale-105 ring-4 ring-amber-100'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-[#0f2b48]/40 hover:text-[#0f2b48] hover:bg-slate-50'
                          }`}
                          title={
                            isOverCapacity
                              ? `No disponible para ${passengersCount} pasajeros (Capacidad máx: ${item.maxPax})`
                              : `Activar/Desactivar ${item.title}`
                          }
                        >
                          <Icon className="w-8 h-8" />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white animate-scale-in">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          {isOverCapacity && (
                            <div className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                              ✕
                            </div>
                          )}
                        </button>
                        <div className="text-center">
                          <span
                            className={`text-xs font-bold block leading-tight transition ${
                              isOverCapacity ? 'text-slate-300 line-through' : isSelected ? 'text-[#0f2b48]' : 'text-slate-600'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isOverCapacity ? `Máx ${item.maxPax} PAX` : item.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de servicios activos */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0f2b48]">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedCategories.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} ${selectedCategories.length === 1 ? 'servicio activo' : 'servicios activos'} seleccionados para el grupo (${passengersCount} PAX)`
                        : 'Haz clic en los íconos para seleccionar al menos 1 servicio'}
                    </span>
                  </div>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2 rounded-full bg-[#0f2b48] text-white text-xs font-bold transition hover:bg-[#182a44] cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Siguiente: Fechas de Travesía</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: FECHAS DE LA TRAVESÍA (SOLO PERSONALIZADO)                        */}
          {/* ========================================================================= */}
          {currentStep === 4 && mainModality === 'custom' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                    Expedición a Medida
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  Paso 4: Define las fechas de la travesía personalizada
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Selecciona la fecha de inicio (zarpe o check-in) y fecha de término para la expedición a medida:
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fecha Inicio */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha de Inicio / Zarpe *
                    </label>
                    <LuxuryDatePicker
                      value={startDate}
                      defaultYear={new Date().getFullYear()}
                      minDate={new Date().toISOString().split('T')[0]}
                      disabledDateRanges={customDisabledDateRanges}
                      isDateDisabled={isCustomDateBlocked}
                      onChange={(val) => setStartDate(val)}
                      inputClassName="bg-slate-50 border-slate-300/80 focus:border-[#0f2b48] focus:bg-white py-2.5 px-3 text-xs font-mono font-bold text-[#0f2b48]"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0f2b48] uppercase tracking-wider font-mono">
                      Fecha de Término / Desembarque *
                    </label>
                    <LuxuryDatePicker
                      value={endDate}
                      defaultYear={new Date().getFullYear()}
                      minDate={startDate || new Date().toISOString().split('T')[0]}
                      disabledDateRanges={customDisabledDateRanges}
                      isDateDisabled={isCustomDateBlocked}
                      onChange={(val) => setEndDate(val)}
                      inputClassName="bg-slate-50 border-slate-300/80 focus:border-[#0f2b48] focus:bg-white py-2.5 px-3 text-xs font-mono font-bold text-[#0f2b48]"
                    />
                  </div>
                </div>

                {/* Resumen de Duración */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0f2b48] shadow-2xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#0f2b48] block">Duración Estimada</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {startDate && endDate && startDate <= endDate
                          ? `${calculatedNights} ${calculatedNights === 1 ? 'Día / Noche' : 'Días / Noches'} (${formatDateDDMMYYYY(startDate)} ➔ ${formatDateDDMMYYYY(endDate)})`
                          : 'Selecciona fecha de inicio y término'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
                    Travesía a Medida
                  </span>
                </div>

                {/* VERIFICACIÓN DE DISPONIBILIDAD EN TIEMPO REAL POR ACTIVO */}
                <div className="bg-slate-50/60 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b48]" />
                      Disponibilidad en Tiempo Real ({selectedCategories.length} {selectedCategories.length === 1 ? 'servicio' : 'servicios'})
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {startDate && endDate && startDate < endDate
                        ? `${formatDateDDMMYYYY(startDate)} ➔ ${formatDateDDMMYYYY(endDate)}`
                        : 'Ingresa fechas para validar'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCategories.map((catId) => {
                      const check = checkAssetAvailabilityForRange(catId, startDate, endDate);
                      const hasDates = Boolean(startDate && endDate && startDate < endDate);

                      return (
                        <div
                          key={catId}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            !hasDates
                              ? 'bg-white border-slate-200 text-slate-600'
                              : check.available
                              ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900 shadow-2xs'
                              : 'bg-rose-50 border-rose-200 text-rose-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {!hasDates ? (
                              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : check.available ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="font-bold truncate">{check.assetName}</span>
                          </div>

                          <span className="text-[10px] font-mono font-bold shrink-0 ml-2">
                            {!hasDates
                              ? 'Pendiente'
                              : check.available
                              ? '✓ Disponible'
                              : '✕ Ocupado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Alerta si hay conflicto */}
                  {customRangeConflict && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Conflicto de disponibilidad detectado:</strong>
                        <span>
                          {customRangeConflict.assetName}: {customRangeConflict.reason || 'No cuenta con disponibilidad en las fechas indicadas'}. Por favor selecciona otro rango de fechas.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO DE PASAJEROS: Step 2 para expedición, Step 3 para lodge, Step 2 para custom */}
          {/* ========================================================================= */}
          {((mainModality === 'expedition' && currentStep === 2) ||
            (mainModality === 'lodge' && currentStep === 3) ||
            (mainModality === 'custom' && currentStep === 2)) && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border bg-sky-50 text-sky-800 border-sky-200">
                      {mainModality === 'expedition'
                        ? 'Manifiesto de Expedición'
                        : mainModality === 'lodge'
                        ? 'Huéspedes Lodge'
                        : 'Manifiesto Personalizado'}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                    {mainModality === 'expedition'
                      ? 'Paso 2: Cantidad de Pasajeros y Datos Personales'
                      : mainModality === 'lodge'
                      ? 'Paso 3: Fichas y Datos de los Huéspedes'
                      : 'Paso 2: Cantidad de Pasajeros y Fichas de Clientes'}
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    {mainModality === 'expedition'
                      ? 'Indica cuántos pasajeros viajarán y completa sus datos para consultar las expediciones con cupos disponibles.'
                      : mainModality === 'lodge'
                      ? 'Cada huésped será registrado automáticamente en la base de datos de Clientes CRM.'
                      : 'Define el tamaño del grupo y sus datos personales antes de seleccionar los activos y servicios de la travesía.'}
                  </p>
                </div>

                {/* MODERN LUXURY CIRCULAR PAX STEPPER */}
                <div className="flex items-center bg-[#f4f7fa] border border-slate-200/90 rounded-full p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handlePaxCountChange(passengersCount - 1)}
                    disabled={passengersCount <= 1}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-[#0f2b48] hover:bg-slate-50 active:scale-95 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                    title="Disminuir pasajero"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <div className="flex items-center gap-1.5 px-3 min-w-[56px] justify-center select-none">
                    <Users className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="font-mono font-bold text-sm text-[#0f2b48]">
                      {passengersCount}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaxCountChange(passengersCount + 1)}
                    disabled={passengersCount >= 12}
                    className="w-8 h-8 rounded-full bg-[#0f2b48] text-white hover:bg-[#182a44] active:scale-95 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-xs"
                    title="Agregar pasajero"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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

                    {/* FILA 1: IDENTIFICACIÓN & NACIMIENTO (3 COLUMNAS AMPLIAS) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Ignacio Alarcón Rodríguez"
                          value={pax.fullName}
                          onChange={(e) => updatePassengerField(idx, 'fullName', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-medium focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          RUT o Pasaporte *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 17.318.824-2"
                          value={pax.rutOrPassport}
                          onChange={(e) => updatePassengerField(idx, 'rutOrPassport', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Fecha de Nacimiento
                        </label>
                        <LuxuryDatePicker
                          value={pax.birthDate || ''}
                          defaultYear={1990}
                          placeholder="dd/mm/aaaa"
                          onChange={(val) => updatePassengerField(idx, 'birthDate', val)}
                          inputClassName="bg-white border-slate-200/90 focus:border-[#0f2b48] py-2.5 px-3.5 text-xs text-[#0f2b48]"
                        />
                      </div>
                    </div>

                    {/* FILA 2: CONTACTO DIRECTO (2 COLUMNAS AMPLIAS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={pax.email}
                          onChange={(e) => updatePassengerField(idx, 'email', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          placeholder="+56 9 1234 5678"
                          value={pax.phone}
                          onChange={(e) => updatePassengerField(idx, 'phone', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] font-mono focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                          required
                        />
                      </div>
                    </div>

                    {/* FILA 3: REQUERIMIENTOS ESPECIALES & NOTAS (2 COLUMNAS AMPLIAS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Preferencias Alimentarias / Alergias (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Celíaco, vegetariano, alérgico a nueces, sin mariscos..."
                          value={pax.dietaryPreferences}
                          onChange={(e) => updatePassengerField(idx, 'dietaryPreferences', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1 font-mono">
                          Notas Médicas / Buceo (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Certificación PADI Advanced, talla L, seguro médico..."
                          value={pax.notes}
                          onChange={(e) => updatePassengerField(idx, 'notes', e.target.value)}
                          className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0f2b48] focus:outline-none focus:border-[#0f2b48] shadow-2xs transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO DE PAGO: Step 4 para expedición/lodge, Step 5 para custom            */}
          {/* ========================================================================= */}
          {((mainModality !== 'custom' && currentStep === 4) ||
            (mainModality === 'custom' && currentStep === 5)) && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  {mainModality === 'custom' ? 'Paso 5: Plan de Cuotas y Descuentos' : 'Paso 4: Plan de Cuotas y Descuentos'}
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

              {/* DETALLE DESGLOSADO DE SERVICIOS / ACTIVOS */}
              {selectedProgramsData.length > 0 && (
                <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Componentes & Servicios Incluidos ({selectedProgramsData.length})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {passengersCount} PAX • {calculatedNights} {calculatedNights === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {selectedProgramsData.map((item) => {
                      const itemSubtotal = item.unitType === 'fixed'
                        ? item.priceClp
                        : item.unitType === 'night'
                        ? item.priceClp * calculatedNights
                        : item.priceClp * passengersCount;

                      const isCustomMode = mainModality === 'custom';
                      const defaultPrice = (item as any).defaultPriceClp;
                      const isOverridden = isCustomMode && defaultPrice !== undefined && item.priceClp !== defaultPrice;

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-xs shadow-2xs hover:border-slate-300 transition"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-[#0f2b48] block text-xs sm:text-sm">
                                {item.title}
                              </span>
                              {isOverridden && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-mono font-bold shrink-0">
                                  Tarifa Editada
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-light block">
                              {item.description}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {item.unitType === 'fixed'
                                ? 'Chárter Barco Completo'
                                : item.unitType === 'night'
                                ? `${calculatedNights} ${calculatedNights === 1 ? 'noche' : 'noches'} (${formatDateDDMMYYYY(startDate)} al ${formatDateDDMMYYYY(endDate)})`
                                : `${passengersCount} PAX`}
                            </span>
                          </div>

                          {/* CONTROLES DE PRECIO */}
                          {isCustomMode ? (
                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                              {/* Campo de edición directa del valor */}
                              <div className="space-y-1 text-right">
                                <label className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                                  {(item as any).pricingUnitLabel || 'Modificar Tarifa'}
                                </label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-2.5 text-xs font-mono font-bold text-slate-400">$</span>
                                  <input
                                    type="text"
                                    value={item.priceClp ? item.priceClp.toLocaleString('es-CL') : ''}
                                    onChange={(e) => {
                                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                                      const parsed = parseInt(digitsOnly, 10);
                                      setCustomPriceOverrides((prev) => ({
                                        ...prev,
                                        [item.id]: isNaN(parsed) ? 0 : parsed,
                                      }));
                                    }}
                                    placeholder="0"
                                    className="w-36 bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-200 focus:border-[#0f2b48] rounded-xl pl-6 pr-2.5 py-1.5 text-right font-mono font-bold text-xs text-[#0f2b48] focus:outline-none transition shadow-2xs"
                                  />
                                </div>
                              </div>

                              {/* Columna de Subtotal & Restablecer */}
                              <div className="text-right min-w-[115px] pl-3 border-l border-slate-100 space-y-0.5">
                                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                                  Subtotal
                                </span>
                                <span className="font-mono font-bold text-xs sm:text-sm text-[#0f2b48] block">
                                  ${itemSubtotal.toLocaleString('es-CL')}
                                </span>
                                {isOverridden && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomPriceOverrides((prev) => {
                                        const next = { ...prev };
                                        delete next[item.id];
                                        return next;
                                      });
                                    }}
                                    className="text-[10px] text-sky-700 hover:text-sky-900 font-mono underline hover:no-underline cursor-pointer block"
                                    title="Restablecer tarifa estándar original"
                                  >
                                    Restablecer
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-[#0f2b48] text-sm block">
                                ${itemSubtotal.toLocaleString('es-CL')} CLP
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {item.unitType === 'fixed'
                                  ? 'Chárter Barco Completo'
                                  : item.unitType === 'night'
                                  ? `${calculatedNights} ${calculatedNights === 1 ? 'noche' : 'noches'}`
                                  : `${passengersCount} PAX`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODALIDAD DE PAGO Y RESERVA OFICIAL */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-4 h-4 text-sky-600" />
                      <span>Modalidad de Pago y Reserva</span>
                    </label>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Selecciona el esquema comercial oficial para la reserva:
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                    paymentScheme === '100'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : paymentScheme === '50'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {paymentScheme === '100'
                      ? '✓ Reserva 100% Confirmada'
                      : paymentScheme === '50'
                      ? '⚓ Reserva de Cupo (50/50)'
                      : '⚡ Registro Lead (Sin Cupo)'}
                  </span>
                </div>

                {/* 3 OPCIONES OFICIALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Opción 1: 100% Reserva Confirmada */}
                  <div
                    onClick={() => setPaymentScheme('100')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      paymentScheme === '100'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md scale-[1.01]'
                        : 'bg-white text-[#0f2b48] border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          paymentScheme === '100'
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          100% Contado
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          paymentScheme === '100' ? 'bg-white text-[#0f2b48] border-white' : 'border-slate-300'
                        }`}>
                          {paymentScheme === '100' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h5 className="font-serif font-bold text-sm mb-1">
                        Reserva Confirmada
                      </h5>
                      <p className={`text-xs leading-relaxed font-light ${
                        paymentScheme === '100' ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        Pago del 100% al momento de reservar. Garantiza y confirma los cupos de manera inmediata y definitiva.
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100/20 flex items-baseline justify-between">
                      <span className={`text-[10px] font-mono uppercase ${paymentScheme === '100' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Monto Total:
                      </span>
                      <span className="font-mono font-bold text-sm">
                        ${totalFinalClp.toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  </div>

                  {/* Opción 2: 50% Reserva de Cupo */}
                  <div
                    onClick={() => setPaymentScheme('50')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      paymentScheme === '50'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md scale-[1.01]'
                        : 'bg-white text-[#0f2b48] border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          paymentScheme === '50'
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}>
                          50% Abono Inicial
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          paymentScheme === '50' ? 'bg-white text-[#0f2b48] border-white' : 'border-slate-300'
                        }`}>
                          {paymentScheme === '50' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h5 className="font-serif font-bold text-sm mb-1">
                        Reserva de Puesto (50/50)
                      </h5>
                      <p className={`text-xs leading-relaxed font-light ${
                        paymentScheme === '50' ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        Abona el 50% para asegurar el puesto oficial. El 50% restante vence el{' '}
                        <strong className={paymentScheme === '50' ? 'text-white font-bold' : 'text-[#0f2b48] font-bold'}>
                          {secondInstallmentInfo ? secondInstallmentInfo.formattedDueDate : '60 días antes del zarpe'}
                        </strong>.
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100/20 flex items-baseline justify-between">
                      <span className={`text-[10px] font-mono uppercase ${paymentScheme === '50' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Pie Inicial (50%):
                      </span>
                      <span className="font-mono font-bold text-sm">
                        ${Math.round(totalFinalClp * 0.5).toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  </div>

                  {/* Opción 3: 0% Lead / Cotización */}
                  <div
                    onClick={() => setPaymentScheme('0')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      paymentScheme === '0'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-md scale-[1.01]'
                        : 'bg-white text-[#0f2b48] border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          paymentScheme === '0'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          0% Sin Abono (Lead)
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          paymentScheme === '0' ? 'bg-white text-[#0f2b48] border-white' : 'border-slate-300'
                        }`}>
                          {paymentScheme === '0' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h5 className="font-serif font-bold text-sm mb-1">
                        Posible Lead / Cotización
                      </h5>
                      <p className={`text-xs leading-relaxed font-light ${
                        paymentScheme === '0' ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        Llena el formulario y registra ficha comercial. No ocupa cupo hasta que pague al menos el 50%.
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100/20 flex items-baseline justify-between">
                      <span className={`text-[10px] font-mono uppercase ${paymentScheme === '0' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Abono Inmediato:
                      </span>
                      <span className="font-mono font-bold text-sm">
                        $0 CLP <span className="text-[10px] font-normal opacity-75">(Sin Cupo)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Dynamic Breakdown */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-[#0f2b48]">
                      Desglose del Esquema Seleccionado:
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {paymentScheme === '100'
                        ? '1 Pago Total de $' + totalFinalClp.toLocaleString('es-CL') + ' CLP'
                        : paymentScheme === '50'
                        ? '2 Cuotas (50/50): Pie $' + Math.round(totalFinalClp * 0.5).toLocaleString('es-CL') + ' + Saldo $' + (totalFinalClp - Math.round(totalFinalClp * 0.5)).toLocaleString('es-CL') + ' CLP'
                        : 'Registro de Lead: $0 CLP Inmediato (Saldo $' + totalFinalClp.toLocaleString('es-CL') + ' CLP pendiente)'}
                    </span>
                  </div>

                  {paymentScheme === '100' && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-emerald-800 mb-1">
                        <span>Pago Único (100%)</span>
                        <span>Reserva Confirmada Inmediata</span>
                      </div>
                      <div className="text-base font-mono font-bold text-[#0f2b48]">
                        ${totalFinalClp.toLocaleString('es-CL')} <span className="text-xs font-normal text-slate-500">CLP</span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-light block mt-1">
                        Al momento de confirmar la reserva • Garantiza y bloquea el cupo de forma definitiva.
                      </span>
                    </div>
                  )}

                  {paymentScheme === '50' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-sky-800 mb-1">
                          <span>Cuota #1 (50%)</span>
                          <span>Pie / Reserva de Puesto</span>
                        </div>
                        <div className="text-base font-mono font-bold text-[#0f2b48]">
                          ${Math.round(totalFinalClp * 0.5).toLocaleString('es-CL')} <span className="text-xs font-normal text-slate-500">CLP</span>
                        </div>
                        <span className="text-[11px] text-slate-600 font-light block mt-1">
                          Al momento de confirmar reserva • Bloquea y asegura el cupo oficial en la expedición.
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                          <span>Cuota #2 (50%)</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            secondInstallmentInfo?.isDueSoonOrPassed
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            {secondInstallmentInfo ? `Vence: ${secondInstallmentInfo.formattedDueDate}` : 'Saldo Final (60 días antes)'}
                          </span>
                        </div>
                        <div className="text-base font-mono font-bold text-[#0f2b48]">
                          ${(totalFinalClp - Math.round(totalFinalClp * 0.5)).toLocaleString('es-CL')} <span className="text-xs font-normal text-slate-500">CLP</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 font-light flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          {secondInstallmentInfo ? (
                            <span>
                              Fecha límite: <strong className="text-[#0f2b48] font-bold">{secondInstallmentInfo.formattedDueDate}</strong>{' '}
                              <span className="text-slate-400 font-mono text-[10px]">(60 días antes del zarpe: {secondInstallmentInfo.formattedZarpeDate})</span>
                            </span>
                          ) : (
                            <span>
                              A pagar a más tardar <strong>60 días antes</strong> de la fecha de zarpe / check-in.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentScheme === '0' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-amber-800">
                        <span>Registro de Solicitud (0%)</span>
                        <span>Lead / Cotización</span>
                      </div>
                      <div className="text-base font-mono font-bold text-[#0f2b48]">
                        $0 <span className="text-xs font-normal text-slate-500">CLP a cobrar hoy</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed font-light">
                        ⚠️ <strong>Importante:</strong> Esta modalidad registra al cliente como un Lead comercial y crea su cotización. <strong>No ocupa ni descuenta cupos en el zarpe</strong> hasta que el cliente efectúe el abono del 50% (${Math.round(totalFinalClp * 0.5).toLocaleString('es-CL')} CLP).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCUENTO PERSONALIZADO CON SWITCH */}
              <div className="bg-[#fbfcfd] border border-slate-200/90 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-2xs">
                      <Percent className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#0f2b48] block">
                        Aplicar Descuento a la Reserva
                      </label>
                      <p className="text-[11px] text-slate-500 font-light">
                        {isDiscountEnabled
                          ? 'Ingresa el porcentaje que se descontará sobre el valor total.'
                          : 'Activa el switch para aplicar un porcentaje de descuento comercial.'}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDiscountEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setIsDiscountEnabled(enabled);
                        if (!enabled) {
                          setDiscountPercent(0);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f2b48]"></div>
                    <span className="ml-2.5 text-xs font-mono font-bold text-[#0f2b48]">
                      {isDiscountEnabled ? 'Activado' : 'Desactivado'}
                    </span>
                  </label>
                </div>

                {/* Input de porcentaje cuando el Switch está activo */}
                {isDiscountEnabled && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#0f2b48] font-mono whitespace-nowrap">
                        Porcentaje de Descuento:
                      </span>
                      <div className="relative flex items-center w-28">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          autoFocus
                          placeholder="0"
                          value={discountPercent || ''}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            setDiscountPercent(val);
                          }}
                          className="w-full bg-white border border-slate-300 focus:border-[#0f2b48] rounded-xl py-2 pl-3 pr-7 text-xs font-mono font-bold text-[#0f2b48] focus:outline-none shadow-2xs transition"
                        />
                        <span className="absolute right-3 text-xs font-mono font-bold text-slate-400 pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                        <span>Ahorro total:</span>
                        <span>-${calculatedDiscountClp.toLocaleString('es-CL')} CLP ({discountPercent}%)</span>
                      </div>
                    )}
                  </div>
                )}
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
                    <span className="text-sm font-serif font-bold block">TOTAL FINAL:</span>
                    <span className="text-xs text-sky-200 font-mono font-light">
                      {paymentScheme === '100'
                        ? '1 Pago del 100% Contado (Reserva Confirmada)'
                        : paymentScheme === '50'
                        ? `Abono 50% ($${Math.round(totalFinalClp * 0.5).toLocaleString('es-CL')} CLP) + Saldo 50% a 60 días`
                        : '0% Sin Abono (Lead Comercial • Sin Cupo)'}
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
          {/* PASO DE RESUMEN: Step 5 para expedición/lodge, Step 6 para custom         */}
          {/* ========================================================================= */}
          {((mainModality !== 'custom' && currentStep === 5) ||
            (mainModality === 'custom' && currentStep === 6)) && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#0f2b48]">
                  {mainModality === 'custom' ? 'Paso 6: Resumen Ejecutivo y Creación de Reserva' : 'Paso 5: Resumen Ejecutivo y Creación de Reserva'}
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
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      paymentScheme === '100'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : paymentScheme === '50'
                        ? 'text-sky-700 bg-sky-50 border-sky-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {paymentScheme === '100'
                        ? '100% Contado (Confirmada)'
                        : paymentScheme === '50'
                        ? `50% Abono ($${Math.round(totalFinalClp * 0.5).toLocaleString('es-CL')} CLP)`
                        : '0% Lead / Cotización (Sin Cupo)'}
                    </span>
                  </div>
                </div>

                {/* ASSETS & PROGRAMS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                      Programas & Servicios Incluidos
                    </span>
                    <ul className="space-y-1.5">
                      {selectedProgramsData.map((prog) => {
                        const itemSubtotal = prog.unitType === 'fixed'
                          ? prog.priceClp
                          : prog.unitType === 'night'
                          ? prog.priceClp * calculatedNights
                          : prog.priceClp * passengersCount;

                        const isOverridden = mainModality === 'custom' && (prog as any).defaultPriceClp !== undefined && prog.priceClp !== (prog as any).defaultPriceClp;

                        return (
                          <li key={prog.id} className="text-xs font-semibold text-[#0f2b48] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{prog.title}</span>
                              {isOverridden && (
                                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                                  Tarifa editada
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                              ${itemSubtotal.toLocaleString('es-CL')}
                            </span>
                          </li>
                        );
                      })}
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
                        <span><strong>Modalidad:</strong> {paymentScheme === '100' ? '100% Contado' : paymentScheme === '50' ? '50% Abono + 50% Saldo' : '0% Lead Comercial'}</span>
                      </div>
                      {paymentScheme === '50' && secondInstallmentInfo && (
                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px] leading-tight">
                          <span className="font-bold font-mono">📅 Vencimiento Cuota #2 (50%):</span> {secondInstallmentInfo.formattedDueDate}{' '}
                          <span className="text-sky-700/80 font-mono text-[10px]">(60 días antes de zarpe)</span>
                        </div>
                      )}
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
            {(mainModality === 'custom' ? currentStep < 6 : currentStep < 5) ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white font-semibold transition shadow-md shadow-[#0b192c]/20 flex items-center gap-2 cursor-pointer text-xs active:scale-95"
              >
                <span>
                  {mainModality === 'expedition' && currentStep === 2
                    ? 'Continuar a Selección de Zarpe'
                    : 'Siguiente Paso'}
                </span>
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
