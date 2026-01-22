import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Award } from 'lucide-react';
import { Card, Button, StatCard, Badge } from '../components/common';
import { useAuth } from '../context/AuthContext';

export const PerfilPage = () => {
  const { user } = useAuth();

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
      >
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-4xl font-bold mb-2">{user?.nome}</h1>
        <p className="text-purple-100 mb-4">{user?.email}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge label="Nível 12" color="purple" />
          <Badge label="🔥 7 dias de streak" color="orange" />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="flex items-center justify-between">
              <span className="text-gray-300">🥉 Iniciante</span>
              <span className="text-xs text-gray-500">Há 1 mês</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">🔥 Guerreiro</span>
              <span className="text-xs text-gray-500">Há 2 semanas</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
        <Button>Editar Perfil</Button>
        <Button variant="secondary">Download Dados</Button>
      </motion.div>
    </motion.div>
  );
};
