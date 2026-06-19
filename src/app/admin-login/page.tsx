'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { motion } from 'framer-motion';

const ALLOWED_ADMINS = ['setchegno@etman.com.ar', 'octavioducos24@gmail.com'];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ALLOWED_ADMINS.includes(email.toLowerCase())) {
      return toast.error('Acceso denegado: Email no autorizado');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: pass
      });

      if (error) throw error;
      
      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax; Secure`;
      }

      toast.success('Bienvenido, Admin');
      window.location.href = '/admin';
    } catch (e: any) {
      toast.error(e.message || 'Error de acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/5 space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
              <Crown size={40} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Panel de <span className="text-primary">Control</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Acceso exclusivo para dueños</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-primary transition-all font-bold text-white"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
