import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, Alert, StatusBar
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
    bg: 'rgba(217, 119, 6, 0.15)', border: 'rgba(217, 119, 6, 0.4)', text: '#FBBF24', icon: 'time-outline',
    label: 'Awaiting Advocate (24h)', isWaiting: true,
  },
  pending: {
    bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#FACC15', icon: 'hourglass-outline',
    label: 'Pending Confirmation',
  },
  confirmed: {
    bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399', icon: 'checkmark-circle-outline',
    label: 'Confirmed',
  },
  in_progress: {
    bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', text: '#A78BFA', icon: 'radio-outline',
    label: 'In Progress',
  },
  completed: {
    bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#60A5FA', icon: 'shield-checkmark-outline',
    label: 'Completed',
  },
  cancelled: {
    bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#FCA5A5', icon: 'close-circle-outline',
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
      const [regularRes, legalRes] = await Promise.allSettled([
        bookingAPI.getMy(),
        legalAdviceAPI.getMyRequests(),
      ]);

      const regular = regularRes.status === 'fulfilled' ? (regularRes.value?.data?.data || []) : [];
      const legal = legalRes.status === 'fulfilled' ? (legalRes.value?.data?.data || []) : [];

      // Merge and deduplicate by _id
      const bookingMap = new Map();
      [...regular, ...legal].forEach(item => {
        if (item?._id) {
          bookingMap.set(item._id.toString(), item);
        }
      });

      const all = Array.from(bookingMap.values()).sort((a, b) =>
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
              videoRoomId:    data.zegoRoomId,
              videoRoomToken: data.zegoToken,
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

  const handleOpenSession = (actionType, item, params) => {
    const rawSlot = item.notes?.replace('Preferred slot: ', '');
    if (rawSlot && item.status !== 'in_progress') {
      const slotDate = new Date(rawSlot);
      if (!isNaN(slotDate.getTime())) {
        const diffMins = (slotDate.getTime() - Date.now()) / 60000;
        if (diffMins > 15) {
          Alert.alert(
            '⏰ Session Not Started Yet',
            `Your consultation session is scheduled for: ${rawSlot}.\n\nChat and calls will open 15 minutes before your scheduled slot time. You will receive a push notification when it starts!`,
            [{ text: 'OK' }]
          );
          return;
        }
      }
    }

    if (actionType === 'chat') {
      navigation.navigate('Chat', params);
    } else if (actionType === 'call') {
      navigation.navigate('VideoCall', params);
    }
  };

  const getActionButtons = (item) => {
    const advocate = item.advocate?.user || {};
    const advocateName = advocate.name || 'Advocate';
    const advocateAvatar = advocate.avatar || `https://i.pravatar.cc/150?u=${item.advocate?._id}`;
    const mode = item.consultationMode || item.type;
    const isConfirmed = item.status === 'confirmed' || item.status === 'in_progress';

    if (!isConfirmed || !item.advocate) return null;

    const slotText = item.notes?.replace('Preferred slot: ', '') || (item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null);

    return (
      <View style={{ gap: 8 }}>
        {slotText && (
          <View style={styles.slotBanner}>
            <Ionicons name="time-outline" size={13} color="#D4AF37" />
            <Text style={styles.slotBannerText}>Scheduled Slot: {slotText}</Text>
          </View>
        )}
        <View style={styles.actionsRow}>
          {item.chat && (
            <TouchableOpacity style={styles.chatBtn}
              onPress={() => handleOpenSession('chat', item, {
                chatId: item.chat,
                advocateName, advocateAvatar,
                advocateId: advocate._id || item.advocate?._id,
                zegoRoomId:  item.videoRoomId,
                zegoToken:   item.videoRoomToken,
                zegoAppId:   item.zegoAppId || 0,
                zegoAppSign: '',
                mode: item.consultationMode,
                scheduledSlot: slotText,
              })}>
              <Ionicons name="chatbubbles-outline" size={17} color="#07080A" />
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          )}

          {(mode === 'voice' || mode === 'video') && item.videoRoomId && (
            <TouchableOpacity
              style={[styles.callBtn, mode === 'video' ? styles.videoBtn : styles.voiceBtn]}
              onPress={() => handleOpenSession('call', item, {
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
            <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
              <Ionicons name={config.icon} size={13} color={config.text} />
              <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
            </View>
            {isLegalNotice && (
              <View style={styles.noticeBadge}>
                <Text style={styles.noticeBadgeText}>Legal Notice</Text>
              </View>
            )}
          </View>
          <View style={styles.modeBadge}>
            <Ionicons name={MODE_ICON[mode] || 'chatbubbles-outline'} size={13} color="#94A3B8" />
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
                size={22} color="#D4AF37" />
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
            <Ionicons name="alarm-outline" size={14} color="#F59E0B" />
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
              <Ionicons name="card-outline" size={14} color="#D4AF37" />
              <Text style={[styles.metaValue, { color: '#D4AF37' }]}>₹{item.payment?.amount || 0}</Text>
            </View>
            {item.payment?.status === 'paid' && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={[styles.metaValue, { color: '#10B981' }]}>Paid</Text>
              </View>
            )}
            {item.documents?.length > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="document-attach-outline" size={14} color="#94A3B8" />
                <Text style={styles.metaValue}>{item.documents.length} doc{item.documents.length > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {getActionButtons(item) || (item.status === 'pending_assignment' && (
          <View style={styles.waitingBox}>
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={styles.waitingText}>Advocate assignment in progress...</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={44} color="#D4AF37" />
      </View>
      <Text style={styles.emptyTitle}>No Requests Yet</Text>
      <Text style={styles.emptyText}>
        You haven't submitted any legal advice or notice requests yet.
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('ClientMain', { screen: 'Home' })}>
        <Text style={styles.exploreBtnText}>Get Legal Advice</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07080A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : null}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchBookings(true)}>
          <Ionicons name="refresh-outline" size={22} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {loading && bookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => item._id ? `${item._id}_${index}` : `req_${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderBookingCard}
          ListEmptyComponent={renderEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings(true)} colors={['#D4AF37']} tintColor="#D4AF37" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07080A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#0F131C', borderBottomWidth: 1, borderColor: '#1E2638',
  },
  backButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1E2638', alignItems: 'center', justifyContent: 'center',
  },
  refreshButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 100, gap: 14 },
  card: {
    backgroundColor: '#121722', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#1E2638',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  pendingCard: { borderColor: 'rgba(217, 119, 6, 0.5)', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerLeft: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  noticeBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  noticeBadgeText: { fontSize: 10, fontWeight: '700', color: '#C4B5FD' },
  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1E2638', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99,
  },
  modeText: { fontSize: 11, color: '#CBD5E1', fontWeight: '600' },
  advocateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, borderWidth: 1.5, borderColor: '#D4AF37' },
  avatarPlaceholder: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)', alignItems: 'center', justifyContent: 'center',
  },
  advocateDetails: { flex: 1 },
  advocateName: { fontSize: 15, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  advocateTitle: { fontSize: 12, color: '#94A3B8' },
  deadlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  deadlineText: { fontSize: 12, color: '#FBBF24', fontWeight: '600', flex: 1 },
  detailsBox: {
    backgroundColor: '#19202E', borderRadius: 14, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#263044',
  },
  issueText: { fontSize: 13, color: '#E2E8F0', lineHeight: 19, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaValue: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  slotBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  slotBannerText: { fontSize: 11, color: '#D4AF37', fontWeight: '700' },
  chatBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#D4AF37', paddingVertical: 12, borderRadius: 12,
  },
  chatBtnText: { color: '#07080A', fontSize: 14, fontWeight: '800' },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12,
  },
  voiceBtn: { backgroundColor: '#10B981' },
  videoBtn: { backgroundColor: '#8B5CF6' },
  callBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  waitingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)', borderRadius: 12, paddingVertical: 12, gap: 8,
    borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  waitingText: { fontSize: 13, color: '#FBBF24', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.12)', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  exploreBtn: {
    backgroundColor: '#D4AF37', paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 99, elevation: 4,
  },
  exploreBtnText: { color: '#07080A', fontSize: 16, fontWeight: '800' },
});
