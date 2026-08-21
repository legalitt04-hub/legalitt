// screens/client/DocumentForensicTrackScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#F5EFEB',
  cardBorder: '#E8DFD5',
  securityCardBg: '#FAF5EE',
  securityCardBorder: '#EFE3D3',
  iconCircleBg: '#E9DFC2',
  completedGreen: '#16A34A',
  completedGreenLine: '#16A34A',
  activeTan: '#8C6E52',
  pendingBorder: '#D8CDC0',
  pendingText: '#A89F95',
  pendingTitle: '#8C8278',
  inProgressBadgeBg: '#FEF3C7',
  inProgressBadgeText: '#92400E',
  inProgressBadgeBorder: '#FDE68A',
  primaryButton: '#8C6E52',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  dividerColor: '#E0D4C5',
  lineInactive: '#DCD4C8',
};

export default function DocumentForensicTrackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { requestId: passedRequestId } = route?.params || {};

  const requestId = passedRequestId || 'DF-2026-00245';

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help with your forensic analysis request? Our legal support team is available 24/7.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Helpline',
          onPress: () => Linking.openURL('tel:18001234567').catch(() => {}),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.pageBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('ClientMain')}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={PALETTE.textHeading} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Track Analysis</Text>
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
        {/* ─── REQUEST CARD ─────────────────────────────────────────────── */}
        <View style={styles.requestCard}>
          <View style={styles.requestIconBox}>
            <Ionicons name="document-text-outline" size={20} color={PALETTE.primaryButton} />
          </View>

          <View style={styles.requestTextCol}>
            <Text style={styles.requestLabel}>Request ID</Text>
            <Text style={styles.requestValue}>{requestId}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>In Progress</Text>
          </View>
        </View>

        {/* ─── ANALYSIS PROGRESS (VERTICAL TIMELINE) ────────────────────── */}
        <Text style={styles.timelineHeading}>Analysis Progress</Text>

        <View style={styles.timelineCard}>
          {/* STEP 1: Payment Received (Completed) */}
          <View style={styles.timelineStepRow}>
            <View style={styles.timelineColLeft}>
              <View style={styles.completedCircle}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.completedVerticalLine} />
            </View>
            <View style={styles.timelineColRight}>
              <Text style={styles.stepTitleCompleted}>Payment Received</Text>
              <Text style={styles.stepSubtitle}>23 May, 2026, 10:30 AM</Text>
            </View>
          </View>

          {/* STEP 2: Document Uploaded (Completed) */}
          <View style={styles.timelineStepRow}>
            <View style={styles.timelineColLeft}>
              <View style={styles.completedCircle}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.completedVerticalLine} />
            </View>
            <View style={styles.timelineColRight}>
              <Text style={styles.stepTitleCompleted}>Document Uploaded</Text>
              <Text style={styles.stepSubtitle}>23 May, 2026, 10:30 AM</Text>
            </View>
          </View>

          {/* STEP 3: Forensic Analysis (Active / In Progress) */}
          <TouchableOpacity
            style={styles.timelineStepRow}
            onPress={() => navigation.navigate('DocumentForensicAnalysis')}
            activeOpacity={0.8}
          >
            <View style={styles.timelineColLeft}>
              <View style={styles.activeCircle}>
                <View style={styles.activeInnerDot} />
              </View>
              <View style={styles.inactiveVerticalLine} />
            </View>
            <View style={styles.timelineColRight}>
              <Text style={styles.stepTitleActive}>Forensic Analysis</Text>
              <Text style={styles.stepSubtitleActive}>In Progress (Tap to View Checks)</Text>
            </View>
          </TouchableOpacity>

          {/* STEP 4: Expert Review (Pending) */}
          <View style={styles.timelineStepRow}>
            <View style={styles.timelineColLeft}>
              <View style={styles.pendingCircle} />
              <View style={styles.inactiveVerticalLine} />
            </View>
            <View style={styles.timelineColRight}>
              <Text style={styles.stepTitlePending}>Expert Review</Text>
              <Text style={styles.stepSubtitlePending}>Pending</Text>
            </View>
          </View>

          {/* STEP 5: Report Ready (Pending - Last item without line) */}
          <View style={styles.timelineStepRow}>
            <View style={styles.timelineColLeft}>
              <View style={styles.pendingCircle} />
            </View>
            <View style={styles.timelineColRight}>
              <Text style={styles.stepTitlePending}>Report Ready</Text>
              <Text style={styles.stepSubtitlePending}>Pending</Text>
            </View>
          </View>
        </View>

        {/* ─── CONTACT SUPPORT BUTTON ───────────────────────────────────── */}
        <TouchableOpacity
          style={styles.contactSupportBtn}
          onPress={handleContactSupport}
          activeOpacity={0.8}
        >
          <Ionicons name="headset-outline" size={18} color={PALETTE.primaryButton} style={styles.supportIcon} />
          <Text style={styles.contactSupportBtnText}>Contact Support</Text>
        </TouchableOpacity>

        {/* ─── SECURITY CARD ────────────────────────────────────────────── */}
        <View style={styles.securityCard}>
          <View style={styles.securityIconBox}>
            <Ionicons name="lock-closed" size={18} color={PALETTE.primaryButton} />
          </View>

          <View style={styles.securityTextCol}>
            <Text style={styles.securityHeading}>100% Confidential & Secure</Text>
            <Text style={styles.securityDesc}>
              Your documents are encrypted and{'\n'}accessible only to authorized experts.
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

  // ── Request Card
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#8C6E52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  requestIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestTextCol: {
    flex: 1,
  },
  requestLabel: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  requestValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: PALETTE.inProgressBadgeBg,
    borderWidth: 1,
    borderColor: PALETTE.inProgressBadgeBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: PALETTE.inProgressBadgeText,
  },

  // ── Timeline Section
  timelineHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginTop: 20,
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColLeft: {
    alignItems: 'center',
    width: 28,
    marginRight: 14,
  },
  timelineColRight: {
    flex: 1,
    paddingBottom: 22,
    justifyContent: 'center',
  },

  // Step Indicators
  completedCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PALETTE.completedGreen,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  completedVerticalLine: {
    width: 2,
    height: 38,
    backgroundColor: PALETTE.completedGreenLine,
    marginVertical: -1,
  },
  activeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PALETTE.activeTan,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 3,
    borderColor: '#EFE8DD',
  },
  activeInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  inactiveVerticalLine: {
    width: 2,
    height: 38,
    backgroundColor: PALETTE.lineInactive,
    marginVertical: -1,
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.pendingBorder,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },

  // Step Typography
  stepTitleCompleted: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
  },
  stepSubtitle: {
    fontSize: 11.5,
    color: PALETTE.textMuted,
    marginTop: 2,
  },
  stepTitleActive: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PALETTE.activeTan,
  },
  stepSubtitleActive: {
    fontSize: 11.5,
    fontWeight: '600',
    color: PALETTE.activeTan,
    marginTop: 2,
  },
  stepTitlePending: {
    fontSize: 13.5,
    fontWeight: '600',
    color: PALETTE.pendingTitle,
  },
  stepSubtitlePending: {
    fontSize: 11.5,
    color: PALETTE.pendingText,
    marginTop: 2,
  },

  // ── Contact Support Button
  contactSupportBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.primaryButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  supportIcon: {
    marginRight: 8,
  },
  contactSupportBtnText: {
    color: PALETTE.primaryButton,
    fontSize: 14.5,
    fontWeight: '700',
  },

  // ── Security Card
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.securityCardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.securityCardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
    gap: 12,
  },
  securityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextCol: {
    flex: 1,
  },
  securityHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PALETTE.textHeading,
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 11.5,
    color: PALETTE.textMuted,
    lineHeight: 16,
  },
});
