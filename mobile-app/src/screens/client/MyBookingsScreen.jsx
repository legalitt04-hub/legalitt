import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const STATUS_COLORS = {
  pending: { bg: '#fef9c3', text: '#854d0e' },
  confirmed: { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getMy().then(({ data }) => setBookings(data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 32 }} />
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} /> : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ fontSize: 48 }}>📅</Text><Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>No bookings yet</Text></View>}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.advocateName}>{item.advocate?.user?.name || 'Advocate'}</Text>
                  <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.issue}>{item.issue?.slice(0, 60)}...</Text>
                <View style={styles.cardBottom}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>{new Date(item.date).toDateString()}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>₹{item.payment?.amount}</Text>
                  </View>
                </View>
                {item.chat && (
                  <TouchableOpacity onPress={() => navigation.navigate('Chat', { chatId: item.chat, advocateName: item.advocate?.user?.name })} style={styles.chatBtn}>
                    <Ionicons name="chatbubble-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.chatBtnText}>Open Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  card: { backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, ...SHADOWS.sm, marginBottom: SIZES.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  advocateName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  badgeText: { fontSize: SIZES.tiny, fontWeight: '700', textTransform: 'capitalize' },
  issue: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', gap: 16, marginTop: SIZES.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: SIZES.caption, color: COLORS.textMuted },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SIZES.sm, paddingTop: SIZES.sm, borderTopWidth: 1, borderColor: COLORS.borderLight },
  chatBtnText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },
});

export default MyBookingsScreen;
