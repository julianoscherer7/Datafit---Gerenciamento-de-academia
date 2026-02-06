import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Dumbbell, Flame, Apple, Brain, 
  RefreshCw, Trash2, Copy, Check, X, Maximize2, Minimize2
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

// Gera resposta inteligente baseada em palavras-chave da pergunta
function generateSmartResponse(question) {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Base de conhecimento fitness com padrões de palavras-chave
  const knowledgeBase = [
    {
      keywords: ['hipertrofia', 'massa muscular', 'ganhar massa', 'crescer musculo', 'ganho muscular'],
      response: 'Para hipertrofia, o ideal é trabalhar com 3-4 séries de 8-12 repetições por exercício, com descanso de 60-90 segundos entre séries. Foque em progressão de carga gradual (aumente 2-5% quando conseguir completar todas as reps). Os exercícios compostos como supino, agachamento e remada devem ser a base do seu treino! 💪'
    },
    {
      keywords: ['perder gordura', 'emagrecer', 'perder peso', 'queimar gordura', 'secar', 'cutting', 'definicao', 'definir'],
      response: 'Para perder gordura, o principal é manter um déficit calórico moderado (300-500 kcal abaixo da manutenção). Combine treino de musculação para preservar massa magra com cardio moderado (HIIT 2-3x/semana ou cardio leve 4-5x). Priorize proteína (2g/kg) para preservar músculo e mantenha o treino pesado! A perda saudável é de 0.5-1kg por semana. 🔥'
    },
    {
      keywords: ['proteina', 'suplemento', 'whey', 'creatina', 'bcaa', 'suplementacao'],
      response: 'Sobre suplementação:\n\n• **Whey Protein**: 1-2 scoops/dia para complementar a ingestão proteica (1.6-2.2g/kg)\n• **Creatina**: 3-5g/dia (monohidratada), é o suplemento mais estudado e eficaz para força\n• **Cafeína**: 3-6mg/kg 30min antes do treino para performance\n• **BCAA**: Geralmente desnecessário se a ingestão proteica é adequada\n\nLembre-se: suplementos complementam, não substituem uma boa alimentação! 💊'
    },
    {
      keywords: ['dieta', 'alimentacao', 'nutricao', 'comer', 'refeicao', 'calorias', 'macro'],
      response: 'Dicas de nutrição para resultados:\n\n• **Proteína**: 1.6-2.2g por kg de peso corporal (frango, ovos, peixe, carne, whey)\n• **Carboidratos**: 3-5g/kg para treinos intensos (arroz, batata, aveia, frutas)\n• **Gorduras**: 0.8-1.2g/kg (azeite, castanhas, abacate)\n• Faça 4-6 refeições espaçadas ao longo do dia\n• Pré-treino: carb + proteína 1-2h antes\n• Pós-treino: proteína + carb em até 2h\n\nConsistência é mais importante que perfeição! 🍗'
    },
    {
      keywords: ['descanso', 'recuperacao', 'dormir', 'sono', 'overtraining', 'descansar'],
      response: 'A recuperação é onde o músculo realmente cresce! Dicas essenciais:\n\n• **Sono**: 7-9 horas por noite (hormônio do crescimento é liberado durante o sono profundo)\n• **Descanso muscular**: 48-72h antes de treinar o mesmo grupo novamente\n• **Sinais de overtraining**: fadiga constante, queda de performance, irritabilidade, insônia\n• **Desload**: A cada 6-8 semanas, reduza volume/intensidade por 1 semana\n• Técnicas de recuperação: alongamento, foam roller, banho de contraste\n\nMais nem sempre é melhor! 😴'
    },
    {
      keywords: ['peito', 'supino', 'peitoral', 'bench press'],
      response: 'Treino de peito completo:\n\n1. **Supino Reto** (barra/halter): 4x8-10 - Base para peitoral médio\n2. **Supino Inclinado**: 3x10-12 - Foco no peitoral superior\n3. **Crucifixo/Fly**: 3x12-15 - Isolamento e stretch\n4. **Cross-over**: 3x12-15 - Contração máxima\n\n💡 Dicas: mantenha as escápulas retraídas, controle a descida (2-3s) e expire na subida. Varie ângulos para desenvolvimento completo! 🏋️'
    },
    {
      keywords: ['costas', 'remada', 'puxada', 'dorsal', 'pull', 'barra fixa'],
      response: 'Treino de costas completo:\n\n1. **Barra Fixa/Puxada Frontal**: 4x8-10 - Largura dorsal\n2. **Remada Curvada**: 4x8-10 - Espessura das costas\n3. **Remada Unilateral**: 3x10-12 - Equilíbrio muscular\n4. **Pullover**: 3x12-15 - Expansão torácica\n\n💡 Dicas: puxe com os cotovelos (não com as mãos), contraia as escápulas no pico do movimento e controle a fase excêntrica! 💪'
    },
    {
      keywords: ['perna', 'agachamento', 'leg', 'quadriceps', 'posterior', 'panturrilha', 'gluteo'],
      response: 'Treino de pernas completo:\n\n1. **Agachamento Livre**: 4x6-8 - Rei dos exercícios!\n2. **Leg Press 45°**: 4x10-12 - Volume seguro\n3. **Cadeira Extensora**: 3x12-15 - Isolamento de quadríceps\n4. **Mesa Flexora**: 3x10-12 - Posterior de coxa\n5. **Elevação Pélvica**: 3x12-15 - Glúteos\n6. **Panturrilha**: 4x15-20 - Gêmeos\n\n💡 Dica: nunca pule o leg day! Pernas fortes = base sólida para tudo. 🦵'
    },
    {
      keywords: ['braco', 'biceps', 'triceps', 'rosca', 'curl'],
      response: 'Treino de braços completo:\n\n**Bíceps:**\n1. Rosca Direta (barra): 3x10-12\n2. Rosca Alternada (halter): 3x10-12\n3. Rosca Martelo: 3x12-15\n\n**Tríceps:**\n1. Tríceps Testa: 3x10-12\n2. Tríceps Corda (pulley): 3x12-15\n3. Mergulho: 3x8-12\n\n💡 Lembre: tríceps representa 2/3 do braço! Se quer braços grandes, priorize tríceps. Controle o movimento e evite balançar o corpo. 💪'
    },
    {
      keywords: ['ombro', 'deltoid', 'desenvolvimento', 'lateral', 'shoulder'],
      response: 'Treino de ombros completo:\n\n1. **Desenvolvimento Militar** (barra/halter): 4x8-10 - Deltóide anterior\n2. **Elevação Lateral**: 4x12-15 - Deltóide medial (o que dá largura!)\n3. **Elevação Frontal**: 3x12-15 - Deltóide anterior\n4. **Face Pull**: 3x15-20 - Deltóide posterior + saúde do ombro\n\n💡 Dica: nas elevações laterais, use peso leve e foque na contração. Ombros respondem bem a volume! 🎯'
    },
    {
      keywords: ['alongamento', 'mobilidade', 'flexibilidade', 'stretching', 'aquecimento'],
      response: 'Alongamento e mobilidade são essenciais:\n\n**Antes do treino (dinâmico, 5-10min):**\n• Rotação de ombros e quadril\n• Agachamento sem peso\n• Balanço de pernas\n\n**Depois do treino (estático, 10-15min):**\n• Mantenha cada posição 20-30 segundos\n• Foque nos músculos treinados\n• Respire profundamente\n\n**Mobilidade (3-4x/semana):**\n• Foam roller para fascia\n• Yoga ou pilates\n\nMelhora performance e previne lesões! 🧘'
    },
    {
      keywords: ['motivacao', 'animo', 'desistir', 'desmotivado', 'forca', 'motivar'],
      response: 'Motivação é o que te faz começar, disciplina é o que te faz continuar! 🔥\n\nDicas para manter o foco:\n\n• **Defina metas claras** e mensuráveis (ex: agachar 100kg em 3 meses)\n• **Registre seu progresso** - ver a evolução motiva muito\n• **Treine com parceiro** ou desafie amigos no app\n• **Varie os treinos** a cada 4-6 semanas\n• **Celebre pequenas vitórias** - cada treino completado é uma conquista\n• **Nos dias ruins**, apareça mesmo assim - um treino leve > nenhum treino\n\n"O corpo alcança o que a mente acredita!" 💪🏆'
    },
    {
      keywords: ['iniciante', 'comecar', 'primeiro', 'comeco', 'nunca treinei', 'novo'],
      response: 'Bem-vindo ao mundo fitness! Dicas para iniciantes:\n\n1. **Comece devagar**: 3x/semana, full body ou ABC\n2. **Aprenda a técnica**: peça ajuda ao professor, assista vídeos\n3. **Não exagere no peso**: foque em execução perfeita\n4. **Treino sugerido (Full Body 3x/semana):**\n   • Agachamento 3x12\n   • Supino 3x12\n   • Remada 3x12\n   • Desenvolvimento 3x12\n   • Rosca + Tríceps 2x15\n5. **Alimentação**: aumente proteína gradualmente\n6. **Consistência** > Intensidade no início\n\nOs primeiros 3 meses são adaptação. Resultados visíveis a partir do mês 3-4! 🚀'
    },
    {
      keywords: ['cardio', 'correr', 'aerobico', 'hiit', 'esteira', 'bicicleta'],
      response: 'Guia de cardio:\n\n**HIIT (High Intensity Interval Training):**\n• 20-30 min, 2-3x/semana\n• Ex: 30s sprint + 60s caminhada, repetir 10-15x\n• Ótimo para queima de gordura pós-treino\n\n**LISS (Low Intensity Steady State):**\n• 30-60 min, 3-5x/semana\n• Caminhada rápida, bike, natação\n• Menor impacto na recuperação muscular\n\n💡 Se o objetivo é hipertrofia, limite cardio a 2-3x/semana e faça após a musculação ou em dias separados. 🏃'
    },
    {
      keywords: ['lesao', 'dor', 'machucado', 'doendo', 'lesionar'],
      response: '⚠️ Sobre dores e lesões:\n\n**Dor muscular (DOMS)**: Normal após treino novo ou intenso. Dura 24-72h. Alongamento leve e movimento ajudam.\n\n**Dor articular/aguda**: PARE o exercício imediatamente!\n\n**Prevenção:**\n• Sempre aqueça 5-10 min antes\n• Técnica correta > peso alto\n• Não ignore sinais do corpo\n• Progrida gradualmente (regra dos 10%)\n\n🏥 **Importante**: Se a dor persistir por mais de 3-5 dias ou for aguda, consulte um médico ou fisioterapeuta. Eu posso ajudar com dicas gerais, mas não substituo um profissional de saúde!'
    },
    {
      keywords: ['agua', 'hidratacao', 'beber', 'liquido'],
      response: 'Hidratação é essencial para performance!\n\n• **Diário**: 35ml por kg de peso corporal (70kg = 2.45L)\n• **Antes do treino**: 500ml 2h antes\n• **Durante treino**: 150-300ml a cada 15-20 min\n• **Após treino**: reponha 150% do peso perdido\n\n💡 Sinais de desidratação: urina escura, fadiga, cãibras, queda de performance.\n\nÁgua com limão, água de coco e isotônicos são boas opções para variar! 💧'
    }
  ];

  // Buscar a melhor resposta por correspondência de palavras-chave
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (q.includes(keyword)) {
        score += keyword.length; // palavras maiores = match mais relevante
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }

  // Respostas para saudações
  if (/^(oi|ola|hey|e ai|fala|bom dia|boa tarde|boa noite|salve)/.test(q)) {
    return 'Olá! 👋 Como posso te ajudar com seus treinos hoje? Pode perguntar sobre exercícios, nutrição, suplementação, descanso ou qualquer dúvida fitness!';
  }

  // Resposta para agradecimento
  if (/^(obrigad|valeu|thanks|brigad|vlw)/.test(q)) {
    return 'Por nada! 😊 Estou aqui sempre que precisar. Bons treinos! 💪';
  }

  // Resposta genérica que reconhece a pergunta
  return `Boa pergunta! Infelizmente não tenho uma resposta específica sobre "${question}" no momento. 🤔\n\nMas posso te ajudar com:\n• Treinos e exercícios específicos\n• Nutrição e dieta\n• Suplementação\n• Recuperação e descanso\n• Cardio e emagrecimento\n• Motivação\n\nTente reformular ou pergunte sobre algum desses temas! 💪`;
}

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
      
      // Resposta inteligente baseada em palavras-chave da pergunta do usuário
      const reply = generateSmartResponse(content.trim());

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply
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
