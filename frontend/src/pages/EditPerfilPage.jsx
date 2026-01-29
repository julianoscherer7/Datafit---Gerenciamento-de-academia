import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Save, User, Calendar, Scale, Ruler, 
  Instagram, Twitter, Linkedin, AtSign, ArrowLeft, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Input Field Component - DEFINIDO FORA para evitar re-render
const InputField = ({ 
  label, 
  icon: Icon, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  darkMode,
  ...props 
}) => {
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBg = darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300';
  const inputText = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${textSecondary}`}>{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className={`w-5 h-5 ${textSecondary}`} />
          </div>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border ${inputBg} ${inputText} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          {...props}
        />
      </div>
    </div>
  );
};

export const EditPerfilPage = ({ onNavigate }) => {
  const { user, login } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    bio: '',
    data_nascimento: '',
    peso_kg: '',
    altura_cm: '',
    genero: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    foto_base64: ''
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        bio: user.bio || '',
        data_nascimento: user.data_nascimento || '',
        peso_kg: user.peso_kg || '',
        altura_cm: user.altura_cm || '',
        genero: user.genero || '',
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        foto_base64: user.foto_base64 || ''
      });
    }
  }, [user]);

  // Usando useCallback para evitar re-criação da função
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto_base64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Preparar dados (converter strings vazias para null)
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== '' && value !== null) {
          if (key === 'peso_kg' || key === 'altura_cm') {
            dataToSend[key] = parseFloat(value) || null;
          } else {
            dataToSend[key] = value;
          }
        }
      });

      console.log('Enviando dados:', dataToSend);
      const response = await api.put('/auth/me', dataToSend);
      console.log('Resposta:', response.data);
      
      setSuccess(true);
      
      // Recarregar dados do usuário
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError(err.response?.data?.detail || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Estilos baseados no tema
  const bgMain = darkMode ? 'bg-slate-900' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBg = darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300';
  const inputText = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgMain} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('perfil')}
            className={`p-3 rounded-xl ${cardBg} shadow-lg`}
          >
            <ArrowLeft className={`w-5 h-5 ${textPrimary}`} />
          </motion.button>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Editar Perfil</h1>
            <p className={textSecondary}>Personalize suas informações</p>
          </div>
        </motion.div>

        {/* Foto de Perfil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${cardBg} rounded-2xl p-8 mb-6 shadow-lg`}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {formData.foto_base64 ? (
                  <img 
                    src={formData.foto_base64} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-purple-500 rounded-full cursor-pointer hover:bg-purple-600 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="hidden" 
                />
              </label>
            </div>
            <p className={`text-sm ${textSecondary}`}>Clique no ícone para trocar a foto</p>
          </div>
        </motion.div>

        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${cardBg} rounded-2xl p-6 mb-6 shadow-lg`}
        >
          <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>Informações Básicas</h2>
          <div className="space-y-4">
            <InputField 
              label="Nome" 
              icon={User} 
              value={formData.nome}
              onChange={handleChange('nome')}
              placeholder="Seu nome completo"
              darkMode={darkMode}
            />
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${textSecondary}`}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Conte um pouco sobre você..."
                rows={3}
                maxLength={200}
                className={`w-full px-4 py-3 rounded-xl border ${inputBg} ${inputText} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
              />
              <p className={`text-xs ${textSecondary} text-right`}>{formData.bio.length}/200</p>
            </div>

            <InputField 
              label="Data de Nascimento" 
              icon={Calendar} 
              type="date" 
              value={formData.data_nascimento}
              onChange={handleChange('data_nascimento')}
              darkMode={darkMode}
            />

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${textSecondary}`}>Gênero</label>
              <select
                value={formData.genero}
                onChange={handleChange('genero')}
                className={`w-full px-4 py-3 rounded-xl border ${inputBg} ${inputText} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              >
                <option value="">Prefiro não informar</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Medidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${cardBg} rounded-2xl p-6 mb-6 shadow-lg`}
        >
          <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>Medidas Corporais</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Peso (kg)" 
              icon={Scale} 
              type="number" 
              value={formData.peso_kg}
              onChange={handleChange('peso_kg')}
              placeholder="75.5"
              step="0.1"
              min="0"
              max="500"
              darkMode={darkMode}
            />
            <InputField 
              label="Altura (cm)" 
              icon={Ruler} 
              type="number" 
              value={formData.altura_cm}
              onChange={handleChange('altura_cm')}
              placeholder="178"
              step="0.1"
              min="0"
              max="300"
              darkMode={darkMode}
            />
          </div>
        </motion.div>

        {/* Redes Sociais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${cardBg} rounded-2xl p-6 mb-6 shadow-lg`}
        >
          <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>Redes Sociais</h2>
          <div className="space-y-4">
            <InputField 
              label="Instagram" 
              icon={Instagram} 
              value={formData.instagram}
              onChange={handleChange('instagram')}
              placeholder="@seuusuario"
              darkMode={darkMode}
            />
            <InputField 
              label="TikTok" 
              icon={AtSign} 
              value={formData.tiktok}
              onChange={handleChange('tiktok')}
              placeholder="@seuusuario"
              darkMode={darkMode}
            />
            <InputField 
              label="X (Twitter)" 
              icon={Twitter} 
              value={formData.twitter}
              onChange={handleChange('twitter')}
              placeholder="@seuusuario"
              darkMode={darkMode}
            />
            <InputField 
              label="LinkedIn" 
              icon={Linkedin} 
              value={formData.linkedin}
              onChange={handleChange('linkedin')}
              placeholder="seu-perfil"
              darkMode={darkMode}
            />
          </div>
        </motion.div>

        {/* Mensagens de feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Perfil salvo com sucesso!
          </motion.div>
        )}

        {/* Botão Salvar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Alterações
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default EditPerfilPage;
