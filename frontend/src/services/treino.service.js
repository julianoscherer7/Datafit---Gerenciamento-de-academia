// Treino Service - Serviço de treinos separado
import api from './api';

export const treinoService = {
  /**
   * Lista todos os treinos do usuário
   */
  getTreinos: () => api.get('/treinos'),

  /**
   * Cria um novo treino
   * @param {object} data - Dados do treino
   */
  criarTreino: (data) => api.post('/treinos', data),
  createTreino: (data) => api.post('/treinos', data),

  /**
   * Obtém detalhes de um treino específico
   * @param {number} id - ID do treino
   */
  getTreino: (id) => api.get(`/treinos/${id}`),

  /**
   * Atualiza um treino existente
   * @param {number} id - ID do treino
   * @param {object} data - Dados atualizados
   */
  atualizarTreino: (id, data) => api.put(`/treinos/${id}`, data),
  updateTreino: (id, data) => api.put(`/treinos/${id}`, data),

  /**
   * Deleta um treino
   * @param {number} id - ID do treino
   */
  deletarTreino: (id) => api.delete(`/treinos/${id}`),
  deleteTreino: (id) => api.delete(`/treinos/${id}`),

  /**
   * Lista treinos atribuídos ao usuário
   */
  getTreinosAtribuidos: () => api.get('/treinos/atribuidos'),
};

export const execucaoService = {
  /**
   * Registra execução de um treino
   * @param {object} data - Dados da execução
   */
  registrarExecucao: (data) => api.post('/execucao', data),

  /**
   * Obtém histórico de execuções
   */
  getHistoricoExecucao: () => api.get('/execucao/historico'),

  /**
   * Obtém execuções de um treino específico
   * @param {number} treinoId - ID do treino
   */
  getExecucoesTreino: (treinoId) => api.get(`/execucao/treino/${treinoId}`),
};

export default treinoService;
