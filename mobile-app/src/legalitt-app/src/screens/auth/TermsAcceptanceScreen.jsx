import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import Svg, { Path, G } from 'react-native-svg';

const ShieldLogo = ({ size = 80 }) => {
  const scale = size / 100;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G transform={`scale(${scale})`}>
        <Path
          d="M50 10 L85 25 L85 55 Q85 75 50 90 Q15 75 15 55 L15 25 Z"
          fill={COLORS.primary || '#14B8A6'}
        />
        <Path
          d="M45 35 L55 35 M50 35 L50 60 M35 40 L45 40 L40 50 L30 50 Z M55 40 L65 40 L70 50 L60 50 Z M40 65 L60 65"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
          fillOpacity="0.9"
        />
      </G>
    </Svg>
  );
};

export default function TermsAcceptanceScreen({ navigation }) {
  const { acceptConsent } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert(
        'Consent Required',
        'Please read and agree to both the Terms & Conditions and Privacy Policy to continue using Legalitt.'
      );
      return;
    }

    setLoading(true);
    try {
      await acceptConsent();
    } catch (err) {
      console.error('Error during consent acceptance:', err);
      Alert.alert('Error', 'Unable to save your acceptance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top visual section */}
        <View style={styles.visualSection}>
          <ShieldLogo size={90} />
          <Text style={styles.appName}>Legalitt</Text>
          <Text style={styles.tagline}>Your trusted legal companion</Text>
        </View>

        {/* Welcome message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.title}>Welcome to Legalitt</Text>
          <Text style={styles.subtitle}>
            To protect your privacy and ensure compliance with GDPR and local data protection regulations, please review and accept our terms before starting.
          </Text>
        </View>

        {/* Info Highlights */}
        <View style={styles.highlights}>
          <View style={styles.highlightItem}>
            <View style={[styles.iconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#0284C7" />
            </View>
            <View style={styles.highlightTextWrap}>
              <Text style={styles.highlightTitle}>GDPR Compliance & Rights</Text>
              <Text style={styles.highlightDesc}>Full control over your data. Exercise your rights to access, rectification, or complete erasure directly in Settings.</Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="lock-closed" size={18} color="#16A34A" />
            </View>
            <View style={styles.highlightTextWrap}>
              <Text style={styles.highlightTitle}>Secure & Encrypted</Text>
              <Text style={styles.highlightDesc}>Your conversations, consultations, and documents are securely encrypted in transit and at rest.</Text>
            </View>
          </View>
        </View>

        {/* Checkbox section */}
        <View style={styles.consentBox}>
          
          {/* Terms Agreement Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>
                I read and agree to the{' '}
                <Text
                  style={styles.linkText}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('TermsConditions');
                  }}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Privacy Agreement Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
              {agreedToPrivacy && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>
                I read and agree to the{' '}
                <Text
                  style={styles.linkText}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('PrivacyPolicy');
                  }}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Quick Read Links */}
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksLabel}>Tap below to read the complete policies:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('TermsConditions')}
            >
              <Ionicons name="document-text-outline" size={16} color={COLORS.primary || '#14B8A6'} />
              <Text style={styles.outlineBtnText}>Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Ionicons name="shield-outline" size={16} color={COLORS.primary || '#14B8A6'} />
              <Text style={styles.outlineBtnText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!agreedToTerms || !agreedToPrivacy || loading) && styles.continueBtnDisabled
          ]}
          onPress={handleContinue}
          disabled={!agreedToTerms || !agreedToPrivacy || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <LinearGradient
              colors={[COLORS.primary || '#14B8A6', COLORS.primaryDark || '#0D9488']}
              style={styles.gradientBtn}
            >
              <Text style={styles.continueBtnText}>Accept & Continue</Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  visualSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#012464',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#012464',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  highlights: {
    marginBottom: 24,
    gap: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightTextWrap: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  highlightDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  consentBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary || '#14B8A6',
    borderColor: COLORS.primary || '#14B8A6',
  },
  labelContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary || '#14B8A6',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  quickLinks: {
    marginBottom: 24,
  },
  quickLinksLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary || '#14B8A6',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: {
    fontSize: 12,
    color: COLORS.primary || '#14B8A6',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  continueBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
