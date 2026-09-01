import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type SiteContent = Database['public']['Tables']['site_content']['Row'];

export const DEFAULT_CMS_CONTENT: Record<string, Partial<SiteContent>> = {
  // 1. INICIO / HOME
  home_hero: {
    section_key: 'home_hero',
    title: 'EXPEDICIONES PATAGONIA & JUAN FERNÁNDEZ',
    subtitle: 'Aventura en Territorios Inexplorados & Prístinos',
    body_text: 'Navegaciones exclusivas en velero y yate de expedición, junto a estadías íntimas en nuestro Lodge Rincón de Navegantes.',
    media_url: '/velero-vegvisir.jpg',
    metadata: {
      title_en: 'PATAGONIA & JUAN FERNÁNDEZ EXPEDITIONS',
      subtitle_en: 'Adventure in Unexplored & Pristine Territories',
      body_text_en: 'Exclusive sailing and expedition yacht journeys, paired with intimate stays at our Rincón de Navegantes Lodge.',
    },
  },
  home_intro: {
    section_key: 'home_intro',
    title: 'Tres Formas de Vivir la Aventura Austral',
    subtitle: 'AVENTURA EN TERRITORIOS INEXPLORADOS & PRÍSTINOS',
    body_text: 'Explora el Archipiélago Juan Fernández, Isla Alejandro Selkirk y los fiordos del Cabo de Hornos a través de nuestras tres experiencias exclusivas.',
    media_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200',
    metadata: {
      title_en: 'Three Ways to Experience the Austral Adventure',
      subtitle_en: 'ADVENTURE IN UNEXPLORED & PRISTINE TERRITORIES',
      body_text_en: 'Explore the Juan Fernández Archipelago, Alejandro Selkirk Island and Cape Horn fjords through our three signature experiences.',
    },
  },

  // 2. FLOTA NÁUTICA
  flota_hero: {
    section_key: 'flota_hero',
    title: 'Nuestra Flota de Expedición',
    subtitle: 'INGENIERÍA OCEÁNICA & CONFORT SUPREMO',
    body_text: 'Embarcaciones de alto tonelaje preparadas para los mares más desafiantes del Pacífico Sur y fiordos australes.',
    media_url: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&q=80&w=1200',
    metadata: {
      title_en: 'Our Expedition Fleet',
      subtitle_en: 'OCEANIC ENGINEERING & SUPREME COMFORT',
      body_text_en: 'Heavy-tonnage vessels engineered for the most demanding seas of the South Pacific and austral fjords.',
    },
  },
  flota_vegvisir: {
    section_key: 'flota_vegvisir',
    title: 'Velero Vegvisir',
    subtitle: 'VELERO OCEÁNICO FRANCÉS • 6 PASAJEROS + TRIPULACIÓN',
    body_text: 'Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total.',
    media_url: '/velero-vegvisir.jpg',
    metadata: {
      title_en: 'Vegvisir Sailboat',
      subtitle_en: 'FRENCH OCEANIC SAILBOAT • 6 GUESTS + CREW',
      body_text_en: 'French Dufour 52.5 ft offshore expedition sailboat for austral voyages with 24/7 Starlink and total autonomy.',
    },
  },
  flota_terranova: {
    section_key: 'flota_terranova',
    title: 'Yate Terranova (Yate Oceánico 60ft)',
    subtitle: 'CRUCERO EXPLORER • 8 PASAJEROS + TRIPULACIÓN',
    body_text: 'Yate de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.',
    media_url: '/yate-terranova.jpg',
    metadata: {
      title_en: 'Terranova Yacht (Oceanic 60ft Yacht)',
      subtitle_en: 'EXPLORER CRUISER • 8 GUESTS + CREW',
      body_text_en: 'Expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
    },
  },

  // 3. LODGE RINCÓN DE NAVEGANTES
  lodge_info: {
    section_key: 'lodge_info',
    title: 'Lodge Rincón de Navegantes',
    subtitle: 'Uberlindo Andaur 222 • Isla Robinson Crusoe',
    body_text: 'Ubicado justo frente al mar en la Bahía Cumberland. Diseñado en torno a 4 cabinas independientes con baño privado cada una y vista al océano para hasta 11 pasajeros, amplio quincho, terraza y expediciones exclusivas.',
    media_url: '/rincon-de-navegantes.jpg',
    metadata: {
      title_en: 'Rincón de Navegantes Lodge',
      subtitle_en: 'Uberlindo Andaur 222 • Robinson Crusoe Island',
      body_text_en: 'Located directly oceanfront in Cumberland Bay. Designed around 4 independent en-suite cabins each with ocean views for up to 11 guests, expansive BBQ terrace and exclusive expeditions.',
    },
  },
  lodge_dining: {
    section_key: 'lodge_dining',
    title: 'Gastronomía de Mar & Quincho de Navegantes',
    subtitle: 'SABORES AUTÉNTICOS DEL ARCHIPIÉLAGO',
    body_text: 'Langosta de Juan Fernández fresca, vidriola, caracoles de roca y productos de la huerta local preparados por nuestros chefs anfitriones al calor de las brasas.',
    media_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
    metadata: {
      title_en: 'Ocean Gastronomy & Navigators BBQ',
      subtitle_en: 'AUTHENTIC ARCHIPELAGO FLAVORS',
      body_text_en: 'Fresh Juan Fernández lobster, yellowtail amberjack, sea snails and local organic garden produce grilled over embers by our host chefs.',
    },
  },

  // 4. EXPEDICIONES
  expeditions_hero: {
    section_key: 'expeditions_hero',
    title: 'Rutas & Expediciones Australes',
    subtitle: 'TRAVESÍAS DE ALTAMAR & RESERVAS DE LA BIOSFERA',
    body_text: 'Expediciones científicas y de aventura guiadas por capitanes expertos en Juan Fernández, Alejandro Selkirk y los canales patagónicos.',
    media_url: '/expediciones-hero.jpg',
    metadata: {
      title_en: 'Austral Routes & Expeditions',
      subtitle_en: 'OFFSHORE VOYAGES & BIOSPHERE RESERVES',
      body_text_en: 'Scientific and adventure expeditions guided by expert captains across Juan Fernández, Alejandro Selkirk and Patagonian channels.',
    },
  },
  expeditions_selkirk: {
    section_key: 'expeditions_selkirk',
    title: 'Expedición Extrema Selkirk & Robinson Crusoe',
    subtitle: '8 DÍAS / 7 NOCHES • BUCEO, FAUNA & NAUTICA',
    body_text: 'Navegación bordeando acantilados milenarios, buceo con lobos finos de dos pelos, avistamiento de aves endémicas y senderismo en el bosque de helechos gigantes.',
    media_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200',
    metadata: {
      title_en: 'Extreme Selkirk & Robinson Crusoe Expedition',
      subtitle_en: '8 DAYS / 7 NIGHTS • DIVING, WILDLIFE & SAILING',
      body_text_en: 'Sailing along ancient sea cliffs, diving with fur seals, watching endemic birds and trekking in the giant fern rainforest.',
    },
  },

  // 5. CONTACTO & CONCIERGE
  contact_info: {
    section_key: 'contact_info',
    title: 'Concierge & Atención Personalizada',
    subtitle: 'ASESORÍA NÁUTICA & PLANIFICACIÓN A MEDIDA',
    body_text: 'Nuestro equipo de concierge está a su entera disposición para coordinar itinerarios privados, vuelos chárter a la isla y requerimientos especiales.',
    media_url: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=1200',
    metadata: {
      title_en: 'Concierge & Bespoke Assistance',
      subtitle_en: 'NAUTICAL ADVISORY & BESPOKE PLANNING',
      body_text_en: 'Our concierge team is at your complete disposal to coordinate private itineraries, island charter flights and bespoke requirements.',
    },
  },
  bank_details: {
    section_key: 'bank_details',
    title: 'Datos de Transferencia Bancaria',
    subtitle: 'Banco de Chile / Santander',
    body_text: 'Yates Chile SpA • RUT: 77.892.341-K • Cta Cte: 00-123456-78 • pagos@yateschile.cl',
    media_url: '',
    metadata: {
      title_en: 'Bank Transfer Details',
      subtitle_en: 'Banco de Chile / Santander',
      body_text_en: 'Yates Chile SpA • Tax ID: 77.892.341-K • Checking Acct: 00-123456-78 • payments@yateschile.cl',
    },
  },
};

const LOCAL_STORAGE_CMS_KEY = 'yates_chile_cms_content_cache_v10';

function cleanMediaUrl(sectionKey: string, url?: string | null): string {
  const defaultUrl = DEFAULT_CMS_CONTENT[sectionKey]?.media_url || '';
  if (!url) return defaultUrl;
  
  // If the stored URL is an old Unsplash placeholder for these core vessels/lodge, override with the official image
  if (url.includes('images.unsplash.com')) {
    if (sectionKey === 'flota_vegvisir' || sectionKey === 'home_hero' || sectionKey === 'flota_terranova' || sectionKey === 'lodge_info' || sectionKey === 'expeditions_hero') {
      return defaultUrl;
    }
  }
  return url;
}

function getLocalCmsCache(): Record<string, Partial<SiteContent>> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return {};
}

function saveLocalCmsCache(map: Record<string, Partial<SiteContent>>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(map));
  } catch {
    // Ignore error
  }
}

export const cmsService = {
  getCachedContentSync(): Record<string, Partial<SiteContent>> {
    const local = getLocalCmsCache();
    const merged: Record<string, Partial<SiteContent>> = { ...DEFAULT_CMS_CONTENT, ...local };
    Object.keys(merged).forEach((k) => {
      if (merged[k]?.media_url) {
        merged[k].media_url = cleanMediaUrl(k, merged[k].media_url);
      }
    });
    return merged;
  },

  async getContent(sectionKey: string): Promise<Partial<SiteContent>> {
    const local = getLocalCmsCache();
    if (local[sectionKey]) {
      const item = { ...local[sectionKey] };
      item.media_url = cleanMediaUrl(sectionKey, item.media_url);
      return item;
    }
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', sectionKey)
        .single();

      if (error || !data) {
        return DEFAULT_CMS_CONTENT[sectionKey] || { section_key: sectionKey };
      }
      return {
        ...data,
        media_url: cleanMediaUrl(sectionKey, data.media_url),
      };
    } catch {
      return DEFAULT_CMS_CONTENT[sectionKey] || { section_key: sectionKey };
    }
  },

  async getAllContent(): Promise<Record<string, Partial<SiteContent>>> {
    const localCache = getLocalCmsCache();
    const map: Record<string, Partial<SiteContent>> = {};
    try {
      const { data, error } = await supabase.from('site_content').select('*');
      if (!error && data && data.length > 0) {
        data.forEach((item) => {
          map[item.section_key] = item;
        });
      }
    } catch {
      // Fallback
    }

    const merged: Record<string, Partial<SiteContent>> = { ...DEFAULT_CMS_CONTENT };

    // 1. Merge localCache on top of default
    Object.keys(localCache).forEach((k) => {
      merged[k] = { ...merged[k], ...localCache[k] };
    });

    // 2. Merge Supabase remote data (source of truth) on top
    Object.keys(map).forEach((k) => {
      const remoteItem = map[k];
      if (remoteItem) {
        merged[k] = {
          ...merged[k],
          ...remoteItem,
          title: remoteItem.title !== null && remoteItem.title !== undefined && remoteItem.title !== '' ? remoteItem.title : merged[k]?.title,
          subtitle: remoteItem.subtitle !== null && remoteItem.subtitle !== undefined && remoteItem.subtitle !== '' ? remoteItem.subtitle : merged[k]?.subtitle,
          body_text: remoteItem.body_text !== null && remoteItem.body_text !== undefined && remoteItem.body_text !== '' ? remoteItem.body_text : merged[k]?.body_text,
          media_url: cleanMediaUrl(k, remoteItem.media_url !== null && remoteItem.media_url !== undefined && remoteItem.media_url !== '' ? remoteItem.media_url : merged[k]?.media_url),
        };
      }
    });

    // Sanitize all media_urls
    Object.keys(merged).forEach((k) => {
      if (merged[k]?.media_url) {
        merged[k].media_url = cleanMediaUrl(k, merged[k].media_url);
      }
    });

    saveLocalCmsCache(merged);
    return merged;
  },

  async updateContent(
    sectionKey: string,
    updates: {
      title?: string;
      subtitle?: string;
      body_text?: string;
      media_url?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const localCache = getLocalCmsCache();
    const existing = localCache[sectionKey] || DEFAULT_CMS_CONTENT[sectionKey] || {};
    const updatedItem: Partial<SiteContent> = {
      ...existing,
      section_key: sectionKey,
      title: updates.title !== undefined ? updates.title : existing.title,
      subtitle: updates.subtitle !== undefined ? updates.subtitle : existing.subtitle,
      body_text: updates.body_text !== undefined ? updates.body_text : existing.body_text,
      media_url: updates.media_url !== undefined ? updates.media_url : existing.media_url,
      updated_at: new Date().toISOString(),
    };
    localCache[sectionKey] = updatedItem;
    saveLocalCmsCache(localCache);

    // Broadcast change to all listening components and pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_content_updated', { detail: { sectionKey, updatedItem } }));
    }

    try {
      // Check if row already exists in Supabase
      const { data: existingRow } = await supabase
        .from('site_content')
        .select('id')
        .eq('section_key', sectionKey)
        .maybeSingle();

      if (existingRow && existingRow.id) {
        const { error: updateError } = await supabase
          .from('site_content')
          .update({
            title: updates.title !== undefined ? updates.title : (existing.title || null),
            subtitle: updates.subtitle !== undefined ? updates.subtitle : (existing.subtitle || null),
            body_text: updates.body_text !== undefined ? updates.body_text : (existing.body_text || null),
            media_url: updates.media_url !== undefined ? updates.media_url : (existing.media_url || null),
            updated_at: new Date().toISOString(),
          })
          .eq('section_key', sectionKey);

        if (updateError) {
          console.warn('Supabase update error:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            section_key: sectionKey,
            title: updates.title || null,
            subtitle: updates.subtitle || null,
            body_text: updates.body_text || null,
            media_url: updates.media_url || null,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.warn('Supabase insert error:', insertError);
        }
      }
      return { success: true };
    } catch (err: unknown) {
      console.warn('Supabase network catch:', err);
      return { success: true };
    }
  },

  async uploadMedia(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `cms/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('site-media')
        .upload(path, file, { upsert: true });

      if (error) return { success: false, error: error.message };

      const { data: publicData } = supabase.storage.from('site-media').getPublicUrl(data.path);
      return { success: true, url: publicData.publicUrl };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
