import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

const LoginRegisterScreen = ({ navigation }) => {
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (!agreed) e.agreed = 'Please accept terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    let res;
    if (mode === 'login') {
      res = await login(form.email, form.password);
    } else {
      res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      if (res.success) navigation.navigate('RoleSelect');
    }
    if (!res.success) Alert.alert('Error', res.message);
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('No ID token');
      const res = await googleLogin(idToken);
      if (!res.success) Alert.alert('Error', res.message);
    } catch (err) {
      if (err.code !== -5) Alert.alert('Google Sign-In failed', err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>Login/Register</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Login/Register in Your Account' : 'Login/Register With Your Account'}
        </Text>

        {mode === 'register' && (
          <Input
            placeholder="Full Name"
            value={form.name}
            onChangeText={set('name')}
            autoCapitalize="words"
            error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />}
          />
        )}

        <Input
          placeholder="E-mail/Mobile No"
          value={form.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          error={errors.email}
          leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
        />

        <Input
          placeholder="Password"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          error={errors.password}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
        />

        {mode === 'register' && (
          <Input
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={18} color={COLORS.textMuted} />}
          />
        )}

        <Button title={mode === 'login' ? 'Next' : 'Register'} onPress={handleSubmit} loading={loading} />

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
              {mode === 'login' ? 'Register' : 'Login'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* OR divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social login buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle} disabled={googleLoading}>
            <Text style={styles.socialIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-facebook" size={24} color="#1877f2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={[styles.checkbox, agreed && styles.checkboxActive]}
          >
            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>
          <Text style={[styles.termsText, errors.agreed && { color: COLORS.error }]}>
            Follow{' '}
            <Text style={styles.link}>Terms & Condition</Text>
            {' | '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: SIZES.screenPadding, paddingTop: 60 },
  title: { fontSize: SIZES.display, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, marginTop: 6 },
  switchBtn: { alignItems: 'center', marginTop: 12 },
  switchText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: SIZES.body },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: {
    width: 64, height: 64, borderRadius: SIZES.radiusMd,
    backgroundColor: '#fff', ...SHADOWS.sm,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  socialIcon: { fontSize: 22, fontWeight: '700', color: '#ea4335' },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { fontSize: SIZES.caption, color: COLORS.textSecondary, flex: 1 },
  link: { color: COLORS.primary, fontWeight: '600' },
});

export default LoginRegisterScreen;
