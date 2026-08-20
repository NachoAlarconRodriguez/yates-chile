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
  Clock
} from 'lucide-react';
import { DEFAULT_CMS_CONTENT, type SiteContent } from '../../services/cmsService';
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

export const VisualCmsEditor: React.FC<VisualCmsEditorProps> = ({
  content,
  onSaveAllSections,
  onUploadMedia,
  refreshContent,
  onNavigate,
}) => {
  // Navigation State
  const [activePage, setActivePage] = useState<'home' | 'vegvisir' | 'terranova' | 'lodge' | 'expeditions' | 'contact'>('home');

  // Drafts State
  const [drafts, setDrafts] = useState<Record<string, Partial<SiteContent>>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Media Edit Modal State (only for image/video URLs & uploads)
  const [mediaModal, setMediaModal] = useState<{
    sectionKey: string;
    label: string;
    currentValue: string;
  } | null>(null);

  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);

  // Get field with draft priority and proper fallback
  const getField = (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url'): string => {
    if (drafts[sectionKey] && drafts[sectionKey][field] !== undefined && drafts[sectionKey][field] !== null) {
      return drafts[sectionKey][field] as string;
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

  // Set draft field
  const setField = (sectionKey: string, field: 'title' | 'subtitle' | 'body_text' | 'media_url', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        title: field === 'title' ? value : getField(sectionKey, 'title'),
        subtitle: field === 'subtitle' ? value : getField(sectionKey, 'subtitle'),
        body_text: field === 'body_text' ? value : getField(sectionKey, 'body_text'),
        media_url: field === 'media_url' ? value : getField(sectionKey, 'media_url'),
      },
    }));
  };

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(drafts).length > 0;
  }, [drafts]);

  // Handle Save All
  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    const res = await onSaveAllSections(drafts);
    setIsSaving(false);
    if (res.success) {
      setDrafts({});
      refreshContent();
      setSaveSuccessMsg('¡Todos los cambios fueron publicados en la web pública con éxito!');
      setTimeout(() => setSaveSuccessMsg(null), 4500);
    }
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
      setField(mediaModal.sectionKey, 'media_url', res.url);
      setMediaModal((prev) => (prev ? { ...prev, currentValue: res.url! } : null));
    }
  };

  const isMediaVideo = (url?: string | null) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('video/');
  };

  // =========================================================================
  // INLINE EDITABLE COMPONENT (DIRECT WYSIWYG ON CANVAS)
  // =========================================================================
  const InlineText: React.FC<{
    sectionKey: string;
    field: 'title' | 'subtitle' | 'body_text';
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
    className?: string;
    fallback?: string;
    multiline?: boolean;
  }> = ({ sectionKey, field, tag: Tag = 'div', className = '', fallback = '', multiline = false }) => {
    const elRef = useRef<HTMLElement>(null);
    const currentVal = getField(sectionKey, field) || fallback;
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (elRef.current && !isFocused) {
        if (elRef.current.innerText !== currentVal) {
          elRef.current.innerText = currentVal;
        }
      }
    }, [currentVal, isFocused]);

    return (
      <Tag
        ref={elRef as any}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          const text = e.currentTarget.innerText;
          setField(sectionKey, field, text);
        }}
        onInput={(e) => {
          const text = (e.currentTarget as HTMLElement).innerText;
          setField(sectionKey, field, text);
        }}
        onKeyDown={(e) => {
          if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        className={`cursor-text select-text outline-none transition-all duration-150 ${
          isFocused
            ? 'ring-2 ring-sky-400 bg-sky-500/20 rounded-md shadow-md'
            : 'hover:opacity-90'
        } ${className}`}
        title="Haz clic para escribir directamente aquí"
      />
    );
  };

  return (
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'home', label: 'Inicio (Home)', icon: Home },
              { id: 'vegvisir', label: 'Velero Vegvisir', icon: Sailboat },
              { id: 'terranova', label: 'Yate Terranova', icon: Ship },
              { id: 'lodge', label: 'Lodge Rincón', icon: BedDouble },
              { id: 'expeditions', label: 'Expediciones', icon: Compass },
              { id: 'contact', label: 'Contacto & Concierge', icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2b48] text-white shadow-md shadow-[#0f2b48]/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
                    src={getField('home_hero', 'media_url') || 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1'}
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
                      fallback="EXPEDICIONES PATAGONIA & JUAN FERNÁNDEZe"
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
                        src={getField('flota_vegvisir', 'media_url') || 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1'}
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
                            fallback="Velero Dufour 52.5 ft francés de expedición (12 PAX • 5 cabinas • 5 baños) con Starlink 24/7 y autonomía total."
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
                    src={getField('flota_vegvisir', 'media_url') || "https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1"}
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
                    fallback="Velero de expedición Dufour 52.5 ft (Astillero Francés, Matrícula QUI 2718) con capacidad para 12 PAX en 5 cabinas con 5 baños privados. Equipado con Starlink 24/7, instrumental Raymarine, desalinizador de 140 ltrs/hr y Zodiac de desembarco con motor Mercury 4T 15hp."
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
                setField(mediaModal.sectionKey, 'media_url', mediaModal.currentValue);
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
    </div>
  );
};
