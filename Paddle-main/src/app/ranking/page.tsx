'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Trophy, Crown, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function RankingPage() {
  const [activeCategory, setActiveCategory] = useState('6ta');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['4ta', '5ta', '6ta', '7ma'];

  const allPlayers = [
    { pos: 1, name: 'Toy Julian', pts: 200 },
    { pos: 2, name: 'Marcenac Jorge', pts: 150 },
    { pos: 3, name: 'Loaldi Nicolas', pts: 150 },
    { pos: 4, name: 'Apelhanz Juan', pts: 100 },
    { pos: 5, name: 'Heiland Joaquin', pts: 100 },
    { pos: 6, name: 'Gianfelici Cristian', pts: 100 },
    { pos: 7, name: 'Lencina David', pts: 75 },
    { pos: 8, name: 'Lencina Claudio', pts: 75 },
    { pos: 9, name: 'Selesan Rodrigo', pts: 75 },
    { pos: 10, name: 'Salvatierra Roberto', pts: 75 },
    { pos: 11, name: 'Scro Gonzalo', pts: 75 },
    { pos: 12, name: 'Saur Franco', pts: 75 },
    { pos: 13, name: 'Philipp Pablo', pts: 75 },
    { pos: 14, name: 'Rauch Dario', pts: 75 },
    { pos: 15, name: 'Iros Martin', pts: 50 },
    { pos: 16, name: 'Aguilera Nicolas', pts: 50 },
    { pos: 17, name: 'Garcia Juan Pablo', pts: 50 },
    { pos: 18, name: 'Davita German', pts: 50 },
    { pos: 19, name: 'Della Giusta Arturo', pts: 50 },
    { pos: 20, name: 'Helbert Eduardo', pts: 50 },
    { pos: 21, name: 'Willhelem Guillermo', pts: 50 },
    { pos: 22, name: 'Badias Luciano', pts: 50 },
    { pos: 23, name: 'Chavez Walter', pts: 10 },
    { pos: 24, name: 'Calmels Mariano', pts: 10 },
    { pos: 25, name: 'Almestro Ariel', pts: 10 },
    { pos: 26, name: 'Lelco Tomas', pts: 10 },
    { pos: 27, name: 'Lefler Alejo', pts: 10 },
    { pos: 28, name: 'Kleer Valentin', pts: 10 },
    { pos: 29, name: 'Lima Eduardo', pts: 10 },
    { pos: 30, name: 'Lacasta Jeremias', pts: 10 },
    { pos: 31, name: 'Cuvertino Agustin', pts: 10 },
    { pos: 32, name: 'Vaga Juan Segundo', pts: 10 },
  ];

  const filteredRanking = allPlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12 mb-24 relative">
        
        {/* Luces de fondo decorativas */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px] -z-10" />

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 relative"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <Trophy size={80} className="text-primary drop-shadow-[0_0_25px_rgba(136,130,220,0.6)]" />
            </motion.div>
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-none"
          >
            Ranking <span className="text-primary text-3xl md:text-5xl block mt-2">Peñarol</span>
          </motion.h1>
        </div>

        {/* Categories Tabs */}
        <div className="flex justify-center mb-12 overflow-x-auto hide-scrollbar pb-2">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery('');
                }}
                className={clsx(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeCategory === cat 
                    ? "bg-primary text-[#050505] shadow-[0_0_20px_rgba(136,130,220,0.4)]" 
                    : "text-white/40 hover:text-white/80"
                )}
              >
                {cat} Cat.
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeCategory === '6ta' ? (
            <motion.div
              key="ranking-6ta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-16 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>

              {/* El Podio (Top 3) */}
              {!searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16 px-2">
                  {/* Segundo Puesto */}
                  <motion.div 
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="order-2 md:order-1 relative group"
                  >
                    <div className="absolute inset-0 bg-white/5 blur-xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center relative h-[280px] justify-end overflow-hidden group-hover:border-white/20 transition-all">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
                      <div className="absolute top-8 w-20 h-20 rounded-full bg-slate-400/10 flex items-center justify-center border border-slate-400/20 text-4xl font-black text-slate-400 shadow-inner">
                        2
                      </div>
                      <div className="z-10 mt-auto">
                        <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{filteredRanking[1]?.name}</h3>
                        <div className="bg-slate-400/10 px-4 py-1 rounded-full mb-2">
                          <p className="text-slate-400 font-black text-xl">{filteredRanking[1]?.pts} <span className="text-[8px] uppercase tracking-widest">pts</span></p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Primer Puesto - EL REY */}
                  <motion.div 
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                    className="order-1 md:order-2 relative group z-10"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-b from-primary/50 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="glass p-10 rounded-[3rem] border-2 border-primary/20 flex flex-col items-center text-center relative h-[360px] justify-end overflow-hidden bg-gradient-to-b from-primary/5 to-transparent group-hover:border-primary/40 transition-all shadow-2xl">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      <motion.div 
                        animate={{ 
                          y: [0, -8, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-0 z-20 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                      >
                        <Crown size={40} fill="currentColor" />
                      </motion.div>
                      <div className="absolute top-12 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary shadow-[0_0_30px_rgba(136,130,220,0.4)] text-5xl font-black text-primary z-10">
                        1
                      </div>
                      <div className="z-10 mt-auto">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{filteredRanking[0]?.name}</h3>
                        <div className="bg-primary px-6 py-2 rounded-2xl mb-3 shadow-[0_0_20px_rgba(136,130,220,0.3)]">
                          <p className="text-[#050505] font-black text-3xl">{filteredRanking[0]?.pts} <span className="text-[10px] uppercase tracking-widest opacity-60">pts</span></p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tercer Puesto */}
                  <motion.div 
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="order-3 relative group"
                  >
                    <div className="absolute inset-0 bg-white/5 blur-xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center relative h-[250px] justify-end overflow-hidden group-hover:border-white/20 transition-all">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
                      <div className="absolute top-8 w-16 h-16 rounded-full bg-amber-700/10 flex items-center justify-center border border-amber-700/20 text-3xl font-black text-amber-700 shadow-inner">
                        3
                      </div>
                      <div className="z-10 mt-auto">
                        <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{filteredRanking[2]?.name}</h3>
                        <div className="bg-amber-700/10 px-4 py-1 rounded-full mb-2">
                          <p className="text-amber-700 font-black text-xl">{filteredRanking[2]?.pts} <span className="text-[8px] uppercase tracking-widest">pts</span></p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Tabla del resto */}
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="flex px-10 text-[11px] font-black uppercase tracking-[0.3em] opacity-30 mb-4">
                  <span className="w-16">Puesto</span>
                  <span className="flex-1">Jugador</span>
                  <span className="w-28 text-right">Puntos</span>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {(searchQuery ? filteredRanking : filteredRanking.slice(3)).map((player, i) => (
                    <motion.div 
                      key={player.pos}
                      layout
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 30, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass p-6 rounded-[2rem] border border-white/5 flex items-center hover:bg-white/[0.08] transition-all group cursor-default"
                    >
                      <div className="w-16 flex items-center gap-2">
                        <span className="font-black text-2xl text-white/10 group-hover:text-primary/40 transition-colors">#{player.pos}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-md border border-white/10 group-hover:border-primary/30 transition-all">
                          {player.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg leading-none">{player.name}</h4>
                        </div>
                      </div>
                      <div className="w-28 text-right">
                        <p className="font-black text-2xl text-white group-hover:text-primary transition-colors">{player.pts}</p>
                        <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.2em]">Puntos</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="coming-soon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Trophy size={64} className="text-primary drop-shadow-[0_0_15px_rgba(136,130,220,0.5)]" />
                </motion.div>
                <div className="absolute inset-0 border-2 border-primary/20 border-dashed rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">
                Próximamente
              </h2>
              <p className="text-white/40 max-w-sm font-medium">
                El ranking de la <span className="text-primary font-bold">{activeCategory} Categoría</span> se encuentra en proceso de carga. ¡Estate atento a las novedades!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer con info */}
        <div className="mt-20 flex flex-col items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all hover:opacity-100 cursor-default">
          <div className="w-12 h-1 bg-white/10 rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed">
            Sección interactiva. Datos cargados manualmente por la administración.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
