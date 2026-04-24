import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { toast } from 'react-hot-toast';

export interface AppNotification {
  id: string;
  type: 'confirmacion' | 'solicitud' | 'cancelacion';
  message: string;
  time: string;
  isRead: boolean;
}

export function useNotifications() {
  const { profile } = useGuestProfile();
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifiedIds = useRef<Set<string>>(new Set());

  // Cargar IDs notificados previamente (para no repetir Toasts)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notified_toast_ids');
      if (stored) notifiedIds.current = new Set(JSON.parse(stored));
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (!profile?.telefono) return;

    const checkNotifications = async () => {
      try {
        const newNotifs: AppNotification[] = [];
        let hasNewToasts = false;

        // 1. Chequear confirmaciones
        const { data: confData } = await supabase
          .from('uniones_partidos')
          .select('id, partidos_abiertos(*), created_at')
          .eq('estado', 'confirmado')
          .eq('whatsapp_interesado', profile.telefono);

        if (confData) {
          confData.forEach((c: any) => {
            const notifId = `conf_${c.id}`;
            newNotifs.push({
              id: notifId,
              type: 'confirmacion',
              message: `Lugar confirmado en partido de las ${c.partidos_abiertos?.hora} hs`,
              time: c.created_at,
              isRead: false
            });

            if (!notifiedIds.current.has(notifId)) {
              notifiedIds.current.add(notifId);
              hasNewToasts = true;
              toast.success(`¡Lugar confirmado a las ${c.partidos_abiertos?.hora} hs!`, { icon: '🎾', position: 'top-center' });
            }
          });
        }

        // 2. Chequear solicitudes pendientes
        const { data: uData } = await supabase
          .from('uniones_partidos')
          .select('id, nombre_interesado, created_at, partidos_abiertos(*)')
          .eq('estado', 'pendiente');

        if (uData) {
          const misSolicitudes = uData.filter((u: any) => 
            u.partidos_abiertos && u.partidos_abiertos.contacto_whatsapp === profile.telefono
          );

          misSolicitudes.forEach((p: any) => {
            const notifId = `pend_${p.id}`;
            newNotifs.push({
              id: notifId,
              type: 'solicitud',
              message: `${p.nombre_interesado} quiere unirse a tu partido`,
              time: p.created_at,
              isRead: false
            });

            if (!notifiedIds.current.has(notifId)) {
              notifiedIds.current.add(notifId);
              hasNewToasts = true;
              toast(`¡${p.nombre_interesado} quiere unirse!`, { icon: '🎾', position: 'top-center' });
            }
          });
        }

        // 3. Chequear reservas canceladas (borradas por admin)
        const hoyStr = new Date().toISOString().split('T')[0];
        const { data: resData } = await supabase
          .from('reservas')
          .select('id, fecha, hora')
          .eq('telefono', profile.telefono)
          .gte('fecha', hoyStr);

        if (resData) {
          const currentResIds = new Set(resData.map((r: any) => r.id));
          const trackedStr = localStorage.getItem('tracked_reservas');
          
          if (trackedStr) {
            const tracked = JSON.parse(trackedStr);
            tracked.forEach((oldRes: any) => {
              if (!currentResIds.has(oldRes.id) && oldRes.fecha >= hoyStr) {
                // Si la reserva desapareció y no fue cancelada por el usuario (desde la UI)
                if (!localStorage.getItem(`user_cancelled_${oldRes.id}`)) {
                  const notifId = `canc_${oldRes.id}`;
                  newNotifs.push({
                    id: notifId,
                    type: 'cancelacion',
                    message: `Tu turno del ${oldRes.fecha} a las ${oldRes.hora} hs fue cancelado`,
                    time: new Date().toISOString(),
                    isRead: false
                  });

                  if (!notifiedIds.current.has(notifId)) {
                    notifiedIds.current.add(notifId);
                    hasNewToasts = true;
                    toast.error(`Turno cancelado por administración (${oldRes.fecha} - ${oldRes.hora}hs)`, { position: 'top-center', duration: 8000 });
                  }
                }
                // Limpiamos la flag por las dudas
                localStorage.removeItem(`user_cancelled_${oldRes.id}`);
              }
            });
          }
          localStorage.setItem('tracked_reservas', JSON.stringify(resData));
        }

        if (hasNewToasts) {
          localStorage.setItem('notified_toast_ids', JSON.stringify(Array.from(notifiedIds.current)));
        }

        // Aplicar estado de lectura desde localStorage
        try {
          const dismissed = new Set(JSON.parse(localStorage.getItem('dismissed_notifs') || '[]'));
          const finalNotifs = newNotifs
            .filter(n => !dismissed.has(n.id))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          
          setNotifications(finalNotifs);
        } catch(e) {}

      } catch (error) {
        console.error('Error checking notifications', error);
      }
    };

    const timeout = setTimeout(checkNotifications, 1000);
    const interval = setInterval(checkNotifications, 10000); 

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [profile?.telefono]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const dismissed = new Set(JSON.parse(localStorage.getItem('dismissed_notifs') || '[]'));
      dismissed.add(id);
      localStorage.setItem('dismissed_notifs', JSON.stringify(Array.from(dismissed)));
    } catch(e) {}
  };

  return {
    notifications,
    unreadCount: notifications.length,
    dismissNotification
  };
}
