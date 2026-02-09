import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Award, Flame, Zap, Calendar, Target, Lock,
  BarChart3, Activity, ChevronRight, Star, Trophy
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardService, badgesService, historicoService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Counter = ({ to, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = 0; const end = parseFloat(to);
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000/60);
    return () => clearInterval(timer);
  }, [to]);
  return <span>{count}</span>;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(26,31,46,0.95)', border: '1px solid rgba(148,163,184,0.1)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const BadgeCard = ({ badge, locked = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`relative p-4 rounded-2xl text-center group transition-all ${
      locked
        ? 'bg-slate-800/20 border border-slate-700/10'
        : 'bg-slate-800/30 border border-slate-700/20 hover:border-indigo-500/20'
    }`}
  >
    {locked && (
      <div className="absolute inset-0 rounded-2xl backdrop-blur-[2px] bg-slate-900/30 z-10 flex items-center justify-center">
        <Lock className="w-5 h-5 text-slate-600" />
      </div>
    )}
    <div className={`text-3xl mb-2 ${locked ? 'opacity-30 grayscale' : ''}`}>
      {badge.icone || badge.icon || '\u{1F3C6}'}
    </div>
    <div className={`text-sm font-medium mb-0.5 ${locked ? 'text-slate-600' : 'text-white'}`}>
      {badge.nome || badge.name}
    </div>
    <div className={`text-[11px] ${locked ? 'text-slate-700' : 'text-slate-500'}`}>
      {badge.descricao || badge.description || ''}
    </div>
    {!locked && badge.data_conquista && (
      <div className="text-[10px] text-indigo-400 mt-1.5">
        {new Date(badge.data_conquista).toLocaleDateString('pt-BR')}
      </div>
    )}
    {locked && badge.progresso !== undefined && (
      <div className="mt-2 relative z-20">
        <div className="w-full h-1 rounded-full bg-slate-800">
          <div className="h-1 rounded-full bg-indigo-500/30" style={{ width: `${Math.min(badge.progresso || 0, 100)}%` }} />
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5">{badge.progresso || 0}%</div>
      </div>
    )}
  </motion.div>
);

export const EvolucaoPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('progresso');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState({ conquistados: [], disponiveis: [] });
  const [historico, setHistorico] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, hRes] = await Promise.allSettled([
        dashboardService.getDashboard(),
        badgesService.getBadges(),
        historicoService.getHistorico()
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (bRes.status === 'fulfilled') {
        const bData = bRes.value.data;
        setBadges({
          conquistados: bData.conquistados || bData.badges_conquistados || bData.earned || [],
          disponiveis: bData.disponiveis || bData.badges_disponiveis || bData.available || []
        });
      }
      if (hRes.status === 'fulfilled') setHistorico(hRes.value.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Generate chart data from historico
  const chartData = useMemo(() => {
    if (!historico.length) {
      // Return empty data for new accounts - no fake data
      return Array.from({ length: 7 }, (_, i) => ({
        dia: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i],
        carga: 0,
        volume: 0,
        frequencia: 0
      }));
    }
    return historico.slice(-7).map((h, i) => ({
      dia: h.data ? new Date(h.data).toLocaleDateString('pt-BR', { weekday: 'short' }) : `D${i+1}`,
      carga: h.carga_total || h.peso_total || 0,
      volume: h.volume_total || h.series_total || 0,
      frequencia: h.treinos_count || 1
    }));
  }, [historico]);

  const nivel = stats?.nivel || stats?.level || user?.nivel || 1;
  const xp = stats?.xp || stats?.xp_total || user?.xp || 0;
  const xpNext = stats?.xp_proximo_nivel || stats?.xp_next_level || (nivel * 500);
  const xpPct = xpNext > 0 ? Math.min((xp / xpNext) * 100, 100) : 0;
  const streak = stats?.streak_atual || stats?.streak || stats?.dias_seguidos || 0;
  const treinosTotal = stats?.treinos_total || stats?.total_treinos || 0;

  const tabs = [
    { key: 'progresso', label: 'Progresso', icon: TrendingUp },
    { key: 'badges', label: 'Conquistas', icon: Award }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Nivel', value: nivel, icon: Star, color: 'indigo', suffix: '' },
          { label: 'XP Total', value: xp, icon: Zap, color: 'amber', suffix: '' },
          { label: 'Sequencia', value: streak, icon: Flame, color: 'orange', suffix: ' dias' },
          { label: 'Treinos', value: treinosTotal, icon: Target, color: 'emerald', suffix: '' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-400`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              <Counter to={stat.value} />{stat.suffix}
            </div>
          </motion.div>
        ))}
      </div>

      {/* XP Progress Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="card-base p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300 font-medium">Progresso para Nivel {nivel + 1}</span>
          <span className="text-xs text-slate-500">{xp} / {xpNext} XP</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800">
          <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/30 border border-slate-700/10 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'progresso' && (
          <motion.div key="progresso"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-6">

            {/* Charts Grid */}
            {historico.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Carga Total Chart */}
              <div className="card-base p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Carga Total</h3>
                  <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">Últimos 7 dias</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradCarga" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148,163,184,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="carga" name="Carga (kg)" stroke="#6366f1" strokeWidth={2}
                        fill="url(#gradCarga)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volume Chart */}
              <div className="card-base p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Volume de Treino</h3>
                  <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">Últimos 7 dias</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid stroke="rgba(148,163,184,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="volume" name="Séries" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            ) : (
              <div className="card-base p-8 text-center">
                <TrendingUp className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-400 mb-1">Sem dados de treino</h3>
                <p className="text-xs text-slate-500">Comece a treinar para ver sua evolução aqui!</p>
              </div>
            )}

            {/* Frequency chart */}
            <div className="card-base p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Frequencia Semanal</h3>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{streak} dias consecutivos</span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
                  const active = i < (streak % 7 || 7);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: active ? '100%' : '20%' }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={`w-full rounded-lg ${active ? 'bg-indigo-500/30' : 'bg-slate-800/40'}`}
                      />
                      <span className={`text-[10px] ${active ? 'text-indigo-400' : 'text-slate-600'}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div key="badges"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-6">

            {/* Earned badges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Conquistas Desbloqueadas</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {badges.conquistados.length}
                </span>
              </div>
              {badges.conquistados.length === 0 ? (
                <div className="card-base p-8 text-center">
                  <Award className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma conquista ainda. Continue treinando!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {badges.conquistados.map((badge, i) => (
                    <BadgeCard key={badge.id || i} badge={badge} delay={i * 0.03} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming badges (locked) */}
            {badges.disponiveis.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-white">Proximas Conquistas</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {badges.disponiveis.slice(0, 10).map((badge, i) => (
                    <BadgeCard key={badge.id || i} badge={badge} locked delay={i * 0.03} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvolucaoPage;
