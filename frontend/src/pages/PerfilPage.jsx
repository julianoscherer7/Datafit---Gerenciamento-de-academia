import React from 'react';
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

const useAuth = () => {
  const context = React.useContext(React.createContext());
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export default function PerfilPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">
        Meu Perfil
      </motion.h2>

      <Card>
        <div className="text-center">
          <div className="text-8xl mb-4">👤</div>
          <h3 className="text-3xl font-bold mb-2">{user?.nome}</h3>
          <p className="text-gray-600 mb-6">{user?.email}</p>
          <div className="text-sm text-gray-600">
            Perfil: <span className="font-semibold">{user?.perfil}</span>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">
              <Counter end={7} />
            </div>
            <div className="text-gray-600">Dias de Streak</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">
              <Counter end={24} />
            </div>
            <div className="text-gray-600">Treinos Completos</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500">
              <Counter end={12} />
            </div>
            <div className="text-gray-600">Badges</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
