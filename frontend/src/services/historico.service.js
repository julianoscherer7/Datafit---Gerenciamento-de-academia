// Histórico Service - Serviço de histórico separado
import api from './api';

export const historicoService = {
  /**
   * Lista histórico de treinos
   * @param {object} params - Parâmetros de filtro
   */
  getHistorico: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/historico${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Obtém detalhes de uma execução específica
   * @param {number} id - ID da execução
   */
  getDetalheExecucao: (id) => api.get(`/historico/${id}`),

  /**
   * Obtém histórico por período
   * @param {string} inicio - Data início (YYYY-MM-DD)
   * @param {string} fim - Data fim (YYYY-MM-DD)
   */
  getHistoricoPorPeriodo: (inicio, fim) => api.get(`/historico/periodo?inicio=${inicio}&fim=${fim}`),

  /**
   * Obtém resumo mensal
   * @param {number} mes - Mês (1-12)
   * @param {number} ano - Ano
   */
  getResumoMensal: (mes, ano) => api.get(`/historico/resumo?mes=${mes}&ano=${ano}`),
};

export default historicoService;
