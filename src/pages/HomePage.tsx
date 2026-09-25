import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { HeroCarousel } from '../components/modules/HeroCarousel';
import { ExpeditionCalendar } from '../components/modules/ExpeditionCalendar';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';
import { translationService } from '../services/translationService';
import { useFleet } from '../hooks/useFleet';
import { getVesselPath, getVesselSlug } from '../services/fleetService';
import { normalizeExternalMediaUrl } from '../services/cmsService';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { getSection } = useSiteContent();
  const { language, t } = useLanguage();
  const { activeVessels } = useFleet();
  const isEn = language === 'EN';

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, activeVessels]);

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      const step = card ? card.offsetWidth + 20 : 380;
      carouselRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      const step = card ? card.offsetWidth + 20 : 380;
      carouselRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const otherActiveVessels = useMemo(() => {
    return activeVessels.filter((v) => {
      const id = v.id.toLowerCase();
      const name = (v.name || '').toLowerCase();
      return id !== 'vegvisir' && id !== 'terranova' && !name.includes('vegvisir') && !name.includes('terranova');
    });
  }, [activeVessels]);

  const introSection = getSection('home_intro');
  const vegvisirSec = getSection('flota_vegvisir');
  const terranovaSec = getSection('flota_terranova');
  const lodgeSec = getSection('lodge_info');

  const defaultIntroTitle = otherActiveVessels.length > 0 
    ? 'Nuestras Formas de Vivir la Aventura Austral' 
    : 'Tres Formas de Vivir la Aventura Austral';

  const introSubtitle = isEn && (introSection as any)?.subtitle_en ? (introSection as any).subtitle_en : (isEn && introSection?.subtitle ? translationService.fallbackTranslate(introSection.subtitle, 'EN') : (introSection?.subtitle || 'AVENTURA EN TERRITORIOS INEXPLORADOS & PRÍSTINOS'));
  const introTitle = isEn && (introSection as any)?.title_en ? (introSection as any).title_en : (isEn && introSection?.title ? translationService.fallbackTranslate(introSection.title, 'EN') : (introSection?.title || defaultIntroTitle));
  const introBody = isEn && (introSection as any)?.body_text_en ? (introSection as any).body_text_en : (isEn && introSection?.body_text ? translationService.fallbackTranslate(introSection.body_text, 'EN') : (introSection?.body_text || 'Explora el Archipiélago Juan Fernández, Isla Alejandro Selkirk y los fiordos del Cabo de Hornos a través de nuestras tres experiencias exclusivas.'));

  const vegvisirTitle = isEn && (vegvisirSec as any)?.title_en ? (vegvisirSec as any).title_en : (isEn && vegvisirSec?.title ? translationService.fallbackTranslate(vegvisirSec.title, 'EN') : (vegvisirSec?.title ? vegvisirSec.title.replace(/Vegvisiri/gi, 'Vegvisir').split('(')[0].trim() : 'Velero Vegvisir'));
  const vegvisirBody = isEn && (vegvisirSec as any)?.body_text_en ? (vegvisirSec as any).body_text_en : (isEn && vegvisirSec?.body_text ? translationService.fallbackTranslate(vegvisirSec.body_text, 'EN') : (vegvisirSec?.body_text || 'Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total.'));

  const terranovaTitle = isEn && (terranovaSec as any)?.title_en ? (terranovaSec as any).title_en : (isEn && terranovaSec?.title ? translationService.fallbackTranslate(terranovaSec.title, 'EN') : (terranovaSec?.title ? terranovaSec.title.split('(')[0].trim() : 'Yate Terranova'));
  const terranovaBody = isEn && (terranovaSec as any)?.body_text_en ? (terranovaSec as any).body_text_en : (isEn && terranovaSec?.body_text ? translationService.fallbackTranslate(terranovaSec.body_text, 'EN') : (terranovaSec?.body_text || 'Yate Hatteras 65ft LRC americano de 3 cubiertas (20 PAX • 5 cabinas • 5 baños) con 3.000 MN de autonomía y Starlink 24/7.'));

  const lodgeTitle = isEn && (lodgeSec as any)?.title_en ? (lodgeSec as any).title_en : (isEn && lodgeSec?.title ? translationService.fallbackTranslate(lodgeSec.title, 'EN') : (lodgeSec?.title || 'Lodge Rincón de Navegantes'));
  const lodgeBody = isEn && (lodgeSec as any)?.body_text_en ? (lodgeSec as any).body_text_en : (isEn && lodgeSec?.body_text ? translationService.fallbackTranslate(lodgeSec.body_text, 'EN') : (lodgeSec?.body_text || 'Lodge frente al mar en Uberlindo Andaur 222 (11 PAX • 4 cabinas con baño privado), amplio quincho, terraza y exploraciones en Robinson Crusoe.'));

  return (
    <div className="space-y-0">
      
      {/* HERO CAROUSEL SECTION */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* EXPERIENCIAS: FLOTA & LODGE (CARRUSEL INMERSIVO CON FLECHAS DE NAVEGACIÓN) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header con Título y Subtítulo */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-slate-600 font-bold text-xs uppercase tracking-widest bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300 inline-block">
              {introSubtitle}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
              {introTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {introBody}
            </p>
          </div>

          {/* Wrapper Relativo con Flechas de Navegación Laterales Flotantes */}
          <div className="relative group/carousel">
            
            {/* Flecha Lateral Izquierda Flotante */}
            <button
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Deslizar a la izquierda"
              className={`absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 hover:bg-white text-slate-900 border border-slate-200 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
                !canScrollLeft
                  ? 'opacity-30 cursor-not-allowed scale-90'
                  : 'opacity-95 hover:opacity-100 hover:scale-110 active:scale-95 shadow-slate-950/25 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 -translate-x-0.5 text-slate-900" />
            </button>

            {/* Flecha Lateral Derecha Flotante */}
            <button
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Deslizar a la derecha"
              className={`absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 hover:bg-white text-slate-900 border border-slate-200 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
                !canScrollRight
                  ? 'opacity-30 cursor-not-allowed scale-90'
                  : 'opacity-95 hover:opacity-100 hover:scale-110 active:scale-95 shadow-slate-950/25 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 text-slate-900" />
            </button>

            {/* Carrusel en Una Sola Fila */}
            <div
              ref={carouselRef}
              className="flex items-stretch gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 -mx-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            
            {/* Card 1: Velero Vegvisir */}
            <div
              onClick={() => onNavigate('/velero-vegvisir')}
              className="shrink-0 w-[85vw] sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] snap-start group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[460px] flex flex-col justify-end px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
            >
              <img
                src={vegvisirSec.media_url && !vegvisirSec.media_url.includes('images.unsplash.com') ? vegvisirSec.media_url : "/velero-vegvisir.jpg"}
                alt="Velero Vegvisir"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              
              <div className="relative z-10 h-[140px] flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-stone-200 transition-colors w-fit">
                    <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-200 after:transition-all after:duration-500 group-hover:after:w-full">
                      {vegvisirTitle}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {vegvisirBody}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>{t('Explorar Velero', 'Explore Sailboat')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </div>
            </div>

            {/* Card 2: Yate Terranova */}
            <div
              onClick={() => onNavigate('/yate-terranova')}
              className="shrink-0 w-[85vw] sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] snap-start group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[460px] flex flex-col justify-end px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
            >
              <img
                src={terranovaSec.media_url && !terranovaSec.media_url.includes('images.unsplash.com') ? terranovaSec.media_url : "/yate-terranova.jpg"}
                alt="Yate Terranova"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              
              <div className="relative z-10 h-[140px] flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-stone-200 transition-colors w-fit">
                    <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-200 after:transition-all after:duration-500 group-hover:after:w-full">
                      {terranovaTitle}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {terranovaBody}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>{t('Explorar Yate', 'Explore Yacht')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </div>
            </div>

            {/* Cards dinámicas para otras embarcaciones activas (ej: Velero Punta Sur) */}
            {otherActiveVessels.map((vessel) => {
              const vSec = getSection(`flota_${vessel.id}`) || getSection(`flota_${getVesselSlug(vessel)}`);
              const vTitle = isEn && (vSec as any)?.title_en ? (vSec as any).title_en : (isEn && vSec?.title ? translationService.fallbackTranslate(vSec.title, 'EN') : (vSec?.title || vessel.name));
              const vBody = isEn && (vSec as any)?.body_text_en ? (vSec as any).body_text_en : (isEn && vSec?.body_text ? translationService.fallbackTranslate(vSec.body_text, 'EN') : (vSec?.body_text || vessel.description || vessel.tagline || ''));
              const vImg = normalizeExternalMediaUrl(vSec?.media_url && !vSec.media_url.includes('images.unsplash.com') ? vSec.media_url : (vessel.mainImage || '/velero-vegvisir.jpg'));
              const vType = vessel.type?.toLowerCase().includes('velero') ? t('Explorar Velero', 'Explore Sailboat') : t('Explorar Embarcación', 'Explore Vessel');

              return (
                <div
                  key={vessel.id}
                  onClick={() => onNavigate(getVesselPath(vessel))}
                  className="shrink-0 w-[85vw] sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] snap-start group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[460px] flex flex-col justify-end px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
                >
                  <img
                    src={vImg}
                    alt={vessel.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  
                  <div className="relative z-10 h-[140px] flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-stone-200 transition-colors w-fit">
                        <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-200 after:transition-all after:duration-500 group-hover:after:w-full">
                          {vTitle}
                        </span>
                      </h3>
                      <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                        {vBody}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                      <span>{vType}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card: Lodge Rincón de Navegantes */}
            <div
              onClick={() => onNavigate('/lodge')}
              className="shrink-0 w-[85vw] sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] snap-start group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[460px] flex flex-col justify-end px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
            >
              <img
                src={lodgeSec.media_url && !lodgeSec.media_url.includes('images.unsplash.com') ? lodgeSec.media_url : "/rincon-de-navegantes.jpg"}
                alt="Lodge Rincón de Navegantes"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              
              <div className="relative z-10 h-[140px] flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-stone-200 transition-colors w-fit">
                    <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-200 after:transition-all after:duration-500 group-hover:after:w-full">
                      {lodgeTitle}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {lodgeBody}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>{t('Conocer el Lodge', 'Explore the Lodge')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>

      {/* EXPEDITION CALENDAR MODULE */}
      <ExpeditionCalendar />

    </div>
  );
};
