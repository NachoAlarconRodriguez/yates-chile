import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Trash2, Plus, AlertCircle, Ship } from 'lucide-react';

export interface ManageableSelectProps {
  value: string;
  onChange: (value: string) => void;
  storageKey?: string;
  defaultOptions?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const DEFAULT_VESSEL_TYPES = [
  'Velero de Expedición',
  'Yate de Expedición',
  'Yate a Motor',
  'Catamarán Oceánico',
  'Crucero Austral',
  'Goleta Clásica',
];

export function ManageableSelect({
  value,
  onChange,
  storageKey = 'yates_vessel_types',
  defaultOptions = DEFAULT_VESSEL_TYPES,
  placeholder = 'Seleccionar tipo...',
  disabled = false,
  className = '',
  id,
  showIcon = true,
  size = 'md',
}: ManageableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize options from localStorage or default
  const [options, setOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = [...parsed];
            if (value && !list.includes(value)) {
              list.push(value);
            }
            return list;
          }
        }
      } catch (err) {
        console.warn('Error reading manageable options from localStorage:', err);
      }
    }
    const list = [...defaultOptions];
    if (value && !list.includes(value)) {
      list.push(value);
    }
    return list;
  });

  // Sync value if passed from parent and not in options list
  useEffect(() => {
    if (value && !options.includes(value)) {
      setOptions((prev) => {
        if (!prev.includes(value)) {
          const updated = [...prev, value];
          if (storageKey) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch (err) {
              console.warn(err);
            }
          }
          return updated;
        }
        return prev;
      });
    }
  }, [value, options, storageKey]);

  // Click outside and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setWarningMsg(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setWarningMsg(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAddOption = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) return;

    const exists = options.some((opt) => opt.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const existing = options.find((opt) => opt.toLowerCase() === trimmed.toLowerCase()) || trimmed;
      onChange(existing);
      setNewOptionText('');
      setWarningMsg(`"${existing}" ya existe en la lista y ha sido seleccionado.`);
      setTimeout(() => setWarningMsg(null), 3000);
      return;
    }

    const updated = [...options, trimmed];
    setOptions(updated);
    onChange(trimmed);
    setNewOptionText('');
    setWarningMsg(null);

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleDeleteOption = (e: React.MouseEvent, optToDelete: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (options.length <= 1) {
      setWarningMsg('Debe existir al menos una opción en la lista.');
      setTimeout(() => setWarningMsg(null), 3000);
      return;
    }

    const updated = options.filter((opt) => opt !== optToDelete);
    setOptions(updated);

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
    }

    // If active option was deleted, select first remaining
    if (value === optToDelete) {
      onChange(updated[0] || '');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#fbfcfd] border rounded-xl px-3.5 ${
          size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-xs sm:text-sm'
        } text-slate-900 font-medium flex items-center justify-between gap-2 transition cursor-pointer select-none text-left shadow-2xs ${
          isOpen
            ? 'border-[#0b192c] ring-2 ring-[#0b192c]/10 bg-white'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {showIcon && (
            <div className="w-5 h-5 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Ship className="w-3 h-3 text-sky-700" />
            </div>
          )}
          <span className="truncate">{value || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0b192c]' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Options list */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 p-0.5">
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <div
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setWarningMsg(null);
                  }}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-sky-50/90 text-[#0b192c] font-semibold border border-sky-200/70'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-slate-400 shrink-0" />
                    )}
                    <span className="text-xs truncate">{opt}</span>
                  </div>

                  {/* Delete option button */}
                  <button
                    type="button"
                    title={`Eliminar "${opt}"`}
                    onClick={(e) => handleDeleteOption(e, opt)}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                    aria-label={`Eliminar opción ${opt}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Warning Message */}
          {warningMsg && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 text-[11px] rounded-xl border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="truncate">{warningMsg}</span>
            </div>
          )}

          {/* Add new option inline */}
          <div className="pt-2 mt-1 border-t border-slate-100 px-1">
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Nuevo tipo... ej: Catamarán Solar"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddOption();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0b192c] focus:outline-none transition"
              />
              <button
                type="button"
                disabled={!newOptionText.trim()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddOption();
                }}
                className="px-2.5 py-1.5 bg-[#0b192c] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
