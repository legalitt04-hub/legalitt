import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const LogoHeader = ({ onBack, title, rightElement }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color={LEGAL_THEME.colors.primaryText} />
      </TouchableOpacity>

      <View style={styles.centerContainer}>
        {title ? (
          <Text style={styles.titleText}>{title}</Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {rightElement || <View style={{ width: 40 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LEGAL_THEME.spacing.screenPadding,
    backgroundColor: LEGAL_THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: LEGAL_THEME.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LEGAL_THEME.colors.cream,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: LEGAL_THEME.colors.primaryText,
  },
  logoAccent: {
    color: LEGAL_THEME.colors.primaryGold,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
