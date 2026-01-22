import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, hover = true, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StatCard = ({ icon: Icon, label, value, trend, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-br ${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </Card>
  );
};
