import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownCircle, ArrowUpCircle, Download, RefreshCw,
  Search, ChevronLeft, ChevronRight, Filter,
  IndianRupee, TrendingUp, TrendingDown, Percent
} from 'lucide-react';
import api from '../lib/api';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const typeConfig: Record<string, any> = {
  payment: { label: 'Payment', cls: 'bg-emerald-50 text-emerald-700', icon: ArrowDownCircle, iconCls: 'text-emerald-500' },
  payout:  { label: 'Payout',  cls: 'bg-blue-50 text-blue-700',     icon: ArrowUpCircle,   iconCls: 'text-blue-500' },
};

const statusCls: Record<string, string> = {
  paid:       'bg-emerald-50 text-emerald-700',
  completed:  'bg-emerald-50 text-emerald-700',
  pending:    'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  failed:     'bg-red-50 text-red-600',
  refunded:   'bg-purple-50 text-purple-700',
};

export default function Transactions() {
  const [txns, setTxns]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [summary, setSummary]     = useState<any>({});
  const LIMIT = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get('/admin/transactions', { params });
      setTxns(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
      setSummary(data.summary || {});
    } catch { setTxns([]); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = txns.filter(t =>
    !search ||
    t.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.advocate?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.razorpayId?.includes(search)
  );

  const exportCSV = () => {
    const rows = [['Date', 'Type', 'Client', 'Advocate', 'Amount', 'Commission', 'Advocate Net', 'Status', 'Service', 'Razorpay ID']];
    txns.forEach(t => rows.push([
      new Date(t.date).toLocaleDateString(),
      t.type, t.client?.name || '—', t.advocate?.name || '—',
      String(t.amount), String(t.commission), String(t.advocateNet),
      t.status, t.serviceType?.replace(/_/g, ' ') || '—', t.razorpayId || '—',
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statCards = [
    { label: 'Total Payments', value: fmt(summary.totalPayments || 0), sub: 'Client payments received', icon: ArrowDownCircle, bg: 'bg-emerald-50', tc: 'text-emerald-600' },
    { label: 'Total Payouts', value: fmt(summary.totalPayouts || 0), sub: 'Advocate withdrawals', icon: ArrowUpCircle, bg: 'bg-blue-50', tc: 'text-blue-600' },
    { label: 'Platform Commission', value: fmt(summary.totalCommission || 0), sub: `${summary.commissionRate || 15}% rate`, icon: Percent, bg: 'bg-amber-50', tc: 'text-amber-600' },
    { label: 'Net Revenue', value: fmt(summary.netPlatformRevenue || 0), sub: 'After all payouts', icon: TrendingUp, bg: 'bg-teal-50', tc: 'text-teal-600' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6 text-teal-600" /> Transaction History
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">All payments from clients + payouts to advocates — unified ledger</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetch} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className={`w-5 h-5 ${c.tc}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2">
        {[{ value: '', label: 'All' }, { value: 'payment', label: '↓ Payments' }, { value: 'payout', label: '↑ Payouts' }].map(t => (
          <button key={t.value} onClick={() => { setTypeFilter(t.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              typeFilter === t.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name, advocate name, payment ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <IndianRupee className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Type', 'Date', 'Client', 'Advocate', 'Amount', 'Commission', 'Adv. Net', 'Status', 'Reference'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t, idx) => {
                  const tc = typeConfig[t.type] || typeConfig.payment;
                  const TIcon = tc.icon;
                  return (
                    <tr key={t._id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tc.cls}`}>
                          <TIcon className="w-3 h-3" />{tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {t.client ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {t.client.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-700">{t.client.name}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {t.advocate ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {t.advocate.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-700">{t.advocate.name}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{fmt(t.amount)}</td>
                      <td className="px-4 py-3 text-xs text-amber-600 font-semibold">
                        {t.commission > 0 ? fmt(t.commission) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-indigo-600 font-semibold">
                        {t.advocateNet > 0 ? fmt(t.advocateNet) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusCls[t.status] || 'bg-gray-50 text-gray-500'}`}>
                          {t.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-400">
                          {t.razorpayId ? t.razorpayId.slice(0, 16) + '…' : `#${String(t._id).slice(-8).toUpperCase()}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
