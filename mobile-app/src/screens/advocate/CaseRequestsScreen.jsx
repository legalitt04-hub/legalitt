import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';

const TABS = ['All', 'Pending', 'Accepted', 'Rejected'];

const CaseRequestsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const statusMap = { All: undefined, Pending: 'pending', Accepted: 'confirmed', Rejected: 'cancelled' };
      const { data } = await bookingAPI.getAdvocateBookings({ status: statusMap[activeTab] });
      setBookings(data.data || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [activeTab]);

  const handleAction = async (bookingId, action) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status: action === 'accept' ? 'confirmed' : 'cancelled' });
      fetch();
    } catch { Alert.alert('Error', 'Could not update booking.'); }
  };

  const renderItem = ({ item }) => {
    const isPending = item.status === 'pending';
    const isConfirmed = item.status === 'confirmed';
    const isCancelled = item.status === 'cancelled';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CaseDetail', { booking: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="scale-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.name}>{item.client?.name || 'Client'}</Text>
            <Text style={styles.caseType} numberOfLines={1}>{item.issue || 'Legal matter'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.primary} />
              <Text style={styles.location}>
                {item.client?.city || 'India'} • {Math.floor((Date.now() - new Date(item.createdAt)) / 60000)} min ago
              </Text>
            </View>
          </View>
        </View>

        {isPending ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => handleAction(item._id, 'accept')}
              style={[styles.button, styles.acceptButton]}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAction(item._id, 'reject')}
              style={[styles.button, styles.rejectButton]}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusBadge,
                isConfirmed ? styles.acceptedBadge : styles.rejectedBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isConfirmed ? styles.acceptedBadgeText : styles.rejectedBadgeText,
                ]}
              >
                {isConfirmed ? 'Accepted' : 'Rejected'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Case Requests</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.headerIconBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={styles.emptyText}>No requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  backBtn: { width: 36, padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6'
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 99,
    gap: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 99,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 100
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  caseType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 99,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
  },
  rejectButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadgeContainer: {
    marginTop: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  acceptedBadge: {
    backgroundColor: '#DCFCE7',
  },
  acceptedBadgeText: {
    color: COLORS.success,
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  rejectedBadgeText: {
    color: '#EF4444',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, fontWeight: '500' },
});

export default CaseRequestsScreen;
