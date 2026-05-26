'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, ChevronLeft, ChevronRight,
  Calendar, Clock, MapPin, Trash2, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface MisTurnosTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── STEP 1: Upcoming booking card appears ─── */
function UpcomingGraphic() {
  const [phase, setPhase] = useState(0);
  // 0=empty, 1=card slides in, 2=badge pulses
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-[240px] space-y-2.5 relative z-10">

      {/* Upcoming card slides in */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="bg-[#12131a] border border-primary/25 rounded-2xl p-3.5 flex items-center gap-3 relative overflow-hidden shadow-[0_0_20px_rgba(136,130,220,0.1)]"
          >
            {/* Date badge */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-[7px] font-black uppercase text-primary leading-none">Jun</span>
              <span className="text-[14px] font-black text-white leading-none">28</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-white uppercase italic">Cancha 2</p>
              <div className="flex items-center gap-2 mt-0.5 text-[7px] font-bold uppercase text-white/40">
                <span className="flex items-center gap-1"><Clock size={8} className="text-primary" /> 19:30 hs</span>
                <span className="flex items-center gap-1"><MapPin size={8} className="text-primary" /> Peñarol</span>
              </div>
            </div>

            {/* "Próximo" badge pulses in */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="px-2 py-0.5 bg-primary/15 text-primary text-[7px] font-black uppercase tracking-wider rounded-full border border-primary/20 shrink-0"
                >
                  Próximo
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past card (always visible, dimmed) */}
      <div className="bg-[#12131a] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 opacity-35 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center shrink-0">
          <span className="text-[7px] font-black uppercase text-white/40 leading-none">May</span>
          <span className="text-[14px] font-black text-white/40 leading-none">15</span>
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black text-white/40 uppercase italic">Cancha 1</p>
          <p className="text-[7px] font-bold uppercase text-white/20">18:00 hs • Completado</p>
        </div>
        <CheckCircle2 size={13} className="text-white/20 shrink-0" />
      </div>
    </div>
  );
}

/* ─── STEP 2: Cancellation flow ─── */
function CancelGraphic() {
  const [phase, setPhase] = useState(0);
  // 0=card, 1=cancel button highlighted, 2=confirmation modal, 3=cancelled (card gone)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="w-full max-w-[240px] relative z-10" style={{ minHeight: 130 }}>

      {/* Booking card */}
      <AnimatePresence>
        {phase < 3 && (
          <motion.div
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="bg-[#12131a] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-[7px] font-black uppercase text-primary leading-none">Jun</span>
              <span className="text-[14px] font-black text-white leading-none">28</span>
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-white uppercase italic">Cancha 2 • 19:30 hs</p>
              <p className="text-[7px] text-white/30 font-bold uppercase">Peñarol</p>
            </div>
            {/* Cancel button gets highlighted */}
            <motion.button
              animate={phase >= 1 ? {
                backgroundColor: 'rgba(239,68,68,0.2)',
                borderColor: 'rgba(239,68,68,0.4)',
                scale: phase === 1 ? [1, 1.05, 1] : 1
              } : {}}
              transition={{ duration: 0.4 }}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/30 transition-colors"
            >
              <Trash2 size={12} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation modal slides up */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            className="absolute inset-x-0 top-0 bg-[#0d0e14] border border-white/10 rounded-2xl p-4 text-center shadow-2xl z-10"
          >
            <div className="w-8 h-8 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mx-auto mb-2 text-red-400">
              <AlertTriangle size={14} />
            </div>
            <p className="text-[9px] font-black text-white uppercase tracking-wide">¿Cancelar Turno?</p>
            <p className="text-[7px] text-white/30 font-bold uppercase mt-0.5 mb-3">Avisá por WhatsApp si es sobre la hora.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="py-2 rounded-xl bg-white/5 border border-white/10 text-[7.5px] font-black uppercase text-white/50 text-center">Volver</div>
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: 2, duration: 0.4, delay: 0.5 }}
                className="py-2 rounded-xl bg-red-500 text-[7.5px] font-black uppercase text-white text-center shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              >
                Sí, Cancelar
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancelled state */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="bg-[#12131a] border border-white/5 rounded-2xl p-4 text-center space-y-1.5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.1 }}
              className="w-8 h-8 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center mx-auto text-green-400"
            >
              <CheckCircle2 size={14} />
            </motion.div>
            <p className="text-[8.5px] font-black text-white uppercase">Turno cancelado</p>
            <p className="text-[6.5px] text-white/30 uppercase tracking-wider font-bold">El horario vuelve a estar libre</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STEP 3: Past turns — completed state ─── */
function HistoryGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const items = [
    { month: 'Jun', day: '28', cancha: 'Cancha 2', hora: '19:30', upcoming: true },
    { month: 'Jun', day: '15', cancha: 'Cancha 1', hora: '18:00', upcoming: false },
    { month: 'May', day: '30', cancha: 'Cancha 3', hora: '20:00', upcoming: false },
  ];

  return (
    <div className="w-full max-w-[240px] space-y-2 relative z-10">
      {items.map((item, i) => (
        <AnimatePresence key={i}>
          {phase > i && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', bounce: 0.2, delay: i * 0.05 }}
              className={`bg-[#12131a] rounded-2xl p-3 flex items-center gap-3 border ${
                item.upcoming
                  ? 'border-primary/25 shadow-[0_0_12px_rgba(136,130,220,0.08)]'
                  : 'border-white/5 opacity-50'
              }`}
            >
              {item.upcoming && <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-2xl" style={{ display: 'none' }} />}
              <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                item.upcoming ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/5'
              }`}>
                <span className={`text-[6px] font-black uppercase leading-none ${item.upcoming ? 'text-primary' : 'text-white/30'}`}>{item.month}</span>
                <span className={`text-[12px] font-black leading-none ${item.upcoming ? 'text-white' : 'text-white/30'}`}>{item.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[8px] font-black uppercase italic ${item.upcoming ? 'text-white' : 'text-white/40'}`}>{item.cancha}</p>
                <p className={`text-[6.5px] font-bold uppercase ${item.upcoming ? 'text-white/40' : 'text-white/20'}`}>{item.hora} hs • Peñarol</p>
              </div>
              {item.upcoming ? (
                <span className="text-[6.5px] font-black uppercase text-primary border border-primary/20 bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">Próximo</span>
              ) : (
                <CheckCircle2 size={12} className="text-white/20 shrink-0" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}

/* ─── Main Modal ─── */
export function MisTurnosTutorial({ isOpen, onClose }: MisTurnosTutorialProps) {
  const [step, setStep] = useState(0);
  const DURATION = 7000;

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
      title: 'Tus Próximas Reservas',
      desc: 'Encontrá todos tus turnos en un solo lugar. Los próximos aparecen destacados; los pasados quedan como historial.',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      graphic: <UpcomingGraphic />,
    },
    {
      title: 'Cancelá si Necesitás',
      desc: 'Si no podés ir, cancelá el turno desde acá. Solo se pueden cancelar turnos futuros. ¡Avisá con tiempo!',
      icon: Trash2,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      graphic: <CancelGraphic />,
    },
    {
      title: 'Tu Historial Completo',
      desc: 'Todos tus turnos jugados quedan guardados. Revisá cuando jugaste y en qué cancha en cualquier momento.',
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      graphic: <HistoryGraphic />,
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
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 w-11 h-11 rounded-full bg-[#11131a]/85 hover:bg-[#11131a] text-white/50 hover:text-white border border-white/10 items-center justify-center transition-all z-[320] shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            )}

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
                <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-[30%] z-30 cursor-w-resize md:hidden" />
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
