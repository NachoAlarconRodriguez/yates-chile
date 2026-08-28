import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Sailboat,
  BedDouble,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapPin,
  Utensils,
  Waves,
  CloudSun,
  Anchor,
  Eye,
  Check,
  Download,
  ArrowRight,
  CalendarDays,
  Plus,
  ShieldCheck,
  Info
} from 'lucide-react';
import { expeditionService, type DepartureRow } from '../../services/expeditionService';
import { lodgeService, type LodgeRoom, type LodgeBooking } from '../../services/lodgeService';
import { useFleet } from '../../hooks/useFleet';
import confetti from 'canvas-confetti';

export interface ExpeditionWizardData {
  vesselId: 'vegvisir' | 'terranova' | string;
  routeId: string;
  customRouteTitle?: string;
  lodgingType: 'onboard' | 'lodge' | 'mixed';
  selectedRoomIds: string[];
  selectedServiceIds: string[];
  durationDays: number;
  departureDate: string;
  returnDate: string;
  totalSlots: number;
  pricePerPaxClp: number;
  priceCharterFullClp: number;
  status: 'scheduled' | 'guaranteed';
  publicName: string;
  publicHeadline: string;
  publicLocation: string;
  publicCoverImage: string;
  publicDescription: string;
  publicTempEstimate: string;
  publicPillars: Array<{ title: string; desc: string; iconKey: 'sail' | 'food' | 'anchor' | 'waves' | 'compass' | 'footprints' }>;
  publicIncluded: string[];
  publicWeatherPolicy: string;
}

interface ExpeditionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ExpeditionWizardData) => void;
  existingDepartures?: DepartureRow[];
}

export interface CustomVesselItem {
  id: string;
  name: string;
  type: string;
  tagline: string;
  length: string;
  capacity: string;
  maxPax: number;
  cabins: string;
  bathrooms: string;
  image: string;
  isCustom?: boolean;
}

const SAMPLE_COVERS = [
  { label: 'Velero Vegvisir', url: '/velero-vegvisir.jpg' },
  { label: 'Yate Terranova', url: '/yate-terranova.jpg' },
  { label: 'Lodge Rincón de Navegantes', url: '/rincon-de-navegantes.jpg' },
  { label: 'Acantilados & Bahía Cumberland', url: '/juan-fernandez-selkirk.jpg' },
  { label: 'Expedición en Alta Mar', url: '/expediciones-hero.jpg' },
];

const WIZARD_STEPS = [
  { step: 1, label: '1. Fechas', desc: 'Zarpe & Retorno', icon: CalendarDays },
  { step: 2, label: '2. Embarcación', desc: 'Flota & Disponibilidad', icon: Sailboat },
  { step: 3, label: '3. Hospedaje', desc: 'A Bordo o Lodge', icon: BedDouble },
  { step: 4, label: '4. Pasajeros', desc: 'Cupos & Tarifas', icon: Users },
  { step: 5, label: '5. Ficha Web', desc: 'Fotografía & Pilares', icon: Eye },
  { step: 6, label: '6. Resumen', desc: 'Confirmación & Publicar', icon: CheckCircle2 },
];

export const ExpeditionWizardModal: React.FC<ExpeditionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingDepartures = []
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showNewVesselModal, setShowNewVesselModal] = useState(false);

  // External data loaded from services
  const [rooms, setRooms] = useState<LodgeRoom[]>([]);
  const [lodgeBookings, setLodgeBookings] = useState<LodgeBooking[]>([]);
  const [dbDepartures, setDbDepartures] = useState<DepartureRow[]>(existingDepartures);

  // Form for adding a new vessel
  const [newVesselForm, setNewVesselForm] = useState({
    name: '',
    type: 'Velero de Expedición',
    tagline: '',
    length: '50 ft',
    maxPax: 10,
    cabins: '4 Cabinas',
    bathrooms: '4 Baños',
    image: '/expediciones-hero.jpg',
  });

  // Step 1: Fechas (Check-in / Zarpe & Check-out / Retorno)
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 37); // 8 días por defecto
    return d.toISOString().split('T')[0];
  });
  const [activeDateField, setActiveDateField] = useState<'start' | 'end'>('start');
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Step 2: Embarcación
  const [vesselId, setVesselId] = useState<string>('vegvisir');

  // Step 3: Hospedaje (A Bordo vs En el Lodge)
  const [lodgingType, setLodgingType] = useState<'onboard' | 'lodge' | 'mixed'>('onboard');

  // Step 4: Pax & Pricing
  const [totalSlots, setTotalSlots] = useState<number>(8);
  const [pricePerPaxClp, setPricePerPaxClp] = useState<number>(1850000);
  const [priceCharterFullClp, setPriceCharterFullClp] = useState<number>(14800000);
  const [status, setStatus] = useState<'scheduled' | 'guaranteed'>('scheduled');

  // Step 5: Public Content & Photo
  const [publicName, setPublicName] = useState<string>('Travesía Robinson Crusoe');
  const [publicHeadline, setPublicHeadline] = useState<string>('Expedición a Vela & Navegación Oceánica Austral');
  const [publicLocation, setPublicLocation] = useState<string>('Océano Pacífico Sur / Juan Fernández');
  const [publicCoverImage, setPublicCoverImage] = useState<string>('/velero-vegvisir.jpg');
  const [publicDescription, setPublicDescription] = useState<string>(
    'Aventura oceánica de ida y vuelta navegando hacia Juan Fernández. Ideal para navegantes apasionados que buscan el reto del mar abierto, combinada con descanso frente al mar en nuestro Lodge de Bahía Cumberland.'
  );
  const [publicTempEstimate, setPublicTempEstimate] = useState<string>('12°C – 18°C');
  const [publicPillars, setPublicPillars] = useState<Array<{ title: string; desc: string; iconKey: 'sail' | 'food' | 'anchor' | 'waves' | 'compass' | 'footprints' }>>([
    {
      title: 'Velerismo Oceánico de Altura',
      desc: 'Navegación a vela con patrón de ultramar, guardias astronómicas, trimado táctico de jarcia y cartas náuticas en mar abierto.',
      iconKey: 'sail'
    },
    {
      title: 'Pesca de Altura (Trolling) & Menú a Bordo',
      desc: 'Líneas de pesca en arrastre para vidriola y atún, con preparaciones de sashimi fresco y cocina gourmet caliente durante las guardias.',
      iconKey: 'food'
    },
    {
      title: 'Recaladas en Bahías Míticas',
      desc: 'Fondeos protegidos en caletas históricas como Bahía Cumberland y Puerto Español, con desembarcos en bote Zodiac semirrígido.',
      iconKey: 'anchor'
    },
    {
      title: 'Autonomía Total & Starlink 24/7',
      desc: 'Cabinas con baños privados, climatización, desalinizador, instrumental de navegación y conexión satelital continua.',
      iconKey: 'waves'
    }
  ]);
  const [publicIncluded] = useState<string[]>([
    'Pensión completa gourmet preparada por tripulación / chef',
    'Instrucción náutica, bitácora y participación en maniobras',
    'Bote auxiliar Zodiac con motor Mercury 15 HP para desembarcos',
    'Conexión satelital Starlink 24/7 en alta mar',
    'Combustible, tasas de puerto, seguros y fondeo',
    'Hospedaje frente al mar en Bahía Cumberland'
  ]);
  const [publicWeatherPolicy, setPublicWeatherPolicy] = useState<string>(
    'La derrota náutica, los tiempos de navegación y los puntos de fondeo se ajustan de manera dinámica según la evolución meteorológica de los vientos y corrientes oceánicas, bajo el mando experto del Capitán para garantizar una travesía segura y placentera.'
  );

  // Load backend dependencies
  useEffect(() => {
    if (!isOpen) return;
    const loadAll = async () => {
      try {
        const [loadedRooms, loadedBookings, loadedDeps] = await Promise.all([
          lodgeService.getRooms(),
          lodgeService.getBookingsAndBlocks(),
          expeditionService.getDepartures()
        ]);
        setRooms(loadedRooms);
        setLodgeBookings(loadedBookings);
        if (loadedDeps.length > 0) setDbDepartures(loadedDeps);
      } catch (err) {
        console.error('Error loading wizard prerequisites', err);
      }
    };
    loadAll();
  }, [isOpen]);

  // Compute Duration in Days
  const durationDays = useMemo(() => {
    if (!departureDate || !returnDate) return 8;
    const start = new Date(departureDate + 'T00:00:00');
    const end = new Date(returnDate + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, days);
  }, [departureDate, returnDate]);

  // Calendar Day Click Handler
  const handleDayClick = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) return;

    if (activeDateField === 'start') {
      setDepartureDate(dateStr);
      if (returnDate && returnDate < dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        d.setDate(d.getDate() + 7);
        setReturnDate(d.toISOString().split('T')[0]);
      }
      setActiveDateField('end');
    } else {
      if (dateStr < departureDate) {
        setDepartureDate(dateStr);
      } else {
        setReturnDate(dateStr);
        setActiveDateField('start');
      }
    }
  };

  // Helper to render month calendar grid
  const renderMonthCalendar = (year: number, month: number) => {
    const monthObj = new Date(year, month, 1);
    const monthName = monthObj.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const firstDayOfWeek = (monthObj.getDay() + 6) % 7; // Mon=0, Sun=6
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const cells: Array<{ dateStr: string | null; dayNum?: number }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dateStr: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({ dateStr: `${year}-${mStr}-${dStr}`, dayNum: d });
    }

    return { capitalizedMonth, cells, todayStr };
  };

  const { activeVessels, createVessel: createFleetVessel } = useFleet();

  // Full fleet (Standard fleet + custom created vessels)
  const allFleet: CustomVesselItem[] = useMemo(() => {
    return activeVessels.map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      tagline: v.tagline,
      length: v.length,
      capacity: v.capacity,
      maxPax: v.maxPax || (v.id === 'vegvisir' ? 12 : 20),
      cabins: v.cabins || '5 Cabinas',
      bathrooms: v.bathrooms || '5 Baños',
      image: v.mainImage || (v.id === 'vegvisir' ? '/velero-vegvisir.jpg' : '/yate-terranova.jpg'),
      isCustom: v.id !== 'vegvisir' && v.id !== 'terranova',
    }));
  }, [activeVessels]);

  const selectedVesselMeta = useMemo(() => {
    return allFleet.find(v => v.id === vesselId) || allFleet[0] || {
      id: 'vegvisir',
      name: 'Velero Vegvisir',
      type: 'Velero de Expedición',
      tagline: 'Dufour 52.5 ft francés de expedición austral',
      length: '52.5 ft',
      capacity: 'Capacidad 12 PAX',
      maxPax: 12,
      cabins: '5 Cabinas',
      bathrooms: '5 Baños',
      image: '/velero-vegvisir.jpg',
    };
  }, [allFleet, vesselId]);

  // Update defaults when changing vessel
  const handleVesselChange = (newVesselId: string) => {
    setVesselId(newVesselId);
    if (newVesselId === 'terranova') {
      setPublicHeadline('Crucero de Alta Gama & Exploración de Gran Autonomía');
      setPublicCoverImage('/yate-terranova.jpg');
      setTotalSlots(12);
      setPricePerPaxClp(2450000);
      setPriceCharterFullClp(24000000);
    } else if (newVesselId === 'vegvisir') {
      setPublicHeadline('Expedición a Vela & Navegación Oceánica Austral');
      setPublicCoverImage('/velero-vegvisir.jpg');
      setTotalSlots(8);
      setPricePerPaxClp(1850000);
      setPriceCharterFullClp(14800000);
    } else {
      const custom = allFleet.find(v => v.id === newVesselId);
      if (custom) {
        setPublicHeadline(`Expedición Exclusiva en ${custom.name}`);
        setPublicCoverImage(custom.image || '/expediciones-hero.jpg');
        setTotalSlots(Math.min(custom.maxPax, 10));
      }
    }
  };

  // Helper: check if a specific vessel is busy during [departureDate, returnDate]
  const checkVesselConflict = useCallback((vId: string) => {
    if (!departureDate || !returnDate) return { hasConflict: false };
    const conflict = dbDepartures.find((dep) => {
      if (dep.vessel_id !== vId || dep.status === 'cancelled') return false;
      return dep.departure_date <= returnDate && dep.return_date >= departureDate;
    });
    if (conflict) {
      return {
        hasConflict: true,
        conflictName: conflict.name || (conflict as any).public_name || 'Expedición Activa',
        startDate: conflict.departure_date,
        endDate: conflict.return_date,
      };
    }
    return { hasConflict: false };
  }, [dbDepartures, departureDate, returnDate]);

  // Helper: check Lodge availability (All 4 rooms must be 100% free)
  const lodgeAvailability = useMemo(() => {
    if (!departureDate || !returnDate) return { allFree: true, conflictingRooms: [] };
    const busyRooms: Array<{ roomName: string; checkIn: string; checkOut: string; reason: string }> = [];

    rooms.forEach((r) => {
      const bookingConflict = lodgeBookings.find((b) => {
        if (b.room_id !== r.id || b.status === 'cancelled') return false;
        return b.check_in <= returnDate && b.check_out >= departureDate;
      });
      if (bookingConflict) {
        busyRooms.push({
          roomName: r.room_name.replace(/\s*\(.*?\)/g, '').replace(/Cabina\s*/gi, '').trim(),
          checkIn: bookingConflict.check_in,
          checkOut: bookingConflict.check_out,
          reason: bookingConflict.guest_name || bookingConflict.notes || 'Reserva existente'
        });
      }
    });

    return {
      allFree: busyRooms.length === 0,
      conflictingRooms: busyRooms,
    };
  }, [rooms, lodgeBookings, departureDate, returnDate]);

  // Handle adding new custom vessel
  const handleCreateNewVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVesselForm.name.trim()) {
      alert('Ingresa el nombre de la embarcación');
      return;
    }
    const newId = `vessel-${Date.now()}`;
    const newVesselItem = {
      id: newId,
      name: newVesselForm.name.trim(),
      type: newVesselForm.type,
      tagline: newVesselForm.tagline || `${newVesselForm.name} - ${newVesselForm.type}`,
      description: `${newVesselForm.name} es una embarcación de alta gama equipada para expediciones oceánicas australes.`,
      length: newVesselForm.length || '50 ft',
      capacity: `Capacidad ${newVesselForm.maxPax} PAX`,
      maxPax: Number(newVesselForm.maxPax) || 10,
      cabins: newVesselForm.cabins || '4 Cabinas',
      bathrooms: newVesselForm.bathrooms || '4 Baños',
      mainImage: newVesselForm.image || '/expediciones-hero.jpg',
      features: [
        `${newVesselForm.length || '50 ft'} de eslora`,
        `Aforo para ${newVesselForm.maxPax || 10} pasajeros`,
        `${newVesselForm.cabins || '4 Cabinas'} & ${newVesselForm.bathrooms || '4 Baños'}`,
        'Conexión satelital Starlink 24/7'
      ],
      isActive: true,
    };

    try {
      await createFleetVessel(newVesselItem);
    } catch {}

    setVesselId(newId);
    setShowNewVesselModal(false);
    setNewVesselForm({
      name: '',
      type: 'Velero de Expedición',
      tagline: '',
      length: '50 ft',
      maxPax: 10,
      cabins: '4 Cabinas',
      bathrooms: '4 Baños',
      image: '/expediciones-hero.jpg',
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!departureDate || !returnDate) {
        alert('Por favor selecciona las fechas de inicio y término de la expedición.');
        return;
      }
      if (departureDate > returnDate) {
        alert('La fecha de inicio no puede ser posterior a la fecha de término.');
        return;
      }
    }

    if (currentStep === 2) {
      const conflict = checkVesselConflict(vesselId);
      if (conflict.hasConflict) {
        alert(`La embarcación seleccionada tiene un conflicto de fechas: "${conflict.conflictName}" (${conflict.startDate} al ${conflict.endDate}). Por favor selecciona otra embarcación o ajusta las fechas.`);
        return;
      }
    }

    if (currentStep === 3) {
      if (lodgingType === 'lodge' && !lodgeAvailability.allFree) {
        alert('No se puede seleccionar el Lodge porque hay habitaciones con reservas en estas fechas. Debes elegir la opción A Bordo o cambiar las fechas.');
        return;
      }
    }

    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedRoomIds = lodgingType === 'lodge' ? rooms.map(r => r.id) : [];

      const wizardData: ExpeditionWizardData = {
        vesselId,
        routeId: 'custom-expedition',
        lodgingType,
        selectedRoomIds,
        selectedServiceIds: [],
        durationDays,
        departureDate,
        returnDate,
        totalSlots,
        pricePerPaxClp,
        priceCharterFullClp,
        status,
        publicName,
        publicHeadline,
        publicLocation,
        publicCoverImage,
        publicDescription,
        publicTempEstimate,
        publicPillars,
        publicIncluded,
        publicWeatherPolicy,
      };

      // Confetti celebration!
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      onSuccess(wizardData);
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al guardar la expedición.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row h-[94vh] md:h-[88vh] border border-slate-200 overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR: BRANDING & VERTICAL STEPPER */}
        {/* ========================================================================= */}
        <div className="w-full md:w-72 lg:w-80 shrink-0 bg-gradient-to-b from-[#0b2038] via-[#0f2b48] to-[#163a5f] text-white p-5 sm:p-6 flex flex-col justify-between border-r border-white/10 relative overflow-y-auto">
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Flota Náutica</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Creador de Expediciones
              </h3>
              <p className="text-slate-300 text-xs font-light">
                Configuración guiada en 6 pasos estructurados.
              </p>
            </div>

            {/* Vertical Stepper */}
            <div className="space-y-1.5 pt-1">
              {WIZARD_STEPS.map((s) => {
                const isActive = currentStep === s.step;
                const isPast = currentStep > s.step;
                const Icon = s.icon;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step <= currentStep) setCurrentStep(s.step);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                      s.step <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                    } ${
                      isActive
                        ? 'bg-white/15 text-white font-bold shadow-xs border border-white/20'
                        : isPast
                        ? 'text-emerald-400 hover:bg-white/5'
                        : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? 'bg-white text-[#0f2b48] shadow-sm'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-white">{s.label}</div>
                      <div className="text-[10px] text-slate-300 truncate font-light">{s.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Pill at bottom of Sidebar */}
          <div className="pt-4 border-t border-white/10 space-y-1 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Zarpe:</span>
              <span className="text-white font-bold">{departureDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Retorno:</span>
              <span className="text-white font-bold">{returnDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duración:</span>
              <span className="text-sky-300 font-bold">{durationDays} Días</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAIN STEP CONTENT & ACTIONS */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col justify-between min-w-0 h-full overflow-hidden bg-slate-50/50 relative">
          
          {/* Top Bar with Close Button */}
          <div className="bg-white px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="text-xs font-serif font-bold text-[#0f2b48]">
              Paso {currentStep} de 6 • {WIZARD_STEPS[currentStep - 1]?.label.replace(/^\d+\.\s*/, '')}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP CONTENT CONTAINER */}
          <div className="p-5 sm:p-7 overflow-y-auto flex-1">
            
            {/* ========================================================================= */}
            {/* PASO 1: FECHA DE INICIO Y FECHA DE SALIDA (CALENDARIO PERSONALIZADO) */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                    Paso 1 de 6 • Calendario Base
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                    Selecciona la Fecha de Inicio & Término de la Travesía
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Haz clic en el calendario para seleccionar los días de zarpe y retorno de la expedición.
                  </p>
                </div>

                {/* Date Selection Cards (Interactive trigger buttons) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveDateField('start')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                      activeDateField === 'start'
                        ? 'border-[#0f2b48] ring-2 ring-[#0f2b48]/10 shadow-sm bg-sky-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                        Fecha de Zarpe / Inicio
                      </span>
                      {activeDateField === 'start' && (
                        <span className="text-[9px] font-bold bg-[#0f2b48] text-white px-2 py-0.5 rounded-full">
                          Seleccionando
                        </span>
                      )}
                    </div>
                    <div className="font-serif font-bold text-base text-[#0f2b48]">
                      {departureDate
                        ? new Date(departureDate + 'T00:00:00').toLocaleDateString('es-CL', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Seleccionar fecha'}
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveDateField('end')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                      activeDateField === 'end'
                        ? 'border-[#0f2b48] ring-2 ring-[#0f2b48]/10 shadow-sm bg-sky-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                        Fecha de Retorno / Término
                      </span>
                      {activeDateField === 'end' && (
                        <span className="text-[9px] font-bold bg-[#0f2b48] text-white px-2 py-0.5 rounded-full">
                          Seleccionando
                        </span>
                      )}
                    </div>
                    <div className="font-serif font-bold text-base text-[#0f2b48]">
                      {returnDate
                        ? new Date(returnDate + 'T00:00:00').toLocaleDateString('es-CL', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Seleccionar fecha'}
                    </div>
                  </div>
                </div>

                {/* Custom 2-Month Side-by-Side Interactive Calendar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  
                  {/* Month Navigator Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="text-xs text-slate-500 font-light">
                      {activeDateField === 'start' ? (
                        <span>🟢 Selecciona la <strong>Fecha de Zarpe / Inicio</strong></span>
                      ) : (
                        <span>🔵 Selecciona la <strong>Fecha de Retorno / Término</strong></span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarViewDate(
                            prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarViewDate(
                            prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Months Grid (1 column on mobile, 2 columns on desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1].map((monthOffset) => {
                      const viewYear = calendarViewDate.getFullYear();
                      const viewMonth = calendarViewDate.getMonth() + monthOffset;
                      const { capitalizedMonth, cells, todayStr } = renderMonthCalendar(viewYear, viewMonth);

                      return (
                        <div key={monthOffset} className="space-y-3">
                          <div className="font-serif font-bold text-sm text-[#0f2b48] text-center">
                            {capitalizedMonth}
                          </div>

                          {/* Weekday headers */}
                          <div className="grid grid-cols-7 text-center">
                            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d, i) => (
                              <span key={i} className="text-[10px] font-mono font-bold text-slate-400 py-1">
                                {d}
                              </span>
                            ))}
                          </div>

                          {/* Days cells */}
                          <div className="grid grid-cols-7 gap-y-1">
                            {cells.map((cell, idx) => {
                              if (!cell.dateStr) {
                                return <div key={`empty-${monthOffset}-${idx}`} className="h-9 w-full" />;
                              }
                              const dStr = cell.dateStr;
                              const isPast = dStr < todayStr;
                              const isStart = dStr === departureDate;
                              const isEnd = dStr === returnDate;
                              const isBetween =
                                departureDate && returnDate && dStr > departureDate && dStr < returnDate;
                              const isToday = dStr === todayStr;

                              let cellStyle = 'bg-transparent text-slate-700 hover:bg-slate-100 rounded-xl';
                              if (isPast) {
                                cellStyle = 'text-slate-300 cursor-not-allowed opacity-35';
                              } else if (isStart && isEnd) {
                                cellStyle = 'bg-[#0b192c] text-white font-bold rounded-xl shadow-xs';
                              } else if (isStart) {
                                cellStyle = 'bg-[#0b192c] text-white font-bold rounded-l-xl rounded-r-none shadow-xs';
                              } else if (isEnd) {
                                cellStyle = 'bg-[#0b192c] text-white font-bold rounded-r-xl rounded-l-none shadow-xs';
                              } else if (isBetween) {
                                cellStyle = 'bg-sky-100/90 text-sky-950 font-semibold rounded-none';
                              }

                              return (
                                <button
                                  key={dStr}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => handleDayClick(dStr)}
                                  className={`h-9 w-full flex items-center justify-center text-xs font-mono transition-colors relative cursor-pointer ${cellStyle} ${
                                    isToday && !isStart && !isEnd ? 'ring-1 ring-emerald-500 font-bold text-emerald-900' : ''
                                  }`}
                                >
                                  <span>{cell.dayNum}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Duration notice footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-light">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Duración calculada: <strong>{durationDays} Días / {durationDays - 1} Noches</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setDepartureDate(today);
                        const ret = new Date();
                        ret.setDate(ret.getDate() + 7);
                        setReturnDate(ret.toISOString().split('T')[0]);
                        setCalendarViewDate(new Date());
                      }}
                      className="text-[11px] font-mono text-sky-700 hover:text-sky-900 underline cursor-pointer"
                    >
                      Hoy
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PASO 2: SELECCIÓN DE EMBARCACIÓN (+ VALIDACIÓN INTELIGENTE & BOTÓN) */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                      Paso 2 de 6 • Flota
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                      Selecciona la Embarcación para la Expedición
                    </h4>
                    <p className="text-slate-500 text-xs font-light">
                      Comprobación inteligente para el rango: <strong>{departureDate} ➔ {returnDate}</strong>
                    </p>
                  </div>

                  {/* Botón Nueva Embarcación (sin doble +) */}
                  <button
                    type="button"
                    onClick={() => setShowNewVesselModal(true)}
                    className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-sky-600" />
                    <span>Nueva Embarcación</span>
                  </button>
                </div>

                {/* Vessel Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allFleet.map((vessel) => {
                    const conflict = checkVesselConflict(vessel.id);
                    const isSelected = vesselId === vessel.id;
                    const isBusy = conflict.hasConflict;

                    return (
                      <div
                        key={vessel.id}
                        onClick={() => {
                          if (!isBusy) handleVesselChange(vessel.id);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden bg-white ${
                          isBusy
                            ? 'border-rose-200 bg-rose-50/20 opacity-75 cursor-not-allowed'
                            : isSelected
                            ? 'border-[#0f2b48] ring-2 ring-[#0f2b48]/10 shadow-md bg-sky-50/20 cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-100">
                          <img
                            src={vessel.image}
                            alt={vessel.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/20">
                            {vessel.length} • {vessel.type}
                          </div>

                          {isSelected && !isBusy && (
                            <div className="absolute top-2.5 right-2.5 bg-[#0f2b48] text-white p-1.5 rounded-full shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {isBusy && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4 text-center">
                              <div className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                ⚠️ En navegación en estas fechas
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-serif font-bold text-base text-[#0f2b48]">{vessel.name}</h5>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isBusy ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-900'
                            }`}>
                              Max {vessel.maxPax} PAX
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs font-light line-clamp-2">
                            {vessel.tagline}
                          </p>

                          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Sailboat className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                              <span>{vessel.length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                              <span>{vessel.cabins}</span>
                            </div>
                          </div>

                          {/* Status feedback */}
                          <div className="pt-1">
                            {isBusy ? (
                              <span className="text-[10px] font-mono text-rose-700 font-bold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Ocupado: {conflict.conflictName} ({conflict.startDate} - {conflict.endDate})
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                100% Disponible para estas fechas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PASO 3: HOSPEDAJE (A BORDO VS EN EL LODGE CON BLOQUEO AUTOMÁTICO) */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    Paso 3 de 6 • Hospedaje
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                    Modalidad de Hospedaje para la Expedición
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Selecciona si los expedicionarios dormirán dentro de la embarcación o en el Lodge de Bahía Cumberland.
                  </p>
                </div>

                {/* Lodging Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Opción 1: A Bordo */}
                  <div
                    onClick={() => setLodgingType('onboard')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 ${
                      lodgingType === 'onboard'
                        ? 'border-[#0f2b48] bg-sky-50/30 ring-2 ring-[#0f2b48]/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center">
                          <Sailboat className="w-5 h-5" />
                        </div>
                        {lodgingType === 'onboard' && (
                          <span className="bg-[#0f2b48] text-white p-1 rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48]">
                        Alojamiento 100% A Bordo
                      </h5>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        Los pasajeros pernoctan en las cabinas en suite de la embarcación durante toda la derrota náutica.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        No ocupa ni afecta las habitaciones del Lodge
                      </span>
                    </div>
                  </div>

                  {/* Opción 2: En el Lodge */}
                  <div
                    onClick={() => {
                      if (lodgeAvailability.allFree) {
                        setLodgingType('lodge');
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all bg-white flex flex-col justify-between space-y-3 ${
                      !lodgeAvailability.allFree
                        ? 'border-rose-200 bg-rose-50/20 opacity-80 cursor-not-allowed'
                        : lodgingType === 'lodge'
                        ? 'border-[#0f2b48] bg-emerald-50/30 ring-2 ring-[#0f2b48]/10 shadow-sm cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          lodgeAvailability.allFree ? 'bg-purple-100 text-purple-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          <BedDouble className="w-5 h-5" />
                        </div>
                        {lodgingType === 'lodge' && lodgeAvailability.allFree && (
                          <span className="bg-[#0f2b48] text-white p-1 rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48]">
                        Hospedaje en Lodge Bahía Cumberland
                      </h5>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        Estadía completa en el Lodge frente al mar. Se reservan las 4 habitaciones (Albatros, Cumberland, Selkirk, Vidriola).
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {lodgeAvailability.allFree ? (
                        <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Las 4 habitaciones están 100% libres
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Conflicto: Hay habitaciones ocupadas
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Status Alert for Lodge Option */}
                {lodgingType === 'lodge' && lodgeAvailability.allFree && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs text-purple-950 space-y-1 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-purple-900">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Bloqueo Automático del Lodge Garantizado</span>
                    </div>
                    <p className="text-purple-800 font-light">
                      Al confirmar esta expedición, el sistema bloqueará automáticamente las 4 habitaciones (<strong>Albatros, Cumberland, Selkirk, Vidriola</strong>) entre el <strong>{departureDate}</strong> y el <strong>{returnDate}</strong> a nombre de la expedición en el calendario del Lodge.
                    </p>
                  </div>
                )}

                {!lodgeAvailability.allFree && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-700" />
                      <span>Habitaciones no disponibles en estas fechas:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-rose-800">
                      {lodgeAvailability.conflictingRooms.map((c, idx) => (
                        <li key={idx}>
                          <strong>{c.roomName}</strong>: ocupada del {c.checkIn} al {c.checkOut} ({c.reason})
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-rose-700 pt-1">
                      Para usar el Lodge debes seleccionar otra ventana de fechas en el Paso 1, o elegir la modalidad "Alojamiento 100% A Bordo".
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* PASO 4: CAPACIDAD DE PASAJEROS & TARIFAS */}
            {/* ========================================================================= */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                    Paso 4 de 6 • Aforo & Precios
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                    Capacidad de Pasajeros & Valores de la Expedición
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Define el aforo total de cupos a comercializar y las tarifas por pasajero o chárter completo:
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                  
                  {/* Pax Stepper */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block mb-1">
                        Cupos Totales de Pasajeros (PAX)
                      </label>
                      <p className="text-[11px] text-slate-500 font-light">
                        Límite sugerido para {selectedVesselMeta.name}: hasta {selectedVesselMeta.maxPax} PAX.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTotalSlots(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-lg cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedVesselMeta.maxPax || 30}
                        value={totalSlots}
                        onChange={(e) => setTotalSlots(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center font-mono font-bold text-lg bg-slate-50 border border-slate-200 rounded-xl py-2 text-[#0f2b48]"
                      />
                      <button
                        type="button"
                        onClick={() => setTotalSlots(prev => Math.min(selectedVesselMeta.maxPax || 30, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-lg cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-600">Pasajeros</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block mb-1">
                        Precio por Pasajero (CLP)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          step="50000"
                          value={pricePerPaxClp}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPricePerPaxClp(val);
                            setPriceCharterFullClp(Math.round(val * totalSlots * 0.88));
                          }}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block mb-1">
                        Precio Chárter Full / Exclusivo (CLP)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          step="100000"
                          value={priceCharterFullClp}
                          onChange={(e) => setPriceCharterFullClp(Number(e.target.value))}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-[#0f2b48] focus:border-[#0f2b48] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block mb-2">
                      Estado Inicial de la Expedición
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setStatus('scheduled')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          status === 'scheduled'
                            ? 'border-[#0f2b48] bg-sky-50 text-[#0f2b48] font-bold'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        <div className="text-xs">Programada (Abierta a cupos)</div>
                        <div className="text-[10px] text-slate-500 font-normal">Disponible para reservas individuales por pax</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('guaranteed')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          status === 'guaranteed'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        <div className="text-xs">Zarpe Garantizado</div>
                        <div className="text-[10px] text-slate-500 font-normal">Zarpe confirmado con aforo mínimo alcanzado</div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PASO 5: DESCRIPCIÓN & FOTOGRAFÍA PARA LA WEB PÚBLICA */}
            {/* ========================================================================= */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                    Paso 5 de 6 • Ficha Web
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                    Descripción, Fotografía & Pilares para la Web Pública
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Personaliza los textos, imágenes y pilares que verán los clientes en la página de expediciones:
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                        Nombre de la Expedición
                      </label>
                      <input
                        type="text"
                        value={publicName}
                        onChange={(e) => setPublicName(e.target.value)}
                        className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs font-serif font-bold focus:border-[#0f2b48] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                        Ubicación / Destino
                      </label>
                      <input
                        type="text"
                        value={publicLocation}
                        onChange={(e) => setPublicLocation(e.target.value)}
                        className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs focus:border-[#0f2b48] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                      Titular / Subtítulo Destacado
                    </label>
                    <input
                      type="text"
                      value={publicHeadline}
                      onChange={(e) => setPublicHeadline(e.target.value)}
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs font-medium focus:border-[#0f2b48] focus:outline-none"
                    />
                  </div>

                  {/* Cover Image Input + Presets */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block">
                      Fotografía de Portada (URL)
                    </label>
                    <input
                      type="text"
                      value={publicCoverImage}
                      onChange={(e) => setPublicCoverImage(e.target.value)}
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs font-mono focus:border-[#0f2b48] focus:outline-none"
                    />
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">Presets:</span>
                      {SAMPLE_COVERS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPublicCoverImage(preset.url)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 font-medium transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                      Resumen Descriptivo Principal
                    </label>
                    <textarea
                      rows={3}
                      value={publicDescription}
                      onChange={(e) => setPublicDescription(e.target.value)}
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl p-3 text-[#0f2b48] text-xs font-light focus:border-[#0f2b48] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                        Temperatura / Clima Estimado
                      </label>
                      <input
                        type="text"
                        value={publicTempEstimate}
                        onChange={(e) => setPublicTempEstimate(e.target.value)}
                        className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs font-mono focus:border-[#0f2b48] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                        Política de Navegación & Clima
                      </label>
                      <input
                        type="text"
                        value={publicWeatherPolicy}
                        onChange={(e) => setPublicWeatherPolicy(e.target.value)}
                        className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-[#0f2b48] text-xs focus:border-[#0f2b48] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 4 Pillars of Experience */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block">
                      Pilares & Experiencias de la Expedición (4 Pilares)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {publicPillars.map((p, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#0f2b48] text-white flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={p.title}
                              onChange={(e) => {
                                const newPillars = [...publicPillars];
                                newPillars[idx].title = e.target.value;
                                setPublicPillars(newPillars);
                              }}
                              placeholder="Título del Pilar"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={p.desc}
                            onChange={(e) => {
                              const newPillars = [...publicPillars];
                              newPillars[idx].desc = e.target.value;
                              setPublicPillars(newPillars);
                            }}
                            placeholder="Descripción del pilar"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PREVIEW BUTTON */}
                  <div className="pt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Ver Previsualización Pública en Vivo</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PASO 6: RESUMEN DE LA CREACIÓN & CONFIRMACIÓN FINAL */}
            {/* ========================================================================= */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    Paso 6 de 6 • Confirmación
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                    Resumen de la Nueva Expedición
                  </h4>
                  <p className="text-slate-500 text-xs font-light">
                    Revisa los parámetros configurados antes de guardar y publicar en la base de datos de Yates Chile:
                  </p>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. Fechas & Embarcación */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0f2b48] uppercase tracking-wider">
                      <CalendarDays className="w-4 h-4 text-sky-600" />
                      <span>Fechas & Embarcación</span>
                    </div>
                    <div className="space-y-2 text-xs divide-y divide-slate-100 font-mono">
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Zarpe / Inicio:</span>
                        <strong className="text-slate-900">{departureDate}</strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Retorno / Término:</span>
                        <strong className="text-slate-900">{returnDate}</strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Duración:</span>
                        <strong className="text-sky-700">{durationDays} Días / {durationDays - 1} Noches</strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Embarcación:</span>
                        <strong className="text-slate-900">{selectedVesselMeta.name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Hospedaje & Aforo */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0f2b48] uppercase tracking-wider">
                      <BedDouble className="w-4 h-4 text-purple-600" />
                      <span>Hospedaje & Capacidad</span>
                    </div>
                    <div className="space-y-2 text-xs divide-y divide-slate-100 font-mono">
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Modalidad:</span>
                        <strong className={lodgingType === 'lodge' ? 'text-purple-700' : 'text-sky-700'}>
                          {lodgingType === 'lodge' ? 'Lodge (4 Cabinas Bloqueadas)' : 'A Bordo (Cabinas de Barco)'}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Cupos Totales:</span>
                        <strong className="text-slate-900">{totalSlots} Pasajeros (PAX)</strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Precio por PAX:</span>
                        <strong className="text-emerald-700">${pricePerPaxClp.toLocaleString('es-CL')} CLP</strong>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Chárter Full:</span>
                        <strong className="text-slate-900">${priceCharterFullClp.toLocaleString('es-CL')} CLP</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Ficha Web Preview Strip */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0f2b48] uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-indigo-600" />
                      <span>Ficha Pública Web</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                      ✓ Lista para publicarse
                    </span>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={publicCoverImage} alt={publicName} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48] truncate">{publicName}</h5>
                      <p className="text-xs text-slate-500 font-light truncate">{publicHeadline}</p>
                      <span className="text-[10px] font-mono text-slate-400 block">{publicLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Automatic Lodge Lock Alert Banner */}
                {lodgingType === 'lodge' && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs text-purple-950 flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Bloqueo Automático en el Lodge:</strong>
                      <span>
                        Al hacer clic en "Guardar & Publicar", el sistema reservará de manera inmediata las 4 habitaciones (Albatros, Cumberland, Selkirk, Vidriola) del {departureDate} al {returnDate} bajo el nombre "Expedición: {publicName}".
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="bg-white p-4 sm:p-5 border-t border-slate-200 shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
            </button>

            <div className="flex items-center gap-2">
              {currentStep === 6 ? (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-semibold transition shadow-md shadow-[#0b192c]/25 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Guardando Expedición...' : 'Guardar & Publicar Expedición'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-semibold transition shadow-md shadow-[#0b192c]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Siguiente Paso</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: + NUEVA EMBARCACIÓN */}
      {/* ========================================================================= */}
      {showNewVesselModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center">
                  <Sailboat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#0f2b48]">Agregar Nueva Embarcación</h4>
                  <p className="text-xs text-slate-500 font-light">Registra un nuevo barco en la flota</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewVesselModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewVessel} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Nombre del Barco / Yate</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Catamarán Fjord Explorer"
                  value={newVesselForm.name}
                  onChange={(e) => setNewVesselForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Tipo</label>
                  <select
                    value={newVesselForm.type}
                    onChange={(e) => setNewVesselForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0f2b48] focus:outline-none"
                  >
                    <option value="Velero de Expedición">Velero de Expedición</option>
                    <option value="Yate a Motor">Yate a Motor</option>
                    <option value="Catamarán Oceánico">Catamarán Oceánico</option>
                    <option value="Crucero Austral">Crucero Austral</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Capacidad Máxima (PAX)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newVesselForm.maxPax}
                    onChange={(e) => setNewVesselForm(prev => ({ ...prev, maxPax: Number(e.target.value) }))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Eslora</label>
                  <input
                    type="text"
                    placeholder="Ej: 54 ft"
                    value={newVesselForm.length}
                    onChange={(e) => setNewVesselForm(prev => ({ ...prev, length: e.target.value }))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Cabinas</label>
                  <input
                    type="text"
                    placeholder="Ej: 4 Cabinas"
                    value={newVesselForm.cabins}
                    onChange={(e) => setNewVesselForm(prev => ({ ...prev, cabins: e.target.value }))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Baños</label>
                  <input
                    type="text"
                    placeholder="Ej: 4 Baños"
                    value={newVesselForm.bathrooms}
                    onChange={(e) => setNewVesselForm(prev => ({ ...prev, bathrooms: e.target.value }))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0f2b48] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">URL Fotografía del Barco</label>
                <input
                  type="text"
                  placeholder="URL o ruta local"
                  value={newVesselForm.image}
                  onChange={(e) => setNewVesselForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:border-[#0f2b48] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVesselModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0f2b48] hover:bg-[#183d66] text-white font-bold cursor-pointer"
                >
                  Guardar Embarcación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE PUBLIC PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] md:h-[84vh] flex flex-col md:flex-row relative text-slate-800 overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center z-40 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Cover & Quick Stats */}
            <div className="relative w-full md:w-[38%] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[260px] md:min-h-auto shrink-0">
              <img
                src={publicCoverImage}
                alt={publicName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />

              <div className="relative z-10 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-350 font-mono block font-bold">
                  Expedición Yates Chile
                </span>
                <div className="space-y-1.5">
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight">
                    {publicName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-350 text-xs">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{publicLocation}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3.5 space-y-2.5 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Zarpe:</span>
                    <span className="font-bold text-white">{departureDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retorno:</span>
                    <span className="font-bold text-white">{returnDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embarcación:</span>
                    <span className="font-bold text-white truncate max-w-[140px] text-right">
                      {selectedVesselMeta.name} {lodgingType === 'lodge' && '+ Lodge'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temp. Estimada:</span>
                    <span className="font-bold text-white">{publicTempEstimate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 pt-6 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => alert(`Descargando Brochure Oficial PDF de la expedición: ${publicName}`)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4 text-blue-300" />
                  <span>Descargar Brochure en PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Abriendo reserva de cupo para: ${publicName}`)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 rounded-xl transition text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <span>Reservar Cupo de Expedición</span>
                  <ArrowRight className="w-4 h-4 text-slate-900" />
                </button>
              </div>
            </div>

            {/* Right Column: Public Overview */}
            <div className="w-full md:w-[62%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto h-full">
              <div className="space-y-6 text-left">
                
                {/* Header Title */}
                <div className="border-b border-slate-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-800 animate-pulse" />
                    <span>Descripción General de la Expedición</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                    {publicHeadline}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light pt-1">
                    {publicDescription}
                  </p>
                </div>

                {/* 4 Pillars */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                    Pilares & Experiencias de la Expedición
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {publicPillars.map((pillar, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-150/70 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-900 shadow-2xs">
                            {idx === 0 ? <Sailboat className="w-4 h-4" /> : idx === 1 ? <Utensils className="w-4 h-4" /> : idx === 2 ? <Anchor className="w-4 h-4" /> : <Waves className="w-4 h-4" />}
                          </div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                            {pillar.title}
                          </h4>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed font-light">
                          {pillar.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Policy Alert */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-blue-950 uppercase tracking-wide">
                      Itinerario Flexible & Navegación Adaptativa al Clima
                    </h5>
                    <p className="text-slate-700 text-xs leading-relaxed font-light">
                      {publicWeatherPolicy}
                    </p>
                  </div>
                </div>

                {/* Included Services */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                    Servicios & Equipamiento Incluido
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {publicIncluded.map((inc, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
