'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Grid, Play, ChevronLeft, ChevronRight,
  Send, User, Phone, Check
} from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface BookingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── STEP 1: Calendar auto-selects a day ─── */
function CalendarGraphic({ sport }: { sport: string | null }) {
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSelected(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const days = [22, 23, 24, 25, 26, 27, 28];
  const accent = sport === 'futbol'
    ? { ring: 'bg-green-500', shadow: 'shadow-[0_0_12px_rgba(34,197,94,0.5)]', text: 'text-black' }
    : { ring: 'bg-primary', shadow: 'shadow-[0_0_12px_rgba(136,130,220,0.5)]', text: 'text-white' };

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[9px] font-black uppercase text-white tracking-wider">Fecha de Juego</span>
        <span className="text-[8px] text-white/40 uppercase">Mayo 2026</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[8px] font-bold">
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <span key={i} className="text-white/30">{d}</span>
        ))}
        {days.map((d) => {
          const isTarget = d === 26;
          const isSelected = isTarget && selected;
          return (
            <motion.span
              key={d}
              animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.45 }}
              className={`py-1 rounded-full font-black flex items-center justify-center transition-colors duration-300 ${
                isSelected
                  ? `${accent.ring} ${accent.text} ${accent.shadow}`
                  : 'text-white/60'
              }`}
            >
              {d}
            </motion.span>
          );
        })}
      </div>

      {/* Sport toggle pills */}
      <div className="flex gap-1.5 pt-1">
        <motion.div
          animate={selected ? { opacity: [0.4, 1], scale: [0.95, 1] } : { opacity: 0.4 }}
          transition={{ delay: 1.4 }}
          className={`flex-1 py-1 rounded-lg text-center text-[7px] font-black uppercase border ${
            sport === 'futbol'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-white/5 border-white/10 text-white/30'
          }`}
        >
          ⚽ Fútbol 5
        </motion.div>
        <motion.div
          animate={selected ? { opacity: [0.4, 1], scale: [0.95, 1] } : { opacity: 0.4 }}
          transition={{ delay: 1.6 }}
          className={`flex-1 py-1 rounded-lg text-center text-[7px] font-black uppercase border ${
            sport !== 'futbol'
              ? 'bg-primary/10 border-primary/30 text-primary-light'
              : 'bg-white/5 border-white/10 text-white/30'
          }`}
        >
          🎾 Pádel
        </motion.div>
      </div>
    </div>
  );
}

/* ─── STEP 2: Slot gets tapped then shows as selected ─── */
function SlotsGraphic({ sport }: { sport: string | null }) {
  // phase: 0=idle, 1=tap (pressing), 2=selected
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const accentBg  = sport === 'futbol' ? 'bg-green-500/10'   : 'bg-primary/10';
  const accentBdr = sport === 'futbol' ? 'border-green-500/50' : 'border-primary/50';
  const accentTxt = sport === 'futbol' ? 'text-green-400'    : 'text-primary-light';
  const accentBtnBg = sport === 'futbol' ? 'bg-green-500 text-black' : 'bg-primary text-white';

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-2.5 text-left relative z-10 backdrop-blur-md overflow-hidden">
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest">Horarios Disponibles</p>

      <div className="grid grid-cols-2 gap-2">
        {/* Taken slot */}
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center opacity-35">
          <p className="text-[9px] font-black text-white/40">18:00 hs</p>
          <p className="text-[6.5px] text-white/20 font-bold uppercase">Reservado</p>
        </div>

        {/* Free slot — gets tapped then selected */}
        <motion.div
          animate={
            phase === 1 ? { scale: 0.91 } :
            phase === 2 ? { scale: 1 }    : { scale: 1 }
          }
          transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
          className={`p-2 rounded-xl text-center border cursor-pointer relative overflow-hidden transition-colors duration-300 ${
            phase === 2
              ? `${accentBg} ${accentBdr} ${accentTxt}`
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <p className="text-[9px] font-black">19:30 hs</p>
          <p className="text-[6.5px] font-black uppercase tracking-wider opacity-80">
            {phase === 2 ? 'Seleccionado ✓' : 'Libre'}
          </p>

          {/* Ripple on tap */}
          {phase >= 1 && (
            <motion.span
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 m-auto w-4 h-4 rounded-full ${
                sport === 'futbol' ? 'bg-green-500' : 'bg-primary'
              }`}
            />
          )}
        </motion.div>

        {/* Other free slots */}
        {['20:00 hs', '21:30 hs'].map((h) => (
          <div key={h} className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
            <p className="text-[9px] font-black text-white/60">{h}</p>
            <p className="text-[6.5px] text-white/30 font-bold uppercase">Libre</p>
          </div>
        ))}
      </div>

      {/* CTA slides in after selection */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3, delay: 0.15 }}
            className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-center ${accentBtnBg}`}
          >
            Reservar este turno →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STEP 3: Form fills in then "¡Reservado!" card slides in ─── */
function ConfirmGraphic({ sport }: { sport: string | null }) {
  const [phase, setPhase] = useState(0);
  // 0=empty, 1=name typed, 2=phone typed, 3=reserved overlay
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const accentBtnBg = sport === 'futbol' ? 'bg-green-500 text-black' : 'bg-primary text-white';

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md overflow-hidden">
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest">Tus Datos</p>

      <div className="space-y-2">
        {/* Name field */}
        <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2 h-8">
          <User size={10} className="text-white/20 shrink-0" />
          <AnimatePresence>
            {phase >= 1 && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-[9px] font-bold text-white/80 overflow-hidden whitespace-nowrap"
              >
                Juan Pérez
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Phone field */}
        <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2 h-8">
          <Phone size={10} className="text-white/20 shrink-0" />
          <AnimatePresence>
            {phase >= 2 && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-[9px] font-bold text-white/80 overflow-hidden whitespace-nowrap"
              >
                2923460902
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        animate={phase >= 2 ? { opacity: 1, scale: phase === 3 ? [1, 0.94, 1] : 1 } : { opacity: 0.3 }}
        transition={{ duration: 0.25 }}
        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1.5 ${accentBtnBg}`}
      >
        <Send size={10} />
        Confirmar Reserva
      </motion.button>

      {/* ¡Reservado! overlay slides in from bottom */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.55 }}
            className="absolute inset-0 bg-[#07080a]/95 flex flex-col items-center justify-center text-center p-4 rounded-2xl z-20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.15 }}
              className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-2 text-green-400"
            >
              <Check size={22} className="stroke-[2.5]" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] font-black text-white uppercase tracking-wider"
            >
              ¡Turno Reservado!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="text-[7.5px] text-white/40 uppercase tracking-widest mt-1 font-bold"
            >
              Te veremos el viernes a las 19:30 hs
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Modal ─── */
export function BookingTutorial({ isOpen, onClose }: BookingTutorialProps) {
  const [step, setStep] = useState(0);
  const { sport } = useSport();
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
      title: 'Elegí Fecha y Deporte',
      desc: 'Seleccioná el día que querés jugar en el calendario. Podés alternar entre Fútbol 5 y Pádel en cualquier momento.',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-500/20',
      graphic: <CalendarGraphic sport={sport} />,
    },
    {
      title: 'Buscá Horarios Libres',
      desc: 'Explorá la grilla de turnos. Tocá un horario disponible para seleccionarlo y avanzar a la confirmación.',
      icon: Grid,
      color: sport === 'futbol' ? 'text-green-400' : 'text-primary-light',
      bg: sport === 'futbol' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20',
      graphic: <SlotsGraphic sport={sport} />,
    },
    {
      title: 'Confirmá tu Turno',
      desc: 'Completá tu nombre y WhatsApp. Sin pagos por adelantado: abonás directamente en el complejo al jugar.',
      icon: Send,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      graphic: <ConfirmGraphic sport={sport} />,
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
              <div className={`absolute -left-16 -top-16 w-56 h-56 rounded-full blur-[80px] opacity-10 pointer-events-none ${sport === 'futbol' ? 'bg-green-500' : 'bg-primary'}`} />

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
                    className="w-full flex flex-col items-center text-center space-y-8 h-[420px]"
                  >
                    {/* Icon badge — spring pop */}
                    <motion.div
                      initial={{ scale: 0, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.55, delay: 0.08, duration: 0.5 }}
                      className={`w-18 h-18 rounded-[1.8rem] border ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.8rem]" />
                      {(() => { const Icon = steps[step].icon; return <Icon size={32} className="relative z-10" />; })()}
                    </motion.div>

                    {/* Animated graphic — fade up */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.18, duration: 0.5 }}
                      className="w-full flex items-center justify-center"
                    >
                      {steps[step].graphic}
                    </motion.div>

                    {/* Title */}
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
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        sport === 'futbol'
                          ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:bg-green-400'
                          : 'bg-primary text-white shadow-[0_0_30px_rgba(136,130,220,0.35)] hover:opacity-95'
                      }`}
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
