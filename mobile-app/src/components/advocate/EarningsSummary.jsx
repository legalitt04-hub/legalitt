// components/advocate/EarningsSummary.jsx
// Shows real earnings (daily/weekly/monthly) + live wallet balance from API

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatINR } from '../../utils/helpers';

const PRIMARY = '#B89A6A';
const DARK    = '#2E2A26';
const MUTED   = '#8D7865';
const BORDER  = '#F1EDE6';

const EarningsSummary = ({ summary, onWalletPress }) => {
  const daily   = summary?.daily             || 0;
  const weekly  = summary?.weekly            || 0;
  const monthly = summary?.monthly           || 0;
  const total   = summary?.totalEarned       || 0;
  const balance = summary?.availableBalance  || 0;
  const consultations = summary?.totalConsultations || 0;

  const maxPeriod = Math.max(daily, weekly, monthly, 1);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconBg}>
          <Ionicons name="trending-up" size={18} color={PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Earnings Overview</Text>
          <Text style={s.subtitle}>Net after platform commission</Text>
        </View>
        {onWalletPress && (
          <TouchableOpacity onPress={onWalletPress} style={s.walletBtn}>
            <Ionicons name="wallet-outline" size={14} color={PRIMARY} />
            <Text style={s.walletBtnText}>Wallet</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wallet Balance Hero */}
      <View style={s.balanceRow}>
        <View style={s.balanceStat}>
          <Text style={s.balanceLabel}>Available Balance</Text>
          <Text style={s.balanceValue}>{formatINR(balance)}</Text>
        </View>
        <View style={[s.balanceStat, s.balanceStatBorder]}>
          <Text style={s.balanceLabel}>Total Earned</Text>
          <Text style={[s.balanceValue, { color: '#10B981' }]}>{formatINR(total)}</Text>
        </View>
        <View style={s.balanceStat}>
          <Text style={s.balanceLabel}>Sessions</Text>
          <Text style={[s.balanceValue, { color: '#3B82F6' }]}>{consultations}</Text>
        </View>
      </View>

      <View style={s.divider} />

      {/* Period breakdown bars */}
      <Text style={s.periodTitle}>Period Breakdown</Text>
      <View style={s.periodRow}>
        {[
          { label: 'Today',      value: daily,   color: PRIMARY,    icon: 'sunny-outline' },
          { label: 'This Week',  value: weekly,  color: '#3B82F6',  icon: 'calendar-outline' },
          { label: 'This Month', value: monthly, color: '#10B981',  icon: 'stats-chart-outline' },
        ].map((item, i) => {
          const pct = maxPeriod > 0 ? Math.max((item.value / maxPeriod) * 100, item.value > 0 ? 10 : 4) : 4;
          return (
            <View key={i} style={s.periodCol}>
              <Ionicons name={item.icon} size={14} color={item.color} style={{ marginBottom: 4 }} />
              <Text style={s.periodLabel}>{item.label}</Text>
              <Text style={[s.periodAmount, { color: item.value > 0 ? DARK : MUTED }]}>
                {formatINR(item.value)}
              </Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${pct}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 14, fontWeight: '800', color: DARK },
  subtitle: { fontSize: 10, color: MUTED, marginTop: 1 },
  walletBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PRIMARY + '12',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  walletBtnText: { fontSize: 11, fontWeight: '700', color: PRIMARY },

  balanceRow: { flexDirection: 'row', marginBottom: 14 },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: BORDER },
  balanceLabel: { fontSize: 10, color: MUTED, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 },
  balanceValue: { fontSize: 16, fontWeight: '800', color: DARK },

  divider: { height: 1, backgroundColor: BORDER, marginBottom: 12 },
  periodTitle: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  periodRow: { flexDirection: 'row', gap: 0 },
  periodCol: { flex: 1, alignItems: 'center' },
  periodLabel: { fontSize: 10, fontWeight: '600', color: MUTED, marginBottom: 3 },
  periodAmount: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  barTrack: { width: '80%', height: 5, backgroundColor: '#F8F4EC', borderRadius: 3, overflow: 'hidden' },
  barFill:  { height: 5, borderRadius: 3 },
});

export default EarningsSummary;
