'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UserCircle, Star, Share2, Play, ChevronLeft, ChevronRight,
  Camera, Check, Save, Trophy
} from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface ProfileTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── STEP 1: Ficha PRO (Card) ─── */
function CardGraphic({ sport }: { sport: string | null }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setPhase(p => (p + 1) % 3);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const getStyle = () => {
    if (phase === 0) return { bgImg: '/card-bg-amateur.png', ring: 'border-[#a1a1aa]', bgGlow: '#a1a1aa' };
    if (phase === 1) return { bgImg: '/card-bg-avanzado.png', ring: 'border-[#facc15]', bgGlow: '#facc15' };
    return { bgImg: '/card-bg-elite.png', ring: 'border-[#22d3ee]', bgGlow: '#22d3ee' };
  };

  const s = getStyle();

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[9px] font-black uppercase text-white tracking-wider">Carta Oficial</span>
        <motion.span 
          key={`badge-${phase}`}
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="text-[8px] font-black uppercase"
          style={{ color: s.bgGlow }}
        >
          {phase === 0 ? 'Amateur' : phase === 1 ? 'Oro' : 'Leyenda'}
        </motion.span>
      </div>

      <div style={{ perspective: '1000px' }} className="w-full flex justify-center py-2">
        <motion.div
          animate={{ rotateY: [15, -15, 15], rotateX: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-[130px] aspect-[3/4] rounded-2xl border-2 relative overflow-hidden flex flex-col items-center justify-center p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu transition-colors duration-1000 ${s.ring}`}
        >
          {/* Background image */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={`bg-${phase}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
              src={s.bgImg} 
              className="absolute inset-0 w-full h-full object-cover z-0" 
            />
          </AnimatePresence>

          <div className="absolute inset-0 opacity-30 blur-2xl transition-colors duration-1000 z-0" style={{ backgroundColor: s.bgGlow }} />

          {/* Shine effect */}
          <motion.div 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-20 pointer-events-none"
          />
          
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-3 z-10 shadow-inner">
            <UserCircle size={24} className="text-white/50" />
          </div>
          
          <div className="space-y-2 text-center z-10 w-full px-2">
            <div className="h-3 w-full bg-white/20 rounded-full mx-auto" />
            <div className="h-1.5 w-2/3 bg-white/10 rounded-full mx-auto" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 w-full z-10">
            <div className="h-6 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-0.5">
              <div className="w-4 h-0.5 bg-white/10 rounded-full" />
              <div className="w-3 h-0.5 bg-white/5 rounded-full" />
            </div>
            <div className="h-6 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-0.5">
              <div className="w-4 h-0.5 bg-white/10 rounded-full" />
              <div className="w-3 h-0.5 bg-white/5 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── STEP 2.5: Torneos ─── */
function TournamentGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 text-center relative z-10 backdrop-blur-md overflow-hidden">
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest relative z-10">Torneos Oficiales</p>

      <div className="flex flex-col items-center justify-center gap-3 py-2">
        <motion.div
          animate={phase >= 1 ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
          className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] relative z-10"
        >
          <Trophy size={32} className="text-yellow-400" />
        </motion.div>
        
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              +100 PTS Ganados
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
        <p className="text-[8px] font-black text-white/60 uppercase">Copa Peñarol 2026</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[7px] text-white/40">Fase de Grupos</span>
          <span className="text-[7px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Ganador</span>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 2: Foto de Perfil ─── */
function PhotoGraphic() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000); // Click camera
    const t2 = setTimeout(() => setPhase(2), 2200); // Photo appears
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-center relative z-10 backdrop-blur-md overflow-hidden flex flex-col items-center">
      <div className="w-20 h-20 rounded-3xl border-2 border-white/10 bg-white/5 relative overflow-hidden flex items-center justify-center group">
        <AnimatePresence mode="wait">
          {phase < 2 ? (
            <motion.div
              key="camera"
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Camera size={28} className="text-white/40 group-hover:text-white/60 transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Subir Foto</span>
            </motion.div>
          ) : (
            <motion.div
              key="photo"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <UserCircle size={40} className="text-white/80 mix-blend-overlay" />
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-white/40 rounded-full m-auto w-4 h-4"
          />
        )}
      </div>
      <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mt-2">Personalizá tu ficha</p>
    </div>
  );
}

/* ─── STEP 3: Stats & Details ─── */
function StatsGraphic({ sport }: { sport: string | null }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const getStyle = () => {
    if (phase === 0) return { color: 'text-zinc-400', bg: 'bg-zinc-400', label: 'Amateur' };
    if (phase === 1) return { color: 'text-yellow-400', bg: 'bg-yellow-400', label: 'Oro' };
    return { color: 'text-cyan-400', bg: 'bg-cyan-400', label: 'Leyenda' };
  };

  const style = getStyle();

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 text-left relative z-10 backdrop-blur-md overflow-hidden">
      <div 
        className="absolute inset-0 opacity-15 blur-2xl transition-colors duration-1000" 
        style={{ backgroundColor: phase === 0 ? '#a1a1aa' : phase === 1 ? '#facc15' : '#22d3ee' }} 
      />
      <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest relative z-10">Progreso de Ranking</p>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[14px] font-black uppercase italic transition-colors duration-500 ${style.color}`}
            >
              {style.label}
            </motion.span>
          </div>
          <motion.span
            key={`pts-${phase}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[12px] font-black text-white/80 transition-colors duration-500"
          >
            {phase === 0 ? '0' : phase === 1 ? '450' : '1200'} PTS
          </motion.span>
        </div>

        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
          <motion.div
            initial={{ width: '5%' }}
            animate={{ width: phase === 0 ? '5%' : phase === 1 ? '45%' : '100%' }}
            transition={{ duration: 1, type: 'spring' }}
            className={`h-full transition-colors duration-1000 ${style.bg}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 relative z-10">
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
          <p className="text-[7px] text-white/40 uppercase font-black tracking-widest">Categoría</p>
          <motion.p
            key={`cat-${phase}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[9px] font-black text-white mt-1"
          >
            {sport === 'futbol' ? (phase === 0 ? 'Amateur' : 'Avanzado') : (phase === 0 ? '7ma' : phase === 1 ? '4ta' : '1ra')}
          </motion.p>
        </div>
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
          <p className="text-[7px] text-white/40 uppercase font-black tracking-widest">Posición</p>
          <p className="text-[9px] font-black text-white mt-1">
            {sport === 'futbol' ? 'Delantero' : 'Drive'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 3: Guardar y Compartir ─── */
function SaveGraphic({ sport }: { sport: string | null }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const accentBtnBg = sport === 'futbol' ? 'bg-green-500 text-black' : 'bg-primary text-white';

  return (
    <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4 text-left relative z-10 backdrop-blur-md overflow-hidden flex flex-col items-center">
      
      <motion.button
        animate={phase >= 1 ? { scale: [1, 0.95, 1] } : {}}
        className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 ${accentBtnBg}`}
      >
        {phase >= 1 ? <Check size={12} /> : <Save size={12} />}
        {phase >= 1 ? '¡Guardado!' : 'Guardar Cambios'}
      </motion.button>

      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between mt-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Share2 size={12} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-white/60">Compartir</p>
                <p className="text-[7px] text-white/40">Descargá tu carta HD</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-white/10 rounded-lg text-[7px] font-black uppercase hover:bg-white/20 transition-all">
              Bajar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Modal ─── */
export function ProfileTutorial({ isOpen, onClose }: ProfileTutorialProps) {
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
      title: 'Tu Carta Oficial',
      desc: 'Esta es tu Ficha PRO. Personalizá tu perfil y así es como te verán los demás jugadores del complejo.',
      icon: UserCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-500/20',
      graphic: <CardGraphic sport={sport} />,
    },
    {
      title: 'Foto de Perfil',
      desc: 'Subí una foto tuya para darle un toque profesional a tu carta y que tus rivales te reconozcan.',
      icon: Camera,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20',
      graphic: <PhotoGraphic />,
    },
    {
      title: 'Torneos Oficiales',
      desc: 'Anotate en torneos oficiales organizados por el club. Ganá partidos para acumular puntos valiosos.',
      icon: Trophy,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      graphic: <TournamentGraphic />,
    },
    {
      title: 'Mejorá tu Prestigio',
      desc: 'Al acumular puntos en torneos, tu carta evolucionará ganando nuevos colores brillantes y prestigio.',
      icon: Star,
      color: sport === 'futbol' ? 'text-green-400' : 'text-primary-light',
      bg: sport === 'futbol' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20',
      graphic: <StatsGraphic sport={sport} />,
    },
    {
      title: 'Guardá y Compartí',
      desc: 'No te olvides de guardar tus cambios. Luego podés descargar tu carta en alta calidad para presumirla en tus redes.',
      icon: Share2,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      graphic: <SaveGraphic sport={sport} />,
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
                    className="w-full flex flex-col items-center text-center space-y-5 h-[440px]"
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
