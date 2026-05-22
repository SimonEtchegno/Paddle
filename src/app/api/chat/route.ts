import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TURNOS_FIJOS, HORAS } from "@/lib/constants";

const getSystemPrompt = (ocupadosContext: string, profileContext: string, horasContext: string, horaActual: string) => {
  // Obtenemos la fecha en Argentina (UTC-3) restando 3 horas al timestamp UTC
  const now = new Date();
  const argTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const fechaLegible = `${dias[argTime.getUTCDay()]} ${argTime.getUTCDate()} de ${meses[argTime.getUTCMonth()]} de ${argTime.getUTCFullYear()}`;
  const fechaISO = argTime.getUTCFullYear() + "-" + String(argTime.getUTCMonth() + 1).padStart(2, '0') + "-" + String(argTime.getUTCDate()).padStart(2, '0');

  return `
Sistema de Gestión de Pádel y Fútbol — System Prompt
Eres el asistente virtual con IA OFICIAL del sistema de gestión de Pádel y Fútbol.
Tu función es ayudar a los usuarios de forma rápida, clara y moderna.

CONTEXTO DEL SISTEMA

Fecha actual: ${fechaLegible} (ISO: ${fechaISO})
Hora actual: ${horaActual}

Usa SIEMPRE estos valores para interpretar expresiones como "hoy", "mañana", "el próximo viernes", etc.
Regla crítica de tiempo: NUNCA ofrezcas ni permitas reservar un turno de hoy (${fechaISO}) cuya hora sea anterior a ${horaActual}. Si el usuario lo solicita, informa que ese horario ya pasó.

DATOS DEL USUARIO ACTUAL
${profileContext}
Si el usuario NO está logueado (no hay nombre en los datos de arriba), pídele amablemente:

Nombre completo
Número de WhatsApp / teléfono

Una vez que tengas sus datos, NO vuelvas a pedirlos en la misma conversación.

TURNOS OCUPADOS
${ocupadosContext || "No hay reservas ocupadas registradas para los próximos días."}

CANCHAS DISPONIBLES

Pádel: Cancha 1 y Cancha 2. El horario está disponible si al menos una está libre. Si ambas están libres, reservar por defecto la Cancha 1.
Fútbol: Solo Cancha 10 (Cancha F5). Si figura en la lista de ocupados para esa fecha/hora, está ocupada.


FUNCIONALIDADES DEL SISTEMA

Reservas — Desde Home o "Mis Turnos". Ver, reservar y cancelar turnos.
Partidos abiertos — Publicar que faltan jugadores, buscar partidos, filtrar por categoría/nivel y unirse.
Perfil del jugador — Player Card estilo FUT, emojis personalizados, sistema de rarezas: Bronce, Plata, Oro, Especiales.
Torneos y Ranking — Ranking, Tournament Zones, organización de torneos y clasificaciones.
Tienda — Paletas, pelotas, indumentaria y equipamiento deportivo.
Deportes disponibles — Pádel (principal) y Fútbol.


REGLAS DE RESERVAS
1. Deporte obligatorio
Si el usuario quiere reservar pero no especifica el deporte, pregunta:

"¿Para qué deporte te gustaría reservar: pádel o fútbol? 🎾⚽"

No generes ninguna acción de reserva hasta tener esto claro.

2. Fecha y hora
Si no indica fecha u hora, pregunta:

"¡Claro! ¿Para qué día y horario te gustaría reservar?"

Interpretación de fechas:

"Hoy" → ${fechaISO}
"Mañana" → ${fechaISO} + 1 día
"Pasado mañana" → ${fechaISO} + 2 días
Días de semana ("el viernes", "este lunes") → calcular automáticamente la fecha correcta.
Si la fecha es ambigua → confirmar antes de proceder. Ej: "¿Te referís a este viernes o al próximo?"

3. Horarios permitidos
Los únicos horarios válidos son:
${horasContext}
Reglas de interpretación:

Convierte lo que diga el usuario a formato 24hs (HH:mm).
Si el horario coincide exactamente con uno permitido → usarlo.
Si es aproximado (ej: "a las 17 hs") → ofrecer el bloque oficial más cercano (ej: "16:00 o 17:30").
Si no es aproximable (ej: "a las 10 de la mañana") → informar los horarios disponibles.
NUNCA generes una reserva para un horario que no esté en la lista oficial.

4. Verificación de disponibilidad
Compara SIEMPRE contra la lista de turnos ocupados.

Ocupado: "Ese horario ya está ocupado 😕 ¿Querés probar otro?"
Disponible: Confirma de forma amable y entusiasta.

Reservas múltiples:

Verificá CADA fecha por separado.
Si algunas están libres y otras ocupadas: informá cuáles son cuáles y preguntá si desea continuar con las libres.
Generá los comandos SOLO después de que el usuario confirme.
Límite máximo: 4 turnos por solicitud. Si piden más, reservá los primeros 4 y avisá amablemente.

5. Acciones del sistema
A. Al explorar una fecha/hora (redirección visual en la app):
[ACCION:RESERVAR(YYYY-MM-DD)]
[ACCION:RESERVAR(YYYY-MM-DD,HH:mm)]

B. Al confirmar una reserva (todos los datos completos: nombre, teléfono, fecha, hora, deporte, cancha disponible):
[ACCION:CREAR_RESERVA({"nombre": "Nombre Apellido", "telefono": "WhatsApp", "fecha": "YYYY-MM-DD", "hora": "HH:MM", "cancha": 1, "deporte": "padel"})]
El JSON debe ir EXACTAMENTE dentro de los paréntesis. El sistema lo interceptar automáticamente para guardar en base de datos.
Para reservas múltiples: generá un comando [ACCION:CREAR_RESERVA(...)] por cada turno confirmado, en la misma respuesta.

OTRAS CONSULTAS
Podés ayudar también con:

Cómo reservar / cancelar
Cómo unirse o crear partidos abiertos
Cómo funciona el ranking y los torneos
Cómo editar la Player Card
Cómo comprar en la tienda
Historial de turnos

Información dinámica del club (precios, promociones, estado de canchas en tiempo real):

"Podés verificar eso directamente en la sección correspondiente de la app 🎾"

Problemas técnicos complejos:

"Te recomiendo contactar a Soporte desde el botón flotante de la app 🙌"


ESTILO DE RESPUESTA

Respuestas breves, claras, amables y naturales.
Usá emojis con moderación, solo cuando aporten.
Nunca des respuestas largas innecesarias.
NUNCA inventes disponibilidad. Solo informás según la lista de turnos ocupados.
Siempre priorizá: claridad → rapidez → buena experiencia → resolver la intención.
`;
};

export async function POST(req: Request) {
  try {
    const { message, history, profile } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY in process.env:", !!apiKey, apiKey ? apiKey.substring(0, 5) : "undefined");
    
    if (!apiKey) {
      return NextResponse.json(
        { reply: "¡Hola! Para que pueda usar mi Inteligencia Artificial y responder a tus dudas, el administrador del sistema debe configurar la variable de entorno \`GEMINI_API_KEY\` en el servidor." },
        { status: 200 }
      );
    }

    // 1. Obtener reservas ocupadas desde hoy en adelante para inyectar como contexto
    const now = new Date();
    const argTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const hoyISO = argTime.getUTCFullYear() + "-" + String(argTime.getUTCMonth() + 1).padStart(2, '0') + "-" + String(argTime.getUTCDate()).padStart(2, '0');
    const horaActual = String(argTime.getUTCHours()).padStart(2, '0') + ":" + String(argTime.getUTCMinutes()).padStart(2, '0');

    const { data: reservas } = await supabase
      .from('reservas')
      .select('fecha, hora, cancha')
      .gte('fecha', hoyISO)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })
      .limit(100);

    // 2. Generar lista de turnos ocupados combinando reservas de base de datos y turnos fijos (próximos 14 días)
    const occupiedList: Array<{ fecha: string; hora: string; cancha: number; tipo: string }> = [];
    
    if (reservas) {
      for (const r of reservas) {
        occupiedList.push({
          fecha: r.fecha,
          hora: r.hora.slice(0, 5),
          cancha: r.cancha,
          tipo: 'Reservado'
        });
      }
    }

    // Agregar turnos fijos semanales correspondientes a los próximos 14 días
    for (let i = 0; i < 14; i++) {
      // Calcular fecha desplazada en base a argTime sumando días en milisegundos
      const d = new Date(argTime.getTime() + i * 24 * 60 * 60 * 1000);
      const fechaStr = d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, '0') + "-" + String(d.getUTCDate()).padStart(2, '0');
      const dayOfWeek = d.getUTCDay();
      
      const dayFixed = TURNOS_FIJOS[dayOfWeek];
      if (dayFixed) {
        for (const hora of Object.keys(dayFixed)) {
          const courts = dayFixed[hora];
          for (const canchaStr of Object.keys(courts)) {
            const cancha = parseInt(canchaStr);
            const nombreFijo = courts[cancha];
            
            // Si no existe ya una reserva en la base de datos para este mismo slot de cancha/hora, lo agregamos como ocupado
            const exists = occupiedList.some(o => o.fecha === fechaStr && o.hora === hora && o.cancha === cancha);
            if (!exists) {
              occupiedList.push({
                fecha: fechaStr,
                hora,
                cancha,
                tipo: `Fijo (${nombreFijo})`
              });
            }
          }
        }
      }
    }

    // Ordenar los turnos ocupados cronológicamente
    occupiedList.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
      return a.cancha - b.cancha;
    });

    const ocupadosContext = occupiedList
      .map(r => `- Fecha: ${r.fecha}, Hora: ${r.hora}, Cancha: ${r.cancha} (${r.tipo})`)
      .join('\n');

    // 2. Formatear perfil del usuario
    const profileContext = profile 
      ? `Usuario logueado:
  - Nombre: ${profile.nombre} ${profile.apellido || ""}
  - WhatsApp/Teléfono: ${profile.telefono || "No especificado"}`
      : "El usuario NO está logueado en el sistema.";

    // 3. Formatear lista de horas permitidas
    const horasContext = HORAS.map(h => `- ${h}`).join('\n');

    // Convert history format to Gemini API format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    console.log("Using API Key starting with:", apiKey.substring(0, 5));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: getSystemPrompt(ocupadosContext, profileContext, horasContext, horaActual) }]
        },
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error detail:", JSON.stringify(errorData));
      
      if (response.status === 429) {
        return NextResponse.json({ 
          reply: "¡Oops! 😅 Hemos alcanzado el límite de preguntas por minuto de mi sistema. Por favor, espera 10 o 15 segundos y vuelve a enviarme tu consulta. ¡Estaré listo! 🎾" 
        });
      }
      
      throw new Error(`Error from Gemini API: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, me quedé sin palabras.";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { reply: "Lo siento, mi cerebro artificial está teniendo problemas de conexión ahora mismo. Intenta nuevamente más tarde.", errorDetail: error.message },
      { status: 500 }
    );
  }
}
