import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const SummaryCard = ({ title, items = [], onEdit }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>{title}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={14} color={LEGAL_THEME.colors.primaryGold} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.labelText}>{item.label}</Text>
            <Text style={styles.valueText} numberOfLines={2}>{item.value}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryGold,
  },
  divider: {
    height: 1,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 12,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelText: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    width: '40%',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: LEGAL_THEME.colors.primaryText,
    width: '58%',
    textAlign: 'right',
  },
});
