import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Anchor, Compass, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useExpeditions } from '../../hooks/useExpeditions';
import { useLanguage } from '../../context/LanguageContext';
import { translationService } from '../../services/translationService';
import type { PublicExpedition } from '../../services/expeditionService';
import { ExpeditionBookingModal } from './ExpeditionBookingModal';

interface Slide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  expedition: PublicExpedition;
}

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

const isMediaVideo = (url?: string | null) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('video/');
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedExpedition, setSelectedExpedition] = useState<PublicExpedition | null>(null);
  const { expeditions } = useExpeditions();
  const { language, t } = useLanguage();
  const isEn = language === 'EN';

  const slides: Slide[] = useMemo(() => {
    // 1. Prioritize expeditions marked with star (isFeatured: true)
    const featured = expeditions.filter((e) => e.isFeatured && e.status !== 'cancelled');

    // 2. If fewer than 3 featured, fill with upcoming departures
    let selected = [...featured];
    if (selected.length < 3) {
      const remaining = expeditions
        .filter((e) => !selected.some((s) => s.id === e.id) && e.status !== 'cancelled')
        .sort((a, b) => {
          const timeA = new Date(a.departureDate || '2099-01-01').getTime();
          const timeB = new Date(b.departureDate || '2099-01-01').getTime();
          return timeA - timeB;
        });
      selected = [...selected, ...remaining].slice(0, 3);
    } else {
      selected = selected.slice(0, 3);
    }

    return selected.map((exp, idx) => {
      const spots = typeof exp.spotsLeft === 'number' ? exp.spotsLeft : (exp.availableSlots ?? 0);
      const spotsText =
        spots === 1
          ? (isEn ? '1 SPOT AVAILABLE' : '1 CUPO DISPONIBLE')
          : spots === 0 || exp.spotsLeft === 'completo'
          ? (isEn ? 'SOLD OUT' : 'CUPOS AGOTADOS')
          : `${spots} ${isEn ? 'SPOTS AVAILABLE' : 'CUPOS DISPONIBLES'}`;

      let icon = <Compass className="w-3.5 h-3.5 text-amber-400" />;
      if (exp.vessel.toLowerCase().includes('velero') || exp.vesselId === 'vegvisir') {
        icon = <Anchor className="w-3.5 h-3.5 text-sky-400" />;
      } else if (exp.vessel.toLowerCase().includes('lodge') || exp.vesselId === 'lodge') {
        icon = <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      }

      const vesselName = isEn ? translationService.fallbackTranslate(exp.vessel, 'EN') : exp.vessel;
      const expName = isEn ? translationService.fallbackTranslate(exp.name, 'EN') : exp.name;
      const expLocation = isEn ? translationService.fallbackTranslate(exp.location, 'EN') : exp.location;
      const expDesc = isEn ? translationService.fallbackTranslate(exp.description, 'EN') : exp.description;

      return {
        id: exp.id || `slide-${idx}`,
        badge: `${vesselName.toUpperCase()} • ${spotsText}`,
        badgeIcon: icon,
        title: expName,
        subtitle: `${expLocation} • ${exp.startDate} ${isEn ? 'to' : 'al'} ${exp.endDate}`,
        description: expDesc,
        bgImage: exp.image || '/travesia-robinson.jpg',
        expedition: exp,
      };
    });
  }, [expeditions, isEn]);

  // Reset currentSlide if out of bounds
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Auto-advance slide every 7 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleBookExpedition = (s: Slide) => {
    setSelectedExpedition(s.expedition);
    setIsBookingModalOpen(true);
  };

  if (slides.length === 0) return null;

  const slide = slides[currentSlide] || slides[0];

  return (
    <section className="relative h-[480px] sm:h-[520px] flex items-end justify-start bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      
      {/* Background Images / Videos with Fade Transition */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-85 z-0' : 'opacity-0 -z-10 pointer-events-none'
          }`}
        >
          {isMediaVideo(s.bgImage) ? (
            <video
              src={s.bgImage}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={s.bgImage}
              alt={s.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}

      {/* Ultra-Light Overlay Gradient for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-0" />

      {/* Slide Main Content — Bottom-Left Layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-10">
        <div className="max-w-xl text-left space-y-3 text-white">
          
          {/* Minimalist Badge with Spots Info */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/20 text-white text-[11px] font-semibold tracking-wider backdrop-blur-md shadow-md">
            {slide.badgeIcon}
            <span>{slide.badge}</span>
          </div>

          {/* Expedition Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-amber-200/90 tracking-wide mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{slide.subtitle}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed text-shadow max-w-lg opacity-90 line-clamp-2 sm:line-clamp-3">
            {slide.description}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleBookExpedition(slide)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-lg text-xs min-h-[40px] border border-white/90 cursor-pointer hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t('Reservar Cupo en esta Expedición', 'Book Spot on this Expedition')}</span>
            </button>

            <button
              onClick={() => onNavigate('/expediciones')}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900/80 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/20 text-xs min-h-[40px] backdrop-blur-sm cursor-pointer hover:text-amber-200"
            >
              <span>{t('Ver Calendario Completo', 'View Full Calendar')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Discrete Small Nautical Navigation Helm (Babor / Estribor) — Bottom Right */}
      <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
        
        {/* Babor */}
        <button
          onClick={handlePrev}
          aria-label="Navegar a Babor (Anterior)"
          className="flex items-center gap-1 text-[10px] font-bold text-slate-200 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3 text-slate-300" />
          <span className="hidden sm:inline tracking-wider uppercase">{t('Babor', 'Port')}</span>
        </button>

        <span className="text-white/20 text-[10px]">|</span>

        {/* Counter */}
        <div className="text-[10px] font-mono tracking-widest text-amber-300 font-bold px-1 uppercase">
          0{currentSlide + 1} / 0{slides.length}
        </div>

        <span className="text-white/20 text-[10px]">|</span>

        {/* Estribor */}
        <button
          onClick={handleNext}
          aria-label="Navegar a Estribor (Siguiente)"
          className="flex items-center gap-1 text-[10px] font-bold text-slate-200 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer"
        >
          <span className="hidden sm:inline tracking-wider uppercase">{t('Estribor', 'Starboard')}</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
        </button>

      </div>

      {/* Expedition Booking Modal */}
      <ExpeditionBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        expedition={selectedExpedition}
      />

    </section>
  );
};
