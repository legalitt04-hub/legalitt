import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { Stepper } from '../../components/legalAdvice/Stepper';
import { LawyerCard } from '../../components/legalAdvice/LawyerCard';
import { StatusTimeline } from '../../components/legalAdvice/StatusTimeline';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';
import { SecondaryButton } from '../../components/legalAdvice/SecondaryButton';

export default function ConsultationScheduledScreen({ navigation, route }) {
  const bookingData = route?.params?.bookingData || {
    requestId: 'LEG-2026-8492',
    selectedType: { title: 'Audio Consultation' },
    selectedMatter: { title: 'Property Law' },
    scheduledTime: 'Tomorrow, 10:30 AM',
    totalAmount: 1000,
    lawyer: {
      name: 'Adv. Rajesh Kumar',
      title: 'Senior Supreme Court Advocate',
      experience: '15+ Years Exp.',
      rating: '4.9',
      reviewsCount: '340+',
      avatarUri: 'https://i.pravatar.cc/150?img=11',
    },
  };

  const handleTrackRequest = () => {
    navigation.navigate('TrackConsultation', { bookingData });
  };

  const handleBackHome = () => {
    navigation.navigate('ClientMain', { screen: 'Home' });
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <Stepper currentStep={3} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SUCCESS ANIMATED BANNER */}
          <View style={styles.successBanner}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark-sharp" size={36} color={LEGAL_THEME.colors.white} />
            </View>
            <Text style={styles.successTitle}>Consultation Scheduled Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Your request has been registered and assigned to an expert advocate.
            </Text>
          </View>

          {/* REQUEST DETAILS CARD */}
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Request ID</Text>
              <Text style={styles.detailValue}>#{bookingData.requestId}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Consultation Type</Text>
              <Text style={styles.detailValue}>{bookingData.selectedType?.title || 'Audio Consultation'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Legal Category</Text>
              <Text style={styles.detailValue}>{bookingData.selectedMatter?.title || 'Property Law'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Confirmed Date & Slot</Text>
              <Text style={styles.detailValueHighlight}>{bookingData.scheduledTime}</Text>
            </View>
          </View>

          {/* ASSIGNED LAWYER CARD */}
          <Text style={styles.sectionTitle}>Assigned Legal Expert</Text>
          <LawyerCard
            name={bookingData.lawyer?.name}
            title={bookingData.lawyer?.title}
            experience={bookingData.lawyer?.experience}
            rating={bookingData.lawyer?.rating}
            reviewsCount={bookingData.lawyer?.reviewsCount}
            avatarUri={bookingData.lawyer?.avatarUri}
            compact
          />

          {/* TIMELINE PROGRESS */}
          <StatusTimeline activeIndex={2} />
        </ScrollView>

        {/* BOTTOM BUTTONS */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title="Track Request"
            onPress={handleTrackRequest}
            style={styles.primaryBtn}
          />
          <SecondaryButton
            title="Back Home"
            onPress={handleBackHome}
            style={styles.secondaryBtn}
          />
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
    paddingTop: 20,
    paddingBottom: 130,
  },
  successBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LEGAL_THEME.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: LEGAL_THEME.colors.darkGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  detailsCard: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  detailValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: LEGAL_THEME.colors.darkGold,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 10,
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
  primaryBtn: {},
  secondaryBtn: {},
});
