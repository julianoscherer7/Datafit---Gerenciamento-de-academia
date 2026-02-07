import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { coachService } from '../services';
import { useAuth } from '../context/AuthContext';

export const ConnectionPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      await coachService.conectar(token.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Token invalido ou expirado');
    }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-lg font-bold text-white mb-1">Conectado!</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Voce foi conectado ao seu instrutor com sucesso.</p>
        <button onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all">
          Ir para Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Conectar ao Instrutor</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-7 h-7 text-indigo-400" />
        </div>
        <h2 className="text-center text-lg font-semibold text-white mb-1">Token de Conexao</h2>
        <p className="text-center text-sm text-slate-500 mb-6">
          Insira o token fornecido pelo seu instrutor para se conectar.
        </p>

        <div className="space-y-3">
          <input value={token} onChange={e => setToken(e.target.value.toUpperCase())} placeholder="Ex: ABC-123-XYZ"
            className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/20 rounded-xl text-center text-lg font-mono text-indigo-300 tracking-[0.3em] placeholder-slate-600 outline-none focus:border-indigo-500/30 transition-colors"
            maxLength={20} />

          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </motion.div>
          )}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleConnect} disabled={!token.trim() || loading}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</> : 'Conectar'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectionPage;
