import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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

// Password validation helper
const validatePassword = (password) => {
  if (password.length < 6) {
    return 'Senha deve ter no mínimo 6 caracteres';
  }
  if (!/\d/.test(password)) {
    return 'Senha deve conter pelo menos um número';
  }
  return '';
};

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    
    const senhaError = validatePassword(senha);
    if (senhaError) newErrors.senha = senhaError;
    
    if (senha !== confirmaSenha) {
      newErrors.confirmaSenha = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await register(nome, email, senha);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const bgGradient = darkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-purple-500 to-pink-600';
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const labelColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  const linkColor = darkMode ? 'text-purple-400' : 'text-purple-500';

  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('landing')}
          className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} text-white text-xl transition-all`}
          title="Voltar para Home"
        >
          🏠
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleDarkMode()}
          className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} text-white text-xl transition-all`}
          title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </motion.button>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${cardBg} rounded-2xl p-8 w-full max-w-md shadow-2xl transition-colors duration-300`}
      >
        <h2 className={`text-3xl font-bold text-center mb-2 ${textColor}`}>Criar Conta</h2>
        <p className={`text-center ${labelColor} mb-8 text-sm`}>Junte-se à comunidade FITDATA</p>
        
        <div onKeyPress={handleKeyPress}>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.nome ? 'border-red-500 bg-red-50' : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.email ? 'border-red-500 bg-red-50' : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.senha ? 'border-red-500 bg-red-50' : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <p className={`text-xs ${labelColor} mt-1`}>Mínimo 6 caracteres com 1 número</p>
            {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Confirmar Senha</label>
            <input
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.confirmaSenha ? 'border-red-500 bg-red-50' : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            {errors.confirmaSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmaSenha}</p>}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <Button onClick={handleSubmit} loading={loading} className="w-full mb-4">
            {loading ? 'Criando Conta...' : 'Registrar'}
          </Button>
        </div>

        <p className={`text-center ${labelColor}`}>
          Já tem conta?{' '}
          <button
            onClick={() => onNavigate('login')}
            className={`${linkColor} font-semibold hover:underline`}
          >
            Faça login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
