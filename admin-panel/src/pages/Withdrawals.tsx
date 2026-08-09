import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Clock, CheckCircle, XCircle, Search,
  RefreshCw, IndianRupee, TrendingUp, AlertCircle, Copy, Check
} from 'lucide-react';
import api from '../lib/api';

interface Withdrawal {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  adminNote?: string;
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  advocateUser: { name: string; email: string; phone?: string };
  advocate: { barCouncilNumber?: string; wallet?: { balance: number; totalEarned: number } };
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Approved',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  paid:     { label: 'Paid ✓',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  rejected: { label: 'Rejected',  color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'rejected' | 'all'>('pending');
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [txnId, setTxnId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/withdrawals', { params: { status: activeTab } });
      setWithdrawals(data.data || []);
      if (data.pendingTotal !== undefined) setPendingTotal(data.pendingTotal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleProcess = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    if (action === 'approve' && !txnId.trim()) return alert('Transaction ID is required to approve.');
    setActionLoading(true);
    try {
      await api.patch(`/admin/withdrawals/${selected._id}/process`, {
        action,
        transactionId: txnId.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      });
      setSelected(null);
      setTxnId('');
      setAdminNote('');
      fetchWithdrawals();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Withdrawal Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage advocate payout requests</p>
        </div>
        <button onClick={fetchWithdrawals}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Payout', value: `₹${pendingTotal.toLocaleString('en-IN')}`, color: 'from-amber-500 to-orange-500', icon: <Clock className="w-5 h-5 text-white" /> },
          { label: 'Requests Today', value: withdrawals.filter(w => new Date(w.createdAt).toDateString() === new Date().toDateString()).length, color: 'from-blue-500 to-indigo-500', icon: <Wallet className="w-5 h-5 text-white" /> },
          { label: 'Pending Count', value: withdrawals.filter(w => w.status === 'pending').length, color: 'from-rose-500 to-pink-500', icon: <TrendingUp className="w-5 h-5 text-white" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-1">
            {(['pending', 'paid', 'rejected', 'all'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Advocate', 'Amount', 'Bank / UPI', 'Status', 'Requested', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No withdrawal requests found.</td></tr>
              ) : withdrawals.map(w => {
                const cfg = STATUS_CONFIG[w.status];
                return (
                  <motion.tr key={w._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 text-sm">{w.advocateUser?.name}</p>
                      <p className="text-xs text-slate-400">{w.advocateUser?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-slate-900">₹{w.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">{w.bankDetails?.bankName}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        ••••{w.bankDetails?.accountNumber?.slice(-4)} · {w.bankDetails?.ifscCode}
                      </p>
                      {w.bankDetails?.upiId && <p className="text-xs text-indigo-500">{w.bankDetails.upiId}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                      {w.transactionId && (
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">TXN: {w.transactionId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'pending' && (
                        <button onClick={() => { setSelected(w); setTxnId(''); setAdminNote(''); }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors font-medium">
                          Process
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>

              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Process Withdrawal</h2>
                    <p className="text-amber-100 text-sm">{selected.advocateUser?.name} · ₹{selected.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-2xl">×</button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Bank Details */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bank Details</p>
                  {[
                    { label: 'Account Holder', value: selected.bankDetails?.accountHolder },
                    { label: 'Account Number', value: selected.bankDetails?.accountNumber },
                    { label: 'IFSC Code', value: selected.bankDetails?.ifscCode },
                    { label: 'Bank Name', value: selected.bankDetails?.bankName },
                    ...(selected.bankDetails?.upiId ? [{ label: 'UPI ID', value: selected.bankDetails.upiId }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 font-mono">{item.value}</span>
                        <button onClick={() => copyText(item.value || '', item.label)}
                          className="text-slate-400 hover:text-amber-600 transition-colors">
                          {copied === item.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transaction ID (required for approve) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Transaction ID <span className="text-red-400">*</span>
                    <span className="text-slate-400 font-normal ml-1">(Bank ref / UTR number — required to approve)</span>
                  </label>
                  <input
                    value={txnId}
                    onChange={e => setTxnId(e.target.value)}
                    placeholder="e.g. UTR123456789 or TXN12345"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Admin note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Note to Advocate <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="e.g. Transferred via NEFT on 8 Aug 2026..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleProcess('approve')}
                    disabled={actionLoading || !txnId.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading ? 'Processing...' : 'Approve & Mark Paid'}
                  </button>
                  <button
                    onClick={() => handleProcess('reject')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  On approve: amount marked as paid, advocate notified. On reject: amount returned to wallet.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
