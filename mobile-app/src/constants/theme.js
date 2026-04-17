// Legalitt Design System — matches Figma exactly

export const COLORS = {
  // Primary — teal from Figma
  primary: '#0d9488',
  primaryDark: '#0a7c72',
  primaryLight: '#e0f5f3',
  primaryGradientStart: '#0d9488',
  primaryGradientEnd: '#065f58',

  // Secondary — navy blue (used in logo, buttons)
  secondary: '#1a2e6b',
  secondaryLight: '#e8eaf6',

  // Backgrounds
  background: '#ffffff',
  backgroundGrey: '#f5f5f5',
  backgroundCard: '#ffffff',
  backgroundLight: '#f0faf9',

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textWhite: '#ffffff',
  textTeal: '#0d9488',
  textRed: '#ef4444',

  // Status
  online: '#22c55e',
  offline: '#6b7280',
  pending: '#f59e0b',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',

  // UI
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  shadow: '#00000015',
  overlay: '#00000060',
  inputBg: '#f9f9f9',
  inputBgActive: '#ffffff',

  // Rating
  star: '#f59e0b',

  // Bottom nav
  navActive: '#0d9488',
  navInactive: '#9ca3af',
  navBg: '#ffffff',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // After loading: 'PlusJakartaSans-Regular', 'PlusJakartaSans-Medium', 'PlusJakartaSans-Bold'
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Font sizes
  tiny: 10,
  caption: 12,
  body: 14,
  bodyLg: 15,
  subtitle: 16,
  title: 18,
  heading: 22,
  display: 28,
  hero: 32,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 999,

  // Component heights
  buttonHeight: 56,
  inputHeight: 52,
  cardRadius: 16,
  avatarSm: 36,
  avatarMd: 48,
  avatarLg: 72,
  avatarXl: 96,

  // Screen
  screenPadding: 20,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
