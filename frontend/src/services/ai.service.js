import api from './api';

export const aiService = {
  // AI Chat (for both coaches and users)
  chat: (message, context = null, studentId = null) => 
    api.post('/ai/chat', { message, context, student_id: studentId }),
  
  // Exercise suggestions by muscle group
  getExerciseSuggestions: (grupoMuscular, nivel = 'intermediario') => 
    api.get(`/ai/exercise-suggestions/${grupoMuscular}?nivel=${nivel}`),
  
  // Training plan generator
  getTrainingPlan: (objetivo = 'hipertrofia', nivel = 'intermediario', diasSemana = 4) => 
    api.get(`/ai/training-plan?objetivo=${objetivo}&nivel=${nivel}&dias_semana=${diasSemana}`),
};

export default aiService;
