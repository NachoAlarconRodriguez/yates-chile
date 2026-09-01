import React, { useState } from 'react';
import { ArrowLeft, Compass, Users, Maximize2, ChevronLeft, ChevronRight, X, Home, MapPin, FileText, Sun, UtensilsCrossed, BedDouble, CheckCircle2, AlertCircle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useLodge } from '../hooks/useLodge';
import { useCatalogServices } from '../hooks/useCatalogServices';
import { useSiteContent } from '../hooks/useSiteContent';
import { formatPhone, formatRut } from '../lib/formatters';
import type { CatalogService } from '../services/catalogService';

interface LodgePageProps {
  onNavigate: (path: string) => void;
}

export const LodgePage: React.FC<LodgePageProps> = ({ onNavigate }) => {
  const { rooms, createBooking } = useLodge();
  const { services: catalogExcursions } = useCatalogServices();
  const { getSection } = useSiteContent();
  const lodgeInfo = getSection('lodge_info');
  const lodgeDining = getSection('lodge_dining');
  
  // Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1); // 1: Fechas & Habitación, 2: Excursiones, 3: Contacto & Resumen
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRut, setGuestRut] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [paxCount, setPaxCount] = useState(2);
  const [selectedExcursions, setSelectedExcursions] = useState<Array<{ service: CatalogService; date: string; pax: number }>>([]);
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ code: string; deposit: number; total: number; roomName: string; excursionsTotal: number } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

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

  const [selectedFeature, setSelectedFeature] = React.useState<'arquitectura' | 'quincho' | 'exploraciones' | 'atardeceres'>('arquitectura');

  const logbookEntries = {
    arquitectura: {
      title: 'Arquitectura & Aislación Térmica',
      day: 'Diseño & Calidad Constructiva',
      location: 'Uberlindo Andaur 222',
      coordinates: '33°38\' S, 78°50\' W',
      wind: 'Brisa Marina',
      temp: '16°C Ext',
      text: 'Rincón de Navegantes fue diseñado para integrarse de manera armónica al paisaje de Robinson Crusoe, privilegiando una arquitectura respetuosa con el entorno y preparada para las particulares condiciones de la isla. Su construcción incorpora altos estándares de calidad, excelente aislación térmica y materiales seleccionados por su resistencia y durabilidad, ofreciendo espacios confortables, eficientes y protegidos frente al viento, la humedad y las variaciones climáticas. Un diseño que combina calidad constructiva, funcionalidad y conexión con el paisaje, permitiendo disfrutar de la naturaleza de la isla con un alto nivel de confort.',
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

  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState<number>(0);

  const images = [
    {
      url: '/lodge/lodge-terraza-quincho.jpg',
      title: 'Terraza & Quincho Panorámico',
      location: 'Lodge Rincón de Navegantes • Vista al Mar',
      desc: 'Terraza techada de madera noble con vista frontal al mar y bahía Cumberland, ideal para asados y encuentros al aire libre.',
    },
    {
      url: '/lodge/lodge-suite-panoramica.jpg',
      title: 'Suite Panorámica con Vista al Océano',
      location: 'Cabina Principal • Revestimientos en Madera',
      desc: 'Cama matrimonial con amplio ventanal panorámico, gaveteros integrados de madera y vista directa al horizonte del Pacífico.',
    },
    {
      url: '/lodge/lodge-habitacion-velero.jpg',
      title: 'Habitación Náutica con Altillo',
      location: 'Cabina 2 • Inspiración Isleña',
      desc: 'Espacio de gran altura con cama baja y altillo, decoración marinera artesanal, ventanales altos y luz natural.',
    },
    {
      url: '/lodge/lodge-habitacion-individual.jpg',
      title: 'Habitación Luminosa Frente al Mar',
      location: 'Cabina 3 • Confort y Calidez',
      desc: 'Habitación independiente con cama de descanso, escritorio plegable de madera noble y vista directa a la costanera marina.',
    },
    {
      url: '/lodge/lodge-bano-privado.jpg',
      title: 'Baño Privado en Suite',
      location: '4 Cabinas con Baño Privado',
      desc: 'Baño completo independiente con tocador de madera, espejo amplio, ducha y diseño contemporáneo para cada habitación.',
    },
    {
      url: '/rincon-de-navegantes.jpg',
      title: 'Lodge Rincón de Navegantes',
      location: 'Uberlindo Andaur 222 • Robinson Crusoe',
      desc: 'Refugio boutique frente al mar diseñado para albergar hasta 11 pasajeros en 4 cabinas privadas con baño en suite.',
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
            {lodgeInfo.body_text || 'Ubicado justo frente al mar en la Bahía Cumberland. Diseñado en torno a 4 cabinas independientes con baño privado cada una y vista al océano para hasta 11 pasajeros, amplio quincho, terraza y expediciones exclusivas.'}
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">NORTE / HABITACIONES</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">{rooms.length} Habitaciones</span>
                    <span className="text-slate-500 text-[10px] block">Baño Privado & Vista al Mar</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-between text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider block">Distribución de Cabinas</span>

                  <ul className="text-slate-700 text-[8.5px] sm:text-[9px] leading-snug space-y-1 text-left px-1 w-full max-w-[195px]">
                    {rooms.map((r) => (
                      <li key={r.id} className="flex items-start gap-1.5">
                        <span className="text-emerald-800 font-bold leading-none mt-0.5">•</span>
                        <span><strong>{r.room_name}</strong> ({r.room_type}, {r.max_pax} pax)</span>
                      </li>
                    ))}
                  </ul>

                  <span className="text-[8px] text-emerald-850/60 font-mono uppercase">Volver ➔</span>
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
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Hasta {rooms.reduce((acc, r) => acc + (r.max_pax || 2), 0)} Pasajeros</span>
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
                    Capacidad máxima de {rooms.reduce((acc, r) => acc + (r.max_pax || 2), 0)} pasajeros para una estadía íntima, conectada con el entorno y en absoluta tranquilidad isleña.
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">SUR / UBICACIÓN</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Robinson Crusoe</span>
                    <span className="text-slate-500 text-[10px] block">Uberlindo Andaur 222</span>
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
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Isla Robinson Crusoe</span>
                  <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mx-auto">
                    Ubicación privilegiada en primera línea de mar en Uberlindo Andaur 222, Bahía Cumberland, con vistas panorámicas al océano.
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
                    <span className="text-slate-400 text-[8px] uppercase font-bold tracking-widest block">ESTE / ESPACIOS & CONECTIVIDAD</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">Quincho & Starlink</span>
                    <span className="text-slate-500 text-[10px] block">Terraza • Internet Satelital</span>
                  </div>
                  <span className="text-[8px] text-emerald-800 font-bold tracking-wider pt-1 animate-pulse uppercase">Click para detalle</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-800/50 shadow-md flex flex-col items-center text-center justify-center space-y-2 text-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-emerald-850 text-[9px] font-bold uppercase tracking-wider">Espacios & Conectividad</span>
                  <p className="text-slate-600 text-[9.5px] sm:text-[10px] leading-relaxed max-w-[190px] mx-auto">
                    Amplio quincho para cocinar y compartir, terraza con vista panorámica, jardines con naturaleza endémica e Internet Satelital Starlink 24/7.
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {/* Box 1: Ubicación & Emplazamiento */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Ubicación & Entorno</h4>
                <p className="text-xs text-slate-500 mt-0.5">Emplazamiento privilegiado</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Dirección:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Uberlindo Andaur 222</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Posición:</span>
                  <span className="font-bold text-emerald-700 text-right whitespace-nowrap">Frente al mar</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Destino:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Isla Robinson Crusoe</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Archipiélago:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Juan Fernández</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Cabinas & Capacidad */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Cabinas & Capacidad</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hasta 11 Pasajeros</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Total Cabinas:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">4 Independientes</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">3 Cabinas:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Hasta 3 pax c/u</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">1 Cabina:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Hasta 2 pax</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Baños:</span>
                  <span className="font-bold text-emerald-800 text-right whitespace-nowrap">Privado en c/u</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Vista:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Directa al Océano</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Espacios Comunes & Quincho */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Quincho & Espacios</h4>
                <p className="text-xs text-slate-500 mt-0.5">Encuentros al aire libre</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Amplio Quincho:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Cocina & Encuentros</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Terraza:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Frente al océano</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Jardines:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Jardines Endémicos</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Internet Satelital:</span>
                  <span className="font-bold text-emerald-700 text-right flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Starlink 24/7
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 4: Exploraciones Exclusivas */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Exploraciones Exclusivas</h4>
                <p className="text-xs text-slate-500 mt-0.5">Guiadas por expertos locales</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Cabalgatas:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Rutas Panorámicas</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Senderismo:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Bosques & Endémicos</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Buceo & Snorkel:</span>
                  <span className="font-bold text-blue-900 text-right whitespace-nowrap">Biodiversidad Marina</span>
                </li>
                <li className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 whitespace-nowrap">Navegación:</span>
                  <span className="font-bold text-slate-900 text-right whitespace-nowrap">Acantilados & Bahías</span>
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
                  <h4 className="font-bold text-base text-slate-900">Arquitectura & Aislación Térmica</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Arquitectura armónica con el entorno, altos estándares de calidad, excelente aislación térmica y materiales resistentes para un confort total.
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

      {/* PHOTO GALLERY VIEWER IN PLACE OF TOUR */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-950 animate-[spin_30s_linear_infinite]" />
              <span>Galería Fotográfica del Lodge</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Espacios y Habitaciones
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Fotografías reales del Lodge Rincón de Navegantes en la Isla Robinson Crusoe: terraza con quincho exterior, suites panorámicas, habitaciones náuticas y baños en suite frente al mar.
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
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lodge Cumberland • Foto 0{currentPhotoIndex + 1} de 0{images.length}</span>
              </div>
              <div className="bg-slate-900/85 border border-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl text-emerald-300 font-mono text-[10px] sm:text-xs tracking-wider select-none shadow-md hidden sm:flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{images[currentPhotoIndex].location || 'Robinson Crusoe'}</span>
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
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">Lodge Rincón de Navegantes</span>
                <h4 className="font-serif text-xl font-bold text-white">Reserva de Estadía & Excursiones</h4>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccess(null);
                  setBookingError(null);
                  setModalStep(1);
                }}
                className="text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h5 className="font-serif text-xl font-bold text-white">¡Solicitud de Reserva Registrada!</h5>
                <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-emerald-300 text-xs border border-emerald-900/50">
                  Código de Reserva: <strong className="text-white text-sm tracking-wider">{bookingSuccess.code}</strong>
                </div>
                
                {/* Breakdown */}
                <div className="text-left bg-slate-950 p-4 rounded-xl space-y-2 text-xs text-slate-300 border border-slate-800">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                    Resumen de tu Estadía
                  </span>
                  <div className="flex justify-between">
                    <span>Habitación Asignada:</span>
                    <strong className="text-white">{bookingSuccess.roomName}</strong>
                  </div>
                  {bookingSuccess.excursionsTotal > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Excursiones Adicionales:</span>
                      <strong>+${bookingSuccess.excursionsTotal.toLocaleString('es-CL')} CLP</strong>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-white font-bold">
                    <span>Total General:</span>
                    <span>${bookingSuccess.total.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                <div className="text-left bg-slate-950 p-4 rounded-xl space-y-2 text-xs text-slate-300 border border-slate-800">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                    Datos para Transferencia Bancaria
                  </span>
                  <div><strong>Pie Requerido (50%):</strong> ${bookingSuccess.deposit.toLocaleString('es-CL')} CLP</div>
                  <div><strong>Banco:</strong> Banco de Chile</div>
                  <div><strong>Titular:</strong> Yates Chile SpA</div>
                  <div><strong>RUT:</strong> 77.892.341-K</div>
                  <div><strong>Cuenta Corriente:</strong> Nº 00-123456-78</div>
                  <div><strong>Email Comprobantes:</strong> pagos@yateschile.cl</div>
                </div>
                
                <p className="text-[11px] text-slate-400">
                  Nuestro concierge validará el comprobante de transferencia y te enviará el voucher oficial de check-in a tu correo.
                </p>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingSuccess(null);
                    setModalStep(1);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-xs transition"
                >
                  Entendido, Finalizar
                </button>
              </div>
            ) : (
              <div>
                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${modalStep === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${modalStep === 1 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>1</span>
                    <span>Habitación</span>
                  </div>
                  <div className="h-0.5 w-8 bg-slate-800" />
                  <div className={`flex items-center gap-2 text-xs font-semibold ${modalStep === 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${modalStep === 2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>2</span>
                    <span>Excursiones</span>
                  </div>
                  <div className="h-0.5 w-8 bg-slate-800" />
                  <div className={`flex items-center gap-2 text-xs font-semibold ${modalStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${modalStep === 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>3</span>
                    <span>Confirmación</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl flex items-center gap-2 text-xs mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* STEP 1: DATES & ROOM */}
                {modalStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Check-in</label>
                        <input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Check-out</label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Cantidad de Pasajeros ({paxCount} {paxCount === 1 ? 'huésped' : 'huéspedes'})
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setPaxCount(num);
                              if (num > 2 && selectedRoomId === 'room-1') {
                                setSelectedRoomId('room-2');
                              }
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                              paxCount === num
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {num} {num === 1 ? 'Pasajero' : 'Pasajeros'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Selecciona tu Habitación en el Lodge
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rooms.map((r) => {
                          const isOversized = paxCount > (r.max_pax ?? 3);
                          const isSelected = selectedRoomId === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              disabled={isOversized}
                              onClick={() => setSelectedRoomId(r.id)}
                              className={`p-3 rounded-2xl border text-left transition relative ${
                                isOversized
                                  ? 'opacity-40 border-slate-800/60 bg-slate-950 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{r.room_name}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  ${(r.base_price_clp || 220000).toLocaleString('es-CL')}/noche
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {r.max_pax === 2 ? 'Matrimonial / Doble (Máx 2 pax)' : 'Triple con vista al mar (Máx 3 pax)'}
                              </p>
                              {isOversized && (
                                <span className="text-[9px] text-rose-400 font-semibold block mt-1">
                                  Excede capacidad para {paxCount} pax
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!checkIn || !checkOut) {
                          setBookingError('Por favor selecciona las fechas de Check-in y Check-out.');
                          return;
                        }
                        if (checkIn >= checkOut) {
                          setBookingError('La fecha de Check-out debe ser posterior al Check-in.');
                          return;
                        }
                        if (!selectedRoomId) {
                          setBookingError('Por favor selecciona una habitación disponible.');
                          return;
                        }
                        setBookingError(null);
                        setModalStep(2);
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 mt-4"
                    >
                      <span>Siguiente: Personalizar con Excursiones</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: OPTIONAL EXCURSIONS */}
                {modalStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Estadía Seleccionada:</span>
                        {checkIn} ➔ {checkOut}
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-md font-semibold">
                        {paxCount} {paxCount === 1 ? 'Pasajero' : 'Pasajeros'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <span>Agrega Excursiones a tu Estadía (Opcional)</span>
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Solo disponibles para huéspedes del Lodge durante las fechas de su reserva.
                      </p>
                    </div>

                    <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                      {catalogExcursions.map((service) => {
                        const existing = selectedExcursions.find((item) => item.service.id === service.id);
                        return (
                          <div
                            key={service.id}
                            className={`p-3 rounded-xl border transition ${
                              existing
                                ? 'bg-emerald-950/30 border-emerald-500/60'
                                : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{service.name}</span>
                              <span className="text-xs font-mono text-emerald-400 font-semibold">
                                ${service.price_clp.toLocaleString('es-CL')} CLP
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{service.description}</p>
                            
                            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                              {existing ? (
                                <div className="flex items-center gap-2 w-full justify-between">
                                  <div className="flex items-center gap-2">
                                    <label className="text-[9px] text-slate-400 font-bold uppercase">Día:</label>
                                    <input
                                      type="date"
                                      min={checkIn}
                                      max={checkOut}
                                      value={existing.date}
                                      onChange={(e) => {
                                        const newDate = e.target.value;
                                        setSelectedExcursions((prev) =>
                                          prev.map((it) => (it.service.id === service.id ? { ...it, date: newDate } : it))
                                        );
                                      }}
                                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedExcursions((prev) => prev.filter((it) => it.service.id !== service.id));
                                    }}
                                    className="text-rose-400 hover:text-rose-300 text-[10px] font-semibold flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Quitar</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedExcursions((prev) => [
                                      ...prev,
                                      { service, date: checkIn || '', pax: paxCount },
                                    ]);
                                  }}
                                  className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold flex items-center gap-1 ml-auto"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Agregar a mi estadía</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalStep(3)}
                        className="flex-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2"
                      >
                        <span>Siguiente: Datos de Contacto</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CONTACT & CONFIRMATION */}
                {modalStep === 3 && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!guestName || !guestEmail || !guestPhone) {
                        setBookingError('Por favor completa todos los campos de contacto requeridos.');
                        return;
                      }
                      setBookingLoading(true);
                      setBookingError(null);

                      const room = rooms.find((r) => r.id === selectedRoomId);
                      const d1 = new Date(checkIn);
                      const d2 = new Date(checkOut);
                      const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                      const roomSubtotal = (room?.base_price_clp || 220000) * nights;
                      const excursionsSubtotal = selectedExcursions.reduce((acc, it) => acc + it.service.price_clp * it.pax, 0);
                      const grandTotal = roomSubtotal + excursionsSubtotal;

                      const excursionsNote = selectedExcursions.length > 0
                        ? `\nExcursiones seleccionadas: ` + selectedExcursions.map(e => `${e.service.name} (${e.date}, ${e.pax} pax)`).join(', ')
                        : '';

                      const res = await createBooking({
                        roomId: selectedRoomId,
                        guestName,
                        guestEmail,
                        guestPhone,
                        guestRutPassport: guestRut,
                        checkIn,
                        checkOut,
                        paxCount,
                        totalAmount: grandTotal,
                        notes: `Reserva web${excursionsNote}`,
                      });

                      setBookingLoading(false);
                      if (res.success && res.bookingCode) {
                        setBookingSuccess({
                          code: res.bookingCode,
                          deposit: Math.round(grandTotal * 0.5),
                          total: grandTotal,
                          roomName: room?.room_name || 'Habitación Lodge',
                          excursionsTotal: excursionsSubtotal,
                        });
                      } else {
                        setBookingError(res.error || 'Error al procesar la reserva.');
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
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

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">RUT o Pasaporte (Opcional)</label>
                      <input
                        type="text"
                        value={guestRut}
                        onChange={(e) => setGuestRut(formatRut(e.target.value))}
                        placeholder="12.345.678-9"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Desglose de la Inversión</span>
                      {(() => {
                        const room = rooms.find((r) => r.id === selectedRoomId);
                        const d1 = new Date(checkIn || '2026-01-01');
                        const d2 = new Date(checkOut || '2026-01-02');
                        const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                        const roomSubtotal = (room?.base_price_clp || 220000) * nights;
                        const excursionsSubtotal = selectedExcursions.reduce((acc, it) => acc + it.service.price_clp * it.pax, 0);
                        const grandTotal = roomSubtotal + excursionsSubtotal;

                        return (
                          <>
                            <div className="flex justify-between text-xs">
                              <span>Estadía {nights} {nights === 1 ? 'noche' : 'noches'} ({room?.room_name || 'Lodge'}):</span>
                              <span className="font-mono">${roomSubtotal.toLocaleString('es-CL')} CLP</span>
                            </div>
                            {selectedExcursions.map((ex, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-amber-300/90 pl-2">
                                <span>+ {ex.service.name} ({ex.date}):</span>
                                <span className="font-mono">${(ex.service.price_clp * ex.pax).toLocaleString('es-CL')} CLP</span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white text-sm">
                              <span>Total General:</span>
                              <span className="text-emerald-400 font-mono">${grandTotal.toLocaleString('es-CL')} CLP</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                              <span>Pie para Confirmar (50%):</span>
                              <span className="text-white font-mono">${Math.round(grandTotal * 0.5).toLocaleString('es-CL')} CLP</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setModalStep(2)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{bookingLoading ? 'Registrando...' : 'Confirmar Solicitud de Reserva'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

