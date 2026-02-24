import api from '../api/client';

export const checkinService = {
  iniciar: async (fotoBase64: string, localizacao?: string) => {
    const response = await api.post('/checkin/iniciar', {
      foto_base64: fotoBase64,
      localizacao,
    });
    return response.data;
  },

  validar: async (checkinId: number, fotoBase64: string) => {
    const response = await api.post(`/checkin/validar/${checkinId}`, {
      foto_base64: fotoBase64,
    });
    return response.data;
  },

  getHoje: async () => {
    const response = await api.get('/checkin/hoje');
    return response.data;
  },

  getHistorico: async () => {
    const response = await api.get('/checkin/historico');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/checkin/status');
    return response.data;
  },
};
