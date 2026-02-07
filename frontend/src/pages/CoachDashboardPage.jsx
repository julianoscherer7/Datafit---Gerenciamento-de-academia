import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Copy, Check, RefreshCcw, ChevronRight, Search,
  Dumbbell, TrendingUp, Zap, Star, MoreHorizontal, X, Eye
} from 'lucide-react';
import { coachService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Avatar = ({ nome, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs' };
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold`}>{initials}</div>;
};

export const CoachDashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, tRes] = await Promise.all([coachService.getAlunos(), coachService.getToken()]);
      setAlunos(aRes.data || []);
      setToken(tRes.data?.token || '');
    } catch {
      setAlunos([
        { id: 1, nome: 'Joao Silva', email: 'joao@email.com', nivel: 5, xp: 2800, treinos_semana: 4 },
        { id: 2, nome: 'Maria Santos', email: 'maria@email.com', nivel: 3, xp: 1200, treinos_semana: 2 },
        { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', nivel: 7, xp: 4100, treinos_semana: 5 },
      ]);
      setToken('ABC-123-XYZ');
    }
    finally { setLoading(false); }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateToken = async () => {
    try {
      const res = await coachService.gerarToken();
      setToken(res.data?.token || '');
    } catch {}
  };

  const filtered = alunos.filter(a =>
    !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Painel do Coach</h1>
        <p className="text-sm text-slate-500">{alunos.length} alunos conectados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Alunos', value: alunos.length, icon: Users, color: 'indigo' },
          { label: 'Ativos (sem)', value: alunos.filter(a => (a.treinos_semana || 0) > 0).length, icon: TrendingUp, color: 'emerald' },
          { label: 'Media XP', value: alunos.length ? Math.round(alunos.reduce((s, a) => s + (a.xp || 0), 0) / alunos.length) : 0, icon: Zap, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card-base p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon className={`w-4 h-4 text-${s.color}-400`} />
              <span className="text-[11px] text-slate-500">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Connection Token */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card-base p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Token de Conexao
          </h3>
          <button onClick={handleGenerateToken}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Gerar novo
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm font-mono text-indigo-300 tracking-wider">
            {token || 'Nenhum token gerado'}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleCopyToken} disabled={!token}
            className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/15 disabled:opacity-30 transition-all">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
        <p className="text-[11px] text-slate-600 mt-2">Compartilhe este token com seus alunos para que eles se conectem a voce.</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
      </div>

      {/* Students list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum aluno encontrado</div>
        ) : filtered.map((aluno, i) => (
          <motion.div key={aluno.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card-base p-4 hover:border-slate-700/30 transition-all group cursor-pointer"
            onClick={() => setSelectedAluno(aluno)}>
            <div className="flex items-center gap-3">
              <Avatar nome={aluno.nome} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{aluno.nome}</div>
                <div className="text-[11px] text-slate-500">{aluno.email}</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Nv.{aluno.nivel || 1}</span>
                <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {aluno.treinos_semana || 0}/sem</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={() => onNavigate('coachTreinos')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/15 transition-all">
        <Dumbbell className="w-4 h-4" /> Gerenciar Treinos dos Alunos
      </motion.button>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedAluno && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedAluno(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar nome={selectedAluno.nome} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedAluno.nome}</h3>
                    <p className="text-xs text-slate-500">{selectedAluno.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAluno(null)} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Nivel', value: selectedAluno.nivel || 1 },
                  { label: 'XP', value: selectedAluno.xp || 0 },
                  { label: 'Treinos/sem', value: selectedAluno.treinos_semana || 0 },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setSelectedAluno(null); onNavigate('coachTreinos'); }}
                className="w-full py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all">
                Gerenciar Treinos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachDashboardPage;
