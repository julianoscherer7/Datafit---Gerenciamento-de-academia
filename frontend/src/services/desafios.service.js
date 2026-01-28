// Desafios Service - Serviço de desafios separado
import api from './api';

export const desafiosService = {
  /**
   * Lista todos os desafios disponíveis
   */
  getDesafios: () => api.get('/desafios'),

  /**
   * Obtém desafios ativos do usuário
   */
  getDesafiosAtivos: () => api.get('/desafios/ativos'),

  /**
   * Participa de um desafio
   * @param {number} id - ID do desafio
   */
  participarDesafio: (id) => api.post(`/desafios/${id}/participar`),

  /**
   * Abandona um desafio
   * @param {number} id - ID do desafio
   */
  abandonarDesafio: (id) => api.delete(`/desafios/${id}/abandonar`),

  /**
   * Obtém detalhes de um desafio
   * @param {number} id - ID do desafio
   */
  getDesafio: (id) => api.get(`/desafios/${id}`),

  /**
   * Obtém progresso em um desafio
   * @param {number} id - ID do desafio
   */
  getProgressoDesafio: (id) => api.get(`/desafios/${id}/progresso`),

  /**
   * Obtém ranking de um desafio
   * @param {number} id - ID do desafio
   */
  getRankingDesafio: (id) => api.get(`/desafios/${id}/ranking`),
};

export default desafiosService;
