'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Building2, Plus, LogOut, CheckCircle2, Edit2, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubes, setClubes] = useState<any[]>([]);
  
  // Formulario
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    color_principal: '#8882dc',
    logo_url: ''
  });

  // Los mails que tienen permiso para entrar a esta pantalla oculta
  const SUPER_ADMINS = ['setchegno@etman.com.ar', 'octavioducos24@gmail.com'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && SUPER_ADMINS.includes(session.user.email || '')) {
      setIsAuthorized(true);
      fetchClubes();
    } else {
      toast.error('Acceso denegado. Área Súper Admin.');
      router.push('/');
    }
  };

  const fetchClubes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setClubes(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generar slug automáticamente si está vacío
    const slugToSave = formData.slug || formData.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const dataToSave = { ...formData, slug: slugToSave };

    if (isEditing) {
      const { error } = await supabase
        .from('clubes')
        .update(dataToSave)
        .eq('id', isEditing);
        
      if (!error) {
        toast.success('Club actualizado');
        setIsEditing(null);
      } else {
        toast.error('Error al actualizar: Asegurate de tener permisos RLS');
      }
    } else {
      const { error } = await supabase
        .from('clubes')
        .insert([dataToSave]);
        
      if (!error) {
        toast.success('¡Nuevo Club creado con éxito!');
      } else {
        toast.error('Error al crear: Asegurate de tener permisos RLS');
      }
    }
    
    setFormData({ nombre: '', slug: '', color_principal: '#8882dc', logo_url: '' });
    fetchClubes();
  };

  const handleEdit = (club: any) => {
    setIsEditing(club.id);
    setFormData({
      nombre: club.nombre,
      slug: club.slug || '',
      color_principal: club.color_principal || '#8882dc',
      logo_url: club.logo_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthorized) return <div className="min-h-screen bg-background" />;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        
        {/* Header Súper Admin */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass rounded-[3rem] border border-primary/20 shadow-[0_0_50px_rgba(136,130,220,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent -z-10" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">SaaS Master</h1>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 text-primary">Panel Multi-Club</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push('/admin')} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Volver al Admin
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario (Crear / Editar) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                {isEditing ? <Edit2 size={18} className="text-primary"/> : <Plus size={18} className="text-primary"/>}
                {isEditing ? 'Editar Club' : 'Nuevo Cliente'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Nombre del Club</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Los Pinos Pádel"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Nombre para el link (slug)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                    placeholder="ej: los-pinos"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <p className="text-[8px] opacity-30 uppercase font-bold pl-2">Se usará como: club.padelmanager.com</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Color Principal (Hex)</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={formData.color_principal}
                      onChange={e => setFormData({...formData, color_principal: e.target.value})}
                      className="w-14 h-14 rounded-2xl cursor-pointer bg-white/5 border border-white/10 p-1"
                    />
                    <input 
                      type="text" 
                      value={formData.color_principal}
                      onChange={e => setFormData({...formData, color_principal: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">URL del Logo (Opcional)</label>
                  <input 
                    type="url" 
                    value={formData.logo_url}
                    onChange={e => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-[0_0_20px_rgba(136,130,220,0.3)]"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Club'}
                </button>

                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => { setIsEditing(null); setFormData({ nombre: '', slug: '', color_principal: '#8882dc', logo_url: '' }); }}
                    className="w-full py-4 bg-white/5 text-white/50 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
                  >
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Lista de Clubes Clientes */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest pl-4 opacity-50">Mis Clientes SaaS</h3>
            
            {loading ? (
              <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest text-xs">Cargando clubes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubes.map(club => (
                  <motion.div 
                    key={club.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-6 relative overflow-hidden group hover:border-white/20 transition-colors"
                  >
                    {/* Indicador de Color del Club */}
                    <div 
                      className="absolute top-0 left-0 w-2 h-full" 
                      style={{ backgroundColor: club.color_principal || '#8882dc' }}
                    />
                    
                    <div className="pl-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter italic">{club.nombre}</h4>
                        <p className="text-[10px] font-bold opacity-40 break-all">{club.id}</p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">/{club.slug}</p>
                      </div>
                      {club.logo_url && (
                        <img src={club.logo_url} alt={club.nombre} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      )}
                    </div>

                    <div className="pl-4 mt-auto flex gap-2">
                      <button 
                        onClick={() => handleEdit(club)}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                      >
                        <Palette size={14} /> Editar
                      </button>
                      <button 
                        onClick={() => {
                          document.cookie = `active_club_slug=${club.slug || 'penarol'}; path=/; max-age=31536000`;
                          toast.success(`Cambiando a vista de ${club.nombre}...`);
                          setTimeout(() => window.location.href = '/', 1000);
                        }}
                        className="px-4 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                      >
                        Vista Previa
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
