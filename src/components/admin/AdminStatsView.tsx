'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Calendar, Trophy, DollarSign,
  Clock, BarChart2, Zap, Award, Sparkles, RefreshCw,
  Phone, Activity, Target
} from 'lucide-react';

interface AdminStatsViewProps {
  reservas: any[];
  torneos: any[];
  inscripciones: any[];
  totalRegistros?: number;
  timeRange: '7d' | '30d' | 'all';
  setTimeRange: (range: '7d' | '30d' | 'all') => void;
  loading: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function AdminStatsView({
  reservas, torneos, inscripciones, totalRegistros = 0, timeRange, setTimeRange, loading
}: AdminStatsViewProps) {

  const [padelPrice, setPadelPrice] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('stats_padel_price');
      return s ? parseInt(s, 10) : 8000;
    }
    return 8000;
  });

  const [futbolPrice, setFutbolPrice] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('stats_futbol_price');
      return s ? parseInt(s, 10) : 12000;
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

  const bookingStats = useMemo(() => {
    let padelCount = 0, futbolCount = 0, estimatedRevenue = 0;
    reservas.forEach(r => {
      if (r.cancha === 10) { futbolCount++; estimatedRevenue += futbolPrice; }
      else { padelCount++; estimatedRevenue += padelPrice; }
    });
    return { totalBookings: reservas.length, padelCount, futbolCount, estimatedRevenue };
  }, [reservas, padelPrice, futbolPrice]);

  const tournamentRevenue = useMemo(() =>
    inscripciones.reduce((acc, i) => acc + (i.torneos?.precio || 0), 0),
    [inscripciones]);

  const totalRevenue = bookingStats.estimatedRevenue + tournamentRevenue;

  const courtUsage = useMemo(() => {
    const u = { c1: 0, c2: 0, f5: 0 };
    reservas.forEach(r => {
      if (r.cancha === 1) u.c1++;
      else if (r.cancha === 2) u.c2++;
      else if (r.cancha === 10) u.f5++;
    });
    const total = reservas.length || 1;
    return [
      { label: 'Cancha 1', sub: 'Pádel', count: u.c1, pct: Math.round((u.c1 / total) * 100), color: 'from-primary to-primary/60', glow: 'shadow-primary/20' },
      { label: 'Cancha 2', sub: 'Pádel', count: u.c2, pct: Math.round((u.c2 / total) * 100), color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/20' },
      { label: 'Cancha 10', sub: 'Fútbol 5', count: u.f5, pct: Math.round((u.f5 / total) * 100), color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-500/20' },
    ];
  }, [reservas]);

  const peakHours = useMemo(() => {
    const m: Record<string, number> = {};
    reservas.forEach(r => { const h = r.hora.slice(0, 5); m[h] = (m[h] || 0) + 1; });
    const sorted = Object.entries(m).map(([hora, count]) => ({ hora, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
    const max = sorted[0]?.count || 1;
    return sorted.map(item => ({ ...item, pct: Math.round((item.count / max) * 100) }));
  }, [reservas]);

  const weekdayStats = useMemo(() => {
    const daysMap = [0, 0, 0, 0, 0, 0, 0];
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    reservas.forEach(r => {
      try { daysMap[new Date(r.fecha + 'T00:00:00').getDay()]++; } catch {}
    });
    const max = Math.max(...daysMap) || 1;
    return daysMap.map((count, i) => ({
      name: names[i], count, pct: Math.round((count / max) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [reservas]);

  const topCustomers = useMemo(() => {
    const cm: Record<string, { nombre: string; telefono: string; count: number }> = {};
    reservas.forEach(r => {
      if (!r.telefono || r.telefono === 'FIJO') return;
      const key = `${r.nombre.toLowerCase().trim()}_${r.telefono}`;
      if (!cm[key]) cm[key] = { nombre: r.nombre.replace(' (IA)', ''), telefono: r.telefono, count: 0 };
      cm[key].count++;
    });
    return Object.values(cm).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [reservas]);

  const fmt = (val: number) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(val);

  const kpis = [
    {
      label: 'Total Reservas',
      value: bookingStats.totalBookings.toString(),
      sub: `${bookingStats.padelCount} pádel · ${bookingStats.futbolCount} fútbol`,
      icon: Calendar,
      accent: 'text-primary',
      iconBg: 'bg-primary/10 border-primary/20 text-primary',
      glow: '',
      featured: false,
    },
    {
      label: 'Ingresos Canchas',
      value: fmt(bookingStats.estimatedRevenue),
      sub: 'Estimado por tarifas',
      icon: DollarSign,
      accent: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      glow: '',
      featured: false,
    },
    {
      label: 'Ingresos Torneos',
      value: fmt(tournamentRevenue),
      sub: `${inscripciones.length} inscripciones`,
      icon: Trophy,
      accent: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: '',
      featured: false,
    },
    {
      label: 'Ingresos Totales',
      value: fmt(totalRevenue),
      sub: 'Cifra de negocio',
      icon: TrendingUp,
      accent: 'text-black',
      iconBg: 'bg-primary text-black border-primary/30',
      glow: 'shadow-[0_0_40px_rgba(200,255,0,0.15)]',
      featured: true,
    },
    {
      label: 'Total Registrados',
      value: totalRegistros.toString(),
      sub: 'Usuarios en plataforma',
      icon: Users,
      accent: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: '',
      featured: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">

      {/* Config + Range */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Price inputs */}
        <div className="flex gap-3 flex-1">
          {[
            { label: 'Tarifa Pádel / turno', val: padelPrice, fn: handlePadelPriceChange, color: 'focus:border-primary' },
            { label: 'Tarifa Fútbol / turno', val: futbolPrice, fn: handleFutbolPriceChange, color: 'focus:border-blue-400' },
          ].map((f, i) => (
            <div key={i} className="flex-1 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 block mb-1">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-black">$</span>
                <input
                  type="number"
                  value={f.val}
                  onChange={e => f.fn(parseInt(e.target.value) || 0)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-7 pr-3 text-sm font-black text-white outline-none transition-all ${f.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Time range pills */}
        <div className="flex gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-1.5">
          {[
            { id: '7d', label: '7 días' },
            { id: '30d', label: '30 días' },
            { id: 'all', label: 'Todo' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id as any)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                timeRange === r.id
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass py-32 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={22} className="animate-spin text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Cargando datos...</span>
        </div>
      ) : (
        <>
          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col justify-between min-h-[130px] sm:min-h-[150px] transition-all ${kpi.featured
                  ? 'bg-primary border-primary/40 ' + kpi.glow
                  : 'glass border-white/5 hover:border-white/10'
                }`}
              >
                {kpi.featured && (
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-black/20 rounded-full blur-2xl" />
                )}
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.featured ? 'text-black/60' : 'text-white/50'}`}>
                    {kpi.label}
                  </span>
                  <div className={`p-2.5 rounded-xl border ${kpi.iconBg}`}>
                    <kpi.icon size={15} />
                  </div>
                </div>
                <div>
                  <p className={`text-2xl sm:text-3xl font-black leading-tight ${kpi.featured ? 'text-black' : 'text-white'}`}>
                    {kpi.value}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${kpi.featured ? 'text-black/50' : 'text-white/40'}`}>
                    {kpi.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── ROW 2: Sport split + Court usage ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Sport split */}
            <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Distribución de Deportes</h4>
              </div>

              <div className="flex gap-4 items-center">
                {/* Donut-ish split */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="rgba(200,255,0,1)" strokeWidth="3"
                      strokeDasharray={`${(bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100} 100`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 100' }}
                      animate={{ strokeDasharray: `${(bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100} 100` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-primary">
                      {Math.round((bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { icon: '🎾', label: 'Pádel', count: bookingStats.padelCount, pct: Math.round((bookingStats.padelCount / (bookingStats.totalBookings || 1)) * 100), bg: 'bg-primary' },
                    { icon: '⚽', label: 'Fútbol 5', count: bookingStats.futbolCount, pct: Math.round((bookingStats.futbolCount / (bookingStats.totalBookings || 1)) * 100), bg: 'bg-blue-400' },
                  ].map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white/80">{s.icon} {s.label}</span>
                        <span className="text-xs font-black text-white">{s.count} <span className="text-white/40">turno{s.count !== 1 ? 's' : ''}</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${s.bg}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Court usage */}
            <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Uso por Cancha</h4>
              </div>
              <div className="space-y-4">
                {courtUsage.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-black text-white">{c.label}</span>
                        <span className="text-[10px] text-white/40 font-bold ml-2 uppercase tracking-wider">{c.sub}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-white">{c.pct}%</span>
                        <span className="text-[10px] text-white/40 font-bold ml-1">({c.count})</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROW 3: Peak hours + Weekdays ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Peak hours bar chart */}
            <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Horarios Pico</h4>
                </div>
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Top 6</span>
              </div>

              {peakHours.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-[9px] text-white/20 font-black uppercase tracking-widest">Sin datos</div>
              ) : (
                <div className="flex items-end gap-2 h-36">
                  {peakHours.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-black text-white/60 font-mono">{item.count}</span>
                      <div className="w-full rounded-t-lg overflow-hidden bg-white/5 relative" style={{ height: '80%' }}>
                        <motion.div
                          className={`w-full absolute bottom-0 rounded-t-lg ${i === 0 ? 'bg-primary' : 'bg-primary/40'}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${item.pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-primary font-mono tracking-tight">{item.hora}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekdays */}
            <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Días más Activos</h4>
              </div>
              <div className="space-y-3">
                {weekdayStats.slice(0, 5).map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-black text-white/30 font-mono">#{i + 1}</span>
                    <span className="w-10 text-xs font-black uppercase tracking-widest text-white/70 shrink-0">{day.name}</span>
                    <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${day.pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-black font-mono text-primary">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TOP CUSTOMERS ── */}
          <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Top 5 Clientes Más Fieles</h4>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                Ranking
              </span>
            </div>

            {topCustomers.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/20 font-black uppercase tracking-widest">
                Sin suficientes datos aún
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {topCustomers.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative rounded-2xl border p-4 flex flex-col items-center text-center gap-3 transition-all hover:border-white/15 hover:bg-white/[0.03] ${
                      i === 0
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-white/[0.01] border-white/5'
                    }`}
                  >
                    <div className="absolute top-2.5 right-3 text-lg">{MEDALS[i]}</div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black ${
                      i === 0 ? 'bg-primary text-black' : 'bg-white/5 text-white border border-white/10'
                    }`}>
                      {c.nombre.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-0.5 w-full">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white truncate">{c.nombre}</h5>
                      <p className="text-[10px] text-white/40 font-mono">{c.telefono}</p>
                    </div>

                    <div className={`w-full pt-3 border-t flex flex-col items-center ${i === 0 ? 'border-primary/20' : 'border-white/5'}`}>
                      <span className={`text-3xl font-black font-mono ${i === 0 ? 'text-primary' : 'text-white'}`}>{c.count}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">reservas</span>
                    </div>

                    {/* WhatsApp link */}
                    <a
                      href={`https://wa.me/${c.telefono}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-green-500/10 hover:text-green-400 transition-all text-white/40 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Phone size={11} /> Contactar
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── RESUMEN TORNEOS ── */}
          {torneos.length > 0 && (
            <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-white">Torneos</h4>
                <span className="ml-auto text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                  {torneos.length} registrados
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: torneos.length, color: 'text-white' },
                  { label: 'Abiertos', value: torneos.filter(t => t.abierto).length, color: 'text-green-400' },
                  { label: 'Inscripciones', value: inscripciones.length, color: 'text-purple-400' },
                  { label: 'Recaudado', value: fmt(tournamentRevenue), color: 'text-primary' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5 text-center">
                    <p className={`text-xl sm:text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
