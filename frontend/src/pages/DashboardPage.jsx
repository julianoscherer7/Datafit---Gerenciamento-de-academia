import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Trophy, Target, TrendingUp, Calendar,
  ChevronRight, Activity, Award, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';

// Skeleton Loader Component
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Animated Counter Component
const Counter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all"
  >
    {loading ? (
      <div className="space-y-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-24 h-4" />
      </div>
    ) : (
      <>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          <Counter end={value} />
        </div>
        <div className="text-sm text-slate-400">{title}</div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
        )}
      </>
    )}
  </motion.div>
);

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148, 163, 184, 0.2)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Recent Activity Item
const ActivityItem = ({ title, subtitle, icon, time, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer group"
  >
    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-xl">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-white truncate">{title}</div>
      <div className="text-sm text-slate-400">{subtitle}</div>
    </div>
    <div className="text-xs text-slate-500">{time}</div>
    <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

// Badge Item
const BadgeItem = ({ badge, delay }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200 }}
    whileHover={{ scale: 1.1, rotate: 5 }}
    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer"
  >
    <div className="text-4xl">{badge.icone || '🏆'}</div>
    <div className="text-xs text-center text-slate-300 font-medium">{badge.nome}</div>
  </motion.div>
);

// Challenge Progress Item
const ChallengeItem = ({ challenge, delay }) => {
  const progress = challenge.alvo > 0 ? Math.min((challenge.progresso / challenge.alvo) * 100, 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-white">{challenge.titulo}</div>
        <div className="text-sm text-purple-400">{Math.round(progress)}%</div>
      </div>
      <div className="h-2 bg-slate-600/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </div>
      <div className="text-xs text-slate-400 mt-2">
        {challenge.progresso} / {challenge.alvo}
      </div>
    </motion.div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(err.friendlyMessage || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Dados default para demonstração
  const defaultBadges = [
    { icone: '🏆', nome: 'Primeiro Treino' },
    { icone: '💯', nome: '100 Séries' },
    { icone: '🔥', nome: 'Streak 7 Dias' },
    { icone: '💪', nome: 'Força Total' },
    { icone: '⭐', nome: 'Dedicação' },
    { icone: '🎯', nome: 'Meta Cumprida' }
  ];

  const defaultTreinos = [
    { nome: 'Treino A - Peito e Tríceps', data: 'Hoje' },
    { nome: 'Treino B - Costas e Bíceps', data: 'Ontem' },
    { nome: 'Treino C - Pernas', data: '2 dias atrás' }
  ];

  const streakAtual = dashboardData?.streak_atual ?? 0;
  const treinosCount = dashboardData?.ultimos_treinos?.length ?? 0;
  const badgesCount = dashboardData?.badges_recentes?.length ?? 0;
  const desafiosCount = dashboardData?.proximos_desafios?.length ?? 0;

  // Calcula progresso semanal (meta: 5 treinos por semana)
  const metaSemanal = 5;
  const progressoSemanal = Math.min((treinosCount / metaSemanal) * 100, 100);

  return (
    <div className="space-y-6 pb-8">
      {/* Header com saudação */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Olá, {dashboardData?.usuario?.nome || user?.nome || 'Atleta'}! 👋
          </h1>
          <p className="text-slate-400">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {/* Progresso semanal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
        >
          <div className="relative">
            <ProgressRing progress={progressoSemanal} size={80} strokeWidth={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{Math.round(progressoSemanal)}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Meta Semanal</div>
            <div className="text-lg font-semibold text-white">{treinosCount}/{metaSemanal} treinos</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          title="Dias de Streak"
          value={streakAtual}
          subtitle={streakAtual > 0 ? "Continue assim! 🔥" : "Comece hoje!"}
          color="from-orange-500 to-red-500"
          delay={0.1}
          loading={loading}
        />
        <StatCard
          icon={Dumbbell}
          title="Treinos Recentes"
          value={treinosCount}
          subtitle="Últimos 7 dias"
          color="from-blue-500 to-cyan-500"
          delay={0.2}
          loading={loading}
        />
        <StatCard
          icon={Trophy}
          title="Badges"
          value={badgesCount}
          subtitle="Conquistas desbloqueadas"
          color="from-yellow-500 to-orange-500"
          delay={0.3}
          loading={loading}
        />
        <StatCard
          icon={Target}
          title="Desafios Ativos"
          value={desafiosCount}
          subtitle="Em progresso"
          color="from-purple-500 to-pink-500"
          delay={0.4}
          loading={loading}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Últimos Treinos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Atividade Recente
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Ver todos
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {(dashboardData?.ultimos_treinos?.length > 0 
                ? dashboardData.ultimos_treinos.map((t, i) => ({
                    title: `Treino #${t.treino_id}`,
                    subtitle: `${t.exercicios_count || 0} exercícios`,
                    icon: '🏋️',
                    time: t.data || 'Recente'
                  }))
                : defaultTreinos.map((t) => ({
                    title: t.nome,
                    subtitle: 'Treino completado',
                    icon: '🏋️',
                    time: t.data
                  }))
              ).map((item, i) => (
                <ActivityItem
                  key={i}
                  {...item}
                  delay={0.4 + i * 0.1}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Badges Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Suas Conquistas
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Ver todas
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="w-16 h-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(dashboardData?.badges_recentes?.length > 0 
                ? dashboardData.badges_recentes 
                : defaultBadges
              ).slice(0, 6).map((badge, i) => (
                <BadgeItem key={i} badge={badge} delay={0.5 + i * 0.1} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Desafios em Progresso */}
      {(dashboardData?.proximos_desafios?.length > 0 || !loading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Desafios em Progresso
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Ver todos
            </button>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-700/30">
                  <Skeleton className="w-3/4 h-5 mb-3" />
                  <Skeleton className="w-full h-2 mb-2" />
                  <Skeleton className="w-1/4 h-3" />
                </div>
              ))}
            </div>
          ) : dashboardData?.proximos_desafios?.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {dashboardData.proximos_desafios.map((challenge, i) => (
                <ChallengeItem key={i} challenge={challenge} delay={0.6 + i * 0.1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum desafio ativo</p>
              <button className="mt-2 text-purple-400 hover:text-purple-300 text-sm">
                Explorar desafios →
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-center"
          >
            {error}
            <button 
              onClick={fetchDashboard}
              className="ml-4 text-red-400 hover:text-red-300 underline"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
