import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, Button } from '../components/common';
import { TrendingUp } from 'lucide-react';

const mockAnalyticsData = [
  { mes: 'Jan', treinos: 12, calorias: 3600, xp: 1200 },
  { mes: 'Fev', treinos: 15, calorias: 4200, xp: 1500 },
  { mes: 'Mar', treinos: 18, calorias: 5100, xp: 1800 },
  { mes: 'Abr', treinos: 20, calorias: 6000, xp: 2200 },
  { mes: 'Mai', treinos: 22, calorias: 6800, xp: 2500 },
];

export const AnalyticsPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-white">Analytics</h1>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treinos */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Treinos por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="treinos" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Calorias */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Calorias Queimadas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="calorias" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* XP */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> XP Ganho
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="xp" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </motion.div>
  );
};
