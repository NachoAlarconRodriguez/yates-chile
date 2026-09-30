/**
 * Translation Service for Yates Chile
 * Connects to Google Gemini API when an API key is configured,
 * or uses the curated nautical/tourism translation engine as a high-fidelity fallback.
 */

const GEMINI_STORAGE_KEY = 'yates_gemini_api_key';

export const translationService = {
  getGeminiApiKey(): string {
    return localStorage.getItem(GEMINI_STORAGE_KEY) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  },

  setGeminiApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  },

  hasGeminiKey(): boolean {
    return Boolean(this.getGeminiApiKey());
  },

  /**
   * Translate a single text string from Spanish to English (or vice versa)
   */
  async translateText(text: string, targetLang: 'EN' | 'ES' = 'EN'): Promise<string> {
    if (!text || !text.trim()) return '';

    const apiKey = this.getGeminiApiKey();

    if (apiKey) {
      try {
        const prompt = `You are a professional translator for a luxury nautical expedition and oceanfront lodge company in Chile (Yates Chile).
Translate the following text to ${targetLang === 'EN' ? 'fluent, sophisticated English' : 'elegante español chileno'}.
Preserve proper names like 'Juan Fernández', 'Alejandro Selkirk', 'Robinson Crusoe', 'Vegvisir', 'Terranova', 'Bahía Cumberland', 'Uberlindo Andaur 222', 'Chile', 'Patagonia', 'Cabo de Hornos'.
Use proper nautical vocabulary (e.g., sailboat, expedition yacht, charter, skipper, knots, starboard, port, cabins, berths, Starlink).
Return ONLY the raw translated text, no quotes, no explanations, no markdown formatting.

Text to translate:
${text}`;

        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
        for (const model of models) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1000,
                  },
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText && candidateText.trim()) {
                let cleaned = candidateText.trim();
                if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
                  cleaned = cleaned.slice(1, -1).trim();
                }
                return cleaned;
              }
            } else {
              console.warn(`Gemini model ${model} returned HTTP ${response.status}`);
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${model} request failed:`, modelErr);
          }
        }
      } catch (err) {
        console.warn('Gemini API translation error, using fallback:', err);
      }
    }

    // High-fidelity fallback translation dictionary for Yates Chile
    return this.fallbackTranslate(text, targetLang);
  },

  /**
   * Translate all text fields of a CMS section
   */
  async translateSection(section: {
    title?: string | null;
    subtitle?: string | null;
    body_text?: string | null;
  }): Promise<{
    title_en: string;
    subtitle_en: string;
    body_text_en: string;
  }> {
    const [title_en, subtitle_en, body_text_en] = await Promise.all([
      section.title ? this.translateText(section.title, 'EN') : Promise.resolve(''),
      section.subtitle ? this.translateText(section.subtitle, 'EN') : Promise.resolve(''),
      section.body_text ? this.translateText(section.body_text, 'EN') : Promise.resolve(''),
    ]);

    return {
      title_en,
      subtitle_en,
      body_text_en,
    };
  },

  /**
   * Translate all entries of a logbook section (nav_title, nav_description, text)
   */
  async translateLogbookEntries(entries: Record<string, any>): Promise<Record<string, any>> {
    const result: Record<string, any> = { ...entries };
    for (const key of Object.keys(entries)) {
      const e = entries[key];
      const [nav_title_en, nav_description_en, text_en] = await Promise.all([
        e.nav_title ? this.translateText(e.nav_title, 'EN') : Promise.resolve(''),
        e.nav_description ? this.translateText(e.nav_description, 'EN') : Promise.resolve(''),
        e.text ? this.translateText(e.text, 'EN') : Promise.resolve(''),
      ]);
      result[key] = {
        ...e,
        nav_title_en: nav_title_en || e.nav_title_en || e.nav_title,
        nav_description_en: nav_description_en || e.nav_description_en || e.nav_description,
        text_en: text_en || e.text_en || e.text,
      };
    }
    return result;
  },

  /**
   * Translate all text fields of an expedition departure
   */
  async translateExpeditionFields(fields: {
    name?: string | null;
    headline?: string | null;
    description?: string | null;
    location?: string | null;
    highlights?: string | null;
  }): Promise<{
    name_en: string;
    headline_en: string;
    description_en: string;
    location_en: string;
    highlights_en: string;
  }> {
    const [name_en, headline_en, description_en, location_en] = await Promise.all([
      fields.name ? this.translateText(fields.name, 'EN') : Promise.resolve(''),
      fields.headline ? this.translateText(fields.headline, 'EN') : Promise.resolve(''),
      fields.description ? this.translateText(fields.description, 'EN') : Promise.resolve(''),
      fields.location ? this.translateText(fields.location, 'EN') : Promise.resolve(''),
    ]);

    let highlights_en = '';
    if (fields.highlights) {
      try {
        const parsed = typeof fields.highlights === 'string' ? JSON.parse(fields.highlights) : fields.highlights;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const translatedPillars = await Promise.all(
            parsed.map(async (p: any) => ({
              ...p,
              title: p.title ? await this.translateText(p.title, 'EN') : p.title,
              desc: p.desc ? await this.translateText(p.desc, 'EN') : p.desc,
            }))
          );
          highlights_en = JSON.stringify(translatedPillars);
        }
      } catch (e) {
        highlights_en = '';
      }
    }

    return {
      name_en,
      headline_en,
      description_en,
      location_en,
      highlights_en,
    };
  },

  /**
   * Domain-specific fallback translator for immediate offline/no-key usage
   */
  fallbackTranslate(text: string, targetLang: 'EN' | 'ES' = 'EN'): string {
    if (!text || targetLang === 'ES') return text;

    const DICTIONARY: Record<string, string> = {
      'EXPEDICIONES PATAGONIA & JUAN FERNÁNDEZ': 'PATAGONIA & JUAN FERNÁNDEZ EXPEDITIONS',
      'Aventura en Territorios Inexplorados & Prístinos': 'Adventure in Unexplored & Pristine Territories',
      'Navegaciones exclusivas en velero y yate de expedición, junto a estadías íntimas en nuestro Lodge Rincón de Navegantes.':
        'Exclusive sailing and expedition yacht journeys, paired with intimate stays at our Rincón de Navegantes Lodge.',
      'Tres Formas de Vivir la Aventura Austral': 'Three Ways to Experience the Austral Adventure',
      'AVENTURA EN TERRITORIOS INEXPLORADOS & PRÍSTINOS': 'ADVENTURE IN UNEXPLORED & PRISTINE TERRITORIES',
      'Explora el Archipiélago Juan Fernández, Isla Alejandro Selkirk y los fiordos del Cabo de Hornos a través de nuestras tres experiencias exclusivas.':
        'Explore the Juan Fernández Archipelago, Alejandro Selkirk Island and Cape Horn fjords through our three signature experiences.',
      'Nuestra Flota de Expedición': 'Our Expedition Fleet',
      'INGENIERÍA OCEÁNICA & CONFORT SUPREMO': 'OCEANIC ENGINEERING & SUPREME COMFORT',
      'Embarcaciones de alto tonelaje preparadas para los mares más desafiantes del Pacífico Sur y fiordos australes.':
        'Heavy-tonnage vessels engineered for the most demanding seas of the South Pacific and austral fjords.',
      'Velero Vegvisir': 'Vegvisir Sailboat',
      'Velero Vegvisir (Dufour 52.5 Grand Large)': 'Vegvisir Sailboat',
      'VELERO OCEÁNICO FRANCÉS • 12 PASAJEROS + TRIPULACIÓN': 'FRENCH OCEANIC SAILBOAT • 12 GUESTS + CREW',
      '52.5 pies de pura navegación a vela con casco oceánico reforzado, 5 cabinas triples y dobles con baño en suite, salón panorámico y equipamiento de navegación satelital de última generación.':
        '52.5 feet of pure ocean sailing with reinforced hull, 5 triple and double en-suite cabins, panoramic saloon and next-generation satellite navigation equipment.',
      '52.5 pies de pura navegación a vela con casco oceánico reforzado, 3 cabinas dobles con baño en suite, salón panorámico y equipamiento de navegación satelital de última generación.':
        '52.5 feet of pure ocean sailing with reinforced hull, 5 triple and double en-suite cabins, panoramic saloon and next-generation satellite navigation equipment.',
      'Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total.':
        'French Dufour 52.5 ft offshore sailboat for austral expeditions with 24/7 Starlink and full self-sufficiency.',
      'Velero de altamar de astillero francés Dufour 52.5 ft con equipamiento oceánico de última generación y autonomía total.':
        '52.5 ft French Dufour offshore sailboat equipped with state-of-the-art oceanic navigation gear and complete autonomy.',
      'Velero de expedición de astillero francés Dufour 52.5 ft con equipamiento oceánico de última generación y autonomía total.':
        '52.5 ft French Dufour offshore sailboat equipped with state-of-the-art oceanic navigation gear and complete autonomy.',
      'Yate Terranova': 'Terranova Yacht',
      'Yate Terranova (Yate Oceánico 60ft)': 'Terranova Yacht',
      'CRUCERO EXPLORER • 8 PASAJEROS + TRIPULACIÓN': 'EXPLORER CRUISER • 8 GUESTS + CREW',
      'Yate Hatteras 65ft LRC americano de 3 cubiertas (20 PAX • 5 cabinas • 5 baños) con 3.000 MN de autonomía y Starlink 24/7.':
        'American Hatteras 65ft LRC 3-deck yacht (20 PAX • 5 cabins • 5 baths) with 3,000 NM range and 24/7 Starlink.',
      'Yate oceánico 65ft de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.':
        '65ft oceanic expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
      'Yate de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.':
        'Expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
      'Yate de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac auxiliar para desembarcos costeros.':
        'Expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and Zodiac tender for coastal landings.',
      'Lodge Rincón de Navegantes': 'Rincón de Navegantes Lodge',
      'Uberlindo Andaur 222 • Isla Robinson Crusoe': 'Uberlindo Andaur 222 • Robinson Crusoe Island',
      'Lodge frente al mar en Uberlindo Andaur 222 (11 PAX • 4 cabinas con baño privado), amplio quincho, terraza y exploraciones en Robinson Crusoe.':
        'Oceanfront Lodge at Uberlindo Andaur 222 (11 GUESTS • 4 en-suite cabins), expansive BBQ lounge, terrace, and Robinson Crusoe expeditions.',
      'Ubicado justo frente al mar en la Bahía Cumberland. Diseñado en torno a 4 cabinas independientes con baño privado cada una y vista al océano para hasta 11 pasajeros, amplio quincho, terraza y expediciones exclusivas.':
        'Located directly oceanfront in Cumberland Bay. Designed around 4 independent en-suite cabins each with ocean views for up to 11 guests, expansive BBQ terrace and exclusive expeditions.',
      'Ubicado justo frente al mar en la Bahía Cumberland. Diseñado en torno a 4 cabinas independientes con baño privado y vista al océano para hasta 11 pasajeros, amplio quincho, terraza y expediciones exclusivas.':
        'Located directly oceanfront in Cumberland Bay. Designed around 4 independent en-suite cabins with ocean views for up to 11 guests, expansive BBQ terrace and exclusive expeditions.',
      'Gastronomía de Mar & Quincho de Navegantes': 'Ocean Gastronomy & Navigators BBQ',
      'SABORES AUTÉNTICOS DEL ARCHIPIÉLAGO': 'AUTHENTIC ARCHIPELAGO FLAVORS',
      'Langosta de Juan Fernández fresca, vidriola, caracoles de roca y productos de la huerta local preparados por nuestros chefs anfitriones al calor de las brasas.':
        'Fresh Juan Fernández lobster, yellowtail amberjack, sea snails and local organic garden produce grilled over embers by our host chefs.',
      'Rutas & Expediciones Australes': 'Austral Routes & Expeditions',
      'TRAVESÍAS DE ALTAMAR & RESERVAS DE LA BIOSFERA': 'BLUEMARINE OFFSHORE VOYAGES & BIOSPHERE RESERVES',
      'Expediciones científicas y de aventura guiadas por capitanes expertos en Juan Fernández, Alejandro Selkirk y los canales patagónicos.':
        'Scientific and adventure expeditions guided by expert captains across Juan Fernández, Alejandro Selkirk and Patagonian channels.',
      'Concierge & Atención Personalizada': 'Concierge & Private Assistance',
      'ASESORÍA NÁUTICA & PLANIFICACIÓN A MEDIDA': 'NAUTICAL ADVISORY & BESPOKE PLANNING',
      'Nuestro equipo de concierge está a su entera disposición para coordinar itinerarios privados, vuelos chárter a la isla y requerimientos especiales.':
        'Our concierge team is at your complete disposal to coordinate private itineraries, island charter flights and bespoke requirements.',
      // Logbook entries translation
      'Climatización Sistema Webasto': 'Webasto Heating System & Climate Control',
      'Sistema de calefacción por radiadores de agua caliente controlable en cada camarote, garantizando noches de confort y abrigo térmico absoluto en aguas glaciales.':
        'Hot-water radiator heating system individually controllable in every cabin, guaranteeing optimal thermal comfort in glacial waters.',
      'Gastronomía': 'Oceanic Gastronomy',
      'La alimentación durante nuestras travesías está pensada para acompañar la vida a bordo: comidas caseras, nutritivas y adecuadas a una navegación oceánica. La alimentación es parte de la experiencia de navegar: simple, abundante y adaptada al ritmo del mar.':
        'Catering throughout our voyages is tailored for life at sea: hearty, wholesome, nourishing meals adapted to oceanic sailing rhythms.',
      'Casco Reforzado': 'Reinforced Heavy-Duty Hull',
      'Ingeniería de casco robusta y preparada para navegaciones oceánicas y zonas remotas, desde las aguas abiertas del Pacífico hacia el Archipiélago Juan Fernández y Robinson Crusoe, hasta la geografía extrema de los fiordos, canales e islas del extremo sur de Chile.':
        'Robust hull engineering prepared for oceanic routes and remote frontiers, from open Pacific crossings to extreme Patagonian fiord navigation.',
      'Desembarcos Seguros': 'Safe Coastal Landings',
      'Equipado con bote Zodiac auxiliar de alta flotabilidad, que permite realizar desembarcos y aproximaciones en sectores donde no existen muelles o infraestructura portuaria, facilitando el acceso desde el velero a playas, caletas y otros puntos de interés.':
        'Equipped with high-buoyancy Zodiac auxiliary tender for safe landings and close approaches in remote bays without port infrastructure.',
      'Deck Superior & Flybridge': 'Upper Deck & Flybridge',
      'Parrilla exterior y amplitud en el flybridge con segundo puente de gobierno, ofreciendo el espacio perfecto para compartir con vista panorámica de 360°.':
        'Outdoor BBQ grill and spacious flybridge with secondary helm station, providing a 360° panoramic lounge over the fjords.',
      'Salón Central & Gastronomía': 'Main Saloon & Dining',
      'Cocina full equipo y amplio comedor en la Cubierta 2 para disfrutar de centolla y pesca fresca del día frente a ventanales panorámicos.':
        'Fully-equipped galley and expansive dining salon on Deck 2 to enjoy fresh king crab and daily catch against panoramic windows.',
      'Autonomía 3.000 MN & Motores Detroit': '3,000 NM Range & Detroit Diesels',
      'Doble motorización Detroit de 450 HP c/u y estanque diésel de 10.000 L para navegar sin escalas los canales y fiordos más remotos de la Patagonia.':
        'Twin 450 HP Detroit diesel engines and 10,000L fuel capacity for non-stop navigation through the remote southern Chilean channels.',
      'Zodiac Yamaha 70 HP & Grúa 1T': 'Zodiac Yamaha 70 HP & 1T Crane',
      'Zodiac semirrígido de 5 metros con motor Yamaha 70 HP (4 tiempos) y grúa de 1 tonelada para desembarcos rápidos y seguros en cualquier costa.':
        '5-meter rigid inflatable Zodiac with 70 HP Yamaha outboard and 1-ton davit crane for agile and secure coastal landings.',
      'Arquitectura & Aislación Térmica': 'Architecture & Thermal Insulation',
      'Arquitectura armónica con el entorno, altos estándares de calidad, excelente aislación térmica y materiales resistentes para un confort total.':
        'Environmentally harmonious architecture, premium thermal insulation and weather-resistant materials for total island comfort.',
      'Amplio Quincho & Encuentros': 'Expansive BBQ Lounge & Gatherings',
      'Quincho acogedor para compartir, cocinar y disfrutar de comidas al calor de las brasas frente al mar.':
        'Cozy oceanfront BBQ pavilion to gather, cook and savor grilled delicacies over embers against Cumberland Bay.',
      'Exploraciones Exclusivas': 'Exclusive Island Expeditions',
      'Cabalgatas, senderismo en bosques endémicos, buceo y snorkel con fauna marina, y navegaciones costeras.':
        'Horseback trekking, endemic forest hiking, marine fauna scuba/snorkeling and coastal cruising guided by local masters.',
      'Atardeceres Frente al Mar': 'Oceanfront Sunsets',
      'Ubicación privilegiada en Bahía Cumberland para contemplar la caída del sol sobre el océano.':
        'Prime location in Cumberland Bay to witness breathtaking sunsets as twilight illuminates the Pacific ocean.',
      // Expeditions & Calendar Specifics
      'Expedición Cabo de Hornos': 'Cape Horn Expedition',
      'Travesía Robinson Crusoe': 'Robinson Crusoe Voyage',
      'Expedición Robinson Crusoe': 'Robinson Crusoe Expedition',
      'Desafío Alejandro Selkirk': 'Alejandro Selkirk Challenge',
      'Expedición Fiordos & Glaciares': 'Fjords & Glaciers Expedition',
      'La máxima aventura náutica mundial: circunvalar el mítico Cabo de Hornos a vela con patrón de ultramar y máxima seguridad.':
        'The ultimate global sailing adventure: circumnavigating mythical Cape Horn under sail with master skipper and highest safety standards.',
      'Navegación oceánica de altura hacia los confines del planeta en los días más largos del año en latitudes australes.':
        'Bluewater ocean sailing towards the ends of the Earth during the longest days of the austral year.',
      'Travesía de verano en las aguas míticas de Magallanes con desembarco en el monumento al Albatros en Isla de Hornos.':
        'Summer ocean voyage in Magellan waters featuring landing at the Albatross monument on Horn Island.',
      'Aventura oceánica a vela hacia Juan Fernández con descanso en cabinas privadas en Bahía Cumberland.':
        'Ocean sailing adventure to Juan Fernández with private cabin comfort in Cumberland Bay.',
      'Navegación rápida de alto confort en Yate Terranova de 3 cubiertas por el Archipiélago Juan Fernández.':
        'Fast high-comfort cruising aboard 3-deck Terranova Yacht across Juan Fernández Archipelago.',
      'Temporada alta de verano: navegación a vela, buceo en aguas cristalinas y senderismo por bosques de helechos gigantes.':
        'Peak summer season: ocean sailing, crystal-clear scuba diving, and hiking through giant fern forests.',
      'Expedición hacia la isla más remota e indómita del Pacífico Sur chileno, con avistamiento de fauna y pesca deportiva de altura.':
        'Expedition to the most remote and untamed island in the Chilean South Pacific, featuring wildlife watching and sport fishing.',
      'Travesía a vela hacia la mítica Isla Más Afuera con fondeos en caletas vírgenes y exploración de cumbres escarpadas.':
        'Sail voyage to the mythical Más Afuera Island with anchorages in virgin coves and rugged mountain trekking.',
      'Travesía de descanso en primavera tardía. Recorra senderos rodeados de helechos gigantes y disfrute de la primera pesca de langosta de la temporada.':
        'Late spring relaxation voyage. Hike trails surrounded by giant ferns and savor the first lobster catch of the season.',
      // Locations & Best View Times
      'Bahía Cumberland': 'Cumberland Bay',
      'Isla Robinson Crusoe': 'Robinson Crusoe Island',
      'Isla Alejandro Selkirk': 'Alejandro Selkirk Island',
      'Isla Alejandro Selkirk (Más Afuera)': 'Alejandro Selkirk Island (Más Afuera)',
      'Canal Beagle & Cabo de Hornos': 'Beagle Channel & Cape Horn',
      'Isla de Hornos': 'Horn Island',
      'Cabo de Hornos': 'Cape Horn',
      'Océano Pacífico Profundo': 'Deep Pacific Ocean',
      'Archipiélago Juan Fernández': 'Juan Fernández Archipelago',
      'Mañana templada': 'Mild morning',
      'Tarde despejada': 'Clear afternoon',
      'Floración primaveral': 'Spring bloom',
      'Verano calmo': 'Calm summer',
      'Pesca y trekking': 'Fishing & trekking',
      'Viento favorable': 'Favorable wind',
      'Primavera austral': 'Austral spring',
      'Solsticio de verano': 'Summer solstice',
      'Verano austral': 'Austral summer',
      // Dynamic Specs, Badges & Labels
      'NORTE / ASTILLERO': 'NORTH / SHIPYARD',
      'OESTE / CAPACIDAD': 'WEST / CAPACITY',
      'SUR / TECNOLOGÍA': 'SOUTH / TECHNOLOGY',
      'SUR / PROPULSIÓN': 'SOUTH / PROPULSION',
      'ESTE / SERVICIO': 'EAST / SERVICE',
      'ESTE / DESEMBARCO': 'EAST / LANDINGS',
      'ESTE / AUXILIAR': 'EAST / AUXILIARY TENDER',
      'Conexión Satelital & Navegación': 'Satellite Connection & Navigation',
      'Servicio & Seguridad de Bordo': 'Onboard Service & Safety',
      'Patrón + Tripulación': 'Skipper + Crew',
      'Patrón de Ultramar + Tripulación': 'Master Mariner + Crew',
      'Chartes Privados': 'Private Charters',
      'Charters Privados': 'Private Charters',
      'Astillero Naval': 'Naval Shipyard',
      'Matrícula': 'Registry',
      'Velero Punta Sur': 'Sailboat Punta Sur',
      'Climatización & Confort Térmico': 'Climate Control & Thermal Comfort',
      'Diseñado para Expediciones': 'Engineered for Expeditions',
      'Diseñado para Expediciones ': 'Engineered for Expeditions',
      'Gastronomía Oceánica': 'Oceanic Gastronomy',
      'Día 12 de Travesía': 'Day 12 of Passage',
      'Día 15 de Travesía': 'Day 15 of Passage',
      'Día 17 de Travesía': 'Day 17 of Passage',
      'Día 18 de Travesía': 'Day 18 of Passage',
      'Día 20 de Travesía': 'Day 20 of Passage',
      'Calma': 'Calm',
      'Editando': 'Editing',
    };

    const trimmed = text.trim();
    if (DICTIONARY[trimmed]) return DICTIONARY[trimmed];

    // Pattern-based translations
    let translated = text
      .replace(/Expedición Juan Fernández\s*—\s*1 de Noviembre/gi, 'Juan Fernández Expedition — November 1st')
      .replace(/Expedición Juan Fernández\s*—\s*15 de Noviembre/gi, 'Juan Fernández Expedition — November 15th')
      .replace(/Expedición Juan Fernández/gi, 'Juan Fernández Expedition')
      .replace(/Expedición Cabo de Hornos/gi, 'Cape Horn Expedition')
      .replace(/Travesía Robinson Crusoe/gi, 'Robinson Crusoe Voyage')
      .replace(/Expedición Robinson Crusoe/gi, 'Robinson Crusoe Expedition')
      .replace(/Desafío Alejandro Selkirk/gi, 'Alejandro Selkirk Challenge')
      .replace(/Velero Punta Sur/gi, 'Sailboat Punta Sur')
      .replace(/Velero Vegvisir/gi, 'Vegvisir Sailboat')
      .replace(/Yate Terranova/gi, 'Terranova Yacht')
      .replace(/Bahía Cumberland/gi, 'Cumberland Bay')
      .replace(/Isla Robinson Crusoe/gi, 'Robinson Crusoe Island')
      .replace(/Isla Alejandro Selkirk/gi, 'Alejandro Selkirk Island')
      .replace(/Cabo de Hornos/gi, 'Cape Horn')
      .replace(/NORTE\s*\/\s*ASTILLERO/gi, 'NORTH / SHIPYARD')
      .replace(/OESTE\s*\/\s*CAPACIDAD/gi, 'WEST / CAPACITY')
      .replace(/SUR\s*\/\s*TECNOLOG[ÍI]A/gi, 'SOUTH / TECHNOLOGY')
      .replace(/SUR\s*\/\s*PROPULSI[ÓO]N/gi, 'SOUTH / PROPULSION')
      .replace(/ESTE\s*\/\s*SERVICIO/gi, 'EAST / SERVICE')
      .replace(/ESTE\s*\/\s*DESEMBARCO/gi, 'EAST / LANDINGS')
      .replace(/ESTE\s*\/\s*AUXILIAR/gi, 'EAST / AUXILIARY TENDER')
      .replace(/Conexi[oó]n Satelital\s*&\s*Navegaci[oó]n/gi, 'Satellite Connection & Navigation')
      .replace(/Servicio\s*&\s*Seguridad de Bordo/gi, 'Onboard Service & Safety')
      .replace(/Patr[oó]n de Ultramar\s*\+\s*Tripulaci[oó]n/gi, 'Master Mariner + Crew')
      .replace(/Patr[oó]n\s*\+\s*Tripulaci[oó]n/gi, 'Skipper + Crew')
      .replace(/Chart?ers?\s+Privados/gi, 'Private Charters')
      .replace(/Matr[íi]cula\s*([A-Za-z0-9\s]+)/gi, 'Registry $1')
      .replace(/(\d+)\s+Pasajeros/gi, '$1 Guests')
      .replace(/(\d+)\s+Cabinas?\s*•\s*(\d+)\s+Baños?/gi, '$1 Cabins • $2 Bathrooms')
      .replace(/(\d+)\s+Cubiertas?\s*•\s*(\d+)\s+Cabinas?\s*\/\s*(\d+)\s+Baños?/gi, '$1 Decks • $2 Cabins / $3 Bathrooms')
      .replace(/1 de Enero/gi, 'January 1st')
      .replace(/1 de Febrero/gi, 'February 1st')
      .replace(/1 de Marzo/gi, 'March 1st')
      .replace(/1 de Abril/gi, 'April 1st')
      .replace(/1 de Mayo/gi, 'May 1st')
      .replace(/1 de Junio/gi, 'June 1st')
      .replace(/1 de Julio/gi, 'July 1st')
      .replace(/1 de Agosto/gi, 'August 1st')
      .replace(/1 de Septiembre/gi, 'September 1st')
      .replace(/1 de Octubre/gi, 'October 1st')
      .replace(/1 de Noviembre/gi, 'November 1st')
      .replace(/1 de Diciembre/gi, 'December 1st')
      .replace(/15 de Noviembre/gi, 'November 15th')
      .replace(/Mañana templada/gi, 'Mild morning')
      .replace(/Primavera austral/gi, 'Austral spring')
      .replace(/Verano austral/gi, 'Austral summer')
      .replace(/Solsticio de verano/gi, 'Summer solstice')
      .replace(/Floración primaveral/gi, 'Spring bloom')
      .replace(/Verano calmo/gi, 'Calm summer')
      .replace(/Pesca y trekking/gi, 'Fishing & trekking')
      .replace(/Viento favorable/gi, 'Favorable wind')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Oct\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Oct $1')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Nov\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Nov $1')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Dic\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Dec $1')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Ene\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Jan $1')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Feb\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Feb $1')
      .replace(/Expedición Robinson Crusoe\s*[-–—]\s*Mar\s*(\d{4})/gi, 'Robinson Crusoe Expedition – Mar $1')
      .replace(/La expedición insular por excelencia hacia uno de los ecosistemas con mayor endemismo del planeta\./gi, 'The quintessential island expedition to one of the ecosystems with the highest endemism on the planet.')
      .replace(/Una travesía de 15 días navegando a vela hacia la mítica isla que inspiró la novela de Daniel Defoe, combinando navegación de alta mar, buceo con lobos marinos finos de dos pelos, senderismo por bosques de helechos gigantes y descanso en cabinas privadas\./gi, 'A 15-day ocean sailing journey to the mythical island that inspired Daniel Defoe’s novel, blending offshore sailing, scuba diving with Juan Fernández fur seals, trekking through giant fern forests, and lodging in private en-suite cabins.')
      .replace(/Una travesía de 15 días navegando a vela hacia la mítica isla que inspiró la novela de Daniel Defoe/gi, 'A 15-day ocean sailing journey to the mythical island that inspired Daniel Defoe’s novel')
      .replace(/Archipiélago Juan Fernández/gi, 'Juan Fernández Archipelago')
      .replace(/[-–—]\s*Ene\s+(\d{4})/gi, '– Jan $1')
      .replace(/[-–—]\s*Abr\s+(\d{4})/gi, '– Apr $1')
      .replace(/[-–—]\s*Ago\s+(\d{4})/gi, '– Aug $1')
      .replace(/[-–—]\s*Dic\s+(\d{4})/gi, '– Dec $1')
      .replace(/Velero/gi, 'Sailboat')
      .replace(/Yate/gi, 'Yacht')
      .replace(/Expedición/gi, 'Expedition')
      .replace(/Expediciones/gi, 'Expeditions')
      .replace(/Navegación/gi, 'Sailing')
      .replace(/Travesía/gi, 'Voyage')
      .replace(/Habitación/gi, 'Room')
      .replace(/Habitaciones/gi, 'Rooms')
      .replace(/Cabinas/gi, 'Cabins')
      .replace(/Pasajeros/gi, 'Guests')
      .replace(/Baño privado/gi, 'Private bathroom')
      .replace(/Vista al océano/gi, 'Ocean view')
      .replace(/Frente al mar/gi, 'Oceanfront')
      .replace(/Reservar/gi, 'Book')
      .replace(/Descargar Brochure/gi, 'Download Brochure')
      .replace(/Cupos disponibles/gi, 'spots available');

    return translated;
  },

  translateFallbackText(text: string, targetLang: 'EN' | 'ES' = 'EN'): string {
    return this.fallbackTranslate(text, targetLang);
  },
};
