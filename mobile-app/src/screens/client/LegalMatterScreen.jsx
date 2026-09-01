import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import SafeScreen from '../../components/SafeScreen';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';
import { LogoHeader } from '../../components/legalAdvice/LogoHeader';
import { SearchBar } from '../../components/legalAdvice/SearchBar';
import { CategoryCard } from '../../components/legalAdvice/CategoryCard';
import { PrimaryButton } from '../../components/legalAdvice/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function LegalMatterScreen({ navigation, route }) {
  const { isAuthenticated } = useAuth(); {
  const selectedType = route?.params?.selectedType || { id: 'audio', title: 'Audio Consultation', price: '799' };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 'property',
      title: 'Property Law',
      description: 'Title verification, land disputes, lease, registry & deed review',
      iconName: 'home-outline',
    },
    {
      id: 'family',
      title: 'Family Law',
      description: 'Divorce, child custody, inheritance, maintenance & adoption',
      iconName: 'people-outline',
    },
    {
      id: 'criminal',
      title: 'Criminal Law',
      description: 'Bail applications, FIR defense, criminal trials & complaints',
      iconName: 'shield-half-outline',
    },
    {
      id: 'consumer',
      title: 'Consumer Dispute',
      description: 'Defective products, service claims, e-commerce & refund disputes',
      iconName: 'cart-outline',
    },
    {
      id: 'employment',
      title: 'Employment Law',
      description: 'Wrongful termination, employment contracts, workplace grievances',
      iconName: 'briefcase-outline',
    },
    {
      id: 'cyber',
      title: 'Cyber Crime',
      description: 'Online financial fraud, identity theft, harassment & data breach',
      iconName: 'laptop-outline',
    },
    {
      id: 'corporate',
      title: 'Corporate & Business',
      description: 'Company incorporation, vendor contracts, compliance & IP rights',
      iconName: 'business-outline',
    },
    {
      id: 'civil',
      title: 'Civil Litigation',
      description: 'Money recovery, breach of contract, injunctions & civil suits',
      iconName: 'document-text-outline',
    },
  ];

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginRegister', { role: 'client' });
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Selection Required', 'Please select a legal matter to proceed with your consultation.');
      return;
    }
    navigation.navigate('ConsultationDetails', {
      selectedType,
      selectedMatter: selectedCategory,
    });
  };

  return (
    <SafeScreen backgroundColor={LEGAL_THEME.colors.white} barStyle="dark-content">
      <LogoHeader onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADING */}
          <Text style={styles.heading}>
            Select Your{' '}
            <Text style={styles.headingHighlight}>Legal Matter</Text>
          </Text>

          <Text style={styles.subheading}>
            Choose the legal category that best describes your situation for accurate lawyer matching.
          </Text>

          {/* SEARCH BAR */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search legal matters..."
          />

          {/* CATEGORIES GRID */}
          <View style={styles.gridContainer}>
            {filteredCategories.map((item) => {
              const isSelected = selectedCategory?.id === item.id;
              return (
                <CategoryCard
                  key={item.id}
                  iconName={item.iconName}
                  title={item.title}
                  description={item.description}
                  isSelected={isSelected}
                  onSelect={() => setSelectedCategory(item)}
                />
              );
            })}
          </View>

          {filteredCategories.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching legal category found.</Text>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM FIXED BUTTON */}
        <View style={styles.bottomFooter}>
          <PrimaryButton
            title={selectedCategory ? `Continue with ${selectedCategory.title}` : "Select Legal Matter"}
            onPress={handleContinue}
            disabled={!selectedCategory}
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
    paddingBottom: 100,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 6,
  },
  headingHighlight: {
    color: LEGAL_THEME.colors.darkGold,
  },
  subheading: {
    fontSize: 13,
    color: LEGAL_THEME.colors.secondaryText,
    lineHeight: 18,
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LEGAL_THEME.colors.secondaryText,
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
