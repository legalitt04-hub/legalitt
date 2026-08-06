import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const TrustBadge = () => {
  const badges = [
    { icon: 'shield-checkmark-outline', text: 'Secure Payments' },
    { icon: 'lock-closed-outline', text: '256-Bit Encrypted' },
    { icon: 'ribbon-outline', text: 'Verified Lawyers' },
    { icon: 'refresh-circle-outline', text: 'Money Back Guarantee' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        {badges.map((b, idx) => (
          <View key={idx} style={styles.badgeItem}>
            <Ionicons name={b.icon} size={14} color={LEGAL_THEME.colors.primaryGold} />
            <Text style={styles.badgeText}>{b.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LEGAL_THEME.colors.cream,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '47%',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LEGAL_THEME.colors.secondaryText,
  },
});
