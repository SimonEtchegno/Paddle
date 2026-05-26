'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Calendar, Trophy, DollarSign, 
  Clock, BarChart2, Zap, Award, Sparkles, RefreshCw
} from 'lucide-react';

interface AdminStatsViewProps {
  reservas: any[];
  torneos: any[];
  inscripciones: any[];
  timeRange: '7d' | '30d' | 'all';
  setTimeRange: (range: '7d' | '30d' | 'all') => void;
  loading: boolean;
}

export default function AdminStatsView({
  reservas,
  torneos,
  inscripciones,
  timeRange,
  setTimeRange,
  loading
}: AdminStatsViewProps) {

  // Precios editables con persistencia local
  const [padelPrice, setPadelPrice] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stats_padel_price');
      return saved ? parseInt(saved, 10) : 8000;
    }
    return 8000;
  });

  const [futbolPrice, setFutbolPrice] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stats_futbol_price');
      return saved ? parseInt(saved, 10) : 12000;
    }
    return 12000;
  });

  const handlePadelPriceChange = (val: number) => {
    setPadelPrice(val);
    localStorage.setItem('stats_padel_price', val.toString());
  };

  const handleFutbolPriceChange = (val: number) => {
    setFutbolPrice(val);
    localStorage.setItem('stats_futbol_price', val.toString());
  };

  // 1. Cálculos de Facturación
  const bookingStats = useMemo(() => {
    let totalBookings = reservas.length;
    let padelCount = 0;
    let futbolCount = 0;
    let estimatedRevenue = 0;

    reservas.forEach(r => {
      if (r.cancha === 10) {
        futbolCount++;
        estimatedRevenue += futbolPrice;
      } else {
        padelCount++;
        estimatedRevenue += padelPrice;
      }
    });

    return {
      totalBookings,
      padelCount,
      futbolCount,
      estimatedRevenue
    };
  }, [reservas, padelPrice, futbolPrice]);

  const tournamentRevenue = useMemo(() => {
    return inscripciones.reduce((acc, i) => {
      return acc + (i.torneos?.precio || 0);
    }, 0);
  }, [inscripciones]);

  const totalRevenue = bookingStats.estimatedRevenue + tournamentRevenue;

  // 2. Uso de Canchas
  const courtUsage = useMemo(() => {
    const usage = { cancha1: 0, cancha2: 0, canchaF5: 0 };
    reservas.forEach(r => {
      if (r.cancha === 1) usage.cancha1++;
      else if (r.cancha === 2) usage.cancha2++;
      else if (r.cancha === 10) usage.canchaF5++;
    });

    const total = reservas.length || 1;
    return {
      c1: { count: usage.cancha1, pct: Math.round((usage.cancha1 / total) * 100) },
      c2: { count: usage.cancha2, pct: Math.round((usage.cancha2 / total) * 100) },
      f5: { count: usage.canchaF5, pct: Math.round((usage.canchaF5 / total) * 100) }
    };
  }, [reservas]);

  // 3. Horarios Pico (Top 5)
  const peakHours = useMemo(() => {
    const hoursMap: Record<string, number> = {};
    reservas.forEach(r => {
      const h = r.hora.slice(0, 5);
      hoursMap[h] = (hoursMap[h] || 0) + 1;
    });

    const sorted = Object.entries(hoursMap)
      .map(([hora, count]) => ({ hora, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map(item => ({
      ...item,
      pct: Math.round((item.count / maxCount) * 100)
    }));
  }, [reservas]);

  // 4. Días de la semana más populares
  const weekdayStats = useMemo(() => {
    const daysMap = [0, 0, 0, 0, 0, 0, 0]; // Dom, Lun, Mar, Mie, Jue, Vie, Sab
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    reservas.forEach(r => {
      try {
        // Parsear fecha y obtener día (ajustando a huso horario local)
        const d = new Date(r.fecha + 'T00:00:00');
        const dayIdx = d.getDay();
        daysMap[dayIdx]++;
      } catch (e) {
        console.error(e);
      }
    });

    const total = reservas.length || 1;
    return daysMap.map((count, idx) => ({
      name: dayNames[idx],
      count,
      pct: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [reservas]);

  // 5. Clientes más fieles (Top 5)
  const topCustomers = useMemo(() => {
    const clientMap: Record<string, { nombre: string; telefono: string; count: number }> = {};
    
    reservas.forEach(r => {
      if (!r.telefono || r.telefono === 'FIJO') return;
      const key = `${r.nombre.toLowerCase().trim()}_${r.telefono}`;
      if (!clientMap[key]) {
        clientMap[key] = { nombre: r.nombre.replace(' (IA)', ''), telefono: r.telefono, count: 0 };
      }
      clientMap[key].count++;
    });

    return Object.values(clientMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reservas]);

  const formattedCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      {/* Configuration & Time Range Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-2xl md:rounded-[2rem] gap-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Tarifa Turno Pádel ($)</label>
            <input
              type="number"
              value={padelPrice}
              onChange={(e) => handlePadelPriceChange(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-primary transition-all text-white font-bold"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Tarifa Turno Fútbol ($)</label>
            <input
              type="number"
              value={futbolPrice}
              onChange={(e) => handleFutbolPriceChange(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-primary transition-all text-white font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 pl-2">
            Rango de Análisis:
          </span>
          <div className="flex gap-2">
            {[
              { id: '7d', label: 'Últimos 7 días' },
              { id: '30d', label: 'Últimos 30 días' },
              { id: 'all', label: 'Histórico Total' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id as any)}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  timeRange === r.id 
                    ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(200,255,0,0.25)]' 
                    : 'bg-white/5 border-white/10 opacity-50 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass py-24 sm:py-32 rounded-2xl md:rounded-[3rem] border border-white/5 flex flex-col items-center justify-center gap-3 text-white/30">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Procesando base de datos...</span>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="glass p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-[140px] sm:h-[150px]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Total Reservas</span>
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <Calendar size={14} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white italic">{bookingStats.totalBookings}</h3>
                <p className="text-[8px] font-bold uppercase tracking-wider text-green-400 mt-1">Canchas reservadas</p>
              </div>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-[140px] sm:h-[150px]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Ingresos Canchas (Est.)</span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <DollarSign size={14} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white italic">{formattedCurrency(bookingStats.estimatedRevenue)}</h3>
                <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 mt-1">Suma por tarifas de reserva</p>
              </div>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-[140px] sm:h-[150px]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Ingresos Torneos</span>
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <Trophy size={14} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white italic">{formattedCurrency(tournamentRevenue)}</h3>
                <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 mt-1">Inscripciones cobradas</p>
              </div>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-[140px] sm:h-[150px] relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Ingresos Totales</span>
                <div className="p-2 bg-primary text-black rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(200,255,0,0.2)]">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-primary italic">{formattedCurrency(totalRevenue)}</h3>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mt-1">Cifra de negocio estimada</p>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Deportes Preferidos */}
            <div className="glass p-4 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={18} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Deportes Preferidos</h4>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/80">🎾 Pádel ({bookingStats.padelCount} reservas)</span>
                  <span className="text-primary">⚽ Fútbol ({bookingStats.futbolCount} reservas)</span>
                </div>
                {/* Comparative bar */}
                <div className="h-6 w-full rounded-full bg-white/5 overflow-hidden flex border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100}%` }}
                    className="h-full bg-white/20 border-r border-white/15"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(bookingStats.futbolCount / (bookingStats.totalBookings || 1)) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase">
                  <span>{Math.round((bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100)}% de reservas</span>
                  <span>{Math.round((bookingStats.futbolCount / (bookingStats.totalBookings || 1)) * 100)}% de reservas</span>
                </div>
              </div>
            </div>

            {/* Ocupación por Canchas */}
            <div className="glass p-4 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Uso de Canchas</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Cancha 1 (Pádel)', count: courtUsage.c1.count, pct: courtUsage.c1.pct, color: 'bg-primary' },
                  { label: 'Cancha 2 (Pádel)', count: courtUsage.c2.count, pct: courtUsage.c2.pct, color: 'bg-white/40' },
                  { label: 'Cancha 10 (Fútbol 5)', count: courtUsage.f5.count, pct: courtUsage.f5.pct, color: 'bg-blue-500' }
                ].map((court, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                      <span>{court.label}</span>
                      <span className="font-mono text-white">{court.pct}% ({court.count} t)</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${court.pct}%` }}
                        className={`h-full ${court.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Horarios Pico (Col 6) */}
            <div className="lg:col-span-6 glass p-4 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Horarios Más Solicitados</h4>
              </div>

              {peakHours.length === 0 ? (
                <div className="text-center py-10 opacity-30 text-[9px] uppercase font-black tracking-widest">Sin datos de horarios</div>
              ) : (
                <div className="flex items-end justify-around h-48 pt-4">
                  {peakHours.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end w-12">
                      <span className="text-[9px] font-black font-mono text-white/70">{item.count} t</span>
                      
                      {/* Bar graph */}
                      <div className="w-8 bg-white/5 rounded-t-xl overflow-hidden flex flex-col justify-end h-32 border border-white/10 relative group hover:border-primary/50 transition-colors">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${item.pct}%` }}
                          className="w-full bg-primary"
                        />
                      </div>

                      <span className="text-[10px] font-black tracking-widest uppercase text-primary font-mono">{item.hora}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Días más Activos (Col 6) */}
            <div className="lg:col-span-6 glass p-4 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Días de Mayor Actividad</h4>
              </div>

              <div className="space-y-3.5">
                {weekdayStats.slice(0, 4).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-20 text-[10px] font-black uppercase tracking-widest text-white/50 truncate">
                      {day.name}
                    </span>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${day.pct}%` }}
                        className="h-full bg-white/20"
                      />
                    </div>
                    <span className="w-14 text-right text-[10px] font-black font-mono text-primary">
                      {day.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Grid (Jugadores Frecuentes) */}
          <div className="glass p-4 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Top 5 Clientes Más Fieles</h4>
              </div>
              <span className="text-[8px] bg-primary/15 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                Ranking de Fidelidad
              </span>
            </div>

            {topCustomers.length === 0 ? (
              <div className="text-center py-10 opacity-30 text-[9px] uppercase font-black tracking-widest">Aún no hay suficientes reservas registradas</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {topCustomers.map((c, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden group hover:border-white/10 hover:bg-white/[0.02] transition-all">
                    
                    {/* Rank Number */}
                    <div className="absolute top-2 left-3 font-mono text-[10px] font-black text-white/20">
                      #{idx + 1}
                    </div>

                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary text-xs font-black mb-4">
                      {c.nombre.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white truncate max-w-[120px]">
                        {c.nombre}
                      </h5>
                      <p className="text-[8px] font-mono text-white/40 tracking-wider font-bold">
                        {c.telefono}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 w-full flex flex-col items-center">
                      <span className="text-lg font-black text-primary font-mono">{c.count}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-white/30">Reservas</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
