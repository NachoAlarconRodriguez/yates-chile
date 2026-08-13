import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Lock, Shield, X, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Expedition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  monthsActive: number[]; // 1 to 12
  year: number;
  spotsLeft: number | 'completo' | 'bloqueado';
  vessel: string;
  description: string;
  location: string;
  image: string;
  bestViewTime?: string;
  tempEstimate?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_INFO: Record<number, { temp: string; wind: string; highlights: string; clothing: string }> = {
  1: {
    temp: '18°C - 22°C',
    wind: 'S 8-12 Nudos',
    highlights: 'Plena temporada de verano. Aguas calmas, óptimo avistamiento de cetáceos y excelentes condiciones para buceo con lobos marinos en el archipiélago.',
    clothing: 'Vestimenta ligera, cortaviento ligero para la tarde y calzado de trekking.'
  },
  2: {
    temp: '18°C - 22°C',
    wind: 'S 10-15 Nudos',
    highlights: 'Días despejados y temperaturas cálidas. Ideal para caminatas exigentes a los picos de la isla y trekking al mirador Selkirk.',
    clothing: 'Protector solar, lentes de sol, ropa ligera y calzado de montaña.'
  },
  3: {
    temp: '15°C - 19°C',
    wind: 'SW 12-18 Nudos',
    highlights: 'Cierre de la temporada estival. Excelente visibilidad y vientos estables ideales para travesías oceánicas de retorno a vela.',
    clothing: 'Vestimenta en capas, cortaviento e impermeable ligero para lloviznas.'
  },
  4: {
    temp: '12°C - 16°C',
    wind: 'W 15-22 Nudos',
    highlights: 'Atmósfera tranquila de otoño. Bosques húmedos ideales para fotografía de naturaleza y total desconexión en el lodge.',
    clothing: 'Segundas capas térmicas, impermeable y calzado con agarre.'
  },
  5: {
    temp: '10°C - 14°C',
    wind: 'W 18-25 Nudos',
    highlights: 'Otoño profundo. Días frescos y nubosidad baja que resalta el misticismo de los acantilados marinos en Juan Fernández.',
    clothing: 'Parka de abrigo, primera capa térmica e impermeable robusto.'
  },
  6: {
    temp: '8°C - 12°C',
    wind: 'NW 20-30 Nudos',
    highlights: 'Solsticio de invierno. Clima indómito y paisajes cubiertos de niebla mística. Tardes ideales junto a la chimenea a leña.',
    clothing: 'Abrigo térmico pesado, impermeable y calzado de montaña grueso.'
  },
  7: {
    temp: '8°C - 11°C',
    wind: 'NW 22-35 Nudos',
    highlights: 'Invierno austral. La geografía insular en su máxima expresión de fuerza natural. Ideal para amantes de la navegación extrema.',
    clothing: 'Equipo de agua completo (oilskins), abrigo térmico pesado y gorro.'
  },
  8: {
    temp: '9°C - 13°C',
    wind: 'W 18-28 Nudos',
    highlights: 'Fin del invierno. Observación de aves marinas endémicas que inician sus ciclos reproductivos en los farellones de la isla.',
    clothing: 'Ropa térmica, cortaviento resistente y botas de media caña.'
  },
  9: {
    temp: '11°C - 15°C',
    wind: 'SW 15-22 Nudos',
    highlights: 'Equinoccio de primavera austral. Comienza la floración de la flora única de la isla y la reapertura oficial de nuestro Lodge.',
    clothing: 'Cortaviento intermedio, abrigo ligero y calzado apto para senderos húmedos.'
  },
  10: {
    temp: '13°C - 17°C',
    wind: 'S 12-18 Nudos',
    highlights: 'Temperaturas agradables y días más largos. Excelente mes para caminatas botánicas y observación terrestre en Bahía Cumberland.',
    clothing: 'Vestimenta por capas, lentes de sol, calzado cómodo y cortaviento.'
  },
  11: {
    temp: '15°C - 19°C',
    wind: 'S 10-15 Nudos',
    highlights: 'Primavera tardía. Cielos despejados y mar calmo, perfectos para la pesca artesanal de langosta y exploración en kayak.',
    clothing: 'Ropa cómoda de trekking, gorro, protector solar y abrigo liviano.'
  },
  12: {
    temp: '17°C - 21°C',
    wind: 'S 8-12 Nudos',
    highlights: 'Inicio del verano. Óptimas condiciones marítimas para cruces oceánicos cómodos y cenas con vista a la bahía.',
    clothing: 'Ropa ligera, lentes de sol, traje de baño y abrigo liviano nocturno.'
  }
};

export const EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-rob-1',
    name: 'Expedición Robinson',
    startDate: '09 sept 2026',
    endDate: '24 sept 2026',
    monthsActive: [9],
    year: 2026,
    spotsLeft: 'completo',
    vessel: 'Lodge Rincón de Navegantes',
    description: 'Estadía de exploración botánica e inmersión histórica en el archipiélago de Juan Fernández, hospedándose en nuestro santuario privado de Cumberland.',
    location: 'Isla Robinson Crusoe',
    image: '/rincon-de-navegantes.jpg',
    bestViewTime: 'Primavera austral',
    tempEstimate: '13°C - 16°C'
  },
  {
    id: 'exp-rob-2',
    name: 'Travesía Robinson',
    startDate: '30 sept 2026',
    endDate: '14 oct 2026',
    monthsActive: [9, 10],
    year: 2026,
    spotsLeft: 1,
    vessel: 'Velero Vegvisir',
    description: 'Aventura oceánica de ida y vuelta navegando a vela hacia Juan Fernández. Ideal para navegantes apasionados que buscan el reto del mar abierto.',
    location: 'Océano Pacífico Sur',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Zarpe de primavera',
    tempEstimate: '12°C - 15°C'
  },
  {
    id: 'exp-jf-nov',
    name: 'JF 1 de Noviembre',
    startDate: '31 oct 2026',
    endDate: '11 nov 2026',
    monthsActive: [10, 11],
    year: 2026,
    spotsLeft: 4,
    vessel: 'Lodge Rincón de Navegantes',
    description: 'Travesía de descanso en primavera tardía. Recorra senderos rodeados de helechos gigantes y disfrute de la primera pesca de langosta de la temporada.',
    location: 'Bahía Cumberland',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Mañana templada',
    tempEstimate: '14°C - 18°C'
  },
  {
    id: 'exp-zar-dic',
    name: 'Zarpe Archipiélago',
    startDate: '01 dic 2026',
    endDate: '15 dic 2026',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 2,
    vessel: 'Yate Terranova',
    description: 'Travesía rápida y confortable a motor a bordo de nuestro yate de alta velocidad. Explore caletas solitarias con la comodidad y el lujo que ofrece el Terranova.',
    location: 'Juan Fernández',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Atardecer en flybridge',
    tempEstimate: '16°C - 20°C'
  },
  {
    id: 'exp-sel-dic',
    name: 'Juan Fernández-Selkirk',
    startDate: '05 dic 2026',
    endDate: '12 dic 2026',
    monthsActive: [12],
    year: 2026,
    spotsLeft: 3,
    vessel: 'Lodge & Velero',
    description: 'Expedición combinada marítimo-terrestre en busca de los vestigios del histórico navegante Alejandro Selkirk. Incluye navegación en velero e itinerarios de trekking exigentes.',
    location: 'Santuario Selkirk',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Jornada de día completo',
    tempEstimate: '15°C - 19°C'
  },
  {
    id: 'exp-jf-ene',
    name: 'Archipiélago Juan Fernández',
    startDate: '01 ene 2027',
    endDate: '16 ene 2027',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 'completo',
    vessel: 'Lodge Rincón de Navegantes',
    description: 'Expedición en temporada alta de verano. Senderismo de montaña, buceo con lobos marinos de dos pelos y degustación gastronómica en nuestro refugio Cumberland.',
    location: 'Robinson Crusoe',
    image: '/rincon-de-navegantes.jpg',
    bestViewTime: 'Verano austral',
    tempEstimate: '18°C - 22°C'
  },
  {
    id: 'exp-sel-ene',
    name: 'Selkirk Colombia',
    startDate: '20 ene 2027',
    endDate: '28 ene 2027',
    monthsActive: [1],
    year: 2027,
    spotsLeft: 5,
    vessel: 'Velero Vegvisir',
    description: 'Navegación deportiva, pesca de altura y avistamiento de cetáceos en el Pacífico Sur profundo. Una ruta desafiante con el sello de Yates Chile.',
    location: 'Isla Alejandro Selkirk',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Navegación matutina',
    tempEstimate: '17°C - 21°C'
  },
  {
    id: 'exp-pes-ene',
    name: 'Grupo Pesca Selkirk (España)',
    startDate: '28 ene 2027',
    endDate: '04 feb 2027',
    monthsActive: [1, 2],
    year: 2027,
    spotsLeft: 'completo',
    vessel: 'Yate Terranova',
    description: 'Chárter de pesca deportiva exclusivo reservado para delegación internacional. Rutas de trolling de alta gama y servicios de lujo de chef a bordo.',
    location: 'Archipiélago Juan Fernández',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Pesca de amanecer',
    tempEstimate: '18°C - 22°C'
  },
  {
    id: 'exp-col-mar',
    name: 'Colombia Selkirk',
    startDate: '08 mar 2027',
    endDate: '17 mar 2027',
    monthsActive: [3],
    year: 2027,
    spotsLeft: 'bloqueado',
    vessel: 'Lodge Rincón de Navegantes',
    description: 'Reserva exclusiva bloqueada para misión de investigación científica, filmación de documentales y monitoreo de aves terrestres en peligro de extinción.',
    location: 'Bahía Cumberland',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Reserva científica',
    tempEstimate: '16°C - 20°C'
  },
  {
    id: 'exp-zar-mar',
    name: 'Zarpe Especial del Archipiélago',
    startDate: '14 mar 2027',
    endDate: '29 mar 2027',
    monthsActive: [3],
    year: 2027,
    spotsLeft: 6,
    vessel: 'Velero Vegvisir',
    description: 'Expedición marítima de fin de verano recorriendo las caletas más inaccesibles y bahías protegidas del archipiélago con excelentes vientos de retorno.',
    location: 'Juan Fernández',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    bestViewTime: 'Navegación al atardecer',
    tempEstimate: '15°C - 19°C'
  }
];

const formatRut = (value: string): string => {
  const clean = value.replace(/[\s.-]/g, '');
  if (clean.length === 0) return '';
  
  if (/[^0-9kK]/.test(clean)) {
    return clean.toUpperCase();
  }
  
  const limited = clean.substring(0, 9);
  if (limited.length === 1) {
    return limited.toUpperCase();
  }
  
  const body = limited.slice(0, -1);
  const dv = limited.slice(-1).toUpperCase();
  
  let formattedBody = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formattedBody = body.charAt(i) + formattedBody;
    count++;
    if (count === 3 && i > 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  return `${formattedBody}-${dv}`;
};

export const ExpeditionCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // Start in September
  const [activeExpeditionId, setActiveExpeditionId] = useState<string | null>('exp-rob-1');

  // Booking Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  const [bookingData, setBookingData] = useState({
    guestsCount: 2,
    fullName: '',
    docId: '',
    phone: '',
    email: '',
    specialRequests: '',
  });

  const isFormValid = bookingData.fullName.trim() !== '' &&
                      bookingData.phone.trim() !== '' &&
                      bookingData.email.trim() !== '' &&
                      bookingData.docId.trim() !== '';

  // Filter expeditions available in selected month
  const activeExpeditions = EXPEDITIONS.filter(exp => exp.monthsActive.includes(selectedMonth));

  // Sync selected expedition when month changes
  React.useEffect(() => {
    if (activeExpeditions.length > 0) {
      const exists = activeExpeditions.some(e => e.id === activeExpeditionId);
      if (!exists) {
        setActiveExpeditionId(activeExpeditions[0].id);
      }
    } else {
      setActiveExpeditionId(null);
    }
  }, [selectedMonth]);

  const activeExpedition = EXPEDITIONS.find(e => e.id === activeExpeditionId) || null;

  const handleOpenBookingModal = () => {
    setBookingSubmitted(false);
    setBookingLoading(false);
    setBookingData({
      guestsCount: 2,
      fullName: '',
      docId: '',
      phone: '',
      email: '',
      specialRequests: '',
    });
    setIsModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    setTimeout(() => {
      setBookingLoading(true); // Keep loading state until window redirection starts
      setBookingSubmitted(true);

      // Trigger Confetti Effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#0F172A', '#F8FAFC'],
        });
      } catch (err) {
        // Fallback
      }

      // Save booking request to localStorage for Admin Dashboard
      try {
        const stored = localStorage.getItem('yates_bookings');
        const bookings = stored ? JSON.parse(stored) : [];
        const newBooking = {
          id: `res-${Date.now()}`,
          fullName: bookingData.fullName,
          docId: bookingData.docId,
          phone: bookingData.phone,
          email: bookingData.email,
          expeditionName: activeExpedition?.name || 'Travesía Austral',
          guestsCount: bookingData.guestsCount,
          dateCreated: new Date().toISOString().split('T')[0],
          status: 'pendiente'
        };
        bookings.unshift(newBooking);
        localStorage.setItem('yates_bookings', JSON.stringify(bookings));
      } catch (err) {
        // Fallback
      }

      const text = encodeURIComponent(
        `Hola, deseo solicitar una reserva para la expedición:\n\n` +
        `• Travesía: ${activeExpedition?.name}\n` +
        `• Fechas: ${activeExpedition?.startDate} → ${activeExpedition?.endDate}\n` +
        `• Base/Embarcación: ${activeExpedition?.vessel}\n` +
        `• Pasajeros a bordo: ${bookingData.guestsCount} personas\n` +
        `• Nombre Pasajero Líder: ${bookingData.fullName}\n` +
        `• RUT / Pasaporte: ${bookingData.docId}\n` +
        `• Teléfono Móvil: ${bookingData.phone}\n` +
        `• Correo Electrónico: ${bookingData.email}\n` +
        (bookingData.specialRequests ? `• Notas Especiales: ${bookingData.specialRequests}\n` : '') + `\n` +
        `Solicito validación de cupos e información para coordinar el abono.`
      );

      const whatsappUrl = `https://wa.me/56981312920?text=${text}`;

      setTimeout(() => {
        setBookingLoading(false);
        window.open(whatsappUrl, '_blank');
      }, 1250);
    }, 1000);
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-800" />
            <span>Fechas, Zarpes & Disponibilidad en Vivo</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Calendario de Expediciones
          </h2>
          <p className="mt-4 text-slate-655 text-base sm:text-lg leading-relaxed">
            Consulte los zarpes confirmados y la disponibilidad de cupos en tiempo real para nuestros programas al archipiélago de Juan Fernández y fiordos patagónicos.
          </p>
        </div>

        {/* 12-Month Interactive Slider Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
              <Calendar className="w-5 h-5 text-blue-900" />
              <span>Cronograma:</span>
              <span className="text-blue-955 font-serif font-bold text-xl ml-1">
                {MONTH_NAMES[selectedMonth - 1]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1)}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 cursor-pointer"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1)}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 cursor-pointer"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Month buttons grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {MONTH_NAMES.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = selectedMonth === monthNum;
              const hasExpeditions = EXPEDITIONS.some(exp => exp.monthsActive.includes(monthNum));

              return (
                <button
                  key={name}
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all min-h-[48px] flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md border border-slate-800 scale-105'
                      : hasExpeditions
                      ? 'bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-955 border border-slate-200'
                      : 'bg-slate-100/50 text-slate-400 border border-transparent opacity-60'
                  }`}
                >
                  <span>{name.substring(0, 3)}</span>
                  {hasExpeditions && <span className="w-1.5 h-1.5 rounded-full bg-blue-800"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Split View */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Expeditions list of the month */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            {activeExpeditions.length > 0 ? (
              <>
                <div className="space-y-4 flex-1">
                  {activeExpeditions.map((exp) => {
                    const isActive = activeExpeditionId === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setActiveExpeditionId(exp.id)}
                        className={`p-6 rounded-2xl transition-all duration-300 text-left border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isActive
                            ? 'bg-white border-blue-900 shadow-md translate-x-1'
                            : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                              {exp.vessel}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-lg text-slate-950">
                            {exp.name}
                          </h4>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {exp.startDate} → {exp.endDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Availability badge */}
                          {exp.spotsLeft === 'completo' && (
                            <span className="px-3 py-1 rounded-full bg-red-550/10 border border-red-500/20 text-red-750 font-bold text-[10px] uppercase tracking-wider">
                              Completo
                            </span>
                          )}
                          {exp.spotsLeft === 'bloqueado' && (
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Completo
                            </span>
                          )}
                          {typeof exp.spotsLeft === 'number' && exp.spotsLeft === 1 && (
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-755 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                              1 cupo libre
                            </span>
                          )}
                          {typeof exp.spotsLeft === 'number' && exp.spotsLeft > 1 && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                              {exp.spotsLeft} cupos libres
                            </span>
                          )}

                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isActive ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                          }`}>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Información Mensual Climatológica */}
                <div className="mt-auto bg-blue-50/30 border border-blue-100/60 rounded-3xl p-6 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-955 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-800 animate-pulse" />
                    <span>Condiciones de Navegación en {MONTH_NAMES[selectedMonth - 1]}</span>
                  </div>
                  <p className="text-slate-655 text-xs leading-relaxed font-light">
                    {MONTHS_INFO[selectedMonth].highlights}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100/60 font-mono text-[10px] text-slate-600">
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Clima Promedio</span>
                      <span className="font-bold text-slate-800 block">{MONTHS_INFO[selectedMonth].temp}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Vestimenta Recomendada</span>
                      <span className="font-bold text-slate-800 block truncate" title={MONTHS_INFO[selectedMonth].clothing}>
                        {MONTHS_INFO[selectedMonth].clothing}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Custom Private Charter Placeholder */
              <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-900" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="font-serif font-bold text-xl text-slate-900">
                    Travesías Privadas & Chárter a Medida
                  </h4>
                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed font-light">
                    No disponemos de expediciones grupales programadas para el mes de {MONTH_NAMES[selectedMonth - 1]}. 
                    Sin embargo, puede arrendar una embarcación privada o planificar una estadía adaptada con nuestro concierge.
                  </p>
                </div>
                <a
                  href="#/contacto"
                  className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition text-xs shadow-md min-h-[42px]"
                >
                  <span>Consultar con Concierge</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </a>
              </div>
            )}
          </div>

          {/* Right: Selected Expedition Preview Panel */}
          <div className="lg:col-span-5">
            {activeExpedition ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between h-full space-y-6 bg-slate-50/20">
                <div>
                  <div className="relative rounded-2xl overflow-hidden mb-6 h-52 shadow-inner border border-slate-100 bg-slate-100">
                    <img
                      src={activeExpedition.image}
                      alt={activeExpedition.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/95 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                      {activeExpedition.vessel}
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-950">
                    {activeExpedition.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    <span>{activeExpedition.location}</span>
                  </div>

                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    {activeExpedition.description}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Temporada óptima:</span>
                      <span className="font-bold text-slate-900 font-mono">{activeExpedition.bestViewTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Temp. aproximada:</span>
                      <span className="font-bold text-slate-900 font-mono">{activeExpedition.tempEstimate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Status CTA buttons */}
                  {activeExpedition.spotsLeft === 'completo' && (
                    <a
                      href="#/contacto"
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold px-6 py-3.5 rounded-xl transition text-sm border border-slate-200 shadow-sm min-h-[48px] cursor-pointer"
                    >
                      <span>Unirse a Lista de Espera</span>
                      <ArrowRight className="w-4 h-4 text-slate-700" />
                    </a>
                  )}
                  {activeExpedition.spotsLeft === 'bloqueado' && (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 text-slate-400 font-bold px-6 py-3.5 rounded-xl text-sm min-h-[48px] border border-slate-200 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Bloqueado por Misión Especial</span>
                    </button>
                  )}
                  {typeof activeExpedition.spotsLeft === 'number' && (
                    <button
                      onClick={handleOpenBookingModal}
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-md min-h-[48px] cursor-pointer focus:outline-none"
                    >
                      <span>Reservar Cupo</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Custom Private Charter Panel for null month selected */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="relative rounded-2xl overflow-hidden mb-6 h-52 shadow-inner border border-slate-100 bg-slate-100">
                    <img
                      src="/rincon-de-navegantes.jpg"
                      alt="Chárter Privado"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/95 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                      Servicio Premium Chárter
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-950">
                    Programación a Medida
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    <span>Navegación flexible / Lodge</span>
                  </div>

                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    Coordine un zarpe privado en velero o yate con catering personalizado, o diseñe una estadía con actividades guiadas a medida en nuestro Lodge de Juan Fernández.
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Tripulación:</span>
                      <span className="font-bold text-slate-900 font-mono">Capitán, Guía local y Chef</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Disponibilidad:</span>
                      <span className="font-bold text-emerald-700 font-mono">A solicitud</span>
                    </div>
                  </div>
                </div>

                <a
                  href="#/contacto"
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-md min-h-[48px] cursor-pointer"
                >
                  <span>Consultar Chárter Privado</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking popup modal (Split Layout) */}
      {isModalOpen && activeExpedition && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full md:h-[530px] max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row relative text-slate-800 animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus:outline-none z-30 bg-white/85 backdrop-blur-md rounded-full shadow-sm"
              aria-label="Cerrar modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {!bookingSubmitted ? (
              <>
                {/* Left Column: Widescreen Journey Summary */}
                <div className="relative w-full md:w-5/12 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[200px] md:min-h-auto shrink-0">
                  {/* Background Image with Overlay */}
                  <img
                    src={activeExpedition.image}
                    alt={activeExpedition.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/45" />

                  {/* Content over background */}
                  <div className="relative z-10 space-y-4">
                    <span className="text-[9px] uppercase tracking-widest text-slate-350 font-mono block font-bold">
                      Resumen de Travesía
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="font-serif font-bold text-xl sm:text-2xl text-white leading-tight">
                        {activeExpedition.name}
                      </h4>
                      <p className="text-slate-300 font-mono text-[10px] uppercase tracking-wider">
                        {activeExpedition.vessel} • {activeExpedition.location}
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-3">
                      <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block font-bold mb-0.5">Período de Navegación</span>
                      <span className="font-serif italic text-white text-base font-semibold block">
                        {activeExpedition.startDate} al {activeExpedition.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 hidden md:block">
                    <p className="text-[11px] text-slate-350 italic font-light leading-relaxed">
                      "Su expedición austral comienza aquí. Inicie su solicitud de reserva; un asesor náutico se contactará con usted para personalizar su travesía y validar disponibilidad."
                    </p>
                  </div>
                </div>

                {/* Right Column: Single Page Form */}
                <form onSubmit={handleBookingSubmit} className="w-full md:w-7/12 p-6 flex flex-col justify-between h-full overflow-y-auto">
                  <div className="space-y-4">
                    {/* Header for form */}
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[9px] uppercase tracking-widest text-slate-455 font-mono block font-bold">
                        Solicitud de Reserva
                      </span>
                      <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug">
                        Inscripción de Pasajero
                      </h3>
                    </div>

                    {/* Mobile summary card helper */}
                    <div className="md:hidden p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-mono block">Travesía seleccionada</span>
                      <h4 className="font-serif font-bold text-xs text-slate-900 leading-tight">{activeExpedition.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">{activeExpedition.startDate} al {activeExpedition.endDate}</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3.5 text-left">
                      <div>
                        <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Roberto Silva"
                          value={bookingData.fullName}
                          onChange={(e) => setBookingData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full border-b border-slate-200 focus:border-slate-950 focus:outline-none py-1 text-sm text-slate-900 bg-transparent placeholder-slate-300 rounded-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                            WhatsApp / Teléfono *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Ej. +56 9 1234 5678"
                            value={bookingData.phone}
                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full border-b border-slate-200 focus:border-slate-950 focus:outline-none py-1 text-sm text-slate-900 bg-transparent placeholder-slate-300 rounded-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                            Correo Electrónico *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="ejemplo@correo.com"
                            value={bookingData.email}
                            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full border-b border-slate-200 focus:border-slate-950 focus:outline-none py-1 text-sm text-slate-900 bg-transparent placeholder-slate-300 rounded-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                            RUT / Pasaporte *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 12.345.678-9 o P123456"
                            value={bookingData.docId}
                            onChange={(e) => setBookingData(prev => ({ ...prev, docId: formatRut(e.target.value) }))}
                            className="w-full border-b border-slate-200 focus:border-slate-950 focus:outline-none py-1 text-sm text-slate-900 bg-transparent placeholder-slate-300 rounded-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                            Cantidad de Pasajeros *
                          </label>
                          <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-1 select-none bg-slate-50/50 h-[32px] mt-0.5">
                            <span className="text-xs text-slate-500 font-sans">Pasajeros</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setBookingData(prev => ({ ...prev, guestsCount: Math.max(1, prev.guestsCount - 1) }))}
                                className="text-slate-400 hover:text-slate-950 hover:bg-slate-200/50 transition focus:outline-none cursor-pointer w-4.5 h-4.5 flex items-center justify-center rounded-full text-xs font-semibold"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-mono text-[11px] font-bold text-slate-800">
                                {bookingData.guestsCount}
                              </span>
                              <button
                                type="button"
                                onClick={() => setBookingData(prev => ({ ...prev, guestsCount: Math.min(8, prev.guestsCount + 1) }))}
                                className="text-slate-400 hover:text-slate-950 hover:bg-slate-200/50 transition focus:outline-none cursor-pointer w-4.5 h-4.5 flex items-center justify-center rounded-full text-xs font-semibold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests (Optional) */}
                      <div>
                        <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                          Notas Especiales / Preferencias (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Alergias alimenticias, celebración, etc. (opcional)"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="w-full border-b border-slate-200 focus:border-slate-950 focus:outline-none py-1 text-xs text-slate-900 bg-transparent placeholder-slate-350 rounded-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={bookingLoading || !isFormValid}
                      className={`text-[10px] uppercase tracking-widest font-bold px-6 py-3 transition focus:outline-none shadow-md flex items-center gap-2 rounded-xl ${
                        isFormValid && !bookingLoading
                          ? 'bg-slate-950 hover:bg-slate-900 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {bookingLoading ? 'Enviando...' : 'Solicitar Reserva vía WhatsApp ➔'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success screen inside Modal */
              <div className="p-8 sm:p-12 text-center space-y-6 flex-1 flex flex-col justify-center items-center select-none bg-slate-950 text-white min-h-[350px] md:min-h-[400px]">
                {/* Glowing Vegvisir Success Logo */}
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0 relative animate-[fadeIn_0.5s_ease-out]">
                  <span className="absolute -inset-3 rounded-full border border-emerald-500/20 animate-ping opacity-60 pointer-events-none" />
                  <img
                    src="/vegvisir-emblem.svg"
                    alt="Success Emblem"
                    className="w-12 h-12 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] invert animate-[spin_50s_linear_infinite]"
                  />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h4 className="font-serif text-2xl font-bold text-white tracking-tight">
                    ¡Solicitud Registrada!
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                    Tu solicitud para <strong className="font-semibold text-white">{activeExpedition.name}</strong> ha sido enviada con éxito.
                  </p>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed pt-2">
                    Redirigiendo automáticamente a WhatsApp para coordinar los detalles con tu asesor...
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-6 text-xs">
                  <a
                    href="/brochure-yates-chile.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center gap-1.5 transition hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Itinerario PDF</span>
                  </a>
                  <a
                    href={`https://wa.me/56981312920?text=${encodeURIComponent(
                      `Hola, deseo confirmar mi reserva para ${activeExpedition.name}. Mi nombre es ${bookingData.fullName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-slate-100 text-slate-955 text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-xl transition focus:outline-none shadow-md cursor-pointer"
                  >
                    <span>Abrir WhatsApp ➔</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
