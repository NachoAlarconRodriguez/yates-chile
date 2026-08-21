import type { WeatherData } from '../types';

export interface WeatherLocationOption {
  id: string;
  name: string;
  nameEn: string;
  shortName: string;
  subtitle: string;
  subtitleEn: string;
  coordinatesName: string;
  lat: number;
  lon: number;
  fallback: WeatherData;
}

export const WEATHER_LOCATIONS: WeatherLocationOption[] = [
  {
    id: 'cabo-de-hornos',
    name: 'Cabo de Hornos',
    nameEn: 'Cape Horn',
    shortName: 'Cabo Hornos',
    subtitle: 'Canales Australes & Mar de Drake',
    subtitleEn: 'Austral Channels & Drake Passage',
    coordinatesName: '55°58\'S 67°16\'W',
    lat: -55.98,
    lon: -67.27,
    fallback: {
      temperature: 5,
      apparentTemperature: -2,
      condition: 'Chubascos Oceánicos',
      windSpeed: 28,
      windGusts: 42,
      windDirection: 'SO (SudOeste)',
      tideState: 'Pleamar',
      tideHeight: '2.3m',
      waveHeight: '3.4m',
      wavePeriod: '9.8s',
      moonPhase: 'Gibosa Creciente',
      moonIcon: '🌔',
      location: 'Canales Australes & Mar de Drake',
      coordinates: '55°58\'S 67°16\'W',
      isFallback: true,
    },
  },
  {
    id: 'robinson-crusoe',
    name: 'Robinson Crusoe',
    nameEn: 'Robinson Crusoe',
    shortName: 'Robinson',
    subtitle: 'Bahía Cumberland & Lodge',
    subtitleEn: 'Cumberland Bay & Lodge',
    coordinatesName: '33°38\'S 78°49\'W',
    lat: -33.636,
    lon: -78.831,
    fallback: {
      temperature: 14,
      apparentTemperature: 12,
      condition: 'Parcialmente Nublado',
      windSpeed: 12,
      windGusts: 18,
      windDirection: 'SO (SudOeste)',
      tideState: 'Pleamar',
      tideHeight: '1.6m',
      waveHeight: '1.5m',
      wavePeriod: '7.2s',
      moonPhase: 'Gibosa Creciente',
      moonIcon: '🌔',
      location: 'Bahía Cumberland & Lodge',
      coordinates: '33°38\'S 78°49\'W',
      isFallback: true,
    },
  },
  {
    id: 'alejandro-selkirk',
    name: 'Alejandro Selkirk',
    nameEn: 'Alejandro Selkirk',
    shortName: 'Selkirk',
    subtitle: 'Archipiélago Juan Fernández',
    subtitleEn: 'Juan Fernández Archipelago',
    coordinatesName: '33°45\'S 80°47\'W',
    lat: -33.758,
    lon: -80.789,
    fallback: {
      temperature: 11,
      apparentTemperature: 8,
      condition: 'Nublado Austral',
      windSpeed: 16,
      windGusts: 24,
      windDirection: 'S (Sur)',
      tideState: 'Bajamar',
      tideHeight: '0.9m',
      waveHeight: '2.1m',
      wavePeriod: '8.4s',
      moonPhase: 'Gibosa Creciente',
      moonIcon: '🌔',
      location: 'Archipiélago Juan Fernández',
      coordinates: '33°45\'S 80°47\'W',
      isFallback: true,
    },
  },
];

// Helper: Calculate Astronomical Moon Phase
export const getAstronomicalMoonPhase = (date = new Date(), lang: 'ES' | 'EN' = 'ES'): { name: string; icon: string } => {
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phaseCycle = 29.53058867;
  const currentPhase = ((diffDays % phaseCycle) + phaseCycle) % phaseCycle;
  const norm = currentPhase / phaseCycle;

  if (norm < 0.04 || norm > 0.96) {
    return { name: lang === 'EN' ? 'New Moon' : 'Luna Nueva', icon: '🌑' };
  }
  if (norm < 0.21) {
    return { name: lang === 'EN' ? 'Waxing Crescent' : 'Creciente', icon: '🌒' };
  }
  if (norm < 0.29) {
    return { name: lang === 'EN' ? 'First Quarter' : 'Cuarto Creciente', icon: '🌓' };
  }
  if (norm < 0.46) {
    return { name: lang === 'EN' ? 'Waxing Gibbous' : 'Gibosa Creciente', icon: '🌔' };
  }
  if (norm < 0.54) {
    return { name: lang === 'EN' ? 'Full Moon' : 'Luna Llena', icon: '🌕' };
  }
  if (norm < 0.71) {
    return { name: lang === 'EN' ? 'Waning Gibbous' : 'Gibosa Menguante', icon: '🌖' };
  }
  if (norm < 0.79) {
    return { name: lang === 'EN' ? 'Last Quarter' : 'Cuarto Menguante', icon: '🌗' };
  }
  return { name: lang === 'EN' ? 'Waning Crescent' : 'Menguante', icon: '🌘' };
};

// Helper: Wind cardinal translation
export const getWindDirectionLabel = (deg: number, lang: 'ES' | 'EN' = 'ES'): string => {
  const directionsES = ['N (Norte)', 'NNE', 'NE (NorEste)', 'ENE', 'E (Este)', 'ESE', 'SE (SurEste)', 'SSE', 'S (Sur)', 'SSO', 'SO (SudOeste)', 'OSO', 'O (Oeste)', 'ONO', 'NO (NorOeste)', 'NNO'];
  const directionsEN = ['N (North)', 'NNE', 'NE (NorthEast)', 'ENE', 'E (East)', 'ESE', 'SE (SouthEast)', 'SSE', 'S (South)', 'SSW', 'SW (SouthWest)', 'WSW', 'W (West)', 'WNW', 'NW (NorthWest)', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return (lang === 'EN' ? directionsEN : directionsES)[idx] || 'N';
};

// Helper: Weather Condition translation
export const getWeatherConditionLabel = (code: number, lang: 'ES' | 'EN' = 'ES'): string => {
  if (code === 0) return lang === 'EN' ? 'Clear Sky' : 'Cielo Despejado';
  if (code === 1) return lang === 'EN' ? 'Mainly Clear' : 'Mayormente Despejado';
  if (code === 2) return lang === 'EN' ? 'Partly Cloudy' : 'Parcialmente Nublado';
  if (code === 3) return lang === 'EN' ? 'Overcast' : 'Cubierto';
  if (code >= 45 && code <= 48) return lang === 'EN' ? 'Marine Fog' : 'Niebla Marina';
  if (code >= 51 && code <= 55) return lang === 'EN' ? 'Light Drizzle' : 'Llovizna Fina';
  if (code >= 61 && code <= 65) return lang === 'EN' ? 'Oceanic Rain' : 'Lluvia Oceánica';
  if (code >= 71 && code <= 77) return lang === 'EN' ? 'Snow' : 'Nieve';
  if (code >= 80 && code <= 82) return lang === 'EN' ? 'Rain Showers' : 'Chubascos';
  if (code >= 95) return lang === 'EN' ? 'Marine Storm' : 'Tormenta Marina';
  return 'Variable Austral';
};

// Helper: Semi-diurnal oceanic tide estimate
export const getTideEstimate = (date = new Date(), lat: number, lang: 'ES' | 'EN' = 'ES'): { state: string; height: string } => {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const cycleHours = 12.42;
  const offset = Math.abs(lat) * 0.1;
  const phase = ((hours + offset) % cycleHours) / cycleHours;
  const isHighTide = phase > 0.25 && phase < 0.75;
  const state = isHighTide ? (lang === 'EN' ? 'High Tide' : 'Pleamar') : (lang === 'EN' ? 'Low Tide' : 'Bajamar');
  const baseHeight = Math.abs(lat) > 50 ? 2.2 : 1.5;
  const variance = Math.sin(phase * Math.PI * 2) * (baseHeight * 0.35);
  const height = Math.max(0.6, baseHeight + variance).toFixed(1) + 'm';
  return { state, height };
};

// Global memory cache for weather by location ID
const weatherCache: Record<string, { data: WeatherData; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const weatherService = {
  async fetchLiveWeather(loc: WeatherLocationOption, lang: 'ES' | 'EN' = 'ES'): Promise<WeatherData> {
    const cached = weatherCache[loc.id];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kn&timezone=auto`;
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${loc.lat}&longitude=${loc.lon}&current=wave_height,wave_period`;

      const [weatherRes, marineRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(marineUrl).catch(() => null),
      ]);

      if (!weatherRes.ok) throw new Error('Weather API error');
      const weatherJson = await weatherRes.json();
      const marineJson = marineRes && marineRes.ok ? await marineRes.json() : null;

      const current = weatherJson.current;
      const marineCurrent = marineJson?.current;

      const tide = getTideEstimate(new Date(), loc.lat, lang);
      const moon = getAstronomicalMoonPhase(new Date(), lang);

      const liveData: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: current.apparent_temperature ? Math.round(current.apparent_temperature) : undefined,
        condition: getWeatherConditionLabel(current.weather_code, lang),
        windSpeed: Math.round(current.wind_speed_10m),
        windGusts: current.wind_gusts_10m ? Math.round(current.wind_gusts_10m) : undefined,
        windDirection: getWindDirectionLabel(current.wind_direction_10m, lang),
        tideState: tide.state,
        tideHeight: tide.height,
        waveHeight: marineCurrent?.wave_height ? `${marineCurrent.wave_height.toFixed(1)}m` : loc.fallback.waveHeight,
        wavePeriod: marineCurrent?.wave_period ? `${marineCurrent.wave_period.toFixed(1)}s` : loc.fallback.wavePeriod,
        moonPhase: moon.name,
        moonIcon: moon.icon,
        location: lang === 'EN' ? loc.subtitleEn : loc.subtitle,
        coordinates: loc.coordinatesName,
        isFallback: false,
      };

      weatherCache[loc.id] = { data: liveData, timestamp: Date.now() };
      return liveData;
    } catch {
      return loc.fallback;
    }
  },
};
