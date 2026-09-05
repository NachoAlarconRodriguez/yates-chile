import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface LuxurySelectOption<T extends string = string> {
  value: T;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    className: string;
  };
  dotColor?: string;
}

export interface LuxurySelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: LuxurySelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  dropdownClassName?: string;
}

export function LuxurySelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  id,
  dropdownClassName = '',
}: LuxurySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-[#f4f7fb] hover:bg-slate-100/90 focus:bg-white border rounded-2xl flex items-center justify-between gap-2.5 transition shadow-2xs cursor-pointer select-none text-left ${
          isOpen
            ? 'border-[#0b192c] ring-2 ring-[#0b192c]/10 bg-white'
            : 'border-slate-200/90 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {SelectedIcon && (
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-3xs">
              <SelectedIcon className="w-3.5 h-3.5 text-sky-700" />
            </div>
          )}
          {selectedOption?.dotColor && !SelectedIcon && (
            <span className={`w-2.5 h-2.5 rounded-full ${selectedOption.dotColor} shrink-0 ring-2 ring-white shadow-xs`} />
          )}

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-[#0b192c] truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              {selectedOption?.badge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${selectedOption.badge.className}`}>
                  {selectedOption.badge.text}
                </span>
              )}
            </div>
            {selectedOption?.subtitle && (
              <span className="text-[10px] text-slate-400 font-normal truncate leading-tight">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
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
          className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 max-h-64 overflow-y-auto space-y-1 animate-fadeIn backdrop-blur-md ${dropdownClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const OptIcon = opt.icon;

            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-sky-50/90 text-[#0b192c] border border-sky-200/70 font-semibold'
                    : 'hover:bg-slate-50/90 text-slate-700 hover:text-[#0b192c]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {OptIcon && (
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white border-sky-300 text-sky-700 shadow-3xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-500'
                      }`}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {opt.dotColor && !OptIcon && (
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} shrink-0 ring-2 ring-white shadow-xs`} />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs ${isSelected ? 'font-bold text-[#0b192c]' : 'font-medium text-slate-800'}`}>
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${opt.badge.className}`}>
                          {opt.badge.text}
                        </span>
                      )}
                    </div>
                    {opt.subtitle && (
                      <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {opt.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
