import React, { useState } from 'react';
import { useExpeditions } from '../hooks/useExpeditions';
import type { PublicExpedition as Expedition } from '../services/expeditionService';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';
import { leadService } from '../services/leadService';
import { ExpeditionBookingModal } from '../components/modules/ExpeditionBookingModal';
import { 
  Compass, 
  Download, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  MapPin, 
  Sparkles, 
  Utensils, 
  Waves, 
  CloudSun, 
  ShieldCheck, 
  Anchor, 
  Footprints 
} from 'lucide-react';

interface ExpedicionesPageProps {
  onNavigate: (path: string) => void;
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

  if (v.includes('lodge')) {
    return {
      headline: t('Estadía Boutique & Exploraciones en Robinson Crusoe', 'Boutique Stay & Explorations in Robinson Crusoe'),
      summary: t(
        `${exp.description} Tu experiencia combina el descanso en nuestro refugio frente al mar en Bahía Cumberland (Uberlindo Andaur 222) con salidas guiadas por expertos locales, contemplando atardeceres únicos en el océano y explorando la naturaleza prístina de la isla.`,
        `${exp.description} Your experience combines relaxation at our oceanfront refuge in Cumberland Bay (Uberlindo Andaur 222) with excursions guided by local experts, watching unique oceanic sunsets and discovering pristine island nature.`
      ),
      pillars: [
        {
          icon: <Anchor className="w-5 h-5 text-blue-900" />,
          title: t('Refugio Náutico Frente al Mar', 'Oceanfront Nautical Refuge'),
          desc: t('Alojamiento en cabinas independientes con baño privado y vista panorámica al océano, terraza y amplio quincho para compartir.', 'Accommodation in private en-suite cabins with panoramic ocean views, terrace, and spacious gathering quincho.')
        },
        {
          icon: <Footprints className="w-5 h-5 text-blue-900" />,
          title: t('Senderismo & Ecosistemas Endémicos', 'Trekking & Endemic Ecosystems'),
          desc: t('Caminatas guiadas por bosques de helechos gigantes, senderos históricos hacia el Mirador Alexander Selkirk y avistamiento del picaflor rojo.', 'Guided hikes through giant fern forests, historical trails to Alexander Selkirk Lookout, and hummingbird watching.')
        },
        {
          icon: <Utensils className="w-5 h-5 text-blue-900" />,
          title: t('Gastronomía de Isla & Quincho', 'Island Gastronomy & Quincho'),
          desc: t('Degustación de langosta fresca de Juan Fernández cocida en agua de mar, pescados locales de roca (vidriola) y asados en el quincho.', 'Juan Fernández fresh lobster boiled in sea water, local yellowtail rockfish, and outdoor grilled feasts.')
        },
        {
          icon: <Waves className="w-5 h-5 text-blue-900" />,
          title: t('Santuarios Marinos & Snorkel', 'Marine Sanctuaries & Snorkeling'),
          desc: t('Navegaciones costeras hacia farellones y loberías protegidas con sesiones de snorkel junto a los amigables lobos marinos de dos pelos.', 'Coastal boat tours to sea lion colonies and protected reefs with snorkeling sessions alongside fur seals.')
        }
      ],
      included: [
        t('Hospedaje boutique en cabina privada con baño en suite', 'Boutique lodging in private en-suite cabin'),
        t('Pensión completa con gastronomía local y cenas en quincho', 'Full board with local gastronomy and quincho dinners'),
        t('Excursiones guiadas por expertos locales en tierra y mar', 'Guided excursions by local experts on land and sea'),
        t('Embarcación auxiliar para traslados y navegaciones costeras', 'Tender vessel for transfers and coastal navigation'),
        t('Equipos de snorkel y bastones de senderismo', 'Snorkeling equipment and trekking poles')
      ],
      weatherPolicy: t('La programación diaria de excursiones, caminatas de altura y salidas marítimas se coordina en terreno según las condiciones de viento, mar y visibilidad, asegurando siempre el mayor bienestar, seguridad y confort durante tu estadía.', 'Daily schedule of hikes, summits, and sea tours is coordinated on-site according to wind, wave, and visibility conditions, always ensuring top comfort and safety.')
    };
  }

  if (v.includes('velero') || v.includes('sailing') || exp.name.toLowerCase().includes('travesía')) {
    return {
      headline: t('Expedición a Vela & Navegación Oceánica Austral', 'Sailing Expedition & Austral Offshore Navigation'),
      summary: t(
        `${exp.description} Una experiencia náutica genuina a bordo del velero de expedición Vegvisir (Dufour 52.5 ft francés), donde vivirás la auténtica pasión del mar abierto, el trabajo en equipo de guardia y la llegada a caletas insulares remotas.`,
        `${exp.description} A genuine nautical experience aboard the Vegvisir expedition sailboat (French Dufour 52.5 ft), where you will experience open ocean passion, watch shifts, and landfalls at remote island coves.`
      ),
      pillars: [
        {
          icon: <Anchor className="w-5 h-5 text-blue-900" />,
          title: t('Velerismo Oceánico de Altura', 'Oceanic Offshore Sailing'),
          desc: t('Navegación a vela con patrón de ultramar, guardias astronómicas, trimado táctico de jarcia y cartas náuticas en mar abierto.', 'Offshore sailing with certified master, night watches, sail trimming, and nautical charting.')
        },
        {
          icon: <Utensils className="w-5 h-5 text-blue-900" />,
          title: t('Pesca de Altura (Trolling) & Menú a Bordo', 'Offshore Trolling & Gourmet Menu'),
          desc: t('Líneas de pesca en arrastre para vidriola y atún, con preparaciones de sashimi fresco y cocina gourmet caliente durante las guardias.', 'Trolling lines for yellowtail and tuna, fresh sashimi preparations, and hot gourmet meals.')
        },
        {
          icon: <Compass className="w-5 h-5 text-blue-900" />,
          title: t('Recaladas en Bahías Míticas', 'Landfalls at Mythic Coves'),
          desc: t('Fondeos protegidos en caletas históricas como Bahía Cumberland y Puerto Español, con desembarcos en bote Zodiac semirrígido.', 'Protected anchorages at Cumberland Bay and Puerto Español with Zodiac landings.')
        },
        {
          icon: <Waves className="w-5 h-5 text-blue-900" />,
          title: t('Autonomía Total & Starlink 24/7', 'Total Autonomy & 24/7 Starlink'),
          desc: t('5 cabinas con 5 baños, climatización hidrónica, desalinizador de 140 l/h, instrumental Raymarine y conexión satelital continua.', '5 cabins with 5 en-suite heads, hydronic heating, 140 l/h watermaker, and continuous satellite link.')
        }
      ],
      included: [
        t('Pensión completa gourmet preparada por tripulación / chef', 'Full gourmet board prepared by crew / chef'),
        t('Instrucción náutica, bitácora y participación en maniobras', 'Nautical instruction, logbook logging, and maneuvers participation'),
        t('Bote auxiliar Zodiac con motor Mercury 15 HP para desembarcos', 'Zodiac tender with 15 HP Mercury engine for shore landings'),
        t('Conexión satelital Starlink 24/7 en alta mar', '24/7 Starlink satellite connection in open ocean'),
        t('Combustible, tasas de puerto, seguros y fondeo', 'Fuel, port fees, insurance, and anchorage dues')
      ],
      weatherPolicy: t('La derrota náutica, los tiempos de navegación a vela y los puntos de fondeo se ajustan de manera dinámica según la evolución meteorológica de los vientos y corrientes oceánicas, bajo el mando experto del Capitán para garantizar una travesía segura y placentera.', 'Nautical course, sailing hours, and anchoring spots are dynamically adjusted according to meteorological evolution under the Master Captain command to guarantee safety.')
    };
  }

  // Yate Terranova or default
  return {
    headline: t('Crucero de Alta Gama & Exploración de Gran Autonomía', 'Luxury Cruising & Extended Range Exploration'),
    summary: t(
      `${exp.description} A bordo del Yate Terranova (Hatteras 65ft LRC de 3 cubiertas), experimentarás una navegación rápida, potente y confortable, accediendo a los rincones más inaccesibles con la máxima sofisticación y servicio a bordo.`,
      `${exp.description} Aboard the Terranova Yacht (3-deck Hatteras 65ft LRC), experience fast, powerful, and comfortable cruising to remote corners with sophisticated service.`
    ),
    pillars: [
      {
        icon: <Anchor className="w-5 h-5 text-blue-900" />,
        title: t('Navegación Rápida & 3 Cubiertas', 'Fast Cruising & 3 Decks'),
        desc: t('Estabilizadores hidráulicos que eliminan el balanceo, doble puente de mando, 5 cabinas en suite y amplias terrazas panorámicas.', 'Hydraulic roll stabilizers, twin helm bridges, 5 en-suite cabins, and expansive panoramic decks.')
      },
      {
        icon: <Utensils className="w-5 h-5 text-blue-900" />,
        title: t('Deck Superior & Gastronomía de Autor', 'Upper Deck & Signature Dining'),
        desc: t('Parrilla al aire libre en la cubierta superior, pescados y mariscos frescos, maridados con vinos selectos por nuestro chef ejecutivo.', 'Open-air top deck grill, fresh seafood paired with select fine wines by our executive chef.')
      },
      {
        icon: <Waves className="w-5 h-5 text-blue-900" />,
        title: t('Desembarcos Asistidos con Zodiac 70 HP', 'Assisted Landings with 70 HP Zodiac'),
        desc: t('Pluma/grúa de 1 ton y lancha semirrígida potente para internarse en fiordos, cuevas marinas y playas volcánicas inaccesibles.', '1-ton crane and powerful tender to explore remote fjords, sea caves, and volcanic beaches.')
      },
      {
        icon: <Compass className="w-5 h-5 text-blue-900" />,
        title: t('Pesca Deportiva de Altura & Fauna Pelágica', 'Sportfishing & Pelagic Wildlife'),
        desc: t('Equipamiento de trolling de alta gama y radares para avistamiento de cetáceos, lobos marinos y aves pelágicas.', 'Top-tier trolling gear and marine radar for spotting cetaceans, seals, and pelagic seabirds.')
      }
    ],
    included: [
      t('Tripulación profesional completa y chef ejecutivo a bordo', 'Full professional crew and executive chef on board'),
      t('Todas las comidas gourmet, tablas y barra de autor', 'All gourmet meals, tasting boards, and open signature bar'),
      t('Uso de lancha auxiliar Zodiac con motor Yamaha 70 HP', 'Use of Zodiac tender with 70 HP Yamaha outboard'),
      t('Conexión satelital Starlink 24/7 e instrumental doble', '24/7 Starlink satellite connection and dual navigation electronics'),
      t('Seguro de navegación marítima y equipamiento de seguridad de alta mar', 'Maritime navigation insurance and offshore SOLAS safety gear')
    ],
    weatherPolicy: t('Las derrotas de navegación, bahías de fondeo y desembarcos se planifican con total flexibilidad atendiendo a las condiciones meteorológicas y marítimas de cada día, eligiendo siempre las zonas más protegidas y escénicas para tu máxima comodidad.', 'Cruising routes, anchorages, and landings are planned with flexibility according to daily weather, always selecting the most sheltered and scenic bays.')
  };
};

export const ExpedicionesPage: React.FC<ExpedicionesPageProps> = ({ onNavigate: _onNavigate }) => {
  const { expeditions } = useExpeditions();
  const { t } = useLanguage();
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadSent, setDownloadSent] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [bookingModalExpedition, setBookingModalExpedition] = useState<Expedition | null>(null);
  const [bookingModalInitialStep, setBookingModalInitialStep] = useState<0 | 1>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { getSection } = useSiteContent();
  const expHero = getSection('expeditions_hero');

  const overview = selectedExpedition ? getExpeditionOverview(selectedExpedition, t) : null;

  const handleBrochureDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail) return;
    setDownloadSent(true);

    // Register lead in CRM
    leadService.createLead({
      fullName: downloadEmail.split('@')[0],
      email: downloadEmail,
      phone: '',
      origin: 'brochure',
      originDetails: 'Descarga Brochure Travesías 2026/2027',
      interestType: 'expediciones',
      notes: 'Solicitó descarga del Brochure PDF oficial desde la página de Expediciones.',
    }).catch(() => {});

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', 'YatesChile_Brochure_2026.pdf');
      document.body.appendChild(link);
    }, 500);
  };

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
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expeditions.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExpedition(exp)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                {/* Image & Vessel Tag */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    {exp.vessel}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {exp.spotsLeft === 'completo' && (
                      <span className="bg-red-500/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-400/20 backdrop-blur-sm">
                        {t('Completo', 'Sold Out')}
                      </span>
                    )}
                    {exp.spotsLeft === 'bloqueado' && (
                      <span className="bg-slate-700/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-500/20 backdrop-blur-sm">
                        {t('Bloqueado', 'Reserved')}
                      </span>
                    )}
                    {typeof exp.spotsLeft === 'number' && exp.spotsLeft === 1 && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/20 animate-pulse shadow-sm">
                        {t('¡Último cupo!', 'Last spot!')}
                      </span>
                    )}
                    {typeof exp.spotsLeft === 'number' && exp.spotsLeft > 1 && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {exp.spotsLeft} {t('cupos', 'spots')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-mono text-[10px] font-bold tracking-wider uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exp.startDate} {t('al', 'to')} {exp.endDate}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-950 transition-colors">
                      {exp.name}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-light">
                      {exp.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-blue-900" />
                      <span className="truncate max-w-[140px]">{exp.location}</span>
                    </div>
                    
                    <span className="text-blue-900 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {t('Ver Descripción ➔', 'View Details ➔')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Expedition Overview Modal */}
      {selectedExpedition && overview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] md:h-[84vh] flex flex-col md:flex-row relative text-slate-800 animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedExpedition(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center z-40 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:scale-105"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Cover & Quick Stats */}
            <div className="relative w-full md:w-[36%] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[220px] md:min-h-auto shrink-0">
              <img
                src={selectedExpedition.image}
                alt={selectedExpedition.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

              <div className="relative z-10 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-350 font-mono block font-bold">
                  {t('Expedición Yates Chile', 'Yates Chile Expedition')}
                </span>
                <div className="space-y-2">
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight">
                    {selectedExpedition.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-350 text-xs">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{selectedExpedition.location}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3.5 space-y-2.5 font-mono text-[11px] text-slate-300">
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

              <div className="relative z-10 pt-6 border-t border-white/10 space-y-2.5">
                {selectedExpedition.spotsLeft === 'completo' ? (
                  <button
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-white/5"
                  >
                    {t('Reserva Completada', 'Fully Booked')}
                  </button>
                ) : selectedExpedition.spotsLeft === 'bloqueado' ? (
                  <button
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-white/5"
                  >
                    {t('Bloqueado por Misión', 'Reserved for Mission')}
                  </button>
                ) : (
                  <>
                    {/* Botón 1: Descargar Brochure en PDF */}
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '#';
                        link.setAttribute('download', `Dossier_${selectedExpedition.name.replace(/\s+/g, '_')}_2026.pdf`);
                        document.body.appendChild(link);
                        setTimeout(() => {
                          alert(`Descargando Brochure Oficial en PDF de: ${selectedExpedition.name}`);
                        }, 200);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-[1.02]"
                    >
                      <Download className="w-4 h-4 text-blue-300" />
                      <span>{t('Descargar Brochure en PDF', 'Download PDF Brochure')}</span>
                    </button>

                    {/* Botón 2: Reservar Cupo con Concierge */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(selectedExpedition)}
                      className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 rounded-xl transition text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
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

                {/* Included Services Checklist */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                    {t('Servicios & Equipamiento Incluido', 'Included Services & Equipment')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {overview.included.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-light">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Instant PDF Brochure Download Banner */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-400/30">
            <Download className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-3xl font-bold text-white">
            {t('Descarga el Brochure Oficial de Expediciones 2026/2027', 'Download Official 2026/2027 Expeditions Brochure')}
          </h3>
          <p className="text-slate-350 text-sm max-w-xl mx-auto leading-relaxed">
            {t('Obtén en formato PDF el detalle completo de expediciones, especificaciones técnicas, gastronomía y equipamiento de seguridad de la flota.', 'Get complete expedition details, technical specifications, gastronomy, and safety fleet equipment in PDF format.')}
          </p>

          {!downloadSent ? (
            <form onSubmit={handleBrochureDownload} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder={t('Ingresa tu correo electrónico', 'Enter your email address')}
                value={downloadEmail}
                onChange={(e) => setDownloadEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
              />
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm min-h-[48px] shrink-0 cursor-pointer"
              >
                {t('Descargar Brochure PDF', 'Download PDF Brochure')}
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/20 text-emerald-300 p-4 rounded-xl border border-emerald-400/40 inline-flex items-center gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{t('Brochure despachado con éxito a tu correo. ¡Descarga iniciada!', 'Brochure dispatched successfully to your email. Download initiated!')}</span>
            </div>
          )}
        </div>
      </section>

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
