import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Lock, Shield } from 'lucide-react';
import { useExpeditions } from '../../hooks/useExpeditions';
import { useLanguage } from '../../context/LanguageContext';
import { translationService } from '../../services/translationService';
import { INITIAL_EXPEDITIONS, type PublicExpedition } from '../../services/expeditionService';
import { ExpeditionBookingModal } from './ExpeditionBookingModal';

export type Expedition = PublicExpedition;

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_INFO: Record<number, { temp: string; wind: string; highlights: { es: string; en: string }; clothing: { es: string; en: string } }> = {
  1: {
    temp: '18°C - 22°C',
    wind: 'S 8-12 Nudos',
    highlights: {
      es: 'Plena temporada de verano. Aguas calmas, óptimo avistamiento de cetáceos y excelentes condiciones para buceo con lobos marinos en el archipiélago.',
      en: 'Peak summer season. Calm waters, optimal whale watching, and excellent conditions for diving with fur seals.'
    },
    clothing: {
      es: 'Vestimenta ligera, cortaviento ligero para la tarde y calzado de trekking.',
      en: 'Light clothing, windbreaker for late afternoon, and trekking shoes.'
    }
  },
  2: {
    temp: '18°C - 22°C',
    wind: 'S 10-15 Nudos',
    highlights: {
      es: 'Días despejados y temperaturas cálidas. Ideal para caminatas exigentes a los picos de la isla y trekking al mirador Selkirk.',
      en: 'Clear skies and warm temperatures. Perfect for summit hikes and trekking to Selkirk lookout.'
    },
    clothing: {
      es: 'Protector solar, lentes de sol, ropa ligera y calzado de montaña.',
      en: 'Sunscreen, sunglasses, breathable clothing, and trail footwear.'
    }
  },
  3: {
    temp: '15°C - 19°C',
    wind: 'SW 12-18 Nudos',
    highlights: {
      es: 'Cierre de la temporada estival. Excelente visibilidad y vientos estables ideales para travesías oceánicas de retorno a vela.',
      en: 'End of summer season. Superb visibility and steady winds ideal for ocean sailing passages.'
    },
    clothing: {
      es: 'Vestimenta en capas, cortaviento e impermeable ligero para lloviznas.',
      en: 'Layered clothing, windbreaker, and light waterproof gear.'
    }
  },
  4: {
    temp: '12°C - 16°C',
    wind: 'W 15-22 Nudos',
    highlights: {
      es: 'Atmósfera tranquila de otoño. Bosques húmedos ideales para fotografía de naturaleza y total desconexión en el lodge.',
      en: 'Peaceful autumn atmosphere. Misty native forests for photography and serene lodge relaxation.'
    },
    clothing: {
      es: 'Segundas capas térmicas, impermeable y calzado con agarre.',
      en: 'Thermal mid-layers, waterproof jacket, and high-traction shoes.'
    }
  },
  5: {
    temp: '10°C - 14°C',
    wind: 'W 18-25 Nudos',
    highlights: {
      es: 'Otoño profundo. Días frescos y nubosidad baja que resalta el misticismo de los acantilados marinos en Juan Fernández.',
      en: 'Late autumn. Crisp days and low clouds highlighting mystical sea cliffs of Juan Fernández.'
    },
    clothing: {
      es: 'Parka de abrigo, primera capa térmica e impermeable robusto.',
      en: 'Warm parka, base layer thermals, and sturdy waterproof gear.'
    }
  },
  6: {
    temp: '8°C - 12°C',
    wind: 'NW 20-30 Nudos',
    highlights: {
      es: 'Solsticio de invierno. Clima indómito y paisajes cubiertos de niebla mística. Tardes ideales junto a la chimenea a leña.',
      en: 'Winter solstice. Wild weather and misty cliffs. Cozy evenings by the crackling wood fireplace.'
    },
    clothing: {
      es: 'Abrigo térmico pesado, impermeable y calzado de montaña grueso.',
      en: 'Heavy thermal coat, storm gear, and alpine trekking boots.'
    }
  },
  7: {
    temp: '8°C - 11°C',
    wind: 'NW 22-35 Nudos',
    highlights: {
      es: 'Invierno austral. La geografía insular en su máxima expresión de fuerza natural. Ideal para amantes de la navegación extrema.',
      en: 'Austral winter. Island geography in full raw elemental power. Tailored for extreme sailing enthusiasts.'
    },
    clothing: {
      es: 'Equipo de agua completo (oilskins), abrigo térmico pesado y gorro.',
      en: 'Full offshore foul weather gear (oilskins), heavy thermals, and warm beanie.'
    }
  },
  8: {
    temp: '9°C - 13°C',
    wind: 'W 18-28 Nudos',
    highlights: {
      es: 'Fin del invierno. Observación de aves marinas endémicas que inician sus ciclos reproductivos en los farellones de la isla.',
      en: 'End of winter. Observation of endemic pelagic birds starting their breeding cycles on sea cliffs.'
    },
    clothing: {
      es: 'Ropa térmica, cortaviento resistente y botas de media caña.',
      en: 'Thermal layers, rugged windbreaker, and mid-cut boots.'
    }
  },
  9: {
    temp: '11°C - 15°C',
    wind: 'SW 15-22 Nudos',
    highlights: {
      es: 'Equinoccio de primavera austral. Comienza la floración de la flora única de la isla y la reapertura oficial de nuestro Lodge.',
      en: 'Spring equinox. Unique island flora blossoms and the official season opening of our Lodge.'
    },
    clothing: {
      es: 'Cortaviento intermedio, abrigo ligero y calzado apto para senderos húmedos.',
      en: 'Mid-layer windbreaker, light jacket, and trail shoes for damp ground.'
    }
  },
  10: {
    temp: '13°C - 17°C',
    wind: 'S 12-18 Nudos',
    highlights: {
      es: 'Temperaturas agradables y días más largos. Excelente mes para caminatas botánicas y observación terrestre en Bahía Cumberland.',
      en: 'Pleasant temperatures and longer daylight. Superb month for botanical hikes in Cumberland Bay.'
    },
    clothing: {
      es: 'Vestimenta por capas, lentes de sol, calzado cómodo y cortaviento.',
      en: 'Layered clothing, sunglasses, comfortable walking shoes, and windbreaker.'
    }
  },
  11: {
    temp: '15°C - 19°C',
    wind: 'S 10-15 Nudos',
    highlights: {
      es: 'Primavera tardía. Cielos despejados y mar calmo, perfectos para la pesca artesanal de langosta y exploración en kayak.',
      en: 'Late spring. Clear skies and calm seas, ideal for artisanal lobster catching and coastal kayaking.'
    },
    clothing: {
      es: 'Ropa cómoda de trekking, gorro, protector solar y abrigo liviano.',
      en: 'Comfortable trekking clothes, sun hat, sunscreen, and light evening layer.'
    }
  },
  12: {
    temp: '17°C - 21°C',
    wind: 'S 8-12 Nudos',
    highlights: {
      es: 'Inicio del verano. Óptimas condiciones marítimas para cruces oceánicos cómodos y cenas con vista a la bahía.',
      en: 'Beginning of summer. Optimal sea conditions for comfortable ocean crossings and bay-view dinners.'
    },
    clothing: {
      es: 'Ropa ligera, lentes de sol, traje de baño y abrigo liviano nocturno.',
      en: 'Light clothing, sunglasses, swimwear, and a light jacket for breezy evenings.'
    }
  }
};

export const EXPEDITIONS: Expedition[] = INITIAL_EXPEDITIONS;

export const ExpeditionCalendar: React.FC = () => {
  const { expeditions } = useExpeditions();
  const { language, t } = useLanguage();
  const isEn = language === 'EN';
  const monthNames = isEn ? MONTH_NAMES_EN : MONTH_NAMES_ES;

  const [selectedMonth, setSelectedMonth] = useState<number>(11); // Iniciar en temporada alta (Noviembre)
  const [activeExpeditionId, setActiveExpeditionId] = useState<string | null>('exp-cabo-nov-26');
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
            <span>{t('Fechas, Zarpes & Disponibilidad en Vivo', 'Dates, Departures & Live Availability')}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            {t('Calendario de Expediciones', 'Expeditions Calendar')}
          </h2>
          <p className="mt-4 text-slate-655 text-base sm:text-lg leading-relaxed">
            {t('Consulta los zarpes confirmados y la disponibilidad de cupos en tiempo real para nuestros programas al archipiélago de Juan Fernández y Cabo de Hornos.', 'Check confirmed departures and real-time spot availability for our Juan Fernández and Cape Horn programs.')}
          </p>
        </div>

        {/* 12-Month Interactive Slider Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
              <Calendar className="w-5 h-5 text-blue-900" />
              <span>{t('Cronograma:', 'Schedule:')}</span>
              <span className="text-blue-955 font-serif font-bold text-xl ml-1">
                {monthNames[selectedMonth - 1]}
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
            {monthNames.map((name, index) => {
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
                              {isEn ? translationService.fallbackTranslate(exp.vessel, 'EN') : exp.vessel}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-lg text-slate-950">
                            {isEn ? translationService.fallbackTranslate(exp.name, 'EN') : exp.name}
                          </h4>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {exp.startDate} → {exp.endDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Availability badge */}
                          {exp.spotsLeft === 'completo' && (
                            <span className="px-3 py-1 rounded-full bg-red-550/10 border border-red-500/20 text-red-750 font-bold text-[10px] uppercase tracking-wider">
                              {t('Completo', 'Sold Out')}
                            </span>
                          )}
                          {exp.spotsLeft === 'bloqueado' && (
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <Lock className="w-3 h-3" /> {t('Completo', 'Sold Out')}
                            </span>
                          )}
                          {typeof exp.spotsLeft === 'number' && exp.spotsLeft === 1 && (
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-755 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                              {t('1 cupo libre', '1 spot left')}
                            </span>
                          )}
                          {typeof exp.spotsLeft === 'number' && exp.spotsLeft > 1 && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                              {exp.spotsLeft} {t('cupos libres', 'spots left')}
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
                    <span>{t('Condiciones de Navegación en', 'Sailing Conditions in')} {monthNames[selectedMonth - 1]}</span>
                  </div>
                  <p className="text-slate-655 text-xs leading-relaxed font-light">
                    {MONTHS_INFO[selectedMonth].highlights[isEn ? 'en' : 'es']}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100/60 font-mono text-[10px] text-slate-600">
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">{t('Clima Promedio', 'Average Weather')}</span>
                      <span className="font-bold text-slate-800 block">{MONTHS_INFO[selectedMonth].temp}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">{t('Vestimenta Recomendada', 'Recommended Clothing')}</span>
                      <span className="font-bold text-slate-800 block truncate" title={MONTHS_INFO[selectedMonth].clothing[isEn ? 'en' : 'es']}>
                        {MONTHS_INFO[selectedMonth].clothing[isEn ? 'en' : 'es']}
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
                    {t('Travesías Privadas & Chárter a Medida', 'Private Voyages & Custom Charters')}
                  </h4>
                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed font-light">
                    {t(
                      `No disponemos de expediciones grupales programadas para el mes de ${monthNames[selectedMonth - 1]}. Sin embargo, puede arrendar una embarcación privada o planificar una estadía adaptada con nuestro concierge.`,
                      `We have no scheduled group expeditions for the month of ${monthNames[selectedMonth - 1]}. However, you can charter a private vessel or coordinate a tailored stay with our concierge.`
                    )}
                  </p>
                </div>
                <a
                  href="#/contacto"
                  className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition text-xs shadow-md min-h-[42px]"
                >
                  <span>{t('Consultar con Concierge', 'Inquire with Concierge')}</span>
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
                      {isEn ? translationService.fallbackTranslate(activeExpedition.vessel, 'EN') : activeExpedition.vessel}
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-950">
                    {isEn ? translationService.fallbackTranslate(activeExpedition.name, 'EN') : activeExpedition.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    <span>{isEn ? translationService.fallbackTranslate(activeExpedition.location, 'EN') : activeExpedition.location}</span>
                  </div>

                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    {isEn ? translationService.fallbackTranslate(activeExpedition.description, 'EN') : activeExpedition.description}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">{t('Temporada óptima:', 'Optimal season:')}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {isEn && activeExpedition.bestViewTime ? translationService.fallbackTranslate(activeExpedition.bestViewTime, 'EN') : activeExpedition.bestViewTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">{t('Temp. aproximada:', 'Approx. temp:')}</span>
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
                      <span>{t('Unirse a Lista de Espera', 'Join Waitlist')}</span>
                      <ArrowRight className="w-4 h-4 text-slate-700" />
                    </a>
                  )}
                  {activeExpedition.spotsLeft === 'bloqueado' && (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 text-slate-400 font-bold px-6 py-3.5 rounded-xl text-sm min-h-[48px] border border-slate-200 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>{t('Bloqueado por Misión Especial', 'Reserved for Special Mission')}</span>
                    </button>
                  )}
                  {typeof activeExpedition.spotsLeft === 'number' && (
                    <button
                      onClick={handleOpenBookingModal}
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-md min-h-[48px] cursor-pointer focus:outline-none"
                    >
                      <span>{t('Reservar Cupo', 'Book Spot')}</span>
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
                      {t('Servicio Premium Chárter', 'Premium Charter Service')}
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-950">
                    {t('Programación a Medida', 'Customized Scheduling')}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    <span>{t('Navegación flexible / Lodge', 'Flexible Cruising / Lodge')}</span>
                  </div>

                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    {t('Coordine un zarpe privado en velero o yate con catering personalizado, o diseñe una estadía con actividades guiadas a medida en nuestro Lodge de Juan Fernández.', 'Arrange a private charter on sailboat or yacht with bespoke dining, or curate an expedition stay with guided activities at our Juan Fernández Lodge.')}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">{t('Tripulación:', 'Crew:')}</span>
                      <span className="font-bold text-slate-900 font-mono">{t('Capitán, Guía local y Chef', 'Captain, Local Guide and Chef')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">{t('Disponibilidad:', 'Availability:')}</span>
                      <span className="font-bold text-emerald-700 font-mono">{t('A solicitud', 'On request')}</span>
                    </div>
                  </div>
                </div>

                <a
                  href="#/contacto"
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-md min-h-[48px] cursor-pointer"
                >
                  <span>{t('Consultar Chárter Privado', 'Inquire Private Charter')}</span>
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
