import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, Search, Users, X, Save, Trash2,
  Edit2, Check, ArrowLeft,
  ChevronRight, Timer, Eye, Unlink, MessageSquare, MessageSquareText,
  ChevronDown, Info, Target
} from 'lucide-react';
import { coachService, exerciciosService } from '../services';
import { useAuth } from '../context/AuthContext';
import { MuscleMap } from '../components/MuscleMap';

const spring = { type: 'spring', damping: 22, stiffness: 260 };

/* ===== Workout Detail Popup ===== */
const WorkoutDetailPopup = ({ treino, onClose }) => {
  if (!treino) return null;
  const exercicios = treino.exercicios || [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={spring} onClick={e => e.stopPropagation()}
        className="w-full max-w-md card-base p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{treino.nome}</h3>
              <p className="text-[11px] text-slate-500">{exercicios.length} exercícios • {treino.duracao || 45}min</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {treino.descricao && (
          <p className="text-sm text-slate-400 mb-4 p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">{treino.descricao}</p>
        )}
        {treino.coach_comentario && (
          <div className="mb-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1 font-medium">Comentário do Coach</div>
            <p className="text-sm text-slate-300">{treino.coach_comentario}</p>
          </div>
        )}
        <div className="space-y-2">
          {exercicios.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-4">Nenhum exercício adicionado</p>
          ) : exercicios.map((ex, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/10">
              <span className="text-xs font-bold text-indigo-400 w-5 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{ex.nome || ex.exercicio_nome || 'Exercício'}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{ex.series_sugeridas || ex.series || 3} séries</span>
                  <span className="text-slate-700">·</span>
                  <span>{ex.reps_sugeridas || ex.reps || 12} reps</span>
                  {ex.grupo_muscular && <><span className="text-slate-700">·</span><span>{ex.grupo_muscular}</span></>}
                </div>
              </div>
              {ex.tecnica && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">{ex.tecnica}</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

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
  const [detailTreino, setDetailTreino] = useState(null);
  const [commentTreino, setCommentTreino] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);

  useEffect(() => { fetchAlunos(); fetchExercicios(); }, []);
  useEffect(() => { if (selectedAluno) fetchTreinos(); }, [selectedAluno]);
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
        descricao: e.descricao || '',
        instrucoes: e.instrucoes || '',
        dicas: e.dicas || '',
        musculos_trabalhados: e.musculos_trabalhados || '',
        nivel: e.nivel || 'iniciante',
        equipamento: e.equipamento || '',
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
      coach_comentario: novoTreino.coach_comentario || null,
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
    setNovoTreino({ nome: '', descricao: '', coach_comentario: '', exercicios: [] });
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
      coach_comentario: treino.coach_comentario || '',
      exercicios: exerciciosFormatados
    });
    setShowEditorModal(true);
  };

  const closeEditor = () => {
    setShowEditorModal(false);
    setEditingTreino(null);
    setNovoTreino({ nome: '', descricao: '', coach_comentario: '', exercicios: [] });
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

  const handleUnlinkTreino = async (treinoId) => {
    if (!selectedAluno) return;
    try {
      await coachService.unassignTreino(treinoId, selectedAluno.id);
      await fetchTreinos();
      setToast({ type: 'success', msg: 'Treino desvinculado!' });
    } catch {
      setToast({ type: 'error', msg: 'Erro ao desvincular treino' });
    }
  };

  const handleSaveComment = async () => {
    if (!commentTreino) return;
    setSavingComment(true);
    try {
      await coachService.addTreinoComment(commentTreino.id, commentText);
      await fetchTreinos();
      setCommentTreino(null);
      setCommentText('');
      setToast({ type: 'success', msg: 'Comentário salvo!' });
    } catch {
      setToast({ type: 'error', msg: 'Erro ao salvar comentário' });
    }
    setSavingComment(false);
  };

  const filteredAlunos = alunos.filter(a => !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Group exercises by muscle group
  const groupedExercicios = useMemo(() => {
    const groups = {};
    exercicios.forEach(ex => {
      const g = ex.grupo || 'Outros';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ex);
    });
    return groups;
  }, [exercicios]);

  const muscleGroups = useMemo(() => Object.keys(groupedExercicios).sort(), [groupedExercicios]);
  
  const filteredGroupedEx = useMemo(() => {
    if (!searchEx) return groupedExercicios;
    const result = {};
    const term = searchEx.toLowerCase();
    Object.entries(groupedExercicios).forEach(([group, exs]) => {
      const filtered = exs.filter(e => 
        (e.nome || '').toLowerCase().includes(term) || 
        (e.grupo || '').toLowerCase().includes(term) ||
        (e.musculos_trabalhados || '').toLowerCase().includes(term)
      );
      if (filtered.length > 0) result[group] = filtered;
    });
    return result;
  }, [groupedExercicios, searchEx]);

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
          onClick={() => onNavigate('chat', { participanteId: selectedAluno.id, participanteNome: selectedAluno.nome })}
          className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/50 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800/70 border border-slate-700/20 transition-all">
          <MessageSquare className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={openNewTreino}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Novo Treino
        </motion.button>
      </div>

      <div className="space-y-2">
        {treinos.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ...spring }}
            className="card-base p-4 hover:border-slate-700/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t.nome}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.descricao || `${(t.exercicios || []).length} exercícios`}</p>
                {t.coach_comentario && (
                  <p className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
                    <MessageSquareText className="w-3 h-3" /> {t.coach_comentario.length > 40 ? t.coach_comentario.slice(0, 40) + '...' : t.coach_comentario}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 bg-slate-800/30 px-2 py-1 rounded-lg mr-1">
                  {(t.exercicios || []).length} ex.
                </span>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setDetailTreino(t)}
                  className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-all"
                  title="Ver detalhes">
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setCommentTreino(t); setCommentText(t.coach_comentario || ''); }}
                  className="p-2 rounded-lg hover:bg-purple-500/10 text-slate-500 hover:text-purple-400 transition-all"
                  title="Comentar">
                  <MessageSquareText className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => openEditTreino(t)}
                  className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-all"
                  title="Editar treino">
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleUnlinkTreino(t.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                  title="Desvincular treino">
                  <Unlink className="w-4 h-4" />
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

              {/* Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Workout Editor */}
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

                    {/* Exercise Catalog — grouped by muscle */}
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-slate-400">Catálogo de Exercícios</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input 
                          value={searchEx} 
                          onChange={e => { setSearchEx(e.target.value); setActiveGroup(null); }}
                          placeholder="Buscar exercício, grupo muscular..."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
                      </div>

                      {/* Muscle Group Tabs */}
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={() => setActiveGroup(null)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                            !activeGroup ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'bg-slate-800/30 text-slate-500 hover:text-slate-300 border border-transparent'
                          }`}>
                          Todos
                        </button>
                        {muscleGroups.map(g => (
                          <button 
                            key={g}
                            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                              activeGroup === g ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'bg-slate-800/30 text-slate-500 hover:text-slate-300 border border-transparent'
                            }`}>
                            {g} ({groupedExercicios[g]?.length})
                          </button>
                        ))}
                      </div>

                      {/* Exercise List by Group */}
                      <div className="max-h-[400px] overflow-y-auto scrollbar-thin space-y-3 pr-1">
                        {Object.entries(activeGroup ? { [activeGroup]: filteredGroupedEx[activeGroup] || [] } : filteredGroupedEx).map(([group, exs]) => (
                          <div key={group}>
                            <div className="flex items-center gap-2 mb-1.5 sticky top-0 py-1" style={{ background: '#0c0f1a' }}>
                              <MuscleMap grupo={group} size={28} />
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{group}</span>
                              <span className="text-[10px] text-slate-600">({exs.length})</span>
                              <div className="flex-1 border-t border-slate-800/40" />
                            </div>
                            <div className="space-y-1">
                              {exs.map(ex => {
                                const added = novoTreino.exercicios.some(e => e.id === ex.id);
                                const isExpanded = expandedExercise === ex.id;
                                return (
                                  <div key={ex.id} className="rounded-xl border border-slate-700/10 overflow-hidden transition-all hover:border-slate-700/20"
                                    style={{ background: added ? 'rgba(99,102,241,0.04)' : 'rgba(30,34,56,0.3)' }}>
                                    {/* Exercise Header Row */}
                                    <div className="flex items-center gap-2 p-2.5">
                                      <MuscleMap grupo={ex.grupo} size={36} className="flex-shrink-0" />
                                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}>
                                        <div className="text-xs font-medium text-white truncate">{ex.nome}</div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                            ex.nivel === 'avancado' ? 'bg-red-500/10 text-red-400' :
                                            ex.nivel === 'intermediario' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-emerald-500/10 text-emerald-400'
                                          }`}>
                                            {ex.nivel === 'avancado' ? 'Avançado' : ex.nivel === 'intermediario' ? 'Intermed.' : 'Iniciante'}
                                          </span>
                                          {ex.equipamento && <span className="truncate max-w-[100px]">{ex.equipamento}</span>}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                                          className="p-1 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-indigo-400 transition-all">
                                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                        <button onClick={() => !added && addExToTreino(ex)} disabled={added}
                                          className={`p-1.5 rounded-lg transition-all ${
                                            added ? 'text-emerald-400 cursor-default' : 'text-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
                                          }`}>
                                          {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }} 
                                          animate={{ height: 'auto', opacity: 1 }} 
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden">
                                          <div className="px-3 pb-3 space-y-2 border-t border-slate-700/10 pt-2">
                                            <div className="flex gap-3">
                                              <MuscleMap grupo={ex.grupo} size={80} className="flex-shrink-0" />
                                              <div className="flex-1 space-y-2 min-w-0">
                                                {ex.descricao && (
                                                  <p className="text-[11px] text-slate-400 leading-relaxed">{ex.descricao}</p>
                                                )}
                                                {ex.musculos_trabalhados && (
                                                  <div>
                                                    <div className="text-[9px] text-emerald-400 uppercase font-medium mb-0.5 flex items-center gap-1">
                                                      <Target className="w-2.5 h-2.5" /> Músculos
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                      {ex.musculos_trabalhados.split(',').map((m, i) => (
                                                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                                          {m.trim()}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {ex.instrucoes && (
                                              <div className="p-2 rounded-lg bg-slate-800/20 border border-slate-700/10">
                                                <div className="text-[9px] text-blue-400 uppercase font-medium mb-1 flex items-center gap-1">
                                                  <Info className="w-2.5 h-2.5" /> Como executar
                                                </div>
                                                <div className="space-y-0.5">
                                                  {ex.instrucoes.split('\n').filter(l => l.trim()).map((line, i) => (
                                                    <div key={i} className="text-[10px] text-slate-400 flex gap-1.5">
                                                      <span className="text-blue-400 font-bold">{i + 1}.</span>
                                                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {ex.dicas && (
                                              <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                <p className="text-[10px] text-amber-400">{ex.dicas}</p>
                                              </div>
                                            )}
                                            {!added && (
                                              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                                onClick={() => addExToTreino(ex)}
                                                className="w-full py-2 text-[11px] font-medium bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/15 transition-all flex items-center justify-center gap-1.5">
                                                <Plus className="w-3 h-3" /> Adicionar ao Treino
                                              </motion.button>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {Object.keys(activeGroup ? { [activeGroup]: filteredGroupedEx[activeGroup] || [] } : filteredGroupedEx).length === 0 && (
                          <div className="text-center py-6 text-xs text-slate-600">
                            Nenhum exercício encontrado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coach Comment */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <MessageSquareText className="w-3 h-3 text-purple-400" /> Comentário do Coach
                      </span>
                      <textarea 
                        value={novoTreino.coach_comentario || ''} 
                        onChange={e => setNovoTreino(p => ({ ...p, coach_comentario: e.target.value }))} 
                        placeholder="Adicione observações, dicas ou instruções para o aluno..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-purple-500/5 border border-purple-500/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/30 transition-colors resize-none" />
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
            transition={spring}
            className={`fixed bottom-6 left-1/2 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 z-[80] shadow-xl ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Detail Popup */}
      <AnimatePresence>
        {detailTreino && <WorkoutDetailPopup treino={detailTreino} onClose={() => setDetailTreino(null)} />}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {commentTreino && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setCommentTreino(null); setCommentText(''); }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={spring} onClick={e => e.stopPropagation()} className="w-full max-w-md card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-purple-400" /> Comentário do Treino
                </h3>
                <button onClick={() => { setCommentTreino(null); setCommentText(''); }} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-3">Adicione um comentário ao treino <strong className="text-white">{commentTreino.nome}</strong></p>
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={4}
                placeholder="Digite seu comentário sobre o treino..."
                className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/30 transition-colors resize-none mb-4" />
              <div className="flex gap-2">
                <button onClick={() => { setCommentTreino(null); setCommentText(''); }}
                  className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">Cancelar</button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleSaveComment} disabled={savingComment}
                  className="flex-1 py-2.5 text-sm font-medium bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  {savingComment ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachTreinosPage;
