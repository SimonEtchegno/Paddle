'use client';

import { motion } from 'framer-motion';

export function LoadingPro() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative w-20 h-20">
        {/* Círculos concéntricos animados */}
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
        />
        
        {/* Spinner principal */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 border-t-2 border-r-2 border-primary rounded-full shadow-[0_0_15px_rgba(136,130,220,0.5)]"
        />
        
        {/* Pelota de pádel miniatura rebotando */}
        <motion.div 
          animate={{ 
            y: [-10, 10, -10],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 m-auto w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(136,130,220,0.8)]"
        />
      </div>
      
      <div className="space-y-1 text-center">
        <motion.p 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-primary"
        >
          Cargando Experiencia
        </motion.p>
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30">
          Peñarol Pádel v2.0
        </p>
      </div>
    </div>
  );
}
