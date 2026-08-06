import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatDate } from '../../utils/helpers';

const AppointmentCard = ({ appointment, onAccept, onReject, onViewDetails }) => {
  const client = appointment.client || {};
  const isPending = appointment.status === 'pending';

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'videocam-outline';
      case 'phone': return 'call-outline';
      default: return 'people-outline';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Audio Call';
      default: return 'In-Person';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <View style={styles.avatarContainer}>
            {client.avatar ? (
              <Image source={{ uri: client.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsBg}>
                <Text style={styles.initials}>{(client.name || 'C')[0].toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>{client.name || 'Anonymous Client'}</Text>
            <Text style={styles.email} numberOfLines={1}>{client.email || 'No email provided'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.confirmedBadge]}>
          <Text style={[styles.statusText, isPending ? styles.pendingText : styles.confirmedText]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{formatDate(appointment.date)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{appointment.timeSlot?.startTime || 'TBD'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name={getTypeIcon(appointment.type)} size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{getTypeLabel(appointment.type)}</Text>
        </View>
      </View>

      {appointment.issue && (
        <View style={styles.issueContainer}>
          <Text style={styles.issueLabel}>Issue:</Text>
          <Text style={styles.issueText} numberOfLines={2}>{appointment.issue}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {isPending ? (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]} onPress={onViewDetails}>
            <Text style={styles.viewBtnText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  confirmedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pendingText: {
    color: '#D97706',
  },
  confirmedText: {
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  issueContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  issueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  issueText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    gap: 6,
  },
  viewBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AppointmentCard;
