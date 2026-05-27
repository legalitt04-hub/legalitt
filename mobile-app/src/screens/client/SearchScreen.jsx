// screens/client/SearchScreen.jsx - WITH SHOW ON MAP
import React, { useState, useEffect } from 'react';
import FilterModal from './FilterModal';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { advocateAPI } from '../../services/api';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    specializations: [],
    city: '',
    minRating: 0,
    maxFee: null,
    minExperience: 0,
    radius: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || filters.specializations.length > 0 || filters.city) {
        searchAdvocates();
      } else {
        fetchDefaultAdvocates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const searchAdvocates = async () => {
    try {
      setLoading(true);

      const params = {
        limit: 100,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (filters.city) {
        params.city = filters.city;
      }

      if (filters.specializations.length > 0) {
        params.specializations = filters.specializations.join(',');
      }

      if (filters.minRating > 0) {
        params.minRating = filters.minRating;
      }

      if (filters.maxFee !== null) {
        params.maxFee = filters.maxFee;
      }

      if (filters.minExperience > 0) {
        params.minExperience = filters.minExperience;
      }

      const response = await advocateAPI.getAdvocates(params);

      if (response.data.success) {
        const advocatesData = response.data.data || [];
        
        const filtered = advocatesData.filter((adv) => {
          const matchesSearch = !searchQuery.trim() || 
            adv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adv.specializations?.some(spec => 
              spec.toLowerCase().includes(searchQuery.toLowerCase())
            );

          const matchesRating = 
            (adv.rating?.average || adv.rating || 0) >= filters.minRating;

          const matchesFee = 
            filters.maxFee === null || (adv.consultationFee || 0) <= filters.maxFee;

          const matchesExperience = 
            (adv.experience || 0) >= filters.minExperience;

          return matchesSearch && matchesRating && matchesFee && matchesExperience;
        });

        setAdvocates(filtered);
      }
    } catch (error) {
      console.error('Error searching advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultAdvocates = async () => {
    try {
      setLoading(true);

      const response = await advocateAPI.getAdvocates({
        limit: 50,
        page: 1,
      });

      if (response.data.success) {
        setAdvocates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleShowOnMap = (filterData) => {
    navigation.navigate('Map', { filters: filterData });
  };

  const renderAdvocate = ({ item: advocate, index }) => (
    <TouchableOpacity
      key={`adv-${index}`}
      style={styles.advocateCard}
      onPress={() => navigation.navigate('AdvocateProfile', { id: advocate._id })}
    >
      <Image
        source={{
          uri: advocate.user?.avatar || advocate.profilePicture || 'https://i.pravatar.cc/150?img=12',
        }}
        style={styles.avatar}
      />

      <View style={styles.advocateInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {advocate.user?.name || advocate.name || 'Advocate'}
          </Text>
          {advocate.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
          )}
        </View>

        <Text style={styles.specialization} numberOfLines={1}>
          {advocate.specializations?.[0] || 'Legal Advisor'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text style={styles.statText}>
              {advocate.rating?.average || advocate.rating || 4.5}
            </Text>
            <Text style={styles.statSubtext}>
              ({advocate.rating?.count || advocate.reviewCount || 0})
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="briefcase" size={14} color="#6B7280" />
            <Text style={styles.statText}>{advocate.experience || 5}+ yrs</Text>
          </View>

          {advocate.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        <Text style={styles.fee}>
          ₹{advocate.consultationFee || 2000}
          <Text style={styles.feeLabel}> /consultation</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('AdvocateProfile', { id: advocate._id })}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Payment', { advocateId: advocate._id })}
        >
          <LinearGradient
            colors={['#14B8A6', '#0D9488']}
            style={styles.bookGradient}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const activeFilterCount = 
    filters.specializations.length +
    (filters.city ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxFee !== null ? 1 : 0) +
    (filters.minExperience > 0 ? 1 : 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.header}>
        <Text style={styles.headerTitle}>Find Advocates</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {loading && searchQuery.trim() && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map" size={18} color={COLORS.primary} />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.resultsText}>
          {loading ? 'Searching...' : `${advocates.length} advocate${advocates.length !== 1 ? 's' : ''} found`}
        </Text>

        <FlatList
          data={advocates}
          renderItem={renderAdvocate}
          keyExtractor={(item, index) => `adv-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No advocates found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery.trim() 
                    ? 'Try different keywords or filters'
                    : 'Start typing to search'}
                </Text>
              </View>
            )
          }
        />
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        onShowOnMap={handleShowOnMap}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  advocateCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  advocateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  specialization: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  fee: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  actions: {
    gap: 8,
    marginLeft: 8,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bookButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default SearchScreen;
