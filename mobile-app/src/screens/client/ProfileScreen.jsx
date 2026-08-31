// screens/client/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, firAPI, chatAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, refreshUser, logout } = useAuth();
  const [loading, setLoading]       = useState(false);
  const [completeness, setComplete] = useState(user?.completeness || 0);
  const [stats, setStats]           = useState({ consultations: 0, drafts: 0, chats: 0 });

  // ── Guest: jab bhi Profile tab pe aao aur login nahi hai → LoginRegisterScreen pe bhejo
  useEffect(() => {
    if (!isAuthenticated) {
      // Navigate to client login. "Sign in as Advocate" is shown on that screen.
      navigation.navigate('LoginRegister', { role: 'client' });
    }
  }, [isAuthenticated]);

  // ── Also catch tabPress so clicking tab again navigates
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', (e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        navigation.navigate('LoginRegister', { role: 'client' });
      }
    });
    return unsub;
  }, [navigation, isAuthenticated]);

  // ── Focus listener to refresh data ──────────────────────────────────────────
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (isAuthenticated) {
        refreshUser();
        fetchStats();
      }
    });
    return unsub;
  }, [navigation, isAuthenticated]);

  useEffect(() => { if (user) setComplete(user.completeness || 0); }, [user]);

  const fetchStats = async () => {
    try {
      const [b, d, c] = await Promise.allSettled([
        bookingAPI.getMy(),
        firAPI.getMyDrafts(),
        chatAPI.getChats(),
      ]);
      setStats({
        consultations: b.status === 'fulfilled' ? (b.value.data?.data?.length || 0) : 0,
        drafts:        d.status === 'fulfilled' ? (d.value.data?.data?.length || 0) : 0,
        chats:         c.status === 'fulfilled' ? (c.value.data?.data?.length || c.value.data?.length || 0) : 0,
      });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          setLoading(true);
          await logout();
          setLoading(false);
        }
      },
    ]);
  };

  const menuItems = [
    { id: '0', icon: 'time-outline',          title: 'My FIR Drafts',    subtitle: 'View your saved legal drafts',        screen: 'MyDrafts' },
    { id: '1', icon: 'chatbubble-outline',     title: 'My Chats',         subtitle: 'All conversations with advocates',    screen: 'ChatList' },
    { id: '2', icon: 'document-text-outline',  title: 'My Requests',      subtitle: 'Booking status and reports',          screen: 'MyBookings' },
    { id: '3', icon: 'bookmark-outline',       title: 'Saved Advocates',  subtitle: 'Your bookmarked lawyers',             screen: 'SavedAdvocates' },
    { id: '4', icon: 'settings-outline',       title: 'Settings',         subtitle: 'Language, notifications & privacy',   screen: 'Settings' },
    { id: '5', icon: 'card-outline',           title: 'Payments',         subtitle: 'Consultation payments & invoices',    screen: 'MyBookings' },
  ];

  if (!isAuthenticated || loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>My Profile</Text></View>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={s.userSection}>
          <Image
            source={{ uri: user?.avatar || user?.user?.avatar || 'https://i.pravatar.cc/200?img=1' }}
            style={s.avatar}
          />
          <Text style={s.userName}>{user?.name || user?.user?.name || 'Legalitt User'}</Text>
          <Text style={s.userEmail}>{user?.email || user?.user?.email}</Text>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('ProfileEdit')}>
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={s.editBtnTxt}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsCard}>
          {[
            { num: stats.consultations, label: 'Bookings',   screen: 'MyBookings' },
            { num: stats.drafts,        label: 'FIR Drafts', screen: 'MyDrafts' },
            { num: stats.chats,         label: 'Chats',      screen: 'ChatList' },
          ].map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statVLine} />}
              <TouchableOpacity style={s.statBox} onPress={() => navigation.navigate(st.screen)}>
                <Text style={s.statNum}>{st.num}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Completeness */}
        <View style={s.progressWrap}>
          <View style={s.progressHeader}>
            <Text style={s.progressTitle}>Profile Completeness</Text>
            <Text style={s.progressPct}>{completeness}%</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${completeness}%` }]} />
          </View>
          {completeness < 100 && (
            <Text style={s.progressHint}>Complete your profile for better legal recommendations.</Text>
          )}
        </View>

        {/* Menu */}
        <View style={s.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.id} style={s.menuItem} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
              <View style={[s.menuIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name={item.icon} size={18} color="#fff" />
              </View>
              <View style={s.menuContent}>
                <Text style={s.menuTitle}>{item.title}</Text>
                <Text style={s.menuSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={s.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </View>
            <View style={s.menuContent}>
              <Text style={[s.menuTitle, { color: '#EF4444' }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  header:       { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F2F7' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#1A1F36', textAlign: 'center' },
  scroll:       { flex: 1 },
  scrollContent:{ paddingBottom: 20 },

  userSection:  { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar:       { width: 96, height: 96, borderRadius: 48, marginBottom: 12, borderWidth: 3, borderColor: COLORS.primarySurface || '#EEF4FA' },
  userName:     { fontSize: 18, fontWeight: '700', color: '#1A1F36', marginBottom: 4 },
  userEmail:    { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  editBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primarySurface || '#EEF4FA', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  editBtnTxt:   { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  statsCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFF', marginHorizontal: 20, marginBottom: 20, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#DDE3ED' },
  statBox:      { alignItems: 'center', flex: 1 },
  statNum:      { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel:    { fontSize: 11, fontWeight: '600', color: '#6B7280', marginTop: 2 },
  statVLine:    { width: 1, height: 28, backgroundColor: '#DDE3ED' },

  progressWrap: { paddingHorizontal: 20, marginBottom: 24 },
  progressHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 13, fontWeight: '700', color: '#1A1F36' },
  progressPct:  { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  progressBg:   { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressHint: { fontSize: 11, color: '#6B7280', marginTop: 6, fontStyle: 'italic' },

  menuSection:  { paddingHorizontal: 20, gap: 10 },
  menuItem:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, gap: 12 },
  menuIcon:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuContent:  { flex: 1 },
  menuTitle:    { fontSize: 14, fontWeight: '600', color: '#1A1F36', marginBottom: 2 },
  menuSub:      { fontSize: 11, color: '#6B7280' },
});

export default ProfileScreen;
