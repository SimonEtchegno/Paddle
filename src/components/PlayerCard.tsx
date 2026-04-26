'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/types';
import { Trophy, Star, Shield, Zap, MapPin, Activity, Crown } from 'lucide-react';
import { clsx } from 'clsx';

interface PlayerCardProps {
  profile: UserProfile & { paleta_modelo?: string };
  compact?: boolean;
}

export function PlayerCard({ profile, compact = false }: PlayerCardProps) {
  const level = profile.nivel || 1;
  const categoria = profile.categoria || '7ma';

  
  const getRankInfo = (l: number, cat: string) => {
    // 1. DIAMANTE SUPREMO (6.5+ o 1ra)
    if (l >= 6.5 || cat === '1ra') return { 
      label: 'DIAMANTE', 
      color: 'from-cyan-400 via-blue-500 to-purple-600', 
      glow: 'shadow-[0_0_50px_rgba(34,211,238,0.5)]',
      border: 'border-cyan-300/50',
      accent: 'text-cyan-300',
      vfx: 'legendary',
      icon: '💎',
      stats: { pow: 99, ctrl: 98, spd: 97 }
    };
    // 2. ORO LEGENDARIO (5.5+ o 2da)
    if (l >= 5.5 || cat === '2da') return { 
      label: 'ORO', 
      color: 'from-yellow-300 via-yellow-500 to-amber-600', 
      glow: 'shadow-[0_0_50px_rgba(255,215,0,0.5)]',
      border: 'border-yellow-400/60',
      accent: 'text-yellow-400',
      vfx: 'legendary',
      icon: '🔥',
      stats: { pow: 96, ctrl: 94, spd: 92 }
    };
    // 3. PLATA / PLATINO (4.5+ o 3ra)
    if (l >= 4.5 || cat === '3ra') return { 
      label: 'PLATA', 
      color: 'from-slate-200 via-slate-400 to-zinc-500', 
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.2)]',
      border: 'border-slate-300/40',
      accent: 'text-slate-200',
      vfx: 'epic',
      icon: '⚡',
      stats: { pow: 88, ctrl: 86, spd: 84 }
    };
    // 4. MASTER (3.5+ o 4ta)
    if (l >= 3.5 || cat === '4ta') return { 
      label: 'MASTER', 
      color: 'from-purple-600 to-indigo-800', 
      glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
      border: 'border-purple-600/30',
      accent: 'text-purple-300',
      vfx: 'epic',
      icon: '🏆',
      stats: { pow: 80, ctrl: 78, spd: 75 }
    };
    // 5. PRO (2.5+ o 5ta)
    if (l >= 2.5 || cat === '5ta') return { 
      label: 'PRO', 
      color: 'from-blue-500 to-cyan-600', 
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      border: 'border-blue-500/30',
      accent: 'text-blue-400',
      vfx: 'none',
      icon: '⭐',
      stats: { pow: 70, ctrl: 68, spd: 65 }
    };
    // 6. AMATEUR (1.5+ o 6ta)
    if (l >= 1.5 || cat === '6ta') return { 
      label: 'AMATEUR', 
      color: 'from-green-500 to-emerald-800', 
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      border: 'border-green-500/30',
      accent: 'text-green-400',
      vfx: 'none',
      icon: '🎯',
      stats: { pow: 60, ctrl: 55, spd: 58 }
    };
    // 7. INICIADO
    return { 
      label: 'INICIADO', 
      color: 'from-zinc-700 to-zinc-900', 
      glow: '',
      border: 'border-white/5',
      accent: 'text-zinc-500',
      vfx: 'none',
      icon: '🌱',
      stats: { pow: 45, ctrl: 40, spd: 42 }
    };
  };

  const rank = getRankInfo(level, categoria);

  // Rank-based racket material (levels up as you progress)
  const RACKET_SKINS: Record<string, { fill: string; stroke: string; holes: string }> = {
    'DIAMANTE': { fill: 'url(#neonGrad)',     stroke: '#FF00FF', holes: 'rgba(255,100,255,0.35)' },
    'ORO':      { fill: 'url(#fireGrad)',     stroke: '#FF5500', holes: 'rgba(255,255,200,0.75)' },
    'PLATA':    { fill: 'url(#diamondGrad)', stroke: '#22EEFF', holes: 'rgba(150,245,255,0.45)' },
    'MASTER':   { fill: 'url(#goldGrad)',    stroke: '#FFD700', holes: 'rgba(255,255,180,0.70)' },
    'PRO':      { fill: 'url(#silverGrad)',  stroke: '#BBBBBB', holes: 'rgba(255,255,255,0.85)' },
    'AMATEUR':  { fill: 'url(#bronzeGrad)', stroke: '#CD7F32', holes: 'rgba(255,255,255,0.75)' },
    'INICIADO': { fill: 'url(#woodGrad)',   stroke: '#8B6040', holes: 'rgba(255,255,255,0.60)' },
  };
  const rs = RACKET_SKINS[rank.label] ?? RACKET_SKINS['INICIADO'];


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10, rotateY: 5 }}
      className={clsx(
        "relative rounded-[2.5rem] overflow-hidden bg-zinc-950 border transition-all duration-500 group",
        rank.border,
        rank.glow,
        compact ? "w-full max-w-[340px] aspect-[3/5]" : "w-full max-w-md aspect-[3/5]"
      )}
    >
      {/* 1. LAYER: DYNAMIC BACKGROUND */}
      <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-20", rank.color)} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      
      {/* 2. LAYER: ANIMATED SCANLINE (LEGENDARY ONLY) */}
      {rank.vfx !== 'none' && (
        <motion.div 
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent h-1/2 z-10 pointer-events-none"
        />
      )}

      {/* 3. LAYER: FLOATING PARTICLES (LEGENDARY) */}
      {rank.vfx === 'legendary' && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110%', x: Math.random() * 100 + '%', opacity: 0 }}
              animate={{ y: '-10%', opacity: [0, 1, 0] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="relative p-7 flex justify-between items-start z-30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full animate-ping", rank.vfx === 'legendary' ? "bg-yellow-400" : "bg-primary")} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50 italic">Elite Identity</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={clsx("text-5xl font-black italic tracking-tighter drop-shadow-2xl", rank.vfx === 'legendary' ? "text-yellow-400" : "text-white")}>
              L{level.toFixed(1)}
            </span>
          </div>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={clsx(
            "px-4 py-2 rounded-2xl border backdrop-blur-2xl flex items-center gap-2",
            "bg-black/60",
            rank.border,
            rank.glow
          )}>
          <span className="text-base drop-shadow-md animate-pulse">{rank.icon}</span>
          <span className={clsx("text-[11px] font-black uppercase tracking-[0.2em] italic", rank.accent)}>
            {rank.label}
          </span>
        </motion.div>
      </div>

      {/* AVATAR CENTER */}
      <div className="flex-1 flex flex-col items-center justify-center relative py-4 z-20">
        <motion.div 
          animate={rank.vfx === 'legendary' ? { scale: [1, 1.05, 1], rotateZ: [0, 1, -1, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          {/* Rank Glow */}
          <div className={clsx("absolute inset-[-20px] rounded-full blur-3xl opacity-30 animate-pulse", rank.color.replace('from-', 'bg-'))} />
          
          {/* Avatar Shield */}
          <div className={clsx(
            "w-36 h-36 rounded-full bg-zinc-900 flex items-center justify-center relative overflow-hidden shadow-2xl border-4",
            rank.vfx === 'legendary' ? "border-yellow-400/50" : "border-white/10"
          )}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="text-8xl select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {profile.avatar_emoji || '👤'}
            </span>
          </div>

          {/* THE PADEL RACKET SVG — round head, real holes */}
          <motion.div 
            className="absolute -bottom-2 -right-2 z-40 w-16 h-24"
            style={{ transformOrigin: 'bottom center' }}
            animate={{ rotate: [15, 25, 15], y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            initial={{ rotate: 15 }}
          >
          <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* INICIADO – Madera */}
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4873A" />
                <stop offset="100%" stopColor="#7B4A1E" />
              </linearGradient>
              {/* AMATEUR – Bronce */}
              <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8A060" />
                <stop offset="50%" stopColor="#CD7F32" />
                <stop offset="100%" stopColor="#7B4A10" />
              </linearGradient>
              {/* PRO – Plata */}
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ECECEC" />
                <stop offset="50%" stopColor="#A8A8A8" />
                <stop offset="100%" stopColor="#555" />
              </linearGradient>
              {/* MASTER – Oro */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="50%" stopColor="#FFB800" />
                <stop offset="100%" stopColor="#9A6B00" />
              </linearGradient>
              {/* PLATA – Diamante */}
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CCFFFF" />
                <stop offset="40%" stopColor="#55DDFF" />
                <stop offset="100%" stopColor="#0066AA" />
              </linearGradient>
              {/* ORO – Fuego */}
              <linearGradient id="fireGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CC0000" />
                <stop offset="50%" stopColor="#FF6600" />
                <stop offset="100%" stopColor="#FFEE00" />
              </linearGradient>
              {/* DIAMANTE – Neón */}
              <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF00CC" />
                <stop offset="50%" stopColor="#AA00FF" />
                <stop offset="100%" stopColor="#00FFFF" />
              </linearGradient>
              <filter id="neonGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Clip holes to head circle */}
              <clipPath id="headHoleClip">
                <circle cx="50" cy="44" r="34" />
              </clipPath>
            </defs>

            {/* HEAD outer ring */}
            <circle cx="50" cy="44" r="40"
              fill={rs.fill}
              stroke={rs.stroke}
              strokeWidth="5"
              filter={rank.label === 'DIAMANTE' ? 'url(#neonGlow)' : undefined}
            />

            {/* HOLES clipped to head */}
            <g clipPath="url(#headHoleClip)">
              {([
                [50,12],
                [35,21],[50,21],[65,21],
                [24,31],[38,31],[52,31],[66,31],
                [20,42],[34,42],[48,42],[62,42],[76,42],
                [26,53],[40,53],[54,53],[68,53],[80,53],
                [34,63],[48,63],[62,63],[76,63],
                [42,73],[56,73],[70,73],
              ] as [number,number][]).map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="5"
                  fill={rs.holes}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
              ))}
            </g>

            {/* VFX: INICIADO (Hojas / Polvo de Madera) */}
            {rank.label === 'INICIADO' && (
              <g>
                {[...Array(5)].map((_, i) => (
                  <motion.path key={`leaf-${i}`}
                    d="M0,0 Q3,3 0,6 Q-3,3 0,0" fill="#6B8E23"
                    initial={{ opacity: 0, x: 20 + i*15, y: 10 }}
                    animate={{ 
                      y: [10, 50], x: [20 + i*15, 20 + i*15 + (i%2===0?10:-10)],
                      rotate: [0, 180], opacity: [0, 0.8, 0] 
                    }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
              </g>
            )}

            {/* VFX: AMATEUR (Chispas de Bronce) */}
            {rank.label === 'AMATEUR' && (
              <g>
                {[...Array(6)].map((_, i) => (
                  <motion.circle key={`spark-${i}`} r="1.5" fill="#FFAA00"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      y: [80, 20], x: [30 + i*8, 30 + i*8 + (i%2===0?15:-15)],
                      opacity: [0, 1, 0], scale: [0, 1, 0]
                    }}
                    transition={{ duration: 1.5 + i*0.2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </g>
            )}

            {/* VFX: PRO (Destello de Plata / Viento) */}
            {rank.label === 'PRO' && (
              <g clipPath="url(#headHoleClip)">
                <motion.line x1="-20" y1="-20" x2="120" y2="120" stroke="rgba(255,255,255,0.8)" strokeWidth="6"
                  animate={{ x1: [-100, 150], x2: [0, 250], y1: [-100, 150], y2: [0, 250] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
              </g>
            )}

            {/* VFX: MASTER (Destellos de Oro / Estrellas) */}
            {rank.label === 'MASTER' && (
              <g>
                {[...Array(6)].map((_, i) => (
                  <motion.path key={`star-${i}`}
                    d="M0,-3 L1,-1 L3,0 L1,1 L0,3 L-1,1 L-3,0 L-1,-1 Z" fill="#FFD700"
                    initial={{ opacity: 0, x: 20 + i*10, y: 80 }}
                    animate={{ 
                      y: [80, 10], x: [20 + i*10, 20 + i*10 + (i%2===0?5:-5)],
                      rotate: [0, 180], opacity: [0, 1, 0], scale: [0, 1.5, 0]
                    }}
                    transition={{ duration: 2 + i*0.2, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
              </g>
            )}

            {/* VFX: PLATA (Rayos de Diamante) */}
            {rank.label === 'PLATA' && (
              <g>
                <filter id="lightningGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <g filter="url(#lightningGlow)">
                  {[...Array(3)].map((_, i) => (
                    <motion.path key={`bolt-${i}`}
                      d={`M${20+i*20},10 L${30+i*20},35 L${20+i*20},45 L${35+i*20},80`}
                      fill="none" stroke="#22EEFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      animate={{ opacity: [0, 1, 0, 0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, times: [0, 0.05, 0.1, 0.8, 0.85, 0.9] }}
                    />
                  ))}
                </g>
              </g>
            )}

            {/* VFX: ORO (Fuego) */}
            {rank.label === 'ORO' && (
              <g>
                <filter id="fireGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <g filter="url(#fireGlow)">
                  {[
                    { x: 30, delay: 0.1, dur: 0.8, size: 1.5, col: '#FF4400' },
                    { x: 40, delay: 0.4, dur: 0.7, size: 1.2, col: '#FFCC00' },
                    { x: 50, delay: 0.0, dur: 0.9, size: 1.8, col: '#FF2200' },
                    { x: 60, delay: 0.3, dur: 0.7, size: 1.4, col: '#FFEE00' },
                    { x: 70, delay: 0.5, dur: 0.8, size: 1.5, col: '#FF4400' },
                    { x: 35, delay: 0.6, dur: 0.9, size: 1.1, col: '#FFCC00' },
                    { x: 45, delay: 0.2, dur: 0.8, size: 1.6, col: '#FF4400' },
                    { x: 55, delay: 0.7, dur: 0.7, size: 1.3, col: '#FFCC00' },
                    { x: 65, delay: 0.1, dur: 0.9, size: 1.7, col: '#FF2200' },
                  ].map((f, i) => (
                    <motion.path
                      key={`fire-${i}`}
                      d="M0,0 Q-4,6 0,12 Q4,6 0,0"
                      fill={f.col}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        y: [6, -10, -25],
                        x: [f.x, f.x + (i % 2 === 0 ? -4 : 4), f.x],
                        scale: [f.size * 0.4, f.size, f.size * 0.1],
                        opacity: [0, 0.9, 0]
                      }}
                      transition={{ duration: f.dur, repeat: Infinity, delay: f.delay, ease: "easeIn" }}
                    />
                  ))}
                </g>
              </g>
            )}

            {/* VFX: DIAMANTE (Anillos de Neón y Pulso Cyberpunk) */}
            {rank.label === 'DIAMANTE' && (
              <g>
                <motion.circle cx="50" cy="44" r="45" fill="none" stroke="#FF00FF" strokeWidth="1" strokeDasharray="10 20"
                  animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
                  style={{ transformOrigin: '50px 44px' }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle cx="50" cy="44" r="48" fill="none" stroke="#00FFFF" strokeWidth="1" strokeDasharray="30 15 5 15"
                  animate={{ rotate: [360, 0], scale: [1.05, 1, 1.05] }}
                  style={{ transformOrigin: '50px 44px' }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle cx="50" cy="44" r="40" fill="none" stroke="#AA00FF" strokeWidth="3"
                  animate={{ opacity: [0, 1, 0], scale: [1, 1.15] }}
                  style={{ transformOrigin: '50px 44px' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </g>
            )}

            {/* THROAT */}
            <path d="M28 80 Q50 100 72 80 L68 84 Q50 104 32 84 Z"
              fill={rs.fill} stroke={rs.stroke} strokeWidth="1"
            />

            {/* HANDLE shaft */}
            <rect x="43" y="97" width="14" height="46" rx="6" fill="#111" />
            {/* Grip tape stripes */}
            {[...Array(8)].map((_, i) => (
              <rect key={i} x="43" y={99 + i * 5.5} width="14" height="2.5" rx="1.2"
                fill="#2e2e2e" opacity="0.95"
              />
            ))}
            {/* Butt cap */}
            <ellipse cx="50" cy="143" rx="9" ry="4"
              fill="#252525" stroke="#444" strokeWidth="1"
            />
          </svg>
        </motion.div>
        </motion.div>
      </div>

      {/* FOOTER STATS */}
      <div className="p-8 space-y-6 relative z-30">
        <div className="text-center space-y-2">
          <h4 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white group-hover:text-primary transition-colors">
            {profile.nombre} <span className={rank.accent}>{profile.apellido}</span>
          </h4>
          <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">
             <span className="flex items-center gap-1"><MapPin size={12} /> {profile.localidad}</span>
             <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
             <span className="flex items-center gap-1"><Trophy size={12} /> {profile.categoria}</span>
          </div>
        </div>

        {/* Technical Progress Bars */}
        <div className="bg-black/60 border border-white/5 rounded-3xl p-5 space-y-4 shadow-inner">
          {[
            { label: 'POWER', val: rank.stats.pow, col: 'bg-primary' },
            { label: 'CONTROL', val: rank.stats.ctrl, col: 'bg-white' },
            { label: 'SPEED', val: rank.stats.spd, col: 'bg-blue-500' }
          ].map((s, idx) => (
            <div key={s.label} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black tracking-[0.2em] opacity-80">
                <span>{s.label}</span>
                <span className={rank.accent}>{s.val}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${s.val}%` }}
                  transition={{ duration: 1.5, delay: 0.2 + idx * 0.2, type: "spring", bounce: 0.4 }}
                  className={clsx("absolute top-0 left-0 h-full shadow-[0_0_10px_rgba(255,255,255,0.4)] rounded-full", s.col)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Zap size={14} className={rank.accent} />
          <span className="text-[10px] font-black text-white/30 uppercase italic tracking-widest">
            {profile.paleta || 'Official Equipment'}
          </span>
        </div>
      </div>

      {/* Glass Highlight Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
}
