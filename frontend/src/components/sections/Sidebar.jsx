import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Dumbbell, Target, Users, Trophy, Clock, BarChart3, Settings, 
  LogOut, Menu, X, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, setIsOpen, currentPage, setCurrentPage }) => {
  const { logout } = useAuth();

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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-500 p-2 rounded-lg text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ marginLeft: isOpen ? 0 : '-100%' }}
        className="fixed left-0 top-0 w-64 h-screen bg-slate-900 border-r border-slate-800 pt-20 md:pt-0 md:ml-0 z-40 md:z-30"
      >
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
            FITDATA
          </h1>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </motion.button>
      </motion.aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
        />
      )}
    </>
  );
};
