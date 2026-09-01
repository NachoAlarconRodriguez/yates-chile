import React from 'react';
import { ArrowLeft, Compass, Users, Thermometer, Sparkles, Anchor, MapPin, Maximize2, ChevronLeft, ChevronRight, X, Radio, Droplets, FileText, Download, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useExpeditions } from '../hooks/useExpeditions';

interface VegvisirDetailPageProps {
  onNavigate: (path: string) => void;
}

export const VegvisirDetailPage: React.FC<VegvisirDetailPageProps> = ({ onNavigate }) => {
  const { expeditions } = useExpeditions();
  const { getSection } = useSiteContent();
  const vegvisirCms = getSection('flota_vegvisir');

  const [showExpeditionsModal, setShowExpeditionsModal] = React.useState(false);
  const [flipped, setFlipped] = React.useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentDateFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()).toUpperCase();
  }, []);

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

  const logbookEntries = {
    climatizacion: {
      title: 'Climatización Hidrónica',
      day: 'Día 12 de Travesía',
      location: 'Canal Sarmiento',
      coordinates: '51°52\' S, 73°40\' W',
      wind: 'W 32 Nudos',
      temp: '2°C Ext',
      text: 'El frío antártico cala hondo en cubierta, pero el Vegvisir nos abraza en su interior. La calefacción central hidrónica mantiene la cabina a unos constantes 21°C. Las tazas de café humean sobre la mesa de roble mientras contemplamos la ventisca desde el ventanal templado.',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    },
    gastronomia: {
      title: 'Gastronomía Gourmet',
      day: 'Día 15 de Travesía',
      location: 'Seno Ventisquero',
      coordinates: '54°30\' S, 69°12\' W',
      wind: 'Calma',
      temp: '4°C Ext',
      text: 'Hemos fondeado al resguardo directo del glaciar. A bordo, nuestro chef ha preparado un plato de centolla austral recién extraída, acompañada de un Chardonnay frío. Cenar frente a la imponente pared de hielo azul es una experiencia mística.',
      image: '/flota/vegvisir/vegvisir-gastronomia.jpg',
    },
    casco: {
      title: 'Casco Reforzado',
      day: 'Día 18 de Travesía',
      location: 'Paso del Indio',
      coordinates: '49°02\' S, 74°24\' W',
      wind: 'NW 45 Nudos',
      temp: '1°C Ext',
      text: 'Navegando entre pequeños témpanos de hielo a la deriva bajo una tormenta austral. La solidez del casco reforzado y la quilla de plomo del Vegvisir infunden total confianza cuando el hielo roza suavemente la estructura. La embarcación corta el mar embravecido con firmeza impecable.',
      image: '/velero-vegvisir.jpg',
    },
    desembarcos: {
      title: 'Desembarcos Seguros',
      day: 'Día 20 de Travesía',
      location: 'Bahía Ainsworth',
      coordinates: '54°22\' S, 69°38\' W',
      wind: 'SW 15 Nudos',
      temp: '5°C Ext',
      text: 'Alistamos el bote Zodiac auxiliar semirrígido de alta flotabilidad. La aproximación al frente glaciar y el desembarco en la playa de morrena para caminar hacia los bosques subantárticos transcurren sin contratiempos. Una maniobra segura en un paraje de belleza salvaje.',
      image: '/flota/vegvisir/vegvisir-desembarcos.jpg',
    },
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState<number>(0);

  const images = [
    {
      url: '/flota/vegvisir/vegvisir-juan-fernandez.jpg',
      title: 'Navegación a Vela Abierta',
      location: 'Bahía Cumberland • Juan Fernández',
      desc: 'El Velero Vegvisir avanzando a vela mayor y génova desplegadas frente a los imponentes farellones volcánicos de la Isla Robinson Crusoe.',
    },
    {
      url: '/flota/vegvisir/vegvisir-glaciar-patagonia.jpg',
      title: 'Fondeo Frente a Ventisqueros',
      location: 'Seno Ventisquero & Glaciares • Patagonia',
      desc: 'Aproximación en aguas calmas entre témpanos de hielo con el bote auxiliar Zodiac semirrígido para exploración costera.',
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
      url: '/flota/vegvisir/vegvisir-bahia-austral.jpg?v=2',
      title: 'Bahías y Paisajes Vírgenes',
      location: 'Tundra Subantártica & Fondeaderos Remotos',
      desc: 'Contemplación de la naturaleza salvaje e indómita desde las alturas con el Velero Vegvisir al resguardo en la ensenada.',
    },
    {
      url: '/velero-vegvisir.jpg',
      title: 'Velero Vegvisir • Dufour 52.5 ft Francés',
      location: 'Flota Yates Chile',
      desc: 'Embarcación oceánica con casco reforzado, quilla de plomo y equipamiento de seguridad y confort para navegación de alta latitud.',
    },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-end justify-start overflow-hidden">
        {(vegvisirCms.media_url?.endsWith('.mp4') || vegvisirCms.media_url?.endsWith('.webm') || vegvisirCms.media_url?.includes('video/')) ? (
          <video
            src={vegvisirCms.media_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={vegvisirCms.media_url && !vegvisirCms.media_url.includes('images.unsplash.com') ? vegvisirCms.media_url : "/velero-vegvisir.jpg"}
            alt={vegvisirCms.title || "Velero Vegvisir"}
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
            {vegvisirCms.title ? vegvisirCms.title.replace(/\s*\([^)]*\)/g, '').trim() : 'Velero Vegvisir'}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl opacity-90 drop-shadow-sm">
            {vegvisirCms.body_text || 'Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowExpeditionsModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-xl text-xs sm:text-sm border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Reservar Expediciones en Velero Vegvisir</span>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE EXPEDICIONES DEL VELERO VEGVISIR */}
      {showExpeditionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative text-slate-800 overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#0f2b48] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white pr-4">
                Expediciones Programadas en Velero Vegvisir
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
                e.vessel.toLowerCase().includes('vegvisir') ||
                e.vessel.toLowerCase().includes('velero') ||
                e.name.toLowerCase().includes('travesía')
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
                        <span className="text-[10px] font-mono font-bold uppercase text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md">
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
                          `Hola Yates Chile, deseo reservar cupo para la expedición en Velero Vegvisir:\n\n` +
                          `• Travesía: ${exp.name}\n` +
                          `• Fechas: ${exp.startDate} al ${exp.endDate}\n` +
                          `• Embarcación: Velero Vegvisir\n\n` +
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">NORTE / ASTILLERO</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Dufour 52.5 ft</span>
                    <span className="text-slate-500 text-[10px] block">Francés • QUI 2718</span>
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
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[190px] mx-auto">
                    Diseñado para navegar las aguas del Pacífico Sur, Archipiélago Juan Fernández, Canal Beagle y el Cabo de Hornos con total serenidad.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">OESTE / CAPACIDAD</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">12 PAX</span>
                    <span className="text-slate-500 text-[10px] block">5 Cabinas / 5 Baños</span>
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
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Habitabilidad</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Capacidad para 12 pasajeros con 5 cabinas y 5 baños completos. Amplio salón central y cocina completa.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">SUR / NAVEGACIÓN</span>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 block mt-0.5 leading-tight max-w-[160px] mx-auto">
                      Sistema de Navegación de Última Generación
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">Starlink 24/7</span>
                  </div>
                  <span className="text-[8px] text-blue-900 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
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
                    <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider block">Electrónica</span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mt-0.5">RAYMARINE</span>
                  </div>

                  <ul className="text-slate-600 text-[9.5px] leading-snug space-y-1 text-left px-1 max-w-[190px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>Plotter Raymarine</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>Piloto Automático Raymarine</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-900 font-bold leading-none mt-0.5">•</span>
                      <span>Conexión satelital Starlink 24/7 de alta velocidad</span>
                    </li>
                  </ul>

                  <span className="text-[8px] text-blue-900/60 font-mono uppercase">Volver ➔</span>
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">ESTE / AUTONOMÍA</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">140 Ltrs/hr</span>
                    <span className="text-slate-500 text-[10px] block">Zodiac 4.3m / 15hp</span>
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
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Desembarco</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Planta Desalinizadora de 140 ltrs/hr. Bote Zodiac de 4.3 mts con Motor Mercury 4T 15hp para desembarcos remotos.
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
              <span>Ficha Técnica Oficial • Matrícula QUI 2718</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Especificaciones Técnicas del Velero Vegvisir
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Velero de expedición de astillero francés Dufour 52.5 ft con equipamiento oceánico de última generación y autonomía total.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Embarcación & Registro */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Embarcación & Registro</h4>
                <p className="text-xs text-slate-500 mt-0.5">Identificación y dimensiones</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Astillero / Modelo:</span>
                  <span className="font-bold text-slate-900">Dufour 52.5 ft</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Origen:</span>
                  <span className="font-bold text-slate-900">Francés</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Matrícula:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">QUI 2718</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-bold text-slate-900">Velero de Expedición</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Capacidad & Habitabilidad */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Habitabilidad & Confort</h4>
                <p className="text-xs text-slate-500 mt-0.5">Alojamiento y distribución</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Capacidad Total:</span>
                  <span className="font-bold text-slate-900">12 PAX (Pasajeros)</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Cabinas:</span>
                  <span className="font-bold text-slate-900">5 Cabinas privadas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Baños:</span>
                  <span className="font-bold text-slate-900">5 Baños completos</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Espacios Comunes:</span>
                  <span className="font-bold text-slate-900">Amplio salón & Cocina</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Navegación & Telecomunicaciones */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Electrónica & Satelital</h4>
                <p className="text-xs text-slate-500 mt-0.5">Instrumental de alta precisión</p>
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
                  <span className="text-slate-500">Plotter Náutico:</span>
                  <span className="font-bold text-slate-900">Raymarine</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Piloto Automático:</span>
                  <span className="font-bold text-slate-900">Raymarine</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Cocina a Bordo:</span>
                  <span className="font-bold text-slate-900">Cocina Completa</span>
                </li>
              </ul>
            </div>

            {/* Box 4: Autonomía & Desembarcos */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Autonomía & Desembarco</h4>
                <p className="text-xs text-slate-500 mt-0.5">Equipamiento expedicionario</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Desalinizador:</span>
                  <span className="font-bold text-blue-900">140 ltrs/hr</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Zodiac Auxiliar:</span>
                  <span className="font-bold text-slate-900">4.3 metros</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Motor Fuera de Borda:</span>
                  <span className="font-bold text-slate-900">Mercury 4T / 15 HP</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Salón Central:</span>
                  <span className="font-bold text-slate-900">Amplio & Climatizado</span>
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
              Explora las vivencias de navegación austral y los detalles técnicos que hacen del Vegvisir una embarcación de travesía insuperable.
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
                  <h4 className="font-bold text-base text-slate-900">Climatización Hidrónica</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Sistema de calefacción por radiadores de agua caliente controlable en cada camarote, garantizando noches de confort y abrigo térmico absoluto en aguas glaciales.
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
                  <h4 className="font-bold text-base text-slate-900">Gastronomía Gourmet</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Chef dedicado preparando platos con pesca fresca del día, maridajes con prestigiosos vinos nacionales y centolla recién extraída frente a glaciares milenarios.
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
                  <h4 className="font-bold text-base text-slate-900">Casco Reforzado</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Ingeniería de casco adaptada a la geografía extrema de fiordos e islas del extremo sur, asegurando una rigidez y estabilidad superiores frente a vientos australes.
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
                  <h4 className="font-bold text-base text-slate-900">Desembarcos Seguros</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Equipado con un bote Zodiac auxiliar rígido de alta flotabilidad para realizar aproximaciones directas a ventisqueros y caminatas exclusivas por morrenas glaciares.
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
              <Compass className="w-3.5 h-3.5 text-blue-950 animate-[spin_30s_linear_infinite]" />
              <span>Galería Fotográfica de Navegación</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Momentos y Vistas del Velero Vegvisir
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Fotografías reales a vela abierta, fondeos frente a glaciares patagónicos y caletas protegidas en el Archipiélago Juan Fernández y el Extremo Sur.
            </p>
          </div>

          {/* Main Photo Gallery Container (Identical dimensions and styling) */}
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
                <span>Velero Vegvisir • Foto 0{currentPhotoIndex + 1} de 0{images.length}</span>
              </div>
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-sky-300 font-mono text-[10px] sm:text-xs tracking-wider select-none shadow-md hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{images[currentPhotoIndex].location || 'Navegación Austral'}</span>
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
              Deslice horizontalmente para recorrer las vistas exclusivas del velero. Haga clic en cualquier imagen para abrir el visualizador interactivo en pantalla completa.
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
                  Vegvisir Gallery
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
                    <span className="text-blue-400 font-bold uppercase tracking-wider">Vegvisir Sailing</span>
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
            ¿Listo para Vivir la Experiencia Vegvisir?
          </h3>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto">
            Revisa las próximas fechas disponibles de nuestros programas de navegación por los canales y fiordos del Cabo de Hornos.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/contacto')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition shadow-xl text-sm min-h-[48px] cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Revisar Próximas Fechas de Programas</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
