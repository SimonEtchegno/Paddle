'use client';

import { useState, useEffect } from 'react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { UserProfile } from '@/types';
import { toast } from 'react-hot-toast';
import { Save, User, MapPin, Phone, Zap, Trophy, Share2, Camera, Trash2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { PlayerCard } from '@/components/PlayerCard';
import { clsx } from 'clsx';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { toPng } from 'html-to-image';

export default function PerfilPage() {
  const { profile, saveProfile, realPoints } = useGuestProfile();
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');

  const [formData, setFormData] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    localidad: '',
    telefono: '',
    posicion: 'Drive',
    categoria: '7ma',
    paleta: '',
    avatar_url: '',
    paleta_modelo: 'carbono'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        localidad: profile.localidad || '',
        telefono: profile.telefono || '',
        posicion: profile.posicion || 'Drive',
        categoria: profile.categoria || '7ma',
        paleta: profile.paleta || '',
        avatar_url: profile.avatar_url || '',
        paleta_modelo: profile.paleta_modelo || 'carbono'
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen es muy pesada (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setFormData({ ...formData, avatar_url: croppedImage });
      setCropModalOpen(false);
      setImageToCrop('');
    } catch (e) {
      console.error(e);
      toast.error('Error al recortar la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile(formData);
      toast.success('¡Perfil actualizado!');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = async () => {
    const el = document.getElementById('player-card-download');
    if (!el) return;

    const t = toast.loading('Preparando tu carta profesional...');

    try {
      // Pequeño delay para asegurar renderizado final
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 3, // Calidad super alta
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const link = document.createElement('a');
      link.download = `Ficha-FUT-${formData.apellido || 'Jugador'}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('¡Carta descargada con éxito!', { id: t });
    } catch (err) {
      console.error(err);
      toast.error('Hubo un problema al generar la imagen', { id: t });
    }
  };

  // Lógica de Prestigio para el Ambiente
  const points = realPoints || 0;
  const isTOTY = points >= 1000;
  const isDiamond = points >= 500 && points < 1000;
  const isGold = points >= 200 && points < 500;
  const isSilver = points >= 100 && points < 200;

  const themeColor = isTOTY ? "rgba(30, 58, 138, 0.4)" :
    isDiamond ? "rgba(34, 211, 238, 0.2)" :
      isGold ? "rgba(250, 204, 21, 0.15)" :
        isSilver ? "rgba(161, 161, 170, 0.1)" :
          "rgba(154, 52, 18, 0.1)";

  const accentColor = isTOTY ? "#fbbf24" :
    isDiamond ? "#22d3ee" :
      isGold ? "#facc15" :
        isSilver ? "#a1a1aa" :
          "#c2410c";

  const getNivelLabel = (n: number, cat: string) => {
    if (cat === '1ra') return 'Elite Profesional';
    if (cat === '2da') return 'Semi-Profesional';
    if (cat === '3ra') return 'Competitivo Avanzado';
    if (cat === '4ta') return 'Avanzado';
    if (cat === '5ta') return 'Intermedio';
    if (cat === '6ta') return 'Amateur';
    return 'Iniciado / 7ma';
  };

  const isPhoneValid = formData.telefono.length >= 8;

  return (
    <PageWrapper>
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-1000 z-0 overflow-hidden"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${themeColor} 0%, transparent 70%)`
        }}
      />

      <div className="max-w-6xl mx-auto pb-20 relative z-10">
        <header className="mb-12">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">Tu Ficha <span className="text-primary">FUT</span></h2>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.3em] mt-2">Personalizá tu tarjeta de jugador profesional</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 flex flex-col items-center gap-6 pb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-30 italic">Previsualización de Carta</h3>

              <div id="player-card-download" className="relative flex justify-center" style={{ overflow: 'visible', padding: '20px' }}>
                <div className="absolute inset-0 blur-[120px] opacity-25 transition-colors duration-1000" style={{ backgroundColor: accentColor }} />
                <PlayerCard profile={formData} realPoints={realPoints} />
              </div>

              <div className="w-full max-w-[320px] space-y-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    <span>Progreso de Ranking</span>
                    <span style={{ color: accentColor }}>{realPoints !== null ? realPoints : 0} PTS</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      animate={{ width: `${Math.min(100, ((realPoints || 0) / 1000) * 100)}%` }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCard}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl group"
                  style={{ backgroundColor: accentColor, color: '#000' }}
                >
                  <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
                  Descargar Carta HD
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                  />
                  <input
                    type="text" placeholder="Apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                  />
                </div>
                <input
                  type="text" placeholder="Localidad"
                  value={formData.localidad}
                  onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:border-primary outline-none font-bold"
                />
                <div className="relative">
                  <input
                    type="tel" placeholder="WhatsApp (ej: 2923123456)"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                    className={`w-full bg-white/5 border rounded-xl py-4 px-5 pr-12 text-sm outline-none font-bold transition-all ${formData.telefono.length === 0 ? 'border-white/10 focus:border-primary' :
                      isPhoneValid ? 'border-emerald-500/50 focus:border-emerald-400' :
                        'border-red-500/50 focus:border-red-400'
                      }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {formData.telefono.length > 0 && (
                      <span className={`text-xs font-black ${isPhoneValid ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {isPhoneValid ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Atributos y Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase opacity-40">Nivel de Habilidad</label>
                      <div className="text-xl font-black text-primary italic uppercase tracking-tighter">
                        {realPoints !== null ? (realPoints >= 1000 ? 'Leyenda' : realPoints >= 500 ? 'Elite' : realPoints >= 200 ? 'Gold' : realPoints >= 100 ? 'Silver' : 'Bronze') : 'Inicial'}
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-4xl font-black italic text-white opacity-20">
                        {realPoints !== null ? realPoints : 0} <span className="text-xl">PTS</span>
                      </span>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Ranking Peñarol</p>
                    </div>
                  </div>

                  {/* Barra visual bloqueada */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, ((realPoints || 0) / 1000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-30 px-0.5">
                    <span>0 PTS</span>
                    <span>Puntos obtenidos en Torneos Oficiales</span>
                    <span>1000+ PTS</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.posicion}
                    onChange={(e) => setFormData({ ...formData, posicion: e.target.value as 'Drive' | 'Revés' | 'Ambos' })}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none font-bold text-white focus:border-primary"
                  >
                    <option value="Drive" className="bg-zinc-900">Drive</option>
                    <option value="Revés" className="bg-zinc-900">Revés</option>
                    <option value="Ambos" className="bg-zinc-900">Ambos</option>
                  </select>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none font-bold text-white focus:border-primary"
                  >
                    {['7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(c => (
                      <option key={c} value={c} className="bg-zinc-900">{c} Categoría</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Foto de Jugador</h3>
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar_url: '' })}
                      className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Eliminar Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-primary/10 text-primary font-black text-2xl uppercase">
                          {(formData.nombre?.[0] || '') + (formData.apellido?.[0] || '') || <User size={32} className="opacity-30" />}
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <Camera size={24} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-bold">Subí tu foto para la carta</p>
                    <p className="text-[10px] font-medium opacity-40 leading-relaxed">
                      Se recomienda una foto de frente con buena iluminación. <br />
                      Formatos: JPG, PNG. Máx 2MB.
                    </p>
                    <label className="inline-block px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all">
                      Seleccionar Archivo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
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
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                {loading ? 'Actualizando Stats...' : 'Guardar Ficha Profesional'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Cropper Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md flex flex-col gap-6 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase tracking-widest text-center text-white">Ajustar Foto</h3>

            <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 text-white">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setCropModalOpen(false);
                  setImageToCrop('');
                }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs text-white font-black uppercase tracking-widest hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCropImage}
                className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Recortar
              </button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
}
