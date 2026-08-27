import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRY_CODES, type CountryCodeItem } from '../../lib/countryCodes';

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  placeholder,
  className = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem>(
    () => COUNTRY_CODES.find((c) => c.iso === 'CL') || COUNTRY_CODES[0]
  );
  const [localNumber, setLocalNumber] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse incoming value to extract country code and local number
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }

    const trimmed = value.trim();
    // Find matching country code (longest match first)
    const matchingCountry = [...COUNTRY_CODES]
      .sort((a, b) => b.code.length - a.code.length)
      .find((c) => trimmed.startsWith(c.code));

    if (matchingCountry) {
      setSelectedCountry(matchingCountry);
      const rest = trimmed.slice(matchingCountry.code.length).trim();
      setLocalNumber(rest);
    } else {
      // If starts with digits without code, keep localNumber and default to CL
      setLocalNumber(trimmed.replace(/^\+/, ''));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format local phone number dynamically
  const formatLocalDigits = (raw: string, countryCode: string) => {
    const digits = raw.replace(/\D/g, '');
    if (countryCode === '+56') {
      // Chilean format: 9 XXXX XXXX
      if (digits.length <= 1) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
    }
    // General international 3-3-4 formatting
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10, 14)}`;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatLocalDigits(raw, selectedCountry.code);
    setLocalNumber(formatted);

    if (formatted.trim()) {
      onChange(`${selectedCountry.code} ${formatted}`);
    } else {
      onChange('');
    }
  };

  const handleSelectCountry = (country: CountryCodeItem) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    if (localNumber.trim()) {
      const formatted = formatLocalDigits(localNumber, country.code);
      setLocalNumber(formatted);
      onChange(`${country.code} ${formatted}`);
    }
  };

  // Filter countries by search query
  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  // Group filtered countries by region
  const groupedRegions = Array.from(new Set(filteredCountries.map((c) => c.region)));

  return (
    <div className={`relative flex items-center ${className}`} ref={dropdownRef}>
      {/* Selector de País con Bandera y Código */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-full min-h-[38px] bg-[#f4f7fb] hover:bg-slate-200/80 focus:bg-white border border-r-0 border-slate-200/90 rounded-l-xl px-2.5 sm:px-3 py-2 flex items-center gap-1.5 text-xs font-mono font-bold text-[#0b192c] transition shadow-2xs cursor-pointer select-none"
          title={`País: ${selectedCountry.name} (${selectedCountry.code})`}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-[11px] font-mono tracking-tight">{selectedCountry.code}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#0b192c]' : ''}`} />
        </button>

        {/* Dropdown de Países con Buscador y Agrupación por Región */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(11,25,44,0.25)] border border-slate-200/90 overflow-hidden animate-scaleIn">
            
            {/* Input de Búsqueda Rápida */}
            <div className="p-2.5 bg-slate-50/90 border-b border-slate-200/80 sticky top-0 z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar país o código (+34, España, Chile...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0b192c] placeholder:text-slate-400 focus:outline-none focus:border-[#0b192c]"
                />
              </div>
            </div>

            {/* Lista de Países con Scroll */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-2">
              {groupedRegions.length > 0 ? (
                groupedRegions.map((region) => (
                  <div key={region} className="space-y-0.5">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 bg-slate-50 rounded-lg">
                      {region}
                    </div>
                    {filteredCountries
                      .filter((c) => c.region === region)
                      .map((country) => {
                        const isSelected = selectedCountry.iso === country.iso;
                        return (
                          <button
                            key={country.iso + country.code}
                            type="button"
                            onClick={() => handleSelectCountry(country)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer text-left ${
                              isSelected
                                ? 'bg-[#0b192c] text-white font-bold'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-base">{country.flag}</span>
                              <span className="truncate">{country.name}</span>
                            </div>
                            <span
                              className={`font-mono text-[11px] shrink-0 ml-2 ${
                                isSelected ? 'text-sky-300' : 'text-slate-400 font-semibold'
                              }`}
                            >
                              {country.code}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron países que coincidan con "{searchQuery}"
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Input de Número Telefónico Local */}
      <input
        type="tel"
        required={required}
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder || selectedCountry.example}
        className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-r-xl px-3 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs"
      />
    </div>
  );
};
