import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, LogOut, Settings, ChevronDown, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoutModal } from '../common/LogoutModal';

export const Header = ({ onProfileClick, onSettingsClick }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifications = [
    { id: 1, text: 'Você completou um treino!', time: 'Agora', icon: '🏋️' },
    { id: 2, text: 'Nova conquista desbloqueada!', time: '5min', icon: '🏆' },
    { id: 3, text: 'Seu amigo te desafiou!', time: '1h', icon: '🎯' },
  ];

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  // Get display name - use nickname if available, otherwise first name
  const displayName = user?.nickname || user?.nome?.split(' ')[0] || 'Atleta';
  const userInitial = (user?.nickname || user?.nome)?.charAt(0)?.toUpperCase() || 'U';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 h-16 bg-slate-900/95 border-b border-slate-800 backdrop-blur-sm z-30"
    >
      <div className="px-6 h-full flex items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-white">
            Bem-vindo, {displayName}!
          </h2>
          <p className="text-sm text-slate-400">Hora de treinar 💪</p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              />
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white">Notificações</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                        className="p-4 border-b border-slate-700/50 cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl">{notif.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm text-white">{notif.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-700">
                    <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300">
                      Ver todas as notificações
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userInitial}
                </span>
              </div>
              <span className="text-sm text-slate-300 hidden sm:block max-w-24 truncate">
                {displayName}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-slate-700">
                    <p className="font-medium text-white">{user?.nickname || user?.nome || 'Usuário'}</p>
                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                      {user?.perfil || 'aluno'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                      onClick={() => {
                        setShowUserMenu(false);
                        onProfileClick?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white text-left"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                      onClick={() => {
                        setShowUserMenu(false);
                        onSettingsClick?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </motion.button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-700 py-2">
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da conta</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </motion.header>
  );
};
