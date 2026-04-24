'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { Calendar, Users, History, User, Trophy, Bell, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useGuestProfile();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Activar notificaciones en tiempo real
  const { notifications, unreadCount, dismissNotification, clearAllNotifications } = useNotifications();

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
    { name: 'Ranking', href: '/ranking', icon: Trophy },
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
              src="/logo.jpg"
              alt="Peñarol Pádel"
              width={40}
              height={40}
              className="rounded-full object-cover border border-primary/30 shadow-[0_0_15px_rgba(136,130,220,0.3)]"
            />
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent leading-none drop-shadow-sm truncate max-w-[200px] sm:max-w-none">
                Complejo Pádel Peñarol
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/70 mt-0.5 sm:mt-1 font-bold">
                Reserva de Turnos
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
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

            {profile ? (
              <Link href="/perfil" className="hidden sm:flex items-center gap-2 bg-white/5 p-1.5 pr-4 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-sm uppercase shadow-[0_0_15px_rgba(200,255,0,0.3)]">
                  {profile.nombre[0]}
                </div>
                <div className="hidden sm:block text-xs">
                  <p className="font-bold leading-none">{profile.nombre}</p>
                  <p className="opacity-50 text-[10px] uppercase tracking-widest font-black mt-0.5">Mi Perfil</p>
                </div>
              </Link>
            ) : (
              <Link href="/perfil" className="hidden sm:flex bg-primary text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(200,255,0,0.2)]">
                Perfil
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full glass border-t border-white/10 flex justify-around p-3 pb-safe z-50">
        {navItems.map((item) => {
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
      </div>
    </>
  );
}
