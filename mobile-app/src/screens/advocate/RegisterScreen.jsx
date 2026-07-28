import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { sanitizeInput } from '../../utils/security';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    barCouncilId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [termsError, setTermsError] = useState(false);

  const updateForm = (key, value) => {
    // Keep password unsanitized during typing to allow special characters in password, but sanitize other fields
    const cleanValue = key === 'password' ? value : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [key]: cleanValue }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.barCouncilId.trim()) {
      newErrors.barCouncilId = 'Bar Council ID is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must be 8+ characters with letters & numbers';
      }
    }

    if (!agreeToTerms) {
      setTermsError(true);
      Alert.alert(
        'Consent Required',
        'Please read and agree to the Terms & Conditions and Privacy Policy to continue.'
      );
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    // Navigate to OTP screen for email verification first
    // Pass full formData so OTPScreen can complete registration with real name & barCouncilId
    navigation.navigate('OTP', {
      email: formData.email.trim().toLowerCase(),
      role: 'advocate',
      mode: 'register',
      registerData: formData,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.replace('RoleSelect');
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Apply as Advocate</Text>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepText}>Step 1 of 2</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Join Legalitt and start consulting with clients digitally.</Text>
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError
              ]}
              placeholder="Full Name (e.g. Adv. John Doe)"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) => {
                updateForm('name', text);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              autoCapitalize="words"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError
              ]}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => {
                updateForm('email', text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Bar Council ID Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.barCouncilId && styles.inputError
              ]}
              placeholder="Bar Council ID (e.g. MAH/1234/2020)"
              placeholderTextColor="#9CA3AF"
              value={formData.barCouncilId}
              onChangeText={(text) => {
                updateForm('barCouncilId', text);
                if (errors.barCouncilId) setErrors({ ...errors, barCouncilId: null });
              }}
              autoCapitalize="characters"
            />
            {errors.barCouncilId && (
              <Text style={styles.errorText}>{errors.barCouncilId}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError
              ]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={formData.password}
              onChangeText={(text) => {
                updateForm('password', text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Terms & Privacy acceptance */}
          <TouchableOpacity
            style={[
              styles.termsContainer,
              termsError && styles.termsContainerError,
            ]}
            onPress={() => {
              setAgreeToTerms(!agreeToTerms);
              setTermsError(false);
            }}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              agreeToTerms && styles.checkboxChecked,
              termsError && styles.checkboxError,
            ]}>
              {agreeToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.termsText, termsError && styles.termsTextError]}>
              I agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('TermsConditions');
                }}
              >
                Terms &amp; Conditions
              </Text>
              {' and '}
              <Text
                style={styles.termsLink}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('PrivacyPolicy');
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
          {termsError && (
            <Text style={styles.termsErrorHint}>
              ⚠ You must accept the Privacy Policy to continue.
            </Text>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!formData.name || !formData.email || !formData.barCouncilId || !formData.password || !agreeToTerms) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!formData.name || !formData.email || !formData.barCouncilId || !formData.password || !agreeToTerms}
          >
            <Text style={styles.nextButtonText}>Continue to Verification</Text>
          </TouchableOpacity>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdvocateLogin')}>
              <Text style={styles.registerText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  stepBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  termsContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: '#EF4444',
  },
  termsText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 18,
  },
  termsTextError: {
    color: '#991B1B',
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsErrorHint: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -16,
    marginBottom: 20,
    marginLeft: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});

