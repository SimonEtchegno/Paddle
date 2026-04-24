'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva, ListaEspera } from '@/types';
import { HORAS, TURNOS_FIJOS } from '@/lib/constants';
import { Crown, Trash2, Phone, Download, LogOut, Users } from 'lucide-react';
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
      </div>
    </PageWrapper>
  );
}

