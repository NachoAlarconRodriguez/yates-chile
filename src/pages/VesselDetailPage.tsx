import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  Users,
  Anchor,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Droplets,
  FileText,
  Download,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Radio,
  Thermometer,
} from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useExpeditions } from '../hooks/useExpeditions';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';
import { findVesselByParam, getVesselSlug } from '../services/fleetService';
import { normalizeExternalMediaUrl, isMediaVideo, getMediaFallbackUrl } from '../services/cmsService';
import type { PublicExpedition } from '../services/expeditionService';

interface VesselDetailPageProps {
  vesselIdOrSlug: string;
  onNavigate: (path: string) => void;
}

export const VesselDetailPage: React.FC<VesselDetailPageProps> = ({ vesselIdOrSlug, onNavigate }) => {
  const { vessels, loading: fleetLoading } = useFleet();
  const { expeditions } = useExpeditions();
  const { getSection } = useSiteContent();
  const { language, t } = useLanguage();
  const isEn = language === 'EN';

  const vessel = useMemo(() => {
    return findVesselByParam(vessels, vesselIdOrSlug);
  }, [vessels, vesselIdOrSlug]);

  const vesselSlug = vessel ? getVesselSlug(vessel) : vesselIdOrSlug;
  const vesselCms = getSection(`flota_${vessel?.id}`) || getSection(`flota_${vesselSlug}`);

  // Dynamic titles & content reading from Visual CMS with graceful fallback
  const heroMediaUrl = vesselCms?.media_url || vessel?.mainImage || '/velero-vegvisir.jpg';
  const displayTitle = (isEn && (vesselCms as any)?.metadata?.title_en)
    ? (vesselCms as any).metadata.title_en
    : (vesselCms?.title || vessel?.name || 'Embarcación');
  const displayBody = (isEn && (vesselCms as any)?.metadata?.body_text_en)
    ? (vesselCms as any).metadata.body_text_en
    : (vesselCms?.body_text || vessel?.description || vessel?.tagline || '');

  // Curated photo gallery images
  const images = useMemo(() => {
    const vesselName = vessel?.name || 'Embarcación';
    return [
      {
        url: heroMediaUrl,
        title: `${vesselName} • Navegación en Altamar`,
        location: 'Aguas Chilenas • Pacífico Sur',
        desc: `${vesselName} navegando con velamen y motorización de altamar con total autonomía y confort.`,
      },
      {
        url: '/flota/vegvisir/vegvisir-juan-fernandez.jpg',
        title: 'Aproximación Insular & Fondeo',
        location: 'Archipiélago Juan Fernández • Bahía Cumberland',
        desc: 'Fondeo protegido en caletas insulares remotas para avistamiento de fauna y expedición terrestre.',
      },
      {
        url: '/flota/vegvisir/vegvisir-glaciar-patagonia.jpg',
        title: 'Fondeo Frente a Ventisqueros',
        location: 'Seno Ventisquero & Glaciares • Patagonia',
        desc: 'Aproximación en aguas calmas entre témpanos de hielo con el bote auxiliar Zodiac para exploración costera.',
      },
      {
        url: '/flota/vegvisir/vegvisir-cubierta-navegacion.jpg',
        title: 'Vida en Cubierta & Avistamiento',
        location: 'Canales Australes • Extremo Sur',
        desc: 'Huéspedes disfrutando de la perspectiva de proa y la navegación en altamar con equipamiento técnico en días de mar calmo.',
      },
      {
        url: '/flota/vegvisir/vegvisir-caleta-aerea.jpg?v=2',
        title: 'Fondeo Protegido en Caleta Natural',
        location: 'Caleta Secreta • Fiordos de la Patagonia',
        desc: 'Maniobra de amarre de 4 puntas a tierra en una bahía resguardada de vientos oceánicos, garantizando descanso y quietud absoluta.',
      },
      {
        url: vessel?.mainImage || '/velero-vegvisir.jpg',
        title: `${vesselName} • ${vessel?.builder || vessel?.type || 'Yates Chile'}`,
        location: 'Flota Yates Chile',
        desc: `${vessel?.description || 'Embarcación oceánica con casco reforzado y equipamiento de seguridad y confort para navegación de alta latitud.'}`,
      },
    ];
  }, [vessel, heroMediaUrl]);

  // Expeditions modal state
  const [showExpeditionsModal, setShowExpeditionsModal] = useState(false);

  // 3D Flip state for tech specs cards
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Date format for the Logbook
  const currentDateFormatted = useMemo(() => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()).toUpperCase();
  }, [isEn]);

  // Logbook feature selector state
  const [selectedFeature, setSelectedFeature] = useState<'climatizacion' | 'gastronomia' | 'casco' | 'desembarcos'>('climatizacion');

  // Photo viewer index state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Fullscreen Lightbox state
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const cardWidth = clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const imagesCount = images.length;

  // Keyboard navigation for Lightbox & Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showExpeditionsModal) {
          setShowExpeditionsModal(false);
        } else if (fullscreenIndex !== null) {
          setFullscreenIndex(null);
        }
      } else if (fullscreenIndex !== null && imagesCount > 0) {
        if (e.key === 'ArrowRight') {
          setFullscreenIndex((prev) => (prev !== null ? (prev + 1) % imagesCount : null));
        } else if (e.key === 'ArrowLeft') {
          setFullscreenIndex((prev) => (prev !== null ? (prev - 1 + imagesCount) % imagesCount : null));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, showExpeditionsModal, imagesCount]);

  // Associated expeditions for this vessel
  const vesselExpeditions = useMemo(() => {
    if (!vessel) return [];
    const vName = vessel.name.toLowerCase();
    const vId = vessel.id.toLowerCase();
    const vSlug = vesselSlug.toLowerCase();
    return expeditions.filter((exp: PublicExpedition) => {
      const expVessel = (exp.vessel || '').toLowerCase();
      const expName = (exp.name || '').toLowerCase();
      return (
        expVessel.includes(vName) ||
        expVessel.includes(vId) ||
        expVessel.includes(vSlug) ||
        (vName.includes('punta sur') && (expVessel.includes('punta') || expName.includes('punta')))
      );
    });
  }, [vessel, vesselSlug, expeditions]);

  if (fleetLoading && !vessel) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <Compass className="w-12 h-12 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-300 font-mono text-sm tracking-wider uppercase">
          {t('Cargando especificaciones navales...', 'Loading vessel specifications...')}
        </p>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Anchor className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-900">
          {t('Embarcación no encontrada', 'Vessel not found')}
        </h2>
        <p className="text-sm text-slate-600 max-w-md">
          {t('La embarcación solicitada no se encuentra disponible o ha sido pausada temporalmente.', 'The requested vessel is unavailable or currently inactive.')}
        </p>
        <button
          onClick={() => onNavigate('/flota')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Explorar Toda la Flota', 'Explore The Fleet')}</span>
        </button>
      </div>
    );
  }

  // Read logbook CMS if configured or provide dynamic content
  const vesselLogbookSec =
    getSection(`${vesselSlug}_logbook`) ||
    getSection(`${vesselSlug.replace(/^(velero|yate|catamaran|lancha)-/, '')}_logbook`) ||
    getSection(`flota_${vessel.id}_logbook`);
  const cmsEntries = (vesselLogbookSec?.metadata as any)?.entries || {};

  const logbookEntries = {
    climatizacion: {
      title: (isEn && cmsEntries.climatizacion?.nav_title_en) || cmsEntries.climatizacion?.nav_title || (isEn ? 'Climate Control & Thermal Comfort' : 'Climatización & Confort Térmico'),
      nav_description: (isEn && cmsEntries.climatizacion?.nav_description_en) || cmsEntries.climatizacion?.nav_description || (isEn ? 'High-capacity marine heating system individually controllable in every cabin, guaranteeing optimal thermal comfort in glacial waters.' : 'Sistema de calefacción marina controlable en cada camarote, garantizando noches de confort y abrigo térmico absoluto en aguas glaciales.'),
      day: cmsEntries.climatizacion?.day || 'Día 12 de Travesía',
      location: cmsEntries.climatizacion?.location || 'Canal Sarmiento',
      coordinates: cmsEntries.climatizacion?.coordinates || "51°52' S, 73°40' W",
      wind: cmsEntries.climatizacion?.wind || 'W 32 Nudos',
      temp: cmsEntries.climatizacion?.temp || '2°C Ext',
      text: (isEn && cmsEntries.climatizacion?.text_en) || cmsEntries.climatizacion?.text || (isEn ? `The Antarctic cold penetrates deep on deck, but ${vessel.name} embraces us inside. The heating keeps the salon at a steady 21°C as we watch the squall from the heated windows.` : `El frío antártico cala hondo en cubierta, pero el ${vessel.name} nos abraza en su interior. La climatización mantiene la cabina a unos constantes 21°C. Las tazas de café humean sobre la mesa mientras contemplamos la ventisca desde el ventanal templado.`),
      image: cmsEntries.climatizacion?.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    },
    gastronomia: {
      title: (isEn && cmsEntries.gastronomia?.nav_title_en) || cmsEntries.gastronomia?.nav_title || (isEn ? 'Oceanic Gastronomy' : 'Gastronomía'),
      nav_description: (isEn && cmsEntries.gastronomia?.nav_description_en) || cmsEntries.gastronomia?.nav_description || (isEn ? 'Catering throughout our voyages is tailored for life at sea: hearty, wholesome, nourishing meals adapted to oceanic sailing rhythms.' : 'La alimentación durante nuestras travesías está pensada para acompañar la vida a bordo: comidas caseras, nutritivas y adecuadas a una navegación oceánica. La alimentación es parte de la experiencia de navegar: simple, abundante y adaptada al ritmo del mar.'),
      day: cmsEntries.gastronomia?.day || 'Día 15 de Travesía',
      location: cmsEntries.gastronomia?.location || 'Seno Ventisquero',
      coordinates: cmsEntries.gastronomia?.coordinates || "54°30' S, 69°12' W",
      wind: cmsEntries.gastronomia?.wind || 'Calma',
      temp: cmsEntries.gastronomia?.temp || '4°C Ext',
      text: (isEn && cmsEntries.gastronomia?.text_en) || cmsEntries.gastronomia?.text || (isEn ? 'Catering throughout our voyages is tailored for life at sea: hearty, wholesome, nourishing meals adapted to oceanic sailing rhythms.' : 'La alimentación durante nuestras travesías está pensada para acompañar la vida a bordo: comidas caseras, nutritivas y adecuadas a una navegación oceánica. La alimentación es parte de la experiencia de navegar: simple, abundante y adaptada al ritmo del mar.'),
      image: cmsEntries.gastronomia?.image || '/flota/vegvisir/vegvisir-gastronomia.jpg',
    },
    casco: {
      title: (isEn && cmsEntries.casco?.nav_title_en) || cmsEntries.casco?.nav_title || (isEn ? 'Reinforced Heavy-Duty Hull' : 'Casco Reforzado'),
      nav_description: (isEn && cmsEntries.casco?.nav_description_en) || cmsEntries.casco?.nav_description || (isEn ? `Robust hull engineering prepared for oceanic routes and remote frontiers, from open Pacific crossings to extreme Patagonian fiord navigation.` : `Ingeniería de casco robusta y preparada para navegaciones oceánicas y zonas remotas, desde las aguas abiertas del Pacífico hacia el Archipiélago Juan Fernández y Robinson Crusoe, hasta la geografía extrema de los fiordos, canales e islas del extremo sur de Chile.`),
      day: cmsEntries.casco?.day || 'Día 18 de Travesía',
      location: cmsEntries.casco?.location || 'Paso del Indio',
      coordinates: cmsEntries.casco?.coordinates || "49°02' S, 74°24' W",
      wind: cmsEntries.casco?.wind || 'NW 45 Nudos',
      temp: cmsEntries.casco?.temp || '1°C Ext',
      text: (isEn && cmsEntries.casco?.text_en) || cmsEntries.casco?.text || (isEn ? `Sailing among drifting ice floes under an austral storm. The solidity of ${vessel.name}’s reinforced hull inspires total confidence.` : `Navegando entre pequeños témpanos de hielo a la deriva bajo una tormenta austral. La solidez del casco reforzado del ${vessel.name} infunde total confianza cuando el hielo roza suavemente la estructura. La embarcación corta el mar embravecido con firmeza impecable.`),
      image: cmsEntries.casco?.image || heroMediaUrl,
    },
    desembarcos: {
      title: (isEn && cmsEntries.desembarcos?.nav_title_en) || cmsEntries.desembarcos?.nav_title || (isEn ? 'Safe Coastal Landings' : 'Desembarcos Seguros'),
      nav_description: (isEn && cmsEntries.desembarcos?.nav_description_en) || cmsEntries.desembarcos?.nav_description || (isEn ? 'Equipped with high-buoyancy auxiliary tender for safe landings and close approaches in remote bays without port infrastructure.' : 'Equipado con bote auxiliar semirrígido de alta flotabilidad, que permite realizar desembarcos y aproximaciones en sectores donde no existen muelles o infraestructura portuaria, facilitando el acceso desde la embarcación a playas, caletas y otros puntos de interés.'),
      day: cmsEntries.desembarcos?.day || 'Día 20 de Travesía',
      location: cmsEntries.desembarcos?.location || 'Bahía Ainsworth',
      coordinates: cmsEntries.desembarcos?.coordinates || "54°22' S, 69°38' W",
      wind: cmsEntries.desembarcos?.wind || 'SW 15 Nudos',
      temp: cmsEntries.desembarcos?.temp || '5°C Ext',
      text: (isEn && cmsEntries.desembarcos?.text_en) || cmsEntries.desembarcos?.text || (isEn ? 'We ready the high-buoyancy rigid-inflatable auxiliary tender. Approaching the glacial front and landing on moraine beaches proceeds smoothly.' : 'Alistamos el bote auxiliar semirrígido de alta flotabilidad. La aproximación al frente glaciar y el desembarco en la playa de morrena para caminar hacia los bosques subantárticos transcurren sin contratiempos. Una maniobra segura en un paraje de belleza salvaje.'),
      image: cmsEntries.desembarcos?.image || '/flota/vegvisir/vegvisir-desembarcos.jpg',
    },
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* ======================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ======================================================================= */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-end justify-start overflow-hidden">
        {isMediaVideo(heroMediaUrl) ? (
          <video
            src={normalizeExternalMediaUrl(heroMediaUrl)}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={normalizeExternalMediaUrl(heroMediaUrl)}
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getMediaFallbackUrl(heroMediaUrl) || '/velero-vegvisir.jpg';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

        {/* Navigation Overlays */}
        <div className="absolute top-6 left-6 sm:left-10 z-20">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition shadow-lg text-xs cursor-pointer min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>{t('Volver a Inicio', 'Back to Home')}</span>
          </button>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-3.5">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
            {displayTitle}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl opacity-90 drop-shadow-sm">
            {displayBody}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowExpeditionsModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-xl text-xs sm:text-sm border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t(`Reservar Expediciones en ${vessel.name}`, `Book Expeditions on ${vessel.name}`)}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE EXPEDICIONES DE LA EMBARCACIÓN */}
      {showExpeditionsModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowExpeditionsModal(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative text-slate-800 overflow-hidden border border-slate-200 cursor-default"
          >
            {/* Header */}
            <div className="bg-[#0f2b48] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white pr-4">
                {t(`Expediciones Programadas en ${vessel.name}`, `Scheduled Expeditions on ${vessel.name}`)}
              </h3>
              <button
                onClick={() => setShowExpeditionsModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Expeditions List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
              {vesselExpeditions.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600 font-medium">
                    {t(`No hay expediciones abiertas en este momento para ${vessel.name}. Consulta por programas privados a medida.`, `No open public expeditions right now for ${vessel.name}. Enquire for custom private charters.`)}
                  </p>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Hola Concierge Yates Chile, deseo cotizar una travesía privada a medida en ${vessel.name}.`);
                      window.open(`https://wa.me/56981312920?text=${text}`, '_blank');
                    }}
                    className="inline-flex items-center gap-2 bg-[#0f2b48] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#0a1e34] transition"
                  >
                    <span>{t('Cotizar Travesía Privada', 'Enquire Private Charter')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                vesselExpeditions.map((exp: PublicExpedition) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={exp.image}
                        alt={exp.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = heroMediaUrl;
                        }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md">
                            {exp.startDate} {t('al', 'to')} {exp.endDate}
                          </span>
                          {(exp.spotsLeft === 'completo' || exp.spotsLeft === 0 || (typeof exp.availableSlots === 'number' && exp.availableSlots <= 0)) ? (
                            <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase">
                              {t('Completo', 'Sold Out')}
                            </span>
                          ) : typeof exp.spotsLeft === 'number' && exp.spotsLeft > 0 ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {exp.spotsLeft} {t('cupos disponibles', 'spots available')}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#0f2b48]">{exp.name}</h4>
                        <p className="text-xs text-slate-500 font-light line-clamp-2 max-w-md">
                          {exp.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Descargando Brochure Oficial en PDF de: ${exp.name}`);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('Brochure PDF', 'PDF Brochure')}</span>
                      </button>

                      {(exp.spotsLeft === 'completo' || exp.spotsLeft === 0 || (typeof exp.availableSlots === 'number' && exp.availableSlots <= 0)) ? (
                        <button
                          disabled
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed border border-slate-200 uppercase tracking-wider"
                        >
                          <span>{t('Agotado', 'Sold Out')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const text = encodeURIComponent(
                              `Hola Yates Chile, deseo reservar cupo para la expedición en ${vessel.name}:\n\n` +
                              `• Travesía: ${exp.name}\n` +
                              `• Fechas: ${exp.startDate} al ${exp.endDate}\n` +
                              `• Embarcación: ${vessel.name}\n\n` +
                              `Solicito disponibilidad y valores para confirmar mi reserva.`
                            );
                            window.open(`https://wa.me/56981312920?text=${text}`, '_blank');
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#0f2b48] hover:bg-[#0a1e34] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer hover:scale-[1.02]"
                        >
                          <span>{t('Reservar Cupo', 'Book Spot')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. TECH SPECS GRID (3D FLIPS ON DESKTOP & ACCORDION ON MOBILE) */}
      {/* ======================================================================= */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Mobile Tech Specs Cards (md:hidden) */}
          <div className="md:hidden flex flex-col gap-3 max-w-xl mx-auto">
            {/* Mobile Card 1: Eslora & Astillero */}
            <div
              onClick={() => toggleFlip('eslora')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-900">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{t('NORTE / ASTILLERO', 'NORTH / SHIPYARD')}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{vessel.length || 'Eslora Oceánica'} • {vessel.builder || vessel.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{vessel.registration || 'DIRECTEMAR'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 text-xs font-semibold shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${flipped['eslora'] ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
                </div>
              </div>
              {flipped['eslora'] && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  <span className="text-blue-900 text-[10px] font-bold uppercase tracking-wider block mb-1">{t('Identificación & Travesía', 'Identification & Journey')}</span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {t('Arquitectura naval y diseño robusto para navegar las aguas del Pacífico Sur, canales e islas australes con máxima seguridad.', 'Naval architecture and robust engineering to sail the waters of the South Pacific, channels and austral islands with maximum safety.')}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Card 2: Capacidad */}
            <div
              onClick={() => toggleFlip('capacidad')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-900">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{t('OESTE / CAPACIDAD', 'WEST / CAPACITY')}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{vessel.capacity || `${vessel.maxPax || 10} PAX`}</h4>
                    <span className="text-[11px] text-slate-500">{vessel.cabins || 'Cabinas privadas'} • {vessel.bathrooms || 'Baños en suite'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 text-xs font-semibold shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${flipped['capacidad'] ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
                </div>
              </div>
              {flipped['capacidad'] && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  <span className="text-blue-900 text-[10px] font-bold uppercase tracking-wider block mb-1">{t('Habitabilidad & Confort', 'Habitability & Comfort')}</span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {t(`Alojamiento de alto nivel con ${vessel.cabins || 'cabinas privadas'} y ${vessel.bathrooms || 'baños en suite'}, amplio salón y cocina completamente equipada.`, `High-end accommodation with ${vessel.cabins || 'private cabins'} and ${vessel.bathrooms || 'en-suite bathrooms'}, spacious salon and fully equipped galley.`)}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Card 3: Navegación */}
            <div
              onClick={() => toggleFlip('tripulacion')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-900">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{t('SUR / NAVEGACIÓN', 'SOUTH / NAVIGATION')}</span>
                    <h4 className="font-bold text-slate-900 text-sm">Starlink 24/7 • Electrónica Marina</h4>
                    <span className="text-[11px] text-slate-500">{t('Instrumental oceánico de precisión', 'Precision oceanic electronics')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 text-xs font-semibold shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${flipped['tripulacion'] ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
                </div>
              </div>
              {flipped['tripulacion'] && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  <span className="text-blue-900 text-[10px] font-bold uppercase tracking-wider block mb-2">{t('Electrónica & Satélite', 'Electronics & Satellite')}</span>
                  <ul className="text-slate-600 text-xs leading-relaxed space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>{t('Conexión satelital Starlink 24/7 de alta velocidad', '24/7 High-speed Starlink Satellite Internet')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>Plotter náutico y piloto automático de precisión</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>Comunicaciones VHF marino, GPS y cartografía satelital</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Card 4: Autonomía & Desembarco */}
            <div
              onClick={() => toggleFlip('navegacion')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-900">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{t('ESTE / AUTONOMÍA', 'EAST / AUTONOMY')}</span>
                    <h4 className="font-bold text-slate-900 text-sm">140 Ltrs/hr • Bote Zodiac</h4>
                    <span className="text-[11px] text-slate-500">Agua dulce y desembarco auxiliar</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 text-xs font-semibold shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${flipped['navegacion'] ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
                </div>
              </div>
              {flipped['navegacion'] && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  <span className="text-blue-900 text-[10px] font-bold uppercase tracking-wider block mb-2">{t('Autonomía & Equipamiento', 'Autonomy & Equipment')}</span>
                  <ul className="text-slate-600 text-xs leading-relaxed space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>{t('Planta Desalinizadora de agua dulce continua (140 L/hr)', 'Continuous freshwater watermaker system (140 L/hr)')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>Bote Zodiac semirrígido con motor auxiliar de 4 tiempos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                      <span>Estanques de combustible y agua para autonomía prolongada</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Tech Specs Cards (Single Row 3D Flip) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Card 1: NORTH - ESLORA & ASTILLERO */}
            <div
              onClick={() => toggleFlip('eslora')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['eslora'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-blue-900/40 hover:shadow-blue-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Maximize2 className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Compass className="w-9 h-9 text-blue-900/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('NORTE / ASTILLERO', 'NORTH / SHIPYARD')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">{vessel.length || 'Eslora Oceánica'}</span>
                    <span className="text-slate-500 text-[10px] block">{vessel.builder || vessel.name} • {vessel.registration || 'DIRECTEMAR'}</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">{t('Click para detalle', 'Click for details')}</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">{t('Identificación', 'Identification')}</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[190px] mx-auto">
                    {t(`Diseñado para navegar las aguas del Pacífico Sur, fiordos y canales australes con total serenidad y confort.`, `Designed to sail the waters of the South Pacific, austral channels and fjords with absolute serenity and comfort.`)}
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 2: WEST - CAPACIDAD & CABINAS */}
            <div
              onClick={() => toggleFlip('capacidad')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['capacidad'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-blue-900/40 hover:shadow-blue-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Users className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Compass className="w-9 h-9 text-blue-900/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('OESTE / CAPACIDAD', 'WEST / CAPACITY')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">{vessel.capacity || `${vessel.maxPax || 10} PAX`}</span>
                    <span className="text-slate-500 text-[10px] block">{vessel.cabins || 'Cabinas privadas'} • {vessel.bathrooms || 'Baños en suite'}</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">{t('Click para detalle', 'Click for details')}</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">{t('Habitabilidad', 'Habitability')}</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    {t(`Alojamiento distribuido en ${vessel.cabins || 'cabinas privadas'} con ${vessel.bathrooms || 'baños en suite'}, amplio salón central y cocina para navegación oceánica prolongada.`, `Accommodation laid out across ${vessel.cabins || 'private cabins'} with ${vessel.bathrooms || 'en-suite bathrooms'}, spacious central salon and galley for extended voyages.`)}
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 3: SOUTH - NAVEGACIÓN & SATELITAL */}
            <div
              onClick={() => toggleFlip('tripulacion')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['tripulacion'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-blue-900/40 hover:shadow-blue-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Radio className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Compass className="w-9 h-9 text-blue-900/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('SUR / NAVEGACIÓN', 'SOUTH / NAVIGATION')}</span>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 block mt-0.5 leading-tight max-w-[160px] mx-auto">
                      {t('Sistema de Navegación de Última Generación', 'Next-Generation Navigation System')}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">Starlink 24/7</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">{t('Click para detalle', 'Click for details')}</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-4 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-between text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div>
                    <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider block">{t('Electrónica', 'Electronics')}</span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mt-0.5">RAYMARINE / GARMIN</span>
                  </div>

                  <ul className="text-slate-600 text-[9.5px] leading-snug space-y-1 text-left px-1 max-w-[190px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>Plotter náutico y radar marino</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>{t('Piloto Automático Integrado', 'Integrated Autopilot')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>{t('Conexión satelital Starlink 24/7 de alta velocidad', '24/7 High-speed Starlink Satellite Internet')}</span>
                    </li>
                  </ul>

                  <span className="text-[8px] text-blue-900/60 font-mono uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 4: EAST - AUTONOMÍA & DESEMBARCO */}
            <div
              onClick={() => toggleFlip('navegacion')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['navegacion'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-blue-900/40 hover:shadow-blue-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Droplets className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Compass className="w-9 h-9 text-blue-900/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('ESTE / AUTONOMÍA', 'EAST / AUTONOMY')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">140 Ltrs/hr</span>
                    <span className="text-slate-500 text-[10px] block">Zodiac Semirrígido</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">{t('Click para detalle', 'Click for details')}</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-between text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div>
                    <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider block">{t('Autonomía & Desembarco', 'Autonomy & Landings')}</span>
                  </div>

                  <ul className="text-slate-700 text-[8px] sm:text-[8.5px] leading-tight space-y-0.5 sm:space-y-1 text-left px-0.5 w-full max-w-[205px]">
                    <li className="flex items-start gap-1">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Desalinizador:', 'Watermaker:')}</strong> 140 Ltrs/hr agua dulce</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Auxiliar:', 'Tender:')}</strong> Bote Zodiac semirrígido</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Propulsión:', 'Propulsion:')}</strong> Motor marino de gran autonomía</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>Sistema de calefacción marina en cabinas</span>
                    </li>
                  </ul>

                  <span className="text-[7.5px] text-blue-900/60 font-mono uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. FICHA TÉCNICA OFICIAL / TECHNICAL SPECIFICATIONS MATRIX */}
      {/* ======================================================================= */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-900/15 inline-flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-900" />
              <span>{t(`Ficha Técnica Oficial • Matrícula ${vessel.registration || 'DIRECTEMAR'}`, `Official Technical Sheet • Registration ${vessel.registration || 'DIRECTEMAR'}`)}</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {t(`Especificaciones Técnicas de ${vessel.name}`, `Technical Specifications of ${vessel.name}`)}
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              {t(`${vessel.name} (${vessel.builder || vessel.type}) equipado con ingeniería oceánica de alta latitud y máxima autonomía.`, `${vessel.name} (${vessel.builder || vessel.type}) equipped with high-latitude oceanic engineering and maximum autonomy.`)}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Embarcación & Registro */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Embarcación & Registro', 'Vessel & Registration')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Identificación y dimensiones', 'Identification & dimensions')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Astillero / Modelo:', 'Shipyard / Model:')}</span>
                  <span className="font-bold text-slate-900">{vessel.builder || vessel.name}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Eslora:', 'Length:')}</span>
                  <span className="font-bold text-slate-900">{vessel.length || '53 ft'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Matrícula:', 'Registration:')}</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{vessel.registration || 'QUI 2718'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Tipo:', 'Type:')}</span>
                  <span className="font-bold text-slate-900">{vessel.type}</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Capacidad & Habitabilidad */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Habitabilidad & Confort', 'Habitability & Comfort')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Alojamiento y distribución', 'Accommodation & layout')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Capacidad Total:', 'Total Capacity:')}</span>
                  <span className="font-bold text-slate-900">{vessel.capacity || `${vessel.maxPax || 10} PAX`}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Cabinas:', 'Cabins:')}</span>
                  <span className="font-bold text-slate-900">{vessel.cabins || '4 Cabinas privadas'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Baños:', 'Bathrooms:')}</span>
                  <span className="font-bold text-slate-900">{vessel.bathrooms || '4 Baños completos'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Tripulación:', 'Crew:')}</span>
                  <span className="font-bold text-slate-900">{vessel.crew || 'Patrón + Tripulación'}</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Navegación & Telecomunicaciones */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Electrónica & Satelital', 'Electronics & Satellite')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Instrumental de alta precisión', 'High-precision instrumentation')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Internet Satelital:', 'Satellite Internet:')}</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Starlink 24/7
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Plotter Náutico:', 'Chartplotter:')}</span>
                  <span className="font-bold text-slate-900">Raymarine / Garmin</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Piloto Automático:', 'Autopilot:')}</span>
                  <span className="font-bold text-slate-900">Raymarine Integrado</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Comunicaciones:', 'Comms:')}</span>
                  <span className="font-bold text-slate-900">VHF Marino + AIS</span>
                </li>
              </ul>
            </div>

            {/* Box 4: Autonomía & Desembarcos */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Autonomía & Desembarco', 'Autonomy & Landings')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Equipamiento expedicionario', 'Expedition equipment')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Desalinizador:', 'Watermaker:')}</span>
                  <span className="font-bold text-blue-900">140 ltrs/hr</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Bote Auxiliar:', 'Auxiliary Tender:')}</span>
                  <span className="font-bold text-slate-900">Zodiac Semirrígido</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Motor Auxiliar:', 'Outboard Engine:')}</span>
                  <span className="font-bold text-slate-900">Mercury 4T / 15 HP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Climatización:', 'Climate Control:')}</span>
                  <span className="font-bold text-slate-900">Calefacción Marina</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 4. CUADERNO DE BITÁCORA Y CARACTERÍSTICAS (LOGBOOK INTERACTIVO) */}
      {/* ======================================================================= */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-900/10">
              {t('Ingeniería & Vida a Bordo', 'Engineering & Life on Board')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mt-3">
              {t('Cuaderno de Bitácora y Características', "Captain's Logbook & Features")}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {t(`Explora las vivencias de navegación austral y los detalles técnicos que hacen de ${vessel.name} una embarcación de travesía insuperable.`, `Explore austral sailing chronicles and technical engineering that make ${vessel.name} an unmatched expedition vessel.`)}
            </p>
          </div>

          {/* Mobile Fast-Switch Feature Pills (< lg) */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar mb-4">
            {[
              { id: 'climatizacion' as const, label: t('Climatización', 'Climate Control'), icon: Thermometer },
              { id: 'gastronomia' as const, label: t('Gastronomía', 'Gastronomy'), icon: Sparkles },
              { id: 'casco' as const, label: t('Casco Reforzado', 'Reinforced Hull'), icon: Anchor },
              { id: 'desembarcos' as const, label: t('Desembarcos', 'Landings'), icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedFeature === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFeature(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-blue-900 border-blue-800 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Captain's Logbook (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <Compass className="w-48 h-48 text-slate-50 absolute -right-16 -bottom-16 pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  {/* Logbook Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Yacht Logbook
                    </span>
                    <span className="font-mono text-[10px] uppercase font-black tracking-widest text-blue-900 animate-pulse">
                      • {currentDateFormatted}
                    </span>
                  </div>

                  {/* Navigation Metadata Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">{t('Ubicación', 'Location')}</span>
                      <span className="text-[11px] font-sans font-extrabold text-slate-800">{logbookEntries[selectedFeature].location}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">{t('Coordenadas', 'Coordinates')}</span>
                      <span className="text-[11px] font-mono font-bold text-blue-900">{logbookEntries[selectedFeature].coordinates}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">{t('Viento', 'Wind')}</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700">{logbookEntries[selectedFeature].wind}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">{t('Clima', 'Weather')}</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700">{logbookEntries[selectedFeature].temp}</span>
                    </div>
                  </div>

                  {/* Captain's Narrative entry */}
                  <div className="space-y-2">
                    <span className="font-serif italic text-[11px] font-semibold text-blue-900/60 block">{t('Relato del Capitán:', "Captain's Narrative:")}</span>
                    <p className="font-serif italic text-slate-600 text-sm leading-relaxed border-l-2 border-blue-900/10 pl-3">
                      "{logbookEntries[selectedFeature].text}"
                    </p>
                  </div>
                </div>

                {/* Logbook visual snapshot */}
                <div className="mt-8 relative h-48 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                  <img
                    src={normalizeExternalMediaUrl(logbookEntries[selectedFeature].image)}
                    alt={logbookEntries[selectedFeature].title}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/90 bg-slate-900/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 uppercase">
                    {t('Snapshot Travesía', 'Voyage Snapshot')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Feature selector cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              {/* Feature 1: Climatizacion */}
              <div
                onClick={() => setSelectedFeature('climatizacion')}
                onMouseEnter={() => setSelectedFeature('climatizacion')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'climatizacion'
                    ? 'border-blue-900 bg-blue-50/20 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'climatizacion' ? 'bg-blue-900 border-blue-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Thermometer className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.climatizacion.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.climatizacion.nav_description}
                  </p>
                </div>
              </div>

              {/* Feature 2: Gastronomia */}
              <div
                onClick={() => setSelectedFeature('gastronomia')}
                onMouseEnter={() => setSelectedFeature('gastronomia')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'gastronomia'
                    ? 'border-blue-900 bg-blue-50/20 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'gastronomia' ? 'bg-blue-900 border-blue-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.gastronomia.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.gastronomia.nav_description}
                  </p>
                </div>
              </div>

              {/* Feature 3: Casco Reforzado */}
              <div
                onClick={() => setSelectedFeature('casco')}
                onMouseEnter={() => setSelectedFeature('casco')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'casco'
                    ? 'border-blue-900 bg-blue-50/20 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'casco' ? 'bg-blue-900 border-blue-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Anchor className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.casco.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.casco.nav_description}
                  </p>
                </div>
              </div>

              {/* Feature 4: Desembarcos Seguros */}
              <div
                onClick={() => setSelectedFeature('desembarcos')}
                onMouseEnter={() => setSelectedFeature('desembarcos')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'desembarcos'
                    ? 'border-blue-900 bg-blue-50/20 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'desembarcos' ? 'bg-blue-900 border-blue-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.desembarcos.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.desembarcos.nav_description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 5. MOMENTOS Y VISTAS (GALERÍA FOTOGRÁFICA INTERACTIVA HUD) */}
      {/* ======================================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-900/20 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-950 animate-[spin_30s_linear_infinite]" />
              <span>{t('Galería Fotográfica de Navegación', 'Navigation Photo Gallery')}</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {t(`Momentos y Vistas de ${vessel.name}`, `Moments & Views of ${vessel.name}`)}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('Fotografías reales a vela abierta, fondeos frente a glaciares patagónicos y caletas protegidas en el Archipiélago Juan Fernández y el Extremo Sur.', 'Authentic sailing photography under open sails, glacial anchorages and protected coves in Juan Fernández and the Deep South.')}
            </p>
          </div>

          {/* Main Photo Gallery Container (550px HUD Slider) */}
          <div className="relative w-full max-w-5xl mx-auto h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 flex flex-col justify-between group">
            {/* The Active Photo Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={images[currentPhotoIndex].url}
                alt={images[currentPhotoIndex].title}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40 pointer-events-none" />
            </div>

            {/* Top Bar HUD */}
            <div className="relative z-20 w-full p-5 sm:p-6 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-white/95 font-mono text-[10px] sm:text-xs tracking-wider uppercase flex items-center gap-2 select-none shadow-md">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>{vessel.name} • Foto 0{currentPhotoIndex + 1} {t('de', 'of')} 0{images.length}</span>
              </div>
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-sky-300 font-mono text-[10px] sm:text-xs tracking-wider select-none shadow-md hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{images[currentPhotoIndex].location || t('Navegación Austral', 'Austral Sailing')}</span>
              </div>
            </div>

            {/* Left & Right Slider Controls */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 pointer-events-none z-20">
              <button
                type="button"
                onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 pointer-events-auto hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 pointer-events-auto hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Caption Strip & Thumbnail Dots */}
            <div className="relative z-20 w-full p-5 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="space-y-1 max-w-xl text-left">
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest block font-bold">
                  {images[currentPhotoIndex].location}
                </span>
                <h4 className="font-serif font-bold text-lg sm:text-2xl text-white">
                  {images[currentPhotoIndex].title}
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                  {images[currentPhotoIndex].desc}
                </p>
              </div>

              {/* Dots Selector */}
              <div className="flex items-center gap-2 self-center sm:self-end bg-slate-900/70 border border-slate-800/80 backdrop-blur-md p-2 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentPhotoIndex === idx
                        ? 'w-7 bg-white shadow-xs'
                        : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Ver foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 6. ESPACIOS Y MOMENTOS A BORDO (GALERÍA HORIZONTAL + LIGHTBOX) */}
      {/* ======================================================================= */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-900/10">
              {t('Galería Fotográfica Exclusiva', 'Exclusive Photo Gallery')}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {t('Espacios y Momentos a Bordo', 'Spaces and Moments on Board')}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              {t('Deslice horizontalmente para recorrer las vistas exclusivas. Haga clic en cualquier imagen para abrir el visualizador interactivo en pantalla completa.', 'Slide horizontally to browse the exclusive views. Click any image to open the interactive full-screen viewer.')}
            </p>
          </div>

          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Carousel Container */}
          <div className="relative group/carousel px-4">
            <button
              onClick={() => scrollGallery('left')}
              className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>

            <button
              onClick={() => scrollGallery('right')}
              className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6 text-slate-700" />
            </button>

            {/* Horizontal scroll track */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setFullscreenIndex(idx)}
                  className="min-w-[100%] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start group relative rounded-2xl overflow-hidden shadow-md border border-slate-200 cursor-pointer aspect-[4/3] flex flex-col justify-end text-white transition-all duration-300 hover:shadow-lg"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />

                  <div className="relative z-10 p-5 space-y-2 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                      Foto 0{idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between">
                      <span>{img.title}</span>
                      <Maximize2 className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors duration-300 shrink-0" />
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm flex flex-col justify-between p-4 sm:p-10 text-white select-none overflow-y-auto lg:overflow-y-hidden cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFullscreenIndex(null);
          }}
        >
          {/* Ambient blurred backdrop image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src={images[fullscreenIndex].url}
              alt="ambient-backdrop"
              className="w-full h-full object-cover filter blur-[40px] scale-110 opacity-70"
            />
            <div className="absolute inset-0 bg-slate-950/45" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full w-full min-h-[600px] lg:min-h-0">
            {/* Top Bar HUD */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5 text-left">
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block">
                  {vessel.name} Gallery
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                  {images[fullscreenIndex].title}
                </h4>
              </div>
              <button
                onClick={() => setFullscreenIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
                aria-label="Cerrar pantalla completa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Content Grid */}
            <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center my-6 max-h-[65vh]">
              {/* Left Column: Image & Navigation (8 cols) */}
              <div className="lg:col-span-8 h-full flex items-center justify-between gap-4 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
                  }}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all duration-200 cursor-pointer focus:outline-none shrink-0 z-20"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div
                  className="flex-1 flex items-center justify-center h-full max-h-[50vh] lg:max-h-[55vh] overflow-hidden p-2"
                  onClick={() => setFullscreenIndex(null)}
                >
                  <img
                    src={images[fullscreenIndex].url}
                    alt={images[fullscreenIndex].title}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10 animate-[zoomIn_0.3s_ease-out]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
                  }}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all duration-200 cursor-pointer focus:outline-none shrink-0 z-20"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Right Column: Narrative Detail Panel (4 cols) */}
              <div className="lg:col-span-4 flex flex-col justify-center text-left h-full">
                <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest block font-bold">
                      Especificación de Espacio
                    </span>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                      {images[fullscreenIndex].title}
                    </h4>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                    {images[fullscreenIndex].desc}
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Categoría: Travesía Premium</span>
                    <span className="text-blue-400 font-bold uppercase tracking-wider">{vessel.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Thumbnails HUD */}
            <div className="space-y-4">
              <div className="text-center font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                Foto {fullscreenIndex + 1} de {images.length}
              </div>

              <div className="flex justify-center items-center gap-2 sm:gap-3 overflow-x-auto max-w-lg mx-auto py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFullscreenIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 shrink-0 cursor-pointer ${
                      fullscreenIndex === idx ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20' : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 7. ¿LISTO PARA NAVEGAR? (RESERVATION CTA) */}
      {/* ======================================================================= */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/5 -top-64 left-1/2 -translate-x-1/2 blur-[120px]" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 text-white">
          <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            {t(`¿Listo para Vivir la Experiencia en ${vessel.name}?`, `Ready to Experience Sailing on ${vessel.name}?`)}
          </h3>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto">
            {t('Revisa las próximas fechas disponibles de nuestros programas de navegación o solicita una expedición privada a medida.', 'Check upcoming available dates for our sailing expeditions or enquire for a custom private charter.')}
          </p>
          <div className="pt-4">
            <button
              onClick={() => setShowExpeditionsModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition shadow-xl text-sm min-h-[48px] cursor-pointer hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t('Revisar Próximas Fechas de Programas', 'Check Upcoming Program Dates')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
