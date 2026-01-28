import axios from 'axios';
import API_BASE from '../config';

const API_URL = API_BASE;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona token ao header se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });

    // Apenas redireciona para login se não for uma requisição de auth
    if (error.response?.status === 401 && !error.config.url.includes('/auth')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Evita múltiplos redirecionamentos
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
