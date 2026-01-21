import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Card Component
const Card = ({ children, className = '', hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}}
    className={`bg-white rounded-xl p-6 shadow-md transition-all ${className}`}
  >
    {children}
  </motion.div>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', loading, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={loading}
    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
      variant === 'primary' 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg' 
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Carregando...
      </div>
    ) : children}
  </motion.button>
);

// Input Component
const Input = ({ label, error, value, onChange, type = 'text', ...props }) => (
  <div className="mb-4">
    {label && (
      <motion.label
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </motion.label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm mt-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

export default function TreinosPage() {
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreino, setSelectedTreino] = useState(null);

  useEffect(() => {
    fetchTreinos();
  }, []);

  const fetchTreinos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/treinos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTreinos(data);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">
        Meus Treinos
      </motion.h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treinos.map((treino, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card>
              <h3 className="text-xl font-bold mb-2">Treino #{treino.id}</h3>
              <p className="text-gray-600 mb-4">{treino.ativo ? '✅ Ativo' : '❌ Inativo'}</p>
              <Button className="w-full" onClick={() => setSelectedTreino(treino)}>
                Iniciar
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTreino && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Treino #{selectedTreino.id}</h3>
              <button onClick={() => setSelectedTreino(null)} className="text-2xl">
                ✕
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-2">Exercício 1: Supino</div>
                <Input label="Séries" type="number" placeholder="4" />
                <Input label="Repetições" type="number" placeholder="10" />
                <Input label="Carga (kg)" type="number" placeholder="60" />
              </div>
            </div>
            <Button className="w-full">Registrar Treino</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
