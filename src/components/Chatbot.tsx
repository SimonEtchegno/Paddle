"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, HelpCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

type Message = {
  role: "user" | "model";
  content: string;
};

export function Chatbot() {
  const router = useRouter();
  const { profile, saveProfile } = useGuestProfile();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  // Cargar historial de chat al montar
  useEffect(() => {
    const saved = localStorage.getItem("paddle_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar historial de chat:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar historial al actualizar mensajes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("paddle_chat_history", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isLoaded]);

  const whatsappNumber = "2923460902";

  const getClubName = () => {
    if (typeof window === 'undefined') return 'Club';
    const cookies = document.cookie.split('; ');
    const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
    const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'peñarol';
    return activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1);
  };

  const handleClearChat = () => {
    const defaultMsg: Message[] = [
      { role: "model", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }
    ];
    setMessages(defaultMsg);
    localStorage.setItem("paddle_chat_history", JSON.stringify(defaultMsg));
    toast.success("Conversación reiniciada 🗑️");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const cookies = document.cookie.split('; ');
      const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
      const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'peñarol';

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.filter(m => m.content !== "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"),
          profile: profile ? { nombre: profile.nombre, apellido: profile.apellido, telefono: profile.telefono } : null,
          clubSlug: activeSlug
        }),
      });

      if (!response.ok) throw new Error("Error en la API");

      const data = await response.json();
      let replyText = data.reply;

      // Interceptar comandos de acción
      // Interceptar comando de redirección a fecha
      const match = replyText.match(/\[ACCION:RESERVAR\((.*?)\)\]/);
      if (match) {
        const params = match[1].split(",");
        const date = params[0].trim();
        const time = params[1] ? params[1].trim() : "";

        replyText = replyText.replace(match[0], "").trim();
        if (replyText === "") {
          replyText = `¡Listo! Te he llevado a la pantalla de reservas para la fecha ${date}${time ? ` a las ${time} hs` : ""}.`;
        }
        router.push(`/?date=${date}${time ? `&time=${time}` : ""}`);
      }

      // Interceptar comando para CREAR RESERVA DIRECTA (Soporta múltiples)
      const regexCrear = /\[ACCION:CREAR_RESERVA\((.*?)\)\]/g;
      const matches = [...replyText.matchAll(regexCrear)];

      if (matches.length > 0) {
        let successCount = 0;
        for (const matchCrear of matches) {
          try {
            const resData = JSON.parse(matchCrear[1]);
            replyText = replyText.replace(matchCrear[0], "").trim();
            await executeReservation(resData);
            successCount++;
          } catch (err) {
            console.error("Error al parsear JSON de reserva directa:", err);
          }
        }
        if (replyText === "") {
          replyText = `Confirmando ${successCount > 1 ? successCount + ' turnos' : 'tu turno'}... 🎾`;
        }
      }

      // Interceptar comando para CANCELAR RESERVA (Soporta múltiples)
      const regexCancelar = /\[ACCION:CANCELAR_RESERVA\((.*?)\)\]/g;
      const matchesCancelar = [...replyText.matchAll(regexCancelar)];

      if (matchesCancelar.length > 0) {
        let successCount = 0;
        for (const matchCancelar of matchesCancelar) {
          try {
            const cancelData = JSON.parse(matchCancelar[1]);
            replyText = replyText.replace(matchCancelar[0], "").trim();
            await executeCancellation(cancelData);
            successCount++;
          } catch (err) {
            console.error("Error al parsear JSON de cancelación:", err);
          }
        }
        if (replyText === "") {
          replyText = `Cancelando ${successCount > 1 ? successCount + ' turnos' : 'tu turno'}... 🗑️`;
        }
      }

      // Interceptar comando para ACTUALIZAR PERFIL
      const regexPerfil = /\[ACCION:ACTUALIZAR_PERFIL\((.*?)\)\]/g;
      const matchesPerfil = [...replyText.matchAll(regexPerfil)];

      if (matchesPerfil.length > 0) {
        for (const matchPerfil of matchesPerfil) {
          try {
            const perfilData = JSON.parse(matchPerfil[1]);
            replyText = replyText.replace(matchPerfil[0], "").trim();
            await executeSaveProfile(perfilData);
          } catch (err) {
            console.error("Error al parsear JSON de actualizar perfil:", err);
          }
        }
        if (replyText === "") {
          replyText = `¡Perfil guardado con éxito! 👤`;
        }
      }

      setMessages(prev => [...prev, { role: "model", content: replyText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", content: "Lo siento, tuve un problema al procesar tu solicitud." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeReservation = async (data: {
    nombre: string;
    telefono: string;
    fecha: string;
    hora: string;
    cancha: number;
    deporte: 'padel' | 'futbol';
  }) => {
    const loadingToast = toast.loading("Reservando tu cancha...");
    try {
      // 1. Obtener el club activo (Multi-Tenant)
      const cookies = document.cookie.split('; ');
      const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
      const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'peñarol';

      const { data: clubData } = await supabase
        .from('clubes')
        .select('id')
        .eq('slug', activeSlug)
        .single();

      // 2. Verificar límite de 3 turnos
      const { data: existing } = await supabase
        .from('reservas')
        .select('id')
        .eq('fecha', data.fecha)
        .eq('telefono', data.telefono);

      if (existing && existing.length >= 3) {
        throw new Error('Ya tienes 3 turnos reservados para este día. ¡Deja jugar al resto! 😉');
      }

      // 3. Insertar la reserva
      const { error } = await supabase.from('reservas').insert({
        fecha: data.fecha,
        hora: data.hora,
        cancha: data.cancha,
        nombre: `${data.nombre} (IA)`,
        telefono: data.telefono,
        ...(clubData ? { club_id: clubData.id } : {})
      });

      if (error) {
        if (error.code === '23505' || error.message?.includes('reservas_fecha_hora_cancha_key')) {
          throw new Error('Este turno ya fue reservado por otra persona. ¡Elige otro horario!');
        }
        throw error;
      }

      toast.success('¡Reserva confirmada con éxito!', { id: loadingToast });

      // Dispatch custom event for real-time live updates in the UI
      window.dispatchEvent(new CustomEvent('reserva_modificada', { detail: { fecha: data.fecha } }));
      router.refresh();

    } catch (e: any) {
      toast.error(e.message || 'Error al reservar', { id: loadingToast });
    }
  };

  const executeCancellation = async (data: {
    fecha: string;
    hora: string;
    cancha: number;
  }) => {
    const loadingToast = toast.loading("Cancelando tu cancha...");
    try {
      if (!profile?.telefono) {
        throw new Error("No pudimos validar tu número de teléfono.");
      }

      // 1. Buscar la reserva que coincide con la fecha, cancha y teléfono del usuario
      const { data: existing, error: fetchError } = await supabase
        .from('reservas')
        .select('id, hora')
        .eq('fecha', data.fecha)
        .eq('cancha', data.cancha)
        .eq('telefono', profile.telefono);

      if (fetchError) throw fetchError;

      const targetHoraStr = data.hora.substring(0, 5);
      const bookingToCancel = existing?.find(r => r.hora.substring(0, 5) === targetHoraStr);

      if (!bookingToCancel) {
        throw new Error("No encontramos ningún turno a tu nombre en esa fecha y hora.");
      }

      // Guardar cancelación local para trackeo de la app
      localStorage.setItem(`user_cancelled_${bookingToCancel.id}`, 'true');

      // 2. Eliminar de la base de datos
      const { error: deleteError } = await supabase
        .from('reservas')
        .delete()
        .eq('id', bookingToCancel.id);

      if (deleteError) throw deleteError;

      toast.success('¡Reserva cancelada con éxito!', { id: loadingToast });

      // Dispatch custom event for real-time live updates in the UI
      window.dispatchEvent(new CustomEvent('reserva_modificada', { detail: { fecha: data.fecha } }));
      router.refresh();

    } catch (e: any) {
      toast.error(e.message || 'Error al cancelar', { id: loadingToast });
    }
  };

  const executeSaveProfile = async (data: {
    nombre: string;
    apellido?: string;
    telefono: string;
    localidad?: string;
  }) => {
    const loadingToast = toast.loading("Guardando tu perfil...");
    try {
      await saveProfile({
        nombre: data.nombre,
        apellido: data.apellido || "",
        telefono: data.telefono,
        localidad: data.localidad || ""
      });
      toast.success("¡Perfil guardado con éxito! 🎉", { id: loadingToast });

      // Dispatch custom event to trigger data/profile refresh across the application
      window.dispatchEvent(new CustomEvent('reserva_modificada', { detail: { fecha: "" } }));
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Error al guardar perfil", { id: loadingToast });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#0f1423]">
        {/* Header (Simplified since it's inside the main widget now) */}
        <div className="bg-[#1a2235] text-white p-3 flex justify-between items-center border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--primary)]/10 p-2 rounded-full text-[var(--primary)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight text-sm uppercase tracking-tight italic">Soporte {getClubName()}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Asistente IA</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-green-400 hover:text-green-300"
              title="WhatsApp Directo"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Llamar */}
            <a
              href={`tel:${whatsappNumber}`}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-blue-400 hover:text-blue-300"
              title="Llamar al Complejo"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Guías */}
            <button
              onClick={() => {
                router.push('/ayuda');
              }}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-[var(--primary)] hover:opacity-80"
              title="Guías y Ayuda"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Limpiar chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-red-400 hover:text-red-300"
              title="Reiniciar chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1423]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] px-4 py-2.5 text-[13px] sm:text-sm shadow-sm whitespace-pre-wrap break-words leading-relaxed ${msg.role === 'user'
                  ? 'bg-[var(--primary)] text-[#0a0b0e] font-medium rounded-2xl rounded-tr-sm'
                  : 'bg-[#1a2235] border border-[var(--border)] text-gray-200 rounded-2xl rounded-tl-sm'
                }`}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="p-3 rounded-2xl bg-[#1a2235] border border-[var(--border)] flex items-center gap-2 rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#1a2235] border-t border-[var(--border)]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame algo..."
              className="flex-1 bg-[#0f1423] text-sm text-white placeholder-gray-500 border border-[var(--border)] rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1 top-1 bottom-1 w-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
