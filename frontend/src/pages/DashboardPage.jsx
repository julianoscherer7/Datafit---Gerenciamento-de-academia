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

// Counter Animation
const Counter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

const useAuth = () => {
  const context = React.useContext(React.createContext());
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-8"
      >
        Dashboard
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-4xl font-bold text-orange-500">
              <Counter end={dashboardData?.streak_atual || 7} />
            </div>
            <div className="text-gray-600">Dias de Streak</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🏋️</div>
            <div className="text-4xl font-bold text-blue-500">
              <Counter end={dashboardData?.ultimos_treinos?.length || 24} />
            </div>
            <div className="text-gray-600">Treinos Completos</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🏅</div>
            <div className="text-4xl font-bold text-yellow-500">
              <Counter end={dashboardData?.badges_recentes?.length || 12} />
            </div>
            <div className="text-gray-600">Badges Ganhas</div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-2xl font-bold mb-4">Últimos Treinos</h3>
          {dashboardData?.ultimos_treinos?.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.ultimos_treinos.map((treino, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-semibold">Treino #{treino.treino_id}</div>
                  <div className="text-sm text-gray-600">{treino.data}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {['Treino A - Peito e Tríceps', 'Treino B - Costas e Bíceps', 'Treino C - Pernas'].map((nome, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-semibold">{nome}</div>
                  <div className="text-sm text-gray-600">Ontem</div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-2xl font-bold mb-4">Badges Recentes</h3>
          {dashboardData?.badges_recentes?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {dashboardData.badges_recentes.slice(0, 6).map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center cursor-pointer"
                >
                  <div className="text-4xl mb-1">🏆</div>
                  <div className="text-xs text-gray-600">{badge.nome}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[
                { icone: '🏆', nome: 'Primeiro Treino' },
                { icone: '💯', nome: '100 Séries' },
                { icone: '🔥', nome: 'Streak 7 Dias' },
                { icone: '💪', nome: 'Força Total' },
                { icone: '⭐', nome: 'Dedicação' },
                { icone: '🎯', nome: 'Foco' }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center cursor-pointer"
                >
                  <div className="text-4xl mb-1">{badge.icone}</div>
                  <div className="text-xs text-gray-600">{badge.nome}</div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
