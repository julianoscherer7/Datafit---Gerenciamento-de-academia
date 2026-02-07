import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Flame, TrendingUp, ChevronDown, Search,
  Dumbbell, X, ArrowUpRight, ArrowDownRight, Minus, BarChart3,
  Filter, CheckCircle
} from 'lucide-react';
import { historicoService } from '../services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(148,163,184,0.08)' }} />
);

const Counter = ({ end, suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 800;
    const step = (end - start) / (dur / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.round(start));
    }, 16);
    return () => clearInterval(id);
  }, [end]);
  return <>{val.toLocaleString()}{suffix}</>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700/30 rounded-lg px-3 py-2 text-xs backdrop-blur-sm">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-white font-medium">{p.name}: <span style={{ color: p.color }}>{p.value}</span></div>
      ))}
    </div>
  );
};

export const HistoricoPage = ({ onNavigate }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchHistorico(); }, []);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const res = await historicoService.getHistorico();
      setHistorico(res.data || []);
    } catch {
      // Demo data
      setHistorico([
        { id: 1, treino_nome: 'Treino A - Peito e Triceps', data: '2024-01-15', duracao: 65, calorias: 420, exercicios_completos: 6, exercicios_total: 6, volume_total: 4800, tipo: 'musculacao' },
        { id: 2, treino_nome: 'Treino B - Costas e Biceps', data: '2024-01-13', duracao: 58, calorias: 380, exercicios_completos: 5, exercicios_total: 6, volume_total: 4200, tipo: 'musculacao' },
        { id: 3, treino_nome: 'Treino C - Pernas', data: '2024-01-11', duracao: 72, calorias: 520, exercicios_completos: 7, exercicios_total: 7, volume_total: 6100, tipo: 'musculacao' },
        { id: 4, treino_nome: 'Cardio - HIIT', data: '2024-01-10', duracao: 30, calorias: 350, exercicios_completos: 8, exercicios_total: 8, volume_total: 0, tipo: 'cardio' },
        { id: 5, treino_nome: 'Treino A - Peito e Triceps', data: '2024-01-08', duracao: 60, calorias: 400, exercicios_completos: 6, exercicios_total: 6, volume_total: 4600, tipo: 'musculacao' },
        { id: 6, treino_nome: 'Treino B - Costas e Biceps', data: '2024-01-06', duracao: 55, calorias: 360, exercicios_completos: 6, exercicios_total: 6, volume_total: 4000, tipo: 'musculacao' },
      ]);
    }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    if (!historico.length) return { total: 0, totalMin: 0, totalCal: 0, avgDur: 0 };
    const total = historico.length;
    const totalMin = historico.reduce((s, h) => s + (h.duracao || 0), 0);
    const totalCal = historico.reduce((s, h) => s + (h.calorias || 0), 0);
    return { total, totalMin, totalCal, avgDur: Math.round(totalMin / total) };
  }, [historico]);

  const chartData = useMemo(() => {
    return historico.slice(0, 7).reverse().map(h => ({
      name: new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      volume: h.volume_total || 0,
      calorias: h.calorias || 0,
      duracao: h.duracao || 0
    }));
  }, [historico]);

  const filtered = historico.filter(h => {
    if (filter !== 'todos' && h.tipo !== filter) return false;
    if (searchTerm && !(h.treino_nome || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    const diff = Math.floor((today - date) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `${diff} dias atras`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Historico</h1>
        <p className="text-sm text-slate-500">{historico.length} treinos registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Treinos', value: stats.total, icon: Dumbbell, color: 'indigo' },
          { label: 'Tempo Total', value: stats.totalMin, suffix: 'min', icon: Clock, color: 'emerald' },
          { label: 'Calorias', value: stats.totalCal, suffix: 'kcal', icon: Flame, color: 'amber' },
          { label: 'Media', value: stats.avgDur, suffix: 'min', icon: TrendingUp, color: 'purple' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 text-${s.color}-400`} />
              <span className="text-[11px] text-slate-500">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-white"><Counter end={s.value} suffix={s.suffix ? ` ${s.suffix}` : ''} /></div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Volume por Sessao</h3>
          <span className="text-[11px] text-slate-500">Ultimos 7 treinos</span>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="volume" stroke="#6366f1" fill="url(#volGrad)" strokeWidth={2} name="Volume (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Sem dados</div>}
      </motion.div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar treino..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-800/30 border border-slate-700/10 w-fit">
          {[{ key: 'todos', label: 'Todos' }, { key: 'musculacao', label: 'Musculacao' }, { key: 'cardio', label: 'Cardio' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum treino encontrado</div>
        ) : filtered.map((h, i) => (
          <motion.div key={h.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(h)}
            className="card-base p-4 hover:border-slate-700/30 cursor-pointer transition-all group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                h.tipo === 'cardio' ? 'bg-amber-500/10' : 'bg-indigo-500/10'
              }`}>
                {h.tipo === 'cardio' ? <Flame className="w-5 h-5 text-amber-400" /> : <Dumbbell className="w-5 h-5 text-indigo-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                  {h.treino_nome}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{formatDate(h.data)}</span>
                  <span>·</span>
                  <span>{h.duracao}min</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    {h.exercicios_completos}/{h.exercicios_total}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{(h.calorias || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">kcal</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{selected.treino_nome}</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Data', value: new Date(selected.data).toLocaleDateString('pt-BR') },
                  { label: 'Duracao', value: `${selected.duracao} min` },
                  { label: 'Calorias', value: `${selected.calorias} kcal` },
                  { label: 'Volume', value: `${(selected.volume_total || 0).toLocaleString()} kg` },
                  { label: 'Exercicios', value: `${selected.exercicios_completos}/${selected.exercicios_total}` },
                  { label: 'Tipo', value: selected.tipo || 'musculacao' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-800/20 rounded-lg p-3">
                    <div className="text-[11px] text-slate-500 mb-0.5">{item.label}</div>
                    <div className="text-sm font-medium text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              {/* Completion bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-slate-500">Conclusao</span>
                  <span className="text-indigo-400 font-medium">
                    {Math.round((selected.exercicios_completos / Math.max(selected.exercicios_total, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/40 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(selected.exercicios_completos / Math.max(selected.exercicios_total, 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoricoPage;
