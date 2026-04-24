'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PartidoAbierto, UnionPartido } from '@/types';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { Users, Calendar, Clock, Trophy, Send, Trash2, Check, X, User, AlertTriangle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateMatchModal } from '@/components/matches/CreateMatchModal';
import { LoadingPro } from '@/components/ui/LoadingPro';

export default function PartidosPage() {
  const { profile } = useGuestProfile();
  const [partidos, setPartidos] = useState<PartidoAbierto[]>([]);
  const [solicitudes, setSolicitudes] = useState<UnionPartido[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<UnionPartido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [filterLevel, setFilterLevel] = useState('Todos');

  const CATEGORIES = ['Todos', 'Principiante', '7ma', '6ta', '5ta', '4ta', '3ra', 'Pro'];

  const fetchData = async (isBackground = false) => {
    if (!profile) {
      setLoading(false);
      return;
    }

    if (!isBackground) setLoading(true);
    try {
      const hoy = format(new Date(), 'yyyy-MM-dd');
      
      // 1. Cargar Partidos
      const { data: pData, error: pError } = await supabase
        .from('partidos_abiertos')
        .select('*')
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (pError) throw pError;
      setPartidos(pData || []);

      // 2. Cargar Solicitudes (Simplificado)
      const { data: uData, error: uError } = await supabase
        .from('uniones_partidos')
        .select('*, partidos_abiertos(*)')
        .eq('estado', 'pendiente');

      if (uError) throw uError;

      // Filtrar manualmente por el dueño del partido (Usando contacto_whatsapp que es texto)
      const misSolicitudes = (uData || []).filter((u: any) => 
        u.partidos_abiertos && u.partidos_abiertos.contacto_whatsapp === profile.telefono
      );
      
      setSolicitudes(misSolicitudes);

      // 3. Cargar mis participaciones confirmadas
      const { data: confData } = await supabase
        .from('uniones_partidos')
        .select('*, partidos_abiertos(*)')
        .eq('estado', 'confirmado')
        .eq('whatsapp_interesado', profile.telefono);

      // Filtrar solo los que son para hoy o futuro
      const misConf = (confData || []).filter((c: any) => c.partidos_abiertos && c.partidos_abiertos.fecha >= hoy);
      setConfirmaciones(misConf);

      // 4. Chequear si el usuario tiene reservas activas
      const { data: resData } = await supabase
        .from('reservas')
        .select('id')
        .eq('telefono', profile.telefono)
        .gte('fecha', hoy)
        .limit(1);
        
      setHasActiveReservation(!!(resData && resData.length > 0));

    } catch (e: any) {
      console.error('Error en fetchData:', e);
      if (!isBackground) toast.error('Error al cargar datos: ' + e.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Carga inicial con loader

    // Polling: Actualización en segundo plano cada 5 segundos (Simulación de Tiempo Real)
    const intervalId = setInterval(() => {
      fetchData(true); 
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [profile?.telefono]);

  const handleCreateSuccess = () => {
    fetchData();
  };

  const handleJoin = async (p: PartidoAbierto) => {
    if (!profile) return toast.error('Completá tu perfil para sumarte');

    try {
      const { error } = await supabase.from('uniones_partidos').insert({
        partido_id: p.id,
        user_id: profile.telefono,
        nombre_interesado: `${profile.nombre} ${profile.apellido}`,
        whatsapp_interesado: profile.telefono,
        estado: 'pendiente'
      });

      if (error) {
        if (error.code === '23505') return toast.error('Ya enviaste solicitud');
        throw error;
      }

      toast.success('¡Solicitud enviada!');
      const msg = encodeURIComponent(`¡Hola! Me gustaría sumarme a tu partido de Pádel del ${p.fecha} a las ${p.hora} hs. ¿Me confirmás?`);
      window.open(`https://wa.me/${p.contacto_whatsapp}?text=${msg}`, '_blank');
    } catch (e) {
      toast.error('Error al unirse');
    }
  };

  const handleDeleteMatch = (id: string) => {
    setMatchToDelete(id);
  };

  const confirmDelete = async () => {
    if (!matchToDelete) return;
    try {
      const { error } = await supabase.from('partidos_abiertos').delete().eq('id', matchToDelete);
      if (error) throw error;
      toast.success('Partido eliminado');
      setMatchToDelete(null);
      fetchData();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const handleShare = (p: PartidoAbierto) => {
    const text = encodeURIComponent(`🎾 ¡Faltan ${p.jugadores_faltantes} para jugar al Pádel!
📅 Fecha: ${format(parseISO(p.fecha), 'EEEE d/MM', { locale: es })}
⏰ Hora: ${p.hora} hs
🏆 Nivel: ${p.nivel}
📍 Complejo: Peñarol Pádel

¿Quién se suma? Sumate desde acá: ${window.location.origin}/partidos`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleConfirmPlayer = async (u: UnionPartido) => {
    try {
      await supabase.from('uniones_partidos').update({ estado: 'confirmado' }).eq('id', u.id);
      await supabase.from('partidos_abiertos')
        .update({ jugadores_faltantes: Math.max(0, (u.partidos_abiertos?.jugadores_faltantes || 1) - 1) })
        .eq('id', u.partido_id);
      toast.success('Jugador confirmado');
      
      // Aviso por WhatsApp al interesado
      const msg = encodeURIComponent(`¡Hola ${u.nombre_interesado}! Te confirmo que ya estás anotado en el partido de las ${u.partidos_abiertos?.hora} hs. ¡Nos vemos en la cancha! 🎾`);
      window.open(`https://wa.me/${u.whatsapp_interesado}?text=${msg}`, '_blank');

      fetchData();
    } catch (e) {
      toast.error('Error al confirmar');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        <header className="text-center space-y-2">
          <h2 className="text-4xl font-bold uppercase tracking-tight italic">Busco <span className="text-primary">Jugadores</span></h2>
          <p className="text-sm opacity-50 font-black uppercase tracking-[0.2em]">Armá tu partido o sumate a uno</p>
        </header>

        {/* Solicitudes Pendientes (Alerta / Popup integrado) */}
        {solicitudes.length > 0 && (
          <motion.section 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-50 bg-gradient-to-r from-secondary/20 to-primary/20 p-1 rounded-[2.5rem] shadow-[0_10px_40px_rgba(255,215,0,0.15)]"
          >
            <div className="glass bg-black/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2.4rem] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center animate-pulse border border-secondary/50">
                  <Users size={24} className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    ¡Tenés solicitudes! 
                    <span className="bg-secondary text-black text-xs px-2 py-0.5 rounded-full">{solicitudes.length}</span>
                  </h3>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest text-secondary">Alguien quiere sumarse a tu partido</p>
                </div>
              </div>

              <div className="grid gap-3">
                {solicitudes.map((u) => (
                  <div key={u.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-black text-lg uppercase italic">{u.nombre_interesado}</p>
                      <p className="text-[10px] opacity-50 font-bold uppercase tracking-tight">Para el partido de las {u.partidos_abiertos?.hora} hs</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleConfirmPlayer(u)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(136,130,220,0.3)]"
                      >
                        <Check size={16} /> Confirmar
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-white/10 px-4 py-3 rounded-xl hover:bg-error/20 hover:border-error transition-colors text-error uppercase font-black text-[10px] tracking-widest">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Mis Confirmaciones (Popup visual para el usuario aceptado) */}
        {confirmaciones.length > 0 && (
          <section className="space-y-3">
            {confirmaciones.map(c => (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={c.id} 
                className="bg-success/10 border border-success/30 p-5 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(76,175,80,0.15)]"
              >
                <div>
                  <h4 className="text-success font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    ¡Lugar Confirmado!
                  </h4>
                  <p className="text-xs uppercase font-bold opacity-80 mt-1">
                    Ya estás adentro del partido de las <span className="text-success">{c.partidos_abiertos?.hora} hs</span> ({c.partidos_abiertos?.fecha})
                  </p>
                </div>
                <div className="hidden sm:block opacity-50">
                  <Check size={32} className="text-success" />
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {/* Lista de Partidos */}
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Partidos Disponibles</h3>
              <button 
                onClick={() => {
                  if (!profile) {
                    return toast.error('Completá tu perfil primero');
                  }
                  if (!hasActiveReservation) {
                    return toast.error('¡Tenés que tener un turno reservado para buscar pareja!');
                  }
                  setIsModalOpen(true);
                }}
                className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(76,175,80,0.2)]"
              >
                + Publicar Partido
              </button>
            </div>

            {/* Selector de Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterLevel(cat)}
                  className={clsx(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    filterLevel === cat 
                      ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(136,130,220,0.3)]" 
                      : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingPro />
          ) : partidos.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center space-y-4">
              <Users className="mx-auto opacity-20" size={48} />
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest">No hay partidos activos</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {partidos
                .filter(p => filterLevel === 'Todos' || p.nivel === filterLevel)
                .map((p) => {
                const esMio = profile && p.contacto_whatsapp === profile.telefono;
                const completo = p.jugadores_faltantes <= 0;
                return (
                  <motion.div 
                    layout
                    whileHover={{ scale: 1.01 }}
                    key={p.id} 
                    className={clsx(
                      "glass p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:border-white/20",
                      completo && "opacity-60 border-primary/20 bg-primary/5"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-lg uppercase tracking-tight italic flex items-center gap-2">
                            {p.nombre_creador}
                            {esMio && <span className="bg-primary text-black text-[8px] px-1.5 py-0.5 rounded font-black tracking-normal">TÚ</span>}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-50">
                            <span className="flex items-center gap-1"><Calendar size={12} className="text-primary" /> {format(parseISO(p.fecha), 'd MMM', { locale: es })}</span>
                            <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {p.hora} hs</span>
                            <span className="flex items-center gap-1"><Trophy size={12} className="text-primary" /> {p.nivel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Cupos</p>
                        <p className={clsx("text-sm font-black", completo ? "text-primary" : "text-white")}>
                          {completo ? "¡COMPLETO!" : `Faltan ${p.jugadores_faltantes}`}
                        </p>
                      </div>

                      {esMio && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleShare(p)}
                            className="p-3 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                            title="Compartir partido"
                          >
                            <Share2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMatch(p.id)}
                            className="p-3 bg-error/10 text-error rounded-2xl hover:bg-error hover:text-white transition-all border border-error/20"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}

                      {!esMio && !completo && (
                        <button 
                          onClick={() => handleJoin(p)}
                          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(136,130,220,0.2)]"
                        >
                          Sumarme
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {matchToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMatchToDelete(null)}
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
                <h3 className="text-2xl font-black uppercase tracking-tight italic text-white">¿Borrar Partido?</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Esta acción no se puede deshacer.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setMatchToDelete(null)}
                  className="bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all text-white"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="bg-error text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  Sí, Borrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateMatchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
        profile={profile}
      />
    </PageWrapper>
  );
}
