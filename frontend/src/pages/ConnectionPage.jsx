import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link, UserPlus, ArrowLeft, Check, AlertCircle, X,
  Shield, User, Unlink
} from 'lucide-react';
import { coachService } from '../services';
import { useAuth } from '../context/AuthContext';

export const ConnectionPage = ({ onNavigate }) => {
  const { user, isCoach, isStudent } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [myCoach, setMyCoach] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(true);

  useEffect(() => {
    if (isStudent) {
      loadMyCoach();
    } else {
      setLoadingCoach(false);
    }
  }, [isStudent]);

  const loadMyCoach = async () => {
    setLoadingCoach(true);
    try {
      const res = await coachService.getMyCoach();
      setMyCoach(res.data);
    } catch (err) {
      // 404 = no coach connected
      setMyCoach(null);
    } finally {
      setLoadingCoach(false);
    }
  };

  const connectToCoach = async () => {
    if (!tokenInput.trim()) {
      setError('Insira o token de convite');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await coachService.connectByToken(tokenInput.trim());
      setSuccess(res.data.message || 'Conectado ao coach com sucesso!');
      setTokenInput('');
      loadMyCoach();
    } catch (err) {
      setError(err.response?.data?.detail || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromCoach = async () => {
    if (!myCoach?.connection_id) return;
    setLoading(true);
    try {
      await coachService.disconnectStudent(myCoach.connection_id);
      setMyCoach(null);
      setSuccess('Desconectado do coach.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCoach) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Coach</h1>
          <p className="text-slate-400 text-sm">Conecte-se ao seu instrutor</p>
        </div>
      </div>

      {/* Current Coach */}
      {myCoach ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-green-400">Coach Conectado</h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {myCoach.coach_name?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-lg">{myCoach.coach_name}</p>
              <p className="text-slate-400 text-sm">{myCoach.coach_email}</p>
              {myCoach.especialidade && (
                <p className="text-purple-400 text-xs mt-0.5">{myCoach.especialidade}</p>
              )}
            </div>
          </div>

          {myCoach.coach_bio && (
            <p className="text-slate-300 text-sm bg-slate-700/30 rounded-lg p-3 mb-4">
              "{myCoach.coach_bio}"
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span>Conectado desde: {myCoach.connected_at ? new Date(myCoach.connected_at).toLocaleDateString('pt-BR') : '-'}</span>
            <span className={`px-2 py-0.5 rounded-full ${
              myCoach.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {myCoach.status === 'active' ? 'Ativo' : 'Pendente'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={disconnectFromCoach}
            disabled={loading}
            className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Unlink className="w-4 h-4" />
            Desconectar do Coach
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Connect via Token */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Conectar via Token</h2>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Peça o token de convite ao seu instrutor/coach e cole abaixo para se conectar.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => { setTokenInput(e.target.value); setError(''); }}
                placeholder="Cole o token de convite aqui..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectToCoach}
                disabled={loading || !tokenInput.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Conectar ao Coach
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Info */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <h3 className="text-sm font-medium text-slate-300 mb-2">ℹ️ Como funciona?</h3>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>1. Seu instrutor gera um token de convite no painel dele</li>
              <li>2. Ele compartilha o token com você</li>
              <li>3. Você cola o token acima e clica em "Conectar"</li>
              <li>4. Pronto! Seu coach pode criar treinos personalizados para você</li>
            </ul>
          </div>
        </>
      )}

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConnectionPage;
