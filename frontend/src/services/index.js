// Services Index - Exportacao centralizada
import api from './api';
import { authService } from './auth.service';
import { treinoService, execucaoService } from './treino.service';
import { dashboardService } from './dashboard.service';
import { desafiosService } from './desafios.service';
import { analyticsService } from './analytics.service';
import { badgesService } from './badges.service';
import { amigosService } from './amigos.service';
import { historicoService } from './historico.service';
import { exerciciosService } from './exercicios.service';
import { configsService } from './configs.service';
import { coachService } from './coach.service';
import { aiService } from './ai.service';
import { chatService, checkinService, storiesService, lojaService } from './social.service';

// Create socialService alias for ChatPage compatibility
const socialService = {
  getConversas: chatService.getConversas,
  getMensagens: (convId, limite) => chatService.getHistorico(convId, limite),
  enviarMensagem: (destId, data) => chatService.enviarMensagem({ ...data, destinatario_id: destId }),
  marcarLida: chatService.marcarLida,
  contarNaoLidas: chatService.contarNaoLidas,
};

export {
  api,
  authService,
  treinoService,
  execucaoService,
  dashboardService,
  desafiosService,
  analyticsService,
  badgesService,
  amigosService,
  historicoService,
  exerciciosService,
  configsService,
  coachService,
  aiService,
  chatService,
  checkinService,
  storiesService,
  lojaService,
  socialService,
};

export default api;
