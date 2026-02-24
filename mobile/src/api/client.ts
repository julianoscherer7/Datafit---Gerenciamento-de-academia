import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuração da URL base da API
// Em desenvolvimento, ajuste para o IP da sua máquina
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.100:8000' // Altere para o IP da sua máquina local
  : 'https://api.datafit.com';  // URL de produção

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar JWT automaticamente
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao ler token do SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — limpar e redirecionar para login
      await SecureStore.deleteItemAsync('token');
      // O authStore vai detectar isso e redirecionar
    }

    if (error.response?.status === 0 || !error.response) {
      console.error('Erro de rede — sem conexão com o servidor');
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
