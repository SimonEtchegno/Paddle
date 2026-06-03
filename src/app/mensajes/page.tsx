"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, Send, CheckCheck, MoreVertical, Paperclip, Smile, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useGuestProfile } from '@/hooks/useGuestProfile';

interface Message {
  id: string;
  emisor_telefono: string;
  receptor_telefono: string;
  contenido: string;
  created_at: string;
  leido: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  level: string;
  lastMessage?: string;
  time?: string;
  unread: number;
  lastMsgTime: number;
}

export default function MensajesPage() {
  const { profile, loading } = useGuestProfile();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [rawPerfiles, setRawPerfiles] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar datos
  useEffect(() => {
    if (!profile?.telefono) return;

    const loadData = async () => {
      const [resPerfiles, resMensajes] = await Promise.all([
        supabase.from('perfiles').select('*').neq('telefono', profile.telefono),
        supabase.from('mensajes').select('*')
          .or(`emisor_telefono.eq.${profile.telefono},receptor_telefono.eq.${profile.telefono}`)
          .order('created_at', { ascending: true })
      ]);

      if (resPerfiles.data) setRawPerfiles(resPerfiles.data);
      if (resMensajes.data) setAllMessages(resMensajes.data);
    };

    loadData();

    // Suscripción en tiempo real (AJAX/WebSockets automáticos)
    const channel = supabase.channel('mensajes_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, (payload) => {
        const newMsg = payload.new as Message;
        // Solo nos importan los mensajes donde somos emisor o receptor
        if (newMsg.emisor_telefono === profile.telefono || newMsg.receptor_telefono === profile.telefono) {
          setAllMessages(prev => {
            // Evitar duplicados por la UI optimista
            const exists = prev.find(m => 
              m.id === newMsg.id || 
              (m.emisor_telefono === newMsg.emisor_telefono && m.contenido === newMsg.contenido && Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 3000)
            );
            if (exists) {
              return prev.map(m => m.contenido === newMsg.contenido ? newMsg : m);
            }
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.telefono]);

  // Procesar contactos basados en los perfiles y mensajes
  const contacts: Contact[] = rawPerfiles.map(p => {
    const msgs = allMessages.filter(m => m.emisor_telefono === p.telefono || m.receptor_telefono === p.telefono);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const unread = msgs.filter(m => m.receptor_telefono === profile?.telefono && !m.leido).length;
    
    return {
      id: p.telefono,
      name: `${p.nombre} ${p.apellido || ''}`.trim(),
      avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.nombre}+${p.apellido}&background=random&color=fff`,
      level: p.categoria || "Sin categoría",
      lastMessage: lastMsg?.contenido,
      time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
    };
  }).sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  const activeContact = contacts.find(c => c.id === activeChat);
  const activeMessages = allMessages.filter(m => m.emisor_telefono === activeChat || m.receptor_telefono === activeChat);

  // Scroll automático al final de la conversación
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Marcar como leídos al entrar al chat
  useEffect(() => {
    if (activeChat && profile?.telefono) {
      const unreadMsgs = activeMessages.filter(m => m.receptor_telefono === profile.telefono && !m.leido);
      if (unreadMsgs.length > 0) {
        supabase.from('mensajes')
          .update({ leido: true })
          .in('id', unreadMsgs.map(m => m.id))
          .then(() => {
            setAllMessages(prev => prev.map(m => 
              (m.receptor_telefono === profile.telefono && m.emisor_telefono === activeChat) ? { ...m, leido: true } : m
            ));
          });
      }
    }
  }, [activeChat, activeMessages, profile?.telefono]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !profile?.telefono) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    // UI Optimista
    const tempMsg: Message = {
      id: Date.now().toString(),
      emisor_telefono: profile.telefono,
      receptor_telefono: activeChat,
      contenido: msgText,
      created_at: new Date().toISOString(),
      leido: false
    };
    setAllMessages(prev => [...prev, tempMsg]);

    // DB Insert
    await supabase.from('mensajes').insert({
      emisor_telefono: profile.telefono,
      receptor_telefono: activeChat,
      contenido: msgText
    });
  };

  if (loading) return null;

  if (!profile?.telefono) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center">
        <MessageSquare className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sección de Mensajes</h2>
        <p className="text-zinc-400">Por favor, inicia sesión o completa tu perfil con un número de teléfono para usar la red social.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] max-h-[900px] w-full max-w-6xl mx-auto mt-4 rounded-3xl overflow-hidden border border-zinc-800 bg-black shadow-2xl relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* SIDEBAR (Lista de chats) */}
      <div className={`w-full md:w-[380px] flex flex-col border-r border-zinc-800/60 bg-zinc-950/50 backdrop-blur-xl z-10 ${activeChat !== null ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-zinc-800/60">
          <h1 className="text-2xl font-bold text-white mb-6">Comunidad</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar jugadores..." 
              className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveChat(contact.id)}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${activeChat === contact.id ? 'bg-zinc-800/80 shadow-lg' : 'hover:bg-zinc-900/50'}`}
            >
              <div className="relative">
                <img src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full object-cover border border-zinc-700" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                  <span className={`text-xs ${contact.unread > 0 ? 'text-green-400 font-medium' : 'text-zinc-500'}`}>
                    {contact.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-zinc-400 text-sm truncate pr-2">{contact.lastMessage || 'Toca para iniciar el chat'}</p>
                  {contact.unread > 0 && (
                    <span className="bg-green-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-zinc-950/80 backdrop-blur-xl z-10 ${activeChat === null ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && activeContact ? (
          <>
            {/* CHAT HEADER */}
            <div className="h-20 px-6 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <img src={activeContact.avatar} alt={activeContact.name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                <div>
                  <h2 className="text-white font-bold text-lg">{activeContact.name}</h2>
                  <p className="text-green-400 text-sm font-medium">{activeContact.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/noise.png')] bg-repeat opacity-90">
              <AnimatePresence>
                {activeMessages.map((msg) => {
                  const isMe = msg.emisor_telefono === profile?.telefono;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl relative group shadow-sm ${
                        isMe 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-black rounded-br-sm' 
                          : 'bg-zinc-800/80 text-white rounded-bl-sm border border-zinc-700/50'
                      }`}>
                        <p className="text-[15px] leading-relaxed">{msg.contenido}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-zinc-500 font-medium">{timeStr}</span>
                        {isMe && <CheckCheck className={`w-4 h-4 ${msg.leido ? 'text-blue-500' : 'text-zinc-500'}`} />}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-5 border-t border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <button type="button" className="p-3 text-zinc-400 hover:text-green-400 hover:bg-zinc-800 rounded-xl transition-all">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..." 
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-3.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-zinc-500"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-green-400 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-3.5 bg-green-500 text-black rounded-2xl hover:bg-green-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 hidden md:flex">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <Send className="w-10 h-10 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-zinc-300 mb-2">Tus Mensajes</h3>
            <p className="text-center max-w-md">Selecciona un jugador para empezar a hablar, buscar suplentes para tu partido o coordinar torneos.</p>
          </div>
        )}
      </div>

    </div>
  );
}
