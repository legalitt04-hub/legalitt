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

const Section = ({ icon, number, title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={TEAL} />
      </View>
      <Text style={styles.sectionTitle}>{number}. {title}</Text>
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

export default function TermsConditionsScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      {/* Header */}
      <LinearGradient colors={[NAVY, '#1a3a8a']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="document-text" size={20} color={TEAL} style={{ marginBottom: 2 }} />
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
        {/* Intro */}
        <View style={styles.introBanner}>
          <Ionicons name="scale-outline" size={28} color={TEAL} />
          <Text style={styles.introText}>
            These Terms & Conditions ("Terms") govern your use of the Legalitt platform. By
            creating an account, you agree to be bound by these Terms. Please read them carefully.
          </Text>
        </View>

        {/* Key info strip */}
        <View style={styles.keyInfoRow}>
          {[
            { icon: 'people', label: 'For Users 18+' },
            { icon: 'shield-checkmark', label: 'GDPR Compliant' },
            { icon: 'flag', label: 'Governed by Indian Law' },
          ].map((item, i) => (
            <View key={i} style={styles.keyInfoItem}>
              <Ionicons name={item.icon} size={18} color={TEAL} />
              <Text style={styles.keyInfoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Section icon="person-circle-outline" number="1" title="Eligibility">
          <Para>
            You must be at least 18 years of age to use Legalitt. By registering, you represent
            and warrant that you meet this requirement and have the legal capacity to enter into
            binding agreements.
          </Para>
        </Section>

        <Section icon="briefcase-outline" number="2" title="Nature of Service">
          <Para>
            Legalitt is a technology platform that connects clients with independent legal
            professionals (advocates). We are not a law firm and do not provide legal advice.
          </Para>
          <Bullet>We facilitate connections between clients and advocates.</Bullet>
          <Bullet>All legal advice is provided solely by the advocate, not by Legalitt.</Bullet>
          <Bullet>We are not responsible for the quality or accuracy of legal services rendered.</Bullet>
          <Bullet>No attorney-client relationship exists between users and Legalitt.</Bullet>
        </Section>

        <Section icon="create-outline" number="3" title="Account Registration">
          <Para>To use our services, you must:</Para>
          <Bullet>Provide accurate, current, and complete information during registration.</Bullet>
          <Bullet>Maintain the security of your account credentials.</Bullet>
          <Bullet>Promptly notify us of any unauthorised account access.</Bullet>
          <Bullet>Not create multiple accounts or impersonate others.</Bullet>
          <Para>
            You are responsible for all activity that occurs under your account. Legalitt reserves
            the right to suspend or terminate accounts that violate these Terms.
          </Para>
        </Section>

        <Section icon="card-outline" number="4" title="Payments & Refunds">
          <Para>
            Consultation fees are set by individual advocates and displayed before booking.
            Payments are processed securely via Razorpay.
          </Para>
          <Bullet>Payments are non-refundable once a consultation session begins.</Bullet>
          <Bullet>Refunds for cancellations follow the cancellation policy on each booking.</Bullet>
          <Bullet>Disputed charges must be raised within 7 days of the transaction.</Bullet>
          <Bullet>Legalitt charges a platform fee on each successful consultation.</Bullet>
        </Section>

        <Section icon="chatbubbles-outline" number="5" title="User Conduct">
          <Para>You agree not to use Legalitt to:</Para>
          <Bullet>Harass, abuse, or threaten advocates or other users.</Bullet>
          <Bullet>Share false, misleading, or defamatory information.</Bullet>
          <Bullet>Attempt to solicit advocates outside the platform to evade fees.</Bullet>
          <Bullet>Upload illegal content, malware, or infringing material.</Bullet>
          <Bullet>Engage in any activity that disrupts platform functionality.</Bullet>
          <Bullet>Use the AI assistant for any illegal or unethical purposes.</Bullet>
        </Section>

        <Section icon="document-outline" number="6" title="AI Legal Assistant">
          <Para>
            The AI Legal Assistant is provided for informational purposes only.
          </Para>
          <Bullet>AI responses are not legal advice and should not be relied upon as such.</Bullet>
          <Bullet>Always consult a qualified advocate for specific legal matters.</Bullet>
          <Bullet>We are not liable for any action taken based on AI-generated content.</Bullet>
          <Bullet>Your AI conversations may be used in anonymised form to improve the service.</Bullet>
        </Section>

        <Section icon="document-text-outline" number="7" title="FIR & Document Drafts">
          <Para>
            FIR drafts and legal documents generated by Legalitt are templates only. They must be
            reviewed by a qualified advocate before submission. Legalitt accepts no liability for
            errors in AI-generated legal documents.
          </Para>
        </Section>

        <Section icon="shield-outline" number="8" title="Intellectual Property">
          <Para>
            All content, designs, trademarks, and software on the Legalitt platform are owned by
            Legalitt Technologies Private Limited. You are granted a limited, non-exclusive,
            non-transferable licence to use the app for personal, non-commercial purposes.
          </Para>
          <Para>
            You retain ownership of any content you upload. By uploading, you grant us a limited
            licence to store, display, and process it to provide our services.
          </Para>
        </Section>

        <Section icon="alert-circle-outline" number="9" title="Limitation of Liability">
          <Para>
            To the maximum extent permitted by law, Legalitt and its affiliates shall not be
            liable for any indirect, incidental, special, consequential, or exemplary damages,
            including loss of income, data, or reputation arising from:
          </Para>
          <Bullet>Your use or inability to use the platform.</Bullet>
          <Bullet>Actions or omissions of any advocate on our platform.</Bullet>
          <Bullet>Any errors in AI-generated legal content.</Bullet>
          <Bullet>Unauthorised access to your account due to your own negligence.</Bullet>
          <Para>
            Our total liability shall not exceed the amount you paid to Legalitt in the 3 months
            preceding the claim.
          </Para>
        </Section>

        <Section icon="close-circle-outline" number="10" title="Termination">
          <Para>
            You may terminate your account at any time via Settings → Data Deletion Request.
            Legalitt may suspend or terminate your account for violation of these Terms, without
            prior notice, at our sole discretion.
          </Para>
          <Para>
            Upon termination, your right to use the platform ceases immediately. Data deletion
            follows our Privacy Policy schedule (within 30 days).
          </Para>
        </Section>

        <Section icon="refresh-outline" number="11" title="Changes to Terms">
          <Para>
            We may modify these Terms at any time. We will notify you of significant changes in-app
            and require your re-acceptance. Continued use after notification constitutes acceptance.
          </Para>
        </Section>

        <Section icon="flag-outline" number="12" title="Governing Law & Disputes">
          <Para>
            These Terms are governed by the laws of India, specifically the Information Technology
            Act 2000 and the Consumer Protection Act 2019. Any disputes shall be subject to the
            exclusive jurisdiction of the courts in New Delhi, India.
          </Para>
          <Para>
            For disputes, users are encouraged to first attempt resolution via our grievance
            mechanism: <Text style={styles.link}>grievance@legalitt.com</Text>
          </Para>
        </Section>

        <Section icon="call-outline" number="13" title="Contact Us">
          <Bullet>Legal Team: <Text style={styles.link}>legal@legalitt.com</Text></Bullet>
          <Bullet>Grievance Officer: <Text style={styles.link}>grievance@legalitt.com</Text></Bullet>
          <Bullet>Response time: 15 business days</Bullet>
        </Section>

        <View style={styles.bottomCard}>
          <Ionicons name="checkmark-circle" size={24} color={TEAL} />
          <Text style={styles.bottomCardText}>
            By using Legalitt, you agree to these Terms & Conditions in full.
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
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  introText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },

  keyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  keyInfoItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  keyInfoLabel: { fontSize: 10, fontWeight: '700', color: NAVY, textAlign: 'center' },

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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: NAVY, flex: 1 },

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
