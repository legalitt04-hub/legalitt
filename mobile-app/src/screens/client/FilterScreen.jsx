// screens/client/FilterScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../constants/theme';

const FilterScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [problemArea, setProblemArea] = useState('Property Search Report');
  const [language, setLanguage] = useState('Select');
  const [feeRange, setFeeRange] = useState(50);

  const problemAreas = [
    'Property Search Report',
    'Criminal Defense',
    'Civil Dispute',
  ];

  const handleReset = () => {
    setLocation('');
    setProblemArea('Property Search Report');
    setLanguage('Select');
    setFeeRange(50);
  };

  const handleApply = () => {
    // TODO: Apply filters and navigate back with filter params
    const filters = {
      location,
      problemArea,
      language,
      feeRange,
    };
    console.log('Applying filters:', filters);
    navigation.goBack();
  };

  const getFeeLabel = (value) => {
    if (value < 33) return 'Low';
    if (value < 66) return 'Medium';
    return 'High';
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
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Field */}
        <FilterField
          icon="location-outline"
          label="Location"
        >
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search-outline"
              size={14}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Location"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </FilterField>

        {/* Problem Area Field */}
        <FilterField
          icon="scale-outline"
          label="Problem Area"
        >
          <View style={styles.radioGroup}>
            {problemAreas.map((problem) => (
              <TouchableOpacity
                key={problem}
                style={styles.radioOption}
                onPress={() => setProblemArea(problem)}
                activeOpacity={0.7}
              >
                <View style={styles.radioCircle}>
                  {problemArea === problem && (
                    <View style={styles.radioCircleInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{problem}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FilterField>

        {/* Language Field */}
        <FilterField
          icon="language-outline"
          label="Language"
        >
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={language}
              onValueChange={(value) => setLanguage(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="Select" />
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Hindi" value="Hindi" />
              <Picker.Item label="Marathi" value="Marathi" />
              <Picker.Item label="Gujarati" value="Gujarati" />
            </Picker>
          </View>
        </FilterField>

        {/* Fees Range Field */}
        <FilterField
          icon="cash-outline"
          label="Fees Range"
        >
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={feeRange}
              onValueChange={setFeeRange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={COLORS.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Low</Text>
              <Text style={styles.sliderLabel}>Medium</Text>
              <Text style={styles.sliderLabel}>High</Text>
            </View>
            <Text style={styles.sliderValue}>
              Selected: {getFeeLabel(feeRange)}
            </Text>
          </View>
        </FilterField>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: 40 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButtonWrapper}
            onPress={handleApply}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark || '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Filter Field Component
const FilterField = ({ icon, label, children }) => (
  <View style={styles.field}>
    <View style={styles.fieldHeader}>
      <Ionicons name={icon} size={14} color={COLORS.primary} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
    {children}
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    height: 44,
    justifyContent: 'center',
  },
  picker: {
    height: 44,
  },
  sliderContainer: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    padding: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F0FDFA',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  applyButtonWrapper: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  applyButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterScreen;
