// screens/client/DocumentForensicExpertReviewScreen.jsx
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
  infoCardBg: '#FAF6F0',
  infoCardBorder: '#E8DFD5',
  iconCircleBg: '#F7F3EC',
  primaryButton: '#8C6E52',
  textHeading: '#2A241E',
  textBody: '#453B32',
  textMuted: '#766D64',
  textSubtitle: '#8C8278',
  dividerColor: '#F0EAE1',
  highlightText: '#8C6E52',
};

export default function DocumentForensicExpertReviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { requestId } = route?.params || {};

  const handleDownload = () => {
    Toast.show({
      type: 'info',
      text1: 'Report In Progress',
      text2: 'Preliminary summary will be downloadable once review reaches 100%.',
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
          <Text style={styles.headerTitle}>Expert Review</Text>
          <Text style={styles.headerSubtitle}>
            Document is under expert review{'\n'}by our legal & forensic specialists.
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── REVIEW DETAILS CARD ──────────────────────────────────────── */}
        <View style={styles.reviewDetailsCard}>
          <Text style={styles.cardHeading}>Review Details</Text>

          {/* Row 1: Expert Assigned */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeftCol}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={16} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.rowLabel}>Expert Assigned</Text>
            </View>
            <Text style={styles.rowValue}>Forensic Specialist</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 2: Review Started */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeftCol}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={16} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.rowLabel}>Review Started</Text>
            </View>
            <Text style={styles.rowValue}>24 May 2026, 11:15 AM</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 3: Checks Completed */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeftCol}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkbox-outline" size={16} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.rowLabel}>Checks Completed</Text>
            </View>
            <Text style={[styles.rowValue, { color: PALETTE.highlightText }]}>70%</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 4: Estimated Completion */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeftCol}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={16} color={PALETTE.primaryButton} />
              </View>
              <Text style={styles.rowLabel}>Estimated Completion</Text>
            </View>
            <Text style={styles.rowValue}>24 May 2026, 06:00 PM</Text>
          </View>
        </View>

        {/* ─── INFORMATION CARD ─────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>
            Our experts are verifying findings and preparing{'\n'}your detailed report
          </Text>
        </View>

        {/* ─── DOWNLOAD ICON (Small Floating/Bottom-Right Icon) ─────────── */}
        <View style={styles.downloadIconRow}>
          <TouchableOpacity
            style={styles.smallDownloadBtn}
            onPress={handleDownload}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="download-outline" size={20} color={PALETTE.primaryButton} />
          </TouchableOpacity>
        </View>

        {/* Generous intentional whitespace below */}
        <View style={{ height: 100 }} />
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
    paddingTop: 18,
  },

  // ── Review Details Card
  reviewDetailsCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingHorizontal: 16,
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
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PALETTE.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 12.5,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.textHeading,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: PALETTE.dividerColor,
    marginVertical: 10,
  },

  // ── Information Card
  infoCard: {
    backgroundColor: PALETTE.infoCardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.infoCardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardText: {
    fontSize: 12,
    color: PALETTE.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Download Icon (Bottom-Right)
  downloadIconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
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
