// screens/client/DocumentForensicScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#F5EFEB',
  cardBorder: '#E8DFD5',
  cardBgLight: '#FAF6F0',
  iconCircleBg: '#E9DFC2',
  primaryButton: '#8C6E52',
  primaryButtonText: '#FFFFFF',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  checkColor: '#8C6E52',
  accentOrange: '#F97316',
  accentOrangeLight: '#FFEDD5',
  folderBg: '#DFD2C2',
  docBorder: '#E2D8CC',
  itemBorder: '#E8DFD4',
};

export default function DocumentForensicScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleStartAnalysis = () => {
    // Navigate to DocumentForensicUpload page if available, or upload flow
    navigation.navigate('DocumentForensicUpload');
  };

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.pageBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── PAGE TITLE / HEADER ────────────────────────────────────────── */}
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
          <Text style={styles.headerTitle}>Legal Notice</Text>
          <Text style={styles.headerSubtitle}>Secure & Confidence</Text>
        </View>

        {/* Right balance placeholder */}
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
        {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Left Column */}
          <View style={styles.heroLeft}>
            <Text style={styles.heroMainHeading}>
              Online{'\n'}Document{'\n'}Forensic
            </Text>
            <Text style={styles.heroDescription}>
              Verify document authenticity{'\n'}and detect potential alterations,{'\n'}tampering or inconsistencies
            </Text>
          </View>

          {/* Right Column (Forensic Document Illustration) */}
          <View style={styles.heroRight}>
            <View style={styles.illustrationWrapper}>
              {/* Background Folder Shape */}
              <View style={styles.folderBackdrop}>
                <View style={styles.folderTab} />
              </View>

              {/* Foreground Document Sheet */}
              <View style={styles.documentSheet}>
                {/* Top document header line with orange accent */}
                <View style={styles.docHeaderRow}>
                  <View style={styles.docOrangeBar} />
                  <View style={styles.docHeaderLine} />
                </View>

                {/* Body lines */}
                <View style={styles.docLinesGroup}>
                  <View style={[styles.docLine, { width: '85%' }]} />
                  <View style={[styles.docLine, { width: '100%' }]} />
                  <View style={[styles.docLine, { width: '70%' }]} />
                  <View style={[styles.docLine, { width: '90%' }]} />
                  <View style={[styles.docLine, { width: '60%' }]} />
                </View>

                {/* Corner Fold */}
                <View style={styles.docCornerFold} />
              </View>

              {/* Magnifying Glass Over Document */}
              <View style={styles.magnifyingGlassBox}>
                <View style={styles.glassCircle}>
                  <Ionicons name="scan" size={16} color={PALETTE.accentOrange} />
                </View>
                <View style={styles.glassHandle} />
              </View>

              {/* Security Lock Badge */}
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* ─── MAIN INFORMATION CARD ────────────────────────────────────── */}
        <View style={styles.mainCard}>
          {/* Section 1: What is Document Forensic? */}
          <Text style={styles.cardHeading}>What is Document Forensic?</Text>
          <Text style={styles.cardBodyText}>
            Our experts use advanced digital forensics techniques to examine documents and provide a detailed report on authenticity and integrity
          </Text>

          {/* Section 2: Support Documents */}
          <Text style={[styles.cardHeading, { marginTop: 18 }]}>Support Documents</Text>
          <View style={styles.supportDocsGrid}>
            {/* Column 1 */}
            <View style={styles.supportCol}>
              <View style={styles.supportDocItem}>
                <Ionicons name="document-text-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>Agreements</Text>
              </View>
              <View style={styles.supportDocItem}>
                <Ionicons name="business-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>Sales Deeds</Text>
              </View>
              <View style={styles.supportDocItem}>
                <Ionicons name="newspaper-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>Affidavits</Text>
              </View>
            </View>

            {/* Column 2 */}
            <View style={styles.supportCol}>
              <View style={styles.supportDocItem}>
                <Ionicons name="document-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>PDF Files</Text>
              </View>
              <View style={styles.supportDocItem}>
                <Ionicons name="phone-portrait-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>Screenshots</Text>
              </View>
              <View style={styles.supportDocItem}>
                <Ionicons name="image-outline" size={16} color={PALETTE.textBody} />
                <Text style={styles.supportDocText}>Images</Text>
              </View>
            </View>
          </View>

          {/* Section 3: Key Features */}
          <Text style={[styles.cardHeading, { marginTop: 18 }]}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItemRow}>
              <Text style={styles.checkmarkIcon}>✓</Text>
              <Text style={styles.featureItemText}>Tampering Detection</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.checkmarkIcon}>✓</Text>
              <Text style={styles.featureItemText}>Digital Examination</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.checkmarkIcon}>✓</Text>
              <Text style={styles.featureItemText}>Metadata Analysis</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.checkmarkIcon}>✓</Text>
              <Text style={styles.featureItemText}>Professional Report</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.checkmarkIcon}>✓</Text>
              <Text style={styles.featureItemText}>Authenticity Verification</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleStartAnalysis}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start Analysis</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.btnArrow} />
          </TouchableOpacity>
        </View>

        {/* ─── BOTTOM INFORMATION CARD ──────────────────────────────────── */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardIconCircle}>
            <Ionicons name="search" size={22} color={PALETTE.primaryButton} />
          </View>
          <View style={styles.bottomCardTextCol}>
            <Text style={styles.bottomCardTitle}>
              Scientific Document Verification
            </Text>
            <Text style={styles.bottomCardDesc}>
              Our expert team of Handwriting Analysts and Forensic Specialists performs detailed scientific examinations to verify the authenticity and integrity of legal documents.
            </Text>
          </View>
        </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.textHeading,
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: PALETTE.textSubtitle,
    marginTop: 1,
  },
  headerRight: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // ── Hero Section
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 6,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroMainHeading: {
    fontSize: 27,
    fontWeight: '800',
    color: PALETTE.textHeading,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 12.5,
    color: PALETTE.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  heroRight: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Illustration
  illustrationWrapper: {
    width: 100,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderBackdrop: {
    position: 'absolute',
    width: 90,
    height: 100,
    backgroundColor: PALETTE.folderBg,
    borderRadius: 8,
    top: 4,
    left: 2,
    borderWidth: 1,
    borderColor: '#D4C4B2',
  },
  folderTab: {
    width: 32,
    height: 8,
    backgroundColor: PALETTE.folderBg,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: -7,
    left: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D4C4B2',
  },
  documentSheet: {
    width: 78,
    height: 102,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: PALETTE.docBorder,
    shadowColor: '#8C6E52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 2,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  docOrangeBar: {
    width: 16,
    height: 4,
    backgroundColor: PALETTE.accentOrange,
    borderRadius: 2,
  },
  docHeaderLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#EAE1D5',
    borderRadius: 2,
    marginLeft: 4,
  },
  docLinesGroup: {
    gap: 5,
  },
  docLine: {
    height: 3.5,
    backgroundColor: '#EAE1D5',
    borderRadius: 2,
  },
  docCornerFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomLeftRadius: 3,
    backgroundColor: '#F3EDE4',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#DFD2C2',
  },
  magnifyingGlassBox: {
    position: 'absolute',
    bottom: 8,
    right: -2,
    zIndex: 4,
    alignItems: 'center',
  },
  glassCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2.5,
    borderColor: PALETTE.primaryButton,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  glassHandle: {
    width: 5,
    height: 14,
    backgroundColor: PALETTE.primaryButton,
    borderRadius: 2.5,
    transform: [{ rotate: '-40deg' }],
    marginTop: -3,
    marginLeft: 14,
  },
  securityBadge: {
    position: 'absolute',
    top: 6,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PALETTE.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: PALETTE.accentOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  // ── Main Card
  mainCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#8C6E52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardBodyText: {
    fontSize: 12.5,
    color: PALETTE.textBody,
    lineHeight: 18.5,
  },

  // ── Support Documents
  supportDocsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: PALETTE.cardBgLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: PALETTE.itemBorder,
  },
  supportCol: {
    flex: 1,
    gap: 8,
  },
  supportDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  supportDocText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: PALETTE.textBody,
  },

  // ── Key Features List
  featuresList: {
    marginTop: 8,
    gap: 6,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmarkIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.checkColor,
  },
  featureItemText: {
    fontSize: 13,
    color: PALETTE.textBody,
    fontWeight: '500',
  },

  // ── Primary Button
  primaryBtn: {
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
  primaryBtnText: {
    color: PALETTE.primaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnArrow: {
    position: 'absolute',
    right: 18,
  },

  // ── Bottom Information Card
  bottomCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bottomCardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCardTextCol: {
    flex: 1,
  },
  bottomCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 3,
  },
  bottomCardDesc: {
    fontSize: 11,
    color: PALETTE.textMuted,
    lineHeight: 16,
  },
});
