import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatDate } from '../../utils/helpers';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      if (data?.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      await notificationAPI.markRead(id);
    } catch (err) {
      console.log('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      const { data } = await notificationAPI.markAllRead();
      if (data?.success) {
        Alert.alert('Success', 'All notifications marked as read.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to mark all as read.');
    }
  };

  const getIconConfig = (type) => {
    switch (type) {
      case 'booking_created':
        return { name: 'calendar-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'booking_accepted':
        return { name: 'checkmark-circle-outline', color: COLORS.primary, bg: 'rgba(20, 184, 166, 0.1)' };
      case 'booking_rejected':
        return { name: 'close-circle-outline', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'message_received':
        return { name: 'chatbubble-ellipses-outline', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'case_updated':
        return { name: 'briefcase-outline', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' };
      default:
        return { name: 'notifications-outline', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const renderItem = ({ item }) => {
    const iconConfig = getIconConfig(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.unreadCard]}
        onPress={() => {
          if (!item.read) handleMarkAsRead(item._id);
          // Navigate to booking details or chat if related ID is present
          if (item.type?.startsWith('booking_') && item.relatedId) {
            navigation.navigate('CaseDetail', { booking: { _id: item.relatedId } });
          } else if (item.type === 'message_received' && item.relatedId) {
            navigation.navigate('Chat', { chatId: item.relatedId });
          }
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>{item.title}</Text>
            {!item.read && <View style={styles.activeDot} />}
          </View>
          <Text style={styles.cardMessage}>{item.message}</Text>
          <Text style={styles.cardTime}>{formatDate(item.createdAt, 'datetime')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No new notifications found in your inbox.</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  backBtn: { width: 36, padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  markAllBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, backgroundColor: 'rgba(20, 184, 166, 0.08)' },
  markAllText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    flexDirection: 'row', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1
  },
  unreadCard: {
    backgroundColor: '#FFFFFF', borderColor: 'rgba(20, 184, 166, 0.18)',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'
  },
  contentContainer: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  unreadText: { color: COLORS.textPrimary, fontWeight: '800' },
  activeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.primary },
  cardMessage: { fontSize: 12, color: '#4B5563', marginTop: 4, lineHeight: 18, fontWeight: '500' },
  cardTime: { fontSize: 10, color: '#9CA3AF', marginTop: 6, fontWeight: '600' },

  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 32 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 6, lineHeight: 18, fontWeight: '500' }
});

export default NotificationsScreen;
