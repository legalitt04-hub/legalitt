import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const ConsultationCard = ({
  title,
  description,
  duration,
  price,
  iconName,
  accentColor = LEGAL_THEME.colors.cream,
  onPress,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: accentColor }]}>
          <Ionicons name={iconName} size={24} color={LEGAL_THEME.colors.darkGold} />
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>₹{price}</Text>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descText} numberOfLines={2}>{description}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Ionicons name="time-outline" size={14} color={LEGAL_THEME.colors.secondaryText} />
          <Text style={styles.badgeText}>{duration}</Text>
        </View>

        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={16} color={LEGAL_THEME.colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...LEGAL_THEME.cards.container,
    padding: 18,
    marginBottom: 16,
  },
  selectedContainer: {
    borderColor: LEGAL_THEME.colors.primaryGold,
    borderWidth: 2,
    backgroundColor: '#FFFCF8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryGold,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '500',
    color: LEGAL_THEME.colors.secondaryText,
  },
  bodyContent: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LEGAL_THEME.colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LEGAL_THEME.colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: LEGAL_THEME.colors.secondaryText,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LEGAL_THEME.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
