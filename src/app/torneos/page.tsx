'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Calendar, Users, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { toast } from 'react-hot-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingPro } from '@/components/ui/LoadingPro';

interface Torneo {
  id: string;
  nombre: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  precio: number;
  abierto: boolean;
}

export default function TorneosPage() {
  const { profile } = useGuestProfile();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);
  
  const [jugador1, setJugador1] = useState('');
  const [jugador2, setJugador2] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myInscriptions, setMyInscriptions] = useState<string[]>([]);

  useEffect(() => {
    fetchTorneos();
  }, []);

  useEffect(() => {
    if (profile) {
      setJugador1(`${profile.nombre} ${profile.apellido}`);
      setTelefono(profile.telefono);
      fetchMyInscriptions(profile.telefono);
    }
  }, [profile]);

  const fetchMyInscriptions = async (phone: string) => {
    const { data } = await supabase
      .from('inscripciones_torneos')
      .select('torneo_id')
      .eq('telefono_contacto', phone);
    if (data) {
      setMyInscriptions(data.map(i => i.torneo_id));
    }
  };

  const fetchTorneos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('torneos')
        .select('*')
        .order('fecha', { ascending: true });
      if (error) throw error;
      setTorneos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugador1 || !jugador2 || !telefono) {
      return toast.error('Completá todos los campos');
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('inscripciones_torneos').insert({
        torneo_id: selectedTorneo?.id,
        jugador1,
        jugador2,
        telefono_contacto: telefono
      });

      if (error) throw error;

      toast.success('¡Inscripción enviada!');
      setSelectedTorneo(null);
      setJugador2('');
      if (selectedTorneo) {
        setMyInscriptions([...myInscriptions, selectedTorneo.id]);
      }
      
      // WhatsApp aviso al complejo
      const msg = encodeURIComponent(`¡Hola! Quisiera inscribirme al torneo "${selectedTorneo?.nombre}".
Pareja: ${jugador1} y ${jugador2}.
Tel: ${telefono}`);
      window.open(`https://wa.me/2923659885?text=${msg}`, '_blank');
      
    } catch (e) {
      toast.error('Error al inscribirse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="text-center space-y-4 pt-4">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Torneos <span className="text-primary">CAP</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Desafiá tu nivel y sumá puntos</p>
        </header>

        {loading ? (
          <LoadingPro />
        ) : torneos.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center space-y-4">
            <Trophy className="mx-auto opacity-10" size={64} />
            <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No hay torneos activos en este momento</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {torneos.map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-primary/20 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                      <Trophy size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight italic">{t.nombre}</h3>
                      <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {t.fecha}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" /> CAT: {t.categoria}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed max-w-lg">
                    {t.descripcion}
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Costo de Inscripción</p>
                    <p className="text-2xl font-black text-primary">${t.precio.toLocaleString()}</p>
                  </div>
                  
                  {myInscriptions.includes(t.id) ? (
                    <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-8 py-4 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(200,255,0,0.1)]">
                      <CheckCircle2 size={16} /> ¡Ya Inscripto!
                    </div>
                  ) : t.abierto ? (
                    <button 
                      onClick={() => setSelectedTorneo(t)}
                      className="w-full md:w-auto bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(200,255,0,0.2)] active:scale-95"
                    >
                      Inscribirme Ahora
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest bg-error/10 px-6 py-4 rounded-2xl border border-error/20">
                      <AlertCircle size={14} /> Cupos Agotados
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Inscripción */}
      <AnimatePresence>
        {selectedTorneo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTorneo(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass w-full max-w-md rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 space-y-8">
                <header className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/30 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Inscripción</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{selectedTorneo.nombre}</p>
                </header>

                <form onSubmit={handleInscribirse} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Nombre Pareja 1</label>
                    <input 
                      type="text" 
                      value={jugador1}
                      onChange={(e) => setJugador1(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Nombre Pareja 2</label>
                    <input 
                      type="text" 
                      value={jugador2}
                      onChange={(e) => setJugador2(e.target.value)}
                      placeholder="Ej: Pablo Gómez"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">WhatsApp de Contacto</label>
                    <input 
                      type="tel" 
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 2923..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_rgba(200,255,0,0.2)] hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                  >
                    {submitting ? 'Enviando...' : 'Confirmar Inscripción'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
