'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, Users, Send, CheckCircle2, Globe } from 'lucide-react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingPro } from '@/components/ui/LoadingPro';
import { clsx } from 'clsx';

interface Torneo {
  id: string;
  nombre: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  precio: number;
  abierto: boolean;
  visible: boolean;
}

export default function TorneosPage() {
  const router = useRouter();
  const { profile } = useGuestProfile();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [myInscriptions, setMyInscriptions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'mis' | 'todos'>('todos');

  useEffect(() => {
    fetchTorneos();

    const channel = supabase
      .channel('torneos_updates_final')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => {
        fetchTorneos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (profile?.telefono) {
      fetchMyInscriptions(profile.telefono);
    }
  }, [profile]);

  const fetchMyInscriptions = async (phone: string) => {
    const { data } = await supabase
      .from('inscripciones_torneos')
      .select('torneo_id')
      .eq('telefono_contacto', phone);
    if (data) {
      const ids = data.map(i => i.torneo_id);
      setMyInscriptions(ids);
      // Si el usuario tiene inscripciones, mostrar "Mis Torneos" por defecto
      // if (ids.length > 0) setActiveTab('mis');
    }
  };

  const fetchTorneos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('torneos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTorneos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPro />;

  const misTorneos = torneos.filter(t => myInscriptions.includes(t.id));
  const todosLosVisible = torneos.filter(t => t.visible !== false);
  const displayTorneos = activeTab === 'mis' ? misTorneos : todosLosVisible;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header */}
        <motion.header 
          id="tutorial-torneos-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none relative">
            Torneos <span className="text-primary relative inline-block">
              Peñarol
              <motion.div 
                className="absolute -inset-2 bg-primary/20 blur-xl rounded-full -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-xs md:text-sm font-bold uppercase tracking-widest max-w-2xl"
          >
            Explorá los próximos eventos y seguí tu progreso.
          </motion.p>

          {/* Tabs */}
          {profile?.telefono && (
            <div id="tutorial-torneos-tabs" className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
              <button
                onClick={() => setActiveTab('mis')}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'mis'
                    ? 'bg-primary text-black'
                    : 'opacity-40 hover:opacity-70'
                )}
              >
                <Trophy size={13} />
                Mis Torneos
                {misTorneos.length > 0 && (
                  <span className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black',
                    activeTab === 'mis' ? 'bg-black/20' : 'bg-primary/20 text-primary'
                  )}>
                    {misTorneos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'todos'
                    ? 'bg-primary text-black'
                    : 'opacity-40 hover:opacity-70'
                )}
              >
                <Globe size={13} />
                Todos
              </button>
            </div>
          )}
        </motion.header>

        {/* Content */}
        <AnimatePresence mode="wait">
          {displayTorneos.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
            >
              <Trophy size={60} className="opacity-10" />
              <p className="text-xl font-black uppercase tracking-widest opacity-20">
                {activeTab === 'mis' 
                  ? 'No estás inscripto en ningún torneo'
                  : 'No hay torneos disponibles'}
              </p>
              {activeTab === 'mis' && (
                <button
                  onClick={() => setActiveTab('todos')}
                  className="text-primary text-[11px] font-black uppercase tracking-widest hover:underline"
                >
                  Ver todos los torneos →
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
                exit: { opacity: 0 }
              }}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid gap-6"
            >
              {displayTorneos.map((t, idx) => {
                const isInscribed = myInscriptions.includes(t.id);
                return (
                  <motion.div
                    key={t.id}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      boxShadow: "0 20px 40px -15px rgba(136,130,220,0.15)",
                      borderColor: "rgba(136,130,220,0.4)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/torneos/${t.id}`)}
                    className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group cursor-pointer relative overflow-hidden"
                  >
                    {/* Glow de fondo en hover */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                      style={{ transform: "skewX(-20deg) translateX(-150%)" }}
                      whileHover={{ transform: "skewX(-20deg) translateX(150%)", transition: { duration: 1.5, repeat: Infinity, ease: "linear" } }}
                    />

                    <div className="flex items-center gap-6 relative z-10">
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={clsx(
                        "w-16 h-16 rounded-3xl flex items-center justify-center border",
                        isInscribed 
                          ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(136,130,220,0.3)]"
                          : "bg-white/5 border-white/10 text-white/60 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300"
                      )}>
                        <Trophy size={32} />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-3xl font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{t.nombre}</h3>
                          {isInscribed && (
                            <motion.span 
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(136,130,220,0.2)]"
                            >
                              <CheckCircle2 size={10} /> Ya Inscripto
                            </motion.span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest opacity-50">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {t.fecha}</span>
                          <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" /> CAT: {t.categoria}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 min-w-[200px] relative z-10">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Valor Inscripción</p>
                        <motion.p className="text-3xl font-black text-white group-hover:text-primary transition-colors">
                          ${t.precio?.toLocaleString()}
                        </motion.p>
                      </div>
                      <motion.div 
                        whileHover={{ paddingRight: '2rem' }}
                        className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all flex items-center gap-2 relative overflow-hidden"
                      >
                        Ver Detalles 
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <Send size={14} />
                        </motion.span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
