import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
  isReady?: boolean;
  isVideoReady?: boolean;
  minDuration?: number;
}

const NAUTICAL_MESSAGES = [
  'Calibrando compás magnético...',
  'Alistando velamen y cabuyería...',
  'Calculando derrota óptima...',
  'Estableciendo rumbo austral...',
  'Sondeando profundidades de navegación...',
  'Posicionando Vegvisir...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  isReady = false, 
  isVideoReady = false, 
  minDuration = 500 
}) => {
  const [progress, setProgress] = useState(15);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const isFinishedRef = React.useRef(false);

  // Message cycler
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % NAUTICAL_MESSAGES.length);
    }, 1200);

    return () => clearInterval(messageInterval);
  }, []);

  // Intelligent dynamic loader
  useEffect(() => {
    const startTime = Date.now();
    const isActuallyReady = isReady || isVideoReady;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (isActuallyReady || elapsed >= 2500) {
        // Ready! Fast transition to exit without waiting
        if (!isFinishedRef.current) {
          isFinishedRef.current = true;
          setProgress(100);
          clearInterval(interval);
          
          const remainingDelay = Math.max(0, minDuration - elapsed);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              onComplete();
            }, 600);
          }, remainingDelay);
        }
      } else {
        // Incrementally advance progress while loading in background
        setProgress((prev) => Math.min(prev + (95 - prev) * 0.15, 95));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isReady, isVideoReady, minDuration, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
        >
          {/* Ambient Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Compass Container */}
          <div className="relative flex flex-col items-center justify-center max-w-md w-full px-6">
            
            {/* Elegant Nautical Compass (Vegvisir) Emblem */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-10 flex items-center justify-center">
              
              {/* Outer decorative dashed circle (Clockwise Rotation) */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-dashed border-white/20"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
              />
              
              {/* Middle subtle dotted ring (Counter-Clockwise Rotation) */}
              <motion.div 
                className="absolute inset-3 rounded-full border border-dotted border-white/15"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
              />

              {/* Center Authentic Vegvisir Emblem Logo */}
              <motion.img
                src="/vegvisir-emblem-white.png"
                alt="Logo Vegvisir Emblem"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] relative z-10 select-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: [0.85, 1, 0.85],
                  scale: [0.98, 1.02, 0.98]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              />
            </div>

            {/* Typography Section */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <h2 className="font-bold text-lg sm:text-xl tracking-[0.25em] text-white uppercase font-sans">
                  Yates Chile
                </h2>
                <p className="text-[10px] text-slate-400 tracking-[0.18em] uppercase font-light mt-1">
                  Sailing & Lodge
                </p>
              </motion.div>

              {/* Dynamic Nautical Messages */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs text-slate-300 italic font-light tracking-wide"
                  >
                    {NAUTICAL_MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress Slider (Nautical Style) */}
              <div className="pt-4 max-w-[240px] mx-auto w-full space-y-2">
                {/* Progress bar container */}
                <div className="h-[2px] bg-slate-900 border border-slate-800/40 rounded-full overflow-hidden w-full relative">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Percentage and Coordinate */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider">
                  <span>{Math.round(progress)}%</span>
                  <span>43° 35' S, 74° 05' W</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
