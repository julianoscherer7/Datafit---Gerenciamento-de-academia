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

  const register = async (nome, email, senha) => {
    try {
      console.log('Tentando registrar:', { nome, email });
      const res = await authService.register(nome, email, senha);
      console.log('Registro bem-sucedido:', res.data);
      
      const { access_token, user_id, perfil } = res.data;
      
      // Salva token
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Busca dados completos do usuário
      try {
        const userRes = await authService.me();
        setUser(userRes.data);
      } catch (userErr) {
        console.warn('Usando dados básicos do registro:', userErr);
        setUser({ id: user_id, perfil, email, nome });
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

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
