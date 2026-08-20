import { useState, useEffect, useCallback } from 'react';
import { cmsService, DEFAULT_CMS_CONTENT, type SiteContent } from '../services/cmsService';

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, Partial<SiteContent>>>(() => {
    return cmsService.getCachedContentSync();
  });
  const [loading, setLoading] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const data = await cmsService.getAllContent();
      setContent(data);
    } catch {
      setContent(cmsService.getCachedContentSync());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    const handleUpdate = () => {
      setContent(cmsService.getCachedContentSync());
    };

    window.addEventListener('cms_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cms_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchContent]);

  const getSection = (key: string) => {
    return content[key] || DEFAULT_CMS_CONTENT[key] || { section_key: key };
  };

  return { content, loading, getSection, refreshContent: fetchContent };
}
