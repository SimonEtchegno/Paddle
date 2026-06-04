'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservas } from '@/hooks/useReservas';
import { BookingGrid } from '@/components/booking/BookingGrid';
import { BookingModal } from '@/components/booking/BookingModal';
import { Info, Trophy, Activity } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Calendar } from '@/components/ui/Calendar';
import { parseISO, isValid } from 'date-fns';
import { WeatherWidget } from '@/components/WeatherWidget';
import { WelcomeModal } from '@/components/WelcomeModal';
import { AIWelcomeModal } from '@/components/AIWelcomeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSport } from '@/hooks/useSport';
import { SportSelection } from '@/components/SportSelection';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingTutorial } from '@/components/booking/BookingTutorial';



export default function BookingHome() {
  const { sport, setSport, isLoading } = useSport();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDate = searchParams.get('date');

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    if (urlDate) {
      setSelectedDate(urlDate);
    } else {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [urlDate]);

  const [selectedSlot, setSelectedSlot] = useState<{ hora: string; cancha: number } | null>(null);
  const { reservas, loading, refresh } = useReservas(selectedDate);

  const handleSelectSlot = (hora: string, cancha: number) => {
    setSelectedSlot({ hora, cancha });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const handleChangeSport = () => {
    setSport(null);
    router.push('/');
  };

  if (isLoading) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {!sport && <SportSelection key="selection" />}
      </AnimatePresence>

      <PageWrapper>
        <div className="space-y-12 pb-20">
          {/* Hero Banner / Header (Premium Design Edition) */}
          <div className={`relative w-full overflow-hidden rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 ${sport === 'futbol'
              ? 'bg-gradient-to-br from-[#07180e] via-[#090d0b] to-[#040507]'
              : 'bg-gradient-to-br from-[#120a24] via-[#0b0714] to-[#040507]'
            }`}>
            {/* Ambient Radial Glows */}
            <div className={`absolute -right-10 -top-10 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${sport === 'futbol' ? 'bg-green-500' : 'bg-primary'
              }`} />
            <div className={`absolute -left-10 -bottom-10 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-500 ${sport === 'futbol' ? 'bg-green-600' : 'bg-primary'
              }`} />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 z-10">
              {/* Left Column: Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4 max-w-xl"
              >
                {/* Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(0,0,0,0.25)] ${sport === 'futbol'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{sport === 'futbol' ? '⚽ Fútbol 5' : '🎾 Pádel'}</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl sm:text-5xl md:text-6.5xl font-black tracking-tight uppercase leading-none italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  Reservá tu <span className={sport === 'futbol' ? 'text-green-400' : 'text-primary'}>
                    {sport === 'futbol' ? 'Cancha' : 'Turno'}
                  </span>
                </h2>

                {/* Subinfo and Stats */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] pt-2">
                  <div className="flex items-center gap-2.5 bg-white/[0.03] backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="opacity-90">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/[0.03] backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                    <Info size={12} className={sport === 'futbol' ? 'text-green-400' : 'text-primary'} />
                    <span className="opacity-90">Precio: {sport === 'futbol' ? '$20.000' : '$34.000'}</span>
                  </div>
                  <button 
                    onClick={() => setIsTutorialOpen(true)}
                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 text-white border border-white/20 hover:bg-white/25 transition-all cursor-pointer ${
                      sport === 'futbol' ? 'hover:text-green-400 hover:border-green-500/30' : 'hover:text-primary hover:border-primary/30'
                    }`}
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[9px] font-black">?</span>
                    ¿Cómo funciona?
                  </button>
                </div>
              </motion.div>

              {/* Right Column: Beautiful Glowing Icon / Visual Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden md:flex items-center justify-center pr-6"
              >
                {sport === 'futbol' ? <FutbolHeroVisual /> : <PadelHeroVisual />}
              </motion.div>
            </div>
          </div>


          {/* Date Selector & Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 items-start">
            <aside id="tutorial-calendar" className="space-y-6 lg:sticky lg:top-24">
              <div id="tutorial-date-picker" className="px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-1">Seleccionar Fecha</h3>
                <Calendar
                  selectedDate={selectedDate && isValid(parseISO(selectedDate + 'T00:00:00')) ? parseISO(selectedDate + 'T00:00:00') : new Date()}
                  onChange={handleDateChange}
                />
              </div>

              <div className="glass p-6 rounded-3xl border border-white/5 mx-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Fecha Seleccionada</p>
                <p className="text-xl font-black text-primary capitalize">
                  {selectedDate && isValid(parseISO(selectedDate + 'T00:00:00')) ? format(parseISO(selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es }) : 'Cargando...'}
                </p>
              </div>

              <WeatherWidget date={selectedDate} />
            </aside>

            <main id="tutorial-grid" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 gap-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2 sm:mb-0">Horarios Disponibles</h3>
                <button
                  onClick={handleChangeSport}
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 transition-all flex items-center justify-center gap-3 backdrop-blur-md shadow-lg group"
                >
                  <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span>🎾</span>
                    <span className="text-white/20 mx-0.5">/</span>
                    <span>⚽</span>
                  </span>
                  Cambiar Deporte
                </button>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Actualizando canchas...</p>
                </div>
              ) : (
                <BookingGrid
                  reservas={reservas.filter(r => (sport === 'futbol' ? r.cancha >= 10 : r.cancha < 10))}
                  selectedDate={selectedDate}
                  onSelectSlot={handleSelectSlot}
                  sport={sport}
                />
              )}
            </main>
          </div>

          {/* Modal */}
          <BookingModal
            isOpen={!!selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onSuccess={refresh}
            fecha={selectedDate}
            hora={selectedSlot?.hora || ''}
            cancha={selectedSlot?.cancha || 0}
            sport={sport}
          />

          {sport && <WelcomeModal />}
          {sport && <AIWelcomeModal />}
          <BookingTutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
        </div>
      </PageWrapper>
    </>
  );
}

// Componentes Interactivos 3D Premium para el Hero Banner
function PadelHeroVisual() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  return (
    <div 
      className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
    >
      {/* Ambient background glow */}
      <motion.div 
        animate={{ 
          scale: isHovered ? 1.25 : 1,
          opacity: isHovered ? 0.7 : 0.4
        }}
        className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-cyan-500 blur-3xl transition-all duration-300"
      />

      {/* Futuristic Orbiting Ball Trail */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute w-48 h-48 rounded-full border border-dashed border-primary/20 pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          rotateX: 60,
          rotateY: 20
        }}
      >
        {/* Neon Ball Orbiting */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 left-1/2 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center"
          style={{
            boxShadow: '0 0 20px var(--primary), 0 0 40px var(--primary), inset 0 0 6px rgba(0,0,0,0.5)',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg className="w-full h-full text-black/30" viewBox="0 0 100 100">
            <path d="M 0,50 A 50,50 0 0,0 100,50" fill="none" stroke="currentColor" strokeWidth="12" />
            <path d="M 0,50 A 50,50 0 0,1 100,50" fill="none" stroke="currentColor" strokeWidth="12" />
          </svg>
        </motion.div>
      </motion.div>

      {/* The 3D tilting Padel Racket */}
      <motion.div
        animate={{
          rotateY: coords.x * 45, // up to 22.5 deg tilt
          rotateX: coords.y * -45,
          z: isHovered ? 40 : 0
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-40 h-40 flex items-center justify-center"
      >
        {/* Racket Shadow */}
        <div 
          className="absolute w-28 h-28 rounded-full bg-black/40 blur-xl transition-all duration-300"
          style={{
            transform: `translate3d(${coords.x * -20}px, ${coords.y * -20 + 40}px, -30px) scale(0.95)`,
          }}
        />

        {/* The Racket SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-36 h-36 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Carbon texture background fill */}
          <defs>
            <pattern id="carbon" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 3 L6 3 M3 0 L3 6" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <path d="M0 0 L6 6 M6 0 L0 6" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Racket head background */}
          <path 
            d="M 50,15 C 30,15 28,40 35,55 C 40,65 45,67 50,67 C 55,67 60,65 65,55 C 72,40 70,15 50,15 Z" 
            fill="url(#carbon)" 
            className="fill-zinc-950/80"
          />

          {/* Racket outer frame glowing stroke */}
          <path 
            d="M 50,15 C 30,15 28,40 35,55 C 40,65 45,67 50,67 C 55,67 60,65 65,55 C 72,40 70,15 50,15 Z" 
            stroke="url(#neonGlow)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />

          {/* Bridge triangle */}
          <path d="M 43,67 L 50,57 L 57,67 Z" fill="none" stroke="url(#neonGlow)" strokeWidth="2.5" />
          <path d="M 45,67 L 50,62 L 55,67 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Handle / Grip */}
          <rect x="47" y="67" width="6" height="24" rx="1.5" fill="url(#neonGlow)" />
          {/* Wrap details on grip */}
          <line x1="47" y1="73" x2="53" y2="75" stroke="black" strokeWidth="1" />
          <line x1="47" y1="79" x2="53" y2="81" stroke="black" strokeWidth="1" />
          <line x1="47" y1="85" x2="53" y2="87" stroke="black" strokeWidth="1" />
          
          {/* Strap wrist cord */}
          <path d="M 50,91 C 52,95 45,98 45,96" stroke="url(#neonGlow)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Grid of holes */}
          <g fill="white" opacity="0.9">
            <circle cx="50" cy="27" r="1.5" />
            <circle cx="43" cy="30" r="1.5" />
            <circle cx="57" cy="30" r="1.5" />
            
            <circle cx="37" cy="36" r="1.5" />
            <circle cx="44" cy="35" r="1.5" />
            <circle cx="50" cy="34" r="1.5" />
            <circle cx="56" cy="35" r="1.5" />
            <circle cx="63" cy="36" r="1.5" />
            
            <circle cx="35" cy="43" r="1.5" />
            <circle cx="42" cy="42" r="1.5" />
            <circle cx="50" cy="41" r="1.5" />
            <circle cx="58" cy="42" r="1.5" />
            <circle cx="65" cy="43" r="1.5" />
            
            <circle cx="38" cy="50" r="1.5" />
            <circle cx="44" cy="49" r="1.5" />
            <circle cx="50" cy="48" r="1.5" />
            <circle cx="56" cy="49" r="1.5" />
            <circle cx="62" cy="50" r="1.5" />

            <circle cx="45" cy="56" r="1.5" />
            <circle cx="50" cy="55" r="1.5" />
            <circle cx="55" cy="56" r="1.5" />
          </g>
        </svg>
      </motion.div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 2 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              top: `${20 + i * 12}%`,
              left: `${15 + (i % 3) * 25}%`,
              boxShadow: '0 0 8px #22d3ee'
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FutbolHeroVisual() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  return (
    <div 
      className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
    >
      {/* Ambient background glow */}
      <motion.div 
        animate={{ 
          scale: isHovered ? 1.25 : 1,
          opacity: isHovered ? 0.7 : 0.4
        }}
        className="absolute inset-4 rounded-full bg-gradient-to-tr from-green-500 via-emerald-600 to-teal-400 blur-3xl transition-all duration-300"
      />

      {/* Perspective Soccer Stadium Pitch Grid */}
      <motion.div
        animate={{
          rotateX: 60 - coords.y * 20,
          rotateY: coords.x * 20,
          z: -20
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="absolute w-44 h-44 border border-green-500/30 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 80%)"
        }}
      >
        {/* Field lines grid */}
        <div className="absolute inset-2 border border-green-500/20 rounded-xl" />
        <div className="absolute w-[2px] h-full bg-green-500/20" />
        <div className="absolute w-12 h-12 border border-green-500/20 rounded-full" />
      </motion.div>

      {/* Floating 3D Soccer Ball */}
      <motion.div
        animate={{
          y: [-12, 4, -12], // float breathing effect
          rotateY: coords.x * 60 + (isHovered ? 180 : 0),
          rotateX: coords.y * -60,
          z: isHovered ? 60 : 20
        }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotateY: { type: "spring", stiffness: 80, damping: 12 },
          rotateX: { type: "spring", stiffness: 80, damping: 12 },
          z: { duration: 0.3 }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-28 h-28 rounded-full bg-green-500 flex items-center justify-center overflow-hidden"
      >
        {/* Inner Ball Shadow and Glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            boxShadow: '0 0 30px var(--primary), inset 0 0 15px rgba(0,0,0,0.6)',
          }}
        />

        {/* Soccer ball texture overlay */}
        <svg 
          className="absolute w-full h-full text-black/40" 
          viewBox="0 0 100 100"
          style={{ filter: 'drop-shadow(0 0 2px var(--primary))' }}
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="5" />
          <polygon points="50,30 65,42 60,60 40,60 35,42" fill="currentColor" />
          
          <line x1="50" y1="30" x2="50" y2="2" stroke="currentColor" strokeWidth="5" />
          <line x1="65" y1="42" x2="95" y2="35" stroke="currentColor" strokeWidth="5" />
          <line x1="60" y1="60" x2="80" y2="90" stroke="currentColor" strokeWidth="5" />
          <line x1="40" y1="60" x2="20" y2="90" stroke="currentColor" strokeWidth="5" />
          <line x1="35" y1="42" x2="5" y2="35" stroke="currentColor" strokeWidth="5" />

          {/* Additional Soccer Panels */}
          <polygon points="50,2 35,12 20,2 15,20 5,35" fill="none" stroke="currentColor" strokeWidth="4" />
          <polygon points="50,2 65,12 80,2 85,20 95,35" fill="none" stroke="currentColor" strokeWidth="4" />
          <polygon points="80,90 95,75 85,55 95,35" fill="none" stroke="currentColor" strokeWidth="4" />
          <polygon points="20,90 5,75 15,55 5,35" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-15, 15, -15],
              x: [-6, 6, -6],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{
              duration: 2.5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            style={{
              top: `${15 + i * 14}%`,
              left: `${10 + (i % 3) * 30}%`,
              boxShadow: '0 0 8px #22c55e'
            }}
          />
        ))}
      </div>
    </div>
  );
}


