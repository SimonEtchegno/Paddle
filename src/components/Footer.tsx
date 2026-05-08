'use client';

import Link from 'next/link';
import { Crown, Instagram, MapPin, Phone, MessageSquare, Trophy, User, Calendar, ExternalLink, TrendingUp, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin')) {
    return null;
  }

  const quickLinks = [
    { name: 'Reservar Turno', href: '/', icon: Calendar },
    { name: 'Torneos Activos', href: '/torneos', icon: Trophy },
    { name: 'Ranking General', href: '/ranking', icon: TrendingUp },
    { name: 'Mi Perfil PRO', href: '/perfil', icon: User },
  ];

  // Configuración de redes sociales (se podrían pasar por props)
  const socialLinks = {
    instagram: 'https://www.instagram.com/complejo.cap/',
    whatsapp: '',
  };

  return (
    <footer className="w-full mt-20 relative overflow-hidden">
      {/* Decorative Gradient Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white p-1">
                <img src="/logo_complejo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                  Complejo <span className="text-primary">CAP</span>
                </h3>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Sede Oficial Peñarol</p>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              La plataforma definitiva para el jugador de pádel profesional. Gestión de turnos, ranking en tiempo real y torneos competitivos.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group"
                  aria-label="Seguir en Instagram"
                >
                  <Instagram size={18} className="text-white/60 group-hover:text-primary transition-colors" />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group"
                  aria-label="Contactar por WhatsApp"
                >
                  <MessageSquare size={18} className="text-white/60 group-hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Navegación</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors"
                  >
                    <link.icon size={14} className="group-hover:text-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/admin"
              className="mt-8 block text-[9px] font-black uppercase tracking-[0.2em] text-white/5 hover:text-primary/40 transition-colors"
            >
              Acceso Administrativo
            </Link>
          </div>

          {/* Column 3: Contact & Info */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Ubicación</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Club Peñarol</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Pigüé, Buenos Aires,<br />Argentina
                  </p>
                </div>
              </div>
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-white/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <iframe
                  title="Ubicación del Complejo Peñarol Pádel"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3160.726605601371!2d-62.411914800000005!3d-37.6085929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95eb95039e0676d7%3A0xcbaa46816f025697!2sClub%20Pe%C3%B1arol!5e0!3m2!1ses!2sar!4v1777045228694!5m2!1ses!2sar"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Column 4: Studio Branding */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Powering the Game</h4>
            <div className="relative group cursor-default">
              {/* Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden group-hover:border-primary/30 transition-all duration-500">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-2xl">
                        <Crown size={22} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase italic tracking-tighter text-white">Datatech <span className="text-primary">Bahía</span></span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Digital Studio</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-medium text-white/40 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                    "Arquitectura digital de alto rendimiento diseñada para el futuro del deporte."
                  </p>

                  <a
                    href="https://www.instagram.com/datatech_bahia/"
                    target="_blank"
                    className="flex items-center justify-between group/link bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-2xl px-5 py-3 transition-all"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/link:text-primary transition-colors">Ver Portfolio</span>
                    <ExternalLink size={12} className="text-white/20 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-medium opacity-20 uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} Peñarol Pádel · Todos los derechos reservados
          </p>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 opacity-20">
              <div className="w-1 h-1 rounded-full bg-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">v2.4.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </footer>
  );
}
