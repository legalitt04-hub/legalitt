import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { getInitials, formatDate } from '../../utils/helpers';

const ClientsScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getAdvocate({ status: 'confirmed' })
      .then(({ data }) => {
        // Deduplicate clients
        const seen = new Set();
        const unique = (data.data || []).filter(b => {
          const id = b.client?._id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setClients(unique);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>My Clients</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>👥</Text>
              <Text style={styles.emptyText}>No clients yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const client = item.client || {};
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CaseDetail', { booking: item })}
              >
                <View style={styles.avatarWrap}>
                  {client.avatar ? (
                    <Image source={{ uri: client.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.initials}>{getInitials(client.name || 'C')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.clientName}>{client.name || 'Client'}</Text>
                  <Text style={styles.caseType} numberOfLines={1}>{item.issue?.slice(0, 40) || 'Legal matter'}</Text>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation.navigate('CaseDetail', { booking: item })}
                >
                  <Text style={styles.viewBtnText}>View Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  iconBtn: { padding: 6 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: SIZES.radiusLg, padding: SIZES.lg, marginBottom: SIZES.md, ...SHADOWS.sm },
  avatarWrap: { marginRight: SIZES.md },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.primary },
  info: { flex: 1 },
  clientName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  caseType: { fontSize: SIZES.caption, color: COLORS.primary, marginTop: 2 },
  date: { fontSize: SIZES.tiny, color: COLORS.textMuted, marginTop: 2 },
  viewBtn: { backgroundColor: COLORS.backgroundGrey, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 6 },
  viewBtnText: { fontSize: SIZES.tiny, fontWeight: '700', color: COLORS.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 12 },
});

export default ClientsScreen;
