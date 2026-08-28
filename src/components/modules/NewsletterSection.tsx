import React, { useState } from 'react';
import { Check, Send, Sparkles } from 'lucide-react';
import { leadService } from '../../services/leadService';

export const NewsletterSection: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await leadService.createLead({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: '',
        origin: 'newsletter',
        originDetails: 'Suscripción Newsletter Web',
        interestType: 'general',
        notes: 'Suscripción al boletín oficial desde el sitio web público.',
      });
      setSubmitted(true);
      setFullName('');
      setEmail('');
    } catch (err) {
      console.error('Error suscribiendo al newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#09111e] via-[#0B1528] to-[#070e1b] border-t border-b border-white/10 py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Decorative ambient ocean glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-sky-500/10 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <div className="space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold bg-sky-950/70 px-4 py-1.5 rounded-full border border-sky-800/60 inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Boletín Oficial & Novedades Exclusivas</span>
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Suscríbete a Nuestro Newsletter
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Recibe en primicia aperturas de zarpe, itinerarios privados hacia el Archipiélago Juan Fernández y noticias náuticas exclusivas de Yates Chile.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 p-5 rounded-3xl max-w-md mx-auto flex items-center justify-center gap-3 animate-fadeIn shadow-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white">¡Suscripción confirmada!</span>
              <span className="text-[11px] text-emerald-300/90 font-light block">
                Te has registrado exitosamente en nuestro boletín oficial.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-5">
              <input
                type="text"
                required
                placeholder="Nombre y Apellido"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#0b192c] placeholder:text-slate-400 border border-white/15 focus:border-sky-400 rounded-full px-5 py-3 text-xs outline-none transition shadow-2xs font-medium"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#0b192c] placeholder:text-slate-400 border border-white/15 focus:border-sky-400 rounded-full px-5 py-3 text-xs outline-none transition shadow-2xs font-medium"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-3 text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Suscribirme</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
