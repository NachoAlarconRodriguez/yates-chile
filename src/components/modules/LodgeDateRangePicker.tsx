import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Moon } from 'lucide-react';

interface LodgeDateRangePickerProps {
  checkIn: string; // ISO 'YYYY-MM-DD'
  checkOut: string; // ISO 'YYYY-MM-DD'
  onCheckInChange: (dateIso: string) => void;
  onCheckOutChange: (dateIso: string) => void;
  minDate?: string; // default today
  isDateDisabled?: (dateIso: string) => boolean;
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

// Helper to format ISO 'YYYY-MM-DD' safely without timezone offset
const parseIsoToParts = (iso: string) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
};

const formatToIso = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const formatDisplayDate = (iso: string) => {
  const parts = parseIsoToParts(iso);
  if (!parts) return '';
  const dateObj = new Date(parts.year, parts.month, parts.day);
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayName = dayNamesShort[dateObj.getDay()];
  const monthName = monthNamesShort[parts.month];
  return `${dayName}, ${parts.day} ${monthName} ${parts.year}`;
};

export const LodgeDateRangePicker: React.FC<LodgeDateRangePickerProps> = ({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  isDateDisabled,
  className = '',
}) => {
  const today = new Date();
  const todayIso = formatToIso(today.getFullYear(), today.getMonth(), today.getDate());
  const effectiveMin = minDate || todayIso;

  // Active target being selected: 'checkIn' | 'checkOut' | null
  const [activePicker, setActivePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = today.getFullYear();

  // Initial calendar view based on checkIn, checkOut, or current month
  const rawParts = parseIsoToParts(checkIn) || parseIsoToParts(checkOut);
  const initialDateParts = (rawParts && rawParts.year >= currentYear)
    ? rawParts
    : {
        year: currentYear,
        month: today.getMonth(),
        day: today.getDate(),
      };

  const [viewYear, setViewYear] = useState<number>(initialDateParts.year);
  const [viewMonth, setViewMonth] = useState<number>(initialDateParts.month);

  // Sync view when opening picker
  const openPicker = (target: 'checkIn' | 'checkOut') => {
    setActivePicker(target);
    const targetIso = target === 'checkIn' ? checkIn : checkOut;
    const parts = parseIsoToParts(targetIso) || parseIsoToParts(checkIn);
    const safeParts = (parts && parts.year >= currentYear) ? parts : {
      year: currentYear,
      month: today.getMonth(),
      day: today.getDate(),
    };
    setViewYear(safeParts.year);
    setViewMonth(safeParts.month);
  };

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePicker(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePicker(null);
      }
    };

    if (activePicker) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePicker]);

  // Prevent navigating prior to the current month/year
  const isPrevMonthDisabled =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  // Month navigation
  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
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

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Monday = 0, Sunday = 6
  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const startOffset = getFirstDayOfWeek(viewYear, viewMonth);

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const pIn = parseIsoToParts(checkIn);
    const pOut = parseIsoToParts(checkOut);
    if (!pIn || !pOut) return 0;
    const dIn = new Date(pIn.year, pIn.month, pIn.day);
    const dOut = new Date(pOut.year, pOut.month, pOut.day);
    const diff = Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nightsCount = calculateNights();

  // Day selection logic
  const handleSelectDay = (day: number) => {
    const selectedIso = formatToIso(viewYear, viewMonth, day);

    // Disable if earlier than minimum allowed or disabled by prop
    if (selectedIso < effectiveMin || (isDateDisabled && isDateDisabled(selectedIso))) return;

    if (activePicker === 'checkIn') {
      onCheckInChange(selectedIso);
      // If checkOut already existed and is <= new checkIn, clear checkOut so user can pick their end date
      if (checkOut && checkOut <= selectedIso) {
        onCheckOutChange('');
      }
      // Smoothly switch focus to picking checkOut
      setActivePicker('checkOut');
    } else if (activePicker === 'checkOut') {
      if (!checkIn) {
        // If checkIn was not set, set this as checkIn and await checkOut
        onCheckInChange(selectedIso);
        setActivePicker('checkOut');
      } else if (selectedIso <= checkIn) {
        // User clicked a date on or before checkIn: update checkIn to this date and clear checkOut
        onCheckInChange(selectedIso);
        onCheckOutChange('');
        setActivePicker('checkOut');
      } else {
        // Valid checkOut date after checkIn!
        onCheckOutChange(selectedIso);
        setActivePicker(null); // Complete selection!
      }
    }
  };

  // Quick preset shortcuts
  const handleSelectToday = () => {
    onCheckInChange(todayIso);
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowIso = formatToIso(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    onCheckOutChange(tomorrowIso);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setActivePicker(null);
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckInChange('');
    onCheckOutChange('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* 2-Column Trigger Buttons for Check-in and Check-out */}
      <div className="grid grid-cols-2 gap-3">
        {/* CHECK-IN CARD */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Check-in
          </label>
          <button
            type="button"
            onClick={() => {
              if (activePicker === 'checkIn') {
                setActivePicker(null);
              } else {
                openPicker('checkIn');
              }
            }}
            className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-left border transition flex items-center justify-between group cursor-pointer ${
              activePicker === 'checkIn'
                ? 'bg-white border-[#0B192C] ring-2 ring-[#0B192C]/10 text-[#0B192C] shadow-sm'
                : checkIn
                ? 'bg-[#F8FAFC] border-slate-200/90 hover:border-[#0B192C]/50 text-slate-800'
                : 'bg-[#F8FAFC] border-slate-200/90 hover:border-slate-300 text-slate-400'
            }`}
          >
            <div className="flex flex-col truncate pr-2">
              {checkIn ? (
                <>
                  <span className="text-xs font-semibold text-[#0B192C] truncate">
                    {formatDisplayDate(checkIn)}
                  </span>
                  <span className="text-[9px] text-[#0B192C]/80 font-mono font-medium tracking-wider">
                    Fecha de Entrada
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-400 font-medium">dd/mm/aaaa</span>
                  <span className="text-[9px] text-slate-400 tracking-wider">Seleccionar llegada</span>
                </>
              )}
            </div>
            <div className={`p-1.5 rounded-lg transition shrink-0 ${
              activePicker === 'checkIn' || checkIn
                ? 'bg-[#0B192C]/5 text-[#0B192C]'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <CalendarIcon className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* CHECK-OUT CARD */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Check-out
          </label>
          <button
            type="button"
            onClick={() => {
              if (activePicker === 'checkOut') {
                setActivePicker(null);
              } else {
                openPicker('checkOut');
              }
            }}
            className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-left border transition flex items-center justify-between group cursor-pointer ${
              activePicker === 'checkOut'
                ? 'bg-white border-[#0B192C] ring-2 ring-[#0B192C]/10 text-[#0B192C] shadow-sm'
                : checkOut
                ? 'bg-[#F8FAFC] border-slate-200/90 hover:border-[#0B192C]/50 text-slate-800'
                : 'bg-[#F8FAFC] border-slate-200/90 hover:border-slate-300 text-slate-400'
            }`}
          >
            <div className="flex flex-col truncate pr-2">
              {checkOut ? (
                <>
                  <span className="text-xs font-semibold text-[#0B192C] truncate">
                    {formatDisplayDate(checkOut)}
                  </span>
                  <span className="text-[9px] text-[#0B192C]/80 font-mono font-medium tracking-wider">
                    Fecha de Salida
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-400 font-medium">dd/mm/aaaa</span>
                  <span className="text-[9px] text-slate-400 tracking-wider">Seleccionar salida</span>
                </>
              )}
            </div>
            <div className={`p-1.5 rounded-lg transition shrink-0 ${
              activePicker === 'checkOut' || checkOut
                ? 'bg-[#0B192C]/5 text-[#0B192C]'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <CalendarIcon className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* NIGHTS SUMMARY BADGE */}
      {checkIn && checkOut && nightsCount > 0 && (
        <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0B192C]/5 border border-[#0B192C]/15 text-[11px] text-[#0B192C]">
          <div className="flex items-center gap-1.5 font-medium">
            <Moon className="w-3.5 h-3.5 text-[#0B192C]" />
            <span>
              Estadía confirmada de <strong className="text-[#0B192C] font-bold">{nightsCount} {nightsCount === 1 ? 'noche' : 'noches'}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearDates}
            className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>
      )}

      {/* DROPDOWN CALENDAR POPOVER */}
      {activePicker && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_-15px_rgba(11,25,44,0.22)] animate-fadeIn select-none ring-1 ring-slate-200 text-slate-800">
          
          {/* HEADER: Target Mode Switcher Tabs */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActivePicker('checkIn')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activePicker === 'checkIn'
                    ? 'bg-[#0B192C] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                <span>1. Entrada</span>
                {checkIn && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <button
                type="button"
                onClick={() => setActivePicker('checkOut')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activePicker === 'checkOut'
                    ? 'bg-[#0B192C] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                <span>2. Salida</span>
                {checkOut && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActivePicker(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B192C] hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar calendario"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MONTH & YEAR NAVIGATION BAR */}
          <div className="flex items-center justify-between pt-3 pb-3">
            <button
              type="button"
              disabled={isPrevMonthDisabled}
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg transition ${
                isPrevMonthDisabled
                  ? 'text-slate-300 opacity-40 cursor-not-allowed'
                  : 'text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 cursor-pointer'
              }`}
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="font-serif text-sm sm:text-base font-bold text-[#0B192C] tracking-wide">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <span className="block text-[10px] text-[#0B192C]/80 font-mono font-medium">
                {activePicker === 'checkIn' ? 'Selecciona fecha de entrada' : 'Selecciona fecha de salida'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 transition cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* DAY NAMES HEADER (Lu, Ma, Mi...) */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {DAY_NAMES.map((name) => (
              <span key={name} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
                {name}
              </span>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty offset padding for days before the 1st */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-full" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateIso = formatToIso(viewYear, viewMonth, day);
              const isPast = dateIso < effectiveMin;
              const isFullyBooked = Boolean(isDateDisabled && isDateDisabled(dateIso));
              const isClickDisabled = isPast || isFullyBooked;
              const isCheckInDay = dateIso === checkIn;
              const isCheckOutDay = dateIso === checkOut;
              const isToday = dateIso === todayIso;

              // Check if date is in selected range
              const isInRange = Boolean(
                checkIn &&
                checkOut &&
                dateIso > checkIn &&
                dateIso < checkOut
              );

              // Check if in preview range while hovering for checkOut
              const isInHoverRange = Boolean(
                activePicker === 'checkOut' &&
                checkIn &&
                !checkOut &&
                hoveredDate &&
                hoveredDate > checkIn &&
                dateIso > checkIn &&
                dateIso <= hoveredDate
              );

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isClickDisabled}
                  onClick={() => handleSelectDay(day)}
                  onMouseEnter={() => !isClickDisabled && setHoveredDate(dateIso)}
                  onMouseLeave={() => setHoveredDate(null)}
                  title={isFullyBooked ? 'Sin disponibilidad en el Lodge' : undefined}
                  className={`relative h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isPast
                      ? 'text-slate-300 opacity-40 cursor-not-allowed pointer-events-none'
                      : isFullyBooked
                      ? 'text-rose-400 bg-rose-50/60 line-through opacity-60 cursor-not-allowed pointer-events-none font-normal'
                      : isCheckInDay || isCheckOutDay
                      ? 'bg-[#0B192C] text-white font-black shadow-md shadow-[#0B192C]/25 ring-2 ring-[#0B192C]/20 scale-105 z-10'
                      : isInRange
                      ? 'bg-[#0B192C]/10 text-[#0B192C] rounded-none font-semibold'
                      : isInHoverRange
                      ? 'bg-[#0B192C]/5 text-[#0B192C] rounded-none'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B192C]'
                  } ${isCheckInDay && checkOut ? 'rounded-r-none' : ''} ${isCheckOutDay && checkIn ? 'rounded-l-none' : ''}`}
                >
                  <span>{day}</span>

                  {/* Tiny dot indicator for today */}
                  {isToday && !isCheckInDay && !isCheckOutDay && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0B192C]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[11px] font-semibold text-[#0B192C] hover:underline transition cursor-pointer"
              >
                Hoy + Mañana
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  onCheckInChange('');
                  onCheckOutChange('');
                }}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                Limpiar
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActivePicker(null)}
              className="bg-[#0B192C] hover:bg-[#182C4A] text-white font-bold px-4 py-1.5 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Listo</span>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
