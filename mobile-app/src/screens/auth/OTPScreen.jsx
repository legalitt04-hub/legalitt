import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Button from '../../components/common/Button';

const OTPScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 4) return;
    navigation.navigate('RoleSelect');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.inner}>
        <Text style={styles.title}>Enter verification{'\n'}code</Text>
        <Text style={styles.subtitle}>Code</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputs.current[i] = ref)}
              value={digit}
              onChangeText={(val) => handleChange(val.slice(-1), i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>
            Didn't receive code? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button title="Next" onPress={handleVerify} disabled={otp.join('').length < 4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: SIZES.screenPadding, paddingTop: 60 },
  title: { fontSize: SIZES.display, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 32 },
  subtitle: { fontSize: SIZES.body, color: COLORS.textMuted, marginBottom: 12 },
  otpRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  otpBox: {
    flex: 1, aspectRatio: 1, borderRadius: SIZES.radiusLg,
    backgroundColor: '#f5f5f5', ...SHADOWS.sm,
    textAlign: 'center', fontSize: 24, fontWeight: '700', color: COLORS.textPrimary,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  resendBtn: { alignItems: 'center', marginTop: 8 },
  resendText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  footer: { padding: SIZES.screenPadding, paddingBottom: 40 },
});

export default OTPScreen;
