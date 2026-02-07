import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, Trophy, Medal, Flame, Zap,
  TrendingUp, ChevronRight, Crown, Star, Target
} from 'lucide-react';
import { amigosService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Avatar = ({ nome, rank, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-lg' };
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-blue-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold`}>{initials}</div>
      {rank && rank <= 3 && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
          rank === 1 ? 'bg-amber-400 text-amber-900' : rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-amber-600 text-amber-100'
        }`}>
          {rank}
        </div>
      )}
    </div>
  );
};

// Top 3 Podium
const Podium = ({ users }) => {
  if (users.length < 3) return null;
  const order = [users[1], users[0], users[2]]; // 2nd, 1st, 3rd

  return (
    <div className="flex items-end justify-center gap-3 mb-8">
      {order.map((u, i) => {
        const isFirst = i === 1;
        const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
        return (
          <motion.div key={u?.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
            <Avatar nome={u?.nome || 'User'} rank={rank} size={isFirst ? 'lg' : 'md'} />
            <div className="mt-2 text-center">
              <div className={`font-semibold truncate max-w-[80px] ${isFirst ? 'text-white text-sm' : 'text-slate-300 text-xs'}`}>
                {u?.nome || u?.nickname || 'User'}
              </div>
              <div className="flex items-center gap-1 justify-center mt-0.5">
                <Zap className={`${isFirst ? 'w-3.5 h-3.5 text-amber-400' : 'w-3 h-3 text-slate-500'}`} />
                <span className={`font-bold ${isFirst ? 'text-amber-400 text-sm' : 'text-slate-400 text-xs'}`}>
                  {u?.xp || u?.pontos || 0}
                </span>
              </div>
            </div>
            <div className={`mt-2 rounded-t-xl w-20 flex items-center justify-center ${
              isFirst ? 'h-24 bg-indigo-500/15 border border-indigo-500/20' :
              rank === 2 ? 'h-16 bg-slate-800/30 border border-slate-700/10' : 'h-12 bg-slate-800/20 border border-slate-700/10'
            }`}>
              {isFirst && <Crown className="w-5 h-5 text-amber-400" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export const AmigosPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ranking');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await amigosService.getAmigos();
      const data = res.data || [];
      // Sort by XP for ranking
      data.sort((a, b) => (b.xp || b.pontos || 0) - (a.xp || a.pontos || 0));
      setAmigos(data);
    } catch (err) {
      // Demo data
      setAmigos([
        { id: 1, nome: 'Joao Silva', nickname: 'joao_fit', xp: 4500, nivel: 8, streak: 12, online: true },
        { id: 2, nome: 'Ana Santos', nickname: 'ana_strong', xp: 3800, nivel: 7, streak: 8, online: true },
        { id: 3, nome: 'Carlos Lima', nickname: 'carlos_gym', xp: 3200, nivel: 6, streak: 5, online: false },
        { id: 4, nome: 'Julia Costa', nickname: 'julia_fit', xp: 2800, nivel: 5, streak: 3, online: true },
        { id: 5, nome: 'Pedro Alves', nickname: 'pedro_a', xp: 2100, nivel: 4, streak: 1, online: false },
      ]);
    }
    finally { setLoading(false); }
  };

  const filteredAmigos = amigos.filter(a =>
    !searchTerm || (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: 'ranking', label: 'Ranking', icon: Trophy },
    { key: 'amigos', label: 'Amigos', icon: Users }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ranking & Amigos</h1>
          <p className="text-sm text-slate-500">{amigos.length} conexoes</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/15 transition-all">
          <UserPlus className="w-4 h-4" /> Adicionar
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/30 border border-slate-700/10 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ranking' && (
          <motion.div key="ranking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Podium */}
            {filteredAmigos.length >= 3 && <Podium users={filteredAmigos.slice(0, 3)} />}

            {/* Ranking list */}
            <div className="space-y-1.5">
              {filteredAmigos.map((amigo, i) => (
                <motion.div key={amigo.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-800/30 ${
                    amigo.id === user?.id ? 'bg-indigo-500/5 border border-indigo-500/10' : ''
                  }`}>
                  <span className={`w-6 text-center text-sm font-bold ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-600'
                  }`}>{i + 1}</span>
                  <Avatar nome={amigo.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{amigo.nome}</span>
                      {amigo.online && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Nv.{amigo.nivel || 1}</span>
                      {amigo.streak > 0 && <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{amigo.streak}</span>
                      </>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-bold text-white">{(amigo.xp || amigo.pontos || 0).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'amigos' && (
          <motion.div key="amigos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAmigos.map((amigo, i) => (
                <motion.div key={amigo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-base p-4 hover:border-slate-700/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar nome={amigo.nome} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{amigo.nome}</div>
                      {amigo.nickname && <div className="text-[11px] text-slate-500">@{amigo.nickname}</div>}
                    </div>
                    {amigo.online && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Nv.{amigo.nivel || 1}</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {amigo.xp || 0} XP</span>
                    {amigo.streak > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {amigo.streak}d</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onNavigate('chat')}
                      className="flex-1 text-xs py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 transition-all font-medium">
                      Mensagem
                    </button>
                    <button className="flex-1 text-xs py-2 rounded-lg bg-slate-800/40 text-slate-400 hover:bg-slate-800/60 transition-all font-medium">
                      Perfil
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmigosPage;
