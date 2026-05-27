import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firAPI } from '../../services/api';

const MyDraftsScreen = ({ navigation }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDrafts = async () => {
    try {
      const response = await firAPI.getMyDrafts();
      if (response.data.success) {
        setDrafts(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching drafts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const renderDraftItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('FIRPreview', { draft: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={24} color="#0d9488" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.draftType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.draftDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>
      <Text style={styles.previewText} numberOfLines={2}>{item.aiDraft}</Text>
    </TouchableOpacity>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#14B8A6', '#0D9488']} style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My FIR Drafts</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : drafts.length > 0 ? (
        <FlatList
          data={drafts}
          keyExtractor={item => item._id}
          renderItem={renderDraftItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDrafts(); }} />
          }
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="document-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Drafts Found</Text>
          <Text style={styles.emptySub}>Your generated FIR drafts will appear here.</Text>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => navigation.navigate('FIRTypeSelector')}
          >
            <Text style={styles.createBtnText}>Create New Draft</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { paddingTop: 5, paddingBottom: 25, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 15 },
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e6f7f5', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  draftType: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  draftDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  previewText: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  createBtn: { backgroundColor: '#0d9488', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
  createBtnText: { color: '#fff', fontWeight: '700' },
});

export default MyDraftsScreen;
