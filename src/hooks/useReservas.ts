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
      const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'peñarol';

      // 2. Obtener el ID del club correspondiente
      const { data: clubData, error: clubError } = await supabase
        .from('clubes')
        .select('id')
        .eq('slug', activeSlug)
        .single();

      // 3. Filtrar las reservas (con o sin club_id)
      let query = supabase
        .from('reservas')
        .select('*')
        .eq('fecha', selectedDate);

      if (clubData?.id) {
        // Si tenemos el club, traemos las de ese club y las que no tienen club (retrocompatibilidad)
        query = query.or(`club_id.eq.${clubData.id},club_id.is.null`);
      } else {
        // Si no encontramos el club, traemos todas las del día o al menos las huérfanas
        console.warn(`⚠️ Multi-tenant: No se encontró el club con slug "${activeSlug}".`);
        query = query.filter('club_id', 'is', null);
      }

      const { data, error } = await query.order('hora', { ascending: true });

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
