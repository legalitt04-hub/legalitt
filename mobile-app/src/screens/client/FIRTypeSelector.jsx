import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FIR_TYPES = [
  { id: 'theft', title: 'Theft / Burglary', icon: 'cart-outline', color: '#3b82f6' },
  { id: 'assault', title: 'Assault / Violence', icon: 'hand-left-outline', color: '#ef4444' },
  { id: 'fraud', title: 'Fraud / Cheating', icon: 'cash-outline', color: '#f59e0b' },
  { id: 'cyber_crime', title: 'Cyber Crime', icon: 'laptop-outline', color: '#8b5cf6' },
  { id: 'property_dispute', title: 'Property Dispute', icon: 'business-outline', color: '#10b981' },
  { id: 'domestic_violence', title: 'Domestic Violence', icon: 'home-outline', color: '#ec4899' },
  { id: 'missing_person', title: 'Missing Person', icon: 'person-add-outline', color: '#6366f1' },
  { id: 'other', title: 'Other / Custom', icon: 'document-text-outline', color: '#64748b' },
];

const FIRTypeSelector = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select FIR Type</Text>
          <TouchableOpacity 
            style={styles.historyBtn} 
            onPress={() => navigation.navigate('MyDrafts')}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.subTitle}>What happened?</Text>
        <Text style={styles.desc}>Select the category that best describes the incident to help AI draft a more accurate FIR.</Text>

        <View style={styles.grid}>
          {FIR_TYPES.map((type) => (
            <TouchableOpacity 
              key={type.id} 
              style={styles.card}
              onPress={() => navigation.navigate('FIRForm', { type: type.id, title: type.title })}
            >
              <View style={[styles.iconBox, { backgroundColor: type.color + '20' }]}>
                <Ionicons name={type.icon} size={32} color={type.color} />
              </View>
              <Text style={styles.cardTitle}>{type.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1, marginLeft: 15 },
  historyBtn: { padding: 5 },
  list: { padding: 20 },
  subTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  desc: { fontSize: 14, color: '#64748b', marginBottom: 25, lineHeight: 20 },
  grid: { flexDirection: 'column' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#334155', flex: 1 },
  chevron: { marginLeft: 10 },
});

export default FIRTypeSelector;
