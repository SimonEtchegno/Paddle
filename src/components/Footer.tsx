'use client';

import Link from 'next/link';
import { Crown, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        <div className="flex flex-col items-center text-center space-y-6 w-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-2xl hover:scale-110 transition-transform duration-500 bg-white">
              <img src="/logo_complejo.png" alt="Logo Complejo" className="w-full h-full object-cover scale-110" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Complejo <span className="text-primary">CAP</span></h3>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Pádel & Social</p>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Ubicación del Complejo</p>
          <div className="w-full h-64 md:h-80 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3160.726605601371!2d-62.411914800000005!3d-37.6085929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95eb95039e0676d7%3A0xcbaa46816f025697!2sClub%20Pe%C3%B1arol!5e0!3m2!1ses!2sar!4v1777045228694!5m2!1ses!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.2)' }} 
              allowFullScreen={true} 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="opacity-60 hover:opacity-100 transition-opacity duration-700"
            ></iframe>
          </div>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Pigüé, Buenos Aires, Argentina</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Developed By</p>
          <a 
            href="https://www.instagram.com/datatech_bahia/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <Instagram size={18} className="text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Datatech Bahia · Simón Etchegno</span>
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
