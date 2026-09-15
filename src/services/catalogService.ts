import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { normalizeExternalMediaUrl } from './cmsService';

export type CatalogService = Database['public']['Tables']['catalog_services']['Row'];

export const normalizeCatalogService = (item: CatalogService): CatalogService => ({
  ...item,
  image_url: item.image_url ? normalizeExternalMediaUrl(item.image_url) : item.image_url,
});

/**
 * UUIDs oficiales sincronizados con la base de datos Supabase en backend
 */
export const DEFAULT_SERVICES: CatalogService[] = [
  {
    id: 'bdd7977c-f274-4b6d-bfdb-fd92c92f1b93',
    name: 'Cabalgata Guiada por la Isla Robinson Crusoe',
    category: 'cabalgatas',
    description: 'Recorrido a caballo con guías locales por senderos costeros y miradores de Juan Fernández.',
    duration_label: 'Medio Día (4 hrs)',
    price_clp: 75000,
    max_pax: 6,
    image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-19T15:41:12.30791+00:00',
  },
  {
    id: '99c7fbb1-9c0f-441f-9519-b85e6f9115a8',
    name: 'Buceo & Snorkel con Lobo Fino de Juan Fernández',
    category: 'buceo',
    description: 'Inmersión en aguas cristalinas protegidas con fauna marina endémica única en el planeta.',
    duration_label: '3 Horas',
    price_clp: 95000,
    max_pax: 6,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-19T15:41:12.30791+00:00',
  },
  {
    id: '57a96621-2373-4d62-8636-cd5c38b00596',
    name: 'Trekking Bosque de Helechos Gigantes & Mirador Selkirk',
    category: 'trekking',
    description: 'Caminata botánica y ascenso hacia el mirador histórico de Alejandro Selkirk.',
    duration_label: '5 Horas',
    price_clp: 55000,
    max_pax: 10,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-19T15:41:12.30791+00:00',
  },
  {
    id: '6ba35288-9284-415f-92f5-76c58fb107d9',
    name: 'Cena Gourmet Isleña con Langosta de Juan Fernández en Quincho',
    category: 'gastronomia',
    description: 'Experiencia culinaria de 4 tiempos maridada con vinos chilenos de autor.',
    duration_label: 'Cena 3 hrs',
    price_clp: 85000,
    max_pax: 11,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-19T15:41:12.30791+00:00',
  },
];

// Mapa para compatibilidad transparente de identificadores antiguos a UUIDs reales de Supabase
export const LEGACY_ID_MAP: Record<string, string> = {
  'srv-1': 'bdd7977c-f274-4b6d-bfdb-fd92c92f1b93',
  'srv-2': '99c7fbb1-9c0f-441f-9519-b85e6f9115a8',
  'srv-3': '57a96621-2373-4d62-8636-cd5c38b00596',
  'srv-4': '6ba35288-9284-415f-92f5-76c58fb107d9',
};

const LOCAL_STORAGE_SERVICES_KEY = 'yates_catalog_services_v3';

// Limpieza proactiva de almacenamiento legacy con IDs duplicados 'srv-'
try {
  if (typeof window !== 'undefined' && localStorage.getItem('yates_catalog_services_v2')) {
    localStorage.removeItem('yates_catalog_services_v2');
  }
} catch {}

const getCachedServices = (): CatalogService[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalizar IDs antiguos y deduplicar
      const map = new Map<string, CatalogService>();
      parsed.forEach((item: CatalogService) => {
        const realId = LEGACY_ID_MAP[item.id] || item.id;
        const normalized = normalizeCatalogService({ ...item, id: realId });
        map.set(realId, normalized);
      });
      return Array.from(map.values());
    }
    return DEFAULT_SERVICES;
  } catch {
    return DEFAULT_SERVICES;
  }
};

const saveCachedServices = (list: CatalogService[]) => {
  try {
    const map = new Map<string, CatalogService>();
    list.forEach((item) => {
      const realId = LEGACY_ID_MAP[item.id] || item.id;
      const normalized = normalizeCatalogService({ ...item, id: realId });
      map.set(realId, normalized);
    });
    const cleanList = Array.from(map.values());
    localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(cleanList));
    window.dispatchEvent(new CustomEvent('yates_catalog_services_updated'));
  } catch {}
};

export const catalogService = {
  getCachedServices,
  /**
   * Obtiene exclusivamente los servicios ACTIVOS para la web pública y cotizaciones.
   * Consulta directamente Supabase (Backend) como fuente de la verdad.
   */
  async getServices(): Promise<CatalogService[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized = data.map(normalizeCatalogService);
        saveCachedServices(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Fallo consulta Supabase getServices, usando caché local:', err);
    }
    return getCachedServices().filter((s) => s.is_active !== false);
  },

  /**
   * Obtiene TODOS los servicios (activos y pausados) para el panel de administración.
   * Consulta directamente el backend Supabase para garantizar datos frescos.
   */
  async getAllServicesAdmin(): Promise<CatalogService[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized = data.map(normalizeCatalogService);
        saveCachedServices(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Fallo consulta Supabase getAllServicesAdmin, usando caché local:', err);
    }
    return getCachedServices();
  },

  /**
   * Crea un nuevo servicio persistiendo directamente en la base de datos Supabase.
   */
  async createService(params: {
    name: string;
    category: 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar';
    description: string;
    duration_label: string;
    price_clp: number;
    max_pax: number;
    image_url?: string;
  }): Promise<{ success: boolean; data?: CatalogService; error?: string }> {
    try {
      const finalImageUrl = params.image_url ? normalizeExternalMediaUrl(params.image_url) : null;
      const { data, error } = await supabase
        .from('catalog_services')
        .insert({
          name: params.name,
          category: params.category,
          description: params.description,
          duration_label: params.duration_label,
          price_clp: params.price_clp,
          max_pax: params.max_pax,
          image_url: finalImageUrl,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error insertando en Supabase:', error);
        return { success: false, error: error.message };
      }

      if (data) {
        const current = getCachedServices();
        saveCachedServices([data, ...current.filter((s) => s.id !== data.id)]);
        return { success: true, data };
      }
    } catch (err: any) {
      console.error('Error de red al crear servicio:', err);
      return { success: false, error: err?.message || 'Error de conexión con el backend' };
    }

    return { success: false, error: 'No se pudo crear el servicio en el backend' };
  },

  /**
   * Pausa o reactiva una experiencia en la base de datos Supabase con persistencia local inmediata.
   */
  async toggleServiceActive(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
    const targetId = LEGACY_ID_MAP[id] || id;
    const current = getCachedServices();
    // 1. Guardar de inmediato en memoria y localStorage para respuesta instantánea (0ms)
    const updated = current.map((s) => (s.id === id || s.id === targetId ? { ...s, is_active } : s));
    saveCachedServices(updated);

    try {
      const { data, error } = await supabase
        .from('catalog_services')
        .update({ is_active })
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando is_active en Supabase:', error);
        // Revertir caché local si falla la persistencia remota
        saveCachedServices(current);
        return { success: false, error: error.message };
      }

      if (data) {
        const synced = getCachedServices().map((s) => (s.id === id || s.id === targetId ? data : s));
        saveCachedServices(synced);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error de red al pausar/activar en Supabase:', err);
      // Revertir caché local si falla la conexión
      saveCachedServices(current);
      return { success: false, error: err?.message || 'Error de conexión con el servidor' };
    }
  },

  /**
   * Modifica los datos de una experiencia (Nombre, Valor, Link de Imagen, etc.)
   * Persistencia garantizada en la tabla catalog_services de Supabase.
   */
  async updateService(
    id: string,
    params: Partial<{
      name: string;
      category: 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar';
      description: string;
      duration_label: string;
      price_clp: number;
      max_pax: number;
      image_url: string | null;
      is_active: boolean;
    }>
  ): Promise<{ success: boolean; data?: CatalogService; error?: string }> {
    const targetId = LEGACY_ID_MAP[id] || id;

    const updatePayload: Database['public']['Tables']['catalog_services']['Update'] = {};
    if (params.name !== undefined) updatePayload.name = params.name;
    if (params.category !== undefined) updatePayload.category = params.category;
    if (params.description !== undefined) updatePayload.description = params.description;
    if (params.duration_label !== undefined) updatePayload.duration_label = params.duration_label;
    if (params.price_clp !== undefined) updatePayload.price_clp = params.price_clp;
    if (params.max_pax !== undefined) updatePayload.max_pax = params.max_pax;
    if (params.image_url !== undefined) {
      updatePayload.image_url = params.image_url ? normalizeExternalMediaUrl(params.image_url) : null;
    }
    if (params.is_active !== undefined) updatePayload.is_active = params.is_active;

    try {
      // 1. Guardar estrictamente en backend Supabase
      const { data, error } = await supabase
        .from('catalog_services')
        .update(updatePayload)
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando experiencia en Supabase:', error);
        return { success: false, error: error.message };
      }

      if (data) {
        // 2. Actualizar caché local y notificar eventos en tiempo real
        const current = getCachedServices();
        const updated = current
          .filter((s) => s.id !== id && s.id !== targetId)
          .concat(data);
        saveCachedServices(updated);
        return { success: true, data };
      }
    } catch (err: any) {
      console.error('Error de red al actualizar en Supabase:', err);
      return { success: false, error: err?.message || 'Error de conexión con el backend' };
    }

    return { success: false, error: 'No se pudo guardar la experiencia en la base de datos' };
  },

  /**
   * Elimina permanentemente una experiencia del catálogo en Supabase.
   */
  async deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    const targetId = LEGACY_ID_MAP[id] || id;
    try {
      const { error } = await supabase
        .from('catalog_services')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error('Error eliminando en Supabase:', error);
        return { success: false, error: error.message };
      }

      const current = getCachedServices();
      saveCachedServices(current.filter((s) => s.id !== id && s.id !== targetId));
      return { success: true };
    } catch (err: any) {
      console.error('Error al eliminar en Supabase:', err);
      return { success: false, error: err?.message };
    }
  },
};
