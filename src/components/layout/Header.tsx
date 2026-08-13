import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, PhoneCall, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath = '/', onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [isScrolled, setIsScrolled] = useState(false);
  const [fleetMenuOpen, setFleetMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFleetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'El Lodge', path: '/lodge' },
    { label: 'Expediciones', path: '/expediciones' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    setFleetMenuOpen(false);
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
              src="/vegvisir-emblem.svg"
              alt="Logo Vegvisir Emblem"
              className="w-9 h-9 text-slate-900 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-wider">
                YATES CHILE
              </span>
              <span className="text-[11px] text-slate-600 font-sans tracking-widest uppercase font-semibold">
                Vegvisir Sailing & Lodge
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
              Inicio
            </a>

            {/* La Flota Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setFleetMenuOpen(!fleetMenuOpen)}
                className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center gap-1 cursor-pointer focus:outline-none ${
                  currentPath === '/flota' || currentPath === '/velero-vegvisir' || currentPath === '/yate-terranova'
                    ? 'text-slate-950 border-slate-950 font-extrabold'
                    : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
                }`}
              >
                <span>La Flota</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-305 ${fleetMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Dropdown Menu */}
              {fleetMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl py-2 z-50 animate-[fadeIn_0.2s_ease-out]">
                  <a
                    href="#/velero-vegvisir"
                    onClick={(e) => { e.preventDefault(); handleNavClick('/velero-vegvisir'); }}
                    className={`block px-4 py-2.5 text-sm transition-colors font-medium ${
                      currentPath === '/velero-vegvisir' ? 'text-blue-900 bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    Velero Vegvisir
                  </a>
                  <a
                    href="#/yate-terranova"
                    onClick={(e) => { e.preventDefault(); handleNavClick('/yate-terranova'); }}
                    className={`block px-4 py-2.5 text-sm transition-colors font-medium ${
                      currentPath === '/yate-terranova' ? 'text-blue-900 bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    Yate Terranova
                  </a>
                  <div className="border-t border-slate-100 my-1"></div>
                  <a
                    href="#/flota"
                    onClick={(e) => { e.preventDefault(); handleNavClick('/flota'); }}
                    className={`block px-4 py-2.5 text-sm transition-colors font-medium ${
                      currentPath === '/flota' ? 'text-blue-900 bg-blue-50/50 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    Ver Toda la Flota (3D)
                  </a>
                </div>
              )}
            </div>

            {/* Other links */}
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={`#${link.path}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.path); }}
                  className={`text-sm font-semibold transition-colors py-2 border-b-2 min-h-[48px] flex items-center ${
                    isActive
                      ? 'text-slate-950 border-slate-950 font-extrabold'
                      : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-400'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher Only */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition min-h-[44px] min-w-[44px] shadow-sm"
              aria-label="Cambiar idioma"
            >
              <span className={lang === 'ES' ? 'text-slate-950 font-extrabold' : 'text-slate-400'}>ES</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className={lang === 'EN' ? 'text-slate-950 font-extrabold' : 'text-slate-400'}>EN</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
              className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {lang}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); handleNavClick('/'); }}
            className={`block px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center ${
              currentPath === '/'
                ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Inicio
          </a>

          {/* La Flota Mobile Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => setFleetMenuOpen(!fleetMenuOpen)}
              className={`w-full block px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center justify-between focus:outline-none ${
                currentPath === '/flota' || currentPath === '/velero-vegvisir' || currentPath === '/yate-terranova'
                  ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>La Flota</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${fleetMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {fleetMenuOpen && (
              <div className="pl-6 space-y-1 py-1">
                <a
                  href="#/velero-vegvisir"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNavClick('/velero-vegvisir'); }}
                  className={`block px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[40px] flex items-center ${
                    currentPath === '/velero-vegvisir' ? 'text-blue-900 font-bold bg-blue-50/20' : 'text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Velero Vegvisir
                </a>
                <a
                  href="#/yate-terranova"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNavClick('/yate-terranova'); }}
                  className={`block px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[40px] flex items-center ${
                    currentPath === '/yate-terranova' ? 'text-blue-900 font-bold bg-blue-50/20' : 'text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Yate Terranova
                </a>
                <a
                  href="#/flota"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNavClick('/flota'); }}
                  className={`block px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[40px] flex items-center text-slate-500 hover:bg-slate-50 ${
                    currentPath === '/flota' ? 'font-bold bg-blue-50/20' : ''
                  }`}
                >
                  Ver Toda la Flota (3D)
                </a>
              </div>
            )}
          </div>

          {/* Other links */}
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={`#${link.path}`}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.path); }}
                className={`block px-4 py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] flex items-center ${
                  isActive
                    ? 'bg-slate-100 text-slate-950 font-extrabold border border-slate-300'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            );
          })}

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
    </header>
  );
};
