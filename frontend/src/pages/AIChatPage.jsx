import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, Trash2, RotateCcw, Copy, Check,
  Dumbbell, Brain, Apple, Lightbulb, ChevronRight
} from 'lucide-react';
import { aiService } from '../services';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  { icon: Dumbbell, text: 'Monte um treino de peito e triceps', color: 'indigo' },
  { icon: Apple, text: 'Dicas de alimentacao pre-treino', color: 'emerald' },
  { icon: Brain, text: 'Como melhorar a conexao mente-musculo?', color: 'purple' },
  { icon: Lightbulb, text: 'Exercicios para melhorar postura', color: 'amber' },
];

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3">
    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
      <Bot className="w-4 h-4 text-indigo-400" />
    </div>
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  </div>
);

const MessageBubble = ({ msg, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
      )}
      <div className={`max-w-[80%] group relative ${isUser ? 'ml-auto' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-slate-800/40 border border-slate-700/10 text-slate-200 rounded-bl-md'
        }`}>
          {msg.content.split('\n').map((line, i) => {
            // Parse basic markdown: **bold**, _italic_, • bullets
            const parsed = line
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/_(.+?)_/g, '<em class="text-slate-400">$1</em>');
            return (
              <React.Fragment key={i}>
                <span dangerouslySetInnerHTML={{ __html: parsed }} />
                {i < msg.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </div>
        {!isUser && (
          <button onClick={handleCopy}
            className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-800/40">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const AIChatPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiService.chat(content, JSON.stringify(messages.slice(-10).map(m => `${m.role}: ${m.content}`)));
      const reply = res.data?.resposta || res.data?.response || res.data?.message || 'Desculpe, nao consegui processar sua pergunta.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, ocorreu um erro. Tente novamente em alguns instantes.' }]);
    }
    finally { setLoading(false); }
  };

  const clearChat = () => setMessages([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FitBot AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-slate-500">Assistente inteligente</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Ola, {user?.nome?.split(' ')[0] || 'atleta'}!</h2>
              <p className="text-sm text-slate-500 max-w-md">
                Sou seu assistente fitness. Posso ajudar com treinos, nutricao, tecnicas e muito mais.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/30 border border-slate-700/10 text-left hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group">
                  <s.icon className={`w-4 h-4 text-${s.color}-400 flex-shrink-0`} />
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{s.text}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 ml-auto" />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <div className="flex items-end gap-2 bg-slate-800/40 border border-slate-700/20 rounded-2xl p-2 focus-within:border-indigo-500/30 transition-colors">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Pergunte algo ao FitBot..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none px-2 py-1.5 max-h-32"
            style={{ minHeight: '36px' }} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0">
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="text-center text-[10px] text-slate-600 mt-2">FitBot pode cometer erros. Consulte sempre um profissional.</div>
      </div>
    </div>
  );
};

export default AIChatPage;
