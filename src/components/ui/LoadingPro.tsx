'use client';

import { motion } from 'framer-motion';
import { useSport } from '@/hooks/useSport';
import { Trophy, Activity } from 'lucide-react';

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
            /* Premium glowing pulsing official soccer-representing icon */
            <motion.div
              animate={{
                scale: [0.9, 1.1, 0.9],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-[var(--primary)] filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
            >
              <Activity size={32} strokeWidth={2} />
            </motion.div>
          ) : (
            /* Premium glowing pulsing official padel-representing icon */
            <motion.div
              animate={{
                scale: [0.9, 1.1, 0.9],
                y: [-2, 2, -2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-[var(--primary)] filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
            >
              <Trophy size={32} strokeWidth={2} />
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
