'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva, ListaEspera } from '@/types';
import { HORAS, TURNOS_FIJOS } from '@/lib/constants';
import { Crown, Trash2, Phone, Download, LogOut, Users, Trophy, Layout, Plus, X, Save, ChevronLeft, CheckCircle2, Search, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Calendar } from '@/components/ui/Calendar';
import dynamic from 'next/dynamic';

const TournamentManager = dynamic(
  () => import('@/components/admin/TournamentManager'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-96 opacity-30">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);

function InscriptionGroup({ torneoNombre, inscriptos, deleteInscription }: any) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(inscriptos.length / itemsPerPage);
  
  const currentItems = inscriptos.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest px-4 py-2 bg-primary/10 rounded-xl inline-block border border-primary/20">
          {torneoNombre}
        </h4>
        <span className="text-[10px] font-black opacity-40">{inscriptos.length} parejas</span>
      </div>
      <div className="grid gap-3 pl-2 border-l-2 border-white/5">
        {currentItems.map((i: any) => (
          <div key={i.id} className="glass p-5 rounded-3xl border border-white/5 flex justify-between items-center group/insc">
            <div>
              <p className="text-sm font-black uppercase italic leading-tight">{i.jugador1}</p>
              <p className="text-sm font-black uppercase italic leading-tight text-white/60">{i.jugador2}</p>
            </div>
            <div className="flex gap-2 opacity-40 group-hover/insc:opacity-100 transition-all">
              <a 
                href={`https://wa.me/${i.telefono_contacto}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"
              >
                <Phone size={16} />
              </a>
              <button 
                onClick={() => deleteInscription(i.id)}
                className="p-3 bg-error/10 text-error rounded-xl border border-error/20 hover:bg-error/20 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Ant
          </button>
          <span className="text-[10px] font-black opacity-40 tracking-widest px-2">
            {page} / {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Sig
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCancha, setSelectedCancha] = useState<string>('Todas');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [espera, setEspera] = useState<ListaEspera[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemMsg, setSystemMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'turnos' | 'torneos'>('turnos');
  
  const [torneos, setTorneos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [newTourney, setNewTourney] = useState({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
  const [tourneyDates, setTourneyDates] = useState({ inicio: '', fin: '' });
  const [editingTourneyId, setEditingTourneyId] = useState<string | null>(null);
  
  const [editingZonesTourney, setEditingZonesTourney] = useState<any | null>(null);
  const [tempZones, setTempZones] = useState<any[]>([]);
  const [activeZoneIdx, setActiveZoneIdx] = useState<number>(0);

  const ALLOWED_ADMINS = ['setchegno@etman.com.ar', 'octavioducos24@gmail.com'];

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && ALLOWED_ADMINS.includes(session.user.email || '')) {
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ALLOWED_ADMINS.includes(email.toLowerCase())) {
      return toast.error('Acceso denegado: Email no autorizado');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: pass
      });

      if (error) throw error;
      
      setIsLoggedIn(true);
      toast.success('Bienvenido, Admin');
    } catch (e: any) {
      toast.error(e.message || 'Error de acceso');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch reservas
      const { data: rData } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', selectedDate);
      
      // Add fixed turns
      const day = new Date(selectedDate + 'T00:00:00').getDay();
      const fixed = TURNOS_FIJOS[day] || {};
      const allReservas = [...(rData || [])];
      
      for (const h in fixed) {
        for (const c in fixed[h]) {
          allReservas.push({
            id: 'fijo',
            nombre: fixed[h][c],
            hora: h,
            cancha: parseInt(c),
            telefono: 'FIJO',
            fecha: selectedDate,
            created_at: ''
          });
        }
      }
      setReservas(allReservas.sort((a, b) => a.hora.localeCompare(b.hora)));

      // Fetch waitlist
      const { data: eData } = await supabase
        .from('lista_espera')
        .select('*')
        .eq('fecha', selectedDate);
      setEspera(eData || []);

      // Fetch Torneos e Inscripciones
      const { data: tData } = await supabase.from('torneos').select('*').order('fecha', { ascending: true });
      setTorneos(tData || []);
      const { data: iData } = await supabase.from('inscripciones_torneos').select('*, torneos(*)').order('created_at', { ascending: false });
      setInscripciones(iData || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();

      const tChannel = supabase.channel('admin_torneos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => fetchData())
        .subscribe();
      
      const iChannel = supabase.channel('admin_inscripciones')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inscripciones_torneos' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(tChannel);
        supabase.removeChannel(iChannel);
      };
    }
  }, [isLoggedIn, selectedDate]);

  const handleDelete = async (id: string) => {
    if (id === 'fijo') return toast.error('No se pueden borrar turnos fijos');
    if (!confirm('¿Borrar reserva?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('reservas').delete().eq('id', id);
      if (error) throw error;
      
      // Actualizar estado local instantáneamente
      setReservas(prev => prev.filter(r => r.id !== id));
      toast.success('Reserva eliminada');
    } catch (e: any) {
      toast.error('Error al borrar: ' + (e.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const sendSystemNotification = async () => {
    if (!systemMsg) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('notificaciones_sistema').insert({
        mensaje: systemMsg
      });
      if (error) throw error;
      toast.success('Aviso enviado a todos los usuarios');
      setSystemMsg('');
    } catch (e: any) {
      toast.error('Error al enviar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTournamentHeader = async () => {
    if (!newTourney.nombre) return toast.error('Completá el nombre del torneo');
    if (!editingTourneyId && (!tourneyDates.inicio || !tourneyDates.fin)) return toast.error('Completá las fechas');
    
    setLoading(true);
    try {
      let updateData: any = {
        nombre: newTourney.nombre,
        categoria: newTourney.categoria,
        precio: newTourney.precio,
        descripcion: newTourney.descripcion
      };

      if (tourneyDates.inicio && tourneyDates.fin) {
        const start = parseISO(tourneyDates.inicio);
        const end = parseISO(tourneyDates.fin);
        let fechaFormateada = '';
        if (tourneyDates.inicio === tourneyDates.fin) {
          fechaFormateada = format(start, "eeee d 'de' MMMM", { locale: es });
        } else {
          fechaFormateada = `${format(start, "d 'de' MMM")} al ${format(end, "d 'de' MMM")}`;
        }
        updateData.fecha = fechaFormateada;
      }

      if (editingTourneyId) {
        const { error } = await supabase.from('torneos').update(updateData).eq('id', editingTourneyId);
        if (error) throw error;
        toast.success('Torneo actualizado');
      } else {
        const { error } = await supabase.from('torneos').insert({ ...updateData, abierto: true });
        if (error) throw error;
        toast.success('Torneo creado');
      }

      setNewTourney({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
      setTourneyDates({ inicio: '', fin: '' });
      setEditingTourneyId(null);
      fetchData();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('¿Borrar torneo? Se borrarán todas las inscripciones.')) return;
    setLoading(true);
    try {
      // Primero intentamos borrar las inscripciones asociadas
      const { error: insError } = await supabase
        .from('inscripciones_torneos')
        .delete()
        .eq('torneo_id', id);
      
      if (insError) {
        console.warn('Error preliminar en inscripciones:', insError);
      }

      // Luego borramos el torneo con comprobación de filas afectadas
      const { error, count } = await supabase
        .from('torneos')
        .delete({ count: 'exact' })
        .eq('id', id);
      
      if (error) throw error;

      if (count === 0) {
        throw new Error('La base de datos rechazó el borrado. Verifica tus permisos (RLS) en Supabase.');
      }
      
      // Solo actualizamos el estado si realmente se borró en el servidor
      setTorneos(prev => prev.filter(t => t.id !== id));
      setInscripciones(prev => prev.filter(i => i.torneo_id !== id));
      
      toast.success('Torneo eliminado de la base de datos');
    } catch (e: any) {
      console.error('Error crítico en borrado:', e);
      toast.error(e.message || 'Error al borrar torneo');
      // Refrescamos por las dudas para asegurar sincronización
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const deleteInscription = async (id: string) => {
    if (!confirm('¿Borrar esta pareja del torneo?')) return;
    setLoading(true);
    try {
      const { error, count } = await supabase
        .from('inscripciones_torneos')
        .delete({ count: 'exact' })
        .eq('id', id);
      
      if (error) throw error;

      if (count === 0) {
        throw new Error('No se pudo borrar la pareja. Verifica los permisos de la tabla.');
      }
      
      // Actualizar estado local solo tras éxito real
      setInscripciones(prev => prev.filter(i => i.id !== id));
      
      toast.success('Pareja eliminada correctamente');
    } catch (e: any) {
      console.error('Error:', e);
      toast.error(e.message || 'Error al borrar pareja');
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const toggleTournamentStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('torneos').update({ abierto: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success('Estado de inscripción actualizado');
      fetchData();
    } catch (e: any) {
      toast.error('Error al cambiar el estado: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditingZones = (t: any) => {
    setEditingZonesTourney(null);
    setTimeout(() => {
      setEditingZonesTourney(t);
      // Restauramos las variables que el sistema necesita internamente
      setTempZones(t.zonas || []);
      setActiveZoneIdx(0);
      
      setTimeout(() => {
        const el = document.getElementById('zone-editor');
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }, 10);
  };

  const addZone = () => {
    setTempZones([...tempZones, { nombre: `Zona ${String.fromCharCode(65 + tempZones.length)}`, parejas: [], partidos: [] }]);
  };

  const removeZone = (idx: number) => {
    setTempZones(tempZones.filter((_, i) => i !== idx));
  };

  const updateZone = (idx: number, data: any) => {
    const newZones = [...tempZones];
    newZones[idx] = { ...newZones[idx], ...data };
    setTempZones(newZones);
  };

  const saveTournamentData = async (data: any) => {
    if (!editingZonesTourney) return;
    setLoading(true);
    try {
      const tourneyId = editingZonesTourney.id;
      const searchId = isNaN(Number(tourneyId)) ? tourneyId : Number(tourneyId);
      
      const payload = {
        id: searchId,
        nombre: editingZonesTourney.nombre,
        fecha: editingZonesTourney.fecha,
        categoria: editingZonesTourney.categoria,
        descripcion: editingZonesTourney.descripcion,
        precio: editingZonesTourney.precio,
        abierto: editingZonesTourney.abierto,
        config: data.config,
        parejas_data: data.parejas_data,
        zonas_data: data.zonas_data,
        cuadro_data: data.cuadro_data,
        visible: data.visible
      };

      // Intento 1: Upsert normal
      const { error: upsertError, data: upsertedData } = await supabase
        .from('torneos')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (upsertError || !upsertedData || upsertedData.length === 0) {
        // Intento 2: Re-Creación silenciosa si el update falla
        await supabase.from('torneos').delete().eq('id', searchId);
        const { error: insertError } = await supabase.from('torneos').insert(payload);
        
        if (insertError) throw insertError;
      }
      
      toast.success('¡Torneo actualizado correctamente!');
      fetchData();
    } catch (e: any) {
      console.error('Error al guardar:', e);
      toast.error(e.message || 'Error al guardar los cambios');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass p-10 rounded-[2.5rem] w-full max-w-sm space-y-6 text-center border border-white/5">
          <Crown className="mx-auto text-primary" size={48} />
          <h2 className="text-2xl font-bold uppercase tracking-tight">Acceso <span className="text-primary">Admin</span></h2>
          
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Contraseña</label>
              <input 
                type="password" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'TOTAL HOY', value: reservas.length, color: 'text-primary' },
            { label: 'CANCHA 1', value: reservas.filter(r => r.cancha === 1).length, color: 'text-white' },
            { label: 'CANCHA 2', value: reservas.filter(r => r.cancha === 2).length, color: 'text-white' },
            { label: 'TURNOS LIBRES', value: (HORAS.length * 2) - reservas.length, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-3xl text-center flex flex-col items-center justify-center border border-white/5 shadow-xl">
              <span className={clsx("text-5xl font-black mb-2", stat.color)}>{stat.value}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs Selector */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('turnos')}
            className={clsx(
              "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
              activeTab === 'turnos' ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
            )}
          >
            Gestión de Turnos
          </button>
          <button 
            onClick={() => setActiveTab('torneos')}
            className={clsx(
              "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
              activeTab === 'torneos' ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
            )}
          >
            Gestión de Torneos
          </button>
        </div>

        {activeTab === 'turnos' ? (
          <>

        {/* System Notifications Section */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Crown className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Enviar Aviso General</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={systemMsg}
              onChange={(e) => setSystemMsg(e.target.value)}
              placeholder="Ej: Mañana el complejo cierra por lluvia..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-400 transition-all"
            />
            <button 
              onClick={sendSystemNotification}
              disabled={loading || !systemMsg}
              className="bg-blue-500 text-white px-10 py-4 sm:py-0 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50"
            >
              Enviar Notificación
            </button>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-sm font-bold uppercase tracking-widest opacity-40">Calendario de Turnos</span>
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                Hoy: {format(new Date(), 'dd/MM')}
              </span>
            </div>
            <Calendar 
              selectedDate={parseISO(selectedDate + 'T00:00:00')} 
              onChange={handleDateChange} 
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Filtrar Cancha</label>
              <select 
                value={selectedCancha}
                onChange={(e) => setSelectedCancha(e.target.value)}
                className="w-full bg-[#1a1d23] border border-white/10 rounded-2xl py-5 px-6 font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="1">Cancha 1</option>
                <option value="2">Cancha 2</option>
              </select>
            </div>

            <button className="w-full bg-white/5 border border-white/10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
              Exportar a Excel
            </button>

            <button 
              onClick={handleLogout}
              className="w-full border-2 border-primary py-5 rounded-2xl font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-[0_0_30px_rgba(76,175,80,0.15)]"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4 pt-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4 mb-2">Listado de Reservas</h3>
          {reservas.filter(r => selectedCancha === 'Todas' || r.cancha.toString() === selectedCancha).length === 0 ? (
            <div className="glass p-20 rounded-[3rem] text-center opacity-30 font-bold uppercase tracking-widest text-xs">
              No hay turnos registrados
            </div>
          ) : (
            reservas
              .filter(r => selectedCancha === 'Todas' || r.cancha.toString() === selectedCancha)
              .map((r, i) => (
              <motion.div 
                layout
                key={i} 
                className="glass p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/10 transition-all shadow-lg"
              >
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {r.hora} hs <span className="opacity-30">·</span> Cancha {r.cancha}
                  </h4>
                  <p className="text-sm font-medium opacity-50">
                    {r.nombre} <span className="opacity-30">|</span> {r.telefono}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {r.id !== 'fijo' && (
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="px-8 py-3 border border-error text-error rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all"
                    >
                      Borrar
                    </button>
                  )}
                  <a 
                    href={`https://wa.me/${r.telefono}`}
                    target="_blank"
                    className="px-8 py-3 border border-primary text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-black transition-all"
                  >
                    <span>📱</span> WA
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>
        </>
      ) : (
        <div className="space-y-12">
          {/* Create Tournament Form */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="text-primary" size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter italic">
                  {editingTourneyId ? 'Editar Torneo' : 'Nuevo Torneo'}
                </h3>
              </div>
              {editingTourneyId && (
                <button 
                  onClick={() => {
                    setEditingTourneyId(null);
                    setNewTourney({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
                    setTourneyDates({ inicio: '', fin: '' });
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Nombre del Torneo</label>
                <input 
                  type="text" 
                  value={newTourney.nombre}
                  onChange={(e) => setNewTourney({...newTourney, nombre: e.target.value})}
                  placeholder="Ej: Open de Verano"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Desde (Inicio)</label>
                  <input 
                    type="date" 
                    value={tourneyDates.inicio}
                    onChange={(e) => setTourneyDates({...tourneyDates, inicio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all color-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Hasta (Fin)</label>
                  <input 
                    type="date" 
                    value={tourneyDates.fin}
                    onChange={(e) => setTourneyDates({...tourneyDates, fin: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all color-scheme-dark"
                  />
                </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Categoría</label>
                <select 
                  value={newTourney.categoria}
                  onChange={(e) => setNewTourney({...newTourney, categoria: e.target.value})}
                  className="w-full bg-[#1a1d23] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-bold"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Principiante">Principiante</option>
                  <option value="7ma">7ma Categoría</option>
                  <option value="6ta">6ta Categoría</option>
                  <option value="5ta">5ta Categoría</option>
                  <option value="4ta">4ta Categoría</option>
                  <option value="3ra">3ra Categoría</option>
                  <option value="Pro">Profesional / Open</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Precio Inscripción</label>
                <input 
                  type="number" 
                  value={newTourney.precio}
                  onChange={(e) => setNewTourney({...newTourney, precio: parseFloat(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Descripción corta</label>
                <input 
                  type="text" 
                  value={newTourney.descripcion}
                  onChange={(e) => setNewTourney({...newTourney, descripcion: e.target.value})}
                  placeholder="Detalles del torneo..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <button 
              onClick={saveTournamentHeader}
              disabled={loading}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_rgba(200,255,0,0.2)] hover:scale-[1.01] transition-all"
            >
              {editingTourneyId ? 'Guardar Cambios' : 'Publicar Torneo'}
            </button>
          </div>

          {/* Listado de Torneos e Inscripciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Torneos Activos</h3>
              {torneos.map((t) => (
                <div key={t.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black uppercase tracking-tight italic">{t.nombre}</h4>
                    </div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.fecha} · {t.categoria}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => {
                        setEditingTourneyId(t.id);
                        setNewTourney({
                          nombre: t.nombre,
                          categoria: t.categoria,
                          precio: t.precio,
                          descripcion: t.descripcion || '',
                          fecha: t.fecha
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        toast('Edita los datos arriba', { icon: '✍️' });
                      }}
                      className="p-3 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10"
                      title="Editar Info"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => startEditingZones(t)}
                      className="p-3 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10"
                      title="Gestionar Cuadros/Zonas"
                    >
                      <Layout size={18} />
                    </button>
                    <button 
                      onClick={() => toggleTournamentStatus(t.id, t.abierto)}
                      className={clsx(
                        "p-3 rounded-xl border transition-all",
                        t.abierto ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-white/40 border-white/10"
                      )}
                      title={t.abierto ? "Cerrar Inscripciones" : "Abrir Inscripciones"}
                    >
                      <Users size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTournament(t.id)}
                      className="p-3 bg-error/10 text-error rounded-xl border border-error/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Parejas Inscriptas</h3>
              <div className="space-y-8">
                {Object.entries(
                  inscripciones.reduce((acc, i) => {
                    const tName = i.torneos?.nombre || 'Sin Torneo';
                    if (!acc[tName]) acc[tName] = [];
                    acc[tName].push(i);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([torneoNombre, inscriptos]) => (
                  <InscriptionGroup 
                    key={torneoNombre} 
                    torneoNombre={torneoNombre} 
                    inscriptos={inscriptos} 
                    deleteInscription={deleteInscription} 
                  />
                ))}
                
                {inscripciones.length === 0 && (
                  <div className="text-center py-10 opacity-30 font-black uppercase tracking-widest text-[10px]">
                    No hay inscriptos
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone Editor Section */}
          {editingZonesTourney && (
            <div id="zone-editor" className="pt-10">
              <TournamentManager 
                tournament={editingZonesTourney}
                inscripciones={inscripciones}
                onSave={saveTournamentData}
                onClose={() => setEditingZonesTourney(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  </PageWrapper>
  );
}

