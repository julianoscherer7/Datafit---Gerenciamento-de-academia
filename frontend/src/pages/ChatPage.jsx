import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Search, MoreVertical, Phone, Video,
  Smile, Paperclip, Pin, Reply, Hash, Users, Plus, ChevronDown,
  Dumbbell, User, Circle, X, UserPlus
} from 'lucide-react';
import { socialService, amigosService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Avatar = ({ nome, size = 'md', online = false }) => {
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];
  const colorIdx = (nome || '').charCodeAt(0) % colors.length;
  
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-semibold`}>
        {initials}
      </div>
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#0c0f1a' }} />
      )}
    </div>
  );
};

// ===== Conversation List (left) =====
const ConversationList = ({ conversations, selected, onSelect, onNewChat, searchTerm, onSearchChange }) => (
  <div className="h-full flex flex-col" style={{ borderRight: '1px solid rgba(148,163,184,0.06)' }}>
    <div className="p-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Mensagens</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNewChat}
          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar conversa..."
          className="w-full pl-9 pr-3 py-2 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {conversations.length === 0 ? (
        <div className="text-center py-12 px-4">
          <MessageCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma conversa ainda</p>
          <p className="text-xs text-slate-600 mt-1">Comece uma conversa com seus amigos</p>
        </div>
      ) : conversations.map((conv, i) => (
        <motion.button
          key={conv.id || i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          onClick={() => onSelect(conv)}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
            selected?.id === conv.id
              ? 'bg-indigo-500/8 border-l-2 border-indigo-500'
              : 'hover:bg-slate-800/30 border-l-2 border-transparent'
          }`}
        >
          <Avatar nome={conv.nome || conv.participante_nome || conv.name} online={conv.online} />
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${selected?.id === conv.id ? 'text-white' : 'text-slate-300'}`}>
                {conv.nome || conv.participante_nome || conv.name || 'Conversa'}
              </span>
              {conv.ultima_mensagem_data && (
                <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">
                  {(() => {
                    const d = new Date(conv.ultima_mensagem_data);
                    const now = new Date();
                    const diffH = Math.floor((now - d) / (1000*60*60));
                    if (diffH < 1) return 'Agora';
                    if (diffH < 24) return `${diffH}h`;
                    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  })()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[11px] text-slate-500 truncate">{conv.ultima_mensagem || conv.last_message || ''}</p>
              {(conv.nao_lidas || conv.unread_count > 0) && (
                <span className="ml-2 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-indigo-500 text-[9px] text-white font-bold flex-shrink-0">
                  {conv.nao_lidas || conv.unread_count}
                </span>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

// ===== Chat Panel (right) =====
const ChatPanel = ({ conversation, messages, onSendMessage, loading }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center px-8">
          <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">Suas Mensagens</h3>
          <p className="text-sm text-slate-500">Selecione uma conversa ou inicie uma nova</p>
        </div>
      </div>
    );
  }

  const convName = conversation.nome || conversation.participante_nome || conversation.name || 'Chat';

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="flex items-center gap-3">
          <Avatar nome={convName} online={conversation.online} />
          <div>
            <h3 className="text-sm font-semibold text-white">{convName}</h3>
            <p className="text-[11px] text-slate-500">
              {conversation.online ? 'Online' : conversation.tipo === 'coach' ? 'Coach' : conversation.tipo === 'aluno' ? 'Aluno' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-colors">
            <Pin className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-56'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">Nenhuma mensagem ainda. Diga oi!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMe = (msg.remetente_id || msg.sender_id) === user?.id;
              const showAvatar = i === 0 || (messages[i - 1]?.remetente_id || messages[i - 1]?.sender_id) !== (msg.remetente_id || msg.sender_id);
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {showAvatar && !isMe ? (
                    <Avatar nome={msg.remetente_nome || convName} size="sm" />
                  ) : <div className="w-7" />}
                  <div className={`max-w-[70%] group`}>
                    {showAvatar && !isMe && (
                      <div className="text-[10px] text-slate-500 mb-1 ml-1">
                        {msg.remetente_nome || convName}
                      </div>
                    )}
                    <div className={`relative px-3.5 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-indigo-500 text-white rounded-br-md'
                        : 'bg-slate-800/60 text-slate-200 border border-slate-700/20 rounded-bl-md'
                    }`}>
                      {msg.conteudo || msg.content || msg.mensagem || ''}
                      
                      {/* Shared workout */}
                      {msg.treino_compartilhado && (
                        <div className={`mt-2 p-2 rounded-lg ${isMe ? 'bg-indigo-600/30' : 'bg-slate-700/30'} flex items-center gap-2`}>
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{msg.treino_compartilhado.nome}</span>
                        </div>
                      )}
                    </div>
                    <div className={`text-[9px] text-slate-600 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                      {msg.data_envio || msg.created_at
                        ? new Date(msg.data_envio || msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input Area */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
          <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-30 hover:bg-indigo-400 transition-colors">
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN PAGE =====
export const ChatPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [amigos, setAmigos] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');

  useEffect(() => { fetchConversations(); fetchAmigos(); }, []);

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv);
  }, [selectedConv?.participante_id || selectedConv?.id]);

  const fetchAmigos = async () => {
    try {
      const [amigosRes, sugestoesRes] = await Promise.allSettled([
        socialService.getAmigos ? socialService.getAmigos() : Promise.resolve({ data: [] }),
        amigosService.getSugestoes()
      ]);
      if (amigosRes.status === 'fulfilled') setAmigos(amigosRes.value.data || []);
      if (sugestoesRes.status === 'fulfilled') setSugestoes(sugestoesRes.value.data || []);
    } catch {}
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await socialService.getConversas();
      const raw = res.data || [];
      // Map backend ConversaResponse fields to what the UI expects
      const data = raw.map(c => ({
        id: c.amigo_id || c.id,
        participante_id: c.amigo_id || c.id,
        nome: c.amigo_nome || c.nome || 'Conversa',
        tipo: c.tipo || 'amigo',
        online: false,
        ultima_mensagem: c.ultima_mensagem || '',
        nao_lidas: c.nao_lidas || 0,
        ultima_mensagem_data: c.ultima_data || c.ultima_mensagem_data || null,
      }));
      setConversations(data);
      if (!selectedConv && data.length > 0) setSelectedConv(data[0]);
    } catch (err) {
      // Demo conversations fallback
      const demo = [
        { id: 1, nome: 'Coach Ricardo', tipo: 'coach', online: true, ultima_mensagem: 'Seu treino de pernas esta otimo!', nao_lidas: 2, ultima_mensagem_data: new Date().toISOString() },
        { id: 2, nome: 'Ana Fitness', tipo: 'amigo', online: true, ultima_mensagem: 'Vamos treinar amanha?', nao_lidas: 0, ultima_mensagem_data: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, nome: 'Pedro Strong', tipo: 'amigo', online: false, ultima_mensagem: 'Obrigado pela dica!', nao_lidas: 0, ultima_mensagem_data: new Date(Date.now() - 86400000).toISOString() }
      ];
      setConversations(demo);
      setSelectedConv(demo[0]);
    }
    finally { setLoading(false); }
  };

  const startNewChat = (friend) => {
    // Check if conversation already exists
    const existingConv = conversations.find(c => c.participante_id === friend.id || c.id === friend.id);
    if (existingConv) {
      setSelectedConv(existingConv);
    } else {
      // Create new conversation
      const newConv = {
        id: friend.id,
        participante_id: friend.id,
        nome: friend.nome,
        online: false,
        ultima_mensagem: '',
        nao_lidas: 0,
        ultima_mensagem_data: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConv(newConv);
    }
    setShowNewChatModal(false);
    setFriendSearchTerm('');
  };

  const filteredAmigos = amigos.filter(a => 
    !friendSearchTerm || (a.nome || '').toLowerCase().includes(friendSearchTerm.toLowerCase())
  );

  const fetchMessages = async (conv) => {
    setMsgLoading(true);
    try {
      const convId = conv.participante_id || conv.id;
      const res = await socialService.getMensagens(convId);
      const raw = res.data || [];
      // Map backend MensagemResponse to what the UI expects
      const mapped = raw.map(m => ({
        id: m.id,
        conteudo: m.conteudo || m.content || '',
        remetente_id: m.remetente_id || m.sender_id,
        remetente_nome: m.remetente_id === user?.id ? (user?.nome || 'Eu') : (conv.nome || 'Contato'),
        data_envio: m.criado_em || m.data_envio || m.created_at,
      }));
      setMessages(mapped);
    } catch (err) {
      // Demo messages
      setMessages([
        { id: 1, conteudo: 'E ai, como foi o treino?', remetente_id: conv.id, remetente_nome: conv.nome, data_envio: new Date(Date.now()-3600000).toISOString() },
        { id: 2, conteudo: 'Foi otimo! Consegui aumentar a carga no supino', remetente_id: user?.id, data_envio: new Date(Date.now()-1800000).toISOString() },
        { id: 3, conteudo: 'Parabens! Continue assim!', remetente_id: conv.id, remetente_nome: conv.nome, data_envio: new Date().toISOString() }
      ]);
    }
    finally { setMsgLoading(false); }
  };

  const handleSendMessage = async (content) => {
    const newMsg = {
      id: Date.now(),
      conteudo: content,
      remetente_id: user?.id,
      remetente_nome: user?.nome || 'Eu',
      data_envio: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      const destId = selectedConv.participante_id || selectedConv.id;
      await socialService.enviarMensagem(destId, { conteudo: content });
    } catch (err) { /* keep optimistic */ }
  };

  const filteredConvs = conversations.filter(c => 
    !searchTerm || (c.nome || c.participante_nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-var(--header-height,64px)-80px)] rounded-2xl overflow-hidden"
      style={{ background: 'rgba(26,31,46,0.4)', border: '1px solid rgba(148,163,184,0.06)' }}>
      <div className="grid grid-cols-1 md:grid-cols-12 h-full">
        {/* Conversation List */}
        <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
          <ConversationList
            conversations={filteredConvs}
            selected={selectedConv}
            onSelect={setSelectedConv}
            onNewChat={() => setShowNewChatModal(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        {/* Chat Area */}
        <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden">
          <ChatPanel
            conversation={selectedConv}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={msgLoading}
          />
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: '#0c0f1a', border: '1px solid rgba(148,163,184,0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Nova Conversa</h3>
                <button onClick={() => setShowNewChatModal(false)} 
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  value={friendSearchTerm} 
                  onChange={e => setFriendSearchTerm(e.target.value)}
                  placeholder="Buscar amigos..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" 
                />
              </div>

              {/* Friends List */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredAmigos.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Nenhum amigo encontrado</p>
                    <button 
                      onClick={() => { setShowNewChatModal(false); onNavigate && onNavigate('amigos'); }}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1 mx-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Adicionar amigos
                    </button>
                  </div>
                ) : filteredAmigos.map(amigo => (
                  <button
                    key={amigo.id}
                    onClick={() => startNewChat(amigo)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-all text-left"
                  >
                    <Avatar nome={amigo.nome} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{amigo.nome}</div>
                      {amigo.nickname && <div className="text-[11px] text-slate-500">@{amigo.nickname}</div>}
                    </div>
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              {sugestoes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <div className="text-xs text-slate-500 mb-2">Sugestões de amigos</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {sugestoes.slice(0, 4).map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setShowNewChatModal(false); onNavigate && onNavigate('amigos'); }}
                        className="flex-shrink-0 flex flex-col items-center p-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all"
                      >
                        <Avatar nome={s.nome} size="sm" />
                        <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[60px]">{s.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
