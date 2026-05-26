'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Layout, Crown, Play, ChevronRight
} from 'lucide-react';

interface TorneoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── STEP 1: Tournament card appears and gets clicked ─── */
function TournamentListGraphic() {
  const [phase, setPhase] = useState(0);
  // 0=idle, 1=hover, 2=clicked
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-[240px] space-y-2 relative z-10">
      {/* Dimmed card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3 opacity-30">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          <Trophy size={14} />
        </div>
        <div className="flex-1">
          <p className="text-[8px] font-black text-white/50 uppercase">Torneo Amateur B</p>
          <p className="text-[6.5px] text-white/30 font-bold uppercase">Jun 2026 • $8.000</p>
        </div>
      </div>

      {/* Active card — highlighted on hover, ripple on click */}
      <motion.div
        animate={
          phase === 2 ? { scale: 0.97 } :
          phase === 1 ? { scale: 1.02, borderColor: 'rgba(136,130,220,0.5)' } :
          { scale: 1 }
        }
        transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
        className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden cursor-pointer"
      >
        {/* Shimmer on hover */}
        {phase >= 1 && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none"
          />
        )}

        <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <Trophy size={14} />
        </div>
        <div className="flex-1">
          <p className="text-[8px] font-black text-white uppercase">Open Peñarol 2026</p>
          <p className="text-[6.5px] text-primary font-black uppercase tracking-wider">Jul 2026 • $12.000</p>
        </div>
        <motion.div
          animate={phase >= 1 ? { x: [0, 3, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-primary/60"
        >
          <ChevronRight size={14} />
        </motion.div>

        {/* Click ripple */}
        {phase === 2 && (
          <motion.span
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary pointer-events-none"
          />
        )}
      </motion.div>

      {/* Dimmed card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3 opacity-20">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          <Trophy size={14} />
        </div>
        <div className="flex-1">
          <p className="text-[8px] font-black text-white/50 uppercase">Torneo Pro Series</p>
          <p className="text-[6.5px] text-white/30 font-bold uppercase">Ago 2026 • $20.000</p>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 2: Zones & fixture animate in ─── */
function ZonesGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const pairs = ['García / López', 'Martínez / Díaz', 'Ruiz / Pérez', 'Costa / Vega'];
  const scores = [['6-4', '6-3'], ['6-7', '7-5', '10-8']];

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md overflow-hidden">
      {/* Zone header */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase text-primary tracking-wider">Zona A</span>
        <Layout size={10} className="text-white/30" />
      </div>

      {/* Pairs stagger in */}
      <div className="space-y-1.5">
        {pairs.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, x: -10 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.12, type: 'spring', bounce: 0.2 }}
            className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-[7.5px] font-bold ${
              i === 0 ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-white/[0.03] text-white/50'
            }`}
          >
            <span>{p}</span>
            {i === 0 && <span className="font-black text-primary">1°</span>}
          </motion.div>
        ))}
      </div>

      {/* Recent match result slides in */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="border-t border-white/5 pt-2.5 space-y-1"
          >
            <p className="text-[6.5px] font-black uppercase text-white/30 tracking-wider">Último Partido</p>
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-white/70">García / López</span>
              <div className="flex gap-1">
                {scores[0].map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-primary/15 text-primary text-[6.5px] font-black rounded">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-white/40">Martínez / Díaz</span>
              <div className="flex gap-1">
                {['3-6', '4-6'].map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-white/5 text-white/30 text-[6.5px] font-black rounded">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STEP 3: Bracket resolves → champion revealed ─── */
function BracketGraphic() {
  const [phase, setPhase] = useState(0);
  // 0=bracket shown, 1=final highlighted, 2=champion overlay
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl text-left relative z-10 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[8px] font-black uppercase text-white/50 tracking-wider">Cuadro Final</span>
        <Trophy size={10} className="text-primary/50" />
      </div>

      {/* Simplified bracket */}
      <div className="space-y-2">
        {/* Semis */}
        <div className="flex gap-2 items-stretch">
          <div className="flex-1 space-y-1">
            {['García / López', 'Costa / Vega'].map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`py-1 px-2 rounded text-[7px] font-bold border ${
                  i === 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/[0.03] border-white/5 text-white/40'
                }`}
              >
                {p}
              </motion.div>
            ))}
            <p className="text-[5.5px] text-white/20 font-bold uppercase text-center">Semifinal 1</p>
          </div>
          <div className="w-px bg-white/10 self-stretch" />
          <div className="flex-1 space-y-1">
            {['Ruiz / Pérez', 'Martínez / Díaz'].map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="py-1 px-2 rounded text-[7px] font-bold border bg-white/[0.03] border-white/5 text-white/40"
              >
                {p}
              </motion.div>
            ))}
            <p className="text-[5.5px] text-white/20 font-bold uppercase text-center">Semifinal 2</p>
          </div>
        </div>

        {/* Final */}
        <motion.div
          animate={phase >= 1 ? { borderColor: 'rgba(136,130,220,0.4)', backgroundColor: 'rgba(136,130,220,0.08)' } : {}}
          transition={{ duration: 0.4 }}
          className="border border-white/10 rounded-xl p-2 text-center"
        >
          <p className="text-[6px] font-black uppercase text-white/30 tracking-wider mb-1">Final</p>
          <p className="text-[8px] font-black text-white/60">García / López vs Ruiz / Pérez</p>
        </motion.div>
      </div>

      {/* Champion overlay */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
            className="absolute inset-0 bg-[#07080a]/95 flex flex-col items-center justify-center text-center p-4 rounded-2xl z-20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.12 }}
              className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-2 text-primary"
            >
              <Crown size={22} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="text-[8px] font-black text-primary/80 uppercase tracking-widest"
            >
              🏆 Campeones
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="text-[11px] font-black text-white uppercase tracking-wide mt-0.5 italic"
            >
              García / López
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[6.5px] text-white/30 uppercase tracking-widest mt-1 font-bold"
            >
              6-4 / 7-5
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Modal ─── */
export function TorneoTutorial({ isOpen, onClose }: TorneoTutorialProps) {
  const [step, setStep] = useState(0);
  const DURATION = 7000;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const steps = [
    {
      title: 'Explorá los Torneos',
      desc: 'Encontrá todos los torneos del complejo. Hacé clic en cualquier torneo para ver su información, fixture y resultados.',
      icon: Trophy,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      graphic: <TournamentListGraphic />,
    },
    {
      title: 'Zonas y Fixture',
      desc: 'Dentro de cada torneo vas a encontrar las zonas con los resultados de cada partido y la tabla de posiciones en tiempo real.',
      icon: Layout,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      graphic: <ZonesGraphic />,
    },
    {
      title: 'Cuadro Final y Campeones',
      desc: 'Una vez finalizada la fase de zonas, se arma el cuadro eliminatorio. Al terminar el torneo se publican los campeones oficiales.',
      icon: Crown,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      graphic: <BracketGraphic />,
    },
  ];

  useEffect(() => {
    if (!isOpen) { setStep(0); return; }
    const t = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, DURATION);
    return () => clearInterval(t);
  }, [isOpen, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <div className="relative">
            {step < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 w-11 h-11 rounded-full bg-[#11131a]/85 hover:bg-[#11131a] text-white/50 hover:text-white border border-white/10 items-center justify-center transition-all z-[320] shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#11131a] to-[#07080a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Ambient glow */}
              <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full blur-[80px] opacity-10 pointer-events-none bg-primary" />

              {/* Progress bars */}
              <div className="absolute top-5 left-6 right-14 flex gap-1.5 z-50">
                {steps.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: i < step ? '100%' : '0%' }}
                      animate={{ width: i < step ? '100%' : i === step ? '100%' : '0%' }}
                      transition={{ duration: i === step ? DURATION / 1000 : 0.2, ease: 'linear' }}
                    />
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="absolute top-2.5 right-2.5 p-3 text-white/40 hover:text-white rounded-full transition-all z-50 hover:bg-white/5">
                <X size={18} />
              </button>

              <div className="p-8 pt-16 flex flex-col items-center flex-1 relative overflow-hidden">
                {/* Mobile tap zone */}
                <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-[70%] z-30 cursor-e-resize md:hidden" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
                    className="w-full flex flex-col items-center text-center space-y-8 h-[420px]"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.55, delay: 0.08, duration: 0.5 }}
                      className={`w-18 h-18 rounded-[1.8rem] border ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.8rem]" />
                      {(() => { const Icon = steps[step].icon; return <Icon size={32} className="relative z-10" />; })()}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.18, duration: 0.5 }}
                      className="w-full flex items-center justify-center"
                    >
                      {steps[step].graphic}
                    </motion.div>

                    <div className="space-y-3 mt-auto">
                      <motion.h3
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', bounce: 0.1, delay: 0.28 }}
                        className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white leading-none"
                      >
                        {steps[step].title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', bounce: 0.1, delay: 0.38 }}
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40 leading-relaxed px-3"
                      >
                        {steps[step].desc}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div
                key={`btn-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35, ease: 'easeOut' }}
                className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center relative z-40"
              >
                <AnimatePresence mode="wait">
                  {step < steps.length - 1 ? (
                    <motion.button
                      key="continuar"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10 cursor-pointer"
                    >
                      Continuar
                    </motion.button>
                  ) : (
                    <motion.button
                      key="entendido"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onClose}
                      className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors cursor-pointer bg-primary text-white shadow-[0_0_30px_rgba(136,130,220,0.35)] hover:opacity-95"
                    >
                      ¡Entendido! <Play size={14} fill="currentColor" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
