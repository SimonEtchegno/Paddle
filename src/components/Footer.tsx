'use client';

import Link from 'next/link';
import { Crown, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Developed By</p>
          <a 
            href="https://www.instagram.com/datatech_bahia/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <Instagram size={18} className="text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Datatech Bahia</span>
          </a>
        </div>

        <div className="h-px w-12 bg-white/10" />

        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-primary transition-all"
        >
          <Crown size={12} />
          Acceso Administrador
        </Link>
        
        <p className="text-[10px] font-medium opacity-20 uppercase tracking-tighter">
          © {new Date().getFullYear()} Peñarol Pádel · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
