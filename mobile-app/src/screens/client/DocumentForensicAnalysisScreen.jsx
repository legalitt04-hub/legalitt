// screens/client/DocumentForensicAnalysisScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E8DFD5',
  infoBoxBg: '#FAF6F0',
  infoBoxBorder: '#E8DFD5',
  completedGreen: '#16A34A',
  completedGreenLine: '#16A34A',
  completedBadgeBg: '#DCFCE7',
  completedBadgeText: '#15803D',
  inProgressBadgeBg: '#FEF3C7',
  inProgressBadgeText: '#92400E',
  pendingBadgeBg: '#F3EFE9',
  pendingBadgeText: '#8C8278',
  activeTan: '#8C6E52',
  pendingCircleBorder: '#D8CDC0',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  lineInactive: '#E5DCcf',
  primaryButton: '#8C6E52',
};

const CHECKS_DATA = [
  {
    id: 1,
    title: 'Scan & Integrity Check',
    status: 'Completed',
    statusType: 'completed',
    isCompleted: true,
    isActive: false,
    isLast: false,
  },
  {
    id: 2,
    title: 'Metadata Verification',
    status: 'In Progress',
    statusType: 'in_progress',
    isCompleted: true,
    isActive: false,
    isLast: false,
  },
  {
    id: 3,
    title: 'Signature Verification',
    status: 'Pending',
    statusType: 'pending',
    isCompleted: false,
    isActive: true,
    isLast: false,
  },
  {
    id: 4,
    title: 'Image Integrity Analysis',
    status: 'Pending',
    statusType: 'pending',
    isCompleted: false,
    isActive: false,
    isLast: false,
  },
  {
    id: 5,
    title: 'Tampering Detection',
    status: 'Pending',
    statusType: 'pending',
    isCompleted: false,
    isActive: false,
    isLast: false,
  },
  {
    id: 6,
    title: 'Expert Review',
    status: 'Pending',
    statusType: 'pending',
    isCompleted: false,
    isActive: false,
    isLast: true,
  },
];

export default function DocumentForensicAnalysisScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Analysis in Progress</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── INTRODUCTION ─────────────────────────────────────────────── */}
        <View style={styles.introSection}>
          <Text style={styles.introHeading}>Track Consultation</Text>
          <Text style={styles.introSubtitle}>
            Stay updated with your consultation progress
          </Text>
        </View>

        {/* ─── ANALYSIS CHECKS CARD ─────────────────────────────────────── */}
        <View style={styles.checksCard}>
          <Text style={styles.cardHeading}>Analysis Checks</Text>

          {/* Checklist with connected vertical timeline */}
          <View style={styles.checksList}>
            {CHECKS_DATA.map((item, index) => {
              return (
                <View key={item.id} style={styles.checkRow}>
                  {/* Left Column: Indicator + Vertical Line */}
                  <View style={styles.indicatorCol}>
                    {item.isCompleted ? (
                      <View style={styles.completedCircle}>
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      </View>
                    ) : item.isActive ? (
                      <View style={styles.activeCircle}>
                        <View style={styles.activeInnerDot} />
                      </View>
                    ) : (
                      <View style={styles.pendingCircle} />
                    )}

                    {!item.isLast && (
                      <View
                        style={[
                          styles.verticalLine,
                          item.isCompleted && styles.verticalLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  {/* Middle Column: Title */}
                  <View style={styles.checkTextCol}>
                    <Text
                      style={[
                        styles.checkTitle,
                        (item.isCompleted || item.isActive)
                          ? styles.checkTitleActive
                          : styles.checkTitlePending,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {/* Right Column: Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      item.statusType === 'completed' && styles.statusPillCompleted,
                      item.statusType === 'in_progress' && styles.statusPillInProgress,
                      item.statusType === 'pending' && styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.statusType === 'completed' && styles.statusPillTextCompleted,
                        item.statusType === 'in_progress' && styles.statusPillTextInProgress,
                        item.statusType === 'pending' && styles.statusPillTextPending,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ─── INFORMATION BOX ────────────────────────────────────────── */}
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={16} color={PALETTE.primaryButton} style={styles.infoBoxIcon} />
            <Text style={styles.infoBoxText}>
              This may take 1 - 2 working days depending{'\n'}on the complexity of the document.
            </Text>
          </View>
        </View>

        {/* Intentionally substantial white space below matching reference */}
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

  // ── Introduction
  introSection: {
    marginBottom: 14,
  },
  introHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.textHeading,
    letterSpacing: -0.2,
  },
  introSubtitle: {
    fontSize: 12.5,
    color: PALETTE.textMuted,
    marginTop: 3,
  },

  // ── Analysis Checks Card
  checksCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 18,
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
    marginBottom: 16,
    letterSpacing: -0.1,
  },
  checksList: {
    paddingLeft: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  completedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PALETTE.completedGreen,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PALETTE.activeTan,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2.5,
    borderColor: '#EFE8DD',
  },
  activeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PALETTE.pendingCircleBorder,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    height: 32,
    backgroundColor: PALETTE.lineInactive,
    marginVertical: -1,
  },
  verticalLineCompleted: {
    backgroundColor: PALETTE.completedGreenLine,
  },
  checkTextCol: {
    flex: 1,
    paddingBottom: 22,
    justifyContent: 'center',
  },
  checkTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkTitleActive: {
    fontWeight: '600',
    color: PALETTE.textHeading,
  },
  checkTitlePending: {
    fontWeight: '500',
    color: PALETTE.textMuted,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: -1,
  },
  statusPillCompleted: {
    backgroundColor: PALETTE.completedBadgeBg,
  },
  statusPillInProgress: {
    backgroundColor: PALETTE.inProgressBadgeBg,
  },
  statusPillPending: {
    backgroundColor: PALETTE.pendingBadgeBg,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextCompleted: {
    color: PALETTE.completedBadgeText,
  },
  statusPillTextInProgress: {
    color: PALETTE.inProgressBadgeText,
  },
  statusPillTextPending: {
    color: PALETTE.pendingBadgeText,
  },

  // ── Information Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.infoBoxBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.infoBoxBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    gap: 8,
  },
  infoBoxIcon: {
    marginTop: 1,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11.5,
    color: PALETTE.textMuted,
    lineHeight: 16,
  },
});
