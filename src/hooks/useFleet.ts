import { useState, useEffect, useCallback } from 'react';
import { fleetService } from '../services/fleetService';
import type { Vessel } from '../types';

export const useFleet = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVessels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fleetService.getVessels();
      setVessels(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading fleet:', err);
      setError(err?.message || 'Error al cargar la flota');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVessels();
  }, [fetchVessels]);

  const createVessel = async (vesselData: Omit<Vessel, 'id'> & { id?: string }) => {
    try {
      const created = await fleetService.createVessel(vesselData);
      await fetchVessels();
      return created;
    } catch (err: any) {
      console.error('Error creating vessel:', err);
      throw err;
    }
  };

  const updateVessel = async (id: string, updates: Partial<Vessel>) => {
    try {
      const updated = await fleetService.updateVessel(id, updates);
      await fetchVessels();
      return updated;
    } catch (err: any) {
      console.error('Error updating vessel:', err);
      throw err;
    }
  };

  const deleteVessel = async (id: string) => {
    try {
      const res = await fleetService.deleteVessel(id);
      await fetchVessels();
      return res;
    } catch (err: any) {
      console.error('Error deleting vessel:', err);
      throw err;
    }
  };

  return {
    vessels,
    activeVessels: vessels.filter(v => v.isActive !== false),
    loading,
    error,
    refreshVessels: fetchVessels,
    createVessel,
    updateVessel,
    deleteVessel,
  };
};
