import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface CalendarDateCardPickerProps {
  label: string;
  value: string; // ISO format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  subLabel?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_SHORT = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const WEEKDAY_NAMES_FULL = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

/**
 * Safe date parsing to avoid UTC timezone offset issues
 */
function parseSafeDate(dateStr: string) {
  if (!dateStr) {
    const now = new Date();
    return {
      isValid: false,
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      dayPadded: String(now.getDate()).padStart(2, '0'),
      monthName: MONTH_NAMES[now.getMonth()],
      monthShort: MONTH_NAMES_SHORT[now.getMonth()],
      weekday: WEEKDAY_NAMES_FULL[now.getDay()],
      iso: '',
    };
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      const localDate = new Date(y, m, d);
      return {
        isValid: true,
        year: y,
        month: m,
        day: d,
        dayPadded: String(d).padStart(2, '0'),
        monthName: MONTH_NAMES[m],
        monthShort: MONTH_NAMES_SHORT[m],
        weekday: WEEKDAY_NAMES_FULL[localDate.getDay()],
        iso: dateStr,
      };
    }
  }

  const now = new Date();
  return {
    isValid: false,
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    dayPadded: String(now.getDate()).padStart(2, '0'),
    monthName: MONTH_NAMES[now.getMonth()],
    monthShort: MONTH_NAMES_SHORT[now.getMonth()],
    weekday: WEEKDAY_NAMES_FULL[now.getDay()],
    iso: dateStr,
  };
}

export const CalendarDateCardPicker: React.FC<CalendarDateCardPickerProps> = ({
  label,
  value,
  onChange,
  subLabel = 'Fecha fijada',
  badgeColor = 'bg-[#0b192c]',
  icon: IconComponent = Calendar,
  minDate,
  maxDate,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse current external value
  const currentDateInfo = parseSafeDate(value);

  // Temporary selection state when modal is open
  const [tempIso, setTempIso] = useState<string>(value || '');
  const tempDateInfo = parseSafeDate(tempIso);

  // Calendar navigation state (month & year)
  const [viewYear, setViewYear] = useState<number>(currentDateInfo.year);
  const [viewMonth, setViewMonth] = useState<number>(currentDateInfo.month);

  // Synchronize when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const initialIso = value || '';
      setTempIso(initialIso);
      const parsed = parseSafeDate(initialIso);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [isModalOpen, value]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Year options for select
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear + 10; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const startDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

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

  const handleSelectDay = (dayNum: number) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setTempIso(iso);
  };

  const handleConfirm = () => {
    if (tempIso) {
      onChange(tempIso);
    }
    setIsModalOpen(false);
  };

  const handleQuickAddDays = (daysToAdd: number) => {
    const base = tempIso ? parseSafeDate(tempIso) : parseSafeDate(value);
    const d = new Date(base.year, base.month, base.day + daysToAdd);
    const newIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setTempIso(newIso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleSetToday = () => {
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setTempIso(todayIso);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Field Label */}
      <label className="block text-[11px] font-bold text-[#0b192c] uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-sky-600 font-normal font-sans tracking-normal group-hover:text-sky-800">
          Clic para cambiar
        </span>
      </label>

      {/* Interactive Calendar Card (Trigger) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full h-[76px] bg-[#f4f7fb] hover:bg-white border border-slate-200/90 hover:border-[#0b192c] rounded-2xl px-3.5 py-2.5 flex items-center gap-3.5 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left group relative select-none"
      >
        {/* Tear-off Calendar Block with Large Day & Month */}
        <div className="w-13 sm:w-14 h-[58px] rounded-xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs shrink-0 flex flex-col text-center transition-transform group-hover:scale-105">
          {/* Month Header Banner */}
          <div className={`${badgeColor} text-white font-mono font-bold text-[9px] uppercase tracking-wider py-0.5 leading-none transition-colors`}>
            {currentDateInfo.monthShort}
          </div>

          {/* Large Day Number */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50/80 px-1 py-0.5">
            <span className="text-2xl font-serif font-black text-[#0b192c] leading-none tracking-tight">
              {currentDateInfo.dayPadded}
            </span>
            <span className="text-[8px] font-mono text-slate-400 leading-none mt-0.5 font-semibold">
              {currentDateInfo.year}
            </span>
          </div>
        </div>

        {/* Date Descriptive Details */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1 leading-tight">
            <IconComponent className="w-3 h-3 shrink-0" />
            <span className="truncate">{subLabel}</span>
          </div>
          <div className="font-bold text-[#0b192c] text-xs sm:text-sm truncate mt-0.5 leading-tight">
            {currentDateInfo.weekday}, {currentDateInfo.day} de {currentDateInfo.monthName}
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-[#0b192c] font-medium flex items-center gap-1 mt-0.5 transition-colors">
            <span>Cambiar en calendario</span>
            <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </button>

      {/* ========================================================================= */}
      {/* MODAL DE SELECCIÓN DE FECHA (CALENDARIO COMPLETO INTERACTIVO) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-70 bg-[#0b192c]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleIn select-none"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 flex items-center justify-center shrink-0 shadow-3xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#0b192c] leading-tight">
                    {label}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Selecciona el día en el calendario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selected Date Large Highlight Banner */}
            <div className="bg-gradient-to-r from-sky-50/90 via-white to-slate-50 border border-sky-200/70 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-sky-700 block">
                  Fecha Seleccionada
                </span>
                <span className="text-sm sm:text-base font-serif font-bold text-[#0b192c] block truncate mt-0.5">
                  {tempDateInfo.dayPadded} de {tempDateInfo.monthName}, {tempDateInfo.year}
                </span>
                <span className="text-[11px] text-slate-500 font-sans font-medium">
                  {tempDateInfo.weekday}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] font-mono font-bold uppercase text-sky-700 leading-none">
                  {tempDateInfo.monthShort}
                </span>
                <span className="text-lg font-serif font-black text-[#0b192c] leading-tight mt-0.5">
                  {tempDateInfo.dayPadded}
                </span>
              </div>
            </div>

            {/* Month & Year Selectors with Navigation */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <div className="flex items-center gap-1.5 flex-1">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-100 hover:bg-slate-200/80 text-[#0b192c] font-serif font-bold text-xs rounded-xl px-2.5 py-1.5 border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#0b192c] cursor-pointer transition flex-1"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  className="bg-slate-100 hover:bg-slate-200/80 text-[#0b192c] font-mono font-bold text-xs rounded-xl px-2 py-1.5 border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#0b192c] cursor-pointer transition"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Chevrons */}
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

            {/* Weekday Names Row */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_NAMES.map((d) => (
                <span key={d} className="text-[10px] font-mono font-bold uppercase text-slate-400 py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Previous month padding cells */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div
                  key={`prev-${i}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 mx-auto flex items-center justify-center text-[10px] font-mono text-slate-300 pointer-events-none select-none"
                >
                  {prevMonthDays - startDayOfWeek + i + 1}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isoCandidate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const isSelected = tempIso === isoCandidate;
                const today = new Date();
                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() === viewMonth &&
                  today.getDate() === dayNum;

                const isBeforeMin = minDate ? isoCandidate < minDate : false;
                const isAfterMax = maxDate ? isoCandidate > maxDate : false;
                const isDisabled = isBeforeMin || isAfterMax;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSelectDay(dayNum)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-mono transition-all select-none ${
                      isDisabled
                        ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed pointer-events-none'
                        : isSelected
                        ? 'bg-[#0b192c] text-white shadow-md font-bold scale-105 ring-2 ring-sky-300 cursor-pointer'
                        : isToday
                        ? 'bg-sky-50 text-sky-900 border-2 border-sky-400 font-bold hover:bg-sky-100 cursor-pointer shadow-3xs'
                        : 'text-[#0b192c] font-semibold hover:bg-sky-50 hover:text-sky-900 cursor-pointer'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}

              {/* Next month padding cells */}
              {(() => {
                const totalCells = startDayOfWeek + daysInMonth;
                const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                return Array.from({ length: remaining }).map((_, i) => (
                  <div
                    key={`next-${i}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 mx-auto flex items-center justify-center text-[10px] font-mono text-slate-300 pointer-events-none select-none"
                  >
                    {i + 1}
                  </div>
                ));
              })()}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px] font-mono">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer whitespace-nowrap"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(7)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer whitespace-nowrap"
              >
                +7 días
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(14)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer whitespace-nowrap"
              >
                +14 días
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(30)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer whitespace-nowrap"
              >
                +1 mes
              </button>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0b192c] hover:bg-sky-950 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirmar Fecha</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
