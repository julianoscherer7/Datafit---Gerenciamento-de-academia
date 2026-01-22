import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onProfileClick }) => {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-slate-900/95 border-b border-slate-800 backdrop-blur-sm z-40"
    >
      <div className="px-6 h-full flex items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-white">Bem-vindo!</h2>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="relative p-2 text-gray-400 hover:text-white"
          >
            <Bell className="w-6 h-6" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          </motion.button>

          <div className="w-px h-6 bg-slate-700" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.nome || 'Usuário'}</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
