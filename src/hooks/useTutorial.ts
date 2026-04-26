'use client';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

export function useTutorial() {
  const router = useRouter();

  const startBookingTour = () => {
    // Si no estamos en la home, redirigir primero
    if (window.location.pathname !== '/') {
      router.push('/');
      setTimeout(() => startBookingTour(), 1000);
      return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'SIGUIENTE',
      prevBtnText: 'VOLVER',
      doneBtnText: 'FINALIZAR',
      steps: [
        { 
          element: '#tutorial-header', 
          popover: { 
            title: '¡Bienvenido!', 
            description: 'Esta es tu plataforma para reservar turnos de pádel de forma rápida y sencilla.',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-calendar', 
          popover: { 
            title: 'Elegí la fecha', 
            description: 'Seleccioná el día que querés jugar. Podés ver la disponibilidad en tiempo real.',
            side: "right", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-grid', 
          popover: { 
            title: 'Canchas y Horarios', 
            description: 'Aquí verás todas las canchas del complejo. Los espacios en violeta son los horarios disponibles.',
            side: "left", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-support', 
          popover: { 
            title: '¿Necesitás ayuda?', 
            description: 'Si tenés alguna duda, siempre podés contactar al complejo por WhatsApp desde aquí.',
            side: "top", 
            align: 'end' 
          } 
        },
      ]
    });

    driverObj.drive();
  };

  const startTournamentTour = () => {
    // Si no estamos en torneos, redirigir
    if (window.location.pathname !== '/torneos') {
      router.push('/torneos');
      setTimeout(() => startTournamentTour(), 1000);
      return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        { 
          element: '#tutorial-torneos-header', 
          popover: { 
            title: 'Torneos Oficiales', 
            description: 'Acá podés ver todos los torneos disponibles en el complejo.',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-torneos-tabs', 
          popover: { 
            title: 'Tus Inscripciones', 
            description: 'Podés cambiar entre ver todos los torneos o solo aquellos en los que ya estás anotado.',
            side: "top", 
            align: 'start' 
          } 
        },
      ]
    });

    driverObj.drive();
  };

  const startMatchesTour = () => {
    if (window.location.pathname !== '/partidos') {
      router.push('/partidos');
      setTimeout(() => startMatchesTour(), 1000);
      return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        { 
          element: '#tutorial-partidos-list', 
          popover: { 
            title: 'Buscá Pareja o Rivales', 
            description: 'En esta sección podés sumarte a partidos que otros jugadores ya armaron.',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-partidos-publish', 
          popover: { 
            title: 'Publicá tu Partido', 
            description: 'Si ya reservaste un turno y te falta gente, publicalo acá para que otros se sumen.',
            side: "left", 
            align: 'start' 
          } 
        },
      ]
    });

    driverObj.drive();
  };

  const startAdminTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'SIGUIENTE',
      prevBtnText: 'VOLVER',
      doneBtnText: 'FINALIZAR',
      steps: [
        { 
          element: '#tutorial-admin-tabs', 
          popover: { 
            title: 'Navegación Maestro', 
            description: 'Acá podés cambiar entre la gestión de Turnos del día y la creación de nuevos Torneos.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-admin-calendar', 
          popover: { 
            title: 'Estado del Complejo', 
            description: 'Mirá de un vistazo cuántos turnos tenés ocupados hoy y cuántas canchas están rindiendo al máximo.', 
            side: "right", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-admin-tournaments', 
          popover: { 
            title: 'Gestión de Torneos', 
            description: 'Acá es donde creás la magia. Podés ver tus torneos activos y las parejas que se inscribieron.', 
            side: "top", 
            align: 'start' 
          } 
        },
        { 
          element: '#tutorial-admin-tourney-actions', 
          popover: { 
            title: 'Control Maestro de Torneo', 
            description: 'Acá tenés el poder: USERS para abrir/cerrar inscripciones, GLOBE para poner el torneo En Vivo (público), y el LAYOUT para armar las zonas y llaves.', 
            side: "left", 
            align: 'center' 
          } 
        },
        { 
          element: '#tutorial-admin-actions', 
          popover: { 
            title: 'Manual y Salida', 
            description: 'Desde acá podés volver a leer el manual visual o cerrar tu sesión de forma segura.', 
            side: "left", 
            align: 'start' 
          } 
        }
      ]
    });
    driverObj.drive();
  };

  const startTournamentAdminTour = (onStepChange?: (step: string) => void) => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'SIGUIENTE',
      prevBtnText: 'VOLVER',
      doneBtnText: '¡ENTENDIDO!',
      steps: [
        { 
          element: '#tutorial-tourney-header', 
          popover: { 
            title: 'Gestión de Torneo Pro', 
            description: 'Bienvenido al centro de mando. Vamos a ver cada sección para que entiendas cómo armar tu torneo de punta a punta.', 
            side: "bottom", 
            align: 'center' 
          } 
        },
        { 
          element: '#tutorial-tourney-step-config', 
          popover: { 
            title: '1. Configuración', 
            description: 'Acá definís si el torneo es de zonas, eliminatoria directa o mixto.', 
            side: "bottom", 
            align: 'center' 
          },
          onHighlightStarted: () => onStepChange?.('config')
        },
        { 
          element: '#tutorial-tourney-step-pairs', 
          popover: { 
            title: '2. Gestión de Parejas', 
            description: 'Acá cargás a los guerreros o los importás desde la web.', 
            side: "bottom", 
            align: 'center' 
          },
          onHighlightStarted: () => onStepChange?.('pairs')
        },
        { 
          element: '#tutorial-tourney-step-assignment', 
          popover: { 
            title: '3. Armado de Zonas', 
            description: 'Arrastrás las parejas a sus respectivas zonas.', 
            side: "bottom", 
            align: 'center' 
          },
          onHighlightStarted: () => onStepChange?.('assignment')
        },
        { 
          element: '#tutorial-tourney-step-groups', 
          popover: { 
            title: '4. Gestión de Zonas', 
            description: 'Cargás los scores de cada partido acá.', 
            side: "bottom", 
            align: 'center' 
          },
          onHighlightStarted: () => onStepChange?.('groups')
        },
        { 
          element: '#tutorial-tourney-step-bracket', 
          popover: { 
            title: '5. Cuadro Final', 
            description: '¡El clímax! Acá se arman las llaves finales.', 
            side: "bottom", 
            align: 'center' 
          },
          onHighlightStarted: () => onStepChange?.('bracket')
        },
        { 
          element: '#tutorial-tourney-load', 
          popover: { 
            title: 'Versiones y Backups', 
            description: 'Restaurá versiones guardadas anteriormente.', 
            side: "bottom", 
            align: 'center' 
          } 
        },
        { 
          element: '#tutorial-tourney-visibility', 
          popover: { 
            title: 'Visibilidad Pública', 
            description: 'Controlá si los cambios ya se ven en la web.', 
            side: "bottom", 
            align: 'center' 
          } 
        },
        { 
          element: '#tutorial-tourney-save', 
          popover: { 
            title: '¡GUARDAR CAMBIOS!', 
            description: 'Fundamental para que todo quede grabado.', 
            side: "left", 
            align: 'center' 
          } 
        }
      ]
    });
    driverObj.drive();
  };

  return { 
    startBookingTour, 
    startTournamentTour, 
    startMatchesTour, 
    startAdminTour,
    startTournamentAdminTour 
  };
}
