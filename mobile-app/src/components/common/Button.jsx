import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Button = ({
  title, onPress, loading = false, disabled = false,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'lg', // sm | md | lg
  style, textStyle, icon, fullWidth = true,
}) => {
  const heights = { sm: 40, md: 48, lg: SIZES.buttonHeight };
  const fontSizes = { sm: 13, md: 14, lg: 16 };
  const h = heights[size];
  const fs = fontSizes[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[{ width: fullWidth ? '100%' : undefined }, style]}
      >
        <LinearGradient
          colors={disabled ? ['#9ca3af', '#9ca3af'] : [COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.btn, { height: h, borderRadius: h / 2 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.row}>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text style={[styles.primaryText, { fontSize: fs }, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.btn, styles.outlineBtn, { height: h, borderRadius: h / 2, width: fullWidth ? '100%' : undefined },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[styles.outlineText, { fontSize: fs }, textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.btn, styles.secondaryBtn, { height: h, borderRadius: h / 2, width: fullWidth ? '100%' : undefined },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[styles.secondaryText, { fontSize: fs }, textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.7} style={style}>
      <Text style={[{ color: COLORS.primary, fontSize: fs, fontWeight: '600' }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  outlineBtn: { borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: 'transparent' },
  outlineText: { color: COLORS.primary, fontWeight: '600' },
  secondaryBtn: { backgroundColor: COLORS.primaryLight },
  secondaryText: { color: COLORS.primary, fontWeight: '600' },
});

export default Button;
