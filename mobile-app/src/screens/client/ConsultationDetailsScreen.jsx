import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { LogoHeader } from '../../components/legalAdvice/LogoHeader';
import { Stepper } from '../../components/legalAdvice/Stepper';
import { InputField } from '../../components/legalAdvice/InputField';
import { TextArea } from '../../components/legalAdvice/TextArea';
import { UploadCard } from '../../components/legalAdvice/UploadCard';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function ConsultationDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const selectedType = route?.params?.selectedType || { id: 'audio', title: 'Audio Consultation', price: '799' };
  const selectedMatter = route?.params?.selectedMatter || { id: 'property', title: 'Property Law' };

  const [fullName, setFullName] = useState(user?.name || user?.user?.name || '');
  const [phone, setPhone] = useState(user?.phone || user?.user?.phone || '');
  const [email, setEmail] = useState(user?.email || user?.user?.email || '');
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow, 10:30 AM');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const timeSlots = [
    'Today, 4:00 PM',
    'Today, 6:30 PM',
    'Tomorrow, 10:30 AM',
    'Tomorrow, 3:00 PM',
  ];

  const handlePickFile = () => {
    // Simulate document picker addition
    const newFile = {
      name: `Legal_Doc_${uploadedFiles.length + 1}.pdf`,
      size: '1.4 MB',
      type: 'pdf',
    };
    setUploadedFiles([...uploadedFiles, newFile]);
  };

  const handleRemoveFile = (index) => {
    const updated = uploadedFiles.filter((_, idx) => idx !== index);
    setUploadedFiles(updated);
  };

  const handleContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required Field', 'Please enter your phone number.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      Alert.alert('Details Required', 'Please provide a brief description of your legal concern (min 10 characters).');
      return;
    }

    const clientDetails = {
      fullName,
      phone,
      email,
      preferredSlot,
      description,
      filesCount: uploadedFiles.length,
    };

    navigation.navigate('ReviewPayment', {
      selectedType,
      selectedMatter,
      clientDetails,
    });
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <LogoHeader onBack={() => navigation.goBack()} />
      <Stepper currentStep={1} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Tell Us About Your Legal Concern</Text>
            <Text style={styles.heroSubtitle}>
              Providing accurate details helps us assign the best advocate specialized in {selectedMatter.title}.
            </Text>
          </View>

          {/* FORM FIELDS */}
          <View style={styles.formContainer}>
            <InputField
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Rahul Sharma"
              required
            />

            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              required
            />

            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rahul@example.com"
              keyboardType="email-address"
            />

            {/* PREFERRED TIME SLOT SELECTOR */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotLabel}>Preferred Consultation Slot *</Text>
              <View style={styles.slotsRow}>
                {timeSlots.map((slot, idx) => {
                  const isSelected = preferredSlot === slot;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.slotChip, isSelected && styles.selectedSlotChip]}
                      onPress={() => setPreferredSlot(slot)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={isSelected ? LEGAL_THEME.colors.white : LEGAL_THEME.colors.secondaryText}
                      />
                      <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* DESCRIPTION FIELD */}
            <TextArea
              label="Describe Your Legal Matter"
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe the facts of your case, key dates, or specific questions you want the advocate to answer..."
              maxLength={500}
              required
            />

            {/* UPLOAD SECTION */}
            <UploadCard
              files={uploadedFiles}
              onPickFile={handlePickFile}
              onRemoveFile={handleRemoveFile}
            />
          </View>
        </ScrollView>

        {/* BOTTOM ACTION & PRIVACY FOOTER */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title="Proceed to Review & Pay"
            onPress={handleContinue}
          />

          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={12} color={LEGAL_THEME.colors.secondaryText} />
            <Text style={styles.privacyText}>
              Your information is end-to-end encrypted and kept strictly confidential.
            </Text>
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
    paddingBottom: 130,
  },
  heroCard: {
    backgroundColor: LEGAL_THEME.colors.cream,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    padding: 16,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: LEGAL_THEME.colors.secondaryText,
    lineHeight: 17,
  },
  formContainer: {
    marginBottom: 10,
  },
  slotContainer: {
    marginBottom: 16,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LEGAL_THEME.colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedSlotChip: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
    borderColor: LEGAL_THEME.colors.primaryGold,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: LEGAL_THEME.colors.secondaryText,
  },
  selectedSlotText: {
    color: LEGAL_THEME.colors.white,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LEGAL_THEME.colors.white,
    paddingHorizontal: LEGAL_THEME.spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: LEGAL_THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  privacyText: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
  },
});
