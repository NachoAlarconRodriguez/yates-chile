import React, { useState } from 'react';
import { useFleet } from '../../hooks/useFleet';
import { Anchor, Compass, Info, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const FleetHotspotViewer: React.FC = () => {
  const { activeVessels } = useFleet();
  const [selectedVesselId, setSelectedVesselId] = useState<string>('vegvisir');
  const [activeHotspotId, setActiveHotspotId] = useState<string>('veg-2');

  const selectedVessel = activeVessels.find(v => v.id === selectedVesselId) || activeVessels[0] || {
    id: 'vegvisir',
    name: 'Velero Vegvisir',
    type: 'Velero de Expedición',
    tagline: 'Dufour 52.5 ft francés de expedición austral',
    description: 'El Vegvisir es un velero de expedición diseñado para navegar las aguas australes.',
    length: '52.5 Pies (16 metros)',
    capacity: 'Capacidad 12 pax',
    features: ['Astillero Francés', 'Starlink 24/7'],
    mainImage: '/velero-vegvisir.jpg',
    hotspots: []
  };
  const activeHotspot = (selectedVessel.hotspots && selectedVessel.hotspots.length > 0)
    ? selectedVessel.hotspots.find(h => h.id === activeHotspotId) || selectedVessel.hotspots[0]
    : {
        id: 'default',
        title: 'Cabinas & Equipamiento',
        description: selectedVessel.description || 'Embarcación equipada con los más altos estándares náuticos.',
        coordinates: { x: 0, y: 0.4, z: 0 },
        category: 'Camarote' as const,
        image: selectedVessel.mainImage
      };

  const handleVesselChange = (id: string) => {
    setSelectedVesselId(id);
    const newVessel = activeVessels.find(v => v.id === id);
    if (newVessel && newVessel.hotspots && newVessel.hotspots.length > 0) {
      setActiveHotspotId(newVessel.hotspots[0].id);
    }
  };

  return (
    <section id="flota-visualizer" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      
      {/* Background radial soft light */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-900/5 -top-40 -left-40 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Anchor className="w-3.5 h-3.5 text-blue-600" />
            <span>Recorrido Interactivo & Especificaciones</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Exploración de la Flota
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Interactúe con los puntos clave de nuestras embarcaciones diseñadas específicamente para el confort en mares australes.
          </p>
        </div>

        {/* Vessel Selector Buttons */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {activeVessels.map((v) => {
            const isSelected = selectedVessel.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => handleVesselChange(v.id)}
                className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border min-h-[44px] ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-800 shadow-lg scale-100'
                    : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Anchor className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{v.name}</span>
              </button>
            );
          })}
        </div>

        {/* Model and Specs Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left / Center simulated 3D model */}
          <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 sm:p-8 text-white relative min-h-[450px] flex flex-col justify-between overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Vessel Image with overlay */}
            <img
              src={selectedVessel.mainImage}
              alt={selectedVessel.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 text-[10px] font-mono text-blue-300 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                <span>Modelo Interactivo: {selectedVessel.name}</span>
              </div>
              <span className="bg-blue-900 text-white font-bold px-3 py-1 rounded-full text-xs">
                3 Puntos de Interés
              </span>
            </div>

            {/* Simulated 3D Hotspot Nodes */}
            <div className="relative z-10 my-12 grid sm:grid-cols-3 gap-4">
              {(selectedVessel.hotspots || []).map((hs) => {
                const isActive = activeHotspotId === hs.id;
                return (
                  <button
                    key={hs.id}
                    onClick={() => setActiveHotspotId(hs.id)}
                    className={`p-5 rounded-2xl transition-all duration-300 text-left backdrop-blur-md border cursor-pointer ${
                      isActive
                        ? 'bg-blue-900 text-white border-blue-800 shadow-xl scale-105'
                        : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:border-blue-400/50 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">
                        {hs.category}
                      </span>
                      <Info className="w-4 h-4 text-blue-350" />
                    </div>
                    <div className="font-serif font-bold text-sm leading-snug">
                      {hs.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hotspot details embedded inside simulated 3D display */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800/80 backdrop-blur-md p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-lg">
              <img
                src={activeHotspot.image}
                alt={activeHotspot.title}
                className="w-full sm:w-28 h-20 object-cover rounded-xl border border-slate-700 shadow-md shrink-0"
              />
              <div className="space-y-1.5 text-left w-full">
                <div className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                  Detalle de Zona
                </div>
                <h4 className="font-serif font-bold text-base text-white">
                  {activeHotspot.title}
                </h4>
                <p className="text-slate-350 text-xs leading-relaxed font-light">
                  {activeHotspot.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Specs & Information Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-900 font-serif font-bold text-xs uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {selectedVessel.type}
                  </span>
                  {selectedVessel.registration && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      Mat. {selectedVessel.registration}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                  {selectedVessel.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedVessel.length}
                  </span>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                    {selectedVessel.capacity}
                  </span>
                  {selectedVessel.cabins && (
                    <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedVessel.cabins} / {selectedVessel.bathrooms}
                    </span>
                  )}
                </div>
                <p className="text-slate-655 text-xs italic mt-2 font-light leading-relaxed">
                  "{selectedVessel.tagline}"
                </p>
              </div>

              {/* Tripulación Box */}
              <div className="flex items-center gap-3 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-xs">
                <Users className="w-4 h-4 text-blue-700 shrink-0" />
                <div className="text-slate-655 font-light">
                  <span className="font-bold text-slate-700">Tripulación sugerida:</span>{' '}
                  <span className="text-blue-900">{selectedVessel.crew}</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Características de Confort:
                </span>
                <div className="space-y-2">
                  {selectedVessel.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-650 shrink-0 mt-0.5" />
                      <span className="font-light leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#/contacto"
                className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-md min-h-[48px] cursor-pointer"
              >
                <span>Solicitar Reserva</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
