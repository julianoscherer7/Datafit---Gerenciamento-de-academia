import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Edit2, Trophy, Flame, Zap, Calendar, Target,
  Dumbbell, Clock, Star, ChevronRight, Shield
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
    dashboardService.getStats().then(r => setStats(r.data)).catch(() => setStats({
      nivel: 5, xp: 2800, xp_proximo_nivel: 4000, streak: 7, treinos_semana: 4, total_treinos: 85
    }));
    badgesService.getBadges().then(r => setBadges((r.data || []).filter(b => b.conquistado).slice(0, 6))).catch(() => setBadges([
      { id: 1, nome: 'Primeiro Treino', icone: '🏋️', conquistado: true },
      { id: 2, nome: 'Streak 7 dias', icone: '🔥', conquistado: true },
      { id: 3, nome: 'Volume 100kg', icone: '💪', conquistado: true }
    ]));
  }, []);

  const s = stats || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
            {(user?.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">{user?.nome || 'Usuario'}</h2>
              {user?.tipo === 'instrutor' && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20">COACH</span>
              )}
            </div>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-indigo-400"><Star className="w-3 h-3" /> Nv.{s.nivel || 1}</span>
              <span className="flex items-center gap-1 text-xs text-amber-400"><Zap className="w-3 h-3" /> {s.xp || 0} XP</span>
              {s.streak > 0 && <span className="flex items-center gap-1 text-xs text-orange-400"><Flame className="w-3 h-3" /> {s.streak}d streak</span>}
            </div>
          </div>
          <button onClick={() => onNavigate('editPerfil')}
            className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* XP bar */}
        {s.xp_proximo_nivel && (
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">Progresso Level {s.nivel || 1}</span>
              <span className="text-indigo-400">{s.xp}/{s.xp_proximo_nivel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/40 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((s.xp / s.xp_proximo_nivel) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Treinos', value: s.total_treinos || 0, icon: Dumbbell, color: 'indigo' },
          { label: 'Streak', value: s.streak || 0, suffix: 'd', icon: Flame, color: 'orange' },
          { label: 'Semana', value: s.treinos_semana || 0, icon: Calendar, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-base p-4 text-center">
            <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-2`} />
            <div className="text-lg font-bold text-white"><Counter end={stat.value} />{stat.suffix || ''}</div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card-base p-5">
          <div className="flex items-center justify-between mb-3">
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
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-1 text-xl">
                  {b.icone || '🏆'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{b.nome}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <div className="space-y-1.5">
        {[
          { label: 'Editar perfil', icon: Edit2, page: 'editPerfil' },
          { label: 'Configuracoes', icon: Shield, page: 'configs' },
          { label: 'Historico de treinos', icon: Clock, page: 'historico' },
        ].map((link, i) => (
          <motion.button key={link.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => onNavigate(link.page)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/30 transition-all group">
            <div className="flex items-center gap-3">
              <link.icon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-white">{link.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PerfilPage;
