// screens/client/DocumentForensicReviewScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E8DFD5',
  itemCardBg: '#FFFFFF',
  itemCardBorder: '#E8DFD5',
  iconBoxBg: '#FDF2F2',
  iconBoxBgNeutral: '#F7F3EC',
  pdfIconRed: '#EF4444',
  primaryButton: '#8C6E52',
  primaryButtonText: '#FFFFFF',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  dividerColor: '#F0EAE1',
  dangerRed: '#EF4444',
  outlineBtnBorder: '#8C6E52',
};

export default function DocumentForensicReviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const {
    document: initialDoc,
    documentType: initialDocType,
    additionalNotes,
  } = route?.params || {};

  // Form & File State (using passed data or high-fidelity defaults)
  const [document, setDocument] = useState(
    initialDoc || {
      name: 'Property_Agreement_pdf',
      size: 2.8 * 1024 * 1024,
      mimeType: 'application/pdf',
    }
  );

  const documentType = initialDocType || 'PDF Agreement';

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes) return '2.8 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ── Delete / Remove Document ────────────────────────────────────────────────
  const handleDeleteDocument = () => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this uploaded document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setDocument(null),
        },
      ]
    );
  };

  // ── Upload More / Change Document ───────────────────────────────────────────
  const handleUploadMore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocument({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType || 'application/pdf',
        });
      }
    } catch (err) {
      console.log('Upload more error:', err);
      // Fallback: Return to upload screen
      navigation.navigate('DocumentForensicUpload');
    }
  };

  // ── Proceed to Payment (Navigate to Page 4) ─────────────────────────────────
  const handleProceedToPayment = () => {
    if (!document) {
      Alert.alert('Document Required', 'Please upload a document to proceed with the forensic review.');
      return;
    }

    navigation.navigate('DocumentForensicPayment', {
      document,
      documentType,
      additionalNotes,
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
          <Text style={styles.headerTitle}>Review Request</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── UPLOADED DOCUMENT SECTION ────────────────────────────────── */}
        <Text style={styles.sectionHeading}>Uploaded Document</Text>

        {document ? (
          <View style={styles.uploadedDocCard}>
            {/* Left PDF Icon */}
            <View style={styles.pdfIconContainer}>
              <Ionicons name="document-text" size={24} color={PALETTE.pdfIconRed} />
            </View>

            {/* Document Info */}
            <View style={styles.docInfoCol}>
              <Text style={styles.docFileName} numberOfLines={1}>
                {document.name || 'Property_Agreement_pdf'}
              </Text>
              <Text style={styles.docFileSize}>
                {formatFileSize(document.size)}
              </Text>
            </View>

            {/* Far Right Delete Icon */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteDocument}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={PALETTE.dangerRed} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyDocCard}>
            <Ionicons name="alert-circle-outline" size={24} color={PALETTE.textMuted} />
            <Text style={styles.emptyDocText}>No document attached</Text>
          </View>
        )}

        {/* ─── UPLOAD MORE BUTTON ───────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.uploadMoreBtn}
          onPress={handleUploadMore}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadMoreBtnText}>+ Upload More</Text>
        </TouchableOpacity>

        {/* ─── DOCUMENT INFORMATION CARD ────────────────────────────────── */}
        <View style={styles.docInfoCard}>
          {/* Row 1: Document Type */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="document-text-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Document Type</Text>
              <Text style={styles.infoValue}>{documentType}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 2: Number of Files */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="copy-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Number of Files</Text>
              <Text style={styles.infoValue}>{document ? '1 File' : '0 Files'}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 3: Requested Analysis */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="scan-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Requested Analysis</Text>
              <Text style={styles.infoValue}>Comprehensive Forensic Analysis</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 4: Estimated Report Delivery */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="time-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Estimated Report Delivery</Text>
              <Text style={styles.infoValue}>24 - 48 Hours</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 5: Request ID (After Payment) */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="receipt-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Request ID (After Payment)</Text>
              <Text style={styles.infoValue}>Will be generated</Text>
            </View>
          </View>
        </View>

        {/* ─── PRIMARY BUTTON (PROCEED TO PAYMENT) ──────────────────────── */}
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceedToPayment}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.proceedBtnArrow} />
        </TouchableOpacity>

        {/* Subtext Below Button */}
        <Text style={styles.proceedSubtext}>
          You won’t be charged until next step
        </Text>
      </ScrollView>
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
    paddingTop: 18,
  },

  // ── Uploaded Document Section
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 10,
  },
  uploadedDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.itemCardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.itemCardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pdfIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: PALETTE.iconBoxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfoCol: {
    flex: 1,
    paddingRight: 8,
  },
  docFileName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: PALETTE.textHeading,
  },
  docFileSize: {
    fontSize: 11.5,
    color: PALETTE.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.itemCardBorder,
    padding: 16,
    gap: 10,
  },
  emptyDocText: {
    fontSize: 13,
    color: PALETTE.textMuted,
  },

  // ── Upload More Button
  uploadMoreBtn: {
    borderWidth: 1,
    borderColor: PALETTE.outlineBtnBorder,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  uploadMoreBtnText: {
    color: PALETTE.outlineBtnBorder,
    fontSize: 13.5,
    fontWeight: '600',
  },

  // ── Document Information Card
  docInfoCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.iconBoxBgNeutral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11.5,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13.5,
    color: PALETTE.textHeading,
    fontWeight: '600',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: PALETTE.dividerColor,
    marginVertical: 10,
  },

  // ── Primary Button (Proceed to Payment)
  proceedBtn: {
    backgroundColor: PALETTE.primaryButton,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: PALETTE.primaryButton,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  proceedBtnText: {
    color: PALETTE.primaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  proceedBtnArrow: {
    position: 'absolute',
    right: 18,
  },
  proceedSubtext: {
    fontSize: 11.5,
    color: PALETTE.textSubtitle,
    textAlign: 'center',
    marginTop: 8,
  },
});
