import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform,
  ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';

const { height } = Dimensions.get('window');

/**
 * GuestLoginModal
 * Shows as a bottom sheet when a guest tries to do an action that needs auth.
 *
 * Props:
 *   visible      — boolean
 *   onClose      — () => void
 *   onSuccess    — (user) => void  called after successful login
 *   actionLabel  — string  e.g. "book a consultation" (shown in header)
 *   defaultRole  — 'client' | 'advocate'  (default: 'client')
 */
export default function GuestLoginModal({
  visible,
  onClose,
  onSuccess,
  actionLabel = 'continue',
  defaultRole = 'client',
}) {
  const { login, register } = useAuth();
  const slideAnim = useRef(new Animated.Value(height)).current;

  const [mode, setMode]       = useState('login');     // 'login' | 'register'
  const [role, setRole]       = useState(defaultRole); // 'client' | 'advocate'
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (visible) {
      setError('');
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(email.trim(), password);
      } else {
        result = await register({ name: name.trim(), email: email.trim(), password, role });
      }
      if (result.success) {
        onSuccess?.(result.user);
        onClose?.();
      } else {
        setError(result.message || 'Something went wrong.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Handle */}
            <View style={s.handle} />

            {/* Close */}
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Header */}
            <View style={s.headerRow}>
              <View style={s.iconBg}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.title}>
                  {mode === 'login' ? 'Sign In to Continue' : 'Create Your Account'}
                </Text>
                <Text style={s.subtitle}>
                  {`Sign in to ${actionLabel}`}
                </Text>
              </View>
            </View>

            {/* Role Toggle */}
            <View style={s.roleRow}>
              <TouchableOpacity
                style={[s.roleBtn, role === 'client' && s.roleBtnActive]}
                onPress={() => setRole('client')}
              >
                <Ionicons
                  name={role === 'client' ? 'person' : 'person-outline'}
                  size={15}
                  color={role === 'client' ? '#fff' : COLORS.primary}
                />
                <Text style={[s.roleTxt, role === 'client' && s.roleTxtActive]}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.roleBtn, role === 'advocate' && s.roleBtnActiveGold]}
                onPress={() => setRole('advocate')}
              >
                <Ionicons
                  name={role === 'advocate' ? 'briefcase' : 'briefcase-outline'}
                  size={15}
                  color={role === 'advocate' ? '#fff' : COLORS.accent}
                />
                <Text style={[s.roleTxt, s.roleTxtGold, role === 'advocate' && s.roleTxtActive]}>
                  Advocate
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fields */}
            {mode === 'register' && (
              <View style={s.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPass}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                <Text style={s.errorTxt}>{error}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.submitTxt}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle login/register */}
            <TouchableOpacity
              style={s.toggleRow}
              onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              <Text style={s.toggleTxt}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={s.toggleLink}>
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={{ height: 16 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 4 },
  iconBg: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: COLORS.primarySurface || '#EEF4FA',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 18, fontWeight: '800', color: '#1A1F36' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Role toggle
  roleRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  roleBtnActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleBtnActiveGold: { backgroundColor: COLORS.accent || '#C9A84C', borderColor: COLORS.accent || '#C9A84C' },
  roleTxt:        { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  roleTxtGold:    { color: COLORS.accent || '#C9A84C' },
  roleTxtActive:  { color: '#fff' },

  // Inputs
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, marginBottom: 12, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1F36' },

  // Error
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 10, marginBottom: 12,
  },
  errorTxt: { fontSize: 12, color: '#DC2626', flex: 1 },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  toggleRow: { alignItems: 'center', marginTop: 16 },
  toggleTxt: { fontSize: 13, color: '#6B7280' },
  toggleLink: { color: COLORS.primary, fontWeight: '700' },
});
