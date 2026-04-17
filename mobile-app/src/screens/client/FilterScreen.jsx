import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SPECIALIZATIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law',
  'Corporate Law', 'Labour Law', 'Tax Law', 'Consumer Law',
];

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Punjabi'];

const FilterScreen = ({ navigation, route }) => {
  const { onApply } = route.params || {};
  const [location, setLocation] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const [feeLevel, setFeeLevel] = useState(1); // 0=low 1=medium 2=high
  const [langOpen, setLangOpen] = useState(false);

  const FEE_LEVELS = [
    { label: 'Low', value: 0, max: 500 },
    { label: 'Medium', value: 1, max: 1000 },
    { label: 'High', value: 2, max: 9999 },
  ];

  const handleApply = () => {
    const filters = {};
    if (location.trim()) filters.city = location.trim();
    if (selectedSpec) filters.specialization = selectedSpec;
    if (selectedLang) filters.language = selectedLang;
    if (feeLevel < 2) filters.maxFee = FEE_LEVELS[feeLevel].max;
    onApply?.(filters);
    navigation.goBack();
  };

  const handleReset = () => {
    setLocation('');
    setSelectedSpec(null);
    setSelectedLang(null);
    setFeeLevel(1);
    onApply?.({});
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Search Location"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Problem Area */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hammer-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Problem Area</Text>
          </View>
          <View style={styles.radioGroup}>
            {SPECIALIZATIONS.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={styles.radioItem}
                onPress={() => setSelectedSpec(selectedSpec === spec ? null : spec)}
              >
                <View style={[styles.radio, selectedSpec === spec && styles.radioSelected]}>
                  {selectedSpec === spec && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{spec}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Language</Text>
          </View>
          <TouchableOpacity style={styles.dropdown} onPress={() => setLangOpen(!langOpen)}>
            <Text style={styles.dropdownText}>{selectedLang || 'Select'}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          {langOpen && (
            <View style={styles.dropdownMenu}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedLang(lang); setLangOpen(false); }}
                >
                  <Text style={[styles.dropdownItemText, selectedLang === lang && { color: COLORS.primary, fontWeight: '700' }]}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Fees Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 18 }}>₹</Text>
            <Text style={styles.sectionTitle}>Fees Range</Text>
          </View>

          {/* Custom slider using 3 blocks */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((feeLevel + 1) / 3) * 100}%` }]} />
              {FEE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.sliderThumb,
                    { left: `${(level.value / 2) * 100}%` },
                    feeLevel === level.value && styles.sliderThumbActive,
                  ]}
                  onPress={() => setFeeLevel(level.value)}
                />
              ))}
            </View>
            <View style={styles.sliderLabels}>
              {FEE_LEVELS.map((level) => (
                <Text key={level.value} style={[styles.sliderLabel, feeLevel === level.value && styles.sliderLabelActive]}>
                  {level.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleReset}
          style={[fstyles.filterBtn, fstyles.filterBtnNavy]}
        >
          <Text style={fstyles.filterBtnNavyText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          style={[fstyles.filterBtn, fstyles.filterBtnApply]}
        >
          <Text style={fstyles.filterBtnApplyText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 40, padding: 4 },
  headerTitle: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  content: { padding: SIZES.screenPadding, paddingBottom: 120 },
  section: { marginBottom: SIZES.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md, gap: 8 },
  sectionTitle: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.textPrimary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.lg, height: 48,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary },
  radioGroup: { backgroundColor: '#fff', borderRadius: SIZES.radiusMd, ...SHADOWS.sm },
  radioItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    borderBottomWidth: 1, borderColor: COLORS.borderLight,
  },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.border, marginRight: SIZES.md,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  radioLabel: { fontSize: SIZES.body, color: COLORS.textPrimary },
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: SIZES.radiusMd, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  dropdownText: { fontSize: SIZES.body, color: COLORS.textPrimary },
  dropdownMenu: { backgroundColor: '#fff', borderRadius: SIZES.radiusMd, ...SHADOWS.md, marginTop: 4 },
  dropdownItem: { padding: SIZES.md, borderBottomWidth: 1, borderColor: COLORS.borderLight },
  dropdownItemText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  sliderContainer: { paddingTop: 20 },
  sliderTrack: {
    height: 6, backgroundColor: COLORS.border, borderRadius: 3,
    position: 'relative', marginHorizontal: 12,
  },
  sliderFill: { position: 'absolute', height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  sliderThumb: {
    position: 'absolute', top: -9, marginLeft: -12,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sliderThumbActive: { borderColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, top: -11, marginLeft: -14 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  sliderLabel: { fontSize: SIZES.body, color: COLORS.textMuted, fontWeight: '500' },
  sliderLabelActive: { color: COLORS.textPrimary, fontWeight: '800' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: '#fff',
    padding: SIZES.screenPadding, paddingBottom: 36,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
});

const fstyles = StyleSheet.create({
  filterBtn: { flex: 1, height: 56, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  filterBtnNavy: { backgroundColor: '#1a2e6b', marginRight: 12 },
  filterBtnNavyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  filterBtnApply: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary },
  filterBtnApplyText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
export default FilterScreen;
