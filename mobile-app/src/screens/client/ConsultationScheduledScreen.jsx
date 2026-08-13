import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';

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
    { icon: 'checkmark-circle', color: '#10B981', label: 'Request Submitted & Paid', done: true },
    { icon: 'person-outline', color: '#FBBF24', label: 'Advocate Being Assigned (within 24h)', done: false },
    { icon: 'document-text-outline', color: '#64748B', label: 'Notice Drafted & Reviewed', done: false },
    { icon: 'send-outline', color: '#64748B', label: 'Notice Sent to Recipient', done: false },
  ] : [
    { icon: 'checkmark-circle', color: '#10B981', label: 'Request Submitted & Paid', done: true },
    { icon: 'person-outline', color: '#FBBF24', label: 'Advocate Being Assigned (within 24h)', done: false },
    { icon: 'chatbubbles-outline', color: '#64748B', label: `${selectedType.title} with Advocate`, done: false },
    { icon: 'shield-checkmark-outline', color: '#64748B', label: 'Case Resolved', done: false },
  ];

  return (
    <SafeScreen backgroundColor="#07080A" barStyle="light-content">
      <StatusBar barStyle="light-content" backgroundColor="#07080A" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
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
            <Ionicons name="time-outline" size={20} color="#FBBF24" />
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
                <View style={[styles.stepCircle, { backgroundColor: step.done ? 'rgba(16, 185, 129, 0.15)' : '#19202E' }]}>
                  <Ionicons name={step.icon} size={18} color={step.color} />
                </View>
                {idx < steps.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: step.done ? '#10B981' : '#263044' }]} />
                )}
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryBtn}
            onPress={() => navigation.navigate('MyBookings')}>
            <Ionicons name="calendar-outline" size={18} color="#07080A" />
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
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingBottom: 48, backgroundColor: '#07080A' },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', alignItems: 'center',
    justifyContent: 'center', marginTop: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', lineHeight: 34, marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 21, marginBottom: 24, paddingHorizontal: 8 },
  bold: { fontWeight: '700', color: '#F8FAFC' },
  highlight: { fontWeight: '800', color: '#D4AF37' },
  requestCard: {
    width: '100%', backgroundColor: '#121722',
    borderRadius: 18, borderWidth: 1, borderColor: '#1E2638', padding: 16, marginBottom: 16,
  },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  requestLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  requestValue: { fontSize: 13, color: '#F8FAFC', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  amountPaid: { color: '#10B981', fontSize: 15, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#1E2638' },
  noticeBanner: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', padding: 14, marginBottom: 24, gap: 10,
  },
  noticeText: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '800', color: '#FBBF24', marginBottom: 4 },
  noticeDesc: { fontSize: 12, color: '#FDE68A', lineHeight: 17 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', alignSelf: 'flex-start', marginBottom: 14 },
  stepsContainer: { width: '100%', marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0, position: 'relative' },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, zIndex: 1,
    borderWidth: 1, borderColor: '#263044',
  },
  stepLine: {
    position: 'absolute', left: 17, top: 36, width: 2, height: 24,
  },
  stepLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', flex: 1, paddingVertical: 10 },
  stepLabelDone: { color: '#F8FAFC', fontWeight: '700' },
  primaryBtn: {
    width: '100%', backgroundColor: '#D4AF37',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, marginBottom: 12,
    elevation: 3, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryBtnText: { color: '#07080A', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    width: '100%', paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#121722', borderWidth: 1, borderColor: '#1E2638', alignItems: 'center',
  },
  secondaryBtnText: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
});
