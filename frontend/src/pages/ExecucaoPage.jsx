import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, CheckCircle, X, Clock, Dumbbell,
  ChevronRight, ArrowLeft, Trophy, Flame, Zap, Timer
} from 'lucide-react';
import { treinoService } from '../services';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const ExecucaoPage = ({ onNavigate, treino: treinoProp }) => {
  const [treino, setTreino] = useState(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSerie, setCurrentSerie] = useState(1);
  const [timer, setTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [running, setRunning] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [completedExs, setCompletedExs] = useState(new Set());
  const timerRef = useRef(null);
  const restRef = useRef(null);

  useEffect(() => {
    if (treinoProp) { setTreino(treinoProp); return; }
    // Demo
    setTreino({
      nome: 'Treino A - Peito e Triceps',
      exercicios: [
        { id: 1, nome: 'Supino reto', series: 4, reps: 12, carga: 60, descanso: 90 },
        { id: 2, nome: 'Supino inclinado', series: 3, reps: 12, carga: 50, descanso: 90 },
        { id: 3, nome: 'Crucifixo', series: 3, reps: 15, carga: 16, descanso: 60 },
        { id: 4, nome: 'Triceps pulley', series: 4, reps: 12, carga: 30, descanso: 60 },
        { id: 5, nome: 'Triceps testa', series: 3, reps: 12, carga: 20, descanso: 60 },
      ]
    });
  }, [treinoProp]);

  // Main timer
  useEffect(() => {
    if (running && !completed) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [running, completed]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) { setIsResting(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else { clearInterval(restRef.current); }
    return () => clearInterval(restRef.current);
  }, [isResting, restTimer]);

  if (!treino) return null;

  const exercicios = treino.exercicios || [];
  const currentEx = exercicios[currentExIndex];
  const progress = completedExs.size / Math.max(exercicios.length, 1);

  const handleCompleteSerie = () => {
    if (!currentEx) return;
    if (currentSerie < (currentEx.series || 3)) {
      setCurrentSerie(s => s + 1);
      setRestTimer(currentEx.descanso || 60);
      setIsResting(true);
    } else {
      // Exercise complete
      setCompletedExs(prev => new Set([...prev, currentExIndex]));
      if (currentExIndex < exercicios.length - 1) {
        setCurrentExIndex(i => i + 1);
        setCurrentSerie(1);
        setRestTimer(currentEx.descanso || 60);
        setIsResting(true);
      } else {
        setCompleted(true);
        setRunning(false);
      }
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-emerald-400" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-white text-center mb-1">Treino Completo!</h2>
          <p className="text-sm text-slate-500 text-center mb-6">{treino.nome}</p>
        </motion.div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Tempo', value: formatTime(timer), icon: Clock },
            { label: 'Exercicios', value: `${exercicios.length}/${exercicios.length}`, icon: Dumbbell },
            { label: 'XP', value: '+150', icon: Zap },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="card-base p-4 text-center">
              <s.icon className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <button onClick={() => onNavigate('dashboard')}
          className="px-8 py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all">
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('treinos')}
          className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">{treino.nome}</h1>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(timer)}</span>
            <span>{completedExs.size}/{exercicios.length} exercicios</span>
          </div>
        </div>
        <button onClick={() => setRunning(r => !r)}
          className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-400 transition-all">
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-800/40 overflow-hidden">
        <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
      </div>

      {/* Rest overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="card-base p-6 text-center border-indigo-500/20">
            <Timer className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1 font-mono">{formatTime(restTimer)}</div>
            <div className="text-sm text-slate-500 mb-4">Descanso</div>
            <button onClick={skipRest}
              className="flex items-center gap-2 mx-auto px-4 py-2 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
              <SkipForward className="w-4 h-4" /> Pular descanso
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Exercise */}
      {currentEx && !isResting && (
        <motion.div key={currentExIndex} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] text-indigo-400 font-medium mb-1">Exercicio {currentExIndex + 1}/{exercicios.length}</div>
              <h3 className="text-lg font-bold text-white">{currentEx.nome}</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{currentSerie}<span className="text-slate-500 text-sm">/{currentEx.series || 3}</span></div>
              <div className="text-[10px] text-slate-500">serie</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{currentEx.reps || 12}</div>
              <div className="text-[10px] text-slate-500">reps</div>
            </div>
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{currentEx.carga || 0}<span className="text-xs text-slate-500">kg</span></div>
              <div className="text-[10px] text-slate-500">carga</div>
            </div>
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{currentEx.descanso || 60}<span className="text-xs text-slate-500">s</span></div>
              <div className="text-[10px] text-slate-500">descanso</div>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleCompleteSerie}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {currentSerie >= (currentEx.series || 3) ? 'Concluir Exercicio' : 'Concluir Serie'}
          </motion.button>
        </motion.div>
      )}

      {/* Exercise List */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exercicios</h4>
        {exercicios.map((ex, i) => (
          <div key={i}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              i === currentExIndex ? 'bg-indigo-500/5 border border-indigo-500/10' :
              completedExs.has(i) ? 'opacity-50' : ''
            }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              completedExs.has(i) ? 'bg-emerald-500/10 text-emerald-400' :
              i === currentExIndex ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800/30 text-slate-600'
            }`}>
              {completedExs.has(i) ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm flex-1 ${
              i === currentExIndex ? 'text-white font-medium' : completedExs.has(i) ? 'text-slate-500 line-through' : 'text-slate-400'
            }`}>{ex.nome}</span>
            <span className="text-[10px] text-slate-600">{ex.series}x{ex.reps}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecucaoPage;
