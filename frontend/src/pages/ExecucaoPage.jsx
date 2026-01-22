import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target } from 'lucide-react';
import { Card, Button } from '../components/common';
import { ProgressBar } from '../components/common';

export const ExecucaoPage = () => {
  const [exercises] = useState([
    { id: 1, nome: 'Supino', series: 4, reps: 8, peso: '100kg', completado: true },
    { id: 2, nome: 'Desenvolvimento', series: 3, reps: 10, peso: '80kg', completado: true },
    { id: 3, nome: 'Voador', series: 3, reps: 12, peso: '60kg', completado: false },
  ]);

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

  const progresso = exercises.filter(e => e.completado).length / exercises.length * 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-white">Treino em Progresso</h1>

      {/* Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Peito e Tríceps</h3>
            <ProgressBar value={progresso} max={100} color="purple" label={`${Math.round(progresso)}% completo`} showValue={false} />
          </div>

          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-orange-400">45:30</div>
              <div className="text-xs text-gray-400">Tempo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">450</div>
              <div className="text-xs text-gray-400">Calorias</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{exercises.filter(e => e.completado).length}/{exercises.length}</div>
              <div className="text-xs text-gray-400">Exercícios</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Exercícios */}
      <motion.div variants={itemVariants} className="space-y-3">
        {exercises.map((exercise) => (
          <Card key={exercise.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  {exercise.completado ? '✅' : '⭕'} {exercise.nome}
                </h4>
                <p className="text-sm text-gray-400">
                  {exercise.series}x{exercise.reps} - {exercise.peso}
                </p>
              </div>
              <Button size="sm" variant={exercise.completado ? 'secondary' : 'primary'}>
                {exercise.completado ? 'Feito' : 'Fazer'}
              </Button>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Ações */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <Button className="flex-1">Finalizar Treino</Button>
        <Button variant="secondary" className="flex-1">Pausar</Button>
      </motion.div>
    </motion.div>
  );
};
