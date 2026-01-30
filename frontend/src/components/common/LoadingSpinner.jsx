import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', color = 'purple' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    white: 'border-white',
    pink: 'border-pink-500',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full`}
    />
  );
};

// Centered loader for use within containers
export const CenteredLoader = ({ message = 'Carregando...', size = 'lg', minHeight = '400px' }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center w-full"
      style={{ minHeight }}
    >
      <LoadingSpinner size={size} color="purple" />
      {message && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 mt-4 text-center text-sm"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Inline loader for buttons and small areas
export const InlineLoader = ({ size = 'sm', className = '' }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <LoadingSpinner size={size} color="white" />
  </div>
);

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center"
      >
        {/* Logo animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30"
        >
          <span className="text-3xl">💪</span>
        </motion.div>
        
        <LoadingSpinner size="lg" color="purple" />
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-4 text-center"
        >
          Carregando...
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 mt-2 text-sm"
        >
          FITDATA
        </motion.p>
      </motion.div>
    </div>
  );
};

// Skeleton component for consistent loading states
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// Page skeleton for consistent initial loading
export const PageSkeleton = () => (
  <div className="space-y-6 pb-8">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    
    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <Skeleton className="w-10 h-10 rounded-xl mb-3" />
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    
    {/* Content cards skeleton */}
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
