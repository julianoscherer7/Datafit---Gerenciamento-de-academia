// Services Index - Exportação centralizada de todos os serviços
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
};

// Export default para compatibilidade
export default api;
