'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservas } from '@/hooks/useReservas';
import { BookingGrid } from '@/components/booking/BookingGrid';
import { BookingModal } from '@/components/booking/BookingModal';
import { Info } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Calendar } from '@/components/ui/Calendar';
import { parseISO } from 'date-fns';
import { WeatherWidget } from '@/components/WeatherWidget';
import { motion } from 'framer-motion';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<{ hora: string; cancha: number } | null>(null);
  const { reservas, loading, refresh } = useReservas(selectedDate);

  const handleSelectSlot = (hora: string, cancha: number) => {
    setSelectedSlot({ hora, cancha });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  return (
    <PageWrapper>
      <div className="space-y-12 pb-20">
        {/* Header / Info */}
        <section className="text-center space-y-4 pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight italic">
              Reservá tu <span className="text-primary relative inline-block">
                Turno
                <motion.div 
                  className="absolute -inset-x-2 -bottom-1 h-2 bg-primary/20 blur-lg rounded-full"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(136,130,220,0.3)] transform hover:scale-105 transition-all cursor-default">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-3 bg-secondary/10 text-secondary px-6 py-3 rounded-full border border-secondary/20 shadow-[0_0_15px_rgba(255,215,0,0.05)] transform hover:scale-105 transition-all cursor-default">
              <Info size={14} className="text-secondary" />
              <span>Precio: $34.000</span>
            </div>
          </div>
        </section>

        {/* Date Selector & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 items-start">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="px-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-1">Seleccionar Fecha</h3>
              <Calendar 
                selectedDate={parseISO(selectedDate + 'T00:00:00')} 
                onChange={handleDateChange} 
              />
            </div>
            
            <div className="glass p-6 rounded-3xl border border-white/5 mx-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Fecha Seleccionada</p>
              <p className="text-xl font-black text-primary capitalize">
                {format(parseISO(selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>

            <WeatherWidget date={selectedDate} />
          </aside>

          <main className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4 mb-2">Horarios Disponibles</h3>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Actualizando canchas...</p>
              </div>
            ) : (
              <BookingGrid 
                reservas={reservas} 
                selectedDate={selectedDate} 
                onSelectSlot={handleSelectSlot} 
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
        />
      </div>
    </PageWrapper>
  );
}
