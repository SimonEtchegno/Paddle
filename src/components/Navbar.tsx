'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { Calendar, Users, History, User, Trophy, Bell, X, Check, Crown, ShoppingBag, Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Navbar({ club }: { club?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useGuestProfile();
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Activar notificaciones en tiempo real
  const { notifications, unreadCount, dismissNotification, clearAllNotifications } = useNotifications();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs]);

  const navItems = [
    { name: 'Reservar', href: '/', icon: Calendar },
    { name: 'Partidos', href: '/partidos', icon: Users },
    { name: 'Torneos', href: '/torneos', icon: Trophy },
    { name: 'Ranking', href: '/ranking', icon: Crown },
    { name: 'Tienda', href: '/tienda', icon: ShoppingBag },
    { name: 'Mis Turnos', href: '/mis-turnos', icon: History },
    { name: 'Perfil', href: '/perfil', icon: User },
  ];

  return (
    <>
      {/* Desktop & Top Nav */}
      <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={club?.logo_url || "/logo.jpg"}
              alt={club?.nombre || "Peñarol Pádel"}
              width={40}
              height={40}
              className="rounded-full object-cover border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb), 0.3)]"
            />
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent leading-none drop-shadow-sm truncate max-w-[200px] sm:max-w-none">
                {club?.nombre || "Complejo Pádel Peñarol"}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/70 mt-0.5 sm:mt-1 font-bold">
                Reserva de Turnos
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.filter(i => i.name !== 'Perfil').map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={twMerge(
                    "flex items-center gap-2 text-sm font-bold transition-all hover:text-primary",
                    active ? "text-primary scale-105" : "text-white/60"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Profile & Notifications Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
            >
              <Menu size={20} />
            </button>
            
            {/* Notifications Bell */}
            {profile && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all relative"
                >
                  <Bell size={18} className={unreadCount > 0 ? 'text-primary' : 'text-white/60'} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(255,82,82,0.5)]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifs && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-[#0a0b0e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Notificaciones</span>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{unreadCount} nuevas</span>}
                        {notifications.length > 0 && (
                          <button 
                            onClick={clearAllNotifications}
                            className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                          >
                            Limpiar todo
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center gap-3 opacity-20">
                          <Bell size={24} strokeWidth={1.5} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                            Sin notificaciones
                          </span>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all flex items-start gap-3 group">
                            <div className="mt-0.5 text-base leading-none">
                              {n.type === 'confirmacion' ? '🎾' : 
                               n.type === 'cancelacion' ? <span className="text-error">⚠️</span> : 
                               n.type === 'sistema' ? <Bell size={16} className="text-blue-400 mt-1" /> :
                               <Users size={16} className="text-primary mt-1" />}
                            </div>
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setShowNotifs(false);
                                router.push('/partidos');
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex flex-col">
                                  {n.type === 'sistema' && (
                                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest mb-1 w-fit">
                                      Aviso Oficial
                                    </span>
                                  )}
                                  <p className="text-xs font-bold text-white/90 leading-snug">{n.message}</p>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(200,255,0,0.6)]" />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                                {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button 
                              onClick={() => dismissNotification(n.id)} 
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                              title="Marcar como leída"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile ? (() => {
                const currentLevel = profile.nivel || 1.0;
                const isDiamante = currentLevel >= 6.5;
                const isOro = currentLevel >= 5.5;
                const isPlata = currentLevel >= 4.5;
                const isMaster = currentLevel >= 3.5;
                const isPro = currentLevel >= 2.5;

                const auraColor = isDiamante ? "bg-cyan-400" : isOro ? "bg-yellow-400" : isPlata ? "bg-zinc-200" : isMaster ? "bg-purple-500" : isPro ? "bg-blue-500" : "bg-primary";

                return (
                  <Link href="/perfil" className="hidden sm:flex items-center gap-2 bg-white/5 p-1.5 pr-4 rounded-full border border-white/10 hover:bg-white/10 transition-all group relative">
                    <div className="relative">
                      {/* Aura Mini */}
                      <div className={clsx(
                        "absolute inset-0 rounded-full blur-md opacity-40 group-hover:scale-125 transition-transform",
                        auraColor
                      )} />
                      <div className={clsx(
                        "w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center relative z-10 border overflow-hidden",
                        isDiamante ? "border-cyan-400/50" : isOro ? "border-yellow-400/50" : "border-white/10"
                      )}>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.nombre}${profile.apellido}&backgroundColor=transparent`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs">
                      <p className="font-bold leading-none">{profile.nombre}</p>
                      <p className={clsx(
                        "text-[9px] uppercase tracking-widest font-black mt-0.5",
                        isDiamante ? "text-cyan-400" : isOro ? "text-yellow-400" : "opacity-50"
                      )}>
                        {isDiamante ? "Legend" : isOro ? "Elite" : "Pro"}
                      </p>
                    </div>
                  </Link>
                );
              })() : (
              <Link href="/perfil" className="hidden sm:flex bg-primary text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(200,255,0,0.2)]">
                Perfil
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 h-full bg-[#0a0b0e] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Menú</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm",
                        active 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon size={20} className={active ? "text-primary" : "text-white/40"} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 text-center">
                  Peñarol Pádel v2.0
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav (Simplified / Keeping for quick access) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full glass border-t border-white/10 flex justify-around p-3 pb-safe z-50">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                "flex flex-col items-center gap-1 transition-all",
                active ? "text-primary" : "text-white/40"
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] font-bold uppercase">{item.name}</span>
            </Link>
          );
        })}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <Menu size={22} />
          <span className="text-[10px] font-bold uppercase">Más</span>
        </button>
      </div>
    </>
  );
}
