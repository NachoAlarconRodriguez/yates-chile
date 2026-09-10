import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cmsService, DEFAULT_CMS_CONTENT, type SiteContent } from '../services/cmsService';
import { useLanguage } from './LanguageContext';

interface SiteContentContextType {
  content: Record<string, Partial<SiteContent>>;
  loading: boolean;
  getSection: (key: string, overrideLang?: 'ES' | 'EN') => Partial<SiteContent>;
  getRawSection: (key: string) => Partial<SiteContent>;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in-memory TTL

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState<Record<string, Partial<SiteContent>>>(() => {
    return cmsService.getCachedContentSync();
  });
  const [loading, setLoading] = useState(false);
  const lastFetchedRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const fetchContent = useCallback(async (force = false) => {
    const now = Date.now();
    // Deduping: Skip if already fetched within TTL and not forced
    if (!force && now - lastFetchedRef.current < CACHE_TTL_MS && Object.keys(contentRef.current).length > 0) {
      return;
    }
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const data = await cmsService.getAllContent();
      setContent(data);
      contentRef.current = data;
      lastFetchedRef.current = Date.now();
    } catch {
      const fallback = cmsService.getCachedContentSync();
      setContent(fallback);
      contentRef.current = fallback;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchContent();

    const handleUpdate = () => {
      setContent(cmsService.getCachedContentSync());
      fetchContent(true);
    };

    window.addEventListener('cms_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cms_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchContent]);

  const getSection = useCallback(
    (key: string, overrideLang?: 'ES' | 'EN') => {
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
    },
    [content, language]
  );

  const getRawSection = useCallback(
    (key: string) => {
      return content[key] || DEFAULT_CMS_CONTENT[key] || { section_key: key };
    },
    [content]
  );

  return (
    <SiteContentContext.Provider
      value={{
        content,
        loading,
        getSection,
        getRawSection,
        refreshContent: () => fetchContent(true),
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContentContext = (): SiteContentContextType => {
  const context = useContext(SiteContentContext);
  if (!context) {
    // Graceful fallback for any component rendered outside provider
    return {
      content: cmsService.getCachedContentSync(),
      loading: false,
      getSection: (key: string) => DEFAULT_CMS_CONTENT[key] || { section_key: key },
      getRawSection: (key: string) => DEFAULT_CMS_CONTENT[key] || { section_key: key },
      refreshContent: async () => {},
    };
  }
  return context;
};
