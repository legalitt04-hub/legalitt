import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVY = '#012464';
const TEAL = '#0D9488';
const DANGER = '#DC2626';

const DELETION_REASONS = [
  "I no longer need this service",
  "I have privacy concerns",
  "I found a better alternative",
  "The app doesn't meet my needs",
  "I have multiple accounts",
  "Other",
];

export default function DataDeletionScreen({ navigation }) {
  const { logout } = useAuth();
  const [selectedReason, setSelectedReason] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = info, 2 = form

  const handleDeleteAccount = async () => {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select a reason for account deletion.');
      return;
    }
    if (!confirmed) {
      Alert.alert('Confirmation Required', 'Please check the confirmation box to continue.');
      return;
    }

    Alert.alert(
      '⚠️ Final Warning',
      'This action is PERMANENT and IRREVERSIBLE. All your data including profile, chat history, bookings, and FIR drafts will be deleted forever.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete('/users/me');

              // Clear all local storage
              await SecureStore.deleteItemAsync('authToken');
              await SecureStore.deleteItemAsync('refreshToken');
              await AsyncStorage.clear();

              // Logout and clear auth state
              await logout();

              Alert.alert(
                'Account Deleted',
                'Your account and all associated data have been permanently deleted. We\'re sorry to see you go.',
              );
            } catch (err) {
              console.error('Delete account error:', err);
              Alert.alert(
                'Deletion Failed',
                err.response?.data?.message || 'Something went wrong. Please try again or contact support@legalitt.com',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DANGER} />

      {/* Header */}
      <LinearGradient colors={[DANGER, '#991B1B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="trash" size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 2 }} />
          <Text style={styles.headerTitle}>Delete Account</Text>
          <Text style={styles.headerSub}>GDPR Data Erasure Request</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Warning card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconRow}>
            <Ionicons name="warning" size={24} color={DANGER} />
            <Text style={styles.warningTitle}>Permanent & Irreversible</Text>
          </View>
          <Text style={styles.warningText}>
            Deleting your account will immediately and permanently remove all your data from Legalitt servers. This cannot be undone.
          </Text>
        </View>

        {/* What gets deleted */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={18} color={NAVY} />
            <Text style={styles.sectionTitle}>What will be deleted</Text>
          </View>
          {[
            { icon: 'person', label: 'Your profile & account information' },
            { icon: 'chatbubbles', label: 'All chat conversations with advocates' },
            { icon: 'calendar', label: 'Booking history & consultation records' },
            { icon: 'document-text', label: 'FIR drafts & AI chat history' },
            { icon: 'bookmark', label: 'Saved advocates list' },
            { icon: 'notifications', label: 'Notification preferences & tokens' },
          ].map((item, i) => (
            <View key={i} style={styles.deleteItem}>
              <View style={styles.deleteIconWrap}>
                <Ionicons name={item.icon} size={16} color={DANGER} />
              </View>
              <Text style={styles.deleteItemText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* What's retained (legal requirement) */}
        <View style={[styles.section, styles.retainSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="archive-outline" size={18} color="#92400E" />
            <Text style={[styles.sectionTitle, { color: '#92400E' }]}>Retained for legal compliance</Text>
          </View>
          <Text style={styles.retainText}>
            Transaction records and payment history may be retained in anonymised form for 7 years as required under Indian tax laws (IT Act 2000, GST regulations). These cannot identify you personally.
          </Text>
        </View>

        {/* Step 2: Reason */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={18} color={NAVY} />
            <Text style={styles.sectionTitle}>Reason for leaving</Text>
          </View>
          <Text style={styles.reasonSub}>Help us improve — please select a reason:</Text>
          {DELETION_REASONS.map((reason, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.reasonItem, selectedReason === reason && styles.reasonItemSelected]}
              onPress={() => setSelectedReason(reason)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, selectedReason === reason && styles.radioOuterSelected]}>
                {selectedReason === reason && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirmation checkbox */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.confirmRow}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
              {confirmed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.confirmText}>
              I understand that deleting my account is permanent and all my data will be immediately and irreversibly erased from Legalitt.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alternatives */}
        <View style={styles.alternativesBox}>
          <Text style={styles.altTitle}>Before you go…</Text>
          <Text style={styles.altText}>You can also:</Text>
          <TouchableOpacity style={styles.altBtn} onPress={() => navigation.navigate('ProfileEdit')}>
            <Ionicons name="create-outline" size={16} color={TEAL} />
            <Text style={styles.altBtnText}>Edit your profile information</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.altBtn}
            onPress={() => Alert.alert('Contact Support', 'Email us at: support@legalitt.com\nWe\'ll respond within 24 hours.')}
          >
            <Ionicons name="help-buoy-outline" size={16} color={TEAL} />
            <Text style={styles.altBtnText}>Contact support for help</Text>
          </TouchableOpacity>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={[styles.deleteBtn, (!confirmed || !selectedReason || loading) && styles.deleteBtnDisabled]}
          onPress={handleDeleteAccount}
          disabled={!confirmed || !selectedReason || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.deleteBtnText}>Permanently Delete My Account</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your deletion will be processed immediately. A confirmation will be sent to your registered email. For questions: <Text style={{ color: TEAL }}>privacy@legalitt.com</Text>
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF2F2' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  warningCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  warningIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  warningTitle: { fontSize: 15, fontWeight: '800', color: DANGER },
  warningText: { fontSize: 13, color: '#7F1D1D', lineHeight: 20 },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  retainSection: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: NAVY },

  deleteItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  deleteIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
  },
  deleteItemText: { flex: 1, fontSize: 13, color: '#374151' },

  retainText: { fontSize: 13, color: '#78350F', lineHeight: 20 },

  reasonSub: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  reasonItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E7EB', marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  reasonItemSelected: { borderColor: TEAL, backgroundColor: '#F0FDFA' },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: TEAL },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: TEAL,
  },
  reasonText: { flex: 1, fontSize: 13, color: '#374151' },
  reasonTextSelected: { color: TEAL, fontWeight: '600' },

  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: DANGER, borderColor: DANGER },
  confirmText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },

  alternativesBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  altTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 4 },
  altText: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  altBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10, borderWidth: 1,
    borderColor: '#CCFBF1', marginBottom: 8,
  },
  altBtnText: { fontSize: 13, color: TEAL, fontWeight: '600' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: DANGER,
    borderRadius: 14, paddingVertical: 16,
    marginBottom: 16,
    shadowColor: DANGER, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  deleteBtnDisabled: { backgroundColor: '#FCA5A5', shadowOpacity: 0 },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  footerNote: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 17 },
});
