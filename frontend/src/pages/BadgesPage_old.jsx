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

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/badges/meus', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
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
        Minhas Badges
      </motion.h2>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
          >
            <Card className="text-center cursor-pointer">
              <div className="text-6xl mb-2">🏆</div>
              <h3 className="font-bold mb-1">{badge.nome}</h3>
              <p className="text-xs text-gray-600">{badge.descricao}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
