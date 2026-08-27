import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface LuxuryDatePickerProps {
  value: string; // ISO format 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const LuxuryDatePicker: React.FC<LuxuryDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date from value or fallback to reference date (e.g. 1990 for birthdates)
  const parseDate = (dStr: string) => {
    if (!dStr) return null;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  };

  const currentDateObj = parseDate(value);

  // View state for calendar (month and year)
  const [viewYear, setViewYear] = useState<number>(() => {
    return currentDateObj ? currentDateObj.getFullYear() : 1990;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return currentDateObj ? currentDateObj.getMonth() : 6;
  });

  // Display text in input (dd/mm/aaaa)
  const formatDisplay = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return '';
  };

  const [typedText, setTypedText] = useState(formatDisplay(value));

  // Sync typedText when value changes from outside
  useEffect(() => {
    setTypedText(formatDisplay(value));
    if (value) {
      const parsed = parseDate(value);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle direct text typing with auto-mask dd/mm/aaaa
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length >= 3) formatted += '/' + digits.slice(2, 4);
    if (digits.length >= 5) formatted += '/' + digits.slice(4, 8);

    setTypedText(formatted);

    // If fully entered (dd/mm/aaaa), validate and trigger onChange
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1920 && year <= 2030) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(iso);
        setViewYear(year);
        setViewMonth(month - 1);
      }
    } else if (digits.length === 0) {
      onChange('');
    }
  };

  // Generate Year options (descending from max year)
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear; y >= 1920; y--) {
    yearOptions.push(y);
  }

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of week for current month (0: Sunday -> convert to 0: Monday)
  const getFirstDayOfWeek = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return (firstDay + 6) % 7;
  };

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const startOffset = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(iso);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setTypedText('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(iso);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input de visualización y tipeo directo */}
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          value={typedText}
          onChange={handleTextChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#f4f7fb] hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#0b192c] font-mono focus:border-[#0b192c] focus:outline-none transition shadow-2xs cursor-text"
        />

        {/* Botón icono calendario */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-[#0b192c] hover:bg-slate-200/60 transition cursor-pointer"
          title="Abrir calendario"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* POPUP CALENDARIO LUXURY YATES CHILE */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(11,25,44,0.25)] border border-slate-200 animate-scaleIn select-none">
          
          {/* Header del Calendario con Selectores de Mes y Año */}
          <div className="flex items-center justify-between gap-1.5 pb-3.5 border-b border-slate-100">
            {/* Selector de Mes y Año */}
            <div className="flex-1 flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-100 hover:bg-slate-200/80 text-[#0b192c] font-serif font-bold text-xs rounded-xl px-2.5 py-1.5 border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#0b192c] cursor-pointer transition"
              >
                {MONTH_NAMES.map((name, mIdx) => (
                  <option key={name} value={mIdx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-100 hover:bg-slate-200/80 text-[#0b192c] font-mono font-bold text-xs rounded-xl px-2 py-1.5 border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#0b192c] cursor-pointer transition"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Flechas de Navegación de Mes */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Días de la Semana */}
          <div className="grid grid-cols-7 gap-1 text-center mt-3 mb-1">
            {DAY_NAMES.map((dayName) => (
              <span
                key={dayName}
                className="text-[10px] font-mono font-bold uppercase text-slate-400 py-1"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Rejilla de Días del Mes */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Días del mes anterior (padding) */}
            {Array.from({ length: startOffset }).map((_, i) => {
              const dayNum = prevMonthDays - startOffset + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 mx-auto flex items-center justify-center text-[11px] font-mono text-slate-300 pointer-events-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Días del mes actual */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                currentDateObj &&
                currentDateObj.getFullYear() === viewYear &&
                currentDateObj.getMonth() === viewMonth &&
                currentDateObj.getDate() === dayNum;

              const today = new Date();
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === dayNum;

              return (
                <button
                  key={`current-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b192c] text-white shadow-md font-bold scale-105 ring-2 ring-sky-200'
                      : isToday
                      ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold hover:bg-sky-100'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#0b192c]'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer de Acciones Rápidas (Hoy / Borrar) */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs font-medium">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer text-[11px]"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sky-700 font-bold hover:text-[#0b192c] px-2.5 py-1 rounded-lg hover:bg-sky-50 transition cursor-pointer text-[11px]"
            >
              Hoy
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
