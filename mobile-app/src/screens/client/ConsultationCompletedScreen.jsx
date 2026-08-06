import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { LogoHeader } from '../../components/legalAdvice/LogoHeader';
import { LawyerCard } from '../../components/legalAdvice/LawyerCard';
import { RecommendationCard } from '../../components/legalAdvice/RecommendationCard';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';
import { SecondaryButton } from '../../components/legalAdvice/SecondaryButton';

export default function ConsultationCompletedScreen({ navigation, route }) {
  const bookingData = route?.params?.bookingData || {
    requestId: 'LEG-2026-8492',
    selectedType: { title: 'Audio Consultation' },
    selectedMatter: { title: 'Property Law' },
    lawyer: {
      name: 'Adv. Rajesh Kumar',
      title: 'Senior Supreme Court Advocate',
      experience: '15+ Years Exp.',
      rating: '4.9',
      reviewsCount: '340+',
      avatarUri: 'https://i.pravatar.cc/150?img=11',
    },
  };

  const keyPoints = [
    'Reviewed title deed chain for property situated at Survey No. 42/A.',
    'Identified missing NOC from ancestral co-sharer prior to registry execution.',
    'Confirmed validity of the power of attorney executed in 2021.',
  ];

  const recommendations = [
    'File a public notice in local newspaper prior to finalizing property purchase.',
    'Obtain an encumbrance certificate (EC) for the last 30 years from Sub-Registrar.',
    'Draft a formal legal notice if seller fails to provide clear NOC within 14 days.',
  ];

  const handleDownload = () => {
    Alert.alert(
      'Download Notes',
      `Legal_Advice_Summary_${bookingData.requestId}.pdf downloaded successfully to your device storage.`
    );
  };

  const handleFollowUp = () => {
    navigation.navigate('LegalAdviceLanding');
  };

  const handleBackHome = () => {
    navigation.navigate('ClientMain', { screen: 'Home' });
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <LogoHeader title="Consultation Summary" onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TOP HERO */}
          <View style={styles.completedHeader}>
            <View style={styles.badgeCircle}>
              <Ionicons name="checkmark-circle" size={44} color={LEGAL_THEME.colors.primaryGold} />
            </View>
            <Text style={styles.completedTitle}>Consultation Completed</Text>
            <Text style={styles.completedSubtitle}>
              Your consultation for {bookingData.selectedMatter?.title || 'Property Law'} has concluded successfully.
            </Text>
          </View>

          {/* ADVOCATE CARD */}
          <Text style={styles.sectionTitle}>Consulted Advocate</Text>
          <LawyerCard
            name={bookingData.lawyer?.name}
            title={bookingData.lawyer?.title}
            experience={bookingData.lawyer?.experience}
            rating={bookingData.lawyer?.rating}
            reviewsCount={bookingData.lawyer?.reviewsCount}
            avatarUri={bookingData.lawyer?.avatarUri}
            compact
          />

          {/* KEY POINTS SUMMARY */}
          <RecommendationCard
            title="Key Discussion Points"
            items={keyPoints}
            iconName="list-outline"
          />

          {/* RECOMMENDATIONS */}
          <RecommendationCard
            title="Legal Recommendations & Next Steps"
            items={recommendations}
            iconName="shield-checkmark-outline"
          />

          {/* DOWNLOAD NOTES CARD */}
          <View style={styles.downloadCard}>
            <View style={styles.downloadLeft}>
              <View style={styles.pdfIconCircle}>
                <Ionicons name="document-text" size={24} color={LEGAL_THEME.colors.primaryGold} />
              </View>
              <View style={styles.downloadInfo}>
                <Text style={styles.pdfNameText}>Legal_Advice_Notes_{bookingData.requestId}.pdf</Text>
                <Text style={styles.pdfMetaText}>Signed by {bookingData.lawyer?.name} • 1.8 MB</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
              <Ionicons name="download-outline" size={18} color={LEGAL_THEME.colors.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title="Book Follow-up Consultation"
            onPress={handleFollowUp}
          />
          <View style={styles.secondaryRow}>
            <SecondaryButton
              title="Download Notes PDF"
              onPress={handleDownload}
              style={styles.halfBtn}
            />
            <SecondaryButton
              title="Back Home"
              onPress={handleBackHome}
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
    paddingBottom: 170,
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeCircle: {
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 10,
  },
  downloadCard: {
    ...LEGAL_THEME.cards.container,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#FFFCF8',
    borderColor: LEGAL_THEME.colors.primaryGold,
  },
  downloadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: LEGAL_THEME.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  downloadInfo: {
    flex: 1,
  },
  pdfNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
  },
  pdfMetaText: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
    marginTop: 2,
  },
  downloadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LEGAL_THEME.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
