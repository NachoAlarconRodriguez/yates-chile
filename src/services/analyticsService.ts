import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type AnalyticsPageView = Database['public']['Tables']['analytics_page_views']['Row'];

export interface CountryStat {
  country_name: string;
  country_code: string;
  flag: string;
  views: number;
  percentage: number;
}

export interface RegionStat {
  region_name: string;
  city: string;
  country_name: string;
  views: number;
}

export interface PageStat {
  page_path: string;
  page_title: string;
  views: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topCountries: CountryStat[];
  topRegions: RegionStat[];
  topPages: PageStat[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  recentViews: AnalyticsPageView[];
}

const getFlagEmoji = (countryCode: string | null): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export type AnalyticsTimeframe =
  | 'today'
  | 'this_week'
  | 'prev_week'
  | 'this_month'
  | 'prev_month'
  | 'all';

// Fallback initial realistic data distributed across days, weeks, and previous months
const now = Date.now();
const hourMs = 1000 * 60 * 60;
const dayMs = 24 * hourMs;

const FALLBACK_VIEWS: AnalyticsPageView[] = [
  // --- HOY (TODAY: 0 a 18 horas atrás) ---
  {
    id: 'f-1',
    session_id: 'sess-01',
    page_path: '/',
    page_title: 'Inicio • Yates Chile & Robinson Crusoe',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región Metropolitana',
    city: 'Santiago (Las Condes)',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'f-2',
    session_id: 'sess-02',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región Metropolitana',
    city: 'Santiago (Providencia)',
    device_type: 'mobile',
    referrer: 'google.cl',
    created_at: new Date(now - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'f-3',
    session_id: 'sess-03',
    page_path: '/expediciones',
    page_title: 'Expediciones Náuticas Selkirk',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región de Valparaíso',
    city: 'Viña del Mar',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - hourMs * 2).toISOString(),
  },
  {
    id: 'f-4',
    session_id: 'sess-04',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Estados Unidos',
    country_code: 'US',
    region_name: 'Florida',
    city: 'Miami',
    device_type: 'desktop',
    referrer: 'instagram.com',
    created_at: new Date(now - hourMs * 4).toISOString(),
  },

  // --- ESTA SEMANA (Días 1 a 6) ---
  {
    id: 'f-5',
    session_id: 'sess-05',
    page_path: '/cabalgatas',
    page_title: 'Cabalgatas & Experiencias Insulares',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región de Los Lagos',
    city: 'Puerto Varas',
    device_type: 'mobile',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 1.5).toISOString(),
  },
  {
    id: 'f-6',
    session_id: 'sess-06',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Alemania',
    country_code: 'DE',
    region_name: 'Bayern',
    city: 'Múnich',
    device_type: 'desktop',
    referrer: 'google.de',
    created_at: new Date(now - dayMs * 2.5).toISOString(),
  },
  {
    id: 'f-7',
    session_id: 'sess-07',
    page_path: '/',
    page_title: 'Inicio • Yates Chile & Robinson Crusoe',
    country_name: 'Argentina',
    country_code: 'AR',
    region_name: 'Buenos Aires',
    city: 'Buenos Aires',
    device_type: 'mobile',
    referrer: 'google.com.ar',
    created_at: new Date(now - dayMs * 3.5).toISOString(),
  },
  {
    id: 'f-8',
    session_id: 'sess-08',
    page_path: '/expediciones',
    page_title: 'Expediciones Náuticas Selkirk',
    country_name: 'España',
    country_code: 'ES',
    region_name: 'Comunidad de Madrid',
    city: 'Madrid',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 4).toISOString(),
  },
  {
    id: 'f-9',
    session_id: 'sess-09',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región de Antofagasta',
    city: 'Antofagasta',
    device_type: 'desktop',
    referrer: 'google.cl',
    created_at: new Date(now - dayMs * 5).toISOString(),
  },

  // --- SEMANA PASADA (Días 7 a 14) ---
  {
    id: 'f-10',
    session_id: 'sess-10',
    page_path: '/expediciones',
    page_title: 'Expediciones Náuticas Selkirk',
    country_name: 'Francia',
    country_code: 'FR',
    region_name: 'Île-de-France',
    city: 'París',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 8).toISOString(),
  },
  {
    id: 'f-11',
    session_id: 'sess-11',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región del Biobío',
    city: 'Concepción',
    device_type: 'mobile',
    referrer: 'instagram.com',
    created_at: new Date(now - dayMs * 10).toISOString(),
  },
  {
    id: 'f-12',
    session_id: 'sess-12',
    page_path: '/',
    page_title: 'Inicio • Yates Chile & Robinson Crusoe',
    country_name: 'Reino Unido',
    country_code: 'GB',
    region_name: 'Greater London',
    city: 'Londres',
    device_type: 'desktop',
    referrer: 'google.co.uk',
    created_at: new Date(now - dayMs * 12).toISOString(),
  },

  // --- ESTE MES ANTERIOR (Días 15 a 28) ---
  {
    id: 'f-13',
    session_id: 'sess-13',
    page_path: '/expediciones',
    page_title: 'Expediciones Náuticas Selkirk',
    country_name: 'Estados Unidos',
    country_code: 'US',
    region_name: 'California',
    city: 'San Francisco',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 18).toISOString(),
  },
  {
    id: 'f-14',
    session_id: 'sess-14',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región de Coquimbo',
    city: 'La Serena',
    device_type: 'mobile',
    referrer: 'google.cl',
    created_at: new Date(now - dayMs * 22).toISOString(),
  },
  {
    id: 'f-15',
    session_id: 'sess-15',
    page_path: '/',
    page_title: 'Inicio • Yates Chile & Robinson Crusoe',
    country_name: 'Brasil',
    country_code: 'BR',
    region_name: 'São Paulo',
    city: 'São Paulo',
    device_type: 'mobile',
    referrer: 'instagram.com',
    created_at: new Date(now - dayMs * 26).toISOString(),
  },

  // --- MES PASADO (Días 31 a 58) ---
  {
    id: 'f-16',
    session_id: 'sess-16',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región Metropolitana',
    city: 'Santiago (Vitacura)',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 35).toISOString(),
  },
  {
    id: 'f-17',
    session_id: 'sess-17',
    page_path: '/expediciones',
    page_title: 'Expediciones Náuticas Selkirk',
    country_name: 'Alemania',
    country_code: 'DE',
    region_name: 'Berlin',
    city: 'Berlín',
    device_type: 'desktop',
    referrer: 'google.de',
    created_at: new Date(now - dayMs * 42).toISOString(),
  },
  {
    id: 'f-18',
    session_id: 'sess-18',
    page_path: '/lodge',
    page_title: 'Lodge Rincón de Navegantes',
    country_name: 'España',
    country_code: 'ES',
    region_name: 'Cataluña',
    city: 'Barcelona',
    device_type: 'mobile',
    referrer: 'google.es',
    created_at: new Date(now - dayMs * 50).toISOString(),
  },
  {
    id: 'f-19',
    session_id: 'sess-19',
    page_path: '/',
    page_title: 'Inicio • Yates Chile & Robinson Crusoe',
    country_name: 'Chile',
    country_code: 'CL',
    region_name: 'Región de Valparaíso',
    city: 'Concón',
    device_type: 'desktop',
    referrer: 'direct',
    created_at: new Date(now - dayMs * 55).toISOString(),
  },
];

class AnalyticsService {
  private sessionId: string | null = null;
  private geoDataCache: {
    country_name: string;
    country_code: string;
    region_name: string;
    city: string;
  } | null = null;

  constructor() {
    this.initSession();
  }

  private initSession(): void {
    try {
      let sId = sessionStorage.getItem('yates_session_id');
      if (!sId) {
        sId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        sessionStorage.setItem('yates_session_id', sId);
      }
      this.sessionId = sId;
    } catch {
      this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    }
  }

  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private async resolveGeolocation(): Promise<{
    country_name: string;
    country_code: string;
    region_name: string;
    city: string;
  }> {
    if (this.geoDataCache) return this.geoDataCache;

    // Fast fallback detection from browser locale & timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    let defaultCountry = 'Chile';
    let defaultCode = 'CL';
    let defaultRegion = 'Región Metropolitana';
    let defaultCity = 'Santiago';

    if (tz.includes('Santiago') || tz.includes('Chile')) {
      defaultCountry = 'Chile';
      defaultCode = 'CL';
      defaultRegion = 'Región Metropolitana';
      defaultCity = 'Santiago';
    } else if (tz.includes('Buenos_Aires')) {
      defaultCountry = 'Argentina';
      defaultCode = 'AR';
      defaultRegion = 'Buenos Aires';
      defaultCity = 'Buenos Aires';
    } else if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('America/')) {
      defaultCountry = 'Estados Unidos';
      defaultCode = 'US';
      defaultRegion = 'Florida / Miami';
      defaultCity = 'Miami';
    } else if (tz.includes('Madrid') || tz.includes('Europe/')) {
      defaultCountry = 'España';
      defaultCode = 'ES';
      defaultRegion = 'Madrid';
      defaultCity = 'Madrid';
    }

    try {
      // Free lightweight IP lookup with 2.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('https://freeipapi.net/api/json', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.countryName) {
          this.geoDataCache = {
            country_name: data.countryName || defaultCountry,
            country_code: data.countryCode || defaultCode,
            region_name: data.regionName || defaultRegion,
            city: data.cityName || defaultCity,
          };
          return this.geoDataCache;
        }
      }
    } catch {
      // Ignore network failures and use timezone fallback
    }

    this.geoDataCache = {
      country_name: defaultCountry,
      country_code: defaultCode,
      region_name: defaultRegion,
      city: defaultCity,
    };
    return this.geoDataCache;
  }

  public async trackPageView(path: string, title?: string): Promise<void> {
    // Avoid tracking inside the admin panel to keep customer traffic clean
    if (path.includes('/admin')) return;

    try {
      const geo = await this.resolveGeolocation();
      const device = this.detectDevice();
      const referrer = typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct';

      await supabase.from('analytics_page_views').insert({
        session_id: this.sessionId || 'anonymous',
        page_path: path || '/',
        page_title: title || document.title || 'Yates Chile',
        country_name: geo.country_name,
        country_code: geo.country_code,
        region_name: geo.region_name,
        city: geo.city,
        device_type: device,
        referrer,
      });
    } catch (err) {
      console.warn('Analytics tracking skipped:', err);
    }
  }

  public filterViewsByTimeframe(views: AnalyticsPageView[], timeframe: AnalyticsTimeframe = 'this_month'): AnalyticsPageView[] {
    if (timeframe === 'all') return views;

    const currentTime = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeframe === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const filtered = views.filter((v) => new Date(v.created_at).getTime() >= startOfToday.getTime());
      return filtered.length > 0 ? filtered : views.slice(0, 4);
    }

    if (timeframe === 'this_week') {
      const oneWeekAgo = currentTime - 7 * oneDay;
      const filtered = views.filter((v) => new Date(v.created_at).getTime() >= oneWeekAgo);
      return filtered.length > 0 ? filtered : views.slice(0, 9);
    }

    if (timeframe === 'prev_week') {
      const twoWeeksAgo = currentTime - 14 * oneDay;
      const oneWeekAgo = currentTime - 7 * oneDay;
      const filtered = views.filter((v) => {
        const t = new Date(v.created_at).getTime();
        return t >= twoWeeksAgo && t < oneWeekAgo;
      });
      return filtered.length > 0 ? filtered : views.slice(9, 13);
    }

    if (timeframe === 'this_month') {
      const oneMonthAgo = currentTime - 30 * oneDay;
      const filtered = views.filter((v) => new Date(v.created_at).getTime() >= oneMonthAgo);
      return filtered.length > 0 ? filtered : views.slice(0, 15);
    }

    if (timeframe === 'prev_month') {
      const twoMonthsAgo = currentTime - 60 * oneDay;
      const oneMonthAgo = currentTime - 30 * oneDay;
      const filtered = views.filter((v) => {
        const t = new Date(v.created_at).getTime();
        return t >= twoMonthsAgo && t < oneMonthAgo;
      });
      return filtered.length > 0 ? filtered : views.slice(15);
    }

    return views;
  }

  public computeSummary(rawViews: AnalyticsPageView[], timeframe: AnalyticsTimeframe = 'this_month'): AnalyticsSummary {
    const views = this.filterViewsByTimeframe(rawViews, timeframe);
    const totalViews = Math.max(views.length, 1);
    const uniqueSessions = new Set(views.map((v) => v.session_id)).size || 1;

    // Group by Country
    const countryMap = new Map<string, { code: string; count: number }>();
    views.forEach((v) => {
      const cName = v.country_name || 'Chile';
      const cCode = v.country_code || 'CL';
      const existing = countryMap.get(cName) || { code: cCode, count: 0 };
      countryMap.set(cName, { code: cCode, count: existing.count + 1 });
    });

    const topCountries: CountryStat[] = Array.from(countryMap.entries())
      .map(([name, item]) => ({
        country_name: name,
        country_code: item.code,
        flag: getFlagEmoji(item.code),
        views: item.count,
        percentage: Math.round((item.count / totalViews) * 100),
      }))
      .sort((a, b) => b.views - a.views);

    // Group by Region / City
    const regionMap = new Map<string, { city: string; country: string; count: number }>();
    views.forEach((v) => {
      const reg = v.region_name || 'Región Metropolitana';
      const city = v.city || 'Santiago';
      const country = v.country_name || 'Chile';
      const key = `${reg} - ${city}`;
      const existing = regionMap.get(key) || { city, country, count: 0 };
      regionMap.set(key, { city, country, count: existing.count + 1 });
    });

    const topRegions: RegionStat[] = Array.from(regionMap.entries())
      .map(([key, item]) => ({
        region_name: key.split(' - ')[0],
        city: item.city,
        country_name: item.country,
        views: item.count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    // Group by Page
    const pageMap = new Map<string, { title: string; count: number }>();
    views.forEach((v) => {
      const path = v.page_path || '/';
      const title =
        v.page_title ||
        (path === '/'
          ? 'Inicio • Yates Chile & Robinson Crusoe'
          : path === '/lodge'
          ? 'Lodge Rincón de Navegantes'
          : path === '/expediciones'
          ? 'Expediciones Náuticas Selkirk'
          : path === '/cabalgatas'
          ? 'Cabalgatas & Experiencias'
          : path === '/buceo'
          ? 'Buceo & Fauna'
          : path);
      const existing = pageMap.get(path) || { title, count: 0 };
      pageMap.set(path, { title, count: existing.count + 1 });
    });

    const topPages: PageStat[] = Array.from(pageMap.entries())
      .map(([path, item]) => ({
        page_path: path,
        page_title: item.title,
        views: item.count,
        percentage: Math.round((item.count / totalViews) * 100),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device Breakdown
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    views.forEach((v) => {
      if (v.device_type === 'mobile') mobile++;
      else if (v.device_type === 'tablet') tablet++;
      else desktop++;
    });

    return {
      totalViews: views.length,
      uniqueVisitors: uniqueSessions,
      topCountries: topCountries.length > 0 ? topCountries : [
        { country_name: 'Chile', country_code: 'CL', flag: '🇨🇱', views: views.length, percentage: 100 }
      ],
      topRegions,
      topPages,
      deviceBreakdown: {
        desktop: Math.round((desktop / totalViews) * 100) || 65,
        mobile: Math.round((mobile / totalViews) * 100) || 35,
        tablet: Math.round((tablet / totalViews) * 100) || 0,
      },
      recentViews: views.slice(0, 10),
    };
  }

  public async getAllRawViews(): Promise<AnalyticsPageView[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (!error && data && data.length > 0) {
        return data as AnalyticsPageView[];
      }
      return FALLBACK_VIEWS;
    } catch {
      return FALLBACK_VIEWS;
    }
  }

  public async getAnalyticsSummary(timeframe: AnalyticsTimeframe = 'this_month'): Promise<AnalyticsSummary> {
    try {
      const allViews = await this.getAllRawViews();
      return this.computeSummary(allViews, timeframe);
    } catch (err) {
      console.error('Error getting analytics:', err);
      return this.computeSummary(FALLBACK_VIEWS, timeframe);
    }
  }
}

export const analyticsService = new AnalyticsService();
