import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback se não estiver dentro do Provider
    return { 
      user: null, 
      token: null, 
      loading: false, 
      login: () => Promise.reject('AuthProvider not found'), 
      register: () => Promise.reject('AuthProvider not found'), 
      logout: () => {} 
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await authService.me();
      setUser(res.data);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err.response?.status, err.response?.data);
      // Se receber 401, limpa o token
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, senha) => {
    try {
      console.log('Tentando fazer login com:', email);
      const res = await authService.login(email, senha);
      console.log('Login bem-sucedido:', res.data);
      
      const { access_token, user_id, perfil } = res.data;
      
      // Salva token
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Busca dados completos do usuário
      try {
        const userRes = await authService.me();
        setUser(userRes.data);
      } catch (userErr) {
        // Se falhar ao buscar usuário, usa dados básicos do login
        console.warn('Usando dados básicos do login:', userErr);
        setUser({ id: user_id, perfil, email });
      }
      
      return res.data;
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message);
      // Usa mensagem amigável do interceptor ou a do backend
      const errorMsg = err.friendlyMessage || err.response?.data?.detail || 'Email ou senha inválidos';
      throw new Error(errorMsg);
    }
  };

  const register = async (nomeOrData, email, senha, nickname = null, perfil = 'aluno', coachData = {}) => {
    // Support both object and positional args
    let nome, nick, em, pw, pf, cd;
    if (typeof nomeOrData === 'object' && nomeOrData !== null) {
      const data = nomeOrData;
      nome = data.nome;
      em = data.email;
      pw = data.senha;
      nick = data.nickname || null;
      pf = data.perfil || 'aluno';
      cd = {};
      if (data.cref) cd.cref = data.cref;
      if (data.especialidade) cd.especialidade = data.especialidade;
      if (data.bio) cd.coach_bio = data.bio;
    } else {
      nome = nomeOrData;
      em = email;
      pw = senha;
      nick = nickname;
      pf = perfil;
      cd = coachData;
    }
    try {
      console.log('Tentando registrar:', { nome, em, nick, pf });
      const res = await authService.register(nome, em, pw, nick, pf, cd);
      console.log('Registro bem-sucedido:', res.data);
      
      const { access_token, user_id, perfil: userPerfil } = res.data;
      
      // Salva token
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Busca dados completos do usuário
      try {
        const userRes = await authService.me();
        setUser(userRes.data);
      } catch (userErr) {
        console.warn('Usando dados básicos do registro:', userErr);
        setUser({ id: user_id, perfil: userPerfil, email, nome, nickname });
      }
      
      return res.data;
    } catch (err) {
      console.error('Erro no registro:', err.response?.data || err.message);
      const errorMsg = err.friendlyMessage || err.response?.data?.detail || 'Erro ao criar conta';
      throw new Error(errorMsg);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authService.me();
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
    // Role helpers
    isCoach: user?.perfil === 'instrutor',
    isAdmin: user?.perfil === 'admin',
    isStudent: user?.perfil === 'aluno',
    isApprovedCoach: user?.perfil === 'instrutor' && user?.coach_status === 'approved',
    coachStatus: user?.coach_status,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
