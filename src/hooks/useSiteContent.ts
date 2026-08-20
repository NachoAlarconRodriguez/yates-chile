import { useState, useEffect, useCallback } from 'react';
import { cmsService, DEFAULT_CMS_CONTENT, type SiteContent } from '../services/cmsService';
import { useLanguage } from '../context/LanguageContext';

export function useSiteContent() {
  const { language } = useLanguage();
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

  const getSection = (key: string, overrideLang?: 'ES' | 'EN') => {
    const raw = content[key] || DEFAULT_CMS_CONTENT[key] || { section_key: key };
    const currentLang = overrideLang || language;

    if (currentLang === 'EN') {
      const meta = (raw.metadata as Record<string, any>) || {};
      const defMeta = (DEFAULT_CMS_CONTENT[key]?.metadata as Record<string, any>) || {};
      return {
        ...raw,
        title: meta.title_en || defMeta.title_en || raw.title,
        subtitle: meta.subtitle_en || defMeta.subtitle_en || raw.subtitle,
        body_text: meta.body_text_en || defMeta.body_text_en || raw.body_text,
      };
    }

    return raw;
  };

  const getRawSection = (key: string) => {
    return content[key] || DEFAULT_CMS_CONTENT[key] || { section_key: key };
  };

  return { content, loading, getSection, getRawSection, refreshContent: fetchContent };
}
