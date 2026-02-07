import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, ChevronDown, UserCircle, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoutModal } from '../common/LogoutModal';

export const Header = ({ onProfileClick, onSettingsClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName = user?.nickname || user?.nome?.split(' ')[0] || 'Atleta';
  const userInitial = (user?.nickname || user?.nome)?.charAt(0)?.toUpperCase() || 'U';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 h-16 z-30 flex items-center"
      style={{ 
        background: 'rgba(12, 15, 26, 0.8)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="px-6 w-full flex items-center justify-between">
        <div className="hidden md:block" />

        <div className="flex items-center gap-3 ml-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          </motion.button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{userInitial}</span>
              </div>
              <span className="text-sm text-slate-300 hidden sm:block max-w-24 truncate font-medium">
                {displayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 top-12 w-52 rounded-xl shadow-2xl overflow-hidden"
                  style={{ background: 'rgba(26, 31, 46, 0.95)', border: '1px solid rgba(148,163,184,0.1)' }}
                >
                  <div className="p-3 border-b border-slate-700/30">
                    <p className="font-medium text-white text-sm">{user?.nome || 'Usuário'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); onProfileClick?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" /><span>Meu Perfil</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); onSettingsClick?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
                    >
                      <Settings className="w-4 h-4" /><span>Configurações</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-700/30 py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); setShowLogoutModal(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /><span>Sair</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showUserMenu && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />
      )}

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
      />
    </motion.header>
  );
};
