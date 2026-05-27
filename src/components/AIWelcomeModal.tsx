'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, MessageSquareText } from 'lucide-react';

export function AIWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenAI = localStorage.getItem('has_seen_ai_modal');
    // El modal PRO usa sessionStorage y la key 'has_seen_welcome'
    const hasSeenWelcome = sessionStorage.getItem('has_seen_welcome');

    if (!hasSeenAI) {
      // Si ya vio el modal PRO en esta sesión (o no aplica), mostramos este rápido
      // Si no lo vio, le damos más tiempo (ej: 8 segundos) para que cierre el PRO tranquilo
      const delay = hasSeenWelcome === 'true' ? 1000 : 8000;
      
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('has_seen_ai_modal', 'true');
  };

  const handleAction = () => {
    handleClose();
    // Simulate clicking the chat widget button if it exists
    const chatBtn = document.getElementById('chat-widget-button');
    if (chatBtn) chatBtn.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop with strong blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* Ambient glowing orbs */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              {/* Icon Container */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-xl relative z-10"
                >
                  <Bot size={48} className="text-purple-400" />
                </motion.div>
                
                {/* Floating sparkles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 z-0"
                >
                  <Sparkles size={24} className="absolute -top-4 -left-4 text-blue-400" />
                  <Sparkles size={16} className="absolute -bottom-2 -right-4 text-purple-400" />
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-2">
                  System Update
                </div>
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-tight">
                  El futuro del club <br />
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">ya está acá.</span>
                </h2>
                <p className="text-white/60 font-medium leading-relaxed max-w-sm mx-auto">
                  Presentamos nuestro nuevo Asistente Virtual con IA. Pedile que te reserve una cancha, buscá compañeros para tu nivel o preguntale por el ranking... todo chateando.
                </p>
              </div>

              <button
                onClick={handleAction}
                className="w-full bg-primary text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]"
              >
                <Bot size={18} className="opacity-70" />
                Hablar con la IA
                <MessageSquareText size={18} className="opacity-70" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
