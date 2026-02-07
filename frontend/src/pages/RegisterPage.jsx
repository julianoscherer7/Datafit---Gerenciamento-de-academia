import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Dumbbell, CheckCircle, AtSign, Shield, GraduationCap, ChevronRight } from 'lucide-react';

const validatePassword = (password) => ({
  length: password.length >= 6,
  number: /\d/.test(password),
});

// Componente InputField extraído para evitar re-criação em cada render
const InputField = ({ label, icon: Icon, error: err, children }) => (
  <div>
    <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
    {err && <p className="text-[11px] text-red-400 mt-1">{err}</p>}
  </div>
);

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: role select, 2: form
  const [perfil, setPerfil] = useState('aluno');
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Coach fields
  const [cref, setCref] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [coachBio, setCoachBio] = useState('');

  const passwordChecks = validatePassword(senha);

  const validateForm = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome obrigatorio';
    if (!nickname.trim()) e.nickname = 'Nickname obrigatorio';
    else if (nickname.length < 3) e.nickname = 'Minimo 3 caracteres';
    else if (!/^[a-zA-Z0-9_]+$/.test(nickname)) e.nickname = 'Apenas letras, numeros e _';
    if (!email.trim()) e.email = 'Email obrigatorio';
    if (!passwordChecks.length) e.senha = 'Minimo 6 caracteres';
    else if (!passwordChecks.number) e.senha = 'Deve conter um numero';
    if (senha !== confirmaSenha) e.confirmaSenha = 'Senhas nao coincidem';
    if (perfil === 'instrutor' && !cref.trim()) e.cref = 'CREF obrigatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setError(''); setLoading(true);
    try {
      const data = { nome, nickname, email, senha, perfil };
      if (perfil === 'instrutor') {
        data.cref = cref;
        data.especialidade = especialidade;
        data.bio = coachBio;
      }
      await register(data);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao registrar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0c0f1a' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      </div>

      <header className="relative z-10 py-6 px-6">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }} onClick={() => step > 1 ? setStep(1) : onNavigate('login')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> {step > 1 ? 'Voltar' : 'Login'}
        </motion.button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
            <p className="text-slate-500 text-sm mt-1">Comece sua jornada fitness</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { key: 'aluno', icon: User, title: 'Aluno', desc: 'Treinar e acompanhar' },
                    { key: 'instrutor', icon: GraduationCap, title: 'Instrutor', desc: 'Gerenciar alunos' }
                  ].map(role => (
                    <motion.button key={role.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setPerfil(role.key)}
                      className={`p-5 rounded-2xl text-left transition-all ${
                        perfil === role.key
                          ? 'border-indigo-500/30 bg-indigo-500/8'
                          : 'border-slate-700/20 bg-slate-800/20 hover:bg-slate-800/30'
                      }`} style={{ border: `1px solid ${perfil === role.key ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.1)'}` }}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        perfil === role.key ? 'bg-indigo-500/15' : 'bg-slate-800/40'
                      }`}>
                        <role.icon className={`w-5 h-5 ${perfil === role.key ? 'text-indigo-400' : 'text-slate-500'}`} />
                      </div>
                      <div className={`text-sm font-semibold ${perfil === role.key ? 'text-white' : 'text-slate-300'}`}>{role.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{role.desc}</div>
                      {perfil === role.key && (
                        <motion.div layoutId="role-check" className="absolute top-3 right-3">
                          <CheckCircle className="w-4 h-4 text-indigo-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                  Continuar como {perfil === 'aluno' ? 'Aluno' : 'Instrutor'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.25 }}
                className="rounded-2xl p-6" style={{ background: 'rgba(26,31,46,0.6)', border: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(12px)' }}>

                {/* Role badge */}
                <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    perfil === 'instrutor' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {perfil === 'instrutor' ? 'Instrutor' : 'Aluno'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Nome" error={errors.nome}>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                          className="input-base pl-10" />
                      </div>
                    </InputField>
                    <InputField label="Nickname" error={errors.nickname}>
                      <div className="relative">
                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="@nick"
                          className="input-base pl-10" />
                      </div>
                    </InputField>
                  </div>

                  <InputField label="Email" error={errors.email}>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                        className="input-base pl-10" />
                    </div>
                  </InputField>

                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Senha" error={errors.senha}>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type={showPassword ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                          placeholder="••••••" className="input-base pl-10 pr-10" />
                        <button onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </InputField>
                    <InputField label="Confirmar" error={errors.confirmaSenha}>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="password" value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)}
                          placeholder="••••••" className="input-base pl-10" />
                      </div>
                    </InputField>
                  </div>

                  {/* Password strength */}
                  {senha && (
                    <div className="flex gap-3 text-[11px]">
                      <span className={passwordChecks.length ? 'text-emerald-400' : 'text-slate-600'}>
                        {passwordChecks.length ? '\u2713' : '\u2717'} 6+ chars
                      </span>
                      <span className={passwordChecks.number ? 'text-emerald-400' : 'text-slate-600'}>
                        {passwordChecks.number ? '\u2713' : '\u2717'} 1 numero
                      </span>
                    </div>
                  )}

                  {/* Coach fields */}
                  <AnimatePresence>
                    {perfil === 'instrutor' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                        <div className="pt-2" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
                          <div className="text-[11px] text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Dados do Instrutor
                          </div>
                          <div className="space-y-3">
                            <InputField label="CREF" error={errors.cref}>
                              <input value={cref} onChange={e => setCref(e.target.value)} placeholder="000000-G/UF"
                                className="input-base" />
                            </InputField>
                            <InputField label="Especialidade">
                              <input value={especialidade} onChange={e => setEspecialidade(e.target.value)}
                                placeholder="Ex: Musculacao, Funcional..." className="input-base" />
                            </InputField>
                            <InputField label="Bio">
                              <textarea value={coachBio} onChange={e => setCoachBio(e.target.value)}
                                placeholder="Sobre voce..." className="input-base resize-none" rows={2} />
                            </InputField>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit} disabled={loading}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-2">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando...
                      </span>
                    ) : 'Criar Conta'}
                  </motion.button>
                </div>

                <p className="text-center text-slate-500 mt-4 text-sm">
                  Ja tem conta?{' '}
                  <button onClick={() => onNavigate('login')} className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                    Entrar
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
