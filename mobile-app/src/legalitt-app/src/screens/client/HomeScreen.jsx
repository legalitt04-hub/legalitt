// screens/client/HomeScreen.jsx - COMPLETE FIX
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Dimensions, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/theme';
import SafeScreen from '../../components/SafeScreen';
import { advocateAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChatList } from '../../hooks/useChat';
import { getCachedData } from '../../utils/offlineCache';

const transformNearbyAdvocates = (rawAdvocates) => {
  if (!rawAdvocates || !Array.isArray(rawAdvocates)) return [];
  return rawAdvocates.map(adv => ({
    id: adv._id,
    name: adv.user?.name || 'Unknown',
    avatar: adv.user?.avatar || `https://i.pravatar.cc/150?u=${adv.user?._id || adv._id}`,
    title: 'Advocate',
    specializations: adv.specializations || [],
    specialization: adv.specializations?.join(' • ') || 'Legal Services',
    rating: adv.rating?.average || 0,
    reviews: adv.rating?.count || 0,
    experience: adv.experience || 0,
    status: adv.isOnline ? 'Online' : 'Offline',
    consultationFee: adv.consultationFee || 500,
    distance: adv.distance || 0,
    distanceMeters: adv.distanceMeters || 0,
    location: adv.location,
  }));
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { chats, refetch } = useChatList();
  const unreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    specializations: [],
    searchMode: 'nearby',
    city: '',
    minRating: 0,
    maxFee: null,
    minExperience: 0,
    radius: 5,
  });

  const displayName = user?.name || user?.user?.name || 'User';
  const firstName = displayName.split(' ')[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  useEffect(() => {
    const loadCached = async () => {
      try {
        const cached = await getCachedData('cached_advocates_nearby');
        if (cached && cached.data) {
          const transformed = transformNearbyAdvocates(cached.data);
          setAdvocates(transformed);
        }
      } catch (err) {
        console.error('Error loading cached nearby advocates:', err);
      }
    };
    loadCached();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyAdvocates();
    }
  }, [userLocation, filters.radius]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation({ latitude: 22.7196, longitude: 75.8577 });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setUserLocation({ latitude: 22.7196, longitude: 75.8577 });
    }
  };

  const fetchNearbyAdvocates = async () => {
    try {
      setLoading(true);
      if (!userLocation) return;
      const { latitude, longitude } = userLocation;

      const response = await advocateAPI.getNearby({
        lat: latitude,
        lng: longitude,
        radius: filters.radius,
        limit: 20,
      });

      if (response.data.success && response.data.data) {
        const transformedAdvocates = transformNearbyAdvocates(response.data.data);
        setAdvocates(transformedAdvocates);
      }
    } catch (error) {
      console.error('Error fetching advocates:', error);
      // Fallback: If network request fails, don't clear previously loaded cached advocates
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), fetchNearbyAdvocates()]);
    setRefreshing(false);
  };

  const quickActions = [
    { id: '1', icon: 'location-outline', title: 'Find Nearby Advocates', subtitle: 'Search by Location', cta: 'Open', screen: 'Map' },
    { id: '2', icon: 'sparkles-outline', title: 'AI Legal Assistant', subtitle: 'Ask Questions', cta: 'Chat with AI', screen: 'AI' },
    { id: '3', icon: 'document-text-outline', title: 'FIR Draft Generator', subtitle: 'Generate Drafts', cta: 'Generate', screen: 'FIRTypeSelector' },
    { id: '4', icon: 'calendar-outline', title: 'My Bookings', subtitle: 'Track Consultations', cta: 'View', screen: 'MyBookings' },
  ];

  return (
    <SafeScreen backgroundColor="#F9FAFB" barStyle="dark-content">
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
            <Image
              source={{ uri: user?.avatar || user?.user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <IconButton onPress={() => navigation.navigate('ChatList')}>
              <View style={{ position: 'relative' }}>
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                {unreadCount > 0 && (
                  <View style={styles.badgeDot} />
                )}
              </View>
            </IconButton>
            <IconButton onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={18} color="#6B7280" />
            </IconButton>
            <IconButton onPress={() => navigation.navigate('SavedAdvocates')}>
              <Ionicons name="bookmark-outline" size={18} color="#0D9488" />
            </IconButton>
          </View>
        </View>

        {/* AI Hero Card */}
        <TouchableOpacity style={styles.aiHero} onPress={() => navigation.navigate('AI')} activeOpacity={0.9}>
          <View style={styles.aiHeroContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>Chat With AI Legal Assistant</Text>
              <Text style={styles.aiSubtitle}>Get instant legal guidance</Text>
              <View style={styles.aiButton}>
                <Text style={styles.aiButtonText}>Chat with AI</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <QuickCard
              key={action.id}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              cta={action.cta}
              onPress={() => navigation.navigate(action.screen)}
            />
          ))}
        </View>


        {/* Nearby Advocates Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby Advocates ({filters.radius}km)</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchFilter')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Advocates List - Show only 4 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Finding advocates near you...</Text>
          </View>
        ) : advocates.length > 0 ? (
          <>
            {advocates.slice(0, 4).map((advocate) => (
              <AdvocateListCard
                key={advocate.id}
                advocate={advocate}
                onPress={() => navigation.navigate('AdvocateProfile', { id: advocate.id })}
              />
            ))}

            {/* ✅ See All Button after 4 advocates */}
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.loadingText}>No advocates found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const QuickCard = ({ icon, title, subtitle, cta, onPress }) => (
  <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.quickIcon}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.quickTitle}>{title}</Text>
    <Text style={styles.quickSubtitle}>{subtitle}</Text>
    <View style={styles.quickCta}>
      <Text style={styles.quickCtaText}>{cta}</Text>
    </View>
  </TouchableOpacity>
);

const IconButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress} activeOpacity={0.7}>
    {children}
  </TouchableOpacity>
);

const AdvocateListCard = ({ advocate, onPress }) => (
  <TouchableOpacity style={styles.advocateListCard} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.advocateCardHeader}>
      <Image source={{ uri: advocate.avatar }} style={styles.listAdvocateAvatar} />
      <View style={styles.listAdvocateInfo}>
        <View style={styles.listNameRow}>
          <Text style={styles.listAdvocateName} numberOfLines={1}>{advocate.name}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedCheck}>✓</Text>
          </View>
        </View>
        <Text style={styles.listAdvocateTitle}>{advocate.title}</Text>
        <Text style={styles.listAdvocateSpecialization} numberOfLines={1}>{advocate.specialization}</Text>
        <View style={styles.listRatingRow}>
          <Ionicons name="star" size={12} color="#FCD34D" />
          <Text style={styles.listRatingText}>{advocate.rating.toFixed(1)}</Text>
          <Text style={styles.listReviewCount}>({advocate.reviews})</Text>
          {advocate.distance > 0 && (
            <>
              <Text style={styles.listReviewCount}> • </Text>
              <Text style={styles.listReviewCount}>{advocate.distance.toFixed(1)}km</Text>
            </>
          )}
        </View>
      </View>
    </View>

    <View style={styles.advocateCardFooter}>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: advocate.status === 'Online' ? '#10B981' : '#9CA3AF' }]} />
        <Text style={styles.statusText}>{advocate.status}</Text>
      </View>
      <Text style={styles.consultationRateText}>₹{advocate.consultationFee}/consultation</Text>
    </View>

    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.viewProfileButton} onPress={onPress}>
        <Text style={styles.viewProfileText}>View Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bookNowButton} onPress={onPress}>
        <Text style={styles.bookNowText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  greeting: { fontSize: 12, color: '#6B7280' },
  userName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  aiHero: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  aiHeroContent: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  aiText: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  aiSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 12 },
  aiButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  aiButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 20, marginBottom: 16 },
  quickCard: { width: isSmallDevice ? '47%' : '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: isSmallDevice ? 14 : 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  quickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6F7F8', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickTitle: { fontSize: isSmallDevice ? 12 : 13, fontWeight: '600', color: '#0F172A', marginBottom: 4, lineHeight: 16 },
  quickSubtitle: { fontSize: 11, color: '#6B7280', lineHeight: 14, marginBottom: 12 },
  quickCta: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  quickCtaText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  resultsCount: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginHorizontal: 20, marginBottom: 12 },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  verifiedCheck: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  advocateListCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  advocateCardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  listAdvocateAvatar: { width: 56, height: 56, borderRadius: 14 },
  listAdvocateInfo: { flex: 1 },
  listNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  listAdvocateName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  listAdvocateTitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  listAdvocateSpecialization: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  listRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listRatingText: { fontSize: 12, fontWeight: '500', color: '#0F172A' },
  listReviewCount: { fontSize: 11, color: '#6B7280' },
  advocateCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  consultationRateText: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  viewProfileButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  viewProfileText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  bookNowButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  bookNowText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  seeAllButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  badgeDot: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

