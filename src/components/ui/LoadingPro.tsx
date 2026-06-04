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
            /* Premium swinging Padel racket hitting a bouncing ball in perfect sync */
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Padel Racket SVG */}
              <motion.svg 
                animate={{ 
                  rotate: [-20, 20, -20],
                  y: [2, -2, 2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                viewBox="0 0 100 100" 
                className="w-14 h-14 text-[var(--primary)] drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                {/* Racket head (round/oval) */}
                <path d="M 50,15 C 30,15 28,40 35,55 C 40,65 45,67 50,67 C 55,67 60,65 65,55 C 72,40 70,15 50,15 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                
                {/* Bridge triangle */}
                <path d="M 45,67 L 50,60 L 55,67 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                
                {/* Handle / Grip */}
                <rect x="47.5" y="67" width="5" height="20" rx="1" fill="currentColor" />
                <path d="M 46,87 L 54,87 C 54,90 46,90 46,87 Z" fill="currentColor" />
                
                {/* Holes in the racket head (Padel specific!) */}
                <circle cx="43" cy="30" r="1.5" fill="currentColor" />
                <circle cx="50" cy="27" r="1.5" fill="currentColor" />
                <circle cx="57" cy="30" r="1.5" fill="currentColor" />
                
                <circle cx="40" cy="38" r="1.5" fill="currentColor" />
                <circle cx="47" cy="36" r="1.5" fill="currentColor" />
                <circle cx="53" cy="36" r="1.5" fill="currentColor" />
                <circle cx="60" cy="38" r="1.5" fill="currentColor" />
                
                <circle cx="43" cy="46" r="1.5" fill="currentColor" />
                <circle cx="50" cy="44" r="1.5" fill="currentColor" />
                <circle cx="57" cy="46" r="1.5" fill="currentColor" />
              </motion.svg>
              
              {/* Bouncing Padel Ball with sync trajectory */}
              <motion.div 
                animate={{ 
                  y: [-25, -2, -25],
                  x: [-12, 12, -12],
                  scale: [1, 0.85, 1]
                }}
                transition={{ 
                  duration: 1, // hits twice per racket swing cycle
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-3.5 h-3.5 rounded-full bg-[var(--primary)]"
                style={{ 
                  boxShadow: '0 0 12px var(--primary), inset 0 0 5px rgba(0,0,0,0.5)',
                  top: '30%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
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
