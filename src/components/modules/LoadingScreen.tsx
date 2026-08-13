import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
  isVideoReady: boolean;
  duration?: number; // Minimum loading screen duration in ms
}

const NAUTICAL_MESSAGES = [
  'Calibrando compás magnético...',
  'Alistando velamen y cabuyería...',
  'Calculando derrota óptima...',
  'Estableciendo rumbo austral...',
  'Sondeando profundidades de navegación...',
  'Posicionando Vegvisir...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isVideoReady, duration = 3000 }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Progress counter
  useEffect(() => {
    const startTime = Date.now();
    const maxTimeout = 8000; // 8 seconds safety limit

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Calculate target progress.
      // It moves toward 99% during the duration, and stays there unless isVideoReady is true
      let targetProgress = (elapsed / duration) * 99;
      
      if (isVideoReady || elapsed >= maxTimeout) {
        // If video is loaded or safety timeout hit, speed up progress to 100%
        // But only fade out if we've met the minimum duration
        if (elapsed >= duration) {
          setProgress(100);
          clearInterval(interval);
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 800);
          return;
        } else {
          // If video loaded early, we still count up to 100% over the remaining min duration
          targetProgress = (elapsed / duration) * 100;
        }
      }
      
      setProgress(Math.min(targetProgress, 99));
    }, 30);

    return () => clearInterval(interval);
  }, [duration, isVideoReady, onComplete]);

  // Message cycler
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % NAUTICAL_MESSAGES.length);
    }, duration / 4); // Cycle through messages during the load

    return () => clearInterval(messageInterval);
  }, [duration]);

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
            
            {/* Elegant Nautical Compass (Vegvisir) SVG */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-10 flex items-center justify-center">
              
              {/* Outer compass rim (aesthetic ring) */}
              <div className="absolute inset-0 border border-white/5 rounded-full scale-110 pointer-events-none" />

              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 200 200" 
                className="w-full h-full text-slate-100 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                fill="none"
              >
                {/* 1. Outer decorative dashed & dotted circles (Clockwise Rotation) */}
                <motion.circle 
                  cx="100" 
                  cy="100" 
                  r="94" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeDasharray="8 4" 
                  className="opacity-70"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                  style={{ transformOrigin: 'center' }}
                />
                
                {/* 2. Middle solid circle (Steady helper) */}
                <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" className="opacity-30" />
                
                {/* 3. Inner decorative dashed circle (Counter-Clockwise Rotation) */}
                <motion.circle 
                  cx="100" 
                  cy="100" 
                  r="82" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                  className="opacity-55"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                  style={{ transformOrigin: 'center' }}
                />

                {/* 4. Center hub (Steady and pulsing) */}
                <motion.circle 
                  cx="100" 
                  cy="100" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="rgba(15, 23, 42, 0.8)" 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'center' }}
                />
                <circle cx="100" cy="100" r="3" fill="currentColor" />

                {/* 5. The 8 Main Axes of Vegvisir (Slow Clockwise Drift + Fade In) */}
                <motion.g
                  initial={{ opacity: 0.3, scale: 0.95 }}
                  animate={{ 
                    opacity: [0.85, 1, 0.85],
                    scale: 1,
                    rotate: 5
                  }}
                  transition={{ 
                    opacity: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                    scale: { duration: 1.5, ease: 'easeOut' },
                    rotate: { repeat: Infinity, repeatType: 'reverse', duration: 8, ease: 'easeInOut' }
                  }}
                  style={{ transformOrigin: 'center' }}
                >
                  {/* Top (N) */}
                  <path d="M100 90 V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M90 32 H110 M88 42 H112 M94 22 L100 15 L106 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>

                  {/* Top-Right (NE) */}
                  <path d="M107 93 L156 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M140 48 L152 60 M148 40 L160 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

                  {/* Right (E) */}
                  <path d="M110 100 H180" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M168 90 V110 M158 88 V112 M178 94 L185 100 L178 106" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>

                  {/* Bottom-Right (SE) */}
                  <path d="M107 107 L156 156" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M148 148 L160 136 M140 140 L152 128" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

                  {/* Bottom (S) */}
                  <path d="M100 110 V180" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M90 168 H110 M88 158 H112 M94 178 L100 185 L106 178" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>

                  {/* Bottom-Left (SW) */}
                  <path d="M93 107 L44 156" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M52 148 L40 136 M60 140 L48 128" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

                  {/* Left (W) */}
                  <path d="M90 100 H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M32 90 V110 M42 88 V112 M22 94 L15 100 L22 106" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>

                  {/* Top-Left (NW) */}
                  <path d="M93 93 L44 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M48 40 L36 52 M60 48 L48 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

                  {/* Decorative Accent Dots */}
                  <circle cx="35" cy="35" r="3.5" fill="currentColor"/>
                  <circle cx="25" cy="48" r="2" fill="currentColor"/>
                  <circle cx="48" cy="25" r="2" fill="currentColor"/>
                  <circle cx="165" cy="165" r="3.5" fill="currentColor"/>
                  <circle cx="175" cy="152" r="2" fill="currentColor"/>
                  <circle cx="152" cy="175" r="2" fill="currentColor"/>
                </motion.g>
              </svg>
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
                  Vegvisir Sailing & Lodge
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
