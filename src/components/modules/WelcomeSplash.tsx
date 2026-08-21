import React, { useState, useEffect } from 'react';
import { ArrowRight, Wind, Waves, MapPin, Anchor, Ship, Home } from 'lucide-react';
import { WEATHER_LOCATIONS, weatherService, type WeatherLocationOption } from '../../services/weatherService';
import type { WeatherData } from '../../types';

interface WelcomeSplashProps {
  onEnterSite: (targetPath?: string) => void;
  onVideoLoaded?: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnterSite, onVideoLoaded }) => {
  // Direct raw video streaming URL converted from Dropbox link
  const videoUrl =
    'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/ALRTDepuSRu5og3r8hMrXqs/Videos/GX010369.MOV?rlkey=dydsj8rbegl4ga5x2062vycj6&st=eewane53&raw=1';

  // Rotating location index: 0 = Cabo de Hornos, 1 = Robinson Crusoe, 2 = Alejandro Selkirk
  const [currentLocIndex, setCurrentLocIndex] = useState<number>(0);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>(() => {
    const init: Record<string, WeatherData> = {};
    WEATHER_LOCATIONS.forEach((l) => {
      init[l.id] = l.fallback;
    });
    return init;
  });
  const [isFading, setIsFading] = useState<boolean>(false);

  // Fetch real-time live weather data for all 3 destinations
  useEffect(() => {
    let isMounted = true;
    const loadAllWeather = async () => {
      for (const loc of WEATHER_LOCATIONS) {
        try {
          const live = await weatherService.fetchLiveWeather(loc, 'ES');
          if (isMounted) {
            setWeatherMap((prev) => ({ ...prev, [loc.id]: live }));
          }
        } catch (_) {}
      }
    };

    loadAllWeather();
    const refreshInterval = setInterval(loadAllWeather, 5 * 60 * 1000); // 5 min background refresh

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // Rotate between Cabo de Hornos -> Robinson Crusoe -> Alejandro Selkirk every 15 seconds
  useEffect(() => {
    const rotateTimer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentLocIndex((prev) => (prev + 1) % WEATHER_LOCATIONS.length);
        setIsFading(false);
      }, 350);
    }, 15000);

    return () => clearInterval(rotateTimer);
  }, []);

  const activeLocation: WeatherLocationOption = WEATHER_LOCATIONS[currentLocIndex] || WEATHER_LOCATIONS[0];
  const activeWeather: WeatherData = weatherMap[activeLocation.id] || activeLocation.fallback;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden">
      
      {/* 100vh Fullscreen Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={onVideoLoaded}
          className="w-full h-full object-cover scale-100"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/quicktime" />
        </video>
        
        {/* Discrete Bottom Gradient for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/40" />
      </div>

      {/* Top Header — Minimalist & Discrete White Emblem Logo */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        
        {/* Small Transparent Emblem Logo */}
        <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity">
          <img
            src="/vegvisir-emblem-white.png"
            alt="Logo Vegvisir Emblem"
            className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-white tracking-widest uppercase">
              Yates Chile
            </span>
            <span className="text-[9px] text-slate-300 tracking-wider uppercase font-light">
              Sailing & Lodge
            </span>
          </div>
        </div>

        {/* Top-Right: Rotating Live Telemetry Capsule (Cabo de Hornos -> Robinson Crusoe -> Alejandro Selkirk every 15s) */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-3.5 bg-slate-950/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs text-white shadow-2xl transition-all duration-350 select-none ${
              isFading ? 'opacity-0 scale-95 translate-y-[-2px]' : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            {/* Active Destination */}
            <div className="flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-[11px] text-white tracking-wide">
                {activeLocation.name}
              </span>
            </div>

            <span className="text-white/25">|</span>

            {/* Live Wind */}
            <div className="flex items-center gap-1.5 shrink-0" title={`Viento: ${activeWeather.windSpeed} Nudos ${activeWeather.windDirection}`}>
              <Wind className="w-3.5 h-3.5 text-sky-300" />
              <span className="font-medium text-slate-200">
                {activeWeather.windSpeed} Nudos ({activeWeather.windDirection})
              </span>
            </div>

            <span className="text-white/25">|</span>

            {/* Live Tide */}
            <div className="flex items-center gap-1.5 shrink-0" title={`Marea: ${activeWeather.tideState} (${activeWeather.tideHeight})`}>
              <Waves className="w-3.5 h-3.5 text-teal-300" />
              <span className="font-medium text-slate-200">
                {activeWeather.tideState} ({activeWeather.tideHeight})
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Main Grid: Left Title/CTA + Right 3 Subtle Luxury Options */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        
        {/* Bottom-Left Content Container */}
        <div className="max-w-xl text-left space-y-2.5 text-white">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-snug drop-shadow-xl">
            <span className="block font-bold">Donde la cartografía termina,</span>
            <span className="block italic font-serif font-normal text-slate-200">comienza tu expedición.</span>
          </h1>

          <p className="text-slate-200 text-[11px] sm:text-xs font-normal leading-relaxed text-shadow max-w-lg opacity-95">
            Expediciones marítimas privadas a bordo del velero <strong className="text-white font-semibold">Vegvisir</strong> y el yate <strong className="text-white font-semibold">Terranova</strong> hacia el Archipiélago Juan Fernández, Isla Alejandro Selkirk y Cabo de Hornos.
          </p>

          <div className="pt-1">
            <button
            onClick={() => onEnterSite('/')}
            className="group inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-2xl hover:scale-105 text-xs border border-white/90 min-h-[44px]"
          >
            <span>Revisa nuestras expediciones</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
          </div>
        </div>

        {/* Bottom-Right: 3 Subtle Luxury Quick Options */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-slate-950/60 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl shrink-0">
          
          {/* Option 1: Vegvisir */}
          <button
            onClick={() => onEnterSite('/velero-vegvisir')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-blue-300/60 transition-all text-xs font-semibold backdrop-blur-md group min-h-[42px]"
          >
            <Anchor className="w-3.5 h-3.5 text-blue-300 group-hover:scale-110 transition-transform" />
            <span>Velero Vegvisir</span>
          </button>

          {/* Option 2: Terranova */}
          <button
            onClick={() => onEnterSite('/yate-terranova')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-sky-300/60 transition-all text-xs font-semibold backdrop-blur-md group min-h-[42px]"
          >
            <Ship className="w-3.5 h-3.5 text-sky-300 group-hover:scale-110 transition-transform" />
            <span>Yate Terranova</span>
          </button>

          {/* Option 3: El Lodge */}
          <button
            onClick={() => onEnterSite('/lodge')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-emerald-300/60 transition-all text-xs font-semibold backdrop-blur-md group min-h-[42px]"
          >
            <Home className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition-transform" />
            <span>El Lodge</span>
          </button>

        </div>

      </div>

    </div>
  );
};
