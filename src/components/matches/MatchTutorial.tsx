'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Users, Calendar, MessageCircle, Play, Check } from 'lucide-react';
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
      desc: `Si ya tenés tu turno pero te bajaron jugadores, publicá tu partido abierto de ${sport === 'futbol' ? 'Fútbol 5' : 'Pádel'}.`,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/20",
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
          <motion.div 
            initial={{ scale: 0.8, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-32 h-20 bg-[#13141a] border border-white/10 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden shadow-2xl z-10"
          >
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
            <span className="text-3xl mb-1 drop-shadow-md">{sport === 'futbol' ? '⚽' : '🎾'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Tu turno</span>
          </motion.div>
          <div className="flex gap-3 z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">👤</span>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-10 h-10 rounded-full bg-blue-500/10 border border-dashed border-blue-400/50 flex items-center justify-center shadow-lg"
            >
              <span className="text-xl animate-pulse text-blue-400">?</span>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "La comunidad se suma",
      desc: "Otros jugadores verán tu publicación en la cartelera y podrán enviarte una solicitud para unirse a tu equipo al instante.",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/20",
      graphic: (
        <div className="flex flex-col items-center justify-center space-y-4 relative w-full h-full">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <div className="flex items-center justify-center space-x-6 z-10">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 rounded-full bg-[#1a1b23] border-2 border-[#0a0b0e] flex items-center justify-center shadow-lg"
                >
                  <span className="opacity-50 text-sm">👤</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] flex items-center gap-1 z-10"
          >
            <Check size={12} /> ¡Me Sumo!
          </motion.div>
        </div>
      )
    },
    {
      title: "¡A jugar!",
      desc: "Al aceptar a un jugador, la app te abrirá un chat de WhatsApp para coordinar los detalles finales. ¡Fácil y rápido!",
      icon: MessageCircle,
      color: "text-green-500",
      bg: "bg-green-500/20",
      graphic: (
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full" />
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
              className="absolute inset-0 rounded-full border-2 border-white"
            />
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 px-5 py-3 bg-[#13141a] rounded-2xl text-xs font-bold text-center border border-white/10 shadow-xl z-10 relative"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-[#13141a]" />
            <span className="text-white/80">"¡Hola! Me sumo a tu partido..."</span>
          </motion.div>
        </div>
      )
    }
  ];

  // Auto advance timer like Instagram Stories
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
        return currentStep; // Stop at the last step
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
            className="relative w-full max-w-sm bg-[#0a0b0e] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Instagram style progress bars */}
            <div className="absolute top-4 left-4 right-12 flex gap-1 z-50">
              {steps.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
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
                  className="w-full flex flex-col items-center text-center space-y-8 h-[380px]"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                    className={`w-20 h-20 rounded-[2rem] ${steps[step].bg} ${steps[step].color} flex items-center justify-center shadow-2xl relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[2rem]" />
                    {(() => {
                      const Icon = steps[step].icon;
                      return <Icon size={40} className="relative z-10" />;
                    })()}
                  </motion.div>
                  
                  <div className="h-40 w-full rounded-3xl flex items-center justify-center relative">
                    {steps[step].graphic}
                  </div>

                  <div className="space-y-4 mt-auto">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{steps[step].title}</h3>
                    <p className="text-[13px] font-bold text-white/50 leading-relaxed px-2">
                      {steps[step].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-center relative z-20">
              {step < steps.length - 1 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                >
                  Continuar
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  ¡Entendido, a jugar! <Play size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
