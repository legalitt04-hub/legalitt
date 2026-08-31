// screens/client/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, firAPI, chatAPI } from '../../services/api';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// GUEST VIEW — shown when user is NOT logged in
// ─────────────────────────────────────────────────────────────────────────────
const GuestView = ({ navigation }) => (
  <SafeAreaView style={g.container}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

    {/* Navy header */}
    <View style={g.header}>
      <View style={g.logoCircle}>
        <Text style={g.logoEmoji}>⚖️</Text>
      </View>
      <Text style={g.headerTitle}>My Profile</Text>
      <Text style={g.headerSub}>
        Sign in to access bookings, FIR drafts,{'\n'}chats and legal services
      </Text>
    </View>

    <ScrollView contentContainerStyle={g.body} showsVerticalScrollIndicator={false}>

      {/* ── CLIENT SIGN IN ── */}
      <Text style={g.sectionLabel}>FOR CLIENTS</Text>

      <TouchableOpacity
        style={g.clientBtn}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('LoginRegister', { role: 'client' })}
      >
        <View style={g.clientIconWrap}>
          <Ionicons name="person" size={26} color="#fff" />
        </View>
        <View style={g.btnInfo}>
          <Text style={g.btnTitle}>Sign in as Client</Text>
          <Text style={g.btnSub}>Book advocates, FIR drafts, AI legal help</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={g.linkRow}
        onPress={() => navigation.navigate('LoginRegister', { role: 'client', mode: 'register' })}
      >
        <Text style={g.linkTxt}>
          New user?{'  '}
          <Text style={g.linkHighlight}>Create Client Account →</Text>
        </Text>
      </TouchableOpacity>

      {/* ── DIVIDER ── */}
      <View style={g.divRow}>
        <View style={g.divLine} />
        <Text style={g.divTxt}>OR</Text>
        <View style={g.divLine} />
      </View>

      {/* ── ADVOCATE SIGN IN ── */}
      <Text style={g.sectionLabel}>FOR ADVOCATES</Text>

      <TouchableOpacity
        style={g.advocateBtn}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('LoginRegister', { role: 'advocate' })}
      >
        <View style={g.advocateIconWrap}>
          <Ionicons name="briefcase" size={24} color={COLORS.accent || '#C9A84C'} />
        </View>
        <View style={g.btnInfo}>
          <Text style={[g.btnTitle, { color: '#7A5C1E' }]}>Sign in as Advocate</Text>
          <Text style={[g.btnSub, { color: '#92742D' }]}>Manage cases, earnings & practice</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.accent || '#C9A84C'} />
      </TouchableOpacity>

      {/* ── FEATURE PILLS ── */}
      <View style={g.pills}>
        {[
          { icon: 'lock-closed-outline', label: 'Encrypted' },
          { icon: 'shield-checkmark-outline', label: 'Verified' },
          { icon: 'flash-outline', label: 'Instant' },
        ].map((p, i) => (
          <View key={i} style={g.pill}>
            <Ionicons name={p.icon} size={14} color={COLORS.primary} />
            <Text style={g.pillTxt}>{p.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  </SafeAreaView>
);

const g = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logoEmoji:    { fontSize: 32 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 6, lineHeight: 20 },

  body: { paddingHorizontal: 20, paddingTop: 28 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#9BA3B4',
    letterSpacing: 1, marginBottom: 10, marginLeft: 4,
  },

  // Client button — full navy
  clientBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 7,
  },
  clientIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnInfo:  { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  btnSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  linkRow: { alignItems: 'center', marginTop: 14, marginBottom: 6 },
  linkTxt: { fontSize: 13, color: '#6B7280' },
  linkHighlight: { color: COLORS.primary, fontWeight: '700' },

  // Divider
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: '#DDE3ED' },
  divTxt: { fontSize: 11, fontWeight: '800', color: '#B0BAC9' },

  // Advocate button — gold outline
  advocateBtn: {
    backgroundColor: '#FFFCF0', borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, borderColor: COLORS.accent || '#C9A84C',
    shadowColor: COLORS.accent || '#C9A84C',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  advocateIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: 'rgba(201,168,76,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Pills
  pills: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 30 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#DDE3ED',
  },
  pillTxt: { fontSize: 11, fontWeight: '700', color: '#5A6478' },
});


// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED PROFILE SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, refreshUser, logout } = useAuth();
  const [loading, setLoading]       = useState(false);
  const [completeness, setComplete] = useState(user?.completeness || 0);
  const [stats, setStats]           = useState({ consultations: 0, drafts: 0, chats: 0 });

  // ── If guest → show role-selection screen ──────────────────────────────────
  if (!isAuthenticated) return <GuestView navigation={navigation} />;

  // ── Fetch stats on focus ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      refreshUser();
      fetchStats();
    });
    return unsub;
  }, [navigation]);

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
    { id: '0', icon: 'time-outline',          title: 'My FIR Drafts',    subtitle: 'View your saved legal drafts',         screen: 'MyDrafts' },
    { id: '1', icon: 'chatbubble-outline',     title: 'My Chats',         subtitle: 'All conversations with advocates',     screen: 'ChatList' },
    { id: '2', icon: 'document-text-outline',  title: 'My Requests',      subtitle: 'Status and report',                   screen: 'MyBookings' },
    { id: '3', icon: 'bookmark-outline',       title: 'Saved Advocates',  subtitle: 'Your bookmarked lawyers',              screen: 'SavedAdvocates' },
    { id: '4', icon: 'settings-outline',       title: 'Settings',         subtitle: 'Language, notifications & privacy',   screen: 'Settings' },
    { id: '5', icon: 'card-outline',           title: 'Payments',         subtitle: 'Consultation payments & invoices',     screen: 'MyBookings' },
  ];

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
            { num: stats.consultations, label: 'Bookings',  screen: 'MyBookings' },
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
