// Configs Service - Serviço de configurações separado
import api from './api';

export const configsService = {
  /**
   * Obtém configurações do usuário
   */
  getConfigs: () => api.get('/configs'),

  /**
   * Atualiza configurações do usuário
   * @param {object} data - Configurações a atualizar
   */
  atualizarConfigs: (data) => api.put('/configs', data),

  /**
   * Atualiza preferências de notificação
   * @param {object} data - Preferências de notificação
   */
  atualizarNotificacoes: (data) => api.put('/configs/notificacoes', data),

  /**
   * Atualiza preferências de privacidade
   * @param {object} data - Preferências de privacidade
   */
  atualizarPrivacidade: (data) => api.put('/configs/privacidade', data),

  /**
   * Exporta dados do usuário
   */
  exportarDados: () => api.get('/configs/exportar-dados', { responseType: 'blob' }),

  /**
   * Deleta conta do usuário
   * @param {string} senha - Senha para confirmação
   */
  deletarConta: (senha) => api.post('/configs/deletar-conta', { senha }),
};

export default configsService;
