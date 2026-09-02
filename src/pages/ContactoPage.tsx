import React from 'react';
import { BuildYourJourney } from '../components/modules/BuildYourJourney';
import { Phone, Mail, MapPin, Anchor, Clock } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';

export const ContactoPage: React.FC = () => {
  const { getSection } = useSiteContent();
  const { t } = useLanguage();
  const contactInfo = getSection('contact_info');

  return (
    <div className="space-y-0 bg-white">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800">
        {contactInfo.media_url && (
          <>
            <img
              src={contactInfo.media_url}
              alt={contactInfo.title || "Contacto"}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
          </>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Anchor className="w-4 h-4 text-blue-400" />
            <span>{contactInfo.subtitle || t('Atención Personalizada 24/7', 'Personalized 24/7 Service')}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {contactInfo.title || t('Contacto & Concierge Exclusivo', 'Contact & Exclusive Concierge')}
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            {contactInfo.body_text || t('Diseña tu itinerario a medida por Cabo de Hornos o cuéntanos tus consultas de navegación.', 'Design your tailor-made Cape Horn itinerary or contact us for nautical inquiries.')}
          </p>
        </div>
      </section>

      {/* Main Configurator */}
      <BuildYourJourney />

      {/* Direct Contact & Locations Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Box 1: Telefono & WhatsApp */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {t('Atención Telefónica Exclusiva', 'Exclusive Phone Assistance')}
              </h3>
              <p className="text-slate-655 text-xs leading-relaxed">
                {t('Nuestros capitanes y asistentes de Concierge responden consultas directas sobre disponibilidad.', 'Our captains and Concierge staff answer direct questions regarding availability.')}
              </p>
              <div className="pt-2 font-bold text-base text-blue-700">
                <a href="tel:+56981312920" className="hover:underline">+56 9 8131 2920</a>
              </div>
            </div>

            {/* Box 2: Correo Electronico */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Mail className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {t('Correo Institucional', 'Institutional Inquiries')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {t('Envío de solicitudes corporativas, alianzas de lujo y solicitudes especiales.', 'Corporate requests, luxury partnerships, and bespoke journey inquiries.')}
              </p>
              <div className="pt-2 font-bold text-base text-sky-700">
                <a href="mailto:concierge@yateschile.com" className="hover:underline">concierge@yateschile.com</a>
              </div>
            </div>

            {/* Box 3: Ubicacion & Base */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {t('Base & Operaciones', 'Base & Operations')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {t('Uberlindo Andaur 222, Archipiélago Juan Fernández & Marina Puerto Montt, Chile.', 'Uberlindo Andaur 222, Juan Fernández Archipelago & Puerto Montt Marina, Chile.')}
              </p>
              <div className="pt-2 font-bold text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('Horario: Lunes a Domingo 08:00 - 20:00 hrs', 'Hours: Monday to Sunday 08:00 - 20:00 hrs')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
