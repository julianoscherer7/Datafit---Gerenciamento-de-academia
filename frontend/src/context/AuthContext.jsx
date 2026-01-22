import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await authService.me();
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err.response?.status, err.response?.data);
      // Se receber 401, limpa o token
      if (err.response?.status === 401) {
        logout();
      } else {
        setLoading(false);
      }
    }
  };

  const login = async (email, senha) => {
    try {
      console.log('Tentando fazer login com:', email);
      const res = await authService.login(email, senha);
      console.log('Login bem-sucedido:', res.data);
      const { access_token } = res.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Atualiza usuário após login
      try {
        const userRes = await authService.me();
        setUser(userRes.data);
      } catch (err) {
        console.error('Erro ao obter dados do usuário:', err);
      }
      
      return res.data;
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao fazer login';
      throw new Error(errorMsg);
    }
  };

  const register = async (nome, email, senha) => {
    try {
      console.log('Tentando registrar:', { nome, email });
      const res = await authService.register(nome, email, senha);
      console.log('Registro bem-sucedido:', res.data);
      const { access_token } = res.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Atualiza usuário após registro
      try {
        const userRes = await authService.me();
        setUser(userRes.data);
      } catch (err) {
        console.error('Erro ao obter dados do usuário:', err);
      }
      
      return res.data;
    } catch (err) {
      console.error('Erro no registro:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || 'Erro ao criar conta';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
