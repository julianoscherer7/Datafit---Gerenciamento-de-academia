import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Users, Trophy, Sparkles, Zap, Target, Camera, MessageCircle } from 'lucide-react';

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

  return <span>{count.toLocaleString()}</span>;
};

export const LandingPage = ({ onNavigate }) => {
  const features = [
    { icon: Camera, title: 'Check-in de Treino', desc: 'Comprove seu treino com fotos', color: 'from-purple-500 to-pink-500' },
    { icon: Sparkles, title: 'Stories', desc: 'Compartilhe seu progresso', color: 'from-pink-500 to-orange-500' },
    { icon: MessageCircle, title: 'Chat', desc: 'Converse com amigos', color: 'from-blue-500 to-cyan-500' },
    { icon: Trophy, title: 'Gamificação', desc: 'Conquiste badges', color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Acompanhe o progresso', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FITDATA
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <button 
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25"
              >
                Começar
              </motion.button>
            </motion.div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                A rede social fitness
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Transforme seus
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                treinos em conquistas
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
            >
              Check-in de treinos, stories, chat com amigos, badges e muito mais.
              A rede social fitness mais completa do Brasil.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
              >
                Criar Conta Grátis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-semibold text-lg border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Já tenho conta
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16"
            >
              {[
                { value: 1000, label: 'Usuários Ativos', suffix: '+' },
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

          {/* Features Carousel - Continuous Movement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full overflow-hidden py-8"
          >
            <div className="relative">
              {/* Gradient overlays for smooth fade */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
              
              {/* Scrolling container */}
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  x: {
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
                className="flex gap-4"
              >
                {/* Duplicate features for seamless loop */}
                {[...features, ...features, ...features, ...features].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ y: -8, scale: 1.05 }}
                      className="flex-shrink-0 w-48 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 text-center group hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
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
        <footer className="py-6 px-4 text-center text-slate-500 text-sm">
          <p>© 2026 FITDATA. Transformando vidas através do fitness.</p>
        </footer>
      </div>
    </div>
  );
};
