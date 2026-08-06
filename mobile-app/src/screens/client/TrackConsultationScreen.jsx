import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { LogoHeader } from '../../components/legalAdvice/LogoHeader';
import { LawyerCard } from '../../components/legalAdvice/LawyerCard';
import { StatusTimeline } from '../../components/legalAdvice/StatusTimeline';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';
import { SecondaryButton } from '../../components/legalAdvice/SecondaryButton';

export default function TrackConsultationScreen({ navigation, route }) {
  const bookingData = route?.params?.bookingData || {
    requestId: 'LEG-2026-8492',
    selectedType: { title: 'Audio Consultation' },
    selectedMatter: { title: 'Property Law' },
    scheduledTime: 'Tomorrow, 10:30 AM',
    lawyer: {
      name: 'Adv. Rajesh Kumar',
      title: 'Senior Supreme Court Advocate',
      experience: '15+ Years Exp.',
      rating: '4.9',
      reviewsCount: '340+',
      avatarUri: 'https://i.pravatar.cc/150?img=11',
    },
  };

  const handleJoin = () => {
    Alert.alert(
      'Join Consultation',
      'Connecting to secure encrypted audio/video channel with Adv. Rajesh Kumar...',
      [
        {
          text: 'Complete Demo Consultation',
          onPress: () => navigation.navigate('ConsultationCompleted', { bookingData }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule Request', 'Your advocate will be notified for slot rescheduling.');
  };

  const handleSupport = () => {
    Alert.alert('Client Support', 'Connected to 24/7 client helpline.');
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <LogoHeader title="Track Consultation" onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* STATUS HEADER CARD */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.idContainer}>
                <Text style={styles.idLabel}>Request ID</Text>
                <Text style={styles.idText}>#{bookingData.requestId}</Text>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.statusBadgeText}>Scheduled</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.meetingDetailRow}>
              <Ionicons name="calendar-outline" size={18} color={LEGAL_THEME.colors.primaryGold} />
              <Text style={styles.meetingTimeText}>{bookingData.scheduledTime}</Text>
            </View>

            <View style={styles.meetingDetailRow}>
              <Ionicons name="hardware-chip-outline" size={18} color={LEGAL_THEME.colors.primaryGold} />
              <Text style={styles.meetingTypeText}>{bookingData.selectedType?.title || 'Audio Consultation'} • High Priority</Text>
            </View>
          </View>

          {/* ADVOCATE CARD */}
          <Text style={styles.sectionTitle}>Your Assigned Advocate</Text>
          <LawyerCard
            name={bookingData.lawyer?.name}
            title={bookingData.lawyer?.title}
            experience={bookingData.lawyer?.experience}
            rating={bookingData.lawyer?.rating}
            reviewsCount={bookingData.lawyer?.reviewsCount}
            avatarUri={bookingData.lawyer?.avatarUri}
            onContact={() => Alert.alert('Chat Initiated', 'Opening encrypted chat window with advocate...')}
          />

          {/* TIMELINE */}
          <StatusTimeline activeIndex={2} />

          {/* PRE-CONSULTATION NOTES / CHECKLIST */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="information-circle-outline" size={20} color={LEGAL_THEME.colors.primaryGold} />
              <Text style={styles.notesTitle}>Pre-Consultation Checklist</Text>
            </View>
            <View style={styles.notesDivider} />
            <Text style={styles.bulletText}>• Ensure your phone/device has stable internet connectivity.</Text>
            <Text style={styles.bulletText}>• Keep relevant legal documents and property deeds handy.</Text>
            <Text style={styles.bulletText}>• Prepare key questions you want the advocate to address.</Text>
          </View>
        </ScrollView>

        {/* BOTTOM BUTTONS */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title="Join Consultation Now"
            onPress={handleJoin}
            icon={<Ionicons name="call" size={18} color={LEGAL_THEME.colors.white} />}
          />

          <View style={styles.secondaryRow}>
            <SecondaryButton
              title="Reschedule"
              onPress={handleReschedule}
              style={styles.halfBtn}
            />
            <SecondaryButton
              title="Contact Support"
              onPress={handleSupport}
              style={styles.halfBtn}
            />
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LEGAL_THEME.colors.white,
  },
  scrollContent: {
    paddingHorizontal: LEGAL_THEME.spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 160,
  },
  statusCard: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFFCF8',
    borderColor: LEGAL_THEME.colors.primaryGold,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idContainer: {},
  idLabel: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
  },
  idText: {
    fontSize: 16,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  cardDivider: {
    height: 1,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 12,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  meetingTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  meetingTypeText: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 10,
  },
  notesCard: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  notesDivider: {
    height: 1,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 10,
  },
  bulletText: {
    fontSize: 12,
    color: LEGAL_THEME.colors.secondaryText,
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LEGAL_THEME.colors.white,
    paddingHorizontal: LEGAL_THEME.spacing.screenPadding,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: LEGAL_THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    gap: 10,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
});
