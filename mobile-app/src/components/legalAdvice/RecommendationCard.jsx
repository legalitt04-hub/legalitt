import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const RecommendationCard = ({ title, items = [], iconName = "checkmark-circle-outline" }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={18} color={LEGAL_THEME.colors.primaryGold} />
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.bulletsList}>
        {items.map((bullet, index) => (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  divider: {
    height: 1,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 12,
  },
  bulletsList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryGold,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: LEGAL_THEME.colors.primaryText,
    lineHeight: 18,
  },
});
