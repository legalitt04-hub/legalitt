// screens/auth/RoleSelectScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const RoleSelectScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const options = [
    {
      id: 'client',
      title: 'User',
      subtitle: 'Get Legal Services',
      icon: 'person-outline',
    },
    {
      id: 'advocate',
      title: 'Lawyer',
      subtitle: 'Offer Legal Services',
      icon: 'scale-outline',
    },
  ];

  const handleNext = () => {
    if (!selectedRole) return;

    // If client selected → go to Onboarding
    // If advocate selected → go directly to LoginRegister
    if (selectedRole === 'client') {
      navigation.navigate('Onboarding', { role: selectedRole });
    } else {
      navigation.navigate('LoginRegister', { role: selectedRole });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Content */}
      <View style={styles.content}>
        {/* Role Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isActive = selectedRole === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isActive && styles.optionCardActive,
                ]}
                onPress={() => setSelectedRole(option.id)}
                activeOpacity={0.7}
              >
                {/* Icon Circle */}
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                {/* Text */}
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>

                {/* Checkmark */}
                <View
                  style={[
                    styles.checkbox,
                    isActive && styles.checkboxActive,
                  ]}
                >
                  {isActive && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Title & Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.description}>
            You Have To Choose Your Role What Is Your Profession
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedRole && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA', // Light teal background
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  nextButton: {
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
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoleSelectScreen;
