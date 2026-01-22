import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Moon, Settings as SettingsIcon } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/common';
import { useAuth } from '../context/AuthContext';

export const ConfigsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notificacoes: true,
    temaEscuro: true,
    emailMarketing: false,
  });

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
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-3xl font-bold text-white">Configurações</h1>

      {/* Perfil */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Informações Pessoais
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Nome</label>
              <p className="text-white font-semibold">{user?.nome}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white font-semibold">{user?.email}</p>
            </div>
            <Button variant="secondary" className="w-full">
              Editar Perfil
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Notificações */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificações
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notificacoes}
                onChange={(e) => setSettings({ ...settings, notificacoes: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-white">Receber notificações de atividade</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.emailMarketing}
                onChange={(e) => setSettings({ ...settings, emailMarketing: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-white">Receber emails promocionais</span>
            </label>
          </div>
        </Card>
      </motion.div>

      {/* Aparência */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5" /> Aparência
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.temaEscuro}
              onChange={(e) => setSettings({ ...settings, temaEscuro: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-white">Modo escuro (padrão)</span>
          </label>
        </Card>
      </motion.div>

      {/* Segurança */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Segurança
          </h3>
          <Button variant="secondary" className="w-full">
            Mudar Senha
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
};
