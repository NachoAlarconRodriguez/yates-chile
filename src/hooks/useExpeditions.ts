import { useState, useEffect, useCallback } from 'react';
import { expeditionService, type PublicExpedition, type DepartureRow, INITIAL_EXPEDITIONS } from '../services/expeditionService';

export function useExpeditions() {
  const [expeditions, setExpeditions] = useState<PublicExpedition[]>(INITIAL_EXPEDITIONS);
  const [departures, setDepartures] = useState<DepartureRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
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
    refreshExpeditions: fetchAll,
    createDeparture: expeditionService.createDeparture.bind(expeditionService),
    updateDepartureStatus: expeditionService.updateDepartureStatus.bind(expeditionService),
    deleteDeparture: expeditionService.deleteDeparture.bind(expeditionService),
    createBooking: expeditionService.createBooking.bind(expeditionService),
  };
}
