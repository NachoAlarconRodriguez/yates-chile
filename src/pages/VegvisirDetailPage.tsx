import React from 'react';
import { ArrowLeft, Compass, Users, Thermometer, Sparkles, Anchor, MapPin, Maximize2, ChevronLeft, ChevronRight, X, Radio, Droplets, FileText } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

interface VegvisirDetailPageProps {
  onNavigate: (path: string) => void;
}

export const VegvisirDetailPage: React.FC<VegvisirDetailPageProps> = ({ onNavigate }) => {
  const { getSection } = useSiteContent();
  const vegvisirCms = getSection('flota_vegvisir');

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
      title: 'Cubierta Exterior',
      image: 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=vde6gklz&raw=1',
      hotspots: [
        {
          x: '48%',
          y: '30%',
          type: 'info',
          title: 'Aparejo Vélico Carbono',
          desc: 'Mástil y botavara reforzados para vientos australes con velas enrollables de alta tenacidad operadas desde timonera.',
        },
        {
          x: '62%',
          y: '68%',
          type: 'nav',
          label: 'Entrar a Timonera / Salón',
          target: 'salon' as const,
        },
        {
          x: '78%',
          y: '72%',
          type: 'info',
          title: 'Bitácora & Navegación Raymarine',
          desc: 'Doble estación de gobierno con Plotter y Piloto Automático Raymarine, conexión Starlink 24/7 e instrumental náutico completo para navegación oceánica.',
        },
        {
          x: '22%',
          y: '73%',
          type: 'info',
          title: 'Sistema de Fondeo & Zodiac 4.3m',
          desc: 'Molinete eléctrico de alta tracción y bote Zodiac de desembarco 4.3 mts con motor Mercury 4T 15hp para aproximaciones glaciares seguras.',
        },
      ],
    },
    salon: {
      title: 'Salón y Comedor Central',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '52%',
          y: '62%',
          type: 'info',
          title: 'Amplio Salón Central',
          desc: 'Espacio social panorámico con mesa noble para comensales, donde se comparten maridajes seleccionados y conectividad satelital Starlink 24/7.',
        },
        {
          x: '25%',
          y: '45%',
          type: 'nav',
          label: 'Subir a Cubierta Exterior',
          target: 'exterior' as const,
        },
        {
          x: '75%',
          y: '58%',
          type: 'nav',
          label: 'Ir a Cabinas & Baños',
          target: 'camarote' as const,
        },
        {
          x: '15%',
          y: '65%',
          type: 'info',
          title: 'Cocina Completa & Desalinizador',
          desc: 'Cocina integral equipada para alta gastronomía y planta desalinizadora de 140 ltrs/hr que garantiza autonomía ilimitada de agua dulce.',
        },
      ],
    },
    camarote: {
      title: 'Cabinas & Baños (5 Cabinas / 5 Baños)',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '50%',
          y: '62%',
          type: 'info',
          title: '5 Cabinas Privadas (12 PAX)',
          desc: 'Capacidad de habitabilidad para 12 pasajeros distribuidos en 5 cabinas independientes con climatización hidrónica y confort absoluto.',
        },
        {
          x: '48%',
          y: '22%',
          type: 'info',
          title: '5 Baños Completos',
          desc: 'Cinco baños equipados con agua caliente continua y privacidad total para todos los tripulantes y huéspedes.',
        },
        {
          x: '12%',
          y: '58%',
          type: 'nav',
          label: 'Regresar al Salón',
          target: 'salon' as const,
        },
      ],
    },
  };

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
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    },
    casco: {
      title: 'Casco Reforzado',
      day: 'Día 18 de Travesía',
      location: 'Paso del Indio',
      coordinates: '49°02\' S, 74°24\' W',
      wind: 'NW 45 Nudos',
      temp: '1°C Ext',
      text: 'Navegando entre pequeños témpanos de hielo a la deriva bajo una tormenta austral. La solidez del casco reforzado y la quilla de plomo del Vegvisir infunden total confianza cuando el hielo roza suavemente la estructura. La embarcación corta el mar embravecido con firmeza impecable.',
      image: 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1',
    },
    desembarcos: {
      title: 'Desembarcos Seguros',
      day: 'Día 20 de Travesía',
      location: 'Bahía Ainsworth',
      coordinates: '54°22\' S, 69°38\' W',
      wind: 'SW 15 Nudos',
      temp: '5°C Ext',
      text: 'Alistamos el bote Zodiac auxiliar semirrígido de alta flotabilidad. La aproximación al frente glaciar y el desembarco en la playa de morrena para caminar hacia los bosques subantárticos transcurren sin contratiempos. Una maniobra segura en un paraje de belleza salvaje.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const images = [
    {
      url: 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1',
      title: 'Velero Vegvisir en aguas australes',
      desc: 'El Vegvisir navegando majestuosamente frente a las costas vírgenes del extremo sur de Chile. Su casco reforzado corta con solidez las frías aguas australes.',
    },
    {
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
      title: 'Navegación a vela de alta mar',
      desc: 'Una perspectiva de cubierta durante la travesía a vela con viento favorable. Experimenta la auténtica pasión del velerismo tradicional con la máxima seguridad.',
    },
    {
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      title: 'Camarote Suite Principal',
      desc: 'Nuestra cabina principal ofrece un abrigo boutique con revestimientos de madera noble y climatización hidrónica personalizada para noches templadas.',
    },
    {
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      title: 'Salón de caoba climatizado',
      desc: 'El salón central es el punto de encuentro ideal para la sobremesa, donde se comparte la centolla fresca y vinos de guarda chilenos.',
    },
    {
      url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1000&q=80',
      title: 'Puente de mando exterior',
      desc: 'Equipado con instrumentación de navegación de vanguardia, el puente ofrece total visibilidad y control sobre la geografía de fiordos.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      title: 'Fiordos y aproximaciones costeras',
      desc: 'Nuestros itinerarios exclusivos contemplan aproximaciones a glaciares milenarios y desembarcos seguros en morrenas vírgenes de difícil acceso.',
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
            src={vegvisirCms.media_url || "https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1"}
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

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-900/80 backdrop-blur-md border border-blue-400/30 text-white font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">
              {vegvisirCms.subtitle || 'Velero de Expedición • Francés'}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-emerald-300 font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Starlink 24/7
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            {vegvisirCms.title || 'Velero Vegvisir'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl">
            {vegvisirCms.body_text || 'Velero de expedición Dufour 52.5 ft (Astillero Francés, Matrícula QUI 2718) con capacidad para 12 PAX en 5 cabinas con 5 baños privados. Equipado con Starlink 24/7, instrumental Raymarine, desalinizador de 140 ltrs/hr y Zodiac de desembarco con motor Mercury 4T 15hp.'}
          </p>
        </div>
      </section>

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
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Astillero Francés Dufour 52.5 ft (16 m). Matrícula oficial QUI 2718. Casco oceánico reforzado para aguas australes.
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
                    Capacidad para 12 pasajeros con 5 cabinas privadas y 5 baños completos. Amplio salón central y cocina completa.
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
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Raymarine</span>
                    <span className="text-slate-500 text-[10px] block">Starlink 24/7</span>
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
                  <span className="text-blue-900 text-[9px] font-bold uppercase tracking-wider">Electrónica</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Plotter Raymarine, Piloto Automático Raymarine y conexión satelital Starlink 24/7 de alta velocidad.
                  </p>
                  <span className="text-[8px] text-blue-900/60 font-mono pt-1 uppercase">Volver ➔</span>
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

      {/* 3D VIRTUAL TOUR SECTION (NAVY BLUE DETAILS CONSOLE) */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-900/20 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-950 animate-[spin_30s_linear_infinite]" />
              <span>Experiencia Interactiva</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Recorrido Interactivo a Bordo
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Explora las instalaciones del Velero Vegvisir tanto por fuera como por dentro. Haz clic en los hotspots brújula para desplazarte a otras áreas o en los hotspots destello para ver detalles técnicos de la navegación.
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
                Vegvisir Travesía HUD v1.2
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
