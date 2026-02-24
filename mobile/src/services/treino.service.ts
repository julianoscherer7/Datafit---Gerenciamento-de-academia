import api from '../api/client';

export interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  descricao?: string;
  instrucoes?: string;
  dicas?: string;
  musculos_trabalhados?: string;
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
  equipamento?: string;
  video_url?: string;
  imagem_url?: string;
}

export interface TreinoExercicio {
  id: number;
  exercicio_id: number;
  exercicio?: Exercicio;
  ordem: number;
  series_sugeridas?: string;
  reps_sugeridas?: string;
  tecnica?: string;
  observacao?: string;
  descanso?: string;
}

export interface Treino {
  id: number;
  nome: string;
  descricao?: string;
  duracao?: number;
  criado_por: number;
  origem: 'user' | 'coach' | 'ai';
  locked?: boolean;
  coach_comentario?: string;
  exercicios?: TreinoExercicio[];
}

export interface SerieExecutada {
  exercicio_id: number;
  serie_num: number;
  repeticoes: number;
  carga_kg?: number;
  observacao?: string;
  treino_id?: number;
}

export const treinoService = {
  getTreinos: async () => {
    const response = await api.get('/treinos');
    return response.data;
  },

  getTreino: async (id: number) => {
    const response = await api.get(`/treinos/${id}`);
    return response.data;
  },

  createTreino: async (data: Partial<Treino>) => {
    const response = await api.post('/treinos', data);
    return response.data;
  },

  updateTreino: async (id: number, data: Partial<Treino>) => {
    const response = await api.put(`/treinos/${id}`, data);
    return response.data;
  },

  deleteTreino: async (id: number) => {
    const response = await api.delete(`/treinos/${id}`);
    return response.data;
  },

  updateComentario: async (id: number, comentario: string) => {
    const response = await api.patch(`/treinos/${id}/comentario`, { coach_comentario: comentario });
    return response.data;
  },
};

export const exercicioService = {
  getExercicios: async (grupoMuscular?: string) => {
    const params = grupoMuscular ? { grupo_muscular: grupoMuscular } : {};
    const response = await api.get('/exercicios', { params });
    return response.data;
  },

  getExercicio: async (id: number) => {
    const response = await api.get(`/exercicios/${id}`);
    return response.data;
  },

  getGruposMusculares: async () => {
    const response = await api.get('/exercicios/grupos/listagem');
    return response.data;
  },
};

export const execucaoService = {
  registrarSerie: async (alunoId: number, data: SerieExecutada) => {
    const response = await api.post(`/execucao/${alunoId}`, data);
    return response.data;
  },

  getHistorico: async (alunoId: number, exercicioId?: number) => {
    const params = exercicioId ? { exercicio_id: exercicioId } : {};
    const response = await api.get(`/execucao/${alunoId}/historico`, { params });
    return response.data;
  },
};
