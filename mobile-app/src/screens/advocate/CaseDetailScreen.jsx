import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatDate, formatINR } from '../../utils/helpers';

const CaseDetailScreen = ({ route, navigation }) => {
  const { booking } = route.params || {};
  if (!booking) return null;

  const client = booking.client || {};

  const handleAccept = async () => {
    try {
      await bookingAPI.updateStatus(booking._id, { status: 'confirmed' });
      Alert.alert('Success', 'Booking confirmed!');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not confirm booking.'); }
  };

  const handleReject = () => {
    Alert.alert('Reject Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await bookingAPI.updateStatus(booking._id, { status: 'cancelled', cancellationReason: 'Rejected by advocate' });
          navigation.goBack();
        } catch { Alert.alert('Error', 'Could not reject booking.'); }
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Case Requests</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={{ padding: 6 }}><Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={{ padding: 6 }}><Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 120 }}>
        {/* Client Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Info</Text>
          <Text style={styles.clientName}>{client.name || 'Client'}</Text>
          <Text style={styles.clientPhone}>{client.phone || 'Phone not shared'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.meta}>{client.city || 'India'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>{formatDate(booking.createdAt, 'relative')}</Text>
          </View>
        </View>

        {/* Case Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Case Type</Text>
          <View style={styles.caseTypeRow}>
            <Ionicons name="scale-outline" size={20} color={COLORS.primary} />
            <Text style={styles.caseType}>{booking.issue?.split('\n')[0] || 'Legal matter'}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{booking.issue || 'No description provided.'}</Text>
        </View>

        {/* Fee */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultation Fee</Text>
          <Text style={styles.fee}>{formatINR(booking.payment?.amount)}</Text>
          <Text style={styles.feeType}>{booking.type === 'video' ? 'Video Consultation' : 'In-person Consultation'}</Text>
        </View>

        {/* Date */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scheduled</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.meta}>{formatDate(booking.date)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.meta}>{booking.timeSlot?.startTime || 'TBD'}</Text>
          </View>
        </View>
      </ScrollView>

      {booking.status === 'pending' && (
        <View style={styles.footer}>
          <Button title="Accept" onPress={handleAccept} style={{ flex: 1, marginRight: 12 }} />
          <Button title="Reject" variant="outline" onPress={handleReject} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  title: { flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  card: { backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, marginBottom: SIZES.md, ...SHADOWS.sm },
  cardTitle: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SIZES.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  clientName: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  clientPhone: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.sm, gap: 4 },
  meta: { fontSize: SIZES.caption, color: COLORS.textMuted },
  metaDot: { fontSize: SIZES.caption, color: COLORS.textMuted },
  caseTypeRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  caseType: { fontSize: SIZES.body, fontWeight: '600', color: COLORS.textPrimary },
  description: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  fee: { fontSize: SIZES.heading, fontWeight: '900', color: COLORS.primary },
  feeType: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', padding: SIZES.screenPadding, paddingBottom: 36, borderTopWidth: 1, borderColor: '#e5e7eb' },
});

export default CaseDetailScreen;
