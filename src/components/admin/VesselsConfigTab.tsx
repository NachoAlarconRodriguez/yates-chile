import React, { useState } from 'react';
import { useFleet } from '../../hooks/useFleet';
import type { Vessel } from '../../types';
import {
  Sailboat,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Layers,
  Users,
  Shield,
  Power
} from 'lucide-react';

const PHOTO_PRESETS = [
  { label: 'Velero Vegvisir', url: '/velero-vegvisir.jpg' },
  { label: 'Yate Terranova', url: '/yate-terranova.jpg' },
  { label: 'Expedición Austral', url: '/expediciones-hero.jpg' },
  { label: 'Fondeo en Bahía', url: '/jf-noviembre.jpg' },
  { label: 'Navegación Oceánica', url: '/patagonia-mar.jpg' },
];

export const VesselsConfigTab: React.FC = () => {
  const { vessels, createVessel, updateVessel, deleteVessel } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Velero de Expedición');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLength, setFormLength] = useState('50 ft');
  const [formMaxPax, setFormMaxPax] = useState<number>(10);
  const [formCabins, setFormCabins] = useState('4 Cabinas');
  const [formBathrooms, setFormBathrooms] = useState('4 Baños');
  const [formRegistration, setFormRegistration] = useState('');
  const [formBuilder, setFormBuilder] = useState('');
  const [formCrew, setFormCrew] = useState('Patrón de Ultramar + Tripulación / Chef');
  const [formMainImage, setFormMainImage] = useState('/velero-vegvisir.jpg');
  const [formFeatures, setFormFeatures] = useState<string[]>([
    'Conexión satelital Starlink 24/7',
    'Zodiac de desembarco con motor fuera de borda',
    'Desalinizador y autonomía de agua dulce',
    'Instrumental Raymarine de alta precisión'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmVessel, setDeleteConfirmVessel] = useState<Vessel | null>(null);

  const openCreateModal = () => {
    setEditingVessel(null);
    setFormName('');
    setFormType('Velero de Expedición');
    setFormTagline('');
    setFormDescription('');
    setFormLength('52.5 ft (16 m)');
    setFormMaxPax(10);
    setFormCabins('4 Cabinas');
    setFormBathrooms('4 Baños');
    setFormRegistration('');
    setFormBuilder('');
    setFormCrew('Patrón de Ultramar + Co-patrón + Chef');
    setFormMainImage('/velero-vegvisir.jpg');
    setFormFeatures([
      'Conexión satelital Starlink 24/7 en alta mar',
      'Bote Zodiac de desembarco con motor auxiliar',
      'Desalinizador de agua dulce para autonomía total',
      'Instrumental de navegación de última generación'
    ]);
    setNewFeatureText('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormName(vessel.name);
    setFormType(vessel.type);
    setFormTagline(vessel.tagline || '');
    setFormDescription(vessel.description || '');
    setFormLength(vessel.length || '50 ft');
    setFormMaxPax(vessel.maxPax || (vessel.id === 'vegvisir' ? 12 : 20));
    setFormCabins(vessel.cabins || '4 Cabinas');
    setFormBathrooms(vessel.bathrooms || '4 Baños');
    setFormRegistration(vessel.registration || '');
    setFormBuilder(vessel.builder || '');
    setFormCrew(vessel.crew || 'Patrón de Ultramar + Tripulación');
    setFormMainImage(vessel.mainImage || '/velero-vegvisir.jpg');
    setFormFeatures(vessel.features || []);
    setNewFeatureText('');
    setFormIsActive(vessel.isActive !== false);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormFeatures(prev => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingresa el nombre de la embarcación.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVessel) {
        // Update existing vessel
        await updateVessel(editingVessel.id, {
          name: formName.trim(),
          type: formType,
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          length: formLength.trim(),
          capacity: `Capacidad ${formMaxPax} pax`,
          maxPax: formMaxPax,
          cabins: formCabins.trim(),
          bathrooms: formBathrooms.trim(),
          registration: formRegistration.trim(),
          builder: formBuilder.trim(),
          crew: formCrew.trim(),
          mainImage: formMainImage.trim(),
          features: formFeatures,
          isActive: formIsActive
        });
      } else {
        // Create new vessel
        const newId = `vessel-${Date.now()}`;
        await createVessel({
          id: newId,
          name: formName.trim(),
          type: formType,
          tagline: formTagline.trim() || `${formName} - ${formType}`,
          description: formDescription.trim() || `${formName} es una embarcación de alto estándar diseñada para la navegación oceánica y expediciones de lujo.`,
          length: formLength.trim(),
          capacity: `Capacidad ${formMaxPax} pax`,
          maxPax: formMaxPax,
          cabins: formCabins.trim(),
          bathrooms: formBathrooms.trim(),
          registration: formRegistration.trim(),
          builder: formBuilder.trim(),
          crew: formCrew.trim(),
          mainImage: formMainImage.trim() || '/velero-vegvisir.jpg',
          features: formFeatures,
          isActive: formIsActive
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error al guardar la embarcación: ${err?.message || 'Revisa la consola'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (vessel: Vessel) => {
    try {
      const nextState = vessel.isActive === false ? true : false;
      await updateVessel(vessel.id, { isActive: nextState });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmVessel) return;
    try {
      await deleteVessel(deleteConfirmVessel.id);
      setDeleteConfirmVessel(null);
    } catch (err: any) {
      alert(`Error al eliminar embarcación: ${err?.message}`);
    }
  };

  const filteredVessels = vessels.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.tagline && v.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active') return matchesSearch && v.isActive !== false;
    if (filterType === 'inactive') return matchesSearch && v.isActive === false;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-bold uppercase tracking-wider">
            <Sailboat className="w-3.5 h-3.5 text-blue-700" />
            <span>Configuración de Flota Náutica</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b192c]">
            Gestión de Embarcaciones & Yates
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-light">
            Administra los barcos que componen la flota oficial. Cualquier cambio o nueva embarcación se sincroniza en tiempo real con la página pública (<span className="font-mono text-slate-700 font-medium">/flota</span>), el Creador de Expediciones y los formularios.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-bold transition shadow-md shadow-[#0b192c]/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Nueva Embarcación</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o eslora..."
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
            Todos ({vessels.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'active' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Activos ({vessels.filter(v => v.isActive !== false).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'inactive' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pausados ({vessels.filter(v => v.isActive === false).length})
          </button>
        </div>
      </div>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVessels.map((vessel) => {
          const isActive = vessel.isActive !== false;
          const maxPax = vessel.maxPax || (vessel.id === 'vegvisir' ? 12 : 20);

          return (
            <div
              key={vessel.id}
              className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 opacity-75 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={vessel.mainImage || '/velero-vegvisir.jpg'}
                    alt={vessel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                  
                  {/* Status badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-xs ${
                      isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-600/90 text-white'
                    }`}>
                      {isActive ? 'Activo en Flota' : 'Pausado'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/60 text-sky-300 backdrop-blur-md border border-white/10">
                      {vessel.length}
                    </span>
                  </div>

                  {/* Vessel Type Tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-serif font-bold text-sky-200 drop-shadow-sm">
                      {vessel.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>{maxPax} PAX</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0b192c] leading-snug">
                      {vessel.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-light mt-1 line-clamp-2 leading-relaxed">
                      {vessel.tagline || vessel.description}
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                      <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{vessel.cabins || '4 Cabinas'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                      <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{vessel.bathrooms || '4 Baños'}</span>
                    </div>
                  </div>

                  {/* Highlights Bullet points */}
                  <div className="space-y-1.5 pt-2 text-[11px] text-slate-600">
                    {(vessel.features || []).slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                    {(vessel.features || []).length > 3 && (
                      <span className="text-[10px] text-slate-400 italic pl-5 block">
                        +{(vessel.features || []).length - 3} características adicionales
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(vessel)}
                    className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isActive ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                    title={isActive ? 'Pausar embarcación' : 'Activar embarcación'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Pausar' : 'Activar'}</span>
                  </button>
                  
                  {vessel.id !== 'vegvisir' && vessel.id !== 'terranova' && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmVessel(vessel)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                      title="Eliminar embarcación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(vessel)}
                  className="px-3.5 py-2 rounded-xl bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5 text-sky-400" />
                  <span>Editar Ficha</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR EMBARCACIÓN */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-left my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <Sailboat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0b192c]">
                    {editingVessel ? `Editar: ${editingVessel.name}` : 'Crear Nueva Embarcación'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Configura las especificaciones técnicas y ficha pública del barco.
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

            <form onSubmit={handleSaveVessel} className="space-y-4 text-xs">
              
              {/* Row 1: Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Nombre del Barco / Yate <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Catamarán Fjord Explorer"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Tipo de Embarcación
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="Velero de Expedición">Velero de Expedición</option>
                    <option value="Yate a Motor">Yate a Motor</option>
                    <option value="Catamarán Oceánico">Catamarán Oceánico</option>
                    <option value="Crucero Austral">Crucero Austral</option>
                    <option value="Goleta Clásica">Goleta Clásica</option>
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                  Tagline / Lema Breve
                </label>
                <input
                  type="text"
                  placeholder="Ej: Embarcación de gran autonomía diseñada para fiordos y canales remotos"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe las características de navegación, habitabilidad y confort para la travesía..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Row 2: Length, Max Pax, Cabins, Bathrooms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Eslora</label>
                  <input
                    type="text"
                    placeholder="Ej: 52.5 ft (16m)"
                    value={formLength}
                    onChange={(e) => setFormLength(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Aforo Máx (PAX)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formMaxPax}
                    onChange={(e) => setFormMaxPax(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Cabinas</label>
                  <input
                    type="text"
                    placeholder="Ej: 5 Cabinas"
                    value={formCabins}
                    onChange={(e) => setFormCabins(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Baños</label>
                  <input
                    type="text"
                    placeholder="Ej: 5 Baños"
                    value={formBathrooms}
                    onChange={(e) => setFormBathrooms(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Selector with Presets */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-700 block">
                  Fotografía Principal de la Embarcación
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Ruta local (/velero-vegvisir.jpg) o URL externa"
                    value={formMainImage}
                    onChange={(e) => setFormMainImage(e.target.value)}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:border-[#0b192c] focus:outline-none"
                  />
                  {formMainImage && (
                    <img
                      src={formMainImage}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
                
                {/* Preset suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Presets rápidos:</span>
                  {PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormMainImage(p.url)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition cursor-pointer ${
                        formMainImage === p.url
                          ? 'bg-[#0b192c] text-white border-[#0b192c]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features List Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] uppercase font-bold text-slate-700 block">
                  Equipamiento & Características Incluidas
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Balsa salvavidas oceánica Viking para 12 personas"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-[#0b192c] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer shrink-0"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {formFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-blue-400 hover:text-rose-600 transition cursor-pointer ml-1"
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
                  <span className="font-bold text-slate-800">Estado en Flota</span>
                  <p className="text-[11px] text-slate-500">
                    Si está inactiva, no se mostrará como opción para nuevas reservas ni en la web pública.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(prev => !prev)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    formIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {formIsActive ? 'Disponible' : 'Pausada'}
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
                  {isSubmitting ? 'Guardando...' : editingVessel ? 'Guardar Cambios' : 'Crear Embarcación'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {deleteConfirmVessel && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[#0b192c]">
                ¿Eliminar {deleteConfirmVessel.name}?
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-light">
                Esta acción eliminará la embarcación de la flota activa. Esta operación no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmVessel(null)}
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
