import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Mini bar chart component
const BarChart = ({ data, labels }) => {
  const max = Math.max(...data);
  return (
    <View style={chart.container}>
      {data.map((val, i) => (
        <View key={i} style={chart.barWrap}>
          <View style={chart.barBg}>
            <View style={[chart.bar, { height: `${max ? (val / max) * 100 : 0}%` }]} />
          </View>
          <Text style={chart.label}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
};
const chart = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 80, justifyContent: 'space-between' },
  barWrap: { flex: 1, alignItems: 'center' },
  barBg: { flex: 1, width: '60%', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 3, minHeight: 4 },
  label: { fontSize: 9, color: COLORS.textMuted, marginTop: 4 },
});

// Mini line chart
const LineChart = ({ points }) => (
  <View style={line.container}>
    {points.map((p, i) => (
      <View key={i} style={[line.dot, { bottom: `${p}%`, left: `${(i / (points.length - 1)) * 90 + 5}%` }]} />
    ))}
  </View>
);
const line = StyleSheet.create({
  container: { height: 60, position: 'relative', marginTop: 8 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
});

const AdvocateDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState({ todayCases: 5, newRequests: 2, earnings: 25000 });

  const fetchData = async () => {
    try {
      const { data } = await bookingAPI.getAdvocate({ status: 'pending', limit: 5 });
      setBookings(data.data || []);
    } catch { /* use placeholder */ }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const DAY_LABELS = ['San', 'Mon', 'Tue', 'Wed', 'Thes', 'Fri', 'Sat'];
  const DAY_DATA = [2, 4, 3, 1, 5, 7, 5];
  const EARNINGS_POINTS = [20, 35, 28, 45, 40, 55, 65, 60, 72];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
        <Text style={styles.greeting}>{user?.name?.split(' ')[0] || 'Advocate'}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 120 }}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarWrap}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: COLORS.primary }}>{(user?.name || 'A')[0]}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
              <Text style={styles.verifiedText}>verified</Text>
            </View>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={styles.onlineLabel}>{online ? 'Online' : 'Offline'}</Text>
            <Switch
              value={online}
              onValueChange={setOnline}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Today Cases */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBg}>
              <Ionicons name="scale-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
              <Text style={styles.cardTitle}>Today Cases</Text>
              <Text style={styles.cardCount}>{stats.todayCases} <Text style={styles.cardCountLabel}>Clients</Text></Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cases')}>
              <View style={styles.viewAllBtn}><Text style={styles.viewAllText}>View All</Text></View>
            </TouchableOpacity>
          </View>
          <BarChart data={DAY_DATA} labels={DAY_LABELS} />
        </View>

        {/* New Requests */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBg}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
              <Text style={styles.cardTitle}>New Requests</Text>
              <Text style={[styles.cardCount, { color: COLORS.primary }]}>
                {stats.newRequests}{' '}
                <Text style={styles.cardCountLabel}>1 Civil 2 Criminal</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CaseRequests')}>
              <View style={styles.viewAllBtn}><Text style={styles.viewAllText}>View All</Text></View>
            </TouchableOpacity>
          </View>
          {bookings.length > 0 ? bookings.slice(0, 2).map((b) => (
            <View key={b._id} style={styles.requestRow}>
              <View>
                <Text style={styles.requestName}>{b.client?.name || 'Client'}</Text>
                <Text style={styles.requestType}>{b.issue?.slice(0, 30) || 'Legal matter'}</Text>
              </View>
              <Text style={styles.requestTime}>Pending {Math.floor((Date.now() - new Date(b.createdAt)) / 60000)} Min ago</Text>
            </View>
          )) : (
            <>
              <View style={styles.requestRow}>
                <View><Text style={styles.requestName}>Divorce Statement</Text><Text style={styles.requestType}>Rahul Sharma</Text></View>
                <Text style={styles.requestTime}>Pending 20 Min ago</Text>
              </View>
              <View style={styles.requestRow}>
                <View><Text style={styles.requestName}>Property Dispute</Text><Text style={styles.requestType}>Akash Sinha</Text></View>
                <Text style={styles.requestTime}>Pending 45 Min ago</Text>
              </View>
            </>
          )}
        </View>

        {/* Earnings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBg}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
              <Text style={styles.cardTitle}>Earnings Summary</Text>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsAmount}>₹{stats.earnings.toLocaleString('en-IN')}</Text>
                <Text style={styles.earningsMonth}> This Month</Text>
                <View style={styles.growthBadge}>
                  <Ionicons name="trending-up" size={12} color={COLORS.success} />
                  <Text style={styles.growthText}>15%</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Earnings')}>
              <View style={styles.viewAllBtn}><Text style={styles.viewAllText}>View All</Text></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.earningsLabel}>Earnings</Text>
          <LineChart points={EARNINGS_POINTS} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff',
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  greeting: { flex: 1, fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  iconBtn: { padding: 6 },
  profileCard: { backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, flexDirection: 'row', alignItems: 'center', ...SHADOWS.sm, marginBottom: SIZES.md },
  profileAvatarWrap: { marginRight: SIZES.md },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  verifiedText: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  onlineToggle: { alignItems: 'center' },
  onlineLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, ...SHADOWS.sm, marginBottom: SIZES.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  cardIconBg: { width: 52, height: 52, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  cardCount: { fontSize: SIZES.heading, fontWeight: '900', color: COLORS.textPrimary },
  cardCountLabel: { fontSize: SIZES.body, fontWeight: '400', color: COLORS.textSecondary },
  viewAllBtn: { backgroundColor: COLORS.backgroundGrey, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 6 },
  viewAllText: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textPrimary },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SIZES.sm, borderTopWidth: 1, borderColor: COLORS.borderLight },
  requestName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  requestType: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
  requestTime: { fontSize: SIZES.caption, color: COLORS.textMuted },
  earningsRow: { flexDirection: 'row', alignItems: 'center' },
  earningsAmount: { fontSize: SIZES.heading, fontWeight: '900', color: COLORS.primary },
  earningsMonth: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  growthBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', borderRadius: SIZES.radiusFull, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8, gap: 2 },
  growthText: { fontSize: SIZES.caption, color: COLORS.success, fontWeight: '700' },
  earningsLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 4 },
});

export default AdvocateDashboardScreen;
