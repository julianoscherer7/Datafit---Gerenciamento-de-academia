// Amigos Service - Serviço de amigos/social separado
import api from './api';

export const amigosService = {
  /**
   * Lista todos os amigos do usuário
   */
  getAmigos: () => api.get('/amigos'),

  /**
   * Obtém ranking global de usuários
   */
  getRanking: () => api.get('/amigos/ranking'),

  /**
   * Busca usuários para adicionar como amigo
   * @param {string} query - Termo de busca
   */
  buscarUsuarios: (query) => api.get(`/amigos/buscar?q=${encodeURIComponent(query)}`),

  /**
   * Envia solicitação de amizade
   * @param {number} usuarioId - ID do usuário
   */
  enviarSolicitacao: (usuarioId) => api.post('/amigos/solicitar', { solicitado_id: usuarioId }),

  /**
   * Aceita solicitação de amizade
   * @param {number} solicitacaoId - ID da solicitação
   */
  aceitarSolicitacao: (solicitacaoId) => api.post(`/amigos/aceitar/${solicitacaoId}`),

  /**
   * Recusa solicitação de amizade
   * @param {number} solicitacaoId - ID da solicitação
   */
  recusarSolicitacao: (solicitacaoId) => api.post(`/amigos/rejeitar/${solicitacaoId}`),

  /**
   * Remove um amigo
   * @param {number} amigoId - ID do amigo
   */
  removerAmigo: (amigoId) => api.delete(`/amigos/${amigoId}`),

  /**
   * Lista solicitações pendentes
   */
  getSolicitacoesPendentes: () => api.get('/amigos/pendentes'),

  /**
   * Obtém sugestões de amigos
   */
  getSugestoes: () => api.get('/amigos/sugestoes'),

  /**
   * Obtém perfil público de um amigo
   * @param {number} amigoId - ID do amigo
   */
  getPerfilAmigo: (amigoId) => api.get(`/amigos/${amigoId}/perfil`),
};

export default amigosService;
