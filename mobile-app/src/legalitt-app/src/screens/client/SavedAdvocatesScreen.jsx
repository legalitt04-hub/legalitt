import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Image, StatusBar, RefreshControl 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import profileAPI from '../../services/profileAPI';
import { COLORS } from '../../constants/theme';

const SavedAdvocatesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedAdvocates = async () => {
    try {
      const response = await profileAPI.getSavedAdvocates();
      if (response.data.success) {
        setAdvocates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved advocates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSavedAdvocates(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSavedAdvocates();
  }, []);

  const handleRemove = async (advocateId) => {
    try {
      await profileAPI.toggleSavedAdvocate(advocateId);
      setAdvocates(prev => prev.filter(adv => adv._id !== advocateId));
    } catch (error) {
      console.error('Error removing advocate:', error);
    }
  };

  const renderAdvocate = ({ item }) => {
    const advUser = item.user || {};
    const avatar = advUser.avatar || `https://i.pravatar.cc/150?u=${advUser._id || item._id}`;
    const name = advUser.name || 'Advocate';
    const specialization = item.specializations?.slice(0, 2).join(' · ') || 'General Law';

    const prefetchedData = {
      id: item._id,
      name: advUser.name || 'Advocate',
      avatar,
      title: 'Advocate',
      tags: item.specializations?.slice(0, 3) || [],
      rating: item.rating?.average || 0,
      reviews: item.rating?.count || 0,
      fee: item.consultationFee || 0,
      callRate: Math.round((item.consultationFee || 0) * 0.3),
      experience: item.experience || 0,
      city: item.location?.address?.city || 'Unknown',
      online: advUser.isActive || false,
      verified: item.isVerified || false,
      available: true,
    };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AdvocateProfile', { id: item._id, prefetchedData, isSavedInitial: true })}
      >
        {/* Left accent bar */}
        <View style={styles.cardAccent} />

        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.expBadge}>
              <Ionicons name="briefcase-outline" size={11} color={COLORS.primary} />
              <Text style={styles.expText}>{item.experience || 0} yrs exp</Text>
            </View>
          </View>
          <Text style={styles.specialization} numberOfLines={1}>{specialization}</Text>
          {item.rating?.average > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating.average.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({item.rating.count || 0} reviews)</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item._id)}
          >
            <Ionicons name="bookmark" size={20} color="#0D9488" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('AdvocateProfile', { id: item._id, prefetchedData, isSavedInitial: true })}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Teal Gradient Header */}
      <LinearGradient
        colors={['#14B8A6', '#0D9488']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Saved Advocates</Text>
          {advocates.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{advocates.length}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading saved advocates...</Text>
        </View>
      ) : advocates.length === 0 ? (
        <View style={styles.center}>
          <LinearGradient colors={['#F0FDFA', '#CCFBF1']} style={styles.emptyIconBg}>
            <Ionicons name="heart-dislike-outline" size={48} color={COLORS.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Saved Advocates</Text>
          <Text style={styles.emptySubText}>
            Tap the 🔖 on any advocate's profile to save them here.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.exploreBtnText}>Explore Advocates</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={advocates}
          keyExtractor={(item) => item._id}
          renderItem={renderAdvocate}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubText: {
    fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 30,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // List
  list: { padding: 16 },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 58, height: 58, borderRadius: 12,
    margin: 14,
  },
  info: { flex: 1, paddingVertical: 14, paddingRight: 8 },
  name: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  expBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDFA', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  expText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  specialization: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  ratingCount: { fontSize: 11, color: '#94A3B8' },

  // Actions
  actions: {
    alignItems: 'center', gap: 8,
    paddingRight: 14, paddingVertical: 14,
  },
  removeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
  },
  viewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});

export default SavedAdvocatesScreen;
