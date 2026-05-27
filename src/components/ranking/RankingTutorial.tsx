'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Filter, TrendingUp, Play, ChevronLeft, ChevronRight, Crown, Search, Medal
} from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface RankingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── STEP 1: El Podio ─── */
function PodiumGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800); // 2nd place pops
    const t2 = setTimeout(() => setPhase(2), 1600); // 3rd place pops
    const t3 = setTimeout(() => setPhase(3), 2400); // 1st place pops
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 pt-10 border border-white/10 shadow-2xl space-y-4 text-center relative z-10 backdrop-blur-md flex flex-col items-center">
      <div className="absolute inset-0 bg-primary/5 blur-xl z-0 rounded-2xl overflow-hidden" />
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest relative z-10 -mt-6">El Salón de la Fama</p>

      <div className="flex items-end justify-center gap-2 h-32 relative z-10 w-full pt-4">
        {/* Puesto 2 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={phase >= 1 ? { height: '60%', opacity: 1 } : {}}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-16 bg-slate-400/20 border-t-2 border-slate-400/50 rounded-t-xl flex flex-col items-center justify-start pt-2 relative"
        >
          <div className="w-8 h-8 rounded-full bg-slate-400/20 flex items-center justify-center font-black text-slate-400 text-xs absolute -top-10 border border-slate-400/30">
            2
          </div>
        </motion.div>

        {/* Puesto 1 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={phase >= 3 ? { height: '100%', opacity: 1 } : {}}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 bg-primary/20 border-t-2 border-primary/50 rounded-t-xl flex flex-col items-center justify-start pt-2 relative"
        >
          <motion.div 
            animate={phase >= 3 ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-14 flex flex-col items-center gap-1"
          >
            <Crown size={20} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black text-[#050505] text-lg border border-primary/30 shadow-[0_0_15px_rgba(136,130,220,0.5)]">
              1
            </div>
          </motion.div>
        </motion.div>

        {/* Puesto 3 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={phase >= 2 ? { height: '40%', opacity: 1 } : {}}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="w-16 bg-amber-700/20 border-t-2 border-amber-700/50 rounded-t-xl flex flex-col items-center justify-start pt-2 relative"
        >
          <div className="w-8 h-8 rounded-full bg-amber-700/20 flex items-center justify-center font-black text-amber-700 text-xs absolute -top-10 border border-amber-700/30">
            3
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── STEP 2: Filtro por Nivel ─── */
function FilterGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const categories = ['7ma', '6ta', '5ta'];

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 text-left relative z-10 backdrop-blur-md overflow-hidden">
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest text-center relative z-10">Filtro de Categorías</p>

      <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl relative z-10">
        {categories.map((cat, i) => (
          <motion.div
            key={cat}
            animate={{
              backgroundColor: phase === i ? 'rgba(136,130,220,1)' : 'transparent',
              color: phase === i ? '#050505' : 'rgba(255,255,255,0.4)',
              scale: phase === i ? 1.05 : 1
            }}
            className="flex-1 py-1.5 rounded-lg text-center text-[8px] font-black uppercase tracking-widest transition-colors duration-300"
          >
            {cat}
          </motion.div>
        ))}
      </div>

      <div className="space-y-2 mt-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {[1, 2, 3].map((pos) => (
              <div key={pos} className="bg-white/5 rounded-lg p-2 flex items-center gap-3 border border-white/5">
                <span className="text-[10px] font-black text-white/20 w-4">#{pos}</span>
                <div className="w-4 h-4 rounded bg-white/10" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                  <div className="h-1 w-10 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── STEP 3: Progreso y Puntos ─── */
function PointsGraphic() {
  const [phase, setPhase] = useState(0);
  const [pts, setPts] = useState(150);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let countInterval: NodeJS.Timeout;
    
    const runAnimation = () => {
      setPhase(0);
      setPts(150);
      t1 = setTimeout(() => {
        setPhase(1);
        let currentPts = 150;
        countInterval = setInterval(() => {
          currentPts += 15;
          if (currentPts >= 600) {
            clearInterval(countInterval);
            setPts(600);
            setPhase(2);
          } else {
            setPts(currentPts);
          }
        }, 30);
      }, 1000);
    };

    runAnimation();
    const loopInterval = setInterval(runAnimation, 4500);

    return () => { 
      clearTimeout(t1); 
      clearInterval(countInterval); 
      clearInterval(loopInterval); 
    };
  }, []);

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-8 text-center relative z-10 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-emerald-500/5 blur-xl z-0" />
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest relative z-10 -mt-2">Puntos de Ranking</p>

      {/* Circle with points */}
      <div className="relative flex items-center justify-center">
        {/* Glow behind */}
        <motion.div 
          animate={phase >= 2 ? { scale: 1.8, opacity: 0 } : { scale: 1, opacity: 0.5 }}
          transition={phase >= 2 ? { duration: 0.6, ease: "easeOut" } : { duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-full blur-xl ${phase >= 2 ? 'bg-yellow-400/60' : 'bg-emerald-500/20'}`}
        />
        
        <motion.div 
          animate={phase >= 2 ? { scale: [1, 1.15, 1], borderColor: 'rgba(250,204,21,0.6)' } : { borderColor: 'rgba(52,211,153,0.3)' }}
          className="w-[88px] h-[88px] rounded-full border-[3px] flex flex-col items-center justify-center relative z-10 bg-[#12131a] shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <span className="text-[26px] font-black italic tracking-tighter text-white leading-none mt-1">
            {pts}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-0.5">
            PTS
          </span>
        </motion.div>

        {/* Plus Points floating */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -25, scale: 1.1 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="absolute -right-8 -top-2 text-emerald-400 font-black text-xs drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] z-20"
            >
              +450
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Badge */}
      <motion.div
        animate={
          phase >= 2 
          ? { backgroundColor: 'rgba(250,204,21,0.15)', color: '#facc15', borderColor: 'rgba(250,204,21,0.4)', scale: 1.05 } 
          : { backgroundColor: 'rgba(161,161,170,0.1)', color: '#a1a1aa', borderColor: 'rgba(161,161,170,0.2)', scale: 1 }
        }
        className="px-6 py-2.5 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] relative z-10 transition-colors duration-500 mb-2"
      >
        {phase >= 2 ? 'Liga Oro' : 'Amateur'}
      </motion.div>
    </div>
  );
}

/* ─── Main Modal ─── */
export function RankingTutorial({ isOpen, onClose }: RankingTutorialProps) {
  const [step, setStep] = useState(0);
  const DURATION = 6500;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStep(s => Math.max(0, s - 1));
  };

  const steps = [
    {
      title: 'El Salón de la Fama',
      desc: 'El Podio destaca a los 3 mejores jugadores. ¿Tenés lo necesario para destronar al rey y reclamar la corona?',
      icon: Trophy,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10 border-yellow-500/20',
      graphic: <PodiumGraphic />,
    },
    {
      title: 'Tu Categoría',
      desc: 'Navegá entre las distintas categorías para encontrar a tus rivales directos. La competencia es justa y por niveles.',
      icon: Filter,
      color: 'text-primary-light',
      bg: 'bg-primary/10 border-primary/20',
      graphic: <FilterGraphic />,
    },
    {
      title: 'Tu Nivel Real',
      desc: 'Ganá torneos para sumar puntos. Al superar cada umbral, tu ficha evolucionará a ligas superiores.',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      graphic: <PointsGraphic />,
    },
  ];

  // Auto-advance
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <div className="relative">
            {/* Desktop left arrow */}
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 w-11 h-11 rounded-full bg-[#11131a]/85 hover:bg-[#11131a] text-white/50 hover:text-white border border-white/10 items-center justify-center transition-all z-[320] shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Desktop right arrow */}
            {step < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 w-11 h-11 rounded-full bg-[#11131a]/85 hover:bg-[#11131a] text-white/50 hover:text-white border border-white/10 items-center justify-center transition-all z-[320] shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Modal card */}
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

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-2.5 right-2.5 p-3 text-white/40 hover:text-white rounded-full transition-all z-50 hover:bg-white/5"
              >
                <X size={18} />
              </button>

              {/* Slide content */}
              <div className="p-8 pt-16 flex flex-col items-center flex-1 relative overflow-hidden">
                {/* Mobile tap zones */}
                <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-[30%] z-30 cursor-w-resize md:hidden" />
                <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-[70%] z-30 cursor-e-resize md:hidden" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
                    className="w-full flex flex-col items-center text-center space-y-6 h-[480px]"
                  >
                    {/* Icon badge — spring pop */}
                    <motion.div
                      initial={{ scale: 0, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.55, delay: 0.08, duration: 0.5 }}
                      className={`w-20 h-20 rounded-[1.8rem] border ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative shrink-0`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.8rem]" />
                      {(() => { const Icon = steps[step].icon; return <Icon size={32} className="relative z-10" />; })()}
                    </motion.div>

                    {/* Animated graphic — fade up */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.18, duration: 0.5 }}
                      className="w-full flex items-center justify-center py-2"
                    >
                      {steps[step].graphic}
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-4 mt-auto w-full pb-8">
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
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40 leading-relaxed px-1 mb-4"
                      >
                        {steps[step].desc}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom button */}
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
                      className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors cursor-pointer bg-primary text-[#050505] shadow-[0_0_30px_rgba(136,130,220,0.35)] hover:opacity-95"
                    >
                      ¡A Competir! <Play size={14} fill="currentColor" />
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
