'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { clsx } from 'clsx';

export function InstallAppButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que el mini-infobar aparezca
      e.preventDefault();
      // Guardar el evento para dispararlo luego
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('PWA instalada con éxito');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar el prompt nativo
    deferredPrompt.prompt();
    
    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Solo mostrar el botón si el navegador lo permite y la app no está instalada aún
  if (!deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstallClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors animate-pulse hover:animate-none",
        className
      )}
      title="Instalar como Aplicación"
    >
      <Smartphone size={16} />
      <span className="text-[10px] font-black uppercase tracking-widest">Instalar App</span>
    </button>
  );
}
