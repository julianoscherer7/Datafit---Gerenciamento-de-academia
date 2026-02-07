import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Dumbbell, Activity, CheckCircle, XCircle } from 'lucide-react';
import API_BASE from '../config';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleSubmit = async () => {
    if (!email || !senha) { setError('Preencha todos os campos.'); return; }
    setError(''); setLoading(true);
    try {
      await login(email, senha);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    } finally { setLoading(false); }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const response = await fetch(`${API_BASE}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({ 
          success: true, 
          message: `API conectada: ${data.status || 'healthy'}`,
          details: `Backend: ${API_BASE}`
        });
      } else {
        setConnectionStatus({ 
          success: false, 
          message: `Erro ${response.status}: ${response.statusText}` 
        });
      }
    } catch (err) {
      setConnectionStatus({ 
        success: false, 
        message: 'Falha ao conectar com a API',
        details: err.message 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0c0f1a' }}>
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      </div>

      <header className="relative z-10 py-6 px-6">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }} onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </motion.button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }} className="w-full max-w-[400px]">

          {/* Logo */}
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm mt-1">Entre para continuar treinando</p>
          </motion.div>

          {/* Form Card */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-7" style={{ background: 'rgba(26,31,46,0.6)', border: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(12px)' }}>

            <div onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="space-y-5">
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" className="input-base pl-10" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••" className="input-base pl-10 pr-10" />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </motion.div>
              )}

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleSubmit} disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </motion.button>
            </div>

            <p className="text-center text-slate-500 mt-5 text-sm">
              Nao tem conta?{' '}
              <button onClick={() => onNavigate('register')} className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                Registre-se
              </button>
            </p>
          </motion.div>

          {/* API Connection Test */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(26,31,46,0.3)', border: '1px solid rgba(148,163,184,0.05)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm text-slate-300 font-medium">Teste de Conexão</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.99 }}
              onClick={testConnection}
              disabled={testingConnection}
              className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-xl hover:bg-emerald-500/15 transition-all disabled:opacity-50">
              {testingConnection ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                  Testando...
                </span>
              ) : 'Testar Conexão com API'}
            </motion.button>
            
            {connectionStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-3 rounded-lg text-xs ${
                  connectionStatus.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-300'
                }`}>
                <div className="flex items-start gap-2">
                  {connectionStatus.success ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{connectionStatus.message}</div>
                    {connectionStatus.details && (
                      <div className="mt-1 text-[10px] opacity-70">{connectionStatus.details}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
