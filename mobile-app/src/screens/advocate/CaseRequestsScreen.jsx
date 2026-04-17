import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const TABS = ['All', 'Pending', 'Accepted', 'Rejected'];

const CaseRequestsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const statusMap = { All: undefined, Pending: 'pending', Accepted: 'confirmed', Rejected: 'cancelled' };
      const { data } = await bookingAPI.getAdvocate({ status: statusMap[activeTab] });
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.clientName}>{item.client?.name || 'Client'}</Text>
      <Text style={styles.issueType}>{item.issue || 'Legal matter'}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.meta}>
          {item.client?.city || 'India'} • {Math.floor((Date.now() - new Date(item.createdAt)) / 60000)} min ago
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.actions}>
        <Button
          title="Accept"
          size="sm"
          onPress={() => handleAction(item._id, 'accept')}
          style={{ flex: 1, marginRight: 12 }}
          disabled={item.status !== 'pending'}
        />
        <Button
          title="Reject"
          variant="outline"
          size="sm"
          onPress={() => handleAction(item._id, 'reject')}
          style={{ flex: 1 }}
          disabled={item.status !== 'pending'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Case Requests</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 40, padding: 4 },
  headerTitle: { flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  iconBtn: { padding: 6 },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: SIZES.screenPadding, paddingBottom: SIZES.sm, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.backgroundGrey },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: SIZES.body, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: SIZES.screenPadding, gap: SIZES.md, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, ...SHADOWS.sm },
  clientName: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  issueType: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  meta: { fontSize: SIZES.caption, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SIZES.md },
  actions: { flexDirection: 'row' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 12 },
});

export default CaseRequestsScreen;
