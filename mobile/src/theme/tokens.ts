// DATAFIT Design Tokens - Mobile
export const colors = {
  // Backgrounds
  bgPrimary: '#0c0f1a',
  bgSecondary: '#141829',
  bgTertiary: '#1a1f35',
  bgCard: 'rgba(20, 24, 41, 0.8)',
  bgCardHover: 'rgba(26, 31, 53, 0.9)',
  bgGlass: 'rgba(255, 255, 255, 0.05)',
  bgGlassStrong: 'rgba(255, 255, 255, 0.1)',
  bgInput: 'rgba(15, 18, 30, 0.8)',

  // Primary
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.3)',

  // Secondary
  secondary: '#1e40af',
  secondaryLight: '#3b82f6',

  // Accent / Gradients
  gradientStart: '#6366f1',
  gradientEnd: '#a855f7',
  gradientGold: '#f59e0b',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.3)',

  // Status
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.15)',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderFocus: '#6366f1',

  // Misc
  online: '#10b981',
  offline: '#6b7280',
  streak: '#f59e0b',
  xp: '#6366f1',
  coins: '#f59e0b',
  level: '#a855f7',

  // Rarity
  rarityComum: '#9ca3af',
  rarityRaro: '#3b82f6',
  rarityEpico: '#a855f7',
  rarityLendario: '#f59e0b',

  // Tab Bar
  tabBarBg: 'rgba(12, 15, 26, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};
