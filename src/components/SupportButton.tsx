'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, MessageSquare, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "2923659885"; // Número del complejo

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-[#0a0b0e]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-72 max-w-[calc(100vw-3rem)] mb-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight italic">Soporte <span className="text-primary">Peñarol</span></h4>
                  <p className="text-[10px] font-bold opacity-40 uppercase">¿En qué podemos ayudarte?</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors opacity-40">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/ayuda';
                }}
                className="w-full flex items-center gap-3 p-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                <HelpCircle size={18} className="text-primary" />
                Guías y Ayuda
              </button>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                className="flex items-center gap-3 p-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]"
              >
                <MessageCircle size={18} />
                WhatsApp Directo
              </a>
              <a 
                href={`tel:${whatsappNumber}`}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <Phone size={18} className="text-primary" />
                Llamar al Complejo
              </a>
            </div>

            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 text-center mt-4">Atención de 09:00 a 23:00</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="tutorial-support"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(200,255,0,0.3)] border-4 border-[#0a0b0e] relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-[#0a0b0e] animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-[#0a0b0e]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
