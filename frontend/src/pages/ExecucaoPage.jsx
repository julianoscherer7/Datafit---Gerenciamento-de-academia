import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Clock, Flame, Target, Check, X, Play, Pause, 
  ChevronRight, ChevronDown, Save, Trophy, ArrowLeft, Plus, Minus
} from 'lucide-react';
import { Card, Button } from '../components/common';
import { treinoService } from '../services';
import { useAuth } from '../context/AuthContext';

// Timer hook
const useTimer = (initialRunning = false) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(initialRunning);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    isRunning,
    formatted: formatTime(seconds),
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => { setSeconds(0); setIsRunning(false); }
  };
};

// Set Input Component
const SetInput = ({ setNumber, reps, load, onRepsChange, onLoadChange, completed, onComplete }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      completed ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-700/50'
    }`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
      completed ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'
    }`}>
      {completed ? <Check className="w-4 h-4" /> : setNumber}
    </div>
    
    <div className="flex-1 flex items-center gap-2">
      <div className="flex-1">
        <label className="text-xs text-slate-400 block mb-1">Reps</label>
        <input
          type="number"
          value={reps}
          onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
          disabled={completed}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-center text-lg font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          min="0"
          max="100"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-slate-400 block mb-1">Carga (kg)</label>
        <input
          type="number"
          value={load}
          onChange={(e) => onLoadChange(parseFloat(e.target.value) || 0)}
          disabled={completed}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-center text-lg font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          min="0"
          step="0.5"
        />
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onComplete}
      disabled={completed}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        completed 
          ? 'bg-green-500/20 text-green-400 cursor-default'
          : 'bg-purple-500 text-white hover:bg-purple-600'
      }`}
    >
      {completed ? 'Feito' : 'OK'}
    </motion.button>
  </motion.div>
);

// Exercise Card Component
const ExerciseCard = ({ exercise, index, expanded, onToggle, onSetComplete, onSetUpdate }) => {
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const isComplete = completedSets === exercise.sets.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border transition-all overflow-hidden ${
        isComplete ? 'border-green-500/30' : 'border-slate-700/50'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isComplete 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {isComplete ? <Check className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-white">{exercise.nome}</h3>
            <p className="text-sm text-slate-400">
              {exercise.grupo_muscular || 'Geral'} • {completedSets}/{exercise.sets.length} séries
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 space-y-2"
          >
            {exercise.sets.map((set, setIndex) => (
              <SetInput
                key={setIndex}
                setNumber={setIndex + 1}
                reps={set.reps}
                load={set.load}
                completed={set.completed}
                onRepsChange={(reps) => onSetUpdate(setIndex, 'reps', reps)}
                onLoadChange={(load) => onSetUpdate(setIndex, 'load', load)}
                onComplete={() => onSetComplete(setIndex)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Completion Modal
const CompletionModal = ({ isOpen, onClose, stats, onSave, saving }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Treino Concluído! 🎉</h2>
          <p className="text-slate-400 mb-6">Parabéns por mais um treino completo!</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.time}</div>
              <div className="text-xs text-slate-400">Tempo</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.calories}</div>
              <div className="text-xs text-slate-400">Kcal</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.totalVolume}</div>
              <div className="text-xs text-slate-400">Volume (kg)</div>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Fechar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Component
export const ExecucaoPage = ({ treinoId, validationData, onNavigate }) => {
  const { user } = useAuth();
  const timer = useTimer(true); // Start automatically
  const [treino, setTreino] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Load workout data
  useEffect(() => {
    const loadTreino = async () => {
      try {
        setLoading(true);
        
        if (treinoId) {
          const res = await treinoService.getTreino(treinoId);
          const treinoData = res.data;
          setTreino(treinoData);

          // Initialize exercises with sets
          const exercisesWithSets = (treinoData.exercicios || []).map(ex => ({
            ...ex,
            sets: Array.from({ length: ex.series_sugeridas ? parseInt(ex.series_sugeridas) : 3 }, () => ({
              reps: ex.reps_sugeridas ? parseInt(ex.reps_sugeridas) : 12,
              load: 0,
              completed: false
            }))
          }));
          setExercises(exercisesWithSets);
        } else {
          // Demo/fallback data
          setTreino({ id: 0, nome: 'Treino do Dia', duracao: 45 });
          setExercises([
            { id: 1, nome: 'Supino Reto', grupo_muscular: 'Peito', sets: [
              { reps: 12, load: 0, completed: false },
              { reps: 10, load: 0, completed: false },
              { reps: 8, load: 0, completed: false },
            ]},
            { id: 2, nome: 'Desenvolvimento', grupo_muscular: 'Ombros', sets: [
              { reps: 12, load: 0, completed: false },
              { reps: 10, load: 0, completed: false },
              { reps: 10, load: 0, completed: false },
            ]},
            { id: 3, nome: 'Tríceps Corda', grupo_muscular: 'Tríceps', sets: [
              { reps: 15, load: 0, completed: false },
              { reps: 12, load: 0, completed: false },
              { reps: 12, load: 0, completed: false },
            ]},
          ]);
        }
      } catch (err) {
        console.error('Error loading treino:', err);
        // Fallback to demo data on error
        setTreino({ id: 0, nome: 'Treino do Dia', duracao: 45 });
        setExercises([
          { id: 1, nome: 'Supino Reto', grupo_muscular: 'Peito', sets: [
            { reps: 12, load: 0, completed: false },
            { reps: 10, load: 0, completed: false },
            { reps: 8, load: 0, completed: false },
          ]},
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTreino();
  }, [treinoId]);

  // Calculate stats
  const completedSets = exercises.reduce((acc, ex) => 
    acc + ex.sets.filter(s => s.completed).length, 0
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  const totalVolume = exercises.reduce((acc, ex) => 
    acc + ex.sets.reduce((setAcc, s) => 
      setAcc + (s.completed ? s.reps * s.load : 0), 0
    ), 0
  );

  // Estimate calories (rough estimate: 5 kcal per set + time factor)
  const estimatedCalories = Math.round(completedSets * 5 + (timer.seconds / 60) * 3);

  const handleSetComplete = (exerciseIndex, setIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex].completed = true;
      return updated;
    });
  };

  const handleSetUpdate = (exerciseIndex, setIndex, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const handleFinish = () => {
    timer.pause();
    setShowCompletion(true);
  };

  const handleSaveWorkout = async () => {
    setSaving(true);
    try {
      // Save workout execution to backend
      const executionData = {
        treino_id: treino?.id || 0,
        tempo_segundos: timer.seconds,
        calorias_estimadas: estimatedCalories,
        volume_total: totalVolume,
        exercicios: exercises.map(ex => ({
          exercicio_id: ex.id,
          series: ex.sets.map(s => ({
            reps: s.reps,
            carga_kg: s.load,
            completado: s.completed
          }))
        })),
        data: new Date().toISOString(),
        validacao_foto: validationData?.photo || null
      };

      // In production, call API here
      console.log('Saving workout:', executionData);
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowCompletion(false);
      onNavigate?.('treinos');
    } catch (err) {
      console.error('Error saving workout:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (progress > 0 && !window.confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
      return;
    }
    onNavigate?.('treinos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando treino...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{treino?.nome || 'Treino'}</h1>
          <p className="text-sm text-slate-400">
            {timer.isRunning ? 'Em andamento' : 'Pausado'} • {exercises.length} exercícios
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30"
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Progresso</span>
            <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{timer.formatted}</div>
            <div className="text-xs text-slate-400">Tempo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{estimatedCalories}</div>
            <div className="text-xs text-slate-400">Kcal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{completedSets}/{totalSets}</div>
            <div className="text-xs text-slate-400">Séries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{totalVolume}</div>
            <div className="text-xs text-slate-400">Vol. (kg)</div>
          </div>
        </div>
      </motion.div>

      {/* Timer Controls */}
      <div className="flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={timer.isRunning ? timer.pause : timer.start}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
            timer.isRunning 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {timer.isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Retomar
            </>
          )}
        </motion.button>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-purple-400" />
          Exercícios
        </h2>
        
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id || index}
            exercise={exercise}
            index={index}
            expanded={expandedExercise === index}
            onToggle={() => setExpandedExercise(expandedExercise === index ? -1 : index)}
            onSetComplete={(setIndex) => handleSetComplete(index, setIndex)}
            onSetUpdate={(setIndex, field, value) => handleSetUpdate(index, setIndex, field, value)}
          />
        ))}
      </div>

      {/* Finish Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFinish}
        disabled={progress < 50}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Trophy className="w-6 h-6" />
        Finalizar Treino
      </motion.button>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        stats={{
          time: timer.formatted,
          calories: estimatedCalories,
          totalVolume
        }}
        onSave={handleSaveWorkout}
        saving={saving}
      />
    </motion.div>
  );
};

export default ExecucaoPage;