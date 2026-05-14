'use client';

import { useEffect } from 'react';
import { useSport } from '@/hooks/useSport';
import BookingHome from '@/components/BookingHome';

export default function PadelPage() {
  const { setSport } = useSport();

  useEffect(() => {
    setSport('padel');
  }, []);

  return <BookingHome />;
}
