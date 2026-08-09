import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export default function ConsultationScheduledScreen({ navigation, route }) {
  const bookingData = route?.params?.bookingData || {};
  const {
    requestId = 'LEG-XXXXXX',
    selectedType = { title: 'Chat Consultation' },
    selectedMatter = { title: 'Property Law' },
    serviceType = 'legal_advice',
    clientDetails = {},
    totalAmount = 0,
  } = bookingData;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const isLegalNotice = serviceType === 'legal_notice';

  const steps = isLegalNotice ? [
    { icon: 'checkmark-circle', color: '#10B981', label: 'Request Submitted', done: true },
    { icon: 'person-outline', color: '#F59E0B', label: 'Advocate Being Assigned (within 24h)', done: false },
    { icon: 'document-text-outline', color: '#6B7280', label: 'Notice Drafted & Reviewed', done: false },
    { icon: 'send-outline', color: '#6B7280', label: 'Notice Sent to Recipient', done: false },
  ] : [
    { icon: 'checkmark-circle', color: '#10B981', label: 'Request Submitted & Paid', done: true },
    { icon: 'person-outline', color: '#F59E0B', label: 'Advocate Being Assigned (within 24h)', done: false },
    { icon: 'chatbubbles-outline', color: '#6B7280', label: `${selectedType.title} with Advocate`, done: false },
    { icon: 'shield-checkmark-outline', color: '#6B7280', label: 'Case Resolved', done: false },
  ];

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>
            {isLegalNotice ? 'Legal Notice Request\nSubmitted!' : 'Request Submitted\nSuccessfully!'}
          </Text>
          <Text style={styles.subtitle}>
            Payment confirmed ✓ We will assign a verified advocate to your{' '}
            <Text style={styles.bold}>{selectedMatter.title}</Text> case within{' '}
            <Text style={styles.highlight}>24 hours</Text>.
          </Text>

          {/* Request ID Card */}
          <View style={styles.requestCard}>
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>Request ID</Text>
              <Text style={styles.requestValue}>{requestId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>Service</Text>
              <Text style={styles.requestValue}>{selectedType.title}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>Legal Matter</Text>
              <Text style={styles.requestValue}>{selectedMatter.title}</Text>
            </View>
            {totalAmount > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Amount Paid</Text>
                  <Text style={[styles.requestValue, styles.amountPaid]}>₹{totalAmount}</Text>
                </View>
              </>
            )}
          </View>

          {/* 24h Notice Banner */}
          <View style={styles.noticeBanner}>
            <Ionicons name="time-outline" size={20} color="#D97706" />
            <View style={styles.noticeText}>
              <Text style={styles.noticeTitle}>Advocate Assignment in Progress</Text>
              <Text style={styles.noticeDesc}>
                Our team is matching you with the best available advocate for your case.
                You'll receive a notification once assigned.
              </Text>
            </View>
          </View>

          {/* Progress Steps */}
          <Text style={styles.stepsTitle}>What Happens Next</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepCircle, { backgroundColor: step.done ? '#ECFDF5' : '#F3F4F6' }]}>
                  <Ionicons name={step.icon} size={18} color={step.color} />
                </View>
                {idx < steps.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: step.done ? '#10B981' : '#E5E7EB' }]} />
                )}
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryBtn}
            onPress={() => navigation.navigate('MyBookings')}>
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>View My Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}
            onPress={() => navigation.navigate('ClientMain')}>
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingBottom: 48 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#ECFDF5', alignItems: 'center',
    justifyContent: 'center', marginTop: 24, marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1F2937', textAlign: 'center', lineHeight: 34, marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  bold: { fontWeight: '700', color: '#1F2937' },
  highlight: { fontWeight: '700', color: '#14B8A6' },
  requestCard: {
    width: '100%', backgroundColor: '#F9FAFB',
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 16,
  },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  requestLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  requestValue: { fontSize: 13, color: '#1F2937', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  amountPaid: { color: '#10B981', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  noticeBanner: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFBEB', borderRadius: 14,
    borderWidth: 1, borderColor: '#FDE68A', padding: 14, marginBottom: 24, gap: 10,
  },
  noticeText: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  noticeDesc: { fontSize: 12, color: '#78350F', lineHeight: 17 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', alignSelf: 'flex-start', marginBottom: 14 },
  stepsContainer: { width: '100%', marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0, position: 'relative' },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, zIndex: 1,
  },
  stepLine: {
    position: 'absolute', left: 17, top: 36, width: 2, height: 24,
  },
  stepLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', flex: 1, paddingVertical: 10 },
  stepLabelDone: { color: '#1F2937', fontWeight: '700' },
  primaryBtn: {
    width: '100%', backgroundColor: '#14B8A6',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    width: '100%', paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
  },
  secondaryBtnText: { color: '#374151', fontSize: 15, fontWeight: '600' },
});
