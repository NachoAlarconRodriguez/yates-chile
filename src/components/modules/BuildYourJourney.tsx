import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Compass, Ship, Home, Sparkles, Check, ArrowRight, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import type { JourneyConfigState } from '../../types';
import { leadService } from '../../services/leadService';
import { useLanguage } from '../../context/LanguageContext';
import { formatPhone } from '../../lib/formatters';

export const BuildYourJourney: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useLanguage();

  const [formData, setFormData] = useState<JourneyConfigState>({
    experienceType: 'lodgenavigation',
    expeditionFocus: 'fiordos',
    guestsCount: 4,
    tentativeMonth: 'Noviembre',
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const handleNextStep = () => {
    if (step < 3) setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Register Lead in CRM
    leadService.createLead({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      origin: 'contacto_web',
      originDetails: `Diseña tu Travesía (${formData.experienceType === 'lodgenavigation' ? 'Lodge + Navegación' : formData.experienceType === 'navigation' ? 'Solo Barco' : 'Solo Lodge'})`,
      interestType: formData.experienceType === 'navigation' ? 'expediciones' : formData.experienceType === 'lodge' ? 'lodge' : 'charter',
      estimatedPax: formData.guestsCount,
      tentativeDate: formData.tentativeMonth,
      notes: formData.specialRequests || 'Solicitud de itinerario a medida enviada desde el configurador web.',
    }).catch(() => {});

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      // Trigger Confetti Effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#0F172A', '#F8FAFC'],
        });
      } catch (_) {
        // Fallback
      }

      // Build WhatsApp Concierge URL
      const experienceLabel =
        formData.experienceType === 'lodgenavigation'
          ? 'Experiencia Combinada (Lodge + Navegación)'
          : formData.experienceType === 'navigation'
          ? 'Solo Expedición en Barco'
          : 'Solo Estadía en Lodge';

      const focusLabel =
        formData.expeditionFocus === 'fiordos'
          ? 'Fiordos & Glaciares'
          : formData.expeditionFocus === 'fauna'
          ? 'Avistamiento de Fauna'
          : 'Relax & Gastronomía';

      const text = encodeURIComponent(
        `Hola, he diseñado mi itinerario en YatesChile.com:\n\n` +
          `• Modalidad: ${experienceLabel}\n` +
          `• Enfoque: ${focusLabel}\n` +
          `• Huéspedes: ${formData.guestsCount} personas\n` +
          `• Mes Tentativo: ${formData.tentativeMonth}\n` +
          `• Nombre: ${formData.fullName}\n` +
          `• Email: ${formData.email}\n` +
          `• Teléfono: ${formData.phone}\n\n` +
          `Deseo coordinar la reserva y recibir el Brochure PDF oficial.`
      );

      const whatsappUrl = `https://wa.me/56981312920?text=${text}`;

      // Automatically open WhatsApp after brief delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1200);
    }, 1000);
  };

  return (
    <section id="build-your-journey" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('Configurador Interactivo', 'Interactive Configurator')}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t('Diseña tu Travesía', 'Build Your Journey')}
          </h2>
          <p className="mt-3 text-slate-450 text-base sm:text-lg">
            {t('Diseña tu travesía a medida por los canales del Cabo de Hornos en 3 simples pasos.', 'Craft your custom voyage through Cape Horn channels in 3 simple steps.')}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 text-xs font-semibold">
          {[1, 2, 3].map((num) => {
            const isActive = step === num;
            const isCompleted = step > num || submitted;

            return (
              <div key={num} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? 'bg-blue-900 text-white font-bold'
                      : isActive
                      ? 'bg-slate-800 border-2 border-blue-400 text-blue-300 shadow-lg scale-110'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : num}
                </div>
                <span className={isActive ? 'text-blue-300 font-bold' : 'text-slate-400'}>
                  {num === 1 ? t('Base', 'Base') : num === 2 ? t('Experiencia', 'Experience') : t('Huéspedes & Datos', 'Guests & Details')}
                </span>
                {num < 3 && <div className="w-12 sm:w-20 h-0.5 bg-slate-800 mx-1"></div>}
              </div>
            );
          })}
        </div>

        {/* Wizard Container */}
        <div className="bg-slate-950/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Base Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-blue-300 text-center">
                    {t('Paso 1: Elige la Base de tu Experiencia', 'Step 1: Choose Your Experience Base')}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    
                    {/* Option A */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceType: 'lodgenavigation' })}
                      className={`p-6 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[200px] cursor-pointer ${
                        formData.experienceType === 'lodgenavigation'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl ring-2 ring-blue-400/40'
                          : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-900 text-white">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        {formData.experienceType === 'lodgenavigation' && <Check className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-white">{t('Experiencia Combinada', 'Combined Experience')}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {t('Días a bordo navegando fiordos + estadía exclusiva en Lodge en tierra.', 'Days sailing remote fjords + exclusive island lodge stay on land.')}
                        </p>
                      </div>
                    </button>

                    {/* Option B */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceType: 'navigation' })}
                      className={`p-6 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[200px] cursor-pointer ${
                        formData.experienceType === 'navigation'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl ring-2 ring-blue-400/40'
                          : 'bg-slate-900 border-slate-800 text-slate-355 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-sky-500 text-white">
                          <Ship className="w-5 h-5" />
                        </div>
                        {formData.experienceType === 'navigation' && <Check className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-white">{t('Solo Expedición en Barco', 'Boat Expedition Only')}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {t('Navegación inmersiva 100% a bordo del Velero Vegvisir o Yate Terranova.', '100% immersive sailing aboard Vegvisir Sailboat or Terranova Yacht.')}
                        </p>
                      </div>
                    </button>

                    {/* Option C */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceType: 'lodge' })}
                      className={`p-6 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[200px] cursor-pointer ${
                        formData.experienceType === 'lodge'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl ring-2 ring-blue-400/40'
                          : 'bg-slate-900 border-slate-800 text-slate-355 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-teal-500 text-white">
                          <Home className="w-5 h-5" />
                        </div>
                        {formData.experienceType === 'lodge' && <Check className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-white">{t('Estadía en Lodge & Excursiones', 'Lodge Stay & Excursions')}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {t('Refugio frente al mar en Bahía Cumberland con excursiones opcionales de buceo, cabalgatas y gastronomía.', 'Oceanfront refuge in Cumberland Bay with excursions for diving, horseback riding, and dining.')}
                        </p>
                      </div>
                    </button>

                  </div>
                </div>
              )}

              {/* STEP 2: Expedition Focus */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-blue-300 text-center">
                    {t('Paso 2: Elige el Enfoque Principal de tu Viaje', 'Step 2: Choose Your Primary Voyage Focus')}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expeditionFocus: 'fiordos' })}
                      className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                        formData.expeditionFocus === 'fiordos'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl'
                          : 'bg-slate-900 border-slate-800 text-slate-355'
                      }`}
                    >
                      <h4 className="font-serif font-bold text-lg text-blue-300 mb-2">
                        {t('Fiordos & Glaciares', 'Fjords & Glaciers')}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t('Exploración profunda de ventisqueros milenarios y aguas glaciales inaccesibles por tierra.', 'Deep exploration of ancient glaciers and pristine waters inaccessible by land.')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expeditionFocus: 'fauna' })}
                      className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                        formData.expeditionFocus === 'fauna'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl'
                          : 'bg-slate-900 border-slate-800 text-slate-355'
                      }`}
                    >
                      <h4 className="font-serif font-bold text-lg text-blue-300 mb-2">
                        {t('Avistamiento de Fauna', 'Wildlife Watching')}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t('Rutas especializadas en avistamiento de ballenas jorobadas, orcas, pingüinos y toninas.', 'Dedicated routes to spot humpback whales, orcas, penguins, and dolphins.')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expeditionFocus: 'gastronomy' })}
                      className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                        formData.expeditionFocus === 'gastronomy'
                          ? 'bg-blue-900/15 border-blue-400 text-white shadow-xl'
                          : 'bg-slate-900 border-slate-800 text-slate-355'
                      }`}
                    >
                      <h4 className="font-serif font-bold text-lg text-blue-300 mb-2">
                        {t('Relax & Gastronomía', 'Relaxation & Gastronomy')}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t('Desconexión total, maridajes de autor, termas naturales y confort exclusivo a bordo.', 'Complete disconnect, wine pairing dinners, hot springs, and comfort aboard.')}
                      </p>
                    </button>

                  </div>
                </div>
              )}

              {/* STEP 3: Huéspedes, Mes y Formulario */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-blue-300 text-center">
                    {t('Paso 3: Detalle de Huéspedes & Datos de Contacto', 'Step 3: Guests & Contact Details')}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('Cantidad de Huéspedes:', 'Number of Guests:')}
                      </label>
                      <select
                        value={formData.guestsCount}
                        onChange={(e) => setFormData({ ...formData, guestsCount: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? t('Huésped', 'Guest') : t('Huéspedes', 'Guests')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('Mes Tentativo de Viaje:', 'Tentative Month:')}
                      </label>
                      <select
                        value={formData.tentativeMonth}
                        onChange={(e) => setFormData({ ...formData, tentativeMonth: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
                      >
                        {['Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'].map((m) => (
                          <option key={m} value={m}>
                            {m} 2026/2027
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('Nombre Completo *', 'Full Name *')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('Ej. Roberto Silva', 'e.g. John Doe')}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('Correo Electrónico *', 'Email Address *')}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('Teléfono / WhatsApp *', 'Phone / WhatsApp *')}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+56 9 1234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 transition min-h-[48px] text-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('Anterior', 'Previous')}</span>
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg min-h-[48px] text-sm cursor-pointer"
                  >
                    <span>{t('Siguiente Paso', 'Next Step')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-emerald-650 hover:bg-emerald-550 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-xl min-h-[48px] text-sm cursor-pointer"
                  >
                    {loading ? (
                      <span>{t('Procesando solicitud...', 'Processing request...')}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t('Solicitar Brochure PDF & Abrir WhatsApp Concierge', 'Request PDF Brochure & Open WhatsApp Concierge')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          ) : (
            /* Success confirmation screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-blue-300">
                {t('¡Postulación Registrada Exitosamente!', 'Application Registered Successfully!')}
              </h3>
              <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
                {t(
                  `Tu solicitud ha sido recibida y el correo automático de Brevo con el Brochure PDF de Yates Chile ha sido despachado a `,
                  `Your request has been received and the automated email with Yates Chile PDF Brochure was sent to `
                )}
                <span className="text-blue-300 font-semibold">{formData.email}</span>.
              </p>
              <p className="text-xs text-slate-400 italic">
                {t('Redirigiendo automáticamente a WhatsApp Concierge...', 'Redirecting automatically to WhatsApp Concierge...')}
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
