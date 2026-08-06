import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const StatusTimeline = ({ activeIndex = 2 }) => {
  const steps = [
    { title: 'Submitted', subtitle: 'Request details received', icon: 'document-text-outline' },
    { title: 'Paid', subtitle: 'Payment confirmed', icon: 'card-outline' },
    { title: 'Scheduled', subtitle: 'Slot confirmed with advocate', icon: 'calendar-outline' },
    { title: 'Completed', subtitle: 'Consultation & notes ready', icon: 'checkmark-done-circle-outline' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultation Timeline</Text>

      <View style={styles.timelineList}>
        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <View key={idx} style={styles.itemRow}>
              {/* Left Circle & Connecting Line */}
              <View style={styles.indicatorCol}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.doneCircle,
                    isCurrent && styles.currentCircle,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color={LEGAL_THEME.colors.white} />
                  ) : (
                    <View style={styles.dot} />
                  )}
                </View>

                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.verticalLine,
                      idx < activeIndex && styles.doneLine,
                    ]}
                  />
                )}
              </View>

              {/* Right Details */}
              <View style={styles.contentCol}>
                <Text
                  style={[
                    styles.stepTitle,
                    isDone && styles.doneStepTitle,
                    isCurrent && styles.currentStepTitle,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...LEGAL_THEME.cards.container,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: LEGAL_THEME.colors.primaryText,
    marginBottom: 14,
  },
  timelineList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LEGAL_THEME.colors.white,
    borderWidth: 1.5,
    borderColor: LEGAL_THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  doneCircle: {
    backgroundColor: LEGAL_THEME.colors.darkGold,
    borderColor: LEGAL_THEME.colors.darkGold,
  },
  currentCircle: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
    borderColor: LEGAL_THEME.colors.primaryGold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LEGAL_THEME.colors.secondaryText,
  },
  verticalLine: {
    width: 2,
    height: 28,
    backgroundColor: LEGAL_THEME.colors.border,
    marginVertical: 2,
  },
  doneLine: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LEGAL_THEME.colors.secondaryText,
  },
  doneStepTitle: {
    color: LEGAL_THEME.colors.primaryText,
  },
  currentStepTitle: {
    color: LEGAL_THEME.colors.darkGold,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 11,
    color: LEGAL_THEME.colors.secondaryText,
    marginTop: 2,
  },
});
