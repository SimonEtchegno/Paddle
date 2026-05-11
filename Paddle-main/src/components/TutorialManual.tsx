'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Calendar, Trophy, Users, Star, BookOpen, MessageCircle, UserCircle, MapPin } from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  tip: string;
}

const SLIDES: Slide[] = [
  {
    title: "Bienvenido a la",
    subtitle: "Nueva Era del Pádel",
    description: "Gestioná tus turnos, anotate a torneos y armá partidos abiertos, todo desde un solo lugar. Diseñado para que solo te preocupes por entrar a la cancha.",
    icon: Star,
    color: "from-primary to-purple-600",
    tip: "Tip: Completá tu perfil para que otros jugadores te reconozcan rápido."
  },
  {
    title: "Reservá tu",
    subtitle: "Turno en Segundos",
    description: "Calendario en tiempo real. Elegí el día, mirá las canchas disponibles y confirmá tu reserva. Recibirás un aviso por WhatsApp al instante.",
    icon: Calendar,
    color: "from-blue-500 to-cyan-400",
    tip: "Tip: Reservá con tiempo los fines de semana, ¡vuelan!"
  },
  {
    title: "Armá tus",
    subtitle: "Partidos Abiertos",
    description: "¿Te falta gente? Publicá tu partido y buscá pareja o rivales de tu mismo nivel. El sistema te avisará cuando alguien solicite unirse.",
    icon: Users,
    color: "from-green-500 to-emerald-400",
    tip: "Tip: Podés compartir el link de tu partido por WhatsApp directamente."
  },
  {
    title: "Torneos y",
    subtitle: "Competición Pro",
    description: "Seguí los cuadros, zonas e inscripciones de cada torneo. Mantené tu ranking actualizado y competí contra los mejores del complejo.",
    icon: Trophy,
    color: "from-yellow-500 to-orange-400",
    tip: "Tip: Revisá la sección 'Zonas' para ver cuándo te toca jugar."
  },
  {
    title: "Ranking y",
    subtitle: "Progreso Local",
    description: "Sumá puntos en cada torneo y escalá en el ranking del complejo. Compará tu nivel con otros jugadores de tu categoría.",
    icon: BookOpen,
    color: "from-pink-500 to-rose-400",
    tip: "Tip: ¡Los torneos Pro dan el doble de puntos!"
  },
  {
    title: "Perfil y",
    subtitle: "Nivel de Juego",
    description: "Personalizá tu ficha, indicá tu posición (Drive/Revés) y tu nivel. Esto ayuda a que el sistema te sugiera partidos ideales para vos.",
    icon: UserCircle,
    color: "from-indigo-500 to-violet-400",
    tip: "Tip: ¡Mantener tu nivel actualizado garantiza mejores partidos!"
  },
  {
    title: "WhatsApp y",
    subtitle: "Notificaciones",
    description: "Olvidate de los grupos de chat pesados. El sistema te avisa por privado cuando tu turno se confirma o cuando alguien se une a tu partido.",
    icon: MessageCircle,
    color: "from-green-400 to-teal-500",
    tip: "Tip: Guardá el número del club para ver siempre las imágenes."
  },
  {
    title: "El Complejo",
    subtitle: "Peñarol Pádel",
    description: "Canchas de última generación y el mejor ambiente para disfrutar de tu deporte favorito. Un lugar diseñado por y para fanáticos del pádel.",
    icon: MapPin,
    color: "from-orange-500 to-red-400",
    tip: "Tip: ¡Vení unos minutos antes para calentar y conocer a tus rivales!"
  }
];

export function TutorialManual({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const CurrentIcon = SLIDES[current].icon;

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl aspect-[4/5] md:aspect-video glass rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row"
        >
          {/* Left Side: Visual/Icon */}
          <div className={`w-full md:w-[45%] bg-gradient-to-br ${SLIDES[current].color} p-12 flex flex-col items-center justify-center text-black relative`}>
            <motion.div
              key={`icon-${current}`}
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative z-10"
            >
              <CurrentIcon size={180} strokeWidth={1} />
            </motion.div>
            
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
            <div className="absolute bottom-12 left-12 right-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-black"
                animate={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-between bg-[#0a0b0e] relative">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-20"
            >
              <X size={24} />
            </button>

            <div className="space-y-8 pt-8 md:pt-0">
              <motion.div
                key={`text-${current}`}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">{SLIDES[current].title}</p>
                  <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9]">
                    {SLIDES[current].subtitle}
                  </h3>
                </div>
                
                <p className="text-sm md:text-lg opacity-50 font-medium leading-relaxed max-w-md">
                  {SLIDES[current].description}
                </p>

                {/* Pro Tip Box */}
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl inline-block">
                  <p className="text-xs md:text-sm font-bold text-primary italic">
                    ✨ {SLIDES[current].tip}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-white/5">
              <div className="flex gap-3">
                {SLIDES.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-12 bg-primary' : 'w-3 bg-white/10 hover:bg-white/20'}`}
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={prev}
                  className="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={next}
                  className="h-14 px-10 rounded-2xl bg-primary text-black flex items-center gap-3 font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)]"
                >
                  {current === SLIDES.length - 1 ? "¡A Jugar!" : "Siguiente"}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
