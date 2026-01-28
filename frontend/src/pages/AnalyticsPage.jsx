import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Flame, Target, Calendar,
  ChevronDown, Download, RefreshCw
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';

// Skeleton Loader
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Stat Card with trend
const StatCard = ({ title, value, change, changeType, icon: Icon, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
  >
    {loading ? (
      <div className="space-y-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-16 h-4" />
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              changeType === 'up' ? 'text-green-400' : changeType === 'down' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : 
               changeType === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
              {change}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{title}</div>
      </>
    )}
  </motion.div>
);

// Chart Card Component
const ChartCard = ({ title, children, loading, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 ${className}`}
  >
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-purple-400" />
      {title}
    </h3>
    {loading ? (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : (
      children
    )}
  </motion.div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics();
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data para demonstração
  const treinosPorMes = [
    { mes: 'Jan', treinos: 12, meta: 15 },
    { mes: 'Fev', treinos: 15, meta: 15 },
    { mes: 'Mar', treinos: 18, meta: 15 },
    { mes: 'Abr', treinos: 20, meta: 18 },
    { mes: 'Mai', treinos: 22, meta: 20 },
    { mes: 'Jun', treinos: 19, meta: 20 },
  ];

  const evolucaoCarga = [
    { semana: 'Sem 1', supino: 60, agachamento: 80, levantamento: 100 },
    { semana: 'Sem 2', supino: 65, agachamento: 85, levantamento: 105 },
    { semana: 'Sem 3', supino: 70, agachamento: 90, levantamento: 110 },
    { semana: 'Sem 4', supino: 72, agachamento: 95, levantamento: 115 },
    { semana: 'Sem 5', supino: 75, agachamento: 100, levantamento: 120 },
    { semana: 'Sem 6', supino: 80, agachamento: 105, levantamento: 125 },
  ];

  const grupoMuscular = [
    { name: 'Peito', value: 25, color: '#8b5cf6' },
    { name: 'Costas', value: 22, color: '#ec4899' },
    { name: 'Pernas', value: 28, color: '#f59e0b' },
    { name: 'Ombros', value: 15, color: '#10b981' },
    { name: 'Braços', value: 10, color: '#3b82f6' },
  ];

  const medidasCorporais = [
    { data: '01/01', peso: 80, gordura: 18, musculo: 42 },
    { data: '15/01', peso: 79, gordura: 17.5, musculo: 42.5 },
    { data: '01/02', peso: 78.5, gordura: 17, musculo: 43 },
    { data: '15/02', peso: 78, gordura: 16.5, musculo: 43.5 },
    { data: '01/03', peso: 77.5, gordura: 16, musculo: 44 },
    { data: '15/03', peso: 77, gordura: 15.5, musculo: 44.5 },
  ];

  const frequenciaSemanal = [
    { dia: 'Seg', treinos: 4 },
    { dia: 'Ter', treinos: 3 },
    { dia: 'Qua', treinos: 5 },
    { dia: 'Qui', treinos: 4 },
    { dia: 'Sex', treinos: 3 },
    { dia: 'Sáb', treinos: 2 },
    { dia: 'Dom', treinos: 1 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Acompanhe seu progresso e evolução</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalytics}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Treinos este mês"
          value={analyticsData?.treinos_mes || 22}
          change={15}
          changeType="up"
          icon={Activity}
          color="from-purple-500 to-pink-500"
          loading={loading}
        />
        <StatCard
          title="Calorias queimadas"
          value={`${analyticsData?.calorias || 12500} kcal`}
          change={8}
          changeType="up"
          icon={Flame}
          color="from-orange-500 to-red-500"
          loading={loading}
        />
        <StatCard
          title="Meta atingida"
          value={`${analyticsData?.meta_percent || 85}%`}
          change={5}
          changeType="up"
          icon={Target}
          color="from-green-500 to-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Dias ativos"
          value={analyticsData?.dias_ativos || 18}
          change={-3}
          changeType="down"
          icon={Calendar}
          color="from-blue-500 to-cyan-500"
          loading={loading}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Treinos por Mês - Bar Chart */}
        <ChartCard title="Frequência de Treinos" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={treinosPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="treinos" name="Treinos" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#334155" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Evolução de Carga - Line Chart */}
        <ChartCard title="Evolução de Carga (kg)" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolucaoCarga}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="semana" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="supino" name="Supino" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="agachamento" name="Agachamento" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="levantamento" name="Levantamento" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Distribuição por Grupo Muscular - Pie Chart */}
        <ChartCard title="Distribuição por Grupo Muscular" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={grupoMuscular}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {grupoMuscular.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Frequência por Dia da Semana */}
        <ChartCard title="Frequência por Dia da Semana" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={frequenciaSemanal} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="dia" type="category" stroke="#94a3b8" fontSize={12} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="treinos" name="Treinos" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Medidas Corporais - Full Width Area Chart */}
      <ChartCard title="Evolução Corporal" loading={loading} className="col-span-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={medidasCorporais}>
            <defs>
              <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGordura" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMusculo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="peso" name="Peso (kg)" stroke="#8b5cf6" fill="url(#colorPeso)" strokeWidth={2} />
            <Area type="monotone" dataKey="gordura" name="Gordura (%)" stroke="#ec4899" fill="url(#colorGordura)" strokeWidth={2} />
            <Area type="monotone" dataKey="musculo" name="Músculo (%)" stroke="#10b981" fill="url(#colorMusculo)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
