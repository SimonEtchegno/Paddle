'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva } from '@/types';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { Calendar, MapPin, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageWrapper } from '@/components/PageWrapper';
import { LoadingPro } from '@/components/ui/LoadingPro';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MisTurnosPage() {
  const { profile } = useGuestProfile();
  const [turnos, setTurnos] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [turnoToCancel, setTurnoToCancel] = useState<{id: string, fecha: string, hora: string} | null>(null);

  const fetchMisTurnos = async () => {
    if (!profile) return setLoading(false);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('telefono', profile.telefono)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: true });

      if (error) throw error;
      setTurnos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisTurnos();
  }, [profile]);

  const handleCancelTrigger = (id: string, fecha: string, hora: string) => {
    // Combinar fecha y hora para una comparación precisa
    const turnDate = new Date(`${fecha}T${hora}:00`);
    const now = new Date();

    if (turnDate < now) {
      return toast.error('No se pueden cancelar turnos pasados');
    }
    setTurnoToCancel({ id, fecha, hora });
  };

  const confirmCancel = async () => {
    if (!turnoToCancel) return;
    try {
      localStorage.setItem(`user_cancelled_${turnoToCancel.id}`, 'true');
      const { error } = await supabase.from('reservas').delete().eq('id', turnoToCancel.id);
      if (error) throw error;
      
      toast.success('Turno cancelado');
      setTurnoToCancel(null);
      fetchMisTurnos();
    } catch (e) {
      toast.error('Error al cancelar');
    }
  };

  if (loading) return (
    <PageWrapper>
      <LoadingPro />
    </PageWrapper>
  );

  if (!profile) return (
    <div className="py-20 text-center space-y-4">
      <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Debés completar tu perfil primero</p>
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        <header className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Mis <span className="text-primary">Turnos</span></h2>
          <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest">Gestioná tus reservas activas</p>
        </header>

        {turnos.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center space-y-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
              <Calendar size={32} />
            </div>
            <p className="text-sm font-bold opacity-30 uppercase tracking-[0.2em]">Aún no tenés reservas</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {turnos.map((t) => {
              const turnDate = new Date(`${t.fecha}T${t.hora}:00`);
              const isUpcoming = turnDate >= new Date();
              const dateObj = parseISO(t.fecha);
              
              return (
                <div key={t.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative group">
                  {!isUpcoming && <div className="absolute inset-0 bg-black/40 grayscale pointer-events-none" />}
                  
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex flex-col items-center justify-center border border-primary/20">
                      <span className="text-[10px] font-black uppercase text-primary leading-none">{format(dateObj, 'MMM', { locale: es })}</span>
                      <span className="text-xl font-black text-white">{format(dateObj, 'dd')}</span>
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight italic flex items-center gap-2">
                        Cancha {t.cancha}
                        {!isUpcoming && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded opacity-40">PASADO</span>}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-50">
                        <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {t.hora} hs</span>
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> Peñarol</span>
                      </div>
                    </div>
                  </div>

                  {isUpcoming && (
                    <button 
                      onClick={() => handleCancelTrigger(t.id, t.fecha, t.hora)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-error/10 text-error rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all border border-error/10"
                    >
                      <Trash2 size={16} />
                      Cancelar Turno
                    </button>
                  )}
                  
                  {!isUpcoming && (
                    <div className="flex items-center gap-2 text-white/20 font-black text-[10px] uppercase tracking-[0.2em] pr-4">
                      <CheckCircle2 size={16} /> Completado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {turnoToCancel && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTurnoToCancel(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass w-full max-w-sm rounded-[2.5rem] border border-white/10 overflow-hidden p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto border border-error/20">
                <AlertTriangle size={40} className="text-error" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight italic text-white">¿Cancelar Turno?</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Recordá avisar por WhatsApp si es sobre la hora.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setTurnoToCancel(null)}
                  className="bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all text-white"
                >
                  Volver
                </button>
                <button 
                  onClick={confirmCancel}
                  className="bg-error text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  Sí, Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
