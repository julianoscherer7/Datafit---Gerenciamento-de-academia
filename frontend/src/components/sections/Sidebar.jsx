import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Dumbbell, Target, Users, Trophy, Clock, BarChart3, Settings, 
  LogOut, Menu, X, Flame, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, setIsOpen, currentPage, setCurrentPage }) => {
  const { logout, user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell },
    { id: 'execucao', label: 'Execução', icon: Flame },
    { id: 'desafios', label: 'Desafios', icon: Target },
    { id: 'amigos', label: 'Amigos', icon: Users },
    { id: 'badges', label: 'Badges', icon: Trophy },
    { id: 'historico', label: 'Histórico', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'configs', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  // Determina se a sidebar deve estar expandida
  const shouldExpand = isOpen || isHovered || !isCollapsed;
  const sidebarWidth = shouldExpand ? 256 : 72;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-500 p-2 rounded-lg text-white shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Hover Zone para desktop - área invisível para trigger do hover */}
      <div 
        className="hidden md:block fixed left-0 top-0 w-4 h-full z-50"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarWidth,
          marginLeft: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -sidebarWidth : 0)
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Dumbbell className="w-5 h-5 text-white" />
              </motion.div>
              <AnimatePresence>
                {shouldExpand && (
                  <motion.h1 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap"
                  >
                    FITDATA
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Info */}
          <AnimatePresence>
            {shouldExpand && user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-4 border-b border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-white truncate">{user?.nome || 'Usuário'}</div>
                    <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: shouldExpand ? 5 : 0, scale: shouldExpand ? 1 : 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={!shouldExpand ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {shouldExpand && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </nav>

          {/* Collapse Toggle Button (Desktop only) */}
          <div className="hidden md:block px-3 py-2 border-t border-slate-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              <AnimatePresence>
                {shouldExpand && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    {isCollapsed ? 'Expandir' : 'Recolher'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-slate-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all ${
                !shouldExpand ? 'justify-center' : ''
              }`}
              title={!shouldExpand ? 'Sair' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {shouldExpand && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    Sair
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};
