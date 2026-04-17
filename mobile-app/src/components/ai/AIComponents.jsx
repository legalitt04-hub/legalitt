import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

// ─── AI Disclaimer Banner ─────────────────────────────────────────────────────

export const AIDisclaimer = ({ compact = false }) => (
  <View style={[styles.disclaimer, compact && styles.disclaimerCompact]}>
    <Ionicons name="warning-outline" size={compact ? 14 : 16} color="#92400e" />
    <Text style={[styles.disclaimerText, compact && styles.disclaimerTextCompact]}>
      {compact
        ? 'AI info only — not legal advice'
        : 'This is AI-generated information for educational purposes only. It does NOT constitute legal advice. Please consult a qualified advocate for your specific legal situation.'}
    </Text>
  </View>
);

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

export const SuggestionChips = ({ suggestions, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.chipsRow}
  >
    {suggestions.map((s, i) => (
      <TouchableOpacity key={i} onPress={() => onSelect(s)} style={styles.chip} activeOpacity={0.75}>
        <Text style={styles.chipText}>{s}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── AI Response Card ─────────────────────────────────────────────────────────

export const AIResponseCard = ({ content, loading }) => {
  if (loading) {
    return (
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <Text style={{ fontSize: 20 }}>🤖</Text>
          <Text style={styles.aiCardTitle}>AI Legal Assistant</Text>
        </View>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.loadingDot, { opacity: 0.3 + i * 0.25 }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiCard}>
      <View style={styles.aiCardHeader}>
        <Text style={{ fontSize: 20 }}>🤖</Text>
        <Text style={styles.aiCardTitle}>AI Legal Assistant</Text>
      </View>
      <Text style={styles.aiCardContent}>{content}</Text>
      <AIDisclaimer compact />
    </View>
  );
};

// ─── FIR Category Card ────────────────────────────────────────────────────────

export const FIRCategoryCard = ({ title, sections, onSelect }) => (
  <TouchableOpacity style={styles.firCard} onPress={onSelect} activeOpacity={0.85}>
    <View style={styles.firCardHeader}>
      <Text style={styles.firCardTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </View>
    <Text style={styles.firCardSections}>Relevant sections: {sections}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: SIZES.radiusMd,
    padding: SIZES.md, borderLeftWidth: 3, borderLeftColor: '#f59e0b',
    marginVertical: SIZES.sm,
  },
  disclaimerCompact: { padding: 8, marginVertical: 4 },
  disclaimerText: { flex: 1, fontSize: SIZES.caption, color: '#92400e', lineHeight: 18 },
  disclaimerTextCompact: { fontSize: SIZES.tiny },
  chipsRow: { paddingHorizontal: SIZES.screenPadding, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusFull,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  chipText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },
  aiCard: {
    backgroundColor: '#fff', borderRadius: SIZES.radiusLg,
    padding: SIZES.lg, marginVertical: SIZES.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.md },
  aiCardTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  aiCardContent: { fontSize: SIZES.body, color: COLORS.textPrimary, lineHeight: 24 },
  loadingDots: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  firCard: {
    backgroundColor: '#fff', borderRadius: SIZES.radiusMd,
    padding: SIZES.lg, marginBottom: SIZES.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  firCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  firCardTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  firCardSections: { fontSize: SIZES.caption, color: COLORS.textMuted },
});
