import React, { useState, useEffect } from 'react';
import { useFleet } from '../../hooks/useFleet';
import type { Vessel, VesselTechSpecs, VesselGalleryItem, VesselCompassCard } from '../../types';
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
  Power,
  ExternalLink,
  Compass,
  Anchor,
  Radio,
  Droplets,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { getVesselPath } from '../../services/fleetService';
import { normalizeExternalMediaUrl } from '../../services/cmsService';
import { ManageableSelect } from './ManageableSelect';

const PHOTO_PRESETS = [
  { label: 'Velero Vegvisir', url: '/velero-vegvisir.jpg' },
  { label: 'Yate Terranova', url: '/yate-terranova.jpg' },
  { label: 'Expedición Austral', url: '/expediciones-hero.jpg' },
  { label: 'Fondeo en Bahía', url: '/jf-noviembre.jpg' },
  { label: 'Navegación Oceánica', url: '/patagonia-mar.jpg' },
];

const WIZARD_STEPS = [
  { id: 1, title: '1. Portada (Hero)', desc: 'Identidad y foto principal', icon: Sailboat },
  { id: 2, title: '2. Brújula Náutica', desc: 'Cards interactivas (Frente/Dorso)', icon: Compass },
  { id: 3, title: '3. Ficha Técnica', desc: 'Especificaciones oficiales', icon: Anchor },
  { id: 4, title: '4. Galería Drive', desc: 'Fotos del carrusel', icon: ImageIcon },
  { id: 5, title: '5. Equipamiento', desc: 'Accesorios y publicación', icon: Layers },
];

export const VesselsConfigTab: React.FC = () => {
  const { vessels, createVessel, updateVessel, deleteVessel } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

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
  const [formGallery, setFormGallery] = useState<VesselGalleryItem[]>([]);
  const [formFeatures, setFormFeatures] = useState<string[]>([
    'Conexión satelital Starlink 24/7',
    'Zodiac de desembarco con motor fuera de borda',
    'Desalinizador y autonomía de agua dulce',
    'Instrumental Raymarine de alta precisión'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detailed Tech Specs State (Paso 3)
  const [formTechSatellite, setFormTechSatellite] = useState('Starlink 24/7');
  const [formTechPlotter, setFormTechPlotter] = useState('Raymarine / Garmin');
  const [formTechAutopilot, setFormTechAutopilot] = useState('Raymarine Integrado');
  const [formTechComms, setFormTechComms] = useState('VHF Marino + AIS');
  const [formTechWatermaker, setFormTechWatermaker] = useState('140 ltrs/hr');
  const [formTechTender, setFormTechTender] = useState('Zodiac Semirrígido');
  const [formTechTenderEngine, setFormTechTenderEngine] = useState('Mercury 4T / 15 HP');
  const [formTechHeating, setFormTechHeating] = useState('Calefacción Marina');

  // Step 2: Compass Cards State (Brújula Náutica con Frente y Dorso)
  const [formCompassNorte, setFormCompassNorte] = useState<VesselCompassCard>({
    badge: 'NORTE / ASTILLERO',
    title: '',
    sub: '',
    backTitle: 'Identificación',
    backDesc: 'Diseñado para navegar las aguas del Pacífico Sur, fiordos y canales australes con total serenidad y confort.',
  });
  const [formCompassOeste, setFormCompassOeste] = useState<VesselCompassCard>({
    badge: 'OESTE / CAPACIDAD',
    title: '',
    sub: '',
    backTitle: 'Habitabilidad',
    backDesc: 'Alojamiento distribuido en cabinas privadas con baños en suite, amplio salón central y cocina para navegación oceánica prolongada.',
  });
  const [formCompassSur, setFormCompassSur] = useState<VesselCompassCard>({
    badge: 'SUR / TECNOLOGÍA',
    title: 'Starlink 24/7',
    sub: 'Conexión Satelital & Navegación',
    backTitle: 'Electrónica & Satelital',
    backDesc: 'Conexión satelital Starlink 24/7 de alta velocidad, plotter náutico, radar marino y piloto automático de precisión oceánica.',
  });
  const [formCompassEste, setFormCompassEste] = useState<VesselCompassCard>({
    badge: 'ESTE / SERVICIO',
    title: '',
    sub: 'Servicio & Seguridad de Bordo',
    backTitle: 'Autonomía & Desembarco',
    backDesc: 'Desalinizador de agua dulce 140 Ltrs/hr, bote auxiliar Zodiac semirrígido con motor fueraborda y climatización marina en cabinas.',
  });
  const [compassSides, setCompassSides] = useState<Record<'norte' | 'oeste' | 'sur' | 'este', 'front' | 'back'>>({
    norte: 'front',
    oeste: 'front',
    sur: 'front',
    este: 'front',
  });

  // Delete Confirmation Modal
  const [deleteConfirmVessel, setDeleteConfirmVessel] = useState<Vessel | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmVessel) {
          setDeleteConfirmVessel(null);
        } else if (isModalOpen && !isSubmitting) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmVessel, isModalOpen, isSubmitting]);

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
    setFormGallery([]);
    setFormFeatures([
      'Conexión satelital Starlink 24/7 en alta mar',
      'Bote Zodiac de desembarco con motor auxiliar',
      'Desalinizador de agua dulce para autonomía total',
      'Instrumental de navegación de última generación'
    ]);
    setNewFeatureText('');
    setFormIsActive(true);
    setFormTechSatellite('Starlink 24/7');
    setFormTechPlotter('Raymarine / Garmin');
    setFormTechAutopilot('Raymarine Integrado');
    setFormTechComms('VHF Marino + AIS');
    setFormTechWatermaker('140 ltrs/hr');
    setFormTechTender('Zodiac Semirrígido');
    setFormTechTenderEngine('Mercury 4T / 15 HP');
    setFormTechHeating('Calefacción Marina');

    setFormCompassNorte({
      badge: 'NORTE / ASTILLERO',
      title: '52.5 ft (16 m)',
      sub: 'Beneteau (Francés) • AILG 2532',
      backTitle: 'Identificación',
      backDesc: 'Diseñado para navegar las aguas del Pacífico Sur, fiordos y canales australes con total serenidad y confort.',
    });
    setFormCompassOeste({
      badge: 'OESTE / CAPACIDAD',
      title: '10 Pasajeros',
      sub: '4 Cabinas • 4 Baños',
      backTitle: 'Habitabilidad',
      backDesc: 'Alojamiento distribuido en 4 cabinas privadas con 4 baños en suite, amplio salón central y cocina para navegación oceánica prolongada.',
    });
    setFormCompassSur({
      badge: 'SUR / TECNOLOGÍA',
      title: 'Starlink 24/7',
      sub: 'Conexión Satelital & Navegación',
      backTitle: 'Electrónica & Satelital',
      backDesc: 'Conexión satelital Starlink 24/7 de alta velocidad, plotter náutico, radar marino y piloto automático de precisión oceánica.',
    });
    setFormCompassEste({
      badge: 'ESTE / SERVICIO',
      title: 'Patrón de Ultramar + Tripulación',
      sub: 'Servicio & Seguridad de Bordo',
      backTitle: 'Autonomía & Desembarco',
      backDesc: 'Desalinizador de agua dulce 140 Ltrs/hr, bote auxiliar Zodiac semirrígido con motor fueraborda y climatización marina en cabinas.',
    });
    setCompassSides({ norte: 'front', oeste: 'front', sur: 'front', este: 'front' });

    setCurrentStep(1);
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
    setFormGallery(vessel.gallery || []);
    setFormFeatures(vessel.features || []);
    setNewFeatureText('');
    setFormIsActive(vessel.isActive !== false);

    const s = (vessel.specs as VesselTechSpecs) || {};
    setFormTechSatellite(s.satellite || 'Starlink 24/7');
    setFormTechPlotter(s.plotter || 'Raymarine / Garmin');
    setFormTechAutopilot(s.autopilot || 'Raymarine Integrado');
    setFormTechComms(s.comms || 'VHF Marino + AIS');
    setFormTechWatermaker(s.watermaker || '140 ltrs/hr');
    setFormTechTender(s.tender || 'Zodiac Semirrígido');
    setFormTechTenderEngine(s.tenderEngine || 'Mercury 4T / 15 HP');
    setFormTechHeating(s.heating || 'Calefacción Marina');

    const c = s.compass || {};
    setFormCompassNorte({
      badge: c.norte?.badge || 'NORTE / ASTILLERO',
      title: c.norte?.title || vessel.length || 'Eslora Oceánica',
      sub: c.norte?.sub || `${vessel.builder || vessel.name} • ${vessel.registration || 'DIRECTEMAR'}`,
      backTitle: c.norte?.backTitle || 'Identificación',
      backDesc: c.norte?.backDesc || 'Diseñado para navegar las aguas del Pacífico Sur, fiordos y canales australes con total serenidad y confort.',
    });
    setFormCompassOeste({
      badge: c.oeste?.badge || 'OESTE / CAPACIDAD',
      title: c.oeste?.title || vessel.capacity || `${vessel.maxPax || 10} Pasajeros`,
      sub: c.oeste?.sub || `${vessel.cabins || '4 Cabinas'} • ${vessel.bathrooms || '4 Baños'}`,
      backTitle: c.oeste?.backTitle || 'Habitabilidad',
      backDesc: c.oeste?.backDesc || `Alojamiento distribuido en ${vessel.cabins || 'cabinas privadas'} con ${vessel.bathrooms || 'baños en suite'}, amplio salón central y cocina para navegación oceánica prolongada.`,
    });
    setFormCompassSur({
      badge: c.sur?.badge || 'SUR / TECNOLOGÍA',
      title: c.sur?.title || s.satellite || 'Starlink 24/7',
      sub: c.sur?.sub || 'Conexión Satelital & Navegación',
      backTitle: c.sur?.backTitle || 'Electrónica & Satelital',
      backDesc: c.sur?.backDesc || 'Conexión satelital Starlink 24/7 de alta velocidad, plotter náutico, radar marino y piloto automático de precisión oceánica.',
    });
    setFormCompassEste({
      badge: c.este?.badge || 'ESTE / SERVICIO',
      title: c.este?.title || vessel.crew || 'Patrón + Tripulación',
      sub: c.este?.sub || 'Servicio & Seguridad de Bordo',
      backTitle: c.este?.backTitle || 'Autonomía & Desembarco',
      backDesc: c.este?.backDesc || 'Desalinizador de agua dulce 140 Ltrs/hr, bote auxiliar Zodiac semirrígido con motor fueraborda y climatización marina en cabinas.',
    });
    setCompassSides({ norte: 'front', oeste: 'front', sur: 'front', este: 'front' });

    setCurrentStep(1);
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

  const handleAddGalleryItem = () => {
    setFormGallery(prev => [
      ...prev,
      {
        url: '',
        title: `Espacio ${prev.length + 1}`,
        location: 'A Bordo',
        desc: ''
      }
    ]);
  };

  const handleUpdateGalleryItem = (index: number, field: keyof VesselGalleryItem, value: string) => {
    setFormGallery(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveGalleryItem = (index: number) => {
    setFormGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingresa el nombre de la embarcación.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    const specsData: VesselTechSpecs = {
      satellite: formTechSatellite.trim() || 'Starlink 24/7',
      plotter: formTechPlotter.trim() || 'Raymarine / Garmin',
      autopilot: formTechAutopilot.trim() || 'Raymarine Integrado',
      comms: formTechComms.trim() || 'VHF Marino + AIS',
      watermaker: formTechWatermaker.trim() || '140 ltrs/hr',
      tender: formTechTender.trim() || 'Zodiac Semirrígido',
      tenderEngine: formTechTenderEngine.trim() || 'Mercury 4T / 15 HP',
      heating: formTechHeating.trim() || 'Calefacción Marina',
      compass: {
        norte: {
          badge: formCompassNorte.badge?.trim() || 'NORTE / ASTILLERO',
          title: formCompassNorte.title?.trim() || formLength.trim(),
          sub: formCompassNorte.sub?.trim() || `${formBuilder.trim()} • ${formRegistration.trim()}`,
          backTitle: formCompassNorte.backTitle?.trim() || 'Identificación',
          backDesc: formCompassNorte.backDesc?.trim() || '',
        },
        oeste: {
          badge: formCompassOeste.badge?.trim() || 'OESTE / CAPACIDAD',
          title: formCompassOeste.title?.trim() || `${formMaxPax} Pasajeros`,
          sub: formCompassOeste.sub?.trim() || `${formCabins.trim()} • ${formBathrooms.trim()}`,
          backTitle: formCompassOeste.backTitle?.trim() || 'Habitabilidad',
          backDesc: formCompassOeste.backDesc?.trim() || '',
        },
        sur: {
          badge: formCompassSur.badge?.trim() || 'SUR / TECNOLOGÍA',
          title: formCompassSur.title?.trim() || 'Starlink 24/7',
          sub: formCompassSur.sub?.trim() || 'Conexión Satelital & Navegación',
          backTitle: formCompassSur.backTitle?.trim() || 'Electrónica & Satelital',
          backDesc: formCompassSur.backDesc?.trim() || '',
        },
        este: {
          badge: formCompassEste.badge?.trim() || 'ESTE / SERVICIO',
          title: formCompassEste.title?.trim() || formCrew.trim() || 'Patrón + Tripulación',
          sub: formCompassEste.sub?.trim() || 'Servicio & Seguridad de Bordo',
          backTitle: formCompassEste.backTitle?.trim() || 'Autonomía & Desembarco',
          backDesc: formCompassEste.backDesc?.trim() || '',
        },
      },
    };

    const validGallery: VesselGalleryItem[] = formGallery
      .filter(item => item.url && item.url.trim().length > 0)
      .map(item => ({
        ...item,
        url: normalizeExternalMediaUrl(item.url.trim()) || item.url.trim(),
        title: item.title?.trim() || 'A Bordo',
        location: item.location?.trim() || 'Flota Yates Chile',
        desc: item.desc?.trim() || '',
      }));

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
          mainImage: normalizeExternalMediaUrl(formMainImage.trim()) || formMainImage.trim(),
          gallery: validGallery,
          features: formFeatures,
          specs: specsData,
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
          mainImage: normalizeExternalMediaUrl(formMainImage.trim()) || formMainImage.trim() || '/velero-vegvisir.jpg',
          gallery: validGallery,
          features: formFeatures,
          specs: specsData,
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
                    src={normalizeExternalMediaUrl(vessel.mainImage) || (vessel.id === 'terranova' ? '/yate-terranova.jpg' : '/velero-vegvisir.jpg')}
                    alt={vessel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback = vessel.id === 'terranova' ? '/yate-terranova.jpg' : '/velero-vegvisir.jpg';
                      if (img.src !== fallback && !img.src.endsWith(fallback)) {
                        img.src = fallback;
                      }
                    }}
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
                    {vessel.gallery && vessel.gallery.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-950/80 text-white backdrop-blur-md border border-sky-400/30 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-sky-300" />
                        <span>{vessel.gallery.length} fotos</span>
                      </span>
                    )}
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
              <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                {/* Primary Actions: Ver Ficha & Editar Ficha */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getVesselPath(vessel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border border-sky-200/60 shadow-2xs group/btn"
                    title="Ver ficha pública en el sitio"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600 transition-transform group-hover/btn:translate-x-0.5" />
                    <span>Ver Ficha</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => openEditModal(vessel)}
                    className="py-2 px-2.5 rounded-xl bg-[#0b192c] hover:bg-[#182a44] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5 text-sky-400" />
                    <span>Editar Ficha</span>
                  </button>
                </div>

                {/* Secondary / Admin Controls: Pausar / Activar + Eliminar */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(vessel)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
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
                      className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer border border-rose-200/70 flex items-center justify-center gap-1.5"
                      title="Eliminar embarcación"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR EMBARCACIÓN */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsModalOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left my-auto cursor-default max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <Sailboat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0b192c]">
                    {editingVessel ? `Editar: ${editingVessel.name}` : 'Crear Nueva Embarcación'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Configura las especificaciones técnicas y ficha pública del barco por pasos.
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

            {/* Stepper Tabs Bar */}
            <div className="bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 my-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                {WIZARD_STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0b192c] text-white shadow-xs'
                          : isCompleted
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                          : 'bg-transparent hover:bg-white/60 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          isActive
                            ? 'bg-sky-400 text-slate-950'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold leading-tight truncate">
                          {step.title}
                        </span>
                        <span className={`block text-[9px] truncate hidden sm:block ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {step.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSaveVessel} className="flex-1 flex flex-col min-h-0 text-xs">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                
                {/* ======================================================== */}
                {/* PASO 1: PORTADA & PRESENTACIÓN (HERO PÚBLICO) */}
                {/* ======================================================== */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#0b192c]">
                          Paso 1: Portada & Identidad General
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Esta información alimenta el encabezado principal (Hero) de la ficha pública de la embarcación.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200">
                        Hero Principal
                      </span>
                    </div>

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
                        <ManageableSelect
                          value={formType}
                          onChange={setFormType}
                          storageKey="yates_vessel_types"
                          placeholder="Seleccionar tipo..."
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                        Tagline / Lema Breve (Subtítulo del Hero)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: BENETEAU FIRST 53 F5 · Motor principal Yanmar diésel · 90 hp..."
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

                    {/* Photo Selector with Presets */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-700 block">
                        Fotografía Principal de Portada
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          placeholder="Ruta local (/velero-vegvisir.jpg), enlace Google Drive o URL externa"
                          value={formMainImage}
                          onChange={(e) => setFormMainImage(e.target.value)}
                          className="w-full bg-[#fbfcfd] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:border-[#0b192c] focus:outline-none"
                        />
                        {formMainImage && (
                          <img
                            src={normalizeExternalMediaUrl(formMainImage) || formMainImage}
                            alt="Preview"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.src !== '/velero-vegvisir.jpg' && !img.src.endsWith('/velero-vegvisir.jpg')) {
                                img.src = '/velero-vegvisir.jpg';
                              }
                            }}
                          />
                        )}
                      </div>

                      {/* Google Drive / External link optimization feedback */}
                      {formMainImage && (formMainImage.includes('drive.google.com') || formMainImage.includes('dropbox.com')) && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Enlace de {formMainImage.includes('drive.google.com') ? 'Google Drive' : 'Dropbox'} detectado y optimizado automáticamente</span>
                        </div>
                      )}
                      
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
                  </div>
                )}

                {/* ======================================================== */}
                {/* PASO 2: BRÚJULA NÁUTICA (FLIP CARDS CON FRENTE Y DORSO) */}
                {/* ======================================================== */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#0b192c]">
                          Paso 2: Brújula Náutica & Experiencia a Bordo
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Estas 4 tarjetas con volteo 3D se exhiben justo bajo la portada. Edita el frente y el reverso de cada una.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>Cards con Volteo</span>
                      </span>
                    </div>

                    {/* Grilla 2x2 de las 4 Cards de Brújula */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* CARD NORTE: ASTILLERO / IDENTIFICACIÓN */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">CARD 1 / NORTE</span>
                              <h5 className="font-serif font-bold text-slate-900 text-xs">Identificación Naval</h5>
                            </div>
                          </div>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, norte: 'front' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.norte === 'front' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Frente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, norte: 'back' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.norte === 'back' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Dorso ⮂
                            </button>
                          </div>
                        </div>

                        {compassSides.norte === 'front' ? (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Badge Superior</label>
                              <input
                                type="text"
                                value={formCompassNorte.badge || ''}
                                onChange={(e) => setFormCompassNorte(prev => ({ ...prev, badge: e.target.value }))}
                                placeholder="NORTE / ASTILLERO"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título Principal</label>
                              <input
                                type="text"
                                value={formCompassNorte.title || ''}
                                onChange={(e) => setFormCompassNorte(prev => ({ ...prev, title: e.target.value }))}
                                placeholder={formLength || '52.5 ft (16 m)'}
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Subtítulo Inferior</label>
                              <input
                                type="text"
                                value={formCompassNorte.sub || ''}
                                onChange={(e) => setFormCompassNorte(prev => ({ ...prev, sub: e.target.value }))}
                                placeholder="Astillero • Matrícula"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título del Reverso</label>
                              <input
                                type="text"
                                value={formCompassNorte.backTitle || ''}
                                onChange={(e) => setFormCompassNorte(prev => ({ ...prev, backTitle: e.target.value }))}
                                placeholder="Identificación"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Párrafo de Experiencia al Voltear</label>
                              <textarea
                                rows={3}
                                value={formCompassNorte.backDesc || ''}
                                onChange={(e) => setFormCompassNorte(prev => ({ ...prev, backDesc: e.target.value }))}
                                placeholder="Diseñado para navegar las aguas del Pacífico Sur, fiordos y canales australes con total serenidad y confort."
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-blue-900 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD OESTE: CAPACIDAD / HABITABILIDAD */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">CARD 2 / OESTE</span>
                              <h5 className="font-serif font-bold text-slate-900 text-xs">Alojamiento & Confort</h5>
                            </div>
                          </div>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, oeste: 'front' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.oeste === 'front' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Frente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, oeste: 'back' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.oeste === 'back' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Dorso ⮂
                            </button>
                          </div>
                        </div>

                        {compassSides.oeste === 'front' ? (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Badge Superior</label>
                              <input
                                type="text"
                                value={formCompassOeste.badge || ''}
                                onChange={(e) => setFormCompassOeste(prev => ({ ...prev, badge: e.target.value }))}
                                placeholder="OESTE / CAPACIDAD"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título Principal</label>
                              <input
                                type="text"
                                value={formCompassOeste.title || ''}
                                onChange={(e) => setFormCompassOeste(prev => ({ ...prev, title: e.target.value }))}
                                placeholder={`${formMaxPax} Pasajeros`}
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Subtítulo Inferior</label>
                              <input
                                type="text"
                                value={formCompassOeste.sub || ''}
                                onChange={(e) => setFormCompassOeste(prev => ({ ...prev, sub: e.target.value }))}
                                placeholder="4 Cabinas • 4 Baños"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título del Reverso</label>
                              <input
                                type="text"
                                value={formCompassOeste.backTitle || ''}
                                onChange={(e) => setFormCompassOeste(prev => ({ ...prev, backTitle: e.target.value }))}
                                placeholder="Habitabilidad"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Párrafo de Experiencia al Voltear</label>
                              <textarea
                                rows={3}
                                value={formCompassOeste.backDesc || ''}
                                onChange={(e) => setFormCompassOeste(prev => ({ ...prev, backDesc: e.target.value }))}
                                placeholder="Alojamiento distribuido en cabinas privadas con baños en suite, amplio salón central y cocina para navegación oceánica prolongada."
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-blue-900 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD SUR: TECNOLOGÍA & NAVEGACIÓN */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                              <Radio className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">CARD 3 / SUR</span>
                              <h5 className="font-serif font-bold text-slate-900 text-xs">Conectividad & Navegación</h5>
                            </div>
                          </div>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, sur: 'front' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.sur === 'front' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Frente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, sur: 'back' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.sur === 'back' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Dorso ⮂
                            </button>
                          </div>
                        </div>

                        {compassSides.sur === 'front' ? (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Badge Superior</label>
                              <input
                                type="text"
                                value={formCompassSur.badge || ''}
                                onChange={(e) => setFormCompassSur(prev => ({ ...prev, badge: e.target.value }))}
                                placeholder="SUR / TECNOLOGÍA"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título Principal</label>
                              <input
                                type="text"
                                value={formCompassSur.title || ''}
                                onChange={(e) => setFormCompassSur(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Starlink 24/7"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Subtítulo Inferior</label>
                              <input
                                type="text"
                                value={formCompassSur.sub || ''}
                                onChange={(e) => setFormCompassSur(prev => ({ ...prev, sub: e.target.value }))}
                                placeholder="Conexión Satelital & Navegación"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título del Reverso</label>
                              <input
                                type="text"
                                value={formCompassSur.backTitle || ''}
                                onChange={(e) => setFormCompassSur(prev => ({ ...prev, backTitle: e.target.value }))}
                                placeholder="Electrónica & Satelital"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Párrafo de Instrumental al Voltear</label>
                              <textarea
                                rows={3}
                                value={formCompassSur.backDesc || ''}
                                onChange={(e) => setFormCompassSur(prev => ({ ...prev, backDesc: e.target.value }))}
                                placeholder="Conexión satelital Starlink 24/7 de alta velocidad, plotter náutico, radar marino y piloto automático de precisión oceánica."
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-blue-900 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD ESTE: SERVICIO & AUTONOMÍA */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                              <Droplets className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">CARD 4 / ESTE</span>
                              <h5 className="font-serif font-bold text-slate-900 text-xs">Dotación & Desembarco</h5>
                            </div>
                          </div>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, este: 'front' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.este === 'front' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Frente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompassSides(prev => ({ ...prev, este: 'back' }))}
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${compassSides.este === 'back' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                              Dorso ⮂
                            </button>
                          </div>
                        </div>

                        {compassSides.este === 'front' ? (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Badge Superior</label>
                              <input
                                type="text"
                                value={formCompassEste.badge || ''}
                                onChange={(e) => setFormCompassEste(prev => ({ ...prev, badge: e.target.value }))}
                                placeholder="ESTE / SERVICIO"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título Principal</label>
                              <input
                                type="text"
                                value={formCompassEste.title || ''}
                                onChange={(e) => setFormCompassEste(prev => ({ ...prev, title: e.target.value }))}
                                placeholder={formCrew || 'Patrón + Tripulación'}
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-600 block">Subtítulo Inferior</label>
                              <input
                                type="text"
                                value={formCompassEste.sub || ''}
                                onChange={(e) => setFormCompassEste(prev => ({ ...prev, sub: e.target.value }))}
                                placeholder="Servicio & Seguridad de Bordo"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Título del Reverso</label>
                              <input
                                type="text"
                                value={formCompassEste.backTitle || ''}
                                onChange={(e) => setFormCompassEste(prev => ({ ...prev, backTitle: e.target.value }))}
                                placeholder="Autonomía & Desembarco"
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-700 block">Párrafo de Autonomía al Voltear</label>
                              <textarea
                                rows={3}
                                value={formCompassEste.backDesc || ''}
                                onChange={(e) => setFormCompassEste(prev => ({ ...prev, backDesc: e.target.value }))}
                                placeholder="Desalinizador de agua dulce 140 Ltrs/hr, bote auxiliar Zodiac semirrígido con motor fueraborda y climatización marina en cabinas."
                                className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-blue-900 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* PASO 3: ESPECIFICACIONES NAVALES & FICHA TÉCNICA OFICIAL */}
                {/* ======================================================== */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#0b192c]">
                          Paso 3: Ficha Técnica Oficial & Registro
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Configura las 4 tarjetas de especificaciones que se exhiben en la ficha técnica pública del barco.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                        4 Cards Públicas
                      </span>
                    </div>

                    {/* Grilla 2x2 de las 4 Cards idénticas al sitio público */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* CARD 1: EMBARCACIÓN & REGISTRO */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
                            <Anchor className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
                              FICHA 1 / IDENTIFICACIÓN
                            </span>
                            <h5 className="font-serif font-bold text-slate-900 text-sm leading-tight truncate">
                              Embarcación & Registro
                            </h5>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Identificación y dimensiones
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Astillero / Modelo
                            </label>
                            <input
                              type="text"
                              value={formBuilder}
                              onChange={(e) => setFormBuilder(e.target.value)}
                              placeholder="Ej: Beneteau (Francés)"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Eslora
                            </label>
                            <input
                              type="text"
                              value={formLength}
                              onChange={(e) => setFormLength(e.target.value)}
                              placeholder="Ej: 53 ft (16 m)"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Matrícula Oficial
                            </label>
                            <input
                              type="text"
                              value={formRegistration}
                              onChange={(e) => setFormRegistration(e.target.value)}
                              placeholder="Ej: AILG 2532"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Tipo de Barco
                            </label>
                            <ManageableSelect
                              value={formType}
                              onChange={setFormType}
                              storageKey="yates_vessel_types"
                              size="sm"
                              placeholder="Seleccionar tipo..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: HABITABILIDAD & CONFORT */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
                              FICHA 2 / ALOJAMIENTO
                            </span>
                            <h5 className="font-serif font-bold text-slate-900 text-sm leading-tight truncate">
                              Habitabilidad & Confort
                            </h5>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Alojamiento y distribución
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Capacidad Total (PAX)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={formMaxPax}
                              onChange={(e) => setFormMaxPax(Math.max(1, Number(e.target.value)))}
                              placeholder="8"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Cabinas
                            </label>
                            <input
                              type="text"
                              value={formCabins}
                              onChange={(e) => setFormCabins(e.target.value)}
                              placeholder="Ej: 4 Cabinas privadas"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Baños
                            </label>
                            <input
                              type="text"
                              value={formBathrooms}
                              onChange={(e) => setFormBathrooms(e.target.value)}
                              placeholder="Ej: 4 Baños completos"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Tripulación
                            </label>
                            <input
                              type="text"
                              value={formCrew}
                              onChange={(e) => setFormCrew(e.target.value)}
                              placeholder="Ej: Patrón de Ultramar + Tripulación"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: ELECTRÓNICA & SATELITAL */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
                              FICHA 3 / TECNOLOGÍA
                            </span>
                            <h5 className="font-serif font-bold text-slate-900 text-sm leading-tight truncate">
                              Electrónica & Satelital
                            </h5>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Instrumental de alta precisión
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Internet Satelital
                            </label>
                            <input
                              type="text"
                              value={formTechSatellite}
                              onChange={(e) => setFormTechSatellite(e.target.value)}
                              placeholder="Starlink 24/7"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Plotter Náutico
                            </label>
                            <input
                              type="text"
                              value={formTechPlotter}
                              onChange={(e) => setFormTechPlotter(e.target.value)}
                              placeholder="Raymarine / Garmin"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Piloto Automático
                            </label>
                            <input
                              type="text"
                              value={formTechAutopilot}
                              onChange={(e) => setFormTechAutopilot(e.target.value)}
                              placeholder="Raymarine Integrado"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Comunicaciones
                            </label>
                            <input
                              type="text"
                              value={formTechComms}
                              onChange={(e) => setFormTechComms(e.target.value)}
                              placeholder="VHF Marino + AIS"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARD 4: AUTONOMÍA & DESEMBARCO */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-900/40 transition-all p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
                            <Droplets className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
                              FICHA 4 / SERVICIO
                            </span>
                            <h5 className="font-serif font-bold text-slate-900 text-sm leading-tight truncate">
                              Autonomía & Desembarco
                            </h5>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Equipamiento expedicionario
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Desalinizador
                            </label>
                            <input
                              type="text"
                              value={formTechWatermaker}
                              onChange={(e) => setFormTechWatermaker(e.target.value)}
                              placeholder="140 ltrs/hr"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Bote Auxiliar
                            </label>
                            <input
                              type="text"
                              value={formTechTender}
                              onChange={(e) => setFormTechTender(e.target.value)}
                              placeholder="Zodiac Semirrígido"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Motor Auxiliar
                            </label>
                            <input
                              type="text"
                              value={formTechTenderEngine}
                              onChange={(e) => setFormTechTenderEngine(e.target.value)}
                              placeholder="Mercury 4T / 15 HP"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-600 block">
                              Climatización
                            </label>
                            <input
                              type="text"
                              value={formTechHeating}
                              onChange={(e) => setFormTechHeating(e.target.value)}
                              placeholder="Calefacción Marina"
                              className="w-full bg-[#fbfcfd] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* PASO 4: GALERÍA DE FOTOS (GOOGLE DRIVE) */}
                {/* ======================================================== */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#0b192c]">
                          Paso 4: Galería Fotográfica (Google Drive)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Estas fotos alimentan el carrusel de navegación y la sección "Espacios a Bordo".
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddGalleryItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b192c] hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition shadow-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Foto</span>
                      </button>
                    </div>

                    {formGallery.length === 0 ? (
                      <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-600 font-semibold">No hay fotos personalizadas añadidas a esta embarcación.</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Al hacer clic en "Agregar Foto" podrás pegar enlaces de Google Drive para personalizar el carrusel. Si no agregas fotos, se mostrarán las fotos estándar.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddGalleryItem}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar Primera Foto</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formGallery.map((item, idx) => {
                          const isDrive = item.url && (item.url.includes('drive.google.com') || item.url.includes('google.com'));
                          const previewUrl = normalizeExternalMediaUrl(item.url) || item.url;
                          return (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-2 relative"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                                  Foto #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryItem(idx)}
                                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                  title="Eliminar foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex gap-3 items-start">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                                  {item.url ? (
                                    <img
                                      src={previewUrl}
                                      alt={item.title || `Foto ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const img = e.currentTarget as HTMLImageElement;
                                        if (img.src !== '/velero-vegvisir.jpg' && !img.src.endsWith('/velero-vegvisir.jpg')) {
                                          img.src = '/velero-vegvisir.jpg';
                                        }
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                  )}
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 space-y-2 min-w-0">
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Pega el enlace de Google Drive (ej: https://drive.google.com/file/d/.../view)"
                                      value={item.url}
                                      onChange={(e) => handleUpdateGalleryItem(idx, 'url', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:border-[#0b192c] focus:outline-none"
                                    />
                                    {isDrive && (
                                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>Enlace de Google Drive optimizado automáticamente</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Título (ej: Cubierta Principal)"
                                      value={item.title || ''}
                                      onChange={(e) => handleUpdateGalleryItem(idx, 'title', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:border-[#0b192c] focus:outline-none"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Ubicación (ej: Bahía Cumberland)"
                                      value={item.location || ''}
                                      onChange={(e) => handleUpdateGalleryItem(idx, 'location', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:border-[#0b192c] focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* PASO 5: EQUIPAMIENTO & ESTADO DE PUBLICACIÓN */}
                {/* ======================================================== */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#0b192c]">
                          Paso 5: Equipamiento Incluido & Publicación
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Define los accesorios incluidos en la ficha y si el barco está activo en la flota.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        Publicación
                      </span>
                    </div>

                    {/* Features List Editor */}
                    <div className="space-y-2">
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
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs">Visibilidad y Estado en Flota</span>
                        <p className="text-[11px] text-slate-500">
                          {formIsActive
                            ? 'La embarcación está visible en el catálogo y disponible para travesías.'
                            : 'La embarcación está pausada y oculta de las opciones de reserva pública.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(prev => !prev)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                          formIsActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {formIsActive ? 'Activo en Flota' : 'Pausado'}
                      </button>
                    </div>

                    {/* Quick Summary Card */}
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                      <img
                        src={normalizeExternalMediaUrl(formMainImage) || formMainImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.src !== '/velero-vegvisir.jpg' && !img.src.endsWith('/velero-vegvisir.jpg')) {
                            img.src = '/velero-vegvisir.jpg';
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif font-bold text-slate-900 text-xs truncate">
                          {formName || 'Nombre no definido'}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formType} • {formLength} • {formMaxPax} PAX • {formGallery.length} fotos en galería
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Navigation Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0 mt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer transition text-xs"
                  >
                    Cancelar
                  </button>
                  {currentStep < 5 && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-[11px] text-slate-400 hover:text-slate-700 underline cursor-pointer hidden sm:inline"
                    >
                      Guardar directo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 1 && !formName.trim()) {
                          alert('Por favor ingresa el nombre de la embarcación antes de continuar.');
                          return;
                        }
                        setCurrentStep(prev => Math.min(5, prev + 1));
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b192c] hover:bg-slate-800 text-white font-bold cursor-pointer transition shadow-xs text-xs"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition shadow-md shadow-emerald-900/20 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Guardando...' : editingVessel ? 'Guardar Cambios' : 'Crear Embarcación'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {deleteConfirmVessel && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmVessel(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center cursor-default"
          >
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
