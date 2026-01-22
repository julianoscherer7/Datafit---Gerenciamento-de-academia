import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Clock, Flame } from 'lucide-react';
import { Card, Button, Modal } from '../components/common';
import { ProgressBar } from '../components/common';

const mockTreinos = [
  {
    id: 1,
    nome: 'Peito e Tríceps',
    duracao: 60,
    exercicios: 6,
    calorias: 450,
    intensidade: 'Alta',
    concluido: 3,
    total: 6,
  },
  {
    id: 2,
    nome: 'Costas e Bíceps',
    duracao: 50,
    exercicios: 5,
    calorias: 380,
    intensidade: 'Média',
    concluido: 2,
    total: 5,
  },
];

export const TreinosPage = () => {
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Meus Treinos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" /> Novo Treino
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockTreinos.map((treino) => (
          <motion.div key={treino.id} variants={itemVariants}>
            <Card
              className="cursor-pointer"
              onClick={() => setSelectedTreino(treino)}
              hover
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{treino.nome}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {treino.duracao} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {treino.exercicios} exercícios
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {treino.calorias} kcal
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  treino.intensidade === 'Alta' ? 'bg-red-500/20 text-red-300' :
                  treino.intensidade === 'Média' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {treino.intensidade}
                </span>
              </div>

              <ProgressBar 
                value={treino.concluido} 
                max={treino.total}
                label={`Progresso ${treino.concluido}/${treino.total}`}
                showValue={false}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Treino"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do treino"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <input
            type="number"
            placeholder="Duração (minutos)"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <Button>Criar Treino</Button>
        </div>
      </Modal>
    </motion.div>
  );
};
