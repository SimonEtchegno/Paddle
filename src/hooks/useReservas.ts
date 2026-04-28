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
      // 1. Obtener el slug activo de la cookie (Multi-Tenant)
      const cookies = document.cookie.split('; ');
      const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
      const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'penarol';

      // 2. Obtener el ID del club correspondiente
      const { data: clubData, error: clubError } = await supabase
        .from('clubes')
        .select('id')
        .eq('slug', activeSlug)
        .single();

      if (clubError || !clubData) {
        console.warn(`⚠️ Multi-tenant: No se encontró el club con slug "${activeSlug}". Asegúrate de que existe en la tabla 'clubes'.`);
        setReservas([]);
        setLoading(false);
        return;
      }

      // 3. Filtrar las reservas de ESE club específico (y las antiguas sin club_id)
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', selectedDate)
        .or(`club_id.eq.${clubData.id},club_id.is.null`)
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
