// screens/advocate/AdvocateWalletScreen.jsx
// Shows REAL wallet data: balance, earnings per booking, withdrawal history

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

const PRIMARY    = '#B89A6A';
const DARK       = '#2E2A26';
const MUTED      = '#8D7865';
const BORDER     = '#F1EDE6';
const BG         = '#FAF9F8';
const CARD       = '#FFFFFF';

const SERVICE_ICON = {
  legal_advice:       'chatbubble-ellipses-outline',
  legal_notice:       'document-text-outline',
  property_research:  'home-outline',
  document_forensic:  'search-outline',
};
const MODE_ICON = {
  chat:  'chatbubble-outline',
  voice: 'call-outline',
  video: 'videocam-outline',
};
const MODE_LABEL = { chat: 'Chat', voice: 'Voice Call', video: 'Video Call' };

const STATUS_COLOR = {
  pending:  { text: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  approved: { text: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  paid:     { text: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  rejected: { text: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
};

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
const fmtDateShort = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  : '—';

export default function AdvocateWalletScreen({ navigation }) {
  const [wallet,      setWallet]      = useState({ balance: 0, totalEarned: 0, pendingWithdrawal: 0, totalWithdrawn: 0 });
  const [bankDetails, setBankDetails] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [earnings,    setEarnings]    = useState([]);
  const [monthly,     setMonthly]     = useState([]);
  const [commRate,    setCommRate]    = useState(20);
  const [totalConsu,  setTotalConsu]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview'); // overview | earnings | history | bank

  // Withdrawal form
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount,   setWithdrawAmount]   = useState('');
  const [bankForm,         setBankForm]         = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
  const [submitting,       setSubmitting]       = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [walletRes, earningsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/earnings'),
      ]);

      const wPayload = walletRes.data?.data || {};
      const w = wPayload.wallet || {};
      setWallet({
        balance:           w.balance           ?? 0,
        totalEarned:       w.totalEarned       ?? 0,
        pendingWithdrawal: w.pendingWithdrawal ?? 0,
        totalWithdrawn:    w.totalWithdrawn    ?? 0,
      });
      setBankDetails(wPayload.bankDetails || null);
      setWithdrawals(wPayload.recentWithdrawals || []);
      setCommRate(wPayload.commissionRate || 20);
      setTotalConsu(wPayload.totalConsultations || 0);

      if (wPayload.bankDetails) {
        setBankForm({
          accountHolder: wPayload.bankDetails.accountHolder || '',
          accountNumber: wPayload.bankDetails.accountNumber || '',
          ifscCode:      wPayload.bankDetails.ifscCode      || '',
          bankName:      wPayload.bankDetails.bankName      || '',
          upiId:         wPayload.bankDetails.upiId         || '',
        });
      }

      // Earnings
      const ePayload = earningsRes.data || {};
      setEarnings(ePayload.data || []);
      setMonthly(ePayload.monthlyBreakdown || []);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveBankDetails = async () => {
    if (!bankForm.accountHolder || !bankForm.accountNumber || !bankForm.ifscCode || !bankForm.bankName) {
      return Alert.alert('Missing Fields', 'Account holder, account number, IFSC, and bank name are required.');
    }
    setSubmitting(true);
    try {
      await api.put('/wallet/bank-details', bankForm);
      Alert.alert('Saved ✓', 'Bank details saved successfully.');
      setBankDetails({ ...bankForm });
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save bank details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 500) return Alert.alert('Minimum ₹500', 'Minimum withdrawal amount is ₹500.');
    if (amount > wallet.balance)  return Alert.alert('Insufficient Balance', `Available balance: ${fmt(wallet.balance)}`);
    if (!bankDetails?.accountNumber) {
      return Alert.alert(
        'Bank Details Required',
        'Please save your bank details first.',
        [{ text: 'OK', onPress: () => setActiveTab('bank') }]
      );
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Request withdrawal of ${fmt(amount)}?\n\nBank: ${bankDetails.bankName} - ••••${bankDetails.accountNumber.slice(-4)}\n\nProcessing time: 2-3 business days`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            setSubmitting(true);
            try {
              await api.post('/wallet/withdraw', { amount });
              setWithdrawAmount('');
              setShowWithdrawForm(false);
              Alert.alert('Request Submitted ✓', 'Your withdrawal request has been submitted. Admin will process it within 2-3 business days.');
              fetchData(true);
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to submit withdrawal request.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'wallet-outline' },
    { key: 'earnings', label: 'Earnings', icon: 'trending-up-outline' },
    { key: 'history',  label: 'Withdrawals', icon: 'receipt-outline' },
    { key: 'bank',     label: 'Bank', icon: 'business-outline' },
  ];

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={DARK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)}
              style={[s.tabBtn, activeTab === t.key && s.tabBtnActive]}>
              <Ionicons name={t.icon} size={14} color={activeTab === t.key ? '#FFFFFF' : MUTED} />
              <Text style={[s.tabBtnText, activeTab === t.key && s.tabBtnTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor={PRIMARY} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Balance Hero Card */}
            <View style={s.heroCard}>
              <View style={s.heroTop}>
                <Text style={s.heroLabel}>Available Balance</Text>
                <Text style={s.heroAmount}>{fmt(wallet.balance)}</Text>
                <Text style={s.heroSub}>Ready to withdraw · {totalConsu} consultations completed</Text>
              </View>
              <View style={s.heroStats}>
                {[
                  { label: 'Total Earned',  value: wallet.totalEarned,       icon: 'trending-up' },
                  { label: 'Withdrawn',     value: wallet.totalWithdrawn,     icon: 'checkmark-circle' },
                  { label: 'Pending',       value: wallet.pendingWithdrawal,  icon: 'time' },
                ].map(stat => (
                  <View key={stat.label} style={s.heroStat}>
                    <Ionicons name={stat.icon} size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={s.heroStatValue}>{fmt(stat.value)}</Text>
                    <Text style={s.heroStatLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Withdraw Button */}
            {wallet.balance >= 500 && (
              <TouchableOpacity style={s.withdrawBtn} onPress={() => setShowWithdrawForm(!showWithdrawForm)} activeOpacity={0.88}>
                <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                <Text style={s.withdrawBtnText}>Request Withdrawal</Text>
              </TouchableOpacity>
            )}
            {wallet.balance < 500 && wallet.balance > 0 && (
              <View style={s.infoBanner}>
                <Ionicons name="information-circle-outline" size={16} color={MUTED} />
                <Text style={s.infoBannerText}>Need ₹{500 - wallet.balance} more to reach the ₹500 minimum withdrawal.</Text>
              </View>
            )}

            {/* Withdrawal Form */}
            {showWithdrawForm && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Withdrawal Amount</Text>
                <View style={s.amountRow}>
                  <Text style={s.rupee}>₹</Text>
                  <TextInput
                    style={s.amountInput}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="500"
                    placeholderTextColor="#C4B5A5"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={s.quickAmounts}>
                  {[500, 1000, 2000, 5000].filter(a => a <= wallet.balance).map(a => (
                    <TouchableOpacity key={a} onPress={() => setWithdrawAmount(String(a))}
                      style={[s.quickBtn, withdrawAmount === String(a) && s.quickBtnActive]}>
                      <Text style={[s.quickBtnText, withdrawAmount === String(a) && s.quickBtnTextActive]}>₹{a.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => setWithdrawAmount(String(wallet.balance))}
                    style={[s.quickBtn, withdrawAmount === String(wallet.balance) && s.quickBtnActive]}>
                    <Text style={[s.quickBtnText, withdrawAmount === String(wallet.balance) && s.quickBtnTextActive]}>All</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleRequestWithdrawal} disabled={submitting} activeOpacity={0.88}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Submit Request</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Monthly Chart */}
            {monthly.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Monthly Earnings</Text>
                {monthly.map((m, i) => {
                  const max = Math.max(...monthly.map(x => x.earnings), 1);
                  const pct = (m.earnings / max) * 100;
                  return (
                    <View key={i} style={s.monthRow}>
                      <Text style={s.monthLabel}>{m.month}</Text>
                      <View style={s.monthBarTrack}>
                        <View style={[s.monthBarFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={s.monthValue}>{fmt(m.earnings)}</Text>
                      <Text style={s.monthCount}>{m.count} sessions</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Commission Info */}
            <View style={[s.card, { backgroundColor: '#FDF8F2', borderColor: '#E8D5B7' }]}>
              <Text style={[s.cardTitle, { color: '#7C5C38' }]}>💡 How Earnings Work</Text>
              <Text style={s.infoLine}>• You earn {100 - commRate}% of each consultation fee</Text>
              <Text style={s.infoLine}>• Legalitt keeps {commRate}% as platform fee</Text>
              <Text style={s.infoLine}>• Earnings are credited when admin assigns you to a booking</Text>
              <Text style={s.infoLine}>• Minimum withdrawal: ₹500</Text>
              <Text style={s.infoLine}>• Processing: 2-3 business days after admin approval</Text>
            </View>
          </>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === 'earnings' && (
          <View style={{ paddingTop: 8 }}>
            {/* Summary strip */}
            <View style={[s.card, { flexDirection: 'row', gap: 0 }]}>
              {[
                { label: 'Total Earned',   value: wallet.totalEarned,  color: '#10B981' },
                { label: 'Consultations',  value: totalConsu,          color: PRIMARY, isCount: true },
                { label: 'Avg. Per Session', value: totalConsu > 0 ? Math.round(wallet.totalEarned / totalConsu) : 0, color: '#3B82F6' },
              ].map((stat, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: BORDER }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: stat.color }}>
                    {stat.isCount ? stat.value : fmt(stat.value)}
                  </Text>
                  <Text style={{ fontSize: 10, color: MUTED, fontWeight: '600', textAlign: 'center', marginTop: 2 }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {earnings.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="trending-up-outline" size={48} color="#D1C4B8" />
                <Text style={s.emptyTitle}>No Earnings Yet</Text>
                <Text style={s.emptySub}>Your earnings from bookings will appear here after admin assigns you to a consultation.</Text>
              </View>
            ) : (
              earnings.map((txn, i) => (
                <View key={txn._id || i} style={s.earningCard}>
                  {/* Left: Service icon */}
                  <View style={[s.earningIcon, { backgroundColor: PRIMARY + '15' }]}>
                    <Ionicons name={SERVICE_ICON[txn.serviceType] || 'briefcase-outline'} size={20} color={PRIMARY} />
                  </View>
                  {/* Middle: Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={s.earningClient}>{txn.clientName}</Text>
                      <View style={s.modeBadge}>
                        <Ionicons name={MODE_ICON[txn.consultationMode] || 'chatbubble-outline'} size={10} color={MUTED} />
                        <Text style={s.modeText}>{MODE_LABEL[txn.consultationMode] || txn.consultationMode}</Text>
                      </View>
                    </View>
                    <Text style={s.earningDate}>{fmtDate(txn.creditedAt)}</Text>
                    <Text style={s.earningBreakdown}>
                      {fmt(txn.grossAmount)} paid · Platform {txn.commissionRate}% = {fmt(txn.platformFee)}
                    </Text>
                  </View>
                  {/* Right: Net earning */}
                  <Text style={s.earningNet}>+{fmt(txn.netAmount)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── WITHDRAWAL HISTORY TAB ── */}
        {activeTab === 'history' && (
          <View style={{ paddingTop: 8 }}>
            {withdrawals.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="receipt-outline" size={48} color="#D1C4B8" />
                <Text style={s.emptyTitle}>No Withdrawals Yet</Text>
                <Text style={s.emptySub}>Your withdrawal requests will appear here</Text>
              </View>
            ) : withdrawals.map(w => {
              const sc = STATUS_COLOR[w.status] || STATUS_COLOR.pending;
              return (
                <View key={w._id} style={s.withdrawalCard}>
                  <View style={s.withdrawalLeft}>
                    <Text style={s.withdrawalAmount}>{fmt(w.amount)}</Text>
                    <Text style={s.withdrawalDate}>{fmtDate(w.createdAt)}</Text>
                    {w.bankDetails?.bankName && (
                      <Text style={s.withdrawalBank}>{w.bankDetails.bankName} ••••{w.bankDetails.accountNumber?.slice(-4)}</Text>
                    )}
                    {w.transactionId && <Text style={s.withdrawalTxn}>TXN: {w.transactionId}</Text>}
                    {w.adminNote && <Text style={s.withdrawalNote}>📝 {w.adminNote}</Text>}
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[s.statusText, { color: sc.text }]}>{w.status.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── BANK DETAILS TAB ── */}
        {activeTab === 'bank' && (
          <View style={{ paddingTop: 8 }}>
            <View style={s.card}>
              <Text style={s.cardTitle}>🏦 Bank & UPI Details</Text>
              <Text style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 18 }}>
                These details are used for withdrawal processing. Make sure they are correct.
              </Text>
              {[
                { key: 'accountHolder', label: 'Account Holder Name', placeholder: 'Full name as per bank' },
                { key: 'accountNumber', label: 'Account Number',      placeholder: 'Bank account number', keyType: 'number-pad' },
                { key: 'ifscCode',      label: 'IFSC Code',           placeholder: 'e.g. SBIN0001234', upper: true },
                { key: 'bankName',      label: 'Bank Name',           placeholder: 'e.g. State Bank of India' },
                { key: 'upiId',        label: 'UPI ID (Optional)',    placeholder: 'e.g. name@upi' },
              ].map(field => (
                <View key={field.key} style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={bankForm[field.key] || ''}
                    onChangeText={v => setBankForm(prev => ({ ...prev, [field.key]: field.upper ? v.toUpperCase() : v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#C4B5A5"
                    keyboardType={field.keyType || 'default'}
                  />
                </View>
              ))}
              <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSaveBankDetails} disabled={submitting} activeOpacity={0.88}>
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={s.submitBtnText}>Save Bank Details</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: BG },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: CARD, borderBottomWidth: 1, borderColor: BORDER },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F4EC', alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: 17, fontWeight: '800', color: DARK },
  tabsBar:          { backgroundColor: CARD, borderBottomWidth: 1, borderColor: BORDER, flexGrow: 0 },
  tabBtn:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F8F4EC', borderWidth: 1, borderColor: BORDER },
  tabBtnActive:     { backgroundColor: DARK, borderColor: DARK },
  tabBtnText:       { fontSize: 12, fontWeight: '700', color: MUTED },
  tabBtnTextActive: { color: '#FFFFFF' },

  heroCard: { margin: 16, borderRadius: 22, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  heroTop:  { backgroundColor: DARK, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroAmount: { color: '#FFFFFF', fontSize: 44, fontWeight: '800', marginVertical: 4 },
  heroSub:  { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  heroStats: { flexDirection: 'row', backgroundColor: PRIMARY },
  heroStat:  { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 2 },
  heroStatValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  heroStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },

  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  withdrawBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#F8F4EC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  infoBannerText: { flex: 1, fontSize: 12, color: MUTED, lineHeight: 18 },

  card: { backgroundColor: CARD, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  cardTitle: { fontSize: 14, fontWeight: '800', color: DARK, marginBottom: 14 },

  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, backgroundColor: '#F8F4EC', paddingHorizontal: 14, height: 54, marginBottom: 12 },
  rupee: { fontSize: 22, color: MUTED, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', color: DARK },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#F8F4EC' },
  quickBtnActive: { borderColor: PRIMARY, backgroundColor: PRIMARY + '15' },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: MUTED },
  quickBtnTextActive: { color: PRIMARY },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: DARK, paddingVertical: 14, borderRadius: 12, marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  monthLabel: { fontSize: 11, color: MUTED, fontWeight: '700', width: 52 },
  monthBarTrack: { flex: 1, height: 8, backgroundColor: '#F8F4EC', borderRadius: 4, overflow: 'hidden' },
  monthBarFill: { height: 8, backgroundColor: PRIMARY, borderRadius: 4 },
  monthValue: { fontSize: 12, fontWeight: '700', color: DARK, width: 64, textAlign: 'right' },
  monthCount: { fontSize: 10, color: MUTED, width: 56, textAlign: 'right' },

  infoLine: { fontSize: 12, color: '#7C5C38', lineHeight: 22 },

  earningCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  earningIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  earningClient: { fontSize: 13, fontWeight: '700', color: DARK },
  earningDate: { fontSize: 11, color: MUTED, marginBottom: 2 },
  earningBreakdown: { fontSize: 10, color: '#A8A29E' },
  earningNet: { fontSize: 17, fontWeight: '800', color: '#10B981' },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8F4EC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modeText: { fontSize: 9, fontWeight: '700', color: MUTED },

  withdrawalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  withdrawalLeft: { flex: 1 },
  withdrawalAmount: { fontSize: 18, fontWeight: '800', color: DARK },
  withdrawalDate: { fontSize: 11, color: MUTED, marginTop: 2 },
  withdrawalBank: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  withdrawalTxn: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 },
  withdrawalNote: { fontSize: 11, color: MUTED, marginTop: 2, fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginLeft: 12 },
  statusText: { fontSize: 10, fontWeight: '800' },

  fieldWrap:  { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: MUTED, marginBottom: 6 },
  fieldInput: { borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, backgroundColor: '#F8F4EC', paddingHorizontal: 14, height: 46, fontSize: 14, color: DARK },

  empty:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  emptySub:  { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
});
