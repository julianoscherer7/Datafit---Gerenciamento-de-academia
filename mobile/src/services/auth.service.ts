import api from '../api/client';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  nome: string;
  nickname: string;
  email: string;
  senha: string;
  perfil: 'aluno' | 'instrutor';
  cref?: string;
  especialidade?: string;
  bio?: string;
  invite_token?: string;
}

export interface User {
  id: number;
  nome: string;
  nickname?: string;
  email: string;
  perfil: 'aluno' | 'instrutor' | 'admin';
  coach_status?: 'pending' | 'approved' | 'rejected';
  cref?: string;
  especialidade?: string;
  foto_url?: string;
  foto_base64?: string;
  banner_base64?: string;
  bio?: string;
  data_nascimento?: string;
  peso_kg?: number;
  altura_cm?: number;
  genero?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  // Gamification
  xp?: number;
  level?: number;
  moedas?: number;
  titulo?: string;
  streak?: number;
  treinos_validados?: number;
}

export const authService = {
  login: async (data: LoginData) => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  checkEmail: async (email: string) => {
    const response = await api.get(`/auth/check-email/${email}`);
    return response.data;
  },
};
