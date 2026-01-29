import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Heart, Send, Camera,
  Sparkles, Flame, ThumbsUp, Star, PartyPopper, Plus,
  Image, Video, Trash2, Eye, Clock, Users
} from 'lucide-react';
import { storiesService } from '../services/social.service';

const REACTIONS = [
  { emoji: '🔥', name: 'Fogo', icon: Flame },
  { emoji: '💪', name: 'Força', icon: null },
  { emoji: '👏', name: 'Parabéns', icon: null },
  { emoji: '❤️', name: 'Amei', icon: Heart },
  { emoji: '⭐', name: 'Top', icon: Star },
  { emoji: '🎉', name: 'Festa', icon: PartyPopper },
];

// ============= STORY VIEWER MODAL =============
const StoryViewerModal = ({ isOpen, onClose, stories, initialStoryIndex = 0, initialUserIndex = 0 }) => {
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressTimer = useRef(null);
  const STORY_DURATION = 5000;

  const currentUser = stories[userIndex];
  const currentStory = currentUser?.stories?.[storyIndex];

  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;
    
    // Marcar como visualizada
    storiesService.visualizar(currentStory.id).catch(() => {});
    
    setProgress(0);
    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;
      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(progressTimer.current);
  }, [isOpen, userIndex, storyIndex, currentStory, isPaused]);

  const handleNext = () => {
    if (currentUser?.stories && storyIndex < currentUser.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else if (userIndex < stories.length - 1) {
      setUserIndex(prev => prev + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
    } else if (userIndex > 0) {
      setUserIndex(prev => prev - 1);
      const prevUser = stories[userIndex - 1];
      setStoryIndex(prevUser?.stories?.length - 1 || 0);
    }
  };

  const handleReaction = async (emoji) => {
    try {
      await storiesService.reagir(currentStory.id, emoji);
    } catch (err) {
      console.error('Erro ao reagir:', err);
    }
  };

  if (!isOpen || !currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Story container */}
        <div className="relative w-full max-w-md h-full max-h-[90vh] mx-auto">
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
            {currentUser?.stories?.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="absolute top-6 left-4 right-4 z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              {currentUser?.usuario_foto || '👤'}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">{currentUser?.usuario_nome}</div>
              <div className="text-white/60 text-xs">
                {currentStory?.tempo_atras || 'agora'}
              </div>
            </div>
          </div>

          {/* Story content */}
          <motion.div
            key={`${userIndex}-${storyIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center bg-slate-900"
          >
            {currentStory?.tipo === 'foto' && currentStory?.conteudo ? (
              <img
                src={currentStory.conteudo}
                alt="Story"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🏋️</div>
                <p className="text-xl text-white font-semibold">
                  {currentStory?.legenda || 'Treino concluído!'}
                </p>
                {currentStory?.treino_nome && (
                  <p className="text-slate-400 mt-2">{currentStory.treino_nome}</p>
                )}
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
          </motion.div>

          {/* Navigation areas */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 cursor-pointer" onClick={handlePrev} />
            <div className="flex-1 cursor-pointer" onClick={handleNext} />
          </div>

          {/* Caption */}
          {currentStory?.legenda && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <p className="text-white text-center bg-black/30 rounded-xl px-4 py-2 backdrop-blur-sm">
                {currentStory.legenda}
              </p>
            </div>
          )}

          {/* Reactions */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center gap-3">
            {REACTIONS.map((reaction) => (
              <motion.button
                key={reaction.emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReaction(reaction.emoji)}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl hover:bg-white/20 transition-colors"
              >
                {reaction.emoji}
              </motion.button>
            ))}
          </div>

          {/* Navigation arrows */}
          {userIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {(storyIndex < (currentUser?.stories?.length || 1) - 1 || userIndex < stories.length - 1) && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============= CREATE STORY MODAL =============
const CreateStoryModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [legenda, setLegenda] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSubmit({ foto_base64: foto, legenda });
    setFoto(null);
    setFotoPreview(null);
    setLegenda('');
  };

  const resetForm = () => {
    setFoto(null);
    setFotoPreview(null);
    setLegenda('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={resetForm}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Criar Story
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Photo upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                fotoPreview ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              {fotoPreview ? (
                <div className="relative">
                  <img src={fotoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFoto(null); setFotoPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Clique para adicionar uma foto</p>
                  <p className="text-xs text-slate-500 mt-1">ou arraste e solte</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Legenda (opcional)</label>
              <input
                type="text"
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Adicione uma legenda ao seu story..."
                maxLength={100}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{legenda.length}/100</p>
            </div>

            {/* Quick reactions */}
            <div className="flex flex-wrap gap-2">
              {['💪 Treinando!', '🔥 Fogo!', '🏋️ Academia', '💯 Meta batida'].map((text) => (
                <button
                  key={text}
                  onClick={() => setLegenda(text)}
                  className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!foto || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publicando...</span>
                  </div>
                ) : (
                  'Publicar Story'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============= STORY PREVIEW CARD =============
const StoryPreviewCard = ({ userStory, onClick, isOwn = false }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center gap-2 cursor-pointer"
  >
    <div
      className={`w-20 h-20 rounded-full p-[3px] ${
        userStory.tem_nao_visto
          ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
          : 'bg-slate-600'
      }`}
    >
      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl overflow-hidden">
        {userStory.stories?.[0]?.tipo === 'foto' && userStory.stories?.[0]?.conteudo ? (
          <img src={userStory.stories[0].conteudo} alt="" className="w-full h-full object-cover" />
        ) : (
          userStory.usuario_foto || '👤'
        )}
      </div>
    </div>
    <span className="text-sm text-slate-300 font-medium w-20 truncate text-center">
      {isOwn ? 'Seu Story' : userStory.usuario_nome?.split(' ')[0]}
    </span>
    <span className="text-xs text-slate-500">
      {userStory.stories?.length || 0} {(userStory.stories?.length || 0) === 1 ? 'story' : 'stories'}
    </span>
  </motion.div>
);

// ============= MY STORIES CARD =============
const MyStoriesCard = ({ myStories, onDelete, loading }) => {
  if (!myStories || myStories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-purple-400" />
        Seus Stories Ativos
      </h3>
      <div className="space-y-3">
        {myStories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
              {story.tipo === 'foto' && story.conteudo ? (
                <img src={story.conteudo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🏋️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate">{story.legenda || 'Sem legenda'}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {story.visualizacoes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {story.tempo_restante || '24h'}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(story.id)}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============= MAIN PAGE =============
export const StoriesPage = () => {
  const [storiesFeed, setStoriesFeed] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState({ user: 0, story: 0 });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const [feedRes, myRes] = await Promise.allSettled([
        storiesService.getFeed(),
        storiesService.getMeus()
      ]);
      if (feedRes.status === 'fulfilled') setStoriesFeed(feedRes.value.data || []);
      if (myRes.status === 'fulfilled') setMyStories(myRes.value.data || []);
    } catch (err) {
      console.error('Erro ao buscar stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (data) => {
    try {
      setCreateLoading(true);
      await storiesService.criar(data);
      setCreateModalOpen(false);
      fetchStories();
    } catch (err) {
      console.error('Erro ao criar story:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    // Implementar deleção se necessário
    console.log('Delete story:', storyId);
  };

  const openViewer = (userIndex) => {
    setViewerStartIndex({ user: userIndex, story: 0 });
    setViewerOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Stories
          </h1>
          <p className="text-slate-400">Veja o que seus amigos estão treinando</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white"
        >
          <Plus className="w-5 h-5" />
          Criar Story
        </motion.button>
      </motion.div>

      {/* Stories Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Stories dos Amigos
        </h3>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-slate-700/50 animate-pulse" />
                <div className="w-16 h-4 bg-slate-700/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : storiesFeed.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
            {/* Create button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateModalOpen(true)}
              className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
                <Plus className="w-8 h-8 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Criar</span>
            </motion.div>

            {/* User stories */}
            {storiesFeed.map((userStory, i) => (
              <StoryPreviewCard
                key={userStory.usuario_id}
                userStory={userStory}
                onClick={() => openViewer(i)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum story disponível</h3>
            <p className="text-slate-400 mb-4">Adicione amigos para ver seus stories ou crie o seu!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white"
            >
              Criar Seu Primeiro Story
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* My Stories */}
      <MyStoriesCard
        myStories={myStories}
        onDelete={handleDeleteStory}
        loading={loading}
      />

      {/* Create Modal */}
      <CreateStoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateStory}
        loading={createLoading}
      />

      {/* Story Viewer */}
      <StoryViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        stories={storiesFeed}
        initialUserIndex={viewerStartIndex.user}
        initialStoryIndex={viewerStartIndex.story}
      />
    </div>
  );
};

export default StoriesPage;
