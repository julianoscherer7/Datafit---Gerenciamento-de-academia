import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Dumbbell, Users, TrendingUp, User,
  LogOut, Menu, X, MessageSquare, Bot, LayoutDashboard, 
  UserPlus, Link, Shield, Settings, Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoutModal } from '../common/LogoutModal';

export const Sidebar = ({ isOpen, setIsOpen, currentPage, setCurrentPage }) => {
  const { logout, user, isCoach, isApprovedCoach, isAdmin, isStudent } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'treinos', label: 'Treinos', icon: Dumbbell },
        { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
      ],
    },
    ...(isApprovedCoach ? [{
      label: 'Coach',
      items: [
        { id: 'coachDashboard', label: 'Painel Coach', icon: LayoutDashboard },
        { id: 'coachTreinos', label: 'Criar Treino', icon: UserPlus },
      ],
    }] : []),
    {
      label: 'Social',
      items: [
        { id: 'amigos', label: 'Ranking', icon: Trophy },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        ...(isStudent ? [{ id: 'connection', label: 'Meu Coach', icon: Link }] : []),
        { id: 'fitbot', label: 'FitBot AI', icon: Bot },
      ],
    },
    ...(isAdmin ? [{
      label: 'Admin',
      items: [{ id: 'adminCoaches', label: 'Gerenciar', icon: Shield }],
    }] : []),
  ];

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleLogoutConfirm = () => { setShowLogoutModal(false); logout(); };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <motion.aside
        initial={false}
        animate={{ x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 768) ? 0 : -280 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 h-screen w-[260px] z-40 flex flex-col"
        style={{ 
          background: 'rgba(12, 15, 26, 0.97)',
          borderRight: '1px solid rgba(148, 163, 184, 0.06)',
        }}
      >
        <div className="px-5 py-5 flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
            whileHover={{ scale: 1.05, rotate: 3 }}
          >
            <Dumbbell className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">DATAFIT</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Fitness Platform</p>
          </div>
        </div>

        {user && (
          <div className="mx-3 mb-2">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => { setCurrentPage('perfil'); setIsOpen(false); }}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-800/50"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                <span className="text-indigo-400 font-semibold text-sm">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{user?.nome || 'Usuário'}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {isCoach ? (isApprovedCoach ? 'Coach Verificado' : 'Coach Pendente') : 'Aluno'}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="mx-5 mb-2 border-t border-slate-800/60" />

        <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              <div className="px-3 mb-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setCurrentPage(item.id); setIsOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all relative ${
                        isActive
                          ? 'text-white bg-indigo-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-slate-800/40">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentPage('configs'); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-1 ${
              currentPage === 'configs' ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Configurações</span>
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/70 hover:text-red-400 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sair</span>
          </motion.button>
        </div>
      </motion.aside>

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

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};
