// Analytics Service - Serviço de analytics separado
import api from './api';

export const analyticsService = {
  /**
   * Obtém dados gerais de analytics
   */
  getAnalytics: () => api.get('/analytics'),

  /**
   * Obtém dados para gráficos
   * @param {string} periodo - Período (semana, mes, ano)
   */
  getDadosGraficos: (periodo = 'mes') => api.get(`/analytics/graficos?periodo=${periodo}`),

  /**
   * Obtém estatísticas por exercício
   */
  getEstatisticasExercicios: () => api.get('/analytics/exercicios'),

  /**
   * Obtém evolução de carga
   * @param {number} exercicioId - ID do exercício
   */
  getEvolucaoCarga: (exercicioId) => api.get(`/analytics/evolucao-carga/${exercicioId}`),

  /**
   * Obtém consistência de treinos
   */
  getConsistencia: () => api.get('/analytics/consistencia'),

  /**
   * Obtém comparativo por período
   * @param {string} periodo1 - Primeiro período
   * @param {string} periodo2 - Segundo período
   */
  getComparativo: (periodo1, periodo2) => api.get(`/analytics/comparativo?p1=${periodo1}&p2=${periodo2}`),
};

export default analyticsService;
