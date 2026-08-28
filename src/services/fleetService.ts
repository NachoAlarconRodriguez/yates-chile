import { FLEET_DATA } from '../lib/constants';
import type { Vessel } from '../types';

const LOCAL_STORAGE_FLEET_KEY = 'yates_fleet_v2';

const getCachedFleet = (): Vessel[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FLEET_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_FLEET_KEY, JSON.stringify(FLEET_DATA));
      return FLEET_DATA;
    }
    const parsed: Vessel[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_FLEET_KEY, JSON.stringify(FLEET_DATA));
      return FLEET_DATA;
    }
    // Ensure default vessels are always present
    const hasVegvisir = parsed.some(v => v.id === 'vegvisir');
    const hasTerranova = parsed.some(v => v.id === 'terranova');
    if (!hasVegvisir || !hasTerranova) {
      const merged = [...parsed];
      if (!hasVegvisir && FLEET_DATA[0]) merged.unshift(FLEET_DATA[0]);
      if (!hasTerranova && FLEET_DATA[1]) merged.push(FLEET_DATA[1]);
      localStorage.setItem(LOCAL_STORAGE_FLEET_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return FLEET_DATA;
  }
};

const saveCachedFleet = (list: Vessel[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_FLEET_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save fleet to localStorage', err);
  }
};

export const fleetService = {
  async getVessels(): Promise<Vessel[]> {
    return getCachedFleet();
  },

  async getVesselById(id: string): Promise<Vessel | null> {
    const vessels = getCachedFleet();
    return vessels.find(v => v.id === id) || null;
  },

  async createVessel(vessel: Omit<Vessel, 'id'> & { id?: string }): Promise<Vessel> {
    const current = getCachedFleet();
    const newId = vessel.id || `vessel-${Date.now()}`;
    const newVessel: Vessel = {
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

    const updated = [...current, newVessel];
    saveCachedFleet(updated);
    return newVessel;
  },

  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    const current = getCachedFleet();
    let updatedVessel: Vessel | null = null;

    const updated = current.map((v) => {
      if (v.id === id) {
        updatedVessel = { ...v, ...updates };
        return updatedVessel;
      }
      return v;
    });

    if (!updatedVessel) {
      throw new Error(`Vessel with id ${id} not found`);
    }

    saveCachedFleet(updated);
    return updatedVessel;
  },

  async deleteVessel(id: string): Promise<{ success: boolean; message?: string }> {
    if (id === 'vegvisir' || id === 'terranova') {
      // Soft-toggle active instead of hard deletion to protect default templates
      await this.updateVessel(id, { isActive: false });
      return { success: true, message: 'La embarcación insignia fue desactivada.' };
    }

    const current = getCachedFleet();
    const filtered = current.filter(v => v.id !== id);
    saveCachedFleet(filtered);
    return { success: true };
  }
};
