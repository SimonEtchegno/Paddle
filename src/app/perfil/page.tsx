'use client';

import { useState, useEffect } from 'react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { User, Phone, MapPin, Save, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { PageWrapper } from '@/components/PageWrapper';
import { LoadingPro } from '@/components/ui/LoadingPro';

export default function PerfilPage() {
  const { profile, saveProfile, logout, loading } = useGuestProfile();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    localidad: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.telefono.length < 10) {
      return toast.error('Completá nombre y un WhatsApp válido');
    }
    saveProfile(formData);
    toast.success('Perfil guardado en este dispositivo');
  };

  if (loading) return (
    <PageWrapper>
      <LoadingPro />
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto space-y-10 pb-20 pt-10">
        <header className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary animate-pulse">
            <User size={32} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mt-4">Mi <span className="text-primary">Perfil</span></h2>
          <p className="text-[10px] opacity-50 font-bold uppercase tracking-[0.2em]">Los datos se guardan solo en este celular</p>
        </header>

      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="glass p-8 rounded-[2rem] space-y-6 border border-white/5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Nombre</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Tu nombre"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Apellido</label>
            <input 
              type="text" 
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              placeholder="Tu apellido"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1 flex items-center gap-2">
            <Phone size={12} /> WhatsApp (Sin 0 ni 15)
          </label>
          <input 
            type="tel" 
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})}
            placeholder="Ej: 2923456789"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1 flex items-center gap-2">
            <MapPin size={12} /> Localidad
          </label>
          <input 
            type="text" 
            value={formData.localidad}
            onChange={(e) => setFormData({...formData, localidad: e.target.value})}
            placeholder="Ej: Puan"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="pt-4 space-y-4">
          <button 
            type="submit" 
            className="w-full bg-primary text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,255,0,0.1)]"
          >
            <Save size={18} />
            Guardar Cambios
          </button>
          
          {profile && (
            <button 
              type="button"
              onClick={() => {
                if(confirm('¿Seguro quieres cerrar sesión? Se borrarán tus datos de este dispositivo.')) logout();
              }}
              className="w-full text-error/60 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-error transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Borrar perfil del dispositivo
            </button>
          )}
        </div>
      </motion.form>
      </div>
    </PageWrapper>
  );
}
