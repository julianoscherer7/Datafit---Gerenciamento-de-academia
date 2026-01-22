import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { Card, Button, Badge } from '../components/common';

const mockBadges = [
  { id: 1, nome: 'Iniciante', descricao: 'Primeiro treino', icon: '🥉', obtido: true },
  { id: 2, nome: 'Guerreiro', descricao: '7 dias de streak', icon: '🔥', obtido: true },
  { id: 3, nome: 'Campeão', descricao: '30 dias de streak', icon: '👑', obtido: false },
  { id: 4, nome: 'Super Saiajin', descricao: 'Nível 50', icon: '⚡', obtido: false },
];

export const BadgesPage = () => {
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
      <h1 className="text-3xl font-bold text-white">Minhas Badges</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockBadges.map((badge) => (
          <motion.div key={badge.id} variants={itemVariants}>
            <Card hover={badge.obtido}>
              <div className="text-center">
                <div className={`text-5xl mb-3 ${!badge.obtido && 'opacity-30'}`}>
                  {badge.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{badge.nome}</h4>
                <p className="text-xs text-gray-400 mt-1">{badge.descricao}</p>
                {!badge.obtido && (
                  <Badge label="🔒 Bloqueado" color="blue" size="sm" className="mt-3" />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
