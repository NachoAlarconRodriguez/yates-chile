import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sailboat,
  BedDouble,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cmsService } from '../../services/cmsService';

export const PoliciesConfigTab: React.FC = () => {
  const [expeditionsUrl, setExpeditionsUrl] = useState('');
  const [lodgeUrl, setLodgeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPolicies() {
      try {
        setLoading(true);
        const data = await cmsService.getGlobalPolicies();
        if (isMounted) {
          setExpeditionsUrl(data.expeditions_policy_url || '');
          setLodgeUrl(data.lodge_policy_url || '');
        }
      } catch (err) {
        console.error('Error cargando políticas globales:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPolicies();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await cmsService.saveGlobalPolicies({
        expeditions_policy_url: expeditionsUrl,
        lodge_policy_url: lodgeUrl,
      });
      if (res.success) {
        setMessage({
          text: 'Políticas y enlaces oficiales actualizados exitosamente en la nube.',
          type: 'success',
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({
          text: `Error al guardar: ${res.error || 'Intente nuevamente'}`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setMessage({
        text: `Error inesperado: ${err.message || 'Fallo de conexión'}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        <span className="text-xs font-semibold">Cargando configuración de políticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0b192c]">
                Políticas y Documentos Legales Centralizados
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <Sparkles className="w-3 h-3" />
                <span>Gestión Unificada</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Ingresa los enlaces directos (Drive, Dropbox o URL pública) de los documentos oficiales de políticas. El sistema los aplicará automáticamente a todas las reservas y en el botón «Políticas» de la barra de navegación pública.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0b192c] hover:bg-[#182a44] text-white font-bold text-xs transition shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
              <span>Guardando en la Nube...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-sky-300" />
              <span>Guardar Políticas Globales</span>
            </>
          )}
        </button>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Grid of Two Columns: Expediciones & Lodge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================================================= */}
        {/* 1. POLÍTICAS DE EXPEDICIONES */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs">
                  <Sailboat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#0b192c]">
                    Políticas de Reserva Expediciones
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Abono del 50%, zarpes, clima y navegaciones marítimas
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                Náutica
              </span>
            </div>

            {/* Input URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0b192c] uppercase tracking-wider font-mono">
                Enlace Directo del Documento (URL / PDF / Dropbox / Drive)
              </label>
              <input
                type="text"
                value={expeditionsUrl}
                onChange={(e) => setExpeditionsUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... o https://dropbox.com/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b192c]/20 focus:border-[#0b192c] transition bg-slate-50/50"
              />
            </div>

            {/* Probar enlace PDF */}
            {expeditionsUrl && (
              <div className="pt-1">
                <a
                  href={expeditionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 font-semibold text-xs transition border border-sky-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Probar Enlace PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. POLÍTICAS DEL LODGE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-2xs">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#0b192c]">
                    Políticas de Reserva Lodge
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Abono del 50%, estadía, check-in/out y cancelaciones
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                Hospedaje
              </span>
            </div>

            {/* Input URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0b192c] uppercase tracking-wider font-mono">
                Enlace Directo del Documento (URL / PDF / Dropbox / Drive)
              </label>
              <input
                type="text"
                value={lodgeUrl}
                onChange={(e) => setLodgeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... o https://dropbox.com/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b192c]/20 focus:border-[#0b192c] transition bg-slate-50/50"
              />
            </div>

            {/* Probar enlace PDF */}
            {lodgeUrl && (
              <div className="pt-1">
                <a
                  href={lodgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-semibold text-xs transition border border-indigo-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Probar Enlace PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
