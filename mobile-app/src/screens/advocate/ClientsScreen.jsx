import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatIndianPhone } from '../../utils/helpers';

// Design Theme Colors matching the Advocate Panel
const THEME = {
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  primary: '#8C6E52',          // Warm beige/tan primary
  primaryLight: '#B09C85',
  cardBorder: '#F0ECE7',
  textDark: '#2D2824',         // Dark charcoal
  textMuted: '#7D756E',        // Muted secondary label
  textSubtle: '#9CA3AF',
  badgeBg: '#F5EFEB',
  verifiedGreen: '#10B981',    // Verified badge
  activeDot: '#10B981',        // Green active status
  pendingDot: '#F59E0B',       // Amber pending status
  closedDot: '#6B7280',        // Gray closed status
  inactiveDot: '#D1D5DB',      // Inactive hollow dot
  inputBorder: '#E5E7EB',      // Search input border
};

// Dummy Client for UI testing purposes
const DUMMY_CLIENT = {
  _id: 'dummy-client-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  isVerified: true,
  status: 'active',
};

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'Closed'];

export default function ClientsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState([DUMMY_CLIENT]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchClients = async () => {
    try {
      // Fetch bookings for this advocate to gather all associated clients
      const { data } = await bookingAPI.getAdvocateBookings({});
      const bookingsList = data.data || [];

      if (bookingsList.length === 0) {
        setClients([DUMMY_CLIENT]);
        return;
      }

      // Map unique clients with their status and details
      const clientMap = new Map();

      bookingsList.forEach((booking) => {
        const client = booking.client;
        if (!client || !client._id) return;

        const clientId = client._id.toString();
        const existing = clientMap.get(clientId);

        // Derive client status: 'active', 'pending', or 'closed'
        let clientStatus = 'closed';
        if (booking.status === 'confirmed' || booking.status === 'in_progress') {
          clientStatus = 'active';
        } else if (booking.status === 'pending' || booking.status === 'pending_assignment') {
          clientStatus = 'pending';
        } else {
          clientStatus = 'closed';
        }

        if (!existing) {
          clientMap.set(clientId, {
            _id: clientId,
            name: client.name || 'Client',
            email: client.email || 'client@email.com',
            phone: client.phone || '',
            avatar: client.avatar || null,
            isVerified: !!(client.isVerified || client.isEmailVerified || client.isPhoneVerified),
            status: clientStatus,
            latestBooking: booking,
          });
        } else {
          // If existing client already has an active booking, preserve 'active'
          if (clientStatus === 'active') {
            existing.status = 'active';
          } else if (clientStatus === 'pending' && existing.status !== 'active') {
            existing.status = 'pending';
          }
          if (client.avatar && !existing.avatar) existing.avatar = client.avatar;
          if (client.email && (!existing.email || existing.email === 'client@email.com')) existing.email = client.email;
          if (client.phone && !existing.phone) existing.phone = client.phone;
          if (client.isVerified || client.isEmailVerified) existing.isVerified = true;
        }
      });

      const fetchedList = Array.from(clientMap.values());
      // Ensure dummy client is included if not already present
      const hasRahul = fetchedList.some(
        (c) => c.name?.toLowerCase() === 'rahul sharma' || c.email === 'rahul.sharma@example.com'
      );
      setClients(hasRahul ? fetchedList : [DUMMY_CLIENT, ...fetchedList]);
    } catch (err) {
      console.log('Error loading clients list:', err);
      setClients([DUMMY_CLIENT]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  // Dynamic simultaneous search + status filtering
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return clients.filter((client) => {
      // 1. Status filter (All | Active | Pending | Closed)
      if (activeFilter !== 'All') {
        if (client.status?.toLowerCase() !== activeFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Search match (Name, Email, Phone)
      if (query.length > 0) {
        const nameMatch = (client.name || '').toLowerCase().includes(query);
        const emailMatch = (client.email || '').toLowerCase().includes(query);
        const phoneClean = (client.phone || '').replace(/\D/g, '');
        const queryClean = query.replace(/\D/g, '');
        const phoneMatch =
          (client.phone || '').toLowerCase().includes(query) ||
          (queryClean.length > 0 && phoneClean.includes(queryClean));

        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [clients, searchQuery, activeFilter]);

  const renderClientCard = ({ item }) => {
    const isClientActive = item.status === 'active';
    const isClientPending = item.status === 'pending';
    const isClientClosed = item.status === 'closed';

    return (
      <View style={styles.kpiCard}>
        {/* Top: Avatar + Client Info */}
        <View style={styles.cardHeader}>
          {/* Client Photo / Avatar */}
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {(item.name || 'C')[0].toUpperCase()}
              </Text>
            </View>
          )}

          {/* Client Name + Email + Phone */}
          <View style={styles.infoCol}>
            {/* Name + Verified Badge */}
            <View style={styles.nameRow}>
              <Text style={styles.clientName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Email</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {item.email}
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Phone</Text>
              <Text style={styles.metaValue}>
                {item.phone ? formatIndianPhone(item.phone) : '+91 98765 43210'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Indicators: Active | Pending | Closed */}
        <View style={styles.statusRow}>
          {/* Active Status */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                isClientActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isClientActive ? styles.statusTextActive : styles.statusTextMuted,
              ]}
            >
              Active
            </Text>
          </View>

          {/* Pending Status */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                isClientPending ? styles.dotPending : styles.dotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isClientPending ? styles.statusTextPending : styles.statusTextMuted,
              ]}
            >
              Pending
            </Text>
          </View>

          {/* Closed Status */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                isClientClosed ? styles.dotClosed : styles.dotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isClientClosed ? styles.statusTextClosed : styles.statusTextMuted,
              ]}
            >
              Closed
            </Text>
          </View>
        </View>

        {/* Document View Button */}
        <TouchableOpacity
          style={styles.documentViewBtn}
          activeOpacity={0.8}
          onPress={() => {
            const clientDocs = item.latestBooking?.documents || item.documents || [];
            const firstDoc = clientDocs[0];
            const docUrl = typeof firstDoc === 'string' ? firstDoc : firstDoc?.url || null;
            const docName = typeof firstDoc === 'object' && firstDoc?.name
              ? firstDoc.name
              : (docUrl ? docUrl.split('/').pop() : `${(item.name || 'Client').replace(/\s+/g, '_')}_Document.pdf`);
            const hasDoc = clientDocs.length > 0 || !!docUrl;

            navigation.navigate('DocumentViewer', {
              clientId: item._id,
              clientName: item.name || 'Client',
              clientEmail: item.email,
              clientPhone: item.phone,
              clientAvatar: item.avatar,
              caseTitle: item.latestBooking?.issue || 'Legal Matter',
              fileName: docName,
              documentUrl: docUrl,
              documents: clientDocs,
              hasDocument: hasDoc,
            });
          }}
        >
          <Text style={styles.documentViewBtnText}>Document View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── PAGE HEADER: CLIENTS ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatList')}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── TOP CONTROLS: SEARCH BAR & STATUS FILTERS ───────────────────── */}
      <View style={styles.controlsContainer}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBarWrapper,
            isSearchFocused && styles.searchBarWrapperFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={isSearchFocused ? THEME.primary : THEME.primaryLight}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              Platform.OS === 'web' && { outlineStyle: 'none', outline: 'none', boxShadow: 'none' },
            ]}
            placeholder="Search clients..."
            placeholderTextColor={THEME.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Tabs (All | Active | Pending | Closed) */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollWrap}
          >
            <View style={styles.tabRow}>
              {STATUS_FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.8}
                    style={[
                      styles.tab,
                      isActive && styles.tabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        isActive && styles.tabTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Dynamic Result Count */}
        <View style={styles.resultCountRow}>
          <Text style={styles.resultCountText}>
            {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
          </Text>
        </View>
      </View>

      {/* ─── CLIENTS LIST ────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item._id}
          renderItem={renderClientCard}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 12) + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'people-outline'}
                  size={32}
                  color={THEME.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No clients found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try searching with a different name, email, or phone number.'
                  : activeFilter !== 'All'
                  ? `There are currently no ${activeFilter.toLowerCase()} clients.`
                  : 'Clients assigned to you will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── SEARCH & FILTER CONTROLS ──────────────────────────────────────
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarWrapperFocused: {
    borderColor: THEME.primary,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 2px rgba(140, 110, 82, 0.15)',
      },
      default: {},
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.textDark,
    paddingVertical: 8,
    fontWeight: '500',
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        outline: 'none',
        outlineStyle: 'none',
        outlineWidth: 0,
        outlineColor: 'transparent',
        boxShadow: 'none',
      },
      default: {},
    }),
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabContainer: {
    marginTop: 2,
  },
  tabScrollWrap: {
    flexDirection: 'row',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 99,
    gap: 4,
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 99,
  },
  tabActive: {
    backgroundColor: THEME.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCountRow: {
    paddingTop: 2,
  },
  resultCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textMuted,
  },

  listContainer: {
    padding: 16,
    gap: 14,
  },

  // ─── CLIENT KPI CARD ───────────────────────────────────────────────
  kpiCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: '#2D2824',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.primary,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.verifiedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    gap: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.textDark,
  },

  // ─── STATUS INDICATORS ─────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F1EB',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: THEME.activeDot,
  },
  dotPending: {
    backgroundColor: THEME.pendingDot,
  },
  dotClosed: {
    backgroundColor: THEME.closedDot,
  },
  dotInactive: {
    backgroundColor: THEME.inactiveDot,
  },
  statusText: {
    fontSize: 12,
  },
  statusTextActive: {
    color: THEME.activeDot,
    fontWeight: '700',
  },
  statusTextPending: {
    color: THEME.pendingDot,
    fontWeight: '700',
  },
  statusTextClosed: {
    color: THEME.closedDot,
    fontWeight: '700',
  },
  statusTextMuted: {
    color: THEME.textSubtle,
    fontWeight: '500',
  },

  // ─── DOCUMENT VIEW BUTTON ──────────────────────────────────────────
  documentViewBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentViewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── EMPTY STATE ───────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginTop: 40,
    gap: 6,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
