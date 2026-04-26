'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/types';
import { Trophy, Star, Shield, Zap, MapPin, Activity, Crown } from 'lucide-react';
import { clsx } from 'clsx';

interface PlayerCardProps {
  profile: UserProfile;
  compact?: boolean;
}

export function PlayerCard({ profile, compact = false }: PlayerCardProps) {
  const level = profile.nivel || 1;
  const categoria = profile.categoria || '7ma';
  
  const getRankInfo = (l: number, cat: string) => {
    // 1. DIAMANTE SUPREMO (7.0 + 1ra)
    if (l >= 7 && cat === '1ra') return { 
      label: 'DIAMANTE', 
      color: 'from-white via-cyan-100 to-blue-200', 
      glow: 'shadow-[0_0_70px_rgba(255,255,255,0.7)]',
      border: 'border-white',
      accent: 'text-cyan-400',
      vfx: 'legendary',
      stats: { pow: 99, ctrl: 99, spd: 99 }
    };
    // 2. ORO LEGENDARIO (6.5+ o 2da)
    if (l >= 6.5 || cat === '2da' || cat === '1ra') return { 
      label: 'ORO', 
      color: 'from-yellow-300 via-yellow-500 to-amber-600', 
      glow: 'shadow-[0_0_50px_rgba(255,215,0,0.5)]',
      border: 'border-yellow-400/60',
      accent: 'text-yellow-400',
      vfx: 'legendary',
      stats: { pow: 96, ctrl: 94, spd: 92 }
    };
    // 3. PLATA / PLATINO (5.5+ o 3ra)
    if (l >= 5.5 || cat === '3ra') return { 
      label: 'PLATA', 
      color: 'from-slate-200 via-slate-400 to-zinc-500', 
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.2)]',
      border: 'border-slate-300/40',
      accent: 'text-slate-200',
      vfx: 'epic',
      stats: { pow: 88, ctrl: 86, spd: 84 }
    };
    // 4. MASTER (4.5+)
    if (l >= 4.5 || cat === '4ta') return { 
      label: 'MASTER', 
      color: 'from-purple-600 to-indigo-800', 
      glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
      border: 'border-purple-600/20',
      accent: 'text-purple-300',
      vfx: 'epic',
      stats: { pow: 80, ctrl: 78, spd: 75 }
    };
    // 5. PRO (3.5+)
    if (l >= 3.5 || cat === '5ta') return { 
      label: 'PRO', 
      color: 'from-blue-500 to-cyan-600', 
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      border: 'border-blue-500/10',
      accent: 'text-blue-400',
      vfx: 'none',
      stats: { pow: 70, ctrl: 68, spd: 65 }
    };
    // 6. AMATEUR (2.5+)
    if (l >= 2.5 || cat === '6ta') return { 
      label: 'AMATEUR', 
      color: 'from-green-500 to-emerald-800', 
      glow: '',
      border: 'border-green-500/10',
      accent: 'text-green-400',
      vfx: 'none',
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
      stats: { pow: 45, ctrl: 40, spd: 42 }
    };
  };

  const rank = getRankInfo(level, categoria);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10, rotateY: 5 }}
      className={clsx(
        "relative rounded-[2.5rem] overflow-hidden bg-zinc-950 border transition-all duration-500 group",
        rank.border,
        rank.glow,
        compact ? "w-full max-w-[320px] aspect-[3/4.6]" : "w-full max-w-sm aspect-[3/4.6]"
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
        
        <div className={clsx(
          "px-5 py-2 rounded-2xl border backdrop-blur-2xl flex items-center gap-2 shadow-xl",
          rank.vfx === 'legendary' ? "bg-yellow-400/20 border-yellow-400/30" : "bg-black/60 border-white/10"
        )}>
          {rank.vfx === 'legendary' && <Crown size={14} className="text-yellow-400" />}
          <span className={clsx("text-[10px] font-black uppercase tracking-[0.2em] italic", rank.accent)}>
            {rank.label}
          </span>
        </div>
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

          {/* THE EVOLVING RACKET (Automatic based on Level) */}
          <motion.div 
            animate={{ rotate: [10, -10, 10], x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-10 z-40 w-28 h-28"
          >
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
              <defs>
                {/* Texture: Wood (Level < 3) */}
                <pattern id="woodPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#8B4513" />
                  <path d="M0 10 Q10 5 20 10" stroke="#5D2906" strokeWidth="1" fill="none" />
                </pattern>
                {/* Skin: Inferno (Level >= 6) */}
                <linearGradient id="infernoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF0000" />
                  <stop offset="50%" stopColor="#FF8800" />
                  <stop offset="100%" stopColor="#FFFF00" />
                </linearGradient>
              </defs>

              {/* Racket Handle */}
              <rect x="46" y="80" width="8" height="35" rx="4" fill={level < 3 ? "#5D2906" : "#111"} />
              
              {/* Racket Head */}
              <path 
                d="M15 45 Q15 5 50 5 Q85 5 85 45 Q85 85 50 85 Q15 85 15 45" 
                fill={
                  level >= 6.5 ? "url(#infernoGrad)" :
                  level >= 5 ? "#444" :
                  level >= 3 ? "#222" : "url(#woodPattern)"
                }
                stroke={level >= 6.5 ? "#FFD700" : level >= 5 ? "#00FFFF" : "#fff"} 
                strokeWidth={level >= 5 ? "3" : "2"}
              />

              {/* VFX: SIDE FLAMES (Level >= 6.5) */}
              {level >= 6.5 && (
                <g>
                  {[...Array(4)].map((_, i) => (
                    <motion.path
                      key={i}
                      animate={{ d: [
                        `M${15 - i*2} 40 Q${5 - i*5} 30 ${15 - i*2} 20`,
                        `M${15 - i*2} 40 Q${0 - i*5} 25 ${15 - i*2} 20`,
                        `M${15 - i*2} 40 Q${5 - i*5} 30 ${15 - i*2} 20`
                      ] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      d={`M15 40 Q5 30 15 20`}
                      fill="none" stroke="#FF4400" strokeWidth="2" strokeLinecap="round"
                    />
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <motion.path
                      key={i+4}
                      animate={{ d: [
                        `M${85 + i*2} 40 Q${95 + i*5} 30 ${85 + i*2} 20`,
                        `M${85 + i*2} 40 Q${100 + i*5} 25 ${85 + i*2} 20`,
                        `M${85 + i*2} 40 Q${95 + i*5} 30 ${85 + i*2} 20`
                      ] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      d={`M85 40 Q95 30 85 20`}
                      fill="none" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round"
                    />
                  ))}
                </g>
              )}

              {/* VFX: ELECTRICITY (Level >= 5) */}
              {level >= 5 && level < 6.5 && (
                <motion.path 
                  animate={{ opacity: [0, 1, 0], x: [-2, 2, -2] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  d="M10 45 Q0 25 10 5 M90 45 Q100 25 90 5" 
                  fill="none" stroke="#00FFFF" strokeWidth="2"
                />
              )}

              {/* Logo / Badge removed as requested */}
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
          ].map(s => (
            <div key={s.label} className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-black tracking-[0.2em] opacity-40">
                <span>{s.label}</span>
                <span>{s.val}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${s.val}%` }}
                  className={clsx("h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", s.col)}
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
