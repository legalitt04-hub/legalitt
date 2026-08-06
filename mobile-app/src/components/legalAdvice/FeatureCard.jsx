import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const FeatureCard = ({ iconName, title, description }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={20} color={LEGAL_THEME.colors.primaryGold} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descText}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: LEGAL_THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 4,
  },
  descText: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
    lineHeight: 15,
  },
});
