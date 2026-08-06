import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const TextArea = ({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength = 500,
  required = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {label && (
          <Text style={styles.label}>
            {label} {required && <Text style={styles.requiredStar}>*</Text>}
          </Text>
        )}
        <Text style={styles.counterText}>
          {value ? value.length : 0}/{maxLength}
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LEGAL_THEME.colors.secondaryText}
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: LEGAL_THEME.colors.primaryText,
  },
  requiredStar: {
    color: '#EF4444',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '500',
    color: LEGAL_THEME.colors.secondaryText,
  },
  inputWrapper: {
    backgroundColor: LEGAL_THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    padding: 12,
    minHeight: 110,
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    color: LEGAL_THEME.colors.primaryText,
    lineHeight: 20,
  },
});
