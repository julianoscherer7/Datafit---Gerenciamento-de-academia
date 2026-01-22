import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Input Component
const Input = ({ label, error, value, onChange, type = 'text', ...props }) => (
  <div className="mb-4">
    {label && (
      <motion.label
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </motion.label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm mt-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', loading, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={loading}
    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
      variant === 'primary' 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg' 
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Carregando...
      </div>
    ) : children}
  </motion.button>
);

const useAuth = () => {
  const context = React.useContext(React.createContext());
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      onNavigate('dashboard');
    } catch (err) {
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        
        <div onKeyPress={handleKeyPress}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            error={error}
          />
          
          <Button onClick={handleSubmit} loading={loading} className="w-full mb-4">
            Entrar
          </Button>
        </div>

        <p className="text-center text-gray-600">
          Não tem conta?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-blue-500 font-semibold hover:underline"
          >
            Registre-se
          </button>
        </p>
      </motion.div>
    </div>
  );
}
