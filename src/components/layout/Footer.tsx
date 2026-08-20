import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import { PatagoniaLiveCanvas } from '../modules/PatagoniaLiveCanvas';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  return (
    <footer className="bg-[#0B1528] text-white border-t border-white/5">
      {/* Subtle Patagonia Live Canvas Telemetry */}
      <PatagoniaLiveCanvas />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Row 1: Logo & Name | Pages | Contact Icons */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-b border-white/10 pb-6 gap-6">
          
          {/* Logo & Name (Left) */}
          <div className="flex items-center gap-3">
            <img
              src="/vegvisir-emblem-white.png"
              alt="Logo Vegvisir Emblem"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif text-lg font-bold tracking-wider text-white">
                YATES CHILE
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Sailing & Lodge
              </span>
            </div>
          </div>

          {/* Navigation Pages (Center) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-300 tracking-wide uppercase lg:translate-y-[7px]">
            <a href="#/" onClick={(e) => { e.preventDefault(); handleNavClick('/'); }} className="hover:text-blue-400 transition">
              Inicio
            </a>
            <a href="#/flota" onClick={(e) => { e.preventDefault(); handleNavClick('/flota'); }} className="hover:text-blue-400 transition">
              La Flota
            </a>
            <a href="#/lodge" onClick={(e) => { e.preventDefault(); handleNavClick('/lodge'); }} className="hover:text-blue-400 transition">
              El Lodge
            </a>
            <a href="#/expediciones" onClick={(e) => { e.preventDefault(); handleNavClick('/expediciones'); }} className="hover:text-blue-400 transition">
              Expediciones
            </a>
            <a href="#/admin" onClick={(e) => { e.preventDefault(); handleNavClick('/admin'); }} className="hover:text-blue-400 transition">
              Administrador
            </a>
          </div>

          {/* Social/Contact Icons & SERNATUR Accreditation (Right) */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* SERNATUR Official Registration Seal (Adelante de WhatsApp, en la misma línea) */}
            <div 
              className="shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#0B1528]"
              title="Prestador de Servicios Turísticos Registrado en SERNATUR • Ministerio de Economía, Fomento y Turismo • Gobierno de Chile"
            >
              <img
                src="/sernatur-logo.png"
                alt="SERNATUR — Prestador de Servicios Turísticos Registrado"
                className="h-11 sm:h-12 w-auto object-contain mix-blend-screen drop-shadow-md"
              />
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/56981312920"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#25D366] border border-white/10 hover:border-[#25D366]/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
              title="WhatsApp Concierge"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.278 5.286.002 11.793.002c3.148 0 6.112 1.229 8.342 3.46 2.23 2.23 3.456 5.196 3.456 8.349 0 6.518-5.28 11.794-11.785 11.794-1.996 0-3.957-.506-5.702-1.472L0 24zm6.49-4.22c1.688.995 3.328 1.547 5.244 1.547 5.28 0 9.584-4.298 9.584-9.584C21.32 6.46 17.02 2.16 11.74 2.16c-5.28 0-9.58 4.298-9.58 9.58 0 2.052.57 4.02 1.64 5.76l-.99 3.6 3.73-.972zm12.355-6.52c-.27-.135-1.602-.79-1.85-.88-.248-.09-.43-.135-.61.135-.18.27-.7.88-.857 1.06-.158.18-.315.2-.585.065-.27-.135-1.143-.42-2.176-1.34-.805-.718-1.348-1.608-1.507-1.878-.158-.27-.017-.417.118-.552.12-.12.27-.315.405-.47.135-.158.18-.27.27-.45.09-.18.045-.337-.02-.47-.068-.135-.61-1.47-.837-2.013-.22-.53-.442-.46-.61-.468-.16-.008-.344-.01-.527-.01-.18 0-.475.067-.723.337-.248.27-.948.924-.948 2.254 0 1.33.97 2.614 1.103 2.794.135.18 1.9 2.9 4.606 4.066.645.277 1.148.443 1.54.568.647.206 1.238.177 1.705.107.52-.078 1.602-.656 1.83-1.26.226-.605.226-1.125.158-1.235-.068-.11-.248-.18-.518-.315z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/vegvisir_sailing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E1306C] border border-white/10 hover:border-[#E1306C]/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:concierge@yateschile.com"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#1a73e8] border border-white/10 hover:border-[#1a73e8]/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
              title="Mail Concierge"
            >
              <Mail className="w-4.5 h-4.5" />
            </a>

            {/* Location (Uberlindo Andaur 222) */}
            <span
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#EA4335] border border-white/10 hover:border-[#EA4335]/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 cursor-help shadow-md relative group/tooltip"
              title="Uberlindo Andaur 222, Isla Robinson Crusoe"
            >
              <MapPin className="w-4.5 h-4.5" />
              {/* Tooltip */}
              <span className="absolute bottom-12 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-md text-[10px] text-slate-300 tracking-wide whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 select-none pointer-events-none shadow-xl z-30">
                Uberlindo Andaur 222, Isla Robinson Crusoe
              </span>
            </span>

          </div>

        </div>

        {/* Row 3: Copyright & Attribution */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-slate-400">
          <div>
            © 2026 YATES CHILE. Todos los derechos reservados.
          </div>
          
          {/* Orange Design Attribution */}
          <div className="flex items-center gap-2">
            <span>Desarrollado con cariño por</span>
            <a 
              href="https://www.orangedesign.cl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:text-amber-500 font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Orange Design</span>
              <img 
                src="/orange-design-logo.png" 
                alt="Orange Design Logo" 
                className="w-4 h-4 object-contain brightness-100 filter hover:brightness-110"
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
