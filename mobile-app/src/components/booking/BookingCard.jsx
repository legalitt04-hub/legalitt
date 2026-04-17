import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatDate, formatINR, getBookingStatusConfig, truncate, getInitials } from '../../utils/helpers';

/**
 * Booking card used in:
 * - Client's "My Bookings" list
 * - Advocate's case list
 * Supports two variants: 'client' (shows advocate) and 'advocate' (shows client)
 */
const BookingCard = ({
  booking,
  variant = 'client', // 'client' | 'advocate'
  onPress,
  onAction, // (bookingId, action) => void — for advocate accept/reject
  showActions = false,
}) => {
  const statusConfig = getBookingStatusConfig(booking.status);
  const person = variant === 'client'
    ? booking.advocate?.user
    : booking.client;

  const personName = person?.name || 'Unknown';
  const personAvatar = person?.avatar;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {personAvatar ? (
            <Image source={{ uri: personAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{getInitials(personName)}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{personName}</Text>
          <Text style={styles.issue} numberOfLines={1}>
            {truncate(booking.issue, 50) || 'Legal consultation'}
          </Text>

          {variant === 'advocate' && booking.client?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.location}>{booking.client.city}</Text>
            </View>
          )}
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.badgeText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Details row */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{booking.timeSlot?.startTime || 'TBD'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{formatINR(booking.payment?.amount)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name={booking.type === 'video' ? 'videocam-outline' : 'person-outline'} size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{booking.type === 'video' ? 'Video' : 'In-person'}</Text>
        </View>
      </View>

      {/* Advocate accept/reject actions */}
      {showActions && booking.status === 'pending' && onAction && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAction(booking._id, 'confirmed')}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onAction(booking._id, 'cancelled')}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat button if booking is confirmed */}
      {booking.status === 'confirmed' && booking.chat && (
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => onPress?.('chat')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.primary} />
          <Text style={styles.chatBtnText}>Open Chat</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: SIZES.cardRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.md },
  avatarWrap: { marginRight: SIZES.md },
  avatar: { width: SIZES.avatarMd, height: SIZES.avatarMd, borderRadius: SIZES.avatarMd / 2 },
  avatarFallback: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.primary },
  info: { flex: 1 },
  name: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  issue: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  location: { fontSize: SIZES.tiny, color: COLORS.textMuted },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: SIZES.radiusFull, marginLeft: SIZES.sm,
  },
  badgeText: { fontSize: SIZES.tiny, fontWeight: '700', textTransform: 'capitalize' },
  details: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: SIZES.tiny, color: COLORS.textMuted },
  actions: {
    flexDirection: 'row', gap: 12, marginTop: SIZES.md,
    paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  acceptBtn: {
    flex: 1, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  acceptText: { color: '#fff', fontSize: SIZES.body, fontWeight: '700' },
  rejectBtn: {
    flex: 1, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  rejectText: { color: COLORS.textSecondary, fontSize: SIZES.body, fontWeight: '600' },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SIZES.sm, paddingTop: SIZES.sm,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  chatBtnText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },
});

export default BookingCard;
