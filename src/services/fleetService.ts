import { supabase } from '../lib/supabase';
import { FLEET_DATA } from '../lib/constants';
import type { Vessel } from '../types';

const LOCAL_STORAGE_FLEET_KEY = 'yates_fleet_v2';

const mapRowToVessel = (row: any): Vessel => {
  const isTerranova = row.id === 'terranova' || (row.name && row.name.toLowerCase().includes('terranova'));
  const fallback = isTerranova ? FLEET_DATA[1] : FLEET_DATA[0];

  return {
    id: row.id,
    name: row.name || fallback.name,
    type: row.type || fallback.type,
    tagline: row.tagline || fallback.tagline,
    description: row.description || fallback.description,
    length: row.builder ? `${row.builder}` : fallback.length,
    capacity: `${row.capacity_pax || fallback.maxPax || 12} Pasajeros`,
    maxPax: row.capacity_pax || fallback.maxPax || 12,
    cabins: `${row.cabins_count || fallback.cabins || '5'} Cabinas`,
    bathrooms: `${row.bathrooms_count || fallback.bathrooms || '5'} Baños`,
    registration: row.registration || fallback.registration,
    builder: row.builder || fallback.builder,
    crew: row.crew || fallback.crew,
    badge: row.badge || fallback.badge,
    mainImage: row.main_image || fallback.mainImage,
    gallery: fallback.gallery || [],
    features: Array.isArray(row.features) && row.features.length > 0 ? row.features : fallback.features,
    hotspots: Array.isArray(row.hotspots) && row.hotspots.length > 0 ? row.hotspots : fallback.hotspots,
    specs: fallback.specs,
    isActive: row.is_active !== undefined ? row.is_active : true,
  };
};

const mapVesselToRow = (v: Partial<Vessel>): Record<string, any> => {
  const row: Record<string, any> = {};
  if (v.id) row.id = v.id;
  if (v.name !== undefined) row.name = v.name;
  if (v.type !== undefined) row.type = v.type;
  if (v.tagline !== undefined) row.tagline = v.tagline;
  if (v.description !== undefined) row.description = v.description;
  if (v.maxPax !== undefined) row.capacity_pax = v.maxPax;
  if (v.cabins !== undefined) row.cabins_count = parseInt(v.cabins, 10) || 5;
  if (v.bathrooms !== undefined) row.bathrooms_count = parseInt(v.bathrooms, 10) || 5;
  if (v.registration !== undefined) row.registration = v.registration;
  if (v.builder !== undefined) row.builder = v.builder;
  if (v.crew !== undefined) row.crew = v.crew;
  if (v.badge !== undefined) row.badge = v.badge;
  if (v.mainImage !== undefined) row.main_image = v.mainImage;
  if (v.features !== undefined) row.features = v.features;
  if (v.hotspots !== undefined) row.hotspots = v.hotspots;
  if (v.isActive !== undefined) row.is_active = v.isActive;
  return row;
};

export const fleetService = {
  async getVessels(): Promise<Vessel[]> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapRowToVessel);
        try {
          localStorage.setItem(LOCAL_STORAGE_FLEET_KEY, JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('Fleet fetch from Supabase warning:', err);
    }

    // Fallback to local cache or constants
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FLEET_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return FLEET_DATA;
  },

  async getVesselById(id: string): Promise<Vessel | null> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapRowToVessel(data);
      }
    } catch {}

    const vessels = await this.getVessels();
    return vessels.find((v) => v.id === id) || null;
  },

  async createVessel(vessel: Omit<Vessel, 'id'> & { id?: string }): Promise<Vessel> {
    const newId = vessel.id || `vessel-${Date.now()}`;
    const row = mapVesselToRow({ ...vessel, id: newId });

    try {
      const { data, error } = await (supabase.from('vessels') as any)
        .insert(row)
        .select()
        .single();

      if (!error && data) {
        return mapRowToVessel(data);
      }
    } catch (err) {
      console.warn('Supabase create vessel warning:', err);
    }

    const fallback: Vessel = {
      ...vessel,
      id: newId,
      isActive: vessel.isActive !== undefined ? vessel.isActive : true,
      features: vessel.features && vessel.features.length > 0 ? vessel.features : [
        `${vessel.length || '50 ft'} de eslora`,
        `Capacidad ${vessel.maxPax || 10} PAX`,
        'Conexión satelital Starlink 24/7',
        'Instrumental náutico de alta precisión'
      ],
      hotspots: vessel.hotspots || []
    };
    return fallback;
  },

  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    const row = mapVesselToRow(updates);

    try {
      const { data, error } = await (supabase.from('vessels') as any)
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const updated = mapRowToVessel(data);
        return updated;
      }
    } catch (err) {
      console.warn('Supabase update vessel error:', err);
    }

    return { id, ...updates } as Vessel;
  },

  async deleteVessel(id: string): Promise<{ success: boolean; message?: string }> {
    if (id === 'vegvisir' || id === 'terranova') {
      // Soft-toggle active instead of hard deletion to protect fleet flagships
      await this.updateVessel(id, { isActive: false });
      return { success: true, message: 'La embarcación insignia fue desactivada.' };
    }

    try {
      await supabase.from('vessels').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete vessel error:', err);
    }

    return { success: true };
  }
};
