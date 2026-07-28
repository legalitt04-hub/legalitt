// screens/client/SearchFilterScreen.jsx - COMBINED SEARCH + FILTER
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../constants/theme';
import SafeScreen from '../../components/SafeScreen';
import { advocateAPI } from '../../services/api';

const SPECIALIZATIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
  'Labour Law', 'Constitutional Law', 'Tax Law', 'Consumer Law', 'Cyber Law',
  'Intellectual Property', 'Banking Law', 'Environmental Law', 'Human Rights', 'Immigration Law',
];

const CITIES = [
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 
  'Rewa', 'Satna', 'Dewas', 'Katni', 'Ratlam', 'Khandwa',
];

const SearchFilterScreen = ({ navigation }) => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [filters, setFilters] = useState({
    searchMode: 'nearby',
    radius: 5,
    city: '',
    specializations: [],
    minRating: 0,
    maxFee: 5000,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation || filters.city) {
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
    const pageLimit = pageNum === 1 ? 10 : 50; // First page: 10, rest: 50
      isFetchingRef.current = true;
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;

      if (filters.searchMode === 'city' && filters.city) {
        response = await advocateAPI.getAdvocates({
          city: filters.city,
          specialization: filters.specializations.length > 0 ? filters.specializations[0] : undefined,
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
          maxFee: filters.maxFee < 5000 ? filters.maxFee : undefined,
          limit: pageLimit,
          page: pageNum,
        });
      } else if (userLocation) {
        const { latitude, longitude } = userLocation;
        response = await advocateAPI.getNearby({
          lat: latitude,
          lng: longitude,
          radius: filters.radius,
          specialization: filters.specializations.length > 0 ? filters.specializations[0] : undefined,
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
          maxFee: filters.maxFee < 5000 ? filters.maxFee : undefined,
          limit: pageLimit,
          page: pageNum,
        });
      }

      if (response?.data?.success && response?.data?.data) {
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

        if (reset || pageNum === 1) {
          setAdvocates(transformedAdvocates);
        } else {
          setAdvocates(prev => {
            const combined = [...prev, ...transformedAdvocates];
            const unique = combined.filter((adv, index, self) =>
              index === self.findIndex(a => a.id === adv.id)
            );
            return unique;
          });
        }
        setPage(pageNum);

        // Update hasMore from backend response
        if (response.data.pagination) {
          setHasMore(response.data.pagination.hasMore);
        } else {
          setHasMore(false); // No pagination info = no more data
        }
      }
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };
  const handleLoadMore = () => {
    // Use ref to prevent race condition
    if (isFetchingRef.current || loadingMore || !hasMore) return;
    isFetchingRef.current = true;
    fetchAdvocates(page + 1, false);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSpecialization = (spec) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
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
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.specialization} numberOfLines={1}>{item.specialization}</Text>
          <View style={styles.statsRow}>
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
            {item.distance > 0 && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distance}>{item.distance.toFixed(1)}km</Text>
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
        <Text style={styles.fee}>₹{item.consultationFee}</Text>
      </View>
    </TouchableOpacity>
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
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? "chevron-up" : "options-outline"} 
            size={20} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Filters Section - Collapsible */}
        {showFilters && (
          <ScrollView 
            style={styles.filtersContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Mode */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Search Mode</Text>
              <View style={styles.modeButtons}>
                <TouchableOpacity
                  style={[styles.modeButton, filters.searchMode === 'nearby' && styles.modeButtonActive]}
                  onPress={() => updateFilter('searchMode', 'nearby')}
                >
                  <Ionicons name="navigate" size={16} color={filters.searchMode === 'nearby' ? '#FFF' : COLORS.primary} />
                  <Text style={[styles.modeText, filters.searchMode === 'nearby' && styles.modeTextActive]}>Nearby</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, filters.searchMode === 'city' && styles.modeButtonActive]}
                  onPress={() => updateFilter('searchMode', 'city')}
                >
                  <Ionicons name="business" size={16} color={filters.searchMode === 'city' ? '#FFF' : COLORS.primary} />
                  <Text style={[styles.modeText, filters.searchMode === 'city' && styles.modeTextActive]}>By City</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Radius - Only for Nearby */}
            {filters.searchMode === 'nearby' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Search Radius: {filters.radius}km</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={1}
                  value={filters.radius}
                  onValueChange={(val) => updateFilter('radius', val)}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor={COLORS.primary}
                />
              </View>
            )}

            {/* City - Only for City mode */}
            {filters.searchMode === 'city' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Select City</Text>
                <View style={styles.chipsContainer}>
                  {CITIES.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.chip, filters.city === city && styles.chipActive]}
                      onPress={() => updateFilter('city', city)}
                    >
                      <Text style={[styles.chipText, filters.city === city && styles.chipTextActive]}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Specializations */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Specializations</Text>
              <View style={styles.chipsContainer}>
                {SPECIALIZATIONS.slice(0, 8).map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[styles.chip, filters.specializations.includes(spec) && styles.chipActive]}
                    onPress={() => toggleSpecialization(spec)}
                  >
                    <Text style={[styles.chipText, filters.specializations.includes(spec) && styles.chipTextActive]}>
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Results Section */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {loading ? 'Searching...' : `Showing ${advocates.length} advocates${hasMore ? ' • Scroll for more' : ''}`}
          </Text>

          <FlatList
            data={advocates}
            renderItem={renderAdvocateCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={hasMore ? handleLoadMore : null}
            onEndReachedThreshold={0.1}
            ListFooterComponent={loadingMore && (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: 20 }} />
            )}
            ListEmptyComponent={!loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No advocates found</Text>
              </View>
            )}
          />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
  filterToggle: { padding: 8 },
  container: { flex: 1 },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterSection: { marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  modeButtons: { flexDirection: 'row', gap: 8 },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  modeTextActive: { color: '#FFFFFF' },
  slider: { height: 40 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },
  resultsContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  resultsCount: { fontSize: 13, fontWeight: '600', color: '#6B7280', paddingHorizontal: 16, paddingVertical: 12 },
  listContent: { paddingHorizontal: 16 },
  advocateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 10 },
  advocateInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  specialization: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 11, fontWeight: '500', color: '#1F2937' },
  reviews: { fontSize: 10, color: '#6B7280' },
  separator: { fontSize: 10, color: '#6B7280', marginHorizontal: 2 },
  distance: { fontSize: 10, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, color: '#6B7280' },
  fee: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6B7280', marginTop: 8 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchFilterScreen;
