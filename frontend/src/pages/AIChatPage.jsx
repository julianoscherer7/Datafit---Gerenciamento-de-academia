import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Dumbbell, Flame, Apple, Brain, 
  Sparkles, RefreshCw, Trash2, Copy, Check, X, Maximize2, Minimize2
} from 'lucide-react';
import { Card } from '../components/common';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Quick suggestion chips
const suggestions = [
  { icon: Dumbbell, text: 'Montar treino de hipertrofia', category: 'treino' },
  { icon: Flame, text: 'Dicas para perder gordura', category: 'dieta' },
  { icon: Apple, text: 'Alimentos para ganhar massa', category: 'dieta' },
  { icon: Brain, text: 'Como melhorar foco no treino', category: 'mindset' },
];

// Message bubble component
const MessageBubble = ({ message, isUser, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message */}
        <div className="group">
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm' 
              : 'bg-slate-700/50 text-white rounded-tl-sm'
          }`}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          </div>
          
          {/* Actions */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Typing indicator
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-3 mb-4"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
      <div className="flex items-center gap-1">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 bg-slate-400 rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
          className="w-2 h-2 bg-slate-400 rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
          className="w-2 h-2 bg-slate-400 rounded-full"
        />
      </div>
    </div>
  </motion.div>
);

// Main component
export const AIChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('fitdata_ai_chat');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('fitdata_ai_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Olá${user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}! 👋\n\nSou o FitBot, seu assistente de treinos powered by AI! 🤖💪\n\nPosso te ajudar com:\n• Montar treinos personalizados\n• Dicas de nutrição\n• Técnicas de exercícios\n• Dúvidas sobre musculação\n• Motivação fitness\n\nComo posso te ajudar hoje?`
      }]);
    }
  }, [user]);

  const sendMessage = async (content = input) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend AI chat endpoint
      const response = await api.post('/ai/chat', {
        message: content.trim(),
        context: {
          userName: user?.nome,
          userLevel: user?.nivel || 1,
          userXP: user?.xp || 0
        }
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || response.data.message || 'Desculpe, não consegui processar sua pergunta. Pode reformular?'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Chat error:', err);
      
      // Fallback response when API is not available
      const fallbackResponses = [
        'Ótima pergunta! Para treinos de hipertrofia, recomendo 3-4 séries de 8-12 repetições por exercício, com descanso de 60-90 segundos. Foque em progressão de carga gradual! 💪',
        'Para ganhar massa muscular, foque em consumir 1.6-2.2g de proteína por kg de peso corporal. Ótimas fontes: frango, ovos, peixe e whey protein! 🍗',
        'O descanso é fundamental! Músculos crescem durante a recuperação. Durma 7-9 horas por noite e descanse cada grupo muscular 48-72h antes de treinar novamente. 😴',
        'Treino de força com pesos compostos (agachamento, supino, remada) é excelente para iniciantes e avançados. Comece com cargas moderadas e aumente gradualmente! 🏋️',
        'Hidratação é essencial! Beba pelo menos 35ml de água por kg de peso corporal por dia. Durante treinos intensos, aumente essa quantidade! 💧'
      ];

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion.text);
  };

  const clearChat = () => {
    if (window.confirm('Limpar todo o histórico de conversa?')) {
      setMessages([]);
      localStorage.removeItem('fitdata_ai_chat');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'h-[calc(100vh-200px)] min-h-[500px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              FitBot
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-sm text-slate-400">Seu assistente de treinos AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestion(suggestion)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-full text-sm text-slate-300 transition-colors"
            >
              <suggestion.icon className="w-4 h-4 text-purple-400" />
              {suggestion.text}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="relative">
        <div className="flex items-end gap-2 p-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre treinos, nutrição, exercícios..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none max-h-32"
            style={{ minHeight: '24px' }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        
        <p className="text-xs text-slate-500 text-center mt-2">
          FitBot pode cometer erros. Consulte um profissional para orientações específicas.
        </p>
      </div>
    </motion.div>
  );
};

export default AIChatPage;
