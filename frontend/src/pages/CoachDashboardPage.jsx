import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Copy, Check, RefreshCcw, ChevronRight, Search,
  Dumbbell, TrendingUp, Zap, Star, X, Eye, Link, Edit2, Plus, MessageCircle, Unlink, MessageSquareText, Save
} from 'lucide-react';
import { coachService, treinoService } from '../services';
import { useAuth } from '../context/AuthContext';

const spring = { type: 'spring', damping: 22, stiffness: 260 };

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Avatar = ({ nome, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs' };
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold`}>{initials}</div>;
};

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

export const CoachDashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [allTreinos, setAllTreinos] = useState([]);
  const [alunoTreinos, setAlunoTreinos] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [detailTreino, setDetailTreino] = useState(null);
  const [toast, setToast] = useState(null);
  const [commentTreino, setCommentTreino] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, tRes, treinosRes] = await Promise.all([
        coachService.getAlunos(), 
        coachService.getToken(),
        treinoService.getTreinos().catch(() => ({ data: [] }))
      ]);
      setAlunos((aRes.data || []).map(s => ({
        id: s.student_id || s.id,
        nome: s.student_name || s.nome,
        email: s.student_email || s.email,
        nivel: s.nivel || 1,
        xp: s.xp || 0,
        status: s.status
      })));
      const tokens = tRes.data || [];
      const activeToken = tokens.find(t => t.active);
      setToken(activeToken?.token || '');
      setAllTreinos(treinosRes.data || []);
    } catch {
      setAlunos([
        { id: 1, nome: 'Joao Silva', email: 'joao@email.com', nivel: 5, xp: 2800, treinos_semana: 4 },
        { id: 2, nome: 'Maria Santos', email: 'maria@email.com', nivel: 3, xp: 1200, treinos_semana: 2 },
        { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', nivel: 7, xp: 4100, treinos_semana: 5 },
      ]);
      setToken('ABC-123-XYZ');
    }
    finally { setLoading(false); }
  };

  const fetchAlunoTreinos = useCallback(async (alunoId) => {
    try {
      const res = await coachService.getTreinosAluno(alunoId);
      setAlunoTreinos(res.data || []);
    } catch {
      setAlunoTreinos([]);
    }
  }, []);

  const handleSelectAluno = useCallback(async (aluno) => {
    setSelectedAluno(aluno);
    await fetchAlunoTreinos(aluno.id);
  }, [fetchAlunoTreinos]);

  const handleLinkTreino = useCallback(async (treinoId) => {
    if (!selectedAluno) return;
    setLinking(true);
    try {
      await coachService.assignTreino(treinoId, selectedAluno.id);
      await fetchAlunoTreinos(selectedAluno.id);
      setShowLinkModal(false);
      setToast({ type: 'success', msg: 'Treino vinculado com sucesso!' });
    } catch (err) {
      setToast({ type: 'error', msg: 'Erro ao vincular treino' });
    }
    setLinking(false);
  }, [selectedAluno, fetchAlunoTreinos]);

  const handleUnlinkTreino = useCallback(async (treinoId) => {
    if (!selectedAluno) return;
    try {
      await coachService.unassignTreino(treinoId, selectedAluno.id);
      await fetchAlunoTreinos(selectedAluno.id);
      setToast({ type: 'success', msg: 'Treino desvinculado!' });
    } catch (err) {
      setToast({ type: 'error', msg: 'Erro ao desvincular treino' });
    }
  }, [selectedAluno, fetchAlunoTreinos]);

  const handleSaveComment = useCallback(async () => {
    if (!commentTreino) return;
    setSavingComment(true);
    try {
      await coachService.addTreinoComment(commentTreino.id, commentText);
      if (selectedAluno) await fetchAlunoTreinos(selectedAluno.id);
      setCommentTreino(null);
      setCommentText('');
      setToast({ type: 'success', msg: 'Comentário salvo!' });
    } catch {
      setToast({ type: 'error', msg: 'Erro ao salvar comentário' });
    }
    setSavingComment(false);
  }, [commentTreino, commentText, selectedAluno, fetchAlunoTreinos]);

  const handleCopyToken = useCallback(() => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [token]);

  const handleGenerateToken = useCallback(async () => {
    try {
      const res = await coachService.createInviteToken({ max_uses: 999 });
      setToken(res.data?.token || '');
    } catch {}
  }, []);

  const filtered = useMemo(() => 
    alunos.filter(a =>
      !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [alunos, searchTerm]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Painel do Coach</h1>
        <p className="text-sm text-slate-500">{alunos.length} alunos conectados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Alunos', value: alunos.length, icon: Users, color: 'indigo' },
          { label: 'Ativos (sem)', value: alunos.filter(a => (a.treinos_semana || 0) > 0).length, icon: TrendingUp, color: 'emerald' },
          { label: 'Media XP', value: alunos.length ? Math.round(alunos.reduce((s, a) => s + (a.xp || 0), 0) / alunos.length) : 0, icon: Zap, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ...spring }} className="card-base p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon className={`w-4 h-4 text-${s.color}-400`} />
              <span className="text-[11px] text-slate-500">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Connection Token */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...spring }}
        className="card-base p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Código de Convite
          </h3>
          <button onClick={handleGenerateToken}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Gerar novo
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3.5 py-3 bg-slate-800/40 border border-slate-700/20 rounded-xl text-center text-xl font-mono text-indigo-300 tracking-[0.4em] font-bold">
            {token || '------'}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleCopyToken} disabled={!token}
            className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/15 disabled:opacity-30 transition-all">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
        <p className="text-[11px] text-slate-600 mt-2">Compartilhe este código com seus alunos. Eles inserem na aba "Meu Coach" para se conectar.</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
      </div>

      {/* Students list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum aluno encontrado</div>
        ) : filtered.map((aluno, i) => (
          <motion.div key={aluno.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, ...spring }}
            className="card-base p-4 hover:border-slate-700/30 transition-all group cursor-pointer"
            onClick={() => handleSelectAluno(aluno)}>
            <div className="flex items-center gap-3">
              <Avatar nome={aluno.nome} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{aluno.nome}</div>
                <div className="text-[11px] text-slate-500">{aluno.email}</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Nv.{aluno.nivel || 1}</span>
                <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {aluno.treinos_semana || 0}/sem</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={() => onNavigate('coachTreinos')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/15 transition-all">
        <Dumbbell className="w-4 h-4" /> Gerenciar Treinos dos Alunos
      </motion.button>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedAluno && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setSelectedAluno(null); setAlunoTreinos([]); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={spring} onClick={e => e.stopPropagation()} className="w-full max-w-lg card-base p-6 max-h-[85vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar nome={selectedAluno.nome} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedAluno.nome}</h3>
                    <p className="text-xs text-slate-500">{selectedAluno.email}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedAluno(null); setAlunoTreinos([]); }} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Nivel', value: selectedAluno.nivel || 1 },
                  { label: 'XP', value: selectedAluno.xp || 0 },
                  { label: 'Treinos/sem', value: selectedAluno.treinos_semana || 0 },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Treinos Vinculados */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">Treinos Vinculados</h4>
                  <button 
                    onClick={() => setShowLinkModal(true)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Vincular Treino
                  </button>
                </div>
                {alunoTreinos.length === 0 ? (
                  <div className="text-center py-6 bg-slate-800/20 rounded-xl">
                    <Dumbbell className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Nenhum treino vinculado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alunoTreinos.map((treino, i) => (
                      <motion.div key={treino.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, ...spring }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/10 group/item">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{treino.nome}</div>
                          <div className="text-[10px] text-slate-500">{(treino.exercicios || []).length} exercícios</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setDetailTreino(treino); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Ver detalhes">
                            <Eye className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setCommentTreino(treino); setCommentText(treino.coach_comentario || ''); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all" title="Comentar">
                            <MessageSquareText className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); onNavigate('coachTreinos', { studentId: selectedAluno.id, editTreino: treino }); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Editar">
                            <Edit2 className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleUnlinkTreino(treino.id); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Desvincular">
                            <Unlink className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { const a = selectedAluno; setSelectedAluno(null); setAlunoTreinos([]); onNavigate('chat', { participanteId: a.id, participanteNome: a.nome }); }}
                  className="flex-1 py-2.5 text-sm font-medium bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70 border border-slate-700/20 transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Conversar
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { const a = selectedAluno; setSelectedAluno(null); setAlunoTreinos([]); onNavigate('coachTreinos', { studentId: a.id, studentName: a.nome }); }}
                  className="flex-1 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                  <Dumbbell className="w-4 h-4" /> Gerenciar Treinos
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Treino Modal */}
      <AnimatePresence>
        {showLinkModal && selectedAluno && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowLinkModal(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={spring} onClick={e => e.stopPropagation()} className="w-full max-w-md card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Vincular Treino</h3>
                <button onClick={() => setShowLinkModal(false)} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Selecione um treino para vincular a {selectedAluno.nome}</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allTreinos.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Nenhum treino disponível</p>
                    <p className="text-xs text-slate-600 mt-1">Crie um treino primeiro</p>
                  </div>
                ) : allTreinos.filter(t => !alunoTreinos.find(at => at.id === t.id)).map((treino, i) => (
                  <motion.div key={treino.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/10 hover:border-indigo-500/20 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{treino.nome}</div>
                      <div className="text-[10px] text-slate-500">{(treino.exercicios || []).length} exercícios • {treino.duracao || 45}min</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDetailTreino(treino)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Ver detalhes">
                        <Eye className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleLinkTreino(treino.id)} disabled={linking}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-all disabled:opacity-40" title="Vincular">
                        <Link className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
    </div>
  );
};

export default CoachDashboardPage;
