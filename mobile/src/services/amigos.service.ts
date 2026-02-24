import api from '../api/client';

export interface Amigo {
  id: number;
  nome: string;
  nickname?: string;
  foto_url?: string;
  foto_base64?: string;
  xp?: number;
  level?: number;
  online?: boolean;
  ultimo_acesso?: string;
}

export interface Amizade {
  id: number;
  solicitante: Amigo;
  solicitado: Amigo;
  status: 'pendente' | 'aceito' | 'rejeitado';
}

export const amigosService = {
  getAmigos: async () => {
    const response = await api.get('/amigos');
    return response.data;
  },

  getRanking: async () => {
    const response = await api.get('/amigos/ranking');
    return response.data;
  },

  buscarUsuarios: async (query: string) => {
    const response = await api.get(`/amigos/buscar`, { params: { q: query } });
    return response.data;
  },

  getPendentes: async () => {
    const response = await api.get('/amigos/pendentes');
    return response.data;
  },

  enviarSolicitacao: async (usuarioId: number) => {
    const response = await api.post('/amigos/solicitar', { solicitado_id: usuarioId });
    return response.data;
  },

  aceitarSolicitacao: async (amizadeId: number) => {
    const response = await api.post(`/amigos/aceitar/${amizadeId}`);
    return response.data;
  },

  rejeitarSolicitacao: async (amizadeId: number) => {
    const response = await api.post(`/amigos/rejeitar/${amizadeId}`);
    return response.data;
  },

  getSugestoes: async () => {
    const response = await api.get('/amigos/sugestoes');
    return response.data;
  },

  getFeed: async () => {
    const response = await api.get('/amigos/feed');
    return response.data;
  },

  getPerfilPublico: async (amigoId: number) => {
    const response = await api.get(`/amigos/${amigoId}/perfil`);
    return response.data;
  },
};
