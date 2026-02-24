import { create } from 'zustand';
import { Treino } from '../services/treino.service';
import { treinoService } from '../services';

interface WorkoutState {
  treinos: Treino[];
  currentTreino: Treino | null;
  loading: boolean;
  
  // Execution state
  isExecuting: boolean;
  currentExerciseIndex: number;
  currentSerieNum: number;
  restTimerActive: boolean;
  restTimeLeft: number;
  completedSeries: Record<string, boolean>;
  executionStartTime: number | null;

  // Actions
  fetchTreinos: () => Promise<void>;
  fetchTreino: (id: number) => Promise<void>;
  setCurrentTreino: (treino: Treino | null) => void;

  // Execution actions
  startExecution: (treino: Treino) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  completeSerie: (exercicioId: number, serieNum: number) => void;
  startRest: (seconds: number) => void;
  tickRest: () => void;
  finishExecution: () => void;
  resetExecution: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  treinos: [],
  currentTreino: null,
  loading: false,

  isExecuting: false,
  currentExerciseIndex: 0,
  currentSerieNum: 1,
  restTimerActive: false,
  restTimeLeft: 0,
  completedSeries: {},
  executionStartTime: null,

  fetchTreinos: async () => {
    set({ loading: true });
    try {
      const data = await treinoService.getTreinos();
      set({ treinos: Array.isArray(data) ? data : data.treinos || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTreino: async (id: number) => {
    set({ loading: true });
    try {
      const data = await treinoService.getTreino(id);
      set({ currentTreino: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setCurrentTreino: (treino) => set({ currentTreino: treino }),

  startExecution: (treino) =>
    set({
      currentTreino: treino,
      isExecuting: true,
      currentExerciseIndex: 0,
      currentSerieNum: 1,
      completedSeries: {},
      restTimerActive: false,
      restTimeLeft: 0,
      executionStartTime: Date.now(),
    }),

  nextExercise: () => {
    const { currentExerciseIndex, currentTreino } = get();
    const exercises = currentTreino?.exercicios || [];
    if (currentExerciseIndex < exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1, currentSerieNum: 1 });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1, currentSerieNum: 1 });
    }
  },

  completeSerie: (exercicioId, serieNum) => {
    const key = `${exercicioId}-${serieNum}`;
    set((state) => ({
      completedSeries: { ...state.completedSeries, [key]: true },
      currentSerieNum: state.currentSerieNum + 1,
    }));
  },

  startRest: (seconds) => set({ restTimerActive: true, restTimeLeft: seconds }),

  tickRest: () => {
    const { restTimeLeft } = get();
    if (restTimeLeft <= 1) {
      set({ restTimerActive: false, restTimeLeft: 0 });
    } else {
      set({ restTimeLeft: restTimeLeft - 1 });
    }
  },

  finishExecution: () =>
    set({
      isExecuting: false,
    }),

  resetExecution: () =>
    set({
      isExecuting: false,
      currentExerciseIndex: 0,
      currentSerieNum: 1,
      completedSeries: {},
      restTimerActive: false,
      restTimeLeft: 0,
      executionStartTime: null,
    }),
}));
