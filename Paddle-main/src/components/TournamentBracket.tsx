import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { BracketNode, TournamentConfig } from '@/types/tournament';

interface TournamentBracketProps {
  bracket: BracketNode[];
  config: TournamentConfig;
  highlightName?: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ bracket, config, highlightName }) => {
  const [selectedMatch, setSelectedMatch] = React.useState<BracketNode | null>(null);

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
    <div className="w-full overflow-x-auto custom-scrollbar pb-32 pt-10 px-4">
      <div className="flex gap-16 md:gap-32 min-w-max px-10 items-center justify-center relative">
        {stages.map((stage, sIdx) => {
          const nodeHeight = 190; 
          const baseGap = 40; 
          const currentGap = (nodeHeight + baseGap) * Math.pow(2, sIdx) - nodeHeight;
          const stageMatches = bracket.filter(n => n.stage === stage);

          return (
            <div key={stage} className="flex flex-col py-10 relative" style={{ width: '380px' }}>
              <div className="text-center mb-10 relative h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                <span className="text-sm md:text-lg font-black uppercase italic tracking-[0.3em] text-primary bg-primary/10 px-8 py-3 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(136,130,220,0.15)]">
                  {stage}
                </span>
              </div>
              
              <div className="relative">
                {!isFinalStage(stage, stages) && (
                  <svg className="absolute top-0 -right-16 md:-right-32 w-16 md:w-32 h-full overflow-visible pointer-events-none z-0" style={{ minHeight: '100%' }}>
                    {stageMatches.map((_, nIdx) => {
                      if (nIdx % 2 !== 0) return null;
                      const topY = nIdx * (nodeHeight + currentGap) + (nodeHeight / 2);
                      const bottomY = (nIdx + 1) * (nodeHeight + currentGap) + (nodeHeight / 2);
                      const midY = (topY + bottomY) / 2;
                      return (
                        <g key={nIdx}>
                          <path 
                            d={`M 0 ${topY} L 50 ${topY} L 50 ${bottomY} L 0 ${bottomY} M 50 ${midY} L 100 ${midY}`}
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-primary/40"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}

                <div className="flex flex-col items-center" style={{ gap: `${currentGap}px` }}>
                  {stageMatches.map((node, nIdx) => {
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
                        onClick={() => setSelectedMatch(node)}
                        className={clsx(
                          "w-[420px] relative z-10 group/node flex flex-col justify-center cursor-pointer hover:z-20",
                          isFinal && winner !== 0 && "scale-105"
                        )}
                        style={{ height: `${nodeHeight}px` }}
                      >
                        {stage !== stages[0] && (
                          <div className="absolute top-1/2 -left-4 w-4 h-[2px] bg-primary/30 pointer-events-none" />
                        )}

                        {isHighlighted && !isFinal && (
                          <div className="absolute -top-3 left-6 bg-primary text-black px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(136,130,220,0.4)] z-30">
                            Tu Partido
                          </div>
                        )}

                        <div className={clsx(
                          "glass border rounded-[1.5rem] overflow-hidden transition-all duration-500 shadow-2xl relative",
                          winner !== 0 ? "border-primary/40 bg-primary/[0.03]" : "border-white/10 bg-white/[0.02]",
                          isFinal && winner !== 0 && "ring-2 ring-yellow-400/40 shadow-[0_0_50px_rgba(250,204,21,0.2)] border-yellow-400/50",
                          isHighlighted && "ring-1 ring-primary/40 shadow-[0_0_30px_rgba(136,130,220,0.1)]"
                        )}>
                          <div className="px-5 pt-3 pb-2 flex items-center justify-between opacity-50 text-[9px] font-bold uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.03]">
                            <div className="flex items-center gap-2">
                              <Trophy size={10} className="text-primary/40" />
                              <span>M{nIdx + 1}</span>
                            </div>
                            {(node.time || node.date) && (
                              <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                                <Clock size={8} className="text-primary" />
                                <span className="text-white/80">{node.date && <span>{node.date} • </span>}{node.time}</span>
                                {node.court && <span className="ml-1 text-primary italic">C{node.court}</span>}
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-3">
                            <div className={clsx(
                            "flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all",
                            winner === 1 ? "bg-primary text-black" : "bg-white/5 hover:bg-white/10"
                          )}>
                            <div className="flex-1 min-w-0">
                              <span className={clsx(
                                "text-[12px] md:text-[14px] font-bold uppercase leading-tight block whitespace-normal break-words",
                                highlightName && node.p1?.toLowerCase().includes(highlightName.toLowerCase()) && winner !== 1 ? "text-primary" : ""
                              )}>
                                {node.p1 || <span className="opacity-20">Por definir</span>}
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              {results?.sets.map((s, i) => (
                                <div key={i} className={clsx(
                                  "w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold border",
                                  winner === 1 ? "bg-black/20 border-black/10" : "bg-white/5 border-white/5 opacity-40"
                                )}>
                                  {s.g1 ?? 0}
                                </div>
                              ))}
                            </div>
                          </div>

                            <div className={clsx(
                            "flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all",
                            winner === 2 ? "bg-primary text-black" : "bg-transparent hover:bg-white/10"
                          )}>
                            <div className="flex-1 min-w-0">
                              <span className={clsx(
                                "text-[12px] md:text-[14px] font-bold uppercase leading-tight block whitespace-normal break-words",
                                highlightName && node.p2?.toLowerCase().includes(highlightName.toLowerCase()) && winner !== 2 ? "text-primary" : ""
                              )}>
                                {node.p2 || <span className="opacity-20">Por definir</span>}
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              {results?.sets.map((s, i) => (
                                <div key={i} className={clsx(
                                  "w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold border",
                                  winner === 2 ? "bg-black/20 border-black/10" : "bg-white/5 border-white/5 opacity-40"
                                )}>
                                  {s.g2 ?? 0}
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>

                        {isFinal && winner !== 0 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(250,204,21,0.5)] z-30">
                            CAMPEÓN
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      {/* Match Details Overlay */}
      {selectedMatch && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedMatch(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg glass border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-2 italic">Detalle del Partido</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  {selectedMatch.stage} • {selectedMatch.time} {selectedMatch.court && `• Cancha ${selectedMatch.court}`}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 transition-all border border-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {[
                { name: selectedMatch.p1, score: parsePublicScore(selectedMatch.score)?.p1S, sets: parsePublicScore(selectedMatch.score)?.sets.map(s => s.g1) },
                { name: selectedMatch.p2, score: parsePublicScore(selectedMatch.score)?.p2S, sets: parsePublicScore(selectedMatch.score)?.sets.map(s => s.g2) }
              ].map((p, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-6 border border-white/5 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={40} className={p.score && p.score > (i === 0 ? parsePublicScore(selectedMatch.score)?.p2S || 0 : parsePublicScore(selectedMatch.score)?.p1S || 0) ? "text-primary" : "text-white"} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-white font-black text-xl md:text-2xl uppercase italic block leading-tight mb-4">
                      {p.name || "Por definir"}
                    </span>
                    <div className="flex gap-2">
                      {p.sets?.map((s, si) => (
                        <div key={si} className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-primary font-black text-lg">
                          {s ?? 0}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedMatch(null)}
              className="w-full mt-8 py-4 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(136,130,220,0.3)] hover:scale-[1.02] transition-all"
            >
              Cerrar Detalle
            </button>
          </motion.div>
        </div>
      )}
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

function isFinalStage(stage: string, stages: string[]) {
  return stage === stages[stages.length - 1];
}
