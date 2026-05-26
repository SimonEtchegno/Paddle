'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Grid, Play, Check, ChevronLeft, ChevronRight, Send, User, Phone } from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface BookingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingTutorial({ isOpen, onClose }: BookingTutorialProps) {
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
      title: "Elegí Fecha y Deporte",
      desc: `Seleccioná el día que querés jugar en el calendario. Podés alternar entre Fútbol 5 y Pádel en cualquier momento.`,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-3 relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          
          {/* Calendar Picker Mockup */}
          <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] font-black uppercase text-white tracking-wider">Fecha de Juego</span>
              <span className="text-[8px] text-white/40 uppercase">Mayo 2026</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 text-center text-[8px] font-bold">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i} className="text-white/30">{d}</span>
              ))}
              {[22, 23, 24, 25].map(d => (
                <span key={d} className="text-white/60 py-1">{d}</span>
              ))}
              {/* Selected date bubble */}
              <motion.span 
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`py-1 rounded-full font-black text-black flex items-center justify-center ${
                  sport === 'futbol' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-primary text-white shadow-[0_0_10px_rgba(136,130,220,0.4)]'
                }`}
              >
                26
              </motion.span>
              {[27, 28].map(d => (
                <span key={d} className="text-white/60 py-1">{d}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Buscá Horarios Libres",
      desc: "Explorá la grilla de turnos de las canchas. Los horarios libres figuran destacados con el color del deporte y precio.",
      icon: Grid,
      color: sport === 'futbol' ? 'text-green-400' : 'text-primary-light',
      bg: sport === 'futbol' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20',
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-3 relative w-full h-full">
          <div className={`absolute inset-0 blur-3xl rounded-full opacity-10 ${sport === 'futbol' ? 'bg-green-500' : 'bg-primary'}`} />
          
          {/* Slots Grid Mockup */}
          <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-2.5 text-left relative z-10 backdrop-blur-md">
            <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest">Grilla de Turnos</p>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center opacity-40">
                <p className="text-[9px] font-black text-white/40">18:00 hs</p>
                <p className="text-[6.5px] text-white/20 font-bold uppercase">Reservado</p>
              </div>
              
              <motion.div 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`p-2 rounded-xl text-center border cursor-pointer ${
                  sport === 'futbol' 
                    ? 'bg-green-500/10 border-green-500/40 text-green-400' 
                    : 'bg-primary/10 border-primary/40 text-primary-light'
                }`}
              >
                <p className="text-[9px] font-black">19:30 hs</p>
                <p className="text-[6.5px] font-black uppercase tracking-wider opacity-80">Libre</p>
              </motion.div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Confirmá tu Turno",
      desc: "Completá tu nombre y WhatsApp para asegurar tu lugar. Sin pagos por adelantado: abonás directamente en el complejo al jugar.",
      icon: Send,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full opacity-10" />
          
          {/* Booking Confirmation Mockup Form */}
          <div className="w-full max-w-[240px] bg-[#12131a] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3 text-left relative z-10 backdrop-blur-md">
            <p className="text-[8.5px] font-black text-white/50 uppercase tracking-widest">Tus Datos</p>
            
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2">
                <User size={10} className="text-white/20" />
                <span className="text-[9px] font-bold text-white/80">Juan Pérez</span>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2">
                <Phone size={10} className="text-white/20" />
                <span className="text-[9px] font-bold text-white/80">2923460902</span>
              </div>
            </div>
            
            <button className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg border flex items-center justify-center gap-1.5 ${
              sport === 'futbol' 
                ? 'bg-green-500 text-black border-green-400 shadow-green-500/20' 
                : 'bg-primary text-white border-primary-light shadow-primary/20'
            }`}>
              <Send size={10} />
              Confirmar Reserva
            </button>
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
        return currentStep;
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

            {/* Smartphone mockup card */}
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
