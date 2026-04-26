'use client';

import { useState, useEffect } from 'react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { toast } from 'react-hot-toast';
import { Save, User, MapPin, Phone, Zap, Trophy } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { PlayerCard } from '@/components/PlayerCard';
import { clsx } from 'clsx';

export default function PerfilPage() {
  const { profile, saveProfile } = useGuestProfile();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    localidad: '',
    telefono: '',
    nivel: 1.0,
    posicion: 'Drive',
    categoria: '7ma',
    paleta: '',
    avatar_emoji: '👨‍🦱',
    paleta_modelo: 'carbono'
  });

  const AVATARS = [
    '👨‍🦱', '👩‍🦱', '🧔‍♂️', '👱‍♀️', '👨‍🦲', '👩‍🦳', '👨‍💼', '👩‍🎨', '🧔‍♀️', '👩‍🎓',
    '👨‍🎤', '👩‍🔬', '👨‍🚀', '👩‍🚀', '😎', '🤩', '🧐'
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        localidad: profile.localidad || '',
        telefono: profile.telefono || '',
        nivel: profile.nivel || 1.0,
        posicion: profile.posicion || 'Drive',
        categoria: profile.categoria || '7ma',
        paleta: profile.paleta || '',
        avatar_emoji: profile.avatar_emoji || '👨‍🦱',
        paleta_modelo: profile.paleta_modelo || 'carbono'
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile(formData as any);
      toast.success('¡Perfil actualizado!');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Prestigio para el Ambiente
  const isDiamante = formData.nivel >= 6.5;
  const isOro = formData.nivel >= 5.5;
  const isPlata = formData.nivel >= 4.5;
  const isMaster = formData.nivel >= 3.5;
  const isPro = formData.nivel >= 2.5;

  const themeColor = isDiamante ? "rgba(34, 211, 238, 0.2)" : 
                    isOro ? "rgba(250, 204, 21, 0.2)" : 
                    isPlata ? "rgba(255, 255, 255, 0.1)" :
                    isMaster ? "rgba(168, 85, 247, 0.15)" :
                    isPro ? "rgba(59, 130, 246, 0.15)" :
                    "rgba(16, 185, 129, 0.1)";

  const accentColor = isDiamante ? "#22d3ee" : isOro ? "#facc15" : isMaster ? "#a855f7" : "#8882dc";

  return (
    <PageWrapper>
      {/* Ambiente Dinámico de Prestigio */}
      <div 
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 z-0" 
        style={{ 
          background: `radial-gradient(circle at 20% 30%, ${themeColor} 0%, transparent 70%)`
        }} 
      />

      <div className="max-w-6xl mx-auto pb-20 relative z-10">
        <header className="mb-12">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">Tu Perfil <span className="text-primary">Pro</span></h2>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.3em] mt-2">Configurá tu identidad en la cancha</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: VISTA PREVIA (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-30 italic">Previsualización de Ficha</h3>
            
            <div className="relative group">
              {/* Brillo Ambiental detrás de la carta */}
              <div className="absolute inset-0 blur-[100px] opacity-20 transition-colors duration-1000" style={{ backgroundColor: accentColor }} />
              <PlayerCard profile={formData as any} />
            </div>

            <div className="text-center space-y-3 max-w-[320px]">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                  {isDiamante ? "💎 Estatus Diamante" : isOro ? "👑 Élite de Oro" : isPlata ? "🥈 Maestro de Plata" : "🎾 Jugador Pro"}
                </p>
              </div>
              <p className="text-[9px] font-bold uppercase opacity-30 leading-relaxed">
                Tu nivel y categoría determinan automáticamente la rareza de tu carta.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sección 1: Datos Personales */}
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                  />
                  <input 
                    type="text" placeholder="Apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                  />
                </div>
                <input 
                  type="text" placeholder="Localidad"
                  value={formData.localidad}
                  onChange={(e) => setFormData({...formData, localidad: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                />
              </div>

              {/* Sección 2: Perfil Técnico */}
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Nivel y Categoría</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase opacity-40">Nivel de Juego</label>
                      <div className="text-xl font-black text-primary italic uppercase tracking-tighter">
                        {formData.nivel <= 2.5 ? 'Iniciado' :
                         formData.nivel <= 4.0 ? 'Intermedio' :
                         formData.nivel <= 5.5 ? 'Avanzado' :
                         formData.nivel <= 6.5 ? 'Élite' : 'Leyenda Suprema'}
                      </div>
                    </div>
                    <span className="text-4xl font-black italic text-white opacity-20">L{formData.nivel.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="1.0" max="7.0" step="0.5"
                    value={formData.nivel}
                    onChange={(e) => setFormData({...formData, nivel: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={formData.posicion}
                    onChange={(e) => setFormData({...formData, posicion: e.target.value})}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none font-bold text-white focus:border-primary"
                  >
                    <option value="Drive" className="bg-zinc-900">Drive</option>
                    <option value="Revés" className="bg-zinc-900">Revés</option>
                    <option value="Ambos" className="bg-zinc-900">Ambos</option>
                  </select>
                  <select 
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none font-bold text-white focus:border-primary"
                  >
                    {['7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(c => (
                      <option key={c} value={c} className="bg-zinc-900">{c} Categoría</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-1">Tu Paleta Real</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                    <input 
                      type="text" placeholder="Ej: Bullpadel Vertex"
                      value={formData.paleta}
                      onChange={(e) => setFormData({...formData, paleta: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-5 text-sm focus:border-primary outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Personalización Visual */}
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Estilo Visual</h3>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase opacity-40">Elegí tu Rostro</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map(a => (
                      <button
                        key={a} type="button"
                        onClick={() => setFormData({...formData, avatar_emoji: a})}
                        className={clsx(
                          "w-10 h-10 flex items-center justify-center text-xl rounded-xl border transition-all",
                          formData.avatar_emoji === a ? "bg-primary border-primary scale-110 shadow-lg" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase opacity-40">Evolución de Paleta Pro</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'carbono', name: 'Carbon', col: 'bg-zinc-900' },
                      { id: 'oro', name: 'Oro', col: 'bg-yellow-500' },
                      { id: 'fuego', name: 'Fuego', col: 'bg-orange-600' },
                      { id: 'pro', name: 'Pro', col: 'bg-zinc-400' }
                    ].map(m => (
                      <button
                        key={m.id} type="button"
                        onClick={() => setFormData({...formData, paleta_modelo: m.id})}
                        className={clsx(
                          "p-3 rounded-xl flex flex-col items-center gap-2 border transition-all",
                          formData.paleta_modelo === m.id ? "border-primary bg-primary/10 shadow-lg" : "bg-white/5 border-white/10"
                        )}
                      >
                        <div className={clsx("w-5 h-5 rounded-full", m.col)} />
                        <span className="text-[7px] font-black uppercase">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-black shadow-lg relative overflow-hidden group"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 20px 40px ${accentColor}33`
                }}
              >
                {/* Efecto de Brillo al pasar el mouse */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                
                {loading ? 'Sincronizando...' : 'Guardar Identidad Legendaria'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
