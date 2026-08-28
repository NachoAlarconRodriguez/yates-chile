import React from 'react';
import { FleetHotspotViewer } from '../components/modules/FleetHotspotViewer';
import { Anchor, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useSiteContent } from '../hooks/useSiteContent';

interface FlotaPageProps {
  onNavigate: (path: string) => void;
}

export const FlotaPage: React.FC<FlotaPageProps> = ({ onNavigate }) => {
  const { activeVessels } = useFleet();
  const { getSection } = useSiteContent();
  const flotaHero = getSection('flota_hero');
  const vegvisirSec = getSection('flota_vegvisir');
  const terranovaSec = getSection('flota_terranova');

  return (
    <div className="space-y-0 bg-white">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800">
        {flotaHero.media_url && (
          <>
            <img
              src={flotaHero.media_url}
              alt={flotaHero.title || "Flota"}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
          </>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Anchor className="w-4 h-4 text-blue-400" />
            <span>{flotaHero.subtitle || 'Navegación de Alta Mar'}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {flotaHero.title || 'La Flota: Vegvisir & Terranova'}
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            {flotaHero.body_text || 'Conoce en detalle las especificaciones técnicas y visores 3D de nuestras embarcaciones diseñadas para el Cabo de Hornos.'}
          </p>
        </div>
      </section>

      {/* Main Interactive Viewer */}
      <FleetHotspotViewer />

      {/* Deep Comparison Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Comparativa de Embarcaciones
            </h2>
            <p className="text-slate-600 text-base">
              Elige la embarcación ideal para el estilo de expedición que buscas vivir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {activeVessels.map((vessel) => (
              <div
                key={vessel.id}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-serif font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {vessel.type}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{vessel.length}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                    {vessel.id === 'vegvisir' && vegvisirSec.title ? vegvisirSec.title : vessel.id === 'terranova' && terranovaSec.title ? terranovaSec.title : vessel.name}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {vessel.id === 'vegvisir' && vegvisirSec.body_text ? vegvisirSec.body_text : vessel.id === 'terranova' && terranovaSec.body_text ? terranovaSec.body_text : vessel.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                    {vessel.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/contacto')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md min-h-[48px] text-sm cursor-pointer"
                >
                  <span>Reservar Charter Privado en {vessel.name}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
