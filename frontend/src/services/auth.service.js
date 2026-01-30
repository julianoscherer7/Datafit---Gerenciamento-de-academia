// Auth Service - Serviço de autenticação separado
import api from './api';

export const authService = {
  /**
   * Registra um novo usuário
   * @param {string} nome - Nome do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @param {string} nickname - Nickname do usuário (opcional)
   */
  register: (nome, email, senha, nickname = null) =>
    api.post('/auth/register', { nome, email, senha, ...(nickname && { nickname }) }),

  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   */
  login: (email, senha) =>
    api.post('/auth/login', { email, senha }),

  /**
   * Obtém dados do usuário autenticado
   */
  me: () => api.get('/auth/me'),

  /**
   * Verifica se o token é válido
   */
  validateToken: () => api.get('/auth/me'),

  /**
   * Atualiza perfil do usuário
   * @param {object} data - Dados do perfil
   */
  updateProfile: (data) => api.put('/auth/me', data),
};

export default authService;
