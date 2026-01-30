import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Dumbbell, Flame, TrendingUp, Calendar, ChevronRight, 
  X, BarChart2, Eye, Filter, ChevronDown, Trophy, Target
} from 'lucide-react';
import { Card, Button } from '../components/common';
import { historicoService } from '../services';

// Skeleton for loading
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Simple bar chart component
const MiniBarChart = ({ data, color = 'purple' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end justify-between gap-1 h-20">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`w-full rounded-t-sm bg-gradient-to-t ${
              color === 'purple' ? 'from-purple-600 to-purple-400' :
              color === 'orange' ? 'from-orange-600 to-orange-400' :
              'from-blue-600 to-blue-400'
            } min-h-[4px]`}
          />
          <span className="text-[10px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, trend, color = 'purple' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${
        color === 'purple' ? 'bg-purple-500/20' :
        color === 'orange' ? 'bg-orange-500/20' :
        color === 'blue' ? 'bg-blue-500/20' :
        'bg-green-500/20'
      }`}>
        <Icon className={`w-5 h-5 ${
          color === 'purple' ? 'text-purple-400' :
          color === 'orange' ? 'text-orange-400' :
          color === 'blue' ? 'text-blue-400' :
          'text-green-400'
        }`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Workout Detail Modal
const WorkoutDetailModal = ({ isOpen, onClose, workout }) => {
  if (!isOpen || !workout) return null;

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
            <h2 className="text-xl font-bold text-white">{workout.treino_nome || workout.treino}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{workout.duracao || 0}</div>
              <div className="text-xs text-slate-400">minutos</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{workout.calorias || 0}</div>
              <div className="text-xs text-slate-400">kcal</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{workout.volume_total || 0}</div>
              <div className="text-xs text-slate-400">kg volume</div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300">Exercícios Realizados</h3>
            {workout.exercicios?.length > 0 ? (
              workout.exercicios.map((ex, index) => (
                <div key={index} className="bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{ex.nome}</span>
                    <span className="text-xs text-slate-400">{ex.grupo_muscular}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {ex.series?.map((serie, sIndex) => (
                      <div key={sIndex} className="bg-slate-600/50 rounded-lg p-2">
                        <div className="text-xs text-slate-400">Série {sIndex + 1}</div>
                        <div className="text-sm font-medium text-white">{serie.reps}x {serie.carga_kg}kg</div>
                      </div>
                    )) || (
                      <div className="col-span-3 text-sm text-slate-400">
                        {ex.series_realizadas || 3}x{ex.reps_realizadas || 12} • {ex.carga_utilizada || 0}kg
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                Detalhes dos exercícios não disponíveis
              </p>
            )}
          </div>

          {/* Date */}
          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              Realizado em {new Date(workout.data || workout.created_at).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Comparison Section Component
const ComparisonSection = ({ historico }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Get unique exercises from history
  const exercises = [...new Set(historico.flatMap(h => 
    h.exercicios?.map(e => e.nome) || []
  ))].filter(Boolean);

  // Get comparison data for selected exercise
  const getExerciseProgress = (exerciseName) => {
    return historico
      .filter(h => h.exercicios?.some(e => e.nome === exerciseName))
      .slice(0, 7)
      .reverse()
      .map(h => {
        const ex = h.exercicios?.find(e => e.nome === exerciseName);
        return {
          date: new Date(h.data || h.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          maxLoad: ex?.series ? Math.max(...ex.series.map(s => s.carga_kg || 0)) : (ex?.carga_utilizada || 0),
          totalVolume: ex?.series ? ex.series.reduce((acc, s) => acc + (s.reps || 0) * (s.carga_kg || 0), 0) : 0
        };
      });
  };

  if (exercises.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-bold text-white">Comparativo de Evolução</h2>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Selecione um exercício</label>
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Escolha um exercício...</option>
          {exercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {selectedExercise && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {getExerciseProgress(selectedExercise).length > 0 ? (
            <>
              <div>
                <h4 className="text-sm text-slate-400 mb-2">Carga Máxima (kg)</h4>
                <MiniBarChart 
                  data={getExerciseProgress(selectedExercise).map(d => ({ value: d.maxLoad, label: d.date }))}
                  color="purple"
                />
              </div>
              <div>
                <h4 className="text-sm text-slate-400 mb-2">Volume Total (kg)</h4>
                <MiniBarChart 
                  data={getExerciseProgress(selectedExercise).map(d => ({ value: d.totalVolume, label: d.date }))}
                  color="blue"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              Sem dados suficientes para comparação
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export const HistoricoPage = () => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const res = await historicoService.getHistorico();
      setHistorico(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      // Use mock data as fallback
      setHistorico([
        {
          id: 1,
          data: '2024-01-15T10:30:00',
          treino_nome: 'Peito e Tríceps',
          duracao: 60,
          calorias: 450,
          volume_total: 3200,
          exercicios: [
            { nome: 'Supino Reto', grupo_muscular: 'Peito', series: [{ reps: 12, carga_kg: 80 }, { reps: 10, carga_kg: 85 }, { reps: 8, carga_kg: 90 }] },
            { nome: 'Desenvolvimento', grupo_muscular: 'Ombros', series: [{ reps: 12, carga_kg: 40 }, { reps: 10, carga_kg: 45 }] }
          ]
        },
        {
          id: 2,
          data: '2024-01-14T09:15:00',
          treino_nome: 'Costas e Bíceps',
          duracao: 55,
          calorias: 380,
          volume_total: 2800,
          exercicios: [
            { nome: 'Puxada Frontal', grupo_muscular: 'Costas', series: [{ reps: 12, carga_kg: 60 }, { reps: 10, carga_kg: 65 }] }
          ]
        },
        {
          id: 3,
          data: '2024-01-12T16:00:00',
          treino_nome: 'Pernas',
          duracao: 70,
          calorias: 520,
          volume_total: 4500,
          exercicios: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredHistorico = historico.filter(item => {
    const itemDate = new Date(item.data || item.created_at);
    const now = new Date();
    
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= weekAgo;
    }
    if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= monthAgo;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    totalWorkouts: filteredHistorico.length,
    totalMinutes: filteredHistorico.reduce((acc, h) => acc + (h.duracao || 0), 0),
    totalCalories: filteredHistorico.reduce((acc, h) => acc + (h.calorias || 0), 0),
    totalVolume: filteredHistorico.reduce((acc, h) => acc + (h.volume_total || 0), 0)
  };

  // Weekly chart data
  const weeklyData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();
    return days.map((day, index) => {
      const count = filteredHistorico.filter(h => {
        const d = new Date(h.data || h.created_at);
        return d.getDay() === index;
      }).length;
      return { label: day, value: count };
    });
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
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
          <h1 className="text-3xl font-bold text-white">Histórico de Treinos</h1>
          <p className="text-slate-400">Acompanhe sua evolução</p>
        </div>
        
        {/* Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {filter === 'all' ? 'Todos' : filter === 'week' ? 'Última Semana' : 'Último Mês'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 w-40"
              >
                {['all', 'week', 'month'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilters(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${
                      filter === f ? 'text-purple-400 bg-slate-700/50' : 'text-white'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'week' ? 'Última Semana' : 'Último Mês'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard icon={Trophy} label="Treinos" value={stats.totalWorkouts} color="purple" />
        <StatsCard icon={Clock} label="Minutos" value={stats.totalMinutes} color="blue" />
        <StatsCard icon={Flame} label="Calorias" value={stats.totalCalories} color="orange" />
        <StatsCard icon={Target} label="Volume (kg)" value={stats.totalVolume.toLocaleString()} color="green" />
      </motion.div>

      {/* Weekly Activity Chart */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Atividade Semanal</h2>
          </div>
          <MiniBarChart data={weeklyData()} color="purple" />
        </Card>
      </motion.div>

      {/* Comparison Section */}
      {filteredHistorico.length > 0 && (
        <motion.div variants={itemVariants}>
          <ComparisonSection historico={filteredHistorico} />
        </motion.div>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Treinos Realizados
        </h2>
        
        {filteredHistorico.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum treino registrado</h3>
            <p className="text-slate-400">Complete seu primeiro treino para ver o histórico aqui!</p>
          </motion.div>
        ) : (
          filteredHistorico.map((item, index) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card hover className="cursor-pointer" onClick={() => setSelectedWorkout(item)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{item.treino_nome || item.treino}</h3>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Último
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.data || item.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.duracao || 0} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        {item.exercicios?.length || item.exercicios_count || 0} exercícios
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-4 h-4" />
                        {item.calorias || 0} kcal
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <WorkoutDetailModal
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        workout={selectedWorkout}
      />
    </motion.div>
  );
};

export default HistoricoPage;