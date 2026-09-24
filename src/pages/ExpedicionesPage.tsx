import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useExpeditions } from '../hooks/useExpeditions';
import { isExpeditionSoldOut, getExpeditionAvailableSpots, type PublicExpedition as Expedition } from '../services/expeditionService';
import { normalizeExternalMediaUrl, normalizeBrochureUrl, type ExpeditionCategory, DEFAULT_EXPEDITION_CATEGORIES } from '../services/cmsService';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';
import { ExpeditionBookingModal } from '../components/modules/ExpeditionBookingModal';
import { ExpeditionsLoadingState } from '../components/modules/ExpeditionsLoadingState';
import { 
  Compass, 
  Download, 
  Clock, 
  ArrowRight, 
  X, 
  MapPin, 
  Sparkles, 
  Utensils, 
  Waves, 
  CloudSun, 
  Anchor
} from 'lucide-react';

interface ExpedicionesPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

interface ExpeditionPillar {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface ExpeditionOverview {
  headline: string;
  summary: string;
  pillars: ExpeditionPillar[];
  included: string[];
  weatherPolicy: string;
}

const getExpeditionOverview = (exp: Expedition, t: (es: string, en: string) => string): ExpeditionOverview => {
  const v = exp.vessel.toLowerCase();

  const unifiedPillars: ExpeditionPillar[] = [
    {
      icon: <Anchor className="w-5 h-5 text-blue-900" />,
      title: t('Velerismo Oceánico de Altura', 'Oceanic Offshore Sailing'),
      desc: t(
        'Navegación a vela con patrón de ultramar, guardias astronómicas, trimado táctico de jarcia y cartas náuticas en mar abierto.',
        'Offshore sailing with certified master, night watches, sail trimming, and nautical charting.'
      )
    },
    {
      icon: <Utensils className="w-5 h-5 text-blue-900" />,
      title: t('Alojamiento en Rincón de Navegantes', 'Accommodation in Rincón de Navegantes'),
      desc: t(
        'Un lodge inspirado en quienes navegan, exploran y llevan el mar por dentro. Madera, calma y tradición navegante en la costa de Robinson Crusoe, frente a una bahía donde cada ventana mira al océano.',
        'A lodge inspired by those who sail, explore, and carry the sea within. Wood, tranquility, and sailing tradition on the coast of Robinson Crusoe, facing a bay where every window looks out to the ocean.'
      )
    },
    {
      icon: <Compass className="w-5 h-5 text-blue-900" />,
      title: t('Exploración', 'Exploration'),
      desc: t(
        'Actividades terrestres y náuticas, cabalgata, trekking, snorkeling.',
        'Land and nautical activities, horseback riding, trekking, snorkeling.'
      )
    },
    {
      icon: <Waves className="w-5 h-5 text-blue-900" />,
      title: t('Autonomía Total & Starlink 24/7', 'Total Autonomy & 24/7 Starlink'),
      desc: t(
        '5 cabinas con 5 baños, climatización hidrónica, desalinizador de 140 l/h, instrumental Raymarine y conexión satelital continua.',
        '5 cabins with 5 en-suite heads, hydronic heating, 140 l/h watermaker, and continuous satellite link.'
      )
    }
  ];

  let overview: ExpeditionOverview;

  if (v.includes('lodge')) {
    overview = {
      headline: t('Estadía Boutique & Exploraciones en Robinson Crusoe', 'Boutique Stay & Explorations in Robinson Crusoe'),
      summary: t(
        `${exp.description} Tu experiencia combina el descanso en nuestro refugio frente al mar en Bahía Cumberland (Uberlindo Andaur 222) con salidas guiadas por expertos locales, contemplando atardeceres únicos en el océano y explorando la naturaleza prístina de la isla.`,
        `${exp.description} Your experience combines relaxation at our oceanfront refuge in Cumberland Bay (Uberlindo Andaur 222) with excursions guided by local experts, watching unique oceanic sunsets and discovering pristine island nature.`
      ),
      pillars: unifiedPillars,
      included: [
        t('Hospedaje boutique en cabina privada con baño en suite', 'Boutique lodging in private en-suite cabin'),
        t('Pensión completa con gastronomía local y cenas en quincho', 'Full board with local gastronomy and quincho dinners'),
        t('Excursiones guiadas por expertos locales en tierra y mar', 'Guided excursions by local experts on land and sea'),
        t('Embarcación auxiliar para traslados y navegaciones costeras', 'Tender vessel for transfers and coastal navigation'),
        t('Equipos de snorkel y bastones de senderismo', 'Snorkeling equipment and trekking poles')
      ],
      weatherPolicy: t('La programación diaria de excursiones, caminatas de altura y salidas marítimas se coordina en terreno según las condiciones de viento, mar y visibilidad, asegurando siempre el mayor bienestar, seguridad y confort durante tu estadía.', 'Daily schedule of hikes, summits, and sea tours is coordinated on-site according to wind, wave, and visibility conditions, always ensuring top comfort and safety.')
    };
  } else if (v.includes('velero') || v.includes('sailing') || exp.name.toLowerCase().includes('travesía')) {
    overview = {
      headline: t('Expedición a Vela & Navegación Oceánica Austral', 'Sailing Expedition & Austral Offshore Navigation'),
      summary: t(
        `${exp.description} Una experiencia náutica genuina a bordo del velero de expedición Vegvisir (Dufour 52.5 ft francés), donde vivirás la auténtica pasión del mar abierto, el trabajo en equipo de guardia y la llegada a caletas insulares remotas.`,
        `${exp.description} A genuine nautical experience aboard the Vegvisir expedition sailboat (French Dufour 52.5 ft), where you will experience open ocean passion, watch shifts, and landfalls at remote island coves.`
      ),
      pillars: unifiedPillars,
      included: [
        t('Pensión completa gourmet preparada por tripulación / chef', 'Full gourmet board prepared by crew / chef'),
        t('Instrucción náutica, bitácora y participación en maniobras', 'Nautical instruction, logbook logging, and maneuvers participation'),
        t('Bote auxiliar Zodiac con motor Mercury 15 HP para desembarcos', 'Zodiac tender with 15 HP Mercury engine for shore landings'),
        t('Conexión satelital Starlink 24/7 en alta mar', '24/7 Starlink satellite connection in open ocean'),
        t('Combustible, tasas de puerto, seguros y fondeo', 'Fuel, port fees, insurance, and anchorage dues')
      ],
      weatherPolicy: t('La derrota náutica, los tiempos de navegación a vela y los puntos de fondeo se ajustan de manera dinámica según la evolución meteorológica de los vientos y corrientes oceánicas, bajo el mando experto del Capitán para garantizar una travesía segura y placentera.', 'Nautical course, sailing hours, and anchoring spots are dynamically adjusted according to meteorological evolution under the Master Captain command to guarantee safety.')
    };
  } else {
    // Yate Terranova or default
    overview = {
      headline: t('Crucero de Alta Gama & Exploración de Gran Autonomía', 'Luxury Cruising & Extended Range Exploration'),
      summary: t(
        `${exp.description} A bordo del Yate Terranova (Hatteras 65ft LRC de 3 cubiertas), experimentarás una navegación rápida, potente y confortable, accediendo a los rincones más inaccesibles con la máxima sofisticación y servicio a bordo.`,
        `${exp.description} Aboard the Terranova Yacht (3-deck Hatteras 65ft LRC), experience fast, powerful, and comfortable cruising to remote corners with sophisticated service.`
      ),
      pillars: unifiedPillars,
      included: [
        t('Tripulación profesional completa y chef ejecutivo a bordo', 'Full professional crew and executive chef on board'),
        t('Todas las comidas gourmet, tablas y barra de autor', 'All gourmet meals, tasting boards, and open signature bar'),
        t('Uso de lancha auxiliar Zodiac con motor Yamaha 70 HP', 'Use of Zodiac tender with 70 HP Yamaha outboard'),
        t('Conexión satelital Starlink 24/7 e instrumental doble', '24/7 Starlink satellite connection and dual navigation electronics'),
        t('Seguro de navegación marítima y equipamiento de seguridad de alta mar', 'Maritime navigation insurance and offshore SOLAS safety gear')
      ],
      weatherPolicy: t('Las derrotas de navegación, bahías de fondeo y desembarcos se planifican con total flexibilidad atendiendo a las condiciones meteorológicas y marítimas de cada día, eligiendo siempre las zonas más protegidas y escénicas para tu máxima comodidad.', 'Cruising routes, anchorages, and landings are planned with flexibility according to daily weather, always selecting the most sheltered and scenic bays.')
    };
  }

  // Custom headline and summary enhancement
  if (exp.headline && exp.headline.trim()) {
    overview.headline = exp.headline;
  }
  if (exp.description && exp.description.trim()) {
    overview.summary = exp.description;
  }

  // Ensure pillars remain strictly the unified standard set for all expeditions
  overview.pillars = unifiedPillars;

  return overview;
};

export const ExpedicionesPage: React.FC<ExpedicionesPageProps> = ({ onNavigate: _onNavigate, currentPath }) => {
  const { expeditions, loading } = useExpeditions();
  const { t } = useLanguage();
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [bookingModalExpedition, setBookingModalExpedition] = useState<Expedition | null>(null);
  const [bookingModalInitialStep, setBookingModalInitialStep] = useState<0 | 1>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filter by Expedition Type
  const [selectedType, setSelectedType] = useState<string>('todos');

  useEffect(() => {
    const searchStr = typeof window !== 'undefined' ? window.location.search : '';
    const pathStr = currentPath || '';
    const query = new URLSearchParams(searchStr || (pathStr.includes('?') ? pathStr.split('?')[1] : ''));
    const tipo = query.get('tipo');
    if (tipo && tipo.trim() !== '') {
      setSelectedType(tipo);
      setTimeout(() => {
        const el = document.getElementById('grid-expediciones');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [currentPath]);

  const { getSection } = useSiteContent();
  const expHero = getSection('expeditions_hero');
  const heroBannersContent = getSection('home_hero_banners');

  const cmsCategories: ExpeditionCategory[] = useMemo(() => {
    const meta = (heroBannersContent?.metadata as Record<string, any>) || {};
    if (Array.isArray(meta.categories) && meta.categories.length > 0) {
      return meta.categories;
    }
    return DEFAULT_EXPEDITION_CATEGORIES;
  }, [heroBannersContent]);

  const filteredExpeditions = useMemo(() => {
    if (selectedType === 'todos') return expeditions;
    return expeditions.filter((exp) => {
      if (exp.routeId === selectedType) return true;
      if (selectedType === 'ruta-juan-fernandez') {
        return (
          exp.routeId === 'ruta-juan-fernandez' ||
          exp.name.toLowerCase().includes('robinson') ||
          exp.location.toLowerCase().includes('fernández') ||
          exp.location.toLowerCase().includes('fernandez')
        );
      }
      if (selectedType === 'ruta-cabo-hornos') {
        return (
          exp.routeId === 'ruta-cabo-hornos' ||
          exp.name.toLowerCase().includes('cabo de hornos') ||
          exp.location.toLowerCase().includes('hornos')
        );
      }
      if (selectedType === 'ruta-fiordos-glaciares') {
        return (
          exp.routeId === 'ruta-fiordos-glaciares' ||
          exp.routeId === 'ruta-selkirk' ||
          exp.name.toLowerCase().includes('fiordo') ||
          exp.location.toLowerCase().includes('glaciar')
        );
      }

      // Dynamic match for any newly created or edited category
      const matchedCat = cmsCategories.find((c) => c.id === selectedType);
      if (matchedCat) {
        const catNameLower = matchedCat.name.toLowerCase();
        const catTagLower = (matchedCat.tag || '').toLowerCase();
        const expNameLower = exp.name.toLowerCase();
        const expLocLower = exp.location.toLowerCase();
        return (
          exp.routeId === matchedCat.id ||
          (catNameLower && (expNameLower.includes(catNameLower) || expLocLower.includes(catNameLower))) ||
          (catTagLower && (expNameLower.includes(catTagLower) || expLocLower.includes(catTagLower)))
        );
      }
      return false;
    });
  }, [expeditions, selectedType, cmsCategories]);

  const overview = selectedExpedition ? getExpeditionOverview(selectedExpedition, t) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedExpedition) {
        setSelectedExpedition(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedExpedition]);

  const handleOpenGeneralBooking = () => {
    setBookingModalExpedition(null);
    setBookingModalInitialStep(0);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingModal = (exp: Expedition) => {
    setBookingModalExpedition(exp);
    setBookingModalInitialStep(1);
    setIsBookingModalOpen(true);
  };

  const handleDownloadExpeditionBrochure = (exp: Expedition) => {
    const rawUrl = (exp as any).brochureUrl || (exp as any).brochure_url;
    if (rawUrl) {
      const finalUrl = normalizeBrochureUrl(rawUrl);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } else {
      const confirmWhatsapp = window.confirm(
        t(
          `El dossier en PDF para "${exp.name}" se encuentra en preparación. ¿Deseas solicitarlo directamente a nuestro Concierge por WhatsApp?`,
          `The PDF brochure for "${exp.name}" is being prepared. Would you like to request it directly via WhatsApp Concierge?`
        )
      );
      if (confirmWhatsapp) {
        const msg = encodeURIComponent(`Hola Concierge Yates Chile, quisiera solicitar el brochure/dossier en PDF para la expedición "${exp.name}".`);
        window.open(`https://wa.me/56981312920?text=${msg}`, '_blank');
      }
    }
  };

  return (
    <div className="space-y-0 bg-white">
      
      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 relative overflow-hidden border-b border-slate-800 flex items-center justify-center min-h-[360px] sm:min-h-[400px]">
        <img
          src={expHero.media_url && !expHero.media_url.includes('images.unsplash.com') ? expHero.media_url : "/expediciones-hero.jpg"}
          alt={expHero.title || "Expediciones"}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/20" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-white/20 text-white text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-md">
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>{expHero.subtitle || t('Travesías de Altamar & Reservas de la Biosfera', 'Offshore Voyages & Biosphere Reserves')}</span>
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
            {expHero.title || t('Rutas & Expediciones Australes', 'Austral Routes & Expeditions')}
          </h1>
          
          <p className="max-w-xl mx-auto text-slate-200 text-xs sm:text-sm leading-relaxed font-light drop-shadow-sm opacity-90">
            {expHero.body_text || t('Expediciones científicas y de aventura guiadas por capitanes expertos en Juan Fernández, Alejandro Selkirk y los canales patagónicos.', 'Scientific and adventure expeditions guided by expert captains in Juan Fernández, Alejandro Selkirk, and Patagonian channels.')}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleOpenGeneralBooking}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-xl text-xs border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t('Reservar Expedición', 'Book Expedition')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Expeditions */}
      <section id="grid-expediciones" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
              {t('Salidas Programadas 2026/2027', 'Scheduled Departures 2026/2027')}
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              {t('Elige tu Travesía', 'Choose Your Expedition')}
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              {t('Haz clic en cualquier tarjeta para conocer la descripción general de la expedición y coordinar tu reserva con nuestro concierge.', 'Click on any card to view the expedition overview and coordinate your booking with our concierge.')}
            </p>
          </div>

          {/* Filter Pills por Tipo de Expedición (Una sola línea compacta) */}
          <div className="w-full overflow-x-auto no-scrollbar py-1 mb-8">
            <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max mx-auto px-4">
              {[
                { id: 'todos', label: t('Todas las Travesías', 'All Expeditions') },
                ...cmsCategories.map((c) => ({
                  id: c.id,
                  label: c.name,
                })),
              ].map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none shrink-0 ${
                      isActive
                        ? 'bg-[#0b192c] text-white shadow-xs font-semibold ring-1 ring-[#0b192c]'
                        : 'bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/90 shadow-2xs font-medium'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading && expeditions.length === 0 ? (
            <ExpeditionsLoadingState />
          ) : filteredExpeditions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto space-y-4 shadow-xs">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-slate-800">
                {t('No hay expediciones disponibles para este tipo de travesía', 'No expeditions available for this type')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('No encontramos salidas programadas con este filtro. Puedes ver el calendario completo o coordinar una salida privada a tu medida.', 'We did not find scheduled departures for this filter. You can view the full calendar or coordinate a custom private charter.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedType('todos')}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
                >
                  <span>{t('Ver Todas las Travesías', 'View All Expeditions')}</span>
                </button>
                <button
                  onClick={handleOpenGeneralBooking}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  {t('Contactar Concierge', 'Contact Concierge')}
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredExpeditions.map((exp) => {
                const isSoldOut = isExpeditionSoldOut(exp);
                const isBlocked = exp.spotsLeft === 'bloqueado';
                const isUnavailable = isSoldOut || isBlocked;
                const availableSpots = getExpeditionAvailableSpots(exp);

                return (
                  <div
                    key={exp.id}
                    onClick={() => setSelectedExpedition(exp)}
                    className={`rounded-2xl overflow-hidden border flex flex-col justify-between transition-all duration-300 cursor-pointer group ${
                      isUnavailable
                        ? 'bg-[#f8fafc] border-slate-200/80 shadow-2xs opacity-80 hover:opacity-100 hover:shadow-md'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300'
                    }`}
                  >
                    {/* Image & Vessel Tag */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={normalizeExternalMediaUrl(exp.image) || (exp.vessel.toLowerCase().includes('terranova') ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg')}
                        alt={exp.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                          isUnavailable ? 'grayscale-[55%] contrast-90 group-hover:grayscale-0 group-hover:contrast-100' : ''
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = exp.vessel.toLowerCase().includes('terranova') ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg';
                        }}
                      />
                      <div className={`absolute top-4 left-4 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-sm ${
                        isUnavailable ? 'bg-slate-800/80 border-white/10 text-slate-300' : 'bg-slate-900/90 border-white/10'
                      }`}>
                        {exp.vessel}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {isSoldOut && (
                          <span className="bg-slate-600/90 text-slate-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-500/30 backdrop-blur-sm shadow-xs font-mono">
                            {t('Completo', 'Sold Out')}
                          </span>
                        )}
                        {isBlocked && (
                          <span className="bg-slate-700/90 text-slate-300 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-600/30 backdrop-blur-sm">
                            {t('Bloqueado', 'Reserved')}
                          </span>
                        )}
                        {!isSoldOut && !isBlocked && availableSpots === 1 && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/20 animate-pulse shadow-sm">
                            {t('¡Último cupo!', 'Last spot!')}
                          </span>
                        )}
                        {!isSoldOut && !isBlocked && availableSpots > 1 && (
                          <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-xs">
                            {availableSpots} {t('cupos disponibles', 'spots available')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className={`flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                          isUnavailable ? 'text-slate-400' : 'text-blue-900'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exp.startDate} {t('al', 'to')} {exp.endDate}</span>
                        </div>

                        <h3 className={`font-serif text-lg font-bold leading-snug transition-colors ${
                          isUnavailable ? 'text-slate-500 group-hover:text-slate-800' : 'text-slate-900 group-hover:text-blue-950'
                        }`}>
                          {exp.name}
                        </h3>

                        <p className={`text-xs line-clamp-2 leading-relaxed font-light ${
                          isUnavailable ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {exp.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className={`flex items-center gap-1 text-xs ${
                          isUnavailable ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 ${isUnavailable ? 'text-slate-400' : 'text-blue-900'}`} />
                          <span className="truncate max-w-[140px]">{exp.location}</span>
                        </div>
                        
                        <span className={`font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 ${
                          isUnavailable ? 'text-slate-400 group-hover:text-slate-700' : 'text-blue-900'
                        }`}>
                          {t('Ver Descripción ➔', 'View Details ➔')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Large Expedition Overview Modal */}
      {selectedExpedition && overview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-[fadeIn_0.2s_ease-out] cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedExpedition(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-5xl w-full h-[94vh] md:h-[88vh] md:max-h-[840px] flex flex-col md:flex-row relative text-slate-800 animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden cursor-default"
          >
            {/* Mobile Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto sm:hidden mt-2 mb-1 absolute top-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedExpedition(null)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center z-40 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:scale-105"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Cover & Quick Stats */}
            <div className="relative w-full md:w-[38%] lg:w-[36%] text-white p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto no-scrollbar min-h-[220px] md:min-h-full shrink-0">
              <img
                src={normalizeExternalMediaUrl(selectedExpedition.image) || (selectedExpedition.vessel.toLowerCase().includes('terranova') ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg')}
                alt={selectedExpedition.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedExpedition.vessel.toLowerCase().includes('terranova') ? '/zarpe-archipielago.jpg' : '/travesia-robinson.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/45" />

              <div className="relative z-10 space-y-3 sm:space-y-3.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-350 font-mono block font-bold">
                  {t('Expedición Yates Chile', 'Yates Chile Expedition')}
                </span>
                <div className="space-y-1.5">
                  <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-[26px] text-white leading-snug">
                    {selectedExpedition.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-350 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{selectedExpedition.location}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 sm:pt-3 space-y-2 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>{t('Zarpe / Estadía:', 'Departure / Stay:')}</span>
                    <span className="font-bold text-white">{selectedExpedition.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Retorno:', 'Return:')}</span>
                    <span className="font-bold text-white">{selectedExpedition.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Embarcación / Base:', 'Vessel / Base:')}</span>
                    <span className="font-bold text-white truncate max-w-[140px] text-right">{selectedExpedition.vessel}</span>
                  </div>
                  {selectedExpedition.tempEstimate && (
                    <div className="flex justify-between">
                      <span>{t('Temp. Estimada:', 'Est. Temp:')}</span>
                      <span className="font-bold text-white">{selectedExpedition.tempEstimate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Left-Column CTAs */}
              <div className="relative z-10 pt-3.5 sm:pt-4 border-t border-white/10 space-y-2 hidden md:block mt-4">
                {isExpeditionSoldOut(selectedExpedition) ? (
                  <>
                    {/* Botón 1: Descargar Brochure en PDF */}
                    <button
                      type="button"
                      onClick={() => handleDownloadExpeditionBrochure(selectedExpedition)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-[1.02]"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-300" />
                      <span>{t('Descargar Brochure en PDF', 'Download PDF Brochure')}</span>
                    </button>
                    {/* Botón 2: Salida Completa / Lista de Espera */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(selectedExpedition)}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold py-3 rounded-xl transition text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span>{t('Salida Completa • Lista de Espera', 'Sold Out • Join Waitlist')}</span>
                    </button>
                  </>
                ) : selectedExpedition.spotsLeft === 'bloqueado' ? (
                  <button
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed border border-white/5"
                  >
                    {t('Bloqueado por Misión', 'Reserved for Mission')}
                  </button>
                ) : (
                  <>
                    {/* Botón 1: Descargar Brochure en PDF */}
                    <button
                      type="button"
                      onClick={() => handleDownloadExpeditionBrochure(selectedExpedition)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-[1.02]"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-300" />
                      <span>{t('Descargar Brochure en PDF', 'Download PDF Brochure')}</span>
                    </button>

                    {/* Botón 2: Reservar Cupo con Concierge */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(selectedExpedition)}
                      className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <span>{t('Reservar Cupo de Expedición', 'Book Expedition Spot')}</span>
                      <ArrowRight className="w-4 h-4 text-slate-900" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: General Expedition Overview */}
            <div className="w-full md:w-[64%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto h-full">
              <div className="space-y-6 text-left">
                
                {/* Header Title */}
                <div className="border-b border-slate-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-800 animate-pulse" />
                    <span>{t('Descripción General de la Expedición', 'Expedition Overview')}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                    {overview.headline}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light pt-1">
                    {overview.summary}
                  </p>
                </div>

                {/* Core Experience Pillars (2x2 Grid) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                    {t('Pilares & Experiencias de la Expedición', 'Expedition Pillars & Experiences')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {overview.pillars.map((pillar, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-150/70 space-y-2 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                            {pillar.icon}
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

                {/* Weather & Adaptive Dynamic Callout Alert */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-blue-950 uppercase tracking-wide">
                      {t('Itinerario Flexible & Navegación Adaptativa al Clima', 'Flexible Itinerary & Adaptive Weather Navigation')}
                    </h5>
                    <p className="text-slate-700 text-xs leading-relaxed font-light">
                      {overview.weatherPolicy}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Sticky Bottom CTA Bar */}
            <div className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadExpeditionBrochure(selectedExpedition)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold py-3 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="truncate">{t('Brochure PDF', 'PDF Brochure')}</span>
              </button>

              {isExpeditionSoldOut(selectedExpedition) ? (
                <button
                  type="button"
                  onClick={() => handleOpenBookingModal(selectedExpedition)}
                  className="flex-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold py-3 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="truncate">{t('Lista de Espera', 'Join Waitlist')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenBookingModal(selectedExpedition)}
                  disabled={selectedExpedition.spotsLeft === 'bloqueado'}
                  className={`flex-1 font-bold py-3 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition ${
                    selectedExpedition.spotsLeft === 'bloqueado'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white cursor-pointer'
                  }`}
                >
                  <span className="truncate">{t('Reservar Cupo', 'Book Spot')}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Expedition Booking Modal */}
      <ExpeditionBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        expedition={bookingModalExpedition}
        initialStep={bookingModalInitialStep}
      />

    </div>
  );
};
