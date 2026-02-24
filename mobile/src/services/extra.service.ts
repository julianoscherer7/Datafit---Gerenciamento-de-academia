import api from '../api/client';

export const lojaService = {
  getItens: async (tipo?: string) => {
    const params = tipo ? { tipo } : {};
    const response = await api.get('/loja/itens', { params });
    return response.data;
  },

  comprar: async (itemId: number) => {
    const response = await api.post(`/loja/comprar/${itemId}`);
    return response.data;
  },

  equipar: async (itemId: number) => {
    const response = await api.post(`/loja/equipar/${itemId}`);
    return response.data;
  },

  getMeusItens: async () => {
    const response = await api.get('/loja/meus-itens');
    return response.data;
  },

  getProgresso: async () => {
    const response = await api.get('/loja/progresso');
    return response.data;
  },

  getRecompensas: async () => {
    const response = await api.get('/loja/recompensas');
    return response.data;
  },
};

export const badgesService = {
  getAll: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  getMeus: async () => {
    const response = await api.get('/badges/meus');
    return response.data;
  },

  getByUsuario: async (usuarioId: number) => {
    const response = await api.get(`/badges/usuario/${usuarioId}`);
    return response.data;
  },
};

export const analyticsService = {
  get: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getByUsuario: async (usuarioId: number) => {
    const response = await api.get(`/analytics/${usuarioId}`);
    return response.data;
  },

  getComparativo: async (usuarioId: number) => {
    const response = await api.get(`/analytics/${usuarioId}/comparativo`);
    return response.data;
  },
};

export const historicoService = {
  get: async () => {
    const response = await api.get('/historico');
    return response.data;
  },

  getResumoPorDia: async () => {
    const response = await api.get('/historico/resumo-por-dia');
    return response.data;
  },

  getByUsuario: async (usuarioId: number) => {
    const response = await api.get(`/historico/${usuarioId}`);
    return response.data;
  },
};

export const desafiosService = {
  getAll: async () => {
    const response = await api.get('/desafios');
    return response.data;
  },

  getByUsuario: async (usuarioId: number) => {
    const response = await api.get(`/desafios/usuario/${usuarioId}`);
    return response.data;
  },

  participar: async (desafioId: number) => {
    const response = await api.post(`/desafios/participar/${desafioId}`);
    return response.data;
  },

  updateProgresso: async (userDesafioId: number, progresso: number) => {
    const response = await api.post(`/desafios/progresso/${userDesafioId}`, { progresso });
    return response.data;
  },
};

export const configsService = {
  get: async () => {
    const response = await api.get('/configs');
    return response.data;
  },

  update: async (data: { nome?: string; senha_atual?: string; nova_senha?: string }) => {
    const response = await api.put('/configs', data);
    return response.data;
  },
};
