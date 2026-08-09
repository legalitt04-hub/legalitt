import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset', SUCCESS: 'success' };

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [token, setToken] = useState('');

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ─── Step 1: Send OTP to email ────────────────────────────────────────────
  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      startCountdown();
      setStep(STEPS.OTP);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return Alert.alert('Invalid OTP', 'Please enter the full 6-digit OTP.');
    setLoading(true);
    try {
      const res = await authAPI.verifyResetOTP(email.trim(), otpValue);
      setToken(res.data?.data?.resetToken || '');
      setStep(STEPS.RESET);
    } catch (err) {
      Alert.alert('Invalid OTP', err?.response?.data?.message || 'The OTP entered is incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPassword.length < 8) return Alert.alert('Too Short', 'Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return Alert.alert('Mismatch', 'Passwords do not match.');
    setLoading(true);
    try {
      await authAPI.resetPassword(email.trim(), otp.join(''), newPassword);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handler ────────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    const digits = val.replace(/\D/g, '');
    const newOtp = [...otp];
    if (digits.length > 1) {
      // Paste scenario
      const pasted = digits.slice(0, 6).split('');
      const filled = [...Array(6)].map((_, i) => pasted[i] || '');
      setOtp(filled);
      otpRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      return;
    }
    newOtp[idx] = digits;
    setOtp(newOtp);
    if (digits && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = ({ nativeEvent: { key } }, idx) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (step === STEPS.EMAIL || step === STEPS.SUCCESS) navigation.goBack();
            else setStep(step === STEPS.RESET ? STEPS.OTP : STEPS.EMAIL);
          }}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Logo + Title */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === STEPS.SUCCESS ? 'checkmark-circle' : 'lock-open-outline'}
                size={36}
                color={step === STEPS.SUCCESS ? '#10B981' : '#14B8A6'}
              />
            </View>
            <Text style={styles.title}>
              {step === STEPS.EMAIL ? 'Forgot Password' :
               step === STEPS.OTP   ? 'Enter OTP' :
               step === STEPS.RESET ? 'New Password' :
               'Password Reset! ✓'}
            </Text>
            <Text style={styles.subtitle}>
              {step === STEPS.EMAIL ? 'Enter your registered email to receive a reset OTP.' :
               step === STEPS.OTP   ? `A 6-digit OTP was sent to\n${email}` :
               step === STEPS.RESET ? 'Choose a strong new password for your account.' :
               'Your password has been updated successfully.'}
            </Text>
          </View>

          {/* ── Email Step ── */}
          {step === STEPS.EMAIL && (
            <View style={styles.formBox}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email} onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address" autoCapitalize="none"
                  autoFocus returnKeyType="send" onSubmitEditing={handleSendOTP}
                />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSendOTP} disabled={loading} activeOpacity={0.88}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset OTP</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* ── OTP Step ── */}
          {step === STEPS.OTP && (
            <View style={styles.formBox}>
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={r => otpRefs.current[idx] = r}
                    style={[styles.otpCell, digit ? styles.otpCellFilled : null]}
                    value={digit}
                    onChangeText={val => handleOtpChange(val, idx)}
                    onKeyPress={e => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.88}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn}
                onPress={countdown === 0 ? handleSendOTP : undefined} disabled={countdown > 0}>
                <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── New Password Step ── */}
          {step === STEPS.RESET && (
            <View style={styles.formBox}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="key-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newPassword} onChangeText={setNewPassword}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="key-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirmPassword} onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
              </View>

              {/* Password strength hints */}
              <View style={styles.hints}>
                {[
                  { text: 'Minimum 8 characters', pass: newPassword.length >= 8 },
                  { text: 'Passwords match', pass: newPassword === confirmPassword && confirmPassword.length > 0 },
                ].map((h, i) => (
                  <View key={i} style={styles.hintRow}>
                    <Ionicons name={h.pass ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14} color={h.pass ? '#10B981' : '#D1D5DB'} />
                    <Text style={[styles.hintText, h.pass && styles.hintTextPass]}>{h.text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleResetPassword} disabled={loading} activeOpacity={0.88}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Success Step ── */}
          {step === STEPS.SUCCESS && (
            <View style={styles.formBox}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981' }]}
                onPress={() => navigation.navigate('LoginRegister')}>
                <Text style={styles.btnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.secureNote}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#9CA3AF" /> Secured & encrypted
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, marginBottom: 24,
  },
  heroSection: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  formBox: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    backgroundColor: '#F9FAFB', paddingHorizontal: 14, height: 52, marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1F2937' },
  btn: {
    height: 54, backgroundColor: '#14B8A6', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  otpCell: {
    flex: 1, height: 56, borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: 14, fontSize: 22, fontWeight: '700', color: '#1F2937',
    backgroundColor: '#F9FAFB', textAlign: 'center',
  },
  otpCellFilled: { borderColor: '#14B8A6', backgroundColor: '#ECFDF5' },
  resendBtn: { marginTop: 16, alignItems: 'center' },
  resendText: { fontSize: 14, fontWeight: '600', color: '#14B8A6' },
  resendDisabled: { color: '#9CA3AF' },
  hints: { marginBottom: 20, gap: 6 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { fontSize: 12, color: '#9CA3AF' },
  hintTextPass: { color: '#10B981' },
  secureNote: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24 },
});
