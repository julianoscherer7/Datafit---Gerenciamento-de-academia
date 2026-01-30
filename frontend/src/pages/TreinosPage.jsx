import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Plus, Clock, Flame, Edit2, Trash2, X, 
  ChevronRight, Play, Save, AlertCircle, Check
} from 'lucide-react';
import { Card, Button, Modal, PhotoValidationModal } from '../components/common';
import { ProgressBar } from '../components/common';
import { treinoService, exerciciosService } from '../services';
import { useAuth } from '../context/AuthContext';

// Skeleton for loading states
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Empty state component
const EmptyState = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
      <Dumbbell className="w-10 h-10 text-purple-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Nenhum treino ainda</h3>
    <p className="text-slate-400 mb-6">Crie seu primeiro treino personalizado e comece sua jornada fitness!</p>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCreateClick}
      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all inline-flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Criar Primeiro Treino
    </motion.button>
  </motion.div>
);

// Create/Edit Workout Modal
const TreinoModal = ({ isOpen, onClose, onSave, treino = null, exerciciosDisponiveis = [], onCreateExercise }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 45,
    exercicios_selecionados: []
  });
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showExerciseCreator, setShowExerciseCreator] = useState(false);
  const [newExercise, setNewExercise] = useState({ nome: '', grupo_muscular: '' });
  
  const gruposMusculares = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
    'Pernas', 'Glúteos', 'Abdômen', 'Antebraço', 'Cardio'
  ];

  useEffect(() => {
    if (treino) {
      setFormData({
        nome: treino.nome || '',
        descricao: treino.descricao || '',
        duracao: treino.duracao || 45,
        exercicios_selecionados: treino.exercicios?.map(e => e.id) || []
      });
    } else {
      setFormData({ nome: '', descricao: '', duracao: 45, exercicios_selecionados: [] });
    }
    setError('');
    setShowExerciseCreator(false);
    setNewExercise({ nome: '', grupo_muscular: '' });
  }, [treino, isOpen]);

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      setError('Nome do treino é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData, treino?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar treino');
    } finally {
      setSaving(false);
    }
  };

  const toggleExercicio = (exercicioId) => {
    setFormData(prev => ({
      ...prev,
      exercicios_selecionados: prev.exercicios_selecionados.includes(exercicioId)
        ? prev.exercicios_selecionados.filter(id => id !== exercicioId)
        : [...prev.exercicios_selecionados, exercicioId]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {treino ? 'Editar Treino' : 'Novo Treino'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Treino *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Peito e Tríceps"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objetivo do treino..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Duração */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duração (minutos)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex items-center gap-1 bg-slate-700 px-3 py-2 rounded-lg min-w-[80px] justify-center">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">{formData.duracao}</span>
                  <span className="text-slate-400 text-sm">min</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15 min</span>
                <span>120 min</span>
              </div>
            </div>

            {/* Exercícios */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Exercícios ({formData.exercicios_selecionados.length} selecionados)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-700/50 rounded-xl border border-slate-600">
                {exerciciosDisponiveis.length > 0 ? (
                  exerciciosDisponiveis.map(ex => (
                    <label
                      key={ex.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        formData.exercicios_selecionados.includes(ex.id) 
                          ? 'bg-purple-500/20 border border-purple-500/30' 
                          : 'hover:bg-slate-600/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.exercicios_selecionados.includes(ex.id)}
                        onChange={() => toggleExercicio(ex.id)}
                        className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="text-white text-sm">{ex.nome}</span>
                        {ex.grupo_muscular && (
                          <span className="text-xs text-slate-400 ml-2">({ex.grupo_muscular})</span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">
                    Nenhum exercício disponível. Adicione exercícios abaixo.
                  </p>
                )}
              </div>
              
              {/* Inline Exercise Creator */}
              {!showExerciseCreator ? (
                <button
                  type="button"
                  onClick={() => setShowExerciseCreator(true)}
                  className="w-full mt-2 px-3 py-2 text-sm text-purple-400 border border-dashed border-slate-600 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar novo exercício
                </button>
              ) : (
                <div className="mt-2 p-3 bg-slate-700/50 rounded-xl border border-slate-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Novo Exercício</span>
                    <button 
                      type="button"
                      onClick={() => { setShowExerciseCreator(false); setNewExercise({ nome: '', grupo_muscular: '' }); }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newExercise.nome}
                    onChange={(e) => setNewExercise({ ...newExercise, nome: e.target.value })}
                    placeholder="Nome do exercício"
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <select
                    value={newExercise.grupo_muscular}
                    onChange={(e) => setNewExercise({ ...newExercise, grupo_muscular: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Grupo muscular (opcional)</option>
                    {gruposMusculares.map(grupo => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (newExercise.nome.trim()) {
                        try {
                          await onCreateExercise(newExercise);
                          setNewExercise({ nome: '', grupo_muscular: '' });
                          setShowExerciseCreator(false);
                        } catch (err) {
                          // Error handled by parent
                        }
                      }
                    }}
                    disabled={!newExercise.nome.trim()}
                    className="w-full px-3 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Criar e adicionar
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Treino
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Create Exercise Modal
const ExercicioModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    grupo_muscular: '',
    descricao: ''
  });
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');

  const gruposMusculares = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
    'Pernas', 'Glúteos', 'Abdômen', 'Antebraço', 'Cardio'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({ nome: '', grupo_muscular: '', descricao: '' });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      setError('Nome do exercício é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar exercício');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Novo Exercício</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Supino Reto"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Grupo Muscular */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Grupo Muscular</label>
              <select
                value={formData.grupo_muscular}
                onChange={(e) => setFormData({ ...formData, grupo_muscular: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione...</option>
                {gruposMusculares.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Instruções ou observações..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Criar
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, treinoNome, loading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Excluir Treino?</h3>
          <p className="text-slate-400 mb-6">
            Tem certeza que deseja excluir o treino <span className="text-white font-medium">"{treinoNome}"</span>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 rounded-xl text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Component
export const TreinosPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals state
  const [treinoModalOpen, setTreinoModalOpen] = useState(false);
  const [exercicioModalOpen, setExercicioModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTreino, setEditingTreino] = useState(null);
  const [deletingTreino, setDeletingTreino] = useState(null);
  
  // Photo validation state
  const [photoValidationOpen, setPhotoValidationOpen] = useState(false);
  const [selectedTreinoToStart, setSelectedTreinoToStart] = useState(null);
  
  // Toast/notification state
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [treinosRes, exerciciosRes] = await Promise.allSettled([
        treinoService.getTreinos(),
        exerciciosService.getExercicios()
      ]);
      
      if (treinosRes.status === 'fulfilled') {
        setTreinos(treinosRes.value.data || []);
      }
      if (exerciciosRes.status === 'fulfilled') {
        setExercicios(exerciciosRes.value.data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      showNotification('Erro ao carregar treinos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveTreino = async (data, treinoId = null) => {
    setActionLoading(true);
    try {
      // Format data for backend - convert exercicios_selecionados to exercicios array
      const formattedData = {
        nome: data.nome,
        descricao: data.descricao,
        duracao: data.duracao,
        exercicios: data.exercicios_selecionados.map((exercicioId, index) => ({
          exercicio_id: exercicioId,
          ordem: index + 1,
          series_sugeridas: "3",
          reps_sugeridas: "12"
        }))
      };

      if (treinoId) {
        // Update existing
        await treinoService.updateTreino(treinoId, formattedData);
        showNotification('Treino atualizado com sucesso!');
      } else {
        // Create new
        await treinoService.createTreino(formattedData);
        showNotification('Treino criado com sucesso!');
      }
      fetchData();
      setTreinoModalOpen(false);
      setEditingTreino(null);
    } catch (err) {
      showNotification(err.message || 'Erro ao salvar treino', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTreino = async () => {
    if (!deletingTreino) return;
    
    setActionLoading(true);
    try {
      await treinoService.deleteTreino(deletingTreino.id);
      showNotification('Treino excluído com sucesso!');
      fetchData();
      setDeleteModalOpen(false);
      setDeletingTreino(null);
    } catch (err) {
      showNotification(err.message || 'Erro ao excluir treino', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveExercicio = async (data) => {
    setActionLoading(true);
    try {
      await exerciciosService.createExercicio(data);
      showNotification('Exercício criado com sucesso!');
      fetchData();
      setExercicioModalOpen(false);
    } catch (err) {
      showNotification(err.message || 'Erro ao criar exercício', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (treino) => {
    setEditingTreino(treino);
    setTreinoModalOpen(true);
  };

  const openDeleteModal = (treino) => {
    setDeletingTreino(treino);
    setDeleteModalOpen(true);
  };

  // Handle starting a workout - check for photo validation requirement
  const handleStartWorkout = (treino) => {
    // MARIA demo account bypasses photo validation
    if (user?.email === 'MARIA' || user?.nome === 'MARIA') {
      onNavigate && onNavigate('execucao', { treinoId: treino.id });
      return;
    }
    
    // Open photo validation modal
    setSelectedTreinoToStart(treino);
    setPhotoValidationOpen(true);
  };

  // Handle successful photo validation
  const handlePhotoValidated = (validationData) => {
    setPhotoValidationOpen(false);
    if (selectedTreinoToStart) {
      onNavigate && onNavigate('execucao', { 
        treinoId: selectedTreinoToStart.id,
        validationData 
      });
    }
    setSelectedTreinoToStart(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Treinos</h1>
          <p className="text-slate-400">Gerencie seus treinos e exercícios</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTreino(null); setTreinoModalOpen(true); }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Treino
        </motion.button>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                : 'bg-green-500/20 border border-green-500/30 text-green-300'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {treinos.length === 0 ? (
        <EmptyState onCreateClick={() => setTreinoModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {treinos.map((treino) => (
            <motion.div key={treino.id} variants={itemVariants}>
              <Card className="group relative" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{treino.nome}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {treino.duracao || 45} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        {treino.exercicios?.length || treino.exercicios_count || 0} exercícios
                      </div>
                      {treino.calorias && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {treino.calorias} kcal
                        </div>
                      )}
                    </div>
                    {treino.descricao && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{treino.descricao}</p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); openEditModal(treino); }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(treino); }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleStartWorkout(treino); }}
                      className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
                      title="Iniciar treino"
                    >
                      <Play className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress */}
                {treino.progresso !== undefined && (
                  <ProgressBar 
                    value={treino.progresso?.concluido || 0} 
                    max={treino.progresso?.total || treino.exercicios?.length || 1}
                    label={`Progresso`}
                    showValue={false}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <TreinoModal
        isOpen={treinoModalOpen}
        onClose={() => { setTreinoModalOpen(false); setEditingTreino(null); }}
        onSave={handleSaveTreino}
        treino={editingTreino}
        exerciciosDisponiveis={exercicios}
        onCreateExercise={handleSaveExercicio}
      />

      <ExercicioModal
        isOpen={exercicioModalOpen}
        onClose={() => setExercicioModalOpen(false)}
        onSave={handleSaveExercicio}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingTreino(null); }}
        onConfirm={handleDeleteTreino}
        treinoNome={deletingTreino?.nome}
        loading={actionLoading}
      />

      {/* Photo Validation Modal */}
      <PhotoValidationModal
        isOpen={photoValidationOpen}
        onClose={() => { setPhotoValidationOpen(false); setSelectedTreinoToStart(null); }}
        onValidated={handlePhotoValidated}
        userName={user?.nome || user?.name || 'Usuário'}
      />
    </motion.div>
  );
};

export default TreinosPage;