'use client';

import { HORAS, TURNOS_FIJOS } from '@/lib/constants';
import { Reserva } from '@/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useGuestProfile } from '@/hooks/useGuestProfile';

interface BookingGridProps {
  reservas: Reserva[];
  onSelectSlot: (hora: string, cancha: number) => void;
  selectedDate: string;
}

export function BookingGrid({ reservas, onSelectSlot, selectedDate }: BookingGridProps) {
  const date = new Date(selectedDate + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const fixedTurns = TURNOS_FIJOS[dayOfWeek] || {};
  const { profile } = useGuestProfile();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Grid Headers */}
      <div className="grid grid-cols-[70px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr] gap-2 sm:gap-4 px-1 sm:px-4 text-center">
        <div />
        <div className="glass py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center justify-center">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40">Cancha 1</span>
        </div>
        <div className="glass py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center justify-center">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40">Cancha 2</span>
        </div>
      </div>

      {/* Grid Body */}
      <div className="space-y-3">
        {HORAS.map((hora) => (
          <div key={hora} className="grid grid-cols-[70px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr] gap-2 sm:gap-4 items-stretch">
            {/* Time Column */}
            <div className="flex items-center justify-center glass rounded-xl sm:rounded-2xl border border-white/5 font-mono text-sm sm:text-lg font-black text-white/40 py-2">
              {hora}
            </div>
            
            {[1, 2].map((cancha) => {
              // Normalizar hora para la comparación (por si viene con segundos de la DB)
              const reserva = reservas.find(r => {
                const h1 = r.hora.split(':').slice(0, 2).join(':'); // '14:30:00' -> '14:30'
                const h2 = hora.split(':').slice(0, 2).join(':');   // '14:30' -> '14:30'
                return h1 === h2 && r.cancha === cancha;
              });
              const fijo = fixedTurns[hora]?.[cancha];
              const isMine = reserva && profile && reserva.telefono === profile.telefono;
              const ocupado = !!reserva || !!fijo;
              const nombre = reserva ? reserva.nombre : (fijo || 'Libre');

              return (
                <motion.button
                  key={cancha}
                  disabled={ocupado}
                  whileHover={!ocupado ? { y: -4, scale: 1.02, backgroundColor: 'rgba(76, 175, 80, 0.15)' } : {}}
                  whileTap={!ocupado ? { scale: 0.98 } : {}}
                  onClick={() => onSelectSlot(hora, cancha)}
                  className={clsx(
                    "relative min-h-[70px] sm:min-h-[90px] rounded-xl sm:rounded-[1.5rem] p-2 sm:p-4 flex flex-col items-center justify-center transition-all border shadow-lg group overflow-hidden",
                    ocupado 
                      ? isMine
                        ? "bg-primary/20 border-primary/50 cursor-default shadow-[0_0_20px_rgba(200,255,0,0.1)]"
                        : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed grayscale" 
                      : "bg-white/[0.05] border-white/10 hover:border-primary/60 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <div className={clsx(
                    "text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 text-center leading-tight",
                    ocupado ? isMine ? "text-primary" : "text-white/40" : "text-primary drop-shadow-[0_0_8px_rgba(136,130,220,0.4)]"
                  )}>
                    {ocupado ? (isMine ? 'Tu Reserva' : (fijo ? 'Fijo' : 'Ocupado')) : 'Disponible'}
                  </div>
                  
                  <div className={clsx(
                    "text-[10px] sm:text-xs font-bold truncate max-w-[95%] px-1 sm:px-2 mt-0.5",
                    ocupado ? isMine ? "text-white" : "text-white/10" : "text-white group-hover:text-primary transition-colors"
                  )}>
                    {ocupado ? (isMine ? 'Confirmado' : 'No disp.') : 'Libre'}
                  </div>


                  {/* Visual cue only for Available */}
                  {!ocupado && (
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(76,175,80,1)] animate-pulse" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>

  );
}
