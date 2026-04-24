'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva } from '@/types';
import { format } from 'date-fns';

export function useReservas(selectedDate: string) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', selectedDate)
        .order('hora', { ascending: true });

      if (error) throw error;
      setReservas(data || []);
    } catch (e) {
      console.error('Error fetching reservas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    
    // Subscribe to changes
    const channel = supabase
      .channel('reservas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas', filter: `fecha=eq.${selectedDate}` }, () => {
        fetchReservas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return { reservas, loading, refresh: fetchReservas };
}
