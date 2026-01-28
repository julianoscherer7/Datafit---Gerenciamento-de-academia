// Exercícios Service - Serviço de exercícios separado
import api from './api';

export const exerciciosService = {
  /**
   * Lista todos os exercícios disponíveis
   */
  getExercicios: () => api.get('/exercicios'),

  /**
   * Busca exercícios por nome ou grupo muscular
   * @param {string} query - Termo de busca
   */
  buscarExercicios: (query) => api.get(`/exercicios/buscar?q=${encodeURIComponent(query)}`),

  /**
   * Obtém exercícios por grupo muscular
   * @param {string} grupo - Nome do grupo muscular
   */
  getExerciciosPorGrupo: (grupo) => api.get(`/exercicios/grupo/${encodeURIComponent(grupo)}`),

  /**
   * Obtém detalhes de um exercício
   * @param {number} id - ID do exercício
   */
  getExercicio: (id) => api.get(`/exercicios/${id}`),

  /**
   * Lista grupos musculares disponíveis
   */
  getGruposMusculares: () => api.get('/exercicios/grupos'),
};

export default exerciciosService;
