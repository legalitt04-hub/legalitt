// FIRDraftScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, SIZES } from '../../constants/theme';

export const FIRDraftScreen = ({ navigation }) => {
  const [form, setForm] = useState({ incident: '', date: '', location: '', complainantName: '', accusedDescription: '' });
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!form.incident.trim()) { Alert.alert('Required', 'Describe the incident.'); return; }
    setLoading(true);
    try {
      const { data } = await aiAPI.firDraft(form);
      setDraft(data.data.draft);
    } catch { Alert.alert('Error', 'Could not generate draft.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={st.title}>FIR Draft Generator</Text>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 100 }}>
        <View style={st.aiNote}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={st.aiNoteText}>AI-generated draft. Always review with a lawyer before submission.</Text>
        </View>
        <Input label="Incident Description *" placeholder="Describe what happened..." value={form.incident} onChangeText={set('incident')} multiline numberOfLines={4} />
        <Input label="Date of Incident" placeholder="e.g. 15 Jan 2025" value={form.date} onChangeText={set('date')} />
        <Input label="Location" placeholder="Full address of incident" value={form.location} onChangeText={set('location')} />
        <Input label="Your Name" placeholder="Complainant name" value={form.complainantName} onChangeText={set('complainantName')} />
        <Input label="Accused Description" placeholder="Name, appearance, relationship..." value={form.accusedDescription} onChangeText={set('accusedDescription')} multiline numberOfLines={3} />
        <Button title={loading ? 'Generating...' : 'Generate FIR Draft'} onPress={generate} loading={loading} />
        {draft ? (
          <View style={st.draftBox}>
            <Text style={st.draftTitle}>Generated FIR Draft</Text>
            <Text style={st.draftText}>{draft}</Text>
          </View>
        ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  aiNote: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.xl, gap: 8 },
  aiNoteText: { flex: 1, fontSize: SIZES.caption, color: COLORS.primary, lineHeight: 18 },
  draftBox: { marginTop: SIZES.xl, backgroundColor: COLORS.backgroundGrey, borderRadius: SIZES.radiusMd, padding: SIZES.lg },
  draftTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.md },
  draftText: { fontSize: SIZES.caption, color: COLORS.textPrimary, lineHeight: 20 },
});

export default FIRDraftScreen;
