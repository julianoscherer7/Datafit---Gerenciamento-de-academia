import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Card, Button, Badge } from '../components/common';

const mockAmigos = [
  {
    id: 1,
    nome: 'João Silva',
    status: 'Em treino agora',
    streak: 12,
    ultimoExercicio: 'Supino 100kg',
    foto: '👨‍🦱',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    status: 'Completou treino',
    streak: 8,
    ultimoExercicio: 'Agachamento 80kg',
    foto: '👩‍🦰',
  },
];

export const AmigosPage = () => {
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
      <h1 className="text-3xl font-bold text-white">Feed de Amigos</h1>

      <div className="grid grid-cols-1 gap-6">
        {mockAmigos.map((amigo) => (
          <motion.div key={amigo.id} variants={itemVariants}>
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{amigo.foto}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{amigo.nome}</h3>
                    <p className="text-gray-400 text-sm">{amigo.status}</p>
                    <Badge label={`🔥 ${amigo.streak} dias`} color="orange" size="sm" />
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">Último exercício: <strong>{amigo.ultimoExercicio}</strong></p>

              <div className="flex gap-3">
                <Button size="sm" variant="secondary" className="flex-1">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" className="flex-1">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" className="flex-1">
                  Seguir
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
