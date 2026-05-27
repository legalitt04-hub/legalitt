import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const ClientsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getAdvocateBookings({ status: 'confirmed' })
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
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => {
    const client = item.client || {};
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="scale-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.name}>{client.name || 'Client'}</Text>
            <Text style={styles.caseType}>
              {item.issue?.split('\n')[0] || 'Legal matter'}
              {item.detail ? <Text style={styles.caseDetail}> • {item.detail}</Text> : null}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.primary} />
              <Text style={styles.location}>{client.city || 'Bhopal'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewBtn}
            onPress={() => navigation.navigate('CaseDetail', { booking: item })}
          >
            <Text style={styles.viewBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarCircleText}>{(user?.name || 'P')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.greeting}>{user?.name?.split(' ')[0] || 'Priya'}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.headerIconBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>👥</Text>
              <Text style={styles.emptyText}>No clients yet</Text>
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
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(20, 184, 166, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarCircleText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  greeting: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
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
    alignItems: 'center',
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
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  caseType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  caseDetail: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  viewBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, fontWeight: '500' },
});

export default ClientsScreen;
