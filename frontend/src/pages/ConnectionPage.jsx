import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Check, AlertCircle, ArrowLeft, Loader2, UserCheck, Unlink, X, User } from 'lucide-react';
import { coachService } from '../services';
import { useAuth } from '../context/AuthContext';

const spring = { type: 'spring', damping: 22, stiffness: 260 };

export const ConnectionPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [coachInfo, setCoachInfo] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectedCoachName, setConnectedCoachName] = useState('');

  useEffect(() => {
    fetchMyCoach();
  }, []);

  const fetchMyCoach = async () => {
    setLoadingCoach(true);
    try {
      const res = await coachService.getMyCoach();
      if (res.data?.connected && res.data?.coach) {
        setCoachInfo(res.data.coach);
      }
    } catch { }
    setLoadingCoach(false);
  };

  const handleConnect = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await coachService.connectByToken(code.trim().toUpperCase());
      setConnectedCoachName(res.data?.coach_name || 'seu instrutor');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido. Verifique com seu instrutor.');
    }
    finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!coachInfo) return;
    setDisconnecting(true);
    try {
      await coachService.disconnectStudent(coachInfo.id);
      setCoachInfo(null);
    } catch { }
    setDisconnecting(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <UserCheck className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-xl font-bold text-white mb-2">Conectado com Sucesso!</motion.h2>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-sm text-slate-400 text-center mb-8">Você agora está vinculado a <span className="text-white font-medium">{connectedCoachName}</span>. Seus treinos aparecerão na aba Treinos.</motion.p>
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('dashboard')}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          Ir para Dashboard
        </motion.button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Meu Coach</h1>
          <p className="text-sm text-slate-500">Conexão com instrutor</p>
        </div>
      </div>

      {/* Current Coach Card */}
      {loadingCoach ? (
        <div className="card-base p-6 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-800/50" />
              <div className="h-3 w-48 rounded bg-slate-800/50" />
            </div>
          </div>
        </div>
      ) : coachInfo ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          className="card-base p-6">
          <div className="flex items-center gap-1 mb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">CONECTADO</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
              {coachInfo.foto ? (
                <img src={coachInfo.foto} alt={coachInfo.nome} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-indigo-400 font-bold text-lg">{coachInfo.nome?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">{coachInfo.nome}</h3>
              <p className="text-xs text-slate-500">{coachInfo.especialidade || 'Personal Trainer'}</p>
              {coachInfo.cref && <p className="text-[10px] text-slate-600 mt-0.5">CREF: {coachInfo.cref}</p>}
            </div>
          </div>
          
          {coachInfo.coach_bio && (
            <p className="text-sm text-slate-400 mb-4 p-3 rounded-xl bg-slate-800/20 border border-slate-700/10 leading-relaxed">{coachInfo.coach_bio}</p>
          )}
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{coachInfo.total_students || 0}</div>
              <div className="text-[10px] text-slate-500">Alunos</div>
            </div>
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{coachInfo.email}</div>
              <div className="text-[10px] text-slate-500">Contato</div>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('chat', { participanteId: coachInfo.id, participanteNome: coachInfo.nome })}
              className="flex-1 py-2.5 text-sm font-medium bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/15 border border-indigo-500/20 transition-all flex items-center justify-center gap-2">
              Conversar
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleDisconnect} disabled={disconnecting}
              className="py-2.5 px-4 text-sm font-medium text-red-400/70 rounded-xl hover:bg-red-500/10 border border-red-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
              {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Connect Form — only show if no coach connected */
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          className="card-base p-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <Link2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-center text-lg font-semibold text-white mb-1">Conectar ao Instrutor</h2>
          <p className="text-center text-sm text-slate-500 mb-6">
            Peça o código de 6 dígitos ao seu instrutor e insira abaixo.
          </p>

          <div className="space-y-4">
            <div>
              <input 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} 
                placeholder="Ex: A3B7K2"
                className="w-full px-4 py-4 bg-slate-800/40 border border-slate-700/20 rounded-xl text-center text-2xl font-mono text-indigo-300 tracking-[0.5em] placeholder-slate-600 placeholder:tracking-[0.3em] placeholder:text-lg outline-none focus:border-indigo-500/30 transition-colors"
                maxLength={6} />
              <p className="text-center text-[11px] text-slate-600 mt-2">{code.length}/6 caracteres</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-400">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleConnect} disabled={code.length < 4 || loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</> : <><Link2 className="w-4 h-4" /> Conectar</>}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConnectionPage;
