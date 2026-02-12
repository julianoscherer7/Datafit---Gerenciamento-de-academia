import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Edit2, Trophy, Flame, Zap, Calendar, Target,
  Dumbbell, Clock, Star, ChevronRight, Shield, Camera,
  Instagram, Twitter, Github, Link2, MapPin, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, badgesService } from '../services';

const Counter = ({ end }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = 0; const dur = 800; const step = (end - s) / (dur / 16);
    const id = setInterval(() => { s += step; if (s >= end) { setVal(end); clearInterval(id); } else setVal(Math.round(s)); }, 16);
    return () => clearInterval(id);
  }, [end]);
  return <>{val.toLocaleString()}</>;
};

export const PerfilPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    dashboardService.getDashboard()
      .then(r => {
        const d = r.data || {};
        setStats({
          nivel: d.usuario?.nivel || d.nivel || 1,
          xp: d.usuario?.xp || d.xp || 0,
          xp_proximo_nivel: d.usuario?.xp_proximo_nivel || d.xp_proximo_nivel || 1000,
          streak: d.streak_atual || d.streak || 0,
          treinos_semana: d.treinos_semana || 0,
          total_treinos: d.total_treinos || (d.ultimos_treinos || []).length || 0
        });
      })
      .catch(() => setStats({
        nivel: 1, xp: 0, xp_proximo_nivel: 1000, streak: 0, treinos_semana: 0, total_treinos: 0
      }));
    badgesService.getMeusBadges()
      .then(r => setBadges((r.data || []).slice(0, 6)))
      .catch(() => badgesService.getBadges()
        .then(r => setBadges((r.data || []).slice(0, 6)))
        .catch(() => setBadges([]))
      );
  }, []);

  const s = stats || {};
  const userInitials = (user?.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // User profile data - could be fetched from API
  const profileData = {
    bio: user?.bio || 'Focado em evoluir um treino de cada vez. 💪',
    location: user?.location || null,
    instagram: user?.instagram || null,
    twitter: user?.twitter || null,
    website: user?.website || null,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      {/* Banner + Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-base overflow-hidden"
      >
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-black/20" />
          <button 
            onClick={() => onNavigate('editPerfil')}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/40 transition-all"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-5 pb-5">
          {/* Avatar overlapping banner */}
          <div className="relative -mt-12 mb-3 flex items-end justify-between">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0c0f1a] shadow-xl">
                {userInitials}
              </div>
              <button 
                onClick={() => onNavigate('editPerfil')}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <button 
              onClick={() => onNavigate('editPerfil')}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Editar Perfil
            </button>
          </div>

          {/* Name and badges */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{user?.nickname || user?.nome || 'Usuário'}</h2>
              {user?.perfil === 'instrutor' && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20">COACH</span>
              )}
            </div>
            {user?.nickname && user?.nome && (
              <p className="text-sm text-slate-500">{user.nome}</p>
            )}
            {!user?.nickname && user?.email && (
              <p className="text-sm text-slate-500">{user.email}</p>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">{profileData.bio}</p>

          {/* Info row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
            {profileData.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {profileData.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Membro desde {new Date().getFullYear()}
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 mb-4">
            {profileData.instagram && (
              <a href={`https://instagram.com/${profileData.instagram}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/40 text-pink-400 hover:bg-pink-500/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {profileData.twitter && (
              <a href={`https://twitter.com/${profileData.twitter}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/40 text-sky-400 hover:bg-sky-500/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profileData.website && (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:bg-slate-700/40 transition-colors">
                <Link2 className="w-4 h-4" />
              </a>
            )}
            {!profileData.instagram && !profileData.twitter && !profileData.website && (
              <button 
                onClick={() => onNavigate('editPerfil')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Adicionar redes sociais
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Nível {s.nivel || 1}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">{s.xp || 0}</span>
              <span className="text-slate-500">XP</span>
            </div>
            {s.streak > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-white">{s.streak}</span>
                <span className="text-slate-500">dias</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* XP Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="card-base p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Progresso de Nível
          </h3>
          <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
            Nível {s.nivel || 1}
          </span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-500">{s.xp || 0} XP</span>
          <span className="text-slate-500">{s.xp_proximo_nivel || 1000} XP</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800/40 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${Math.min((s.xp / (s.xp_proximo_nivel || 1000)) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" 
          />
        </div>
        <div className="text-xs text-slate-500 mt-2 text-center">
          Faltam {(s.xp_proximo_nivel || 1000) - (s.xp || 0)} XP para o próximo nível
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Treinos', value: s.total_treinos || 0, icon: Dumbbell, gradient: 'from-indigo-500 to-purple-500' },
          { label: 'Streak', value: s.streak || 0, suffix: 'd', icon: Flame, gradient: 'from-orange-500 to-red-500' },
          { label: 'Semana', value: s.treinos_semana || 0, icon: Calendar, gradient: 'from-emerald-500 to-teal-500' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="card-base p-4 text-center group hover:border-slate-700/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-white">
              <Counter end={stat.value} />{stat.suffix || ''}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="card-base p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Conquistas
            </h3>
            <button onClick={() => onNavigate('evolucao')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {badges.map((b, i) => (
              <motion.div 
                key={b.id} 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-1.5 text-xl group-hover:border-amber-500/40 transition-colors">
                  {b.icone || '🏆'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{b.nome}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.35 }}
        className="card-base overflow-hidden"
      >
        {[
          { label: 'Editar Perfil', icon: Edit2, page: 'editPerfil', desc: 'Foto, bio e informações' },
          { label: 'Configurações', icon: Shield, page: 'configs', desc: 'Privacidade e notificações' },
          { label: 'Histórico', icon: Clock, page: 'historico', desc: 'Todos os seus treinos' },
        ].map((link, i) => (
          <button 
            key={link.label} 
            onClick={() => onNavigate(link.page)}
            className={`w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all group ${
              i > 0 ? 'border-t border-slate-800/50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800/40 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                <link.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white block">{link.label}</span>
                <span className="text-[11px] text-slate-500">{link.desc}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default PerfilPage;
