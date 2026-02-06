import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Award, Edit, Instagram, Twitter, Linkedin, AtSign, MapPin, Calendar, Scale, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 ${className}`}>
    {children}
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
  };
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
};

// Badge Component
const Badge = ({ label, color = 'purple' }) => {
  const colors = {
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[color]}`}>
      {label}
    </span>
  );
};

export const PerfilPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

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

  // Calcular idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(user?.data_nascimento);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header com foto e info principal */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl text-white relative overflow-hidden"
      >
        {/* Banner */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-purple-600 to-pink-600 relative">
          {user?.banner_base64 && (
            <img 
              src={user.banner_base64} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
        
        {/* Content below banner */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-6 pb-6 pt-0 relative">
          {/* Foto de perfil sobreposta */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-4 border-slate-800 shadow-xl">
              {user?.foto_base64 ? (
                <img src={user.foto_base64} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1 pt-2 md:pt-4">
              <h1 className="text-2xl md:text-3xl font-bold">{user?.nome}</h1>
              {user?.nickname && (
                <p className="text-purple-300 font-medium">@{user.nickname}</p>
              )}
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
            
            {/* Botão Editar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('editPerfil')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">Editar</span>
            </motion.button>
          </div>
          
          {/* Bio e badges */}
          <div className="mt-4">
            {user?.bio && (
              <p className="text-white/80 text-sm mb-4 max-w-2xl">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <Badge label={`Nível ${user?.nivel || 1}`} color="purple" />
              {user?.titulo_atual && <Badge label={user.titulo_atual} color="blue" />}
              {user?.perfil === 'admin' && <Badge label="Admin" color="green" />}
            </div>
            
            {/* Info adicional */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
              {idade && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {idade} anos
                </span>
              )}
              {user?.peso_kg && (
                <span className="flex items-center gap-1">
                  <Scale className="w-4 h-4" /> {user.peso_kg}kg
                </span>
              )}
              {user?.altura_cm && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" /> {user.altura_cm}cm
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Redes Sociais */}
      {(user?.instagram || user?.tiktok || user?.twitter || user?.linkedin) && (
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Redes Sociais</h3>
            <div className="flex flex-wrap gap-3">
              {user?.instagram && (
                <a 
                  href={`https://instagram.com/${user.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-4 h-4" /> {user.instagram}
                </a>
              )}
              {user?.tiktok && (
                <a 
                  href={`https://tiktok.com/${user.tiktok.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
                >
                  <AtSign className="w-4 h-4" /> {user.tiktok}
                </a>
              )}
              {user?.twitter && (
                <a 
                  href={`https://x.com/${user.twitter.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" /> {user.twitter}
                </a>
              )}
              {user?.linkedin && (
                <a 
                  href={`https://linkedin.com/in/${user.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Badges" value={user?.badges_count || 0} color="purple" />
        <StatCard icon={Flame} label="Streaks" value={`${user?.streak || 0}d`} color="orange" />
        <StatCard icon={Target} label="Desafios" value={user?.desafios_count || 0} color="blue" />
        <StatCard icon={Award} label="Total XP" value={user?.xp_total || 0} color="green" />
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Últimas Conquistas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-gray-300 flex items-center gap-2">
                <span className="text-2xl">🥉</span> Iniciante
              </span>
              <span className="text-xs text-gray-500">Há 1 mês</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-gray-300 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Guerreiro
              </span>
              <span className="text-xs text-gray-500">Há 2 semanas</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-gray-300 flex items-center gap-2">
                <span className="text-2xl">👥</span> Social
              </span>
              <span className="text-xs text-gray-500">Há 1 semana</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('editPerfil')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25"
        >
          Editar Perfil
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PerfilPage;