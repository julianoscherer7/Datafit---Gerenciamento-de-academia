import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', color = 'purple' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    white: 'border-white',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full`}
    />
  );
};

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <motion.div className="text-center">
        <LoadingSpinner size="lg" color="purple" />
        <motion.p className="text-gray-400 mt-4">Carregando...</motion.p>
      </motion.div>
    </div>
  );
};
