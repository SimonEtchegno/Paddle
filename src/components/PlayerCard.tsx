'use client';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types';

interface Props { profile: UserProfile & { paleta_modelo?: string }; compact?: boolean; }

const TIERS = {
  amateur:    { label:'AMATEUR',  bgImg:'/card-bg-amateur.png',    border:'#b87333', glow:'transparent',  accent:'#cd7f32', badge:'#5c3a21', badgeT:'#e8b88e' },
  intermedio: { label:'INTER',    bgImg:'/card-bg-intermedio.png', border:'#3b82f6', glow:'rgba(59,130,246,0.3)', accent:'#60a5fa', badge:'#1e3a8a', badgeT:'#93c5fd' },
  avanzado:   { label:'AVANZADO', bgImg:'/card-bg-avanzado.png',   border:'#8b5cf6', glow:'rgba(139,92,246,0.4)', accent:'#a78bfa', badge:'#2e1065', badgeT:'#c4b5fd' },
  pro:        { label:'PRO',      bgImg:'/card-bg-pro.png',        border:'#10b981', glow:'#10b981',  accent:'#34d399', badge:'#064e3b', badgeT:'#6ee7b7' },
  elite:      { label:'ELITE',    bgImg:'/card-bg-elite.png',      border:'#ffd90099', glow:'#ffd700', accent:'#fbbf24', badge:'#78350f', badgeT:'#fde68a' },
};

function getTier(l: number) {
  return l >= 6 ? 'elite' : l >= 5 ? 'pro' : l >= 3.5 ? 'avanzado' : l >= 2 ? 'intermedio' : 'amateur';
}

export function PlayerCard({ profile, compact = false }: Props) {
  const level = profile.nivel || 1;
  const tier  = getTier(level);
  const t     = TIERS[tier];
  const ovr   = Math.min(99, Math.max(1, Math.round((level / 7) * 99)));
  const pos   = profile.posicion === 'Drive' ? 'DRV' : profile.posicion === 'Revés' ? 'REV' : 'MID';
  const name  = (profile.apellido || profile.nombre || 'JUGADOR').toUpperCase().slice(0, 13);

  const stats = [
    { l:'ATQ', v: Math.min(99,Math.round(ovr*0.97)) },
    { l:'DEF', v: Math.min(99,Math.round(ovr*0.85)) },
    { l:'VEL', v: Math.min(99,Math.round(ovr*0.93)) },
    { l:'TEC', v: Math.min(99,Math.round(ovr*0.95)) },
    { l:'CON', v: Math.min(99,Math.round(ovr*0.90)) },
    { l:'RES', v: Math.min(99,Math.round(ovr*0.88)) },
  ];

  const W  = compact ? 230 : 340;
  const H  = compact ? 345 : 510;
  const sc = W / 300;

  return (
    <motion.div
      initial={{ opacity:0, y:24, scale:0.95 }}
      animate={{ opacity:1, y:0, scale:1 }}
      whileHover={{ scale:1.04, rotateY:7, rotateX:-4 }}
      transition={{ duration:0.5, type:'spring', bounce:0.3 }}
      style={{ width:W, height:H, flexShrink:0, position:'relative', perspective:1000, userSelect:'none' }}
    >
      {/* Ambient glow - None for Amateur */}
      {tier !== 'amateur' && (
        <div style={{ position:'absolute', inset:-18*sc, borderRadius:30*sc, background:t.glow, filter:`blur(${tier==='elite'?36:28}px)`, opacity:tier==='elite'?0.9:0.7, zIndex:0, pointerEvents:'none' }}/>
      )}

      {/* Card — overflow:hidden clips everything inside */}
      <div style={{
        position:'absolute', inset:0,
        borderRadius:20*sc,
        border:`2px solid ${t.border}`,
        boxShadow:`0 0 0 1px ${t.accent}${tier==='amateur'?'10':'20'} inset, ${tier==='amateur' ? '0 10px 30px rgba(0,0,0,0.8)' : `0 0 ${tier==='elite'?60:40}px ${t.glow}, 0 20px 60px rgba(0,0,0,0.95)`}`,
        overflow:'hidden',
        zIndex:1,
      }}>

        {/* ── Layer 1: FIFA background art ── */}
        <img
          src={t.bgImg}
          alt=""
          aria-hidden
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', zIndex:0, display:'block' }}
        />

        {/* ── Layer 2: Center spotlight effect ── */}
        {tier !== 'amateur' && (
          <div style={{
            position:'absolute', top:'15%', left:'10%', right:'10%', height:'55%',
            background:`radial-gradient(ellipse at center, ${t.accent}${tier==='elite'?'40':tier==='pro'?'30':'20'} 0%, transparent 70%)`,
            zIndex:2, pointerEvents:'none',
          }}/>
        )}

        {/* ── Layer 2.5: Player Emoji ── */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'74%', zIndex:2, pointerEvents:'none', display:'flex', justifyContent:'center', alignItems:'flex-end' }}>
          <div style={{
            fontSize: 140 * sc,
            lineHeight: 1,
            marginBottom: 20 * sc,
            marginLeft: 50 * sc, /* Offset slightly to the right to balance left stack */
            filter:`drop-shadow(0 8px 18px rgba(0,0,0,0.65)) drop-shadow(0 0 24px ${t.accent}66)`,
          }}>
            {(profile as any).avatar_emoji || '🧑'}
          </div>
        </div>

        {/* ── Layer 3: Bottom dark area for name + stats ── */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'38%',
          background:'linear-gradient(to bottom, transparent, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.98) 100%)',
          zIndex:3,
        }}/>

        {/* ── Layer 4: Header UI (Left Stack) ── */}
        <div style={{
          position:'absolute', top:15*sc, left:20*sc,
          display:'flex', flexDirection:'column', alignItems:'center',
          zIndex:10,
        }}>
          {/* OVR */}
          <div style={{
            fontSize:62*sc, fontWeight:900, lineHeight:0.9, color: tier === 'amateur' ? '#d1d5db' : '#fff',
            fontFamily:"'Arial Black',Impact,sans-serif",
            textShadow: tier === 'amateur' 
              ? `0 2px 5px rgba(0,0,0,0.9)`
              : tier === 'pro' || tier === 'elite'
                ? `0 0 10px gold, 0 0 30px ${t.accent}, 0 0 60px ${t.accent}cc, 0 3px 8px rgba(0,0,0,1)`
                : `0 0 20px ${t.accent}, 0 0 40px ${t.accent}88, 0 3px 8px rgba(0,0,0,1)`,
            letterSpacing:-2,
          }}>{ovr}</div>
          
          {/* POS */}
          <div style={{ 
            fontSize:14*sc, fontWeight:800, letterSpacing:1.5, color: tier==='amateur' ? t.accent : t.accent, 
            fontFamily:'Arial,sans-serif', textShadow: tier==='amateur'?'0 1px 3px rgba(0,0,0,0.8)':`0 0 10px ${t.accent}`,
            marginTop: 2*sc, marginBottom: 6*sc
          }}>{pos}</div>
          
          {/* Separator */}
          <div style={{ width:'80%', height:1, background:`${t.accent}66`, marginBottom: 6*sc }} />

          {/* Flag */}
          <div style={{ width:28*sc, height:18*sc, borderRadius:2, overflow:'hidden', boxShadow:'0 2px 6px rgba(0,0,0,0.7)', marginBottom: 6*sc }}>
            <div style={{ height:'33%', background:'#74ACDF' }}/>
            <div style={{ height:'34%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:5*sc, height:5*sc, borderRadius:'50%', background:'#F6B40E' }}/>
            </div>
            <div style={{ height:'33%', background:'#74ACDF' }}/>
          </div>

          {/* Separator */}
          <div style={{ width:'80%', height:1, background:`${t.accent}66`, marginBottom: 6*sc }} />

          {/* Club / Chemistry */}
          <div style={{
            width:28*sc, height:28*sc, borderRadius:'50%',
            background:'rgba(0,0,0,0.6)', border:`1px solid ${t.border}88`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14*sc,
            boxShadow:`0 0 8px ${t.glow}`,
          }}>🎾</div>
        </div>

        {/* ── Name ── */}
        <div style={{
          position:'absolute', top:288*sc, left:0, right:0,
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:4*sc, zIndex:10,
        }}>
          <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:4, color:t.accent, fontFamily:'Arial,sans-serif', opacity:0.85 }}>
            {profile.categoria || '7ma'} CATEGORÍA
          </span>
          <span style={{
            fontSize:24*sc, fontWeight:900, letterSpacing:3,
            color: tier==='amateur'?'#e5e7eb':'#fff', fontFamily:"'Arial Black',Impact,sans-serif",
            textShadow: tier==='amateur' ? `0 2px 6px rgba(0,0,0,0.9)` : `0 0 20px ${t.accent}99, 0 2px 12px rgba(0,0,0,0.95)`,
            lineHeight:1,
          }}>{name}</span>
          <div style={{ width:'72%', height:1, background:`linear-gradient(to right, transparent, ${t.accent}bb, transparent)`, marginTop:3*sc }}/>
        </div>

        {/* ── Stats ── */}
        <div style={{ position:'absolute', top:348*sc, left:22*sc, right:22*sc, display:'flex', zIndex:10 }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7*sc }}>
            {stats.slice(0,3).map(s=>(
              <div key={s.l} style={{ display:'flex', alignItems:'baseline', gap:5*sc }}>
                <span style={{ fontSize:18*sc, fontWeight:900, lineHeight:1, color: tier==='amateur'?'#d1d5db':'#fff', fontFamily:"'Arial Black',Arial,sans-serif", textShadow: tier==='amateur'?'0 1px 3px rgba(0,0,0,0.9)':`0 0 10px ${t.accent}88`, minWidth:28*sc, textAlign:'right' }}>{s.v}</span>
                <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:1.5, color:t.accent, fontFamily:'Arial,sans-serif' }}>{s.l}</span>
              </div>
            ))}
          </div>
          <div style={{ width:1, alignSelf:'stretch', background:`linear-gradient(to bottom, transparent, ${t.accent}88, transparent)`, margin:`0 ${10*sc}px` }}/>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7*sc }}>
            {stats.slice(3).map(s=>(
              <div key={s.l} style={{ display:'flex', alignItems:'baseline', gap:5*sc }}>
                <span style={{ fontSize:18*sc, fontWeight:900, lineHeight:1, color: tier==='amateur'?'#d1d5db':'#fff', fontFamily:"'Arial Black',Arial,sans-serif", textShadow: tier==='amateur'?'0 1px 3px rgba(0,0,0,0.9)':`0 0 10px ${t.accent}88`, minWidth:28*sc, textAlign:'right' }}>{s.v}</span>
                <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:1.5, color:t.accent, fontFamily:'Arial,sans-serif' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elite particles */}
        {tier==='elite' && [...Array(8)].map((_,i)=>(
          <motion.div key={i}
            style={{ position:'absolute', width:2.5, height:2.5, borderRadius:'50%', background:t.accent, boxShadow:`0 0 6px ${t.accent}`, left:`${6+i*12}%`, zIndex:8, pointerEvents:'none' }}
            animate={{ y:['108%','-8%'], opacity:[0,1,0] }}
            transition={{ duration:2.2+i*0.4, repeat:Infinity, delay:i*0.4 }}
          />
        ))}

        {/* Pro pulse */}
        {tier==='pro' && (
          <motion.div animate={{ opacity:[0,0.18,0] }} transition={{ duration:2.5, repeat:Infinity }}
            style={{ position:'absolute', inset:0, borderRadius:20*sc, border:`4px solid ${t.accent}`, boxShadow:`inset 0 0 30px ${t.glow}`, pointerEvents:'none', zIndex:25 }}
          />
        )}

        {/* Elite golden sheen overlay */}
        {tier==='elite' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, rgba(255,215,0,0.2), transparent)',
            pointerEvents: 'none', zIndex: 26,
          }}/>
        )}

        {/* Branding */}
        <div style={{ position:'absolute', bottom:8*sc, left:0, right:0, textAlign:'center', zIndex:10, fontSize:5.5*sc, fontWeight:700, letterSpacing:3, color:'rgba(255,255,255,0.2)', fontFamily:'Arial,sans-serif' }}>
          PADEL PEÑAROL · FUT CARDS
        </div>

        {/* Inner border */}
        <div style={{ position:'absolute', inset:3*sc, borderRadius:17*sc, border:`1px solid ${t.accent}33`, pointerEvents:'none', zIndex:22 }}/>

        {/* Corner ornaments */}
        {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h])=>(
          <div key={`${v}${h}`} style={{
            position:'absolute', [v]:8*sc, [h]:8*sc, width:20*sc, height:20*sc,
            borderTop:    v==='top'    ? `2px solid ${t.accent}aa` : 'none',
            borderBottom: v==='bottom' ? `2px solid ${t.accent}aa` : 'none',
            borderLeft:   h==='left'   ? `2px solid ${t.accent}aa` : 'none',
            borderRight:  h==='right'  ? `2px solid ${t.accent}aa` : 'none',
            borderRadius: v==='top'&&h==='left'?'4px 0 0 0':v==='top'&&h==='right'?'0 4px 0 0':v==='bottom'&&h==='left'?'0 0 0 4px':'0 0 4px 0',
            pointerEvents:'none', zIndex:23,
          }}/>
        ))}
      </div>
    </motion.div>
  );
}
