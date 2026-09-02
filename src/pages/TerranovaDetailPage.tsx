import React from 'react';
import { ArrowLeft, Compass, Sparkles, Anchor, Maximize2, ChevronLeft, ChevronRight, X, Ship, Radio, FileText, Layers, Gauge, Download, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useExpeditions } from '../hooks/useExpeditions';
import { useLanguage } from '../context/LanguageContext';

interface TerranovaDetailPageProps {
  onNavigate: (path: string) => void;
}

export const TerranovaDetailPage: React.FC<TerranovaDetailPageProps> = ({ onNavigate }) => {
  const { expeditions } = useExpeditions();
  const { getSection } = useSiteContent();
  const { language, t } = useLanguage();
  const isEn = language === 'EN';
  const terranovaCms = getSection('flota_terranova');

  const [showExpeditionsModal, setShowExpeditionsModal] = React.useState(false);
  const [flipped, setFlipped] = React.useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentDateFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()).toUpperCase();
  }, [isEn]);

  const [fullscreenIndex, setFullscreenIndex] = React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const cardWidth = clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (fullscreenIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setFullscreenIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
      } else if (e.key === 'ArrowLeft') {
        setFullscreenIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
      } else if (e.key === 'Escape') {
        setFullscreenIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex]);

  const [selectedFeature, setSelectedFeature] = React.useState<'climatizacion' | 'gastronomia' | 'casco' | 'desembarcos'>('climatizacion');

  const terranovaLogbookSec = getSection('terranova_logbook');
  const cmsEntries = (terranovaLogbookSec?.metadata as any)?.entries || {};

  const logbookEntries = {
    climatizacion: {
      title: (isEn && cmsEntries.climatizacion?.nav_title_en) || cmsEntries.climatizacion?.nav_title || (isEn ? 'Upper Deck & Flybridge' : 'Deck Superior & Flybridge'),
      nav_description: (isEn && cmsEntries.climatizacion?.nav_description_en) || cmsEntries.climatizacion?.nav_description || (isEn ? 'Outdoor BBQ grill and spacious flybridge with secondary helm station, providing a 360° panoramic lounge over the fjords.' : 'Parrilla exterior y amplitud en el flybridge con segundo puesto de gobierno, ofreciendo el espacio perfecto para compartir con vista panorámica de 360°.'),
      day: cmsEntries.climatizacion?.day || 'Día 10 de Travesía',
      location: cmsEntries.climatizacion?.location || 'Glaciar Garibaldi',
      coordinates: cmsEntries.climatizacion?.coordinates || '54°07\' S, 69°57\' W',
      wind: cmsEntries.climatizacion?.wind || 'W 25 Nudos',
      temp: cmsEntries.climatizacion?.temp || '3°C Ext',
      text: (isEn && cmsEntries.climatizacion?.text_en) || cmsEntries.climatizacion?.text || (isEn ? 'Anchored in the shelter of Garibaldi glacier, we take in 360° views from Deck 3. The outdoor grill and flybridge offer the perfect gathering setting.' : 'Fondeados frente al resguardo del glaciar Garibaldi, disfrutamos de la vista en 360° desde la Cubierta 3. La parrilla exterior y la amplitud del flybridge con su segundo puente de gobierno ofrecen el espacio perfecto para compartir al atardecer en los fiordos.'),
      image: cmsEntries.climatizacion?.image || '/flota/terranova/terranova-cubiertas.jpg',
    },
    gastronomia: {
      title: (isEn && cmsEntries.gastronomia?.nav_title_en) || cmsEntries.gastronomia?.nav_title || (isEn ? 'Main Saloon & Dining' : 'Salón Central & Gastronomía'),
      nav_description: (isEn && cmsEntries.gastronomia?.nav_description_en) || cmsEntries.gastronomia?.nav_description || (isEn ? 'Fully-equipped galley and expansive dining salon on Deck 2 to enjoy fresh king crab and daily catch against panoramic windows.' : 'Cocina full equipo y amplio comedor en la Cubierta 2 para disfrutar de centolla y pesca fresca del día frente a ventanales panorámicos.'),
      day: cmsEntries.gastronomia?.day || 'Día 14 de Travesía',
      location: cmsEntries.gastronomia?.location || 'Seno Eyre',
      coordinates: cmsEntries.gastronomia?.coordinates || '48°58\' S, 74°20\' W',
      wind: cmsEntries.gastronomia?.wind || 'Calma',
      temp: cmsEntries.gastronomia?.temp || '5°C Ext',
      text: (isEn && cmsEntries.gastronomia?.text_en) || cmsEntries.gastronomia?.text || (isEn ? 'In Deck 2 dining lounge against Pío XI glacier, the chef prepares fresh king crab and select wines in warmth and comfort.' : 'En el amplio comedor de la Cubierta 2, rodeados de ventanales panorámicos frente al glaciar Pío XI, la cocina full equipo permite preparar centolla fresca austral y pesca del día maridadas con vinos selectos en un ambiente de total calidez y confort.'),
      image: cmsEntries.gastronomia?.image || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
    },
    casco: {
      title: (isEn && cmsEntries.casco?.nav_title_en) || cmsEntries.casco?.nav_title || (isEn ? '3,000 NM Range & Detroit Diesels' : 'Autonomía 3.000 MN & Motores Detroit'),
      nav_description: (isEn && cmsEntries.casco?.nav_description_en) || cmsEntries.casco?.nav_description || (isEn ? 'Twin 450 HP Detroit diesel engines and 10,000L fuel capacity for non-stop navigation through the remote southern Chilean channels.' : 'Doble motorización Detroit de 450 HP c/u y estanque diésel de 10.000 L para navegar sin escalas los canales y fiordos más remotos de la Patagonia.'),
      day: cmsEntries.casco?.day || 'Día 17 de Travesía',
      location: cmsEntries.casco?.location || 'Golfo de Penas',
      coordinates: cmsEntries.casco?.coordinates || '47°15\' S, 74°50\' W',
      wind: cmsEntries.casco?.wind || 'SW 38 Nudos',
      temp: cmsEntries.casco?.temp || '6°C Ext',
      text: (isEn && cmsEntries.casco?.text_en) || cmsEntries.casco?.text || (isEn ? 'Cruising at 10 knots propelled by twin 450 HP Detroit engines. The 10,000L fuel tank grants 3,000 NM range to explore remote fiords uninterrupted.' : 'Navegando a velocidad crucero de 10 nudos con el empuje firme de los 2 motores Detroit de 450 HP. Su estanque de 10.000 Litros de combustible brinda 3.000 millas náuticas de autonomía para explorar los canales y fiordos más remotos del extremo sur sin escalas.'),
      image: cmsEntries.casco?.image || '/zarpe-archipielago.jpg',
    },
    desembarcos: {
      title: (isEn && cmsEntries.desembarcos?.nav_title_en) || cmsEntries.desembarcos?.nav_title || (isEn ? 'Zodiac Yamaha 70 HP & 1T Crane' : 'Zodiac Yamaha 70 HP & Grúa 1T'),
      nav_description: (isEn && cmsEntries.desembarcos?.nav_description_en) || cmsEntries.desembarcos?.nav_description || (isEn ? '5-meter rigid inflatable Zodiac with 70 HP Yamaha outboard and 1-ton davit crane for agile and secure coastal landings.' : 'Zodiac semirrígido de 5 metros con motor Yamaha 70 HP (4 tiempos) y grúa de 1 tonelada para desembarcos rápidos y seguros en cualquier costa.'),
      day: cmsEntries.desembarcos?.day || 'Día 19 de Travesía',
      location: cmsEntries.desembarcos?.location || 'Fiordo Peel',
      coordinates: cmsEntries.desembarcos?.coordinates || '50°55\' S, 74°05\' W',
      wind: cmsEntries.desembarcos?.wind || 'Calma',
      temp: cmsEntries.desembarcos?.temp || '4°C Ext',
      text: (isEn && cmsEntries.desembarcos?.text_en) || cmsEntries.desembarcos?.text || (isEn ? 'Operating Deck 3 1-ton davit to launch the 70 HP Zodiac tender. Exceptional maneuverability allows direct landings in untouched wilderness.' : 'Operamos la grúa de 1 tonelada de la Cubierta 3 para arriar el bote Zodiac semirrígido con motor Yamaha 70 HP. La potencia y maniobrabilidad nos permiten realizar aproximaciones directas y desembarcos seguros en playas y ventisqueros de difícil acceso.'),
      image: cmsEntries.desembarcos?.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState<number>(0);

  const images = [
    {
      url: '/flota/terranova/terranova-cubierta-proa.jpg',
      title: 'Proa y Flybridge del Yate Terranova',
      location: 'Cubierta 2 & 3 • Hatteras 65ft LRC',
      desc: 'Vista de proa y flybridge exterior con segundo puesto de gobierno, molinete de fondeo y amplios accesos a cubierta.',
    },
    {
      url: '/flota/terranova/terranova-camarote-master.jpg',
      title: 'Camarote Suite Principal',
      location: 'Cubierta 1 • Habitabilidad 20 PAX',
      desc: 'Suite con cama doble y litera superior, revestimientos en madera noble, iluminación cálida y baño privado en suite.',
    },
    {
      url: '/flota/terranova/terranova-camarote-twin.jpg',
      title: 'Camarote Twin con Camas Gemelas',
      location: 'Cubierta 1 • 5 Cabinas Privadas',
      desc: 'Cabina twin con dos camas individuales bajas, mesita de noche central, acabados en caoba y confort térmico para expediciones.',
    },
    {
      url: '/flota/terranova/terranova-camarote-triple.jpg',
      title: 'Camarote Triple con Escotilla Cenital',
      location: 'Cubierta 1 • Espacios Optimizados',
      desc: 'Distribución de literas múltiples para familias o expedicionarios, con escotilla superior para luz natural y cajoneras de madera.',
    },
    {
      url: '/flota/terranova/terranova-camarote-litera.jpg',
      title: 'Camarote con Literas y Baño en Suite',
      location: 'Cubierta 1 • Descanso de Alta Mar',
      desc: 'Cabina privada con literas confortables, lámpara de lectura, espejo amplio y almacenamiento para largas travesías australes.',
    },
    {
      url: '/yate-terranova.jpg',
      title: 'Yate Terranova • Hatteras 65ft LRC Americano',
      location: 'Flota Yates Chile • Matrícula PMO 6128',
      desc: 'Embarcación de expedición oceánica de 3 cubiertas, 2 motores Detroit de 450 HP y 3.000 MN de autonomía.',
    },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-end justify-start overflow-hidden">
        {(terranovaCms.media_url?.endsWith('.mp4') || terranovaCms.media_url?.endsWith('.webm') || terranovaCms.media_url?.includes('video/')) ? (
          <video
            src={terranovaCms.media_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={terranovaCms.media_url || "/yate-terranova.jpg"}
            alt={terranovaCms.title || "Yate Terranova"}
            className="absolute inset-0 w-full h-full object-cover"
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
            {terranovaCms.title ? terranovaCms.title.replace(/\s*\([^)]*\)/g, '').trim() : t('Yate Terranova', 'Terranova Yacht')}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl opacity-90 drop-shadow-sm">
            {terranovaCms.body_text || t('Yate oceánico 65ft de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.', '65ft oceanic expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge, and a 5m rigid inflatable Zodiac with Yamaha 70 HP outboard for coastal landings.')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowExpeditionsModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-xl text-xs sm:text-sm border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Ship className="w-4 h-4 text-slate-950" />
              <span>{t('Reservar Expediciones en Yate Terranova', 'Book Expeditions on Terranova Yacht')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE EXPEDICIONES DEL YATE TERRANOVA */}
      {showExpeditionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative text-slate-800 overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#0f2b48] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white pr-4">
                {t('Expediciones Programadas en Yate Terranova', 'Scheduled Expeditions on Terranova Yacht')}
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
              {expeditions.filter((e) =>
                e.vessel.toLowerCase().includes('terranova') ||
                e.vessel.toLowerCase().includes('yate') ||
                e.name.toLowerCase().includes('cabo de hornos') ||
                e.name.toLowerCase().includes('fiordos')
              ).map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={exp.image}
                      alt={exp.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          {exp.startDate} {t('al', 'to')} {exp.endDate}
                        </span>
                        {typeof exp.spotsLeft === 'number' && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {exp.spotsLeft} {t('cupos disponibles', 'spots available')}
                          </span>
                        )}
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
                        const link = document.createElement('a');
                        link.href = '#';
                        link.setAttribute('download', `Dossier_${exp.name.replace(/\s+/g, '_')}_2026.pdf`);
                        document.body.appendChild(link);
                        setTimeout(() => {
                          alert(`Descargando Brochure Oficial en PDF de: ${exp.name}`);
                        }, 200);
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('Brochure PDF', 'PDF Brochure')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = encodeURIComponent(
                          `Hola Yates Chile, deseo reservar cupo para la expedición en Yate Terranova:\n\n` +
                          `• Travesía: ${exp.name}\n` +
                          `• Fechas: ${exp.startDate} al ${exp.endDate}\n` +
                          `• Embarcación: Yate Terranova\n\n` +
                          `Solicito disponibilidad y valores para confirmar mi reserva.`
                        );
                        window.open(`https://wa.me/56981312920?text=${text}`, '_blank');
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#0f2b48] hover:bg-[#0a1e34] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer hover:scale-[1.02]"
                    >
                      <span>{t('Reservar Cupo', 'Book Spot')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TECH SPECS GRID (3D FLIPS ON CLICK) */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Tech Specs Cards in a Single Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: NORTH - ASTILLERO & MODELO */}
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
                    <Ship className="w-9 h-9 text-blue-900/10 absolute animate-[pulse_3s_infinite]" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('NORTE / ASTILLERO', 'NORTH / SHIPYARD')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Hatteras 65ft LRC</span>
                    <span className="text-slate-500 text-[10px] block">{t('Americano • PMO 6128', 'American • PMO 6128')}</span>
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
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    {t('Astillero Americano Hatteras 65ft LRC (Long Range Cruiser). Matrícula oficial PMO 6128. Eslora 20 metros.', 'American Shipyard Hatteras 65ft LRC (Long Range Cruiser). Official Registration PMO 6128. Length 20 meters.')}
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 2: WEST - 3 CUBIERTAS & 20 PAX */}
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
                    <Layers className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Ship className="w-9 h-9 text-blue-900/10 absolute animate-[pulse_3s_infinite]" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('OESTE / CUBIERTAS', 'WEST / DECKS')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">{t('3 Cubiertas', '3 Decks')}</span>
                    <span className="text-slate-500 text-[10px] block">{t('20 PAX • 4 Cab / 4 Baños', '20 GUESTS • 4 Cab / 4 Baths')}</span>
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
                    <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider block">{t('Distribución', 'Layout')}</span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block mt-0.5">{t('3 CUBIERTAS', '3 DECKS')}</span>
                  </div>

                  <ul className="text-slate-700 text-[9px] sm:text-[9.5px] leading-snug space-y-1.5 text-left px-1 w-full max-w-[195px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Cubierta 1:', 'Deck 1:')}</strong> {t('4 cabinas con 4 baños', '4 cabins with 4 en-suite bathrooms')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Cubierta 2:', 'Deck 2:')}</strong> {t('Puente, salón, comedor y cocina', 'Bridge, salon, dining & galley')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Cubierta 3:', 'Deck 3:')}</strong> {t('Zodiac de desembarco & Flybridge', 'Landing Zodiac & Flybridge')}</span>
                    </li>
                  </ul>

                  <span className="text-[8px] text-blue-900/60 font-mono uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 3: SOUTH - MOTORES & AUTONOMÍA */}
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
                    <Gauge className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Ship className="w-9 h-9 text-blue-900/10 absolute animate-[pulse_3s_infinite]" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('SUR / PROPULSIÓN', 'SOUTH / PROPULSION')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">{t('2 Motores Detroit', '2 Detroit Engines')}</span>
                    <span className="text-slate-500 text-[10px] block">{t('450 HP c/u • 10.000L Diésel', '450 HP each • 10,000L Diesel')}</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">{t('Click para detalle', 'Click for details')}</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2.5 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">{t('Propulsión', 'Propulsion')}</span>
                  <p className="text-slate-600 text-[10.5px] leading-relaxed max-w-[190px] mx-auto">
                    {t('Dos motores Detroit de 450 HP c/u y estanque de 10.000 Litros con 3.000 millas náuticas de autonomía continua a 10 nudos.', 'Twin 450 HP Detroit diesel engines and 10,000-liter fuel tank delivering 3,000 nautical miles of continuous range at 10 knots.')}
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>

            {/* Card 4: EAST - NAVEGACIÓN & DESEMBARCO */}
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
                    <Radio className="w-4.5 h-4.5 text-blue-900 relative z-10" />
                    <Ship className="w-9 h-9 text-blue-900/10 absolute animate-[pulse_3s_infinite]" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">{t('ESTE / EQUIPAMIENTO', 'EAST / EQUIPMENT')}</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Raymarine + Garmin</span>
                    <span className="text-slate-500 text-[10px] block">{t('Starlink 24/7 • Cocina Full', 'Starlink 24/7 • Full Galley')}</span>
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
                    <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider block">{t('Equipamiento & Confort', 'Equipment & Comfort')}</span>
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block mt-0.5">RAYMARINE + GARMIN</span>
                  </div>

                  <ul className="text-slate-700 text-[8px] sm:text-[8.5px] leading-tight space-y-1 text-left px-1 w-full max-w-[200px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Navegación:', 'Navigation:')}</strong> {t('Plotter, Piloto Automático & Starlink 24/7', 'Chartplotter, Autopilot & Starlink 24/7')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Habitabilidad:', 'Habitability:')}</strong> {t('4 Cabinas con 4 Baños', '4 Cabins with 4 Bathrooms')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span><strong>{t('Cocina Full Equipada:', 'Fully Equipped Galley:')}</strong> {t('Horno eléctrico, encimera, 3 refris y 1 congelador', 'Electric oven, cooktop, 3 fridges and 1 freezer')}</span>
                    </li>
                  </ul>

                  <span className="text-[8px] text-blue-900/60 font-mono uppercase">{t('Volver ➔', 'Back ➔')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FICHA TÉCNICA OFICIAL / TECHNICAL SPECIFICATIONS MATRIX */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-900/15 inline-flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-900" />
              <span>{t('Ficha Técnica Oficial • Matrícula PMO 6128', 'Official Technical Sheet • Registration PMO 6128')}</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {t('Especificaciones Técnicas del Yate Terranova', 'Technical Specifications of Terranova Yacht')}
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              {t('Yate de expedición oceánica de astillero americano Hatteras 65ft LRC de 3 cubiertas y equipamiento de alta gama.', '65ft Hatteras LRC 3-deck American ocean expedition yacht with top-tier equipment.')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Embarcación & Registro */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Embarcación & Registro', 'Vessel & Registration')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Identificación y dimensiones', 'Identification & dimensions')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Astillero / Modelo:', 'Shipyard / Model:')}</span>
                  <span className="font-bold text-slate-900">Hatteras 65ft LRC</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Origen:', 'Origin:')}</span>
                  <span className="font-bold text-slate-900">{t('Americano', 'American')}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Matrícula:', 'Registration:')}</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">PMO 6128</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Tipo:', 'Type:')}</span>
                  <span className="font-bold text-slate-900">{t('Yate de Expedición', 'Expedition Yacht')}</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Distribución en 3 Cubiertas */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Distribución 3 Cubiertas', '3 Decks Layout')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('4 Cabinas / 4 Baños • Cocina Full', '4 Cabins / 4 Baths • Full Galley')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Cubierta 1:', 'Deck 1:')}</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">{t('4 Cabinas / 4 Baños', '4 Cabins / 4 Baths')}</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Cubierta 2:', 'Deck 2:')}</span>
                  <span className="font-bold text-slate-900 text-right">{t('Puente, Salón & Popa', 'Bridge, Salon & Aft')}</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Cubierta 3:', 'Deck 3:')}</span>
                  <span className="font-bold text-slate-900 text-right">{t('Zodiac, Parrilla & Grúa', 'Zodiac, Grill & Crane')}</span>
                </li>
                <li className="flex justify-between items-start pt-1 border-t border-slate-100 gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Cocina:', 'Galley:')}</span>
                  <span className="font-bold text-blue-900 text-right text-[11px] sm:text-xs leading-snug">{t('Horno, Congelador y 3 Refrigeradores', 'Oven, Freezer and 3 Fridges')}</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Propulsión & Generación */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Propulsión & Generación', 'Propulsion & Power')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Potencia oceánica', 'Oceanic power')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Motores:', 'Engines:')}</span>
                  <span className="font-bold text-slate-900 text-right">{t('2x Detroit 450 HP c/u', '2x Detroit 450 HP each')}</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Estanque Diésel:', 'Fuel Tank:')}</span>
                  <span className="font-bold text-slate-900 text-right">{t('10.000 Litros', '10,000 Liters')}</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Generadores:', 'Generators:')}</span>
                  <span className="font-bold text-slate-900 text-right">2x Northern Lights 10kVA</span>
                </li>
              </ul>
            </div>

            {/* Box 4: Electrónica & Desembarcos */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">{t('Navegación & Desembarco', 'Navigation & Landings')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('Equipamiento expedicionario', 'Expedition equipment')}</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Internet Satelital:', 'Satellite Internet:')}</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Starlink 24/7
                  </span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Electrónica Dual:', 'Dual Electronics:')}</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Raymarine + Garmin</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Desalinizadores:', 'Watermakers:')}</span>
                  <span className="font-bold text-blue-900 text-right whitespace-nowrap">2x 140 ltrs/hr</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Zodiac Auxiliar:', 'Auxiliary Zodiac:')}</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">{t('Yamaha 70hp + Grúa', 'Yamaha 70hp + Crane')}</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">{t('Kayaks:', 'Kayaks:')}</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">{t('2 (1 Doble + 1 Single)', '2 (1 Double + 1 Single)')}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CHARACTERISTICS & AMENITIES (CAPTAIN'S LOGBOOK INTERACTIVE DASHBOARD) */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-900/10">
              {t('Ingeniería & Vida a Bordo', 'Engineering & Life on Board')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mt-3">
              {t('Cuaderno de Bitácora y Características', 'Captain\'s Logbook & Features')}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {t('Explora las vivencias de navegación rápida y los detalles técnicos que hacen del Terranova un yate a motor de travesía insuperable.', 'Explore rapid cruising chronicles and technical details that make Terranova an unmatched expedition motor yacht.')}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Captain's Logbook (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Background watermark */}
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
                    <span className="font-serif italic text-[11px] font-semibold text-blue-900/60 block">{t('Relato del Capitán:', 'Captain\'s Narrative:')}</span>
                    <p className="font-serif italic text-slate-600 text-sm leading-relaxed border-l-2 border-blue-900/10 pl-3">
                      "{logbookEntries[selectedFeature].text}"
                    </p>
                  </div>
                </div>

                {/* Logbook visual snapshot */}
                <div className="mt-8 relative h-48 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                  <img
                    src={logbookEntries[selectedFeature].image}
                    alt={logbookEntries[selectedFeature].title}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  />
                  {/* Subtle vignette shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/90 bg-slate-900/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 uppercase">
                    {t('Snapshot Travesía', 'Voyage Snapshot')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Feature selector cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              
              {/* Feature 1: Deck Superior & Quincho */}
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
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.climatizacion.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.climatizacion.nav_description}
                  </p>
                </div>
              </div>

              {/* Feature 2: Salón Central & Gastronomía */}
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

              {/* Feature 3: Propulsión Detroit & Autonomía */}
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
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">{logbookEntries.casco.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {logbookEntries.casco.nav_description}
                  </p>
                </div>
              </div>

              {/* Feature 4: Zodiac Yamaha 70 HP & Grúa 1T */}
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
                  <Anchor className="w-5 h-5" />
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

      {/* PHOTO GALLERY VIEWER IN PLACE OF TOUR */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-900/20 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <Ship className="w-3.5 h-3.5 text-blue-950 animate-[pulse_3s_infinite]" />
              <span>{t('Galería Fotográfica del Yate Terranova', 'Terranova Yacht Photo Gallery')}</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {t('Espacios y Cabinas a Bordo', 'Onboard Spaces and Cabins')}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('Fotografías reales del Yate Terranova Hatteras 65ft LRC: cubiertas exteriores, suites principales, camarotes twin y cabinas de descanso en la Cubierta 1.', 'Authentic photography of Terranova Hatteras 65ft LRC: exterior decks, master suites, twin staterooms, and guest cabins on Deck 1.')}
            </p>
          </div>

          {/* Main Photo Gallery Container */}
          <div className="relative w-full max-w-5xl mx-auto h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 flex flex-col justify-between group">
            {/* The Active Photo Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={images[currentPhotoIndex].url}
                alt={images[currentPhotoIndex].title}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100"
              />
              {/* Soft luxury overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40 pointer-events-none" />
            </div>

            {/* Top Bar HUD */}
            <div className="relative z-20 w-full p-5 sm:p-6 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-white/95 font-mono text-[10px] sm:text-xs tracking-wider uppercase flex items-center gap-2 select-none shadow-md">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>{t('Yate Terranova • Foto', 'Terranova Yacht • Photo')} 0{currentPhotoIndex + 1} {t('de', 'of')} 0{images.length}</span>
              </div>
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-sky-300 font-mono text-[10px] sm:text-xs tracking-wider select-none shadow-md hidden sm:flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{images[currentPhotoIndex].location || 'Hatteras 65ft LRC'}</span>
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

      {/* PHOTO GALLERY */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-blue-900 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-900/10">
              Galería Fotográfica Exclusiva
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Espacios y Momentos a Bordo
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Deslice horizontalmente para recorrer las vistas exclusivas del yate. Haga clic en cualquier imagen para abrir el visualizador interactivo en pantalla completa.
            </p>
          </div>

          {/* Self-contained CSS styles for hiding scrollbar */}
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Carousel Container */}
          <div className="relative group/carousel px-4">
            {/* Left navigation arrow button */}
            <button
              onClick={() => scrollGallery('left')}
              className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>

            {/* Right navigation arrow button */}
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
                  className="min-w-[100%] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start group relative rounded-2xl overflow-hidden shadow-md border border-slate-250/60 cursor-pointer aspect-[4/3] flex flex-col justify-end text-white transition-all duration-300 hover:shadow-lg"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />
                  
                  {/* Hover visual details overlay */}
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
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm flex flex-col justify-between p-4 sm:p-10 text-white select-none overflow-y-auto lg:overflow-y-hidden">
          
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
                  Terranova Gallery
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
                    <span className="text-blue-400 font-bold uppercase tracking-wider">Terranova Yachting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Thumbnails HUD */}
            <div className="space-y-4">
              {/* Image counter */}
              <div className="text-center font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                Foto {fullscreenIndex + 1} de {images.length}
              </div>

              {/* Thumbnail cards strip */}
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

      {/* RESERVATION CTA */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/5 -top-64 left-1/2 -translate-x-1/2 blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 text-white">
          <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            ¿Listo para Vivir la Experiencia Terranova?
          </h3>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto">
            Revisa las próximas fechas disponibles de nuestros programas de navegación por los canales y fiordos del Cabo de Hornos.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/contacto')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition shadow-xl text-sm min-h-[48px] cursor-pointer"
            >
              <Ship className="w-4 h-4 text-slate-950" />
              <span>Revisar Próximas Fechas de Programas</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
