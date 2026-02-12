import api from './api';

export const checkinService = {
  // Iniciar check-in com foto
  iniciarCheckin: (data) => api.post('/checkin/iniciar', data),
  
  // Validar treino (requer check-in + exercícios)
  validarTreino: (checkinId) => api.post(`/checkin/validar/${checkinId}`),
  
  // Obter check-in de hoje
  getCheckinHoje: () => api.get('/checkin/hoje'),
  
  // Obter histórico de check-ins
  getHistorico: (limite = 30) => api.get(`/checkin/historico?limite=${limite}`),
  
  // Obter status completo do treino de hoje
  getStatus: () => api.get('/checkin/status'),
};

export const storiesService = {
  // Criar novo story
  criarStory: (data) => api.post('/stories/criar', data),
  
  // Obter feed de stories dos amigos
  getFeed: () => api.get('/stories/feed'),
  
  // Obter meus stories
  getMeusStories: () => api.get('/stories/meus'),
  
  // Visualizar um story
  visualizarStory: (storyId) => api.post(`/stories/visualizar/${storyId}`),
  
  // Reagir a um story
  reagirStory: (storyId, emoji) => api.post(`/stories/reagir/${storyId}`, { emoji }),
  
  // Deletar um story
  deletarStory: (storyId) => api.delete(`/stories/${storyId}`),
};

export const chatService = {
  // Enviar mensagem
  enviar: (data) => api.post('/chat/enviar', data),
  enviarMensagem: (data) => api.post('/chat/enviar', data),
  
  // Listar conversas
  getConversas: () => api.get('/chat/conversas'),
  
  // Obter histórico de chat com um amigo
  getHistorico: (amigoId, limite = 50) => api.get(`/chat/historico/${amigoId}?limite=${limite}`),
  
  // Marcar mensagem como lida
  marcarLida: (mensagemId) => api.post(`/chat/marcar-lida/${mensagemId}`),
  
  // Contar mensagens não lidas
  contarNaoLidas: () => api.get('/chat/nao-lidas'),
  
  // Deletar mensagem
  deletarMensagem: (mensagemId) => api.delete(`/chat/mensagem/${mensagemId}`),
  
  // Deletar conversa inteira
  deletarConversa: (outroId) => api.delete(`/chat/conversa/${outroId}`),
};

export const lojaService = {
  // Listar itens da loja
  getItens: (tipo = null) => api.get(`/loja/itens${tipo ? `?tipo=${tipo}` : ''}`),
  
  // Comprar item
  comprarItem: (itemId) => api.post(`/loja/comprar/${itemId}`),
  
  // Equipar item
  equiparItem: (itemId) => api.post(`/loja/equipar/${itemId}`),
  
  // Listar meus itens
  getMeusItens: () => api.get('/loja/meus-itens'),
  
  // Obter progresso (moedas, XP, nível)
  getProgresso: () => api.get('/loja/progresso'),
  
  // Listar recompensas disponíveis
  getRecompensas: () => api.get('/loja/recompensas'),
};

export default {
  checkin: checkinService,
  stories: storiesService,
  chat: chatService,
  loja: lojaService,
};
