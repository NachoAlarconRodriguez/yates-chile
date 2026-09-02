import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Home,
  Sailboat,
  Ship,
  BedDouble,
  Compass,
  Phone,
  Save,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  X,
  MapPin,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Anchor,
  Clock,
  Key,
  Bot,
  CheckCircle,
  Wand2,
  BookOpen,
  Wind,
  Thermometer,
  Gauge,
  Layers,
  UtensilsCrossed,
  Sun
} from 'lucide-react';
import { DEFAULT_CMS_CONTENT, type SiteContent } from '../../services/cmsService';
import { translationService } from '../../services/translationService';
import { ExpeditionCalendar } from '../modules/ExpeditionCalendar';
import { BuildYourJourney } from '../modules/BuildYourJourney';
import { EXPEDITIONS } from '../modules/ExpeditionCalendar';

interface VisualCmsEditorProps {
  content: Record<string, Partial<SiteContent>>;
  onSaveAllSections: (drafts: Record<string, Partial<SiteContent>>) => Promise<{ success: boolean; error?: string }>;
  onUploadMedia: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshContent: () => void;
  onNavigate?: (path: string) => void;
}

const CmsContext = React.createContext<{
  getField: (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url') => string;
  setField: (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url', value: string) => void;
}>({
  getField: () => '',
  setField: () => {},
});

// =========================================================================
// STABLE INLINE EDITABLE COMPONENT (NO UNMOUNTING OR FLICKERING ON TYPING)
// =========================================================================
const InlineText: React.FC<{
  sectionKey: string;
  field: 'title' | 'subtitle' | 'body_text';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  fallback?: string;
  multiline?: boolean;
}> = ({ sectionKey, field, tag: Tag = 'div', className = '', fallback = '', multiline = false }) => {
  const { getField, setField } = React.useContext(CmsContext);
  const currentVal = getField(sectionKey, field) || fallback;
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(currentVal);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setLocalVal(currentVal);
    }
  }, [currentVal, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleCommit = () => {
    setIsEditing(false);
    if (localVal !== currentVal) {
      setField(sectionKey, field, localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setLocalVal(currentVal);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localVal}
          onChange={(e) => {
            setLocalVal(e.target.value);
            setField(sectionKey, field, e.target.value);
          }}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          rows={Math.max(2, (localVal || '').split('\n').length)}
          className={`w-full bg-sky-500/15 border-2 border-sky-400 text-inherit font-inherit rounded-xl p-2.5 outline-none shadow-xl resize-none transition-all ${className}`}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localVal}
        onChange={(e) => {
          setLocalVal(e.target.value);
          setField(sectionKey, field, e.target.value);
        }}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className={`w-full bg-sky-500/15 border-2 border-sky-400 text-inherit font-inherit rounded-lg px-2.5 py-1 outline-none shadow-xl transition-all ${className}`}
      />
    );
  }

  const displayText = localVal || fallback || 'Haz clic para escribir...';

  return (
    <Tag
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group/inline cursor-text select-text hover:ring-2 hover:ring-sky-400 hover:ring-offset-2 hover:bg-sky-400/10 rounded-md px-1 -mx-1 transition-all duration-150 relative ${className}`}
      title="Haz clic para editar este texto directamente"
    >
      <span>{displayText}</span>
      <span className="inline-block ml-1.5 opacity-0 group-hover/inline:opacity-100 transition-opacity text-sky-400 text-xs select-none">
        ✎
      </span>
    </Tag>
  );
};

export const VisualCmsEditor: React.FC<VisualCmsEditorProps> = ({
  content,
  onSaveAllSections,
  onUploadMedia,
  refreshContent,
  onNavigate,
}) => {
  // Navigation State
  const [activePage, setActivePage] = useState<'home' | 'vegvisir' | 'terranova' | 'lodge' | 'expeditions' | 'contact' | 'logbook'>('home');
  const [activeLogbookVessel, setActiveLogbookVessel] = useState<'vegvisir_logbook' | 'terranova_logbook' | 'lodge_logbook'>('vegvisir_logbook');
  const [activeLogbookEntry, setActiveLogbookEntry] = useState<string>('climatizacion');

  // Language Mode: 'ES' (Spanish base) or 'EN' (English AI review/edit)
  const [editorLanguage, setEditorLanguage] = useState<'ES' | 'EN'>('ES');
  const [isTranslatingWithAi, setIsTranslatingWithAi] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => translationService.getGeminiApiKey());
  const [apiKeySavedMsg, setApiKeySavedMsg] = useState<boolean>(false);

  // Drafts State
  const [drafts, setDrafts] = useState<Record<string, Partial<SiteContent>>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Media Edit Modal State (only for image/video URLs & uploads)
  const [mediaModal, setMediaModal] = useState<{
    sectionKey: string;
    entryId?: string;
    label: string;
    currentValue: string;
  } | null>(null);

  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);

  // Logbook Dynamic Data Helpers
  const getLogbookEntry = (vesselKey: 'vegvisir_logbook' | 'terranova_logbook' | 'lodge_logbook', entryId: string) => {
    const draftMeta = drafts[vesselKey]?.metadata as any;
    const contentMeta = content[vesselKey]?.metadata as any;
    const defaultMeta = DEFAULT_CMS_CONTENT[vesselKey]?.metadata as any;
    return (
      draftMeta?.entries?.[entryId] ||
      contentMeta?.entries?.[entryId] ||
      defaultMeta?.entries?.[entryId] ||
      {}
    );
  };

  const setLogbookEntryField = (
    vesselKey: 'vegvisir_logbook' | 'terranova_logbook' | 'lodge_logbook',
    entryId: string,
    field: string,
    value: string
  ) => {
    const existingMeta =
      (drafts[vesselKey]?.metadata as any) ||
      (content[vesselKey]?.metadata as any) ||
      (DEFAULT_CMS_CONTENT[vesselKey]?.metadata as any) ||
      {};
    const currentEntries = existingMeta.entries || {};
    const targetEntry = currentEntries[entryId] || {};

    const updatedEntries = {
      ...currentEntries,
      [entryId]: {
        ...targetEntry,
        [field]: value,
      },
    };

    setDrafts((prev) => ({
      ...prev,
      [vesselKey]: {
        section_key: vesselKey,
        ...(content[vesselKey] || DEFAULT_CMS_CONTENT[vesselKey] || {}),
        ...prev[vesselKey],
        metadata: {
          ...existingMeta,
          ...((prev[vesselKey]?.metadata as any) || {}),
          entries: updatedEntries,
        },
      },
    }));
  };

  // Get field with draft priority and proper fallback respecting active editorLanguage
  const getField = (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url'): string => {
    if (field === 'media_url') {
      if (drafts[sectionKey]?.media_url !== undefined && drafts[sectionKey]?.media_url !== null) {
        return drafts[sectionKey]!.media_url as string;
      }
      const sec = content[sectionKey];
      if (sec?.media_url) return sec.media_url;
      const def = DEFAULT_CMS_CONTENT[sectionKey];
      return def?.media_url || '';
    }

    // When editing in English mode:
    if (editorLanguage === 'EN') {
      const draftMeta = (drafts[sectionKey]?.metadata as Record<string, any>) || {};
      const enField = `${field}_en`;
      if (draftMeta[enField] !== undefined && draftMeta[enField] !== null) {
        return draftMeta[enField] as string;
      }
      const secMeta = (content[sectionKey]?.metadata as Record<string, any>) || {};
      if (secMeta[enField] !== undefined && secMeta[enField] !== null && secMeta[enField] !== '') {
        return secMeta[enField] as string;
      }
      const defMeta = (DEFAULT_CMS_CONTENT[sectionKey]?.metadata as Record<string, any>) || {};
      if (defMeta[enField] !== undefined && defMeta[enField] !== null) {
        return defMeta[enField] as string;
      }
      // Fallback to Spanish field if no English exists yet
      return (content[sectionKey]?.[field] || DEFAULT_CMS_CONTENT[sectionKey]?.[field] || '') as string;
    }

    // When editing in Spanish mode:
    if (drafts[sectionKey] && drafts[sectionKey]![field] !== undefined && drafts[sectionKey]![field] !== null) {
      return drafts[sectionKey]![field] as string;
    }
    const sec = content[sectionKey];
    if (sec && sec[field] !== undefined && sec[field] !== null && sec[field] !== '') {
      return sec[field] as string;
    }
    const def = DEFAULT_CMS_CONTENT[sectionKey];
    if (def && def[field] !== undefined && def[field] !== null) {
      return def[field] as string;
    }
    return '';
  };

  // Set draft field respecting active editorLanguage
  const setField = (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url', value: string) => {
    if (field === 'media_url') {
      setDrafts((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          media_url: value,
        },
      }));
      return;
    }

    if (editorLanguage === 'EN') {
      const enField = `${field}_en`;
      const currentMeta =
        (drafts[sectionKey]?.metadata as Record<string, any>) ||
        (content[sectionKey]?.metadata as Record<string, any>) ||
        (DEFAULT_CMS_CONTENT[sectionKey]?.metadata as Record<string, any>) ||
        {};

      setDrafts((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          metadata: {
            ...currentMeta,
            [enField]: value,
          },
        },
      }));
      return;
    }

    setDrafts((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  // Check if there are unsaved drafts
  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(drafts).length > 0;
  }, [drafts]);

  // Handle Save All with automatic AI translation for updated Spanish fields
  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);

    try {
      const finalDrafts: Record<string, Partial<SiteContent>> = { ...drafts };

      // If saving from Spanish mode, auto-generate English translations with AI
      for (const sectionKey of Object.keys(finalDrafts)) {
        const d = finalDrafts[sectionKey];
        const existingMeta =
          (d.metadata as Record<string, any>) ||
          (content[sectionKey]?.metadata as Record<string, any>) ||
          (DEFAULT_CMS_CONTENT[sectionKey]?.metadata as Record<string, any>) ||
          {};

        if (sectionKey === 'vegvisir_logbook' || sectionKey === 'terranova_logbook' || sectionKey === 'lodge_logbook') {
          finalDrafts[sectionKey] = {
            ...d,
            metadata: existingMeta,
          };
          continue;
        }

        // If Spanish texts were edited, translate them to English
        const titleToTranslate = d.title ?? getField(sectionKey, 'title');
        const subtitleToTranslate = d.subtitle ?? getField(sectionKey, 'subtitle');
        const bodyToTranslate = d.body_text ?? getField(sectionKey, 'body_text');

        const translated = await translationService.translateSection({
          title: titleToTranslate,
          subtitle: subtitleToTranslate,
          body_text: bodyToTranslate,
        });

        finalDrafts[sectionKey] = {
          ...d,
          metadata: {
            ...existingMeta,
            // Only overwrite English if not manually edited in draft
            title_en: existingMeta.title_en && editorLanguage === 'EN' ? existingMeta.title_en : translated.title_en,
            subtitle_en: existingMeta.subtitle_en && editorLanguage === 'EN' ? existingMeta.subtitle_en : translated.subtitle_en,
            body_text_en: existingMeta.body_text_en && editorLanguage === 'EN' ? existingMeta.body_text_en : translated.body_text_en,
          },
        };
      }

      const res = await onSaveAllSections(finalDrafts);
      setIsSaving(false);
      if (res.success) {
        setDrafts({});
        refreshContent();
        setSaveSuccessMsg(
          editorLanguage === 'EN'
            ? '¡Cambios en inglés guardados con éxito!'
            : '¡Contenido guardado y publicado en la web con éxito!'
        );
        setTimeout(() => setSaveSuccessMsg(null), 4500);
      }
    } catch {
      setIsSaving(false);
    }
  };

  // Auto-translate all sections of the active page on demand
  const handleTranslateCurrentPageWithAi = async () => {
    setIsTranslatingWithAi(true);

    const pageSectionsMap: Record<string, string[]> = {
      home: ['home_hero', 'home_intro'],
      vegvisir: ['flota_vegvisir'],
      terranova: ['flota_terranova'],
      lodge: ['lodge_info', 'lodge_dining'],
      expeditions: ['expeditions_hero', 'expeditions_selkirk'],
      contact: ['contact_info', 'bank_details'],
    };

    const targetSections = pageSectionsMap[activePage] || [];

    for (const secKey of targetSections) {
      const titleEs = (content[secKey]?.title || DEFAULT_CMS_CONTENT[secKey]?.title || '') as string;
      const subtitleEs = (content[secKey]?.subtitle || DEFAULT_CMS_CONTENT[secKey]?.subtitle || '') as string;
      const bodyEs = (content[secKey]?.body_text || DEFAULT_CMS_CONTENT[secKey]?.body_text || '') as string;

      const trans = await translationService.translateSection({
        title: titleEs,
        subtitle: subtitleEs,
        body_text: bodyEs,
      });

      const currentMeta =
        (drafts[secKey]?.metadata as Record<string, any>) ||
        (content[secKey]?.metadata as Record<string, any>) ||
        (DEFAULT_CMS_CONTENT[secKey]?.metadata as Record<string, any>) ||
        {};

      setDrafts((prev) => ({
        ...prev,
        [secKey]: {
          ...prev[secKey],
          metadata: {
            ...currentMeta,
            title_en: trans.title_en,
            subtitle_en: trans.subtitle_en,
            body_text_en: trans.body_text_en,
          },
        },
      }));
    }

    setIsTranslatingWithAi(false);
    setEditorLanguage('EN');
    setSaveSuccessMsg('✨ ¡Sección traducida con IA! Ahora estás en modo de revisión en inglés.');
    setTimeout(() => setSaveSuccessMsg(null), 4500);
  };

  const handleSaveApiKey = () => {
    translationService.setGeminiApiKey(apiKeyInput);
    setApiKeySavedMsg(true);
    setTimeout(() => {
      setApiKeySavedMsg(false);
      setShowApiKeyModal(false);
    }, 1200);
  };

  const handleResetDrafts = () => {
    if (window.confirm('¿Deseas descartar todas las modificaciones no guardadas?')) {
      setDrafts({});
    }
  };

  // Handle Media File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !mediaModal) return;
    const file = e.target.files[0];
    setUploadingMedia(true);
    const res = await onUploadMedia(file);
    setUploadingMedia(false);
    if (res.success && res.url) {
      if (mediaModal.entryId) {
        setLogbookEntryField(mediaModal.sectionKey as any, mediaModal.entryId, 'image', res.url);
      } else {
        setField(mediaModal.sectionKey, 'media_url', res.url);
      }
      setMediaModal((prev) => (prev ? { ...prev, currentValue: res.url! } : null));
    }
  };

  const isMediaVideo = (url?: string | null) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('video/');
  };

  return (
    <CmsContext.Provider value={{ getField, setField }}>
      <div className="space-y-4">
      {/* ========================================================================= */}
      {/* TOP CONTROL TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Title & Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0f2b48] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0f2b48]">
                  Editor CMS Visual en Vivo
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Edición Directa en Pantalla</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-light">
                Haz clic y escribe directamente sobre los textos para editarlos en tiempo real.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleResetDrafts}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Descartar ({Object.keys(drafts).length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/25 ring-2 ring-emerald-400'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publicando en Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{hasUnsavedChanges ? `Guardar y Publicar en Vivo (${Object.keys(drafts).length})` : 'Sin cambios pendientes'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const targetRoute =
                  activePage === 'home'
                    ? '/'
                    : activePage === 'vegvisir'
                    ? '/velero-vegvisir'
                    : activePage === 'terranova'
                    ? '/yate-terranova'
                    : activePage === 'lodge'
                    ? '/lodge'
                    : activePage === 'expeditions'
                    ? '/expediciones'
                    : '/contacto';
                if (onNavigate) onNavigate(targetRoute);
                else window.open('#' + targetRoute, '_blank');
              }}
              className="bg-slate-50 hover:bg-slate-100 text-[#0f2b48] font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200/80 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Ver Web Pública</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#0f2b48]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Bilingual / AI Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Capsule Sub-Tabs */}
          <div className="p-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full flex flex-wrap items-center gap-1 shadow-inner">
            {[
              { id: 'home', label: 'Inicio (Home)', icon: Home },
              { id: 'vegvisir', label: 'Velero Vegvisir', icon: Sailboat },
              { id: 'terranova', label: 'Yate Terranova', icon: Ship },
              { id: 'lodge', label: 'Lodge Rincón', icon: BedDouble },
              { id: 'expeditions', label: 'Expediciones', icon: Compass },
              { id: 'contact', label: 'Contacto & Concierge', icon: Phone },
              { id: 'logbook', label: 'Bitácoras & Book', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/25 font-bold scale-[1.02]'
                      : 'text-slate-600 hover:text-[#0f2b48] hover:bg-white/90 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-300' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bilingual Language Switcher & AI Actions (Capsule Style) */}
          <div className="flex items-center gap-2">
            {/* Language Switcher in Public Site Style: ES · EN */}
            <div className="inline-flex items-center bg-slate-100/90 border border-slate-300/80 rounded-full p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setEditorLanguage('ES')}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  editorLanguage === 'ES'
                    ? 'bg-white text-slate-950 shadow-xs font-extrabold'
                    : 'text-slate-400 hover:text-slate-700 font-semibold'
                }`}
                title="Editar versión en Español"
              >
                ES
              </button>
              <span className="text-slate-300 px-0.5 select-none text-xs">·</span>
              <button
                type="button"
                onClick={() => setEditorLanguage('EN')}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  editorLanguage === 'EN'
                    ? 'bg-[#0f2b48] text-white shadow-xs font-extrabold ring-1 ring-sky-400'
                    : 'text-slate-400 hover:text-slate-700 font-semibold'
                }`}
                title="Editar versión en Inglés (IA)"
              >
                EN
              </button>
            </div>

            {/* Translate with AI on demand Capsule */}
            <button
              type="button"
              onClick={handleTranslateCurrentPageWithAi}
              disabled={isTranslatingWithAi}
              className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100/90 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-105 duration-200"
              title="Traducir automáticamente esta sección con Inteligencia Artificial"
            >
              {isTranslatingWithAi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>Traduciendo...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Traducir con IA</span>
                </>
              )}
            </button>

            {/* AI API Key Modal Trigger Capsule */}
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:scale-105 duration-200"
              title="Configuración de API de Inteligencia Artificial (Gemini)"
            >
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="hidden md:inline font-bold">API IA</span>
            </button>
          </div>
        </div>

        {/* English Mode Information Banner */}
        {editorLanguage === 'EN' && (
          <div className="bg-sky-50 border border-sky-200 text-sky-950 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <div>
                <strong className="font-bold">Modo de Edición y Revisión en Inglés:</strong>
                <span className="ml-1 text-sky-800">
                  Estás visualizando los textos en inglés. Puedes hacer clic sobre cualquier texto para editarlo directamente y afinar la traducción de la IA.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditorLanguage('ES')}
              className="text-xs text-sky-700 underline font-bold hover:text-sky-900 shrink-0 cursor-pointer"
            >
              Volver a Español
            </button>
          </div>
        )}

        {/* SUCCESS NOTIFICATION TOAST */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VISUAL CANVAS VIEWPORT (EXACT PUBLIC SITE REPLICA) */}
      {/* ========================================================================= */}
      <div className="flex justify-center bg-slate-200/60 p-2 sm:p-4 rounded-3xl border border-slate-300/80 min-h-[700px] overflow-hidden">
        <div className="w-full max-w-7xl bg-white transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-300 relative">
          
          {/* SIMULATED PUBLIC BROWSER HEADER */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
                <Compass className="w-5 h-5 text-slate-800 animate-spin-slow" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm tracking-wider text-slate-900 block uppercase">
                  Yates Chile
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono block -mt-0.5">
                  Sailing & Lodge
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
              <span className={`cursor-pointer pb-1 ${activePage === 'home' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`} onClick={() => setActivePage('home')}>
                Inicio
              </span>
              <span className={`cursor-pointer pb-1 ${activePage === 'vegvisir' || activePage === 'terranova' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`} onClick={() => setActivePage('vegvisir')}>
                La Flota ▾
              </span>
              <span className={`cursor-pointer pb-1 ${activePage === 'lodge' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`} onClick={() => setActivePage('lodge')}>
                El Lodge
              </span>
              <span className={`cursor-pointer pb-1 ${activePage === 'expeditions' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`} onClick={() => setActivePage('expeditions')}>
                Expediciones
              </span>
              <span className={`cursor-pointer pb-1 ${activePage === 'contact' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`} onClick={() => setActivePage('contact')}>
                Contacto
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 bg-slate-50">
                ES · EN
              </span>
            </div>
          </header>

          {/* ======================================================================= */}
          {/* 1. PÁGINA DE INICIO (HOME) - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'home' && (
            <div className="space-y-0">
              
              {/* HERO CAROUSEL SECTION (EXACT PUBLIC BOTTOM-LEFT LAYOUT) */}
              <section className="relative h-[460px] sm:h-[500px] flex items-end justify-start bg-slate-950 text-white overflow-hidden border-b border-slate-800 group/hero">
                {isMediaVideo(getField('home_hero', 'media_url')) ? (
                  <video
                    src={getField('home_hero', 'media_url')}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <img
                    src={getField('home_hero', 'media_url') || '/velero-vegvisir.jpg'}
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                )}
                
                {/* Ultra-Light Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-950/30 to-transparent z-0" />

                {/* Edit Media Trigger Button */}
                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'home_hero',
                      label: 'Imagen o Video de Fondo del Hero de Inicio',
                      currentValue: getField('home_hero', 'media_url'),
                    })
                  }
                  className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Fondo Hero</span>
                </button>

                {/* Slide Main Content — Exact Minimalist Bottom-Left Layout */}
                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-7 sm:pb-9">
                  <div className="max-w-md text-left space-y-2 text-white">
                    
                    {/* Minimalist Badge (Direct Inline Editing) */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/40 border border-white/20 text-white text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-md">
                      <Compass className="w-3 h-3 text-white shrink-0" />
                      <InlineText
                        sectionKey="home_hero"
                        field="subtitle"
                        tag="span"
                        fallback="Aventura en Territorios Inexplorados"
                        className="text-white font-semibold"
                      />
                    </div>

                    {/* Title in Pure White (Direct Inline Editing) */}
                    <InlineText
                      sectionKey="home_hero"
                      field="title"
                      tag="h1"
                      fallback="EXPEDICIONES PATAGONIA & JUAN FERNÁNDEZ"
                      className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-snug block"
                    />

                    {/* Description (Direct Inline Editing) */}
                    <InlineText
                      sectionKey="home_hero"
                      field="body_text"
                      tag="p"
                      fallback="Navegaciones exclusivas en velero y yate de expedición, junto a estadías íntimas en nuestro Lodge Rincón de Navegantes."
                      multiline={true}
                      className="text-slate-200 text-[11px] sm:text-xs font-normal leading-relaxed max-w-sm opacity-90 block"
                    />

                    {/* Single Primary Action CTA */}
                    <div className="pt-1">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition shadow-lg">
                        <Compass className="w-3.5 h-3.5 text-slate-950" />
                        <span>Explorar Expediciones</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom-right Carousel Controls Replica */}
                <div className="absolute bottom-6 right-6 sm:right-10 z-20 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">BABOR</span>
                  <span className="text-white font-bold text-[10px]">01 / 03</span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ESTRIBOR</span>
                </div>
              </section>

              {/* GRID INMERSIVO: 3 CARDS (EXACT PUBLIC SECTION) */}
              <section className="py-16 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                    <div className="inline-block bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300">
                      <InlineText
                        sectionKey="home_intro"
                        field="subtitle"
                        tag="span"
                        fallback="AVENTURA EN TERRITORIOS INEXPLORADOS & PRÍSTINOS"
                        className="text-slate-600 font-bold text-xs uppercase tracking-widest"
                      />
                    </div>

                    <InlineText
                      sectionKey="home_intro"
                      field="title"
                      tag="h2"
                      fallback="Tres Formas de Vivir la Aventura Austral"
                      className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 block"
                    />

                    <InlineText
                      sectionKey="home_intro"
                      field="body_text"
                      tag="p"
                      fallback="Explora el Archipiélago Juan Fernández, Isla Alejandro Selkirk y los fiordos del Cabo de Hornos a través de nuestras tres experiencias exclusivas."
                      multiline={true}
                      className="text-slate-600 text-sm sm:text-base block max-w-2xl mx-auto"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Card 1: Velero Vegvisir */}
                    <div className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1">
                      <img
                        src={getField('flota_vegvisir', 'media_url') || '/velero-vegvisir.jpg'}
                        alt="Velero Vegvisir"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                      
                      <button
                        type="button"
                        onClick={() =>
                          setMediaModal({
                            sectionKey: 'flota_vegvisir',
                            label: 'Foto del Velero Vegvisir',
                            currentValue: getField('flota_vegvisir', 'media_url'),
                          })
                        }
                        className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-xl text-xs z-20 cursor-pointer border border-white/20 backdrop-blur-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-sky-300" />
                      </button>

                      <div className="relative z-10 h-[140px] flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <InlineText
                            sectionKey="flota_vegvisir"
                            field="title"
                            tag="h3"
                            fallback="Velero Vegvisir"
                            className="font-serif text-xl font-bold text-white block"
                          />
                          <InlineText
                            sectionKey="flota_vegvisir"
                            field="body_text"
                            tag="p"
                            fallback="Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total."
                            multiline={true}
                            className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3 block"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                          <span>Explorar Velero</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Yate Terranova */}
                    <div className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1">
                      <img
                        src={getField('flota_terranova', 'media_url') || '/yate-terranova.jpg'}
                        alt="Yate Terranova"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                      
                      <button
                        type="button"
                        onClick={() =>
                          setMediaModal({
                            sectionKey: 'flota_terranova',
                            label: 'Foto del Yate Terranova',
                            currentValue: getField('flota_terranova', 'media_url'),
                          })
                        }
                        className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-xl text-xs z-20 cursor-pointer border border-white/20 backdrop-blur-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-sky-300" />
                      </button>

                      <div className="relative z-10 h-[140px] flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <InlineText
                            sectionKey="flota_terranova"
                            field="title"
                            tag="h3"
                            fallback="Yate Terranova"
                            className="font-serif text-xl font-bold text-white block"
                          />
                          <InlineText
                            sectionKey="flota_terranova"
                            field="body_text"
                            tag="p"
                            fallback="Yate Hatteras 65ft LRC americano de 3 cubiertas (20 PAX • 5 cabinas • 5 baños) con 3.000 MN de autonomía y Starlink 24/7."
                            multiline={true}
                            className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3 block"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                          <span>Explorar Yate</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Lodge Rincón de Navegantes */}
                    <div className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[440px] flex flex-col justify-end px-4 sm:px-5 py-8 text-white transition-all duration-500 hover:-translate-y-1">
                      <img
                        src={getField('lodge_info', 'media_url') || '/rincon-de-navegantes.jpg'}
                        alt="Lodge Rincón de Navegantes"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                      
                      <button
                        type="button"
                        onClick={() =>
                          setMediaModal({
                            sectionKey: 'lodge_info',
                            label: 'Foto del Lodge Rincón',
                            currentValue: getField('lodge_info', 'media_url'),
                          })
                        }
                        className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-xl text-xs z-20 cursor-pointer border border-white/20 backdrop-blur-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-sky-300" />
                      </button>

                      <div className="relative z-10 h-[140px] flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <InlineText
                            sectionKey="lodge_info"
                            field="title"
                            tag="h3"
                            fallback="Lodge Rincón de Navegantes"
                            className="font-serif text-xl font-bold text-white block"
                          />
                          <InlineText
                            sectionKey="lodge_info"
                            field="body_text"
                            tag="p"
                            fallback="Lodge frente al mar en Uberlindo Andaur 222 (11 PAX • 4 cabinas con baño privado), amplio quincho, terraza y exploraciones en Robinson Crusoe."
                            multiline={true}
                            className="text-slate-300 text-xs leading-relaxed opacity-95 line-clamp-3 block"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                          <span>Conocer el Lodge</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* EXPEDITION CALENDAR COMPONENT (EXACT PUBLIC MODULE) */}
              <ExpeditionCalendar />
            </div>
          )}

          {/* ======================================================================= */}
          {/* 2. VELERO VEGVISIR - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'vegvisir' && (
            <div className="bg-white text-slate-900 min-h-screen">
              {/* HERO SECTION */}
              <section className="relative h-[65vh] sm:h-[75vh] flex items-end justify-start overflow-hidden group/hero">
                {isMediaVideo(getField('flota_vegvisir', 'media_url')) ? (
                  <video
                    src={getField('flota_vegvisir', 'media_url')}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getField('flota_vegvisir', 'media_url') || "/velero-vegvisir.jpg"}
                    alt="Velero Vegvisir"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                
                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'flota_vegvisir',
                      label: 'Fotografía o Video de Fondo del Velero Vegvisir',
                      currentValue: getField('flota_vegvisir', 'media_url'),
                    })
                  }
                  className="absolute top-6 right-6 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Foto Velero</span>
                </button>

                <div className="absolute top-6 left-6 sm:left-10 z-20">
                  <span className="inline-flex items-center gap-2 bg-slate-950/60 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/10 text-xs">
                    <ArrowLeft className="w-4 h-4 text-white" />
                    <span>Volver a Inicio</span>
                  </span>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-900/80 backdrop-blur-md border border-blue-400/30 text-white font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                      <InlineText
                        sectionKey="flota_vegvisir"
                        field="subtitle"
                        tag="span"
                        fallback="VELERO OCEÁNICO FRANCÉS • 6 PASAJEROS + TRIPULACIÓN"
                        className="text-white font-bold"
                      />
                    </div>
                    <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-emerald-300 font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Starlink 24/7
                    </span>
                  </div>

                  <InlineText
                    sectionKey="flota_vegvisir"
                    field="title"
                    tag="h1"
                    fallback="Velero Vegvisir"
                    className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight block"
                  />

                  <InlineText
                    sectionKey="flota_vegvisir"
                    field="body_text"
                    tag="p"
                    fallback="Velero de Altamar Dufour 52.5 ft francés de expedición austral con Starlink 24/7 y autonomía total."
                    multiline={true}
                    className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl block"
                  />
                </div>
              </section>

              {/* TECH SPECS GRID */}
              <section className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Dufour 52.5 ft', sub: 'Francés • QUI 2718', badge: 'NORTE / ASTILLERO' },
                    { title: '12 Pasajeros', sub: '5 Cabinas • 5 Baños', badge: 'OESTE / CAPACIDAD' },
                    { title: 'Starlink 24/7', sub: 'Raymarine + 140L Desalinizador', badge: 'SUR / TECNOLOGÍA' },
                    { title: 'Zodiac Mercury 4T', sub: 'Motor 15hp Auxiliar', badge: 'ESTE / DESEMBARCO' },
                  ].map((c, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">{c.badge}</span>
                      <strong className="text-sm font-bold text-slate-900 block">{c.title}</strong>
                      <span className="text-[11px] text-slate-500 block">{c.sub}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 3. YATE TERRANOVA - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'terranova' && (
            <div className="bg-white text-slate-900 min-h-screen">
              {/* HERO SECTION */}
              <section className="relative h-[65vh] sm:h-[75vh] flex items-end justify-start overflow-hidden group/hero">
                {isMediaVideo(getField('flota_terranova', 'media_url')) ? (
                  <video
                    src={getField('flota_terranova', 'media_url')}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getField('flota_terranova', 'media_url') || "/yate-terranova.jpg"}
                    alt="Yate Terranova"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                
                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'flota_terranova',
                      label: 'Fotografía o Video de Fondo del Yate Terranova',
                      currentValue: getField('flota_terranova', 'media_url'),
                    })
                  }
                  className="absolute top-6 right-6 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Foto Yate</span>
                </button>

                <div className="absolute top-6 left-6 sm:left-10 z-20">
                  <span className="inline-flex items-center gap-2 bg-slate-950/60 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/10 text-xs">
                    <ArrowLeft className="w-4 h-4 text-white" />
                    <span>Volver a Inicio</span>
                  </span>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-900/80 backdrop-blur-md border border-blue-400/30 text-white font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                      <InlineText
                        sectionKey="flota_terranova"
                        field="subtitle"
                        tag="span"
                        fallback="YATE DE EXPEDICIÓN • AMERICANO • 3 CUBIERTAS"
                        className="text-white font-bold"
                      />
                    </div>
                    <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-emerald-300 font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Starlink 24/7
                    </span>
                  </div>

                  <InlineText
                    sectionKey="flota_terranova"
                    field="title"
                    tag="h1"
                    fallback="Yate Terranova"
                    className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight block"
                  />

                  <InlineText
                    sectionKey="flota_terranova"
                    field="body_text"
                    tag="p"
                    fallback="Yate de expedición oceánica Hatteras 65ft LRC (Astillero Americano, Matrícula PMO 6128) distribuido en 3 cubiertas con capacidad para 20 PAX (5 cabinas / 5 baños). Equipado con 2 motores Detroit de 450 HP (3.000 MN de autonomía con estanque de 10.000 L), doble navegación Raymarine + Garmin, Starlink 24/7, 2 desalinizadores y Zodiac semirrígido con motor Yamaha 70hp y grúa de 1 tonelada."
                    multiline={true}
                    className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl block"
                  />
                </div>
              </section>

              {/* TECH SPECS GRID */}
              <section className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Hatteras 65ft LRC', sub: 'Americano • PMO 6128', badge: 'NORTE / ASTILLERO' },
                    { title: '20 Pasajeros', sub: '3 Cubiertas • 5 Cabinas / 5 Baños', badge: 'OESTE / CAPACIDAD' },
                    { title: '3.000 MN Autonomía', sub: '2x Detroit 450hp • 10.000L Diésel', badge: 'SUR / PROPULSIÓN' },
                    { title: 'Zodiac Yamaha 70hp', sub: 'Grúa de 1 Tonelada en Flybridge', badge: 'ESTE / AUXILIAR' },
                  ].map((c, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">{c.badge}</span>
                      <strong className="text-sm font-bold text-slate-900 block">{c.title}</strong>
                      <span className="text-[11px] text-slate-500 block">{c.sub}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 4. LODGE RINCÓN DE NAVEGANTES - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'lodge' && (
            <div className="bg-white text-slate-900 min-h-screen">
              {/* HERO SECTION */}
              <section className="relative h-[65vh] sm:h-[75vh] flex items-end justify-start overflow-hidden group/hero">
                {isMediaVideo(getField('lodge_info', 'media_url')) ? (
                  <video
                    src={getField('lodge_info', 'media_url')}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getField('lodge_info', 'media_url') || "/rincon-de-navegantes.jpg"}
                    alt="Lodge Rincón de Navegantes"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                
                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'lodge_info',
                      label: 'Fotografía o Video de Fondo del Lodge Rincón',
                      currentValue: getField('lodge_info', 'media_url'),
                    })
                  }
                  className="absolute top-6 right-6 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Foto Lodge</span>
                </button>

                <div className="absolute top-6 left-6 sm:left-10 z-20">
                  <span className="inline-flex items-center gap-2 bg-slate-950/60 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/10 text-xs">
                    <ArrowLeft className="w-4 h-4 text-white" />
                    <span>Volver a Inicio</span>
                  </span>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pb-8 sm:pb-12 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-emerald-900/80 backdrop-blur-md border border-emerald-400/30 text-white font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                      <InlineText
                        sectionKey="lodge_info"
                        field="subtitle"
                        tag="span"
                        fallback="Lodge Frente al Mar • Uberlindo Andaur 222"
                        className="text-white font-bold"
                      />
                    </div>
                    <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-emerald-300 font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      Isla Robinson Crusoe
                    </span>
                  </div>

                  <InlineText
                    sectionKey="lodge_info"
                    field="title"
                    tag="h1"
                    fallback="Lodge Rincón de Navegantes"
                    className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight block"
                  />

                  <InlineText
                    sectionKey="lodge_info"
                    field="body_text"
                    tag="p"
                    fallback="Ubicado en Uberlindo Andaur 222, justo en frente del mar en la Isla Robinson Crusoe. Diseñado en torno a 4 cabinas independientes (todas con baño privado y vista al océano para hasta 11 pasajeros), amplio quincho, terraza, áreas verdes y expediciones exclusivas guiadas por expertos locales."
                    multiline={true}
                    className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl block"
                  />
                </div>
              </section>

              {/* QUINCHO & GASTRONOMÍA MODULE */}
              <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Gastronomía & Encuentros
                    </span>
                    <InlineText
                      sectionKey="lodge_dining"
                      field="title"
                      tag="h3"
                      fallback="Gastronomía de Mar & Quincho de Navegantes"
                      className="font-serif text-2xl font-bold text-slate-900 block"
                    />
                    <InlineText
                      sectionKey="lodge_dining"
                      field="body_text"
                      tag="p"
                      fallback="Langosta de Juan Fernández fresca, vidriola, caracoles de roca y productos de la huerta local preparados por nuestros chefs anfitriones al calor de las brasas."
                      multiline={true}
                      className="text-xs sm:text-sm text-slate-600 leading-relaxed block"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-64 relative group">
                    <img
                      src={getField('lodge_dining', 'media_url') || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'}
                      alt="Quincho"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMediaModal({
                          sectionKey: 'lodge_dining',
                          label: 'Foto de Gastronomía / Quincho',
                          currentValue: getField('lodge_dining', 'media_url'),
                        })
                      }
                      className="absolute top-3 right-3 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-xl text-xs z-20 cursor-pointer border border-white/20"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-sky-300" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 5. EXPEDICIONES - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'expeditions' && (
            <div className="space-y-0 bg-white">
              {/* Header Banner */}
              <section className="bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800 group/hero">
                {getField('expeditions_hero', 'media_url') && (
                  <>
                    <img
                      src={getField('expeditions_hero', 'media_url')}
                      alt="Expediciones"
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'expeditions_hero',
                      label: 'Fondo del Banner de Expediciones',
                      currentValue: getField('expeditions_hero', 'media_url'),
                    })
                  }
                  className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Fondo Banner</span>
                </button>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                    <InlineText
                      sectionKey="expeditions_hero"
                      field="subtitle"
                      tag="span"
                      fallback="Itinerarios de Navegación Austral"
                      className="text-blue-300 font-semibold"
                    />
                  </div>

                  <InlineText
                    sectionKey="expeditions_hero"
                    field="title"
                    tag="h1"
                    fallback="Expediciones & Rutas Marítimas"
                    className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white block"
                  />

                  <InlineText
                    sectionKey="expeditions_hero"
                    field="body_text"
                    tag="p"
                    fallback="Descubre nuestras travesías disponibles para reserva inmediata. Explora las rutas del calendario y consulta por tu cupo a bordo."
                    multiline={true}
                    className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg block"
                  />
                </div>
              </section>

              {/* Grid of Expeditions */}
              <section className="py-16 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                      Salidas Programadas 2026/2027
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-slate-900">
                      Elige tu Travesía
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {EXPEDITIONS.slice(0, 3).map((exp) => (
                      <div key={exp.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="h-44 relative">
                          <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 space-y-2">
                          <div className="flex items-center gap-1.5 text-blue-900 font-mono text-[10px] font-bold tracking-wider uppercase">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{exp.startDate} al {exp.endDate}</span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-slate-900">{exp.name}</h3>
                          <p className="text-slate-500 text-xs line-clamp-2">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 6. CONTACTO & CONCIERGE - EXACT REPLICA */}
          {/* ======================================================================= */}
          {activePage === 'contact' && (
            <div className="space-y-0 bg-white">
              {/* Header Banner */}
              <section className="bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800 group/hero">
                {getField('contact_info', 'media_url') && (
                  <>
                    <img
                      src={getField('contact_info', 'media_url')}
                      alt="Contacto"
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMediaModal({
                      sectionKey: 'contact_info',
                      label: 'Fondo del Banner de Contacto',
                      currentValue: getField('contact_info', 'media_url'),
                    })
                  }
                  className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition z-30 cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cambiar Fondo Banner</span>
                </button>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                    <Anchor className="w-4 h-4 text-blue-400 shrink-0" />
                    <InlineText
                      sectionKey="contact_info"
                      field="subtitle"
                      tag="span"
                      fallback="Atención Personalizada 24/7"
                      className="text-blue-300 font-semibold"
                    />
                  </div>

                  <InlineText
                    sectionKey="contact_info"
                    field="title"
                    tag="h1"
                    fallback="Contacto & Concierge Exclusivo"
                    className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white block"
                  />

                  <InlineText
                    sectionKey="contact_info"
                    field="body_text"
                    tag="p"
                    fallback="Diseña tu itinerario a medida por Cabo de Hornos o cuéntanos tus consultas de navegación."
                    multiline={true}
                    className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg block"
                  />
                </div>
              </section>

              {/* BuildYourJourney Module */}
              <BuildYourJourney />

              {/* Direct Contact & Locations Section */}
              <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">Atención Telefónica</h3>
                      <p className="text-slate-500 text-xs">+56 9 8131 2920</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5 text-sky-600" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">Correo Electrónico</h3>
                      <p className="text-slate-500 text-xs">pagos@yateschile.cl</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">Base Operacional</h3>
                      <p className="text-slate-500 text-xs">Puerto Montt & Isla Robinson Crusoe</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 7. GESTOR DE CUADERNOS DE BITÁCORA (VELEROS, YATE & LODGE) */}
          {/* ======================================================================= */}
          {activePage === 'logbook' && (
            <div className="p-6 sm:p-8 space-y-8 bg-slate-100/70">
              
              {/* Header Banner */}
              <div className="bg-[#0f2b48] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold uppercase tracking-wider border border-sky-400/30">
                      <BookOpen className="w-3.5 h-3.5 text-sky-300" />
                      <span>Gestor de Bitácoras & Relatos Náuticos</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Cuadernos de Bitácora y Características
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Modifica los textos, coordenadas, clima, relatos del capitán y fotografías de las 4 características interactivas. Todo cambio se guarda en Supabase y se publica de inmediato en el sitio web.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 scale-105'
                        : 'bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{hasUnsavedChanges ? `Guardar Cambios (${Object.keys(drafts).length})` : 'Sin Cambios Pendientes'}</span>
                  </button>
                </div>

                {/* Vessel Selector Capsules (Centered & Modern) */}
                <div className="pt-4 border-t border-white/10 flex justify-center">
                  <div className="p-1.5 bg-black/25 border border-white/15 rounded-full flex flex-wrap items-center justify-center gap-1.5 shadow-inner backdrop-blur-md">
                    {[
                      { id: 'vegvisir_logbook', label: 'Velero Vegvisir (52.5 ft)', icon: Sailboat, defaultEntry: 'climatizacion' },
                      { id: 'terranova_logbook', label: 'Yate Terranova (65ft LRC)', icon: Ship, defaultEntry: 'climatizacion' },
                      { id: 'lodge_logbook', label: 'Lodge Rincón de Navegantes', icon: BedDouble, defaultEntry: 'arquitectura' },
                    ].map((v) => {
                      const Icon = v.icon;
                      const isSelected = activeLogbookVessel === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setActiveLogbookVessel(v.id as any);
                            setActiveLogbookEntry(v.defaultEntry);
                          }}
                          className={`px-5 py-2.5 rounded-full text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-[#0f2b48] shadow-md shadow-black/20 font-extrabold scale-[1.03]'
                              : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-900' : 'text-slate-300'}`} />
                          <span>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 1: VISTA PREVIA INTERACTIVA EN VIVO (4 TARJETAS HORIZONTALES) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                      Vista Previa Interactiva en Tiempo Real
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      (Haz clic sobre cualquiera de las 4 tarjetas para seleccionarla y editarla abajo)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {activeLogbookVessel === 'vegvisir_logbook'
                      ? '⛵ Velero Vegvisir'
                      : activeLogbookVessel === 'terranova_logbook'
                      ? '🚢 Yate Terranova'
                      : '🏡 Lodge Rincón'}
                  </span>
                </div>

                {/* 4 Cards arranged horizontally in a single row */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeLogbookVessel === 'vegvisir_logbook' && (
                      <>
                        {['climatizacion', 'gastronomia', 'casco', 'desembarcos'].map((key) => {
                          const eData = getLogbookEntry('vegvisir_logbook', key);
                          const isSelected = activeLogbookEntry === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setActiveLogbookEntry(key)}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 text-left ${
                                isSelected
                                  ? 'border-blue-900 bg-blue-50/25 shadow-md -translate-y-1 ring-2 ring-blue-900/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                  isSelected ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-600'
                                }`}>
                                  {key === 'climatizacion' ? <Thermometer className="w-5 h-5" /> : key === 'gastronomia' ? <Sparkles className="w-5 h-5" /> : key === 'casco' ? <Anchor className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-blue-900 bg-blue-100/90 px-2.5 py-0.5 rounded-full">
                                    Editando
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{eData.nav_title || key}</h4>
                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{eData.nav_description || 'Descripción...'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {activeLogbookVessel === 'terranova_logbook' && (
                      <>
                        {['climatizacion', 'gastronomia', 'casco', 'desembarcos'].map((key) => {
                          const eData = getLogbookEntry('terranova_logbook', key);
                          const isSelected = activeLogbookEntry === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setActiveLogbookEntry(key)}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 text-left ${
                                isSelected
                                  ? 'border-blue-900 bg-blue-50/25 shadow-md -translate-y-1 ring-2 ring-blue-900/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                  isSelected ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-600'
                                }`}>
                                  {key === 'climatizacion' ? <Layers className="w-5 h-5" /> : key === 'gastronomia' ? <Sparkles className="w-5 h-5" /> : key === 'casco' ? <Gauge className="w-5 h-5" /> : <Anchor className="w-5 h-5" />}
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-blue-900 bg-blue-100/90 px-2.5 py-0.5 rounded-full">
                                    Editando
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{eData.nav_title || key}</h4>
                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{eData.nav_description || 'Descripción...'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {activeLogbookVessel === 'lodge_logbook' && (
                      <>
                        {['arquitectura', 'quincho', 'exploraciones', 'atardeceres'].map((key) => {
                          const eData = getLogbookEntry('lodge_logbook', key);
                          const isSelected = activeLogbookEntry === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setActiveLogbookEntry(key)}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 text-left ${
                                isSelected
                                  ? 'border-emerald-800 bg-emerald-50/25 shadow-md -translate-y-1 ring-2 ring-emerald-800/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                  isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-50 text-slate-600'
                                }`}>
                                  {key === 'arquitectura' ? <Home className="w-5 h-5" /> : key === 'quincho' ? <UtensilsCrossed className="w-5 h-5" /> : key === 'exploraciones' ? <Compass className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                                    Editando
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{eData.nav_title || key}</h4>
                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{eData.nav_description || 'Descripción...'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: FORMULARIO DE EDICIÓN (ABAJO CON MÁXIMO ESPACIO) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
                
                {/* 2 Wide Columns Grid for Form Inputs */}
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Botón Lateral y Fotografía */}
                  <div className="space-y-6">
                    
                    {/* Card A: Configuración del Botón */}
                    <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Tarjeta de Selección (Botón Lateral)</h4>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Título de la Característica:
                          </label>
                          <input
                            type="text"
                            value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.nav_title || ''}
                            onChange={(e) =>
                              setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'nav_title', e.target.value)
                            }
                            placeholder="Ej: Climatización Sistema Webasto"
                            className="w-full bg-white border border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none transition shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Descripción Breve del Botón:
                          </label>
                          <textarea
                            rows={3}
                            value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.nav_description || ''}
                            onChange={(e) =>
                              setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'nav_description', e.target.value)
                            }
                            placeholder="Breve resumen visible en el botón..."
                            className="w-full bg-white border border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl px-3.5 py-2 text-xs text-slate-700 leading-relaxed focus:outline-none transition resize-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card B: Fotografía de la Bitácora */}
                    <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Fotografía de la Bitácora (Snapshot)</h4>
                      </div>

                      <div className="space-y-4">
                        {/* Image Preview on Top */}
                        <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm relative group">
                          {getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.image ? (
                            <img
                              src={getLogbookEntry(activeLogbookVessel, activeLogbookEntry).image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                              <ImageIcon className="w-8 h-8 opacity-40" />
                              <span className="text-xs text-slate-400">Sin fotografía seleccionada</span>
                            </div>
                          )}
                        </div>

                        {/* URL Field Below Image */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Enlace / URL de la Imagen:
                          </label>
                          <input
                            type="text"
                            value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.image || ''}
                            onChange={(e) =>
                              setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'image', e.target.value)
                            }
                            placeholder="https://... o sube una imagen"
                            className="w-full bg-white border border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:outline-none shadow-2xs"
                          />
                        </div>

                        {/* Button in Single Line */}
                        <button
                          type="button"
                          onClick={() =>
                            setMediaModal({
                              sectionKey: activeLogbookVessel,
                              entryId: activeLogbookEntry,
                              label: `Fotografía de Bitácora (${activeLogbookEntry})`,
                              currentValue: getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.image || '',
                            })
                          }
                          className="w-full py-2.5 bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap"
                        >
                          <Upload className="w-4 h-4 text-sky-300" />
                          <span>Subir o Cambiar Fotografía</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Datos Geográficos y Relato del Capitán */}
                  <div className="space-y-6 h-full flex flex-col">
                    
                    {/* Card C: Metadatos y Narrativa */}
                    <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                          <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                            3
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">Panel de Bitácora (Metadatos & Relato)</h4>
                        </div>

                        <div className="space-y-4">
                          {/* Navigation Metadata Grid (Exact 2x2 like Public Site) */}
                          <div className="grid grid-cols-2 gap-3.5 bg-slate-100/60 p-3.5 rounded-2xl border border-slate-200/80">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Ubicación:
                              </label>
                              <input
                                type="text"
                                value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.location || ''}
                                onChange={(e) =>
                                  setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'location', e.target.value)
                                }
                                placeholder="Ej: Canal Sarmiento"
                                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-900 font-extrabold focus:outline-none shadow-2xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Coordenadas:
                              </label>
                              <input
                                type="text"
                                value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.coordinates || ''}
                                onChange={(e) =>
                                  setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'coordinates', e.target.value)
                                }
                                placeholder="51°52' S, 73°40' W"
                                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2 text-xs font-mono text-blue-900 font-bold focus:outline-none shadow-2xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Wind className="w-3 h-3 text-slate-500" />
                                <span>Viento:</span>
                              </label>
                              <input
                                type="text"
                                value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.wind || ''}
                                onChange={(e) =>
                                  setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'wind', e.target.value)
                                }
                                placeholder="W 32 Nudos"
                                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none shadow-2xs"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Thermometer className="w-3 h-3 text-slate-500" />
                                <span>Clima:</span>
                              </label>
                              <input
                                type="text"
                                value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.temp || ''}
                                onChange={(e) =>
                                  setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'temp', e.target.value)
                                }
                                placeholder="2°C Ext"
                                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none shadow-2xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                              Relato del Capitán / Narrativa de Travesía:
                            </label>
                            <textarea
                              rows={11}
                              value={getLogbookEntry(activeLogbookVessel, activeLogbookEntry)?.text || ''}
                              onChange={(e) =>
                                setLogbookEntryField(activeLogbookVessel, activeLogbookEntry, 'text', e.target.value)
                              }
                              placeholder="Escribe aquí el relato en primera persona..."
                              className="w-full bg-white border border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl px-3.5 py-3 text-xs text-slate-700 italic leading-relaxed focus:outline-none transition resize-none shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CONTEXTUAL DE MEDIOS (SOLO PARA FOTOS Y VIDEOS) */}
      {/* ========================================================================= */}
      {mediaModal && (
        <div className="fixed inset-0 z-70 bg-[#0a1e34]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-[0_25px_60px_rgba(15,43,72,0.25)] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f2b48] text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-sky-700 block">
                    {mediaModal.sectionKey} • media_url
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#0f2b48]">
                    {mediaModal.label}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMediaModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mediaModal.entryId) {
                  setLogbookEntryField(mediaModal.sectionKey as any, mediaModal.entryId, 'image', mediaModal.currentValue);
                } else {
                  setField(mediaModal.sectionKey, 'media_url', mediaModal.currentValue);
                }
                setMediaModal(null);
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1">
                    URL de la Imagen o Video
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={mediaModal.currentValue}
                    onChange={(e) =>
                      setMediaModal({ ...mediaModal, currentValue: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-[#fbfcfd] border border-slate-200 focus:border-[#0f2b48] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-[#0f2b48] font-mono focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="text-[10px] uppercase font-bold text-[#0f2b48] block mb-1.5">
                    O Subir Archivo Directo a Supabase Storage
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#0f2b48] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-[#0f2b48]">
                      {uploadingMedia ? 'Subiendo archivo...' : 'Seleccionar fotografía o video'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-light">
                      JPG, PNG, WebP o MP4 hasta 50MB
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>

                {mediaModal.currentValue && (
                  <div className="h-36 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-900">
                    {isMediaVideo(mediaModal.currentValue) ? (
                      <video
                        src={mediaModal.currentValue}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaModal.currentValue}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMediaModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0f2b48] hover:bg-[#0a1e34] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Aplicar al Canvas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI API KEY SETTINGS MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900">
                    Conectar API de Inteligencia Artificial
                  </h4>
                  <p className="text-[11px] text-slate-500">Google Gemini API (100% Gratuito)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p>
                El sitio cuenta con un <strong>motor de traducción náutico inteligente integrado</strong>. Si deseas conectar tu propia API Key de Google Gemini para traducciones avanzadas con IA generativa, puedes ingresarla a continuación.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Estado: Motor de IA Activo y Listo</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Google Gemini API Key:
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[10px] text-slate-400">
                La clave se almacena de forma segura en tu navegador y se utiliza para auto-traducir al presionar "Guardar".
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                {apiKeySavedMsg ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>¡Guardada con éxito!</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Guardar Clave</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </CmsContext.Provider>
  );
};
