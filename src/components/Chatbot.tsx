"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, HelpCircle } from "lucide-react";
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
  const { profile } = useGuestProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = "2923460902";

  const getClubName = () => {
    if (typeof window === 'undefined') return 'Club';
    const cookies = document.cookie.split('; ');
    const slugCookie = cookies.find(row => row.startsWith('active_club_slug='));
    const activeSlug = slugCookie ? slugCookie.split('=')[1] : 'peñarol';
    return activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          history: messages.filter(m => m.content !== "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"),
          profile: profile ? { nombre: profile.nombre, apellido: profile.apellido, telefono: profile.telefono } : null
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

      // Interceptar comando para CREAR RESERVA DIRECTA
      const matchCrear = replyText.match(/\[ACCION:CREAR_RESERVA\((.*?)\)\]/);
      if (matchCrear) {
        try {
          const resData = JSON.parse(matchCrear[1]);
          replyText = replyText.replace(matchCrear[0], "").trim();
          if (replyText === "") {
            replyText = `Confirmando tu turno del día ${resData.fecha} a las ${resData.hora} hs en la Cancha ${resData.cancha}... 🎾`;
          }
          await executeReservation(resData);
        } catch (err) {
          console.error("Error al parsear JSON de reserva directa:", err);
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
      
      // Esperar un momento y refrescar para actualizar la grilla y la UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (e: any) {
      toast.error(e.message || 'Error al reservar', { id: loadingToast });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 md:bottom-6 md:right-6 w-[90vw] md:w-[380px] h-[500px] max-h-[80vh] bg-[#1a2235] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a2235] text-white p-4 flex justify-between items-center border-b border-[var(--border)]">
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
                    setIsOpen(false);
                    router.push('/ayuda');
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-[var(--primary)] hover:opacity-80"
                  title="Guías y Ayuda"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                {/* Cerrar */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
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
                  
                  <div className={`max-w-[80%] p-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[var(--primary)] text-white rounded-2xl rounded-tr-sm' 
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-6 md:right-6 w-14 h-14 bg-[var(--primary)] text-black rounded-full shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center hover:scale-110 transition-transform z-[100] border-4 border-[#0a0b0e]"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
