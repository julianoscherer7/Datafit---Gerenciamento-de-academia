import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Trophy, Target, TrendingUp, Calendar,
  ChevronRight, Activity, Award, Clock, Camera, Play, Users,
  Zap, Star, Gift, Coins, Plus, Check, X, Image
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import { checkinService, storiesService, lojaService } from '../services/social.service';

// ============= COMPONENTES AUXILIARES =============

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

const Counter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
};

const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={strokeWidth} />
      <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#gradient)" strokeWidth={strokeWidth} strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ strokeDasharray: circumference }} />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ============= CARD: TREINO HOJE =============
const TreinoHojeCard = ({ onIniciarTreino, checkinStatus, loading }) => {
  const temCheckin = checkinStatus?.tem_checkin;
  const validado = checkinStatus?.checkin_validado;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Treino de Hoje</h2>
              <p className="text-sm text-slate-400">
                {validado ? '✅ Treino Validado!' : temCheckin ? '📸 Check-in feito' : 'Pronto para treinar?'}
              </p>
            </div>
          </div>
          {validado && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Validado</span>
            </motion.div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onIniciarTreino} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50">
            <Play className="w-5 h-5" />
            {temCheckin ? 'Continuar Treino' : 'Iniciar Treino'}
          </motion.button>
          {temCheckin && !validado && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl text-slate-300 text-sm">
              <Clock className="w-4 h-4" /><span>Registre exercícios para validar</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============= CARD: STREAK =============
const StreakCard = ({ streak, loading }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
    {loading ? (
      <div className="space-y-3"><Skeleton className="w-16 h-16 rounded-full mx-auto" /><Skeleton className="w-20 h-8 mx-auto" /></div>
    ) : (
      <div className="text-center">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-2">🔥</motion.div>
        <div className="text-4xl font-bold text-white mb-1"><Counter end={streak || 0} /></div>
        <div className="text-sm text-orange-300">Dias de Streak</div>
        {streak > 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-orange-400">Continue assim! 💪</motion.div>}
      </div>
    )}
  </motion.div>
);

// ============= CARD: STORIES DOS AMIGOS =============
const StoriesCard = ({ stories = [], onVerStories, loading }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" />Stories dos Amigos</h3>
      <button onClick={onVerStories} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Ver todos →</button>
    </div>
    {loading ? (
      <div className="flex gap-4 overflow-x-auto py-2">{[1,2,3,4].map(i => <Skeleton key={i} className="w-16 h-16 rounded-full flex-shrink-0" />)}</div>
    ) : stories.length > 0 ? (
      <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
            <Plus className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-xs text-slate-400">Seu Story</span>
        </motion.button>
        {stories.map((userStory, i) => (
          <motion.button key={userStory.usuario_id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className={`w-16 h-16 rounded-full p-[3px] ${userStory.tem_nao_visto ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' : 'bg-slate-600'}`}>
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl">{userStory.usuario_foto || '👤'}</div>
            </div>
            <span className="text-xs text-slate-300 w-16 truncate text-center">{userStory.usuario_nome?.split(' ')[0]}</span>
          </motion.button>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 text-slate-400">
        <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum story disponível</p>
        <p className="text-xs mt-1">Adicione amigos para ver seus stories!</p>
      </div>
    )}
  </motion.div>
);

// ============= CARD: XP E MOEDAS =============
const XPMoedasCard = ({ progresso, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Seu Progresso</h3>
      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full">
        <span className="text-sm font-bold text-yellow-400">Nível {progresso?.nivel || 1}</span>
      </div>
    </div>
    {loading ? (
      <div className="space-y-4"><Skeleton className="w-full h-4" /><Skeleton className="w-3/4 h-4" /></div>
    ) : (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">XP Total</span>
            <span className="text-purple-400 font-medium">{progresso?.xp_total || 0} XP</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((progresso?.xp_total || 0) % 100)}%` }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
          <div className="text-xs text-slate-500 mt-1">{100 - ((progresso?.xp_total || 0) % 100)} XP para o próximo nível</div>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-400" /><span className="text-slate-300">Moedas</span></div>
          <span className="text-xl font-bold text-yellow-400"><Counter end={progresso?.moedas || 0} /></span>
        </div>
      </div>
    )}
  </motion.div>
);

// ============= CARD: ESTATÍSTICAS =============
const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -5, scale: 1.02 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all">
    {loading ? (
      <div className="space-y-3"><Skeleton className="w-10 h-10 rounded-xl" /><Skeleton className="w-16 h-6" /><Skeleton className="w-20 h-4" /></div>
    ) : (
      <>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-white mb-1"><Counter end={value} /></div>
        <div className="text-sm text-slate-400">{title}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      </>
    )}
  </motion.div>
);

// ============= CARD: ATIVIDADE RECENTE =============
const AtividadeRecenteCard = ({ treinos = [], loading }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Atividade Recente</h3>
      <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Ver todos →</button>
    </div>
    {loading ? (
      <div className="space-y-3">{[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-4 p-3"><Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2"><Skeleton className="w-3/4 h-4" /><Skeleton className="w-1/2 h-3" /></div>
        </div>
      ))}</div>
    ) : treinos.length > 0 ? (
      <div className="space-y-2">{treinos.slice(0, 4).map((treino, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">🏋️</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{treino.nome || `Treino #${treino.treino_id}`}</div>
            <div className="text-sm text-slate-400">{treino.exercicios_count || 0} exercícios</div>
          </div>
          <div className="text-xs text-slate-500">{treino.data || 'Recente'}</div>
          <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}</div>
    ) : (
      <div className="text-center py-6 text-slate-400">
        <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Nenhum treino recente</p>
      </div>
    )}
  </motion.div>
);

// ============= CARD: BADGES =============
const BadgesCard = ({ badges = [], loading }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" />Suas Conquistas</h3>
      <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Ver todas →</button>
    </div>
    {loading ? (
      <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="w-12 h-12 rounded-full mx-auto" />)}</div>
    ) : badges.length > 0 ? (
      <div className="grid grid-cols-4 gap-3">{badges.slice(0, 8).map((badge, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.15, rotate: 5 }} className="flex flex-col items-center gap-1 cursor-pointer">
          <div className="text-3xl">{badge.icone || '🏆'}</div>
          <span className="text-xs text-slate-400 text-center truncate w-full">{badge.nome}</span>
        </motion.div>
      ))}</div>
    ) : (
      <div className="text-center py-4 text-slate-400"><Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Nenhuma conquista ainda</p></div>
    )}
  </motion.div>
);

// ============= MODAL: CHECK-IN =============
const CheckinModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFoto(reader.result); setFotoPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSubmit({ foto_base64: foto });
    setFoto(null); setFotoPreview(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="w-6 h-6 text-purple-400" />Check-in de Treino</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
          </div>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Tire uma foto na academia para comprovar seu treino e ganhar pontos extras! 📸</p>
            <div onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fotoPreview ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
              {fotoPreview ? (
                <div className="relative">
                  <img src={fotoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button onClick={(e) => { e.stopPropagation(); setFoto(null); setFotoPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <><Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Clique para tirar ou selecionar uma foto</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG até 5MB</p></>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors">Cancelar</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!foto || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Enviando...</span>
                  </div>
                ) : 'Fazer Check-in'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============= PÁGINA PRINCIPAL =============
export const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [storiesFeed, setStoriesFeed] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, checkinRes, storiesRes, progressoRes] = await Promise.allSettled([
        dashboardService.getDashboard(),
        checkinService.getStatus(),
        storiesService.getFeed(),
        lojaService.getProgresso()
      ]);
      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value.data);
      if (checkinRes.status === 'fulfilled') setCheckinStatus(checkinRes.value.data);
      if (storiesRes.status === 'fulfilled') setStoriesFeed(storiesRes.value.data || []);
      if (progressoRes.status === 'fulfilled') setProgresso(progressoRes.value.data);
    } catch (err) { console.error('Erro ao buscar dados:', err); }
    finally { setLoading(false); }
  };

  const handleIniciarTreino = () => setCheckinModalOpen(true);
  const handleCheckinSubmit = async (data) => {
    try {
      setCheckinLoading(true);
      await checkinService.iniciarCheckin(data);
      setCheckinModalOpen(false);
      fetchAllData();
    } catch (err) { console.error('Erro no check-in:', err); }
    finally { setCheckinLoading(false); }
  };
  const handleVerStories = () => { window.location.hash = '#stories'; };

  const streakAtual = dashboardData?.streak_atual ?? 0;
  const treinosCount = dashboardData?.ultimos_treinos?.length ?? 0;
  const badgesCount = dashboardData?.badges_recentes?.length ?? 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Olá, {dashboardData?.usuario?.nome || user?.nome || 'Atleta'}! 👋</h1>
          <p className="text-slate-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="relative">
            <ProgressRing progress={Math.min((treinosCount / 5) * 100, 100)} size={70} strokeWidth={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{Math.round(Math.min((treinosCount / 5) * 100, 100))}%</span>
            </div>
          </div>
          <div><div className="text-sm text-slate-400">Meta Semanal</div><div className="text-lg font-semibold text-white">{treinosCount}/5 treinos</div></div>
        </motion.div>
      </motion.div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TreinoHojeCard onIniciarTreino={handleIniciarTreino} checkinStatus={checkinStatus} loading={loading} />
        <StreakCard streak={streakAtual} loading={loading} />
        <XPMoedasCard progresso={progresso || checkinStatus} loading={loading} />
        <StatCard icon={Dumbbell} title="Treinos" value={treinosCount} subtitle="Esta semana" color="from-blue-500 to-cyan-500" delay={0.2} loading={loading} />
        <StatCard icon={Trophy} title="Badges" value={badgesCount} color="from-yellow-500 to-orange-500" delay={0.25} loading={loading} />
      </div>

      {/* Stories */}
      <StoriesCard stories={storiesFeed} onVerStories={handleVerStories} loading={loading} />

      {/* Grid de atividades e badges */}
      <div className="grid md:grid-cols-2 gap-6">
        <AtividadeRecenteCard treinos={dashboardData?.ultimos_treinos} loading={loading} />
        <BadgesCard badges={dashboardData?.badges_recentes || [{ icone: '🏆', nome: 'Primeiro Treino' }, { icone: '💯', nome: '100 Séries' }, { icone: '🔥', nome: 'Streak 7 Dias' }, { icone: '💪', nome: 'Força Total' }]} loading={loading} />
      </div>

      {/* Modal */}
      <CheckinModal isOpen={checkinModalOpen} onClose={() => setCheckinModalOpen(false)} onSubmit={handleCheckinSubmit} loading={checkinLoading} />
    </div>
  );
};
