import React from 'react';
import { Compass } from 'lucide-react';

interface MaintenanceScreenProps {
  onBypass?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onBypass }) => {

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Background Video of Sailing Vessel Vegvisir */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/expediciones-hero.webp"
          className="w-full h-full object-cover scale-105 filter brightness-[0.75] contrast-[1.05]"
        >
          <source src="/welcome-video.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Multi-layered Dark Overlay for High Contrast & Premium Feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/60 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950/90" />
      </div>

      {/* Top Bar with Brand Logo */}
      <header className="relative z-10 w-full px-6 py-8 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/vegvisir-emblem-white.png"
            alt="Yates Chile Emblem"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.22em] text-lg sm:text-xl font-bold uppercase text-white">
              Yates Chile
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-white/90 font-medium">
              Expediciones & Lodge
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-slate-900/50 backdrop-blur-md text-[11px] uppercase tracking-wider text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Modo Mantención
        </div>
      </header>

      {/* Center Hero Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8 text-center flex flex-col items-center justify-center my-auto">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 backdrop-blur-md text-xs sm:text-sm uppercase tracking-[0.25em] text-amber-300 font-semibold mb-6 shadow-lg shadow-amber-500/5 animate-fade-in">
          <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />
          <span>Plataforma en Mantención</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-tight leading-[1.15]">
          Estamos renovando nuestra <br className="hidden sm:inline" />
          <span className="font-normal italic text-white">experiencia de navegación</span>
        </h1>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400/80 border-t border-white/10 backdrop-blur-sm">
        <div>
          © {new Date().getFullYear()} Yates Chile SpA. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6 text-[11px] tracking-wider uppercase">
          <span>Velero Vegvisir • Yate Terranova • Velero Punta Sur • Lodge Austral</span>
          {onBypass && (
            <button
              onClick={onBypass}
              className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer text-[10px]"
              title="Acceso administrativo"
            >
              •
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default MaintenanceScreen;
