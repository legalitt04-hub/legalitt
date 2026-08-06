// screens/client/FilterScreen.jsx - COMPLETE FIX
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../constants/theme';

const SPECIALIZATIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
  'Labour Law', 'Constitutional Law', 'Tax Law', 'Consumer Law', 'Cyber Law',
  'Intellectual Property', 'Banking Law', 'Environmental Law', 'Human Rights', 'Immigration Law',
];

const CITIES = [
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 
  'Rewa', 'Satna', 'Dewas', 'Katni', 'Ratlam', 'Khandwa',
];

const FilterScreen = ({ navigation, route }) => {
  const initialFilters = route?.params?.initialFilters || {
    specializations: [],
    searchMode: 'nearby', // 'nearby' or 'city'
    city: '',
    minRating: 0,
    maxFee: 5000,
    minExperience: 0,
    radius: 5,
  };

  const [searchMode, setSearchMode] = useState(initialFilters.searchMode);
  const [specializations, setSpecializations] = useState(initialFilters.specializations);
  const [city, setCity] = useState(initialFilters.city);
  const [minRating, setMinRating] = useState(initialFilters.minRating);
  const [maxFee, setMaxFee] = useState(initialFilters.maxFee);
  const [minExperience, setMinExperience] = useState(initialFilters.minExperience);
  const [radius, setRadius] = useState(initialFilters.radius);

  const handleSpecializationToggle = (spec) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter(s => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleReset = () => {
    setSearchMode('nearby');
    setSpecializations([]);
    setCity('');
    setMinRating(0);
    setMaxFee(5000);
    setMinExperience(0);
    setRadius(5);
  };

  const handleApply = () => {
    const filters = {
      specializations,
      searchMode,
      city: searchMode === 'city' ? city : '',
      minRating,
      maxFee,
      minExperience,
      radius: searchMode === 'nearby' ? radius : null,
    };
    
    if (route?.params?.onApplyFilters) {
      route.params.onApplyFilters(filters);
    }
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Advocates</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetHeaderText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Mode Selection */}
        <FilterField icon="search-outline" label="Search Mode">
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'nearby' && styles.modeButtonActive]}
              onPress={() => setSearchMode('nearby')}
            >
              <Ionicons 
                name="navigate" 
                size={20} 
                color={searchMode === 'nearby' ? '#FFFFFF' : COLORS.primary} 
              />
              <Text style={[styles.modeText, searchMode === 'nearby' && styles.modeTextActive]}>
                Nearby
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'city' && styles.modeButtonActive]}
              onPress={() => setSearchMode('city')}
            >
              <Ionicons 
                name="business" 
                size={20} 
                color={searchMode === 'city' ? '#FFFFFF' : COLORS.primary} 
              />
              <Text style={[styles.modeText, searchMode === 'city' && styles.modeTextActive]}>
                By City
              </Text>
            </TouchableOpacity>
          </View>
        </FilterField>

        {/* Radius - Only for Nearby mode */}
        {searchMode === 'nearby' && (
          <FilterField icon="navigate-outline" label={`Search Radius: ${radius}km`}>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor={COLORS.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1km</Text>
                <Text style={styles.sliderLabel}>10km</Text>
                <Text style={styles.sliderLabel}>20km</Text>
              </View>
            </View>
          </FilterField>
        )}

        {/* City Selection - Only for City mode */}
        {searchMode === 'city' && (
          <FilterField icon="business-outline" label="Select City">
            <View style={styles.chipsContainer}>
              {CITIES.map((cityName) => (
                <TouchableOpacity
                  key={cityName}
                  style={[styles.chip, city === cityName && styles.chipActive]}
                  onPress={() => setCity(city === cityName ? '' : cityName)}
                >
                  <Text style={[styles.chipText, city === cityName && styles.chipTextActive]}>
                    {cityName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FilterField>
        )}

        {/* Specializations */}
        <FilterField icon="scale-outline" label="Specializations">
          <View style={styles.chipsContainer}>
            {SPECIALIZATIONS.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[styles.chip, specializations.includes(spec) && styles.chipActive]}
                onPress={() => handleSpecializationToggle(spec)}
              >
                <Text style={[styles.chipText, specializations.includes(spec) && styles.chipTextActive]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FilterField>

        {/* Rating */}
        <FilterField icon="star-outline" label={`Minimum Rating: ${minRating === 0 ? 'Any' : minRating + '+'}`}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            value={minRating}
            onValueChange={setMinRating}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor={COLORS.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Any</Text>
            <Text style={styles.sliderLabel}>2.5★</Text>
            <Text style={styles.sliderLabel}>5★</Text>
          </View>
        </FilterField>

        {/* Fee */}
        <FilterField icon="cash-outline" label={`Maximum Fee: ₹${maxFee}`}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10000}
            step={500}
            value={maxFee}
            onValueChange={setMaxFee}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor={COLORS.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>₹0</Text>
            <Text style={styles.sliderLabel}>₹5,000</Text>
            <Text style={styles.sliderLabel}>₹10,000</Text>
          </View>
        </FilterField>

        {/* Experience */}
        <FilterField icon="briefcase-outline" label={`Experience: ${minExperience === 0 ? 'Any' : minExperience + '+ years'}`}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={30}
            step={5}
            value={minExperience}
            onValueChange={setMinExperience}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor={COLORS.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Any</Text>
            <Text style={styles.sliderLabel}>15 yrs</Text>
            <Text style={styles.sliderLabel}>30+ yrs</Text>
          </View>
        </FilterField>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButtonWrapper} onPress={handleApply}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const FilterField = ({ icon, label, children }) => (
  <View style={styles.field}>
    <View style={styles.fieldHeader}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  resetHeaderText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  field: { marginBottom: 24 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  modeContainer: { flexDirection: 'row', gap: 12 },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  modeTextActive: { color: '#FFFFFF' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },
  sliderContainer: { gap: 8 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 11, color: '#6B7280' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  resetButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  applyButtonWrapper: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  applyButton: { paddingVertical: 14, alignItems: 'center' },
  applyButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

export default FilterScreen;
