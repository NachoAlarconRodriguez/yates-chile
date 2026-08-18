import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Anchor, Compass, Sparkles } from 'lucide-react';

interface Slide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  titleHtml: React.ReactNode;
  description: string;
  primaryCtaText: string;
  primaryCtaPath: string;
  bgImage: string;
}

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 'slide-juan-fernandez',
      badge: 'Archipiélago Juan Fernández & Selkirk',
      badgeIcon: <Compass className="w-3 h-3 text-white" />,
      titleHtml: (
        <>
          <span className="block font-bold">Aventuras en el insólito</span>
          <span className="block italic font-serif font-normal text-slate-200">Archipiélago Juan Fernández.</span>
        </>
      ),
      description:
        'Expediciones marítimas privadas hacia la mítica Isla Robinson Crusoe y la salvaje Isla Alejandro Selkirk a bordo de nuestras embarcaciones.',
      primaryCtaText: 'Explorar Expediciones',
      primaryCtaPath: '/expediciones',
      bgImage: 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/AF12CiSUWjDQxAunvIp-k_k/Fotos/IMG_0852.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=qgulyvgx&raw=1',
    },
    {
      id: 'slide-cabo-hornos',
      badge: 'Ruta Mítica Cabo de Hornos',
      badgeIcon: <Anchor className="w-3 h-3 text-white" />,
      titleHtml: (
        <>
          <span className="block font-bold">Donde la cartografía termina,</span>
          <span className="block italic font-serif font-normal text-slate-200">comienza tu expedición.</span>
        </>
      ),
      description:
        'Expediciones legendarias cruzando las aguas australes del Cabo de Hornos y los canales secretos del extremo sur de Chile.',
      primaryCtaText: 'Diseñar Viaje a Medida',
      primaryCtaPath: '/contacto',
      bgImage: '/cabo-de-hornos.png',
    },
    {
      id: 'slide-embarcaciones',
      badge: 'Navegación Privada de Ultralujo',
      badgeIcon: <Sparkles className="w-3 h-3 text-white" />,
      titleHtml: (
        <>
          <span className="block font-bold">Velero Vegvisir &</span>
          <span className="block italic font-serif font-normal text-slate-200">Yate Terranova.</span>
        </>
      ),
      description:
        'Navegación exclusiva a bordo de embarcaciones de alta gama con visores 360°, suites matrimoniales y tripulación dedicada en alta mar.',
      primaryCtaText: 'Ver Fichas Técnicas 3D',
      primaryCtaPath: '/flota',
      bgImage: 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/AIGICdoepICWrV3KT2HQbnQ/Fotos/341f4272-dce6-4326-997f-a997c01e310b.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=fmfomzjd&raw=1',
    },
  ];

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[460px] sm:h-[490px] flex items-end justify-start bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      
      {/* Background Images with Fade Transition */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-85 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={s.bgImage}
            alt={s.badge}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Discrete Ultra-Light Overlay Gradient for Maximum Image Visibility */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-950/15 to-transparent z-0" />

      {/* Slide Main Content — Minimalist Bottom-Left Layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-7 sm:pb-9">
        <div className="max-w-md text-left space-y-2 text-white">
          
          {/* Minimalist Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/40 border border-white/20 text-white text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-md">
            {slide.badgeIcon}
            <span>{slide.badge}</span>
          </div>

          {/* Title in Pure White (Minimalist 2-Line Style) */}
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-snug drop-shadow-xl">
            {slide.titleHtml}
          </h1>

          {/* Description */}
          <p className="text-slate-200 text-[11px] sm:text-xs font-normal leading-relaxed text-shadow max-w-sm opacity-85">
            {slide.description}
          </p>

          {/* Single Primary Action CTA */}
          <div className="pt-1">
            <button
              onClick={() => onNavigate(slide.primaryCtaPath)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-5 py-2 rounded-xl transition-all shadow-lg text-xs min-h-[40px] border border-white/90"
            >
              <Compass className="w-3.5 h-3.5 text-slate-950" />
              <span>{slide.primaryCtaText}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Discrete Small Nautical Navigation Helm (Babor / Estribor) — Bottom Right */}
      <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xl">
        
        {/* Babor */}
        <button
          onClick={handlePrev}
          aria-label="Navegar a Babor (Anterior)"
          className="flex items-center gap-0.5 text-[10px] font-bold text-slate-200 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10"
        >
          <ChevronLeft className="w-3 h-3 text-slate-300" />
          <span className="hidden sm:inline tracking-wider uppercase">Babor</span>
        </button>

        <span className="text-white/20 text-[10px]">|</span>

        {/* Counter */}
        <div className="text-[9px] font-mono tracking-widest text-slate-300 px-1 uppercase">
          0{currentSlide + 1} / 0{slides.length}
        </div>

        <span className="text-white/20 text-[10px]">|</span>

        {/* Estribor */}
        <button
          onClick={handleNext}
          aria-label="Navegar a Estribor (Siguiente)"
          className="flex items-center gap-0.5 text-[10px] font-bold text-slate-200 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10"
        >
          <span className="hidden sm:inline tracking-wider uppercase">Estribor</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
        </button>

      </div>

    </section>
  );
};
