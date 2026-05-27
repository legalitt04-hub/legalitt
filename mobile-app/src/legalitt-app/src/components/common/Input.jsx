import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Input = ({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  keyboardType = 'default', autoCapitalize = 'none', error,
  leftIcon, rightIcon, onRightIconPress, multiline = false,
  numberOfLines = 1, style, inputStyle, editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        focused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
        multiline && { height: undefined, minHeight: 120, paddingVertical: 12, alignItems: 'flex-start' },
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          style={[
            styles.input,
            leftIcon && { paddingLeft: 0 },
            multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
            inputStyle,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>{rightIcon}</TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.md },
  label: { fontSize: SIZES.caption, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SIZES.lg, height: SIZES.inputHeight,
    ...SHADOWS.sm,
  },
  focused: { borderColor: COLORS.primary, backgroundColor: '#fff' },
  error: { borderColor: COLORS.error },
  disabled: { opacity: 0.6 },
  input: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary, paddingVertical: 0 },
  leftIcon: { marginRight: 10 },
  rightIcon: { marginLeft: 8, padding: 4 },
  errorText: { fontSize: SIZES.tiny, color: COLORS.error, marginTop: 4, marginLeft: 4 },
});

export default Input;
