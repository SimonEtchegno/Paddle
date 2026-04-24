'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { X, Calendar, Clock, Trophy, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profile: any;
}

export function CreateMatchModal({ isOpen, onClose, onSuccess, profile }: CreateMatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hora, setHora] = useState('18:00');
  const [nivel, setNivel] = useState('4ta');
  const [faltan, setFaltan] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return toast.error('Completá tu perfil primero');
    
    setLoading(true);
    try {
      // VALIDACIÓN: WhatsApp Único (1 partido activo por persona)
      const hoy = format(new Date(), 'yyyy-MM-dd');
      const { data: existing, error: checkError } = await supabase
        .from('partidos_abiertos')
        .select('id')
        .eq('contacto_whatsapp', profile.telefono)
        .gte('fecha', hoy);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        throw new Error('Ya tenés un partido publicado hoy o a futuro. Borrá el anterior para crear uno nuevo.');
      }

      const { error } = await supabase.from('partidos_abiertos').insert({
        creador_id: profile.uid || profile.telefono, // Intentar con UID si existe, sino teléfono
        nombre_creador: `${profile.nombre} ${profile.apellido}`,
        fecha,
        hora,
        nivel,
        jugadores_faltantes: faltan,
        contacto_whatsapp: profile.telefono
      });

      if (error) throw error;

      toast.success('¡Partido publicado!');
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error('Error al publicar:', e);
      toast.error(e.message || 'Error al publicar el partido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative glass w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Publicar <span className="text-primary">Partido</span></h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Fecha</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                      <input 
                        type="date" 
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Hora</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                      <input 
                        type="time" 
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Nivel Aproximado</label>
                  <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                    <select 
                      value={nivel}
                      onChange={(e) => setNivel(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="Principiante">Principiante</option>
                      <option value="7ma">7ma Categoría</option>
                      <option value="6ta">6ta Categoría</option>
                      <option value="5ta">5ta Categoría</option>
                      <option value="4ta">4ta Categoría</option>
                      <option value="3ra">3ra Categoría</option>
                      <option value="Pro">Profesional / Open</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">¿Cuántos jugadores faltan?</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                    <select 
                      value={faltan}
                      onChange={(e) => setFaltan(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value={1}>Falta 1 jugador</option>
                      <option value={2}>Faltan 2 jugadores</option>
                      <option value={3}>Faltan 3 jugadores (Busco Pareja + Rival)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading}
                    className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(76,175,80,0.2)] disabled:opacity-50"
                  >
                    {loading ? 'Publicando...' : 'Publicar Ahora'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
