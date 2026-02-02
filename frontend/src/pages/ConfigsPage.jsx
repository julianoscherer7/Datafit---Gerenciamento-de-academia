import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Moon, Settings as SettingsIcon,
  ChevronRight, Shield, Globe, LogOut, Save, Check, X, Eye, EyeOff
} from 'lucide-react';
import { Card, Button, Input, Badge, LogoutModal } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Section Toggle Component
const SettingToggle = ({ label, description, value, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
    <div className="flex-1 mr-4">
      <p className="text-white font-medium">{label}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-purple-500' : 'bg-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </motion.button>
  </div>
);

// Change Password Modal
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha) {
      setError('Preencha todos os campos');
      return;
    }
    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    if (formData.novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.put('/auth/change-password', {
        senha_atual: formData.senhaAtual,
        nova_senha: formData.novaSenha
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Alterar Senha</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-medium">Senha alterada com sucesso!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showPasswords.atual ? 'text' : 'password'}
                    value={formData.senhaAtual}
                    onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, atual: !showPasswords.atual })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.atual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPasswords.nova ? 'text' : 'password'}
                    value={formData.novaSenha}
                    onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, nova: !showPasswords.nova })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.nova ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmar ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.confirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Nova Senha
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ConfigsPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notificacoes: true,
    emailMarketing: false,
    lembretesTreino: true,
    sonsTreino: true
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('fitdata_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('fitdata_settings', JSON.stringify(newSettings));
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 max-w-2xl mx-auto pb-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Personalize sua experiência</p>
      </div>

      {/* Perfil */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> Conta
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {user?.foto_base64 ? (
                <img src={user.foto_base64} alt={user.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{user?.nome || 'Usuário'}</p>
              {user?.nickname && <p className="text-sm text-purple-400">@{user.nickname}</p>}
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('editPerfil')}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            Editar Perfil
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </Card>
      </motion.div>

      {/* Notificações */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" /> Notificações
          </h3>
          <div className="space-y-1">
            <SettingToggle
              label="Notificações push"
              description="Receber notificações no dispositivo"
              value={settings.notificacoes}
              onChange={(v) => updateSetting('notificacoes', v)}
            />
            <SettingToggle
              label="Lembretes de treino"
              description="Receber lembretes para treinar"
              value={settings.lembretesTreino}
              onChange={(v) => updateSetting('lembretesTreino', v)}
            />
            <SettingToggle
              label="Emails promocionais"
              description="Receber ofertas e novidades"
              value={settings.emailMarketing}
              onChange={(v) => updateSetting('emailMarketing', v)}
            />
          </div>
        </Card>
      </motion.div>

      {/* Aparência */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" /> Aparência
          </h3>
          <SettingToggle
            label="Modo escuro"
            description="Usar tema escuro na interface"
            value={darkMode}
            onChange={toggleTheme}
          />
        </Card>
      </motion.div>

      {/* Treino */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-purple-400" /> Treino
          </h3>
          <SettingToggle
            label="Sons durante treino"
            description="Tocar sons de conclusão e alertas"
            value={settings.sonsTreino}
            onChange={(v) => updateSetting('sonsTreino', v)}
          />
        </Card>
      </motion.div>

      {/* Segurança */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" /> Segurança
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Alterar Senha
          </motion.button>
        </Card>
      </motion.div>

      {/* Sair */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </motion.button>
      </motion.div>

      {/* App Info */}
      <motion.div variants={itemVariants} className="text-center text-slate-500 text-sm">
        <p>FITDATA v1.0.0</p>
        <p>© 2026 FITDATA. Todos os direitos reservados.</p>
      </motion.div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </motion.div>
  );
};

export default ConfigsPage;