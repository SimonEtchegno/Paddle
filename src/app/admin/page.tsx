'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva, ListaEspera } from '@/types';
import { HORAS, TURNOS_FIJOS } from '@/lib/constants';
import { Crown, Trash2, Phone, Download, LogOut, Users, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Calendar } from '@/components/ui/Calendar';

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
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, selectedDate]);

  const handleDelete = async (id: string) => {
    if (id === 'fijo') return toast.error('No se pueden borrar turnos fijos');
    if (!confirm('¿Borrar reserva?')) return;
    await supabase.from('reservas').delete().eq('id', id);
    fetchData();
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

  const createTournament = async () => {
    if (!newTourney.nombre || !tourneyDates.inicio || !tourneyDates.fin) return toast.error('Completá nombre y fechas');
    
    setLoading(true);
    try {
      const start = parseISO(tourneyDates.inicio);
      const end = parseISO(tourneyDates.fin);
      
      let fechaFormateada = '';
      if (tourneyDates.inicio === tourneyDates.fin) {
        fechaFormateada = format(start, "eeee d 'de' MMMM", { locale: es });
      } else {
        fechaFormateada = `${format(start, "d 'de' MMM")} al ${format(end, "d 'de' MMM")}`;
      }

      const tourneyToSave = {
        ...newTourney,
        fecha: fechaFormateada
      };

      const { error } = await supabase.from('torneos').insert(tourneyToSave);
      if (error) throw error;
      toast.success('Torneo creado');
      setNewTourney({ nombre: '', fecha: '', categoria: '', precio: 0, descripcion: '' });
      setTourneyDates({ inicio: '', fin: '' });
      fetchData();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('¿Borrar torneo? Se borrarán todas las inscripciones.')) return;
    await supabase.from('torneos').delete().eq('id', id);
    fetchData();
  };

  const deleteInscription = async (id: string) => {
    if (!confirm('¿Borrar esta pareja del torneo?')) return;
    await supabase.from('inscripciones_torneos').delete().eq('id', id);
    fetchData();
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
            <div className="flex items-center gap-3">
              <Trophy className="text-primary" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Nuevo Torneo</h3>
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
              onClick={createTournament}
              disabled={loading}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_rgba(200,255,0,0.2)] hover:scale-[1.01] transition-all"
            >
              Publicar Torneo
            </button>
          </div>

          {/* Listado de Torneos e Inscripciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Torneos Activos</h3>
              {torneos.map((t) => (
                <div key={t.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight italic">{t.nombre}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.fecha} · {t.categoria}</p>
                  </div>
                  <button 
                    onClick={() => deleteTournament(t.id)}
                    className="p-3 bg-error/10 text-error rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-error/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Parejas Inscriptas</h3>
              <div className="space-y-4">
                {inscripciones.map((i) => (
                  <div key={i.id} className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{i.torneos?.nombre}</p>
                        <h4 className="text-lg font-black uppercase italic leading-none">{i.jugador1}</h4>
                        <h4 className="text-lg font-black uppercase italic leading-none mt-1">{i.jugador2}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteInscription(i.id)}
                          className="p-3 bg-error/10 text-error rounded-xl border border-error/20"
                        >
                          <Trash2 size={18} />
                        </button>
                        <a 
                          href={`https://wa.me/${i.telefono_contacto}`}
                          className="p-3 bg-primary/20 text-primary rounded-xl border border-primary/30"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </PageWrapper>
  );
}

