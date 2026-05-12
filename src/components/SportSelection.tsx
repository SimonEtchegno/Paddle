'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSport } from '@/hooks/useSport';
import { Trophy, Activity, Settings } from 'lucide-react';
import Link from 'next/link';

export function SportSelection() {
  const { setSport } = useSport();

  return (
    <div className="fixed inset-0 z-[200] flex flex-col md:flex-row bg-[#0a0b0e] overflow-hidden">
      {/* Padel Option */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex-1 group cursor-pointer overflow-hidden"
        onClick={() => setSport('padel')}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          style={{ backgroundImage: 'url("/images/padel_bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent group-hover:via-black/20 transition-all duration-700" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] mix-blend-overlay" />
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="mb-8 p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-500"
          >
            <Trophy className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-7xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-none"
            >
              Padel
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-primary font-black uppercase tracking-[0.4em] text-xs md:text-sm drop-shadow-lg"
            >
              Dominá la jaula
            </motion.p>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
      </motion.div>

      {/* Futbol Option */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex-1 group cursor-pointer overflow-hidden border-t md:border-t-0 md:border-l border-white/10"
        onClick={() => setSport('futbol')}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:-rotate-1"
          style={{ backgroundImage: 'url("/images/futbol_bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/40 to-transparent group-hover:via-black/20 transition-all duration-700" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,#22c55e_0%,transparent_70%)] mix-blend-overlay" />
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="mb-8 p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-500"
          >
            <Activity className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-7xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-none"
            >
              Futbol 5
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-green-500 font-black uppercase tracking-[0.4em] text-xs md:text-sm drop-shadow-lg"
            >
              Armá el picadito
            </motion.p>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
      </motion.div>

      {/* VS / OR Divider */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5, type: 'spring', damping: 15 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)] border-4 border-black/10 group"
        >
          <div className="flex flex-col items-center">
            <span className="text-black font-black italic text-3xl md:text-4xl leading-none">O</span>
          </div>
          
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-20" />
          <div className="absolute -inset-4 rounded-full border border-white/30 animate-pulse" />
        </motion.div>
      </div>

      {/* Admin Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 right-6 z-[250]"
      >
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all backdrop-blur-md flex items-center gap-2 shadow-xl"
        >
          <Settings size={12} />
          Admin
        </Link>
      </motion.div>
    </div>
  );
}
