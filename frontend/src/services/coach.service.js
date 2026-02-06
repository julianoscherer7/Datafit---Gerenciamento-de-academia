import api from './api';

export const coachService = {
  // === INVITE TOKENS ===
  createInviteToken: (data = {}) => api.post('/coach/invite-token', data),
  listInviteTokens: () => api.get('/coach/invite-tokens'),
  revokeInviteToken: (tokenId) => api.delete(`/coach/invite-token/${tokenId}`),
  
  // === STUDENT CONNECTION ===
  connectByToken: (token) => api.post('/coach/connect-by-token', { token }),
  getMyStudents: () => api.get('/coach/my-students'),
  getMyCoach: () => api.get('/coach/my-coach'),
  disconnectStudent: (studentId) => api.delete(`/coach/disconnect/${studentId}`),
  getStudentDetails: (studentId) => api.get(`/coach/student/${studentId}/details`),
  
  // === COACH DASHBOARD ===
  getDashboard: () => api.get('/coach/dashboard'),
  
  // === PRESENCE VALIDATION ===
  validatePresence: (data) => api.post('/coach/validate-presence', data),
  getValidations: () => api.get('/coach/validations'),
  
  // === ADMIN: Coach Approval ===
  pendingCoaches: () => api.get('/coach/pending-coaches'),
  approveCoach: (coachId, action) => api.post('/coach/approve-coach', { coach_id: coachId, action }),
};

export default coachService;
