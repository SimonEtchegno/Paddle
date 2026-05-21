'use client';

import { useState, useEffect } from 'react';
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
import { WelcomeModal } from '@/components/WelcomeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSport } from '@/hooks/useSport';
import { SportSelection } from '@/components/SportSelection';

import { Suspense } from 'react';
import BookingHome from '@/components/BookingHome';

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BookingHome />
    </Suspense>
  );
}
