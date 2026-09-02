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

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
            return candidateText.trim();
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
   * Domain-specific fallback translator for immediate offline/no-key usage
   */
  fallbackTranslate(text: string, targetLang: 'EN' | 'ES'): string {
    if (targetLang === 'ES') return text;

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
        '52.5 feet of pure ocean sailing with reinforced hull, 3 double en-suite cabins, panoramic saloon and next-generation satellite navigation equipment.',
      'Yate Terranova': 'Terranova Yacht',
      'Yate Terranova (Yate Oceánico 60ft)': 'Terranova Yacht',
      'CRUCERO EXPLORER • 8 PASAJEROS + TRIPULACIÓN': 'EXPLORER CRUISER • 8 GUESTS + CREW',
      'Yate oceánico 65ft de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.':
        '65ft oceanic expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
      'Yate de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac semirrígido de 5 mts de eslora con motor Yamaha 70 HP (4 tiempos) para desembarcos costeros.':
        'Expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and 5m rigid-inflatable Zodiac tender with Yamaha 70 HP (4-stroke) engine for coastal landings.',
      'Yate de expedición con casco de desplazamiento pesado, doble motorización marina, estabilizadores giroscópicos, flybridge panorámico y Zodiac auxiliar para desembarcos costeros.':
        'Expedition yacht with heavy displacement hull, twin marine diesel engines, gyroscopic stabilizers, panoramic flybridge and Zodiac tender for coastal landings.',
      'Lodge Rincón de Navegantes': 'Rincón de Navegantes Lodge',
      'Uberlindo Andaur 222 • Isla Robinson Crusoe': 'Uberlindo Andaur 222 • Robinson Crusoe Island',
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
    };

    if (DICTIONARY[text]) return DICTIONARY[text];

    // Generic replacements
    let translated = text
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
};
