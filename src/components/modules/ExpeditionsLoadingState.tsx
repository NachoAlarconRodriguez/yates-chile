import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ExpeditionsLoadingState: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full space-y-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Branded Nautical Spinner / Compass */}
      <div className="flex flex-col items-center justify-center pt-2 pb-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-5 flex items-center justify-center">
          {/* Outer rotating dashed compass ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-blue-900/25"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
          />
          {/* Middle counter-rotating dotted ring */}
          <motion.div
            className="absolute inset-2 rounded-full border border-dotted border-amber-600/30"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />
          {/* Ambient soft glow */}
          <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />

          {/* Logo Vegvisir Emblem */}
          <motion.img
            src="/vegvisir-emblem-dark.png"
            alt="Yates Chile Emblem"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 select-none drop-shadow-sm"
            animate={{
              scale: [0.95, 1.03, 0.95],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Nautical Status Message */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 tracking-wider uppercase">
            <Compass className="w-4 h-4 text-blue-900 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{t('Consultando bitácora de navegación...', 'Consulting navigation logbook...')}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-widest uppercase">
            {t('Alistando expediciones y travesías 2026/2027', 'Preparing expeditions & voyages 2026/2027')}
          </p>
        </div>
      </div>

      {/* 3 Luxury Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between relative"
          >
            {/* Shimmer sweep overlay covering card */}
            <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />

            {/* Image Placeholder with Shimmer */}
            <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden shrink-0">
              {/* Vessel badge placeholder */}
              <div className="absolute top-4 left-4 w-28 h-5 rounded-full bg-slate-200/90 animate-pulse" />
              
              {/* Status badge placeholder */}
              <div className="absolute top-4 right-4 w-24 h-5 rounded-full bg-slate-200/90 animate-pulse" />
            </div>

            {/* Content Placeholder */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                {/* Date row placeholder */}
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="w-36 h-3 bg-slate-200 rounded-full animate-pulse" />
                </div>

                {/* Title placeholder */}
                <div className="space-y-2 pt-1">
                  <div className="w-5/6 h-5 bg-slate-200/90 rounded-md animate-pulse" />
                  <div className="w-1/2 h-5 bg-slate-200/60 rounded-md animate-pulse" />
                </div>

                {/* Description lines placeholder */}
                <div className="space-y-2 pt-1">
                  <div className="w-full h-3 bg-slate-100 rounded animate-pulse" />
                  <div className="w-4/5 h-3 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>

              {/* Card Footer placeholder */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="w-24 h-3 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="w-24 h-3 bg-slate-200/80 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
