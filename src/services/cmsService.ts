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
    subtitle: 'VELERO OCEÁNICO FRANCÉS • 12 PASAJEROS + TRIPULACIÓN',
    body_text: '52.5 pies de pura navegación a vela con casco oceánico reforzado, 5 cabinas triples y dobles con baño en suite, salón panorámico y equipamiento de navegación satelital de última generación.',
    media_url: '/velero-vegvisir.jpg',
    metadata: {
      title_en: 'Vegvisir Sailboat',
      subtitle_en: 'FRENCH OCEANIC SAILBOAT • 12 GUESTS + CREW',
      body_text_en: '52.5 ft pure ocean sailing with reinforced offshore hull, 5 triple and double en-suite cabins, panoramic salon, and next-gen satellite navigation.',
    },
  },
  flota_terranova: {
    section_key: 'flota_terranova',
    title: 'Yate Terranova',
    subtitle: 'CRUCERO EXPLORER • 8 PASAJEROS + TRIPULACIÓN',
    body_text: 'Yate oceánico 65ft de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.',
    media_url: '/yate-terranova.jpg',
    metadata: {
      title_en: 'Terranova Yacht',
      subtitle_en: 'EXPLORER CRUISER • 8 GUESTS + CREW',
      body_text_en: '65ft oceanic expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
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

  // 6. CUADERNOS DE BITÁCORA Y CARACTERÍSTICAS
  vegvisir_logbook: {
    section_key: 'vegvisir_logbook',
    title: 'Cuaderno de Bitácora & Relatos • Velero Vegvisir',
    subtitle: 'Relatos de altamar y especificaciones náuticas del Dufour 52.5 ft.',
    body_text: '4 entradas oficiales de navegación y confort oceánico.',
    media_url: '/velero-vegvisir.jpg',
    metadata: {
      entries: {
        climatizacion: {
          id: 'climatizacion',
          nav_title: 'Climatización Sistema Webasto',
          nav_description: 'Sistema de calefacción por radiadores de agua caliente controlable en cada camarote, garantizando noches de confort y abrigo térmico absoluto en aguas glaciales.',
          day: 'Día 12 de Travesía',
          location: 'Canal Sarmiento',
          coordinates: "51°52' S, 73°40' W",
          wind: 'W 32 Nudos',
          temp: '2°C Ext',
          text: 'El frío antártico cala hondo en cubierta, pero el Vegvisir nos abraza en su interior. La climatización con sistema Webasto mantiene la cabina a unos constantes 21°C. Las tazas de café humean sobre la mesa de roble mientras contemplamos la ventisca desde el ventanal templado.',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        },
        gastronomia: {
          id: 'gastronomia',
          nav_title: 'Gastronomía',
          nav_description: 'La alimentación durante nuestras travesías está pensada para acompañar la vida a bordo: comidas caseras, nutritivas y adecuadas a una navegación oceánica. La alimentación es parte de la experiencia de navegar: simple, abundante y adaptada al ritmo del mar.',
          day: 'Día 15 de Travesía',
          location: 'Seno Ventisquero',
          coordinates: "54°30' S, 69°12' W",
          wind: 'Calma',
          temp: '4°C Ext',
          text: 'La alimentación durante nuestras travesías está pensada para acompañar la vida a bordo: comidas caseras, nutritivas y adecuadas a una navegación oceánica. La alimentación es parte de la experiencia de navegar: simple, abundante y adaptada al ritmo del mar.',
          image: '/flota/vegvisir/vegvisir-gastronomia.jpg',
        },
        casco: {
          id: 'casco',
          nav_title: 'Casco Reforzado',
          nav_description: 'Ingeniería de casco robusta y preparada para navegaciones oceánicas y zonas remotas, desde las aguas abiertas del Pacífico hacia el Archipiélago Juan Fernández y Robinson Crusoe, hasta la geografía extrema de los fiordos, canales e islas del extremo sur de Chile.',
          day: 'Día 18 de Travesía',
          location: 'Paso del Indio',
          coordinates: "49°02' S, 74°24' W",
          wind: 'NW 45 Nudos',
          temp: '1°C Ext',
          text: 'Navegando entre pequeños témpanos de hielo a la deriva bajo una tormenta austral. La solidez del casco reforzado y la quilla de plomo del Vegvisir infunden total confianza cuando el hielo roza suavemente la estructura. La embarcación corta el mar embravecido con firmeza impecable.',
          image: '/velero-vegvisir.jpg',
        },
        desembarcos: {
          id: 'desembarcos',
          nav_title: 'Desembarcos Seguros',
          nav_description: 'Equipado con bote Zodiac auxiliar de alta flotabilidad, que permite realizar desembarcos y aproximaciones en sectores donde no existen muelles o infraestructura portuaria, facilitando el acceso desde el velero a playas, caletas y otros puntos de interés.',
          day: 'Día 20 de Travesía',
          location: 'Bahía Ainsworth',
          coordinates: "54°22' S, 69°38' W",
          wind: 'SW 15 Nudos',
          temp: '5°C Ext',
          text: 'Alistamos el bote Zodiac auxiliar semirrígido de alta flotabilidad. La aproximación al frente glaciar y el desembarco en la playa de morrena para caminar hacia los bosques subantárticos transcurren sin contratiempos. Una maniobra segura en un paraje de belleza salvaje.',
          image: '/flota/vegvisir/vegvisir-desembarcos.jpg',
        },
      },
    },
  },

  terranova_logbook: {
    section_key: 'terranova_logbook',
    title: 'Cuaderno de Bitácora & Relatos • Yate Terranova',
    subtitle: 'Relatos y capacidades oceánicas del Hatteras 65ft LRC.',
    body_text: '4 entradas oficiales de habitabilidad, autonomía y navegación.',
    media_url: '/yate-terranova.jpg',
    metadata: {
      entries: {
        climatizacion: {
          id: 'climatizacion',
          nav_title: 'Deck Superior & Flybridge',
          nav_description: 'Parrilla exterior y amplitud en el flybridge con segundo puente de gobierno, ofreciendo el espacio perfecto para compartir con vista panorámica de 360°.',
          day: 'Día 10 de Travesía',
          location: 'Glaciar Garibaldi',
          coordinates: "54°07' S, 69°57' W",
          wind: 'W 25 Nudos',
          temp: '3°C Ext',
          text: 'Fondeados frente al resguardo del glaciar Garibaldi, disfrutamos de la vista en 360° desde la Cubierta 3. La parrilla exterior y la amplitud del flybridge con su segundo puente de gobierno ofrecen el espacio perfecto para compartir al atardecer en los fiordos.',
          image: '/flota/terranova/terranova-cubiertas.jpg',
        },
        gastronomia: {
          id: 'gastronomia',
          nav_title: 'Salón Central & Gastronomía',
          nav_description: 'Cocina full equipo y amplio comedor en la Cubierta 2 para disfrutar de centolla y pesca fresca del día frente a ventanales panorámicos.',
          day: 'Día 14 de Travesía',
          location: 'Seno Eyre',
          coordinates: "48°58' S, 74°20' W",
          wind: 'Calma',
          temp: '5°C Ext',
          text: 'En el amplio comedor de la Cubierta 2, rodeados de ventanales panorámicos frente al glaciar Pío XI, la cocina full equipo permite preparar centolla fresca austral y pesca del día maridadas con vinos selectos en un ambiente de total calidez y confort.',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
        },
        casco: {
          id: 'casco',
          nav_title: 'Autonomía 3.000 MN & Motores Detroit',
          nav_description: 'Doble motorización Detroit de 450 HP c/u y estanque diésel de 10.000 L para navegar sin escalas los canales y fiordos más remotos de la Patagonia.',
          day: 'Día 17 de Travesía',
          location: 'Golfo de Penas',
          coordinates: "47°15' S, 74°50' W",
          wind: 'SW 38 Nudos',
          temp: '6°C Ext',
          text: 'Navegando a velocidad crucero de 10 nudos con el empuje firme de los 2 motores Detroit de 450 HP. Su estanque de 10.000 Litros de combustible brinda 3.000 millas náuticas de autonomía para explorar los canales y fiordos más remotos del extremo sur sin escalas.',
          image: '/zarpe-archipielago.jpg',
        },
        desembarcos: {
          id: 'desembarcos',
          nav_title: 'Zodiac Yamaha 70 HP & Grúa 1T',
          nav_description: 'Zodiac semirrígido de 5 metros con motor Yamaha 70 HP (4 tiempos) y grúa de 1 tonelada para desembarcos rápidos y seguros en cualquier costa.',
          day: 'Día 19 de Travesía',
          location: 'Fiordo Peel',
          coordinates: "50°55' S, 74°05' W",
          wind: 'Calma',
          temp: '4°C Ext',
          text: 'Operamos la grúa de 1 tonelada de la Cubierta 3 para arriar el bote Zodiac semirrígido con motor Yamaha 70 HP. La potencia y maniobrabilidad nos permiten realizar aproximaciones directas y desembarcos seguros en playas y ventisqueros de difícil acceso.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        },
      },
    },
  },

  lodge_logbook: {
    section_key: 'lodge_logbook',
    title: 'Cuaderno de Bitácora & Relatos • Lodge Rincón de Navegantes',
    subtitle: 'Relatos y vivencias del refugio en Isla Robinson Crusoe.',
    body_text: '4 relatos de arquitectura, quincho, exploraciones y atardeceres.',
    media_url: '/rincon-de-navegantes.jpg',
    metadata: {
      entries: {
        arquitectura: {
          id: 'arquitectura',
          nav_title: 'Arquitectura & Aislación Térmica',
          nav_description: 'Arquitectura armónica con el entorno, altos estándares de calidad, excelente aislación térmica y materiales resistentes para un confort total.',
          day: 'Diseño & Calidad Constructiva',
          location: 'Uberlindo Andaur 222',
          coordinates: "33°38' S, 78°50' W",
          wind: 'Brisa Marina',
          temp: '16°C Ext',
          text: 'Rincón de Navegantes fue diseñado para integrarse de manera armónica al paisaje de Robinson Crusoe, privilegiando una arquitectura respetuosa con el entorno y preparada para las particulares condiciones de la isla. Su construcción incorpora altos estándares de calidad, excelente aislación térmica y materiales seleccionados por su resistencia y durabilidad, ofreciendo espacios confortables, eficientes y protegidos frente al viento, la humedad y las variaciones climáticas. Un diseño que combina calidad constructiva, funcionalidad y conexión con el paisaje, permitiendo disfrutar de la naturaleza de la isla con un alto nivel de confort.',
          image: '/jf-noviembre.jpg',
        },
        quincho: {
          id: 'quincho',
          nav_title: 'Amplio Quincho & Encuentros',
          nav_description: 'Quincho acogedor para compartir, cocinar y disfrutar de comidas al calor de las brasas frente al mar.',
          day: 'Momentos al Aire Libre',
          location: 'Quincho del Lodge',
          coordinates: "33°38' S, 78°50' W",
          wind: 'Calma',
          temp: '18°C Ext',
          text: 'El lodge cuenta con un amplio quincho, un espacio acogedor ideal para compartir, cocinar y disfrutar de encuentros al aire libre. Su entorno invita a reunirse después de una jornada recorriendo la isla y vivir momentos inolvidables frente al paisaje de Robinson Crusoe.',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
        },
        exploraciones: {
          id: 'exploraciones',
          nav_title: 'Exploraciones Exclusivas',
          nav_description: 'Cabalgatas, senderismo en bosques endémicos, buceo y snorkel con fauna marina, y navegaciones costeras.',
          day: 'Aventura con Expertos Locales',
          location: 'Isla Robinson Crusoe',
          coordinates: "33°39' S, 78°51' W",
          wind: 'SW 14 Nudos',
          temp: '15°C Ext',
          text: 'Guiados por expertos locales, exploramos la isla Robinson Crusoe a través de experiencias únicas: cabalgatas por paisajes de gran belleza, senderismo entre bosques de helechos gigantes y especies endémicas, buceo y snorkel en aguas de extraordinaria biodiversidad, y navegaciones que revelan acantilados, bahías y rincones inaccesibles por tierra. Cada aventura permite descubrir la historia, la naturaleza y el espíritu de una de las islas más fascinantes del mundo.',
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
        },
        atardeceres: {
          id: 'atardeceres',
          nav_title: 'Atardeceres Frente al Mar',
          nav_description: 'Ubicación privilegiada en Bahía Cumberland para contemplar la caída del sol sobre el océano.',
          day: 'Horizonte Infinito',
          location: 'Frente al Mar (Bahía Cumberland)',
          coordinates: "33°38' S, 78°50' W",
          wind: 'Calma',
          temp: '14°C Ext',
          text: 'Desde Rincón de Navegantes, el océano se convierte en parte del paisaje cotidiano. Su ubicación privilegiada frente al mar permite contemplar atardeceres inolvidables, mientras el cielo cambia de color y el sol se pierde en el horizonte. Un escenario único para descansar, compartir y dejarse envolver por la inmensidad de Robinson Crusoe.',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        },
      },
    },
  },
};

const LOCAL_STORAGE_CMS_KEY = 'yates_chile_cms_content_cache_v13';

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
        const existingMeta = (merged[k]?.metadata as Record<string, any>) || {};
        const remoteMeta = (remoteItem.metadata as Record<string, any>) || {};
        merged[k] = {
          ...merged[k],
          ...remoteItem,
          title: remoteItem.title !== null && remoteItem.title !== undefined && remoteItem.title !== '' ? remoteItem.title : merged[k]?.title,
          subtitle: remoteItem.subtitle !== null && remoteItem.subtitle !== undefined && remoteItem.subtitle !== '' ? remoteItem.subtitle : merged[k]?.subtitle,
          body_text: remoteItem.body_text !== null && remoteItem.body_text !== undefined && remoteItem.body_text !== '' ? remoteItem.body_text : merged[k]?.body_text,
          media_url: cleanMediaUrl(k, remoteItem.media_url !== null && remoteItem.media_url !== undefined && remoteItem.media_url !== '' ? remoteItem.media_url : merged[k]?.media_url),
          metadata: {
            ...existingMeta,
            ...remoteMeta,
            ...(existingMeta.entries || remoteMeta.entries
              ? {
                  entries: {
                    ...(existingMeta.entries || {}),
                    ...(remoteMeta.entries || {}),
                  },
                }
              : {}),
          },
        };
      }
    });

    // Sanitize all media_urls and titles
    Object.keys(merged).forEach((k) => {
      if (merged[k]?.media_url) {
        merged[k].media_url = cleanMediaUrl(k, merged[k].media_url);
      }
      if (k === 'flota_vegvisir' && merged[k]?.title) {
        merged[k].title = merged[k].title.replace(/Vegvisiri/gi, 'Vegvisir');
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
      metadata?: any;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const localCache = getLocalCmsCache();
    const existing = localCache[sectionKey] || DEFAULT_CMS_CONTENT[sectionKey] || {};
    const existingMeta = (existing.metadata as Record<string, any>) || {};
    const newMeta = updates.metadata !== undefined ? updates.metadata : existingMeta;

    const updatedItem: Partial<SiteContent> = {
      ...existing,
      section_key: sectionKey,
      title: updates.title !== undefined ? updates.title : existing.title,
      subtitle: updates.subtitle !== undefined ? updates.subtitle : existing.subtitle,
      body_text: updates.body_text !== undefined ? updates.body_text : existing.body_text,
      media_url: updates.media_url !== undefined ? updates.media_url : existing.media_url,
      metadata: newMeta,
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
            metadata: newMeta,
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
            metadata: newMeta,
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
