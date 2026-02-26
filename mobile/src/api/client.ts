// ============================================================
// DATAFIT Mobile — Cliente HTTP (Axios)
// ============================================================
// • baseURL vem de src/config/api.ts (lê EXPO_PUBLIC_API_URL)
// • JWT é injetado automaticamente via authStorage
// • Erros 401 fazem logout; erros de rede mostram mensagem
// ============================================================

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../config/api';
import { getToken, removeToken } from '../services/authStorage';

// -------------------- instância Axios --------------------

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- interceptor REQUEST — injeta JWT ----------

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('[DATAFIT] Erro ao ler token do SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------- interceptor RESPONSE — tratamento global ----------

/**
 * Mensagens amigáveis de erro por status HTTP.
 * Podem ser usadas pelos services/telas para mostrar ao usuário.
 */
export function getApiErrorMessage(error: AxiosError): string {
  if (!error.response) {
    // Sem resposta = erro de rede / servidor offline
    return 'Servidor indisponível. Verifique sua conexão e tente novamente.';
  }

  switch (error.response.status) {
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 404:
      return 'Recurso não encontrado (endpoint inexistente).';
    case 422: {
      // FastAPI retorna detalhes de validação em response.data.detail
      const detail = (error.response.data as any)?.detail;
      if (Array.isArray(detail)) {
        return detail.map((d: any) => d.msg).join('; ');
      }
      if (typeof detail === 'string') return detail;
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    }
    case 500:
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    default:
      return `Erro inesperado (${error.response.status}).`;
  }
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // ---------- 401 — logout automático ----------
    if (error.response?.status === 401) {
      await removeToken();
      // O authStore detecta a ausência do token e redireciona para login
      console.warn('[DATAFIT] 401 — token removido, redirecionando para login.');
    }

    // ---------- erro de rede ----------
    if (!error.response) {
      console.error(
        '[DATAFIT] Erro de rede — sem conexão com o servidor.',
        error.message,
      );
    }

    return Promise.reject(error);
  },
);

export default api;
export { API_BASE_URL };
