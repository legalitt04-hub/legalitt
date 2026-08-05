import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LEGAL_THEME = {
  colors: {
    primaryGold: '#B89A6A',
    darkGold: '#9D7D4D',
    cream: '#F8F4EC',
    white: '#FFFFFF',
    primaryText: '#2E2A26',
    secondaryText: '#6D6A66',
    border: '#E8E2D8',
    cardBackground: '#FFFFFF',
    pageBackground: '#FFFFFF',
    successGreen: '#10B981',
    successBg: '#ECFDF5',
    warningYellow: '#F59E0B',
    dangerRed: '#EF4444',
    badgeBg: '#F3EFEA',
    pastelChat: '#F4EFE6',
    pastelAudio: '#FAF2E8',
    pastelVideo: '#F5EBE1',
    disabled: '#D6CFCE',
  },

  typography: {
    h1: {
      fontSize: 26,
      fontWeight: '700',
      color: '#2E2A26',
      lineHeight: 34,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700',
      color: '#2E2A26',
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2E2A26',
      lineHeight: 24,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6D6A66',
      lineHeight: 20,
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      color: '#6D6A66',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      color: '#6D6A66',
      lineHeight: 16,
    },
  },

  cards: {
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E8E2D8',
      shadowColor: '#2E2A26',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    hero: {
      backgroundColor: '#B89A6A',
      borderRadius: 24,
      shadowColor: '#9D7D4D',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 6,
    },
  },

  buttons: {
    primary: {
      backgroundColor: '#B89A6A',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#B89A6A',
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      color: '#B89A6A',
      fontSize: 16,
      fontWeight: '700',
    },
    heroButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroButtonText: {
      color: '#B89A6A',
      fontSize: 14,
      fontWeight: '700',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    screenPadding: 20,
  },

  layout: {
    windowWidth: width,
    windowHeight: height,
  },
};
