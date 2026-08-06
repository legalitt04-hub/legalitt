import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { PrimaryButton } from './PrimaryButton';

export const EmptyState = ({
  title = "No Data Found",
  subtitle = "We couldn't find what you were looking for.",
  iconName = "search-outline",
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={36} color={LEGAL_THEME.colors.primaryGold} />
      </View>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
      {actionTitle && onAction && (
        <PrimaryButton title={actionTitle} onPress={onAction} style={styles.actionBtn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtn: {
    paddingHorizontal: 24,
  },
});
