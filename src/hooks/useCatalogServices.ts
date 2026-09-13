import { useState, useEffect, useCallback } from 'react';
import { catalogService, type CatalogService } from '../services/catalogService';

export function useCatalogServices(options?: { admin?: boolean }) {
  const [services, setServices] = useState<CatalogService[]>(() => {
    const cached = catalogService.getCachedServices();
    return options?.admin ? cached : cached.filter((s) => s.is_active !== false);
  });
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = options?.admin
        ? await catalogService.getAllServicesAdmin()
        : await catalogService.getServices();
      setServices(data);
    } catch {
      // Handled inside service
    } finally {
      if (!silent) setLoading(false);
    }
  }, [options?.admin]);

  useEffect(() => {
    fetchServices(true);

    const handleUpdate = () => {
      const cached = catalogService.getCachedServices();
      setServices(options?.admin ? cached : cached.filter((s) => s.is_active !== false));
    };

    window.addEventListener('yates_catalog_services_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('yates_catalog_services_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchServices, options?.admin]);

  const toggleServiceActive = useCallback(async (id: string, is_active: boolean) => {
    // 1. Actualización optimista inmediata en memoria de React (0ms)
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active } : s))
    );

    // 2. Persistencia en backend y caché
    try {
      const res = await catalogService.toggleServiceActive(id, is_active);
      if (!res.success) {
        // Revertir en caso de fallo
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: !is_active } : s))
        );
        return res;
      }
      return { success: true };
    } catch (err: any) {
      // Revertir en caso de excepción
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !is_active } : s))
      );
      return { success: false, error: err?.message || 'Error de conexión' };
    }
  }, []);

  return {
    services,
    loading,
    refreshServices: fetchServices,
    createService: catalogService.createService.bind(catalogService),
    updateService: catalogService.updateService.bind(catalogService),
    toggleServiceActive,
    deleteService: catalogService.deleteService.bind(catalogService),
  };
}

