import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const ROLES = [
  { id: 'client', label: 'User', desc: 'Get Legal Services', icon: 'person' },
  { id: 'advocate', label: 'Lawyer', desc: 'Offer Legal Services', icon: 'briefcase' },
];

const RoleSelectScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(null);
  const { updateUser } = useAuth();

  const handleNext = () => {
    if (!selected) {
      Alert.alert('Select Role', 'Please choose your role to continue.');
      return;
    }
    // Update role in AuthContext — AppNavigator watches user.role and switches stacks automatically
    updateUser({ role: selected });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.inner}>
        {ROLES.map((role) => {
          const isSelected = selected === role.id;
          return (
            <TouchableOpacity
              key={role.id}
              onPress={() => setSelected(role.id)}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBg, isSelected && styles.iconBgSelected]}>
                <Ionicons name={role.icon} size={28} color={isSelected ? COLORS.primary : COLORS.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{role.label}</Text>
                <Text style={styles.cardDesc}>{role.desc}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.textBlock}>
          <Text style={styles.heading}>Choose Your Role</Text>
          <Text style={styles.subheading}>You Have To Choose Your Role What is Your Profession</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Next" onPress={handleNext} disabled={!selected} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: SIZES.screenPadding, paddingTop: 80 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: SIZES.radiusLg, padding: SIZES.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: SIZES.md, backgroundColor: '#fff',
    ...SHADOWS.sm,
  },
  cardSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  iconBg: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginRight: SIZES.md,
  },
  iconBgSelected: { backgroundColor: COLORS.primaryLight },
  cardText: { flex: 1 },
  cardTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  cardTitleSelected: { color: COLORS.textPrimary },
  cardDesc: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 2 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  textBlock: { marginTop: 32, alignItems: 'center' },
  heading: { fontSize: SIZES.hero, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },
  subheading: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  footer: { padding: SIZES.screenPadding, paddingBottom: 40 },
  navyBtn: {
    backgroundColor: '#1a2e6b',
    borderRadius: 32, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  navyBtnDisabled: { backgroundColor: '#9ca3af' },
  navyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default RoleSelectScreen;
