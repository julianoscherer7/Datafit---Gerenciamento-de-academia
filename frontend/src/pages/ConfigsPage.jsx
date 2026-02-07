import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Bell, Moon, Sun, Globe, Lock, Shield, Eye, EyeOff,
  ChevronRight, LogOut, User, Palette, Volume2, Smartphone, Check
} from 'lucide-react';
import { configsService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Toggle = ({ enabled, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-sm text-white font-medium">{label}</div>
      {desc && <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
      <motion.div layout className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm ${enabled ? 'left-[22px]' : 'left-0.5'}`}
        style={{ width: 18, height: 18 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-3 mt-6 first:mt-0">
    <Icon className="w-4 h-4 text-indigo-400" />
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
  </div>
);

export const ConfigsPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [configs, setConfigs] = useState({
    notificacoes: true, notif_treino: true, notif_social: false, notif_badges: true,
    privacidade_perfil: false, som: true
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configsService.getConfigs().then(res => {
      if (res.data) setConfigs(prev => ({ ...prev, ...res.data }));
    }).catch(() => {});
  }, []);

  const updateConfig = async (key, val) => {
    setConfigs(prev => ({ ...prev, [key]: val }));
    try { await configsService.atualizarConfigs({ [key]: val }); } catch {}
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) return;
    setSaving(true);
    try {
      await configsService.atualizarConfigs({ senha_atual: passwordData.current, nova_senha: passwordData.new });
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch {}
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); };

  const PasswordInput = ({ value, onChange, placeholder, field }) => (
    <div className="relative">
      <input type={showPasswords[field] ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 pr-10 transition-colors" />
      <button onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
        {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-1">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Configuracoes</h1>
        <p className="text-sm text-slate-500">Personalize sua experiencia</p>
      </div>

      <div className="card-base p-5">
        {/* APPEARANCE */}
        <SectionHeader icon={Palette} title="Aparencia" />
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm text-white font-medium">Tema escuro</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Alternar entre claro e escuro</div>
          </div>
          <button onClick={toggleTheme}
            className={`relative w-10 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-700'}`}
            style={{ height: 22 }}>
            <motion.div layout style={{ width: 18, height: 18, top: 2 }}
              className={`absolute rounded-full bg-white shadow-sm ${theme === 'dark' ? 'left-[20px]' : 'left-0.5'}`}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </button>
        </div>
        <div className="border-t border-slate-800/30 my-1" />

        {/* NOTIFICATIONS */}
        <SectionHeader icon={Bell} title="Notificacoes" />
        <Toggle label="Notificacoes" desc="Receber notificacoes push" enabled={configs.notificacoes} onChange={v => updateConfig('notificacoes', v)} />
        <Toggle label="Lembretes de treino" desc="Avisar nos horarios de treino" enabled={configs.notif_treino} onChange={v => updateConfig('notif_treino', v)} />
        <Toggle label="Conquistas" desc="Avisar ao ganhar badges" enabled={configs.notif_badges} onChange={v => updateConfig('notif_badges', v)} />
        <Toggle label="Social" desc="Notificacoes de amigos" enabled={configs.notif_social} onChange={v => updateConfig('notif_social', v)} />
        <div className="border-t border-slate-800/30 my-1" />

        {/* SOUND */}
        <SectionHeader icon={Volume2} title="Sons" />
        <Toggle label="Efeitos sonoros" desc="Sons ao completar acoes" enabled={configs.som} onChange={v => updateConfig('som', v)} />
        <div className="border-t border-slate-800/30 my-1" />

        {/* PRIVACY */}
        <SectionHeader icon={Shield} title="Privacidade" />
        <Toggle label="Perfil publico" desc="Outros usuarios podem ver seu perfil" enabled={configs.privacidade_perfil} onChange={v => updateConfig('privacidade_perfil', v)} />

        <button onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-between w-full py-3 group">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-white font-medium">Alterar senha</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      {/* Logout */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setShowLogoutModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all">
        <LogOut className="w-4 h-4" /> Sair da conta
      </motion.button>

      <div className="text-center text-[11px] text-slate-600 mt-4 pb-8">DATAFIT v2.0 · Todos os direitos reservados</div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md card-base p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
              <div className="space-y-3">
                <PasswordInput value={passwordData.current} onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))} placeholder="Senha atual" field="current" />
                <PasswordInput value={passwordData.new} onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))} placeholder="Nova senha" field="new" />
                <PasswordInput value={passwordData.confirm} onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirmar nova senha" field="confirm" />
                {passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm && (
                  <p className="text-xs text-red-400">As senhas nao coincidem</p>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">Cancelar</button>
                <button onClick={handlePasswordChange} disabled={saving || !passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                  className="flex-1 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  {saving ? 'Salvando...' : 'Alterar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowLogoutModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm card-base p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Sair da conta?</h3>
              <p className="text-sm text-slate-400 mb-5">Voce precisara fazer login novamente.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-slate-800/40 transition-all">Cancelar</button>
                <button onClick={handleLogout} className="flex-1 py-2.5 text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">Sair</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfigsPage;
