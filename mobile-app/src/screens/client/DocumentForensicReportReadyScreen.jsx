// screens/client/DocumentForensicReportReadyScreen.jsx
import React from 'react';
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
import Toast from 'react-native-toast-message';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E8DFD5',
  docBg: '#FDF6E2',
  docBorder: '#F2DFB8',
  docLineBlue: '#60A5FA',
  cornerFoldBg: '#F5E6CA',
  cornerFoldBorder: '#E2CDAA',
  successGreen: '#16A34A',
  successGreenLight: '#DCFCE7',
  primaryButton: '#8C6E52',
  primaryButtonText: '#FFFFFF',
  secondaryButtonText: '#8C6E52',
  secondaryButtonBorder: '#8C6E52',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  dividerColor: '#F0EAE1',
};

export default function DocumentForensicReportReadyScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { requestId } = route?.params || {};

  const handleViewReport = () => {
    // Navigate to Page 10 (Analysis Completed Successfully)
    navigation.navigate('DocumentForensicComplete', {
      requestId: requestId || 'DF-2026-000245',
    });
  };

  const handleDownloadReport = () => {
    Toast.show({
      type: 'success',
      text1: 'Downloading Report',
      text2: 'Forensic_Report_DF_2026_00245.pdf saved to device.',
      visibilityTime: 3000,
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
          <Text style={styles.headerTitle}>Report Ready</Text>
          <Text style={styles.headerSubtitle}>
            Your document forensic analysis{'\n'}is complete
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 50 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── DOCUMENT ILLUSTRATION (CENTERED) ─────────────────────────── */}
        <View style={styles.illustrationCenterWrapper}>
          <View style={styles.documentIllustration}>
            {/* Corner Fold */}
            <View style={styles.cornerFold} />

            {/* Blue Document Lines */}
            <View style={styles.docLinesContainer}>
              <View style={[styles.docLineBlue, { width: '55%' }]} />
              <View style={[styles.docLineBlue, { width: '85%' }]} />
              <View style={[styles.docLineBlue, { width: '75%' }]} />
              <View style={[styles.docLineBlue, { width: '90%' }]} />
              <View style={[styles.docLineBlue, { width: '60%' }]} />
            </View>

            {/* Green Success Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* ─── REPORT SUMMARY CARD ──────────────────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Report Summary</Text>

          {/* Row 1: Authenticity Status -> Likely Genuine */}
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Authenticity Status</Text>
            <Text style={[styles.rowValue, { color: PALETTE.successGreen, fontWeight: '700' }]}>
              Likely Genuine
            </Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 2: Authenticity Status -> No */}
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Authenticity Status</Text>
            <Text style={styles.rowValue}>No</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 3: Risk Level -> Low */}
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Risk Level</Text>
            <Text style={[styles.rowValue, { color: PALETTE.successGreen, fontWeight: '700' }]}>
              Low
            </Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 4: Review Date -> 24 May 2026 */}
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Review Date</Text>
            <Text style={styles.rowValue}>24 May 2026</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 5: Report Pages -> 18 Pages */}
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Report Pages</Text>
            <Text style={styles.rowValue}>18 Pages</Text>
          </View>
        </View>

        {/* ─── BUTTONS ──────────────────────────────────────────────────── */}
        <View style={styles.buttonGroup}>
          {/* Primary Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleViewReport}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>View Report</Text>
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleDownloadReport}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Download Report</Text>
          </TouchableOpacity>
        </View>

        {/* ─── DOWNLOAD ICON (Small Floating/Bottom-Right Icon) ─────────── */}
        <View style={styles.downloadIconRow}>
          <TouchableOpacity
            style={styles.smallDownloadBtn}
            onPress={handleDownloadReport}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="download-outline" size={20} color={PALETTE.primaryButton} />
          </TouchableOpacity>
        </View>

        {/* Generous intentional whitespace below */}
        <View style={{ height: 80 }} />
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
  },
  backBtn: {
    padding: 4,
    marginTop: 2,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.textHeading,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: PALETTE.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
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

  // ── Document Illustration
  illustrationCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  documentIllustration: {
    width: 74,
    height: 94,
    backgroundColor: PALETTE.docBg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: PALETTE.docBorder,
    padding: 10,
    position: 'relative',
    shadowColor: '#8C6E52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cornerFold: {
    position: 'absolute',
    top: -1.5,
    right: -1.5,
    width: 14,
    height: 14,
    backgroundColor: PALETTE.cornerFoldBg,
    borderBottomLeftRadius: 4,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: PALETTE.cornerFoldBorder,
  },
  docLinesContainer: {
    gap: 6,
    marginTop: 6,
  },
  docLineBlue: {
    height: 3,
    backgroundColor: PALETTE.docLineBlue,
    borderRadius: 1.5,
  },
  successBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PALETTE.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // ── Report Summary Card
  summaryCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  rowLabel: {
    fontSize: 13,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: PALETTE.textHeading,
  },
  rowDivider: {
    height: 1,
    backgroundColor: PALETTE.dividerColor,
    marginVertical: 10,
  },

  // ── Buttons
  buttonGroup: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: PALETTE.primaryButton,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: PALETTE.primaryButton,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryBtnText: {
    color: PALETTE.primaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.secondaryButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    color: PALETTE.secondaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Small Download Icon
  downloadIconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingRight: 4,
  },
  smallDownloadBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
