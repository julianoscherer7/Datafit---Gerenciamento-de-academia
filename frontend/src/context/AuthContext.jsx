import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const res = await fetch('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    if (!res.ok) throw new Error('Login falhou');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    await fetchUser();
  };

  const register = async (nome, email, senha) => {
    const res = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    if (!res.ok) throw new Error('Registro falhou');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    await fetchUser();
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
