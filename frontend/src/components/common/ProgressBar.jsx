import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ value, max = 100, color = 'purple', label, showValue = true }) => {
  const percentage = (value / max) * 100;
  
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <div className="space-y-2">
      {label && <div className="flex justify-between text-sm text-gray-400">{label} {showValue && <span>{Math.round(value)}/{max}</span>}</div>}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full shadow-lg`}
        />
      </div>
    </div>
  );
};
