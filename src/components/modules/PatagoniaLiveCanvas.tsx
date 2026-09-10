import React, { useState, useEffect, useCallback } from 'react';
import { Wind, Waves, MapPin, RefreshCw, Compass, Thermometer } from 'lucide-react';
import type { WeatherData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { WEATHER_LOCATIONS, weatherService, type WeatherLocationOption } from '../../services/weatherService';

export const PatagoniaLiveCanvas: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = (language === 'EN' ? 'EN' : 'ES') as 'ES' | 'EN';

  const [selectedLocationId, setSelectedLocationId] = useState<string>('robinson-crusoe');
  const [weatherCache, setWeatherCache] = useState<Record<string, WeatherData>>(() => {
    const initial: Record<string, WeatherData> = {};
    WEATHER_LOCATIONS.forEach((loc) => {
      initial[loc.id] = loc.fallback;
    });
    return initial;
  });
  const [loading, setLoading] = useState<boolean>(false);

  const selectedLoc = WEATHER_LOCATIONS.find((l) => l.id === selectedLocationId) || WEATHER_LOCATIONS[0];
  const currentWeather = weatherCache[selectedLocationId] || selectedLoc.fallback;

  const fetchLiveWeatherForLocation = useCallback(
    async (loc: WeatherLocationOption) => {
      setLoading(true);
      try {
        const liveData = await weatherService.fetchLiveWeather(loc, lang);
        setWeatherCache((prev) => ({
          ...prev,
          [loc.id]: liveData,
        }));
      } catch (err) {
        console.warn(`Could not fetch live marine weather for ${loc.name}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  // Fetch when location changes or component mounts
  useEffect(() => {
    fetchLiveWeatherForLocation(selectedLoc);
  }, [selectedLoc, fetchLiveWeatherForLocation]);

  // Pre-fetch all locations on mount
  useEffect(() => {
    WEATHER_LOCATIONS.forEach((loc) => {
      fetchLiveWeatherForLocation(loc);
    });
  }, [fetchLiveWeatherForLocation]);

  // Auto-rotate destinations every 5 seconds for visual dynamism
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const rotateTimer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setSelectedLocationId((prevId) => {
          const currentIndex = WEATHER_LOCATIONS.findIndex((l) => l.id === prevId);
          const nextIndex = (currentIndex + 1) % WEATHER_LOCATIONS.length;
          return WEATHER_LOCATIONS[nextIndex].id;
        });
        setIsFading(false);
      }, 250);
    }, 5000);

    return () => clearInterval(rotateTimer);
  }, [isPaused]);

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-slate-950/95 text-white text-xs border-y border-slate-800/80 backdrop-blur-md transition-all overflow-x-auto select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3 xl:gap-6 flex-nowrap whitespace-nowrap min-w-max">
        
        {/* Left Side: Location Pills */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Location Selector Pills (Circular / Rounded-Full design) */}
          <div className="inline-flex items-center p-0.5 bg-slate-900/90 rounded-full border border-white/10 shadow-inner shrink-0 gap-0.5">
            {WEATHER_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedLocationId;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${loc.name} (${loc.coordinatesName})`}
                >
                  <MapPin className={`w-2.5 h-2.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{lang === 'EN' ? loc.nameEn : loc.name}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden 2xl:inline-block text-slate-700">|</span>
          <span className={`hidden 2xl:inline-block text-slate-400 text-[11px] font-mono shrink-0 transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            {lang === 'EN' ? selectedLoc.subtitleEn : selectedLoc.subtitle}
          </span>
        </div>

        {/* Center: Live Weather Telemetry Data (All in 1 Line) */}
        <div className={`flex items-center gap-3.5 sm:gap-4.5 xl:gap-5 text-slate-200 text-xs shrink-0 font-mono transition-all duration-300 ${isFading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          
          {/* Temperature & Condition */}
          <div className="flex items-center gap-1.5 shrink-0" title={t('Temperatura del aire y sensación', 'Air temperature and wind chill')}>
            <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-white font-bold text-xs">{currentWeather.temperature}°C</span>
            {currentWeather.apparentTemperature !== undefined && (
              <span className="text-slate-400 text-[10px]">
                (ST {currentWeather.apparentTemperature}°C)
              </span>
            )}
            <span className="text-blue-300 font-medium text-[10px] bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40 shrink-0">
              {currentWeather.condition || 'Templado'}
            </span>
          </div>

          {/* Wind Speed & Direction */}
          <div className="flex items-center gap-1.5 shrink-0" title={t('Viento en Nudos y Dirección', 'Wind in knots and direction')}>
            <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold text-white text-xs">{currentWeather.windSpeed} kts</span>
            <span className="text-slate-300 text-[10px]">({currentWeather.windDirection})</span>
            {currentWeather.windGusts && (
              <span className="text-amber-300 text-[10px]" title={t('Ráfaga máxima', 'Max gust')}>
                +{currentWeather.windGusts}kts
              </span>
            )}
          </div>

          {/* Marine Waves / Sea State */}
          {currentWeather.waveHeight && (
            <div className="flex items-center gap-1.5 shrink-0" title={t('Oleaje y Período Marino', 'Wave height and period')}>
              <Waves className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="font-semibold text-white text-xs">{currentWeather.waveHeight}</span>
              {currentWeather.wavePeriod && (
                <span className="text-slate-400 text-[10px]">({currentWeather.wavePeriod})</span>
              )}
            </div>
          )}

          {/* Tide */}
          <div className="flex items-center gap-1.5 shrink-0" title={t('Estado de Marea Estimado', 'Estimated Tide State')}>
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white text-xs">{currentWeather.tideState}</span>
            <span className="text-slate-400 text-[10px]">({currentWeather.tideHeight})</span>
          </div>

          {/* Moon Phase */}
          <div className="flex items-center gap-1.5 shrink-0" title={t('Fase Lunar Astronómica', 'Astronomical Moon Phase')}>
            <span className="text-xs">{currentWeather.moonIcon || '🌔'}</span>
            <span className="text-slate-300 text-[11px]">{currentWeather.moonPhase}</span>
          </div>
        </div>

        {/* Right Side: Refresh button (Circular) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchLiveWeatherForLocation(selectedLoc)}
            disabled={loading}
            aria-label={t('Actualizar telemetría meteorológica', 'Refresh weather telemetry')}
            className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition flex items-center justify-center cursor-pointer min-h-[30px] min-w-[30px] shadow-sm"
            title={t('Actualizar datos en vivo', 'Refresh live data')}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
};
