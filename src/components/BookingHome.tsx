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
                    <span className="opacity-90">Precio: {sport === 'futbol' ? '$20.000' : '$40.000'}</span>
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

      {/* The 3D tilting Official Trophy Icon */}
      <motion.div
        animate={{
          rotateY: coords.x * 45,
          rotateX: coords.y * -45,
          scale: isHovered ? 1.15 : 1,
          z: isHovered ? 40 : 0
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative flex items-center justify-center"
      >
        <Trophy size={80} className="text-primary stroke-[1.5] drop-shadow-[0_0_20px_rgba(136,130,220,0.6)]" />
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

      {/* The 3D tilting Official Activity Icon */}
      <motion.div
        animate={{
          rotateY: coords.x * 45,
          rotateX: coords.y * -45,
          scale: isHovered ? 1.15 : 1,
          z: isHovered ? 40 : 0
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative flex items-center justify-center"
      >
        <Activity size={80} className="text-green-400 stroke-[1.5] drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
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


