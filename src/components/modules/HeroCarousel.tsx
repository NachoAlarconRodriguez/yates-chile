import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Compass, ArrowRight, FileText } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../../context/LanguageContext';
import {
  isMediaVideo,
  getMediaFallbackUrl,
  normalizeExternalMediaUrl,
  DEFAULT_CMS_CONTENT,
  type HeroBannerConfig,
} from '../../services/cmsService';

interface HeroCarouselProps {
  onNavigate: (path: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { getSection } = useSiteContent();
  const { language, t } = useLanguage();
  const isEn = language === 'EN';

  const bannersSection = getSection('home_hero_banners');

  const slides: HeroBannerConfig[] = useMemo(() => {
    const rawBanners =
      (bannersSection?.metadata as any)?.banners ||
      (DEFAULT_CMS_CONTENT['home_hero_banners']?.metadata as any)?.banners;

    if (Array.isArray(rawBanners) && rawBanners.length > 0) {
      return rawBanners.slice(0, 3);
    }
    return (DEFAULT_CMS_CONTENT['home_hero_banners']?.metadata as any)?.banners || [];
  }, [bannersSection]);

  // Reset currentSlide if out of bounds
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Auto-advance slide every 7 seconds (resets on slide change, pauses on hover)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger if horizontal movement is dominant and exceeds threshold
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (slides.length === 0) return null;

  const currentBanner = slides[currentSlide] || slides[0];

  const bannerTitle = isEn && currentBanner.title_en ? currentBanner.title_en : currentBanner.title;
  const bannerSubtitle = isEn && currentBanner.subtitle_en ? currentBanner.subtitle_en : currentBanner.subtitle;
  const bannerDescription = isEn && currentBanner.description_en ? currentBanner.description_en : currentBanner.description;

  const handleDownloadBrochure = () => {
    if (currentBanner.brochure_url && currentBanner.brochure_url.trim() !== '') {
      const url = normalizeExternalMediaUrl(currentBanner.brochure_url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const msg = encodeURIComponent(
        `Hola Concierge Yates Chile, quisiera solicitar el brochure/dossier en PDF para la expedición "${bannerTitle}".`
      );
      window.open(`https://wa.me/56981312920?text=${msg}`, '_blank');
    }
  };

  const handleViewDates = () => {
    const typeParam = currentBanner.expedition_type || 'ruta-juan-fernandez';
    onNavigate(`/expediciones?tipo=${typeParam}`);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[500px] sm:h-[520px] flex items-end justify-start bg-slate-950 text-white overflow-hidden border-b border-slate-800 touch-pan-y select-none"
    >
      
      {/* Background Images / Videos with Fade Transition */}
      {slides.map((s, idx) => {
        const mediaUrl = normalizeExternalMediaUrl(s.media_url);
        const isVideo = isMediaVideo(s.media_url);

        return (
          <div
            key={s.id || `banner-${idx}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-85 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            {isVideo ? (
              <video
                src={mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaUrl || '/travesia-robinson.jpg'}
                alt={s.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getMediaFallbackUrl(s.media_url) || '/travesia-robinson.jpg';
                }}
              />
            )}
          </div>
        );
      })}

      {/* Ultra-Light Overlay Gradient for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-0" />

      {/* Slide Main Content — Bottom-Left Layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-10">
        <div className="max-w-xl text-left space-y-3 text-white">
          
          {/* Eyebrow / Categoría */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/20 text-white text-[11px] font-semibold tracking-wider backdrop-blur-md shadow-md">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="uppercase">{bannerSubtitle || 'AVENTURA OCEÁNICA'}</span>
          </div>

          {/* Expedition Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {bannerTitle}
            </h1>
          </div>

          {/* Description */}
          <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed text-shadow max-w-lg opacity-90 line-clamp-2 sm:line-clamp-3">
            {bannerDescription}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2.5 sm:gap-3 flex-wrap pb-10 sm:pb-0">
            {/* CTA 1: Descargar Brochure (PDF) */}
            <button
              onClick={handleDownloadBrochure}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg text-xs min-h-[46px] border border-white/90 cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-slate-900" />
              <span>{t('Descargar Brochure (PDF)', 'Download Brochure (PDF)')}</span>
            </button>

            {/* CTA 2: Ver Fechas & Salidas Filtradas */}
            <button
              onClick={handleViewDates}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900/80 hover:bg-slate-900 text-white font-semibold px-4 py-3 rounded-xl transition-all border border-white/20 text-xs min-h-[46px] backdrop-blur-sm cursor-pointer hover:text-amber-200 active:scale-95"
            >
              <span>{t('Ver Fechas & Salidas', 'View Dates & Departures')}</span>
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

    </section>
  );
};
