import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { exportFIRToPDF } from '../../utils/pdfExport';

const FIRPreviewScreen = ({ route, navigation }) => {
  const { draft } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: draft.aiDraft,
        title: `${draft.type.toUpperCase()} FIR Draft`
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the draft.');
    }
  };

  const handleSaveToDevice = async () => {
    try {
      await exportFIRToPDF(draft); // This will open the share sheet where they can "Save to Files"
      Alert.alert('Saved', 'Your FIR Draft has been processed. You can find it in your files.');
    } catch (error) {
      Alert.alert('Error', 'Could not save the PDF.');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#14B8A6', '#0D9488']} style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.navigate('ClientMain')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FIR Draft Preview</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>SAVED IN LEGALITT CLOUD</Text>
          </View>
          
          <Text style={styles.draftContent}>{draft.aiDraft}</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0d9488" />
          <Text style={styles.infoText}>
            This is a computer-generated draft. Please review all details carefully before submitting to the police station.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#0d9488" />
          <Text style={styles.shareBtnText}>Share Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.downloadBtn} 
          onPress={handleSaveToDevice}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>Save to Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 15 },
  scroll: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#e6f7f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 15 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#0d9488' },
  draftContent: { fontSize: 14, color: '#334155', lineHeight: 22, fontFamily: 'monospace' },
  infoBox: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  infoText: { flex: 1, fontSize: 12, color: '#64748b', marginLeft: 10, lineHeight: 18 },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0' },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#0d9488', marginRight: 10 },
  shareBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#0d9488' },
  downloadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d9488', padding: 16, borderRadius: 12 },
  downloadBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default FIRPreviewScreen;
