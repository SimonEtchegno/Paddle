import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { Zone, Pair, Match } from '@/types/tournament';
import { getPairScore } from '@/lib/rankingData';

interface TournamentZonesProps {
  zones: Zone[];
  allPairs: Pair[];
  highlightName?: string;
}

export const TournamentZones: React.FC<TournamentZonesProps> = ({ zones, allPairs, highlightName }) => {
  if (!zones || zones.length === 0) return (
    <div className="text-center py-10 opacity-40 font-bold uppercase tracking-widest text-xs">
      Las zonas aún no han sido generadas
    </div>
  );

  const isUserMatch = (m: Match) => {
    if (!highlightName) return false;
    const p1 = allPairs.find(p => p.id === m.p1)?.name || '';
    const p2 = allPairs.find(p => p.id === m.p2)?.name || '';
    return p1.toLowerCase().includes(highlightName.toLowerCase()) || 
           p2.toLowerCase().includes(highlightName.toLowerCase());
  };

  return (
    <div className="space-y-12 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {zones.map((zone, idx) => {
          // Calcular posiciones locales para la vista pública
          const standings = calculatePublicStandings(zone, allPairs);
          
          return (
            <motion.div 
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-5 md:p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-primary">
                    {zone.name}
                  </h3>
                  <Trophy className="text-primary/20" size={24} />
                </div>

                {/* Standings Table */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 font-sans">Posiciones</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-white/10 opacity-30 uppercase font-black">
                          <th className="pb-3">Pareja</th>
                          <th className="pb-3 text-center">PTS</th>
                          <th className="pb-3 text-center">SET</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold">
                        {standings.map((s, sIdx) => {
                          const isUser = highlightName && s.name.toLowerCase().includes(highlightName.toLowerCase());
                          return (
                            <tr key={sIdx} className={clsx(
                              "border-b border-white/5 last:border-0 transition-colors",
                              isUser && "bg-primary/10 text-primary"
                            )}>
                               <td className="py-2.5 italic uppercase flex items-center gap-2">
                                <div className="w-5 h-5 flex items-center justify-center rounded-full text-[7px] bg-white/5 border border-white/10 italic text-white/40">
                                  {sIdx + 1}
                                </div>
                                <div className="flex items-center gap-2 truncate text-[11px] md:text-xs">
                                  <span>{s.name}</span>
                                  {(() => {
                                    const p = allPairs.find(pair => pair.name === s.name);
                                    return p && getPairScore(p) > 0 ? (
                                      <span title={`Puntos: ${getPairScore(p)}`} className="flex items-center">
                                        <Crown size={9} className="text-yellow-400 shrink-0" />
                                      </span>
                                    ) : null;
                                  })()}
                                </div>
                              </td>
                              <td className="py-2.5 text-center text-[10px]">{s.pts || 0}</td>
                              <td className="py-2.5 text-center opacity-40 text-[10px]">{((s.sf || 0) - (s.sc || 0)) || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Matches */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 font-sans">Resultados / Fixture</p>
                  <div className="grid gap-3">
                    {zone.matches.map((m, mIdx) => {
                      const p1 = allPairs.find(p => p.id === m.p1);
                      const p2 = allPairs.find(p => p.id === m.p2);
                      const highlighted = isUserMatch(m);
                      
                      return (
                        <div key={m.id} className={clsx(
                          "p-3 rounded-xl border transition-all flex flex-col gap-2 relative",
                          highlighted 
                            ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(136,130,220,0.15)]" 
                            : "bg-white/5 border-white/5"
                        )}>
                          {highlighted && (
                            <div className="absolute -top-2 -right-2 bg-primary text-black text-[6px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg z-20 animate-bounce">
                              Tu Partido
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                            <div className="flex items-center gap-2">
                              <span className={clsx(highlighted && "text-primary opacity-100")}>P{mIdx + 1}</span>
                              {(m.time || m.date) && (
                                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-[7px]">
                                  <Clock size={7} /> {m.date && <span>{m.date} • </span>}{m.time}
                                  {m.court && <span className="ml-1 text-primary">C{m.court}</span>}
                                </span>
                              )}
                            </div>
                            {m.status === 'finished' ? (
                              <span className="text-primary">Final</span>
                            ) : (
                              <span>Pend.</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className={clsx(
                                  "text-[11px] md:text-sm font-black uppercase italic tracking-tight truncate",
                                  highlightName && p1?.name.toLowerCase().includes(highlightName.toLowerCase()) ? "text-primary" : "text-white/90"
                                )}>
                                  {p1?.name || '??'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={clsx(
                                  "text-[11px] md:text-sm font-black uppercase italic tracking-tight truncate",
                                  highlightName && p2?.name.toLowerCase().includes(highlightName.toLowerCase()) ? "text-primary" : "text-white/90"
                                )}>
                                  {p2?.name || '??'}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-black/40 px-3 py-2 rounded-xl border border-white/10 min-w-[85px] shadow-inner">
                              <span className="text-xs md:text-sm font-black text-primary tracking-tighter whitespace-nowrap">
                                {m.score || 'VS'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Reutilizamos la lógica de cálculo para la vista pública
function calculatePublicStandings(zone: Zone, allPairs: Pair[]) {
  const standingsMap: Record<string, { pts: number, sf: number, sc: number }> = {};
  
  if (!zone.pairs || !Array.isArray(zone.pairs)) return [];
  
  zone.pairs.forEach(pId => { standingsMap[pId] = { pts: 0, sf: 0, sc: 0 }; });

  if (zone.matches && Array.isArray(zone.matches)) {
    zone.matches.forEach(m => {
      if (m.status === 'finished' && m.score) {
        const sets = (m.score || '').split(' ').map(s => {
          const [g1, g2] = s.split('-').map(Number);
          return { g1, g2 };
        });
        let p1S = 0, p2S = 0;
        sets.forEach(s => {
          if (isNaN(s.g1) || isNaN(s.g2)) return;
          if (s.g1 > s.g2) p1S++; else if (s.g2 > s.g1) p2S++;
        });
        if (standingsMap[m.p1]) {
          standingsMap[m.p1].sf += p1S; standingsMap[m.p1].sc += p2S;
          if (p1S > p2S) standingsMap[m.p1].pts += 3;
        }
        if (standingsMap[m.p2]) {
          standingsMap[m.p2].sf += p2S; standingsMap[m.p2].sc += p1S;
          if (p2S > p1S) standingsMap[m.p2].pts += 3;
        }
      }
    });
  }

  return Object.entries(standingsMap)
    .map(([id, stats]) => ({
      name: allPairs.find(p => p.id === id)?.name || '??',
      ...stats
    }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      return (b.sf - b.sc) - (a.sf - a.sc);
    });
}
