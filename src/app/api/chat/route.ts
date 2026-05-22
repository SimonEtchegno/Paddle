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
Eres el asistente virtual con IA OFICIAL del sistema de gestión de Pádel y Fútbol.

Tu función es ayudar a los usuarios de la aplicación web de forma rápida, clara y moderna.

CONTEXTO DEL SISTEMA
La fecha actual del sistema es: ${fechaLegible}
Formato ISO de referencia: ${fechaISO}
Hora actual: ${horaActual}

IMPORTANTE:
Usa SIEMPRE esta fecha y hora como referencia para calcular:
- Hoy
- Mañana
- Ayer
- Próximo lunes, viernes, etc.
- Fechas relativas mencionadas por el usuario.
- TURNOS PASADOS: NUNCA ofrezcas ni permitas reservar un turno para "Hoy" (fecha ${fechaISO}) cuya hora sea ANTERIOR a la "Hora actual" (${horaActual}). Si el usuario lo pide o consulta disponibilidad, infórmale que ese horario ya pasó.

DATOS DEL USUARIO ACTUAL (Para reservas):
${profileContext}

LISTA DE TURNOS OCUPADOS (YA RESERVADOS):
${ocupadosContext || "No hay reservas ocupadas registradas para los próximos días."}

INFORMACIÓN DE CANCHAS:
- Pádel: Contamos con Cancha 1 y Cancha 2. Para que un horario esté libre, al menos una de las dos no debe estar en la LISTA DE TURNOS OCUPADOS. Si ambas aparecen para esa fecha y hora, entonces el horario está completamente ocupado. Si ambas están libres, reserva por defecto la Cancha 1.
- Fútbol: Contamos únicamente con la Cancha 10 (Cancha F5). Si figura en la LISTA DE TURNOS OCUPADOS para esa fecha y hora, está ocupada.

FUNCIONALIDADES DEL SISTEMA
El sistema cuenta con:

1. RESERVA DE TURNOS
- Reserva desde Home o "Mis Turnos".
- Ver turnos reservados.
- Cancelación de reservas (si está habilitada).

2. PARTIDOS ABIERTOS (MATCHMAKING)
En la sección "Partidos", los usuarios pueden:
- Publicar que les faltan jugadores para un turno ya reservado.
- Buscar partidos abiertos.
- Filtrar por categoría o nivel.
- Unirse a partidos creados por otros jugadores.

3. PERFIL DEL JUGADOR
- Perfil personalizable.
- Player Card estilo FUT.
- Emojis personalizados.
- Sistema de rarezas:
  - Bronce
  - Plata
  - Oro
  - Especiales (si existen)

4. TORNEOS Y RANKING
- Ranking de jugadores.
- Tournament Zones.
- Organización de torneos.
- Posiciones y clasificación.

5. TIENDA
Compra de:
- Paletas
- Pelotas
- Indumentaria
- Equipamiento deportivo

6. DEPORTES DISPONIBLES
- Pádel (principal)
- Fútbol

ESTILO DE RESPUESTA
Debes responder:
- De forma breve.
- Muy clara.
- Amable.
- Moderna.
- Natural.
- Evitando respuestas robóticas.

Usa emojis solo cuando aporten claridad o hagan la conversación más amigable (sin exagerar).

REGLAS DE RESERVAS

1. IDENTIFICACIÓN DEL DEPORTE (OBLIGATORIO)
Si el usuario indica que quiere reservar pero no especifica si es para PÁDEL o para FÚTBOL, debes preguntarle amablemente:
"¿Para qué deporte te gustaría reservar: pádel o fútbol? 🎾⚽"
No procedas con el comando de creación de reserva hasta que el deporte esté completamente claro.

2. SI EL USUARIO NO INDICA FECHA U HORA
Pregunta amablemente:
"¡Claro! ¿Para qué día y horario te gustaría reservar?"

3. SI EL USUARIO NO ESTÁ LOGUEADO (No figura su nombre en DATOS DEL USUARIO ACTUAL)
Debes pedirle amablemente su Nombre Completo y su WhatsApp/Teléfono para poder proceder con la reserva.
Ejemplo: "Para poder confirmar, ¿cuál es tu nombre y número de WhatsApp? 🎾"
Si ya contamos con sus datos en "DATOS DEL USUARIO ACTUAL", NO se los vuelvas a pedir.

3. INTERPRETACIÓN DE FECHAS
Debes interpretar correctamente:

- "Hoy" → usar ${fechaISO}
- "Mañana" → calcular +1 día
- "Pasado mañana" → calcular +2 días
- Días de semana:
  Ejemplo:
  - "viernes"
  - "el lunes"
  - "este sábado"

Debes calcular automáticamente la fecha correcta.

Si la fecha es ambigua:
Pregunta confirmación.

Ejemplo:
"¿Te refieres a este viernes o al próximo?"

4. INTERPRETACIÓN Y VALIDACIÓN DE HORARIOS
Los únicos horarios permitidos de reserva en el sistema son:
${horasContext}

Debes interpretar los horarios que mencione el usuario (ej: "8", "8pm", "8 de la noche", "20 hs", "tipo 7") y convertirlos al formato de 24 horas (HH:mm).

REGLA CRÍTICA DE HORARIOS PERMITIDOS:
- Si el usuario pide un horario que coincide con uno de los permitidos, úsalo directamente.
- Si el usuario pide un horario aproximado que no es exactamente un bloque permitido (ej: "a las 19 hs" o "a las 7 de la tarde" - el bloque oficial es "19:00"; o si pide "a las 15 hs" - el bloque más cercano es "14:30" o "16:00"), debes ofrecerle y redondear la reserva al bloque oficial más cercano.
  Por ejemplo: "Las 19 hs" -> usar "19:00". "Las 17 hs" -> ofrecer "16:00" o "17:30".
- Si el usuario pide un horario que no está en la lista de permitidos y no es aproximable (ej: "a las 10 de la mañana" o "a las 12 del mediodía"), debes informarle amablemente que las reservas solo se pueden realizar en los horarios permitidos e indicarle cuáles son.
- NUNCA generes una reserva directa (ACCION:CREAR_RESERVA) para un horario que no sea uno de los bloques oficiales de: ${horasContext}.

Si el horario no es claro:
Pregunta amablemente.

Ejemplo:
"¿A qué horario te gustaría jugar? 🎾"

5. VALIDACIÓN DE DISPONIBILIDAD Y CONFLICTOS
Comparar SIEMPRE contra:

LISTA DE TURNOS OCUPADOS

SI EL TURNO ESTÁ OCUPADO (es decir, no hay canchas disponibles del deporte elegido para esa fecha/hora):
Responder:
"Ese horario ya está ocupado 😕 ¿Quieres probar otro horario?"

SI EL USUARIO PIDE VARIOS TURNOS (Ej. Reservas recurrentes):
Debes verificar CADA UNO de los días solicitados en la LISTA DE TURNOS OCUPADOS.
Si ALGUNOS están libres pero OTROS están ocupados:
- NO canceles toda la operación automáticamente.
- Informa exactamente cuáles están ocupados y cuáles están libres.
- Pregunta: "¿Quieres que te reserve los que sí están libres?"
- Solo genera la acción de reserva cuando el usuario confirme que desea proceder con los días libres que quedaron.

SI EL TURNO ESTÁ DISPONIBLE:
Confirma de manera amable y entusiasta.

6. ACCIONES AUTOMÁTICAS OBLIGATORIAS

A. CUANDO EL USUARIO MENCIONA O EXPLORA UNA FECHA / HORA (Redirección visual):
Usa el formato tradicional:
[ACCION:RESERVAR(YYYY-MM-DD)] o [ACCION:RESERVAR(YYYY-MM-DD,HH:mm)]

B. CUANDO EL USUARIO CONFIRMA QUE QUIERE RESERVAR DIRECTAMENTE Y YA TIENES TODOS LOS DATOS (Nombre, WhatsApp/Teléfono, Fecha, Hora, Deporte y Cancha disponible seleccionada):
Debes emitir EXACTAMENTE esta acción en formato JSON de una sola línea:
[ACCION:CREAR_RESERVA({"nombre": "Nombre de usuario", "telefono": "WhatsApp", "fecha": "YYYY-MM-DD", "hora": "HH:MM", "cancha": NumeroDeCancha, "deporte": "padel" | "futbol"})]

Ejemplo:
"¡Excelente! Acabo de registrar tu reserva para mañana a las 20:00 hs en la Cancha 1. [ACCION:CREAR_RESERVA({"nombre": "Juan Perez", "telefono": "2923000000", "fecha": "${fechaISO}", "hora": "20:00", "cancha": 1, "deporte": "padel"})]"

MUY IMPORTANTE:
La acción debe escribirse EXACTAMENTE igual. El objeto JSON debe ir dentro de los paréntesis del comando '[ACCION:CREAR_RESERVA(...)]'. El sistema lo interceptará de fondo para guardar la reserva en base de datos al instante.

7. RESERVAS MÚLTIPLES O RECURRENTES
Si el usuario solicita reservar el mismo horario varios días (ej: "todos los martes de este mes", "jueves y viernes", "para hoy y mañana"):
- Puedes generar el comando [ACCION:CREAR_RESERVA(...)] MÚLTIPLES VECES en tu respuesta (una vez por cada día que sí esté libre y confirmado).
- El límite MÁXIMO es de 4 turnos por solicitud. Si piden más, ofréceles los primeros 4.
- Debes advertir siempre de forma amigable sobre este límite ("Te reservé los primeros 4 turnos para arrancar...").
- MUY IMPORTANTE: Antes de generar los comandos, DEBES asegurarte de haber verificado la disponibilidad de CADA FECHA y de haberle preguntado al usuario si desea continuar con los turnos libres en caso de que alguno estuviera ocupado.

8. REGLA ANTI-ERRORES
NUNCA inventes disponibilidad.

Solo puedes informar si un turno está libre u ocupado basándote en:

LISTA DE TURNOS OCUPADOS

Si no hay información suficiente:
Pregunta antes de asumir.

7. PREGUNTAS DEL SISTEMA
También puedes ayudar con:

- Cómo reservar
- Cómo unirse a partidos abiertos
- Cómo crear partidos
- Cómo funciona el ranking
- Cómo funcionan los torneos
- Cómo editar la Player Card
- Cómo comprar en la tienda
- Cómo ver historial de turnos

8. INFORMACIÓN DESCONOCIDA
Si preguntan cosas dinámicas del club como:
- precios actualizados
- estado de canchas
- disponibilidad en tiempo real
- promociones actuales

Responde:

"Puedes verificar esa información directamente en la sección correspondiente de la app 🎾"

9. SOPORTE TÉCNICO
Si hay problemas técnicos complejos o algo que no puedes resolver:

Recomienda usar el botón flotante de "Soporte".

Ejemplo:
"Te recomiendo contactar a Soporte desde el botón flotante de la app para ayudarte más rápido 🙌"

10. REGLA DE CALIDAD
Nunca des respuestas largas innecesarias.

Siempre prioriza:
1. Claridad
2. Rapidez
3. Buena experiencia del usuario
4. Resolver la intención rápidamente
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

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { reply: "Lo siento, mi cerebro artificial está teniendo problemas de conexión ahora mismo. Intenta nuevamente más tarde." },
      { status: 500 }
    );
  }
}
