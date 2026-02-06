import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Dumbbell, CheckCircle, AtSign, Shield, GraduationCap, Link } from 'lucide-react';

// Password validation helper
const validatePassword = (password) => {
  const checks = {
    length: password.length >= 6,
    number: /\d/.test(password),
  };
  return checks;
};

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Role & Coach fields
  const [perfil, setPerfil] = useState('aluno');
  const [cref, setCref] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [coachBio, setCoachBio] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  const passwordChecks = validatePassword(senha);

  const validateForm = () => {
    const newErrors = {};
    
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!nickname.trim()) newErrors.nickname = 'Nickname é obrigatório';
    else if (nickname.length < 3) newErrors.nickname = 'Mínimo 3 caracteres';
    else if (!/^[a-zA-Z0-9_]+$/.test(nickname)) newErrors.nickname = 'Apenas letras, números e _';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    
    if (!passwordChecks.length) newErrors.senha = 'Mínimo 6 caracteres';
    else if (!passwordChecks.number) newErrors.senha = 'Deve conter um número';
    
    if (senha !== confirmaSenha) {
      newErrors.confirmaSenha = 'Senhas não coincidem';
    }
    
    if (perfil === 'instrutor') {
      if (!cref.trim()) newErrors.cref = 'CREF é obrigatório para instrutores';
      if (!especialidade.trim()) newErrors.especialidade = 'Especialidade é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const coachData = perfil === 'instrutor' ? { cref, especialidade, coach_bio: coachBio } : null;
      await register(nome, email, senha, nickname, perfil, coachData);
      if (perfil === 'instrutor') {
        setError('');
        // Coach registration leads to dashboard, but they'll see pending status
      }
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/25">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Criar Conta
            </h1>
            <p className="text-slate-400 mt-2">Junte-se à comunidade FITDATA</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-xl"
          >
            <div onKeyPress={handleKeyPress}>
              {/* Nome Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => { setNome(e.target.value); setErrors(prev => ({...prev, nome: null})); }}
                    placeholder="Seu nome completo"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.nome ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                {errors.nome && <p className="text-red-400 text-sm mt-1">{errors.nome}</p>}
              </div>
              
              {/* Nickname Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Nickname</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setErrors(prev => ({...prev, nickname: null})); }}
                    placeholder="seu_nickname"
                    maxLength={20}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.nickname ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Apenas letras, números e _ (3-20 caracteres)</p>
                {errors.nickname && <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>}
              </div>

              {/* Role Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Eu sou</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPerfil('aluno')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      perfil === 'aluno'
                        ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium text-sm">Aluno</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerfil('instrutor')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      perfil === 'instrutor'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium text-sm">Instrutor</span>
                  </button>
                </div>
              </div>

              {/* Coach Fields (visible when instrutor) */}
              <AnimatePresence>
                {perfil === 'instrutor' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-4 mb-4"
                  >
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Contas de instrutor precisam de aprovação do administrador após o cadastro.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">CREF *</label>
                      <input
                        type="text"
                        value={cref}
                        onChange={(e) => setCref(e.target.value)}
                        placeholder="Ex: 012345-G/SP"
                        className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 ${errors.cref ? 'border-red-500' : 'border-slate-600'}`}
                      />
                      {errors.cref && <p className="text-red-400 text-sm mt-1">{errors.cref}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Especialidade *</label>
                      <input
                        type="text"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                        placeholder="Ex: Musculação, Funcional, Crossfit"
                        className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 ${errors.especialidade ? 'border-red-500' : 'border-slate-600'}`}
                      />
                      {errors.especialidade && <p className="text-red-400 text-sm mt-1">{errors.especialidade}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Bio (opcional)</label>
                      <textarea
                        value={coachBio}
                        onChange={(e) => setCoachBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invite Token (visible for aluno) */}
              <AnimatePresence>
                {perfil === 'aluno' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      <Link className="w-4 h-4 inline mr-1" />Token do Coach (opcional)
                    </label>
                    <input
                      type="text"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="Cole o token do seu instrutor"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                    />
                    <p className="text-slate-500 text-xs mt-1">Se seu instrutor te deu um token, cole aqui para se conectar automaticamente</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: null})); }}
                    placeholder="seu@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              {/* Password Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setErrors(prev => ({...prev, senha: null})); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.senha ? 'border-red-500' : 'border-slate-600'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Requirements */}
                <div className="mt-2 flex gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle className="w-3 h-3" /> 6+ caracteres
                  </span>
                  <span className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle className="w-3 h-3" /> 1 número
                  </span>
                </div>
                {errors.senha && <p className="text-red-400 text-sm mt-1">{errors.senha}</p>}
              </div>

              {/* Confirm Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmaSenha}
                    onChange={(e) => { setConfirmaSenha(e.target.value); setErrors(prev => ({...prev, confirmaSenha: null})); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.confirmaSenha ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                {errors.confirmaSenha && <p className="text-red-400 text-sm mt-1">{errors.confirmaSenha}</p>}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}
              
              {/* Register Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : perfil === 'instrutor' ? 'Criar Conta de Instrutor' : 'Criar Conta'}
              </motion.button>
            </div>

            {/* Login Link */}
            <p className="text-center text-slate-400 mt-6">
              Já tem conta?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-pink-400 font-semibold hover:text-pink-300 transition-colors"
              >
                Faça login
              </button>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default RegisterPage;
