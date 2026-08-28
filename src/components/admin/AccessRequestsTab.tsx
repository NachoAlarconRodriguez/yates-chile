import React, { useState } from 'react';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import type { AdminAccessRequest } from '../../services/accessRequestService';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Mail,
  Phone,
  Search,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export const AccessRequestsTab: React.FC = () => {
  const {
    requests,
    pendingCount,
    approveRequest,
    rejectRequest,
    deleteRequest
  } = useAccessRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionConfirm, setActionConfirm] = useState<{
    type: 'approve' | 'reject' | 'delete';
    request: AdminAccessRequest;
  } | null>(null);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm);

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  const handleActionExecute = async () => {
    if (!actionConfirm) return;
    try {
      if (actionConfirm.type === 'approve') {
        await approveRequest(actionConfirm.request.id);
      } else if (actionConfirm.type === 'reject') {
        await rejectRequest(actionConfirm.request.id);
      } else if (actionConfirm.type === 'delete') {
        await deleteRequest(actionConfirm.request.id);
      }
      setActionConfirm(null);
    } catch (err: any) {
      alert(`Error al procesar la solicitud: ${err?.message}`);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-xs font-mono font-bold uppercase tracking-wider">
            <UserPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Seguridad & Permisos de Acceso</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b192c]">
            Solicitudes de Acceso al Panel
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-light">
            Revisa, autoriza o deniega las peticiones de ingreso enviadas por capitanes, tripulación o personal administrativo desde la pantalla de login.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 shrink-0 animate-pulse">
            <Clock className="w-5 h-5 text-amber-700" />
            <div>
              <span className="font-bold text-amber-900 text-xs block">
                {pendingCount} {pendingCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
              </span>
              <span className="text-[11px] text-amber-700">Requiere revisión del Administrador</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-700 block">Pendientes</span>
          <span className="text-2xl font-serif font-bold text-[#0b192c] block mt-1">{pendingCount}</span>
          <span className="text-[11px] text-slate-400 font-light">Por revisar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 block">Aprobadas</span>
          <span className="text-2xl font-serif font-bold text-[#0b192c] block mt-1">
            {requests.filter(r => r.status === 'approved').length}
          </span>
          <span className="text-[11px] text-slate-400 font-light">Acceso otorgado</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-mono font-bold text-rose-700 block">Rechazadas</span>
          <span className="text-2xl font-serif font-bold text-[#0b192c] block mt-1">
            {requests.filter(r => r.status === 'rejected').length}
          </span>
          <span className="text-[11px] text-slate-400 font-light">Denegadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Total Histórico</span>
          <span className="text-2xl font-serif font-bold text-[#0b192c] block mt-1">{requests.length}</span>
          <span className="text-[11px] text-slate-400 font-light">Peticiones recibidas</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0b192c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#0b192c] text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'approved' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Aprobadas ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'rejected' ? 'bg-rose-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Rechazadas ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Requests Table / List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#0b192c]">No hay solicitudes registradas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-light">
            Cuando un colaborador o capitán solicite acceso desde la pantalla de login, aparecerá inmediatamente en esta sección para tu revisión.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => {
              const cleanPhone = req.phone.replace(/[^\d+]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.replace('+', '') : `56${cleanPhone}`}`;

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  {/* User info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-[#0b192c] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {req.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-base text-[#0b192c]">
                          {req.fullName}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-light">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${req.email}`} className="hover:text-blue-600 transition font-mono">
                            {req.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`tel:${req.phone}`} className="hover:text-blue-600 transition font-mono">
                            {req.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Solicitado el {formatDate(req.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      title="Contactar por WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    {req.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActionConfirm({ type: 'approve', request: req })}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aceptar Acceso</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionConfirm({ type: 'reject', request: req })}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActionConfirm({ type: req.status === 'approved' ? 'reject' : 'approve', request: req })}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        {req.status === 'approved' ? 'Revocar Acceso' : 'Reconsiderar & Aprobar'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActionConfirm({ type: 'delete', request: req })}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Eliminar solicitud"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ACCIÓN */}
      {/* ========================================================================= */}
      {actionConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              actionConfirm.type === 'approve'
                ? 'bg-emerald-100 text-emerald-600'
                : actionConfirm.type === 'reject'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-rose-100 text-rose-600'
            }`}>
              {actionConfirm.type === 'approve' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : actionConfirm.type === 'reject' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
            </div>

            <div>
              <h4 className="font-serif font-bold text-lg text-[#0b192c]">
                {actionConfirm.type === 'approve'
                  ? `¿Aprobar acceso para ${actionConfirm.request.fullName}?`
                  : actionConfirm.type === 'reject'
                  ? `¿Rechazar solicitud de ${actionConfirm.request.fullName}?`
                  : `¿Eliminar solicitud de ${actionConfirm.request.fullName}?`}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-light">
                {actionConfirm.type === 'approve'
                  ? 'El colaborador quedará registrado con estatus Aprobado para acceder a las funciones del panel.'
                  : actionConfirm.type === 'reject'
                  ? 'La solicitud quedará marcada como rechazada.'
                  : 'Esta solicitud será eliminada definitivamente del historial.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActionExecute}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition shadow-md ${
                  actionConfirm.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : actionConfirm.type === 'reject'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                {actionConfirm.type === 'approve' ? 'Sí, Aprobar Acceso' : actionConfirm.type === 'reject' ? 'Sí, Rechazar' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
