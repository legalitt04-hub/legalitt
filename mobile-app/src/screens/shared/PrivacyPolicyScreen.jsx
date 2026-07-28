import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LAST_UPDATED = 'May 24, 2026';
const NAVY = '#012464';
const TEAL = '#0D9488';

const Section = ({ icon, title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={TEAL} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const Para = ({ children }) => <Text style={styles.para}>{children}</Text>;

const Bullet = ({ children }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const GDPRRight = ({ emoji, title, desc }) => (
  <View style={styles.gdprCard}>
    <Text style={styles.gdprEmoji}>{emoji}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.gdprTitle}>{title}</Text>
      <Text style={styles.gdprDesc}>{desc}</Text>
    </View>
  </View>
);

export default function PrivacyPolicyScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 8],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      {/* Header */}
      <LinearGradient colors={[NAVY, '#1a3a8a']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={20} color={TEAL} style={{ marginBottom: 2 }} />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>Last updated {LAST_UPDATED}</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Intro banner */}
        <View style={styles.introBanner}>
          <Ionicons name="shield-half-outline" size={28} color={TEAL} />
          <Text style={styles.introText}>
            Legalitt is committed to protecting your privacy. This policy explains how we collect,
            use, store and protect your personal information in compliance with the GDPR, IT Act 2000,
            and applicable Indian data protection laws.
          </Text>
        </View>

        {/* GDPR Rights highlight box */}
        <View style={styles.gdprBox}>
          <Text style={styles.gdprBoxTitle}>🇪🇺 Your GDPR Rights</Text>
          <Text style={styles.gdprBoxSub}>As a data subject, you have the following rights:</Text>

          <GDPRRight emoji="👁️" title="Right to Access" desc="Request a copy of all personal data we hold about you." />
          <GDPRRight emoji="✏️" title="Right to Rectification" desc="Request correction of any inaccurate personal data." />
          <GDPRRight emoji="🗑️" title="Right to Erasure" desc="Request permanent deletion of your account and all associated data." />
          <GDPRRight emoji="⏸️" title="Right to Restrict Processing" desc="Request that we limit how we use your data." />
          <GDPRRight emoji="📦" title="Right to Data Portability" desc="Receive your data in a structured, machine-readable format." />
          <GDPRRight emoji="🚫" title="Right to Object" desc="Object to processing based on legitimate interests or for direct marketing." />

          <Text style={styles.gdprExercise}>
            To exercise any of these rights, go to{' '}
            <Text style={styles.gdprLink}>Settings → Data Deletion Request</Text>
            {' '}or email us at{' '}
            <Text style={styles.gdprLink}>privacy@legalitt.com</Text>
          </Text>
        </View>

        <Section icon="information-circle-outline" title="1. Who We Are">
          <Para>
            Legalitt is a legal services platform operated by Legalitt Technologies Private Limited,
            registered in India. We connect clients with verified advocates for consultations, case
            management, and legal document assistance.
          </Para>
          <Para>
            Contact: <Text style={styles.link}>privacy@legalitt.com</Text>{'\n'}
            Data Protection Officer: <Text style={styles.link}>dpo@legalitt.com</Text>
          </Para>
        </Section>

        <Section icon="clipboard-outline" title="2. Data We Collect">
          <Para>We collect the following categories of data:</Para>
          <Bullet>Identity data: Full name, email address, phone number</Bullet>
          <Bullet>Profile data: Avatar, date of birth, gender, address</Bullet>
          <Bullet>Usage data: App interactions, search queries, bookings</Bullet>
          <Bullet>Communication data: Chat messages with advocates</Bullet>
          <Bullet>Payment data: Transaction IDs (we do not store card numbers)</Bullet>
          <Bullet>Device data: Push notification tokens, device type</Bullet>
          <Bullet>Location data: GPS coordinates for nearby advocate search (optional)</Bullet>
        </Section>

        <Section icon="construct-outline" title="3. How We Use Your Data">
          <Bullet>Providing and improving our legal services platform</Bullet>
          <Bullet>Matching you with relevant advocates nearby</Bullet>
          <Bullet>Processing consultation bookings and payments</Bullet>
          <Bullet>Sending relevant notifications and updates</Bullet>
          <Bullet>Ensuring platform security and fraud prevention</Bullet>
          <Bullet>Complying with our legal obligations under Indian law</Bullet>
          <Bullet>AI-powered features (FIR drafts, legal assistant queries)</Bullet>
        </Section>

        <Section icon="people-outline" title="4. Data Sharing">
          <Para>We do not sell your personal data. We share data only with:</Para>
          <Bullet>Advocates you choose to book or consult with</Bullet>
          <Bullet>Payment processors (Razorpay) for transaction completion</Bullet>
          <Bullet>Cloud infrastructure providers (AWS/Render) for secure hosting</Bullet>
          <Bullet>Analytics tools under strict data processing agreements</Bullet>
          <Para>
            All third-party processors are bound by GDPR-compliant data processing agreements.
          </Para>
        </Section>

        <Section icon="lock-closed-outline" title="5. Data Security">
          <Para>We implement industry-standard security measures:</Para>
          <Bullet>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</Bullet>
          <Bullet>Passwords hashed using bcrypt with salt rounds</Bullet>
          <Bullet>JWT authentication with short-lived access tokens</Bullet>
          <Bullet>Regular security audits and penetration testing</Bullet>
          <Bullet>Strict role-based access controls for internal staff</Bullet>
        </Section>

        <Section icon="time-outline" title="6. Data Retention">
          <Para>
            We retain your personal data for as long as your account is active. If you request
            account deletion, we permanently remove all identifiable data within 30 days.
          </Para>
          <Para>
            Transaction records may be retained for 7 years as required by Indian financial
            regulations (IT Act, GST laws), in anonymised or pseudonymised form.
          </Para>
        </Section>

        <Section icon="home-outline" title="7. Data Transfers">
          <Para>
            Your data is primarily stored on servers located in India. If we transfer data
            internationally, we ensure equivalent protections via Standard Contractual Clauses (SCCs)
            or adequacy decisions.
          </Para>
        </Section>

        <Section icon="chatbubble-ellipses-outline" title="8. Cookies & Tracking">
          <Para>
            The Legalitt mobile app does not use browser cookies. We use device identifiers and
            analytics SDKs (with your consent) to improve performance. You can opt out of analytics
            in Settings → Preferences.
          </Para>
        </Section>

        <Section icon="person-outline" title="9. Minors">
          <Para>
            Legalitt is intended for users aged 18 and above. We do not knowingly collect personal
            information from children under 18. If you believe we have inadvertently collected such
            data, contact us at <Text style={styles.link}>privacy@legalitt.com</Text>.
          </Para>
        </Section>

        <Section icon="refresh-outline" title="10. Policy Updates">
          <Para>
            We may update this Privacy Policy periodically. When we make significant changes, we
            will notify you within the app and require re-acknowledgement. The "Last Updated" date
            at the top reflects the most recent revision.
          </Para>
        </Section>

        <Section icon="call-outline" title="11. Contact & Grievances">
          <Para>
            For any privacy concerns, data access requests, or to lodge a complaint, contact our
            Grievance Officer:
          </Para>
          <Bullet>Email: <Text style={styles.link}>grievance@legalitt.com</Text></Bullet>
          <Bullet>Response time: Within 30 days as per IT Act 2000, Rule 5</Bullet>
          <Bullet>You may also contact the Data Protection Authority of India</Bullet>
        </Section>

        <View style={styles.bottomCard}>
          <Ionicons name="checkmark-circle" size={24} color={TEAL} />
          <Text style={styles.bottomCardText}>
            By using Legalitt, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  introText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },

  gdprBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  gdprBoxTitle: { fontSize: 15, fontWeight: '800', color: NAVY, marginBottom: 4 },
  gdprBoxSub: { fontSize: 12, color: '#4B5563', marginBottom: 12 },
  gdprCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
  },
  gdprEmoji: { fontSize: 18, marginTop: 1 },
  gdprTitle: { fontSize: 12, fontWeight: '700', color: NAVY, marginBottom: 2 },
  gdprDesc: { fontSize: 11, color: '#6B7280', lineHeight: 17 },
  gdprExercise: { fontSize: 11, color: '#374151', marginTop: 10, lineHeight: 17 },
  gdprLink: { color: TEAL, fontWeight: '700' },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: NAVY },

  para: { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 8 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  bulletDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: TEAL, marginTop: 7,
  },
  bulletText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },

  link: { color: TEAL, fontWeight: '600' },

  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 8,
  },
  bottomCardText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
});
