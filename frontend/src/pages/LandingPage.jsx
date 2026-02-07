import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Users, Trophy, Sparkles, Zap, Target, Bot, BarChart3, Shield } from 'lucide-react';

const Counter = ({ end, duration = 2 }) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let s = 0; const inc = end / (duration * 60);
    const t = setInterval(() => { s += inc; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 1000 / 60);
    return () => clearInterval(t);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

export const LandingPage = ({ onNavigate }) => {
  const features = [
    { icon: Dumbbell, title: 'Gestao de Treinos', desc: 'Crie, edite e execute treinos', color: 'from-indigo-500 to-purple-500' },
    { icon: Bot, title: 'FitBot AI', desc: 'Assistente inteligente', color: 'from-purple-500 to-violet-500' },
    { icon: BarChart3, title: 'Analytics', desc: 'Acompanhe sua evolucao', color: 'from-emerald-500 to-teal-500' },
    { icon: Trophy, title: 'Gamificacao', desc: 'Badges e conquistas', color: 'from-amber-500 to-orange-500' },
    { icon: Users, title: 'Ranking', desc: 'Compare com amigos', color: 'from-cyan-500 to-blue-500' },
    { icon: Shield, title: 'Coach', desc: 'Gestao de alunos', color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#0c0f1a' }}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                DATAFIT
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
              <button onClick={() => onNavigate('login')}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-sm">
                Entrar
              </button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-5 py-2 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                Comecar
              </motion.button>
            </motion.div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Plataforma fitness inteligente
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Gerencie seus
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                treinos com dados
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Analytics avancado, assistente AI, gamificacao e gestao de treinos.
              A plataforma completa para atletas e coaches.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 transition-all">
                Criar Conta Gratis
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-slate-800/60 text-white rounded-xl font-semibold text-lg border border-slate-700/30 hover:bg-slate-800 transition-all">
                Ja tenho conta
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
              {[
                { value: 1000, label: 'Usuarios Ativos', suffix: '+' },
                { value: 50000, label: 'Treinos Realizados', suffix: '+' },
                { value: 500, label: 'Badges Conquistados', suffix: '+' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <Counter end={stat.value} />{stat.suffix}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Features Carousel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="w-full overflow-hidden py-8">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0c0f1a, transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #0c0f1a, transparent)' }} />
              <motion.div animate={{ x: [0, -1200] }}
                transition={{ x: { duration: 30, repeat: Infinity, ease: "linear" } }}
                className="flex gap-4">
                {[...features, ...features, ...features, ...features].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div key={i} whileHover={{ y: -8, scale: 1.05 }}
                      className="flex-shrink-0 w-48 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/20 text-center group hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-slate-400">{feature.desc}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 text-center text-slate-600 text-sm">
          <p>&copy; 2026 DATAFIT. Transformando dados em resultados.</p>
        </footer>
      </div>
    </div>
  );
};
