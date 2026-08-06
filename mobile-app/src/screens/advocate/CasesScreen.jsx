import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, ActivityIndicator, Modal, TextInput, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { caseAPI, bookingAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';

const CasesScreen = ({ navigation, route }) => {
  const isTodayTab = route?.name === 'TodayCases';
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, completed
  
  // Add Case modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    caseNumber: '',
    courtName: '',
    description: '',
    clientId: '',
  });

  const fetchCases = async () => {
    setLoading(true);
    try {
      if (isTodayTab) {
        const response = await bookingAPI.getAdvocateBookings({ today: 'true', status: 'confirmed' });
        if (response.data?.success) {
          setCases(response.data.data || []);
        }
      } else {
        const response = await caseAPI.getAll();
        if (response.data?.success) {
          setCases(response.data.data || []);
        }
      }
    } catch (err) {
      console.log('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await bookingAPI.getAdvocateBookings({ status: 'confirmed' });
      const seen = new Set();
      const uniqueClients = (response.data.data || [])
        .map(b => b.client)
        .filter(c => {
          if (!c || seen.has(c._id)) return false;
          seen.add(c._id);
          return true;
        });
      setClients(uniqueClients);
    } catch (err) {
      console.log('Error fetching client list:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCases();
    });
    return unsubscribe;
  }, [navigation, isTodayTab]);

  const openAddCaseModal = () => {
    setForm({
      title: '',
      caseNumber: '',
      courtName: '',
      description: '',
      clientId: '',
    });
    fetchClients();
    setModalVisible(true);
  };

  const handleCreateCase = async () => {
    if (!form.title || !form.clientId) {
      Alert.alert('Required Fields', 'Please fill in Case Title and select a Client.');
      return;
    }

    try {
      const response = await caseAPI.create(form);
      if (response.data?.success) {
        Alert.alert('Success', 'Case created successfully!');
        setModalVisible(false);
        fetchCases();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create case.');
    }
  };

  const filteredCases = isTodayTab ? cases : cases.filter(c => {
    if (activeTab === 'active') {
      return c.status === 'active' || c.status === 'pending';
    } else {
      return c.status === 'completed' || c.status === 'dismissed';
    }
  });

  const renderItem = ({ item }) => {
    const client = item.client || {};
    if (isTodayTab) {
      return (
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('CaseDetail', { booking: item })}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.type === 'video' ? "videocam-outline" : "people-outline"} 
                size={20} 
                color={COLORS.primary} 
              />
            </View>
            <View style={styles.textContent}>
              <Text style={styles.name}>{item.issue || 'Consultation Booking'}</Text>
              <Text style={styles.caseNo}>
                Slot: {item.timeSlot?.startTime || 'TBD'} • Status: {item.status?.toUpperCase()}
              </Text>
              <View style={styles.clientRow}>
                <Ionicons name="person-outline" size={12} color={COLORS.primary} />
                <Text style={styles.clientName}>Client: {client.name || 'Client'}</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('CaseDetail', { caseId: item._id })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.caseNo}>
              No: {item.caseNumber || 'N/A'} • {item.courtName || 'District Court'}
            </Text>
            <View style={styles.clientRow}>
              <Ionicons name="person-outline" size={12} color={COLORS.primary} />
              <Text style={styles.clientName}>Client: {client.name || 'Client'}</Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isTodayTab ? "Today's Cases" : "Case Portfolio"}</Text>
        {!isTodayTab && (
          <TouchableOpacity style={styles.addBtn} onPress={openAddCaseModal}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Add Case</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      {!isTodayTab && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Past Cases</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>⚖️</Text>
              <Text style={styles.emptyText}>
                {isTodayTab ? "No appointments scheduled for today" : "No cases found in this section"}
              </Text>
            </View>
          }
        />
      )}

      {/* ADD CASE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Case File</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Case Title *</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setForm(p => ({ ...p, title: v }))}
                placeholder="e.g. Property Boundary Dispute"
              />

              <Text style={styles.label}>Case ID / Number</Text>
              <TextInput
                style={styles.input}
                value={form.caseNumber}
                onChangeText={(v) => setForm(p => ({ ...p, caseNumber: v }))}
                placeholder="e.g. CIV/894/2026"
              />

              <Text style={styles.label}>Court / Jurisdiction</Text>
              <TextInput
                style={styles.input}
                value={form.courtName}
                onChangeText={(v) => setForm(p => ({ ...p, courtName: v }))}
                placeholder="e.g. Bhopal District Court"
              />

              <Text style={styles.label}>Linked Client *</Text>
              {loadingClients ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 8 }} />
              ) : clients.length === 0 ? (
                <View style={styles.noClientsWarning}>
                  <Text style={styles.noClientsWarningText}>No confirmed consulting clients found.</Text>
                </View>
              ) : (
                <View style={styles.clientsSelector}>
                  {clients.map(c => {
                    const isSelected = form.clientId === c._id;
                    return (
                      <TouchableOpacity
                        key={c._id}
                        onPress={() => setForm(p => ({ ...p, clientId: c._id }))}
                        style={[styles.clientChip, isSelected && styles.clientChipActive]}
                      >
                        <Text style={[styles.clientChipText, isSelected && styles.clientChipTextActive]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Text style={styles.label}>Case Brief / Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={form.description}
                onChangeText={(v) => setForm(p => ({ ...p, description: v }))}
                multiline
                numberOfLines={4}
                placeholder="Describe the nature, dispute, and expectations of the case..."
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateCase}>
                <Text style={styles.submitBtnText}>Open Case File</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4
  },
  addBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  tabTextActive: { color: COLORS.primary },

  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(20, 184, 166, 0.08)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  textContent: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  caseNo: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  clientName: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  arrowContainer: { width: 24, alignItems: 'flex-end' },
  
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  modalForm: { padding: 20, gap: 12 },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 12, fontSize: 13, color: COLORS.textPrimary
  },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  clientsSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 4 },
  clientChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6'
  },
  clientChipActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)', borderColor: COLORS.primary
  },
  clientChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  clientChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  noClientsWarning: { padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8 },
  noClientsWarningText: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 12
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }
});

export default CasesScreen;
