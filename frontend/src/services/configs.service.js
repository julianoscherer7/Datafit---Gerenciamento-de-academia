// Configs Service - Serviço de configurações separado
import api from './api';

export const configsService = {
  getConfigs: () => api.get('/configs'),
  atualizarConfigs: (data) => api.put('/configs', data),
  updatePerfil: (data) => api.put('/auth/me', data),

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
