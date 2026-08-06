import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatINR } from '../../utils/helpers';

const EarningsSummary = ({ summary }) => {
  const daily = summary?.daily || 0;
  const weekly = summary?.weekly || 0;
  const monthly = summary?.monthly || 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Earnings Breakdown</Text>
      </View>

      <View style={styles.row}>
        {/* Daily */}
        <View style={styles.col}>
          <Text style={styles.label}>Today</Text>
          <Text style={styles.amount}>{formatINR(daily)}</Text>
          <View style={styles.indicatorBg}>
            <View style={[styles.indicator, { width: daily > 0 ? '100%' : '15%', backgroundColor: COLORS.primary }]} />
          </View>
        </View>

        {/* Weekly */}
        <View style={[styles.col, styles.borderCol]}>
          <Text style={styles.label}>This Week</Text>
          <Text style={styles.amount}>{formatINR(weekly)}</Text>
          <View style={styles.indicatorBg}>
            <View style={[styles.indicator, { width: weekly > 0 ? '100%' : '15%', backgroundColor: '#3B82F6' }]} />
          </View>
        </View>

        {/* Monthly */}
        <View style={styles.col}>
          <Text style={styles.label}>This Month</Text>
          <Text style={styles.amount}>{formatINR(monthly)}</Text>
          <View style={styles.indicatorBg}>
            <View style={[styles.indicator, { width: monthly > 0 ? '100%' : '15%', backgroundColor: '#10B981' }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  borderCol: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  indicatorBg: {
    width: '70%',
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 2,
  },
});

export default EarningsSummary;
