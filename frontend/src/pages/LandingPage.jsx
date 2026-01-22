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

export const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-white mb-12"
        >
          <h1 className="text-7xl font-bold mb-4">💪 FITDATA</h1>
          <p className="text-2xl opacity-90">Transforme seus treinos em conquistas</p>
        </motion.div>

        {/* Auth Boxes - Instagram Style */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-16 justify-center"
        >
          {/* Login Box */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}
            className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8 w-full cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => onNavigate('login')}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Entrar</h2>
              <p className="text-gray-600 mb-6">Acesse sua conta e continue seus treinos</p>
              <Button onClick={(e) => { e.stopPropagation(); onNavigate('login'); }} className="w-full">
                Entrar agora
              </Button>
            </div>
          </motion.div>

          {/* Register Box */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}
            className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8 w-full cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => onNavigate('register')}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Criar Conta</h2>
              <p className="text-gray-600 mb-6">Comece sua jornada fitness agora mesmo</p>
              <Button onClick={(e) => { e.stopPropagation(); onNavigate('register'); }} className="w-full">
                Registre-se
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features - Smaller and Below */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: '📊', title: 'Analytics', desc: 'Acompanhe seu progresso' },
            { icon: '🏆', title: 'Desafios', desc: 'Ganhe badges e prêmios' },
            { icon: '👥', title: 'Social', desc: 'Conecte-se com amigos' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 text-center text-white"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-sm opacity-90">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white"
        >
          <div className="flex justify-center gap-8 flex-wrap">
            <div>
              <div className="text-3xl font-bold">
                <Counter end={1000} />+
              </div>
              <div className="text-sm opacity-90">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                <Counter end={50000} />+
              </div>
              <div className="text-sm opacity-90">Treinos Realizados</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                <Counter end={500} />+
              </div>
              <div className="text-sm opacity-90">Desafios Completados</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
