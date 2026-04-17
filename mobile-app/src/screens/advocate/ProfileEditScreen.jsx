import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advocateAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, SIZES } from '../../constants/theme';

const SPECIALIZATIONS = ['Criminal Law','Civil Law','Family Law','Property Law','Corporate Law','Labour Law','Tax Law','Consumer Law','Cyber Law','Constitutional Law'];

const ProfileEditScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    barCouncilNumber: '',
    experience: '',
    consultationFee: '',
    followUpFee: '',
    about: '',
    city: '',
    state: '',
    specializations: [],
    languages: ['Hindi', 'English'],
  });

  useEffect(() => {
    advocateAPI.getMyProfile()
      .then(({ data }) => {
        const a = data.data;
        setForm({
          barCouncilNumber: a.barCouncilNumber || '',
          experience: String(a.experience || ''),
          consultationFee: String(a.consultationFee || ''),
          followUpFee: String(a.followUpFee || ''),
          about: a.about || '',
          city: a.location?.address?.city || '',
          state: a.location?.address?.state || 'Madhya Pradesh',
          specializations: a.specializations || [],
          languages: a.languages || ['Hindi', 'English'],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const toggleSpec = (spec) => {
    setForm(p => ({
      ...p,
      specializations: p.specializations.includes(spec)
        ? p.specializations.filter(s => s !== spec)
        : [...p.specializations, spec],
    }));
  };

  const handleSave = async () => {
    if (!form.barCouncilNumber || !form.experience || !form.consultationFee) {
      Alert.alert('Required', 'Bar council number, experience and fee are required.');
      return;
    }
    setSaving(true);
    try {
      await advocateAPI.upsertProfile({
        barCouncilNumber: form.barCouncilNumber,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        followUpFee: Number(form.followUpFee) || 0,
        about: form.about,
        specializations: form.specializations,
        languages: form.languages,
        location: {
          type: 'Point',
          coordinates: [79.9864, 23.1815],
          address: { city: form.city, state: form.state },
        },
      });
      Alert.alert('Saved', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 120 }}>
        <Input label="Bar Council Number *" value={form.barCouncilNumber} onChangeText={set('barCouncilNumber')} placeholder="e.g. MP/1234/2020" />
        <Input label="Years of Experience *" value={form.experience} onChangeText={set('experience')} keyboardType="number-pad" placeholder="e.g. 10" />
        <Input label="Consultation Fee (₹) *" value={form.consultationFee} onChangeText={set('consultationFee')} keyboardType="number-pad" placeholder="e.g. 800" />
        <Input label="Follow-up Fee (₹)" value={form.followUpFee} onChangeText={set('followUpFee')} keyboardType="number-pad" placeholder="e.g. 200" />
        <Input label="City" value={form.city} onChangeText={set('city')} placeholder="e.g. Jabalpur" />
        <Input label="About" value={form.about} onChangeText={set('about')} multiline numberOfLines={4} placeholder="Describe your expertise..." />

        <Text style={styles.sectionLabel}>Specializations</Text>
        <View style={styles.specsGrid}>
          {SPECIALIZATIONS.map(spec => (
            <TouchableOpacity
              key={spec}
              onPress={() => toggleSpec(spec)}
              style={[styles.specChip, form.specializations.includes(spec) && styles.specChipActive]}
            >
              <Text style={[styles.specText, form.specializations.includes(spec) && styles.specTextActive]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={{ position:'absolute', bottom:0, left:0, right:0, padding:SIZES.screenPadding, paddingBottom:36, backgroundColor:'#fff', borderTopWidth:1, borderColor:'#e5e7eb' }}>
        <Button title="Save Profile" onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:SIZES.screenPadding, paddingTop:52, paddingBottom:12, borderBottomWidth:1, borderColor:'#e5e7eb' },
  title: { fontSize:SIZES.subtitle, fontWeight:'800', color:COLORS.textPrimary },
  sectionLabel: { fontSize:SIZES.body, fontWeight:'700', color:COLORS.textPrimary, marginBottom:SIZES.sm, marginTop:SIZES.sm },
  specsGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:SIZES.xl },
  specChip: { paddingHorizontal:12, paddingVertical:8, borderRadius:SIZES.radiusFull, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:'#fff' },
  specChipActive: { borderColor:COLORS.primary, backgroundColor:COLORS.primaryLight },
  specText: { fontSize:SIZES.caption, color:COLORS.textSecondary, fontWeight:'600' },
  specTextActive: { color:COLORS.primary },
});

export default ProfileEditScreen;
