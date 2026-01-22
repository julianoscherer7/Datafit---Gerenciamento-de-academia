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

const useAuth = () => {
  const context = React.useContext(React.createContext());
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export default function HistoricoPage() {
  const { user } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/historico/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistorico(data);
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
        Histórico de Treinos
      </motion.h2>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Exercício</th>
                <th className="px-4 py-2 text-left font-semibold">Série</th>
                <th className="px-4 py-2 text-left font-semibold">Reps</th>
                <th className="px-4 py-2 text-left font-semibold">Carga</th>
                <th className="px-4 py-2 text-left font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item, i) => (
                <motion.tr
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{item.exercicio_nome}</td>
                  <td className="px-4 py-3">{item.serie}</td>
                  <td className="px-4 py-3">{item.repeticoes}</td>
                  <td className="px-4 py-3">{item.carga_kg}kg</td>
                  <td className="px-4 py-3">{item.data}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
