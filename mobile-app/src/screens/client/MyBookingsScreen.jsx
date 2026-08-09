import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { bookingAPI, legalAdviceAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';

const STATUS_CONFIG = {
  pending_assignment: {
    bg: '#FEF3C7', text: '#D97706', icon: 'time-outline',
    label: 'Awaiting Advocate (24h)', isWaiting: true,
  },
  pending: {
    bg: '#FEF9C3', text: '#A16207', icon: 'hourglass-outline',
    label: 'Pending Confirmation',
  },
  confirmed: {
    bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle-outline',
    label: 'Confirmed',
  },
  in_progress: {
    bg: '#EDE9FE', text: '#7C3AED', icon: 'radio-outline',
    label: 'In Progress',
  },
  completed: {
    bg: '#DBEAFE', text: '#1D4ED8', icon: 'shield-checkmark-outline',
    label: 'Completed',
  },
  cancelled: {
    bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle-outline',
    label: 'Cancelled',
  },
};

const MODE_ICON = { chat: 'chatbubbles-outline', voice: 'call-outline', video: 'videocam-outline' };
const MODE_LABEL = { chat: 'Chat', voice: 'Voice Call', video: 'Video Call' };

export default function MyBookingsScreen({ navigation }) {
  const { user } = useAuth();
  const userData = user?.user || user || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);

  const fetchBookings = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      // Fetch both regular bookings + legal advice requests
      const [regularRes, legalRes] = await Promise.allSettled([
        bookingAPI.getMy(),
        legalAdviceAPI.getMyRequests(),
      ]);

      const regular = regularRes.status === 'fulfilled' ? (regularRes.value?.data?.data || []) : [];
      const legal = legalRes.status === 'fulfilled' ? (legalRes.value?.data?.data || []) : [];

      // Merge and sort by createdAt descending
      const all = [...regular, ...legal].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(all);
    } catch (err) {
      console.log('Error fetching bookings:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchBookings();
  }, [fetchBookings]));

  // ─── Real-time Socket.io: listen for booking_assigned ─────────────────────
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket) return;

    const handleAssigned = (data) => {
      setBookings(prev =>
        prev.map(b => {
          if (b._id === data.bookingId || b._id?.toString() === data.bookingId?.toString()) {
            return {
              ...b,
              status: 'confirmed',
              advocate: data.advocate,
              chat: data.chatId,
              consultationMode: data.consultationMode,
              // ZEGO fields from backend emit
              videoRoomId:    data.zegoRoomId,
              videoRoomToken: data.zegoToken,      // Client's ZEGO token
              zegoAppId:      data.zegoAppId,
            };
          }
          return b;
        })
      );
      Alert.alert(
        '⚖️ Advocate Assigned!',
        `${data.advocate?.name || 'An advocate'} has been assigned to your legal request. You can now connect with them.`,
        [{ text: 'View', onPress: () => fetchBookings() }, { text: 'OK' }]
      );
    };

    socket.on('booking_assigned', handleAssigned);
    return () => socket.off('booking_assigned', handleAssigned);
  }, [fetchBookings]);

  const getActionButtons = (item) => {
    const advocate = item.advocate?.user || {};
    const advocateName = advocate.name || 'Advocate';
    const advocateAvatar = advocate.avatar || `https://i.pravatar.cc/150?u=${item.advocate?._id}`;
    const mode = item.consultationMode || item.type;
    const isConfirmed = item.status === 'confirmed' || item.status === 'in_progress';

    if (!isConfirmed || !item.advocate) return null;

    return (
      <View style={styles.actionsRow}>
        {/* Chat button — always available when confirmed */}
        {item.chat && (
          <TouchableOpacity style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', {
              chatId: item.chat,
              advocateName, advocateAvatar,
              advocateId: advocate._id || item.advocate?._id,
              // ZEGOCLOUD params — so in-chat call button works
              zegoRoomId:  item.videoRoomId,
              zegoToken:   item.videoRoomToken,
              zegoAppId:   item.zegoAppId || 0,
              zegoAppSign: '',
              mode: item.consultationMode,
            })}>
            <Ionicons name="chatbubbles-outline" size={17} color="#fff" />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        )}

        {/* Voice / Video Call button — uses ZEGOCLOUD */}
        {(mode === 'voice' || mode === 'video') && item.videoRoomId && (
          <TouchableOpacity
            style={[styles.callBtn, mode === 'video' ? styles.videoBtn : styles.voiceBtn]}
            onPress={() => navigation.navigate('VideoCall', {
              zegoRoomId:   item.videoRoomId,
              zegoToken:    item.videoRoomToken,
              zegoAppId:    item.zegoAppId || parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || '0'),
              zegoAppSign:  process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || '',
              advocateName,
              myUserId:     userData._id || '',
              myUserName:   userData.name || 'Client',
              mode,
              bookingId:    item._id,
            })}>
            <Ionicons name={mode === 'video' ? 'videocam-outline' : 'call-outline'} size={17} color="#fff" />
            <Text style={styles.callBtnText}>{mode === 'video' ? 'Video Call' : 'Voice Call'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBookingCard = ({ item }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const advocate = item.advocate?.user || {};
    const advocateName = advocate.name || (item.status === 'pending_assignment' ? 'Being Assigned...' : 'Legal Counsel');
    const advocateAvatar = advocate.avatar;
    const mode = item.consultationMode || (item.type === 'phone' ? 'voice' : item.type) || 'chat';
    const isLegalNotice = item.serviceType === 'legal_notice';

    // 24h deadline countdown
    let deadlineText = null;
    if (item.status === 'pending_assignment' && item.assignmentDeadline) {
      const hours = Math.max(0, (new Date(item.assignmentDeadline) - Date.now()) / 3600000);
      deadlineText = hours > 0
        ? `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m remaining`
        : 'Assignment overdue — our team is on it';
    }

    return (
      <View style={[styles.card, item.status === 'pending_assignment' && styles.pendingCard]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={13} color={config.text} />
              <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
            </View>
            {isLegalNotice && (
              <View style={styles.noticeBadge}>
                <Text style={styles.noticeBadgeText}>Legal Notice</Text>
              </View>
            )}
          </View>
          <View style={[styles.modeBadge]}>
            <Ionicons name={MODE_ICON[mode] || 'chatbubbles-outline'} size={13} color="#6B7280" />
            <Text style={styles.modeText}>{MODE_LABEL[mode] || 'Chat'}</Text>
          </View>
        </View>

        {/* Advocate Info */}
        <View style={styles.advocateRow}>
          {advocateAvatar ? (
            <Image source={{ uri: advocateAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name={item.status === 'pending_assignment' ? 'time-outline' : 'person'}
                size={22} color={COLORS.primary} />
            </View>
          )}
          <View style={styles.advocateDetails}>
            <Text style={styles.advocateName}>{advocateName}</Text>
            <Text style={styles.advocateTitle}>
              {item.status === 'pending_assignment'
                ? '⏳ Admin is assigning best advocate for you'
                : (item.advocate?.specializations?.[0] || 'Advocate & Legal Advisor')}
            </Text>
          </View>
        </View>

        {/* 24h countdown */}
        {deadlineText && (
          <View style={styles.deadlineBanner}>
            <Ionicons name="alarm-outline" size={14} color="#D97706" />
            <Text style={styles.deadlineText}>{deadlineText}</Text>
          </View>
        )}

        {/* Issue + Meta */}
        <View style={styles.detailsBox}>
          <Text style={styles.issueText} numberOfLines={2}>
            {item.issue || 'Consultation regarding legal matters'}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="card-outline" size={14} color="#059669" />
              <Text style={[styles.metaValue, { color: '#059669' }]}>₹{item.payment?.amount || 0}</Text>
            </View>
            {item.payment?.status === 'paid' && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={[styles.metaValue, { color: '#059669' }]}>Paid</Text>
              </View>
            )}
            {item.documents?.length > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="document-attach-outline" size={14} color="#6B7280" />
                <Text style={styles.metaValue}>{item.documents.length} doc{item.documents.length > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {getActionButtons(item) || (item.status === 'pending_assignment' && (
          <View style={styles.waitingBox}>
            <ActivityIndicator size="small" color="#D97706" />
            <Text style={styles.waitingText}>Advocate assignment in progress...</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Requests Yet</Text>
      <Text style={styles.emptyText}>
        You haven't submitted any legal advice or notice requests yet.
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('HomeTab')}>
        <Text style={styles.exploreBtnText}>Get Legal Advice</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : null}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchBookings(true)}>
          <Ionicons name="refresh-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderBookingCard}
          ListEmptyComponent={renderEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings(true)} colors={[COLORS.primary]} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  refreshButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 100, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  pendingCard: { borderColor: '#FDE68A', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerLeft: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  noticeBadge: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99,
  },
  noticeBadgeText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99,
  },
  modeText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  advocateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(20,184,166,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  advocateDetails: { flex: 1 },
  advocateName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  advocateTitle: { fontSize: 12, color: '#6B7280' },
  deadlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  deadlineText: { fontSize: 12, color: '#D97706', fontWeight: '600', flex: 1 },
  detailsBox: {
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6',
  },
  issueText: { fontSize: 13, color: '#374151', lineHeight: 19, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaValue: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  chatBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12,
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12,
  },
  voiceBtn: { backgroundColor: '#10B981' },
  videoBtn: { backgroundColor: '#7C3AED' },
  callBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  waitingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF7ED', borderRadius: 12, paddingVertical: 12, gap: 8,
  },
  waitingText: { fontSize: 13, color: '#D97706', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(20,184,166,0.1)', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  exploreBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 99, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  exploreBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
