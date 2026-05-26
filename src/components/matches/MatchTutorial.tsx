'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MessageCircle, Play, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface MatchTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchTutorial({ isOpen, onClose }: MatchTutorialProps) {
  const [step, setStep] = useState(0);
  const { sport } = useSport();
  const DURATION = 6000; // 6 seconds per slide

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStep(s => Math.max(0, s - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const steps = [
    {
      title: "¿Te falta gente?",
      desc: `Si ya tenés tu turno reservado pero te faltan jugadores, publicá tu partido abierto en segundos para completar el equipo.`,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          
          {/* Match Mockup Card */}
          <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <p className="text-[10px] font-black uppercase text-white tracking-wider">Cancha 2 ({sport === 'futbol' ? 'Fútbol 5' : 'Pádel'})</p>
                <p className="text-[8px] font-bold text-white/40 uppercase">Hoy • 20:00 hs</p>
              </div>
              <span className={`text-[8.5px] border px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                sport === 'futbol' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-primary/10 text-primary-light border-primary/20'
              }`}>
                Abierto
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest">Jugadores (3/4)</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] border-2 border-[#12131a] font-black ${
                    sport === 'futbol' ? 'bg-green-500 text-black' : 'bg-primary text-white'
                  }`}>
                    TÚ
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] border-2 border-[#12131a] font-bold text-white">
                    AP
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] border-2 border-[#12131a] font-bold text-white">
                    MR
                  </div>
                </div>
                
                {/* Pulse glowing empty slot */}
                <motion.div 
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center text-xs font-black bg-white/[0.02] ${
                    sport === 'futbol' ? 'border-green-400 text-green-400' : 'border-primary text-primary-light'
                  }`}
                >
                  +
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "La comunidad se postula",
      desc: "Otros jugadores verán tu publicación en la cartelera del club y podrán solicitar unirse al partido con un toque.",
      icon: Users,
      color: sport === 'futbol' ? 'text-green-400' : 'text-primary-light',
      bg: sport === 'futbol' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20',
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className={`absolute inset-0 blur-3xl rounded-full opacity-10 ${sport === 'futbol' ? 'bg-green-500' : 'bg-primary'}`} />
          
          {/* Postulation Request Card */}
          <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                👤
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Juan Díaz</p>
                <p className="text-[8px] font-bold text-white/40 uppercase">Nivel 4.5 • Intermedio</p>
              </div>
            </div>
            
            <div className="pt-1">
              <motion.button
                initial={{ scale: 1 }}
                animate={{ scale: [1, 0.97, 1] }}
                transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.3 }}
                className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg border transition-all ${
                  sport === 'futbol'
                    ? 'bg-green-500 text-black border-green-400 shadow-green-500/20'
                    : 'bg-primary text-white border-primary-light shadow-primary/20'
                }`}
              >
                Pedir Sumarme
              </motion.button>
            </div>
            
            {/* Visual simulation overlay */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: [80, 0, 0], opacity: [0, 1, 1] }}
              transition={{ delay: 2, duration: 0.5 }}
              className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-3 z-20"
            >
              <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-1 text-green-400">
                <Check size={16} className="stroke-[3]" />
              </div>
              <p className="text-[9px] font-black text-white uppercase tracking-wider">¡Solicitud Enviada!</p>
              <p className="text-[7.5px] text-white/40 uppercase tracking-widest">El creador decidirá tu ingreso</p>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Coordiná por WhatsApp",
      desc: "Al aceptar la postulación de un jugador, la app te conectará por WhatsApp para definir los detalles finales rápidamente.",
      icon: MessageCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full opacity-10" />
          
          {/* WhatsApp Chat Preview */}
          <div className="w-full max-w-[240px] bg-[#0b0c10] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-left relative z-10">
            {/* Mock Header */}
            <div className="bg-[#075e54] px-3 py-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs">
                {sport === 'futbol' ? '⚽' : '🎾'}
              </div>
              <div>
                <p className="text-[9px] font-black text-white uppercase tracking-wider">Complejo Peñarol</p>
                <p className="text-[6.5px] text-white/60 uppercase">En línea</p>
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="p-3 space-y-2 bg-[#efeae2]/5 min-h-[95px] flex flex-col justify-end">
              <motion.div 
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-[#1f2c34] text-white p-2 rounded-xl rounded-tl-none max-w-[85%] self-start"
              >
                <p className="text-[8.5px] leading-snug font-bold">¡Hola! Me sumé al partido. ¿Llevamos pelota?</p>
                <span className="text-[5.5px] text-white/40 block text-right mt-0.5">20:10 hs</span>
              </motion.div>
              
              <motion.div 
                initial={{ x: 15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="bg-[#005c4b] text-white p-2 rounded-xl rounded-tr-none max-w-[85%] self-end"
              >
                <p className="text-[8.5px] leading-snug font-bold">¡Hola Juan! Sí, yo llevo. Nos vemos allá.</p>
                <span className="text-[5.5px] text-white/40 block text-right mt-0.5">20:12 hs</span>
              </motion.div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Auto advance timer
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const timer = setInterval(() => {
      setStep((currentStep) => {
        if (currentStep < steps.length - 1) {
          return currentStep + 1;
        }
        return currentStep; // Stay on the last step
      });
    }, DURATION);

    return () => clearInterval(timer);
  }, [isOpen, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Wrapper for phone mockup + floating navigation arrows */}
          <div className="relative">
            {/* Desktop Floating Arrows */}
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

            {/* Smartphone mockup layout for Instagram Stories */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#11131a] to-[#07080a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Ambient Radial Glow */}
              <div className={`absolute -left-16 -top-16 w-56 h-56 rounded-full blur-[80px] opacity-10 pointer-events-none ${
                sport === 'futbol' ? 'bg-green-500' : 'bg-primary'
              }`} />

              {/* Instagram style progress indicators */}
              <div className="absolute top-5 left-6 right-14 flex gap-1.5 z-50">
                {steps.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: i < step ? "100%" : "0%" }}
                      animate={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
                      transition={{ 
                        duration: i === step ? DURATION / 1000 : 0.2, 
                        ease: "linear" 
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-2.5 right-2.5 p-3 text-white/40 hover:text-white rounded-full transition-all z-50 bg-white/0 hover:bg-white/5"
              >
                <X size={18} />
              </button>

              {/* Main Interactive Slide Display */}
              <div className="p-8 pt-16 flex flex-col items-center flex-1 relative overflow-hidden">
                {/* Mobile Tap Zones */}
                <div 
                  onClick={handlePrev}
                  className="absolute left-0 top-0 bottom-0 w-[30%] z-30 cursor-w-resize md:hidden"
                />
                <div 
                  onClick={handleNext}
                  className="absolute right-0 top-0 bottom-0 w-[70%] z-30 cursor-e-resize md:hidden"
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full flex flex-col items-center text-center space-y-8 h-[395px]"
                  >
                    {/* Icon Badge container */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      className={`w-18 h-18 rounded-[1.8rem] border ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.8rem]" />
                      {(() => {
                        const Icon = steps[step].icon;
                        return <Icon size={32} className="relative z-10" />;
                      })()}
                    </motion.div>
                    
                    {/* Graphic Mockup Preview */}
                    <div className="h-40 w-full rounded-3xl flex items-center justify-center relative">
                      {steps[step].graphic}
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-3.5 mt-auto">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white leading-none">
                        {steps[step].title}
                      </h3>
                      <p className="text-[10px] md:text-[10.5px] font-black uppercase tracking-[0.18em] text-white/40 leading-relaxed px-3">
                        {steps[step].desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 relative z-40">
                {step > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-white/10 cursor-pointer"
                  >
                    Atrás
                  </button>
                )}
                
                {step < steps.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                  >
                    Continuar
                  </button>
                ) : (
                  <button 
                    onClick={onClose}
                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      sport === 'futbol'
                        ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:bg-green-400'
                        : 'bg-primary text-white shadow-[0_0_30px_rgba(136,130,220,0.35)] hover:opacity-95'
                    }`}
                  >
                    ¡Entendido! <Play size={14} fill="currentColor" />
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
