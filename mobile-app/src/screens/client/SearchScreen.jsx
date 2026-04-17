import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advocateAPI } from '../../services/api';
import AdvocateCard from '../../components/advocate/AdvocateCard';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SearchScreen = ({ navigation, route }) => {
  const [query, setQuery] = useState('');
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(route.params?.filters || {});

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      // Pass name search as city fallback or server-side text search
      const { data } = await advocateAPI.getAll(params);
      let results = data.data || [];
      if (query.trim()) {
        results = results.filter((a) =>
          (a.user?.name || '').toLowerCase().includes(query.toLowerCase())
        );
      }
      setAdvocates(results);
    } catch { setAdvocates([]); }
    finally { setLoading(false); }
  }, [query, filters]);

  useEffect(() => { search(); }, [filters]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
        <Text style={styles.greeting}>Hello, {route.params?.userName || 'XYZ'}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={styles.iconBtn}>
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

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            placeholder="Search Lawyers"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Filter', { filters, onApply: (f) => setFilters(f) })}
          style={styles.filterBtn}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Map preview strip */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Map')}
        style={styles.mapStrip}
        activeOpacity={0.9}
      >
        <View style={styles.mapStripInner}>
          <Ionicons name="map" size={20} color={COLORS.primary} />
          <Text style={styles.mapStripText}>View Map</Text>
        </View>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={advocates}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AdvocateCard
              advocate={item}
              onViewProfile={() => navigation.navigate('AdvocateProfile', { advocateId: item._id })}
              onBookNow={() => navigation.navigate('AdvocateProfile', { advocateId: item._id, openBooking: true })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.emptyText}>No advocates found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff',
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  greeting: { flex: 1, fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  iconBtn: { padding: 6 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingVertical: 12, backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary },
  filterBtn: {
    marginLeft: 10, width: 44, height: 44, borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  mapStrip: {
    height: 120, backgroundColor: '#e8e8e0',
    marginHorizontal: SIZES.screenPadding, marginTop: 8, borderRadius: SIZES.radiusMd,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
  },
  mapStripInner: {
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: SIZES.radiusFull, ...SHADOWS.sm,
  },
  mapStripText: { marginLeft: 6, fontWeight: '700', color: COLORS.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 12 },
});

export default SearchScreen;
