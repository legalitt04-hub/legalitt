import { normalize } from '../utils/responsive';

export const COLORS = {
// ... existing colors
  primary: '#14B8A6',
  primaryDark: '#0D9488',
  primaryLight: '#5EEAD4',
  primaryGradientStart: '#14B8A6',
  primaryGradientEnd: '#0D9488',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  backgroundGray: '#F9FAFB',
  border: '#E5E7EB',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const SIZES = {
  small: normalize(12),
  medium: normalize(16),
  large: normalize(20),
  xlarge: normalize(24),
  xxlarge: normalize(32),
  buttonHeight: normalize(56),
  radiusXl: normalize(16),
  radiusLg: normalize(12),
  radiusMd: normalize(8),
};
