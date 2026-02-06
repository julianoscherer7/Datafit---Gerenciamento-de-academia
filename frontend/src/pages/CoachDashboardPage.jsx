import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Dumbbell, ClipboardList, TrendingUp, Plus, Copy, Check,
  Eye, Trash2, Link, UserPlus, ChevronRight, Activity, Clock,
  Shield, QrCode, RefreshCw, Bot, Send, X, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { coachService } from '../services/coach.service';
import { aiService } from '../services/ai.service';

export const CoachDashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  
  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: '👋 Olá Coach! Como posso ajudar? Posso sugerir treinos, exercícios ou protocolos para seus alunos.' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, studentsRes, tokensRes] = await Promise.all([
        coachService.getDashboard(),
        coachService.getMyStudents(),
        coachService.listInviteTokens()
      ]);
      setDashboard(dashRes.data);
      setStudents(studentsRes.data);
      setTokens(tokensRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    try {
      await coachService.createInviteToken({ max_uses: 10, expires_hours: 168 });
      const res = await coachService.listInviteTokens();
      setTokens(res.data);
      setShowTokenModal(false);
    } catch (err) {
      console.error('Erro ao criar token:', err);
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const revokeToken = async (tokenId) => {
    try {
      await coachService.revokeInviteToken(tokenId);
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, active: false } : t));
    } catch (err) {
      console.error('Erro ao revogar:', err);
    }
  };

  const loadStudentDetails = async (studentId) => {
    try {
      const res = await coachService.getStudentDetails(studentId);
      setStudentDetails(res.data);
      setSelectedStudent(studentId);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    setAiLoading(true);
    
    try {
      const res = await aiService.chat(userMsg, 'coach_training', selectedStudent);
      setAiMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Alunos Ativos', value: dashboard?.active_students || 0, icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Treinos Criados', value: dashboard?.total_treinos || 0, icon: Dumbbell, color: 'from-blue-500 to-cyan-500' },
    { label: 'Validações Hoje', value: dashboard?.validations_today || 0, icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'Pendentes', value: dashboard?.pending_students || 0, icon: Clock, color: 'from-amber-500 to-orange-500' },
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'students', label: 'Meus Alunos', icon: Users },
    { id: 'tokens', label: 'Convites', icon: Link },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Painel do Coach
          </h1>
          <p className="text-slate-400 mt-1">
            Olá, {user?.nome}! <span className="text-purple-400">CREF: {user?.cref}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAIChat(!showAIChat)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25"
          >
            <Bot className="w-4 h-4" />
            AI Assistente
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('coachTreinos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Treino
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Atividade Recente dos Alunos</h2>
            {dashboard?.recent_activities?.length > 0 ? (
              <div className="space-y-2">
                {dashboard.recent_activities.map((activity, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{activity.student_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{activity.student_name}</p>
                        <p className="text-slate-400 text-xs">{activity.exercicio}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium text-sm">{activity.carga_kg}kg x {activity.repeticoes}</p>
                      <p className="text-slate-500 text-xs">{new Date(activity.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma atividade recente dos seus alunos</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Meus Alunos ({students.filter(s => s.status === 'active').length})</h2>
            </div>
            
            {students.length > 0 ? (
              <div className="grid gap-3">
                {students.filter(s => s.status === 'active').map((student) => (
                  <motion.div
                    key={student.student_id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between cursor-pointer hover:border-purple-500/30 transition-colors"
                    onClick={() => loadStudentDetails(student.student_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold">{student.student_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{student.student_name}</p>
                        <p className="text-slate-400 text-xs">{student.student_email}</p>
                        {student.last_activity && (
                          <p className="text-slate-500 text-xs mt-0.5">
                            Último treino: {new Date(student.last_activity).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('coachTreinos', { studentId: student.student_id, studentName: student.student_name });
                        }}
                        className="p-2 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
                        title="Criar treino"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center">
                <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">Nenhum aluno conectado ainda</p>
                <p className="text-slate-500 text-sm">Crie um token de convite na aba "Convites" para conectar alunos</p>
              </div>
            )}

            {/* Student Details Modal */}
            <AnimatePresence>
              {selectedStudent && studentDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedStudent(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-slate-700"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{studentDetails.student?.nome}</h3>
                      <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {studentDetails.student?.peso_kg && (
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-slate-400 text-xs">Peso</p>
                          <p className="text-white font-bold">{studentDetails.student.peso_kg} kg</p>
                        </div>
                      )}
                      {studentDetails.student?.altura_cm && (
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-slate-400 text-xs">Altura</p>
                          <p className="text-white font-bold">{studentDetails.student.altura_cm} cm</p>
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Treinos ({studentDetails.treinos?.length || 0})</h4>
                    <div className="space-y-2 mb-4">
                      {studentDetails.treinos?.map(t => (
                        <div key={t.id} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-medium">{t.nome}</p>
                            <p className="text-slate-400 text-xs">Origem: {t.origem} {t.locked ? '🔒' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Últimas Validações</h4>
                    <div className="space-y-1">
                      {studentDetails.validations?.length > 0 ? (
                        studentDetails.validations.map(v => (
                          <div key={v.id} className="bg-slate-700/30 rounded-lg px-3 py-2 flex items-center justify-between">
                            <span className="text-sm text-white">{v.validated ? '✅' : '❌'} {v.method}</span>
                            <span className="text-xs text-slate-400">{new Date(v.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">Nenhuma validação registrada</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedStudent(null);
                        onNavigate('coachTreinos', { studentId: studentDetails.student?.id, studentName: studentDetails.student?.nome });
                      }}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
                    >
                      Criar Treino para {studentDetails.student?.nome}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'tokens' && (
          <motion.div key="tokens" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Tokens de Convite</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createToken}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Gerar Token
              </motion.button>
            </div>
            
            <p className="text-slate-400 text-sm">
              Compartilhe o token com seus alunos para que eles se conectem a você ao criar a conta ou pelo menu Social.
            </p>

            {tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.id} className={`bg-slate-800/50 rounded-xl p-4 border ${token.active ? 'border-slate-700/50' : 'border-red-500/20 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-purple-400" />
                        <code className="text-sm text-purple-300 font-mono bg-slate-900/50 px-2 py-1 rounded">
                          {token.token.substring(0, 20)}...
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToken(token.token)}
                          className="p-1.5 bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Copiar"
                        >
                          {copiedToken === token.token ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {token.active && (
                          <button
                            onClick={() => revokeToken(token.id)}
                            className="p-1.5 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Revogar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Usos: {token.uses}/{token.max_uses}</span>
                      <span>Status: {token.active ? '✅ Ativo' : '❌ Revogado'}</span>
                      {token.expires_at && (
                        <span>Expira: {new Date(token.expires_at).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center">
                <Link className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum token de convite criado</p>
                <p className="text-slate-500 text-sm mt-1">Clique em "Gerar Token" para criar um link de convite</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-slate-800 border-l border-slate-700 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">AI Assistente do Coach</h3>
              </div>
              <button onClick={() => setShowAIChat(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Ex: Treino de peito intermediário..."
                  className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendAIMessage}
                  disabled={aiLoading || !aiInput.trim()}
                  className="p-2.5 bg-purple-500 rounded-xl text-white disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoachDashboardPage;
