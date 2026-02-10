import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, Search, Users, X, Save, Trash2,
  Edit2, Check, ArrowLeft, Send, Bot,
  ChevronRight, Timer
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

const descansoOptions = ['30s', '45s', '60s', '90s', '120s', '180s'];

// Markdown-like formatting for bot messages
const FormatBotText = ({ text }) => {
  const lines = (text || '').split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        let html = line
          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
          .replace(/_(.+?)_/g, '<em class="text-slate-400 italic">$1</em>')
          .replace(/^• /, '<span class="text-indigo-400 mr-1">•</span> ')
          .replace(/^(\d+)\. /, '<span class="text-indigo-400 font-semibold mr-1">$1.</span> ');
        return <div key={i} dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed" />;
      })}
    </div>
  );
};

const QUICK_PROMPTS = [
  { text: 'Treino de peito', icon: '🫁' },
  { text: 'Treino de costas', icon: '🔙' },
  { text: 'Treino de pernas', icon: '🦵' },
  { text: 'Treino de ombros', icon: '💪' },
  { text: 'Dicas de hipertrofia', icon: '🎯' },
  { text: 'Exercícios para iniciante', icon: '🌱' },
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
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // FitBot state
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Olá! 👋 Sou o **FitBot**, seu assistente de treinos.\n\nPosso ajudar com:\n• Sugerir exercícios por grupo muscular\n• Montar planos de treino completos\n• Dicas de séries, repetições e técnicas\n• Analisar equilíbrio do treino\n\nClique em uma sugestão ou digite sua pergunta!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { fetchAlunos(); fetchExercicios(); }, []);
  useEffect(() => { if (selectedAluno) fetchTreinos(); }, [selectedAluno]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const fetchAlunos = async () => {
    try {
      const res = await coachService.getAlunos();
      setAlunos((res.data || []).filter(s => s.status === 'active').map(s => ({
        id: s.student_id || s.id,
        nome: s.student_name || s.nome,
        email: s.student_email || s.email,
      })));
    } catch {
      setAlunos([]);
    }
    setLoading(false);
  };

  const fetchExercicios = async () => {
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

  const fetchTreinos = async () => {
    try {
      const res = await coachService.getTreinosAluno(selectedAluno.id);
      setTreinos(res.data || []);
    } catch {
      setTreinos([]);
    }
  };

  const handleSaveTreino = async () => {
    if (!novoTreino.nome || novoTreino.exercicios.length === 0) return;
    setSaving(true);
    
    const treinoData = {
      nome: novoTreino.nome,
      descricao: novoTreino.descricao || '',
      duracao: 45,
      origem: 'coach',
      locked: false,
      aluno_id: selectedAluno?.id || null,
      exercicios: novoTreino.exercicios.map((ex, idx) => ({
        exercicio_id: ex.id,
        ordem: idx + 1,
        series_sugeridas: String(ex.series || 3),
        reps_sugeridas: String(ex.reps || 12),
        tecnica: ex.tecnica || null,
        observacao: ex.observacao || null,
        descanso: ex.descanso || null,
      }))
    };
    
    try {
      if (editingTreino) {
        const api = (await import('../services/api')).default;
        await api.put(`/treinos/${editingTreino.id}`, treinoData);
        setToast({ type: 'success', msg: 'Treino atualizado com sucesso!' });
      } else {
        await coachService.criarTreinoAluno(selectedAluno.id, treinoData);
        setToast({ type: 'success', msg: 'Treino criado com sucesso!' });
      }
      await fetchTreinos();
      closeEditor();
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
      setToast({ type: 'error', msg: err.response?.data?.detail || 'Erro ao salvar treino' });
    }
    setSaving(false);
  };

  const openNewTreino = () => {
    setEditingTreino(null);
    setNovoTreino({ nome: '', descricao: '', exercicios: [] });
    setShowEditorModal(true);
  };

  const openEditTreino = (treino) => {
    setEditingTreino(treino);
    const exerciciosFormatados = (treino.exercicios || []).map(ex => ({
      id: ex.id || ex.exercicio_id,
      nome: ex.nome || ex.exercicio_nome || 'Exercício',
      grupo: ex.grupo_muscular || ex.grupo || '',
      series: parseInt(ex.series_sugeridas) || ex.series || 3,
      reps: parseInt(ex.reps_sugeridas) || ex.reps || 12,
      tecnica: ex.tecnica || '',
      observacao: ex.observacao || '',
      descanso: ex.descanso || '60s',
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
    if (novoTreino.exercicios.some(e => e.id === ex.id)) return;
    setNovoTreino(prev => ({
      ...prev,
      exercicios: [...prev.exercicios, { 
        id: ex.id, nome: ex.nome, grupo: ex.grupo,
        series: 3, reps: 12, tecnica: '', observacao: '', descanso: '60s'
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

  const handleSendChat = async (text) => {
    const userMsg = (text || chatInput).trim();
    if (!userMsg) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setChatLoading(true);
    
    try {
      const workoutContext = novoTreino.exercicios.length > 0 
        ? `coach_training - Treino: ${novoTreino.nome || 'Novo'}, Exercícios: ${novoTreino.exercicios.map(e => e.nome).join(', ')}`
        : 'coach_training';
      
      const res = await aiService.chat(userMsg, workoutContext, selectedAluno?.id);
      const botResponse = res.data?.response || res.data?.message || 'Desculpe, tive um problema. Tente novamente.';
      setChatMessages(prev => [...prev, { from: 'bot', text: botResponse }]);
    } catch (err) {
      console.error('FitBot error:', err);
      setChatMessages(prev => [...prev, { from: 'bot', text: '⚠️ Erro ao conectar com o FitBot. Tente novamente.' }]);
    }
    setChatLoading(false);
  };

  const filteredAlunos = alunos.filter(a => !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEx = exercicios.filter(e => !searchEx || (e.nome || '').toLowerCase().includes(searchEx.toLowerCase()) || (e.grupo || '').toLowerCase().includes(searchEx.toLowerCase()));

  // ==================== STUDENT SELECTION SCREEN ====================
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
            <p className="text-sm text-slate-500">Selecione um aluno para gerenciar treinos</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(148,163,184,0.06)' }} />)}
          </div>
        ) : filteredAlunos.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum aluno conectado ainda</p>
            <p className="text-slate-600 text-xs mt-1">Convide alunos usando tokens no painel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlunos.map((a, i) => (
              <motion.button key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedAluno(a)}
                className="w-full flex items-center gap-3 p-4 card-base hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all text-left group">
                <Avatar nome={a.nome} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white block truncate">{a.nome}</span>
                  <span className="text-[11px] text-slate-500">{a.email}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==================== STUDENT WORKOUTS SCREEN ====================
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
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Novo Treino
        </motion.button>
      </div>

      <div className="space-y-2">
        {treinos.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-4 hover:border-slate-700/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t.nome}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.descricao || `${(t.exercicios || []).length} exercícios`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-800/30 px-2 py-1 rounded-lg">
                  {(t.exercicios || []).length} ex.
                </span>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => openEditTreino(t)}
                  className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-all"
                  title="Editar treino">
                  <Edit2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            {(t.exercicios || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(t.exercicios || []).slice(0, 5).map((ex, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 border border-slate-700/10">
                    {ex.nome}
                  </span>
                ))}
                {(t.exercicios || []).length > 5 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                    +{(t.exercicios || []).length - 5}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
        {treinos.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum treino criado para este aluno</p>
            <p className="text-slate-600 text-xs mt-1">Clique em "Novo Treino" para começar</p>
          </motion.div>
        )}
      </div>

      {/* ==================== EDITOR MODAL ==================== */}
      <AnimatePresence>
        {showEditorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3" 
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={closeEditor}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()} 
              className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden rounded-2xl"
              style={{ background: '#0c0f1a', border: '1px solid rgba(148,163,184,0.08)' }}>
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {editingTreino ? 'Editar Treino' : 'Novo Treino'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Para: {selectedAluno.nome}</p>
                  </div>
                </div>
                <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-slate-800/40 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content - Two columns */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Workout Editor */}
                <div className="flex-1 p-5 overflow-y-auto scrollbar-thin">
                  <div className="space-y-5">
                    {/* Nome e Descrição */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Nome do Treino *</label>
                        <input 
                          value={novoTreino.nome} 
                          onChange={e => setNovoTreino(p => ({ ...p, nome: e.target.value }))} 
                          placeholder="Ex: Treino A - Peito e Tríceps"
                          className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Descrição</label>
                        <textarea 
                          value={novoTreino.descricao} 
                          onChange={e => setNovoTreino(p => ({ ...p, descricao: e.target.value }))} 
                          placeholder="Descreva o objetivo ou observações do treino..."
                          rows={2}
                          className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors resize-none" />
                      </div>
                    </div>

                    {/* Exercícios adicionados */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">
                          Exercícios ({novoTreino.exercicios.length})
                        </span>
                        {novoTreino.exercicios.length > 0 && (
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {novoTreino.exercicios.reduce((sum, ex) => sum + (parseInt(ex.series) || 0), 0)} séries total
                          </span>
                        )}
                      </div>
                      
                      {novoTreino.exercicios.length === 0 ? (
                        <div className="text-center py-8 rounded-xl border border-dashed border-slate-700/30">
                          <Dumbbell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          <p className="text-slate-500 text-xs">Adicione exercícios buscando abaixo</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {novoTreino.exercicios.map((ex, i) => (
                            <motion.div key={`${ex.id}-${i}`}
                              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                              className="rounded-xl border border-slate-700/15 overflow-hidden"
                              style={{ background: 'rgba(30,34,56,0.5)' }}>
                              {/* Exercise header */}
                              <div className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-indigo-400 text-xs font-bold w-5">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-white truncate block">{ex.nome}</span>
                                  {ex.grupo && <span className="text-[10px] text-slate-500">{ex.grupo}</span>}
                                </div>
                                <button onClick={() => removeExFromTreino(i)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              
                              {/* Exercise details */}
                              <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">Séries</label>
                                  <input type="number" min="1" max="20"
                                    value={ex.series} 
                                    onChange={e => updateExercicio(i, 'series', Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-center text-white focus:border-indigo-500/30 outline-none transition-colors" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">Repetições</label>
                                  <input type="number" min="1" max="100"
                                    value={ex.reps} 
                                    onChange={e => updateExercicio(i, 'reps', Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-center text-white focus:border-indigo-500/30 outline-none transition-colors" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><Timer className="w-2.5 h-2.5" /> Descanso</label>
                                  <select 
                                    value={ex.descanso || '60s'} 
                                    onChange={e => updateExercicio(i, 'descanso', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white focus:border-indigo-500/30 outline-none transition-colors">
                                    {descansoOptions.map(d => (
                                      <option key={d} value={d}>{d}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">Técnica</label>
                                  <select 
                                    value={ex.tecnica || ''} 
                                    onChange={e => updateExercicio(i, 'tecnica', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white focus:border-indigo-500/30 outline-none transition-colors">
                                    <option value="">Nenhuma</option>
                                    {tecnicasAvancadas.map(t => (
                                      <option key={t.id} value={t.id}>{t.nome}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">Observação</label>
                                  <input 
                                    value={ex.observacao || ''} 
                                    onChange={e => updateExercicio(i, 'observacao', e.target.value)}
                                    placeholder="Nota..."
                                    className="w-full px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white placeholder-slate-600 focus:border-indigo-500/30 outline-none transition-colors" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Exercise Search */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-400">Adicionar Exercício</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input 
                          value={searchEx} 
                          onChange={e => setSearchEx(e.target.value)} 
                          placeholder="Buscar por nome ou grupo muscular..."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
                      </div>
                      <div className="max-h-36 overflow-y-auto scrollbar-thin space-y-0.5 rounded-xl border border-slate-700/10 bg-slate-800/20 p-1.5">
                        {filteredEx.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-600">Nenhum exercício encontrado</div>
                        ) : filteredEx.slice(0, 20).map(ex => {
                          const added = novoTreino.exercicios.some(e => e.id === ex.id);
                          return (
                            <button key={ex.id} onClick={() => !added && addExToTreino(ex)} disabled={added}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                added ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-500/10 cursor-pointer'
                              }`}>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-white truncate block">{ex.nome}</span>
                                {ex.grupo && <span className="text-[10px] text-slate-500">{ex.grupo}</span>}
                              </div>
                              {added ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: FitBot */}
                <div className="w-80 flex flex-col border-l border-slate-800/50" style={{ background: 'rgba(8,10,24,0.6)' }}>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">FitBot</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-slate-500">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  {chatMessages.length <= 1 && (
                    <div className="p-2.5 border-b border-slate-800/30">
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_PROMPTS.map((p, i) => (
                          <button key={i} onClick={() => handleSendChat(p.text)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/30 border border-slate-700/10 text-[10px] text-slate-300 hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-white transition-all">
                            <span>{p.icon}</span> {p.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                    {chatMessages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.from === 'bot' && (
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <Bot className="w-3 h-3 text-indigo-400" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                          msg.from === 'user' 
                            ? 'bg-indigo-500 text-white rounded-br-sm' 
                            : 'bg-slate-800/50 text-slate-300 border border-slate-700/10 rounded-bl-sm'
                        }`}>
                          {msg.from === 'bot' ? <FormatBotText text={msg.text} /> : msg.text}
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mr-2">
                          <Bot className="w-3 h-3 text-indigo-400" />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/10 rounded-xl px-3 py-2.5">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(j => (
                              <motion.div key={j} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }} />
                            ))}
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
                        className="flex-1 px-3 py-2 bg-slate-800/40 border border-slate-700/20 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim() || chatLoading}
                        className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 transition-all">
                        <Send className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 px-5 py-3.5 border-t border-slate-800/50">
                <button onClick={closeEditor} className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">
                  Cancelar
                </button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleSaveTreino} 
                  disabled={!novoTreino.nome || novoTreino.exercicios.length === 0 || saving}
                  className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingTreino ? 'Salvar Alterações' : 'Criar Treino'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 z-[60] ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachTreinosPage;
