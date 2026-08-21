export interface WeatherData {
  temperature: number; // in Celsius
  apparentTemperature?: number;
  condition?: string;
  windSpeed: number;   // in Knots
  windGusts?: number;  // in Knots
  windDirection: string; // e.g. "SSW"
  tideState: 'Pleamar' | 'Bajamar' | string;
  tideHeight: string;  // e.g. "1.8m"
  waveHeight?: string; // e.g. "1.5m"
  wavePeriod?: string; // e.g. "6.9s"
  moonPhase: string;   // e.g. "Gibosa Creciente"
  moonIcon?: string;
  location: string;    // e.g. "Bahía Cumberland & Lodge"
  coordinates?: string;
  isFallback?: boolean;
  updatedAt?: string;
}

export interface VesselHotspot {
  id: string;
  title: string;
  description: string;
  coordinates: { x: number; y: number; z: number };
  category: 'Camarote' | 'Cubierta' | 'Puente de Mando' | 'Gastronomía';
  image?: string;
}

export interface Vessel {
  id: 'vegvisir' | 'terranova';
  name: string;
  type: string;
  tagline: string;
  description: string;
  length: string;
  capacity: string;
  cabins?: string;
  bathrooms?: string;
  registration?: string;
  builder?: string;
  crew: string;
  features: string[];
  mainImage: string;
  hotspots: VesselHotspot[];
  badge?: string;
  specs?: Record<string, string>;
}

export interface FaunaSpot {
  id: string;
  name: string;
  scientificName: string;
  months: number[]; // 1 to 12
  locationName: string;
  coordinatesName: string;
  description: string;
  image: string;
  bestViewTime: string;
}

export interface ExpeditionRoute {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  highlights: string[];
  description: string;
  mapImage: string;
  recommendedVessel: string;
}

export interface JourneyConfigState {
  experienceType: 'lodgenavigation' | 'navigation' | 'lodge';
  expeditionFocus: 'fiordos' | 'fauna' | 'gastronomy';
  guestsCount: number;
  tentativeMonth: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}
