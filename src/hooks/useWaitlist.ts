import { useState, useEffect, useCallback } from 'react';
import { waitlistService, type WaitlistEntry } from '../services/waitlistService';

export const useWaitlist = () => {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => waitlistService.getStoredWaitlist());
  const [loading, setLoading] = useState(true);

  const fetchWaitlist = useCallback(async () => {
    try {
      const data = await waitlistService.getWaitlistEntries();
      setWaitlist(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitlist();

    const handleUpdate = () => {
      setWaitlist(waitlistService.getStoredWaitlist());
    };

    window.addEventListener('yates_waitlist_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('yates_waitlist_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchWaitlist]);

  return {
    waitlist,
    loading,
    refreshWaitlist: fetchWaitlist,
    createWaitlistEntry: waitlistService.createWaitlistEntry.bind(waitlistService),
    updateWaitlistEntryStatus: waitlistService.updateWaitlistEntryStatus.bind(waitlistService),
    deleteWaitlistEntry: waitlistService.deleteWaitlistEntry.bind(waitlistService),
  };
};
