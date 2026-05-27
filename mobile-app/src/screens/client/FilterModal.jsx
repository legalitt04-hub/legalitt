// screens/client/FilterModal.jsx - NO SLIDER, SIMPLE BUTTONS
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const SPECIALIZATIONS = [
  'Criminal Law',
  'Civil Law',
  'Family Law',
  'Corporate Law',
  'Property Law',
  'Tax Law',
  'Labour Law',
  'Cyber Law',
  'Consumer Law',
  'Banking Law',
  'Constitutional Law',
  'Environmental Law',
  'Immigration Law',
  'Intellectual Property',
];

const MP_CITIES = [
  'Indore',
  'Bhopal',
  'Jabalpur',
  'Gwalior',
  'Ujjain',
  'Sagar',
  'Dewas',
  'Satna',
  'Ratlam',
  'Rewa',
];

const FilterModal = ({ visible, onClose, onApplyFilters, onShowOnMap, initialFilters }) => {
  const [selectedSpecializations, setSelectedSpecializations] = useState(
    initialFilters?.specializations || []
  );
  const [selectedCity, setSelectedCity] = useState(initialFilters?.city || '');
  const [customCity, setCustomCity] = useState('');
  const [minRating, setMinRating] = useState(initialFilters?.minRating || 0);
  const [maxFee, setMaxFee] = useState(initialFilters?.maxFee || null);
  const [minExperience, setMinExperience] = useState(initialFilters?.minExperience || 0);
  const [radius, setRadius] = useState(initialFilters?.radius || 10);

  const toggleSpecialization = (spec) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const handleApply = () => {
    const cityToUse = selectedCity === 'custom' ? customCity : selectedCity;
    
    onApplyFilters({
      specializations: selectedSpecializations,
      city: cityToUse,
      minRating,
      maxFee,
      minExperience,
      radius,
    });
    onClose();
  };

  const handleShowOnMap = () => {
    const cityToUse = selectedCity === 'custom' ? customCity : selectedCity;
    
    onShowOnMap({
      specializations: selectedSpecializations,
      city: cityToUse,
      minRating,
      maxFee,
      minExperience,
      radius,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSpecializations([]);
    setSelectedCity('');
    setCustomCity('');
    setMinRating(0);
    setMaxFee(null);
    setMinExperience(0);
    setRadius(10);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Advocates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Search Radius - BUTTON STYLE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Radius</Text>
              <View style={styles.ratingContainer}>
                {[5, 10, 20, 30, 50].map((km) => (
                  <TouchableOpacity
                    key={km}
                    style={[
                      styles.radiusButton,
                      radius === km && styles.radiusButtonSelected,
                    ]}
                    onPress={() => setRadius(km)}
                  >
                    <Ionicons 
                      name="location-outline" 
                      size={16} 
                      color={radius === km ? '#FFFFFF' : COLORS.primary} 
                    />
                    <Text
                      style={[
                        styles.ratingText,
                        radius === km && styles.ratingTextSelected,
                      ]}
                    >
                      {km}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* City Filter - MP Cities Only */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>City (Madhya Pradesh)</Text>
              <View style={styles.chipsContainer}>
                <TouchableOpacity
                  style={[styles.chip, !selectedCity && styles.chipSelected]}
                  onPress={() => setSelectedCity('')}
                >
                  <Text style={[styles.chipText, !selectedCity && styles.chipTextSelected]}>
                    All Cities
                  </Text>
                </TouchableOpacity>
                
                {MP_CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.chip, selectedCity === city && styles.chipSelected]}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text style={[styles.chipText, selectedCity === city && styles.chipTextSelected]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.chip, selectedCity === 'custom' && styles.chipSelected]}
                  onPress={() => setSelectedCity('custom')}
                >
                  <Ionicons 
                    name="add-circle-outline" 
                    size={16} 
                    color={selectedCity === 'custom' ? '#FFFFFF' : COLORS.primary} 
                  />
                  <Text style={[styles.chipText, selectedCity === 'custom' && styles.chipTextSelected]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedCity === 'custom' && (
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter city name..."
                  value={customCity}
                  onChangeText={setCustomCity}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            </View>

            {/* Specializations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specializations</Text>
              <View style={styles.chipsContainer}>
                {SPECIALIZATIONS.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[styles.chip, selectedSpecializations.includes(spec) && styles.chipSelected]}
                    onPress={() => toggleSpecialization(spec)}
                  >
                    <Text style={[styles.chipText, selectedSpecializations.includes(spec) && styles.chipTextSelected]}>
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[0, 3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingButton, minRating === rating && styles.ratingButtonSelected]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Ionicons name="star" size={16} color={minRating === rating ? '#FFFFFF' : '#FCD34D'} />
                    <Text style={[styles.ratingText, minRating === rating && styles.ratingTextSelected]}>
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Experience</Text>
              <View style={styles.ratingContainer}>
                {[0, 1, 3, 5, 10].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.ratingButton, minExperience === exp && styles.ratingButtonSelected]}
                    onPress={() => setMinExperience(exp)}
                  >
                    <Text style={[styles.ratingText, minExperience === exp && styles.ratingTextSelected]}>
                      {exp === 0 ? 'Any' : `${exp}+ yrs`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Fee */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Fee</Text>
              <View style={styles.ratingContainer}>
                {[null, 500, 1000, 2000, 5000].map((fee) => (
                  <TouchableOpacity
                    key={fee || 'any'}
                    style={[styles.ratingButton, maxFee === fee && styles.ratingButtonSelected]}
                    onPress={() => setMaxFee(fee)}
                  >
                    <Text style={[styles.ratingText, maxFee === fee && styles.ratingTextSelected]}>
                      {fee === null ? 'Any' : `₹${fee}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapButton} onPress={handleShowOnMap}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.mapGradient}>
                <Ionicons name="map" size={18} color="#FFFFFF" />
                <Text style={styles.mapButtonText}>Map</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.applyGradient}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  chipTextSelected: { color: '#FFFFFF' },
  customInput: { marginTop: 12, height: 48, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  ratingContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ratingButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  ratingButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  radiusButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  radiusButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  ratingText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  ratingTextSelected: { color: '#FFFFFF' },
  footer: { flexDirection: 'row', gap: 8, padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  resetButton: { flex: 1, height: 50, borderRadius: 14, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  resetButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  mapButton: { flex: 1, height: 50, borderRadius: 14, overflow: 'hidden' },
  mapGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  applyButton: { flex: 1, height: 50, borderRadius: 14, overflow: 'hidden' },
  applyGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

export default FilterModal;
