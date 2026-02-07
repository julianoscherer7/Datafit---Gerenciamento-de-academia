import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Camera, User, Mail, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { configsService } from '../services';

export const EditPerfilPage = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nome: '', email: '', nickname: '', bio: '', telefone: '', idade: '', peso: '', altura: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || '', email: user.email || '', nickname: user.nickname || '',
        bio: user.bio || '', telefone: user.telefone || '', idade: user.idade || '',
        peso: user.peso || '', altura: user.altura || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await configsService.updatePerfil(form);
      if (updateUser) updateUser({ ...user, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const Field = ({ label, field, type = 'text', ...props }) => (
    <div>
      <label className="text-[11px] text-slate-500 font-medium mb-1 block">{label}</label>
      <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/30 transition-colors"
        {...props} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('perfil')}
            className="p-2 rounded-lg hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-all">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvo!' : 'Salvar'}
        </motion.button>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {(form.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-[#0c0f1a]">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{form.nome || 'Seu nome'}</div>
            <div className="text-xs text-slate-500">{form.email}</div>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card-base p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome completo" field="nome" placeholder="Seu nome" />
          <Field label="Nickname" field="nickname" placeholder="@seunick" />
          <Field label="Email" field="email" type="email" placeholder="email@exemplo.com" />
          <Field label="Telefone" field="telefone" placeholder="(00) 00000-0000" />
        </div>
        <Field label="Bio" field="bio" placeholder="Conte um pouco sobre voce..." />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Idade" field="idade" type="number" placeholder="25" />
          <Field label="Peso (kg)" field="peso" type="number" placeholder="75" />
          <Field label="Altura (cm)" field="altura" type="number" placeholder="175" />
        </div>
      </motion.div>
    </div>
  );
};

export default EditPerfilPage;
