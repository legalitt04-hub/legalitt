import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

const STATUS_COLOR = {
  pending: '#F59E0B', approved: '#3B82F6', paid: '#10B981', rejected: '#EF4444',
};

export default function AdvocateWalletScreen({ navigation }) {
  const [wallet, setWallet] = useState({ balance: 0, totalEarned: 0, pendingWithdrawal: 0, totalWithdrawn: 0 });
  const [bankDetails, setBankDetails] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Withdrawal form
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankForm, setBankForm] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');

  const fetchWallet = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/wallet');
      setWallet(data.data.wallet);
      setBankDetails(data.data.bankDetails);
      setWithdrawals(data.data.recentWithdrawals || []);
      if (data.data.bankDetails) {
        setBankForm({
          accountHolder: data.data.bankDetails.accountHolder || '',
          accountNumber: data.data.bankDetails.accountNumber || '',
          ifscCode: data.data.bankDetails.ifscCode || '',
          bankName: data.data.bankDetails.bankName || '',
          upiId: data.data.bankDetails.upiId || '',
        });
      }
    } catch (err) {
      console.error('Wallet fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

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
    if (amount > wallet.balance) return Alert.alert('Insufficient Balance', `Available balance: ₹${wallet.balance}`);
    if (!bankDetails?.accountNumber) return Alert.alert('Bank Details Required', 'Please save your bank details first before requesting a withdrawal.');

    Alert.alert(
      'Confirm Withdrawal',
      `Request withdrawal of ₹${amount.toLocaleString('en-IN')}?\n\nAmount will be transferred to:\n${bankDetails.bankName} - ••••${bankDetails.accountNumber.slice(-4)}\n\nProcessing time: 2-3 business days`,
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
              fetchWallet(true);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['wallet', 'history'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'wallet' ? '💼 Wallet' : '📋 History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWallet(true); }} tintColor={COLORS.primary} />}
      >
        {activeTab === 'wallet' ? (
          <>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceGradient}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₹{(wallet.balance || 0).toLocaleString('en-IN')}</Text>
                <Text style={styles.balanceSub}>Ready to withdraw</Text>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                {[
                  { label: 'Total Earned', value: wallet.totalEarned || 0, icon: '📈' },
                  { label: 'Withdrawn', value: wallet.totalWithdrawn || 0, icon: '🏦' },
                  { label: 'Pending', value: wallet.pendingWithdrawal || 0, icon: '⏳' },
                ].map(s => (
                  <View key={s.label} style={styles.statItem}>
                    <Text style={styles.statIcon}>{s.icon}</Text>
                    <Text style={styles.statValue}>₹{s.value.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Withdraw Button */}
            {wallet.balance >= 500 && (
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => setShowWithdrawForm(!showWithdrawForm)}
                activeOpacity={0.88}
              >
                <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                <Text style={styles.withdrawBtnText}>Request Withdrawal</Text>
              </TouchableOpacity>
            )}
            {wallet.balance < 500 && wallet.balance > 0 && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                <Text style={styles.infoBannerText}>Minimum ₹500 required to withdraw. You need ₹{500 - wallet.balance} more.</Text>
              </View>
            )}

            {/* Withdrawal Amount Form */}
            {showWithdrawForm && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="500"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.quickAmounts}>
                  {[500, 1000, 2000, 5000].filter(a => a <= wallet.balance).map(a => (
                    <TouchableOpacity key={a} onPress={() => setWithdrawAmount(String(a))}
                      style={[styles.quickBtn, withdrawAmount === String(a) && styles.quickBtnActive]}>
                      <Text style={[styles.quickBtnText, withdrawAmount === String(a) && styles.quickBtnTextActive]}>₹{a.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => setWithdrawAmount(String(wallet.balance))}
                    style={[styles.quickBtn, withdrawAmount === String(wallet.balance) && styles.quickBtnActive]}>
                    <Text style={[styles.quickBtnText, withdrawAmount === String(wallet.balance) && styles.quickBtnTextActive]}>All</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleRequestWithdrawal} disabled={submitting} activeOpacity={0.88}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Bank Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏦 Bank Details</Text>
              {[
                { key: 'accountHolder', label: 'Account Holder Name', placeholder: 'Full name as per bank' },
                { key: 'accountNumber', label: 'Account Number', placeholder: 'Bank account number', keyType: 'number-pad' },
                { key: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234', upper: true },
                { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
                { key: 'upiId', label: 'UPI ID (Optional)', placeholder: 'e.g. name@upi' },
              ].map(field => (
                <View key={field.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={bankForm[field.key] || ''}
                    onChangeText={v => setBankForm(prev => ({ ...prev, [field.key]: field.upper ? v.toUpperCase() : v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={field.keyType || 'default'}
                  />
                </View>
              ))}
              <TouchableOpacity style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSaveBankDetails} disabled={submitting} activeOpacity={0.88}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Bank Details</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* History Tab */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Withdrawal History</Text>
            {withdrawals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No withdrawals yet</Text>
                <Text style={styles.emptySubText}>Your withdrawal requests will appear here</Text>
              </View>
            ) : withdrawals.map(w => (
              <View key={w._id} style={styles.withdrawalItem}>
                <View style={styles.withdrawalLeft}>
                  <Text style={styles.withdrawalAmount}>₹{w.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.withdrawalDate}>
                    {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  {w.transactionId && <Text style={styles.withdrawalTxn}>TXN: {w.transactionId}</Text>}
                  {w.adminNote && <Text style={styles.withdrawalNote}>{w.adminNote}</Text>}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[w.status] + '20', borderColor: STATUS_COLOR[w.status] + '40' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[w.status] }]}>
                    {w.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Commission Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How Earnings Work</Text>
          <Text style={styles.infoText}>• You earn 80% of each consultation fee (Legalitt keeps 20%)</Text>
          <Text style={styles.infoText}>• Earnings credited after admin assigns the consultation to you</Text>
          <Text style={styles.infoText}>• Minimum withdrawal: ₹500</Text>
          <Text style={styles.infoText}>• Processing time: 2-3 business days after approval</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: COLORS.primary },
  scroll: { paddingBottom: 32 },
  balanceCard: {
    margin: 16, borderRadius: 20, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  balanceGradient: {
    backgroundColor: COLORS.primary, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  balanceAmount: { color: '#fff', fontSize: 42, fontWeight: '800', marginVertical: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.primaryLight, paddingVertical: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#10B981',
    paddingVertical: 14, borderRadius: 14,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  withdrawBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#F3F4F6',
    padding: 12, borderRadius: 12,
  },
  infoBannerText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB', paddingHorizontal: 14, height: 52, marginBottom: 12,
  },
  rupeeSign: { fontSize: 20, color: '#6B7280', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: '#1F2937' },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  quickBtnActive: { borderColor: COLORS.primary, backgroundColor: '#ECFDF5' },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  quickBtnTextActive: { color: COLORS.primary },
  submitBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    backgroundColor: '#F9FAFB', paddingHorizontal: 14, height: 46,
    fontSize: 14, color: '#1F2937',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 13, borderRadius: 12, marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#9CA3AF', marginTop: 12 },
  emptySubText: { fontSize: 12, color: '#D1D5DB', marginTop: 4 },
  withdrawalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  withdrawalLeft: { flex: 1 },
  withdrawalAmount: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  withdrawalDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  withdrawalTxn: { fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginTop: 2 },
  withdrawalNote: { fontSize: 11, color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, marginLeft: 12,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  infoCard: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: '#ECFDF5',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#A7F3D0',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 8 },
  infoText: { fontSize: 12, color: '#047857', lineHeight: 20 },
});
