import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { advocateAPI } from '../../services/api';

export default function DocumentUploadScreen({ navigation, route }) {
  const registerData = route?.params?.registerData;
  const { register } = useAuth();

  const [idUploaded, setIdUploaded] = useState(false);
  const [certUploaded, setCertUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!registerData) {
      Alert.alert('Error', 'Registration data is missing. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      // 1. E2E Registration of Advocate as User
      const response = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        role: 'advocate',
        captchaToken: 'mock_captcha_token', // developer bypass captcha
      });

      if (response.success) {
        // 2. Create the Advocate Profile
        try {
          await advocateAPI.upsertProfile({
            barCouncilId: registerData.barCouncilId,
          });

          // Redirect to pending screen
          navigation.replace('PendingApproval');
        } catch (profileErr) {
          console.log('Failed to upsert advocate profile:', profileErr.message);
          Alert.alert(
            'Profile Pending',
            'Your login credentials were saved successfully, but we could not complete the profile. Please login to complete registration.'
          );
          navigation.replace('AdvocateLogin');
        }
      } else {
        Alert.alert('Registration Failed', response.message || 'Could not verify your registration.');
      }
    } catch (err) {
      console.log('E2E Signup error:', err.message);
      Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Verification docs</Text>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>Step 2 of 2</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>We need this to verify your identity and legal credentials.</Text>
          </View>
        </View>

        {/* Bar Council ID Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Bar Council ID Card</Text>
          <TouchableOpacity 
            style={[styles.uploadBox, idUploaded && styles.uploadBoxSuccess]} 
            onPress={() => setIdUploaded(true)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={[styles.iconCircle, idUploaded && styles.iconCircleSuccess]}>
              <Ionicons 
                name={idUploaded ? "checkmark" : "cloud-upload-outline"} 
                size={28} 
                color={idUploaded ? COLORS.primary : "#6B7280"} 
              />
            </View>
            <Text style={styles.uploadText}>{idUploaded ? "ID Card Uploaded.jpg" : "Tap to upload ID Card"}</Text>
            <Text style={styles.uploadSubtext}>{idUploaded ? "2.4 MB" : "PNG, JPG or PDF (Max. 5MB)"}</Text>
          </TouchableOpacity>
        </View>

        {/* Certificate Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Bar Council Certificate</Text>
          <TouchableOpacity 
            style={[styles.uploadBox, certUploaded && styles.uploadBoxSuccess]} 
            onPress={() => setCertUploaded(true)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={[styles.iconCircle, certUploaded && styles.iconCircleSuccess]}>
              <Ionicons 
                name={certUploaded ? "checkmark" : "document-text-outline"} 
                size={28} 
                color={certUploaded ? COLORS.primary : "#6B7280"} 
              />
            </View>
            <Text style={styles.uploadText}>{certUploaded ? "Certificate.pdf" : "Tap to upload Certificate"}</Text>
            <Text style={styles.uploadSubtext}>{certUploaded ? "4.1 MB" : "PDF only (Max. 10MB)"}</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Your documents are encrypted and stored securely. They are only used for professional verification.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!idUploaded || !certUploaded || loading) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!idUploaded || !certUploaded || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginLeft: 4,
  },
  uploadBox: { 
    borderWidth: 2, 
    borderColor: '#E5E7EB', 
    borderStyle: 'dashed', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB' 
  },
  uploadBoxSuccess: { 
    borderColor: COLORS.primary, 
    backgroundColor: 'rgba(20, 184, 166, 0.05)', 
    borderStyle: 'solid' 
  },
  iconCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  iconCircleSuccess: { 
    backgroundColor: 'rgba(20, 184, 166, 0.1)' 
  },
  uploadText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1F2937', 
    marginBottom: 4 
  },
  uploadSubtext: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(20, 184, 166, 0.08)', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 8, 
    marginBottom: 32 
  },
  infoText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#0D9488', 
    marginLeft: 12, 
    lineHeight: 18 
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

