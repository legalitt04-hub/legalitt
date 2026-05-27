// screens/auth/OTPScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Constants from 'expo-constants';

const OTPScreen = ({ navigation, route }) => {
  const { email, role, mode, password: loginPassword, registerData } = route.params;
  const { register, login } = useAuth();

  // OTP Input
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  // Password Setup (for registration only)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow control
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
    // Send initial OTP E2E
    handleResendOTP();
  }, []);

  const handleOtpChange = (text, index) => {
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) return;

    console.log('Verifying OTP E2E:', otpCode);

    try {
      // 1. Call E2E verify-otp endpoint on backend
      const { data } = await authAPI.verifyOTP(email.trim().toLowerCase(), otpCode, role);

      if (data.success) {
        if (mode === 'login') {
          // LOGIN MODE: OTP verified -> Call login API via context
          const response = await login(
            email.trim().toLowerCase(),
            loginPassword
          );
          if (!response.success) {
            Alert.alert('Verification failed', response.message || 'OTP verification failed');
          }
        } else {
          // REGISTER MODE: OTP verified -> Show password setup
          setOtpVerified(true);
        }
      } else {
        Alert.alert('Verification Failed', 'Incorrect OTP entered.');
      }
    } catch (error) {
      Alert.alert('Verification failed', error.response?.data?.message || 'Incorrect OTP or connection issue.');
    }
  };

  const handleCompleteRegistration = async () => {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters!');
      return;
    }

    try {
      const mobileAppSecret = Constants.expoConfig?.extra?.MOBILE_APP_SECRET || 'mock_captcha_token';
      // Use registerData (name, barCouncilId) if passed from advocate RegisterScreen
      const response = await register({
        name: registerData?.name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        password: newPassword,
        role: role,
        barCouncilId: registerData?.barCouncilId || undefined,
        captchaToken: mobileAppSecret,
      });

      if (!response.success) {
        Alert.alert('Registration Failed', response.message || 'Registration failed');
      } else if (role === 'advocate') {
        // Advocates go to document upload after registration
        navigation.replace('DocumentUpload', { registerData });
      }
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    }
  };

  const handleResendOTP = async () => {
    console.log('Sending Email OTP to:', email);
    try {
      await authAPI.sendOTP(email.trim().toLowerCase());
    } catch (err) {
      console.log('Error triggering OTP resend:', err.message);
    }
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Show OTP Entry Screen
  if (!otpVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Enter verification code</Text>
              <Text style={styles.subtitle}>
                Code sent to {email}
              </Text>
            </View>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend OTP */}
            <TouchableOpacity onPress={handleResendOTP} style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive code?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                otp.join('').length !== 4 && styles.nextButtonDisabled,
              ]}
              onPress={handleVerifyOTP}
              disabled={otp.join('').length !== 4}
            >
              <Text style={styles.nextButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show Password Setup Screen (Registration only)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Password</Text>
            <Text style={styles.subtitle}>
              Set up a secure password for your account
            </Text>
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementText}>
              • At least 6 characters
            </Text>
            <Text style={styles.requirementText}>
              • Passwords must match
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Complete Registration Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!newPassword || !confirmPassword) && styles.nextButtonDisabled,
            ]}
            onPress={handleCompleteRegistration}
            disabled={!newPassword || !confirmPassword}
          >
            <Text style={styles.nextButtonText}>Complete Registration</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  requirementsContainer: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  requirementText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTPScreen;
