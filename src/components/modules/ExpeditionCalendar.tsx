import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Lock, Shield } from 'lucide-react';
import { useExpeditions } from '../../hooks/useExpeditions';
import { INITIAL_EXPEDITIONS, type PublicExpedition } from '../../services/expeditionService';
import { ExpeditionBookingModal } from './ExpeditionBookingModal';

export type Expedition = PublicExpedition;

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

export const EXPEDITIONS: Expedition[] = INITIAL_EXPEDITIONS;

export const ExpeditionCalendar: React.FC = () => {
  const { expeditions } = useExpeditions();
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // Start in September
  const [activeExpeditionId, setActiveExpeditionId] = useState<string | null>('exp-rob-1');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filter expeditions available in selected month
  const activeExpeditions = expeditions.filter(exp => exp.monthsActive.includes(selectedMonth));

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
  }, [selectedMonth, activeExpeditions, activeExpeditionId]);

  const activeExpedition = expeditions.find(e => e.id === activeExpeditionId) || activeExpeditions[0] || null;

  const handleOpenBookingModal = () => {
    setIsModalOpen(true);
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
            Consulta los zarpes confirmados y la disponibilidad de cupos en tiempo real para nuestros programas al archipiélago de Juan Fernández y Cabo de Hornos.
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
              const hasExpeditions = expeditions.some(exp => exp.monthsActive.includes(monthNum));

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

      {/* Expedition Booking Modal */}
      <ExpeditionBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expedition={activeExpedition}
      />
    </section>
  );
};
