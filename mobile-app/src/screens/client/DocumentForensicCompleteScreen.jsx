// screens/client/DocumentForensicCompleteScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
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
  statusBadgeBg: '#FAF6F0',
  statusBadgeBorder: '#E8DFD5',
  statusBadgeText: '#8C6E52',
  iconCircleBg: '#F7F3EC',
  sealGreen: '#16A34A',
  sealGreenOuter: '#22C55E',
  sealGreenLight: '#DCFCE7',
  primaryButton: '#8C6E52',
  primaryButtonText: '#FFFFFF',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  dividerColor: '#F0EAE1',
};

export default function DocumentForensicCompleteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { requestId: passedRequestId } = route?.params || {};

  const requestId = passedRequestId || 'DF-2026-000245';

  const handleDownload = () => {
    Toast.show({
      type: 'success',
      text1: 'Download Complete',
      text2: `Forensic_Report_${requestId}.pdf downloaded successfully.`,
      visibilityTime: 3000,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Document Forensic Analysis Report',
        message: `Verified Forensic Analysis Report for Request ID: ${requestId}. Status: Completed & Authenticated.`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleBackToHome = () => {
    navigation.navigate('ClientMain');
  };

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.pageBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBackToHome}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={PALETTE.textHeading} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── SUCCESS SEAL / BADGE ─────────────────────────────────────── */}
        <View style={styles.sealWrapper}>
          {/* Outer Layer with Starburst / Scalloped Rotation */}
          <View style={styles.sealOuterRing}>
            <View style={[styles.sealRotatedSquare, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.sealRotatedSquare, { transform: [{ rotate: '22.5deg' }] }]} />
            <View style={[styles.sealRotatedSquare, { transform: [{ rotate: '67.5deg' }] }]} />
            <View style={styles.sealCenterCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* ─── SUCCESS MESSAGE ──────────────────────────────────────────── */}
        <Text style={styles.successHeading}>
          Analysis Completed{'\n'}Successfully
        </Text>
        <Text style={styles.successSubtitle}>
          Your document analysis report is ready{'\n'}and has been delivered securely.
        </Text>

        {/* ─── REQUEST CARD ─────────────────────────────────────────────── */}
        <View style={styles.requestCard}>
          <View style={styles.requestLeftCol}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={18} color={PALETTE.primaryButton} />
            </View>
            <View>
              <Text style={styles.requestLabel}>Request ID</Text>
              <Text style={styles.requestValue}>{requestId}</Text>
            </View>
          </View>

          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* ─── ACTION CARD ──────────────────────────────────────────────── */}
        <View style={styles.actionCard}>
          {/* Row 1: Download Report */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDownload}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="download-outline" size={18} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.actionRowTitle}>Download Report</Text>
            </View>
            <Ionicons name="arrow-down-circle-outline" size={20} color={PALETTE.textMuted} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          {/* Row 2: Share Report */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="share-social-outline" size={18} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.actionRowTitle}>Share Report</Text>
            </View>
            <Ionicons name="share-outline" size={20} color={PALETTE.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── FINAL BUTTON (BACK TO HOME) ──────────────────────────────── */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={18} color="#FFFFFF" style={styles.homeIcon} />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>

        {/* Generous intentional whitespace below */}
        <View style={{ height: 60 }} />
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
  },
  backBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
  },

  // ── Success Seal / Badge
  sealWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    height: 72,
  },
  sealOuterRing: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sealRotatedSquare: {
    position: 'absolute',
    width: 58,
    height: 58,
    backgroundColor: PALETTE.sealGreenOuter,
    borderRadius: 8,
  },
  sealCenterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PALETTE.sealGreen,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: PALETTE.sealGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── Success Message
  successHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.textHeading,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 12.5,
    color: PALETTE.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  // ── Request Card
  requestCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  requestLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestLabel: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  requestValue: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 2,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500',
    marginBottom: 3,
  },
  statusBadge: {
    backgroundColor: PALETTE.statusBadgeBg,
    borderWidth: 1,
    borderColor: PALETTE.statusBadgeBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: PALETTE.statusBadgeText,
  },

  // ── Action Card
  actionCard: {
    width: '100%',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    marginTop: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.textHeading,
  },
  actionDivider: {
    height: 1,
    backgroundColor: PALETTE.dividerColor,
  },

  // ── Final Button (Back to Home)
  homeButton: {
    width: '100%',
    height: 50,
    backgroundColor: PALETTE.primaryButton,
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
  },
  homeIcon: {
    marginRight: 8,
  },
  homeButtonText: {
    color: PALETTE.primaryButtonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
