import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Dumbbell } from 'lucide-react';
import { Card, Button } from '../components/common';

const mockHistorico = [
  {
    id: 1,
    data: '2024-01-15',
    treino: 'Peito e Tríceps',
    duracao: 60,
    exercicios: 6,
    calorias: 450,
  },
  {
    id: 2,
    data: '2024-01-14',
    treino: 'Costas e Bíceps',
    duracao: 50,
    exercicios: 5,
    calorias: 380,
  },
];

export const HistoricoPage = () => {
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
      <h1 className="text-3xl font-bold text-white">Histórico de Treinos</h1>

      <div className="space-y-4">
        {mockHistorico.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Card hover>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{item.treino}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.duracao} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {item.exercicios} exercícios
                    </div>
                    <span className="text-orange-400">🔥 {item.calorias} kcal</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary">Visualizar</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
