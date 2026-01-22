import React from 'react';
import { motion } from 'framer-motion';

export const Badge = ({ icon: Icon, label, color = 'purple', size = 'md' }) => {
  const colors = {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 rounded-full border ${colors[color]} ${sizes[size]} font-semibold`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </motion.div>
  );
};
