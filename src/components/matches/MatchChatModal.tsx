"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PartidoAbierto } from "@/types";

interface Message {
  id: string;
  partido_id: string;
  emisor_telefono: string;
  contenido: string;
  created_at: string;
}

interface MatchChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: PartidoAbierto | null;
  profile: any;
}

export function MatchChatModal({ isOpen, onClose, partido, profile }: MatchChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [perfiles, setPerfiles] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !partido?.id) return;

    // Actualizar última lectura al abrir
    localStorage.setItem(`chat_read_${partido.id}`, new Date().toISOString());
    window.dispatchEvent(new Event('chat_read_updated'));

    const loadChat = async () => {
      // 1. Cargar mensajes
      const { data: msgs } = await supabase
        .from('mensajes_partido')
        .select('*')
        .eq('partido_id', partido.id)
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs);

      // 2. Cargar perfiles de los emisores
      if (msgs && msgs.length > 0) {
        const telefonos = [...new Set(msgs.map(m => m.emisor_telefono))];
        const { data: profs } = await supabase
          .from('perfiles')
          .select('telefono, nombre, apellido, avatar_url')
          .in('telefono', telefonos);
        
        if (profs) {
          const profMap: Record<string, any> = {};
          profs.forEach(p => profMap[p.telefono] = p);
          setPerfiles(profMap);
        }
      }
    };

    loadChat();

    const channel = supabase.channel(`chat_partido_${partido.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensajes_partido',
        filter: `partido_id=eq.${partido.id}`
      }, async (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          // Reemplazar el mensaje temporal optimista si coincide (mismo emisor, contenido y dentro de 5s)
          const tempIndex = prev.findIndex(m =>
            m.emisor_telefono === newMsg.emisor_telefono &&
            m.contenido === newMsg.contenido &&
            Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 5000 &&
            !m.id.includes('-') // los IDs de Supabase son UUIDs con guiones; los temp son timestamps sin guiones
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMsg;
            return updated;
          }
          // Si no hay temp, es un mensaje de otro usuario → agregar normalmente
          const alreadyExists = prev.some(m => m.id === newMsg.id);
          if (alreadyExists) return prev;
          return [...prev, newMsg];
        });
        localStorage.setItem(`chat_read_${partido!.id}`, new Date().toISOString());
        window.dispatchEvent(new Event('chat_read_updated'));
        
        // Si no tenemos el perfil, lo buscamos
        if (!perfiles[newMsg.emisor_telefono]) {
          const { data } = await supabase.from('perfiles').select('*').eq('telefono', newMsg.emisor_telefono).single();
          if (data) {
            setPerfiles(prev => ({...prev, [data.telefono]: data}));
          }
        }
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'mensajes_partido',
        filter: `partido_id=eq.${partido.id}`
      }, (payload) => {
        if (payload.old?.id) {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, partido?.id]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !partido?.id || !profile?.telefono) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempMsg: Message = {
      id: Date.now().toString(),
      partido_id: partido.id,
      emisor_telefono: profile.telefono,
      contenido: msgText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    // Agregamos nuestro propio perfil si no está
    if (!perfiles[profile.telefono]) {
      setPerfiles(prev => ({...prev, [profile.telefono]: profile}));
    }

    await supabase.from('mensajes_partido').insert({
      partido_id: partido.id,
      emisor_telefono: profile.telefono,
      contenido: msgText
    });
  };

  const handleDeleteMessage = async (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await supabase.from('mensajes_partido').delete().eq('id', msgId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end sm:justify-center items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-32 left-6 md:bottom-24 md:left-8 w-[90vw] md:w-[350px] h-[500px] max-h-[80vh] bg-[#1a2235] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a2235] text-white p-4 flex justify-between items-center border-b border-[var(--border)] z-10">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-2 rounded-full text-green-400">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase italic">Chat del Partido</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{partido?.hora} hs • {partido?.fecha}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1423] custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-2">
                  <MessageCircle size={40} className="text-zinc-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-[200px]">
                    Sé el primero en escribir en este partido
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.emisor_telefono === profile?.telefono;
                  const sender = perfiles[msg.emisor_telefono];
                  const senderName = sender ? sender.nombre : 'Jugador';
                  
                  // Agrupar mensajes del mismo usuario
                  const showHeader = i === 0 || messages[i-1].emisor_telefono !== msg.emisor_telefono;

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                      {showHeader && !isMe && (
                        <span className="text-[10px] font-bold text-zinc-500 ml-2 mb-1 uppercase tracking-wider">
                          {senderName}
                        </span>
                      )}
                      <div className="flex items-center gap-2 max-w-[85%]">
                        {!isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-full shrink-0 cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-green-500 text-black rounded-tr-sm shadow-[0_4px_15px_rgba(34,197,94,0.2)]' 
                            : 'bg-[#1a2235] border border-[var(--border)] text-gray-200 rounded-tl-sm'
                        }`}>
                          <p style={{ wordBreak: 'break-word' }} className={isMe ? 'font-medium' : ''}>{msg.contenido}</p>
                        </div>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-full shrink-0 cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-600 mt-1 font-bold">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#1a2235] border-t border-[var(--border)] z-10">
              <form onSubmit={handleSend} className="flex gap-2 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mensaje al grupo..."
                  className="flex-1 bg-[#0f1423] text-sm text-white placeholder-zinc-500 border border-[var(--border)] rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-green-500 text-black rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-green-400 transition-all shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
