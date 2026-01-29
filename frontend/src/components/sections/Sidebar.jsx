import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Dumbbell, Users, TrendingUp, User,
  LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, setIsOpen, currentPage, setCurrentPage }) => {
  const { logout, user } = useAuth();

  // Menu simplificado - apenas 5 itens principais
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home, description: 'Seu resumo diário' },
    { id: 'treinos', label: 'Treino', icon: Dumbbell, description: 'Treinar agora' },
    { id: 'progresso', label: 'Progresso', icon: TrendingUp, description: 'Suas conquistas' },
    { id: 'amigos', label: 'Social', icon: Users, description: 'Amigos e chat' },
    { id: 'perfil', label: 'Perfil', icon: User, description: 'Configurações' },
  ];

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-500 p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/25"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - Fixa em desktop, slide em mobile */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 768) ? 0 : -280
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Dumbbell className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DATAFIT
              </h1>
              <p className="text-xs text-slate-500">Seu treino, sua evolução</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{user?.nome || 'Usuário'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Simples e Limpo */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <span className="font-medium">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-slate-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};
