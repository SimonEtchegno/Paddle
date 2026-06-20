import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useGuestProfile } from '@/hooks/useGuestProfile';
import { toast } from 'react-hot-toast';

export interface AppNotification {
  id: string;
  type: 'confirmacion' | 'solicitud' | 'cancelacion' | 'sistema';
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
    if (!profile?.telefono) {
      notifiedIds.current = new Set();
      return;
    }
    try {
      const stored = localStorage.getItem(`notified_toast_ids_${profile.telefono}`);
      if (stored) notifiedIds.current = new Set(JSON.parse(stored));
    } catch(e) {}
  }, [profile?.telefono]);

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
          const trackedKey = `tracked_reservas_${profile.telefono}`;
          const trackedStr = localStorage.getItem(trackedKey);
          
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
                    toast.error(`Turno cancelado por administración (${oldRes.fecha} - ${oldRes.hora}hs)`, { position: 'top-center', duration: 3000 });
                  }
                }
                // Limpiamos la flag por las dudas
                localStorage.removeItem(`user_cancelled_${oldRes.id}`);
              }
            });
          }
          localStorage.setItem(trackedKey, JSON.stringify(resData));
        }

        // 4. Chequear mensajes de sistema
        const { data: sysData } = await supabase
          .from('notificaciones_sistema')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (sysData) {
          const toastIdsKey = `notified_toast_ids_${profile.telefono}`;
          const dismissedKey = `dismissed_notifs_${profile.telefono}`;
          const isFirstRunForPhone = !localStorage.getItem(toastIdsKey);
          
          let dismissedList: string[] = [];
          try {
            dismissedList = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
          } catch(e) {}
          const dismissed = new Set(dismissedList);

          sysData.forEach((s: any) => {
            const notifId = `sys_${s.id}`;
            
            if (isFirstRunForPhone) {
              // Si es la primera vez que inicia sesión con este teléfono, 
              // descartamos las notificaciones de sistema existentes para que no aparezcan como pendientes.
              dismissed.add(notifId);
            }

            newNotifs.push({
              id: notifId,
              type: 'sistema',
              message: s.mensaje,
              time: s.created_at,
              isRead: false
            });

            if (!notifiedIds.current.has(notifId)) {
              notifiedIds.current.add(notifId);
              hasNewToasts = true;
              
              // Solo mostrar Toast si la notificación es reciente (últimas 24 horas)
              const isRecent = new Date(s.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;
              if (!isFirstRunForPhone && isRecent) {
                toast(s.mensaje, { icon: '📢', position: 'top-center', duration: 3000 });
              }
            }
          });

          if (isFirstRunForPhone && sysData.length > 0) {
            localStorage.setItem(dismissedKey, JSON.stringify(Array.from(dismissed)));
          }
        }

        // 5. Chequear participaciones canceladas (borradas por el creador)
        const { data: currentJoins } = await supabase
          .from('uniones_partidos')
          .select('id, partido_id, partidos_abiertos(fecha, hora)')
          .eq('whatsapp_interesado', profile.telefono)
          .eq('estado', 'confirmado');

        if (currentJoins) {
          const currentJoinIds = new Set(currentJoins.map((j: any) => j.id));
          const trackedJoinsKey = `tracked_match_joins_${profile.telefono}`;
          const trackedJoinsStr = localStorage.getItem(trackedJoinsKey);
          
          if (trackedJoinsStr) {
            const trackedJoins = JSON.parse(trackedJoinsStr);
            trackedJoins.forEach((oldJoin: any) => {
              if (!currentJoinIds.has(oldJoin.id)) {
                // Si la unión desapareció, significa que el partido fue borrado o el creador te sacó
                const notifId = `match_canc_${oldJoin.id}`;
                newNotifs.push({
                  id: notifId,
                  type: 'cancelacion',
                  message: `El partido del ${oldJoin.partidos_abiertos?.fecha} a las ${oldJoin.partidos_abiertos?.hora} hs fue cancelado`,
                  time: new Date().toISOString(),
                  isRead: false
                });

                if (!notifiedIds.current.has(notifId)) {
                  notifiedIds.current.add(notifId);
                  hasNewToasts = true;
                  toast.error(`Partido cancelado (${oldJoin.partidos_abiertos?.fecha} - ${oldJoin.partidos_abiertos?.hora}hs)`, { position: 'top-center', duration: 4000 });
                }
              }
            });
          }
          localStorage.setItem(trackedJoinsKey, JSON.stringify(currentJoins));
        }

        // 6. Chequear inscripciones a torneos canceladas
        const { data: currentInsc } = await supabase
          .from('inscripciones_torneos')
          .select('id, torneo_id, torneos(nombre)')
          .eq('telefono_contacto', profile.telefono);

        if (currentInsc) {
          const currentInscIds = new Set(currentInsc.map((i: any) => i.id));
          const trackedInscKey = `tracked_torneo_inscs_${profile.telefono}`;
          const trackedInscStr = localStorage.getItem(trackedInscKey);

          if (trackedInscStr) {
            const trackedInsc = JSON.parse(trackedInscStr);
            trackedInsc.forEach((oldInsc: any) => {
              if (!currentInscIds.has(oldInsc.id)) {
                // La inscripción desapareció
                const notifId = `tourney_canc_${oldInsc.id}`;
                newNotifs.push({
                  id: notifId,
                  type: 'cancelacion',
                  message: `Tu inscripción al torneo "${oldInsc.torneos?.nombre}" fue cancelada`,
                  time: new Date().toISOString(),
                  isRead: false
                });

                if (!notifiedIds.current.has(notifId)) {
                  notifiedIds.current.add(notifId);
                  hasNewToasts = true;
                  toast.error(`Inscripción cancelada: ${oldInsc.torneos?.nombre}`, { position: 'top-center', duration: 4000 });
                }
              }
            });
          }
          localStorage.setItem(trackedInscKey, JSON.stringify(currentInsc));
        }

        // 7. Chequear reservas propias (Confirmación de turno)
        const { data: myRes } = await supabase
          .from('reservas')
          .select('id, fecha, hora, cancha, created_at')
          .eq('telefono', profile.telefono)
          .gte('fecha', hoyStr)
          .order('created_at', { ascending: false });

        if (myRes) {
          myRes.forEach((r: any) => {
            const notifId = `myres_${r.id}`;
            newNotifs.push({
              id: notifId,
              type: 'confirmacion',
              message: `Turno reservado: ${r.fecha} a las ${r.hora} hs (Cancha ${r.cancha})`,
              time: r.created_at,
              isRead: false
            });
            // Marcamos como notificado para no tirar Toast si ya existe (o si lo acaba de hacer)
            if (!notifiedIds.current.has(notifId)) {
              notifiedIds.current.add(notifId);
              hasNewToasts = true;
              // Opcional: toast.success(...) pero ya lo hace el modal
            }
          });
        }

        // 8. Chequear inscripciones a torneos propias
        const { data: myInsc } = await supabase
          .from('inscripciones_torneos')
          .select('id, created_at, torneos(nombre)')
          .eq('telefono_contacto', profile.telefono)
          .order('created_at', { ascending: false });

        if (myInsc) {
          myInsc.forEach((i: any) => {
            const notifId = `myinsc_${i.id}`;
            newNotifs.push({
              id: notifId,
              type: 'confirmacion',
              message: `Inscripto correctamente al torneo: ${i.torneos?.nombre}`,
              time: i.created_at,
              isRead: false
            });
            if (!notifiedIds.current.has(notifId)) {
              notifiedIds.current.add(notifId);
              hasNewToasts = true;
            }
          });
        }

        if (hasNewToasts) {
          localStorage.setItem(`notified_toast_ids_${profile.telefono}`, JSON.stringify(Array.from(notifiedIds.current)));
        }

        // Aplicar estado de lectura desde localStorage
        try {
          const dismissedKey = `dismissed_notifs_${profile.telefono}`;
          const dismissed = new Set(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
          const readKey = `read_notifs_${profile.telefono}`;
          const readSet = new Set(JSON.parse(localStorage.getItem(readKey) || '[]'));
          
          const finalNotifs = newNotifs
            .filter(n => !dismissed.has(n.id))
            .map(n => ({ ...n, isRead: readSet.has(n.id) }))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          
          // Sonido si hay nuevas notificaciones (comparando longitud)
          setNotifications(prev => {
            if (finalNotifs.length > prev.length) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
              audio.volume = 0.4;
              audio.play().catch(() => {}); // Ignorar errores si el usuario no interactuó aún
            }
            return finalNotifs;
          });
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
    if (!profile?.telefono) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const dismissedKey = `dismissed_notifs_${profile.telefono}`;
      const dismissed = new Set(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
      dismissed.add(id);
      localStorage.setItem(dismissedKey, JSON.stringify(Array.from(dismissed)));
    } catch(e) {}
  };

  const clearAllNotifications = () => {
    if (!profile?.telefono) return;
    try {
      const dismissedKey = `dismissed_notifs_${profile.telefono}`;
      const dismissed = new Set(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
      notifications.forEach(n => dismissed.add(n.id));
      localStorage.setItem(dismissedKey, JSON.stringify(Array.from(dismissed)));
      setNotifications([]);
    } catch(e) {}
  };

  const markAllAsRead = () => {
    if (!profile?.telefono) return;
    try {
      const readKey = `read_notifs_${profile.telefono}`;
      const readSet = new Set(JSON.parse(localStorage.getItem(readKey) || '[]'));
      notifications.forEach(n => readSet.add(n.id));
      localStorage.setItem(readKey, JSON.stringify(Array.from(readSet)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch(e) {}
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    dismissNotification,
    clearAllNotifications,
    markAllAsRead
  };
}
