export { authService } from './auth.service';
export { treinoService, exercicioService, execucaoService } from './treino.service';
export { dashboardService } from './dashboard.service';
export { amigosService } from './amigos.service';
export { chatService } from './chat.service';
export { checkinService } from './checkin.service';
export { storiesService } from './stories.service';
export { coachService } from './coach.service';
export {
  lojaService,
  badgesService,
  analyticsService,
  historicoService,
  desafiosService,
  configsService,
} from './extra.service';

export type { User, LoginData, RegisterData } from './auth.service';
export type { Treino, TreinoExercicio, Exercicio, SerieExecutada } from './treino.service';
export type { Amigo, Amizade } from './amigos.service';
export type { Mensagem, Conversa } from './chat.service';
export type { Story } from './stories.service';
