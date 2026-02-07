import api from './api';

export const aiService = {
  // AI Chat (for both coaches and users)
  chat: (message, context = null, studentId = null) => {
    // context can be an array of messages or a string; backend expects a string
    let contextStr = null;
    if (context) {
      contextStr = typeof context === 'string' ? context : JSON.stringify(context);
    }
    return api.post('/ai/chat', { message, context: contextStr, student_id: studentId });
  },
  
  // Exercise suggestions by muscle group
  getExerciseSuggestions: (grupoMuscular, nivel = 'intermediario') => 
    api.get(`/ai/exercise-suggestions/${grupoMuscular}?nivel=${nivel}`),
  
  // Training plan generator
  getTrainingPlan: (objetivo = 'hipertrofia', nivel = 'intermediario', diasSemana = 4) => 
    api.get(`/ai/training-plan?objetivo=${objetivo}&nivel=${nivel}&dias_semana=${diasSemana}`),
};

export default aiService;
