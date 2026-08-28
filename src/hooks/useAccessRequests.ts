import { useState, useEffect, useCallback } from 'react';
import { accessRequestService, type AdminAccessRequest } from '../services/accessRequestService';

export const useAccessRequests = () => {
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accessRequestService.getRequests();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching access requests:', err);
      setError(err?.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data: { fullName: string; email: string; phone: string; notes?: string }) => {
    try {
      const created = await accessRequestService.createRequest(data);
      await fetchRequests();
      return created;
    } catch (err: any) {
      console.error('Error creating access request:', err);
      throw err;
    }
  };

  const approveRequest = async (id: string) => {
    try {
      const res = await accessRequestService.updateRequestStatus(id, 'approved');
      await fetchRequests();
      return res;
    } catch (err: any) {
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      const res = await accessRequestService.updateRequestStatus(id, 'rejected');
      await fetchRequests();
      return res;
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const res = await accessRequestService.deleteRequest(id);
      await fetchRequests();
      return res;
    } catch (err: any) {
      console.error('Error deleting request:', err);
      throw err;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return {
    requests,
    pendingRequests: requests.filter(r => r.status === 'pending'),
    pendingCount,
    loading,
    error,
    refreshRequests: fetchRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
  };
};
