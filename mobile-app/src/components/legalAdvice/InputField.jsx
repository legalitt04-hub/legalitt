import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  iconName,
  error,
  required = false,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {iconName && (
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 16 }}>{iconName}</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LEGAL_THEME.colors.secondaryText}
          keyboardType={keyboardType}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LEGAL_THEME.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  iconBox: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: LEGAL_THEME.colors.primaryText,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
});
