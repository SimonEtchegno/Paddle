'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MessageCircle, Play, Check } from 'lucide-react';
import { useSport } from '@/hooks/useSport';

interface MatchTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchTutorial({ isOpen, onClose }: MatchTutorialProps) {
  const [step, setStep] = useState(0);
  const { sport } = useSport();
  const DURATION = 6000; // 6 seconds per slide

  const steps = [
    {
      title: "¿Te falta gente?",
      desc: `Si ya tenés tu turno reservado pero te faltan jugadores para completar el equipo, publicá tu partido abierto de ${sport === 'futbol' ? 'Fútbol 5' : 'Pádel'}.`,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          <motion.div 
            initial={{ scale: 0.8, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-36 h-24 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden shadow-2xl z-10 backdrop-blur-md"
          >
            <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${sport === 'futbol' ? 'from-green-400 to-green-600' : 'from-primary to-purple-600'}`} />
            <span className="text-4xl mb-1 drop-shadow-md">{sport === 'futbol' ? '⚽' : '🎾'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Tu reserva</span>
          </motion.div>
          <div className="flex gap-4 z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">👤</span>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`w-12 h-12 rounded-full bg-white/5 border border-dashed flex items-center justify-center shadow-lg animate-pulse ${sport === 'futbol' ? 'border-green-400/50 text-green-400' : 'border-primary/50 text-primary'}`}
            >
              <span className="text-xl font-bold">?</span>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "La comunidad se suma",
      desc: "Otros jugadores verán tu publicación en la cartelera del club y podrán solicitar unirse a tu partido al instante.",
      icon: Users,
      color: sport === 'futbol' ? 'text-green-400' : 'text-primary',
      bg: sport === 'futbol' ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20',
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className={`absolute inset-0 blur-3xl rounded-full opacity-10 ${sport === 'futbol' ? 'bg-green-500' : 'bg-primary'}`} />
          <div className="flex items-center justify-center space-x-6 z-10">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 rounded-full bg-[#13141a] border-2 border-white/10 flex items-center justify-center shadow-lg overflow-hidden"
                >
                  <span className="text-lg">👤</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg border ${
              sport === 'futbol' 
                ? 'bg-green-500 text-black shadow-green-500/25 border-green-400/20' 
                : 'bg-primary text-white shadow-primary/25 border-primary-light/20'
            }`}
          >
            <Check size={12} className="stroke-[3]" /> ¡Quiero Jugar!
          </motion.div>
        </div>
      )
    },
    {
      title: "Coordiná y jugá",
      desc: "Al aceptar la solicitud de un jugador, la app abrirá automáticamente un chat de WhatsApp para coordinar los detalles finales.",
      icon: MessageCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.4)] z-10 relative"
          >
            <MessageCircle size={32} className="text-white relative z-10" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-white/50"
            />
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 px-6 py-3 bg-white/[0.02] backdrop-blur-md rounded-2xl text-xs font-bold text-center border border-white/10 shadow-2xl z-10 relative"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-[#0b0c10]" />
            <span className="text-white/80">"¡Hola! Me sumo al partido..."</span>
          </motion.div>
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-b from-[#11131a] to-[#07080a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex flex-col"
          >
            {/* Ambient glows behind modal content */}
            <div className={`absolute -left-16 -top-16 w-56 h-56 rounded-full blur-[80px] opacity-10 pointer-events-none ${
              sport === 'futbol' ? 'bg-green-500' : 'bg-primary'
            }`} />

            {/* Stories-style progress indicators */}
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

            <button 
              onClick={onClose}
              className="absolute top-2 right-2 p-3 text-white/40 hover:text-white rounded-full transition-all z-50"
            >
              <X size={20} />
            </button>

            <div className="p-8 pt-16 flex flex-col items-center flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="w-full flex flex-col items-center text-center space-y-8 h-[390px]"
                >
                  {/* Icon Badge container */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                    className={`w-20 h-20 rounded-[2rem] border ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[2rem]" />
                    {(() => {
                      const Icon = steps[step].icon;
                      return <Icon size={36} className="relative z-10" />;
                    })()}
                  </motion.div>
                  
                  {/* Step Interactive Graphic Preview */}
                  <div className="h-40 w-full rounded-3xl flex items-center justify-center relative">
                    {steps[step].graphic}
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-4 mt-auto">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic text-white">{steps[step].title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40 leading-relaxed px-4">
                      {steps[step].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center relative z-20">
              {step < steps.length - 1 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                >
                  Continuar
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                    sport === 'futbol'
                      ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:bg-green-400'
                      : 'bg-primary text-white shadow-[0_0_30px_rgba(136,130,220,0.35)] hover:opacity-95'
                  }`}
                >
                  ¡Entendido, a jugar! <Play size={14} fill="currentColor" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
