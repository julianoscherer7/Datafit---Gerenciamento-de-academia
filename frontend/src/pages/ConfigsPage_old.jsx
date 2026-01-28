import React, { useState } from 'react';
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

const useAuth = () => {
  const context = React.useContext(React.createContext());
  if (!context) {
    return { user: null, token: null, loading: false, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export default function ConfigsPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/configs`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          senha_atual: senhaAtual,
          senha_nova: senhaNova
        })
      });
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold mb-8">
        Configurações
      </motion.h2>

      <div className="max-w-2xl">
        <Card>
          <h3 className="text-2xl font-bold mb-6">Editar Perfil</h3>
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Button className="w-full" loading={loading} onClick={handleSave}>
            Salvar Mudanças
          </Button>
        </Card>

        <Card className="mt-6">
          <h3 className="text-2xl font-bold mb-6">Mudar Senha</h3>
          <Input
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          <Input
            label="Nova Senha"
            type="password"
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
          />
          <Button className="w-full" loading={loading} onClick={handleSave}>
            Atualizar Senha
          </Button>
        </Card>
      </div>
    </div>
  );
}
