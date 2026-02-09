import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, TrendingUp, Trophy, Target, Zap, Clock, 
  ChevronRight, Activity, Award, MessageSquare, Flame, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';

// Animated counter
const Counter = ({ end, duration = 1.5, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) { setCount(0); return; }
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Skeleton
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

// Stat Card
const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay = 0, trend, loading, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    onClick={onClick}
    className="card-base p-5 cursor-pointer group"
  >
    {loading ? (
      <div className="space-y-3"><Skeleton className="w-10 h-10" /><Skeleton className="w-16 h-7 mt-3" /><Skeleton className="w-24 h-4" /></div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            }`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          <Counter end={value} suffix={suffix} />
        </div>
          <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          {label}
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </>
    )}
  </motion.div>
);

// Quick Action Card
const QuickAction = ({ icon: Icon, label, description, onClick, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="card-base p-5 text-left w-full group"
  >
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </div>
  </motion.button>
);

// Recent Activity Card
const ActivityItem = ({ treino, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 + index * 0.05 }}
    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors cursor-pointer group"
  >
    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-lg flex-shrink-0">
      {treino.icone || '\u{1F3CB}'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-slate-200 text-sm truncate">{treino.nome || `Treino #${treino.treino_id}`}</div>
      <div className="text-xs text-slate-500">{treino.exercicios_count || 0} exercícios</div>
    </div>
    <div className="text-[11px] text-slate-600">{treino.data || 'Recente'}</div>
  </motion.div>
);

// XP Progress
const XPProgress = ({ xp = 0, nivel = 1, loading }) => {
  const xpInLevel = xp % 100;
  const xpNeeded = 100 - xpInLevel;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-base p-5"
    >
      {loading ? (
        <div className="space-y-3"><Skeleton className="w-32 h-5" /><Skeleton className="w-full h-2 mt-3" /></div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Progresso XP</span>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2.5 py-0.5 rounded-full">
              Nível {nivel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white"><Counter end={xp} /></span>
            <span className="text-sm text-slate-500">XP total</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">{xpNeeded} XP para o próximo nível</div>
        </>
      )}
    </motion.div>
  );
};

export const DashboardPage = ({ onNavigate }) => {
  const { user, isCoach } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDashboard();
        setData(res.data);
      } catch (err) {
        // Silent fail - dashboard will show default values
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const streakAtual = data?.streak_atual ?? 0;
  const treinosCount = data?.ultimos_treinos?.length ?? 0;
  const badgesCount = data?.badges_recentes?.length ?? 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Olá, {data?.usuario?.nome || user?.nome || 'Atleta'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('treinos')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Dumbbell className="w-4 h-4" />
          Iniciar Treino
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="Treinos esta semana" value={treinosCount} color="bg-indigo-500/20 text-indigo-400" delay={0} loading={loading} onClick={() => onNavigate('treinos')} />
        <StatCard icon={Flame} label="Dias de streak" value={streakAtual} color="bg-orange-500/20 text-orange-400" delay={0.05} loading={loading} />
        <StatCard icon={Trophy} label="Conquistas" value={badgesCount} color="bg-amber-500/20 text-amber-400" delay={0.1} loading={loading} onClick={() => onNavigate('evolucao')} />
        <StatCard icon={Target} label="Meta semanal" value={Math.round(Math.min((treinosCount / 5) * 100, 100))} suffix="%" color="bg-emerald-500/20 text-emerald-400" delay={0.15} loading={loading} />
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left - Quick Actions + XP */}
        <div className="lg:col-span-2 space-y-4">
          <XPProgress xp={data?.xp_total || 0} nivel={data?.nivel || 1} loading={loading} />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Acesso rápido</h3>
            <div className="space-y-2">
              <QuickAction icon={Dumbbell} label="Meus Treinos" description="Gerencie e inicie treinos" onClick={() => onNavigate('treinos')} delay={0.3} />
              <QuickAction icon={TrendingUp} label="Evolução" description="Progresso e conquistas" onClick={() => onNavigate('evolucao')} delay={0.35} />
              <QuickAction icon={MessageSquare} label="Chat" description="Conversas e mensagens" onClick={() => onNavigate('chat')} delay={0.4} />
              {isCoach && (
                <QuickAction icon={Activity} label="Painel Coach" description="Gerenciar alunos" onClick={() => onNavigate('coachDashboard')} delay={0.45} />
              )}
            </div>
          </motion.div>
        </div>

        {/* Right - Recent Activity + Badges */}
        <div className="lg:col-span-3 space-y-4">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Atividade Recente
              </h3>
              <button onClick={() => onNavigate('historico')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver tudo
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2"><Skeleton className="w-3/4 h-4" /><Skeleton className="w-1/2 h-3" /></div>
                </div>
              ))}</div>
            ) : data?.ultimos_treinos?.length > 0 ? (
              <div className="space-y-1">
                {data.ultimos_treinos.slice(0, 5).map((treino, i) => (
                  <ActivityItem key={i} treino={treino} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum treino recente</p>
                <p className="text-xs text-slate-600 mt-1">Comece um treino para ver sua atividade aqui</p>
              </div>
            )}
          </motion.div>

          {/* Badges Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Conquistas
              </h3>
              <button onClick={() => onNavigate('evolucao')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver todas
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {(data?.badges_recentes?.length > 0
                ? data.badges_recentes
                : [{ icone: '🏆', nome: 'Primeiro Treino' }, { icone: '💯', nome: '100 Séries' }, { icone: '🔥', nome: 'Streak 7' }, { icone: '💪', nome: 'Força Total' }]
              ).slice(0, 6).map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <div className="text-2xl md:text-3xl">{badge.icone || '\u{1F3C6}'}</div>
                  <span className="text-[10px] text-slate-500 text-center truncate w-full">{badge.nome}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
