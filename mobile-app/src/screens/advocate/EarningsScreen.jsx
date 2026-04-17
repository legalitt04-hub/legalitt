import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatINR, formatINRShort, formatDate } from '../../utils/helpers';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Static fallback while API loads
const PLACEHOLDER_MONTHLY = MONTH_SHORT.slice(0,10).map((m,i) => ({
  month: m, total: [15000,35000,45000,30000,42000,38000,80000,25000,42000,55000][i], count: i+2,
}));
const PLACEHOLDER_TX = [
  { id:'1', description:'Consultation — Rahul Sharma', date: new Date(Date.now()-86400000*2), amount:800 },
  { id:'2', description:'Consultation — Priya Verma',  date: new Date(Date.now()-86400000*4), amount:1200 },
  { id:'3', description:'Consultation — Suresh Gupta', date: new Date(Date.now()-86400000*7), amount:800 },
];

const EarningsScreen = ({ navigation }) => {
  const [balance, setBalance]       = useState({ totalEarned:25000, available:25000, totalBookings:12 });
  const [transactions, setTx]       = useState(PLACEHOLDER_TX);
  const [monthly, setMonthly]       = useState(PLACEHOLDER_MONTHLY);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawing, setWithdraw]  = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [b, t, m] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions?limit=5'),
        api.get('/wallet/monthly-stats'),
      ]);
      setBalance(b.data.data);
      if (t.data.data?.length) setTx(t.data.data);
      if (m.data.data?.length) setMonthly(m.data.data);
    } catch { /* keep placeholders */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const handleWithdraw = () => {
    if ((balance?.available || 0) < 100) {
      Alert.alert('Insufficient Balance', 'Minimum withdrawal is ₹100.');
      return;
    }
    Alert.alert(
      'Withdraw Funds',
      `Available: ${formatINR(balance.available)}\n\nAmount will be credited to your registered bank account in 2-3 business days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: async () => {
          setWithdraw(true);
          try {
            await api.post('/wallet/withdraw', {
              amount: balance.available,
              bankAccount: 'XXXXXXXX',
              ifscCode: 'SBIN0000000',
              accountName: 'Advocate',
            });
            Alert.alert('Request Submitted', 'Funds will be credited in 2-3 business days.');
            fetchAll();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Request failed.');
          } finally { setWithdraw(false); }
        }},
      ]
    );
  };

  const maxVal = Math.max(...monthly.map(m => m.total), 1);
  const curMonth = MONTH_SHORT[new Date().getMonth()];

  if (loading) return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:4}}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Earnings</Text>
        <View style={{flexDirection:'row',gap:4}}>
          <TouchableOpacity style={{padding:6}}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={{padding:6}}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Summary */}
        <View style={s.summaryCard}>
          <View style={s.summaryTop}>
            <View style={s.iconBg}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={{flex:1,marginLeft:12}}>
              <Text style={s.summaryLabel}>Earnings Summary</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                <Text style={s.bigAmount}>{formatINR(balance.totalEarned)}</Text>
                <Text style={s.monthLabel}>Total Fund</Text>
                <View style={s.growthChip}>
                  <Ionicons name="trending-up" size={11} color={COLORS.success} />
                  <Text style={s.growthTxt}>15%</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={s.viewAllPill}>
              <Text style={s.viewAllTxt}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={s.availRow}>
            <View>
              <Text style={s.availLabel}>Available</Text>
              <Text style={s.availAmt}>{formatINR(balance.available)}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={s.availLabel}>Bookings</Text>
              <Text style={[s.availAmt,{color:COLORS.textPrimary}]}>{balance.totalBookings}</Text>
            </View>
          </View>
        </View>

        {/* Monthly bar chart */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Monthly Earnings</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </View>
          <View style={{flexDirection:'row',alignItems:'flex-end',height:100}}>
            <View style={{width:36,height:'100%',justifyContent:'space-between',paddingBottom:18,alignItems:'flex-end',paddingRight:6}}>
              <Text style={{fontSize:9,color:COLORS.textMuted}}>{formatINRShort(maxVal)}</Text>
              <Text style={{fontSize:9,color:COLORS.textMuted}}>{formatINRShort(maxVal/2)}</Text>
              <Text style={{fontSize:9,color:COLORS.textMuted}}>₹0</Text>
            </View>
            <View style={{flex:1,flexDirection:'row',alignItems:'flex-end',height:'100%'}}>
              {monthly.map((m,i) => {
                const isActive = m.month === curMonth;
                return (
                  <View key={i} style={{flex:1,alignItems:'center'}}>
                    <View style={{flex:1,width:'68%',justifyContent:'flex-end',marginBottom:2}}>
                      <View style={[
                        {width:'100%',borderRadius:3,minHeight:3},
                        {height:`${(m.total/maxVal)*100}%`},
                        isActive ? {backgroundColor:COLORS.primary} : {backgroundColor:COLORS.primaryLight},
                      ]} />
                    </View>
                    <Text style={{fontSize:8,color:isActive?COLORS.primary:COLORS.textMuted,fontWeight:isActive?'700':'400'}}>
                      {m.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Recent Payouts</Text>
          </View>
          {transactions.map((tx,i) => (
            <View key={tx.id || i} style={s.txRow}>
              <View style={s.txIconBg}>
                <Ionicons name="arrow-down-circle-outline" size={20} color={COLORS.success} />
              </View>
              <View style={{flex:1,marginLeft:12}}>
                <Text style={s.txDesc}>{tx.description}</Text>
                <Text style={s.txDate}>{formatDate(tx.date)}</Text>
              </View>
              <Text style={s.txAmt}>+{formatINR(tx.amount)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Withdraw */}
      <View style={s.footer}>
        <Button
          title="Withdrawal Funds"
          onPress={handleWithdraw}
          loading={withdrawing}
          disabled={withdrawing || (balance.available < 100)}
        />
        {balance.available < 100 && (
          <Text style={{fontSize:SIZES.caption,color:COLORS.textMuted,textAlign:'center',marginTop:6}}>
            Minimum withdrawal: ₹100
          </Text>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.backgroundGrey },
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:SIZES.screenPadding, paddingTop:52, paddingBottom:12, backgroundColor:'#fff' },
  headerTitle: { flex:1, fontSize:SIZES.subtitle, fontWeight:'800', color:COLORS.textPrimary, textAlign:'center' },
  scroll: { padding:SIZES.screenPadding, paddingBottom:120 },
  summaryCard: { backgroundColor:'#fff', borderRadius:SIZES.radiusLg, padding:SIZES.lg, ...SHADOWS.md, marginBottom:SIZES.md },
  summaryTop: { flexDirection:'row', alignItems:'flex-start', marginBottom:SIZES.lg },
  iconBg: { width:52, height:52, borderRadius:12, backgroundColor:COLORS.primaryLight, alignItems:'center', justifyContent:'center' },
  summaryLabel: { fontSize:SIZES.caption, color:COLORS.textSecondary, marginBottom:4 },
  bigAmount: { fontSize:SIZES.heading, fontWeight:'900', color:COLORS.primary },
  monthLabel: { fontSize:SIZES.caption, color:COLORS.textSecondary },
  growthChip: { flexDirection:'row', alignItems:'center', backgroundColor:'#dcfce7', borderRadius:SIZES.radiusFull, paddingHorizontal:8, paddingVertical:3, gap:2 },
  growthTxt: { fontSize:SIZES.tiny, color:COLORS.success, fontWeight:'700' },
  viewAllPill: { backgroundColor:COLORS.backgroundGrey, borderRadius:SIZES.radiusFull, paddingHorizontal:12, paddingVertical:6 },
  viewAllTxt: { fontSize:SIZES.caption, fontWeight:'700', color:COLORS.textPrimary },
  availRow: { flexDirection:'row', justifyContent:'space-between', paddingTop:SIZES.md, borderTopWidth:1, borderTopColor:COLORS.borderLight },
  availLabel: { fontSize:SIZES.caption, color:COLORS.textSecondary },
  availAmt: { fontSize:SIZES.subtitle, fontWeight:'900', color:COLORS.primary, marginTop:2 },
  card: { backgroundColor:'#fff', borderRadius:SIZES.radiusLg, padding:SIZES.lg, ...SHADOWS.sm, marginBottom:SIZES.md },
  cardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:SIZES.lg },
  cardTitle: { fontSize:SIZES.body, fontWeight:'700', color:COLORS.textPrimary },
  txRow: { flexDirection:'row', alignItems:'center', paddingVertical:SIZES.md, borderTopWidth:1, borderTopColor:COLORS.borderLight },
  txIconBg: { width:36, height:36, borderRadius:18, backgroundColor:'#dcfce7', alignItems:'center', justifyContent:'center' },
  txDesc: { fontSize:SIZES.body, fontWeight:'600', color:COLORS.textPrimary },
  txDate: { fontSize:SIZES.caption, color:COLORS.textMuted, marginTop:2 },
  txAmt: { fontSize:SIZES.body, fontWeight:'700', color:COLORS.success },
  footer: { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#fff', padding:SIZES.screenPadding, paddingBottom:36, borderTopWidth:1, borderColor:COLORS.border },
});

export default EarningsScreen;
