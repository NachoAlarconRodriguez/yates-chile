import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  expeditionService,
  type PublicExpedition,
  type DepartureRow,
  getCachedPublicExpeditions,
} from '../services/expeditionService';

export interface ExpeditionsContextType {
  expeditions: PublicExpedition[];
  departures: DepartureRow[];
  loading: boolean;
  isRevalidating: boolean;
  isInitialLoaded: boolean;
  refreshExpeditions: () => Promise<void>;
  createDeparture: typeof expeditionService.createDeparture;
  updateDepartureStatus: typeof expeditionService.updateDepartureStatus;
  deleteDeparture: typeof expeditionService.deleteDeparture;
  createBooking: typeof expeditionService.createBooking;
}

const ExpeditionsContext = createContext<ExpeditionsContextType | null>(null);

export const ExpeditionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with sanitized cache for immediate rendering without layout shift
  const [expeditions, setExpeditions] = useState<PublicExpedition[]>(() => {
    if (typeof window === 'undefined') return [];
    return getCachedPublicExpeditions();
  });
  const [departures, setDepartures] = useState<DepartureRow[]>([]);
  
  // Track loading and whether the first remote fetch from Supabase has completed
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return getCachedPublicExpeditions().length === 0;
  });
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const fetchAll = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
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
      console.error('Error loading expeditions in ExpeditionsProvider:', err);
    } finally {
      setLoading(false);
      setIsRevalidating(false);
      setIsInitialLoaded(true);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const safetyTimer = setTimeout(() => {
      setIsInitialLoaded(true);
    }, 2500);

    const handleUpdate = () => {
      fetchAll();
    };

    window.addEventListener('yates_expeditions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('yates_expeditions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchAll]);

  const value: ExpeditionsContextType = {
    expeditions,
    departures,
    loading,
    isRevalidating,
    isInitialLoaded,
    refreshExpeditions: fetchAll,
    createDeparture: expeditionService.createDeparture.bind(expeditionService),
    updateDepartureStatus: expeditionService.updateDepartureStatus.bind(expeditionService),
    deleteDeparture: expeditionService.deleteDeparture.bind(expeditionService),
    createBooking: expeditionService.createBooking.bind(expeditionService),
  };

  return <ExpeditionsContext.Provider value={value}>{children}</ExpeditionsContext.Provider>;
};

export function useExpeditionsContext(): ExpeditionsContextType {
  const context = useContext(ExpeditionsContext);
  if (!context) {
    throw new Error('useExpeditionsContext must be used within an ExpeditionsProvider');
  }
  return context;
}
