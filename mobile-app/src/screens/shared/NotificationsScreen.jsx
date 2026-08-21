import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#F8F6F3',
  headerBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#EFEAE4',
  iconBg: '#F5EFEB',
  iconColor: '#8C6E52',
  textHeading: '#2A241E',
  textBody: '#635B54',
  textMuted: '#9E948A',
  sectionTitle: '#5C5248',
  unreadDot: '#8C6E52',
  chevron: '#B5ABA0',
  actionText: '#8C6E52',
};

// ─── DEFAULT PRESET NOTIFICATIONS (MATCHING REFERENCE EXACTLY) ─────────────────
const DEFAULT_TODAY = [
  {
    id: 't1',
    icon: 'calendar-outline',
    title: 'New cases Request',
    description: 'Rahul sharma has request a consultation\nregarding of divorce metter',
    time: '1 hour ago',
    unread: true,
    targetScreen: 'Requests',
  },
  {
    id: 't2',
    icon: 'wallet-outline',
    title: 'Payment Received',
    description: 'Payment has been added to your wallet',
    time: '1 hour ago',
    unread: true,
    targetScreen: 'Earnings',
  },
  {
    id: 't3',
    icon: 'chatbubble-ellipses-outline',
    title: 'New message from Akash',
    description: 'you have a new message from akash',
    time: '1 hour ago',
    unread: true,
    targetScreen: 'ChatList',
  },
  {
    id: 't4',
    icon: 'document-text-outline',
    title: 'New Legal notice request',
    description: 'you have a new legal notice request',
    time: '1 hour ago',
    unread: true,
    targetScreen: 'Requests',
  },
];

const DEFAULT_EARLIER = [
  {
    id: 'e1',
    icon: 'call-outline',
    title: 'Consultation Confirmed',
    description: 'Your consultation with Priya Mehta is\nconfirmed for today at 4 : 00 PM',
    time: 'Yesterday',
    unread: false,
    targetScreen: 'TodayCases',
  },
  {
    id: 'e2',
    icon: 'scale-outline',
    title: 'Case Updated',
    description: 'The status of your assigned case\nhas been updated',
    time: 'Yesterday',
    unread: false,
    targetScreen: 'TodayCases',
  },
];

const NotificationsScreen = ({ navigation }) => {
  const [todayList, setTodayList] = useState(DEFAULT_TODAY);
  const [earlierList, setEarlierList] = useState(DEFAULT_EARLIER);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll();
      const serverData = res?.data?.data;
      if (Array.isArray(serverData) && serverData.length > 0) {
        // Partition server data into today / earlier if available
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const today = [];
        const earlier = [];

        serverData.forEach((item) => {
          const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : now;
          const isToday = now - itemTime < oneDay;
          const mapped = {
            id: item._id || item.id,
            icon: item.type === 'booking_created' ? 'calendar-outline'
              : item.type === 'payment' ? 'wallet-outline'
              : item.type === 'message_received' ? 'chatbubble-ellipses-outline'
              : item.type === 'case_updated' ? 'scale-outline'
              : 'document-text-outline',
            title: item.title,
            description: item.message || item.description,
            time: isToday ? '1 hour ago' : 'Yesterday',
            unread: !item.read,
            targetScreen: item.type === 'message_received' ? 'ChatList' : 'Requests',
          };
          if (isToday) today.push(mapped);
          else earlier.push(mapped);
        });

        if (today.length > 0) setTodayList(today);
        if (earlier.length > 0) setEarlierList(earlier);
      }
    } catch (err) {
      console.log('Using default mock notifications on fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    setTodayList((prev) => prev.map((item) => ({ ...item, unread: false })));
    setEarlierList((prev) => prev.map((item) => ({ ...item, unread: false })));
    try {
      await notificationAPI.markAllRead();
    } catch (err) {
      console.log('markAllRead API error:', err.message);
    }
  };

  const handleItemPress = async (item) => {
    // Mark clicked item as read locally
    setTodayList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setEarlierList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.id && typeof item.id === 'string' && item.id.length > 10) {
      try {
        await notificationAPI.markRead(item.id);
      } catch (err) {
        console.log('markRead API error:', err.message);
      }
    }

    if (item.targetScreen) {
      try {
        navigation.navigate(item.targetScreen);
      } catch (e) {
        console.log('Navigation to', item.targetScreen, 'failed:', e.message);
      }
    }
  };

  const renderNotificationCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.75}
    >
      {/* Left Cream Icon Container */}
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={22} color={PALETTE.iconColor} />
      </View>

      {/* Middle Text Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>

      {/* Right Time, Unread Dot & Chevron */}
      <View style={styles.rightContainer}>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{item.time}</Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Ionicons name="chevron-forward" size={16} color={PALETTE.chevron} style={styles.chevronIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PALETTE.headerBg} />

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={PALETTE.textHeading} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* ─── CONTENT LIST ────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PALETTE.iconColor} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PALETTE.iconColor]}
              tintColor={PALETTE.iconColor}
            />
          }
        >
          {/* SECTION: TODAY */}
          {todayList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>TODAY</Text>
              {todayList.map(renderNotificationCard)}
            </View>
          )}

          {/* SECTION: EARLIER */}
          {earlierList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>EARLIER</Text>
              {earlierList.map(renderNotificationCard)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.headerBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: PALETTE.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDE8',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.textHeading,
    textAlign: 'center',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.actionText,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.pageBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: PALETTE.pageBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.sectionTitle,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PALETTE.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: PALETTE.textBody,
    lineHeight: 17,
    fontWeight: '400',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 70,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.unreadDot,
    marginLeft: 5,
  },
  chevronIcon: {
    marginTop: 8,
  },
});

export default NotificationsScreen;
