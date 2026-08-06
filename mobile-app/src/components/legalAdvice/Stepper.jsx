import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const Stepper = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Review & Pay' },
    { number: 3, label: 'Scheduled' },
  ];

  return (
    <View style={styles.stepperContainer}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle & Label */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.completedCircle,
                    isActive && styles.activeCircle,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={LEGAL_THEME.colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.circleText,
                        isActive && styles.activeCircleText,
                      ]}
                    >
                      {step.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    (isActive || isCompleted) && styles.activeLabel,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {/* Line connector between steps */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    step.number < currentStep && styles.completedLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    backgroundColor: LEGAL_THEME.colors.cream,
    paddingVertical: 14,
    paddingHorizontal: LEGAL_THEME.spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: LEGAL_THEME.colors.border,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: LEGAL_THEME.colors.white,
    borderWidth: 1.5,
    borderColor: LEGAL_THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    borderColor: LEGAL_THEME.colors.primaryGold,
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
  completedCircle: {
    borderColor: LEGAL_THEME.colors.darkGold,
    backgroundColor: LEGAL_THEME.colors.darkGold,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: LEGAL_THEME.colors.secondaryText,
  },
  activeCircleText: {
    color: LEGAL_THEME.colors.white,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: LEGAL_THEME.colors.secondaryText,
  },
  activeLabel: {
    color: LEGAL_THEME.colors.primaryText,
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: LEGAL_THEME.colors.border,
    marginHorizontal: 8,
  },
  completedLine: {
    backgroundColor: LEGAL_THEME.colors.primaryGold,
  },
});
