import React from 'react';
import { ArrowLeft, Compass, Users, Thermometer, Sparkles, Maximize2, ChevronLeft, ChevronRight, X, Home, Wifi, MapPin } from 'lucide-react';

interface LodgePageProps {
  onNavigate: (path: string) => void;
}

export const LodgePage: React.FC<LodgePageProps> = ({ onNavigate }) => {
  const [flipped, setFlipped] = React.useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [currentStation, setCurrentStation] = React.useState<'exterior' | 'comedor' | 'habitacion'>('exterior');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [activeInfo, setActiveInfo] = React.useState<{ title: string; desc: string } | null>(null);

  const navigateToStation = (station: 'exterior' | 'comedor' | 'habitacion') => {
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
      title: 'Terraza Mirador',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '45%',
          y: '60%',
          type: 'info' as const,
          title: 'Hot Tubs de Madera',
          desc: 'Tinas de ciprés calentadas a leña, ubicadas estratégicamente para contemplar las puestas de sol sobre la bahía Cumberland.',
        },
        {
          x: '25%',
          y: '42%',
          type: 'info' as const,
          title: 'Terraza Exterior 180°',
          desc: 'Plataforma de avistamiento equipada con telescopios para observar aves endémicas y la bóveda celeste de Juan Fernández.',
        },
        {
          x: '75%',
          y: '65%',
          type: 'nav' as const,
          label: 'Ingresar al Comedor Principal',
          target: 'comedor' as const,
        },
      ],
    },
    comedor: {
      title: 'Comedor & Cava',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '55%',
          y: '50%',
          type: 'info' as const,
          title: 'Cava de Vinos Seleccionados',
          desc: 'Colección exclusiva de cepas chilenas y espumantes, ideales para maridar con la tradicional langosta de Juan Fernández.',
        },
        {
          x: '35%',
          y: '68%',
          type: 'info' as const,
          title: 'Mesa del Chef',
          desc: 'Mesa central de madera nativa recuperada, con vistas directas a la bahía de Robinson Crusoe a través de ventanales termopanel.',
        },
        {
          x: '20%',
          y: '45%',
          type: 'nav' as const,
          label: 'Salir a la Terraza Mirador',
          target: 'exterior' as const,
        },
        {
          x: '80%',
          y: '60%',
          type: 'nav' as const,
          label: 'Ir a la Suite Forestal',
          target: 'habitacion' as const,
        },
      ],
    },
    habitacion: {
      title: 'Suite Forestal',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '50%',
          y: '60%',
          type: 'info' as const,
          title: 'Habitación Panorámica',
          desc: 'Cama King-size premium con sábanas de lino, ventanales de piso a techo y climatización geotérmica.',
        },
        {
          x: '30%',
          y: '55%',
          type: 'info' as const,
          title: 'Calidez Ecológica',
          desc: 'Chimenea de combustión lenta de alta eficiencia, perfecta para templar la cabina en las tardes húmedas de la isla.',
        },
        {
          x: '12%',
          y: '58%',
          type: 'nav' as const,
          label: 'Regresar al Comedor Principal',
          target: 'comedor' as const,
        },
      ],
    },
  };

  const [selectedFeature, setSelectedFeature] = React.useState<'diseno' | 'gastronomia' | 'aventuras' | 'bienestar'>('diseno');

  const logbookEntries = {
    diseno: {
      title: 'Arquitectura Sustentable',
      day: 'Construcción & Entorno',
      location: 'Bahía Cumberland',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Calma',
      temp: '14°C Ext',
      text: 'El lodge fue levantado utilizando técnicas constructivas de bajo impacto y ciprés local. Su diseño arquitectónico se funde con la vegetación nativa de la ladera, ofreciendo un excelente aislamiento térmico e iluminación natural que respeta el frágil ecosistema de Robinson Crusoe.',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    },
    gastronomia: {
      title: 'Gastronomía Robinsoniana',
      day: 'Sabores del Océano',
      location: 'Comedor del Lodge',
      coordinates: '33°38\' S, 78°49\' W',
      wind: 'SW 12 Nudos',
      temp: '15°C Ext',
      text: 'Nuestra cocina se basa en la sustentabilidad del mar. La langosta de Juan Fernández es la protagonista absoluta, extraída mediante pesca artesanal regulada, acompañada de maridajes exclusivos de vinos chilenos seleccionados de nuestra cava privada en un comedor frente al mar.',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
    },
    aventuras: {
      title: 'Exploraciones Exclusivas',
      day: 'Rutas & Senderismo',
      location: 'Mirador Selkirk',
      coordinates: '33°39\' S, 78°51\' W',
      wind: 'W 18 Nudos',
      temp: '12°C Ext',
      text: 'Guiados por expertos locales, nos adentramos en senderos rodeados de helechos gigantes y especies endémicas únicas en el mundo. Subimos hasta el mirador de Alejandro Selkirk, donde el náufrago vigilaba el horizonte en busca de barcos, contemplando la inmensidad del océano.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    },
    bienestar: {
      title: 'Hot Tubs & Relax',
      day: 'Bienestar Austral',
      location: 'Terraza Exterior',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Calma',
      temp: '11°C Ext',
      text: 'Al atardecer, las tinas calientes de madera (hot tubs) en la terraza exterior se templan con fuego a leña. Relajarse en el agua caliente bajo un cielo estrellado libre de contaminación lumínica, escuchando el suave oleaje de la bahía Cumberland, es el cierre perfecto para un día de aventura.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const images = [
    {
      url: '/rincon-de-navegantes.jpg',
      title: 'Lodge Rincón de Navegantes',
      desc: 'El refugio boutique emplazado en la verde ladera de la bahía Cumberland, en armonía absoluta con el ecosistema insular.',
    },
    {
      url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
      title: 'Arquitectura en Madera Nativa',
      desc: 'Cabinas construidas en maderas nobles con terrazas panorámicas que miran hacia el océano Pacífico.',
    },
    {
      url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      title: 'Suites de Descanso Premium',
      desc: 'Dormitorio de diseño acogedor con ventanales hacia los bosques nativos de helechos y palmeras endémicas.',
    },
    {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      title: 'Comedor y Cava de Isla',
      desc: 'Espacio gastronómico del Lodge donde se sirven pescados locales, langostas y vinos de guarda.',
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      title: 'Tinas calientes frente al mar',
      desc: 'Nuestras tinas de madera calentadas a leña ofrecen la relajación definitiva bajo las estrellas australes.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      title: 'Entorno del Archipiélago',
      desc: 'Acantilados escarpados, bahías de agua cristalina y una flora y fauna marina única en el Pacífico Sur chileno.',
    },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-end justify-start overflow-hidden">
        <img
          src="/rincon-de-navegantes.jpg"
          alt="Lodge Rincón de Navegantes"
          className="absolute inset-0 w-full h-full object-cover"
        />
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
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Lodge Rincón de Navegantes
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
            Refugio boutique de arquitectura sustentable frente a la bahía de Robinson Crusoe, Archipiélago Juan Fernández. Un santuario de calidez e intimidad en el Pacífico austral.
          </p>
        </div>
      </section>

      {/* TECH SPECS GRID (3D FLIPS ON CLICK) */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Tech Specs Cards in a Single Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: SUITES */}
            <div
              onClick={() => toggleFlip('suites')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['suites'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-emerald-900/40 hover:shadow-emerald-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Home className="w-4.5 h-4.5 text-emerald-800 relative z-10" />
                    <Compass className="w-9 h-9 text-emerald-800/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">HABITACIONES</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">6 Suites</span>
                    <span className="text-slate-500 text-[10px] block">Vistas a la Bahía</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Diseño y Materialidad</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Cabinas construidas en maderas nativas con terrazas privadas orientadas hacia el relieve oceánico de Cumberland.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 2: CAPACIDAD */}
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
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-emerald-900/40 hover:shadow-emerald-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Users className="w-4.5 h-4.5 text-emerald-800 relative z-10" />
                    <Compass className="w-9 h-9 text-emerald-800/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">CAPACIDAD</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">12 Huéspedes</span>
                    <span className="text-slate-500 text-[10px] block">Exclusividad total</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Aforo Exclusivo</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Aforo sumamente limitado que asegura una experiencia íntima, libre de ruidos y en completa privacidad.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 3: UBICACIÓN */}
            <div
              onClick={() => toggleFlip('ubicacion')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['ubicacion'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-emerald-900/40 hover:shadow-emerald-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <MapPin className="w-4.5 h-4.5 text-emerald-800 relative z-10" />
                    <Compass className="w-9 h-9 text-emerald-800/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">UBICACIÓN</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Robinson Crusoe</span>
                    <span className="text-slate-500 text-[10px] block">Archipiélago Juan Fernández</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Reserva Biosfera</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Entorno prístino y de aislamiento protegido por la UNESCO, hogar de aves e invertebrados endémicos únicos.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 4: CONECTIVIDAD */}
            <div
              onClick={() => toggleFlip('conectividad')}
              className="relative h-48 w-full cursor-pointer select-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped['conectividad'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-2 hover:shadow-md hover:border-emerald-900/40 hover:shadow-emerald-900/5 transition-all duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-200 shadow-inner">
                    <Wifi className="w-4.5 h-4.5 text-emerald-800 relative z-10" />
                    <Compass className="w-9 h-9 text-emerald-800/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">CONECTIVIDAD</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Satelital Starlink</span>
                    <span className="text-slate-500 text-[10px] block">Servicio Concierge Exclusivo</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-5 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Conexión Global</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Conexión a internet satelital de alta velocidad y un equipo local dedicado a coordinar sus aventuras y recorridos.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARACTERISTICS & AMENITIES (CAPTAIN'S LOGBOOK INTERACTIVE DASHBOARD) */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-800/10">
              Arquitectura & Vida en Tierra
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mt-3">
              Detalles y Relatos del Refugio
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Explora las particularidades de nuestro santuario insular y las vivencias de naturaleza prístina en la indómita Isla Robinson Crusoe.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Logbook (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Background watermark */}
                <Compass className="w-48 h-48 text-slate-50 absolute -right-16 -bottom-16 pointer-events-none" />
                
                <div className="space-y-6 relative z-10">
                  {/* Logbook Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Lodge Chronicle
                    </span>
                    <span className="font-mono text-[10px] uppercase font-black tracking-widest text-emerald-800 animate-pulse">
                      • {logbookEntries[selectedFeature].day}
                    </span>
                  </div>

                  {/* Logbook Meta Tags */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-600">
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Zona</span>
                      <span className="font-bold text-slate-800 block truncate">{logbookEntries[selectedFeature].location}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Coordenadas</span>
                      <span className="font-bold text-slate-800 block truncate">{logbookEntries[selectedFeature].coordinates}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/60 pt-2">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Viento Promedio</span>
                      <span className="font-bold text-slate-800 block">{logbookEntries[selectedFeature].wind}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/60 pt-2">
                      <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Temp. Promedio</span>
                      <span className="font-bold text-slate-800 block">{logbookEntries[selectedFeature].temp}</span>
                    </div>
                  </div>

                  {/* Entry Content */}
                  <div className="space-y-3">
                    <h3 className="font-serif font-bold text-xl text-slate-900">
                      {logbookEntries[selectedFeature].title}
                    </h3>
                    <p className="text-slate-655 text-xs sm:text-sm leading-relaxed font-sans font-light">
                      {logbookEntries[selectedFeature].text}
                    </p>
                  </div>
                </div>

                {/* Miniature Snapshot */}
                <div className="mt-8 pt-6 border-t border-slate-100 relative z-10 flex items-center gap-3">
                  <img
                    src={logbookEntries[selectedFeature].image}
                    alt="Lodge preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-inner"
                  />
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                    Snapshot Santuario
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Feature selector cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              
              {/* Feature 1: Diseno */}
              <div
                onClick={() => setSelectedFeature('diseno')}
                onMouseEnter={() => setSelectedFeature('diseno')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'diseno'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'diseno' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Home className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Arquitectura Sustentable</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cabinas privadas aisladas térmicamente de ciprés nativo, integradas orgánicamente con la flora local de la bahía Cumberland.
                  </p>
                </div>
              </div>

              {/* Feature 2: Gastronomia */}
              <div
                onClick={() => setSelectedFeature('gastronomia')}
                onMouseEnter={() => setSelectedFeature('gastronomia')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'gastronomia'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'gastronomia' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Gastronomía Robinsoniana</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Pesca artesanal regulada y el icónico menú de Langosta de Juan Fernández, maridada con vinos premium en comedor con vista al mar.
                  </p>
                </div>
              </div>

              {/* Feature 3: Aventuras */}
              <div
                onClick={() => setSelectedFeature('aventuras')}
                onMouseEnter={() => setSelectedFeature('aventuras')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'aventuras'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'aventuras' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Exploraciones Exclusivas</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Caminatas guiadas por expertos nativos hacia el mirador histórico Selkirk y senderismo a través de bosques de helechos gigantes.
                  </p>
                </div>
              </div>

              {/* Feature 4: Bienestar */}
              <div
                onClick={() => setSelectedFeature('bienestar')}
                onMouseEnter={() => setSelectedFeature('bienestar')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'bienestar'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'bienestar' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Thermometer className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Tinas Calientes & Relax</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Hot tubs de madera a leña en la terraza exterior, diseñadas para la desconexión total bajo la bóveda estrellada del Pacífico.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3D VIRTUAL TOUR SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-950 animate-[spin_30s_linear_infinite]" />
              <span>Recorrido Virtual interactivo</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Explora el Lodge
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Descubre los rincones del Lodge Rincón de Navegantes. Haz clic en los hotspots brújula para desplazarte a otras áreas o en los hotspots destello para ver detalles de las instalaciones.
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
                  className="absolute w-10 h-10 rounded-full bg-emerald-950/80 border-2 border-white flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 hover:bg-emerald-900 transition-all duration-300 pointer-events-auto group focus:outline-none focus:ring-4 focus:ring-emerald-900/50"
                  style={{
                    left: hs.x,
                    top: hs.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Outer pulsing ring */}
                  <span className="absolute -inset-2.5 rounded-full border-2 border-emerald-400/60 animate-ping opacity-75 pointer-events-none" />
                  
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-emerald-900 shrink-0">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-slate-900">{activeInfo.title}</h4>
                  </div>
                  <p className="text-slate-655 text-xs sm:text-sm leading-relaxed">{activeInfo.desc}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveInfo(null)}
                      className="bg-emerald-850 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md min-h-[38px] cursor-pointer"
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
                      ? 'bg-emerald-800 text-white border border-emerald-700 shadow-md shadow-emerald-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Terraza
                </button>
                <button
                  onClick={() => navigateToStation('comedor')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer min-h-[38px] ${
                    currentStation === 'comedor'
                      ? 'bg-emerald-800 text-white border border-emerald-700 shadow-md shadow-emerald-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Comedor & Cava
                </button>
                <button
                  onClick={() => navigateToStation('habitacion')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer min-h-[38px] ${
                    currentStation === 'habitacion'
                      ? 'bg-emerald-800 text-white border border-emerald-700 shadow-md shadow-emerald-900/20'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                  }`}
                >
                  Suite Forestal
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest select-none hidden sm:block">
                Lodge Cumberland HUD v1.0
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-800/10">
              Galería Fotográfica Exclusiva
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Espacios y Momentos en el Refugio
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Deslice horizontalmente para recorrer las vistas exclusivas del lodge. Haga clic en cualquier imagen para abrir el visualizador interactivo en pantalla completa.
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

            {/* Scrollable strip */}
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setFullscreenIndex(idx)}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start cursor-pointer group/card focus:outline-none"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover/card:shadow-md transition-all duration-300 flex flex-col h-full">
                    {/* Visual container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Ampliar Vista</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata detail */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base text-slate-900 group-hover/card:text-emerald-800 transition-colors">
                          {img.title}
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-sans line-clamp-2">
                          {img.desc}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block pt-2 border-t border-slate-100">
                        Lodge Rincón de Navegantes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox full-screen modal */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 select-none animate-[fadeIn_0.2s_ease-out]">
          {/* Close trigger button */}
          <button
            onClick={() => setFullscreenIndex(null)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-30 focus:outline-none"
            aria-label="Cerrar visor"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-7xl h-full flex flex-col justify-between py-6 space-y-6">
            
            {/* Main view strip container */}
            <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center justify-center min-h-0">
              
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
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest block font-bold">
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
                    <span>Categoría: Santuario Insular</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">Juan Fernández Lodge</span>
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
                      fullscreenIndex === idx ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20' : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
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
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/5 -top-64 left-1/2 -translate-x-1/2 blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 text-white">
          <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            ¿Listo para Vivir la Experiencia Robinson Crusoe?
          </h3>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto">
            Revise las próximas fechas disponibles y consulte con nuestro concierge para planificar su estadía y expedición al Archipiélago.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/contacto')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition shadow-xl text-sm min-h-[48px] cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-950" />
              <span>Consultar Disponibilidad con Concierge</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
