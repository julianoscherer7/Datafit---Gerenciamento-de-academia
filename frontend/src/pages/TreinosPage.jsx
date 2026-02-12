import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Clock, X, Eye, ChevronRight, Check, Zap, ArrowLeft,
  Target, Info, Lightbulb, Package
} from 'lucide-react';
import { treinoService } from '../services';
import { useAuth } from '../context/AuthContext';
import { MuscleMap } from '../components/MuscleMap';

const spring = { type: 'spring', damping: 22, stiffness: 260 };

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

/* ===== Exercise Detail / Tutorial Popup ===== */
const ExerciseDetailPopup = ({ exercicio, onClose }) => {
  if (!exercicio) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={spring} onClick={e => e.stopPropagation()}
        className="w-full max-w-md card-base p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MuscleMap grupo={exercicio.grupo_muscular} size={44} />
            <div>
              <h3 className="text-base font-semibold text-white">{exercicio.nome || exercicio.exercicio_nome}</h3>
              {exercicio.grupo_muscular && <p className="text-[11px] text-slate-500">{exercicio.grupo_muscular}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-800/20 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-white">{exercicio.series_sugeridas || exercicio.series || 3}</div>
            <div className="text-[9px] text-slate-500">Séries</div>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-white">{exercicio.reps_sugeridas || exercicio.reps || 12}</div>
            <div className="text-[9px] text-slate-500">Reps</div>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-white capitalize">{exercicio.nivel || 'Iniciante'}</div>
            <div className="text-[9px] text-slate-500">Nível</div>
          </div>
        </div>

        {exercicio.tecnica && (
          <div className="mb-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> Técnica
            </div>
            <p className="text-sm text-slate-300">{exercicio.tecnica}</p>
            {exercicio.observacao && <p className="text-xs text-slate-500 mt-1">{exercicio.observacao}</p>}
          </div>
        )}

        {exercicio.musculos_trabalhados && (
          <div className="mb-3 p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1.5 font-medium flex items-center gap-1">
              <Target className="w-3 h-3" /> Músculos Trabalhados
            </div>
            <div className="flex items-start gap-3">
              <MuscleMap grupo={exercicio.grupo_muscular} size={70} className="flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5 content-start">
                {exercicio.musculos_trabalhados.split(',').map((m, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                    {m.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {exercicio.instrucoes && (
          <div className="mb-3 p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">
            <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1.5 font-medium flex items-center gap-1">
              <Info className="w-3 h-3" /> Como Executar
            </div>
            <div className="space-y-1.5">
              {exercicio.instrucoes.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 font-bold text-xs mt-0.5">{i + 1}.</span>
                  <span>{line.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {exercicio.dicas && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Dicas
            </div>
            <p className="text-sm text-slate-300">{exercicio.dicas}</p>
          </div>
        )}

        {exercicio.equipamento && (
          <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-700/10">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <Package className="w-3 h-3" /> Equipamento
            </div>
            <p className="text-sm text-slate-300">{exercicio.equipamento}</p>
          </div>
        )}

        {!exercicio.instrucoes && !exercicio.dicas && !exercicio.musculos_trabalhados && (
          <div className="text-center py-4">
            <Info className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Instruções detalhadas não disponíveis</p>
            <p className="text-xs text-slate-600 mt-1">Peça ao seu coach para adicionar</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ===== Workout Detail Popup ===== */
const WorkoutDetailPopup = ({ treino, onClose, onViewExercise }) => {
  if (!treino) return null;
  const exercicios = treino.exercicios || [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={spring} onClick={e => e.stopPropagation()}
        className="w-full max-w-lg card-base p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{treino.nome}</h3>
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

        <div className="space-y-2 mb-5">
          {exercicios.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">Nenhum exercício neste treino</p>
          ) : exercicios.map((ex, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/10 cursor-pointer hover:border-indigo-500/20 hover:bg-slate-800/40 transition-all"
              onClick={() => onViewExercise(ex)}>
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
              <div className="flex items-center gap-1">
                {ex.tecnica && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">{ex.tecnica}</span>
                )}
                <Eye className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </motion.div>
          ))}
        </div>


      </motion.div>
    </motion.div>
  );
};

// ===== MAIN PAGE =====
export const TreinosPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailTreino, setDetailTreino] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => { fetchTreinos(); }, []);

  const fetchTreinos = async () => {
    setLoading(true);
    try {
      const res = await treinoService.getTreinos();
      setTreinos(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Meus Treinos</h1>
        <p className="text-sm text-slate-500">{treinos.length} treinos disponíveis</p>
      </div>

      {treinos.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          className="text-center py-20">
          <Dumbbell className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-400 mb-1">Nenhum treino disponível</p>
          <p className="text-sm text-slate-600">Peça ao seu coach para vincular treinos a você</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {treinos.map((treino, i) => {
            const exercicios = treino.exercicios || [];
            return (
              <motion.div key={treino.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ...spring }}
                className="card-base p-5 hover:border-slate-700/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/10">
                      <Dumbbell className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{treino.nome}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{exercicios.length} exerc.</span>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {treino.duracao || 45}min</span>
                      </div>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDetailTreino(treino)}
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100">
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>

                {treino.descricao && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{treino.descricao}</p>
                )}

                {treino.coach_comentario && (
                  <div className="mb-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <p className="text-[10px] text-purple-400 mb-0.5 font-medium">Coach:</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{treino.coach_comentario}</p>
                  </div>
                )}

                {exercicios.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exercicios.slice(0, 4).map((ex, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 border border-slate-700/10">
                        {ex.nome || ex.exercicio_nome}
                      </span>
                    ))}
                    {exercicios.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                        +{exercicios.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDetailTreino(treino)}
                  className="w-full py-2.5 text-sm font-medium bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70 border border-slate-700/20 transition-all flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> Ver Detalhes
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Popup */}
      <AnimatePresence>
        {detailTreino && <WorkoutDetailPopup treino={detailTreino} onClose={() => setDetailTreino(null)} onViewExercise={(ex) => setSelectedExercise(ex)} />}
      </AnimatePresence>

      {/* Exercise Tutorial Popup */}
      <AnimatePresence>
        {selectedExercise && <ExerciseDetailPopup exercicio={selectedExercise} onClose={() => setSelectedExercise(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default TreinosPage;
