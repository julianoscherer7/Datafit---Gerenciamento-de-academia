import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, Trophy, Flame, Zap,
  ChevronRight, Crown, Star, Check, X, RefreshCw,
  Clock, Bell, UserCheck, Eye, MessageCircle, UserX
} from 'lucide-react';
import { amigosService } from '../services';
import { useAuth } from '../context/AuthContext';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Avatar = ({ nome, foto, rank, size = 'md', online }) => {
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-lg' };
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-blue-500'];
  const ci = (nome || '').charCodeAt(0) % colors.length;
  return (
    <div className="relative flex-shrink-0">
      {foto ? (
        <img src={foto} alt={nome} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[ci]} flex items-center justify-center text-white font-bold`}>{initials}</div>
      )}
      {rank && rank <= 3 && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
          rank === 1 ? 'bg-amber-400 text-amber-900' : rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-amber-600 text-amber-100'
        }`}>{rank}</div>
      )}
      {typeof online === 'boolean' && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${online ? 'bg-emerald-400' : 'bg-slate-600'}`} style={{ borderColor: '#0c0f1a' }} />
      )}
    </div>
  );
};

const Podium = ({ users }) => {
  if (users.length < 3) return null;
  const order = [users[1], users[0], users[2]];
  return (
    <div className="flex items-end justify-center gap-3 mb-8">
      {order.map((u, i) => {
        const isFirst = i === 1;
        const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
        return (
          <motion.div key={u?.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
            <Avatar nome={u?.nome || 'User'} rank={rank} size={isFirst ? 'lg' : 'md'} />
            <div className="mt-2 text-center">
              <div className={`font-semibold truncate max-w-[80px] ${isFirst ? 'text-white text-sm' : 'text-slate-300 text-xs'}`}>{u?.nome || 'User'}</div>
              <div className="flex items-center gap-1 justify-center mt-0.5">
                <Zap className={`${isFirst ? 'w-3.5 h-3.5 text-amber-400' : 'w-3 h-3 text-slate-500'}`} />
                <span className={`font-bold ${isFirst ? 'text-amber-400 text-sm' : 'text-slate-400 text-xs'}`}>{u?.xp || 0}</span>
              </div>
            </div>
            <div className={`mt-2 rounded-t-xl w-20 flex items-center justify-center ${isFirst ? 'h-24 bg-indigo-500/15 border border-indigo-500/20' : rank === 2 ? 'h-16 bg-slate-800/30 border border-slate-700/10' : 'h-12 bg-slate-800/20 border border-slate-700/10'}`}>
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
  const [ranking, setRanking] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ranking');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addingFriend, setAddingFriend] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amigosRes, rankingRes, sugestoesRes, pendentesRes] = await Promise.allSettled([
        amigosService.getAmigos(), amigosService.getRanking(), amigosService.getSugestoes(), amigosService.getSolicitacoesPendentes()
      ]);
      if (amigosRes.status === 'fulfilled') setAmigos(amigosRes.value.data || []);
      if (rankingRes.status === 'fulfilled') { const d = rankingRes.value.data || []; d.sort((a, b) => (b.xp || 0) - (a.xp || 0)); setRanking(d); }
      if (sugestoesRes.status === 'fulfilled') setSugestoes(sugestoesRes.value.data || []);
      if (pendentesRes.status === 'fulfilled') setPendentes(pendentesRes.value.data || []);
    } catch { setAmigos([]); setRanking([]); setSugestoes([]); setPendentes([]); }
    finally { setLoading(false); }
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (term.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try { const res = await amigosService.buscarUsuarios(term); setSearchResults(res.data || []); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, []);

  const handleAddFriend = async (userId, userName) => {
    setAddingFriend(userId);
    try {
      await amigosService.enviarSolicitacao(userId);
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, amizade_status: 'pendente' } : u));
      setSugestoes(prev => prev.filter(u => u.id !== userId));
      setToast({ type: 'success', message: `Solicitação enviada para ${userName}!` });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.detail || 'Erro ao enviar' }); }
    setAddingFriend(null);
  };

  const handleAcceptRequest = async (id) => {
    setAcceptingId(id);
    try { await amigosService.aceitarSolicitacao(id); setPendentes(p => p.filter(x => x.id !== id)); setToast({ type: 'success', message: 'Amizade aceita!' }); fetchData(); }
    catch (err) { setToast({ type: 'error', message: err.response?.data?.detail || 'Erro' }); }
    setAcceptingId(null);
  };

  const handleRejectRequest = async (id) => {
    setRejectingId(id);
    try { await amigosService.recusarSolicitacao(id); setPendentes(p => p.filter(x => x.id !== id)); setToast({ type: 'success', message: 'Recusada' }); }
    catch (err) { setToast({ type: 'error', message: err.response?.data?.detail || 'Erro' }); }
    setRejectingId(null);
  };

  const refreshSugestoes = async () => { try { const r = await amigosService.getSugestoes(); setSugestoes(r.data || []); } catch {} };

  const viewProfile = async (userId) => {
    try { const res = await amigosService.getPerfilAmigo(userId); setSelectedProfile(res.data); }
    catch { setToast({ type: 'error', message: 'Erro ao carregar perfil' }); }
  };

  const onlineFriends = amigos.filter(a => a.online);
  const offlineFriends = amigos.filter(a => !a.online);
  const displayList = activeTab === 'ranking' ? ranking : amigos;
  const filteredList = displayList.filter(a => !filterTerm || (a.nome || '').toLowerCase().includes(filterTerm.toLowerCase()) || (a.nickname || '').toLowerCase().includes(filterTerm.toLowerCase()));

  const tabs = [
    { key: 'ranking', label: 'Ranking', icon: Trophy },
    { key: 'amigos', label: `Amigos (${amigos.length})`, icon: Users },
    { key: 'pendentes', label: `Pendentes${pendentes.length > 0 ? ` (${pendentes.length})` : ''}`, icon: Bell }
  ];

  if (loading) return (<div className="space-y-6"><Skeleton className="h-48 rounded-2xl" /><div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div></div>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ranking & Amigos</h1>
          <p className="text-sm text-slate-500">{amigos.length} amigos • {onlineFriends.length} online</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/15 transition-all">
          <UserPlus className="w-4 h-4" /> Adicionar
        </motion.button>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card-base p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={searchTerm} onChange={e => handleSearch(e.target.value)} placeholder="Comece a digitar para buscar..." autoFocus
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
                {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" /></div>}
              </div>
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-1.5 max-h-64 overflow-y-auto">
                    {searchResults.map((u, i) => (
                      <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/30 transition-all">
                        <Avatar nome={u.nome} foto={u.foto_base64 || u.foto_url} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{u.nome}</div>
                          <div className="text-[11px] text-slate-500">{u.nickname ? `@${u.nickname}` : u.email}</div>
                        </div>
                        {u.amizade_status === 'aceito' ? (
                          <span className="text-[11px] text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10 flex items-center gap-1"><Check className="w-3 h-3" /> Amigo</span>
                        ) : u.amizade_status === 'pendente' ? (
                          <span className="text-[11px] text-amber-400 px-2 py-1 rounded-lg bg-amber-500/10 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => viewProfile(u.id)} className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleAddFriend(u.id, u.nome)} disabled={addingFriend === u.id}
                              className="text-[11px] text-indigo-400 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-1">
                              {addingFriend === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />} Adicionar
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {searchTerm.length >= 1 && !searching && searchResults.length === 0 && <div className="text-xs text-slate-500 text-center py-2">Nenhum usuário encontrado</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sugestoes.length > 0 && !showSearch && (
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Sugestões de amigos</span>
            <button onClick={refreshSugestoes} className="p-1 text-slate-500 hover:text-white transition-all"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sugestoes.map(u => (
              <div key={u.id} className="flex-shrink-0 w-28 text-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/10 hover:border-indigo-500/20 transition-all">
                <Avatar nome={u.nome} size="md" />
                <div className="mt-2 text-xs text-white truncate font-medium">{u.nome}</div>
                <div className="text-[10px] text-slate-500 mb-2">Nv.{u.nivel || 1}</div>
                <button onClick={() => handleAddFriend(u.id, u.nome)} disabled={addingFriend === u.id}
                  className="w-full text-[10px] py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                  {addingFriend === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />} Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/30 border border-slate-700/10 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setFilterTerm(''); }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.key === 'pendentes' && pendentes.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{pendentes.length}</span>}
          </button>
        ))}
      </div>

      {!showSearch && activeTab !== 'pendentes' && filteredList.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input placeholder="Filtrar..." value={filterTerm} onChange={e => setFilterTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'ranking' && (
          <motion.div key="ranking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {filteredList.length >= 3 && <Podium users={filteredList.slice(0, 3)} />}
            <div className="space-y-1.5">
              {filteredList.length === 0 ? <div className="text-center py-12 text-slate-500 text-sm">Nenhum usuário no ranking</div>
              : filteredList.map((amigo, i) => (
                <motion.div key={amigo.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => viewProfile(amigo.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-800/30 cursor-pointer ${amigo.id === user?.id ? 'bg-indigo-500/5 border border-indigo-500/10' : ''}`}>
                  <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-600'}`}>{i + 1}</span>
                  <Avatar nome={amigo.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium text-white truncate">{amigo.nome}</span></div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Nv.{amigo.nivel || 1}</span>
                      {amigo.streak > 0 && <><span>·</span><span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{amigo.streak}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /><span className="text-sm font-bold text-white">{(amigo.xp || 0).toLocaleString()}</span></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'amigos' && (
          <motion.div key="amigos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {amigos.length === 0 ? (
              <div className="text-center py-12"><Users className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">Você ainda não tem amigos.</p><p className="text-xs text-slate-600">Use o botão Adicionar!</p></div>
            ) : (
              <div className="space-y-6">
                {onlineFriends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Online — {onlineFriends.length}</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {onlineFriends.filter(a => !filterTerm || (a.nome||'').toLowerCase().includes(filterTerm.toLowerCase())).map((amigo, i) => (
                        <motion.div key={amigo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                          className="card-base p-4 hover:border-emerald-500/20 transition-all group border-emerald-500/10">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar nome={amigo.nome} foto={amigo.foto_base64 || amigo.foto_url} online={true} />
                            <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-white truncate">{amigo.nome}</div>{amigo.nickname && <div className="text-[11px] text-slate-500">@{amigo.nickname}</div>}</div>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Nv.{amigo.nivel || 1}</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {amigo.xp || 0}</span>
                            {amigo.streak > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {amigo.streak}d</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onNavigate('chat', { participanteId: amigo.id, participanteNome: amigo.nome })}
                              className="flex-1 text-xs py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 transition-all font-medium flex items-center justify-center gap-1"><MessageCircle className="w-3 h-3" /> Mensagem</button>
                            <button onClick={() => viewProfile(amigo.id)}
                              className="flex-1 text-xs py-2 rounded-lg bg-slate-800/40 text-slate-400 hover:bg-slate-800/60 transition-all font-medium flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Perfil</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {offlineFriends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-slate-600" /><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offline — {offlineFriends.length}</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {offlineFriends.filter(a => !filterTerm || (a.nome||'').toLowerCase().includes(filterTerm.toLowerCase())).map((amigo, i) => (
                        <motion.div key={amigo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                          className="card-base p-4 hover:border-slate-700/30 transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar nome={amigo.nome} foto={amigo.foto_base64 || amigo.foto_url} online={false} />
                            <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-white truncate">{amigo.nome}</div>{amigo.nickname && <div className="text-[11px] text-slate-500">@{amigo.nickname}</div>}</div>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Nv.{amigo.nivel || 1}</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {amigo.xp || 0}</span>
                            {amigo.streak > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {amigo.streak}d</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onNavigate('chat', { participanteId: amigo.id, participanteNome: amigo.nome })}
                              className="flex-1 text-xs py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 transition-all font-medium flex items-center justify-center gap-1"><MessageCircle className="w-3 h-3" /> Mensagem</button>
                            <button onClick={() => viewProfile(amigo.id)}
                              className="flex-1 text-xs py-2 rounded-lg bg-slate-800/40 text-slate-400 hover:bg-slate-800/60 transition-all font-medium flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Perfil</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'pendentes' && (
          <motion.div key="pendentes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {pendentes.length === 0 ? (
              <div className="text-center py-12"><Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">Nenhuma solicitação pendente</p><p className="text-xs text-slate-600 mt-1">Quando alguém te adicionar, aparecerá aqui</p></div>
            ) : (
              <div className="space-y-2">
                {pendentes.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card-base p-4">
                    <div className="flex items-center gap-3">
                      <Avatar nome={req.solicitante_nome || `User #${req.solicitante_id}`} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{req.solicitante_nome || `Usuário #${req.solicitante_id}`}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{req.criado_em ? new Date(req.criado_em).toLocaleDateString('pt-BR') : 'Recente'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAcceptRequest(req.id)} disabled={acceptingId === req.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-all disabled:opacity-50">
                          {acceptingId === req.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />} Aceitar
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleRejectRequest(req.id)} disabled={rejectingId === req.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all disabled:opacity-50">
                          {rejectingId === req.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />} Recusar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedProfile(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: '#0c0f1a', border: '1px solid rgba(148,163,184,0.08)' }}>
              <div className="h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 relative">
                {selectedProfile.banner_base64 && <img src={selectedProfile.banner_base64} alt="" className="w-full h-full object-cover" />}
                <button onClick={() => setSelectedProfile(null)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="relative px-6 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0c0f1a]">
                  {selectedProfile.foto_base64 ? <img src={selectedProfile.foto_base64} alt="" className="w-full h-full object-cover rounded-xl" />
                  : (selectedProfile.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <div className="p-6 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-white">{selectedProfile.nome}</h2>
                  <div className="flex items-center gap-2">
                    {selectedProfile.perfil === 'instrutor' && <span className="text-[10px] px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">COACH</span>}
                    {selectedProfile.amizade_status === 'aceito' && <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Amigo</span>}
                  </div>
                </div>
                {selectedProfile.nickname && <p className="text-sm text-slate-500 mb-2">@{selectedProfile.nickname}</p>}
                {selectedProfile.titulo && <p className="text-xs text-indigo-400 mb-2 bg-indigo-500/10 px-2 py-1 rounded-lg inline-block">{selectedProfile.titulo}</p>}
                {selectedProfile.bio && <p className="text-sm text-slate-400 mb-4">{selectedProfile.bio}</p>}
                {selectedProfile.criado_em && <p className="text-xs text-slate-600 mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Membro desde {new Date(selectedProfile.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-slate-800/30"><div className="flex items-center justify-center gap-1 text-amber-400 mb-1"><Zap className="w-4 h-4" /><span className="font-bold">{(selectedProfile.xp || 0).toLocaleString()}</span></div><span className="text-[10px] text-slate-500">XP</span></div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/30"><div className="flex items-center justify-center gap-1 text-indigo-400 mb-1"><Star className="w-4 h-4" /><span className="font-bold">{selectedProfile.nivel || 1}</span></div><span className="text-[10px] text-slate-500">Nível</span></div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/30"><div className="flex items-center justify-center gap-1 text-orange-400 mb-1"><Flame className="w-4 h-4" /><span className="font-bold">{selectedProfile.streak || 0}</span></div><span className="text-[10px] text-slate-500">Streak</span></div>
                </div>
                {selectedProfile.badges?.length > 0 && (
                  <div className="mb-4"><h3 className="text-xs font-semibold text-slate-400 mb-2">Conquistas</h3>
                    <div className="flex flex-wrap gap-2">{selectedProfile.badges.slice(0, 6).map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/20"><span className="text-base">{b.icone_url || '🏆'}</span><span className="text-[11px] text-slate-300">{b.nome}</span></div>
                    ))}</div>
                  </div>
                )}
                {(selectedProfile.instagram || selectedProfile.tiktok || selectedProfile.twitter) && (
                  <div className="flex gap-2 mb-4">
                    {selectedProfile.instagram && <a href={`https://instagram.com/${selectedProfile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-pink-400 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
                    {selectedProfile.twitter && <a href={`https://twitter.com/${selectedProfile.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-blue-400 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
                  </div>
                )}
                <div className="flex gap-2">
                  {selectedProfile.amizade_status !== 'aceito' && selectedProfile.amizade_status !== 'pendente' && selectedProfile.id !== user?.id && (
                    <button onClick={() => { handleAddFriend(selectedProfile.id, selectedProfile.nome); setSelectedProfile(null); }}
                      className="flex-1 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> Adicionar</button>
                  )}
                  {selectedProfile.id !== user?.id && (
                    <button onClick={() => { setSelectedProfile(null); onNavigate('chat', { participanteId: selectedProfile.id, participanteNome: selectedProfile.nome }); }}
                      className="flex-1 py-2.5 text-sm font-medium bg-slate-800/40 text-slate-300 rounded-xl hover:bg-slate-800/60 transition-all flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Mensagem</button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 z-[60] ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmigosPage;
