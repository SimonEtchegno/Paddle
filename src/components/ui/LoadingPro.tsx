'use client';

import { motion } from 'framer-motion';
import { useSport } from '@/hooks/useSport';

export function LoadingPro() {
  const { sport } = useSport();
  
  // Icono dinámico según deporte
  const isFutbol = sport === 'futbol';

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 select-none">
      <div className="relative w-24 h-24">
        {/* Glow ambient background pulse */}
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        
        {/* External glowing ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 border-[3px] border-transparent border-t-[var(--primary)] border-r-[var(--primary)] rounded-full opacity-80"
          style={{ 
            filter: 'drop-shadow(0 0 8px var(--primary))',
          }}
        />

        {/* Internal reverse rotating ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 1.8,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-2 border border-transparent border-b-[var(--primary)] border-l-[var(--primary)] rounded-full opacity-40"
        />
        
        {/* Center Sport-Specific Animated Icon */}
        <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center">
          {isFutbol ? (
            /* Futuristic glowing soccer ball */
            <motion.svg 
              animate={{ 
                rotate: 360,
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-10 h-10 text-[var(--primary)]"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <polygon points="12,9 14.5,10.5 14.5,13.5 12,15 9.5,13.5 9.5,10.5" />
            </motion.svg>
          ) : (
            /* Premium glowing bouncing/spinning Padel ball */
            <motion.div
              animate={{
                y: [-6, 6, -6],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-8 h-8 rounded-full flex items-center justify-center"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 0.9, 1.1, 1],
                  rotate: 360
                }}
                transition={{ 
                  scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
                className="w-7 h-7 rounded-full bg-[var(--primary)] relative flex items-center justify-center overflow-hidden"
                style={{ 
                  boxShadow: '0 0 15px var(--primary), inset 0 0 8px rgba(0,0,0,0.4)',
                }}
              >
                {/* Padel ball curves */}
                <svg className="absolute w-full h-full text-black/20" viewBox="0 0 100 100">
                  <path d="M 0,50 A 50,50 0 0,0 100,50" fill="none" stroke="currentColor" strokeWidth="8" />
                  <path d="M 0,50 A 50,50 0 0,1 100,50" fill="none" stroke="currentColor" strokeWidth="8" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        {/* Animated text fade */}
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center justify-center gap-1"
        >
          <span>CARGANDO</span>
          <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="text-[var(--primary)]"
          >.</motion.span>
          <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="text-[var(--primary)]"
          >.</motion.span>
          <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="text-[var(--primary)]"
          >.</motion.span>
        </motion.p>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">
          {isFutbol ? "Complejo F5 Peñarol" : "Peñarol Pádel"} v2.0
        </p>
      </div>
    </div>
  );
}
