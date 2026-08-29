import React from 'react';
import { ArrowLeft, Compass, Sparkles, Anchor, Maximize2, ChevronLeft, ChevronRight, X, Ship, Radio, FileText, Layers, Gauge, Download, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useExpeditions } from '../hooks/useExpeditions';

interface TerranovaDetailPageProps {
  onNavigate: (path: string) => void;
}

export const TerranovaDetailPage: React.FC<TerranovaDetailPageProps> = ({ onNavigate }) => {
  const { expeditions } = useExpeditions();
  const { getSection } = useSiteContent();
  const terranovaCms = getSection('flota_terranova');

  const [showExpeditionsModal, setShowExpeditionsModal] = React.useState(false);
  const [flipped, setFlipped] = React.useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [currentStation, setCurrentStation] = React.useState<'exterior' | 'salon' | 'camarote'>('exterior');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [activeInfo, setActiveInfo] = React.useState<{ title: string; desc: string } | null>(null);

  const currentDateFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()).toUpperCase();
  }, []);

  const navigateToStation = (station: 'exterior' | 'salon' | 'camarote') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStation(station);
      setIsTransitioning(false);
    }, 600);
  };

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

  const tourStations = {
    exterior: {
      title: 'Cubierta 3: Flybridge & Deck Superior',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '50%',
          y: '55%',
          type: 'info',
          title: 'Deck Superior & Parrilla',
          desc: 'Área social abierta en el tercer nivel equipada con parrilla para asados al aire libre frente a los glaciares australes.',
        },
        {
          x: '72%',
          y: '68%',
          type: 'nav',
          label: 'Bajar a Cubierta 2 (Salón & Comedor)',
          target: 'salon' as const,
        },
        {
          x: '25%',
          y: '40%',
          type: 'info',
          title: '2do Puente de Gobierno & Navegación',
          desc: 'Puesto de pilotaje elevado equipado con doble electrónica Raymarine y Garmin, Starlink 24/7 y visión panorámica 360°.',
        },
        {
          x: '80%',
          y: '45%',
          type: 'info',
          title: 'Zodiac Yamaha 70hp & Grúa 1 Ton',
          desc: 'Bote auxiliar semirrígido con potente motor fuera de borda Yamaha 4T de 70 HP operado con pluma/grúa de 1 tonelada para desembarcos ágiles.',
        },
      ],
    },
    salon: {
      title: 'Cubierta 2: Puente, Deck Central, Salón & Cocina',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '58%',
          y: '52%',
          type: 'info',
          title: 'Puente de Gobierno Principal',
          desc: 'Comando central con instrumental dual Raymarine y Garmin, Piloto Automático y consola de monitoreo de los 2 generadores Northern Lights.',
        },
        {
          x: '35%',
          y: '65%',
          type: 'info',
          title: 'Deck Central, Comedor & Popa',
          desc: 'Espacio de estar de gran amplitud con comedor noble, ventanales panorámicos y salida directa a la cubierta exterior de popa.',
        },
        {
          x: '22%',
          y: '45%',
          type: 'nav',
          label: 'Subir a Cubierta 3 (Flybridge)',
          target: 'exterior' as const,
        },
        {
          x: '75%',
          y: '60%',
          type: 'nav',
          label: 'Bajar a Cubierta 1 (Dormitorios)',
          target: 'camarote' as const,
        },
        {
          x: '15%',
          y: '55%',
          type: 'info',
          title: 'Cocina Full Equipo',
          desc: 'Cocina profesional completa integrada con provisión de agua continua mediante 2 plantas desalinizadoras (140 ltrs/hr c/u).',
        },
      ],
    },
    camarote: {
      title: 'Cubierta 1: Dormitorios (5 Cabinas / 5 Baños)',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '50%',
          y: '62%',
          type: 'info',
          title: '5 Cabinas Privadas (20 PAX)',
          desc: 'Nivel completo de descanso con 5 cabinas suites independientes diseñadas para albergar con total holgura hasta 20 pasajeros.',
        },
        {
          x: '30%',
          y: '48%',
          type: 'info',
          title: '5 Baños Completos en Suite',
          desc: 'Cinco baños privados independientes con duchas y confort térmico para todos los huéspedes a bordo.',
        },
        {
          x: '12%',
          y: '58%',
          type: 'nav',
          label: 'Subir a Cubierta 2 (Salón)',
          target: 'salon' as const,
        },
      ],
    },
  };

  const [selectedFeature, setSelectedFeature] = React.useState<'climatizacion' | 'gastronomia' | 'casco' | 'desembarcos'>('climatizacion');

  const logbookEntries = {
    climatizacion: {
      title: 'Deck Superior & Quincho Panorámico',
      day: 'Día 10 de Travesía',
      location: 'Glaciar Garibaldi',
      coordinates: '54°07\' S, 69°57\' W',
      wind: 'W 25 Nudos',
      temp: '3°C Ext',
      text: 'Fondeados frente al resguardo del glaciar Garibaldi, disfrutamos de la vista en 360° desde la Cubierta 3. La parrilla exterior y la amplitud del flybridge con su segundo puente de gobierno ofrecen el espacio perfecto para compartir al atardecer en los fiordos.',
      image: '/flota/terranova/terranova-cubiertas.jpg',
    },
    gastronomia: {
      title: 'Salón Central & Gastronomía Austral',
      day: 'Día 14 de Travesía',
      location: 'Seno Eyre',
      coordinates: '48°58\' S, 74°20\' W',
      wind: 'Calma',
      temp: '5°C Ext',
      text: 'En el amplio comedor de la Cubierta 2, rodeados de ventanales panorámicos frente al glaciar Pío XI, la cocina full equipo permite preparar centolla fresca austral y pesca del día maridadas con vinos selectos en un ambiente de total calidez y confort.',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
    },
    casco: {
      title: 'Propulsión Detroit & 3.000 MN Autonomía',
      day: 'Día 17 de Travesía',
      location: 'Golfo de Penas',
      coordinates: '47°15\' S, 74°50\' W',
      wind: 'SW 38 Nudos',
      temp: '6°C Ext',
      text: 'Navegando a velocidad crucero de 10 nudos con el empuje firme de los 2 motores Detroit de 450 HP. Su estanque de 10.000 Litros de combustible brinda 3.000 millas náuticas de autonomía para explorar los canales y fiordos más remotos del extremo sur sin escalas.',
      image: '/zarpe-archipielago.jpg',
    },
    desembarcos: {
      title: 'Zodiac Yamaha 70 HP & Grúa 1T',
      day: 'Día 19 de Travesía',
      location: 'Fiordo Peel',
      coordinates: '50°55\' S, 74°05\' W',
      wind: 'Calma',
      temp: '4°C Ext',
      text: 'Operamos la grúa de 1 tonelada de la Cubierta 3 para arriar el bote Zodiac semirrígido con motor Yamaha 70 HP. La potencia y maniobrabilidad nos permiten realizar aproximaciones directas y desembarcos seguros en playas y ventisqueros de difícil acceso.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const images = [
    {
      url: '/yate-terranova.jpg',
      title: 'Yate Terranova en aguas australes',
      desc: 'El Terranova Hatteras 65ft LRC navegando entre los canales australes. Su autonomía oceánica y robustez americana ofrecen una navegación incomparable.',
    },
    {
      url: '/flota/terranova/terranova-cubiertas.jpg',
      title: 'Deck Superior & Cubiertas del Terranova',
      desc: 'Vista de proa y flybridge del Yate Terranova con segundo puesto de gobierno, zona de estar exterior y acceso a cubiertas.',
    },
    {
      url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      title: 'Cubierta 1: 5 Cabinas & 5 Baños (20 PAX)',
      desc: 'Nivel completo de descanso con 5 cabinas independientes y 5 baños privados para albergar con total comodidad a grupos y expediciones.',
    },
    {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      title: 'Cubierta 2: Salón, Comedor & Cocina Full',
      desc: 'Espacio central panorámico con amplio comedor, cocina integral completamente equipada y terraza de popa para compartir la gastronomía de a bordo.',
    },
    {
      url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1000&q=80',
      title: 'Doble Puente de Gobierno (Raymarine + Garmin)',
      desc: 'Doble estación de gobierno equipada con Plotter y Piloto Automático Raymarine y Garmin, junto a conectividad Starlink 24/7.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      title: 'Zodiac Yamaha 70 HP & Grúa de 1 Tonelada',
      desc: 'Bote auxiliar semirrígido con motor Yamaha 4T 70 HP y grúa de 1 tonelada para aproximaciones y desembarcos seguros en glaciares.',
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
            <span>Volver a Inicio</span>
          </button>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-3.5">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
            {terranovaCms.title || 'Yate Terranova'}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl opacity-90 drop-shadow-sm">
            {terranovaCms.body_text || 'Yate de expedición oceánica Hatteras 65ft LRC (Astillero Americano, Matrícula PMO 6128) distribuido en 3 cubiertas con capacidad para 20 PAX (5 cabinas / 5 baños). Equipado con 2 motores Detroit de 450 HP (3.000 MN de autonomía con estanque de 10.000 L), doble navegación Raymarine + Garmin, Starlink 24/7, 2 desalinizadores y Zodiac semirrígido con motor Yamaha 70hp y grúa de 1 tonelada.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowExpeditionsModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-xl text-xs sm:text-sm border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Ship className="w-4 h-4 text-slate-950" />
              <span>Reservar Expediciones en Yate Terranova</span>
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
                Expediciones Programadas en Yate Terranova
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
                          {exp.startDate} al {exp.endDate}
                        </span>
                        {typeof exp.spotsLeft === 'number' && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {exp.spotsLeft} cupos disponibles
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
                      <span>Brochure PDF</span>
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
                      <span>Reservar Cupo</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">NORTE / ASTILLERO</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Hatteras 65ft LRC</span>
                    <span className="text-slate-500 text-[10px] block">Americano • PMO 6128</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Identificación</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Astillero Americano Hatteras 65ft LRC (Long Range Cruiser). Matrícula oficial PMO 6128. Eslora 20 metros.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">OESTE / CUBIERTAS</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">3 Cubiertas</span>
                    <span className="text-slate-500 text-[10px] block">20 PAX • 5 Cab / 5 Baños</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Distribución</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    3 cubiertas: Cubierta 1 (5 cabinas / 5 baños), Cubierta 2 (Puente, salón, comedor, cocina), Cubierta 3 (Flybridge, parrilla).
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">SUR / AUTONOMÍA</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">3.000 MN</span>
                    <span className="text-slate-500 text-[10px] block">2x Detroit 450HP • 10.000L</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Propulsión</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    2 motores Detroit 450 HP c/u, estanque de 10.000 ltrs, autonomía de 3.000 MN a 10 kts y 2 generadores Northern Lights 10kVA.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">ESTE / EQUIPAMIENTO</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Raymarine + Garmin</span>
                    <span className="text-slate-500 text-[10px] block">Starlink • Yamaha 70HP</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-blue-900/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Equipamiento</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Plotter & Piloto Raymarine + Garmin, Starlink 24/7, 2 desalinizadores 140 ltrs/hr, Zodiac semirrígido Yamaha 70hp y grúa 1T.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
              <span>Ficha Técnica Oficial • Matrícula PMO 6128</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Especificaciones Técnicas del Yate Terranova
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Yate de expedición oceánica de astillero americano Hatteras 65ft LRC de 3 cubiertas con autonomía de 3.000 millas náuticas y equipamiento de alta gama.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Embarcación & Registro */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Embarcación & Registro</h4>
                <p className="text-xs text-slate-500 mt-0.5">Identificación y dimensiones</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Astillero / Modelo:</span>
                  <span className="font-bold text-slate-900">Hatteras 65ft LRC</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Origen:</span>
                  <span className="font-bold text-slate-900">Americano</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Matrícula:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">PMO 6128</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-bold text-slate-900">Yate de Expedición</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Distribución en 3 Cubiertas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Distribución 3 Cubiertas</h4>
                <p className="text-xs text-slate-500 mt-0.5">Capacidad para 20 PAX</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Cubierta 1:</span>
                  <span className="font-bold text-slate-900 text-right">5 Cabinas / 5 Baños</span>
                </li>
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Cubierta 2:</span>
                  <span className="font-bold text-slate-900 text-right">Puente, Salón, Comedor, Cocina & Popa</span>
                </li>
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Cubierta 3:</span>
                  <span className="font-bold text-slate-900 text-right">2do Puente, Deck, Parrilla & Grúa</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Propulsión & Autonomía */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Propulsión & Autonomía</h4>
                <p className="text-xs text-slate-500 mt-0.5">Potencia oceánica</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Motores:</span>
                  <span className="font-bold text-slate-900">2x Detroit 450 HP c/u</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Estanque Diésel:</span>
                  <span className="font-bold text-slate-900">10.000 Litros</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Autonomía:</span>
                  <span className="font-bold text-blue-900">3.000 MN (a 10 kts)</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Generadores:</span>
                  <span className="font-bold text-slate-900">2x Northern Lights 10kVA</span>
                </li>
              </ul>
            </div>

            {/* Box 4: Electrónica & Desembarcos */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Navegación & Desembarco</h4>
                <p className="text-xs text-slate-500 mt-0.5">Equipamiento expedicionario</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Internet Satelital:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Starlink 24/7
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Electrónica Dual:</span>
                  <span className="font-bold text-slate-900">Raymarine + Garmin</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Desalinizadores:</span>
                  <span className="font-bold text-blue-900">2x 140 ltrs/hr</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Zodiac Auxiliar:</span>
                  <span className="font-bold text-slate-900">Yamaha 70hp + Grúa 1T</span>
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
              Ingeniería & Vida a Bordo
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mt-3">
              Cuaderno de Bitácora y Características
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Explora las vivencias de navegación rápida y los detalles técnicos que hacen del Terranova un yate a motor de travesía insuperable.
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
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Ubicación</span>
                      <span className="text-[11px] font-sans font-extrabold text-slate-800">{logbookEntries[selectedFeature].location}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Coordenadas</span>
                      <span className="text-[11px] font-mono font-bold text-blue-900">{logbookEntries[selectedFeature].coordinates}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Viento</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700">{logbookEntries[selectedFeature].wind}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Clima</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700">{logbookEntries[selectedFeature].temp}</span>
                    </div>
                  </div>

                  {/* Captain's Narrative entry */}
                  <div className="space-y-2">
                    <span className="font-serif italic text-[11px] font-semibold text-blue-900/60 block">Relato del Capitán:</span>
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
                    Snapshot Travesía
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
                  <h4 className="font-bold text-base text-slate-900">Deck Superior & Quincho</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cubierta 3 panorámica con segundo puesto de gobierno, terraza exterior, parrilla y grúa de 1 tonelada.
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
                  <h4 className="font-bold text-base text-slate-900">Salón Central & Comedor Full</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cubierta 2 equipada con amplio comedor, cocina integral completa y terraza de popa para compartir la gastronomía de a bordo.
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
                  <h4 className="font-bold text-base text-slate-900">2 Motores Detroit (3.000 MN)</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Dos motores Detroit de 450 HP c/u y estanque de 10.000 Litros con 3.000 millas náuticas de autonomía continua a 10 nudos.
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
                  <h4 className="font-bold text-base text-slate-900">Zodiac 70 HP & Grúa 1 Tonelada</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Bote auxiliar semirrígido con motor Yamaha 4T 70 HP y grúa de 1 tonelada en Cubierta 3 para desembarcos rápidos y seguros.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3D VIRTUAL TOUR SECTION (NAVY BLUE DETAILS CONSOLE) */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-900/20 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <Ship className="w-3.5 h-3.5 text-blue-950 animate-[pulse_3s_infinite]" />
              <span>Experiencia Interactiva</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Recorrido Interactivo a Bordo
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Explora las lujosas instalaciones del Yate Terranova. Haz clic en los hotspots brújula para desplazarte a otras áreas o en los hotspots destello para ver detalles técnicos de la vida a bordo.
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 flex flex-col justify-between">
            {/* The Active View Station Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={tourStations[currentStation].image}
                alt={tourStations[currentStation].title}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  isTransitioning ? 'scale-150 blur-md opacity-0' : 'scale-100 blur-0 opacity-100'
                }`}
              />
              {/* Soft overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Hotspots layer (rendered when not transitioning) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {!isTransitioning && tourStations[currentStation].hotspots.map((hs, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (hs.type === 'nav' && hs.target) {
                      navigateToStation(hs.target);
                    } else if (hs.title && hs.desc) {
                      setActiveInfo({ title: hs.title, desc: hs.desc });
                    }
                  }}
                  className="absolute w-10 h-10 rounded-full bg-blue-950/80 border-2 border-white flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 hover:bg-blue-900 transition-all duration-300 pointer-events-auto group focus:outline-none focus:ring-4 focus:ring-blue-900/50"
                  style={{
                    left: hs.x,
                    top: hs.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Outer pulsing ring */}
                  <span className="absolute -inset-2.5 rounded-full border-2 border-blue-400/60 animate-ping opacity-75 pointer-events-none" />
                  
                  {hs.type === 'nav' ? (
                    <Compass className="w-5 h-5 text-white animate-[spin_20s_linear_infinite]" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-sky-400" />
                  )}

                  {/* Label tooltip on hover */}
                  <span className="absolute bottom-12 bg-slate-950/90 border border-slate-800/80 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono tracking-wide uppercase select-none pointer-events-none z-30">
                    {hs.type === 'nav' ? (hs.label || 'Navegar') : (hs.title || 'Info')}
                  </span>
                </button>
              ))}
            </div>

            {/* Overlay modal for information hotspots */}
            {activeInfo && (
              <div className="absolute inset-0 z-30 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 pointer-events-auto">
                <div className="bg-white/95 border border-slate-200/80 max-w-md w-full p-6 rounded-2xl shadow-2xl relative z-10 space-y-4 animate-[fadeIn_0.3s_ease-out] text-slate-800">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/10 flex items-center justify-center text-blue-900 shrink-0">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-slate-900">{activeInfo.title}</h4>
                  </div>
                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed">{activeInfo.desc}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveInfo(null)}
                      className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md min-h-[38px] cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Top Bar Navigation HUD */}
            <div className="relative z-20 w-full p-6 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/80 border border-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl text-white/90 font-mono text-[10px] sm:text-xs tracking-wider uppercase flex items-center gap-2 select-none shadow-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Vista Activa: {tourStations[currentStation].title}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl text-white/70 font-mono text-[10px] sm:text-xs tracking-wider uppercase select-none shadow-md hidden sm:block">
                FOV: 75°
              </div>
            </div>

            {/* Bottom HUD Station Selector Controls */}
            <div className="relative z-20 w-full p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-t from-slate-950/80 to-transparent">
              <div className="flex gap-2 sm:gap-3 pointer-events-auto">
                <button
                  onClick={() => navigateToStation('exterior')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer min-h-[38px] ${
                    currentStation === 'exterior'
                      ? 'bg-blue-900 text-white border border-blue-800 shadow-md shadow-blue-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Cubierta
                </button>
                <button
                  onClick={() => navigateToStation('salon')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer min-h-[38px] ${
                    currentStation === 'salon'
                      ? 'bg-blue-900 text-white border border-blue-800 shadow-md shadow-blue-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Salón Central
                </button>
                <button
                  onClick={() => navigateToStation('camarote')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer min-h-[38px] ${
                    currentStation === 'camarote'
                      ? 'bg-blue-900 text-white border border-blue-800 shadow-md shadow-blue-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Suite Principal
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest select-none hidden sm:block">
                Terranova Travesía HUD v1.2
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
