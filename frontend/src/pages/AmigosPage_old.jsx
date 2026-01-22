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

export default function AmigosPage() {
  const [activeTab, setActiveTab] = useState('amigos');
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmigos();
  }, [activeTab]);

  const fetchAmigos = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'amigos' ? '/amigos' : '/amigos/pendentes';
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAmigos(Array.isArray(data) ? data : []);
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
        Amigos
      </motion.h2>

      <div className="flex gap-4 mb-8">
        {['amigos', 'pendentes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {tab === 'amigos' ? 'Meus Amigos' : 'Solicitações'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amigos.map((amigo, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <div className="text-center">
                <div className="text-5xl mb-2">👤</div>
                <h3 className="text-xl font-bold mb-1">{amigo.nome || 'Usuário'}</h3>
                <p className="text-gray-600 text-sm mb-4">{amigo.email}</p>
                <div className="flex gap-2">
                  <Button className="flex-1">Aceitar</Button>
                  <Button className="flex-1" variant="secondary">
                    Rejeitar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
