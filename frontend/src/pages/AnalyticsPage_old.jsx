import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE from '../config';

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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/analytics/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
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
        Analytics
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">
              <Counter end={Math.floor(analytics?.volume_total || 0)} />
            </div>
            <div className="text-gray-600">Volume Total (kg)</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">
              <Counter end={analytics?.frequencia_semanal || 0} />
            </div>
            <div className="text-gray-600">Dias/Semana</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500">
              <Counter end={analytics?.exercicios_favoritos?.length || 0} />
            </div>
            <div className="text-gray-600">Exercícios</div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-2xl font-bold mb-4">Distribuição Muscular</h3>
        <div className="space-y-4">
          {Object.entries(analytics?.distribuicao_muscular || {}).map(([grupo, volume], i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold">{grupo}</span>
                <span className="text-gray-600">{Math.floor(volume)}kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
