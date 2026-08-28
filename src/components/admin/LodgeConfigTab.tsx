import React, { useState } from 'react';
import { useLodge } from '../../hooks/useLodge';
import type { LodgeRoom } from '../../services/lodgeService';
import {
  BedDouble,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Users,
  Waves,
  Power
} from 'lucide-react';

const ROOM_PHOTO_PRESETS = [
  { label: 'Rincón de Navegantes (Albatros)', url: '/rincon-de-navegantes.jpg' },
  { label: 'Terraza & Vista Mar (Cumberland)', url: '/jf-noviembre.jpg' },
  { label: 'Maderas Nativas (Selkirk)', url: '/juan-fernandez-selkirk.jpg' },
  { label: 'Costanera Isleña (Vidriola)', url: '/jf-marzo.jpg' },
  { label: 'Bahía Cumberland Panorámica', url: '/patagonia-mar.jpg' },
];

export const LodgeConfigTab: React.FC = () => {
  const { rooms, createRoom, updateRoom, deleteRoom } = useLodge();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<LodgeRoom | null>(null);

  // Form State
  const [formRoomNumber, setFormRoomNumber] = useState<number>(1);
  const [formRoomName, setFormRoomName] = useState('');
  const [formRoomType, setFormRoomType] = useState('doble');
  const [formMaxPax, setFormMaxPax] = useState<number>(2);
  const [formBasePriceClp, setFormBasePriceClp] = useState<number>(220000);
  const [formHasOceanView, setFormHasOceanView] = useState(true);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/rincon-de-navegantes.jpg');
  const [formAmenities, setFormAmenities] = useState<string[]>([
    'Baño privado en suite',
    'Vista panorámica al mar',
    'Calefacción central',
    'Starlink WiFi 24/7'
  ]);
  const [newAmenityText, setNewAmenityText] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<LodgeRoom | null>(null);

  const totalMaxPax = rooms.reduce((acc, r) => acc + (r.max_pax || 2), 0);
  const activeRoomsCount = rooms.filter(r => r.is_active !== false).length;

  const openCreateModal = () => {
    setEditingRoom(null);
    const nextNum = rooms.length > 0 ? Math.max(...rooms.map(r => r.room_number)) + 1 : 1;
    setFormRoomNumber(nextNum);
    setFormRoomName(`Habitación ${nextNum}`);
    setFormRoomType('doble');
    setFormMaxPax(2);
    setFormBasePriceClp(220000);
    setFormHasOceanView(true);
    setFormDescription('Habitación de alto confort con vista panorámica a Bahía Cumberland y baño privado.');
    setFormImageUrl('/rincon-de-navegantes.jpg');
    setFormAmenities([
      'Baño privado en suite',
      'Vista panorámica a la bahía',
      'Ropa de cama premium de plumas',
      'Calefacción central',
      'Conexión Starlink WiFi 24/7'
    ]);
    setNewAmenityText('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (room: LodgeRoom) => {
    setEditingRoom(room);
    setFormRoomNumber(room.room_number);
    setFormRoomName(room.room_name);
    setFormRoomType(room.room_type || 'doble');
    setFormMaxPax(room.max_pax || 2);
    setFormBasePriceClp(room.base_price_clp || 220000);
    setFormHasOceanView(room.has_ocean_view !== false);
    setFormDescription(room.description || 'Habitación con vista al mar y baño en suite en Lodge Bahía Cumberland.');
    setFormImageUrl(room.image_url || '/rincon-de-navegantes.jpg');
    setFormAmenities(room.amenities && room.amenities.length > 0 ? room.amenities : [
      'Baño privado en suite',
      'Vista al mar',
      'Calefacción',
      'Starlink WiFi'
    ]);
    setNewAmenityText('');
    setFormIsActive(room.is_active !== false);
    setIsModalOpen(true);
  };

  const handleAddAmenity = () => {
    if (!newAmenityText.trim()) return;
    setFormAmenities(prev => [...prev, newAmenityText.trim()]);
    setNewAmenityText('');
  };

  const handleRemoveAmenity = (index: number) => {
    setFormAmenities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomName.trim()) {
      alert('Por favor ingresa el nombre de la habitación.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRoom) {
        // Update existing room
        await updateRoom(editingRoom.id, {
          room_number: formRoomNumber,
          room_name: formRoomName.trim(),
          room_type: formRoomType as 'doble' | 'triple',
          max_pax: formMaxPax,
          base_price_clp: formBasePriceClp,
          has_ocean_view: formHasOceanView,
          description: formDescription.trim(),
          image_url: formImageUrl.trim(),
          amenities: formAmenities,
          is_active: formIsActive
        });
      } else {
        // Create new room
        await createRoom({
          room_number: formRoomNumber,
          room_name: formRoomName.trim(),
          room_type: formRoomType as 'doble' | 'triple',
          max_pax: formMaxPax,
          base_price_clp: formBasePriceClp,
          has_ocean_view: formHasOceanView,
          description: formDescription.trim(),
          image_url: formImageUrl.trim() || '/rincon-de-navegantes.jpg',
          amenities: formAmenities,
          is_active: formIsActive
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error al guardar habitación: ${err?.message || 'Revisa la consola'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (room: LodgeRoom) => {
    try {
      const nextState = room.is_active === false ? true : false;
      await updateRoom(room.id, { is_active: nextState });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmRoom) return;
    try {
      await deleteRoom(deleteConfirmRoom.id);
      setDeleteConfirmRoom(null);
    } catch (err: any) {
      alert(`Error al eliminar habitación: ${err?.message}`);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active') return matchesSearch && r.is_active !== false;
    if (filterType === 'inactive') return matchesSearch && r.is_active === false;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-900 text-xs font-mono font-bold uppercase tracking-wider">
            <BedDouble className="w-3.5 h-3.5 text-purple-700" />
            <span>Configuración del Lodge Bahía Cumberland</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b192c]">
            Gestión de Habitaciones & Tarifas
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-light">
            Administra las habitaciones del Lodge, precios por noche, fotografías, comodidades y capacidad de aforo. Todos los cambios se reflejan automáticamente en el calendario de reservas del Lodge, la página web pública (<span className="font-mono text-slate-700 font-medium">/lodge</span>) y los cálculos de expediciones.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-bold transition shadow-md shadow-[#0b192c]/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Nueva Habitación</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Total Habitaciones</span>
            <span className="text-xl font-serif font-bold text-[#0b192c] block">{rooms.length} Habitaciones</span>
            <span className="text-[11px] text-emerald-700 font-medium">{activeRoomsCount} disponibles</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Capacidad Total Lodge</span>
            <span className="text-xl font-serif font-bold text-[#0b192c] block">{totalMaxPax} Huéspedes</span>
            <span className="text-[11px] text-slate-500 font-light">Aforo completo simultáneo</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Vista al Mar</span>
            <span className="text-xl font-serif font-bold text-[#0b192c] block">
              {rooms.filter(r => r.has_ocean_view !== false).length} / {rooms.length}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Frente a Bahía Cumberland</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0b192c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'all' ? 'bg-[#0b192c] text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas ({rooms.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'active' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Activas ({activeRoomsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'inactive' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            En Mantenimiento ({rooms.length - activeRoomsCount})
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isActive = room.is_active !== false;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 opacity-75 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={room.image_url || '/rincon-de-navegantes.jpg'}
                    alt={room.room_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Room Number & Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-black/70 text-sky-300 backdrop-blur-md border border-white/10">
                      N° {room.room_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase backdrop-blur-md ${
                      isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-600/90 text-white'
                    }`}>
                      {isActive ? 'Activa' : 'Mantenimiento'}
                    </span>
                  </div>

                  {/* Ocean View Tag */}
                  {room.has_ocean_view !== false && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-600/90 text-white backdrop-blur-md flex items-center gap-1">
                        <Waves className="w-3 h-3" />
                        <span>Vista Mar</span>
                      </span>
                    </div>
                  )}

                  {/* Price Banner */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      ${(room.base_price_clp || 220000).toLocaleString('es-CL')} CLP
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>{room.max_pax || 2} PAX</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-[#0b192c]">
                        {room.room_name}
                      </h3>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {room.room_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-light mt-1 line-clamp-2 leading-relaxed">
                      {room.description || 'Habitación con vista al mar y baño en suite.'}
                    </p>
                  </div>

                  {/* Amenities Tags */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    {(room.amenities || ['Baño privado', 'Vista al mar', 'Starlink WiFi']).slice(0, 3).map((amenity, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(room)}
                    className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      isActive ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                    title={isActive ? 'Poner en mantenimiento' : 'Activar habitación'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmRoom(room)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                    title="Eliminar habitación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(room)}
                  className="px-3.5 py-2 rounded-xl bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Editar</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR HABITACIÓN */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-left my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0b192c]">
                    {editingRoom ? `Editar: ${editingRoom.room_name}` : 'Nueva Habitación en Lodge'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Configura los datos, tarifas y fotos de la habitación en Bahía Cumberland.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              
              {/* Row 1: Number, Name, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(Number(e.target.value))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Albatros"
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Tipo
                  </label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="doble">Doble / Matrimonial</option>
                    <option value="triple">Triple</option>
                    <option value="suite">Suite Superior</option>
                    <option value="familiar">Familiar</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Max Pax, Price CLP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Capacidad Máxima (PAX)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formMaxPax}
                    onChange={(e) => setFormMaxPax(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Tarifa Base por Noche (CLP)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      min="10000"
                      value={formBasePriceClp}
                      onChange={(e) => setFormBasePriceClp(Number(e.target.value))}
                      className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:border-[#0b192c] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
                      CLP / noche
                    </span>
                  </div>
                </div>
              </div>

              {/* Ocean View Toggle */}
              <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Vista al Mar Garantizada</span>
                    <span className="text-[11px] text-slate-500">La habitación cuenta con ventanal directo a Bahía Cumberland</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formHasOceanView}
                  onChange={(e) => setFormHasOceanView(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                  Descripción de la Habitación
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe la distribución de camas, diseño y comodidades..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Image URL & Presets */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-700 block">
                  Fotografía de la Habitación
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Ruta local o URL de la fotografía"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:border-[#0b192c] focus:outline-none"
                  />
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Presets fotos:</span>
                  {ROOM_PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImageUrl(p.url)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition cursor-pointer ${
                        formImageUrl === p.url
                          ? 'bg-[#0b192c] text-white border-[#0b192c]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] uppercase font-bold text-slate-700 block">
                  Comodidades & Servicios en Habitación
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Ropa de cama de plumas hipoalergénica"
                    value={newAmenityText}
                    onChange={(e) => setNewAmenityText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer shrink-0"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {formAmenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px]"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="text-purple-400 hover:text-rose-600 transition cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Estado de la Habitación</span>
                  <p className="text-[11px] text-slate-500">
                    Si está en mantenimiento, no se ofrecerá para reservas ni en el calendario de expediciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(prev => !prev)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    formIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {formIsActive ? 'Disponible' : 'Mantenimiento'}
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0b192c] hover:bg-[#182a44] text-white font-bold cursor-pointer transition shadow-md shadow-[#0b192c]/20"
                >
                  {isSubmitting ? 'Guardando...' : editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {deleteConfirmRoom && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[#0b192c]">
                ¿Eliminar {deleteConfirmRoom.room_name}?
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-light">
                Esta acción eliminará la habitación del Lodge y del calendario de disponibilidad. Esta operación no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRoom(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition shadow-md shadow-rose-600/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
