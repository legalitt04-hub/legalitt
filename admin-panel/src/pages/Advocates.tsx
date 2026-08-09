import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Plus, Search, Edit2, Trash2, X, RefreshCw,
  CheckCircle2, XCircle, PauseCircle, Eye, Download,
  Star, Briefcase, Phone, Mail, MapPin, ChevronLeft, ChevronRight,
  Filter, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../lib/api';

interface Advocate {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; avatar?: string };
  barCouncilId?: string;
  specializations: string[];
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  isVerified: boolean;
  rating?: { average: number; count: number };
  consultationFee?: number;
  location?: { address?: { city?: string; state?: string } };
  experience?: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  approved:     { label: 'Approved',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:      { label: 'Pending',       color: 'text-amber-700 bg-amber-50 border-amber-200',       icon: <PauseCircle className="w-3 h-3" /> },
  under_review: { label: 'Under Review',  color: 'text-blue-700 bg-blue-50 border-blue-200',          icon: <Eye className="w-3 h-3" /> },
  rejected:     { label: 'Rejected',      color: 'text-red-700 bg-red-50 border-red-200',             icon: <XCircle className="w-3 h-3" /> },
  suspended:    { label: 'Suspended',     color: 'text-gray-700 bg-gray-100 border-gray-200',         icon: <EyeOff className="w-3 h-3" /> },
};

const EMPTY_FORM = {
  name: '', email: '', phone: '', password: '',
  barCouncilId: '', specializations: '', city: '', state: '',
  consultationFee: '', experience: '',
};

export default function Advocates() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedAdv, setSelectedAdv] = useState<Advocate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchAdvocates = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (statusFilter) params.verificationStatus = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/advocates', { params });
      setAdvocates(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setAdvocates([]); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchAdvocates(); }, [fetchAdvocates]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return alert('Name, email, password required.');
    setSaving(true);
    try {
      await api.post('/admin/advocates', {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        barCouncilId: form.barCouncilId,
        specializations: form.specializations.split(',').map((s: string) => s.trim()).filter(Boolean),
        location: { address: { city: form.city, state: form.state } },
        consultationFee: Number(form.consultationFee) || 0,
        experience: Number(form.experience) || 0,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAdvocates();
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/admin/pending-advocates/${id}/${action}`);
      fetchAdvocates();
    } catch { alert('Action failed.'); }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.patch(`/admin/advocates/${id}/suspend`);
      fetchAdvocates();
    } catch { alert('Failed to update status.'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/advocates/${id}`);
      setDeleteId(null);
      fetchAdvocates();
    } catch { alert('Failed to delete.'); }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Bar Council', 'Status', 'City', 'Fee', 'Rating']];
    advocates.forEach(a => rows.push([
      a.user.name, a.user.email, a.barCouncilId || '',
      a.verificationStatus, a.location?.address?.city || '',
      String(a.consultationFee || 0), String(a.rating?.average || 0),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'advocates.csv'; a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advocate Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total advocates on platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={fetchAdvocates} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
            <Plus className="w-4 h-4" /> Add Advocate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, city..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading advocates...</div>
        ) : advocates.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No advocates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Advocate', 'Bar Council', 'Specializations', 'Status', 'Rating', 'City', 'Fee', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {advocates.map(adv => {
                  const sc = STATUS_CONFIG[adv.verificationStatus] || STATUS_CONFIG.pending;
                  return (
                    <tr key={adv._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {adv.user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{adv.user.name}</p>
                            <p className="text-xs text-gray-400">{adv.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{adv.barCouncilId || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(adv.specializations || []).slice(0, 2).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-md">{s}</span>
                          ))}
                          {adv.specializations?.length > 2 && <span className="text-xs text-gray-400">+{adv.specializations.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {adv.rating?.average ? (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{adv.rating.average.toFixed(1)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{adv.location?.address?.city || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800">₹{adv.consultationFee || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedAdv(adv)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          {adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? (
                            <>
                              <button onClick={() => handleVerify(adv._id, 'approve')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleVerify(adv._id, 'reject')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Reject"><XCircle className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <button onClick={() => handleSuspend(adv._id)} title={adv.verificationStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                              className={`p-1.5 rounded-lg ${adv.verificationStatus === 'suspended' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} hover:opacity-80`}>
                              {adv.verificationStatus === 'suspended' ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button onClick={() => setDeleteId(adv._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAdv && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Advocate Details</h3>
                <button onClick={() => setSelectedAdv(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">{selectedAdv.user.name?.[0]}</div>
                <div>
                  <p className="font-bold text-gray-900">{selectedAdv.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedAdv.user.email}</p>
                  {selectedAdv.user.phone && <p className="text-xs text-gray-400">{selectedAdv.user.phone}</p>}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Bar Council ID', value: selectedAdv.barCouncilId || '—' },
                  { label: 'Status', value: STATUS_CONFIG[selectedAdv.verificationStatus]?.label },
                  { label: 'Specializations', value: selectedAdv.specializations?.join(', ') || '—' },
                  { label: 'City', value: selectedAdv.location?.address?.city || '—' },
                  { label: 'State', value: selectedAdv.location?.address?.state || '—' },
                  { label: 'Consultation Fee', value: `₹${selectedAdv.consultationFee || 0}` },
                  { label: 'Experience', value: selectedAdv.experience ? `${selectedAdv.experience} years` : '—' },
                  { label: 'Rating', value: selectedAdv.rating?.average ? `${selectedAdv.rating.average.toFixed(1)} (${selectedAdv.rating.count} reviews)` : 'No reviews' },
                  { label: 'Registered', value: new Date(selectedAdv.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedAdv(null)} className="mt-5 w-full py-2.5 bg-gray-100 text-sm font-semibold rounded-xl hover:bg-gray-200">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Add New Advocate</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'Advocate Name' },
                  { label: 'Email *', key: 'email', placeholder: 'adv@example.com' },
                  { label: 'Phone', key: 'phone', placeholder: '9876543210' },
                  { label: 'Password *', key: 'password', placeholder: 'Min 8 chars' },
                  { label: 'Bar Council ID', key: 'barCouncilId', placeholder: 'BAR/MP/123' },
                  { label: 'Specializations (comma-sep)', key: 'specializations', placeholder: 'Civil, Criminal' },
                  { label: 'City', key: 'city', placeholder: 'Bhopal' },
                  { label: 'State', key: 'state', placeholder: 'Madhya Pradesh' },
                  { label: 'Consultation Fee (₹)', key: 'consultationFee', placeholder: '999' },
                  { label: 'Experience (years)', key: 'experience', placeholder: '5' },
                ].map(f => (
                  <div key={f.key} className={f.key === 'specializations' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="col-span-2 flex gap-3 pt-1">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Advocate'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg">Delete Advocate?</h3>
              <p className="text-sm text-gray-500 mt-1 mb-5">This will permanently remove the advocate and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
