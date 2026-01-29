import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, User, Search, UserPlus, 
  X, Send, Check, CheckCheck, Clock, Flame, Activity,
  MoreVertical, Phone, Video, Smile, Image as ImageIcon,
  ChevronLeft, Users, Bell, Settings
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common';
import { amigosService } from '../services/amigos.service';
import { chatService } from '../services/social.service';

// ============= SKELETON =============
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// ============= CHAT MODAL =============
const ChatModal = ({ isOpen, onClose, amigo }) => {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && amigo) {
      fetchMensagens();
    }
  }, [isOpen, amigo]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMensagens = async () => {
    try {
      setLoading(true);
      const res = await chatService.getHistorico(amigo.id);
      setMensagens(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!novaMensagem.trim() || sending) return;
    
    try {
      setSending(true);
      await chatService.enviar({
        destinatario_id: amigo.id,
        conteudo: novaMensagem.trim()
      });
      setNovaMensagem('');
      fetchMensagens();
    } catch (err) {
      console.error('Erro ao enviar:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl w-full max-w-lg h-[600px] flex flex-col border border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-slate-700 bg-slate-800/90">
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors md:hidden">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              {amigo?.foto || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{amigo?.nome}</h3>
              <div className="flex items-center gap-2 text-sm">
                {amigo?.online ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="text-slate-400">Offline</span>
                )}
                {amigo?.streak > 0 && (
                  <span className="text-orange-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {amigo.streak}
                  </span>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors hidden md:block">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors hidden md:block">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <Skeleton className={`w-48 h-12 ${i % 2 === 0 ? 'rounded-l-xl rounded-tr-xl' : 'rounded-r-xl rounded-tl-xl'}`} />
                  </div>
                ))}
              </div>
            ) : mensagens.length > 0 ? (
              mensagens.map((msg, i) => {
                const isOwn = msg.remetente_id !== amigo.id;
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                        : 'bg-slate-700 text-white rounded-bl-sm'
                    }`}>
                      <p className="break-words">{msg.conteudo}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-white/60 justify-end' : 'text-slate-400'}`}>
                        <span>{msg.hora || new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwn && (
                          msg.lida ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-16 h-16 text-slate-600 mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Nenhuma mensagem ainda</h4>
                <p className="text-slate-400">Comece uma conversa com {amigo?.nome}!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/90">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!novaMensagem.trim() || sending}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============= AMIGO CARD =============
const AmigoCard = ({ amigo, onChat, onLike, index }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(amigo.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl">
              {amigo.foto || '👤'}
            </div>
          </div>
          {amigo.online && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{amigo.nome}</h3>
            {amigo.streak > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full text-xs text-orange-400">
                <Flame className="w-3 h-3" />
                {amigo.streak}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mb-2">{amigo.status || 'Online'}</p>
          {amigo.ultimoExercicio && (
            <p className="text-sm text-slate-300">
              <Activity className="w-4 h-4 inline mr-1 text-purple-400" />
              {amigo.ultimoExercicio}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            liked
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm">{liked ? 'Curtido' : 'Curtir'}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChat(amigo)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Chat</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============= CONVERSATIONS LIST =============
const ConversationsList = ({ conversas, onSelectConversa, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-32 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversas || conversas.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma conversa ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversas.map((conversa) => (
        <motion.button
          key={conversa.amigo_id}
          whileHover={{ x: 5 }}
          onClick={() => onSelectConversa(conversa)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              {conversa.foto || '👤'}
            </div>
            {conversa.nao_lidas > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {conversa.nao_lidas}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white truncate">{conversa.nome}</span>
              <span className="text-xs text-slate-500">{conversa.ultima_mensagem_hora}</span>
            </div>
            <p className="text-sm text-slate-400 truncate">{conversa.ultima_mensagem}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

// ============= MAIN PAGE =============
export const AmigosPage = () => {
  const [amigos, setAmigos] = useState([]);
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAmigo, setSelectedAmigo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('amigos');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [amigosRes, conversasRes] = await Promise.allSettled([
        amigosService.getAmigos(),
        chatService.getConversas()
      ]);
      
      if (amigosRes.status === 'fulfilled') {
        setAmigos(amigosRes.value.data || [
          { id: 1, nome: 'João Silva', status: 'Em treino agora', streak: 12, ultimoExercicio: 'Supino 100kg', foto: '👨‍🦱', online: true },
          { id: 2, nome: 'Maria Santos', status: 'Completou treino', streak: 8, ultimoExercicio: 'Agachamento 80kg', foto: '👩‍🦰', online: false },
          { id: 3, nome: 'Carlos Lima', status: 'Descansando', streak: 5, ultimoExercicio: 'Leg Press 200kg', foto: '👨', online: true },
        ]);
      }
      if (conversasRes.status === 'fulfilled') {
        setConversas(conversasRes.value.data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (amigo) => {
    setSelectedAmigo(amigo);
    setChatOpen(true);
  };

  const filteredAmigos = amigos.filter(amigo =>
    amigo.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNaoLidas = conversas.reduce((acc, c) => acc + (c.nao_lidas || 0), 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Amigos
          </h1>
          <p className="text-slate-400">Conecte-se e treine junto com seus amigos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white"
        >
          <UserPlus className="w-5 h-5" />
          Adicionar
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar amigos..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('amigos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'amigos'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Amigos ({amigos.length})
        </button>
        <button
          onClick={() => setActiveTab('conversas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all relative ${
            activeTab === 'conversas'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Conversas
          {totalNaoLidas > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              {totalNaoLidas}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'amigos' ? (
          <motion.div
            key="amigos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-24 h-5" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="flex-1 h-10 rounded-xl" />
                    <Skeleton className="flex-1 h-10 rounded-xl" />
                  </div>
                </div>
              ))
            ) : filteredAmigos.length > 0 ? (
              filteredAmigos.map((amigo, i) => (
                <AmigoCard
                  key={amigo.id}
                  amigo={amigo}
                  onChat={handleOpenChat}
                  index={i}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'Nenhum amigo encontrado' : 'Você ainda não tem amigos'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm ? 'Tente buscar com outro termo' : 'Comece adicionando alguns amigos!'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="conversas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4"
          >
            <ConversationsList
              conversas={conversas}
              onSelectConversa={(c) => handleOpenChat({ id: c.amigo_id, nome: c.nome, foto: c.foto })}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        amigo={selectedAmigo}
      />
    </div>
  );
};
