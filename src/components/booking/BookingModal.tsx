'use client';

import { useState, useEffect } from 'react';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { supabase } from '@/lib/supabase';
import { X, Send, Phone, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingModalProps {
  hora: string;
  cancha: number;
  fecha: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ hora, cancha, fecha, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { profile, saveProfile } = useGuestProfile();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setNombre(`${profile.nombre} ${profile.apellido}`);
      setTelefono(profile.telefono);
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || telefono.length < 10) {
      return toast.error('Completá nombre y un WhatsApp válido');
    }

    setSubmitting(true);
    try {
      // 1. Obtener el club activo (Multi-Tenant)
      const cookies = document.cookie.split('; ');
      const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
      const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'penarol';

      const { data: clubData } = await supabase
        .from('clubes')
        .select('id')
        .eq('slug', activeSlug)
        .single();

      // 3-per-day limit check
      const { data: existing } = await supabase
        .from('reservas')
        .select('id')
        .eq('fecha', fecha)
        .eq('telefono', telefono);

      if (existing && existing.length >= 3) {
        throw new Error('Ya tenés 3 turnos reservados para este día. ¡Dejá jugar al resto! 😉');
      }

      const { error } = await supabase.from('reservas').insert({
        fecha,
        hora,
        cancha,
        nombre: `${nombre} (Next)`,
        telefono,
        ...(clubData ? { club_id: clubData.id } : {})
      });

      if (error) {
        if (error.code === '23505' || error.message?.includes('reservas_fecha_hora_cancha_key')) {
          throw new Error('Este turno ya fue reservado por otra persona. ¡Elegí otro horario!');
        }
        throw error;
      }

      // Auto-save profile if new
      if (!profile) {
        const [n, ...a] = nombre.split(' ');
        saveProfile({
          nombre: n,
          apellido: a.join(' '),
          telefono,
          localidad: ''
        });
      }

      toast.success('¡Turno reservado correctamente!');
      
      // Notify WhatsApp (Optional, usually better to let user click)
      const msg = encodeURIComponent(`¡Hola! Reservé el ${fecha} a las ${hora} hs (Cancha ${cancha}). Nombre: ${nombre}.`);
      window.open(`https://wa.me/2923659885?text=${msg}`, '_blank');
      
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Error al reservar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md glass rounded-3xl p-8 border border-white/10"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="mb-8">
            <span className="bg-primary text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Confirmar Turno
            </span>
            <h2 className="text-2xl font-black mt-3">
              {hora} hs <span className="text-white/40">·</span> Cancha {cancha}
            </h2>
            <p className="text-sm text-white/50 mt-1">{fecha}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Tu Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="tel" 
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 2923000000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-primary text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Confirmar Reserva
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
