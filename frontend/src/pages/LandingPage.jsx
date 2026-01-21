import React from 'react';
import { motion } from 'framer-motion';

// Counter Animation
const Counter = ({ end, duration = 2 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
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

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-20"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-white mb-16"
        >
          <h1 className="text-6xl font-bold mb-4">💪 FITDATA</h1>
          <p className="text-2xl opacity-90">Transforme seus treinos em conquistas</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {[
            { icon: '📊', title: 'Analytics', desc: 'Acompanhe seu progresso com gráficos detalhados' },
            { icon: '🏆', title: 'Desafios', desc: 'Participe de desafios e ganhe badges' },
            { icon: '👥', title: 'Social', desc: 'Conecte-se com amigos e compartilhe conquistas' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 text-center text-white"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="opacity-90">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 justify-center"
        >
          <Button onClick={() => onNavigate('login')} className="text-lg">
            Entrar
          </Button>
          <Button onClick={() => onNavigate('register')} variant="secondary" className="text-lg">
            Criar Conta
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-20 text-center text-white"
        >
          <div className="flex justify-center gap-16 flex-wrap">
            <div>
              <div className="text-4xl font-bold">
                <Counter end={1000} />+
              </div>
              <div className="opacity-90">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                <Counter end={50000} />+
              </div>
              <div className="opacity-90">Treinos Realizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                <Counter end={500} />+
              </div>
              <div className="opacity-90">Desafios Completados</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
