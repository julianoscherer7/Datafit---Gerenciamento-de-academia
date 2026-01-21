import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiDumbbell, FiTarget, FiUsers, FiAward, FiHistory, FiBarChart3, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';

// ==================== CONTEXT ====================
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

// ==================== COMPONENTS ====================

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

// ==================== LAYOUT COMPONENTS ====================

// Sidebar
const Sidebar = ({ isOpen, onClose, onNavigate }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', page: 'dashboard' },
    { icon: FiDumbbell, label: 'Meus Treinos', page: 'treinos' },
    { icon: FiTarget, label: 'Desafios', page: 'desafios' },
    { icon: FiUsers, label: 'Amigos', page: 'amigos' },
    { icon: FiAward, label: 'Badges', page: 'badges' },
    { icon: FiHistory, label: 'Histórico', page: 'historico' },
    { icon: FiBarChart3, label: 'Analytics', page: 'analytics' },
    { icon: FiSettings, label: 'Configurações', page: 'configs' },
    { icon: FiUser, label: 'Perfil', page: 'perfil' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-600 to-purple-700 text-white z-50 md:relative md:translate-x-0 md:animate-none overflow-y-auto"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
            💪 FITDATA
          </h1>

          {user && (
            <div className="mb-8 p-4 bg-white bg-opacity-10 rounded-lg">
              <div className="font-semibold">{user.nome}</div>
              <div className="text-sm opacity-90">{user.email}</div>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.page}
                whileHover={{ x: 5 }}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-left"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => {
              logout();
              onNavigate('landing');
              onClose();
            }}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500 transition-all text-left"
          >
            <FiLogOut size={20} />
            <span>Sair</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

// Navbar
const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="px-4 py-4 flex justify-between items-center">
        <button onClick={onMenuToggle} className="md:hidden text-gray-700">
          <FiMenu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-blue-600 hidden md:block">💪 FITDATA</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-700 text-sm md:text-base">Olá, {user?.nome || 'Usuário'}</span>
        </div>
      </div>
    </nav>
  );
};

// Protected Layout
const ProtectedLayout = ({ children, onMenuToggle, isMenuOpen }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar isOpen={isMenuOpen} onClose={() => onMenuToggle()} onNavigate={() => {}} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar onMenuToggle={onMenuToggle} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

// ==================== PAGES ====================

// Landing Page
const LandingPage = ({ onNavigate }) => (
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

// Login Page
const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      onNavigate('dashboard');
    } catch (err) {
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" error={error} />
        <Button onClick={handleSubmit} loading={loading} className="w-full mb-4">
          Entrar
        </Button>
        <p className="text-center text-gray-600">
          Não tem conta? <button onClick={() => onNavigate('register')} className="text-blue-500 font-semibold hover:underline">Registre-se</button>
        </p>
      </motion.div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await register(nome, email, senha);
      onNavigate('dashboard');
    } catch (err) {
      setError('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Criar Conta</h2>
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" error={error} />
        <Button onClick={handleSubmit} loading={loading} className="w-full mb-4">
          Registrar
        </Button>
        <p className="text-center text-gray-600">
          Já tem conta? <button onClick={() => onNavigate('login')} className="text-purple-500 font-semibold hover:underline">Faça login</button>
        </p>
      </motion.div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = ({ onNavigate }) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Dashboard</motion.h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-4xl font-bold text-orange-500"><Counter end={dashboardData?.streak_atual || 7} /></div>
            <div className="text-gray-600">Dias de Streak</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🏋️</div>
            <div className="text-4xl font-bold text-blue-500"><Counter end={dashboardData?.ultimos_treinos?.length || 24} /></div>
            <div className="text-gray-600">Treinos Completos</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-2">🏅</div>
            <div className="text-4xl font-bold text-yellow-500"><Counter end={dashboardData?.badges_recentes?.length || 12} /></div>
            <div className="text-gray-600">Badges Ganhas</div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-2xl font-bold mb-4">Últimos Treinos</h3>
          <div className="space-y-2">
            {dashboardData?.ultimos_treinos?.map((treino, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">{treino.treino_id}</div>
                <div className="text-sm text-gray-600">{treino.data}</div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-2xl font-bold mb-4">Badges Recentes</h3>
          <div className="grid grid-cols-3 gap-4">
            {dashboardData?.badges_recentes?.slice(0, 6).map((badge, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }} whileHover={{ scale: 1.1 }} className="text-center cursor-pointer">
                <div className="text-4xl mb-1">🏆</div>
                <div className="text-xs text-gray-600">{badge.nome}</div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Treinos Page
const TreinosPage = () => {
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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Meus Treinos</motion.h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treinos.map((treino, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
            <Card>
              <h3 className="text-xl font-bold mb-2">Treino #{treino.id}</h3>
              <p className="text-gray-600 mb-4">{treino.ativo ? '✅ Ativo' : '❌ Inativo'}</p>
              <Button className="w-full" onClick={() => setSelectedTreino(treino)}>Iniciar</Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTreino && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Treino #{selectedTreino.id}</h3>
              <button onClick={() => setSelectedTreino(null)} className="text-2xl">✕</button>
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
};

// Desafios Page
const DesafiosPage = () => {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesafios();
  }, []);

  const fetchDesafios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/desafios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDesafios(data);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Desafios</motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {desafios.map((desafio, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <h3 className="text-2xl font-bold mb-2">{desafio.titulo}</h3>
              <p className="text-gray-600 mb-2">{desafio.descricao}</p>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Progresso: 45 / {desafio.alvo_valor}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1 }} className="bg-blue-500 h-2 rounded-full" />
                </div>
              </div>
              <Button className="w-full">Participar</Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Amigos Page
const AmigosPage = () => {
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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Amigos</motion.h2>

      <div className="flex gap-4 mb-8">
        {['amigos', 'pendentes'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
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
                  <Button className="flex-1" variant="secondary">Rejeitar</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Badges Page
const BadgesPage = () => {
  const { user } = useAuth();
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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Minhas Badges</motion.h2>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }} whileHover={{ scale: 1.1 }}>
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
};

// Historico Page
const HistoricoPage = () => {
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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Histórico de Treinos</motion.h2>

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
                <motion.tr key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t hover:bg-gray-50">
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
};

// Analytics Page
const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/analytics/${user?.id}`, {
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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Analytics</motion.h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500"><Counter end={Math.floor(analytics?.volume_total || 0)} /></div>
            <div className="text-gray-600">Volume Total (kg)</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500"><Counter end={analytics?.frequencia_semanal || 0} /></div>
            <div className="text-gray-600">Dias/Semana</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500"><Counter end={analytics?.exercicios_favoritos?.length || 0} /></div>
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
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1 }} className="bg-blue-500 h-2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Configs Page
const ConfigsPage = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/configs', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha_atual: senhaAtual, senha_nova: senhaNova })
      });
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Configurações</motion.h2>

      <div className="max-w-2xl">
        <Card>
          <h3 className="text-2xl font-bold mb-6">Editar Perfil</h3>
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Button className="w-full" loading={loading} onClick={handleSave}>Salvar Mudanças</Button>
        </Card>

        <Card className="mt-6">
          <h3 className="text-2xl font-bold mb-6">Mudar Senha</h3>
          <Input label="Senha Atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
          <Input label="Nova Senha" type="password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} />
          <Button className="w-full" loading={loading} onClick={handleSave}>Atualizar Senha</Button>
        </Card>
      </div>
    </div>
  );
};

// Perfil Page
const PerfilPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">Meu Perfil</motion.h2>

      <Card>
        <div className="text-center">
          <div className="text-8xl mb-4">👤</div>
          <h3 className="text-3xl font-bold mb-2">{user?.nome}</h3>
          <p className="text-gray-600 mb-6">{user?.email}</p>
          <div className="text-sm text-gray-600">Perfil: <span className="font-semibold">{user?.perfil}</span></div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">7</div>
            <div className="text-gray-600">Dias de Streak</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">24</div>
            <div className="text-gray-600">Treinos Completos</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500">12</div>
            <div className="text-gray-600">Badges</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== AUTH PROVIDER ====================
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    if (!res.ok) throw new Error('Login falhou');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    await fetchUser();
  };

  const register = async (nome, email, senha) => {
    const res = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    if (!res.ok) throw new Error('Registro falhou');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    await fetchUser();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== MAIN APP ====================
export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const isProtected = ['dashboard', 'treinos', 'desafios', 'amigos', 'badges', 'historico', 'analytics', 'configs', 'perfil'].includes(currentPage);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {!token && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
            {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
            {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
          </motion.div>
        )}

        {token && isProtected && (
          <motion.div key="protected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProtectedLayout isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}>
              {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
              {currentPage === 'treinos' && <TreinosPage />}
              {currentPage === 'desafios' && <DesafiosPage />}
              {currentPage === 'amigos' && <AmigosPage />}
              {currentPage === 'badges' && <BadgesPage />}
              {currentPage === 'historico' && <HistoricoPage />}
              {currentPage === 'analytics' && <AnalyticsPage />}
              {currentPage === 'configs' && <ConfigsPage />}
              {currentPage === 'perfil' && <PerfilPage />}
            </ProtectedLayout>
          </motion.div>
        )}

        {!token && !['landing', 'login', 'register'].includes(currentPage) && (
          <motion.div key="redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LandingPage onNavigate={setCurrentPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}
