// screens/advocate/CaseRequestsScreen.jsx
// Advocate's "Requests" tab — shows all pending bookings assigned by admin
// Advocate can Accept (confirm) or Decline (cancel) each request

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, Image, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { getSocket } from '../../services/socket';

const MODE_CONFIG = {
  chat:  { icon: 'chatbubble-outline',  color: '#3B82F6', label: 'Chat Consultation' },
  video: { icon: 'videocam-outline',    color: '#8B5CF6', label: 'Video Consultation' },
  voice: { icon: 'call-outline',        color: '#10B981', label: 'Voice Consultation' },
  legal_notice: { icon: 'document-text-outline', color: '#F59E0B', label: 'Legal Notice' },
  property_research: { icon: 'home-outline', color: '#EC4899', label: 'Property Research' },
  document_forensic: { icon: 'shield-checkmark-outline', color: '#6366F1', label: 'Document Forensic' },
  default: { icon: 'scale-outline', color: '#14B8A6', label: 'Legal Consultation' },
};

const getMode = (booking) => {
  const st = booking.serviceType || booking.consultationMode || booking.type || 'default';
  return MODE_CONFIG[st] || MODE_CONFIG.default;
};

const RequestCard = ({ booking, onAccept, onDecline, onViewDetail }) => {
  const mode = getMode(booking);
  const client = booking.client || {};
  const initials = (client.name || 'C').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onViewDetail} activeOpacity={0.8}>
      {/* Top Row */}
      <View style={styles.cardHeader}>
        <View style={styles.clientRow}>
          <View style={[styles.avatar, { backgroundColor: mode.color + '20' }]}>
            {client.avatar ? (
              <Image source={{ uri: client.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarText, { color: mode.color }]}>{initials}</Text>
            )}
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.name || 'Unknown Client'}</Text>
            <Text style={styles.timeText}>{timeAgo(booking.createdAt)}</Text>
          </View>
        </View>

        <View style={[styles.modeBadge, { backgroundColor: mode.color + '15' }]}>
          <Ionicons name={mode.icon} size={13} color={mode.color} />
          <Text style={[styles.modeLabel, { color: mode.color }]}>{mode.label}</Text>
        </View>
      </View>

      {/* Issue Description */}
      {(booking.issue || booking.issueDescription || booking.notes) ? (
        <Text style={styles.issueText} numberOfLines={2}>
          {booking.issue || booking.issueDescription || booking.notes}
        </Text>
      ) : null}

      {/* Payment Info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={13} color="#6B7280" />
          <Text style={styles.metaText}>
            ₹{(booking.payment?.amount || booking.amount || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        {booking.scheduledDate && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text style={styles.metaText}>
              {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </Text>
          </View>
        )}
        {booking.slot && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#6B7280" />
            <Text style={styles.metaText}>{booking.slot}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.85}>
          <Ionicons name="close-circle-outline" size={17} color="#EF4444" />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={17} color="#fff" />
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const CaseRequestsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch bookings assigned to this advocate with status pending_assignment
      const { data } = await api.get('/bookings/advocate', {
        params: { status: 'pending_assignment', limit: 50 }
      });
      const list = data?.data || data?.bookings || [];
      setRequests(list);
    } catch (err) {
      console.error('CaseRequests fetch error:', err);
      // Fallback: try advocate-dashboard stats endpoint
      try {
        const { data } = await api.get('/advocate-dashboard/stats');
        const pending = data?.data?.pendingRequests || data?.data?.todayAppointments || [];
        setRequests(pending.filter(b => b.status === 'pending_assignment' || b.status === 'pending'));
      } catch (_) {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const unsubFocus = navigation.addListener('focus', () => fetchRequests(true));
    return unsubFocus;
  }, [fetchRequests, navigation]);

  // Real-time: new booking assigned
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchRequests(true);
    socket.on('new_booking_assigned', handler);
    return () => socket.off('new_booking_assigned', handler);
  }, [fetchRequests]);

  const handleAccept = useCallback((booking) => {
    Alert.alert(
      '✅ Accept Request',
      `Accept ${getMode(booking).label} from ${booking.client?.name || 'this client'}?\n\nYou will be connected with the client once accepted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setProcessingId(booking._id);
            try {
              await api.patch(`/bookings/${booking._id}/status`, { status: 'confirmed' });
              // If it's a chat consultation, navigate to chat
              if ((booking.serviceType === 'chat' || booking.consultationMode === 'chat') && booking.chatId) {
                setRequests(prev => prev.filter(r => r._id !== booking._id));
                navigation.navigate('Chat', {
                  chatId: booking.chatId,
                  advocateName: booking.client?.name || 'Client',
                  advocateAvatar: booking.client?.avatar,
                  advocateId: booking.client?._id,
                });
              } else {
                Alert.alert('✅ Accepted!', 'Case accepted. Client will be notified.');
                setRequests(prev => prev.filter(r => r._id !== booking._id));
              }
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to accept. Please try again.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  }, [navigation]);

  const handleDecline = useCallback((booking) => {
    Alert.alert(
      '❌ Decline Request',
      `Decline ${getMode(booking).label} from ${booking.client?.name || 'this client'}?\n\nThe client will be reassigned to another advocate.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(booking._id);
            try {
              await api.patch(`/bookings/${booking._id}/status`, {
                status: 'pending_assignment',
                cancellationReason: 'Declined by advocate',
                advocateDeclined: true,
              });
              setRequests(prev => prev.filter(r => r._id !== booking._id));
              Alert.alert('Declined', 'Request declined. Admin will reassign.');
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to decline.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleViewDetail = useCallback((booking) => {
    navigation.navigate('CaseDetail', { booking });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Case Requests</Text>
          <Text style={styles.headerSub}>
            {requests.length > 0 ? `${requests.length} pending request${requests.length !== 1 ? 's' : ''}` : 'No pending requests'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => fetchRequests(true)} style={styles.refreshBtn}>
          <Ionicons name="reload-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={requests}
        keyExtractor={item => item._id?.toString()}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, 12) + 100 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRequests(true); }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <View style={{ opacity: processingId === item._id ? 0.5 : 1 }}>
            <RequestCard
              booking={item}
              onAccept={() => handleAccept(item)}
              onDecline={() => handleDecline(item)}
              onViewDetail={() => handleViewDetail(item)}
            />
            {processingId === item._id && (
              <ActivityIndicator
                style={styles.processingSpinner}
                size="small"
                color={COLORS.primary}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="checkmark-done-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              No new case requests right now.{'\n'}Pull down to refresh.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 13 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { fontSize: 16, fontWeight: '800' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  timeText: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  modeLabel: { fontSize: 10, fontWeight: '700' },

  issueText: {
    fontSize: 13, color: '#4B5563', lineHeight: 19,
    marginBottom: 10, paddingLeft: 4,
  },

  metaRow: {
    flexDirection: 'row', gap: 16, marginBottom: 14,
    paddingTop: 10, borderTopWidth: 1, borderColor: '#F9FAFB',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FFF5F5',
  },
  declineBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  acceptBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 12, backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  acceptBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  processingSpinner: { position: 'absolute', bottom: 20, right: 24 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});

export default CaseRequestsScreen;
