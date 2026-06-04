"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, MessageCircle, MessageSquareText, X, Send, ArrowLeft, CheckCheck, Users, Bot, Trash2, Search } from "lucide-react";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { supabase } from "@/lib/supabase";
import { Chatbot } from "@/components/Chatbot";

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
  lastMessage?: string;
  time?: string;
  unread: number;
  lastMsgTime: number;
  type: 'private' | 'group';
  matchData?: any;
}

export function SocialChatWidget() {
  const { profile } = useGuestProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [rawPerfiles, setRawPerfiles] = useState<any[]>([]);
  const [misPartidos, setMisPartidos] = useState<any[]>([]);
  const [mensajesGrupos, setMensajesGrupos] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupMatch, setGroupMatch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'private' | 'group'>('ai');
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Escuchar evento global para abrir chat de partido desde cualquier página
  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent).detail;
      setGroupMatch(data);
      setActiveChat(data.id ? `match_${data.id}` : null);
    };
    window.addEventListener('open_match_chat', handler);
    return () => window.removeEventListener('open_match_chat', handler);
  }, []);

  // Solo cargar datos si el widget está abierto o si queremos mostrar notificaciones no leídas
  useEffect(() => {
    if (!profile?.telefono) return;

    const loadData = async () => {
      const hoy = new Date().toISOString().split('T')[0];
      const [resPerfiles, resMensajes, resPartidos] = await Promise.all([
        supabase.from('perfiles').select('*').neq('telefono', profile.telefono),
        supabase.from('mensajes').select('*')
          .or(`emisor_telefono.eq.${profile.telefono},receptor_telefono.eq.${profile.telefono}`)
          .order('created_at', { ascending: true }),
        supabase.from('partidos_abiertos').select('*, uniones_partidos(*)')
          .gte('fecha', hoy)
      ]);

      if (resPerfiles.data) setRawPerfiles(resPerfiles.data);
      if (resMensajes.data) setAllMessages(resMensajes.data);
      
      if (resPartidos.data) {
        const misP = resPartidos.data.filter(p => 
          p.contacto_whatsapp === profile.telefono || 
          p.uniones_partidos?.some((u: any) => u.whatsapp_interesado === profile.telefono)
        );
        setMisPartidos(misP);
        
        if (misP.length > 0) {
          try {
            const { data: mData } = await supabase.from('mensajes_partido').select('*').in('partido_id', misP.map(p => p.id));
            if (mData) setMensajesGrupos(mData);
          } catch(e) {}
        }
      }
    };

    loadData();

    const channel = supabase.channel('mensajes_widget')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.emisor_telefono === profile.telefono || newMsg.receptor_telefono === profile.telefono) {
          setAllMessages(prev => {
            const exists = prev.find(m => 
              m.id === newMsg.id || 
              (m.emisor_telefono === newMsg.emisor_telefono && m.contenido === newMsg.contenido && Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 3000)
            );
            if (exists) return prev.map(m => m.contenido === newMsg.contenido ? newMsg : m);
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

    const channelGroup = supabase.channel('mensajes_partido_widget')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_partido' }, (payload) => {
        setMensajesGrupos(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mensajes_partido' }, (payload) => {
        if (payload.old?.id) {
          setMensajesGrupos(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(channelGroup);
    };
  }, [profile?.telefono]);

  const contacts: Contact[] = rawPerfiles.map(p => {
    const msgs = allMessages.filter(m => m.emisor_telefono === p.telefono || m.receptor_telefono === p.telefono);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const unread = msgs.filter(m => m.receptor_telefono === profile?.telefono && !m.leido).length;
    
    return {
      id: p.telefono,
      name: `${p.nombre} ${p.apellido || ''}`.trim(),
      avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.nombre}+${p.apellido}&background=random&color=fff`,
      lastMessage: lastMsg?.contenido,
      time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
      type: 'private'
    };
  });

  const groupContacts: Contact[] = misPartidos.map(p => {
    const msgs = mensajesGrupos.filter(m => m.partido_id === p.id);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    
    let unread = 0;
    const lastRead = localStorage.getItem(`chat_read_${p.id}`);
    if (msgs.length > 0) {
      unread = msgs.filter(m => !lastRead || new Date(m.created_at) > new Date(lastRead)).length;
    }

    return {
      id: `match_${p.id}`,
      name: `Partido ${p.hora}hs`,
      avatar: 'https://ui-avatars.com/api/?name=P&background=22c55e&color=fff',
      lastMessage: lastMsg?.contenido,
      time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : p.fecha,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(p.created_at).getTime(),
      type: 'group',
      matchData: p
    };
  });

  const allContacts = [...contacts, ...groupContacts].sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  const activeContact = allContacts.find(c => c.id === activeChat);
  const activeMessages = allMessages.filter(m => m.emisor_telefono === activeChat || m.receptor_telefono === activeChat);
  const isGroupChat = activeContact?.type === 'group' && groupMatch;
  const displayedMessages = isGroupChat ? mensajesGrupos.filter(m => m.partido_id === groupMatch.id) : activeMessages;
  
  const totalUnread = allContacts.reduce((acc, c) => acc + c.unread, 0);
  const privateUnread = contacts.reduce((acc, c) => acc + c.unread, 0);
  const groupUnread = groupContacts.reduce((acc, c) => acc + c.unread, 0);

  useEffect(() => {
    if (activeChat && profile?.telefono) {
      if (activeContact?.type === 'group' && groupMatch) {
        // Marcar chat grupal como leído localmente
        localStorage.setItem(`chat_read_${groupMatch.id}`, new Date().toISOString());
      } else if (activeContact?.type !== 'group') {
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
    }
  }, [activeChat, activeMessages, mensajesGrupos, profile?.telefono, activeContact, groupMatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeChat && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [displayedMessages, activeChat, isOpen]);

  const handleDeleteMessage = async (msgId: string, isGroupChat: boolean) => {
    try {
      if (isGroupChat) {
        setMensajesGrupos(prev => prev.filter(m => m.id !== msgId));
        await supabase.from('mensajes_partido').delete().eq('id', msgId);
      } else {
        setAllMessages(prev => prev.filter(m => m.id !== msgId));
        await supabase.from('mensajes').delete().eq('id', msgId);
      }
    } catch (e) {
      console.error("Error deleting message", e);
    }
  };

            // Sending messages
            const handleSendMessage = async (e: React.FormEvent) => {
              e.preventDefault();
              if (!newMessage.trim() || !profile?.telefono) return;
              const msgText = newMessage.trim();
              setNewMessage("");
              const tempMsg: any = {
                id: Date.now().toString(),
                emisor_telefono: profile.telefono,
                contenido: msgText,
                created_at: new Date().toISOString(),
                leido: false
              };
              if (activeContact?.type === 'group' && groupMatch) {
                // Group chat
                const groupTemp = { ...tempMsg, partido_id: groupMatch.id };
                setMensajesGrupos(prev => [...prev, groupTemp]);
                await supabase.from('mensajes_partido').insert({
                  partido_id: groupMatch.id,
                  emisor_telefono: profile.telefono,
                  contenido: msgText
                });
              } else {
                // Private chat
                const privateTemp = { ...tempMsg, receptor_telefono: activeChat };
                setAllMessages(prev => [...prev, privateTemp]);
                await supabase.from('mensajes').insert({
                  emisor_telefono: profile.telefono,
                  receptor_telefono: activeChat,
                  contenido: msgText
                });
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
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-[90vw] md:w-[350px] h-[500px] max-h-[80vh] bg-[#1a2235] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a2235] text-white p-3 flex justify-between items-center border-b border-[var(--border)] relative z-20">
              <div className="flex items-center gap-4">
                {/* Tab Buttons */}
                <button
                  onClick={() => { setActiveTab('ai'); setActiveChat(null); setGroupMatch(null); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">IA</span>
                </button>
                <button
                  onClick={() => { setActiveTab('private'); setActiveChat(null); setGroupMatch(null); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors relative ${activeTab === 'private' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">Privado</span>
                  {privateUnread > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                      {privateUnread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('group'); setActiveChat(null); setGroupMatch(null); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors relative ${activeTab === 'group' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">Partidos</span>
                  {groupUnread > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                      {groupUnread}
                    </span>
                  )}
                </button>
              </div>

              {activeChat ? (
                  <button 
                    onClick={() => { setActiveChat(null); setGroupMatch(null); }}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
              ) : (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative bg-[#0f1423]">
              {!profile?.telefono && activeTab !== 'ai' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
                  <h2 className="text-lg font-bold text-white mb-2">Comunidad</h2>
                  <p className="text-zinc-400 text-sm">Debes tener un teléfono registrado en tu Perfil para chatear con otros jugadores.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {/* Content based on selected tab */}
                  {activeTab === 'ai' && (
                    <div className="flex-1 overflow-hidden h-full">
                      <Chatbot />
                    </div>
                  )}

                  {activeTab === 'private' && !activeChat && (
                    <motion.div
                      key="list-private"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -100, opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.2 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      <div className="p-3 pb-1 shrink-0 bg-[#0f1423] z-10 sticky top-0">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Buscar jugador..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a2235] text-sm text-white placeholder-zinc-500 border border-[var(--border)] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pt-0">
                      {allContacts.filter(c => c.type === 'private' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        allContacts.filter(c => c.type === 'private' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                          <div
                            key={c.id}
                            onClick={() => setActiveChat(c.id)}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                          >
                            <div className="relative shrink-0">
                              <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                              {c.unread > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                                  {c.unread}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-white truncate">{c.name}</h4>
                                {c.time && <span className="text-[10px] text-zinc-500">{c.time}</span>}
                              </div>
                              <p className="text-xs text-zinc-400 truncate">{c.lastMessage || 'Toca para iniciar chat'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50 space-y-2">
                          <MessageSquare className="w-10 h-10 text-zinc-500" />
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">No se encontraron jugadores</p>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'group' && !activeChat && (
                    <motion.div
                      key="list-group"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -100, opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.2 }}
                      className="absolute inset-0 overflow-y-auto custom-scrollbar p-2"
                    >
                      {allContacts.filter(c => c.type === 'group').length > 0 ? (
                        allContacts.filter(c => c.type === 'group').map(c => (
                          <div
                            key={c.id}
                            onClick={() => { setGroupMatch(c.matchData); setActiveChat(c.id); }}
                            className="flex items-center gap-3 p-3 hover:bg-green-500/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-green-500/20"
                          >
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-lg">🎾</div>
                              {c.unread > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-black text-[9px] font-black flex items-center justify-center rounded-full">
                                  {c.unread}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-green-400 truncate">{c.name}</h4>
                                {c.time && <span className="text-[10px] text-zinc-500">{c.time}</span>}
                              </div>
                              <p className="text-xs text-zinc-400 truncate">{c.lastMessage || 'Chat grupal del partido'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60 space-y-2">
                          <MessageSquare className="w-10 h-10 text-zinc-500 mb-1" />
                          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sin partidos activos</h4>
                          <p className="text-[11px] text-zinc-500 max-w-[200px] mx-auto leading-normal">Para chatear aquí debes unirte a un partido existente o crear uno nuevo.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Active chat view for Private or Group */}
                  {activeChat && (
                    <motion.div
                      key="active-chat"
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.2 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[url('/noise.png')] bg-repeat opacity-95">
                        {displayedMessages.map((msg) => {
                          const isMe = msg.emisor_telefono === profile?.telefono;
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              {isGroupChat && !isMe && (
                                <span className="text-[10px] font-bold text-zinc-500 ml-2 mb-1 uppercase tracking-wider">
                                  {msg.emisor_telefono}
                                </span>
                              )}
                              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                                isMe 
                                  ? 'bg-blue-500 text-white rounded-tr-sm' 
                                  : 'bg-[#1a2235] border border-[var(--border)] text-gray-200 rounded-tl-sm'
                              }`}>
                                <p style={{ wordBreak: 'break-word' }} className={isMe ? 'font-medium' : ''}>{msg.contenido}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-zinc-600 font-bold">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <button 
                                    onClick={() => handleDeleteMessage(msg.id, !!isGroupChat)}
                                    className="text-zinc-600 hover:text-red-400 transition-colors"
                                    title="Eliminar mensaje"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-3 bg-[#1a2235] border-t border-[var(--border)] z-10">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                          <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mensaje..."
                            className="flex-1 bg-[#0f1423] text-sm text-white placeholder-gray-500 border border-[var(--border)] rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-1 top-1 bottom-1 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-all shrink-0"
                          >
                            <Send className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-btn"
            initial={false}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[var(--primary)] text-[#0a0b0e] rounded-full shadow-lg shadow-[var(--primary)]/40 flex items-center justify-center hover:scale-105 transition-all z-[9999] border-4 border-[#0a0b0e] hover:shadow-[var(--primary)]/60"
          >
            <MessageSquareText className="w-6 h-6 stroke-[2.5]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0a0b0e]">
                {totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* No separate MatchChatModal, group chat handled inline */}
    </>
  );
}
