// Auth Service - Serviço de autenticação separado
import api from './api';

export const authService = {
  /**
   * Registra um novo usuário (aluno ou instrutor)
   * @param {string} nome - Nome do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @param {string} nickname - Nickname do usuário (opcional)
   * @param {string} perfil - Perfil: 'aluno' ou 'instrutor' (default: 'aluno')
   * @param {object} coachData - Dados do coach: { cref, especialidade, coach_bio, invite_token }
   */
  register: (nome, email, senha, nickname = null, perfil = 'aluno', coachData = {}) =>
    api.post('/auth/register', { 
      nome, email, senha, perfil,
      ...(nickname && { nickname }),
      ...coachData
    }),

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
