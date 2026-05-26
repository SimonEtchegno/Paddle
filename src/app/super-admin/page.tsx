'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Edit2, Palette, Trash2, Globe, 
  Activity, Sparkles, ExternalLink, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubes, setClubes] = useState<any[]>([]);
  const [currentDomain, setCurrentDomain] = useState('padelmanager.com');
  
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
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (!host.includes('localhost')) {
        // Extraer el dominio base (ej: app.padelmanager.com -> padelmanager.com)
        const parts = host.split('.');
        if (parts.length > 2) {
          setCurrentDomain(parts.slice(-2).join('.'));
        } else {
          setCurrentDomain(host);
        }
      }
    }
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
    const slugToSave = formData.slug.trim() || formData.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const dataToSave = { 
      nombre: formData.nombre.trim(), 
      slug: slugToSave, 
      color_principal: formData.color_principal, 
      logo_url: formData.logo_url.trim() 
    };

    const loadingToast = toast.loading(isEditing ? 'Actualizando club...' : 'Creando nuevo club...');
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('clubes')
          .update(dataToSave)
          .eq('id', isEditing);
          
        if (error) throw error;
        toast.success('Club actualizado con éxito', { id: loadingToast });
        setIsEditing(null);
      } else {
        const { error } = await supabase
          .from('clubes')
          .insert([dataToSave]);
          
        if (error) throw error;
        toast.success('¡Nuevo club registrado correctamente! 🎉', { id: loadingToast });
      }
      
      setFormData({ nombre: '', slug: '', color_principal: '#8882dc', logo_url: '' });
      fetchClubes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al guardar. Verifica los permisos de RLS.', { id: loadingToast });
    }
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

  const handleDelete = async (id: string, nombre: string) => {
    const confirmDelete = window.confirm(
      `⚠️ ¿ATENCIÓN! ¿Estás seguro de que deseas eliminar el club "${nombre.toUpperCase()}"?\n\nEsta acción eliminará todas las reservas de este club y no se puede deshacer.`
    );
    if (!confirmDelete) return;

    const loadingToast = toast.loading("Eliminando club y registros asociados...");
    try {
      const { error } = await supabase
        .from('clubes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Club eliminado con éxito 🗑️', { id: loadingToast });
      fetchClubes();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el club.', { id: loadingToast });
    }
  };

  if (!isAuthorized) return <div className="min-h-screen bg-[#0a0b0e]" />;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-10 pb-24">
        
        {/* Header SaaS Master Dashboard */}
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass rounded-[2.5rem] border border-primary/20 shadow-[0_0_50px_rgba(136,130,220,0.08)] overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(136,130,220,0.2)]">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">SaaS Master</h1>
                <span className="bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Pro</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">
                Panel de control de infraestructura Multi-Club
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin')} 
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Volver al Admin
            </button>
            <button 
              onClick={fetchClubes} 
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="Sincronizar Datos"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Tarjetas de Estadísticas rápidas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">Clientes Activos</p>
              <h3 className="text-3xl font-black text-white mt-1">{clubes.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <Sparkles size={20} />
            </div>
          </div>
          
          <div className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">Dominio Base</p>
              <h3 className="text-sm font-black text-white mt-2 font-mono truncate max-w-[170px]">{currentDomain}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe size={20} />
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">Servicio de Base de Datos</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Online</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity size={20} />
            </div>
          </div>
        </section>

        {/* Contenido Principal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulario (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[6px]" style={{ backgroundColor: formData.color_principal }} />
              
              <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-8 text-white">
                {isEditing ? <Edit2 size={16} className="text-primary"/> : <Plus size={16} className="text-primary"/>}
                {isEditing ? 'Editar Club Existente' : 'Registrar Nuevo Club'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Nombre del Club</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nombre}
                    onChange={e => {
                      const val = e.target.value;
                      // Autocompletar slug de manera inteligente mientras tipea (solo si no está editando)
                      const newSlug = isEditing ? formData.slug : val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      setFormData({...formData, nombre: val, slug: newSlug});
                    }}
                    placeholder="Ej: Los Pinos Pádel"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Identificador URL (Slug)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})}
                      placeholder="ej: los-pinos"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all text-white font-bold"
                    />
                  </div>
                  {/* Vista previa dinámica del subdominio final */}
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5 font-mono text-[9px] text-white/50 break-all leading-snug">
                    <span className="text-primary/70">Subdominio:</span> http://{formData.slug || 'slug'}.{currentDomain}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Paleta de Colores (Marca)</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={formData.color_principal}
                      onChange={e => setFormData({...formData, color_principal: e.target.value})}
                      className="w-14 h-14 rounded-2xl cursor-pointer bg-white/5 border border-white/10 p-1.5 hover:scale-105 transition-all"
                    />
                    <input 
                      type="text" 
                      value={formData.color_principal}
                      onChange={e => setFormData({...formData, color_principal: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary uppercase text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">URL del Logo (Opcional)</label>
                  <input 
                    type="url" 
                    value={formData.logo_url}
                    onChange={e => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all text-white/80"
                  />
                  
                  {/* Vista previa en tiempo real del Logo */}
                  {formData.logo_url && (
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in duration-200 mt-2">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo Preview" 
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[9px] uppercase tracking-widest font-black text-white/40">Previsualización del Logo</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-[0_0_30px_rgba(136,130,220,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear e Inicializar Club'}
                </button>

                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => { 
                      setIsEditing(null); 
                      setFormData({ nombre: '', slug: '', color_principal: '#8882dc', logo_url: '' }); 
                    }}
                    className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all border border-white/10"
                  >
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Lista de Clubes Clientes (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pl-2">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
                Clubes Habilitados ({clubes.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="glass py-24 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-3 text-white/30">
                <RefreshCw size={24} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cargando base de datos...</span>
              </div>
            ) : clubes.length === 0 ? (
              <div className="glass py-24 rounded-[2.5rem] border border-white/5 text-center text-white/30 font-black uppercase tracking-[0.2em] text-xs">
                No hay clubes creados todavía.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence>
                  {clubes.map(club => (
                    <motion.div 
                      key={club.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-6 relative overflow-hidden group hover:border-white/10 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all"
                    >
                      {/* Borde izquierdo dinámico según color del club */}
                      <div 
                        className="absolute top-0 left-0 w-2 h-full" 
                        style={{ backgroundColor: club.color_principal || '#8882dc' }}
                      />
                      
                      <div className="pl-2 flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black uppercase tracking-tight italic text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                            {club.nombre}
                          </h4>
                          <span className="font-mono text-[8px] text-white/30 block break-all">ID: {club.id}</span>
                          <span className="text-[9px] font-bold text-primary font-mono block mt-1">
                            /{club.slug}
                          </span>
                        </div>
                        {club.logo_url ? (
                          <img 
                            src={club.logo_url} 
                            alt={club.nombre} 
                            className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xs font-black shrink-0">
                            {club.nombre.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Paleta y estado */}
                      <div className="pl-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/40">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: club.color_principal }} />
                          <span className="font-mono">{club.color_principal}</span>
                        </div>
                        <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-white/50">Activo</span>
                      </div>

                      {/* Acciones */}
                      <div className="pl-2 mt-auto flex gap-2 pt-2 border-t border-white/5">
                        <button 
                          onClick={() => handleEdit(club)}
                          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-white/80"
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                        <button 
                          onClick={() => {
                            document.cookie = `active_club_slug=${club.slug || 'peñarol'}; path=/; max-age=31536000`;
                            toast.success(`Cambiando a vista de ${club.nombre}... 🎾`);
                            setTimeout(() => window.location.href = '/', 1000);
                          }}
                          className="px-3.5 py-3 bg-primary text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md flex items-center gap-1"
                          title="Ver en vivo"
                        >
                          <ExternalLink size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(club.id, club.nombre)}
                          className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          title="Eliminar Club"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
