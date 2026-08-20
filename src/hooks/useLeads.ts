import { useState, useEffect, useCallback } from 'react';
import { leadService, type LeadItem } from '../services/leadService';
import type { CustomerProfile } from '../pages/AdminPage';

export function useLeads() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeads();
      setLeads(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    const handleLeadsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<LeadItem[]>;
      if (customEvent.detail) {
        setLeads(customEvent.detail);
      } else {
        fetchLeads();
      }
    };

    window.addEventListener('yates_leads_updated', handleLeadsUpdated);
    return () => {
      window.removeEventListener('yates_leads_updated', handleLeadsUpdated);
    };
  }, [fetchLeads]);

  const createLead = useCallback(async (leadData: Parameters<typeof leadService.createLead>[0]) => {
    const res = await leadService.createLead(leadData);
    if (res.success) {
      await fetchLeads();
    }
    return res;
  }, [fetchLeads]);

  const updateLeadStatus = useCallback(async (id: string, status: LeadItem['status']) => {
    const res = await leadService.updateLeadStatus(id, status);
    if (res.success) {
      await fetchLeads();
    }
    return res;
  }, [fetchLeads]);

  const updateLeadNotes = useCallback(async (id: string, notes: string) => {
    const res = await leadService.updateLeadNotes(id, notes);
    if (res.success) {
      await fetchLeads();
    }
    return res;
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id: string) => {
    const res = await leadService.deleteLead(id);
    if (res.success) {
      await fetchLeads();
    }
    return res;
  }, [fetchLeads]);

  const convertLeadToCustomer = useCallback((lead: LeadItem): CustomerProfile => {
    return leadService.convertLeadToCustomerProfile(lead);
  }, []);

  return {
    leads,
    loading,
    refreshLeads: fetchLeads,
    createLead,
    updateLeadStatus,
    updateLeadNotes,
    deleteLead,
    convertLeadToCustomer,
  };
}
