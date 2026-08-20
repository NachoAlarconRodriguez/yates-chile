import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type CatalogService = Database['public']['Tables']['catalog_services']['Row'];

export const DEFAULT_SERVICES: CatalogService[] = [
  {
    id: 'srv-1',
    name: 'Cabalgata Guiada por la Isla Robinson Crusoe',
    category: 'cabalgatas',
    description: 'Recorrido a caballo con guías locales por senderos costeros y miradores de Juan Fernández.',
    duration_label: 'Medio Día (4 hrs)',
    price_clp: 75000,
    max_pax: 6,
    image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Buceo & Snorkel con Lobo Fino de Juan Fernández',
    category: 'buceo',
    description: 'Inmersión en aguas cristalinas protegidas con fauna marina endémica única en el planeta.',
    duration_label: '3 Horas',
    price_clp: 95000,
    max_pax: 6,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Trekking Bosque de Helechos Gigantes & Mirador Selkirk',
    category: 'trekking',
    description: 'Caminata botánica y ascenso hacia el mirador histórico de Alejandro Selkirk.',
    duration_label: '5 Horas',
    price_clp: 55000,
    max_pax: 10,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'Cena Gourmet Isleña con Langosta en Quincho',
    category: 'gastronomia',
    description: 'Experiencia culinaria de 4 tiempos maridada con vinos chilenos de autor.',
    duration_label: 'Cena 3 hrs',
    price_clp: 85000,
    max_pax: 11,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const catalogService = {
  async getServices(): Promise<CatalogService[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return DEFAULT_SERVICES;
      }
      return data;
    } catch {
      return DEFAULT_SERVICES;
    }
  },

  async getAllServicesAdmin(): Promise<CatalogService[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return DEFAULT_SERVICES;
      }
      return data;
    } catch {
      return DEFAULT_SERVICES;
    }
  },

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
      const { data, error } = await supabase
        .from('catalog_services')
        .insert({
          name: params.name,
          category: params.category,
          description: params.description,
          duration_label: params.duration_label,
          price_clp: params.price_clp,
          max_pax: params.max_pax,
          image_url: params.image_url || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async toggleServiceActive(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('catalog_services')
        .update({ is_active })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('catalog_services').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
