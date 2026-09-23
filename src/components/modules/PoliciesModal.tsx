import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Sailboat,
  BedDouble,
  Info,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteContent } from '../../hooks/useSiteContent';
import {
  DEFAULT_LODGE_POLICIES,
  cmsService,
  type GlobalPoliciesConfig
} from '../../services/cmsService';
import {
  DEFAULT_EXPEDITION_POLICIES,
  getEmbeddablePdfUrl,
  getDirectPdfUrl
} from '../../services/expeditionService';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'lodge' | 'expeditions' | null;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = null,
}) => {
  const { t } = useLanguage();
  const { getRawSection } = useSiteContent();

  // State: null means show the selection buttons view; 'lodge' | 'expeditions' means show document
  const [selectedCategory, setSelectedCategory] = useState<'lodge' | 'expeditions' | null>(defaultTab);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('pdf');
  const [policies, setPolicies] = useState<GlobalPoliciesConfig>(() => cmsService.getGlobalPoliciesSync());

  // Sync state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(defaultTab);
      setViewMode('pdf');
    }
  }, [isOpen, defaultTab]);

  // Synchronize policies whenever modal opens or real-time CMS updates fire
  useEffect(() => {
    let isMounted = true;
    async function loadFresh() {
      try {
        const fresh = await cmsService.getGlobalPolicies();
        if (isMounted) setPolicies(fresh);
      } catch (err) {
        console.error('Error fetching policies in modal:', err);
      }
    }
    if (isOpen) {
      setPolicies(cmsService.getGlobalPoliciesSync());
      loadFresh();
    }
    const handleUpdate = () => {
      setPolicies(cmsService.getGlobalPoliciesSync());
      loadFresh();
    };
    window.addEventListener('yates_policies_updated', handleUpdate);
    window.addEventListener('cms_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('yates_policies_updated', handleUpdate);
      window.removeEventListener('cms_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Retrieve global policies from SiteContentContext or cmsService
  const globalPolicies: GlobalPoliciesConfig = useMemo(() => {
    const sec = getRawSection('general_policies');
    const meta = (sec?.metadata as any) || {};
    const local = cmsService.getGlobalPoliciesSync();
    return {
      expeditions_policy_url: meta.expeditions_policy_url || local.expeditions_policy_url || '',
      lodge_policy_url: meta.lodge_policy_url || local.lodge_policy_url || '',
    };
  }, [getRawSection]);

  const activePdfUrl = useMemo(() => {
    if (selectedCategory === 'lodge') {
      return (
        policies.lodge_policy_url ||
        globalPolicies.lodge_policy_url ||
        (typeof window !== 'undefined' ? localStorage.getItem('yates_lodge_policy_pdf_url') || '' : '') ||
        'https://drive.google.com/file/d/13_JMKK0XXhbqv82hBrKzpWBq1wvVS46x/view?usp=sharing'
      );
    }
    if (selectedCategory === 'expeditions') {
      return (
        policies.expeditions_policy_url ||
        globalPolicies.expeditions_policy_url ||
        (typeof window !== 'undefined' ? localStorage.getItem('yates_expeditions_policy_pdf_url') || '' : '') ||
        'https://drive.google.com/file/d/1XPI2uMtRvusGR_11OqpYBKTRiQgDqs0m/view?usp=sharing'
      );
    }
    return '';
  }, [selectedCategory, policies, globalPolicies]);

  const hasPdf = Boolean(activePdfUrl && activePdfUrl.trim().length > 0);
  const embedPdfUrl = hasPdf ? getEmbeddablePdfUrl(activePdfUrl) : '';
  const directPdfUrl = hasPdf ? getDirectPdfUrl(activePdfUrl) : '';

  // Default to showing the PDF document directly
  useEffect(() => {
    if (selectedCategory) {
      setViewMode('pdf');
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[#060B14]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policies-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full my-auto bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] relative text-slate-800 border border-slate-200 overflow-hidden transition-all duration-300 cursor-default animate-scaleIn ${
          selectedCategory === null
            ? 'max-w-2xl'
            : viewMode === 'pdf' && hasPdf
            ? 'max-w-5xl h-[88vh] flex flex-col'
            : 'max-w-3xl max-h-[88vh] flex flex-col'
        }`}
      >
        {/* ========================================================================= */}
        {/* CASO 1: PANTALLA INICIAL DE SELECCIÓN CON BOTONES DESTACADOS */}
        {/* ========================================================================= */}
        {selectedCategory === null ? (
          <div className="flex flex-col p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 id="policies-modal-title" className="font-serif font-bold text-xl sm:text-2xl text-[#0B192C] tracking-tight">
                    {t('Políticas de Reserva', 'Booking Policies')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {t('Selecciona la categoría para revisar las condiciones y documentos oficiales', 'Select a category to view terms and official policy documents')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label={t('Cerrar', 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Botón 1: Políticas de Reserva Lodge */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('lodge');
                  setViewMode('pdf');
                }}
                className="group relative flex flex-col text-left p-6 rounded-2xl border-2 border-slate-200/90 hover:border-indigo-600 bg-white hover:bg-indigo-50/20 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white flex items-center justify-center transition-colors duration-200 mb-4 shadow-2xs">
                  <BedDouble className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-base sm:text-lg text-[#0B192C] group-hover:text-indigo-950 mb-1.5 flex items-center justify-between">
                  <span>{t('Políticas de Reserva Lodge', 'Lodge Booking Policies')}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                  {t(
                    'Términos de estadía en Lodge Rincón de Navegantes (Isla Robinson Crusoe). Garantía de abono del 50%, check-in, cancelaciones y estadías.',
                    'Stay terms at Rincón de Navegantes Lodge (Robinson Crusoe Island). 50% deposit guarantee, check-in, cancellations and stays.'
                  )}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-700">
                  <span>{t('Ver documento completo', 'View full document')}</span>
                  <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>

              {/* Botón 2: Políticas de Reserva Expediciones */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('expeditions');
                  setViewMode('pdf');
                }}
                className="group relative flex flex-col text-left p-6 rounded-2xl border-2 border-slate-200/90 hover:border-sky-600 bg-white hover:bg-sky-50/20 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 group-hover:bg-[#0B192C] text-sky-700 group-hover:text-sky-300 flex items-center justify-center transition-colors duration-200 mb-4 shadow-2xs">
                  <Sailboat className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-base sm:text-lg text-[#0B192C] group-hover:text-sky-950 mb-1.5 flex items-center justify-between">
                  <span>{t('Políticas de Reserva Expediciones', 'Expedition Policies')}</span>
                  <ArrowRight className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                  {t(
                    'Condiciones de navegación marítima a Cabo de Hornos y Juan Fernández. Abono del 50%, cupos, condiciones meteorológicas y seguridad a bordo.',
                    'Ocean sailing terms to Cape Horn and Juan Fernández. 50% deposit guarantee, slots, weather conditions and safety aboard.'
                  )}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700">
                  <span>{t('Ver documento completo', 'View full document')}</span>
                  <span className="text-sky-600 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>
            </div>

            {/* Footer Trust Info */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {t('Documentos respaldados por Yates Chile SpA.', 'Documents backed by Yates Chile SpA.')}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                {t('Cerrar', 'Close')}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASO 2: DOCUMENTO COMPLETO DE LA POLÍTICA SELECCIONADA */
          /* ========================================================================= */
          <>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#F8FAFC] flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Botón de volver a la selección de botones */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition cursor-pointer shrink-0"
                    title={t('Volver a la selección de políticas', 'Back to policies selection')}
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">{t('Volver', 'Back')}</span>
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-[#0B192C] text-white flex items-center justify-center shrink-0 shadow-xs">
                    {selectedCategory === 'lodge' ? (
                      <BedDouble className="w-4.5 h-4.5 text-indigo-400" />
                    ) : (
                      <Sailboat className="w-4.5 h-4.5 text-sky-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 id="policies-modal-title" className="font-serif font-bold text-base sm:text-lg text-[#0B192C] tracking-tight truncate">
                      {selectedCategory === 'lodge'
                        ? t('Políticas de Reserva Lodge', 'Lodge Booking Policies')
                        : t('Políticas de Reserva Expediciones', 'Expedition Policies')}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedCategory === 'lodge'
                        ? t('Lodge Rincón de Navegantes • Archipiélago Juan Fernández', 'Rincón de Navegantes Lodge • Juan Fernández')
                        : t('Expediciones Náuticas • Cabo de Hornos & Juan Fernández', 'Nautical Expeditions • Cape Horn & Juan Fernández')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
                    aria-label={t('Cerrar', 'Close')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              {viewMode === 'pdf' && hasPdf ? (
                <div className="w-full flex-1 min-h-[500px] h-[65vh] bg-slate-100 p-2 sm:p-4 flex flex-col">
                  <iframe
                    src={embedPdfUrl}
                    className="w-full flex-1 rounded-2xl border border-slate-200 bg-white shadow-xs"
                    title={t('Documento Oficial de Políticas en PDF', 'Official Policy Document in PDF')}
                    allow="autoplay"
                  />
                  <div className="pt-2 px-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('Documento oficial vinculado desde administración', 'Official document linked from admin')}</span>
                    </span>
                    <a
                      href={directPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1 hover:underline ml-auto"
                    >
                      <span>{t('Abrir en ventana completa', 'Open in full window')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-7 space-y-6 text-left">
                  {/* Context Banner */}
                  <div className="rounded-2xl p-4 flex items-start gap-3 bg-sky-50/70 border border-sky-100 text-sky-950 text-xs">
                    <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 text-xs">
                        {selectedCategory === 'lodge'
                          ? t('Términos oficiales de estadía en Lodge Rincón de Navegantes', 'Official stay terms at Rincón de Navegantes Lodge')
                          : t('Condiciones náuticas y de zarpe para expediciones marítimas', 'Nautical and departure terms for oceanic expeditions')}
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {t(
                          'Para asegurar formalmente cualquier reserva, se requiere un abono inicial del 50%. Solo una vez validado por administración se bloquea de forma definitiva la fecha o el cupo.',
                          'To formally secure any reservation, an initial 50% deposit is required. Only once validated by management is the date or spot firmly blocked.'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Policy Articles List */}
                  <div className="divide-y divide-slate-100">
                    {selectedCategory === 'lodge' ? (
                      DEFAULT_LODGE_POLICIES.map((section) => (
                        <article key={section.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                          <h4 className="font-bold text-[#0B192C] text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <span>{section.title}</span>
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pl-3.5 border-l border-indigo-100">
                            {section.content}
                          </p>
                        </article>
                      ))
                    ) : (
                      DEFAULT_EXPEDITION_POLICIES.map((section) => (
                        <article key={section.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                          <h4 className="font-bold text-[#0B192C] text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                            <span>{section.title}</span>
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pl-3.5 border-l border-sky-100">
                            {section.content}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('Elegir otra categoría', 'Choose another category')}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#182a44] text-white font-semibold text-xs transition cursor-pointer ml-auto"
              >
                {t('Entendido y Cerrar', 'Understood & Close')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render via React Portal to document.body to avoid any parent stacking context or sticky header clipping
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
