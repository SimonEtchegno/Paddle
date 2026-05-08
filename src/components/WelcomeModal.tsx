'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { Trophy, Star, UserPlus, X, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function WelcomeModal() {
  const { profile, loading } = useGuestProfile();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Solo mostramos si no hay perfil, no está cargando y no se mostró en esta sesión
    if (!loading && !profile) {
      const hasSeen = sessionStorage.getItem('has_seen_welcome');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('has_seen_welcome', 'true');
        }, 1500); // Pequeño delay para no abrumar
        return () => clearTimeout(timer);
      }
    }
  }, [profile, loading]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all z-50"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-12 space-y-8 relative z-10">
              {/* Badge */}
              <div className="flex justify-center">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="bg-primary text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                >
                  Nuevo en el club
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                  ¡Armá tu <span className="text-primary">Ficha</span> Pro!
                </h2>
                <p className="text-sm text-white/50 font-medium max-w-[280px] mx-auto">
                  Unite a la comunidad de Peñarol, sumá puntos y personalizá tu perfil.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 gap-4 py-4">
                {[
                  { icon: Trophy, title: "Ranking Oficial", desc: "Sumá puntos en cada torneo y subí de categoría.", color: "text-yellow-400" },
                  { icon: Zap, title: "Reservas Rápidas", desc: "Tus datos se autocompletan al reservar turnos.", color: "text-primary" },
                  { icon: Star, title: "Personalización", desc: "Elegí tu avatar emoji y tu paleta favorita.", color: "text-blue-400" },
                ].map((f, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div className={`p-3 rounded-xl bg-white/5 ${f.color}`}>
                      <f.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase italic tracking-tight">{f.title}</h4>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/perfil');
                  }}
                  className="w-full bg-primary text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]"
                >
                  <UserPlus size={18} />
                  Crear Ficha Ahora
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Quizás más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
