"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, Send, CheckCheck, MoreVertical, Paperclip, Smile, ArrowLeft, MessageSquare, Trash2 } from 'lucide-react';
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
  isRequest?: boolean;
  isPending?: boolean;
  activo?: boolean;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }
}

export default function MensajesPage() {
  const { profile, loading } = useGuestProfile();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [rawPerfiles, setRawPerfiles] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestsOnly, setShowRequestsOnly] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mensajes' }, (payload) => {
        if (payload.old?.id) {
          setAllMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.telefono]);

  // Obtener teléfonos de personas con las que tenemos mensajes
  const partnersWithMessages = Array.from(new Set(
    allMessages.map(m => m.emisor_telefono === profile?.telefono ? m.receptor_telefono : m.emisor_telefono)
  )).filter(tel => tel && tel !== profile?.telefono);

  // Identificar cuáles de esos teléfonos no existen en perfiles activos
  const inactivePartners = partnersWithMessages.filter(tel => !rawPerfiles.some(p => p.telefono === tel));

  const activeContactsList = rawPerfiles.map(p => ({
    telefono: p.telefono,
    nombre: p.nombre,
    apellido: p.apellido,
    avatar_url: p.avatar_url,
    categoria: p.categoria,
    activo: true
  }));

  const inactiveContactsList = inactivePartners.map(tel => ({
    telefono: tel,
    nombre: "Usuario Dado de Baja",
    apellido: `(...${tel.slice(-4)})`,
    avatar_url: `https://ui-avatars.com/api/?name=U+B&background=71717a&color=fff`,
    categoria: "Inactivo",
    activo: false
  }));

  const combinedPerfiles = [...activeContactsList, ...inactiveContactsList];

  // Procesar contactos basados en los perfiles y mensajes
  const contacts: Contact[] = combinedPerfiles.map(p => {
    const msgs = allMessages.filter(m => m.emisor_telefono === p.telefono || m.receptor_telefono === p.telefono);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const unread = msgs.filter(m => m.receptor_telefono === profile?.telefono && !m.leido).length;
    
    const myMsgs = msgs.filter(m => m.emisor_telefono === profile?.telefono);
    const theirMsgs = msgs.filter(m => m.emisor_telefono === p.telefono);
    const isRequest = theirMsgs.length > 0 && myMsgs.length === 0;
    const isPending = myMsgs.length > 0 && theirMsgs.length === 0;

    let lastMsgText = lastMsg?.contenido;
    if (lastMsgText === '__CHAT_ACCEPTED__') {
      lastMsgText = 'Solicitud aceptada';
    }

    return {
      id: p.telefono,
      name: `${p.nombre} ${p.apellido || ''}`.trim(),
      avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.nombre}+${p.apellido}&background=random&color=fff`,
      level: p.categoria || "Sin categoría",
      lastMessage: lastMsgText,
      time: lastMsg ? formatMessageTime(lastMsg.created_at) : undefined,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
      isRequest,
      isPending,
      activo: p.activo
    };
  });

  const privateChats = contacts.filter(c => !c.isRequest && c.lastMsgTime > 0).sort((a, b) => b.lastMsgTime - a.lastMsgTime);
  const requestChats = contacts.filter(c => c.isRequest).sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  const displayedContacts = searchQuery.trim() !== ''
    ? contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => b.lastMsgTime - a.lastMsgTime)
    : (showRequestsOnly ? requestChats : privateChats);

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

    // DB Insert
    await supabase.from('mensajes').insert({
      emisor_telefono: profile.telefono,
      receptor_telefono: activeChat,
      contenido: msgText
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    setAllMessages(prev => prev.filter(m => m.id !== messageId));
    await supabase.from('mensajes').delete().eq('id', messageId);
  };

  const handleClearChat = async () => {
    if (!profile?.telefono || !activeChat) return;
    await handleClearChatWith(activeChat);
  };

  const handleClearChatWith = async (partnerPhone: string) => {
    if (!profile?.telefono || !partnerPhone) return;

    setAllMessages(prev => prev.filter(m => 
      !(m.emisor_telefono === profile.telefono && m.receptor_telefono === partnerPhone) &&
      !(m.emisor_telefono === partnerPhone && m.receptor_telefono === profile.telefono)
    ));

    await Promise.all([
      supabase.from('mensajes').delete().eq('emisor_telefono', profile.telefono).eq('receptor_telefono', partnerPhone),
      supabase.from('mensajes').delete().eq('emisor_telefono', partnerPhone).eq('receptor_telefono', profile.telefono)
    ]);
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== '') {
                  setShowRequestsOnly(false);
                }
              }}
              className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {showRequestsOnly && (
            <button
              onClick={() => setShowRequestsOnly(false)}
              className="flex items-center gap-1.5 text-xs text-green-400 font-bold hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a chats
            </button>
          )}

          {!showRequestsOnly && searchQuery.trim() === '' && requestChats.length > 0 && (
            <div
              onClick={() => setShowRequestsOnly(true)}
              className="flex items-center justify-between p-3 mb-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Solicitudes de mensaje</span>
              </div>
              <span className="min-w-[20px] h-[20px] px-1.5 bg-green-500 text-black text-xs font-black flex items-center justify-center rounded-full">
                {requestChats.length}
              </span>
            </div>
          )}

          {showRequestsOnly && (
            <div className="px-3 py-1 mb-1">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Solicitudes Pendientes</span>
            </div>
          )}

          {displayedContacts.map((contact) => (
            <motion.div
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveChat(contact.id)}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group relative ${activeChat === contact.id ? 'bg-zinc-800/80 shadow-lg' : 'hover:bg-zinc-900/50'}`}
            >
              <div className="relative shrink-0">
                <img src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full object-cover border border-zinc-700" />
                {contact.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-black text-[10px] font-black flex items-center justify-center rounded-full">
                    {contact.unread}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-semibold truncate flex items-center gap-1.5">
                    {contact.name}
                    {contact.isPending && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded">Pendiente</span>
                    )}
                  </h3>
                  <span className={`text-xs group-hover:opacity-0 transition-opacity ${contact.unread > 0 ? 'text-green-400 font-medium' : 'text-zinc-500'}`}>
                    {contact.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-zinc-400 text-sm truncate pr-2">
                    {contact.isPending ? 'Pendiente de aceptación' : (contact.lastMessage || 'Toca para iniciar el chat')}
                  </p>
                </div>
              </div>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`¿Eliminar conversación con ${contact.name}?`)) {
                    await handleClearChatWith(contact.id);
                    if (activeChat === contact.id) {
                      setActiveChat(null);
                    }
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-40 md:opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all z-10 cursor-pointer"
                title="Eliminar chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
              <div className="flex items-center gap-3 relative">
                <button 
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-40">
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setShowClearConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar chat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/noise.png')] bg-repeat opacity-90">
              <AnimatePresence>
                {activeMessages.map((msg) => {
                  const isMe = msg.emisor_telefono === profile?.telefono;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  if (msg.contenido === '__CHAT_ACCEPTED__') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="text-xs bg-zinc-900 text-zinc-500 px-3 py-1 rounded-full border border-zinc-800 uppercase tracking-wider font-bold">
                          Solicitud aceptada
                        </span>
                      </div>
                    );
                  }

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-center gap-2 max-w-[75%]">
                        {!isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-full shrink-0 cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className={`px-5 py-3.5 rounded-2xl relative shadow-sm ${
                          isMe 
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-black rounded-br-sm' 
                            : 'bg-zinc-800/80 text-white rounded-bl-sm border border-zinc-700/50'
                        }`}>
                          <p className="text-[15px] leading-relaxed">{msg.contenido}</p>
                        </div>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-full shrink-0 cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

            {/* MESSAGE INPUT OR ACCEPT/REJECT CARD */}
            {activeContact?.isRequest ? (
              <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 text-center space-y-4 shrink-0">
                <p className="text-sm text-zinc-400">¿Quieres chatear con {activeContact.name}?</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={async () => {
                      if (!profile?.telefono || !activeChat) return;
                      const { data, error } = await supabase.from('mensajes').insert({
                        emisor_telefono: profile.telefono,
                        receptor_telefono: activeChat,
                        contenido: '__CHAT_ACCEPTED__'
                      }).select();
                      if (data && data.length > 0) {
                        setAllMessages(prev => {
                          const exists = prev.some(m => m.id === data[0].id);
                          if (exists) return prev;
                          return [...prev, data[0]];
                        });
                      }
                    }}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={async () => {
                      if (!profile?.telefono || !activeChat) return;
                      setAllMessages(prev => prev.filter(m => 
                        !(m.emisor_telefono === profile.telefono && m.receptor_telefono === activeChat) &&
                        !(m.emisor_telefono === activeChat && m.receptor_telefono === profile.telefono)
                      ));
                      setActiveChat(null);
                      await Promise.all([
                        supabase.from('mensajes').delete().eq('emisor_telefono', profile.telefono).eq('receptor_telefono', activeChat),
                        supabase.from('mensajes').delete().eq('emisor_telefono', activeChat).eq('receptor_telefono', profile.telefono)
                      ]);
                    }}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-black rounded-2xl transition-all cursor-pointer"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : activeContact?.activo === false ? (
              <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 text-center text-xs text-zinc-500 font-black uppercase tracking-widest select-none shrink-0">
                Este usuario ha sido dado de baja. No se pueden enviar mensajes.
              </div>
            ) : (
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
            )}
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

      {/* CONFIRM CLEAR CHAT MODAL */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full relative z-[160] shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar conversación?</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Esto eliminará permanentemente todos los mensajes con <strong>{activeContact?.name}</strong>. Esta acción no se puede deshacer y el chat desaparecerá de tu lista.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-bold rounded-xl transition-all cursor-pointer flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setShowClearConfirm(false);
                    await handleClearChat();
                    setActiveChat(null);
                  }}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all cursor-pointer flex-1"
                >
                  Eliminar Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
