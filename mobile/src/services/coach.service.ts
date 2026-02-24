import api from '../api/client';

export const coachService = {
  createInviteToken: async () => {
    const response = await api.post('/coach/invite-token');
    return response.data;
  },

  getInviteTokens: async () => {
    const response = await api.get('/coach/invite-tokens');
    return response.data;
  },

  revokeInviteToken: async (tokenId: number) => {
    const response = await api.delete(`/coach/invite-token/${tokenId}`);
    return response.data;
  },

  connectByToken: async (token: string) => {
    const response = await api.post('/coach/connect-by-token', { token });
    return response.data;
  },

  getMyStudents: async () => {
    const response = await api.get('/coach/my-students');
    return response.data;
  },

  getMyCoach: async () => {
    const response = await api.get('/coach/my-coach');
    return response.data;
  },

  disconnect: async (studentId: number) => {
    const response = await api.delete(`/coach/disconnect/${studentId}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/coach/dashboard');
    return response.data;
  },

  getStudentDetails: async (studentId: number) => {
    const response = await api.get(`/coach/student/${studentId}/details`);
    return response.data;
  },

  assignTreino: async (treinoId: number, alunoId: number) => {
    const response = await api.post('/coach/assign-treino', { treino_id: treinoId, aluno_id: alunoId });
    return response.data;
  },

  unassignTreino: async (treinoId: number, alunoId: number) => {
    const response = await api.post('/coach/unassign-treino', { treino_id: treinoId, aluno_id: alunoId });
    return response.data;
  },

  validatePresence: async (fotoBase64: string) => {
    const response = await api.post('/coach/validate-presence', { foto_base64: fotoBase64 });
    return response.data;
  },

  getValidations: async () => {
    const response = await api.get('/coach/validations');
    return response.data;
  },

  getPendingCoaches: async () => {
    const response = await api.get('/coach/pending-coaches');
    return response.data;
  },

  approveCoach: async (coachId: number, approved: boolean) => {
    const response = await api.post('/coach/approve-coach', { coach_id: coachId, approved });
    return response.data;
  },
};
