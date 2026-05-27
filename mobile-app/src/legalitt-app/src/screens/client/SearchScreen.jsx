// screens/client/SearchScreen.jsx - WITH PAGINATION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/theme';
import SafeScreen from '../../components/SafeScreen';
import { advocateAPI } from '../../services/api';

const SearchScreen = ({ navigation, route }) => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    specializations: [],
    searchMode: 'nearby',
    city: '',
    minRating: 0,
    maxFee: null,
    minExperience: 0,
    radius: 10,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Fetch if we have location OR a city filter
    if (userLocation || (filters.city && filters.city.trim())) {
      fetchAdvocates(1, true);
    }
  }, [userLocation, filters]);

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

  const fetchAdvocates = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      if (!userLocation && !filters.city) {
        console.log('Waiting for location...');
        setLoading(false);
        return;
      }

      let response;

      if (filters.city && filters.city.trim()) {
        // ✅ City search with pagination
        response = await advocateAPI.getAdvocates({
          city: filters.city,
          specialization: filters.specializations.length > 0 ? filters.specializations[0] : undefined,
          limit: 10,
          page: pageNum,
        });
      } else if (userLocation) {
        const { latitude, longitude } = userLocation;

        // ✅ Nearby search with pagination
        response = await advocateAPI.getNearby({
          lat: latitude,
          lng: longitude,
          radius: filters.radius,
          limit: 50, // ✅ 50 per page
          page: pageNum, // ✅ Current page
        });
      }

      if (response.data.success && response.data.data) {
        const transformedAdvocates = response.data.data.map(adv => ({
          id: adv._id,
          name: adv.user?.name || 'Unknown',
          avatar: adv.user?.avatar || `https://i.pravatar.cc/150?u=${adv.user?._id || adv._id}`,
          specialization: adv.specializations?.join(' • ') || 'Legal Services',
          rating: adv.rating?.average || 0,
          reviews: adv.rating?.count || 0,
          experience: adv.experience || 0,
          consultationFee: adv.consultationFee || 500,
          distance: adv.distance || 0,
          status: adv.isOnline ? 'Online' : 'Offline',
        }));

        // ✅ Handle pagination
        if (reset || pageNum === 1) {
          setAdvocates(transformedAdvocates);
        } else {
          setAdvocates(prev => [...prev, ...transformedAdvocates]);
        }

        // ✅ Update pagination state
        if (response.data.pagination) {
          setHasMore(response.data.pagination.hasMore);
          setTotalCount(response.data.pagination.total);
        } else {
          setHasMore(false);
          setTotalCount(transformedAdvocates.length);
        }

        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAdvocates(page + 1, false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdvocates(1, true);
    setRefreshing(false);
  };

  const renderAdvocateCard = ({ item }) => (
    <TouchableOpacity
      style={styles.advocateCard}
      onPress={() => navigation.navigate('AdvocateProfile', { id: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.advocateInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
          </View>
          <Text style={styles.specialization} numberOfLines={1}>{item.specialization}</Text>
          <View style={styles.statsRow}>
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
            {item.distance > 0 && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distance}>{item.distance.toFixed(1)}km away</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'Online' ? '#10B981' : '#9CA3AF' }]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.fee}>₹{item.consultationFee}/consultation</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No advocates found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  return (
    <SafeScreen backgroundColor="#F9FAFB" barStyle="dark-content">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Advocates</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('Filter')}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {loading ? 'Searching...' : `${totalCount} advocates found within ${filters.radius}km`}
        </Text>
        {advocates.length > 0 && hasMore && (
          <Text style={styles.loadedText}>
            Showing {advocates.length} of {totalCount}
          </Text>
        )}
      </View>

      {/* Advocates List */}
      <FlatList
        data={advocates}
        renderItem={renderAdvocateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading && renderEmpty}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding advocates...</Text>
        </View>
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', flex: 1, marginLeft: 12 },
  filterButton: { padding: 8 },
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultsText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  loadedText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listContent: { padding: 20 },
  advocateCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 14 },
  advocateInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1 },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  verifiedCheck: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  specialization: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, fontWeight: '500', color: '#1F2937' },
  reviews: { fontSize: 11, color: '#6B7280' },
  separator: { fontSize: 11, color: '#6B7280', marginHorizontal: 4 },
  distance: { fontSize: 11, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  fee: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  actionButtons: { flexDirection: 'row', gap: 8 },
  viewButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  viewButtonText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  bookButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  footerLoader: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, color: '#6B7280' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
});

export default SearchScreen;
