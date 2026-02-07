import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, Search, Users, ChevronDown, X, Save, Trash2,
  GripVertical, Edit2, Check, ArrowLeft
} from 'lucide-react';
import { coachService, exerciciosService } from '../services';
import { useAuth } from '../context/AuthContext';

const Avatar = ({ nome }) => {
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold text-[10px]`}>{initials}</div>;
};

export const CoachTreinosPage = ({ onNavigate }) => {
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [novoTreino, setNovoTreino] = useState({ nome: '', descricao: '', exercicios: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEx, setSearchEx] = useState('');

  useEffect(() => { fetchAlunos(); }, []);
  useEffect(() => { if (selectedAluno) fetchTreinos(); }, [selectedAluno]);

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

  const handleCreate = async () => {
    try {
      await coachService.criarTreinoAluno(selectedAluno.id, novoTreino);
      fetchTreinos();
    } catch {}
    setShowCreateModal(false);
    setNovoTreino({ nome: '', descricao: '', exercicios: [] });
  };

  const addExToTreino = (ex) => {
    setNovoTreino(prev => ({
      ...prev,
      exercicios: [...prev.exercicios, { ...ex, series: 3, reps: 12, carga: 0 }]
    }));
  };

  const removeExFromTreino = (idx) => {
    setNovoTreino(prev => ({ ...prev, exercicios: prev.exercicios.filter((_, i) => i !== idx) }));
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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all">
          <Plus className="w-4 h-4" /> Novo Treino
        </motion.button>
      </div>

      <div className="space-y-2">
        {treinos.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{t.nome}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.descricao || `${(t.exercicios || []).length} exercicios`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-800/30 px-2 py-1 rounded-lg">
                  {(t.exercicios || []).length} ex.
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {treinos.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum treino criado para este aluno</div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg card-base p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Novo Treino</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-800/40">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <input value={novoTreino.nome} onChange={e => setNovoTreino(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do treino"
                  className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                <input value={novoTreino.descricao} onChange={e => setNovoTreino(p => ({ ...p, descricao: e.target.value }))} placeholder="Descricao (opcional)"
                  className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
              </div>

              {/* Selected exercises */}
              {novoTreino.exercicios.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Exercicios selecionados:</span>
                  {novoTreino.exercicios.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/20">
                      <span className="text-xs text-white flex-1">{ex.nome}</span>
                      <input value={ex.series} onChange={e => {
                        const updated = [...novoTreino.exercicios];
                        updated[i].series = Number(e.target.value);
                        setNovoTreino(p => ({ ...p, exercicios: updated }));
                      }} className="w-12 px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-center text-white" placeholder="Ser" />
                      <span className="text-[10px] text-slate-600">x</span>
                      <input value={ex.reps} onChange={e => {
                        const updated = [...novoTreino.exercicios];
                        updated[i].reps = Number(e.target.value);
                        setNovoTreino(p => ({ ...p, exercicios: updated }));
                      }} className="w-12 px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-center text-white" placeholder="Rep" />
                      <button onClick={() => removeExFromTreino(i)} className="p-1 text-red-400/50 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercise search */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input value={searchEx} onChange={e => setSearchEx(e.target.value)} placeholder="Buscar exercicio..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/40 border border-slate-700/20 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/30" />
                </div>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {filteredEx.slice(0, 10).map(ex => (
                    <button key={ex.id} onClick={() => addExToTreino(ex)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-500/5 text-left transition-all">
                      <div>
                        <span className="text-xs text-white">{ex.nome}</span>
                        {ex.grupo && <span className="text-[10px] text-slate-500 ml-2">{ex.grupo}</span>}
                      </div>
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">Cancelar</button>
                <button onClick={handleCreate} disabled={!novoTreino.nome}
                  className="flex-1 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Criar Treino
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
