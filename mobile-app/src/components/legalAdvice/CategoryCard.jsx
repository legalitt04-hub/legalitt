import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const CategoryCard = ({
  iconName,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
          <Ionicons
            name={iconName}
            size={22}
            color={isSelected ? LEGAL_THEME.colors.white : LEGAL_THEME.colors.darkGold}
          />
        </View>

        <View style={[styles.chevronCircle, isSelected && styles.selectedChevronCircle]}>
          <Ionicons
            name={isSelected ? "checkmark" : "chevron-forward"}
            size={14}
            color={isSelected ? LEGAL_THEME.colors.white : LEGAL_THEME.colors.secondaryText}
          />
        </View>
      </View>

      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.descText} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%',
    backgroundColor: LEGAL_THEME.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: LEGAL_THEME.colors.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedContainer: {
    borderColor: LEGAL_THEME.colors.primaryGold,
    backgroundColor: '#FFFCF8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconCircle: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChevronCircle: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
  titleText: {
    fontSize: 15,
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
