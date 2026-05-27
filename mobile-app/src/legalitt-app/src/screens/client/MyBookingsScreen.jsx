import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  pending: { 
    bg: '#FEF9C3', 
    text: '#A16207', 
    icon: 'time-outline',
    label: 'Pending Approval'
  },
  confirmed: { 
    bg: '#DCFCE7', 
    text: '#15803D', 
    icon: 'checkmark-circle-outline',
    label: 'Confirmed'
  },
  completed: { 
    bg: '#DBEAFE', 
    text: '#1D4ED8', 
    icon: 'shield-checkmark-outline',
    label: 'Completed'
  },
  cancelled: { 
    bg: '#FEE2E2', 
    text: '#B91C1C', 
    icon: 'close-circle-outline',
    label: 'Cancelled'
  },
};

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMy();
      setBookings(data.data || []);
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptyText}>
        You haven't scheduled any consultations with an advocate yet. Find an expert and book a session.
      </Text>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.exploreBtnText}>Find an Advocate</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookingCard = ({ item }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const advocate = item.advocate?.user || {};
    const advocateName = advocate.name || 'Legal Counsel';
    const advocateIdStr = advocate._id || item.advocate?._id || 'default';
    const advocateAvatar = advocate.avatar || `https://i.pravatar.cc/150?u=${advocateIdStr}`;

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={14} color={config.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
          </View>
          <Text style={styles.bookingId}>ID: {item._id.substring(item._id.length - 6).toUpperCase()}</Text>
        </View>

        {/* Advocate Info */}
        <View style={styles.advocateRow}>
          <View style={styles.avatarContainer}>
            {advocateAvatar ? (
              <Image source={{ uri: advocateAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{advocateName[0].toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.advocateDetails}>
            <Text style={styles.advocateName}>{advocateName}</Text>
            <Text style={styles.advocateTitle}>{item.advocate?.title || 'Advocate & Legal Advisor'}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsBox}>
          <Text style={styles.issueTitle}>Case / Issue</Text>
          <Text style={styles.issueText} numberOfLines={2}>
            {item.issue || 'Consultation regarding legal matters'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconBg}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>
                  {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <View style={styles.metaIconBg}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>
                  {item.timeSlot?.startTime || 'TBD'}
                </Text>
              </View>
            </View>
            
            <View style={styles.metaItem}>
              <View style={[styles.metaIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="card-outline" size={16} color="#059669" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Payment</Text>
                <Text style={[styles.metaValue, { color: '#059669' }]}>
                  ₹{item.payment?.amount || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {item.chat ? (
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', { 
                chatId: item.chat, 
                advocateName: advocateName,
                advocateAvatar: advocateAvatar,
                advocateId: advocateIdStr
              })}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>Message Advocate</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noChatBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.noChatText}>Chat will be available once confirmed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ClientMain')} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Consultations</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching your bookings...</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderBookingCard}
            ListEmptyComponent={renderEmptyState}
            refreshing={loading}
            onRefresh={fetchBookings}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  advocateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  advocateDetails: {
    flex: 1,
  },
  advocateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  advocateTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  issueTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  metaIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
  },
  actionsRow: {
    marginTop: 4,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  noChatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  noChatText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 99,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MyBookingsScreen;
