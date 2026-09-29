import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, PhoneCall, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PoliciesModal } from '../modules/PoliciesModal';
import { useFleet } from '../../hooks/useFleet';
import { getVesselPath } from '../../services/fleetService';

interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath = '/', onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [policiesModalOpen, setPoliciesModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { activeVessels } = useFleet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopFleetOpen, setDesktopFleetOpen] = useState(false);
  const [mobileFleetOpen, setMobileFleetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-expand mobile fleet accordion when opening mobile menu if currently on a fleet route
  useEffect(() => {
    if (mobileMenuOpen && (currentPath.startsWith('/flota') || currentPath === '/velero-vegvisir' || currentPath === '/yate-terranova')) {
      setMobileFleetOpen(true);
    }
  }, [mobileMenuOpen, currentPath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDesktopFleetOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopFleetOpen(false);
        setMobileMenuOpen(false);
        setMobileFleetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    setDesktopFleetOpen(false);
    setMobileFleetOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md py-0'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo (Redirects to /welcome video page) */}
          <a
            href="#/welcome"
            onClick={(e) => { e.preventDefault(); handleNavClick('/welcome'); }}
            className="flex items-center gap-3 group min-h-[48px] py-1 cursor-pointer"
            title="Ver experiencia cinemática en video"
          >
            <img
              src="/vegvisir-emblem-dark.png"
              alt="Logo Vegvisir Emblem"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-wider">
                YATES CHILE
              </span>
              <span className="text-[11px] text-slate-600 font-sans tracking-widest uppercase font-semibold">
                Sailing & Lodge
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Inicio */}
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); handleNavClick('/'); }}
              className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center ${
                currentPath === '/'
                  ? 'text-slate-950 border-slate-950 font-extrabold'
                  : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
              }`}
            >
              {t('Inicio', 'Home')}
            </a>

            {/* Expediciones */}
            <a
              href="#/expediciones"
              onClick={(e) => { e.preventDefault(); handleNavClick('/expediciones'); }}
              className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center ${
                currentPath === '/expediciones'
                  ? 'text-slate-950 border-slate-950 font-extrabold'
                  : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
              }`}
            >
              {t('Expediciones', 'Expeditions')}
            </a>

            {/* La Flota Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDesktopFleetOpen(!desktopFleetOpen)}
                className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center gap-1 cursor-pointer focus:outline-none ${
                  currentPath.startsWith('/flota') || currentPath === '/velero-vegvisir' || currentPath === '/yate-terranova'
                    ? 'text-slate-950 border-slate-950 font-extrabold'
                    : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
                }`}
              >
                <span>{t('La Flota', 'The Fleet')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-305 ${desktopFleetOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Dropdown Menu */}
              {desktopFleetOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200 shadow-xl py-2 z-50 animate-[fadeIn_0.2s_ease-out]">
                  {activeVessels.map((v) => {
                    const vPath = getVesselPath(v);
                    const isActive = currentPath === vPath;
                    return (
                      <a
                        key={v.id}
                        href={`#${vPath}`}
                        onClick={(e) => { e.preventDefault(); handleNavClick(vPath); }}
                        className={`block px-4 py-2.5 text-sm transition-colors font-medium ${
                          isActive ? 'text-blue-900 bg-blue-50/70 font-bold' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        {v.name}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* El Lodge */}
            <a
              href="#/lodge"
              onClick={(e) => { e.preventDefault(); handleNavClick('/lodge'); }}
              className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center ${
                currentPath === '/lodge'
                  ? 'text-slate-950 border-slate-950 font-extrabold'
                  : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
              }`}
            >
              {t('El Lodge', 'The Lodge')}
            </a>

            {/* Políticas */}
            <button
              type="button"
              onClick={() => setPoliciesModalOpen(true)}
              className="text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400 cursor-pointer"
            >
              {t('Políticas', 'Policies')}
            </button>
          </nav>

          {/* Right Actions: Language Switcher Only */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition min-h-[44px] min-w-[44px] shadow-sm cursor-pointer"
              aria-label="Cambiar idioma"
            >
              <span className={language === 'ES' ? 'text-slate-950 font-extrabold' : 'text-slate-400'}>ES</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className={language === 'EN' ? 'text-slate-950 font-extrabold' : 'text-slate-400'}>EN</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
              className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              {language}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 shadow-2xl backdrop-blur-xl">
          {/* Inicio */}
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center cursor-pointer ${
              currentPath === '/'
                ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            {t('Inicio', 'Home')}
          </button>

          {/* Expediciones */}
          <button
            type="button"
            onClick={() => handleNavClick('/expediciones')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center cursor-pointer ${
              currentPath === '/expediciones'
                ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            {t('Expediciones', 'Expeditions')}
          </button>

          {/* La Flota Mobile Accordion */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMobileFleetOpen(!mobileFleetOpen)}
              className={`w-full block px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center justify-between focus:outline-none cursor-pointer ${
                currentPath.startsWith('/flota') || currentPath === '/velero-vegvisir' || currentPath === '/yate-terranova'
                  ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                  : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <span>{t('La Flota', 'The Fleet')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileFleetOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {mobileFleetOpen && (
              <div className="pl-4 space-y-1 py-1">
                {activeVessels.map((v) => {
                  const vPath = getVesselPath(v);
                  const isActive = currentPath === vPath;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleNavClick(vPath)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all min-h-[44px] flex items-center justify-between cursor-pointer active:scale-98 ${
                        isActive
                          ? 'text-blue-900 font-bold bg-blue-50/80 border border-blue-200/50 shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200'
                      }`}
                    >
                      <span className="font-medium">{v.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* El Lodge */}
          <button
            type="button"
            onClick={() => handleNavClick('/lodge')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center cursor-pointer ${
              currentPath === '/lodge'
                ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            {t('El Lodge', 'The Lodge')}
          </button>

          {/* Políticas */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setPoliciesModalOpen(true);
            }}
            className="w-full text-left px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            {t('Políticas', 'Policies')}
          </button>

          <div className="pt-4 border-t border-slate-200">
            <a
              href="https://wa.me/56981312920"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 text-white font-bold px-4 py-3.5 rounded-xl text-center min-h-[48px] shadow-md"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Atención Concierge por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Global Policies Modal */}
      <PoliciesModal
        isOpen={policiesModalOpen}
        onClose={() => setPoliciesModalOpen(false)}
      />
    </header>
  );
};
