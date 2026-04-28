'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva, ListaEspera } from '@/types';
import { HORAS, TURNOS_FIJOS } from '@/lib/constants';
import { Crown, Trash2, Phone, Download, LogOut, Users, Trophy, Layout, Plus, X, Save, ChevronLeft, CheckCircle2, Search, Edit2, Globe, BookOpen, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Calendar } from '@/components/ui/Calendar';
import dynamic from 'next/dynamic';
import TutorialModal from '@/components/admin/TutorialModal';
import { useTutorial } from '@/hooks/useTutorial';

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
  const [activeTab, setActiveTab] = useState<'turnos' | 'torneos' | 'historial'>('turnos');
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reserva' | 'torneo' | 'partido'>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [torneos, setTorneos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [newTourney, setNewTourney] = useState({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
  const [tourneyDates, setTourneyDates] = useState({ inicio: '', fin: '' });
  const [editingTourneyId, setEditingTourneyId] = useState<string | null>(null);
  
  const [editingZonesTourney, setEditingZonesTourney] = useState<any | null>(null);
  const [tempZones, setTempZones] = useState<any[]>([]);
  const [activeZoneIdx, setActiveZoneIdx] = useState<number>(0);
  const { startAdminTour } = useTutorial();

  useEffect(() => {
    // Si venimos de la página de ayuda para hacer el tour
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tour') === 'true' && isLoggedIn) {
      setTimeout(() => startAdminTour(), 1000);
      // Limpiar la URL para que no se repita el tour al recargar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isLoggedIn]);

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

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data: resData } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150);
      
      const { data: inscData } = await supabase
        .from('inscripciones_torneos')
        .select('*, torneos(nombre)')
        .order('created_at', { ascending: false })
        .limit(150);

      const { data: joinData } = await supabase
        .from('uniones_partidos')
        .select('*, partidos_abiertos(fecha, hora)')
        .order('created_at', { ascending: false })
        .limit(150);
      
      const { data: matchData } = await supabase
        .from('partidos_abiertos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const combined = [
        ...(resData || []).map(r => ({ ...r, category: 'reserva' })),
        ...(inscData || []).map(i => ({ ...i, category: 'torneo' })),
        ...(joinData || []).map(j => ({ ...j, category: 'partido', nombre: j.nombre_interesado, telefono: j.whatsapp_interesado, fecha: j.partidos_abiertos?.fecha, hora: j.partidos_abiertos?.hora })),
        ...(matchData || []).map(m => ({ ...m, category: 'partido', nombre: m.nombre_creador, telefono: m.contacto_whatsapp, isCreation: true, fecha: m.fecha, hora: m.hora }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistory(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteHistoryItem = async (item: any) => {
    if (!confirm('¿Estás seguro de eliminar este registro permanentemente? Se enviará una notificación de cancelación al sistema.')) return;
    
    let table = '';
    let msg = '';
    
    if (item.category === 'reserva') {
      table = 'reservas';
      msg = `Tu reserva para el día ${item.fecha} a las ${item.hora}hs ha sido cancelada por el administrador.`;
    }
    if (item.category === 'torneo') {
      table = 'inscripciones_torneos';
      msg = `Tu inscripción al torneo "${item.torneos?.nombre || 'de Padel'}" ha sido cancelada por el administrador.`;
    }
    if (item.category === 'partido') {
      table = 'uniones_partidos';
      msg = `Tu unión al partido del ${item.partidos_abiertos?.fecha} ha sido cancelada por el administrador.`;
    }

    try {
      if (msg) {
        await supabase.from('notificaciones_sistema').insert({ mensaje: msg });
      }

      const { error } = await supabase.from(table).delete().eq('id', item.id);
      if (error) throw error;
      toast.success('Registro eliminado');
      fetchHistory();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`¿Estás seguro de eliminar ${selectedItems.length} registros permanentemente?`)) return;

    setHistoryLoading(true);
    try {
      const itemsToDelete = history.filter(item => selectedItems.includes(`${item.category}-${item.id}`));
      
      for (const item of itemsToDelete) {
        let table = '';
        if (item.category === 'reserva') table = 'reservas';
        if (item.category === 'torneo') table = 'inscripciones_torneos';
        if (item.category === 'partido') table = 'uniones_partidos';
        
        if (table) {
          await supabase.from(table).delete().eq('id', item.id);
        }
      }

      toast.success(`${selectedItems.length} registros eliminados`);
      setSelectedItems([]);
      fetchHistory();
    } catch (e) {
      toast.error('Error en el borrado masivo');
    } finally {
      setHistoryLoading(false);
    }
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
      if (activeTab === 'historial') {
        fetchHistory();
      } else {
        fetchData();
      }

      const tChannel = supabase.channel('admin_torneos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => activeTab === 'historial' ? fetchHistory() : fetchData())
        .subscribe();
      
      const iChannel = supabase.channel('admin_inscripciones')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inscripciones_torneos' }, () => activeTab === 'historial' ? fetchHistory() : fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(tChannel);
        supabase.removeChannel(iChannel);
      };
    }
  }, [isLoggedIn, selectedDate, activeTab]);

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
        const { error } = await supabase.from('torneos').insert({ ...updateData, abierto: true, visible: true });
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
    const insc = inscripciones.find(i => i.id === id);
    if (!confirm(`¿Borrar a ${insc?.jugador1} & ${insc?.jugador2}? Se les enviará una notificación.`)) return;
    
    setLoading(true);
    try {
      // Notificar cancelación
      await supabase.from('notificaciones_sistema').insert({
        mensaje: `Tu inscripción al torneo "${insc?.torneos?.nombre || 'Padel'}" ha sido cancelada por el administrador.`
      });

      const { error, count } = await supabase
        .from('inscripciones_torneos')
        .delete({ count: 'exact' })
        .eq('id', id);
      
      if (error) throw error;

      if (count === 0) {
        throw new Error('No se pudo borrar la pareja. Verifica los permisos de la tabla.');
      }
      
      setInscripciones(prev => prev.filter(i => i.id !== id));
      toast.success('Pareja eliminada y notificada');
    } catch (e: any) {
      console.error('Error:', e);
      toast.error(e.message || 'Error al borrar pareja');
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const toggleTournamentStatus = async (t: any) => {
    setLoading(true);
    try {
      const payload = { ...t, abierto: !t.abierto };
      const { error } = await supabase.from('torneos').upsert(payload, { onConflict: 'id' });
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
        abierto: Boolean(editingZonesTourney.abierto ?? true),
        config: data.config,
        parejas_data: data.parejas_data,
        zonas_data: data.zonas_data,
        cuadro_data: data.cuadro_data,
        visible: data.visible !== false // Default a true si no es explícitamente false
      };

      const { error: upsertError } = await supabase
        .from('torneos')
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) {
        // Si el upsert falla, intentamos un update directo como refuerzo
        const { error: updateError } = await supabase
          .from('torneos')
          .update(payload)
          .eq('id', searchId);
        
        if (updateError) throw updateError;
      }
      
      toast.success('¡Torneo actualizado correctamente!');
      setEditingZonesTourney((prev: any) => prev ? { ...prev, ...payload } : null);
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
      <PageWrapper>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/5 space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                <Crown size={40} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">Panel de <span className="text-primary">Control</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Acceso exclusivo para dueños</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                required
              />
              <button 
                type="submit"
                className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] transition-all"
              >
                Ingresar al Sistema
              </button>
            </form>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header Admin */}
        <header id="tutorial-admin-tabs" className="flex flex-col lg:flex-row items-center justify-between gap-6 glass p-8 rounded-[3rem] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary border border-primary/30">
              <Layout size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">Panel de <span className="text-primary">Control</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Gestión de Complejo</p>
            </div>
          </div>

          <div id="tutorial-admin-actions" className="flex items-center gap-4">
            <button 
              onClick={startAdminTour}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black transition-all text-xs font-black uppercase tracking-widest"
            >
              <Sparkles size={14} /> Guía del Panel
            </button>
            <button 
              onClick={() => { supabase.auth.signOut(); setIsLoggedIn(false); }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        {/* Stats Grid */}
        <div id="tutorial-admin-calendar" className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            id="tutorial-admin-tournaments"
            onClick={() => setActiveTab('torneos')}
            className={clsx(
              "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
              activeTab === 'torneos' ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
            )}
          >
            Gestión de Torneos
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={clsx(
              "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
              activeTab === 'historial' ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
            )}
          >
            Historial Global
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
              isAdmin={true}
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
      ) : activeTab === 'torneos' ? (
        <div className="space-y-12">
          {/* Create Tournament Form */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Trophy className="text-primary" size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter italic">
                  {editingTourneyId ? 'Editar Torneo' : 'Nuevo Torneo'}
                </h3>
              </div>
              <div id="tutorial-admin-actions" className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <BookOpen size={14} /> Manual
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none flex items-center justify-center p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
                {editingTourneyId && (
                  <button 
                    onClick={() => {
                      setEditingTourneyId(null);
                      setNewTourney({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
                      setTourneyDates({ inicio: '', fin: '' });
                    }}
                    className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white py-2"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
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
                <div key={t.id} className="glass p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black uppercase tracking-tight italic">{t.nombre}</h4>
                    </div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.fecha} · {t.categoria}</p>
                  </div>
                  <div 
                    id={torneos.indexOf(t) === 0 ? "tutorial-admin-tourney-actions" : undefined}
                    className="flex flex-wrap gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all w-full sm:w-auto"
                  >
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
                      className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10"
                      title="Editar Info"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => startEditingZones(t)}
                      className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10"
                      title="Gestionar Cuadros/Zonas"
                    >
                      <Layout size={18} />
                    </button>
                    <button 
                      onClick={() => toggleTournamentStatus(t)}
                      className={clsx(
                        "flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl border transition-all",
                        t.abierto ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] animate-pulse" : "bg-white/5 text-white/40 border-white/10"
                      )}
                      title={t.abierto ? "Cerrar Inscripciones" : "Abrir Inscripciones"}
                    >
                      <Users size={18} />
                    </button>
                    <button 
                      onClick={async () => {
                        const newVisible = t.visible === false;
                        const payload = { ...t, visible: newVisible };
                        const { error } = await supabase.from('torneos').upsert(payload, { onConflict: 'id' });
                        if (!error) {
                          toast.success(newVisible ? 'Torneo Publicado' : 'Torneo Privado');
                          fetchData();
                        }
                      }}
                      className={clsx(
                        "flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl border transition-all",
                        t.visible !== false ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] animate-pulse" : "bg-white/5 text-white/40 border-white/10"
                      )}
                      title={t.visible !== false ? "Hacer Privado" : "Publicar Torneo"}
                    >
                      <Globe size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTournament(t.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-error/10 text-error rounded-xl border border-error/20"
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
      ) : (
        /* TAB HISTORIAL */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
          <div className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o torneo..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={fetchHistory}
                  className="flex-1 md:flex-none px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Actualizar
                </button>
              </div>
            </div>

            {/* Categorías de Filtro */}
            <div className="flex flex-col md:flex-row justify-between gap-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Todos', color: 'bg-white/10' },
                  { id: 'reserva', label: 'Reservas', color: 'bg-primary/20 text-primary' },
                  { id: 'torneo', label: 'Torneos', color: 'bg-purple-500/20 text-purple-400' },
                  { id: 'partido', label: 'Partidos', color: 'bg-blue-500/20 text-blue-400' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={clsx(
                      "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                      filterType === f.id ? f.color + " border-transparent" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const filteredItems = history.filter(item => {
                      const s = searchTerm.toLowerCase();
                      const matchesSearch = (
                        (item.nombre?.toLowerCase().includes(s)) ||
                        (item.telefono?.toLowerCase().includes(s)) ||
                        (item.jugador1?.toLowerCase().includes(s)) ||
                        (item.jugador2?.toLowerCase().includes(s)) ||
                        (item.torneos?.nombre?.toLowerCase().includes(s))
                      );
                      const matchesFilter = filterType === 'all' || item.category === filterType;
                      return matchesSearch && matchesFilter;
                    });
                    
                    const filteredKeys = filteredItems.map(item => `${item.category}-${item.id}`);
                    const allSelected = filteredKeys.every(key => selectedItems.includes(key));
                    
                    if (allSelected) {
                      setSelectedItems(prev => prev.filter(key => !filteredKeys.includes(key)));
                    } else {
                      setSelectedItems(prev => Array.from(new Set([...prev, ...filteredKeys])));
                    }
                  }}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {(() => {
                    const filteredItems = history.filter(item => {
                      const s = searchTerm.toLowerCase();
                      const matchesSearch = (
                        (item.nombre?.toLowerCase().includes(s)) ||
                        (item.telefono?.toLowerCase().includes(s)) ||
                        (item.jugador1?.toLowerCase().includes(s)) ||
                        (item.jugador2?.toLowerCase().includes(s)) ||
                        (item.torneos?.nombre?.toLowerCase().includes(s))
                      );
                      const matchesFilter = filterType === 'all' || item.category === filterType;
                      return matchesSearch && matchesFilter;
                    });
                    const filteredKeys = filteredItems.map(item => `${item.category}-${item.id}`);
                    return filteredKeys.length > 0 && filteredKeys.every(key => selectedItems.includes(key)) 
                      ? 'Desmarcar Todo' 
                      : 'Seleccionar Todo';
                  })()}
                </button>

                <AnimatePresence>
                  {selectedItems.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-[10px] font-black uppercase opacity-40">{selectedItems.length} seleccionados</span>
                      <button 
                        onClick={handleBulkDelete}
                        className="px-6 py-2.5 bg-error text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-error/80 transition-all shadow-lg"
                      >
                        Eliminar Selección
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {historyLoading ? (
               <div className="p-20 text-center opacity-30 font-black uppercase tracking-widest text-[10px]">
                 Cargando historial...
               </div>
            ) : (
              history
                .filter(item => {
                  const s = searchTerm.toLowerCase();
                  const matchesSearch = (
                    (item.nombre?.toLowerCase().includes(s)) ||
                    (item.telefono?.toLowerCase().includes(s)) ||
                    (item.jugador1?.toLowerCase().includes(s)) ||
                    (item.jugador2?.toLowerCase().includes(s)) ||
                    (item.torneos?.nombre?.toLowerCase().includes(s))
                  );
                  const matchesFilter = filterType === 'all' || item.category === filterType;
                  return matchesSearch && matchesFilter;
                })
                .map((item, idx) => {
                  const isExpanded = selectedHistoryItem?.id === item.id && selectedHistoryItem?.category === item.category;
                  
                  return (
                    <div key={idx} className="flex flex-col gap-2 relative group">
                      <div className={clsx(
                        "glass p-6 rounded-3xl border border-white/5 flex items-center justify-between gap-6 hover:bg-white/[0.02] transition-all cursor-pointer",
                        isExpanded && "border-primary/30 bg-primary/5",
                        selectedItems.includes(`${item.category}-${item.id}`) && "border-primary/50 bg-primary/10"
                      )}
                      onClick={() => setSelectedHistoryItem(isExpanded ? null : item)}
                      >
                        <div className="flex items-center gap-5">
                          {/* Checkbox for selection */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              const key = `${item.category}-${item.id}`;
                              setSelectedItems(prev => 
                                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                              );
                            }}
                            className={clsx(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              selectedItems.includes(`${item.category}-${item.id}`) 
                                ? "bg-primary border-primary text-black" 
                                : "border-white/10 bg-white/5 opacity-0 group-hover:opacity-100"
                            )}
                          >
                            {selectedItems.includes(`${item.category}-${item.id}`) && <CheckCircle2 size={14} />}
                          </div>

                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl",
                            item.category === 'reserva' ? "bg-primary/10 text-primary" : 
                            item.category === 'torneo' ? "bg-purple-500/10 text-purple-400" : 
                            "bg-blue-500/10 text-blue-400"
                          )}>
                            {item.category === 'reserva' ? <CalendarIcon size={20} /> : 
                             item.category === 'torneo' ? <Trophy size={20} /> : 
                             <Users size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-sm font-black uppercase italic">
                                {item.category === 'torneo' ? `${item.jugador1} & ${item.jugador2}` : item.nombre}
                              </h4>
                              <span className={clsx(
                                "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                item.category === 'reserva' ? "bg-primary/20 text-primary" : 
                                item.category === 'torneo' ? "bg-purple-500/20 text-purple-400" : 
                                "bg-blue-500/20 text-blue-400"
                              )}>
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                              {item.category === 'reserva' 
                                ? `${item.fecha} · ${item.hora} hs` 
                                : item.category === 'torneo'
                                ? `Torneo: ${item.torneos?.nombre}`
                                : `Partido: ${item.fecha || item.partidos_abiertos?.fecha} ${item.hora || item.partidos_abiertos?.hora} hs`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Registro</p>
                            <p className="text-[10px] font-bold">
                              {item.created_at ? format(new Date(item.created_at), "d MMM, HH:mm", { locale: es }) : 'N/A'}
                            </p>
                          </div>
                          <ChevronLeft size={16} className={clsx("opacity-20 transition-transform", isExpanded ? "-rotate-90" : "")} />
                        </div>
                      </div>

                      {/* Detail Section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="glass mx-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Información del Usuario</h5>
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold flex justify-between">
                                      <span className="opacity-40">Tipo:</span> 
                                      <span className="capitalize">{item.category === 'partido' ? (item.isCreation ? 'Creó un partido' : 'Se unió a un partido') : item.category}</span>
                                    </p>
                                    <p className="text-xs font-bold flex justify-between">
                                      <span className="opacity-40">Nombre:</span> 
                                      <span>{item.category === 'torneo' ? `${item.jugador1} / ${item.jugador2}` : item.nombre}</span>
                                    </p>
                                    <p className="text-xs font-bold flex justify-between">
                                      <span className="opacity-40">Teléfono:</span> 
                                      <span className="text-primary">{item.telefono}</span>
                                    </p>
                                    {item.category === 'reserva' && (
                                      <p className="text-xs font-bold flex justify-between">
                                        <span className="opacity-40">Cancha:</span> 
                                        <span>Cancha {item.cancha}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Detalles del Evento</h5>
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold flex justify-between">
                                      <span className="opacity-40">Fecha:</span> 
                                      <span>{item.fecha || item.partidos_abiertos?.fecha}</span>
                                    </p>
                                    <p className="text-xs font-bold flex justify-between">
                                      <span className="opacity-40">Hora:</span> 
                                      <span>{item.hora || item.partidos_abiertos?.hora} hs</span>
                                    </p>
                                    {item.category === 'torneo' && (
                                      <p className="text-xs font-bold flex justify-between">
                                        <span className="opacity-40">Torneo:</span> 
                                        <span className="text-purple-400">{item.torneos?.nombre}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4 pt-4 border-t border-white/5">
                                <a 
                                  href={`https://wa.me/${item.telefono?.replace(/\D/g, '')}`}
                                  target="_blank"
                                  className="flex-1 py-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-green-500/30 transition-all"
                                >
                                  Contactar WhatsApp
                                </a>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item); }}
                                  className="px-6 py-3 bg-error/10 text-error border border-error/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-error/20 transition-all"
                                >
                                  Eliminar Registro
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
            )}
            {!historyLoading && history.length === 0 && (
              <div className="p-20 text-center opacity-30 font-black uppercase tracking-widest text-[10px]">
                No hay registros encontrados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
  </PageWrapper>
  );
}
