import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Download, 
  Loader2, 
  Calendar, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExpeditions } from '../../hooks/useExpeditions';
import { leadService } from '../../services/leadService';
import { useLanguage } from '../../context/LanguageContext';
import { formatRut, formatPhone } from '../../lib/formatters';
import type { PublicExpedition } from '../../services/expeditionService';

interface ExpeditionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  expedition?: PublicExpedition | null;
  initialStep?: 0 | 1;
}

export interface PassengerData {
  fullName: string;
  docId: string;
  phone: string;
  email: string;
  notes: string;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.486.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const ExpeditionBookingModal: React.FC<ExpeditionBookingModalProps> = ({
  isOpen,
  onClose,
  expedition,
  initialStep,
}) => {
  const { expeditions, createBooking } = useExpeditions();
  const { t } = useLanguage();

  // Active expeditions sorted chronologically by departure date
  const sortedExpeditions = useMemo(() => {
    return [...expeditions]
      .filter((e) => {
        const spots = typeof e.spotsLeft === 'number' ? e.spotsLeft : (e.availableSlots ?? 0);
        return spots > 0 && e.status !== 'completed';
      })
      .sort((a, b) => {
        const dateA = new Date(a.departureDate || a.startDate || '2099-01-01').getTime();
        const dateB = new Date(b.departureDate || b.startDate || '2099-01-01').getTime();
        return dateA - dateB;
      });
  }, [expeditions]);

  const [selectedExp, setSelectedExp] = useState<PublicExpedition | null>(expedition || null);
  
  // Wizard steps: 0 = Choose Exp (if needed), 1 = Number of Pax, 2 = Passenger Details, 3 = Summary & Bank Transfer
  const [step, setStep] = useState<number>(initialStep !== undefined ? initialStep : (expedition ? 1 : 0));
  
  const [paxCount, setPaxCount] = useState<number>(1);
  const [passengers, setPassengers] = useState<PassengerData[]>([
    { fullName: '', docId: '', phone: '', email: '', notes: '' },
  ]);
  const [activePaxTab, setActivePaxTab] = useState<number>(0);
  
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [createdBookingCode, setCreatedBookingCode] = useState<string>('');

  // Sync state ONLY when modal transitions from closed to open
  const prevIsOpenRef = useRef<boolean>(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setBookingSubmitted(false);
      setBookingLoading(false);
      setTermsAccepted(false);
      setCopiedBank(false);
      const chosen = expedition || (sortedExpeditions.length > 0 ? sortedExpeditions[0] : null);
      setSelectedExp(chosen);
      setStep(initialStep !== undefined ? initialStep : (expedition ? 1 : 0));
      setPaxCount(1);
      setPassengers([
        { fullName: '', docId: '', phone: '', email: '', notes: '' },
      ]);
      setActivePaxTab(0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, expedition, initialStep]);

  // Handle ESC key (close policies or close modal explicitly)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showPoliciesModal) {
          setShowPoliciesModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showPoliciesModal, onClose]);

  if (!isOpen) return null;

  const currentActiveExp = selectedExp || (sortedExpeditions.length > 0 ? sortedExpeditions[0] : null);

  // Maximum allowed passengers for the vessel / expedition (e.g. 6 for Dufour 52.5 / Lodge, 8 for Terranova)
  const maxPax = currentActiveExp?.totalSlots 
    ? currentActiveExp.totalSlots 
    : (currentActiveExp?.vesselId === 'terranova' ? 8 : 6);

  const pricePerPax = currentActiveExp?.pricePerPaxClp || 1850000;
  const totalAmount = pricePerPax * paxCount;
  const depositAmount = Math.round(totalAmount * 0.5);

  const handleUpdatePaxCount = (newCount: number) => {
    const count = Math.max(1, Math.min(maxPax, newCount));
    setPaxCount(count);
    setPassengers((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push({ fullName: '', docId: '', phone: '', email: '', notes: '' });
      }
      return updated.slice(0, count);
    });
    if (activePaxTab >= count) {
      setActivePaxTab(count - 1);
    }
  };

  const handlePassengerChange = (index: number, field: keyof PassengerData, value: string) => {
    let formattedVal = value;
    if (field === 'docId') {
      formattedVal = formatRut(value);
    } else if (field === 'phone') {
      formattedVal = formatPhone(value);
    }

    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: formattedVal,
      };
      return updated;
    });
  };

  // Validation helper for individual passenger
  const isPassengerValid = (p: PassengerData | undefined, isLeader: boolean): boolean => {
    if (!p) return false;
    const hasName = p.fullName.trim().length >= 2;
    const hasDoc = p.docId.trim().length >= 3;
    if (isLeader) {
      const hasPhone = p.phone.trim().length >= 6;
      const hasEmail = p.email.trim().includes('@') && p.email.trim().length >= 5;
      return hasName && hasDoc && hasPhone && hasEmail;
    }
    return hasName && hasDoc;
  };

  const isCurrentPaxValid = isPassengerValid(passengers[activePaxTab], activePaxTab === 0);
  const isStep2Valid = passengers.every((p, idx) => isPassengerValid(p, idx === 0));

  const leaderPassenger = passengers[0] || { fullName: '', docId: '', phone: '', email: '', notes: '' };

  const handleCopyBankData = () => {
    const bankText = 
      `DATOS DE TRANSFERENCIA BANCARIA — YATES CHILE SpA\n` +
      `• Banco: Banco Santander\n` +
      `• Tipo de Cuenta: Cuenta Corriente\n` +
      `• Titular: Yates Chile SpA\n` +
      `• RUT: 77.892.340-K\n` +
      `• Nº de Cuenta: 78-29384-01\n` +
      `• Correo para Comprobante: reservas@yateschile.cl\n` +
      `• Asunto: Reserva ${currentActiveExp?.name || 'Expedicion'} - ${leaderPassenger.fullName || 'Pasajero'}\n` +
      `• Monto de Abono (50%): $${depositAmount.toLocaleString('es-CL')} CLP`;
    
    navigator.clipboard.writeText(bankText).then(() => {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 3000);
    });
  };

  const handleFinalBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || bookingLoading || !currentActiveExp || !isStep2Valid) return;

    setBookingLoading(true);

    try {
      const generatedCode = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedBookingCode(generatedCode);

      // 1. Create booking in Supabase / Expedition Service (decrements slots & saves to database & admin)
      const bookingRes = await createBooking({
        departureId: currentActiveExp.id,
        routeId: currentActiveExp.routeId,
        vesselId: currentActiveExp.vesselId,
        expeditionName: currentActiveExp.name,
        vesselName: currentActiveExp.vessel,
        departureDate: currentActiveExp.departureDate || currentActiveExp.startDate,
        returnDate: currentActiveExp.returnDate || currentActiveExp.endDate,
        guestName: leaderPassenger.fullName,
        guestEmail: leaderPassenger.email,
        guestPhone: leaderPassenger.phone,
        guestRutPassport: leaderPassenger.docId,
        bookingType: 'per_pax',
        paxCount: paxCount,
        totalAmount: totalAmount,
        dietaryMedicalNotes: passengers.map((p, idx) => `P${idx + 1} (${p.fullName}): ${p.notes || 'Ninguna'}`).join(' | '),
        passengers: passengers.map(p => ({
          fullName: p.fullName,
          docId: p.docId,
          emergencyContact: p.phone,
          medicalNotes: p.notes,
        })),
      });

      if (bookingRes?.bookingCode) {
        setCreatedBookingCode(bookingRes.bookingCode);
      }

      // 2. Register Lead in CRM
      leadService.createLead({
        fullName: leaderPassenger.fullName,
        email: leaderPassenger.email,
        phone: leaderPassenger.phone,
        origin: 'expedicion_interest',
        originDetails: `Reserva Web Wizard: ${currentActiveExp.name} (${paxCount} PAX)`,
        interestType: 'expediciones',
        estimatedPax: paxCount,
        tentativeDate: `${currentActiveExp.startDate} - ${currentActiveExp.endDate}`,
        notes: `RUT: ${leaderPassenger.docId}. Pasajeros: ${passengers.map(p => `${p.fullName} (${p.docId})`).join(', ')}. Base/Embarcación: ${currentActiveExp.vessel}. Total: $${totalAmount.toLocaleString('es-CL')} CLP.`,
        estimatedBudgetClp: totalAmount,
      }).catch(() => {});

      // 3. Save to localStorage
      try {
        const stored = localStorage.getItem('yates_bookings');
        const bookings = stored ? JSON.parse(stored) : [];
        const newBooking = {
          id: `res-${Date.now()}`,
          code: generatedCode,
          fullName: leaderPassenger.fullName,
          docId: leaderPassenger.docId,
          phone: leaderPassenger.phone,
          email: leaderPassenger.email,
          expeditionName: currentActiveExp.name,
          guestsCount: paxCount,
          passengers: passengers,
          totalAmount: totalAmount,
          depositAmount: depositAmount,
          dateCreated: new Date().toISOString().split('T')[0],
          status: 'pendiente_transferencia',
        };
        bookings.unshift(newBooking);
        localStorage.setItem('yates_bookings', JSON.stringify(bookings));
      } catch (_) {}

      // 4. Nautical Celebration Confetti (Maritime Blues, Ocean Foams, Gold Starboard Accents)
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#0284C7', '#38BDF8', '#0EA5E9', '#FFFFFF', '#D4AF37', '#1E3A8A', '#059669'],
          ticks: 320,
          gravity: 0.85,
          scalar: 1.1,
        });
      } catch (_) {}

      setBookingSubmitted(true);
    } catch (err) {
      console.error('Error processing booking:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const whatsappMessage = currentActiveExp
    ? encodeURIComponent(
        `Hola Yates Chile, he completado mi solicitud de reserva en la web:\n\n` +
        `• Código: ${createdBookingCode || 'EXP-2026'}\n` +
        `• Expedición: ${currentActiveExp.name}\n` +
        `• Fechas: ${currentActiveExp.startDate} al ${currentActiveExp.endDate}\n` +
        `• Embarcación / Base: ${currentActiveExp.vessel}\n` +
        `• Pasajeros (${paxCount}):\n` +
        passengers.map((p, idx) => `  ${idx + 1}. ${p.fullName} (Doc: ${p.docId})`).join('\n') + `\n\n` +
        `• Total: $${totalAmount.toLocaleString('es-CL')} CLP\n` +
        `• Abono 50%: $${depositAmount.toLocaleString('es-CL')} CLP\n` +
        `• Pasajero Contacto: ${leaderPassenger.fullName} (${leaderPassenger.phone})\n\n` +
        `Adjunto comprobante de transferencia bancaria para validación.`
      )
    : '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#060B14]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-[fadeIn_0.25s_ease-out]"
      /* Backdrop click intentionally does not close the modal to avoid accidental data loss */
    >
      <div className={`bg-[#FCFDFE] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] w-full relative text-slate-800 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden transition-all border border-white/15 ${
        step === 0 
          ? 'max-w-4xl max-h-[92vh] flex flex-col' 
          : 'max-w-4xl md:min-h-[580px] max-h-[92vh] flex flex-col md:flex-row'
      }`}>
        
        {/* Explicit Close Button (Always visible with high contrast) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center focus:outline-none z-50 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md rounded-full shadow-md border border-white/15 hover:scale-105"
          aria-label={t('Cerrar ventana', 'Close window')}
          title={t('Cerrar', 'Close')}
        >
          <X className="w-4.5 h-4.5 text-white" />
        </button>

        {/* ----------------- STEP 0: SELECCIÓN DE EXPEDICIÓN ----------------- */}
        {step === 0 && !bookingSubmitted && (
          <div className="flex flex-col h-full max-h-[92vh]">
            <div className="p-6 sm:p-8 pb-4 border-b border-slate-100 bg-[#F8FAFC]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-700 bg-slate-200/60 px-2.5 py-0.5 rounded-md">
                  Paso 0 • Catálogo de Travesías
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-[11px] text-slate-500 font-light">
                  Ordenado por próximo zarpe
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Selecciona tu Próxima Expedición
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl font-light">
                Elige una salida confirmada para iniciar tu registro y coordinar tu reserva:
              </p>
            </div>

            {/* List of Expeditions */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 max-h-[52vh]">
              {sortedExpeditions.map((exp, idx) => {
                const isSelected = selectedExp?.id === exp.id;
                const spots = typeof exp.spotsLeft === 'number' ? exp.spotsLeft : exp.availableSlots;
                const spotsText = spots === 1 ? '1 cupo disponible' : `${spots} cupos disponibles`;

                return (
                  <div
                    key={exp.id || `exp-step0-${idx}`}
                    onClick={() => setSelectedExp(exp)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900/5 shadow-sm ring-1 ring-slate-900/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-18 h-18 sm:w-22 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900">
                        <img
                          src={exp.image || '/travesia-robinson.jpg'}
                          alt={exp.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-white font-bold">
                          0{idx + 1}
                        </span>
                      </div>

                      <div className="space-y-1 text-left flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                            {exp.vessel}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                            {spotsText}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base text-slate-900">
                          {exp.name}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{exp.startDate} al {exp.endDate}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{exp.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end w-full sm:w-auto">
                      <div className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Seleccionada</span>
                          </>
                        ) : (
                          <span>Seleccionar</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 0 Footer Action */}
            <div className="p-5 border-t border-slate-200/80 bg-[#F8FAFC] flex items-center justify-between gap-4 flex-wrap">
              <div className="text-left text-xs">
                <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-widest font-bold">
                  Travesía Seleccionada
                </span>
                <span className="font-serif font-bold text-slate-900 text-sm">
                  {selectedExp ? selectedExp.name : 'Ninguna seleccionada'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedExp) {
                    setStep(1);
                  }
                }}
                disabled={!selectedExp}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                  selectedExp
                    ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Configurar Pasajeros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEPS 1, 2, 3 (LUXURY MINIMALIST SPLIT WIZARD) ----------------- */}
        {step >= 1 && !bookingSubmitted && currentActiveExp && (
          <>
            {/* Left Column: Dark Editorial Voyage Card */}
            <div className="relative w-full md:w-[36%] text-white p-6 sm:p-7 flex flex-col justify-between overflow-hidden min-h-[220px] md:min-h-full shrink-0 bg-[#080E1A]">
              <img
                src={currentActiveExp.image || '/travesia-robinson.jpg'}
                alt={currentActiveExp.name}
                className="absolute inset-0 w-full h-full object-cover opacity-35 filter saturate-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-[#080E1A]/85 to-[#080E1A]/60" />

              {/* Top Details */}
              <div className="relative z-10 space-y-3.5">
                {/* Step Progress Line */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-5 bg-white' : 'w-2 bg-white/20'}`} />
                    <span className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-5 bg-white' : 'w-2 bg-white/20'}`} />
                    <span className={`h-1 rounded-full transition-all duration-300 ${step >= 3 ? 'w-5 bg-white' : 'w-2 bg-white/20'}`} />
                  </div>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-slate-300 uppercase font-semibold">
                    0{step} / 03
                  </span>
                </div>

                <div className="space-y-1 pt-1 text-left">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold block">
                    {currentActiveExp.vessel}
                  </span>
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-white leading-snug tracking-tight">
                    {currentActiveExp.name}
                  </h4>
                  <p className="text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                    {currentActiveExp.location}
                  </p>
                </div>

                {/* Itinerary Dates */}
                <div className="border-t border-white/10 pt-2.5 space-y-1 text-left">
                  <span className="text-slate-400 text-[8px] font-mono uppercase tracking-[0.2em] block font-bold">
                    Período de Navegación
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{currentActiveExp.startDate} al {currentActiveExp.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Price Summary on Left Card */}
              <div className="relative z-10 space-y-2.5 pt-3 border-t border-white/10 text-left">
                <div className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">
                      Total ({paxCount} {paxCount === 1 ? 'PAX' : 'PAX'}):
                    </span>
                    <span className="font-serif text-base font-bold text-white tracking-tight">
                      ${totalAmount.toLocaleString('es-CL')} <span className="text-[10px] font-mono font-normal text-slate-400">CLP</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-slate-300 font-mono">
                    <span className="text-[9px] uppercase tracking-wider">Abono Reserva (50%):</span>
                    <span className="font-bold text-white">${depositAmount.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-[9px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-white transition flex items-center gap-1 pt-0.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Cambiar Travesía</span>
                </button>
              </div>
            </div>

            {/* Right Column: Clean Luxury Interactive Area */}
            <div className="w-full md:w-[64%] flex flex-col justify-between bg-[#FCFDFE] overflow-hidden min-h-0">
              
              {/* ================= PASO 1: SELECCIÓN DE CANTIDAD DE PASAJEROS ================= */}
              {step === 1 && (
                <div className="flex flex-col justify-between h-full min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-mono tracking-[0.2em] text-slate-400 uppercase font-bold block">
                        Paso 01 • Tripulación
                      </span>
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                        ¿Cuántos pasajeros viajarán?
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-light">
                        Selecciona el número de personas para esta expedición ({currentActiveExp.name}).
                      </p>
                    </div>

                    {/* Minimalist Pax Selector */}
                    <div className="py-6 space-y-4">
                      <div className="flex items-center justify-center gap-6 py-4 px-8 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 max-w-xs mx-auto shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdatePaxCount(paxCount - 1)}
                          disabled={paxCount <= 1}
                          className="w-11 h-11 rounded-full border border-slate-300 hover:border-slate-900 bg-white text-slate-900 disabled:opacity-20 flex items-center justify-center font-bold text-lg transition cursor-pointer shadow-xs active:scale-95"
                          aria-label="Disminuir pasajero"
                        >
                          -
                        </button>
                        
                        <div className="text-center min-w-[110px]">
                          <span className="font-serif text-4xl font-bold text-slate-900 tracking-tight">
                            {paxCount}
                          </span>
                          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block font-bold mt-0.5">
                            {paxCount === 1 ? 'Pasajero' : 'Pasajeros'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdatePaxCount(paxCount + 1)}
                          disabled={paxCount >= maxPax}
                          className="w-11 h-11 rounded-full border border-slate-300 hover:border-slate-900 bg-white text-slate-900 disabled:opacity-20 flex items-center justify-center font-bold text-lg transition cursor-pointer shadow-xs active:scale-95"
                          aria-label="Aumentar pasajero"
                        >
                          +
                        </button>
                      </div>

                      {/* Value Info Line */}
                      <div className="text-center text-xs text-slate-500 font-light pt-2">
                        Tarifa estándar por persona: <span className="font-mono font-semibold text-slate-900">${pricePerPax.toLocaleString('es-CL')} CLP</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation (Always pinned with generous padding) */}
                  <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 bg-[#FCFDFE] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
                    >
                      <span>Ingresar Datos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= PASO 2: DATOS PERSONALES DE CADA PASAJERO ================= */}
              {step === 2 && (
                <div className="flex flex-col justify-between h-full min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                    {/* Header */}
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono tracking-[0.2em] text-slate-400 uppercase font-bold block">
                        Paso 02 • Registro ({paxCount} {paxCount === 1 ? 'Tripulante' : 'Tripulantes'})
                      </span>
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                        Datos Personales de los Pasajeros
                      </h3>
                      <p className="text-slate-500 text-xs font-light">
                        {paxCount > 1 
                          ? 'Completa los datos de cada uno de los miembros de la expedición.' 
                          : 'Completa los datos de contacto del pasajero titular.'}
                      </p>
                    </div>

                    {/* Numbered Passenger Circles (Shown when > 1 pax or as active badge) */}
                    {paxCount > 1 ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                        <div className="flex items-center justify-center gap-2.5 flex-wrap">
                          {passengers.map((p, idx) => {
                            const isFilled = isPassengerValid(p, idx === 0);
                            const isActive = activePaxTab === idx;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActivePaxTab(idx)}
                                className={`w-8.5 h-8.5 rounded-full font-serif text-sm font-bold flex items-center justify-center transition-all cursor-pointer select-none relative ${
                                  isActive
                                    ? 'bg-slate-950 text-white shadow-md ring-2 ring-slate-900/15 scale-105'
                                    : isFilled
                                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-[#F1F3F5] text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                                title={idx === 0 ? 'Pasajero 1 (Titular)' : `Pasajero ${idx + 1}`}
                              >
                                <span>{idx + 1}</span>
                                {isFilled && !isActive && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-semibold">
                          {activePaxTab === 0 ? 'Pasajero 1 (Titular de Reserva)' : `Pasajero ${activePaxTab + 1}`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-left pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                          Pasajero 1 • Titular
                        </span>
                      </div>
                    )}

                    {/* Form Fields for Active Passenger */}
                    <div className="space-y-3.5 pt-1 text-left animate-[fadeIn_0.15s_ease-out]">
                      <div>
                        <label className="text-[10px] font-mono tracking-[0.12em] text-slate-500 uppercase font-semibold block mb-1">
                          Nombre Completo <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Roberto Silva"
                          value={passengers[activePaxTab].fullName}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'fullName', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:border-slate-900 focus:bg-white focus:outline-none px-3.5 py-2.5 text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all shadow-2xs focus:ring-2 focus:ring-slate-900/5"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono tracking-[0.12em] text-slate-500 uppercase font-semibold block mb-1">
                            RUT / Pasaporte <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 12.345.678-9"
                            value={passengers[activePaxTab].docId}
                            onChange={(e) => handlePassengerChange(activePaxTab, 'docId', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:border-slate-900 focus:bg-white focus:outline-none px-3.5 py-2.5 text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all shadow-2xs focus:ring-2 focus:ring-slate-900/5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono tracking-[0.12em] text-slate-500 uppercase font-semibold block mb-1">
                            WhatsApp / Teléfono {activePaxTab === 0 ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal lowercase">(opcional)</span>}
                          </label>
                          <input
                            type="tel"
                            required={activePaxTab === 0}
                            placeholder="Ej. +56 9 1234 5678"
                            value={passengers[activePaxTab].phone}
                            onChange={(e) => handlePassengerChange(activePaxTab, 'phone', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:border-slate-900 focus:bg-white focus:outline-none px-3.5 py-2.5 text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all shadow-2xs focus:ring-2 focus:ring-slate-900/5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono tracking-[0.12em] text-slate-500 uppercase font-semibold block mb-1">
                            Correo Electrónico {activePaxTab === 0 ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal lowercase">(opcional)</span>}
                          </label>
                          <input
                            type="email"
                            required={activePaxTab === 0}
                            placeholder="ejemplo@correo.com"
                            value={passengers[activePaxTab].email}
                            onChange={(e) => handlePassengerChange(activePaxTab, 'email', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:border-slate-900 focus:bg-white focus:outline-none px-3.5 py-2.5 text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all shadow-2xs focus:ring-2 focus:ring-slate-900/5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono tracking-[0.12em] text-slate-500 uppercase font-semibold block mb-1">
                            Requerimientos <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Alergias o preferencias"
                            value={passengers[activePaxTab].notes}
                            onChange={(e) => handlePassengerChange(activePaxTab, 'notes', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:border-slate-900 focus:bg-white focus:outline-none px-3.5 py-2.5 text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all shadow-2xs focus:ring-2 focus:ring-slate-900/5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation (Always pinned with generous padding) */}
                  <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 bg-[#FCFDFE] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {activePaxTab < paxCount - 1 ? (
                        <button
                          type="button"
                          onClick={() => setActivePaxTab(activePaxTab + 1)}
                          disabled={!isCurrentPaxValid}
                          className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 ${
                            isCurrentPaxValid
                              ? 'bg-slate-950 hover:bg-slate-900 text-white cursor-pointer hover:scale-[1.01] active:scale-98'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <span>Siguiente Pasajero ({activePaxTab + 2})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={!isStep2Valid}
                          className={`text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 ${
                            isStep2Valid
                              ? 'bg-slate-950 hover:bg-slate-900 text-white cursor-pointer hover:scale-[1.01] active:scale-98'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <span>Revisar y Pagar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PASO 3: RESUMEN, DATOS BANCARIOS Y POLÍTICAS ================= */}
              {step === 3 && (
                <form onSubmit={handleFinalBookingSubmit} className="flex flex-col justify-between h-full min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 text-left">
                    
                    {/* Header */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono tracking-[0.2em] text-slate-400 uppercase font-bold block">
                        Paso 03 • Resumen & Transferencia
                      </span>
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                        Confirmación de Reserva
                      </h3>
                    </div>

                    {/* Minimalist Financial Breakdown */}
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Total Expedición ({paxCount} {paxCount === 1 ? 'persona' : 'personas'}):</span>
                        <span className="font-mono font-bold text-slate-900">${totalAmount.toLocaleString('es-CL')} CLP</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-900 pt-1.5 border-t border-slate-200/70 font-semibold">
                        <span className="text-xs">Abono Inicial Requerido (50% Pie):</span>
                        <span className="font-mono font-bold text-sm text-slate-950">${depositAmount.toLocaleString('es-CL')} CLP</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-light">
                        * El 50% de saldo restante se cancela 30 días antes de la fecha de zarpe.
                      </div>
                    </div>

                    {/* Luxury Minimalist Bank Card */}
                    <div className="bg-[#0B1528] text-white p-4 rounded-2xl border border-slate-800 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                            Banco Santander • Cta. Corriente
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyBankData}
                          className={`group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                            copiedBank
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
                          }`}
                          title="Copiar todos los datos de transferencia bancaria"
                        >
                          {copiedBank ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Titular / Razón Social:</span>
                          <span className="text-white font-medium">Yates Chile SpA</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">RUT Empresa:</span>
                          <span className="text-white font-medium">77.892.340-K</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Nº de Cuenta:</span>
                          <span className="text-white font-bold">78-29384-01</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Correo Comprobante:</span>
                          <span className="text-slate-200">reservas@yateschile.cl</span>
                        </div>
                      </div>
                    </div>

                    {/* Standard Minimalist Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-600 text-xs">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px] shrink-0 accent-[#0F172A] cursor-pointer rounded border border-slate-300 m-0"
                        />
                        <span className="text-xs text-slate-600 leading-snug">
                          Acepto los{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPoliciesModal(true);
                            }}
                            className="text-slate-900 font-semibold underline hover:text-slate-950 cursor-pointer"
                          >
                            Términos y Políticas de las Expediciones
                          </button>
                          {' '}de Yates Chile.
                        </span>
                      </label>
                    </div>

                  </div>

                  {/* Step 3 Actions (Always pinned with generous padding) */}
                  <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 bg-[#FCFDFE] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="submit"
                      disabled={bookingLoading || !termsAccepted}
                      className={`text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-sm flex items-center gap-2 ${
                        termsAccepted && !bookingLoading
                          ? 'bg-slate-950 hover:bg-slate-900 text-white cursor-pointer hover:scale-[1.01] active:scale-98'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <span>Confirmar Reserva ➔</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </>
        )}

        {/* ----------------- SUBMITTED SUCCESS VIEW (NAUTICAL THEME) ----------------- */}
        {bookingSubmitted && currentActiveExp && (
          <div className="p-8 sm:p-10 text-center space-y-5 flex-1 flex flex-col justify-center items-center select-none bg-[#080E1A] text-white min-h-[380px] md:min-h-[420px] relative overflow-hidden">
            
            {/* Nautical Radar Waves & Navigation Compass Animation */}
            <div className="relative w-22 h-22 flex items-center justify-center shrink-0 mb-1">
              {/* Outer Nautical Concentric Radar Rings */}
              <span className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping opacity-60 pointer-events-none" />
              <span className="absolute -inset-3 rounded-full border border-sky-300/10 animate-pulse pointer-events-none" />
              
              {/* Central Compass Emblem with rotation */}
              <div className="w-16 h-16 rounded-full bg-slate-900/90 border border-sky-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(2,132,199,0.25)]">
                <img
                  src="/vegvisir-emblem-white.png"
                  alt="Nautical Emblem"
                  className="w-9 h-9 object-contain filter drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] animate-[spin_40s_linear_infinite]"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-w-md">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-sky-300 bg-sky-950/70 border border-sky-500/40 px-3 py-1 rounded-full font-bold">
                <Compass className="w-3 h-3 text-sky-300" />
                <span>Código: {createdBookingCode || 'EXP-2026'}</span>
              </span>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Solicitud de Reserva Registrada
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                Tu expedición para <strong className="font-semibold text-white">{currentActiveExp.name}</strong> ({paxCount} {paxCount === 1 ? 'pasajero' : 'pasajeros'}) ha sido procesada con éxito.
              </p>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed pt-0.5">
                Transfiere el abono del 50% ($<strong>{depositAmount.toLocaleString('es-CL')} CLP</strong>) y envía el comprobante por WhatsApp o a <strong>reservas@yateschile.cl</strong>.
              </p>
            </div>

            {/* Actions: Green WhatsApp Button & Elegant Brochure Link */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
              {/* Official Green WhatsApp CTA */}
              <a
                href={`https://wa.me/56981312920?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Enviar Comprobante vía WhatsApp</span>
              </a>

              {/* Elegant Brochure Link */}
              <a
                href="/brochure-yates-chile.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-5 py-3 rounded-xl transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Descargar Itinerario (PDF)</span>
              </a>
            </div>

            {/* Bottom Dismiss Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white text-xs font-mono uppercase tracking-wider transition cursor-pointer border border-white/15 active:scale-95 shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cerrar y volver al sitio web</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL DE POLÍTICAS DE EXPEDICIÓN ================= */}
      {showPoliciesModal && (
        <div 
          className="fixed inset-0 z-60 bg-[#060B14]/85 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPoliciesModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative text-slate-800 animate-[scaleIn_0.25s_ease-out] overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-slate-900" />
                <h3 className="font-serif font-bold text-lg text-slate-900 tracking-tight">
                  Políticas y Condiciones de Expedición
                </h3>
              </div>
              <button
                onClick={() => setShowPoliciesModal(false)}
                className="text-slate-400 hover:text-slate-950 p-1.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 text-left leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  1. Modalidad de Reserva y Pagos
                </h4>
                <p>
                  Para garantizar y bloquear los cupos en la expedición seleccionada, se requiere un abono correspondiente al <strong>50% del valor total</strong> mediante transferencia bancaria. El 50% restante deberá ser cancelado a más tardar 30 días antes de la fecha fijada de zarpe o check-in.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  2. Políticas de Cancelación y Reprogramación
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Cancelaciones con más de 45 días de anticipación:</strong> Reembolso del 90% del monto abonado o reprogramación sin costo sujeta a cupos.</li>
                  <li><strong>Cancelaciones entre 44 y 21 días antes del zarpe:</strong> Retención del 30% del total por concepto de gastos operacionales e insumos náuticos, o posibilidad de endosar el cupo a otro pasajero previa notificación.</li>
                  <li><strong>Cancelaciones con menos de 20 días:</strong> No reembolsable debido a la logística de tripulación y aprovisionamiento insular.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  3. Meteorología, Seguridad y Navegación de Alta Mar
                </h4>
                <p>
                  La seguridad de la tripulación y los pasajeros es la máxima prioridad. Los planes de navegación, rutas y desembarcos en caletas están condicionados a las autorizaciones de la Capitanía de Puerto y las condiciones meteorológicas imperantes evaluadas por el Capitán de Ultramar.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  4. Seguros y Certificaciones
                </h4>
                <p>
                  Todas las embarcaciones de Yates Chile cuentan con seguros de navegación marítima y equipamiento salvavidas certificado por DIRECTEMAR (Armada de Chile), incluyendo botes auxiliares Zodiac, radiobalizas satelitales EPIRB y conexión Starlink 24/7.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowPoliciesModal(false);
                }}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Entendido y Aceptar Políticas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
