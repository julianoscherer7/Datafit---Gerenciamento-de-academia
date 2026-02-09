import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Plus, Clock, Edit2, Trash2, X, Play, Save, AlertCircle, Check,
  Search, Filter, Bot, Send, ChevronRight, Grip, MoreVertical
} from 'lucide-react';
import { treinoService, exerciciosService, aiService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

// ===== COLUMN 1: Exercise List =====
const ExerciseList = ({ treinos, selectedTreino, onSelect, onCreateNew, loading }) => (
  <div className="h-full flex flex-col" style={{ borderRight: '1px solid rgba(148,163,184,0.06)' }}>
    <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
      <h2 className="text-sm font-semibold text-white">Meus Treinos</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateNew}
        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
      {loading ? (
        <>{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</>
      ) : treinos.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Dumbbell className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-3">Nenhum treino ainda</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            className="text-xs btn-primary"
          >
            <Plus className="w-3.5 h-3.5 mr-1 inline" />
            Criar Treino
          </motion.button>
        </div>
      ) : treinos.map((treino, i) => (
        <motion.button
          key={treino.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(treino)}
          className={`w-full text-left p-3 rounded-xl transition-all ${
            selectedTreino?.id === treino.id
              ? 'bg-indigo-500/10 border border-indigo-500/20'
              : 'hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              selectedTreino?.id === treino.id ? 'bg-indigo-500/20' : 'bg-slate-800/50'
            }`}>
              <Dumbbell className={`w-4 h-4 ${selectedTreino?.id === treino.id ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${selectedTreino?.id === treino.id ? 'text-white' : 'text-slate-300'}`}>
                {treino.nome}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{treino.exercicios?.length || treino.exercicios_count || 0} exerc.</span>
                <span>·</span>
                <span>{treino.duracao || 45}min</span>
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

// ===== COLUMN 2: Workout Editor =====
const WorkoutEditor = ({ treino, exerciciosDisponiveis, onSave, onDelete, onCreateExercise, onUpdateExercicios, saving }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '', duracao: 45, exercicios_detalhados: [] });
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExGrupo, setNewExGrupo] = useState('');

  const gruposMusculares = ['Peito', 'Costas', 'Ombros', 'Biceps', 'Triceps', 'Pernas', 'Gluteos', 'Abdomen', 'Cardio'];
  
  const tecnicasAvancadas = [
    { id: 'dropset', nome: 'Drop Set', desc: 'Reduz carga sem descanso' },
    { id: 'restpause', nome: 'Rest-Pause', desc: 'Pausa 10-15s e continua' },
    { id: 'supersets', nome: 'Super Set', desc: 'Dois exercícios sem pausa' },
    { id: 'negativa', nome: 'Negativa', desc: 'Foco na fase excêntrica' },
    { id: 'isometria', nome: 'Isometria', desc: 'Manter contração' },
  ];

  useEffect(() => {
    if (treino) {
      const exercicios = (treino.exercicios || []).map(e => ({
        id: e.id || e.exercicio_id,
        exercicio_id: e.id || e.exercicio_id,
        nome: e.nome || e.exercicio_nome,
        grupo_muscular: e.grupo_muscular,
        series: e.series_sugeridas || e.series || '3',
        reps: e.reps_sugeridas || e.reps || '12',
        reps_min: e.reps_min || '',
        reps_max: e.reps_max || '',
        tecnica: e.tecnica || '',
        tecnica_obs: e.tecnica_obs || '',
      }));
      setFormData({
        nome: treino.nome || '',
        descricao: treino.descricao || '',
        duracao: treino.duracao || 45,
        exercicios_detalhados: exercicios
      });
      setEditing(false);
    }
  }, [treino?.id, treino?.exercicios]);

  const handleSave = async () => {
    const data = {
      nome: formData.nome, 
      descricao: formData.descricao, 
      duracao: formData.duracao,
      exercicios: formData.exercicios_detalhados.map((ex, i) => ({
        exercicio_id: ex.exercicio_id || ex.id, 
        ordem: i + 1, 
        series_sugeridas: ex.series || "3",
        reps_sugeridas: ex.reps_min && ex.reps_max ? `${ex.reps_min}-${ex.reps_max}` : (ex.reps || "12"),
        tecnica: ex.tecnica || null,
        tecnica_obs: ex.tecnica_obs || null
      }))
    };
    await onSave(data, treino?.id);
    setEditing(false);
  };
  
  const addExercicio = (ex) => {
    const newEx = {
      id: ex.id,
      exercicio_id: ex.id,
      nome: ex.nome,
      grupo_muscular: ex.grupo_muscular,
      series: '3',
      reps: '12',
      reps_min: '',
      reps_max: '',
      tecnica: '',
      tecnica_obs: ''
    };
    setFormData(prev => ({
      ...prev,
      exercicios_detalhados: [...prev.exercicios_detalhados, newEx]
    }));
  };
  
  const removeExercicio = (exId) => {
    setFormData(prev => ({
      ...prev,
      exercicios_detalhados: prev.exercicios_detalhados.filter(e => (e.id || e.exercicio_id) !== exId)
    }));
  };
  
  const updateExercicio = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.exercicios_detalhados];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, exercicios_detalhados: updated };
    });
  };

  if (!treino) {
    return (
      <div className="h-full flex items-center justify-center" style={{ borderRight: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="text-center px-8">
          <Dumbbell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Selecione um treino para editar</p>
          <p className="text-xs text-slate-600 mt-1">Ou crie um novo treino no painel esquerdo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ borderRight: '1px solid rgba(148,163,184,0.06)' }}>
      {/* Toolbar */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="flex items-center gap-2">
          {editing ? (
            <input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="text-sm font-semibold text-white bg-transparent border-b border-indigo-500 pb-0.5 outline-none" />
          ) : (
            <h2 className="text-sm font-semibold text-white">{treino.nome}</h2>
          )}
          {!editing && (
            <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
              {formData.exercicios_detalhados?.length || treino.exercicios?.length || 0} exerc.
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {editing ? (
            <>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <X className="w-4 h-4" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-all disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <Edit2 className="w-4 h-4" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => onDelete(treino)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 space-y-3">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 block">Descrição</label>
              <textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="input-base text-sm resize-none" rows={2} placeholder="Objetivo do treino..." />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 block">Duração: {formData.duracao}min</label>
              <input type="range" min="15" max="120" step="5" value={formData.duracao}
                onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>
          </motion.div>
        )}

        {/* Exercises list */}
        {(editing ? formData.exercicios_detalhados : (treino.exercicios || [])).map((ex, i) => (
          <motion.div
            key={ex.id || ex.exercicio_id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:border-slate-700/40 transition-all group ${editing ? 'space-y-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono w-5">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{ex.nome || ex.exercicio_nome || `Exercício ${i+1}`}</div>
                {!editing && (
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{ex.series_sugeridas || ex.series || 3} séries</span>
                    <span className="text-slate-700">·</span>
                    <span>{ex.reps_sugeridas || ex.reps || 12} reps</span>
                    {ex.grupo_muscular && <>
                      <span className="text-slate-700">·</span>
                      <span>{ex.grupo_muscular}</span>
                    </>}
                    {ex.tecnica && (
                      <span className="text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">{ex.tecnica}</span>
                    )}
                  </div>
                )}
              </div>
              {editing && (
                <button onClick={() => removeExercicio(ex.id || ex.exercicio_id)}
                  className="p-1 text-slate-600 hover:text-red-400 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Editing mode - Series/Reps/Technique inputs */}
            {editing && (
              <div className="pt-2 space-y-2 border-t border-slate-700/20 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-600 mb-0.5 block">Séries</label>
                    <input type="number" min="1" max="10" value={ex.series || '3'}
                      onChange={(e) => updateExercicio(i, 'series', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white text-center" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-600 mb-0.5 block">Reps (fixo)</label>
                    <input type="text" value={ex.reps || '12'} placeholder="12"
                      onChange={(e) => updateExercicio(i, 'reps', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white text-center" />
                  </div>
                  <div className="text-[9px] text-slate-600 px-1">ou</div>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-600 mb-0.5 block">Min</label>
                    <input type="number" min="1" max="50" value={ex.reps_min || ''} placeholder="8"
                      onChange={(e) => updateExercicio(i, 'reps_min', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white text-center" />
                  </div>
                  <span className="text-slate-600">-</span>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-600 mb-0.5 block">Max</label>
                    <input type="number" min="1" max="50" value={ex.reps_max || ''} placeholder="12"
                      onChange={(e) => updateExercicio(i, 'reps_max', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 mb-0.5 block">Técnica Avançada (opcional)</label>
                  <select value={ex.tecnica || ''} onChange={(e) => updateExercicio(i, 'tecnica', e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white">
                    <option value="">Nenhuma</option>
                    {tecnicasAvancadas.map(t => (
                      <option key={t.id} value={t.nome}>{t.nome} - {t.desc}</option>
                    ))}
                  </select>
                </div>
                {ex.tecnica && (
                  <div>
                    <label className="text-[9px] text-slate-600 mb-0.5 block">Observação da técnica</label>
                    <input type="text" value={ex.tecnica_obs || ''} placeholder="Ex: Drop set na última série"
                      onChange={(e) => updateExercicio(i, 'tecnica_obs', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/40 border border-slate-700/20 rounded text-xs text-white" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {editing && (
          <div className="pt-3 space-y-2">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Adicionar exercícios</div>
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-800/20 border border-slate-700/20">
              {exerciciosDisponiveis.filter(ex => !formData.exercicios_detalhados.some(e => (e.id || e.exercicio_id) === ex.id)).map(ex => (
                <button key={ex.id} onClick={() => addExercicio(ex)}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors text-sm text-slate-400 hover:text-white">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{ex.nome}</span>
                  {ex.grupo_muscular && <span className="text-[10px] text-slate-600">({ex.grupo_muscular})</span>}
                </button>
              ))}
            </div>
            {!showAddExercise ? (
              <button onClick={() => setShowAddExercise(true)}
                className="w-full text-xs text-indigo-400 p-2 border border-dashed border-slate-700 rounded-lg hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                + Criar novo exercício
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 space-y-2">
                <input value={newExName} onChange={(e) => setNewExName(e.target.value)} placeholder="Nome do exercício"
                  className="input-base text-sm py-2" />
                <select value={newExGrupo} onChange={(e) => setNewExGrupo(e.target.value)}
                  className="input-base text-sm py-2">
                  <option value="">Grupo muscular</option>
                  {gruposMusculares.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { setShowAddExercise(false); setNewExName(''); setNewExGrupo(''); }}
                    className="flex-1 btn-ghost text-xs py-1.5">Cancelar</button>
                  <button onClick={async () => {
                    if (newExName.trim()) {
                      const newEx = await onCreateExercise({ nome: newExName, grupo_muscular: newExGrupo });
                      if (newEx?.data?.id) {
                        addExercicio(newEx.data);
                      }
                      setNewExName(''); setNewExGrupo(''); setShowAddExercise(false);
                    }
                  }} disabled={!newExName.trim()} className="flex-1 btn-primary text-xs py-1.5 disabled:opacity-50">Criar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {!editing && treino.descricao && (
          <div className="mt-3 p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Descricao</div>
            <p className="text-sm text-slate-400">{treino.descricao}</p>
          </div>
        )}

        {/* Coach comment section */}
        {treino.coach_comentario && (
          <div className="mt-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="text-[11px] text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              Comentario do Coach
            </div>
            <p className="text-sm text-slate-300">{treino.coach_comentario}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== COLUMN 3: FitBot Assistant =====
const FitBotPanel = ({ treino }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Ola! Sou o FitBot. Posso analisar seu treino e sugerir melhorias. O que voce gostaria de saber?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const context = treino ? `Treino atual: ${treino.nome}. Exercicios: ${(treino.exercicios || []).map(e => e.nome || e.exercicio_nome).join(', ')}` : null;
      const res = await aiService.chat(userMsg, context);
      setMessages(prev => [...prev, { role: 'bot', content: res.data?.resposta || res.data?.response || 'Sem resposta no momento.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Desculpe, houve um erro. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Esse treino esta equilibrado?',
    'Sugira um exercicio equivalente',
    'Esta adequado para hipertrofia?',
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">FitBot</h2>
          <p className="text-[10px] text-slate-500">Assistente contextual</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-500 text-white rounded-br-md'
                : 'bg-slate-800/60 text-slate-300 border border-slate-700/20 rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/60 border border-slate-700/20 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setInput(s); }}
              className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700/20 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Pergunte ao FitBot..."
            className="flex-1 px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-30 hover:bg-indigo-400 transition-colors">
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ===== MODALS =====
const CreateTreinoModal = ({ isOpen, onClose, onSave, exerciciosDisponiveis }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setLoading(true);
    try {
      await onSave({ nome, descricao, duracao: 45, exercicios: [] });
      setNome(''); setDescricao('');
      onClose();
    } catch (err) {} finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'rgba(26,31,46,0.95)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Novo Treino</h2>
        <div className="space-y-3">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do treino"
            className="input-base" autoFocus />
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descricao (opcional)"
            className="input-base resize-none" rows={2} />
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 btn-ghost py-2.5">Cancelar</button>
            <button onClick={handleSubmit} disabled={!nome.trim() || loading}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Treino'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, nome, loading }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: 'rgba(26,31,46,0.95)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Excluir treino?</h3>
        <p className="text-sm text-slate-400 mb-5">"{nome}" sera removido permanentemente.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 btn-ghost py-2.5">Cancelar</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl font-medium transition-all disabled:opacity-50">
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===== MAIN PAGE =====
export const TreinosPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, treino: null });
  const [notification, setNotification] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, e] = await Promise.allSettled([treinoService.getTreinos(), exerciciosService.getExercicios()]);
      const treinosList = t.status === 'fulfilled' ? (t.value.data || []) : [];
      setTreinos(treinosList);
      if (e.status === 'fulfilled') setExercicios(e.value.data || []);
      if (!selectedTreino && treinosList.length > 0) setSelectedTreino(treinosList[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveTreino = async (data, treinoId) => {
    setSaving(true);
    try {
      let updatedId = treinoId;
      if (treinoId) {
        await treinoService.updateTreino(treinoId, data);
      } else {
        const res = await treinoService.createTreino(data);
        updatedId = res?.data?.id;
      }
      // Refresh data and move edited training to top
      const [t, e] = await Promise.allSettled([treinoService.getTreinos(), exerciciosService.getExercicios()]);
      let treinosList = t.status === 'fulfilled' ? (t.value.data || []) : [];
      if (e.status === 'fulfilled') setExercicios(e.value.data || []);
      
      // Move edited/created training to top
      if (updatedId) {
        const editedIndex = treinosList.findIndex(tr => tr.id === updatedId);
        if (editedIndex > 0) {
          const [edited] = treinosList.splice(editedIndex, 1);
          treinosList.unshift(edited);
        }
        setSelectedTreino(treinosList.find(tr => tr.id === updatedId) || treinosList[0]);
      }
      setTreinos(treinosList);
    } catch (err) { throw err; }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal.treino) return;
    setSaving(true);
    try {
      await treinoService.deleteTreino(deleteModal.treino.id);
      if (selectedTreino?.id === deleteModal.treino.id) setSelectedTreino(null);
      setDeleteModal({ open: false, treino: null });
      await fetchData();
    } catch (err) {}
    finally { setSaving(false); }
  };

  const handleCreateExercise = async (data) => {
    const res = await exerciciosService.createExercicio(data);
    await fetchData();
    return res;
  };

  return (
    <>
      <div className="h-[calc(100vh-var(--header-height,64px)-80px)] rounded-2xl overflow-hidden"
        style={{ background: 'rgba(26,31,46,0.4)', border: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* Col 1: Exercise List */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            <ExerciseList treinos={treinos} selectedTreino={selectedTreino} onSelect={setSelectedTreino}
              onCreateNew={() => setCreateModalOpen(true)} loading={loading} />
          </div>
          {/* Col 2: Editor */}
          <div className="lg:col-span-5 h-full overflow-hidden">
            <WorkoutEditor treino={selectedTreino} exerciciosDisponiveis={exercicios}
              onSave={handleSaveTreino} onDelete={(t) => setDeleteModal({ open: true, treino: t })}
              onCreateExercise={handleCreateExercise} saving={saving} />
          </div>
          {/* Col 3: FitBot */}
          <div className="hidden lg:block lg:col-span-4 h-full overflow-hidden">
            <FitBotPanel treino={selectedTreino} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {createModalOpen && <CreateTreinoModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}
          onSave={(data) => handleSaveTreino(data)} exerciciosDisponiveis={exercicios} />}
        {deleteModal.open && <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, treino: null })}
          onConfirm={handleDelete} nome={deleteModal.treino?.nome} loading={saving} />}
      </AnimatePresence>
    </>
  );
};

export default TreinosPage;
