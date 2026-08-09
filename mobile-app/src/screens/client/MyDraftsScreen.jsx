import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firAPI, legalAdviceAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';

const MyDraftsScreen = ({ navigation }) => {
  const [drafts, setDrafts] = useState([]);
  const [legalNotices, setLegalNotices] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'fir', 'notices'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVault = async () => {
    try {
      const [firRes, noticeRes] = await Promise.allSettled([
        firAPI.getMyDrafts(),
        legalAdviceAPI.getMyRequests(),
      ]);

      if (firRes.status === 'fulfilled' && firRes.value.data?.success) {
        setDrafts(firRes.value.data.data || []);
      }
      if (noticeRes.status === 'fulfilled' && noticeRes.value.data?.success) {
        setLegalNotices(noticeRes.value.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching vault items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const getCombinedItems = () => {
    const formattedFir = drafts.map(d => ({
      id: d._id,
      type: 'fir',
      title: `${(d.type || 'FIR').replace('_', ' ').toUpperCase()} Draft`,
      date: d.createdAt,
      subtitle: d.aiDraft ? d.aiDraft.slice(0, 100) + '...' : 'AI Generated Draft',
      status: 'Ready',
      raw: d,
    }));

    const formattedNotices = legalNotices.map(n => ({
      id: n._id,
      type: 'notice',
      title: `${n.legalCategory || n.serviceType || 'Legal Notice'} Notice`,
      date: n.createdAt,
      subtitle: n.issueDescription || n.recipientName ? `Recipient: ${n.recipientName}` : 'Submitted for Legal Notice',
      status: n.status || 'Pending Assignment',
      raw: n,
    }));

    const all = [...formattedFir, ...formattedNotices].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activeTab === 'fir') return all.filter(i => i.type === 'fir');
    if (activeTab === 'notices') return all.filter(i => i.type === 'notice');
    return all;
  };

  const renderVaultItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        if (item.type === 'fir') {
          navigation.navigate('FIRPreview', { draft: item.raw });
        } else {
          navigation.navigate('TrackConsultation', { bookingData: item.raw, requestId: item.id });
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.type === 'fir' ? 'rgba(176, 156, 133, 0.15)' : '#EFF6FF' }]}>
          <Ionicons 
            name={item.type === 'fir' ? 'document-text' : 'shield-checkmark'} 
            size={22} 
            color={item.type === 'fir' ? COLORS.primary : '#2563EB'} 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.draftType}>{item.title}</Text>
          <Text style={styles.draftDate}>{new Date(item.date).toLocaleDateString()} • <Text style={{ color: item.status === 'Ready' || item.status === 'completed' ? '#10B981' : '#D97706', fontWeight: '600' }}>{item.status}</Text></Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>
      <Text style={styles.previewText} numberOfLines={2}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  const insets = useSafeAreaInsets();
  const itemsToDisplay = getCombinedItems();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark || '#8D7865']} style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Vault & Drafts</Text>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.tabBarRow}>
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'fir', label: 'FIR Drafts' },
          { key: 'notices', label: 'Legal Notices' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.activeTabBtn]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.activeTabText]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : itemsToDisplay.length > 0 ? (
        <FlatList
          data={itemsToDisplay}
          keyExtractor={item => item.id}
          renderItem={renderVaultItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVault(); }} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="folder-open-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Documents Found</Text>
          <Text style={styles.emptySub}>Your FIR drafts and Legal Notices will be stored here safely.</Text>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => navigation.navigate('AILegalNotice')}
          >
            <Text style={styles.createBtnText}>Create Legal Notice</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 5, paddingBottom: 25, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 15 },
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(176, 156, 133, 0.15)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  draftType: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  draftDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  previewText: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  createBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  tabBarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default MyDraftsScreen;
