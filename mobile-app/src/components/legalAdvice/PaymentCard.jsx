import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const PaymentCard = ({
  id,
  title,
  subtitle,
  iconName,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        isSelected && styles.selectedPaymentCard,
      ]}
      onPress={() => onSelect(id)}
      activeOpacity={0.85}
    >
      <View style={styles.leftRow}>
        <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
          {isSelected && <View style={styles.radioInnerDot} />}
        </View>

        <View style={styles.iconBox}>
          <Ionicons name={iconName} size={22} color={LEGAL_THEME.colors.darkGold} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={LEGAL_THEME.colors.secondaryText} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LEGAL_THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: LEGAL_THEME.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  selectedPaymentCard: {
    borderColor: LEGAL_THEME.colors.primaryGold,
    backgroundColor: '#FFFCF8',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LEGAL_THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedRadioCircle: {
    borderColor: LEGAL_THEME.colors.primaryGold,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  subtitleText: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
    marginTop: 2,
  },
});
