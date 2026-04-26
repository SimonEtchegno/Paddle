'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ChevronDown, 
  HelpCircle, 
  Play, 
  Calendar, 
  Trophy, 
  Users, 
  Settings, 
  ShieldCheck,
  MousePointer2
} from 'lucide-react';

const FAQS = [
  {
    question: "¿Cómo reservo un turno?",
    answer: "Es simple: seleccioná la fecha en el calendario, elegí una cancha y horario disponible, completá tus datos y ¡listo! Te llegará una confirmación por WhatsApp."
  },
  {
    question: "¿Qué pasa si otra persona reserva el mismo turno al mismo tiempo?",
    answer: "Nuestra plataforma funciona en tiempo real. Si alguien confirma un turno milisegundos antes que vos, el sistema te avisará con un error y el turno pasará a verse como 'Ocupado' inmediatamente para evitar errores."
  },
  {
    question: "¿Hay un límite de reservas por persona?",
    answer: "Sí, para que todos tengan oportunidad de jugar, el sistema permite un máximo de 3 turnos reservados por número de teléfono para un mismo día."
  },
  {
    question: "¿Cómo se pagan los turnos?",
    answer: "Por el momento, las reservas se abonan directamente en el complejo al llegar. Algunos torneos especiales pueden requerir una seña previa vía transferencia, lo cual se te informará al inscribirte."
  },
  {
    question: "¿Cómo funcionan los Partidos Abiertos?",
    answer: "Si te falta gente para jugar, podés crear un 'Partido Abierto'. Otros jugadores verán tu partido y podrán solicitar unirse. Vos recibís una notificación y aceptás a quien quieras."
  }
];

const TUTORIALS = [
  { id: 'reservas', name: 'Cómo Reservar', icon: Calendar, color: 'bg-blue-500' },
  { id: 'partidos', name: 'Partidos Abiertos', icon: Users, color: 'bg-green-500' },
  { id: 'torneos', name: 'Inscripción Torneos', icon: Trophy, color: 'bg-yellow-500' },
  { id: 'admin', name: 'Gestión para Dueños', icon: Settings, color: 'bg-purple-500' },
];

import { TutorialManual } from '@/components/TutorialManual';
import { BookOpen } from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const { startBookingTour, startTournamentTour, startMatchesTour, startAdminTour } = useTutorial();

  const handleAdminTutorial = () => {
    if (adminPin === '1234') { // Pin de seguridad simple para el tutorial
      setShowAdminLogin(false);
      setAdminPin('');
      toast.success('Acceso Administrador concedido');
      // Redirigir al admin y marcar que queremos empezar el tour
      window.location.href = '/admin?tour=true';
    } else {
      toast.error('Pin incorrecto');
    }
  };

  return (
    <PageWrapper>
      <TutorialManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      
      {/* Modal de Acceso Admin para Tutorial */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-8 rounded-[2.5rem] border border-primary/20 w-full max-w-sm text-center space-y-6 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <Settings size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Acceso Restringido</h3>
                <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest leading-relaxed">Ingresá el PIN de seguridad para ver la guía de administración</p>
              </div>
              <input 
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="PIN"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:border-primary transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminTutorial()}
              />
              <button 
                onClick={handleAdminTutorial}
                className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
              >
                Ver Guía de Dueño
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-16 pb-20">
        
        {/* Header */}
        <header className="text-center space-y-8 pt-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary/20 rounded-3xl border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
          >
            <HelpCircle size={40} />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Centro de <span className="text-primary">Ayuda</span></h1>
            <p className="text-sm md:text-base opacity-50 font-bold uppercase tracking-widest">Aprendé a usar la plataforma como un Pro</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsManualOpen(true)}
              className="mt-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 mx-auto group hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <BookOpen size={20} className="text-primary group-hover:animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ver Manual de Usuario Visual</span>
            </motion.button>
          </div>
        </header>

        {/* Tutoriales Interactivos (Próximamente / Simulación) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pl-4">
            <Play size={20} className="text-primary" />
            <h3 className="text-xl font-black uppercase tracking-widest italic">Guías Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TUTORIALS.map((tut) => (
              <motion.button
                key={tut.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (tut.id === 'reservas') startBookingTour();
                  else if (tut.id === 'torneos') startTournamentTour();
                  else if (tut.id === 'partidos') startMatchesTour();
                  else if (tut.id === 'admin') setShowAdminLogin(true);
                }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 text-left group transition-all hover:border-primary/30"
              >
                <div className={`w-16 h-16 rounded-2xl ${tut.color}/20 flex items-center justify-center text-white shadow-lg`}>
                  <tut.icon size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black uppercase tracking-tight italic">{tut.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MousePointer2 size={12} className="text-primary animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">Iniciar Tour Interactivo</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pl-4">
            <ShieldCheck size={20} className="text-primary" />
            <h3 className="text-xl font-black uppercase tracking-widest italic">Preguntas Frecuentes</h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div 
                key={index}
                className="glass rounded-[2rem] border border-white/5 overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-base md:text-lg font-bold pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    className="text-primary shrink-0"
                  >
                    <ChevronDown size={24} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-8 text-sm md:text-base opacity-60 leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Footer de Ayuda */}
        <footer className="text-center bg-primary/5 p-12 rounded-[3rem] border border-primary/10">
          <h4 className="text-xl font-black uppercase tracking-tight italic mb-4">¿No encontraste lo que buscabas?</h4>
          <p className="text-sm opacity-50 mb-8 max-w-md mx-auto">Nuestro equipo de soporte técnico está disponible 24/7 para ayudarte con cualquier duda técnica o de gestión.</p>
          <button 
            className="px-10 py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]"
          >
            Contactar Soporte Técnico
          </button>
        </footer>

      </div>
    </PageWrapper>
  );
}
