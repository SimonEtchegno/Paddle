"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, MessageCircle, MessageSquareText, X, Send, ArrowLeft, CheckCheck, Users, Bot, Trash2, Search } from "lucide-react";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { supabase } from "@/lib/supabase";
import { Chatbot } from "@/components/Chatbot";
import { useSport } from "@/hooks/useSport";
import { toast } from "react-hot-toast";

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

export function SocialChatWidget() {
  const { profile } = useGuestProfile();
  const { sport } = useSport();
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
  const [showRequestsOnly, setShowRequestsOnly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMessagesRef = useRef<Message[]>([]);
  const rawPerfilesRef = useRef<any[]>([]);
  const isOpenRef = useRef(false);
  const activeChatRef = useRef<string | null>(null);

  useEffect(() => { allMessagesRef.current = allMessages; }, [allMessages]);
  useEffect(() => { rawPerfilesRef.current = rawPerfiles; }, [rawPerfiles]);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

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
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });

          // Notificación premium en tiempo real si el mensaje lo recibimos nosotros
          if (newMsg.receptor_telefono === profile.telefono) {
            const isMensajesPage = typeof window !== 'undefined' && window.location.pathname === '/mensajes';
            if (isMensajesPage) return;

            const existingMsgs = allMessagesRef.current.filter(m => m.emisor_telefono === newMsg.emisor_telefono || m.receptor_telefono === newMsg.emisor_telefono);
            const myMsgs = existingMsgs.filter(m => m.emisor_telefono === profile.telefono);
            const isRequest = myMsgs.length === 0;

            if (isRequest && newMsg.contenido !== '__CHAT_ACCEPTED__') {
              const senderProfile = rawPerfilesRef.current.find(p => p.telefono === newMsg.emisor_telefono);
              const senderName = senderProfile ? `${senderProfile.nombre} ${senderProfile.apellido || ''}`.trim() : newMsg.emisor_telefono;
              toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-[#1a2235] shadow-lg rounded-2xl pointer-events-auto flex border border-green-500/20 p-4 cursor-pointer`}
                  onClick={() => {
                    setIsOpen(true);
                    setActiveTab('private');
                    setShowRequestsOnly(true);
                    toast.dismiss(t.id);
                  }}
                >
                  <div className="flex-1 w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-green-400 font-sans">Nueva solicitud de mensaje</p>
                    <p className="text-sm font-bold text-white mt-1 font-sans">{senderName}</p>
                    <p className="text-xs text-zinc-400 mt-1 truncate font-sans">{newMsg.contenido}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.dismiss(t.id);
                    }}
                    className="ml-4 shrink-0 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ), { duration: 5000 });
            } else if (!isRequest && newMsg.contenido !== '__CHAT_ACCEPTED__' && (!isOpenRef.current || activeChatRef.current !== newMsg.emisor_telefono)) {
              const senderProfile = rawPerfilesRef.current.find(p => p.telefono === newMsg.emisor_telefono);
              const senderName = senderProfile ? `${senderProfile.nombre} ${senderProfile.apellido || ''}`.trim() : newMsg.emisor_telefono;
              toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-[#1a2235] shadow-lg rounded-2xl pointer-events-auto flex border border-white/10 p-4 cursor-pointer`}
                  onClick={() => {
                    setIsOpen(true);
                    setActiveTab('private');
                    setActiveChat(newMsg.emisor_telefono);
                    toast.dismiss(t.id);
                  }}
                >
                  <div className="flex-1 w-0">
                    <p className="text-xs font-bold text-[var(--primary)] font-sans">Nuevo mensaje de {senderName}</p>
                    <p className="text-xs text-zinc-300 mt-1 truncate font-sans">{newMsg.contenido}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.dismiss(t.id);
                    }}
                    className="ml-4 shrink-0 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ), { duration: 4000 });
            }
          }
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
        const newMsg = payload.new;
        setMensajesGrupos(prev => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
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
    activo: true
  }));

  const inactiveContactsList = inactivePartners.map(tel => ({
    telefono: tel,
    nombre: "Usuario Dado de Baja",
    apellido: `(...${tel.slice(-4)})`,
    avatar_url: `https://ui-avatars.com/api/?name=U+B&background=71717a&color=fff`,
    activo: false
  }));

  const combinedPerfiles = [...activeContactsList, ...inactiveContactsList];

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
      lastMessage: lastMsgText,
      time: lastMsg ? formatMessageTime(lastMsg.created_at) : undefined,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
      type: 'private',
      isRequest,
      isPending,
      activo: p.activo
    };
  });

  const groupContacts: Contact[] = misPartidos
    .filter(p => p.deporte === (sport || 'padel'))
    .map(p => {
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
      time: lastMsg ? formatMessageTime(lastMsg.created_at) : p.fecha,
      unread,
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(p.created_at).getTime(),
      type: 'group',
      matchData: p
    };
  });

  const privateChats = contacts.filter(c => !c.isRequest && c.lastMsgTime > 0).sort((a, b) => b.lastMsgTime - a.lastMsgTime);
  const requestChats = contacts.filter(c => c.isRequest).sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  const displayedPrivateChats = searchQuery.trim() !== ''
    ? contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => b.lastMsgTime - a.lastMsgTime)
    : (showRequestsOnly ? requestChats : privateChats);

  const allContacts = [...contacts, ...groupContacts].sort((a, b) => b.lastMsgTime - a.lastMsgTime);

  const activeContact = allContacts.find(c => c.id === activeChat);
  const activeMessages = allMessages.filter(m => m.emisor_telefono === activeChat || m.receptor_telefono === activeChat);
  const isGroupChat = activeContact?.type === 'group' && groupMatch;
  const displayedMessages = isGroupChat ? mensajesGrupos.filter(m => m.partido_id === groupMatch.id) : activeMessages;
  const requestUnread = requestChats.reduce((acc, c) => acc + c.unread, 0);
  const privateUnread = privateChats.reduce((acc, c) => acc + c.unread, 0);
  const groupUnread = groupContacts.reduce((acc, c) => acc + c.unread, 0);
  const totalUnread = privateUnread + groupUnread + requestChats.length;

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

  const handleClearChat = async () => {
    if (!profile?.telefono || !activeChat) return;
    await handleClearChatWith(activeChat);
  };

  const handleClearChatWith = async (partnerPhone: string) => {
    if (!profile?.telefono || !partnerPhone) return;
    try {
      setAllMessages(prev => prev.filter(m => 
        !(m.emisor_telefono === profile.telefono && m.receptor_telefono === partnerPhone) &&
        !(m.emisor_telefono === partnerPhone && m.receptor_telefono === profile.telefono)
      ));
      await Promise.all([
        supabase.from('mensajes').delete().eq('emisor_telefono', profile.telefono).eq('receptor_telefono', partnerPhone),
        supabase.from('mensajes').delete().eq('emisor_telefono', partnerPhone).eq('receptor_telefono', profile.telefono)
      ]);
    } catch (e) {
      console.error("Error clearing chat", e);
    }
  };

            // Sending messages
            const handleSendMessage = async (e: React.FormEvent) => {
              e.preventDefault();
              if (!newMessage.trim() || !profile?.telefono) return;
              const msgText = newMessage.trim();
              setNewMessage("");

              if (activeContact?.type === 'group' && groupMatch) {
                // Group chat
                await supabase.from('mensajes_partido').insert({
                  partido_id: groupMatch.id,
                  emisor_telefono: profile.telefono,
                  contenido: msgText
                });
              } else {
                // Private chat
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
                  onClick={() => { setActiveTab('ai'); setActiveChat(null); setGroupMatch(null); setShowRequestsOnly(false); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">IA</span>
                </button>
                <button
                  onClick={() => { setActiveTab('private'); setActiveChat(null); setGroupMatch(null); setShowRequestsOnly(false); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors relative ${activeTab === 'private' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">Privado</span>
                  {(privateUnread > 0 || requestChats.length > 0) && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                      {privateUnread + requestChats.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('group'); setActiveChat(null); setGroupMatch(null); setShowRequestsOnly(false); }}
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
                <div className="flex items-center gap-1.5">
                  {!isGroupChat && (
                    <button
                      onClick={async () => {
                        if (confirm("¿Eliminar esta conversación?")) {
                          await handleClearChat();
                          setActiveChat(null);
                        }
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors text-zinc-400 hover:text-red-400 cursor-pointer"
                      title="Eliminar chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => { setActiveChat(null); setGroupMatch(null); }}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
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
                      <div className="p-3 pb-1 shrink-0 bg-[#0f1423] z-10 sticky top-0 space-y-2">
                        {showRequestsOnly && (
                          <button
                            onClick={() => setShowRequestsOnly(false)}
                            className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-bold hover:underline mb-1"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Volver a chats
                          </button>
                        )}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Buscar jugador..."
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              if (e.target.value.trim() !== '') {
                                setShowRequestsOnly(false);
                              }
                            }}
                            className="w-full bg-[#1a2235] text-sm text-white placeholder-zinc-500 border border-[var(--border)] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pt-0">
                        {/* Solicitudes de mensaje banner */}
                        {!showRequestsOnly && searchQuery.trim() === '' && requestChats.length > 0 && (
                          <div
                            onClick={() => setShowRequestsOnly(true)}
                            className="flex items-center justify-between p-3 mb-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-xl cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquareText className="w-4 h-4 text-[var(--primary)]" />
                              <span className="text-xs font-black text-white uppercase tracking-wider">Solicitudes de mensaje</span>
                            </div>
                            <span className="min-w-[18px] h-[18px] px-1 bg-[var(--primary)] text-black text-[10px] font-black flex items-center justify-center rounded-full">
                              {requestChats.length}
                            </span>
                          </div>
                        )}

                        {showRequestsOnly && (
                          <div className="px-3 py-1 mb-2">
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Solicitudes Pendientes</span>
                          </div>
                        )}

                        {displayedPrivateChats.length > 0 ? (
                          displayedPrivateChats.map(c => (
                            <div
                              key={c.id}
                              onClick={() => setActiveChat(c.id)}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group relative"
                            >
                              <div className="relative shrink-0">
                                <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                {c.unread > 0 && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                                    {c.unread}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                                    {c.name}
                                    {c.isPending && (
                                      <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded">Pendiente</span>
                                    )}
                                  </h4>
                                  {c.time && <span className="text-[10px] text-zinc-500 group-hover:opacity-0 transition-opacity">{c.time}</span>}
                                </div>
                                <p className="text-xs text-zinc-400 truncate">
                                  {c.isPending ? 'Pendiente de aceptación' : (c.lastMessage || 'Toca para iniciar chat')}
                                </p>
                              </div>
                              
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm(`¿Eliminar conversación con ${c.name}?`)) {
                                    await handleClearChatWith(c.id);
                                    if (activeChat === c.id) {
                                      setActiveChat(null);
                                    }
                                  }
                                }}
                                className="absolute right-[6px] top-1/2 -translate-y-1/2 p-1.5 opacity-40 md:opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all z-10 cursor-pointer"
                                title="Eliminar chat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50 space-y-2">
                            <MessageSquare className="w-10 h-10 text-zinc-500" />
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                              {showRequestsOnly ? 'No hay solicitudes' : 'No se encontraron jugadores'}
                            </p>
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
                          if (msg.contenido === '__CHAT_ACCEPTED__') {
                            return (
                              <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700/50 uppercase tracking-wider font-bold">
                                  Solicitud aceptada
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                              {isGroupChat && !isMe && (
                                <span className="text-[10px] font-bold text-zinc-500 ml-2 mb-1 uppercase tracking-wider">
                                  {msg.emisor_telefono}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 max-w-[85%]">
                                {!isMe && (
                                  <button 
                                    onClick={() => handleDeleteMessage(msg.id, !!isGroupChat)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-red-500 hover:bg-white/5 rounded-full shrink-0 cursor-pointer"
                                    title="Eliminar mensaje"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <div className={`px-3 py-2 rounded-2xl text-sm ${
                                  isMe 
                                    ? 'bg-blue-500 text-white rounded-tr-sm' 
                                    : 'bg-[#1a2235] border border-[var(--border)] text-gray-200 rounded-tl-sm'
                                }`}>
                                  <p style={{ wordBreak: 'break-word' }} className={isMe ? 'font-medium' : ''}>{msg.contenido}</p>
                                </div>
                                {isMe && (
                                  <button 
                                    onClick={() => handleDeleteMessage(msg.id, !!isGroupChat)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-red-500 hover:bg-white/5 rounded-full shrink-0 cursor-pointer"
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
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      {activeContact?.isRequest ? (
                        <div className="p-4 bg-[#1a2235] border-t border-[var(--border)] text-center space-y-3 z-10 shrink-0">
                          <p className="text-xs text-zinc-300">¿Quieres chatear con {activeContact.name}?</p>
                          <div className="flex gap-2 justify-center">
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
                              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
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
                              className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-black rounded-xl transition-all cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ) : activeContact?.activo === false ? (
                        <div className="p-4 bg-[#1a2235]/40 border-t border-[var(--border)] text-center text-[10px] text-zinc-500 font-black uppercase tracking-wider select-none shrink-0">
                          Usuario dado de baja
                        </div>
                      ) : (
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
                      )}
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
