import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Sailboat,
  Ship,
  BedDouble,
  Compass,
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
  CalendarDays
} from 'lucide-react';
import { expeditionService, type DepartureRow } from '../../services/expeditionService';
import { lodgeService, type LodgeRoom, type LodgeBooking } from '../../services/lodgeService';
import { catalogService, type CatalogService } from '../../services/catalogService';
import { FLEET_DATA, EXPEDITION_ROUTES } from '../../lib/constants';
import confetti from 'canvas-confetti';

export interface ExpeditionWizardData {
  vesselId: 'vegvisir' | 'terranova';
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

const SAMPLE_COVERS = [
  { label: 'Velero en Mar Abierto', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Yate Terranova / Atardecer', url: '/zarpe-archipielago.jpg' },
  { label: 'Lodge Rincón de Navegantes', url: '/rincon-de-navegantes.jpg' },
  { label: 'Acantilados & Bahía Cumberland', url: '/juan-fernandez-selkirk.jpg' },
  { label: 'Buceo & Fauna Marina', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80' },
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

  // External data loaded from services
  const [rooms, setRooms] = useState<LodgeRoom[]>([]);
  const [lodgeBookings, setLodgeBookings] = useState<LodgeBooking[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [dbDepartures, setDbDepartures] = useState<DepartureRow[]>(existingDepartures);

  // Form State
  const [vesselId, setVesselId] = useState<'vegvisir' | 'terranova'>('vegvisir');
  const [routeId, setRouteId] = useState<string>('juan-fernandez');
  const [customRouteTitle, setCustomRouteTitle] = useState<string>('');

  // Step 2: Lodging
  const [lodgingType, setLodgingType] = useState<'onboard' | 'lodge' | 'mixed'>('mixed');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(['room-1', 'room-2', 'room-3', 'room-4']);

  // Step 3: Catalog Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv-1', 'srv-2']);

  // Step 4: Pax & Pricing
  const [totalSlots, setTotalSlots] = useState<number>(8);
  const [pricePerPaxClp, setPricePerPaxClp] = useState<number>(1850000);
  const [priceCharterFullClp, setPriceCharterFullClp] = useState<number>(14800000);
  const [status, setStatus] = useState<'scheduled' | 'guaranteed'>('scheduled');

  // Step 5: Duration & Smart Calendar
  const [durationDays, setDurationDays] = useState<number>(8);
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Step 6: Public Content
  const [publicName, setPublicName] = useState<string>('Travesía Robinson');
  const [publicHeadline, setPublicHeadline] = useState<string>('Expedición a Vela & Navegación Oceánica Austral');
  const [publicLocation, setPublicLocation] = useState<string>('Océano Pacífico Sur / Juan Fernández');
  const [publicCoverImage, setPublicCoverImage] = useState<string>('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80');
  const [publicDescription, setPublicDescription] = useState<string>(
    'Aventura oceánica de ida y vuelta navegando a vela hacia Juan Fernández. Ideal para navegantes apasionados que buscan el reto del mar abierto. Una experiencia náutica genuina a bordo del velero de expedición Vegvisir, combinada con descanso frente al mar en nuestro Lodge de Cumberland.'
  );
  const [publicTempEstimate, setPublicTempEstimate] = useState<string>('12°C – 15°C');
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
      desc: '5 cabinas con 5 baños, climatización hidrónica, desalinizador de 140 l/h, instrumental Raymarine y conexión satelital continua.',
      iconKey: 'waves'
    }
  ]);
  const [publicIncluded] = useState<string[]>([
    'Pensión completa gourmet preparada por tripulación / chef',
    'Instrucción náutica, bitácora y participación en maniobras',
    'Bote auxiliar Zodiac con motor Mercury 15 HP para desembarcos',
    'Conexión satelital Starlink 24/7 en alta mar',
    'Combustible, tasas de puerto, seguros y fondeo',
    'Hospedaje en Lodge Rincón de Navegantes en Bahía Cumberland'
  ]);
  const [publicWeatherPolicy, setPublicWeatherPolicy] = useState<string>(
    'La derrota náutica, los tiempos de navegación a vela y los puntos de fondeo se ajustan de manera dinámica según la evolución meteorológica de los vientos y corrientes oceánicas, bajo el mando experto del Capitán para garantizar una travesía segura y placentera.'
  );

  // Compute Return Date automatically based on departureDate + (durationDays - 1)
  const returnDate = useMemo(() => {
    if (!departureDate) return '';
    const parts = departureDate.split('-').map(Number);
    if (parts.length !== 3) return '';
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + (durationDays - 1));
    return d.toISOString().split('T')[0];
  }, [departureDate, durationDays]);

  // Load backend dependencies
  useEffect(() => {
    if (!isOpen) return;
    const loadAll = async () => {
      try {
        const [loadedRooms, loadedBookings, loadedServices, loadedDeps] = await Promise.all([
          lodgeService.getRooms(),
          lodgeService.getBookingsAndBlocks(),
          catalogService.getAllServicesAdmin(),
          expeditionService.getDepartures()
        ]);
        setRooms(loadedRooms);
        setLodgeBookings(loadedBookings);
        setCatalogServices(loadedServices);
        if (loadedDeps.length > 0) setDbDepartures(loadedDeps);
      } catch (err) {
        console.error('Error loading wizard prerequisites', err);
      }
    };
    loadAll();
  }, [isOpen]);

  // Auto update title / presets when changing vessel
  const handleVesselChange = (newVesselId: 'vegvisir' | 'terranova') => {
    setVesselId(newVesselId);
    if (newVesselId === 'terranova') {
      setPublicHeadline('Crucero de Alta Gama & Exploración de Gran Autonomía');
      setPublicCoverImage('/zarpe-archipielago.jpg');
      setTotalSlots(12);
      setPricePerPaxClp(2450000);
      setPriceCharterFullClp(24000000);
      setPublicPillars([
        {
          title: 'Navegación Rápida & 3 Cubiertas',
          desc: 'Estabilizadores hidráulicos que eliminan el balanceo, doble puente de mando, 5 cabinas en suite y amplias terrazas panorámicas.',
          iconKey: 'sail'
        },
        {
          title: 'Deck Superior & Gastronomía de Autor',
          desc: 'Parrilla al aire libre en la cubierta superior, pescados y mariscos frescos, maridados con vinos selectos por nuestro chef ejecutivo.',
          iconKey: 'food'
        },
        {
          title: 'Desembarcos Asistidos con Zodiac 70 HP',
          desc: 'Pluma/grúa de 1 ton y lancha semirrígida potente para internarse en fiordos, cuevas marinas y playas volcánicas inaccesibles.',
          iconKey: 'anchor'
        },
        {
          title: 'Pesca Deportiva de Altura & Fauna Pelágica',
          desc: 'Equipamiento de trolling de alta gama y radares para avistamiento de cetáceos, lobos marinos y aves pelágicas.',
          iconKey: 'compass'
        }
      ]);
    } else {
      setPublicHeadline('Expedición a Vela & Navegación Oceánica Austral');
      setPublicCoverImage('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80');
      setTotalSlots(8);
      setPricePerPaxClp(1850000);
      setPriceCharterFullClp(14800000);
      setPublicPillars([
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
          desc: '5 cabinas con 5 baños, climatización hidrónica, desalinizador de 140 l/h, instrumental Raymarine y conexión satelital continua.',
          iconKey: 'waves'
        }
      ]);
    }
  };

  // Helper: check if a specific date is busy for the chosen vessel
  const isVesselBusyOnDate = useCallback((dateStr: string): boolean => {
    return dbDepartures.some((dep) => {
      if (dep.vessel_id !== vesselId || dep.status === 'cancelled') return false;
      return dateStr >= dep.departure_date && dateStr <= dep.return_date;
    });
  }, [dbDepartures, vesselId]);

  // Helper: check if any of the selected lodge rooms are busy on a date
  const isLodgeBusyOnDate = useCallback((dateStr: string): boolean => {
    if (lodgingType === 'onboard' || selectedRoomIds.length === 0) return false;
    return lodgeBookings.some((b) => {
      if (!b.room_id || !selectedRoomIds.includes(b.room_id) || b.status === 'cancelled') return false;
      return dateStr >= b.check_in && dateStr < b.check_out;
    });
  }, [lodgingType, selectedRoomIds, lodgeBookings]);

  // Check conflicts for the active date range [departureDate, returnDate]
  const dateRangeConflict = useMemo(() => {
    if (!departureDate || !returnDate) return null;
    const current = new Date(departureDate + 'T00:00:00');
    const end = new Date(returnDate + 'T00:00:00');

    let vesselConflict = false;
    let lodgeConflict = false;
    const conflictingRooms: string[] = [];

    while (current <= end) {
      const dStr = current.toISOString().split('T')[0];
      if (isVesselBusyOnDate(dStr)) vesselConflict = true;

      if (lodgingType !== 'onboard') {
        lodgeBookings.forEach((b) => {
          if (b.room_id && selectedRoomIds.includes(b.room_id) && b.status !== 'cancelled') {
            if (dStr >= b.check_in && dStr < b.check_out) {
              lodgeConflict = true;
              const rName = rooms.find(r => r.id === b.room_id)?.room_name || b.room_id;
              if (!conflictingRooms.includes(rName)) conflictingRooms.push(rName);
            }
          }
        });
      }

      current.setDate(current.getDate() + 1);
    }

    if (vesselConflict || lodgeConflict) {
      return {
        hasConflict: true,
        vesselConflict,
        lodgeConflict,
        conflictingRooms
      };
    }
    return { hasConflict: false };
  }, [departureDate, returnDate, isVesselBusyOnDate, lodgingType, lodgeBookings, selectedRoomIds, rooms]);

  // Find 4 suggested green departure windows of `durationDays`
  const suggestedWindows = useMemo(() => {
    const results: Array<{ startDate: string; endDate: string; label: string }> = [];
    const searchStart = new Date();
    searchStart.setDate(searchStart.getDate() + 7); // Start scanning from 1 week ahead

    let checkedDays = 0;
    const cur = new Date(searchStart);

    while (results.length < 4 && checkedDays < 180) {
      const winStart = cur.toISOString().split('T')[0];
      const winEndDateObj = new Date(cur);
      winEndDateObj.setDate(winEndDateObj.getDate() + (durationDays - 1));
      const winEnd = winEndDateObj.toISOString().split('T')[0];

      // Check if entire window is free for both vessel & lodge
      let valid = true;
      const testCur = new Date(cur);
      while (testCur <= winEndDateObj) {
        const testStr = testCur.toISOString().split('T')[0];
        if (isVesselBusyOnDate(testStr) || isLodgeBusyOnDate(testStr)) {
          valid = false;
          break;
        }
        testCur.setDate(testCur.getDate() + 1);
      }

      if (valid) {
        const startLabel = cur.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
        const endLabel = winEndDateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
        results.push({
          startDate: winStart,
          endDate: winEnd,
          label: `${startLabel} → ${endLabel} (${durationDays} Días)`
        });
        // Skip forward so windows are nicely spaced
        cur.setDate(cur.getDate() + durationDays + 3);
      } else {
        cur.setDate(cur.getDate() + 1);
      }
      checkedDays++;
    }
    return results;
  }, [durationDays, isVesselBusyOnDate, isLodgeBusyOnDate]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const wizardData: ExpeditionWizardData = {
        vesselId,
        routeId,
        customRouteTitle: customRouteTitle || undefined,
        lodgingType,
        selectedRoomIds: lodgingType === 'onboard' ? [] : selectedRoomIds,
        selectedServiceIds,
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

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
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

  const selectedVesselMeta = FLEET_DATA.find(v => v.id === vesselId) || FLEET_DATA[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] border border-slate-200 overflow-hidden relative">
        
        {/* HEADER & STEPPER */}
        <div className="bg-gradient-to-r from-[#0b2038] via-[#0f2b48] to-[#163a5f] text-white p-5 sm:p-6 shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all rounded-full p-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Flota Náutica & Travesías</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              Creador Inteligente de Expediciones
            </h3>
            <p className="text-slate-300 text-xs font-light">
              Configura barcos, lodge, servicios, cupos, disponibilidad inteligente y publicación web en 6 pasos.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-2 mt-5 pt-3 border-t border-white/10">
            {[
              { step: 1, label: '1. Barco', icon: Sailboat },
              { step: 2, label: '2. Hospedaje', icon: BedDouble },
              { step: 3, label: '3. Servicios', icon: Compass },
              { step: 4, label: '4. Pasajeros', icon: Users },
              { step: 5, label: '5. Calendario', icon: CalendarDays },
              { step: 6, label: '6. Publicación', icon: Eye },
            ].map((s) => {
              const isActive = currentStep === s.step;
              const isPast = currentStep > s.step;
              const Icon = s.icon;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex flex-col items-center gap-1 text-center group cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : isPast
                      ? 'text-emerald-400 opacity-90'
                      : 'text-slate-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isActive
                        ? 'bg-white text-[#0f2b48] ring-2 ring-blue-300 ring-offset-2 ring-offset-[#0f2b48]'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-full hidden sm:block">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* ========================================================================= */}
          {/* PASO 1: SELECCIÓN DE EMBARCACIÓN */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  Paso 1 de 6
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Selecciona la Embarcación Principal para la Expedición
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Elige entre nuestro catamarán de expedición a vela o el yate motorizado de alta autonomía:
                </p>
              </div>

              {/* Vessel Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* VEGVISIR */}
                <div
                  onClick={() => handleVesselChange('vegvisir')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden bg-white ${
                    vesselId === 'vegvisir'
                      ? 'border-[#0f2b48] ring-2 ring-[#0f2b48]/10 shadow-md bg-sky-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
                      alt="Velero Vegvisir"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/20">
                      Dufour 52.5 ft • Velero
                    </div>
                    {vesselId === 'vegvisir' && (
                      <div className="absolute top-2.5 right-2.5 bg-[#0f2b48] text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-base text-[#0f2b48]">Velero Vegvisir</h5>
                      <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md">
                        Max 12 PAX
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-light line-clamp-2">
                      Catamarán/Velero oceánico de astillero francés con 5 cabinas privadas y 5 baños. Experiencia de navegación pura a vela.
                    </p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Sailboat className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>Eslora: 52.5 ft</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>5 Cabinas / 5 Baños</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Waves className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>Starlink 24/7</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>Patrón + Chef</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TERRANOVA */}
                <div
                  onClick={() => handleVesselChange('terranova')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden bg-white ${
                    vesselId === 'terranova'
                      ? 'border-[#0f2b48] ring-2 ring-[#0f2b48]/10 shadow-md bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src="/zarpe-archipielago.jpg"
                      alt="Yate Terranova"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/20">
                      Hatteras 65ft LRC • 3 Cubiertas
                    </div>
                    {vesselId === 'terranova' && (
                      <div className="absolute top-2.5 right-2.5 bg-[#0f2b48] text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-base text-[#0f2b48]">Yate Terranova</h5>
                      <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md">
                        Max 20 PAX
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-light line-clamp-2">
                      Crucero oceánico de 3 cubiertas con estabilizadores hidráulicos, 3.000 MN de autonomía, Zodiac 70HP con grúa y deck panorámico.
                    </p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
                        <span>Eslora: 65 ft LRC</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
                        <span>3 Cubiertas / 5 Cabinas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
                        <span>Parrilla en Deck 3</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
                        <span>Zodiac 70HP + Grúa</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Route Selector */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block">
                  Ruta / Itinerario Base
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {EXPEDITION_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => {
                        setRouteId(route.id);
                        setCustomRouteTitle('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        routeId === route.id && !customRouteTitle
                          ? 'border-[#0f2b48] bg-sky-50/50 font-bold text-[#0f2b48]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="text-xs font-serif font-bold text-[#0f2b48]">{route.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{route.duration}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: SELECCIÓN DE HOSPEDAJE (LODGE VS A BORDO) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Paso 2 de 6
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Selecciona la Modalidad de Hospedaje
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Puedes alojar a los expedicionarios únicamente dentro de la embarcación o reservar habitaciones en nuestro Lodge Rincón de Navegantes en Bahía Cumberland.
                </p>
              </div>

              {/* Lodging Mode Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setLodgingType('onboard')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                    lodgingType === 'onboard'
                      ? 'border-[#0f2b48] bg-sky-50/30 ring-2 ring-[#0f2b48]/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center shrink-0">
                      <Sailboat className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48]">Hospedaje 100% a Bordo</h5>
                      <p className="text-[11px] text-slate-500 font-light">
                        Los pasajeros duermen en las cabinas en suite de la embarcación ({vesselId === 'vegvisir' ? '5 Cabinas Vegvisir' : '5 Cabinas Terranova'}).
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setLodgingType('mixed')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                    lodgingType !== 'onboard'
                      ? 'border-[#0f2b48] bg-emerald-50/30 ring-2 ring-[#0f2b48]/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48]">Incluir Lodge Rincón de Navegantes</h5>
                      <p className="text-[11px] text-slate-500 font-light">
                        Combina la navegación con estadía en tierra frente al mar con quincho y cabinas privadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Selector if Lodge is enabled */}
              {lodgingType !== 'onboard' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#0f2b48]">
                        Habitaciones a Asignar en el Lodge
                      </h5>
                      <p className="text-xs text-slate-500 font-light">
                        Marca las cabinas que quedarán bloqueadas y garantizadas para esta expedición:
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedRoomIds.length === rooms.length) {
                          setSelectedRoomIds([]);
                        } else {
                          setSelectedRoomIds(rooms.map(r => r.id));
                        }
                      }}
                      className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                    >
                      {selectedRoomIds.length === rooms.length ? 'Deseleccionar Todo' : 'Asignar Lodge Completo (4 Cabinas)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rooms.map((room) => {
                      const isSelected = selectedRoomIds.includes(room.id);
                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedRoomIds(prev => prev.filter(id => id !== room.id));
                            } else {
                              setSelectedRoomIds(prev => [...prev, room.id]);
                            }
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-600/30'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <strong className="text-xs font-serif block text-slate-900">{room.room_name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Capacidad: {room.max_pax} PAX {room.has_ocean_view && '• Vista al Mar'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-700">
                            ${room.base_price_clp.toLocaleString('es-CL')} / noche
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Aforo total de hospedaje en tierra seleccionado:</span>
                    <strong className="font-mono text-emerald-800 text-sm">
                      {rooms
                        .filter(r => selectedRoomIds.includes(r.id))
                        .reduce((acc, r) => acc + r.max_pax, 0)}{' '}
                      Pasajeros (PAX)
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: SERVICIOS EXTRAS & EXCURSIONES DEL CATÁLOGO */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                  Paso 3 de 6
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Selecciona las Excursiones & Servicios del Catálogo
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Marca las experiencias creadas en el panel de administración que estarán integradas en el paquete de esta expedición:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {catalogServices.map((srv) => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedServiceIds(prev => prev.filter(id => id !== srv.id));
                        } else {
                          setSelectedServiceIds(prev => [...prev, srv.id]);
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/20 ring-1 ring-amber-600/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full inline-block mb-1">
                              {srv.category}
                            </span>
                            <h5 className="font-serif font-bold text-xs text-slate-900 leading-snug">{srv.name}</h5>
                            <p className="text-[11px] text-slate-500 font-light line-clamp-2 mt-1">
                              {srv.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>{srv.duration_label || 'Duración flexible'}</span>
                        <span className="font-bold text-[#0f2b48]">
                          ${srv.price_clp.toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <span>Total de excursiones incluidas: <strong>{selectedServiceIds.length} seleccionadas</strong></span>
                <span className="font-mono font-bold">
                  {selectedServiceIds.length > 0 ? '✓ Excursiones asociadas al dossier' : 'Sin excursiones extras'}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: CAPACIDAD (PAX) & VALORES ECONÓMICOS */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                  Paso 4 de 6
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Capacidad de Pasajeros & Valores de la Expedición
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Define el aforo total disponible para la venta y las tarifas por pasajero o chárter completo:
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5">
                
                {/* Pax Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block mb-1">
                      Cupos Totales (PAX)
                    </label>
                    <p className="text-[11px] text-slate-500 font-light">
                      Límite sugerido para {selectedVesselMeta.name}: {vesselId === 'vegvisir' ? '6 a 12 pax' : '8 a 20 pax'}.
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
                      max="30"
                      value={totalSlots}
                      onChange={(e) => setTotalSlots(Math.max(1, Number(e.target.value)))}
                      className="w-20 text-center font-mono font-bold text-lg bg-slate-50 border border-slate-200 rounded-xl py-2 text-[#0f2b48]"
                    />
                    <button
                      type="button"
                      onClick={() => setTotalSlots(prev => prev + 1)}
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
          {/* PASO 5: DURACIÓN & CALENDARIO INTELIGENTE DE DISPONIBILIDAD CRUZADA */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                  Paso 5 de 6 • Motor Inteligente
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Duración & Comprobación Inteligente de Fechas Disponibles
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  El sistema analiza en tiempo real la disponibilidad conjunta del <strong>{selectedVesselMeta.name}</strong> y de las <strong>{selectedRoomIds.length} habitaciones del Lodge</strong> para evitar cualquier solapamiento.
                </p>
              </div>

              {/* Duration Configurator */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider">
                    1. Configurar Duración de la Expedición
                  </label>
                  <span className="font-mono font-bold text-sm text-[#0f2b48] bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
                    {durationDays} Días / {durationDays - 1} Noches
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[5, 7, 8, 10, 12, 14, 16].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        durationDays === days
                          ? 'bg-[#0f2b48] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {days} Días
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Available Windows */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-serif font-bold text-xs text-[#0f2b48] uppercase tracking-wider">
                      Ventanas Recomendadas 100% Libres ({durationDays} Días)
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    Sin conflictos en Barco ni Lodge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedWindows.map((win, idx) => {
                    const isSelected = departureDate === win.startDate;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDepartureDate(win.startDate);
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/30'
                            : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-[#0f2b48]">{win.label}</div>
                          <span className="text-[10px] text-emerald-700 font-medium">✓ Disponibilidad total garantizada</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          ➔
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Pickers */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <label className="text-xs font-bold text-[#0f2b48] uppercase tracking-wider block">
                  2. Selección Manual de Fechas de Salida
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                      Fecha de Zarpe (Inicio)
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#0f2b48] font-mono text-xs focus:border-[#0f2b48] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                      Fecha de Retorno (Cálculo Automático)
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Real-time Conflict Alert */}
                {dateRangeConflict?.hasConflict ? (
                  <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-start gap-3 text-rose-900 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <strong className="font-bold block">Conflicto de Disponibilidad Detectado:</strong>
                      {dateRangeConflict.vesselConflict && (
                        <p>• La embarcación <strong>{selectedVesselMeta.name}</strong> ya tiene una salida programada en estas fechas.</p>
                      )}
                      {dateRangeConflict.lodgeConflict && (
                        <p>• Las siguientes habitaciones del Lodge ya están reservadas: <strong>{dateRangeConflict.conflictingRooms.join(', ')}</strong>.</p>
                      )}
                      <p className="text-rose-700 font-medium pt-1">
                        Por favor selecciona una de las ventanas recomendadas arriba o ajusta la fecha de zarpe.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-3 text-emerald-900 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <strong className="font-bold">✓ Fechas 100% Disponibles:</strong> Tanto el {selectedVesselMeta.name} como {lodgingType !== 'onboard' ? `las ${selectedRoomIds.length} habitaciones del Lodge` : 'las cabinas a bordo'} están completamente libres entre el {departureDate} y el {returnDate}.
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 6: PUBLICACIÓN WEB, DESCRIPCIÓN & IMÁGENES (MATCHES SCREENSHOT 2) */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                  Paso 6 de 6 • Ficha Web
                </span>
                <h4 className="font-serif text-lg font-bold text-[#0f2b48] mt-1.5">
                  Descripción, Portada & Pilares para la Web Pública
                </h4>
                <p className="text-slate-500 text-xs font-light">
                  Personaliza los textos, imágenes y pilares que verán los clientes en la página de expediciones:
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
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
                    Imagen de Portada (URL)
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
                    <span>Ver Previsualización Pública en Vivo (Foto 2)</span>
                  </button>
                </div>

              </div>
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
                disabled={isSubmitting || dateRangeConflict?.hasConflict}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer ${
                  dateRangeConflict?.hasConflict
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-[#0f2b48] hover:bg-[#0a1e34] shadow-[#0f2b48]/25 hover:scale-[1.02]'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitting ? 'Guardando Expedición...' : 'Guardar & Publicar Expedición'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#0f2b48] hover:bg-[#0a1e34] text-white text-xs font-bold transition shadow-md shadow-[#0f2b48]/20 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LIVE PUBLIC PREVIEW MODAL (EXACT MATCH OF SCREENSHOT 2 WITH 2 BUTTONS) */}
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

            {/* Left Column: Cover & Quick Stats with 2 BUTTONS */}
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
                    <span>Zarpe / Estadía:</span>
                    <span className="font-bold text-white">{departureDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retorno:</span>
                    <span className="font-bold text-white">{returnDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embarcación / Base:</span>
                    <span className="font-bold text-white truncate max-w-[140px] text-right">
                      {selectedVesselMeta.name} {lodgingType !== 'onboard' && '+ Lodge'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temp. Estimada:</span>
                    <span className="font-bold text-white">{publicTempEstimate}</span>
                  </div>
                </div>
              </div>

              {/* DUAL ACTION BUTTONS IN BOTTOM-LEFT SECTION (AS REQUESTED) */}
              <div className="relative z-10 pt-6 border-t border-white/10 space-y-2.5">
                {/* Button 1: Download Brochure PDF */}
                <button
                  type="button"
                  onClick={() => alert(`Descargando Brochure Oficial PDF de la expedición: ${publicName}`)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4 text-blue-300" />
                  <span>Descargar Brochure en PDF</span>
                </button>

                {/* Button 2: Reserve Spot / Book with Concierge */}
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
