import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Users, Flame } from 'lucide-react';
import { Card, Button, Badge } from '../components/common';
import { ProgressBar } from '../components/common';

const mockDesafios = [
  {
    id: 1,
    nome: '30 Dias Consecutivos',
    descricao: 'Treine por 30 dias seguidos',
    progresso: 15,
    total: 30,
    recompensa: 5000,
    participantes: 234,
    dificuldade: 'Difícil',
  },
  {
    id: 2,
    nome: 'Mega Queimador',
    descricao: 'Queime 10.000 calorias em uma semana',
    progresso: 6500,
    total: 10000,
    recompensa: 2000,
    participantes: 456,
    dificuldade: 'Média',
  },
];

export const DesafiosPage = () => {
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
      <h1 className="text-3xl font-bold text-white">Desafios Disponíveis</h1>

      <div className="grid grid-cols-1 gap-6">
        {mockDesafios.map((desafio) => (
          <motion.div key={desafio.id} variants={itemVariants}>
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{desafio.nome}</h3>
                  <p className="text-gray-400 text-sm mb-3">{desafio.descricao}</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge 
                      icon={Trophy} 
                      label={`+${desafio.recompensa} XP`}
                      color="purple"
                    />
                    <Badge 
                      icon={Users} 
                      label={`${desafio.participantes} participantes`}
                      color="blue"
                    />
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ml-4 ${
                  desafio.dificuldade === 'Difícil' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {desafio.dificuldade}
                </span>
              </div>

              <ProgressBar 
                value={desafio.progresso} 
                max={desafio.total}
                color="purple"
              />

              <Button className="w-full mt-4">Participar</Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
