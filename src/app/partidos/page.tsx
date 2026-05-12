'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PartidoAbierto, UnionPartido } from '@/types';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { useSport } from '@/hooks/useSport';
import { Users, Calendar, Clock, Trophy, Send, Trash2, Check, X, User, AlertTriangle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateMatchModal } from '@/components/matches/CreateMatchModal';
import { MatchTutorial } from '@/components/matches/MatchTutorial';
import { LoadingPro } from '@/components/ui/LoadingPro';

export default function PartidosPage() {
  const { profile } = useGuestProfile();
  const [partidos, setPartidos] = useState<PartidoAbierto[]>([]);
  const [solicitudes, setSolicitudes] = useState<UnionPartido[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<UnionPartido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [filterLevel, setFilterLevel] = useState('Todos');

  const { sport } = useSport();
  const CATEGORIES = sport === 'futbol' 
    ? ['Todos', 'Amateur', 'Intermedio', 'Avanzado'] 
    : ['Todos', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra', 'Pro'];

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
        .select(`
          *,
          uniones_partidos (
            user_id,
            nombre_interesado,
            estado,
            whatsapp_interesado
          )
        `)
        .gte('fecha', hoy)
        .eq('deporte', sport || 'padel')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      // If 'deporte' column is missing, it will throw an error. We fallback to old behavior:
      if (pError && pError.message.includes('column')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('partidos_abiertos')
          .select(`*, uniones_partidos (user_id, nombre_interesado, estado, whatsapp_interesado)`)
          .gte('fecha', hoy)
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true });
        
        if (fallbackError) throw fallbackError;
        
        // Local filter based on nivel
        const isFutbolNivel = (n: string) => ['Amateur', 'Intermedio', 'Avanzado'].includes(n);
        const filtered = (fallbackData || []).filter((p: any) => 
          sport === 'futbol' ? isFutbolNivel(p.nivel) : !isFutbolNivel(p.nivel)
        );
        setPartidos(filtered);
      } else if (pError) {
        throw pError;
      } else {
        setPartidos(pData || []);
      }

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
    fetchData();
    if (profile?.categoria) {
      setFilterLevel(profile.categoria);
    }

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
      fetchData(true);
      const msg = encodeURIComponent(`¡Hola! Me gustaría sumarme a tu partido de ${sport === 'futbol' ? 'Fútbol 5' : 'Pádel'} del ${p.fecha} a las ${p.hora} hs. ¿Me confirmás?`);
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
    const text = encodeURIComponent(`${sport === 'futbol' ? '⚽' : '🎾'} ¡Faltan ${p.jugadores_faltantes} para jugar al ${sport === 'futbol' ? 'Fútbol 5' : 'Pádel'}!
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
      const msg = encodeURIComponent(`¡Hola ${u.nombre_interesado}! Te confirmo que ya estás anotado en el partido de las ${u.partidos_abiertos?.hora} hs. ¡Nos vemos en la cancha! ${sport === 'futbol' ? '⚽' : '🎾'}`);
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
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Partidos <span className="text-primary">Abiertos</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Unite a jugar o armá tu equipo</p>
        </header>

        <div className="flex justify-center">
            <button 
              onClick={() => setIsTutorialOpen(true)}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                ?
              </div>
              ¿Cómo funciona?
            </button>
        </div>

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
            <div id="tutorial-partidos-list" className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Partidos Disponibles</h3>
                <button 
                  id="tutorial-partidos-publish"
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
                  const cat = p.nivel || (sport === 'futbol' ? 'Intermedio' : '7ma');
                  const levelNum = esMio ? (profile?.nivel || 1.0) : (p.nivel_num || 1.0);

                  // Visuals based on sport
                  let isDiamond = false, isGold = false, isRed = false, isPurple = false, isGreen = false;
                  if (sport === 'futbol') {
                    isDiamond = cat === 'Avanzado';
                    isGold = cat === 'Intermedio';
                    isGreen = cat === 'Amateur';
                  } else {
                    isDiamond = cat === '2da' || (cat === '1ra' && levelNum >= 6.8);
                    isGold = cat === '1ra' && levelNum < 6.8;
                    isRed = cat === '3ra';
                    isPurple = cat === '5ta';
                    isGreen = cat === '6ta';
                  }
                  
                  const auraColor = isDiamond ? "bg-cyan-400" : isGold ? "bg-yellow-400" : isRed ? "bg-red-500" : isPurple ? "bg-purple-500" : isGreen ? "bg-emerald-500" : "bg-zinc-400";
                  const ringBorder = isDiamond ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]" : isGold ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]" : isGreen ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "border-white/20";
                  const categoryLabel = cat.toUpperCase();

                  const miUnion = p.uniones_partidos?.find(u => u.user_id === profile?.telefono || u.whatsapp_interesado === profile?.telefono);
                  const isPending = miUnion?.estado === 'pendiente';
                  const isConfirmed = miUnion?.estado === 'confirmado';
                  const jugadoresConfirmados = p.uniones_partidos?.filter(u => u.estado === 'confirmado') || [];

                  return (
                    <motion.div 
                      layout
                      whileHover={{ scale: 1.01, y: -2 }}
                      key={p.id} 
                      className={clsx(
                        "relative p-6 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all border overflow-hidden",
                        completo ? "opacity-60 border-white/5 bg-black/20" : 
                        isDiamond ? "bg-gradient-to-br from-cyan-950/40 to-black/60 border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]" :
                        isGold ? "bg-gradient-to-br from-yellow-950/40 to-black/60 border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.15)]" :
                        isRed ? "bg-gradient-to-br from-red-950/40 to-black/60 border-red-500/20" :
                        "bg-white/5 border-white/10"
                      )}
                    >
                      {/* Category Badge - Corner */}
                      <div className="absolute top-0 right-0">
                        <div className={clsx(
                          "px-5 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-[0.2em] italic flex items-center gap-2",
                          isDiamond ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]" :
                          isGold ? "bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]" :
                          isRed ? "bg-red-500 text-white" :
                          isPurple ? "bg-purple-500 text-white" :
                          isGreen ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          "bg-white/10 text-white/60"
                        )}>
                          {sport === 'futbol' ? <Users size={10} /> : <Trophy size={10} />}
                          {categoryLabel}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          {/* Mini-Avatar Pro */}
                          <div className="relative">
                            {/* Aro de Neón Legendario */}
                            <div className={clsx(
                              "absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse scale-150 transition-colors duration-700",
                              auraColor
                            )} />
                            
                            <div className={clsx(
                              "w-16 h-16 bg-zinc-900 rounded-full border-2 backdrop-blur-xl flex items-center justify-center relative z-10 shadow-2xl transition-all duration-500 overflow-hidden",
                              ringBorder
                            )}>
                              {(esMio ? profile?.avatar_url : p.avatar_url) ? (
                                <img 
                                  src={esMio ? profile?.avatar_url : p.avatar_url}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                  {p.nombre_creador.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                              )}
                              
                            </div>
                          </div>

                          <div>
                            <p className="font-black text-xl uppercase tracking-tighter italic flex items-center gap-2">
                              {p.nombre_creador}
                              {esMio && <span className="bg-primary text-black text-[8px] px-2 py-0.5 rounded-full font-black tracking-widest">TÚ</span>}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] opacity-50">
                              <span className="flex items-center gap-1.5"><Calendar size={12} className={isGold ? "text-yellow-400" : isDiamond ? "text-cyan-400" : "text-primary"} /> {format(parseISO(p.fecha), 'd MMM', { locale: es })}</span>
                              <span className="flex items-center gap-1.5"><Clock size={12} className={isGold ? "text-yellow-400" : isDiamond ? "text-cyan-400" : "text-primary"} /> {p.hora} hs</span>
                              <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                {sport === 'futbol' 
                                  ? <Users size={10} className={isGold ? "text-yellow-400" : isDiamond ? "text-cyan-400" : "text-primary"} />
                                  : <Trophy size={10} className={isGold ? "text-yellow-400" : isDiamond ? "text-cyan-400" : "text-primary"} />
                                } {p.nivel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 w-full sm:w-auto">
                        <div className="flex flex-col gap-2 w-full sm:w-auto text-left sm:text-right">
                          {jugadoresConfirmados.length > 0 && (
                            <div className="flex flex-wrap sm:justify-end gap-1 mb-1">
                              {jugadoresConfirmados.map((jc, i) => (
                                <span key={i} className="text-[9px] bg-white/10 px-2 py-1 rounded-md font-bold text-white/80 uppercase">
                                  {jc.nombre_interesado}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Cupos</p>
                            <p className={clsx("text-sm font-black", completo ? "text-primary" : "text-white")}>
                              {completo ? "¡COMPLETO!" : `Faltan ${p.jugadores_faltantes}`}
                            </p>
                          </div>
                        </div>

                        {esMio && (
                          <div className="flex gap-2 relative z-50 self-end mt-2 sm:mt-0">
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

                        {!esMio && (
                          <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                            {isConfirmed ? (
                              <div className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-success/20 text-success border border-success/30 flex items-center justify-center gap-2">
                                <Check size={16} /> Adentro
                              </div>
                            ) : isPending ? (
                              <div className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/10 text-white/60 flex items-center justify-center gap-2 border border-white/10">
                                <Clock size={16} /> Solicitud Enviada
                              </div>
                            ) : !completo ? (
                              <button 
                                onClick={() => handleJoin(p)}
                                className={clsx(
                                  "w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2",
                                  isDiamond ? "bg-cyan-400 text-black shadow-cyan-400/20" :
                                  isGold ? "bg-yellow-400 text-black shadow-yellow-400/20" :
                                  "bg-primary text-white"
                                )}
                              >
                                <Send size={16} /> Sumarme
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
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

      <MatchTutorial 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </PageWrapper>
  );
}
