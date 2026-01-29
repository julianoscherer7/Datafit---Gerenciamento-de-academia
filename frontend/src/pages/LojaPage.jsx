import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Coins, Star, Crown, Sparkles, Gift,
  Check, Lock, Palette, Frame, Wand2, Zap, Trophy,
  ChevronRight, X, Eye, Package
} from 'lucide-react';
import { lojaService } from '../services/social.service';

// ============= CONSTANTES =============
const RARIDADES = {
  comum: { cor: 'from-slate-400 to-slate-500', nome: 'Comum', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  raro: { cor: 'from-blue-400 to-blue-600', nome: 'Raro', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  epico: { cor: 'from-purple-400 to-purple-600', nome: 'Épico', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  lendario: { cor: 'from-yellow-400 to-orange-500', nome: 'Lendário', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
};

const TIPOS_ICONS = {
  skin: Palette,
  borda: Frame,
  tema: Wand2,
  titulo: Crown,
  efeito: Sparkles
};

// ============= SKELETON =============
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

// ============= MOEDAS DISPLAY =============
const MoedasDisplay = ({ moedas, loading }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl"
  >
    <Coins className="w-5 h-5 text-yellow-400" />
    {loading ? (
      <Skeleton className="w-12 h-5" />
    ) : (
      <span className="text-lg font-bold text-yellow-400">{moedas || 0}</span>
    )}
  </motion.div>
);

// ============= XP PROGRESS =============
const XPProgress = ({ progresso, loading }) => {
  if (loading) return <Skeleton className="w-full h-24" />;
  
  const xpAtual = progresso?.xp_total || 0;
  const nivel = progresso?.nivel || 1;
  const xpParaProximo = 100 - (xpAtual % 100);
  const progressPercent = (xpAtual % 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Nível Atual</div>
            <div className="text-2xl font-bold text-white">Nível {nivel}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">XP Total</div>
          <div className="text-xl font-bold text-purple-400">{xpAtual} XP</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Progresso para Nível {nivel + 1}</span>
          <span className="text-purple-400">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
        <div className="text-xs text-slate-500">Faltam {xpParaProximo} XP</div>
      </div>
    </motion.div>
  );
};

// ============= ITEM CARD =============
const ItemCard = ({ item, onComprar, onEquipar, loading, moedasUsuario }) => {
  const raridade = RARIDADES[item.raridade] || RARIDADES.comum;
  const IconeTipo = TIPOS_ICONS[item.tipo] || Gift;
  const podeComprar = moedasUsuario >= item.preco;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border overflow-hidden ${raridade.border} ${
        item.equipado ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      {/* Raridade badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${raridade.bg} ${raridade.border} border`}>
        <span className={`bg-gradient-to-r ${raridade.cor} bg-clip-text text-transparent`}>
          {raridade.nome}
        </span>
      </div>

      {/* Equipado badge */}
      {item.equipado && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Equipado
        </div>
      )}

      <div className="p-6">
        {/* Item icon/preview */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${raridade.cor} p-[2px]`}>
          <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center">
            {item.icone ? (
              <span className="text-4xl">{item.icone}</span>
            ) : (
              <IconeTipo className="w-10 h-10 text-slate-400" />
            )}
          </div>
        </div>

        {/* Item info */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-white mb-1">{item.nome}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{item.descricao}</p>
        </div>

        {/* Type badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300 capitalize">
            <IconeTipo className="w-3 h-3" />
            {item.tipo}
          </span>
        </div>

        {/* Price and actions */}
        {item.possui ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEquipar(item.id)}
            disabled={item.equipado || loading}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              item.equipado
                ? 'bg-purple-500/20 text-purple-400 cursor-default'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {item.equipado ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Equipado
              </span>
            ) : (
              'Equipar'
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={podeComprar ? { scale: 1.02 } : {}}
            whileTap={podeComprar ? { scale: 0.98 } : {}}
            onClick={() => onComprar(item.id)}
            disabled={!podeComprar || loading}
            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              podeComprar
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {podeComprar ? (
              <>
                <Coins className="w-4 h-4" />
                {item.preco}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {item.preco} moedas
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ============= ITEM DETAIL MODAL =============
const ItemDetailModal = ({ item, isOpen, onClose, onComprar, onEquipar, loading, moedasUsuario }) => {
  if (!isOpen || !item) return null;

  const raridade = RARIDADES[item.raridade] || RARIDADES.comum;
  const IconeTipo = TIPOS_ICONS[item.tipo] || Gift;
  const podeComprar = moedasUsuario >= item.preco;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-slate-800 rounded-2xl w-full max-w-md border ${raridade.border} overflow-hidden`}
        >
          {/* Header with gradient */}
          <div className={`h-32 bg-gradient-to-br ${raridade.cor} relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-800 flex items-center justify-center text-4xl shadow-xl">
                {item.icone || '🎁'}
              </div>
            </div>
          </div>

          <div className="pt-14 p-6">
            <div className="text-center mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${raridade.bg} border ${raridade.border}`}>
                <span className={`bg-gradient-to-r ${raridade.cor} bg-clip-text text-transparent`}>
                  {raridade.nome}
                </span>
              </span>
              <h2 className="text-2xl font-bold text-white mb-2">{item.nome}</h2>
              <p className="text-slate-400">{item.descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <IconeTipo className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-400">Tipo</div>
                <div className="font-medium text-white capitalize">{item.tipo}</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-sm text-slate-400">Preço</div>
                <div className="font-medium text-yellow-400">{item.preco}</div>
              </div>
            </div>

            {item.possui ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onEquipar(item.id); onClose(); }}
                disabled={item.equipado || loading}
                className={`w-full py-4 rounded-xl font-medium text-lg ${
                  item.equipado
                    ? 'bg-purple-500/20 text-purple-400 cursor-default'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                {item.equipado ? 'Já Equipado' : 'Equipar Item'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={podeComprar ? { scale: 1.02 } : {}}
                whileTap={podeComprar ? { scale: 0.98 } : {}}
                onClick={() => { onComprar(item.id); onClose(); }}
                disabled={!podeComprar || loading}
                className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 ${
                  podeComprar
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                {podeComprar ? (
                  <>
                    <Coins className="w-5 h-5" />
                    Comprar por {item.preco}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Moedas insuficientes
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============= FILTER TABS =============
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'todos', label: 'Todos', icon: Package },
    { id: 'skin', label: 'Skins', icon: Palette },
    { id: 'borda', label: 'Bordas', icon: Frame },
    { id: 'tema', label: 'Temas', icon: Wand2 },
    { id: 'titulo', label: 'Títulos', icon: Crown },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        return (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
};

// ============= MY ITEMS SECTION =============
const MyItemsSection = ({ items, onEquipar, loading }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-purple-400" />
        Meus Itens
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item, i) => {
          const raridade = RARIDADES[item.item?.raridade || item.raridade] || RARIDADES.comum;
          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => !item.equipado && onEquipar(item.item_id || item.id)}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all ${raridade.bg} ${raridade.border} ${
                item.equipado ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {item.equipado && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-center">
                <span className="text-3xl">{item.item?.icone || item.icone || '🎁'}</span>
                <p className="text-xs text-slate-400 mt-2 truncate">{item.item?.nome || item.nome}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============= MAIN PAGE =============
export const LojaPage = () => {
  const [itens, setItens] = useState([]);
  const [meusItens, setMeusItens] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itensRes, meusRes, progressoRes] = await Promise.allSettled([
        lojaService.getItens(),
        lojaService.getMeusItens(),
        lojaService.getProgresso()
      ]);
      if (itensRes.status === 'fulfilled') setItens(itensRes.value.data || []);
      if (meusRes.status === 'fulfilled') setMeusItens(meusRes.value.data || []);
      if (progressoRes.status === 'fulfilled') setProgresso(progressoRes.value.data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async (itemId) => {
    try {
      setActionLoading(true);
      await lojaService.comprar(itemId);
      fetchData();
    } catch (err) {
      console.error('Erro ao comprar:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEquipar = async (itemId) => {
    try {
      setActionLoading(true);
      await lojaService.equipar(itemId);
      fetchData();
    } catch (err) {
      console.error('Erro ao equipar:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItens = activeFilter === 'todos'
    ? itens
    : itens.filter(item => item.tipo === activeFilter);

  const moedasUsuario = progresso?.moedas || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-400" />
            Loja
          </h1>
          <p className="text-slate-400">Personalize seu perfil com itens exclusivos</p>
        </div>
        <MoedasDisplay moedas={moedasUsuario} loading={loading} />
      </motion.div>

      {/* XP Progress */}
      <XPProgress progresso={progresso} loading={loading} />

      {/* My Items */}
      <MyItemsSection
        items={meusItens}
        onEquipar={handleEquipar}
        loading={actionLoading}
      />

      {/* Filter */}
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-2xl p-6">
              <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
              <Skeleton className="w-3/4 h-5 mx-auto mb-2" />
              <Skeleton className="w-1/2 h-4 mx-auto mb-4" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredItens.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItens.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <ItemCard
                  item={item}
                  onComprar={handleComprar}
                  onEquipar={handleEquipar}
                  loading={actionLoading}
                  moedasUsuario={moedasUsuario}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum item encontrado</h3>
          <p className="text-slate-400">
            {activeFilter !== 'todos'
              ? 'Não há itens nesta categoria ainda.'
              : 'A loja está vazia no momento.'}
          </p>
        </motion.div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onComprar={handleComprar}
        onEquipar={handleEquipar}
        loading={actionLoading}
        moedasUsuario={moedasUsuario}
      />
    </div>
  );
};

export default LojaPage;
