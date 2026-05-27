'use client';

import { useState, useEffect } from 'react';
import { HORAS } from '@/lib/constants';
import { Reserva } from '@/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { supabase } from '@/lib/supabase';

interface BookingGridProps {
  reservas: Reserva[];
  onSelectSlot: (hora: string, cancha: number) => void;
  selectedDate: string;
  sport: 'padel' | 'futbol' | null;
}

export function BookingGrid({ reservas, onSelectSlot, selectedDate, sport }: BookingGridProps) {
  const [fixedTurns, setFixedTurns] = useState<Record<string, Record<number, string>>>({});
  const date = new Date(selectedDate + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const { profile } = useGuestProfile();

  useEffect(() => {
    const fetchFixedTurns = async () => {
      try {
        const { data, error } = await supabase
          .from('turnos_fijos')
          .select('hora, cancha, nombre')
          .eq('dia_semana', dayOfWeek);
        if (error) throw error;
        
        const transformed: Record<string, Record<number, string>> = {};
        data?.forEach((item: any) => {
          // Normalize hour (e.g. '19:00:00' -> '19:00' or '19:00')
          const h = item.hora.split(':').slice(0, 2).join(':');
          if (!transformed[h]) {
            transformed[h] = {};
          }
          transformed[h][item.cancha] = item.nombre;
        });
        setFixedTurns(transformed);
      } catch (err) {
        console.error('Error fetching fixed turns:', err);
      }
    };

    fetchFixedTurns();

    // Set up realtime channel to update fixed turns on changes instantly
    const channel = supabase
      .channel('turnos_fijos_booking_grid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos_fijos' }, () => {
        fetchFixedTurns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dayOfWeek]);

  const canchas = sport === 'futbol' ? [10] : [1, 2];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Grid Headers */}
      <div className={clsx(
        "grid gap-2 sm:gap-4 px-1 sm:px-4 text-center",
        sport === 'futbol' ? "grid-cols-[70px_1fr] sm:grid-cols-[100px_1fr]" : "grid-cols-[70px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr]"
      )}>
        <div />
        {canchas.map(c => (
          <div key={c} className="glass py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center justify-center">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40">
              {sport === 'futbol' ? 'Cancha F5' : `Cancha Pádel ${c}`}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="space-y-3">
        {HORAS.map((hora) => (
          <div key={hora} className={clsx(
            "grid gap-2 sm:gap-4 items-stretch",
            sport === 'futbol' ? "grid-cols-[70px_1fr] sm:grid-cols-[100px_1fr]" : "grid-cols-[70px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr]"
          )}>
            {/* Time Column */}
            <div className="flex items-center justify-center bg-white/[0.08] rounded-xl sm:rounded-2xl border border-white/20 font-mono text-sm sm:text-xl font-bold text-white shadow-inner py-2 backdrop-blur-md">
              {hora}
            </div>
            
            {canchas.map((cancha) => {
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
                    "text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 text-center leading-tight flex items-center gap-1",
                    ocupado ? isMine ? "text-primary" : "text-white/40" : "text-primary drop-shadow-[0_0_8px_rgba(136,130,220,0.4)]"
                  )}>
                    {fijo && !isMine && <Lock size={10} className="inline-block opacity-50" />}
                    {ocupado ? (isMine ? 'Tu Reserva' : (fijo ? 'Turno Fijo' : 'Ocupado')) : 'Disponible'}
                  </div>
                  
                  <div className={clsx(
                    "text-[10px] sm:text-xs font-bold truncate max-w-[95%] px-1 sm:px-2 mt-0.5",
                    ocupado ? isMine ? "text-white" : (fijo ? "text-white/30" : "text-white/10") : "text-white group-hover:text-primary transition-colors"
                  )}>
                    {ocupado ? (isMine ? 'Confirmado' : (fijo ? fijo : 'No disp.')) : 'Libre'}
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
