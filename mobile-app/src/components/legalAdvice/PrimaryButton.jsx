import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const PrimaryButton = ({
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
        LEGAL_THEME.buttons.primary,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={LEGAL_THEME.colors.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[LEGAL_THEME.buttons.primaryText, textStyle, icon && { marginLeft: 8 }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: LEGAL_THEME.colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
});
