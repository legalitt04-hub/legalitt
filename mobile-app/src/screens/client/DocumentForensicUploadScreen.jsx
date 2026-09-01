// screens/client/DocumentForensicUploadScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#F5EFEB',
  cardBorder: '#E8DFD5',
  cardBgLight: '#FAF7F2',
  primaryButton: '#8C6E52',
  primaryButtonText: '#FFFFFF',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  inputBg: '#FFFFFF',
  inputBorder: '#D8CDC0',
  inputPlaceholder: '#A29689',
  dashedBorder: '#C7B8A8',
  badgeBg: '#8C6E52',
  badgeText: '#FFFFFF',
  chipBg: '#FAF7F2',
  chipBorder: '#DFD4C6',
  chipText: '#4A3F35',
  dangerRed: '#EF4444',
};

const DOCUMENT_TYPES = [
  'Sale Deed',
  'Registered Agreement',
  'Affidavit',
  'Registered Will',
  'Power of Attorney',
  'Financial / Cheque Document',
  'Court Order / Notice',
  'Other Legal Document',
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export default function DocumentForensicUploadScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ── 1. Document Picker (Browse Files) ───────────────────────────────────────
  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
          Alert.alert('File Too Large', 'Selected file exceeds the 50MB limit.');
          return;
        }
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType || 'application/pdf',
        });
      }
    } catch (err) {
      console.log('Document picker error:', err);
      Alert.alert('Error', 'Could not access documents.');
    }
  };

  // ── 2. Camera Capture ───────────────────────────────────────────────────────
  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take document photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: `Document_Camera_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: 'image/jpeg',
        });
      }
    } catch (err) {
      console.log('Camera error:', err);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // ── 3. Gallery Selection ────────────────────────────────────────────────────
  const handleGallerySelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed to select document photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `Document_Gallery_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: 'image/jpeg',
        });
      }
    } catch (err) {
      console.log('Gallery error:', err);
      Alert.alert('Error', 'Could not access gallery.');
    }
  };

  // ── 4. Continue Handler ────────────────────────────────────────────────────
  const handleContinue = () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginRegister', { role: 'client' });
      return;
    }
    if (!selectedFile) {
      Alert.alert('Document Required', 'Please select or upload a document to proceed with forensic analysis.');
      return;
    }

    // Navigate to Review Request or next step
    navigation.navigate('DocumentForensicReview', {
      document: selectedFile,
      documentType: docType || 'General Document',
      additionalNotes: notes,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.pageBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={PALETTE.textHeading} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Upload Document</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── UPLOAD AREA (DASHED CONTAINER) ──────────────────────────── */}
          <View style={styles.uploadAreaContainer}>
            {!selectedFile ? (
              <View style={styles.uploadAreaInner}>
                <Ionicons name="cloud-upload-outline" size={38} color={PALETTE.primaryButton} />
                <Text style={styles.uploadMainText}>
                  Drag & Drop your document here
                </Text>
                <Text style={styles.uploadSubText}>
                  or browse to upload
                </Text>
                <TouchableOpacity
                  style={styles.browseFilesBtn}
                  onPress={handleBrowseFiles}
                  activeOpacity={0.85}
                >
                  <Text style={styles.browseFilesBtnText}>Browse Files</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectedFileContainer}>
                <View style={styles.selectedFileIconBox}>
                  <Ionicons
                    name={selectedFile.mimeType?.includes('pdf') ? 'document-text' : 'image'}
                    size={28}
                    color={PALETTE.primaryButton}
                  />
                </View>
                <View style={styles.selectedFileTextBox}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  {selectedFile.size > 0 && (
                    <Text style={styles.selectedFileSize}>
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeFileBtn}
                  onPress={() => setSelectedFile(null)}
                >
                  <Ionicons name="close-circle" size={22} color={PALETTE.dangerRed} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ─── UPLOAD OPTIONS (CAMERA / GALLERY / FILES) ───────────────── */}
          <Text style={styles.sectionLabel}>You can also upload from</Text>
          <View style={styles.uploadOptionsRow}>
            {/* Option 1: Camera */}
            <TouchableOpacity
              style={styles.uploadOptionCard}
              onPress={handleCameraCapture}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={22} color={PALETTE.primaryButton} />
              <Text style={styles.uploadOptionLabel}>Camera</Text>
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity
              style={styles.uploadOptionCard}
              onPress={handleGallerySelection}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={22} color={PALETTE.primaryButton} />
              <Text style={styles.uploadOptionLabel}>Gallery</Text>
            </TouchableOpacity>

            {/* Option 3: Files */}
            <TouchableOpacity
              style={styles.uploadOptionCard}
              onPress={handleBrowseFiles}
              activeOpacity={0.8}
            >
              <Ionicons name="folder-outline" size={22} color={PALETTE.primaryButton} />
              <Text style={styles.uploadOptionLabel}>Files</Text>
            </TouchableOpacity>
          </View>

          {/* ─── DOCUMENTS TYPE ──────────────────────────────────────────── */}
          <Text style={styles.inputSectionLabel}>Documents Type</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setIsDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dropdownInputText,
                !docType && { color: PALETTE.inputPlaceholder },
              ]}
              numberOfLines={1}
            >
              {docType || 'Select Documents Type'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={PALETTE.textMuted} />
          </TouchableOpacity>

          {/* ─── ADDITIONAL NOTES ────────────────────────────────────────── */}
          <Text style={styles.inputSectionLabel}>Additional Notes (Optional)</Text>
          <View style={styles.textareaWrapper}>
            <TextInput
              style={styles.textareaInput}
              placeholder="Add any Specific instructions for our forensic experts"
              placeholderTextColor={PALETTE.inputPlaceholder}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* ─── RECOMMENDATION CARD ─────────────────────────────────────── */}
          <View style={styles.recommendationCard}>
            {/* Top Badge */}
            <View style={styles.recBadge}>
              <Text style={styles.recBadgeText}>
                RECOMMENDED FOR BETTER ACCURACY
              </Text>
            </View>

            {/* Heading & Subtitle */}
            <Text style={styles.recHeading}>
              Scientific Document Verification
            </Text>
            <Text style={styles.recDescription}>
              Our expert team of Handwriting Analysts and Forensic Specialists performs detailed scientific examinations to verify the authenticity and integrity of legal documents.
            </Text>

            {/* Document Type Chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chipItem}>
                <Text style={styles.chipText}>Sale Deed</Text>
              </View>
              <View style={styles.chipItem}>
                <Text style={styles.chipText}>Registered Agreement</Text>
              </View>
              <View style={styles.chipItem}>
                <Text style={styles.chipText}>Affidavit</Text>
              </View>
              <View style={styles.chipItem}>
                <Text style={styles.chipText}>Registered Will</Text>
              </View>
            </View>

            {/* Security Explanation */}
            <Text style={styles.recSecurityNote}>
              All forensic examinations follow strict standard operating procedures and legal evidentiary protocols to ensure accurate verification.
            </Text>
          </View>

          {/* ─── CONTINUE BUTTON ─────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

          <Text style={styles.supportedFormatsText}>
            We support PDF, JPG, PNG up to 50MB
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── DOCUMENT TYPE DROPDOWN MODAL ────────────────────────────────── */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Select Documents Type</Text>
              <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                <Ionicons name="close" size={20} color={PALETTE.textHeading} />
              </TouchableOpacity>
            </View>
            {DOCUMENT_TYPES.map((type, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dropdownOptionItem,
                  docType === type && styles.dropdownOptionItemSelected,
                ]}
                onPress={() => {
                  setDocType(type);
                  setIsDropdownOpen(false);
                }}
              >
                <Ionicons
                  name={docType === type ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={docType === type ? PALETTE.primaryButton : PALETTE.textMuted}
                />
                <Text
                  style={[
                    styles.dropdownOptionText,
                    docType === type && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    letterSpacing: 0.1,
  },
  headerRight: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Upload Container (Dashed Border)
  uploadAreaContainer: {
    backgroundColor: PALETTE.cardBgLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PALETTE.dashedBorder,
    borderStyle: 'dashed',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadAreaInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 12,
    color: PALETTE.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  browseFilesBtn: {
    backgroundColor: PALETTE.primaryButton,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseFilesBtnText: {
    color: PALETTE.primaryButtonText,
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Selected File Preview
  selectedFileContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    padding: 12,
    gap: 10,
  },
  selectedFileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileTextBox: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.textHeading,
  },
  selectedFileSize: {
    fontSize: 11,
    color: PALETTE.textMuted,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 4,
  },

  // ── Upload Options
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: PALETTE.textBody,
    marginTop: 18,
    marginBottom: 10,
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadOptionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  uploadOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.textHeading,
    marginTop: 6,
  },

  // ── Form Inputs
  inputSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 18,
    marginBottom: 8,
  },
  dropdownInput: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.inputBorder,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  dropdownInputText: {
    fontSize: 13.5,
    color: PALETTE.textHeading,
    flex: 1,
  },
  textareaWrapper: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.inputBorder,
    height: 90,
    padding: 10,
  },
  textareaInput: {
    flex: 1,
    fontSize: 13,
    color: PALETTE.textHeading,
    paddingTop: 0,
    paddingBottom: 0,
  },

  // ── Recommendation Card
  recommendationCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    padding: 16,
    marginTop: 20,
    shadowColor: '#8C6E52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  recBadge: {
    backgroundColor: PALETTE.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recBadgeText: {
    color: PALETTE.badgeText,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  recHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 10,
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 12,
    color: PALETTE.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chipItem: {
    backgroundColor: PALETTE.chipBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.chipBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: PALETTE.chipText,
  },
  recSecurityNote: {
    fontSize: 11,
    color: PALETTE.textMuted,
    lineHeight: 16,
  },

  // ── Continue Button
  continueBtn: {
    backgroundColor: PALETTE.primaryButton,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: PALETTE.primaryButton,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  continueBtnText: {
    color: PALETTE.primaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  supportedFormatsText: {
    fontSize: 11.5,
    color: PALETTE.textSubtitle,
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 20,
    elevation: 8,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  dropdownModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.textHeading,
  },
  dropdownOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  dropdownOptionItemSelected: {
    backgroundColor: '#F7F3EC',
  },
  dropdownOptionText: {
    fontSize: 13.5,
    color: PALETTE.textBody,
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: PALETTE.primaryButton,
  },
});
