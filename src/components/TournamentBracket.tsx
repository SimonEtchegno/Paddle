import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { BracketNode, TournamentConfig } from '@/types/tournament';

interface TournamentBracketProps {
  bracket: BracketNode[];
  config: TournamentConfig;
  highlightName?: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ bracket, config, highlightName }) => {
  if (!bracket || bracket.length === 0) return (
    <div className="text-center py-20 glass rounded-[3rem] border border-white/5 opacity-40 font-black uppercase tracking-[0.3em] text-[10px]">
      El cuadro eliminatorio se generará al finalizar las zonas
    </div>
  );

  const stages = config.bracketSize === 'eighth' 
    ? ['Octavos', 'Cuartos', 'Semifinal', 'Final'] 
    : config.bracketSize === 'quarter' 
      ? ['Cuartos', 'Semifinal', 'Final'] 
      : ['Semifinal', 'Final'];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-20 pt-10">
      <div className="flex gap-24 min-w-max px-10 items-center justify-center">
        {stages.map((stage) => (
          <div key={stage} className="space-y-12 flex flex-col justify-around py-10 relative">
            <div className="text-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
                {stage}
              </span>
            </div>
            
            <div className="space-y-16">
              {bracket.filter(n => n.stage === stage).map((node) => {
                const results = parsePublicScore(node.score);
                const winner = results ? (results.p1S > results.p2S ? 1 : results.p2S > results.p1S ? 2 : 0) : 0;
                const isFinal = node.stage === 'Final';
                const isHighlighted = highlightName && (
                  node.p1?.toLowerCase().includes(highlightName.toLowerCase()) || 
                  node.p2?.toLowerCase().includes(highlightName.toLowerCase())
                );

                return (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={clsx(
                      "w-[260px] glass border rounded-[2rem] overflow-hidden transition-all duration-500 shadow-xl relative z-10",
                      winner !== 0 ? "border-primary/30" : "border-white/5",
                      isFinal && winner !== 0 && "ring-4 ring-primary/20 shadow-[0_0_40px_rgba(136,130,220,0.3)]",
                      isHighlighted && "border-primary/60 ring-2 ring-primary/20 shadow-[0_0_30px_rgba(136,130,220,0.1)]"
                    )}
                  >
                    {isHighlighted && !isFinal && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl z-20">
                        Tu Partido
                      </div>
                    )}
                    
                    {/* Player 1 */}
                    <div className={clsx(
                      "p-4 flex justify-between items-center transition-all duration-500",
                      winner === 1 ? "bg-primary text-black" : "bg-transparent"
                    )}>
                      <span className={clsx(
                        "text-[11px] font-black uppercase italic truncate pr-2",
                        highlightName && node.p1?.toLowerCase().includes(highlightName.toLowerCase()) && winner !== 1 && "text-primary"
                      )}>
                        {node.p1}
                      </span>
                      <div className="flex gap-1">
                        {results?.sets.map((s, i) => (
                          <span key={i} className={clsx(
                            "w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black",
                            winner === 1 ? "bg-black/20" : "bg-white/5 opacity-40"
                          )}>
                            {s.g1 ?? 0}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/5 mx-4" />

                    {/* Player 2 */}
                    <div className={clsx(
                      "p-4 flex justify-between items-center transition-all duration-500",
                      winner === 2 ? "bg-primary text-black" : "bg-transparent"
                    )}>
                      <span className={clsx(
                        "text-[11px] font-black uppercase italic truncate pr-2",
                        highlightName && node.p2?.toLowerCase().includes(highlightName.toLowerCase()) && winner !== 2 && "text-primary"
                      )}>
                        {node.p2}
                      </span>
                      <div className="flex gap-1">
                        {results?.sets.map((s, i) => (
                          <span key={i} className={clsx(
                            "w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black",
                            winner === 2 ? "bg-black/20" : "bg-white/5 opacity-40"
                          )}>
                            {s.g2 ?? 0}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {isFinal && winner !== 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
                        CAMPEÓN
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function parsePublicScore(scoreStr: string) {
  if (!scoreStr) return null;
  try {
    const setsStrings = scoreStr.split(/[\s,]+/).filter(s => s.includes('-'));
    const sets = setsStrings.map(s => {
      const [g1, g2] = s.split('-').map(Number);
      return { g1, g2 };
    });
    let p1S = 0, p2S = 0;
    sets.forEach(s => {
      if (isNaN(s.g1) || isNaN(s.g2)) return;
      if (s.g1 > s.g2) p1S++; else if (s.g2 > s.g1) p2S++;
    });
    return { p1S, p2S, sets };
  } catch { return null; }
}
