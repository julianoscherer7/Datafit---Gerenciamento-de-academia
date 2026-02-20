import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Zap, Star, Flame, Clock, Trophy,
  MessageCircle, UserPlus, UserCheck, Shield, Instagram
} from 'lucide-react';
import { amigosService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

export const PerfilPublicoPage = ({ onNavigate, userId }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (toastMsg) { const t = setTimeout(() => setToastMsg(null), 3000); return () => clearTimeout(t); }
  }, [toastMsg]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await amigosService.getPerfilAmigo(userId);
      setProfile(res.data);
    } catch {
      setToastMsg({ type: 'error', text: 'Erro ao carregar perfil' });
    }
    finally { setLoading(false); }
  };

  const handleAddFriend = async () => {
    setAdding(true);
    try {
      await amigosService.enviarSolicitacao(userId);
      setProfile(prev => prev ? { ...prev, amizade_status: 'pendente' } : prev);
      setToastMsg({ type: 'success', text: 'Solicitação enviada!' });
    } catch (err) {
      setToastMsg({ type: 'error', text: err.response?.data?.detail || 'Erro ao enviar' });
    }
    setAdding(false);
  };

  if (loading) return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Perfil não encontrado</p>
      <button onClick={() => onNavigate('amigos')} className="mt-4 text-indigo-400 text-sm hover:text-indigo-300">Voltar</button>
    </div>
  );

  const initials = (profile.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isSelf = profile.id === user?.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => onNavigate('amigos')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Banner + Avatar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 relative">
          {profile.banner_base64 && <img src={profile.banner_base64} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="relative px-6 -mt-12 pb-6">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-[#0c0f1a] flex-shrink-0 overflow-hidden">
              {profile.foto_base64 ? <img src={profile.foto_base64} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{profile.nome}</h1>
                {profile.perfil === 'instrutor' && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> COACH
                  </span>
                )}
                {profile.amizade_status === 'aceito' && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Amigo
                  </span>
                )}
              </div>
              {profile.nickname && <p className="text-sm text-slate-500 mt-0.5">@{profile.nickname}</p>}
              {profile.titulo && <p className="text-xs text-indigo-400 mt-1 bg-indigo-500/10 px-2 py-0.5 rounded-lg inline-block">{profile.titulo}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3">
        <div className="card-base p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <Zap className="w-5 h-5" />
            <span className="text-xl font-bold">{(profile.xp || 0).toLocaleString()}</span>
          </div>
          <span className="text-xs text-slate-500">XP Total</span>
        </div>
        <div className="card-base p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
            <Star className="w-5 h-5" />
            <span className="text-xl font-bold">{profile.nivel || 1}</span>
          </div>
          <span className="text-xs text-slate-500">Nível</span>
        </div>
        <div className="card-base p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
            <Flame className="w-5 h-5" />
            <span className="text-xl font-bold">{profile.streak || 0}</span>
          </div>
          <span className="text-xs text-slate-500">Dias Streak</span>
        </div>
      </motion.div>

      {/* Bio */}
      {profile.bio && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-base p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Sobre</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{profile.bio}</p>
        </motion.div>
      )}

      {/* Member since */}
      {profile.criado_em && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5" />
          <span>Membro desde {new Date(profile.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </motion.div>
      )}

      {/* Badges */}
      {profile.badges?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card-base p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Conquistas ({profile.badges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/20">
                <span className="text-lg">{b.icone_url || '🏆'}</span>
                <div>
                  <div className="text-xs text-white font-medium">{b.nome}</div>
                  {b.descricao && <div className="text-[10px] text-slate-500">{b.descricao}</div>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Social Links */}
      {(profile.instagram || profile.tiktok || profile.twitter) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex gap-2">
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 text-slate-400 hover:text-pink-400 hover:bg-pink-500/5 transition-all text-xs">
              <Instagram className="w-4 h-4" /> @{profile.instagram}
            </a>
          )}
          {profile.twitter && (
            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-xs">
              𝕏 @{profile.twitter}
            </a>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      {!isSelf && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex gap-3">
          {profile.amizade_status !== 'aceito' && profile.amizade_status !== 'pendente' && (
            <button onClick={handleAddFriend} disabled={adding}
              className="flex-1 py-3 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus className="w-4 h-4" /> Adicionar Amigo
            </button>
          )}
          {profile.amizade_status === 'pendente' && (
            <div className="flex-1 py-3 text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> Solicitação Pendente
            </div>
          )}
          <button onClick={() => onNavigate('chat', { participanteId: profile.id, participanteNome: profile.nome })}
            className="flex-1 py-3 text-sm font-medium bg-slate-800/40 text-slate-300 rounded-xl hover:bg-slate-800/60 transition-all flex items-center justify-center gap-2 border border-slate-700/20">
            <MessageCircle className="w-4 h-4" /> Enviar Mensagem
          </button>
        </motion.div>
      )}

      {/* Toast */}
      {toastMsg && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl text-sm font-medium z-50 ${
            toastMsg.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
          {toastMsg.text}
        </motion.div>
      )}
    </div>
  );
};

export default PerfilPublicoPage;
