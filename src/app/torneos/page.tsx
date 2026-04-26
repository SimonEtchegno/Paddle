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
      if (ids.length > 0) setActiveTab('mis');
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

  if (loading) return <LoadingPro />;

  const misTorneos = torneos.filter(t => myInscriptions.includes(t.id));
  const todosLosVisible = torneos.filter(t => t.visible !== false);
  const displayTorneos = activeTab === 'mis' ? misTorneos : todosLosVisible;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header */}
        <header className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            Torneos <span className="text-primary">Peñarol</span>
          </h1>
          <p className="text-xs md:text-sm opacity-40 font-bold uppercase tracking-widest max-w-2xl">
            Explorá los próximos eventos y seguí tu progreso.
          </p>

          {/* Tabs */}
          {profile?.telefono && (
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
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
        </header>

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6"
            >
              {displayTorneos.map((t, idx) => {
                const isInscribed = myInscriptions.includes(t.id);
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`/torneos/${t.id}`)}
                    className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-primary/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105",
                        isInscribed 
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        <Trophy size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-2xl font-black uppercase tracking-tight italic">{t.nombre}</h3>
                          {isInscribed && (
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 size={10} /> Ya Inscripto
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {t.fecha}</span>
                          <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" /> CAT: {t.categoria}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Inscripción</p>
                        <p className="text-2xl font-black text-primary">${t.precio?.toLocaleString()}</p>
                      </div>
                      <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all flex items-center gap-2">
                        Ver Detalles <Send size={14} />
                      </div>
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
