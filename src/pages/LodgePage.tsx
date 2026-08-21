import React from 'react';
import { ArrowLeft, Compass, Users, Sparkles, Maximize2, ChevronLeft, ChevronRight, X, Home, MapPin, FileText, Sun, UtensilsCrossed, BedDouble, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLodge } from '../hooks/useLodge';
import { useSiteContent } from '../hooks/useSiteContent';
import { formatPhone, formatRut } from '../lib/formatters';

interface LodgePageProps {
  onNavigate: (path: string) => void;
}

export const LodgePage: React.FC<LodgePageProps> = ({ onNavigate }) => {
  const { rooms, createBooking } = useLodge();
  const { getSection } = useSiteContent();
  const lodgeInfo = getSection('lodge_info');
  const lodgeDining = getSection('lodge_dining');
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [selectedRoomId, setSelectedRoomId] = React.useState('');
  const [guestName, setGuestName] = React.useState('');
  const [guestEmail, setGuestEmail] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [guestRut, setGuestRut] = React.useState('');
  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [paxCount, setPaxCount] = React.useState(2);
  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingSuccess, setBookingSuccess] = React.useState<{ code: string; deposit: number; total: number } | null>(null);
  const [bookingError, setBookingError] = React.useState<string | null>(null);

  const [flipped, setFlipped] = React.useState<Record<string, boolean>>({});
  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [currentStation, setCurrentStation] = React.useState<'exterior' | 'comedor' | 'habitacion'>('exterior');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [activeInfo, setActiveInfo] = React.useState<{ title: string; desc: string } | null>(null);

  const currentDateFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()).toUpperCase();
  }, []);

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
      title: 'Terraza & Quincho Exterior',
      image: '/jf-noviembre.jpg',
      hotspots: [
        {
          x: '45%',
          y: '60%',
          type: 'info' as const,
          title: 'Amplio Quincho Isleño',
          desc: 'Espacio acogedor ideal para compartir, cocinar y disfrutar de encuentros al aire libre frente al paisaje de Robinson Crusoe tras recorrer la isla.',
        },
        {
          x: '25%',
          y: '42%',
          type: 'info' as const,
          title: 'Terraza & Atardeceres Frente al Mar',
          desc: 'Ubicación privilegiada en Uberlindo Andaur 222 justo frente al mar para contemplar atardeceres inolvidables sobre el océano Pacífico.',
        },
        {
          x: '75%',
          y: '65%',
          type: 'nav' as const,
          label: 'Ingresar al Espacio Común',
          target: 'comedor' as const,
        },
      ],
    },
    comedor: {
      title: 'Espacio Común & Comedor',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      hotspots: [
        {
          x: '55%',
          y: '50%',
          type: 'info' as const,
          title: 'Inspiración Náutica & Luz Natural',
          desc: 'Estética funcional donde la luz natural, la brisa marina y las vistas acompañan cada espacio para una experiencia auténtica.',
        },
        {
          x: '35%',
          y: '68%',
          type: 'info' as const,
          title: 'Comedor & Encuentro',
          desc: 'Lugar de reunión para compartir vivencias y sabores locales frente al mar de Bahía Cumberland.',
        },
        {
          x: '20%',
          y: '45%',
          type: 'nav' as const,
          label: 'Salir a la Terraza y Quincho',
          target: 'exterior' as const,
        },
        {
          x: '80%',
          y: '60%',
          type: 'nav' as const,
          label: 'Ir a Cabinas Independientes',
          target: 'habitacion' as const,
        },
      ],
    },
    habitacion: {
      title: 'Cabinas Independientes Frente al Mar',
      image: '/rincon-de-navegantes.jpg',
      hotspots: [
        {
          x: '50%',
          y: '60%',
          type: 'info' as const,
          title: '4 Cabinas (Hasta 11 Pasajeros)',
          desc: 'Cuatro cabinas independientes (3 para hasta 3 personas y 1 para hasta 2 personas), todas con baño privado y vista directa al océano.',
        },
        {
          x: '30%',
          y: '55%',
          type: 'info' as const,
          title: 'Baño Privado & Vista al Océano',
          desc: 'Todas las cabinas cuentan con su propio baño privado independiente y vistas panorámicas hacia la inmensidad del mar.',
        },
        {
          x: '12%',
          y: '58%',
          type: 'nav' as const,
          label: 'Regresar al Espacio Común',
          target: 'comedor' as const,
        },
      ],
    },
  };

  const [selectedFeature, setSelectedFeature] = React.useState<'arquitectura' | 'quincho' | 'exploraciones' | 'atardeceres'>('arquitectura');

  const logbookEntries = {
    arquitectura: {
      title: 'Arquitectura & Inspiración Náutica',
      day: 'Diseño & Entorno Natural',
      location: 'Uberlindo Andaur 222',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Brisa Marina',
      temp: '16°C Ext',
      text: 'Su diseño se organiza en torno a cuatro cabinas independientes, todas con baño privado y vista al océano, además de espacios comunes que incluyen terraza, quincho y áreas verdes. La construcción mantiene una estética funcional y de inspiración náutica, donde el entorno es el verdadero protagonista: la luz natural, la brisa marina y las vistas acompañan cada espacio, creando una experiencia auténtica y conectada con la vida isleña.',
      image: '/jf-noviembre.jpg',
    },
    quincho: {
      title: lodgeDining.title || 'Amplio Quincho & Encuentros',
      day: 'Momentos al Aire Libre',
      location: 'Quincho del Lodge',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Calma',
      temp: '18°C Ext',
      text: lodgeDining.body_text || 'El lodge cuenta con un amplio quincho, un espacio acogedor ideal para compartir, cocinar y disfrutar de encuentros al aire libre. Su entorno invita a reunirse después de una jornada recorriendo la isla y vivir momentos inolvidables frente al paisaje de Robinson Crusoe.',
      image: lodgeDining.media_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
    },
    exploraciones: {
      title: 'Exploraciones Exclusivas',
      day: 'Aventura con Expertos Locales',
      location: 'Isla Robinson Crusoe',
      coordinates: '33°39\' S, 78°51\' W',
      wind: 'SW 14 Nudos',
      temp: '15°C Ext',
      text: 'Guiados por expertos locales, exploramos la isla Robinson Crusoe a través de experiencias únicas: cabalgatas por paisajes de gran belleza, senderismo entre bosques de helechos gigantes y especies endémicas, buceo y snorkel en aguas de extraordinaria biodiversidad, y navegaciones que revelan acantilados, bahías y rincones inaccesibles por tierra. Cada aventura permite descubrir la historia, la naturaleza y el espíritu de una de las islas más fascinantes del mundo.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    },
    atardeceres: {
      title: 'Atardeceres Frente al Mar',
      day: 'Horizonte Infinito',
      location: 'Frente al Mar (Bahía Cumberland)',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Calma',
      temp: '14°C Ext',
      text: 'Desde Rincón de Navegantes, el océano se convierte en parte del paisaje cotidiano. Su ubicación privilegiada frente al mar permite contemplar atardeceres inolvidables, mientras el cielo cambia de color y el sol se pierde en el horizonte. Un escenario único para descansar, compartir y dejarse envolver por la inmensidad de Robinson Crusoe.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const images = [
    {
      url: '/rincon-de-navegantes.jpg',
      title: 'Lodge Rincón de Navegantes',
      desc: 'Refugio boutique ubicado en Uberlindo Andaur 222, justo en frente del mar en la Isla Robinson Crusoe.',
    },
    {
      url: '/jf-noviembre.jpg',
      title: 'Arquitectura e Inspiración Náutica',
      desc: 'Diseño funcional en torno a 4 cabinas independientes, terraza, amplio quincho y áreas verdes.',
    },
    {
      url: '/rincon-de-navegantes.jpg',
      title: 'Cabinas con Vista al Océano',
      desc: 'Todas las cabinas cuentan con baño privado y vistas panorámicas hacia el mar de Robinson Crusoe.',
    },
    {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      title: 'Amplio Quincho & Encuentros',
      desc: 'Espacio acogedor para compartir, cocinar y disfrutar de momentos inolvidables al aire libre tras recorrer la isla.',
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      title: 'Atardeceres Frente al Mar',
      desc: 'Puestas de sol inolvidables mientras el cielo cambia de color y el sol se pierde en el horizonte del Pacífico.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      title: 'Exploraciones Exclusivas',
      desc: 'Cabalgatas, senderismo entre helechos gigantes, buceo, snorkel y navegaciones guiadas por expertos locales.',
    },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] sm:h-[80vh] flex items-end justify-start overflow-hidden">
        {(lodgeInfo.media_url?.endsWith('.mp4') || lodgeInfo.media_url?.endsWith('.webm') || lodgeInfo.media_url?.includes('video/')) ? (
          <video
            src={lodgeInfo.media_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={lodgeInfo.media_url || "/rincon-de-navegantes.jpg"}
            alt={lodgeInfo.title || "Lodge Rincón de Navegantes"}
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
            {lodgeInfo.title || 'Lodge Rincón de Navegantes'}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl opacity-90 drop-shadow-sm">
            {lodgeInfo.body_text || 'Ubicado en Uberlindo Andaur 222, justo en frente del mar en la Isla Robinson Crusoe. Diseñado en torno a 4 cabinas independientes (todas con baño privado y vista al océano para hasta 11 pasajeros), amplio quincho, terraza, áreas verdes y expediciones exclusivas guiadas por expertos locales.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (rooms.length > 0) setSelectedRoomId(rooms[0].id);
                setShowBookingModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-xl text-xs sm:text-sm border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <BedDouble className="w-4 h-4 text-slate-950" />
              <span>Reservar Habitación en el Lodge</span>
            </button>
          </div>
        </div>
      </section>

      {/* TECH SPECS GRID (3D FLIPS ON CLICK) */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Tech Specs Cards in a Single Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: NORTE / CABINAS */}
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">NORTE / CABINAS</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">4 Cabinas</span>
                    <span className="text-slate-500 text-[10px] block">Baño Privado & Vista al Mar</span>
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
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Distribución</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    4 cabinas independientes: 3 cabinas triples (hasta 3 pers.) y 1 cabina doble (hasta 2 pers.), todas con baño privado y vista al océano.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 2: OESTE / CAPACIDAD */}
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">OESTE / CAPACIDAD</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Hasta 11 Pasajeros</span>
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
                    Capacidad máxima de 11 pasajeros para una estadía íntima, conectada con el entorno y en absoluta tranquilidad isleña.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 3: SUR / UBICACIÓN */}
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">SUR / DIRECCIÓN</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Uberlindo Andaur 222</span>
                    <span className="text-slate-500 text-[10px] block">Justo en frente del mar</span>
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
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Frente al Mar</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Ubicación privilegiada en primera línea de mar en Isla Robinson Crusoe, permitiendo contemplar atardeceres inolvidables sobre el horizonte.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>

            {/* Card 4: ESTE / ESPACIOS & QUINCHO */}
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
                    <UtensilsCrossed className="w-4.5 h-4.5 text-emerald-800 relative z-10" />
                    <Compass className="w-9 h-9 text-emerald-800/10 absolute" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">ESTE / QUINCHO & ESPACIOS</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Amplio Quincho</span>
                    <span className="text-slate-500 text-[10px] block">Terraza & Áreas Verdes</span>
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
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Espacios Comunes</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Amplio quincho para cocinar y compartir, terraza con vista panorámica y áreas verdes rodeadas de vegetación nativa.
                  </p>
                  <span className="text-[8px] text-emerald-850/60 font-mono pt-1 uppercase">Volver ➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FICHA TÉCNICA OFICIAL DEL LODGE / TECHNICAL SPECIFICATIONS MATRIX */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-emerald-850 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-800/15 inline-flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-800" />
              <span>Ficha Técnica Oficial • Isla Robinson Crusoe</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Detalle y Especificaciones del Lodge Rincón de Navegantes
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Refugio boutique frente al mar de 4 cabinas independientes con baño privado, amplio quincho, terraza y exploraciones exclusivas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Ubicación & Emplazamiento */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Ubicación & Entorno</h4>
                <p className="text-xs text-slate-500 mt-0.5">Emplazamiento privilegiado</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Dirección:</span>
                  <span className="font-bold text-slate-900">Uberlindo Andaur 222</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Posición:</span>
                  <span className="font-bold text-emerald-700">Justo en frente del mar</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Destino:</span>
                  <span className="font-bold text-slate-900">Isla Robinson Crusoe</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Archipiélago:</span>
                  <span className="font-bold text-slate-900">Juan Fernández, Chile</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Cabinas & Capacidad */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Cabinas & Capacidad</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hasta 11 Pasajeros</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Total Cabinas:</span>
                  <span className="font-bold text-slate-900">4 Independientes</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">3 Cabinas:</span>
                  <span className="font-bold text-slate-900">Hasta 3 personas c/u</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">1 Cabina:</span>
                  <span className="font-bold text-slate-900">Hasta 2 personas</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Baños:</span>
                  <span className="font-bold text-emerald-800">Privado en cada cabina</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Vista:</span>
                  <span className="font-bold text-slate-900">Directa al Océano</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Espacios Comunes & Quincho */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Quincho & Espacios</h4>
                <p className="text-xs text-slate-500 mt-0.5">Encuentros al aire libre</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Amplio Quincho:</span>
                  <span className="font-bold text-slate-900 text-right">Para compartir & cocinar</span>
                </li>
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Terraza:</span>
                  <span className="font-bold text-slate-900 text-right">Frente al océano</span>
                </li>
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Áreas Verdes:</span>
                  <span className="font-bold text-slate-900 text-right">Jardines nativos</span>
                </li>
                <li className="flex justify-between items-start">
                  <span className="text-slate-500">Atardeceres:</span>
                  <span className="font-bold text-amber-700 text-right">Vistas al horizonte</span>
                </li>
              </ul>
            </div>

            {/* Box 4: Exploraciones Exclusivas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Exploraciones Exclusivas</h4>
                <p className="text-xs text-slate-500 mt-0.5">Guiadas por expertos locales</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Cabalgatas:</span>
                  <span className="font-bold text-slate-900">Paisajes de gran belleza</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Senderismo:</span>
                  <span className="font-bold text-slate-900">Helechos gigantes & endémicos</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Buceo & Snorkel:</span>
                  <span className="font-bold text-blue-900">Alta biodiversidad marina</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Navegaciones:</span>
                  <span className="font-bold text-slate-900">Acantilados & bahías</span>
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
                      • {currentDateFormatted}
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
              
              {/* Feature 1: Arquitectura */}
              <div
                onClick={() => setSelectedFeature('arquitectura')}
                onMouseEnter={() => setSelectedFeature('arquitectura')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'arquitectura'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'arquitectura' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Home className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Arquitectura & Vista al Océano</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    4 cabinas independientes con baño privado y vista al mar, terraza, quincho y áreas verdes con estética funcional e inspiración náutica.
                  </p>
                </div>
              </div>

              {/* Feature 2: Quincho */}
              <div
                onClick={() => setSelectedFeature('quincho')}
                onMouseEnter={() => setSelectedFeature('quincho')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'quincho'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'quincho' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Amplio Quincho</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Espacio acogedor ideal para compartir, cocinar y disfrutar de encuentros al aire libre frente al paisaje de Robinson Crusoe.
                  </p>
                </div>
              </div>

              {/* Feature 3: Exploraciones */}
              <div
                onClick={() => setSelectedFeature('exploraciones')}
                onMouseEnter={() => setSelectedFeature('exploraciones')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'exploraciones'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'exploraciones' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Exploraciones Exclusivas</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cabalgatas, senderismo entre helechos gigantes, buceo, snorkel y navegaciones por acantilados guiadas por expertos locales.
                  </p>
                </div>
              </div>

              {/* Feature 4: Atardeceres */}
              <div
                onClick={() => setSelectedFeature('atardeceres')}
                onMouseEnter={() => setSelectedFeature('atardeceres')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  selectedFeature === 'atardeceres'
                    ? 'border-emerald-800 bg-emerald-50/10 shadow-md translate-x-1'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  selectedFeature === 'atardeceres' ? 'bg-emerald-800 border-emerald-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Atardeceres Frente al Mar</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Ubicación en primera línea para contemplar puestas de sol inolvidables mientras el cielo cambia de color sobre el Pacífico.
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
            Selecciona una de nuestras 4 exclusivas habitaciones con vista al mar y asegura tu estadía directamente mediante transferencia bancaria.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (rooms.length > 0) setSelectedRoomId(rooms[0].id);
                setShowBookingModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition shadow-xl text-sm min-h-[48px] cursor-pointer"
            >
              <BedDouble className="w-4 h-4 text-slate-950" />
              <span>Reservar Habitación en el Lodge</span>
            </button>
            <button
              onClick={() => onNavigate('/contacto')}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-4 rounded-xl transition text-sm min-h-[48px] cursor-pointer border border-slate-700"
            >
              <Home className="w-4 h-4 text-slate-300" />
              <span>Consultar con Concierge</span>
            </button>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-xl font-bold text-white">Reserva de Habitación • Lodge</h4>
                <p className="text-xs text-slate-400">Rincón de Navegantes • Isla Robinson Crusoe</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccess(null);
                  setBookingError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h5 className="font-serif text-lg font-bold text-white">¡Solicitud de Reserva Registrada!</h5>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-emerald-300 text-xs">
                  Código de Reserva: <strong className="text-white text-sm">{bookingSuccess.code}</strong>
                </div>
                <div className="text-left bg-slate-950 p-4 rounded-xl space-y-2 text-xs text-slate-300 border border-slate-800">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider block text-emerald-400">
                    Datos para Transferencia Bancaria
                  </span>
                  <div><strong>Monto Pie de Reserva (50%):</strong> ${bookingSuccess.deposit.toLocaleString('es-CL')} CLP</div>
                  <div><strong>Banco:</strong> Banco de Chile</div>
                  <div><strong>Titular:</strong> Yates Chile SpA</div>
                  <div><strong>RUT:</strong> 77.892.341-K</div>
                  <div><strong>Tipo de Cuenta:</strong> Cuenta Corriente Nº 00-123456-78</div>
                  <div><strong>Email Comprobantes:</strong> pagos@yateschile.cl</div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nuestro concierge revisará tu transferencia en el panel de control y te enviará el voucher oficial de check-in.
                </p>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingSuccess(null);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs"
                >
                  Entendido, Cerrar
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedRoomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
                    setBookingError('Por favor completa todos los campos requeridos.');
                    return;
                  }
                  setBookingLoading(true);
                  setBookingError(null);

                  const room = rooms.find((r) => r.id === selectedRoomId);
                  const d1 = new Date(checkIn);
                  const d2 = new Date(checkOut);
                  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                  const total = (room?.base_price_clp || 220000) * nights;

                  const res = await createBooking({
                    roomId: selectedRoomId,
                    guestName,
                    guestEmail,
                    guestPhone,
                    guestRutPassport: guestRut,
                    checkIn,
                    checkOut,
                    paxCount,
                    totalAmount: total,
                  });

                  setBookingLoading(false);
                  if (res.success && res.bookingCode) {
                    setBookingSuccess({
                      code: res.bookingCode,
                      deposit: Math.round(total * 0.5),
                      total,
                    });
                  } else {
                    setBookingError(res.error || 'Error al procesar la reserva.');
                  }
                }}
                className="space-y-4 text-xs"
              >
                {bookingError && (
                  <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Selecciona una de las 4 Habitaciones
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                    required
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Habitación #{r.room_number} - {r.room_name} (${r.base_price_clp.toLocaleString('es-CL')}/noche)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fecha Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fecha Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: Sebastián Errázuriz"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="nombre@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(formatPhone(e.target.value))}
                      placeholder="+56 9 1234 5678"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">RUT o Pasaporte</label>
                    <input
                      type="text"
                      value={guestRut}
                      onChange={(e) => setGuestRut(formatRut(e.target.value))}
                      placeholder="12.345.678-9"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nº de Pasajeros</label>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={paxCount}
                      onChange={(e) => setPaxCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                  <div className="flex justify-between font-semibold">
                    <span>Modalidad de Pago:</span>
                    <span className="text-emerald-400">Transferencia Bancaria (2 Cuotas)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Se solicita un <strong>50% de Pie</strong> para confirmar y el 50% restante antes del ingreso.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{bookingLoading ? 'Registrando...' : 'Solicitar Reserva & Ver Datos de Transferencia'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

