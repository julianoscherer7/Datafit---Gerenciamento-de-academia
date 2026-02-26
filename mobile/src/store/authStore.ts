import { create } from 'zustand';
import { authService, User } from '../services/auth.service';
import { saveToken, getToken, removeToken } from '../services/authStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;

  // Computed
  isAuthenticated: boolean;
  isCoach: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isApprovedCoach: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  isAuthenticated: false,
  isCoach: false,
  isAdmin: false,
  isStudent: false,
  isApprovedCoach: false,

  initialize: async () => {
    try {
      const token = await getToken();
      if (token) {
        set({ token, loading: true });
        try {
          const userData = await authService.me();
          const user = userData.user || userData;
          set({
            user,
            token,
            loading: false,
            initialized: true,
            isAuthenticated: true,
            isCoach: user.perfil === 'instrutor',
            isAdmin: user.perfil === 'admin',
            isStudent: user.perfil === 'aluno',
            isApprovedCoach: user.perfil === 'instrutor' && user.coach_status === 'approved',
          });
        } catch {
          await removeToken();
          set({ token: null, loading: false, initialized: true, isAuthenticated: false });
        }
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await authService.login({ username: email, password });
      const token = response.access_token;
      await saveToken(token);
      set({ token });

      const userData = await authService.me();
      const user = userData.user || userData;
      set({
        user,
        loading: false,
        isAuthenticated: true,
        isCoach: user.perfil === 'instrutor',
        isAdmin: user.perfil === 'admin',
        isStudent: user.perfil === 'aluno',
        isApprovedCoach: user.perfil === 'instrutor' && user.coach_status === 'approved',
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ loading: true });
    try {
      const response = await authService.register(data);
      const token = response.access_token;
      if (token) {
        await saveToken(token);
        set({ token });

        const userData = await authService.me();
        const user = userData.user || userData;
        set({
          user,
          loading: false,
          isAuthenticated: true,
          isCoach: user.perfil === 'instrutor',
          isAdmin: user.perfil === 'admin',
          isStudent: user.perfil === 'aluno',
          isApprovedCoach: user.perfil === 'instrutor' && user.coach_status === 'approved',
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isCoach: false,
      isAdmin: false,
      isStudent: false,
      isApprovedCoach: false,
    });
  },

  refreshUser: async () => {
    try {
      const userData = await authService.me();
      const user = userData.user || userData;
      set({
        user,
        isCoach: user.perfil === 'instrutor',
        isAdmin: user.perfil === 'admin',
        isStudent: user.perfil === 'aluno',
        isApprovedCoach: user.perfil === 'instrutor' && user.coach_status === 'approved',
      });
    } catch {
      // silently fail
    }
  },

  updateUser: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },
}));
