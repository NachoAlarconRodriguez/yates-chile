import React from 'react';
import { HeroCarousel } from '../components/modules/HeroCarousel';
import { ExpeditionCalendar } from '../components/modules/ExpeditionCalendar';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { getSection } = useSiteContent();
  const introSection = getSection('home_intro');
  const vegvisirSec = getSection('flota_vegvisir');
  const terranovaSec = getSection('flota_terranova');
  const lodgeSec = getSection('lodge_info');

  return (
    <div className="space-y-0">
      
      {/* HERO CAROUSEL SECTION */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* GRID INMERSIVO: 3 CARDS (VEGVISIR, TERRANOVA & LODGE) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-slate-600 font-bold text-xs uppercase tracking-widest bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300">
              {introSection.subtitle || 'AVENTURA EN TERRITORIOS INEXPLORADOS & PRÍSTINOS'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
              {introSection.title || 'Tres Formas de Vivir la Aventura Austral'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {introSection.body_text || 'Explora el Archipiélago Juan Fernández, Isla Alejandro Selkirk y los fiordos del Cabo de Hornos a través de nuestras tres experiencias exclusivas.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Velero Vegvisir */}
            <div
              onClick={() => onNavigate('/velero-vegvisir')}
              className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
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
                      {vegvisirSec.title ? vegvisirSec.title.split('(')[0].trim() : 'Velero Vegvisir'}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {vegvisirSec.body_text || 'Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>Explorar Velero</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </div>
            </div>

            {/* Card 2: Yate Terranova */}
            <div
              onClick={() => onNavigate('/yate-terranova')}
              className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
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
                      {terranovaSec.title ? terranovaSec.title.split('(')[0].trim() : 'Yate Terranova'}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {terranovaSec.body_text || 'Yate Hatteras 65ft LRC americano de 3 cubiertas (20 PAX • 5 cabinas • 5 baños) con 3.000 MN de autonomía y Starlink 24/7.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>Explorar Yate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </div>
            </div>

            {/* Card 3: Lodge Rincón de Navegantes */}
            <div
              onClick={() => onNavigate('/lodge')}
              className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 cursor-pointer min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1"
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
                      {lodgeSec.title || 'Lodge Rincón de Navegantes'}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3">
                    {lodgeSec.body_text || 'Lodge frente al mar en Uberlindo Andaur 222 (11 PAX • 4 cabinas con baño privado), amplio quincho, terraza y exploraciones en Robinson Crusoe.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>Conocer el Lodge</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
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
