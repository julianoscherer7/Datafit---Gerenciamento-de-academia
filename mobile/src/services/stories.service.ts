import api from '../api/client';

export interface Story {
  id: number;
  usuario_id: number;
  usuario_nome?: string;
  usuario_foto?: string;
  tipo: 'foto' | 'treino' | 'conquista';
  conteudo_base64?: string;
  legenda?: string;
  reacoes?: Record<string, number>;
  visualizacoes: number;
  ativo: boolean;
  criado_em: string;
  expira_em: string;
}

export const storiesService = {
  criar: async (data: { tipo: string; conteudo_base64: string; legenda?: string }) => {
    const response = await api.post('/stories/criar', data);
    return response.data;
  },

  getFeed: async () => {
    const response = await api.get('/stories/feed');
    return response.data;
  },

  getMeus: async () => {
    const response = await api.get('/stories/meus');
    return response.data;
  },

  visualizar: async (storyId: number) => {
    const response = await api.post(`/stories/visualizar/${storyId}`);
    return response.data;
  },

  reagir: async (storyId: number, emoji: string) => {
    const response = await api.post(`/stories/reagir/${storyId}`, { emoji });
    return response.data;
  },

  deletar: async (storyId: number) => {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  },
};
