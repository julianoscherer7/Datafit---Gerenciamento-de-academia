// Dashboard Service - Serviço do dashboard separado
import api from './api';

export const dashboardService = {
  /**
   * Obtém todos os dados do dashboard
   */
  getDashboard: () => api.get('/dashboard'),

  /**
   * Obtém estatísticas resumidas
   */
  getEstatisticas: () => api.get('/dashboard/estatisticas'),

  /**
   * Obtém atividades recentes
   */
  getAtividadesRecentes: () => api.get('/dashboard/atividades-recentes'),

  /**
   * Obtém progresso do usuário
   */
  getProgresso: () => api.get('/dashboard/progresso'),
};

export default dashboardService;
