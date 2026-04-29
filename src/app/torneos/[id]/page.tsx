'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Trophy,
  Calendar,
  Users,
  ChevronLeft,
  Layout,
  Target,
  Award,
  Info,
  Clock,
  MapPin,
  Share2,
  CheckCircle2,
  Camera,
  Star,
  Crown
} from 'lucide-react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingPro } from '@/components/ui/LoadingPro';
import { TournamentZones } from '@/components/TournamentZones';
import { TournamentBracket } from '@/components/TournamentBracket';
import { TournamentConfig, Pair, Zone, BracketNode } from '@/types/tournament';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [torneo, setTorneo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useGuestProfile();
  const [activeTab, setActiveTab] = useState<'info' | 'zones' | 'bracket' | 'champions'>('zones');

  const [showInscribir, setShowInscribir] = useState(false);
  const [jugador1, setJugador1] = useState('');
  const [jugador2, setJugador2] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Auto-detect champions from bracket if manual data is missing
  const autoChampions = useMemo(() => {
    if (!torneo?.cuadro_data || !Array.isArray(torneo.cuadro_data)) return null;
    const finalMatch = torneo.cuadro_data.find((n: any) => n.stage === 'Final' && n.score);
    if (!finalMatch || !finalMatch.score) return null;

    const sets = finalMatch.score.split(/[\s,]+/).filter((s: string) => s.includes('-'));
    let p1S = 0, p2S = 0;
    sets.forEach((s: string) => {
      const [g1, g2] = s.split('-').map(Number);
      if (!isNaN(g1) && !isNaN(g2)) { if (g1 > g2) p1S++; else if (g2 > g1) p2S++; }
    });

    if (p1S === p2S) return null;

    return {
      winner: p1S > p2S ? finalMatch.p1 : finalMatch.p2,
      runnerUp: p1S > p2S ? finalMatch.p2 : finalMatch.p1,
      score: finalMatch.score
    };
  }, [torneo?.cuadro_data]);

  // For compatibility with other parts of the UI
  const champion = autoChampions?.winner;

  useEffect(() => {
    if (profile?.telefono) {
      setTelefono(profile.telefono);
      setJugador1(`${profile.nombre} ${profile.apellido}`);
      checkRegistration(profile.telefono);
    }
  }, [profile, id]);

  const checkRegistration = async (phone: string) => {
    const { data } = await supabase
      .from('inscripciones_torneos')
      .select('id')
      .eq('torneo_id', id)
      .eq('telefono_contacto', phone);

    if (data && data.length > 0) {
      setIsRegistered(true);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTournament();

    const channel = supabase
      .channel(`tournament_${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'torneos',
        filter: `id=eq.${id}`
      }, () => {
        fetchTournament();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchTournament = async () => {
    try {
      const searchId = isNaN(Number(id)) ? id : Number(id);
      const { data, error } = await supabase
        .from('torneos')
        .select('*')
        .eq('id', searchId)
        .single();

      if (error) throw error;
      setTorneo(data);



      const hasZones = data.zonas_data && data.zonas_data.length > 0;
      const hasBracket = data.cuadro_data && data.cuadro_data.length > 0;
      const hasChampions = data.champions_data && (data.champions_data.winner || data.champions_data.photoUrl);

      if (hasChampions) {
        setActiveTab('champions');
      } else if (hasBracket && !hasZones) {
        setActiveTab('bracket');
      } else if (hasZones) {
        setActiveTab('zones');
      } else {
        setActiveTab('info');
      }
    } catch (e) {
      console.error(e);
      toast.error('No se pudo cargar la información del torneo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPro />;
  if (!torneo) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <Trophy size={80} className="opacity-10" />
        <h2 className="text-2xl font-black uppercase tracking-widest opacity-20">Torneo no encontrado</h2>
        <button onClick={() => router.push('/torneos')} className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
          Volver a la lista
        </button>
      </div>
    </PageWrapper>
  );

  const handleInscribirse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugador1 || !jugador2 || !telefono) {
      return toast.error('Completá todos los campos');
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('inscripciones_torneos').insert({
        torneo_id: id,
        jugador1,
        jugador2,
        telefono_contacto: telefono
      });

      if (error) throw error;

      toast.success('¡Inscripción enviada!');
      setIsRegistered(true);
      setShowInscribir(false);

      // WhatsApp aviso al complejo
      const msg = encodeURIComponent(`¡Hola! Quisiera inscribirme al torneo "${torneo.nombre}".\nPareja: ${jugador1} y ${jugador2}.\nTel: ${telefono}`);
      window.open(`https://wa.me/2923460902?text=${msg}`, '_blank');

    } catch (e) {
      toast.error('Error al inscribirse');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Información', icon: Info },
    { id: 'zones', label: 'Zonas y Fixture', icon: Layout },
    { id: 'bracket', label: 'Cuadro Final', icon: Trophy },
    { id: 'champions', label: 'Campeones', icon: Crown },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('¡Link del torneo copiado!');
  };

  // Lógica de Prestigio para el Ambiente
  const isDiamante = profile?.nivel && profile.nivel >= 6.5;
  const isOro = profile?.nivel && profile.nivel >= 5.5;
  const accentColor = isDiamante ? "#22d3ee" : isOro ? "#facc15" : "#8882dc";

  return (
    <PageWrapper>
      {/* Ambiente Dinámico de Prestigio */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 z-0"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${isDiamante ? 'rgba(34,211,238,0.15)' : isOro ? 'rgba(250,204,21,0.15)' : 'rgba(136,130,220,0.1)'} 0%, transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8 pb-32 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/torneos')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={clsx(
                  "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                  torneo.categoria.includes('1ra') || torneo.categoria.includes('Pro')
                    ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "bg-primary/10 border-primary/20 text-primary"
                )}>
                  {torneo.categoria}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30 italic">
                  {torneo.fecha}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                {torneo.nombre}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Share2 size={16} /> Compartir
            </button>

            {champion ? (
              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(136,130,220,0.1)]">
                🏆 Torneo Finalizado
              </div>
            ) : isRegistered ? (
              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <CheckCircle2 size={16} /> ¡Ya Inscripto!
              </div>
            ) : (torneo.parejas_data?.length > 0 || !torneo.abierto) ? (
              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40 cursor-not-allowed">
                {torneo.parejas_data?.length > 0 ? '⚡ Torneo En Curso' : 'Inscripciones Cerradas'}
              </div>
            ) : (
              <button
                onClick={() => setShowInscribir(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(136,130,220,0.3)]"
              >
                <Target size={16} /> Inscribirme
              </button>
            )}
          </div>
        </div>

        {/* ... resto del hero ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Trophy size={200} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Parejas</p>
                  <p className="text-2xl font-black italic">{torneo.parejas_data?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Zonas</p>
                  <p className="text-2xl font-black italic">{torneo.zonas_data?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Estado</p>
                  <p className="text-2xl font-black italic text-primary">{torneo.abierto ? 'INSCRIPCIÓN' : 'EN CURSO'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Premios</p>
                  <p className="text-2xl font-black italic">COPA + $$$</p>
                </div>
              </div>
            </div>
          </div>

          <div className={clsx(
            "border p-10 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-4 transition-all duration-700",
            champion
              ? "bg-primary/10 border-primary/40 shadow-[0_0_50px_rgba(136,130,220,0.2)]"
              : "bg-primary/5 border-primary/20"
          )}>
            <motion.div
              animate={champion ? { rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 4 }}
            >
              <Award className="text-primary" size={48} />
            </motion.div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Campeón Actual</p>
              {champion ? (
                <motion.h3
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-black uppercase italic tracking-tighter text-primary"
                >
                  🏆 {champion}
                </motion.h3>
              ) : (
                <h3 className="text-2xl font-black uppercase italic tracking-tighter opacity-30 animate-pulse">
                  Buscando Ganador...
                </h3>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-black/20 p-2 rounded-[2.5rem] border border-white/5 sticky top-4 z-40 backdrop-blur-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all relative group",
                  isActive ? "text-black" : "text-white/40 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-public-detail"
                    className="absolute inset-0 bg-primary rounded-3xl shadow-[0_0_30px_rgba(136,130,220,0.4)]"
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10 hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-4">Detalles del Torneo</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-primary">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ubicación</p>
                        <p className="text-lg font-bold">Complejo CAP - Canchas de Vidrio</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-primary">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Fecha de Inicio</p>
                        <p className="text-lg font-bold">{torneo.fecha}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-primary">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Horarios</p>
                        <p className="text-lg font-bold">Turnos desde las 18:00 hs</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-4">Descripción</h3>
                  <p className="text-white/60 leading-relaxed font-medium">
                    {torneo.descripcion || "Este torneo reúne a los mejores jugadores de la categoría para competir en un formato de zonas con eliminación directa. ¡Vení a disfrutar del mejor padel!"}
                  </p>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 mb-1">Inscripción</p>
                      <p className="text-xl font-black text-primary">${torneo.precio?.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 mb-1">Categoría</p>
                      <p className="text-xl font-black">{torneo.categoria}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'zones' && (
              <motion.div
                key="zones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TournamentZones
                  zones={torneo.zonas_data || []}
                  allPairs={torneo.parejas_data || []}
                  highlightName={profile ? `${profile.nombre} ${profile.apellido}` : undefined}
                />
              </motion.div>
            )}

            {activeTab === 'bracket' && (
              <motion.div
                key="bracket"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Banner de Campeón */}
                {champion && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="relative overflow-hidden glass rounded-[2.5rem] border border-primary/40 p-8 text-center shadow-[0_0_60px_rgba(136,130,220,0.25)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
                        className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40"
                      >
                        <Trophy size={40} className="text-primary" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">
                          🏆 Campeón del Torneo
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-primary">
                          {champion}
                        </h2>
                        {profile && champion.toLowerCase().includes(`${profile.nombre} ${profile.apellido}`.toLowerCase()) && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-2 text-[11px] font-black uppercase tracking-widest text-primary/70"
                          >
                            🎉 ¡Sos el campeón!
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
                <TournamentBracket
                  bracket={torneo.cuadro_data || []}
                  config={torneo.config || { bracketSize: 'semi' } as any}
                  highlightName={profile ? `${profile.nombre} ${profile.apellido}` : undefined}
                />
              </motion.div>
            )}

            {activeTab === 'champions' && (
              <motion.div
                key="champions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                { (torneo.champions_data?.winner || autoChampions?.winner) ? (
                  <div className="max-w-6xl mx-auto space-y-12">
                    <header className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Hall of Fame</p>
                      <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                        CAMPEONES <span className="opacity-20 text-white">OFICIALES</span>
                      </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* CAMPEÓN CARD */}
                      <div className="space-y-6">
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900 aspect-video shadow-2xl group">
                          <img 
                            src={(torneo.champions_data?.photoUrl && !torneo.champions_data.photoUrl.includes('random')) ? torneo.champions_data.photoUrl : "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=2013&auto=format&fit=crop"} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=2013&auto=format&fit=crop"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          <div className="absolute top-6 right-6">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg">
                              <Crown size={24} />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pareja Campeona</p>
                          <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                            {torneo.champions_data?.winner || "A. GALÁN / J. LEBRÓN"}
                          </h3>
                        </div>
                      </div>

                      {/* SUBCAMPEÓN CARD */}
                      <div className="space-y-6">
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900 aspect-video opacity-80 group hover:opacity-100 transition-opacity shadow-xl">
                          <img 
                            src={(torneo.champions_data?.runnerUpPhotoUrl && !torneo.champions_data.runnerUpPhotoUrl.includes('random')) ? torneo.champions_data.runnerUpPhotoUrl : "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          <div className="absolute top-6 right-6">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/40">
                              <Users size={24} />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Subcampeones</p>
                          <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter opacity-60">
                            {torneo.champions_data?.runnerUp || "F. BELASTEGUÍN / A. COELLO"}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* SCORE & INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Resultado Final</p>
                          <p className="text-3xl font-black text-primary italic tracking-tighter">{torneo.champions_data?.score || autoChampions?.score || "-- / --"}</p>
                       </div>
                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Categoría</p>
                          <p className="text-3xl font-black italic tracking-tighter">{torneo.categoria}</p>
                       </div>
                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Torneo</p>
                          <p className="text-2xl font-black italic tracking-tighter uppercase">{torneo.nombre}</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-40 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-6">
                    <Trophy size={60} className="mx-auto opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20">La premiación se publicará al finalizar el torneo</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal de Inscripción */}
        <AnimatePresence>
          {showInscribir && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInscribir(false)}
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
                      <Target size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Inscripción</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{torneo.nombre}</p>
                  </header>

                  <form onSubmit={handleInscribirse} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Tu Nombre (Jugador 1)</label>
                      <input
                        type="text"
                        value={jugador1}
                        onChange={(e) => setJugador1(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Nombre de tu Compañero (Jugador 2)</label>
                      <input
                        type="text"
                        value={jugador2}
                        onChange={(e) => setJugador2(e.target.value)}
                        placeholder="Ej: Pablo Gómez"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">WhatsApp de Contacto</label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej: 2923..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold"
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
      </div>
    </PageWrapper>
  );
}
