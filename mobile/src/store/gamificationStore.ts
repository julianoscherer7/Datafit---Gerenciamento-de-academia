import { create } from 'zustand';

interface GamificationState {
  xp: number;
  level: number;
  moedas: number;
  streak: number;
  titulo: string;
  
  // Animation triggers
  showXpGain: boolean;
  xpGainAmount: number;
  showCoinGain: boolean;
  coinGainAmount: number;
  showLevelUp: boolean;
  newLevel: number;
  showBadge: boolean;
  badgeName: string;
  badgeIcon: string;

  // Actions
  setStats: (stats: Partial<GamificationState>) => void;
  triggerXpGain: (amount: number) => void;
  triggerCoinGain: (amount: number) => void;
  triggerLevelUp: (level: number) => void;
  triggerBadge: (name: string, icon: string) => void;
  dismissAll: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xp: 0,
  level: 1,
  moedas: 0,
  streak: 0,
  titulo: '',

  showXpGain: false,
  xpGainAmount: 0,
  showCoinGain: false,
  coinGainAmount: 0,
  showLevelUp: false,
  newLevel: 0,
  showBadge: false,
  badgeName: '',
  badgeIcon: '',

  setStats: (stats) => set((state) => ({ ...state, ...stats })),

  triggerXpGain: (amount) => {
    set({ showXpGain: true, xpGainAmount: amount });
    setTimeout(() => set({ showXpGain: false }), 2500);
  },

  triggerCoinGain: (amount) => {
    set({ showCoinGain: true, coinGainAmount: amount });
    setTimeout(() => set({ showCoinGain: false }), 2500);
  },

  triggerLevelUp: (level) => {
    set({ showLevelUp: true, newLevel: level });
    setTimeout(() => set({ showLevelUp: false }), 3500);
  },

  triggerBadge: (name, icon) => {
    set({ showBadge: true, badgeName: name, badgeIcon: icon });
    setTimeout(() => set({ showBadge: false }), 3500);
  },

  dismissAll: () =>
    set({
      showXpGain: false,
      showCoinGain: false,
      showLevelUp: false,
      showBadge: false,
    }),
}));
