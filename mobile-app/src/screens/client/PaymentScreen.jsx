// screens/client/PaymentScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const PaymentScreen = ({ navigation, route }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Get consultation fee from route params or use default
  const consultationFee = route?.params?.fee || 800;
  const platformFee = 0;
  const totalAmount = consultationFee + platformFee;

  const paymentMethods = [
    {
      id: 'upi',
      icon: 'phone-portrait-outline',
      title: 'UPI',
      subtitle: 'Pay using any UPI app',
    },
    {
      id: 'card',
      icon: 'card-outline',
      title: 'Credit/Debit Card',
      subtitle: 'Debit card or credit card',
    },
    {
      id: 'netbanking',
      icon: 'business-outline',
      title: 'Net Banking',
      subtitle: 'Net Banking',
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    // TODO: Integrate Razorpay payment gateway
    console.log('Processing payment:', {
      method: selectedMethod,
      amount: totalAmount,
    });

    // Navigate to success screen
    navigation.navigate('PaymentSuccess', {
      amount: totalAmount,
      method: selectedMethod,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Razorpay Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⚡ Razorpay</Text>
        </View>

        {/* Fee Breakdown Card */}
        <View style={styles.feeCard}>
          <FeeRow label="Consultation Fee" value={`₹${consultationFee}/-`} />
          <FeeRow label="Platform Fee" value={`₹${platformFee}/-`} />

          <View style={styles.divider} />

          <FeeRow label="Total" value={`₹${totalAmount}/-`} bold />
        </View>

        {/* Payment Methods Section */}
        <Text style={styles.sectionTitle}>Pay ₹{totalAmount}/-</Text>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.methodIcon}>
                <Ionicons name={method.icon} size={20} color={COLORS.primary} />
              </View>

              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>

              {selectedMethod === method.id ? (
                <View style={styles.radioSelected}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: 40 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            !selectedMethod && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.payButtonText}>Pay ₹{totalAmount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Fee Row Component
const FeeRow = ({ label, value, bold = false }) => (
  <View style={styles.feeRow}>
    <Text style={[styles.feeLabel, bold && styles.feeLabelBold]}>
      {label}
    </Text>
    <Text style={[styles.feeValue, bold && styles.feeValueBold]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  feeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  feeLabelBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  feeValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  feeValueBold: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaymentScreen;
