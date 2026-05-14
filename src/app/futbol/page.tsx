'use client';

import { useEffect } from 'react';
import { useSport } from '@/hooks/useSport';
import BookingHome from '@/components/BookingHome';

export default function FutbolPage() {
  const { setSport } = useSport();

  useEffect(() => {
    setSport('futbol');
  }, []);

  return <BookingHome />;
}
