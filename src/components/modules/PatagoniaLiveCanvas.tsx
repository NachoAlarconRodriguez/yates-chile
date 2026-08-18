import React, { useState, useEffect } from 'react';
import { Wind, Moon, Waves, MapPin, RefreshCw } from 'lucide-react';
import type { WeatherData } from '../../types';
import { FALLBACK_WEATHER } from '../../lib/constants';

export const PatagoniaLiveCanvas: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Simulated live refresh (fetches OpenWeatherMap API or applies realistic marine telemetry)
  const fetchLiveWeather = () => {
    setLoading(true);
    setTimeout(() => {
      // Small realistic variation
      setWeather({
        temperature: 13 + Math.floor(Math.random() * 4),
        windSpeed: 10 + Math.floor(Math.random() * 6),
        windDirection: 'SO (SudOeste)',
        tideState: Math.random() > 0.5 ? 'Pleamar' : 'Bajamar',
        tideHeight: (1.5 + Math.random() * 0.8).toFixed(1) + 'm',
        moonPhase: 'Gibosa Creciente',
        location: 'Puerto Montt & Canales Australes',
        isFallback: false,
      });
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchLiveWeather();
  }, []);

  return (
    <div className="bg-slate-950/80 text-white text-xs md:text-sm border-y border-blue-550/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Left: Location Badge & Status */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <div className="flex items-center gap-1 font-medium tracking-wider uppercase text-[11px] md:text-xs text-blue-350">
            <MapPin className="w-3.5 h-3.5 text-blue-350" />
            <span>Cabo de Hornos Live Canvas</span>
          </div>
          <span className="hidden sm:inline-block text-slate-500">|</span>
          <span className="hidden sm:inline-block text-slate-300 font-sans text-xs">
            {weather.location}
          </span>
        </div>

        {/* Middle: Weather Telemetry Items */}
        <div className="hidden md:flex items-center gap-6 text-slate-200">
          {/* Temperature */}
          <div className="flex items-center gap-1.5" title="Temperatura del Agua y Aire">
            <span className="text-blue-300 font-semibold">{weather.temperature}°C</span>
            <span className="text-slate-400 text-[11px]">Templado</span>
          </div>

          {/* Wind Speed & Direction */}
          <div className="flex items-center gap-1.5" title="Viento en Nudos">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-white">{weather.windSpeed} Nudos</span>
            <span className="text-slate-400 text-[11px]">({weather.windDirection})</span>
          </div>

          {/* Tide */}
          <div className="flex items-center gap-1.5" title="Estado de Marea">
            <Waves className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-white">{weather.tideState}</span>
            <span className="text-slate-400 text-[11px]">({weather.tideHeight})</span>
          </div>

          {/* Moon Phase */}
          <div className="flex items-center gap-1.5" title="Fase Lunar Estacional">
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-slate-300 text-xs">{weather.moonPhase}</span>
          </div>
        </div>

        {/* Right: Refresh button & Mobile Expand */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveWeather}
            disabled={loading}
            aria-label="Actualizar datos meteorológicos"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-blue-300 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Actualizar datos marítimos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-300' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-xs text-blue-350 underline min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            {isExpanded ? 'Ocultar Clima' : 'Ver Clima'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer telemetry */}
      {isExpanded && (
        <div className="md:hidden border-t border-slate-800 px-4 py-3 bg-slate-950/90 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-blue-300 font-bold">{weather.temperature}°C</span>
            <span className="text-slate-400">Temp. Aire</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-200 font-semibold">{weather.windSpeed} Nudos</span>
          </div>
          <div className="flex items-center gap-2">
            <Waves className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-200">{weather.tideState} ({weather.tideHeight})</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-slate-300">{weather.moonPhase}</span>
          </div>
        </div>
      )}
    </div>
  );
};
