import axios from 'axios';

const API_URL = 'http://localhost:8000';

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
    if (error.response?.status === 401) {
      // Se 401, remove token e redireciona para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
