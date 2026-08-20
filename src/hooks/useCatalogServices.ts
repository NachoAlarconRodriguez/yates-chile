import { useState, useEffect, useCallback } from 'react';
import { catalogService, type CatalogService } from '../services/catalogService';

export function useCatalogServices() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.getServices();
      setServices(data);
    } catch {
      // Handled inside service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    refreshServices: fetchServices,
    createService: catalogService.createService.bind(catalogService),
    toggleServiceActive: catalogService.toggleServiceActive.bind(catalogService),
    deleteService: catalogService.deleteService.bind(catalogService),
  };
}
