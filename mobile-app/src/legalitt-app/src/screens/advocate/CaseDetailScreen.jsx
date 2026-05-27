import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  StatusBar, Alert, ActivityIndicator, Modal, TextInput, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api, { caseAPI, bookingAPI, chatAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { formatDate, formatINR } from '../../utils/helpers';

const Section = ({ title, actionIcon, onActionPress, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionIcon && (
        <TouchableOpacity onPress={onActionPress}>
          <Ionicons name={actionIcon} size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const CaseDetailScreen = ({ route, navigation }) => {
  const { caseId, booking } = route.params || {};
  const [legalCase, setLegalCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal forms states
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  
  const [timelineForm, setTimelineForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    status: 'scheduled'
  });

  const [noteForm, setNoteForm] = useState({ note: '' });
  const [loadingChat, setLoadingChat] = useState(false);

  const handleMessagePress = async () => {
    const clientUser = legalCase?.client || {};
    if (!clientUser._id) {
      Alert.alert('Error', 'Client profile not found.');
      return;
    }
    if (loadingChat) return;
    setLoadingChat(true);
    try {
      const response = await chatAPI.getMyChats();
      if (response.data?.success) {
        const chats = response.data.data || [];
        const targetUserId = clientUser._id;
        
        // Find if there is an active chat with this client
        const activeChat = chats.find(c =>
          c.participants.some(p => {
            const pIdStr = p._id?.toString() || p.toString();
            return pIdStr && targetUserId && pIdStr === targetUserId.toString();
          })
        );

        if (activeChat) {
          navigation.navigate('Chat', {
            chatId: activeChat._id,
            advocateName: clientUser.name,
            advocateAvatar: clientUser.avatar,
          });
        } else {
          Alert.alert(
            'No Active Chat',
            'No secure chat room could be found for this client. Please ensure the booking is fully confirmed.'
          );
        }
      }
    } catch (err) {
      console.log('Error initiating chat:', err);
      Alert.alert('Error', 'Failed to open chat room.');
    } finally {
      setLoadingChat(false);
    }
  };

  const fetchCaseDetails = async () => {
    try {
      const response = await caseAPI.getOne(caseId);
      if (response.data?.success) {
        setLegalCase(response.data.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load case details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    } else if (booking) {
      setLegalCase({
        isBooking: true,
        title: booking.issue?.split('\n')[0] || 'Consultation Request',
        description: booking.issue,
        caseNumber: 'TBD (Confirm Consultation)',
        courtName: 'Pending Confirmation',
        client: booking.client || {},
        status: booking.status,
        date: booking.date,
        timeSlot: booking.timeSlot,
        payment: booking.payment,
        type: booking.type,
        timeline: [],
        documents: [],
        notes: [],
        _id: booking._id
      });
      setLoading(false);
    }
  }, [caseId, booking]);

  const handleAccept = async () => {
    try {
      await bookingAPI.updateStatus(legalCase._id, 'confirmed');
      Alert.alert('Success', 'Booking confirmed successfully!');
      navigation.goBack();
    } catch (err) { 
      Alert.alert('Error', err.response?.data?.message || 'Could not confirm booking.'); 
    }
  };

  const handleReject = () => {
    Alert.alert('Reject Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await bookingAPI.updateStatus(legalCase._id, 'cancelled');
          navigation.goBack();
        } catch { Alert.alert('Error', 'Could not reject booking.'); }
      }},
    ]);
  };

  const handleUpdateStatus = async (status) => {
    if (legalCase?.isBooking) return;
    try {
      const response = await caseAPI.update(caseId, { status });
      if (response.data?.success) {
        setLegalCase(response.data.data);
        Alert.alert('Status Updated', 'Case status set to ' + status.toUpperCase());
      }
    } catch {
      Alert.alert('Error', 'Could not update status.');
    }
  };

  const handleAddTimeline = async () => {
    if (!timelineForm.title || !timelineForm.date) {
      Alert.alert('Required Fields', 'Please fill in Event Title and Date.');
      return;
    }
    try {
      const response = await caseAPI.addTimeline(caseId, timelineForm);
      if (response.data?.success) {
        setLegalCase(response.data.data);
        setTimelineModalVisible(false);
        Alert.alert('Success', 'Court date added to timeline!');
      }
    } catch {
      Alert.alert('Error', 'Could not add timeline event.');
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.note) {
      Alert.alert('Required Fields', 'Note content cannot be empty.');
      return;
    }
    try {
      const response = await caseAPI.addNote(caseId, noteForm);
      if (response.data?.success) {
        setLegalCase(response.data.data);
        setNoteModalVisible(false);
        setNoteForm({ note: '' });
        Alert.alert('Success', 'Case update note added!');
      }
    } catch {
      Alert.alert('Error', 'Could not save case note.');
    }
  };

  const handleAddDocument = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo library access to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
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

        // Upload
        const response = await api.post('/uploads/document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const docUrl = response.data.data.url;
          // Associate
          const docRes = await caseAPI.addDoc(caseId, {
            name: filename,
            url: docUrl
          });

          if (docRes.data.success) {
            setLegalCase(docRes.data.data);
            Alert.alert('Success', 'Document uploaded and attached successfully!');
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to upload document.');
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const client = legalCase.client || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{legalCase.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {legalCase.isBooking ? 'CONSULTATION' : legalCase.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Case Info */}
        <View style={styles.cardHeader}>
          <Text style={styles.caseNumberText}>Case No: {legalCase.caseNumber || 'CIVIL/TBD/2026'}</Text>
          <Text style={styles.courtNameText}>Court: {legalCase.courtName || 'District Court Bhopal'}</Text>
          <Text style={styles.descText}>{legalCase.description || 'No description provided.'}</Text>
          
          {!legalCase.isBooking && (
            <View style={styles.statusActionRow}>
              <Text style={styles.updateStatusLabel}>Update Status:</Text>
              <View style={styles.statusBtnGroup}>
                {['active', 'completed', 'dismissed'].map(st => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => handleUpdateStatus(st)}
                    style={[styles.statusBtn, legalCase.status === st && styles.statusBtnActive]}
                  >
                    <Text style={[styles.statusBtnText, legalCase.status === st && styles.statusBtnTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Client Linked */}
        <Section title="Linked Client">
          <View style={styles.clientCardContent}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>{(client.name || 'C')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{client.name || 'Client'}</Text>
              <Text style={styles.clientMeta}>{client.email}</Text>
              <Text style={styles.clientMeta}>{client.phone || 'No phone number shared'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {client.phone && (
                <TouchableOpacity 
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${client.phone}`)}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.callBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleMessagePress}
                disabled={loadingChat}
              >
                {loadingChat ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        {/* Consultation Details (If it is a booking) */}
        {legalCase.isBooking && (
          <>
            <Section title="Consultation Fee">
              <Text style={styles.fee}>{formatINR(legalCase.payment?.amount)}</Text>
              <Text style={styles.feeType}>{legalCase.type === 'video' ? 'Video Consultation' : 'In-person Consultation'}</Text>
            </Section>

            <Section title="Scheduled Time">
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                <Text style={styles.meta}>{formatDate(legalCase.date)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                <Text style={styles.meta}>{legalCase.timeSlot?.startTime || 'TBD'}</Text>
              </View>
            </Section>
          </>
        )}

        {/* Ongoing Case Modules */}
        {!legalCase.isBooking && (
          <>
            {/* Timeline / Court Dates */}
            <Section 
              title="Timeline & Court Dates" 
              actionIcon="calendar-outline" 
              onActionPress={() => setTimelineModalVisible(true)}
            >
              {legalCase.timeline.length === 0 ? (
                <Text style={styles.emptyText}>No court hearings or timeline events scheduled.</Text>
              ) : (
                <View style={styles.timelineList}>
                  {legalCase.timeline.map((ev, idx) => (
                    <View key={ev._id || idx} style={styles.timelineRow}>
                      <View style={styles.timelinePoint}>
                        <View style={styles.timelineBullet} />
                        {idx !== legalCase.timeline.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineBody}>
                        <Text style={styles.timelineTitle}>{ev.title}</Text>
                        <Text style={styles.timelineDate}>{formatDate(ev.date)} • {ev.status}</Text>
                        {ev.description && <Text style={styles.timelineDesc}>{ev.description}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            {/* Document sharing */}
            <Section 
              title="Case Evidence & Documents" 
              actionIcon={uploading ? null : "cloud-upload-outline"} 
              onActionPress={handleAddDocument}
            >
              {uploading && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 10 }} />}
              {legalCase.documents.length === 0 ? (
                <Text style={styles.emptyText}>No documents uploaded for this case yet.</Text>
              ) : (
                <View style={styles.docsList}>
                  {legalCase.documents.map((doc, idx) => (
                    <View key={doc._id || idx} style={styles.docRow}>
                      <Ionicons name="document-text" size={20} color={COLORS.primary} />
                      <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(doc.url)}>
                        <Text style={styles.docViewBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            {/* Case notes and Updates */}
            <Section 
              title="Case Notes & Private Board" 
              actionIcon="create-outline" 
              onActionPress={() => setNoteModalVisible(true)}
            >
              {legalCase.notes.length === 0 ? (
                <Text style={styles.emptyText}>No case notes left yet. Leave case updates to track strategy.</Text>
              ) : (
                <View style={styles.notesList}>
                  {legalCase.notes.map((n, idx) => (
                    <View key={n._id || idx} style={styles.noteRow}>
                      <Text style={styles.noteBody}>{n.note}</Text>
                      <Text style={styles.noteTime}>{formatDate(n.createdAt)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Section>
          </>
        )}
      </ScrollView>

      {/* Booking confirmation controls */}
      {legalCase?.isBooking && legalCase.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept Consultation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.rejectButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TIMELINE EVENT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timelineModalVisible}
        onRequestClose={() => setTimelineModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Court Date / Event</Text>
              <TouchableOpacity onPress={() => setTimelineModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Event / Hearing Title *</Text>
              <TextInput
                style={styles.input}
                value={timelineForm.title}
                onChangeText={(v) => setTimelineForm(p => ({ ...p, title: v }))}
                placeholder="e.g. Submission of Land Deed Evidence"
              />

              <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                value={timelineForm.date}
                onChangeText={(v) => setTimelineForm(p => ({ ...p, date: v }))}
                placeholder="e.g. 2026-06-15"
              />

              <Text style={styles.label}>Action / Agenda Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={timelineForm.description}
                onChangeText={(v) => setTimelineForm(p => ({ ...p, description: v }))}
                multiline
                numberOfLines={3}
                placeholder="Details of expectations or client preparation requirements..."
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddTimeline}>
                <Text style={styles.submitBtnText}>Add Hearing Date</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CASE NOTES MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write Case Note Update</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Update Note Details *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={noteForm.note}
                onChangeText={(v) => setNoteForm({ note: v })}
                multiline
                numberOfLines={5}
                placeholder="Spoke with client. Client agreed to pay full registration fee. Prepared evidence pack for June hearing..."
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddNote}>
                <Text style={styles.submitBtnText}>Add Note</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  backBtn: { width: 36, padding: 4 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginRight: 10 },
  statusBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12
  },
  statusText: { color: COLORS.primary, fontSize: 9, fontWeight: '800' },
  
  scroll: { padding: 16, gap: 16, paddingBottom: 120 },
  
  cardHeader: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  caseNumberText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  courtNameText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
  descText: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 12 },
  
  statusActionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16,
    borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 16
  },
  updateStatusLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  statusBtnGroup: { flexDirection: 'row', gap: 6, flex: 1 },
  statusBtn: {
    flex: 1, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6',
    alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6'
  },
  statusBtnActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)', borderColor: COLORS.primary
  },
  statusBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  statusBtnTextActive: { color: COLORS.primary, fontWeight: '800' },

  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1
  },

  clientCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clientAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center', justifyContent: 'center'
  },
  clientAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  clientMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  callBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center'
  },

  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8, fontWeight: '500' },
  
  // Timeline styles
  timelineList: { gap: 12 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelinePoint: { alignItems: 'center', width: 12 },
  timelineBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  timelineBody: { flex: 1, paddingBottom: 10 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  timelineDate: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 2 },
  timelineDesc: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginTop: 4 },

  // Docs styles
  docsList: { gap: 10 },
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  docName: { fontSize: 13, color: COLORS.textPrimary, flex: 1 },
  docViewBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Notes styles
  notesList: { gap: 12 },
  noteRow: {
    padding: 12, backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB'
  },
  noteBody: { fontSize: 12, color: COLORS.textPrimary, lineHeight: 18 },
  noteTime: { fontSize: 10, color: '#9CA3AF', marginTop: 6, fontWeight: '600' },

  // Scheduled / Booking styles
  fee: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  feeType: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  metaDot: { fontSize: 12, color: COLORS.textSecondary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12,
    backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 36, borderTopWidth: 1, borderColor: '#F3F4F6'
  },
  acceptButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 99, alignItems: 'center' },
  acceptButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  rejectButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 99, alignItems: 'center' },
  rejectButtonText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingBottom: 40
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
  multilineInput: { height: 100, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 12
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }
});

export default CaseDetailScreen;
