import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Dumbbell } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Teste de conexão silencioso ao montar o componente - DESABILITADO
  // useEffect(() => {
  //   const testApiConnection = async () => {
  //     try {
  //       const controller = new AbortController();
  //       const timeout = setTimeout(() => controller.abort(), 5000);
  //       
  //       const response = await fetch(`${API_BASE}/health`, {
  //         signal: controller.signal
  //       });
  //       
  //       clearTimeout(timeout);
  //       
  //       if (!response.ok) {
  //         console.warn(`API health check falhou com status ${response.status}`);
  //       }
  //     } catch (err) {
  //       // Silenciar erro - não quebra o app
  //       console.debug('API connection test:', err.message);
  //     }
  //   };

  //   testApiConnection();
  // }, []);

  const handleSubmit = async () => {
    if (!email || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Conexão com API funcionando!\n${JSON.stringify(data, null, 2)}`);
      } else {
        alert(`❌ API respondeu com erro: ${response.status}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        alert('❌ Timeout: API não respondeu em 5 segundos');
      } else if (err instanceof TypeError) {
        // Network error (CORS, connection refused, etc)
        alert(`❌ Erro de conexão: Não foi possível conectar à API em ${API_BASE}\n\nVerifique se o backend está rodando.`);
      } else {
        alert(`❌ Erro: ${err.message}`);
      }
    }
  };

  // Preencher com conta demo
  const fillDemoAccount = () => {
    setEmail('maria@fitdata.com');
    setSenha('Maria@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-400 mt-2">Entre para continuar treinando</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-xl"
          >
            <div onKeyPress={handleKeyPress}>
              {/* Email Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}
              
              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : 'Entrar'}
              </motion.button>
            </div>

            {/* Register Link */}
            <p className="text-center text-slate-400 mt-6">
              Não tem conta?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
              >
                Registre-se
              </button>
            </p>
          </motion.div>

          {/* Demo Account Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30"
          >
            <p className="text-slate-300 text-sm font-medium mb-3">🌟 Conta de Demonstração</p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fillDemoAccount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 text-sm rounded-lg hover:from-purple-600/40 hover:to-pink-600/40 transition-all"
              >
                Usar Maria (Demo)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={testConnection}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600/30 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition-all"
              >
                🔗 Testar API
              </motion.button>
            </div>
            <p className="text-slate-500 text-xs mt-2">maria@fitdata.com / Maria@123</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
