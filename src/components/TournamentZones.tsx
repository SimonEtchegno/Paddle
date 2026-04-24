import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface Pareja {
  nombre: string;
  puntos?: number;
}

interface Partido {
  p1: string;
  p2: string;
  horario: string;
  resultado?: string;
}

interface Zona {
  nombre: string;
  parejas: Pareja[];
  partidos: Partido[];
}

interface TournamentZonesProps {
  zonas: Zona[];
}

export const TournamentZones: React.FC<TournamentZonesProps> = ({ zonas }) => {
  if (!zonas || zonas.length === 0) return null;

  return (
    <div className="space-y-12 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {zonas.map((zona, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass-dark p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all"
          >
            {/* Background Accent */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  {zona.nombre}
                </h3>
                <Trophy className="text-primary/40" size={24} />
              </div>

              {/* Parejas Table */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-1">Integrantes</p>
                <div className="space-y-2">
                  {zona.parejas.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="font-black italic uppercase text-sm tracking-tight">{p.nombre}</span>
                      {p.puntos !== undefined && (
                        <span className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {p.puntos} PTS
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Partidos / Horarios */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-1">Cronograma de Partidos</p>
                <div className="grid gap-2">
                  {zona.partidos.map((m, mIdx) => (
                    <div key={mIdx} className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary">
                        <div className="flex items-center gap-2">
                          <Clock size={12} />
                          <span>{m.horario}</span>
                        </div>
                        {m.resultado && (
                          <span className="bg-primary/20 px-2 py-0.5 rounded text-white">{m.resultado}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate flex-1">{m.p1}</span>
                        <span className="px-3 opacity-30 italic font-black">VS</span>
                        <span className="truncate flex-1 text-right">{m.p2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
