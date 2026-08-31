import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { LogoHeader } from '../../components/legalAdvice/LogoHeader';
import { Stepper } from '../../components/legalAdvice/Stepper';
import { SummaryCard } from '../../components/legalAdvice/SummaryCard';
import { PaymentCard } from '../../components/legalAdvice/PaymentCard';
import { TrustBadge } from '../../components/legalAdvice/TrustBadge';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';

export default function ReviewPaymentScreen({ navigation, route }) {
  const selectedType = route?.params?.selectedType || { id: 'audio', title: 'Audio Consultation', price: '799', duration: '20 Mins' };
  const selectedMatter = route?.params?.selectedMatter || { id: 'property', title: 'Property Law' };
  const clientDetails = route?.params?.clientDetails || {
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    preferredSlot: 'Tomorrow, 10:30 AM',
    description: 'Land title dispute regarding ancestral property.',
    filesCount: 1,
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  const basePrice = parseInt(selectedType.price || '799', 10);
  const convenienceFee = 49;
  const gst = Math.round((basePrice + convenienceFee) * 0.18);
  const totalAmount = basePrice + convenienceFee + gst;

  const handlePay = () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginRegister', { role: 'client' });
      return;
    }
    // Generate request ID
    const requestId = `LEG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingData = {
      requestId,
      selectedType,
      selectedMatter,
      clientDetails,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
      scheduledTime: clientDetails.preferredSlot,
      lawyer: {
        name: 'Adv. Rajesh Kumar',
        title: 'Senior Advocate (15+ Yrs Exp.)',
        rating: '4.9',
        reviewsCount: '340+',
        avatarUri: 'https://i.pravatar.cc/150?img=11',
      },
    };

    navigation.navigate('ConsultationScheduled', { bookingData });
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <LogoHeader onBack={() => navigation.goBack()} />
      <Stepper currentStep={2} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>Review Your Request</Text>

          {/* EDITABLE REVIEW CARDS */}
          <SummaryCard
            title="Consultation Details"
            items={[
              { label: 'Type', value: selectedType.title },
              { label: 'Duration', value: selectedType.duration || '30 Mins' },
              { label: 'Scheduled Slot', value: clientDetails.preferredSlot },
            ]}
            onEdit={() => navigation.navigate('LegalAdviceLanding')}
          />

          <SummaryCard
            title="Legal Matter"
            items={[
              { label: 'Category', value: selectedMatter.title },
            ]}
            onEdit={() => navigation.navigate('LegalMatter', { selectedType })}
          />

          <SummaryCard
            title="Client Information"
            items={[
              { label: 'Name', value: clientDetails.fullName },
              { label: 'Phone', value: clientDetails.phone },
              { label: 'Email', value: clientDetails.email || 'N/A' },
              { label: 'Documents', value: `${clientDetails.filesCount || 0} Attached` },
            ]}
            onEdit={() => navigation.goBack()}
          />

          {/* PAYMENT SUMMARY */}
          <View style={styles.paymentSummaryCard}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Consultation Fee ({selectedType.title})</Text>
              <Text style={styles.summaryValue}>₹{basePrice}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform & Convenience Fee</Text>
              <Text style={styles.summaryValue}>₹{convenienceFee}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{gst}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>

          {/* PAYMENT METHOD SELECTOR */}
          <Text style={styles.sectionHeader}>Select Payment Method</Text>

          <PaymentCard
            id="upi"
            title="UPI Payment"
            subtitle="Google Pay, PhonePe, Paytm, BHIM"
            iconName="qr-code-outline"
            isSelected={selectedPaymentMethod === 'upi'}
            onSelect={setSelectedPaymentMethod}
          />

          <PaymentCard
            id="card"
            title="Credit / Debit Card"
            subtitle="Visa, Mastercard, RuPay, Maestro"
            iconName="card-outline"
            isSelected={selectedPaymentMethod === 'card'}
            onSelect={setSelectedPaymentMethod}
          />

          <PaymentCard
            id="netbanking"
            title="Net Banking"
            subtitle="HDFC, ICICI, SBI, Axis & all major banks"
            iconName="business-outline"
            isSelected={selectedPaymentMethod === 'netbanking'}
            onSelect={setSelectedPaymentMethod}
          />

          {/* TRUST BADGE FOOTER ROW */}
          <TrustBadge />
        </ScrollView>

        {/* BOTTOM PROCEED BUTTON */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title={`Pay ₹${totalAmount} & Confirm Booking`}
            onPress={handlePay}
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
    paddingTop: 16,
    paddingBottom: 110,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 12,
    marginTop: 4,
  },
  paymentSummaryCard: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginVertical: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: LEGAL_THEME.colors.primaryText,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryGold,
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
  },
});
