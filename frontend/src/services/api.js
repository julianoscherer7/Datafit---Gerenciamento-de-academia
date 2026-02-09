import axios from 'axios';
import API_BASE from '../config';

const API_URL = API_BASE;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Adiciona token ao header se existir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Trata erros de resposta com mensagens amigáveis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento específico por código de erro
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Apenas redireciona se não for rota de auth
          if (!error.config.url.includes('/auth')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.hash !== '#login') {
              window.location.reload();
            }
          }
          error.friendlyMessage = data?.detail || 'Sessão expirada. Faça login novamente.';
          break;
        case 403:
          error.friendlyMessage = 'Você não tem permissão para esta ação.';
          break;
        case 404:
          error.friendlyMessage = 'Recurso não encontrado.';
          break;
        case 422:
          error.friendlyMessage = data?.detail?.[0]?.msg || 'Dados inválidos.';
          break;
        case 500:
          error.friendlyMessage = 'Erro interno do servidor. Tente novamente.';
          // Only log server errors
          console.error('Server Error:', error.config?.url);
          break;
        default:
          error.friendlyMessage = data?.detail || 'Ocorreu um erro. Tente novamente.';
      }
    } else if (error.request) {
      // Sem resposta do servidor
      error.friendlyMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else {
      error.friendlyMessage = 'Erro ao processar requisição.';
    }

    return Promise.reject(error);
  }
);

export const authService = {
  register: (nome, email, senha) =>
    api.post('/auth/register', { nome, email, senha }),
  login: (email, senha) =>
    api.post('/auth/login', { email, senha }),
  me: () => api.get('/auth/me'),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export const treinosService = {
  getTreinos: () => api.get('/treinos'),
  criarTreino: (data) => api.post('/treinos', data),
  getTreino: (id) => api.get(`/treinos/${id}`),
  atualizarTreino: (id, data) => api.put(`/treinos/${id}`, data),
  deletarTreino: (id) => api.delete(`/treinos/${id}`),
};

export const execucaoService = {
  registrarExecucao: (data) => api.post('/execucao', data),
  getHistoricoExecucao: () => api.get('/execucao/historico'),
};

export const desafiosService = {
  getDesafios: () => api.get('/desafios'),
  participarDesafio: (desafioId) => api.post(`/desafios/${desafioId}/participar`),
};

export const amigosService = {
  getAmigos: () => api.get('/amigos'),
  adicionarAmigo: (amigosId) => api.post(`/amigos/${amigosId}/adicionar`),
};

export const badgesService = {
  getBadges: () => api.get('/badges'),
};

export const analyitcsService = {
  getAnalytics: () => api.get('/analytics'),
};

export default api;
