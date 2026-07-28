import { normalize } from '../utils/responsive';

export const COLORS = {
  // New Color Palette
  primary: "#B09C85",
  primaryDark: "#8D7865",
  primaryLight: "#C7BFB4",

  background: "#FAF9F8",
  card: "#FFFFFF",

  text: "#46464A",
  textSecondary: "#727477",

  border: "#C7C2BC",

  danger: "#E53935",

  // Compatibility Mappings for Existing Components
  textPrimary: "#46464A",
  backgroundGray: "#FAF9F8",
  error: "#E53935",
  primaryGradientStart: "#B09C85",
  primaryGradientEnd: "#8D7865",
  success: "#10B981",
  warning: "#F59E0B",
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
