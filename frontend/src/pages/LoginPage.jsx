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

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
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
      console.error('Erro:', err);
      setError(err.message || 'Erro ao fazer login. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        alert('✅ Conexão com API funcionando!');
      } else {
        alert('❌ API respondeu com erro: ' + response.status);
      }
    } catch (err) {
      alert('❌ Erro ao conectar com API: ' + err.message);
    }
  };

  const bgGradient = darkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-blue-500 to-purple-600';
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const labelColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  const linkColor = darkMode ? 'text-blue-400' : 'text-blue-500';

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
        <h2 className={`text-3xl font-bold text-center mb-2 ${textColor}`}>Login</h2>
        <p className={`text-center ${labelColor} mb-8 text-sm`}>Bem-vindo de volta!</p>
        
        <div onKeyPress={handleKeyPress}>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
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
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>

        <p className={`text-center ${labelColor}`}>
          Não tem conta?{' '}
          <button
            onClick={() => onNavigate('register')}
            className={`${linkColor} font-semibold hover:underline`}
          >
            Registre-se
          </button>
        </p>

        {/* Test Credentials Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-xs ${labelColor}`}
        >
          <p className="font-semibold mb-1">📝 Credenciais de Teste:</p>
          <p><strong>Admin:</strong> admin@fitdata.com / Admin@123</p>
          <p><strong>Usuário:</strong> usuario@fitdata.com / Usuario@123</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={testConnection}
            className="mt-3 w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-all"
          >
            🔗 Testar Conexão API
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
