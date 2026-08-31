// screens/client/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

import { bookingAPI, firAPI, chatAPI } from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completeness, setCompleteness] = useState(user?.completeness || 0);
  const [stats, setStats] = useState({ consultations: 0, drafts: 0, chats: 0 });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      handleRefresh();
      fetchRealStats();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (user) {
      setCompleteness(user.completeness || 0);
    }
  }, [user]);

  const fetchRealStats = async () => {
    try {
      const [bookingsRes, draftsRes, chatsRes] = await Promise.allSettled([
        bookingAPI.getMy(),
        firAPI.getMyDrafts(),
        chatAPI.getChats(),
      ]);
      const consultations = bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data?.data?.length || 0) : 0;
      const drafts = draftsRes.status === 'fulfilled' ? (draftsRes.value.data?.data?.length || 0) : 0;
      const chats = chatsRes.status === 'fulfilled' ? (chatsRes.value.data?.data?.length || chatsRes.value.data?.length || 0) : 0;
      setStats({ consultations, drafts, chats });
    } catch (err) {
      console.log('Error fetching profile stats:', err);
    }
  };

  const handleRefresh = async () => {
    if (!user) setLoading(true);
    await refreshUser();
    setLoading(false);
  };

  const menuItems = [
    {
      id: '0',
      icon: 'time-outline',
      title: 'My FIR Drafts',
      subtitle: 'View your saved legal drafts',
      screen: 'MyDrafts',
      color: COLORS.primary,
    },
    {
      id: '1',
      icon: 'chatbubble-outline',
      title: 'My Chats',
      subtitle: 'All conversations with advocates',
      screen: 'ChatList',
      color: COLORS.primary,
    },
    {
      id: '2',
      icon: 'document-text-outline',
      title: 'My Requests',
      subtitle: 'Status and Report',
      screen: 'MyBookings',
      color: COLORS.primary,
    },
    {
      id: '3',
      icon: 'bookmark-outline',
      title: 'Saved Advocates',
      subtitle: 'Your bookmarked lawyers',
      screen: 'SavedAdvocates',
      color: COLORS.primary,
    },
    {
      id: '4',
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Language, notification & Privacy',
      screen: 'Settings',
      color: COLORS.primary,
    },
    {
      id: '5',
      icon: 'card-outline',
      title: 'Payments',
      subtitle: 'Consultation Payments & invoice',
      screen: 'MyBookings',
      color: COLORS.primary,
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await logout();
            setLoading(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  // ── Guest login overlay (shown on top of blurred profile screen) ─────────
  const GuestOverlay = () => (
    <Modal transparent animationType="fade" visible={!isAuthenticated}>
      <View style={styles.overlayBg}>
        <View style={styles.overlayCard}>
          {/* Placeholder avatar */}
          <View style={styles.overlayAvatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.overlayTitle}>Welcome to Legalitt</Text>
          <Text style={styles.overlaySubtitle}>Sign in to access your profile, bookings, and more</Text>

          {/* Client login */}
          <TouchableOpacity
            style={styles.overlayClientBtn}
            onPress={() => navigation.navigate('LoginRegister', { role: 'client' })}
            activeOpacity={0.85}
          >
            <Ionicons name="person-circle-outline" size={20} color="#fff" />
            <Text style={styles.overlayClientBtnText}>Sign in as Client</Text>
          </TouchableOpacity>

          {/* Advocate login */}
          <TouchableOpacity
            style={styles.overlayAdvBtn}
            onPress={() => navigation.navigate('LoginRegister', { role: 'advocate' })}
            activeOpacity={0.85}
          >
            <Ionicons name="briefcase-outline" size={20} color={COLORS.accent} />
            <Text style={styles.overlayAdvBtnText}>Are you an Advocate?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Guest Login Overlay — appears on top when not authenticated */}
      <GuestOverlay />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: user?.avatar || user?.user?.avatar || 'https://i.pravatar.cc/200?img=1' }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{user?.name || user?.user?.name || 'Legalitt User'}</Text>
          <Text style={styles.userEmail}>{user?.email || user?.user?.email || 'user@legalitt.com'}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Real Live Stats Bar */}
        <View style={styles.statsCardContainer}>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('MyBookings')} activeOpacity={0.7}>
            <Text style={styles.statNumText}>{stats.consultations}</Text>
            <Text style={styles.statLabelText}>Bookings</Text>
          </TouchableOpacity>
          <View style={styles.statVLine} />
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('MyDrafts')} activeOpacity={0.7}>
            <Text style={styles.statNumText}>{stats.drafts}</Text>
            <Text style={styles.statLabelText}>FIR Drafts</Text>
          </TouchableOpacity>
          <View style={styles.statVLine} />
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('ChatList')} activeOpacity={0.7}>
            <Text style={styles.statNumText}>{stats.chats}</Text>
            <Text style={styles.statLabelText}>Chats</Text>
          </TouchableOpacity>
        </View>

        {/* Completeness Bar */}
        <View style={styles.completenessContainer}>
           <View style={styles.completenessHeader}>
              <Text style={styles.completenessTitle}>Profile Completeness</Text>
              <Text style={styles.completenessValue}>{completeness}%</Text>
           </View>
           <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completeness}%` }]} />
           </View>
           {completeness < 100 && (
             <Text style={styles.completenessHint}>Complete your profile to get better legal recommendations.</Text>
           )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={18} color="#FFFFFF" />
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            </View>

            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Padding for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(176, 156, 133, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  completenessContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  completenessValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  completenessHint: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  logoutIcon: {
    backgroundColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
  },
  statsCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAF5',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  statVLine: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  // ── Guest overlay styles ──────────────────────────────────────
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 64, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primarySurface || '#EEF4FA',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  overlayTitle: {
    fontSize: 20, fontWeight: '800',
    color: COLORS.primary, marginBottom: 8, textAlign: 'center',
  },
  overlaySubtitle: {
    fontSize: 13, color: '#6B7280',
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  overlayClientBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
    width: '100%', justifyContent: 'center', marginBottom: 12,
  },
  overlayClientBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700',
  },
  overlayAdvBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 24,
    width: '100%', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent || '#C9A84C',
    backgroundColor: '#FFFCF0',
  },
  overlayAdvBtnText: {
    color: COLORS.accent || '#C9A84C', fontSize: 15, fontWeight: '700',
  },
});

export default ProfileScreen;
