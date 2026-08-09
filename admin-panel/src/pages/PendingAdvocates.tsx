import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Clock, CheckCircle, XCircle, Eye, Search,
  ChevronDown, AlertCircle, RefreshCw, Award, Phone, Mail, FileText
} from 'lucide-react';
import api from '../lib/api';

type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'all';

interface Advocate {
  _id: string;
  barCouncilNumber: string;
  specializations: string[];
  experience: number;
  consultationFee: number;
  verificationStatus: string;
  documents: { barCouncilCertificate?: string; degreeDocument?: string; idProof?: string };
  verificationRejectionReason?: string;
  createdAt: string;
  user: { _id: string; name: string; email: string; phone?: string; avatar?: string; createdAt: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:      { label: 'Pending',      color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   icon: <Clock className="w-3.5 h-3.5" /> },
  under_review: { label: 'Under Review', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     icon: <Eye className="w-3.5 h-3.5" /> },
  approved:     { label: 'Approved',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:     { label: 'Rejected',     color: 'text-red-700',     bg: 'bg-red-50 border-red-200',       icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function PendingAdvocates() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [counts, setCounts] = useState({ pending: 0, under_review: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VerificationStatus>('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Advocate | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdvocates = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { status: activeTab };
      if (search) params.search = search;
      const { data } = await api.get('/admin/pending-advocates', { params });
      setAdvocates(data.data || []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      console.error('Failed to fetch advocates:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchAdvocates(); }, [fetchAdvocates]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve');
    try {
      await api.patch(`/admin/pending-advocates/${id}/approve`);
      setSelected(null);
      fetchAdvocates();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return alert('Please enter a rejection reason.');
    setActionLoading(id + '_reject');
    try {
      await api.patch(`/admin/pending-advocates/${id}/reject`, { reason: rejectReason });
      setSelected(null);
      setRejectReason('');
      fetchAdvocates();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(null); }
  };

  const tabs: { key: VerificationStatus; label: string; count?: number }[] = [
    { key: 'pending',      label: 'Pending',      count: counts.pending },
    { key: 'under_review', label: 'Under Review',  count: counts.under_review },
    { key: 'approved',     label: 'Approved',      count: counts.approved },
    { key: 'all',          label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advocate Verification</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and approve new advocate registrations</p>
        </div>
        <button
          onClick={fetchAdvocates}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: counts.pending, color: 'from-amber-500 to-orange-500', icon: <Clock className="w-5 h-5 text-white" /> },
          { label: 'Under Review',   value: counts.under_review, color: 'from-blue-500 to-indigo-500', icon: <Eye className="w-5 h-5 text-white" /> },
          { label: 'Approved',       value: counts.approved, color: 'from-emerald-500 to-teal-500', icon: <CheckCircle className="w-5 h-5 text-white" /> },
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

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Advocate', 'Bar Council No.', 'Experience', 'Specializations', 'Status', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : advocates.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No advocates found for this filter.</td></tr>
              ) : advocates.map(adv => {
                const cfg = STATUS_CONFIG[adv.verificationStatus] || STATUS_CONFIG.pending;
                return (
                  <motion.tr key={adv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{adv.user?.name?.[0]?.toUpperCase() || 'A'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{adv.user?.name}</p>
                          <p className="text-xs text-slate-400">{adv.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{adv.barCouncilNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{adv.experience} yrs</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(adv.specializations || []).slice(0, 2).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{s}</span>
                        ))}
                        {(adv.specializations || []).length > 2 && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{adv.specializations.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color} ${cfg.bg}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(adv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(adv)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors font-medium">
                        Review
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{selected.user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selected.user?.name}</h2>
                      <p className="text-amber-100 text-sm">{selected.barCouncilNumber}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" /> {selected.user?.email}
                  </div>
                  {selected.user?.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" /> {selected.user.phone}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Experience', value: `${selected.experience} years` },
                    { label: 'Consultation Fee', value: `₹${selected.consultationFee}` },
                    { label: 'Status', value: STATUS_CONFIG[selected.verificationStatus]?.label },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-medium mb-1">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Specializations */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.specializations || []).map(s => (
                      <span key={s} className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Documents</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'barCouncilCertificate', label: 'Bar Council Certificate' },
                      { key: 'degreeDocument', label: 'Degree Certificate' },
                      { key: 'idProof', label: 'ID Proof' },
                    ].map(doc => {
                      const url = selected.documents?.[doc.key as keyof typeof selected.documents];
                      return (
                        <a key={doc.key} href={url || '#'} target="_blank" rel="noopener noreferrer"
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-colors ${
                            url ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                          }`}>
                          <FileText className="w-5 h-5" />
                          <span className="text-xs font-medium leading-tight">{doc.label}</span>
                          {url ? <span className="text-[10px] text-emerald-600">View →</span> : <span className="text-[10px]">Not uploaded</span>}
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                {(selected.verificationStatus === 'pending' || selected.verificationStatus === 'under_review') && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selected._id)}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === selected._id + '_approve' ? 'Approving...' : 'Approve Advocate'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Rejection reason (required to reject)..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                      />
                      <button
                        onClick={() => handleReject(selected._id)}
                        disabled={!!actionLoading || !rejectReason.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {actionLoading === selected._id + '_reject' ? 'Rejecting...' : 'Reject Application'}
                      </button>
                    </div>
                  </div>
                )}
                {selected.verificationStatus === 'rejected' && selected.verificationRejectionReason && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
                      <p className="text-sm text-red-600 mt-0.5">{selected.verificationRejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
