'use client';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types';

interface Props { profile: UserProfile & { paleta_modelo?: string }; compact?: boolean; }

const CATEGORY_BGS = {
  '1ra': '/card-bg-elite.png',
  '2da': '/card-bg-diamond-cat.png',
  '3ra': '/card-bg-tercera.png',
  '4ta': '/card-bg-avanzado.png',
  '5ta': '/card-bg-pro.png',
  '6ta': '/card-bg-intermedio.png',
  '7ma': '/card-bg-amateur.png',
  'default': '/card-bg-amateur.png'
};

const LEVEL_ACCENTS = {
  bronze:  { border:'#b87333', glow:'rgba(184,115,51,0.3)',  accent:'#cd7f32', badge:'#5c3a21', badgeT:'#e8b88e' },
  silver:  { border:'#a1a1aa', glow:'rgba(161,161,170,0.3)', accent:'#d4d4d8', badge:'#27272a', badgeT:'#f4f4f5' },
  gold:    { border:'#ffd90099', glow:'#ffd700', accent:'#fbbf24', badge:'#78350f', badgeT:'#fde68a' },
  diamond: { border:'#00f2ff', glow:'#00f2ff', accent:'#22d3ee', badge:'#083344', badgeT:'#22d3ee' },
};

function getStyles(l: number, cat: string) {
  const bg = CATEGORY_BGS[cat as keyof typeof CATEGORY_BGS] || CATEGORY_BGS.default;
  
  let levelType: keyof typeof LEVEL_ACCENTS = 'bronze';
  if (l >= 6.0) levelType = 'diamond';
  else if (l >= 5.0) levelType = 'gold';
  else if (l >= 3.5) levelType = 'silver';
  
  return {
    bg,
    ...LEVEL_ACCENTS[levelType],
    levelType
  };
}

export function PlayerCard({ profile, compact = false }: Props) {
  const level = profile.nivel || 1;
  const s = getStyles(level, profile.categoria || '7ma');
  
  // OVR Calculation (Points)
  const basePoints = (level / 7) * 99;
  const catBonus = profile.categoria === '1ra' ? 15 : profile.categoria === '2da' ? 10 : profile.categoria === '3ra' ? 5 : 0;
  const ovr = Math.min(99, Math.round(basePoints + catBonus));

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
      {/* Ambient glow - None for Bronze */}
      {s.levelType !== 'bronze' && (
        <div style={{ position:'absolute', inset:-18*sc, borderRadius:30*sc, background:s.glow, filter:`blur(${s.levelType==='diamond'?36:28}px)`, opacity:s.levelType==='diamond'?0.9:0.7, zIndex:0, pointerEvents:'none' }}/>
      )}

      {/* Card — overflow:hidden clips everything inside */}
      <div style={{
        position:'absolute', inset:0,
        borderRadius:20*sc,
        border:`2px solid ${s.border}`,
        boxShadow:`0 0 0 1px ${s.accent}${s.levelType==='bronze'?'10':'20'} inset, ${s.levelType==='bronze' ? '0 10px 30px rgba(0,0,0,0.8)' : `0 0 ${s.levelType==='diamond'?60:40}px ${s.glow}, 0 20px 60px rgba(0,0,0,0.95)`}`,
        overflow:'hidden',
        zIndex:1,
      }}>

        {/* ── Layer 1: FIFA background art ── */}
        <img
          src={s.bg}
          alt=""
          aria-hidden
          style={{ 
            position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', zIndex:0, display:'block',
            filter: s.levelType === 'diamond' && (profile.categoria === '1ra' || profile.categoria === '2da') ? 'hue-rotate(160deg) brightness(1.05) contrast(1.1)' : 'none'
          }}
        />

        {/* ── Layer 2: Center spotlight effect ── */}
        {s.levelType !== 'bronze' && (
          <div style={{
            position:'absolute', top:'15%', left:'10%', right:'10%', height:'55%',
            background:`radial-gradient(ellipse at center, ${s.accent}${s.levelType==='diamond'?'40':s.levelType==='gold'?'30':'20'} 0%, transparent 70%)`,
            zIndex:2, pointerEvents:'none',
          }}/>
        )}

        {/* ── Layer 2.5: Player Photo / Initials ── */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'74%', zIndex:2, pointerEvents:'none', display:'flex', justifyContent:'center', alignItems:'flex-end' }}>
          <div style={{
            width: 180 * sc,
            height: 180 * sc,
            marginBottom: 20 * sc,
            marginLeft: 50 * sc,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${s.accent}`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${s.accent}66`,
                  filter: `drop-shadow(0 0 10px ${s.accent}44)`,
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${s.badge} 0%, ${s.accent}44 100%)`,
                border: `3px solid ${s.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60 * sc,
                fontWeight: 900,
                color: '#fff',
                fontFamily: "'Arial Black', Impact, sans-serif",
                textShadow: `0 2px 10px rgba(0,0,0,0.5)`,
                boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${s.accent}66`,
              }}>
                {(profile.nombre?.[0] || '') + (profile.apellido?.[0] || '') || 'JP'}
              </div>
            )}
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
          position:'absolute', top:15*sc, left:10*sc, padding: `${5*sc}px ${10*sc}px`,
          display:'flex', flexDirection:'column', alignItems:'center',
          zIndex:10,
          background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 80%)',
          borderRadius: '50%'
        }}>
          {/* OVR */}
          <div style={{
            fontSize:56*sc, fontWeight:900, lineHeight:0.9, color: '#fff',
            fontFamily:"'Arial Black',Impact,sans-serif",
            textShadow: `0 2px 10px rgba(0,0,0,0.9), 0 0 20px ${s.accent}, 0 0 40px ${s.accent}44`,
            letterSpacing:-2,
            position: 'relative',
            zIndex: 1
          }}>{Math.round((level/7)*1000)}</div>
          
          {/* PTS Label */}
          <div style={{ 
            fontSize:14*sc, fontWeight:800, letterSpacing:1.5, color: s.accent, 
            fontFamily:'Arial,sans-serif', textShadow: `0 0 10px ${s.accent}`,
            marginTop: 2*sc, marginBottom: 6*sc
          }}>PTS</div>
          
          {/* Separator */}
          <div style={{ width:'80%', height:1, background:`${s.accent}66`, marginBottom: 6*sc }} />

          {/* Flag */}
          <div style={{ width:28*sc, height:18*sc, borderRadius:2, overflow:'hidden', boxShadow:'0 2px 6px rgba(0,0,0,0.7)', marginBottom: 6*sc }}>
            <div style={{ height:'33%', background:'#74ACDF' }}/>
            <div style={{ height:'34%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:5*sc, height:5*sc, borderRadius:'50%', background:'#F6B40E' }}/>
            </div>
            <div style={{ height:'33%', background:'#74ACDF' }}/>
          </div>

          {/* Separator */}
          <div style={{ width:'80%', height:1, background:`${s.accent}66`, marginBottom: 6*sc }} />

          {/* Club / Chemistry */}
          <div style={{
            width:28*sc, height:28*sc, borderRadius:'50%',
            background:'rgba(0,0,0,0.6)', border:`1px solid ${s.border}88`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14*sc,
            boxShadow:`0 0 8px ${s.glow}`,
            marginBottom: 4*sc
          }}>🎾</div>

          {/* POS */}
          <div style={{ 
            fontSize:10*sc, fontWeight:900, letterSpacing:1, color: '#fff', 
            fontFamily:'Arial,sans-serif', opacity: 0.8,
            background: 'rgba(0,0,0,0.4)', padding: `${2*sc}px ${6*sc}px`, borderRadius: 4*sc
          }}>{pos}</div>
        </div>

        {/* ── Name ── */}
        <div style={{
          position:'absolute', top:288*sc, left:0, right:0,
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:4*sc, zIndex:10,
        }}>
          <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:4, color:s.accent, fontFamily:'Arial,sans-serif', opacity:0.85 }}>
            {profile.categoria || '7ma'} CATEGORÍA
          </span>
          <span style={{
            fontSize:24*sc, fontWeight:900, letterSpacing:3,
            color: s.levelType==='bronze'?'#e5e7eb':'#fff', fontFamily:"'Arial Black',Impact,sans-serif",
            textShadow: s.levelType==='bronze' ? `0 2px 6px rgba(0,0,0,0.9)` : `0 0 20px ${s.accent}99, 0 2px 12px rgba(0,0,0,0.95)`,
            lineHeight:1,
          }}>{name}</span>
          <div style={{ width:'72%', height:1, background:`linear-gradient(to right, transparent, ${s.accent}bb, transparent)`, marginTop:3*sc }}/>
        </div>

        {/* ── Stats ── */}
        <div style={{ position:'absolute', top:348*sc, left:22*sc, right:22*sc, display:'flex', zIndex:10 }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7*sc }}>
            {stats.slice(0,3).map(st=>(
              <div key={st.l} style={{ display:'flex', alignItems:'baseline', gap:5*sc }}>
                <span style={{ fontSize:18*sc, fontWeight:900, lineHeight:1, color: s.levelType==='bronze'?'#d1d5db':'#fff', fontFamily:"'Arial Black',Arial,sans-serif", textShadow: s.levelType==='bronze'?'0 1px 3px rgba(0,0,0,0.9)':`0 0 10px ${s.accent}88`, minWidth:28*sc, textAlign:'right' }}>{st.v}</span>
                <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:1.5, color:s.accent, fontFamily:'Arial,sans-serif' }}>{st.l}</span>
              </div>
            ))}
          </div>
          <div style={{ width:1, alignSelf:'stretch', background:`linear-gradient(to bottom, transparent, ${s.accent}88, transparent)`, margin:`0 ${10*sc}px` }}/>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7*sc }}>
            {stats.slice(3).map(st=>(
              <div key={st.l} style={{ display:'flex', alignItems:'baseline', gap:5*sc }}>
                <span style={{ fontSize:18*sc, fontWeight:900, lineHeight:1, color: s.levelType==='bronze'?'#d1d5db':'#fff', fontFamily:"'Arial Black',Arial,sans-serif", textShadow: s.levelType==='bronze'?'0 1px 3px rgba(0,0,0,0.9)':`0 0 10px ${s.accent}88`, minWidth:28*sc, textAlign:'right' }}>{st.v}</span>
                <span style={{ fontSize:9*sc, fontWeight:700, letterSpacing:1.5, color:s.accent, fontFamily:'Arial,sans-serif' }}>{st.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elite/Diamond particles */}
        {(s.levelType==='gold' || s.levelType==='diamond') && [...Array(s.levelType==='diamond' ? 12 : 8)].map((_,i)=>(
          <motion.div key={i}
            style={{ position:'absolute', width:2.5, height:2.5, borderRadius:'50%', background:s.accent, boxShadow:`0 0 6px ${s.accent}`, left:`${6+i*(s.levelType==='diamond'?8:12)}%`, zIndex:8, pointerEvents:'none' }}
            animate={{ y:['108%','-8%'], opacity:[0,1,0], x:[0, (i%2===0?10:-10)*sc, 0] }}
            transition={{ duration:2.2+i*0.4, repeat:Infinity, delay:i*0.4 }}
          />
        ))}

        {/* Pro pulse */}
        {s.levelType==='silver' && (
          <motion.div animate={{ opacity:[0,0.18,0] }} transition={{ duration:2.5, repeat:Infinity }}
            style={{ position:'absolute', inset:0, borderRadius:20*sc, border:`4px solid ${s.accent}`, boxShadow:`inset 0 0 30px ${s.glow}`, pointerEvents:'none', zIndex:25 }}
          />
        )}

        {/* Elite/Diamond sheen overlay */}
        {(s.levelType==='gold' || s.levelType==='diamond') && (
          <div style={{
            position: 'absolute', inset: 0,
            background: s.levelType === 'diamond' 
              ? 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.12), transparent)'
              : 'radial-gradient(circle, rgba(255,215,0,0.12), transparent)',
            pointerEvents: 'none', zIndex: 26,
          }}/>
        )}

        {/* Branding */}
        <div style={{ position:'absolute', bottom:8*sc, left:0, right:0, textAlign:'center', zIndex:10, fontSize:5.5*sc, fontWeight:700, letterSpacing:3, color:'rgba(255,255,255,0.2)', fontFamily:'Arial,sans-serif' }}>
          PADEL PEÑAROL · FUT CARDS
        </div>

        {/* Inner border */}
        <div style={{ position:'absolute', inset:3*sc, borderRadius:17*sc, border:`1px solid ${s.accent}33`, pointerEvents:'none', zIndex:22 }}/>

        {/* Corner ornaments */}
        {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h])=>(
          <div key={`${v}${h}`} style={{
            position:'absolute', [v]:8*sc, [h]:8*sc, width:20*sc, height:20*sc,
            borderTop:    v==='top'    ? `2px solid ${s.accent}aa` : 'none',
            borderBottom: v==='bottom' ? `2px solid ${s.accent}aa` : 'none',
            borderLeft:   h==='left'   ? `2px solid ${s.accent}aa` : 'none',
            borderRight:  h==='right'  ? `2px solid ${s.accent}aa` : 'none',
            borderRadius: v==='top'&&h==='left'?'4px 0 0 0':v==='top'&&h==='right'?'0 4px 0 0':v==='bottom'&&h==='left'?'0 0 0 4px':'0 0 4px 0',
            pointerEvents:'none', zIndex:23,
          }}/>
        ))}
      </div>
    </motion.div>
  );
}
