import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[
        LEGAL_THEME.buttons.secondary,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={LEGAL_THEME.colors.primaryGold} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[LEGAL_THEME.buttons.secondaryText, textStyle, icon && { marginLeft: 8 }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    borderColor: LEGAL_THEME.colors.border,
    backgroundColor: '#FAF8F5',
  },
});
