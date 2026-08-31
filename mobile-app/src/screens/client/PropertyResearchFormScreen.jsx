// screens/client/PropertyResearchFormScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_BEIGE = '#C2A98B';

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural'];
const REPORT_PURPOSES = ['Buying', 'Selling', 'Investment', 'Loan', 'Legal Verification'];

export default function PropertyResearchFormScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.user?.name || '',
    phone: user?.phone || user?.user?.phone || '',
    email: user?.email || user?.user?.email || '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    propertyType: 'Residential',
    purpose: 'Buying',
  });

  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [purposeModalVisible, setPurposeModalVisible] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginRegister', { role: 'client' });
      return;
    }
    if (!formData.fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      Alert.alert('Required Field', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Required Field', 'Please enter a valid email address.');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Required Field', 'Please enter the property address.');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Required Field', 'Please enter the city.');
      return;
    }
    if (!formData.state.trim()) {
      Alert.alert('Required Field', 'Please enter the state.');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      Alert.alert('Required Field', 'Please enter a valid 6-digit pincode.');
      return;
    }

    // Proceed to Step 2: Confirmation
    navigation.navigate('PropertyResearchConfirm', { propertyData: formData });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={[styles.navHeader, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Property Research</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 3-Step Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.stepItem}>
          <View style={[styles.stepBadge, styles.stepBadgeActive]}>
            <Text style={styles.stepBadgeTextActive}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Your Details</Text>
        </View>

        <View style={styles.stepConnectorLine} />

        <View style={styles.stepItem}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Confirmation</Text>
        </View>

        <View style={styles.stepConnectorLine} />

        <View style={styles.stepItem}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Payment</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Applicant Information */}
          <Text style={styles.sectionHeaderTitle}>Applicant Information</Text>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={PRIMARY_BEIGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={formData.fullName}
                onChangeText={(val) => updateField('fullName', val)}
              />
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={PRIMARY_BEIGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.phone}
                onChangeText={(val) => updateField('phone', val)}
              />
            </View>
          </View>

          {/* Email Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={PRIMARY_BEIGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => updateField('email', val)}
              />
            </View>
          </View>

          {/* Section: Property Information */}
          <Text style={[styles.sectionHeaderTitle, { marginTop: 12 }]}>Property Details</Text>

          {/* Property Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Property Address</Text>
            <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="location-outline" size={20} color={PRIMARY_BEIGE} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { height: 64, textAlignVertical: 'top' }]}
                placeholder="Enter complete plot/flat/property address"
                placeholderTextColor="#94A3B8"
                multiline
                value={formData.address}
                onChangeText={(val) => updateField('address', val)}
              />
            </View>
          </View>

          {/* State & City Row */}
          <View style={styles.rowTwoInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={18} color={PRIMARY_BEIGE} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="State"
                  placeholderTextColor="#94A3B8"
                  value={formData.state}
                  onChangeText={(val) => updateField('state', val)}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color={PRIMARY_BEIGE} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="City"
                  placeholderTextColor="#94A3B8"
                  value={formData.city}
                  onChangeText={(val) => updateField('city', val)}
                />
              </View>
            </View>
          </View>

          {/* Pincode Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pincode</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="pin-outline" size={20} color={PRIMARY_BEIGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="6-digit Pincode"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={formData.pincode}
                onChangeText={(val) => updateField('pincode', val)}
              />
            </View>
          </View>

          {/* Property Type Dropdown Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Property Type</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setTypeModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="home-outline" size={20} color={PRIMARY_BEIGE} />
                <Text style={styles.dropdownValueText}>{formData.propertyType}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Purpose of Report Pills/Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Purpose of Report</Text>
            <View style={styles.purposePillsContainer}>
              {REPORT_PURPOSES.map((purposeItem) => {
                const isSelected = formData.purpose === purposeItem;
                return (
                  <TouchableOpacity
                    key={purposeItem}
                    style={[styles.purposePill, isSelected && styles.purposePillActive]}
                    onPress={() => updateField('purpose', purposeItem)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.purposePillText, isSelected && styles.purposePillTextActive]}>
                      {purposeItem}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sticky Button */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Property Type Picker Modal */}
      <Modal visible={typeModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Property Type</Text>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  updateField('propertyType', type);
                  setTypeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.propertyType === type && styles.modalOptionTextActive,
                  ]}
                >
                  {type}
                </Text>
                {formData.propertyType === type && (
                  <Ionicons name="checkmark" size={20} color={PRIMARY_BEIGE} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE2',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: PRIMARY_BEIGE,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: PRIMARY_BEIGE,
    fontWeight: '700',
  },
  stepConnectorLine: {
    width: 24,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#EFEAE2',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#EFEAE2',
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  purposePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  purposePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#EFEAE2',
  },
  purposePillActive: {
    backgroundColor: PRIMARY_BEIGE,
    borderColor: PRIMARY_BEIGE,
  },
  purposePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  purposePillTextActive: {
    color: '#FFFFFF',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
    ...SHADOWS.large,
  },
  continueButton: {
    backgroundColor: PRIMARY_BEIGE,
    height: 54,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.medium,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: PRIMARY_BEIGE,
    fontWeight: '700',
  },
});
