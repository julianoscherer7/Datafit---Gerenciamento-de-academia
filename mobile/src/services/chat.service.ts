import api from '../api/client';

export interface Mensagem {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  conteudo: string;
  tipo: 'text' | 'image' | 'video' | 'treino' | 'badge';
  lida: boolean;
  editado: boolean;
  editado_em?: string;
  criado_em: string;
  video_base64?: string;
}

export interface Conversa {
  usuario_id: number;
  nome: string;
  nickname?: string;
  foto_url?: string;
  foto_base64?: string;
  ultima_mensagem?: string;
  ultima_data?: string;
  nao_lidas: number;
  online?: boolean;
  tipo_relacao?: string;
}

export const chatService = {
  enviarMensagem: async (destinatarioId: number, conteudo: string, tipo: string = 'text') => {
    const response = await api.post('/chat/enviar', {
      destinatario_id: destinatarioId,
      conteudo,
      tipo,
    });
    return response.data;
  },

  getConversas: async () => {
    const response = await api.get('/chat/conversas');
    return response.data;
  },

  getHistorico: async (amigoId: number) => {
    const response = await api.get(`/chat/historico/${amigoId}`);
    return response.data;
  },

  deletarMensagem: async (mensagemId: number) => {
    const response = await api.delete(`/chat/mensagem/${mensagemId}`);
    return response.data;
  },

  editarMensagem: async (mensagemId: number, conteudo: string) => {
    const response = await api.put(`/chat/editar/${mensagemId}`, { conteudo });
    return response.data;
  },

  deletarConversa: async (outroId: number) => {
    const response = await api.delete(`/chat/conversa/${outroId}`);
    return response.data;
  },

  marcarLida: async (mensagemId: number) => {
    const response = await api.post(`/chat/marcar-lida/${mensagemId}`);
    return response.data;
  },

  contarNaoLidas: async () => {
    const response = await api.get('/chat/nao-lidas');
    return response.data;
  },
};
