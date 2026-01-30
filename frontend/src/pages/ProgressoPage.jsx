import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Trophy, Flame, Target, Award, Star,
  Calendar, Zap, ChevronRight
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { badgesService } from '../services/badges.service';

// Skeleton with fixed dimensions to prevent layout shift
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Full page skeleton to show immediately while loading
const ProgressoSkeleton = () => (
  <div className="space-y-6 pb-8">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72" />
    </div>

    {/* Stats Grid skeleton - fixed heights */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 min-h-[140px]">
          <Skeleton className="w-10 h-10 rounded-xl mb-3" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>

    {/* Progress Overview skeleton */}
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 min-h-[200px]">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex items-center gap-6">
            <Skeleton className="w-[100px] h-[100px] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Badges skeleton */}
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-12 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="p-4 rounded-2xl border border-slate-700/30 min-h-[120px]">
            <Skeleton className="w-12 h-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-1" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Stat Card Simples
const StatCard = ({ icon: Icon, label, value, sublabel, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50"
  >
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
    {sublabel && <div className="text-xs text-slate-500 mt-1">{sublabel}</div>}
  </motion.div>
);

// Badge Card
const BadgeCard = ({ badge, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`relative p-4 rounded-2xl border text-center cursor-pointer transition-all ${
      badge.conquistado 
        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30' 
        : 'bg-slate-800/30 border-slate-700/30 opacity-50'
    }`}
  >
    <div className="text-4xl mb-2">{badge.icone || '🏆'}</div>
    <div className="font-medium text-white text-sm">{badge.nome}</div>
    <div className="text-xs text-slate-400 mt-1">{badge.descricao}</div>
    {badge.conquistado && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs">✓</span>
      </div>
    )}
  </motion.div>
);

// Progress Ring
const ProgressRing = ({ progress, size = 100, strokeWidth = 8, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#progressGradient)" strokeWidth={strokeWidth} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{progress}%</span>
        {label && <span className="text-xs text-slate-400">{label}</span>}
      </div>
    </div>
  );
};

const ProgressoPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [isNewAccount, setIsNewAccount] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, badgesRes] = await Promise.allSettled([
        analyticsService.getAnalytics(),
        badgesService.getBadges()
      ]);
      
      if (analyticsRes.status === 'fulfilled') {
        const data = analyticsRes.value.data;
        setStats(data);
        // Check if it's a new account (no real progress)
        setIsNewAccount(!data || (data.streak === 0 && data.treinos_total === 0));
      }
      if (badgesRes.status === 'fulfilled') {
        const badgesData = badgesRes.value.data || [];
        setBadges(badgesData);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setIsNewAccount(true);
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while loading to prevent layout shift
  if (loading) {
    return <ProgressoSkeleton />;
  }

  // Empty badges for new accounts
  const defaultBadges = [
    { id: 1, nome: 'Primeiro Treino', descricao: 'Complete seu primeiro treino', icone: '🎯', conquistado: false },
    { id: 2, nome: 'Sequência de 7', descricao: '7 dias consecutivos', icone: '🔥', conquistado: false },
    { id: 3, nome: 'Força Total', descricao: '100 séries completadas', icone: '💪', conquistado: false },
    { id: 4, nome: 'Maratonista', descricao: '30 dias de treino', icone: '🏃', conquistado: false },
    { id: 5, nome: 'Social', descricao: 'Adicione 5 amigos', icone: '👥', conquistado: false },
    { id: 6, nome: 'Campeão', descricao: 'Complete um desafio', icone: '🏆', conquistado: false },
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  const badgesConquistados = displayBadges.filter(b => b.conquistado).length;
  const progressoBadges = Math.round((badgesConquistados / displayBadges.length) * 100);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-1">Seu Progresso</h1>
        <p className="text-slate-400">Acompanhe sua evolução e conquistas</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Streak Atual" value={isNewAccount ? 0 : (stats?.streak || 0)} sublabel="dias seguidos" color="from-orange-500 to-red-500" delay={0.1} />
        <StatCard icon={Target} label="Treinos" value={isNewAccount ? 0 : (stats?.treinos_total || 0)} sublabel="este mês" color="from-purple-500 to-pink-500" delay={0.15} />
        <StatCard icon={Zap} label="XP Total" value={isNewAccount ? 0 : (stats?.xp || 0)} sublabel="pontos" color="from-yellow-500 to-orange-500" delay={0.2} />
        <StatCard icon={Trophy} label="Badges" value={badgesConquistados} sublabel={`de ${displayBadges.length}`} color="from-green-500 to-emerald-500" delay={0.25} />
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Meta Semanal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 min-h-[200px]"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Meta Semanal
          </h3>
          {(() => {
            const weeklyProgress = isNewAccount ? 0 : (stats?.treinos_semana || 0);
            const weeklyGoal = 5;
            const progressPercent = Math.min(Math.round((weeklyProgress / weeklyGoal) * 100), 100);
            const remaining = Math.max(weeklyGoal - weeklyProgress, 0);
            
            return (
              <div className="flex items-center gap-6">
                <ProgressRing progress={progressPercent} size={100} label="completo" />
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Treinos esta semana</span>
                      <span className="text-white font-medium">{weeklyProgress}/{weeklyGoal}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {remaining > 0 ? (
                      <>Falta{remaining > 1 ? 'm' : ''} <span className="text-purple-400 font-medium">{remaining} treino{remaining > 1 ? 's' : ''}</span> para bater sua meta!</>
                    ) : (
                      <span className="text-green-400 font-medium">🎉 Meta da semana completa!</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Evolução Recente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 min-h-[200px]"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Evolução Recente
          </h3>
          {isNewAccount ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400">
              <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm text-center">Complete seus primeiros treinos<br/>para ver sua evolução!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Carga média', value: stats?.evolucao_carga || '+0%', positive: true },
                { label: 'Volume semanal', value: stats?.evolucao_volume || '+0%', positive: true },
                { label: 'Tempo de treino', value: stats?.evolucao_tempo || '0min', positive: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-medium ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Suas Conquistas
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {badgesConquistados} de {displayBadges.length} badges conquistados ({progressoBadges}%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{badgesConquistados}</div>
            <div className="text-xs text-slate-500">badges</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressoBadges}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          />
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {displayBadges.map((badge, i) => (
            <BadgeCard key={badge.id} badge={badge} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressoPage;
