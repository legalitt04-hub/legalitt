import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { advocateAPI } from '../../services/api';
import AdvocateCard from '../../components/advocate/AdvocateCard';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const ServiceCard = ({ icon, title, desc, btnText, onPress, accent = false }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.serviceCard, accent && styles.serviceCardAccent]}
    activeOpacity={0.85}
  >
    <View style={styles.serviceIcon}>{icon}</View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceDesc}>{desc}</Text>
    <TouchableOpacity onPress={onPress} style={styles.serviceBtn}>
      <Text style={styles.serviceBtnText}>{btnText}</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      let params = { lat: 23.1815, lng: 79.9864 }; // Jabalpur default
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        params = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }
      const { data } = await advocateAPI.getNearby(params);
      setAdvocates(data.data || []);
    } catch {
      // Use fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNearby(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNearby();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarCircle}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* AI Banner */}
        <View style={styles.aiBanner}>
          <LinearGradient colors={[COLORS.primaryLight, '#c8f0ec']} style={styles.aiBannerGrad}>
            <View style={styles.aiBannerIcon}>
              <Text style={{ fontSize: 40 }}>🤖</Text>
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>Chat With AI Legal Assistant</Text>
              <Text style={styles.aiBannerDesc}>Get Instant Legal Guidance</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AI')}
                style={styles.aiBannerBtn}
              >
                <Text style={styles.aiBannerBtnText}>Chat With AI</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Service Grid */}
        <View style={styles.grid}>
          <ServiceCard
            icon={<Ionicons name="location" size={28} color={COLORS.primary} />}
            title="Find Nearby Advocates"
            desc="You Can Find Advocates Nearby"
            btnText="Open"
            onPress={() => navigation.navigate('Map')}
          />
          <ServiceCard
            icon={<Ionicons name="sparkles" size={28} color={COLORS.primary} />}
            title="AI Legal Assistant"
            desc="Ask Law-related Questions"
            btnText="Chat With AI"
            onPress={() => navigation.navigate('AI')}
          />
          <ServiceCard
            icon={<Ionicons name="document-text" size={28} color={COLORS.primary} />}
            title="FIR Draft Generator"
            desc="Generate FIR Drafts Easily"
            btnText="Open"
            onPress={() => navigation.navigate('FIRDraft')}
          />
          <ServiceCard
            icon={<Ionicons name="calendar" size={28} color={COLORS.primary} />}
            title="My Bookings"
            desc="Track Your Consultations"
            btnText="View"
            onPress={() => navigation.navigate('MyBookings')}
          />
        </View>

        {/* Nearby Advocates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Advocates</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {advocates.map((advocate) => (
            <AdvocateCard
              key={advocate._id}
              advocate={advocate}
              onViewProfile={() => navigation.navigate('AdvocateProfile', { advocateId: advocate._id })}
              onBookNow={() => navigation.navigate('AdvocateProfile', { advocateId: advocate._id, openBooking: true })}
            />
          ))}

          {advocates.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>⚖️</Text>
              <Text style={styles.emptyText}>No advocates found nearby</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 8 }}>Search All Advocates</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingTop: 52, paddingBottom: 16, backgroundColor: '#fff',
  },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  headerAvatar: { width: 42, height: 42, borderRadius: 21 },
  greeting: { flex: 1, fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  headerIcons: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  aiBanner: { margin: SIZES.screenPadding, marginBottom: 12, borderRadius: SIZES.radiusLg, overflow: 'hidden', ...SHADOWS.sm },
  aiBannerGrad: { flexDirection: 'row', padding: SIZES.lg, borderRadius: SIZES.radiusLg, alignItems: 'center' },
  aiBannerIcon: { marginRight: SIZES.md },
  aiBannerText: { flex: 1 },
  aiBannerTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.secondary },
  aiBannerDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
  aiBannerBtn: {
    marginTop: 10, backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radiusFull, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start',
  },
  aiBannerBtnText: { color: '#fff', fontSize: SIZES.caption, fontWeight: '700' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.screenPadding - 6,
    marginBottom: 8,
  },
  serviceCard: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    backgroundColor: '#fff', borderRadius: SIZES.radiusLg,
    padding: SIZES.md, margin: 6, ...SHADOWS.sm,
  },
  serviceCardAccent: { backgroundColor: COLORS.primaryLight },
  serviceIcon: { marginBottom: 8 },
  serviceTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  serviceDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  serviceBtn: {
    marginTop: 10, backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radiusFull, paddingVertical: 8, alignItems: 'center',
  },
  serviceBtnText: { color: '#fff', fontSize: SIZES.caption, fontWeight: '700' },
  section: { marginTop: 8 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginBottom: 12,
  },
  sectionTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: SIZES.body, color: COLORS.primary, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 12 },
});

export default HomeScreen;
