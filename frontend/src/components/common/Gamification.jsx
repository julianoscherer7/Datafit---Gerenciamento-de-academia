import React from 'react';
import { motion } from 'framer-motion';

export const StreakCard = ({ streak, fire = true }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-center text-white shadow-lg"
    >
      <div className="text-3xl font-bold mb-2">{streak}</div>
      <div className="text-sm opacity-90 flex items-center justify-center gap-1">
        {fire && <span>🔥</span>}
        <span>Dias seguidos</span>
      </div>
    </motion.div>
  );
};

export const XpBar = ({ current, nextLevel, color = 'purple' }) => {
  const percentage = (current / nextLevel) * 100;
  
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>XP</span>
        <span>{current}/{nextLevel}</span>
      </div>
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full bg-gradient-to-r ${colors[color]} shadow-lg`}
        />
      </div>
    </div>
  );
};
