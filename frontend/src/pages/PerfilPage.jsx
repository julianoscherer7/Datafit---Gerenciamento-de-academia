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
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Foto */}
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-4 border-white/30">
              {user?.foto_base64 ? (
                <img src={user.foto_base64} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{user?.nome}</h1>
              <p className="text-purple-200 mb-3">{user?.email}</p>
              
              {user?.bio && (
                <p className="text-white/80 text-sm mb-3 max-w-md">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge label="Nível 12" color="purple" />
                <Badge label="🔥 7 dias de streak" color="orange" />
                {user?.perfil === 'admin' && <Badge label="Admin" color="blue" />}
              </div>
              
              {/* Info adicional */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-purple-200">
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
            
            {/* Botão Editar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('edit-perfil')}
              className="absolute top-4 right-4 md:relative md:top-auto md:right-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">Editar</span>
            </motion.button>
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
        <StatCard icon={Trophy} label="Badges" value="12" color="purple" />
        <StatCard icon={Flame} label="Streaks" value="7d" color="orange" />
        <StatCard icon={Target} label="Desafios" value="5" color="blue" />
        <StatCard icon={Award} label="Total XP" value="45k" color="green" />
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
          onClick={() => onNavigate('edit-perfil')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25"
        >
          Editar Perfil
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
        >
          Download Dados
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PerfilPage;