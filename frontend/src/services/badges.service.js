// Badges Service - Serviço de badges/conquistas separado
import api from './api';

export const badgesService = {
  /**
   * Lista todos os badges disponíveis
   */
  getBadges: () => api.get('/badges'),

  /**
   * Lista badges conquistados pelo usuário
   */
  getMeusBadges: () => api.get('/badges/meus'),

  /**
   * Obtém detalhes de um badge
   * @param {number} id - ID do badge
   */
  getBadge: (id) => api.get(`/badges/${id}`),

  /**
   * Obtém progresso para desbloquear badges
   */
  getProgressoBadges: () => api.get('/badges/progresso'),
};

export default badgesService;
