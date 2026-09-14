import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { caseAPI } from '../../services/api';

const THEME = {
  background: '#FAF9F8', cardBg: '#FFFFFF', primary: '#8C6E52', primaryLight: '#B09C85',
  cardBorder: '#F0ECE7', badgeBg: '#F5EFEB', textDark: '#2D2824', textMuted: '#7D756E',
  textSubtle: '#9E958C', divider: '#F0ECE7'
};

export default function LegalNoticeResponseScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  
  const clientName = route?.params?.clientName || 'Client';
  const caseTitle = route?.params?.caseTitle || 'Legal Notice';
  const caseId = route?.params?.caseId;
  const documentUrl = route?.params?.documentUrl;
  const documentName = route?.params?.documentName || 'Original_Notice.pdf';
  const advocateDocs = route?.params?.advocateDocs || [];

  const [uploading, setUploading] = useState(false);
  const [responseDoc, setResponseDoc] = useState(advocateDocs.length > 0 ? advocateDocs[advocateDocs.length - 1] : null);

  const handleOpenDocumentViewer = () => {
    navigation.navigate('DocumentViewer', {
      clientName, caseTitle, documentUrl, fileName: documentName, hasDocument: !!documentUrl,
    });
  };

  const handleOpenResponseViewer = () => {
    if (responseDoc?.url) {
      navigation.navigate('DocumentViewer', {
        clientName, caseTitle, documentUrl: responseDoc.url, fileName: responseDoc.name, hasDocument: true,
      });
    }
  };

  const handleUploadResponse = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'We need access to upload documents.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('file', { uri, name: filename, type });

        const { uploadAPI } = require('../../services/api');
        const uploadRes = await uploadAPI.uploadFile(uri, filename, type);

        if (uploadRes.data.success) {
          const docUrl = uploadRes.data.data.url;
          const attachRes = await caseAPI.addDoc(caseId, { name: filename, url: docUrl });
          if (attachRes.data.success) {
            setResponseDoc({ name: filename, url: docUrl });
            
            try {
              const { chatAPI } = require('../../services/api');
              const chatsRes = await chatAPI.getMyChats();
              const chats = chatsRes.data?.data || [];
              const clientIdStr = route?.params?.clientId?.toString();
              const activeChat = chats.find(c => {
                if (!clientIdStr) return false;
                return c.participants?.some(p => {
                  const pId = p?._id || p;
                  return pId?.toString() === clientIdStr;
                });
              });
              
              if (activeChat) {
                await chatAPI.sendMessage(activeChat._id, {
                  content: `Legal Notice Response Submitted: ${filename}`,
                  messageType: 'file',
                  fileUrl: docUrl,
                  fileName: filename
                });
                Alert.alert('Success', 'Response document uploaded and sent to client via chat!');
              } else {
                Alert.alert('Success', 'Response document uploaded. (No active chat found)');
              }
            } catch (err) {
              console.log('Error auto-sending to chat:', err);
              Alert.alert('Success', 'Response document uploaded, but could not auto-send to chat.');
            }
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to upload document.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F8" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Notice Response</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Case Details</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{clientName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Case</Text>
            <Text style={styles.metaValue}>{caseTitle}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Original Legal Notice</Text>
          <View style={styles.documentItemRow}>
            <View style={styles.docIconCircle}>
              <Ionicons name="document-text-outline" size={22} color={THEME.primary} />
            </View>
            <View style={styles.docInfoCol}>
              <Text style={styles.docFileName}>{documentName}</Text>
              <Text style={styles.docMetaText}>{documentUrl ? 'Uploaded by Client' : 'No document uploaded'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewDocBtn} onPress={handleOpenDocumentViewer} disabled={!documentUrl}>
            <Ionicons name="eye-outline" size={16} color={THEME.primary} />
            <Text style={styles.viewDocBtnText}>{documentUrl ? 'View Document' : 'Document Missing'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Your Response</Text>
          {responseDoc ? (
            <>
              <View style={styles.documentItemRow}>
                <View style={[styles.docIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-done-outline" size={22} color="#15803D" />
                </View>
                <View style={styles.docInfoCol}>
                  <Text style={styles.docFileName}>{responseDoc.name}</Text>
                  <Text style={styles.docMetaText}>Response Submitted</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewDocBtn} onPress={handleOpenResponseViewer}>
                <Ionicons name="eye-outline" size={16} color={THEME.primary} />
                <Text style={styles.viewDocBtnText}>View Response</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.primaryActionBtn} onPress={handleUploadResponse} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryActionBtnText}>Upload Response Document</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: THEME.background, borderBottomWidth: 1, borderColor: THEME.divider },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.cardBorder },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  scrollContent: { padding: 16, gap: 14 },
  card: { backgroundColor: THEME.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.cardBorder },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: THEME.textDark, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { fontSize: 12, color: THEME.textMuted },
  metaValue: { fontSize: 12, fontWeight: '600', color: THEME.textDark },
  documentItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  docIconCircle: { width: 42, height: 42, borderRadius: 12, backgroundColor: THEME.badgeBg, alignItems: 'center', justifyContent: 'center' },
  docInfoCol: { flex: 1 },
  docFileName: { fontSize: 14, fontWeight: '700', color: THEME.textDark },
  docMetaText: { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  viewDocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: THEME.badgeBg, paddingVertical: 10, borderRadius: 10 },
  viewDocBtnText: { fontSize: 12, fontWeight: '700', color: THEME.primary },
  primaryActionBtn: { backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryActionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }
});
