import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, ArrowLeft, Users, Search, Lock, Unlock,
  Save, X, Check, AlertCircle, ChevronDown, Bot, Trash2
} from 'lucide-react';
import { treinoService, exerciciosService, coachService, aiService } from '../services';
import { useAuth } from '../context/AuthContext';

const gruposMusculares = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Pernas', 'Glúteos', 'Abdômen', 'Antebraço', 'Cardio'
];

export const CoachTreinosPage = ({ onNavigate, studentId: initialStudentId, studentName: initialStudentName }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId || null);
  const [selectedStudentName, setSelectedStudentName] = useState(initialStudentName || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 60,
    locked: true,
    exercicios_selecionados: []
  });

  const [filterGrupo, setFilterGrupo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, exerciciosRes] = await Promise.all([
        coachService.getMyStudents(),
        exerciciosService.list()
      ]);
      setStudents(studentsRes.data.filter(s => s.status === 'active'));
      setExercicios(exerciciosRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      setError('Selecione um aluno');
      return;
    }
    if (!formData.nome.trim()) {
      setError('Nome do treino é obrigatório');
      return;
    }
    if (formData.exercicios_selecionados.length === 0) {
      setError('Selecione pelo menos um exercício');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await treinoService.create({
        nome: formData.nome,
        descricao: formData.descricao,
        duracao: formData.duracao,
        exercicio_ids: formData.exercicios_selecionados,
        origem: 'coach',
        locked: formData.locked,
        aluno_id: selectedStudent
      });
      setSuccess(`Treino "${formData.nome}" criado com sucesso para ${selectedStudentName}!`);
      setFormData({ nome: '', descricao: '', duracao: 60, locked: true, exercicios_selecionados: [] });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar treino');
    } finally {
      setSaving(false);
    }
  };

  const toggleExercicio = (id) => {
    setFormData(prev => ({
      ...prev,
      exercicios_selecionados: prev.exercicios_selecionados.includes(id)
        ? prev.exercicios_selecionados.filter(eid => eid !== id)
        : [...prev.exercicios_selecionados, id]
    }));
  };

  const loadAISuggestions = async (objetivo = 'hipertrofia', nivel = 'intermediario') => {
    setAiLoading(true);
    try {
      const res = await aiService.getTrainingPlan(objetivo, nivel, 5);
      setAiSuggestions(res.data);
      setShowAISuggestion(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredExercicios = filterGrupo
    ? exercicios.filter(e => e.grupo_muscular === filterGrupo)
    : exercicios;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('coachDashboard')}
          className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-white">Criar Treino para Aluno</h1>
          <p className="text-slate-400 text-sm">Monte um treino personalizado</p>
        </div>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Selection */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Users className="w-4 h-4 inline mr-1" /> Selecionar Aluno
        </label>
        <select
          value={selectedStudent || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedStudent(id);
            const student = students.find(s => s.student_id === id);
            setSelectedStudentName(student?.student_name || '');
          }}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Escolha um aluno...</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>{s.student_name} ({s.student_email})</option>
          ))}
        </select>
      </div>

      {/* Workout Details */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-purple-400" /> Detalhes do Treino
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Treino</label>
            <input
              type="text"
              value={formData.nome}
              onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Duração (min)</label>
            <input
              type="number"
              value={formData.duracao}
              onChange={e => setFormData(prev => ({ ...prev, duracao: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
              min="10"
              max="180"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
          <textarea
            value={formData.descricao}
            onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Observações para o aluno..."
            rows={2}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormData(prev => ({ ...prev, locked: !prev.locked }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              formData.locked
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600'
            }`}
          >
            {formData.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {formData.locked ? 'Treino bloqueado (aluno não edita)' : 'Treino livre (aluno pode editar)'}
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" /> Sugestões da AI
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadAISuggestions()}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" />
            {aiLoading ? 'Gerando...' : 'Gerar Plano'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showAISuggestion && aiSuggestions && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                <p className="text-sm text-slate-300">{aiSuggestions.plano?.descricao || aiSuggestions.response}</p>
                {aiSuggestions.plano?.divisao && (
                  <div className="space-y-2">
                    {Object.entries(aiSuggestions.plano.divisao).map(([dia, info]) => (
                      <div key={dia} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-purple-400 font-medium text-sm">{dia}: {info.foco}</p>
                        <p className="text-slate-400 text-xs">{info.exercicios?.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowAISuggestion(false)}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Fechar sugestões
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise Selection */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Exercícios ({formData.exercicios_selecionados.length} selecionados)
          </h2>
        </div>

        {/* Filter by grupo */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterGrupo('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filterGrupo ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {gruposMusculares.map(g => (
            <button
              key={g}
              onClick={() => setFilterGrupo(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterGrupo === g ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filteredExercicios.map(ex => {
            const isSelected = formData.exercicios_selecionados.includes(ex.id);
            return (
              <motion.button
                key={ex.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => toggleExercicio(ex.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-purple-500' : 'bg-slate-600'
                }`}>
                  {isSelected ? <Check className="w-4 h-4 text-white" /> : <Dumbbell className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ex.nome}</p>
                  <p className="text-slate-400 text-xs">{ex.grupo_muscular} {ex.nivel ? `• ${ex.nivel}` : ''}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving || !selectedStudent || !formData.nome.trim()}
        className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Criar Treino para {selectedStudentName || 'Aluno'}
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default CoachTreinosPage;
