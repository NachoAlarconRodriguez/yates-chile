import React, { useState, useEffect } from 'react';
import { EXPEDITIONS } from '../components/modules/ExpeditionCalendar';
import { Lock, User, Check, X, LogOut, Trash2, Plus, Search, ShieldAlert, Calendar, FileText, Phone, Mail, ArrowRight } from 'lucide-react';

interface Booking {
  id: string;
  fullName: string;
  docId: string;
  phone: string;
  email: string;
  expeditionName: string;
  guestsCount: number;
  dateCreated: string;
  status: 'pendiente' | 'confirmada' | 'cancelada';
}

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'res-1',
    fullName: 'Alejandro Domínguez',
    docId: '12.456.789-0',
    phone: '+56 9 8888 7777',
    email: 'a.dominguez@gmail.com',
    expeditionName: 'Expedición Robinson',
    guestsCount: 2,
    dateCreated: '2026-08-10',
    status: 'confirmada'
  },
  {
    id: 'res-2',
    fullName: 'María José Prieto',
    docId: '15.632.189-K',
    phone: '+56 9 9999 8888',
    email: 'mj.prieto@uc.cl',
    expeditionName: 'Travesía Robinson',
    guestsCount: 4,
    dateCreated: '2026-08-11',
    status: 'pendiente'
  },
  {
    id: 'res-3',
    fullName: 'Pierre Dubois',
    docId: 'P984719',
    phone: '+33 6 1234 5678',
    email: 'p.dubois@sorbonne.fr',
    expeditionName: 'Selkirk Colombia',
    guestsCount: 1,
    dateCreated: '2026-08-12',
    status: 'pendiente'
  }
];

const formatRut = (value: string): string => {
  const clean = value.replace(/[\s.-]/g, '');
  if (clean.length === 0) return '';
  
  if (/[^0-9kK]/.test(clean)) {
    return clean.toUpperCase();
  }
  
  const limited = clean.substring(0, 9);
  if (limited.length === 1) {
    return limited.toUpperCase();
  }
  
  const body = limited.slice(0, -1);
  const dv = limited.slice(-1).toUpperCase();
  
  let formattedBody = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formattedBody = body.charAt(i) + formattedBody;
    count++;
    if (count === 3 && i > 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  return `${formattedBody}-${dv}`;
};

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    fullName: '',
    docId: '',
    phone: '',
    email: '',
    expeditionName: EXPEDITIONS[0]?.name || '',
    guestsCount: 2
  });

  // Load bookings from localStorage or set defaults
  useEffect(() => {
    // Check session first
    const session = localStorage.getItem('yates_admin_session');
    if (session === 'active') {
      setIsAuthenticated(true);
    }

    try {
      const stored = localStorage.getItem('yates_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Map and ensure all objects have the expected fields to avoid rendering crashes
          const cleaned = parsed.map((item: any, idx: number) => ({
            id: item.id || `res-${Date.now()}-${idx}`,
            fullName: item.fullName || 'Pasajero Anónimo',
            docId: item.docId || 'No Registrado',
            phone: item.phone || '',
            email: item.email || '',
            expeditionName: item.expeditionName || 'Travesía Austral',
            guestsCount: parseInt(item.guestsCount) || 2,
            dateCreated: item.dateCreated || new Date().toISOString().split('T')[0],
            status: item.status || 'pendiente'
          }));
          setBookings(cleaned);
          localStorage.setItem('yates_bookings', JSON.stringify(cleaned));
          return;
        }
      }
    } catch (e) {
      console.error('Error loading bookings from localStorage:', e);
    }

    localStorage.setItem('yates_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    setBookings(DEFAULT_BOOKINGS);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@yateschile.cl' && password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('yates_admin_session', 'active');
    } else {
      setLoginError('Credenciales incorrectas. Verifique usuario y contraseña.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('yates_admin_session');
  };

  const updateBookingStatus = (id: string, status: 'confirmada' | 'pendiente' | 'cancelada') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem('yates_bookings', JSON.stringify(updated));
  };

  const deleteBooking = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta solicitud de reserva?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem('yates_bookings', JSON.stringify(updated));
    }
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Booking = {
      id: `res-${Date.now()}`,
      fullName: newBooking.fullName,
      docId: newBooking.docId,
      phone: newBooking.phone,
      email: newBooking.email,
      expeditionName: newBooking.expeditionName,
      guestsCount: newBooking.guestsCount,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'pendiente'
    };

    const updated = [created, ...bookings];
    setBookings(updated);
    localStorage.setItem('yates_bookings', JSON.stringify(updated));
    setShowAddModal(false);

    // Reset form
    setNewBooking({
      fullName: '',
      docId: '',
      phone: '',
      email: '',
      expeditionName: EXPEDITIONS[0]?.name || '',
      guestsCount: 2
    });
  };

  // Stats calculation
  const totalReservas = bookings.length;
  const pendientes = bookings.filter(b => b.status === 'pendiente').length;
  const confirmadas = bookings.filter(b => b.status === 'confirmada').length;

  // Filtered list with safety guards
  const filteredBookings = bookings.filter(b => {
    if (!b) return false;
    const name = b.fullName || '';
    const doc = b.docId || '';
    const exp = b.expeditionName || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  try {
    if (!isAuthenticated) {
      return (
        <div className="min-h-[85vh] bg-[#070D19] flex items-center justify-center px-4 py-16 relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="max-w-md w-full relative z-10 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Logo & Header */}
            <div className="text-center mb-8 space-y-3">
              <img
                src="/vegvisir-emblem.svg"
                alt="Logo Vegvisir Emblem"
                className="w-12 h-12 mx-auto brightness-0 invert"
              />
              <h1 className="font-serif text-2xl font-bold text-white tracking-wide uppercase">
                Yates Chile
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                Portal de Administración
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl space-y-6">
              
              <div className="border-b border-white/10 pb-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold uppercase">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Ingresar Credenciales
                </span>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">
                    Usuario / Correo *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="admin@yateschile.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none placeholder-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none placeholder-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 rounded-xl transition text-xs shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </form>

              <div className="text-center text-[10px] text-slate-500">
                Usa <span className="text-slate-400 font-bold font-mono">admin@yateschile.cl</span> / <span className="text-slate-400 font-bold font-mono">admin</span>
              </div>

            </div>

          </div>
        </div>
      );
    }

    // Dashboard view
    return (
      <div className="min-h-[85vh] bg-slate-50 flex flex-col lg:flex-row relative">
        
        {/* Sidebar Panel */}
        <aside className="w-full lg:w-64 bg-[#0F172A] text-white p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
          <div className="space-y-8">
            
            {/* Brand Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <img
                src="/vegvisir-emblem.svg"
                alt="Logo Vegvisir Emblem"
                className="w-9 h-9 brightness-0 invert"
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm tracking-wider">
                  YATES CHILE
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                  Administración
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 text-left">
              <div className="px-3.5 py-2.5 rounded-xl bg-blue-900/40 text-blue-300 font-bold text-xs uppercase tracking-wide flex items-center gap-2.5 border border-blue-500/20 shadow-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Solicitudes Reservas</span>
              </div>
            </nav>
          </div>

          {/* Logout button */}
          <div className="pt-6 border-t border-white/10 mt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-300 font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-hidden">
          
          {/* Page Title Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
            <div className="text-left">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                Sistema de Gestión Concierge
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                Control de Reservas Yates Chile
              </h2>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Reserva Manual</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-850">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Total Solicitudes</span>
                <p className="font-serif text-2xl font-bold text-slate-900">{totalReservas}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Pendientes Validación</span>
                <p className="font-serif text-2xl font-bold text-amber-600">{pendientes}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Confirmadas</span>
                <p className="font-serif text-2xl font-bold text-emerald-600">{confirmadas}</p>
              </div>
            </div>

          </div>

          {/* Table & Filtering */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Table Header Filter */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por pasajero, rut o expedición..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:border-slate-950 focus:outline-none placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[9px] font-bold">
                    <th className="p-4">Pasajero / Contacto</th>
                    <th className="p-4">RUT</th>
                    <th className="p-4">WhatsApp / Teléfono</th>
                    <th className="p-4">Expedición</th>
                    <th className="p-4 text-center">Nº Pasajeros</th>
                    <th className="p-4">Fecha Solicitud</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Name & Mail */}
                        <td className="p-4 space-y-0.5">
                          <div className="font-semibold text-slate-900 text-sm">{b.fullName}</div>
                          <div className="text-slate-400 text-[10px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-350" />
                            <span>{b.email}</span>
                          </div>
                        </td>
                        {/* RUT */}
                        <td className="p-4 font-mono font-semibold text-slate-700">{b.docId}</td>
                        {/* Phone */}
                        <td className="p-4 font-mono text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-350" />
                            <span>{b.phone}</span>
                          </div>
                        </td>
                        {/* Expedition */}
                        <td className="p-4">
                          <span className="font-serif font-bold text-slate-800 text-[13px]">{b.expeditionName}</span>
                        </td>
                        {/* Guests */}
                        <td className="p-4 text-center font-mono font-bold text-slate-800">{b.guestsCount}</td>
                        {/* Date */}
                        <td className="p-4 text-slate-500 font-mono">{b.dateCreated}</td>
                        {/* Status */}
                        <td className="p-4">
                          {b.status === 'confirmada' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250 font-semibold uppercase tracking-wider text-[9px] inline-block">
                              Confirmada
                            </span>
                          )}
                          {b.status === 'pendiente' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-250 font-semibold uppercase tracking-wider text-[9px] inline-block">
                              Pendiente
                            </span>
                          )}
                          {b.status === 'cancelada' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-250 font-semibold uppercase tracking-wider text-[9px] inline-block">
                              Cancelada
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {b.status !== 'confirmada' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'confirmada')}
                                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition flex items-center justify-center cursor-pointer border border-emerald-100 hover:border-emerald-600"
                                title="Confirmar Reserva"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {b.status !== 'cancelada' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'cancelada')}
                                className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-red-650 text-amber-600 hover:text-white transition flex items-center justify-center cursor-pointer border border-amber-100 hover:border-red-650"
                                title="Cancelar Reserva"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBooking(b.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition flex items-center justify-center cursor-pointer border border-red-100 hover:border-red-600"
                              title="Eliminar Registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        No se encontraron solicitudes de reserva que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </main>

        {/* Manual Booking Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-[scaleIn_0.25s_ease-out]">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 text-left bg-slate-50">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                  Ingreso Interno Concierge
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                  Crear Reserva Manual
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddBooking} className="p-6 space-y-4 text-left">
                <div>
                  <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                    Nombre Pasajero Líder *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={newBooking.fullName}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none placeholder-slate-350 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                      RUT / Pasaporte *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 12.345.678-9"
                      value={newBooking.docId}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, docId: formatRut(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none placeholder-slate-350 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. +56 9 1234 5678"
                      value={newBooking.phone}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none placeholder-slate-350 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none placeholder-slate-350 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5">
                      Expedición / Programa *
                    </label>
                    <select
                      value={newBooking.expeditionName}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, expeditionName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none focus:bg-white transition-colors h-[38px] cursor-pointer"
                    >
                      {EXPEDITIONS.map(exp => (
                        <option key={exp.id} value={exp.name}>{exp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-0.5 font-sans">
                      Nº Pasajeros
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newBooking.guestsCount}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, guestsCount: parseInt(e.target.value) || 2 }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 bg-slate-50/50 focus:border-slate-950 focus:outline-none focus:bg-white text-center font-mono font-bold h-[38px]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition text-xs text-center cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition text-xs text-center cursor-pointer shadow-md"
                  >
                    Crear Registro
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    );
  } catch (err: any) {
    console.error("AdminPage render error:", err);
    return (
      <div className="min-h-[80vh] bg-slate-900 text-white flex items-center justify-center p-6 w-full">
        <div className="max-w-md w-full bg-slate-950 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-red-400 font-bold text-lg font-serif">Error en Panel de Administración</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Se ha producido un error durante la renderización del panel. Por favor comparta este error con soporte técnico:
          </p>
          <pre className="p-4 bg-black/40 text-red-300 text-[10px] font-mono rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[300px]">
            {err?.stack || err?.message || String(err)}
          </pre>
          <button 
            onClick={() => {
              localStorage.removeItem('yates_bookings');
              localStorage.removeItem('yates_admin_session');
              window.location.reload();
            }}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-sm uppercase tracking-wider cursor-pointer"
          >
            Limpiar Datos y Reintentar
          </button>
        </div>
      </div>
    );
  }
};
