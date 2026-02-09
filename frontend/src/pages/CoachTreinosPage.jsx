import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, Search, Users, ChevronDown, X, Save, Trash2,
  GripVertical, Edit2, Check, ArrowLeft, Send, Bot, Sparkles
} from 'lucide-react';
import { coachService, exerciciosService, aiService } from '../services';
import { useAuth } from '../context/AuthContext';

const Avatar = ({ nome }) => {
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold text-[10px]`}>{initials}</div>;
};

const tecnicasAvancadas = [
  { id: 'dropset', nome: 'Drop Set', descricao: 'Reduz peso sem descanso' },
  { id: 'restpause', nome: 'Rest-Pause', descricao: 'Pausas curtas de 10-15s' },
  { id: 'supersets', nome: 'Super Set', descricao: 'Dois exercícios seguidos' },
  { id: 'piramide', nome: 'Pirâmide', descricao: 'Aumenta/diminui carga' },
  { id: 'negativa', nome: 'Negativa Enfatizada', descricao: 'Foco na fase excêntrica' },
  { id: 'isometria', nome: 'Isometria', descricao: 'Contração estática' },
  { id: 'fst7', nome: 'FST-7', descricao: '7 séries finais de 8-12 reps' },
];

export const CoachTreinosPage = ({ onNavigate }) => {
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingTreino, setEditingTreino] = useState(null);
  const [novoTreino, setNovoTreino] = useState({ nome: '', descricao: '', exercicios: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEx, setSearchEx] = useState('');
  
  // FitBot state
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Olá! Sou o FitBot, seu assistente de treinos. Posso ajudar a montar treinos para seus alunos!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { fetchAlunos(); }, []);
  useEffect(() => { if (selectedAluno) fetchTreinos(); }, [selectedAluno]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchAlunos = async () => {
    try {
      const res = await coachService.getAlunos();
      setAlunos((res.data || []).map(s => ({
        id: s.student_id || s.id,
        nome: s.student_name || s.nome,
        email: s.student_email || s.email,
      })));
    } catch {
      setAlunos([]);
    }
    setLoading(false);
  };

  const fetchTreinos = async () => {
    try {
      const res = await coachService.getTreinosAluno(selectedAluno.id);
      setTreinos(res.data || []);
    } catch {
      setTreinos([]);
    }
    try {
      const res = await exerciciosService.getExercicios();
      setExercicios((res.data || []).map(e => ({
        id: e.id,
        nome: e.nome,
        grupo: e.grupo_muscular || e.grupo,
      })));
    } catch {
      setExercicios([]);
    }
  };

  const handleSaveTreino = async () => {
    if (!novoTreino.nome || novoTreino.exercicios.length === 0) return;
    
    // Transform data for backend
    const treinoData = {
      nome: novoTreino.nome,
      descricao: novoTreino.descricao,
      exercicios: novoTreino.exercicios.map((ex, idx) => ({
        exercicio_id: ex.id,
        ordem: idx + 1,
        series_sugeridas: ex.series || 3,
        reps_sugeridas: ex.reps || 12
      }))
    };
    
    try {
      await coachService.criarTreinoAluno(selectedAluno.id, treinoData);
      await fetchTreinos();
    } catch (err) {
      console.error('Erro ao criar treino:', err);
    }
    
    closeEditor();
  };

  const openNewTreino = () => {
    setEditingTreino(null);
    setNovoTreino({ nome: '', descricao: '', exercicios: [] });
    setShowEditorModal(true);
  };

  const openEditTreino = (treino) => {
    setEditingTreino(treino);
    // Transform treino.exercicios to our format
    const exerciciosFormatados = (treino.exercicios || []).map(ex => ({
      id: ex.exercicio_id || ex.id,
      nome: ex.nome || ex.exercicio_nome || 'Exercício',
      grupo: ex.grupo_muscular || ex.grupo || '',
      series: ex.series_sugeridas || ex.series || 3,
      reps: ex.reps_sugeridas || ex.reps || 12,
      tecnica: ex.tecnica || '',
      observacao: ex.observacao || ''
    }));
    setNovoTreino({
      nome: treino.nome,
      descricao: treino.descricao || '',
      exercicios: exerciciosFormatados
    });
    setShowEditorModal(true);
  };

  const closeEditor = () => {
    setShowEditorModal(false);
    setEditingTreino(null);
    setNovoTreino({ nome: '', descricao: '', exercicios: [] });
    setSearchEx('');
  };

  const addExToTreino = (ex) => {
    setNovoTreino(prev => ({
      ...prev,
      exercicios: [...prev.exercicios, { 
        id: ex.id,
        nome: ex.nome,
        grupo: ex.grupo,
        series: 3, 
        reps: 12, 
        tecnica: '',
        observacao: ''
      }]
    }));
  };

  const removeExFromTreino = (idx) => {
    setNovoTreino(prev => ({ ...prev, exercicios: prev.exercicios.filter((_, i) => i !== idx) }));
  };

  const updateExercicio = (idx, field, value) => {
    setNovoTreino(prev => ({
      ...prev,
      exercicios: prev.exercicios.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex)
    }));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setChatLoading(true);
    
    try {
      const res = await aiService.chat({ message: userMsg });
      const botResponse = res.data?.response || res.data?.message || 'Desculpe, tive um problema. Tente novamente.';
      setChatMessages(prev => [...prev, { from: 'bot', text: botResponse }]);
    } catch {
      setChatMessages(prev => [...prev, { from: 'bot', text: 'Erro ao conectar. Verifique sua conexão.' }]);
    }
    setChatLoading(false);
  };

  const filteredAlunos = alunos.filter(a => !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEx = exercicios.filter(e => !searchEx || (e.nome || '').toLowerCase().includes(searchEx.toLowerCase()));

  if (!selectedAluno) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('coachDashboard')}
            className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Treinos dos Alunos</h1>
            <p className="text-sm text-slate-500">Selecione um aluno</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
        </div>

        <div className="space-y-2">
          {filteredAlunos.map((a, i) => (
            <motion.button key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedAluno(a)}
              className="w-full flex items-center gap-3 p-4 card-base hover:border-slate-700/30 transition-all text-left">
              <Avatar nome={a.nome} />
              <span className="text-sm font-medium text-white">{a.nome}</span>
              <Dumbbell className="w-4 h-4 text-slate-600 ml-auto" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedAluno(null)}
          className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Treinos de {selectedAluno.nome}</h1>
          <p className="text-sm text-slate-500">{treinos.length} treinos criados</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={openNewTreino}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all">
          <Plus className="w-4 h-4" /> Novo Treino
        </motion.button>
      </div>

      <div className="space-y-2">
        {treinos.map((t, i) => (
          <motion.button key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openEditTreino(t)}
            className="w-full card-base p-4 text-left hover:border-indigo-500/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{t.nome}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.descricao || `${(t.exercicios || []).length} exercícios`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-800/30 px-2 py-1 rounded-lg">
                  {(t.exercicios || []).length} ex.
                </span>
                <Edit2 className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </motion.button>
        ))}
        {treinos.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum treino criado para este aluno</div>
        )}
      </div>

      {/* Editor Modal with FitBot */}
      <AnimatePresence>
        {showEditorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={closeEditor}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} 
              className="w-full max-w-5xl h-[85vh] card-base flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                <h3 className="text-lg font-semibold text-white">
                  {editingTreino ? `Editando: ${editingTreino.nome}` : 'Novo Treino'}
                </h3>
                <button onClick={closeEditor} className="p-1.5 rounded-lg hover:bg-slate-800/40">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content - Two columns */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Workout Editor */}
                <div className="flex-1 p-4 overflow-y-auto border-r border-slate-800/50">
                  <div className="space-y-4">
                    {/* Nome e Descrição */}
                    <div className="space-y-3">
                      <input 
                        value={novoTreino.nome} 
                        onChange={e => setNovoTreino(p => ({ ...p, nome: e.target.value }))} 
                        placeholder="Nome do treino"
                        className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                      <input 
                        value={novoTreino.descricao} 
                        onChange={e => setNovoTreino(p => ({ ...p, descricao: e.target.value }))} 
                        placeholder="Descrição (opcional)"
                        className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                    </div>

                    {/* Exercícios adicionados */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Exercícios ({novoTreino.exercicios.length})</span>
                      </div>
                      
                      {novoTreino.exercicios.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          Adicione exercícios buscando abaixo
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {novoTreino.exercicios.map((ex, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{ex.nome}</span>
                                <button onClick={() => removeExFromTreino(i)} className="p-1 text-red-400/50 hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-[10px] text-slate-500">Séries</label>
                                  <input 
                                    type="number"
                                    value={ex.series} 
                                    onChange={e => updateExercicio(i, 'series', Number(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-center text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500">Repetições</label>
                                  <input 
                                    type="number"
                                    value={ex.reps} 
                                    onChange={e => updateExercicio(i, 'reps', Number(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-center text-white" />
                                </div>
                              </div>
                              
                              {/* Técnica avançada */}
                              <div className="mb-2">
                                <label className="text-[10px] text-slate-500">Técnica Avançada</label>
                                <select 
                                  value={ex.tecnica || ''} 
                                  onChange={e => updateExercicio(i, 'tecnica', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white">
                                  <option value="">Nenhuma</option>
                                  {tecnicasAvancadas.map(t => (
                                    <option key={t.id} value={t.id}>{t.nome}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* Observação */}
                              <div>
                                <label className="text-[10px] text-slate-500">Observação</label>
                                <input 
                                  value={ex.observacao || ''} 
                                  onChange={e => updateExercicio(i, 'observacao', e.target.value)}
                                  placeholder="Ex: foco na contração"
                                  className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white placeholder-slate-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Buscar exercícios */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-400">Adicionar exercício</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input 
                          value={searchEx} 
                          onChange={e => setSearchEx(e.target.value)} 
                          placeholder="Buscar exercício..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredEx.slice(0, 15).map(ex => (
                          <button 
                            key={ex.id} 
                            onClick={() => addExToTreino(ex)}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-500/10 text-left transition-all">
                            <div>
                              <span className="text-xs text-white">{ex.nome}</span>
                              {ex.grupo && <span className="text-[10px] text-slate-500 ml-2">{ex.grupo}</span>}
                            </div>
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: FitBot */}
                <div className="w-80 flex flex-col bg-slate-900/30">
                  {/* Chat Header */}
                  <div className="p-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">FitBot</span>
                        <p className="text-[10px] text-slate-500">Assistente de treinamento</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                          msg.from === 'user' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-800/50 text-slate-300'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800/50 rounded-xl px-3 py-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-slate-800/50">
                    <div className="flex gap-2">
                      <input 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                        placeholder="Pergunte ao FitBot..."
                        className="flex-1 px-3 py-2 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                      <button 
                        onClick={handleSendChat}
                        disabled={!chatInput.trim() || chatLoading}
                        className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-30 transition-all">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 p-4 border-t border-slate-800/50">
                <button onClick={closeEditor} className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTreino} 
                  disabled={!novoTreino.nome || novoTreino.exercicios.length === 0}
                  className="flex-1 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingTreino ? 'Salvar Alterações' : 'Criar Treino'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachTreinosPage;
