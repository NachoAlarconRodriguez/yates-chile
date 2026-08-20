import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ES' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (es: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'yates_chile_preferred_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'ES' || saved === 'EN') return saved;
    return 'ES';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('language_changed', { detail: lang }));
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ES' ? 'EN' : 'ES');
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === 'ES' || e.newValue === 'EN')) {
        setLanguageState(e.newValue);
      }
    };
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail === 'ES' || customEvent.detail === 'EN') {
        setLanguageState(customEvent.detail);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('language_changed', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('language_changed', handleCustom);
    };
  }, []);

  const t = (es: string, en?: string): string => {
    if (language === 'EN' && en) return en;
    return es;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'ES',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (es: string, en?: string) => (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'EN' && en ? en : es),
    };
  }
  return context;
};
