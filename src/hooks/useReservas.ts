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
      let clubId = null;
      try {
        const { data: clubData } = await supabase
          .from('clubes')
          .select('id')
          .eq('slug', activeSlug)
          .single();
        clubId = clubData?.id;
      } catch (err) {
        console.warn('Multi-tenant: No se pudo acceder a la tabla de clubes, usando modo simple.');
      }
 
      // 3. Filtrar las reservas (con o sin club_id)
      let query = supabase
        .from('reservas')
        .select('*')
        .eq('fecha', selectedDate);
 
      if (clubId) {
        query = query.or(`club_id.eq.${clubId},club_id.is.null`);
      }

      const { data, error } = await query.order('hora', { ascending: true });

      if (error) throw error;
      setReservas(data || []);
    } catch (e: any) {
      console.error('Error fetching reservas details:', {
        message: e.message,
        details: e.details,
        hint: e.hint,
        code: e.code
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    
    fetchReservas();
    
    // Subscribe to changes
    const channel = supabase
      .channel(`reservas_${selectedDate}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reservas', 
        filter: `fecha=eq.${selectedDate}` 
      }, () => {
        fetchReservas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return { reservas, loading, refresh: fetchReservas };
}
