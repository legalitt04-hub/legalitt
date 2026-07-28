import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

export default function PendingApprovalScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top','bottom','left','right']}>
      <View style={styles.content}>
        
        <View style={styles.iconWrapper}>
          <View style={styles.iconPulse1} />
          <View style={styles.iconPulse2} />
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={48} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>Application Under Review</Text>
        
        <Text style={styles.subtitle}>
          Thank you for applying to Legalitt! Our verification team is currently reviewing your Bar Council credentials.
        </Text>

        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.statusText}>Profile details submitted</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.statusText}>Documents uploaded</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="ellipsis-horizontal-circle" size={20} color="#F59E0B" />
            <Text style={[styles.statusText, { color: '#D97706', fontWeight: '600' }]}>Verification in progress (24-48 hrs)</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('AdvocateLogin')}>
          <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={styles.button}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </LinearGradient>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  iconWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40, marginTop: -40 },
  iconPulse1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(20, 184, 166, 0.05)' },
  iconPulse2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(20, 184, 166, 0.1)' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },

  title: { fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, paddingHorizontal: 10, marginBottom: 40 },
  
  statusBox: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 40 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },

  buttonContainer: { width: '100%' },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#374151', fontSize: 16, fontWeight: '700' }
});
