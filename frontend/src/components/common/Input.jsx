import React from 'react';
import { motion } from 'framer-motion';

export const Input = ({ label, error, value, onChange, type = 'text', placeholder, icon: Icon, ...props }) => {
  return (
    <motion.div className="mb-4" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
            error ? 'border-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
    </motion.div>
  );
};
