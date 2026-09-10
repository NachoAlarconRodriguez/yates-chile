import { useState, useEffect, useCallback } from 'react';
import { expeditionService, type PublicExpedition, type DepartureRow, getCachedPublicExpeditions } from '../services/expeditionService';

export function useExpeditions() {
  // Stale-While-Revalidate: load from cache immediately if present (0ms wait)
  const [expeditions, setExpeditions] = useState<PublicExpedition[]>(() => {
    if (typeof window === 'undefined') return [];
    return getCachedPublicExpeditions();
  });
  const [departures, setDepartures] = useState<DepartureRow[]>([]);
  // Only show initial skeleton/spinner if there are no cached expeditions yet
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return getCachedPublicExpeditions().length === 0;
  });
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);

  const fetchAll = useCallback(async () => {
    setIsRevalidating(true);
    try {
      const [pubExp, depList] = await Promise.all([
        expeditionService.getPublicExpeditions(),
        expeditionService.getDepartures(),
      ]);
      if (pubExp && pubExp.length > 0) {
        setExpeditions(pubExp);
      }
      if (depList && depList.length > 0) {
        setDepartures(depList);
      }
    } catch (err) {
      console.error('Error loading expeditions in hook:', err);
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const handleUpdate = () => {
      fetchAll();
    };

    window.addEventListener('yates_expeditions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('yates_expeditions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchAll]);

  return {
    expeditions,
    departures,
    loading,
    isRevalidating,
    refreshExpeditions: fetchAll,
    createDeparture: expeditionService.createDeparture.bind(expeditionService),
    updateDepartureStatus: expeditionService.updateDepartureStatus.bind(expeditionService),
    deleteDeparture: expeditionService.deleteDeparture.bind(expeditionService),
    createBooking: expeditionService.createBooking.bind(expeditionService),
  };
}
