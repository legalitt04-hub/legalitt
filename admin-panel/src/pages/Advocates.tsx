import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Plus, Search, Edit2, Trash2, X, RefreshCw,
  CheckCircle2, XCircle, PauseCircle, Eye, Download,
  Star, Briefcase, Phone, Mail, MapPin, ChevronLeft, ChevronRight,
  Filter, EyeOff, ToggleLeft, ToggleRight, Camera
} from 'lucide-react';
import api from '../lib/api';

interface Advocate {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; avatar?: string };
  barCouncilNumber?: string;
  barCouncilId?: string;
  specializations: string[];
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  isVerified: boolean;
  rating?: { average: number; count: number };
  consultationFee?: number;
  location?: { address?: { city?: string; state?: string; street?: string } };
  experience?: number;
  bio?: string;
  documents?: { barCouncilCertificate?: string; degreeDocument?: string; idProof?: string };
  verificationRejectionReason?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  approved:     { label: 'Approved',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:      { label: 'Pending',       color: 'text-amber-700 bg-amber-50 border-amber-200',       icon: <PauseCircle className="w-3 h-3" /> },
  under_review: { label: 'Under Review',  color: 'text-blue-700 bg-blue-50 border-blue-200',          icon: <Eye className="w-3 h-3" /> },
  rejected:     { label: 'Rejected',      color: 'text-red-700 bg-red-50 border-red-200',             icon: <XCircle className="w-3 h-3" /> },
  suspended:    { label: 'Suspended',     color: 'text-gray-700 bg-gray-100 border-gray-200',         icon: <EyeOff className="w-3 h-3" /> },
};

const SPECIALIZATION_OPTIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
  'Labour Law', 'Constitutional Law', 'Tax Law', 'Consumer Law', 'Cyber Law',
  'Intellectual Property', 'Banking Law', 'Environmental Law', 'Human Rights', 'Immigration Law',
];

const EMPTY_FORM = {
  name: '', email: '', phone: '', password: '',
  barCouncilNumber: '', specializations: [] as string[], city: '', state: '',
  consultationFee: '', experience: '',
};

export default function Advocates() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [counts, setCounts] = useState({ pending: 0, under_review: 0, approved: 0 });
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
  const [rejectReason, setRejectReason] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Edit advocate state
  const [editAdv, setEditAdv] = useState<Advocate | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editAvatarRef = useRef<HTMLInputElement>(null);
  const LIMIT = 15;

  const fetchAdvocates = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (statusFilter) params.verificationStatus = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/pending-advocates', { params });
      setAdvocates(data.data || []);
      if (data.counts) setCounts(data.counts);
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
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        barCouncilNumber: form.barCouncilNumber,
        specializations: form.specializations,
        city: form.city,
        state: form.state,
        consultationFee: Number(form.consultationFee) || 500,
        experience: Number(form.experience) || 0,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAdvocates();
      alert('✅ Advocate created successfully!');
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const handleVerify = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      if (action === 'reject') {
        if (!reason && !rejectReason.trim()) return alert('Please enter a rejection reason.');
        await api.patch(`/admin/pending-advocates/${id}/reject`, { reason: reason || rejectReason });
      } else {
        await api.patch(`/admin/pending-advocates/${id}/approve`);
      }
      setSelectedAdv(null);
      setRejectReason('');
      fetchAdvocates();
    } catch (e: any) { alert(e?.response?.data?.message || 'Action failed.'); }
  };

  const handleSuspend = async (id: string, currentStatus?: string) => {
    const isSuspended = currentStatus === 'suspended';
    const actionText = isSuspended ? 'Unsuspend & Re-activate' : 'Suspend';
    if (!window.confirm(`Are you sure you want to ${actionText.toLowerCase()} this advocate account?`)) return;

    try {
      const res = await api.patch(`/admin/advocates/${id}/suspend`);
      const newStatus = res.data?.data?.verificationStatus || (isSuspended ? 'approved' : 'suspended');
      alert(`✅ Advocate account has been ${newStatus === 'suspended' ? 'SUSPENDED' : 'UNSUSPENDED & RE-ACTIVATED'}.`);
      if (selectedAdv) {
        setSelectedAdv(prev => prev ? { ...prev, verificationStatus: newStatus as any } : null);
      }
      fetchAdvocates();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update advocate status.');
    }
  };

  const handleUpdateRating = async (id: string, ratingVal: number) => {
    try {
      await api.patch(`/admin/advocates/${id}/rating`, { average: ratingVal, count: 5 });
      alert(`✅ Advocate rating updated to ${ratingVal} ⭐`);
      if (selectedAdv) {
        setSelectedAdv(prev => prev ? { ...prev, rating: { average: ratingVal, count: 5 } } : null);
      }
      fetchAdvocates();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update rating');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/advocates/${id}`);
      setDeleteId(null);
      fetchAdvocates();
    } catch (e: any) { console.error('Delete failed:', e); }
  };

  const openEditAdv = (adv: Advocate) => {
    setEditAdv(adv);
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
    setEditForm({
      name: adv.user?.name || '',
      email: adv.user?.email || '',
      phone: adv.user?.phone || '',
      barCouncilId: adv.barCouncilId || adv.barCouncilNumber || '',
      specializations: (adv.specializations || []).join(', '),
      city: adv.location?.address?.city || '',
      state: adv.location?.address?.state || '',
      street: adv.location?.address?.street || '',
      consultationFee: adv.consultationFee || '',
      experience: adv.experience || '',
      bio: adv.bio || '',
    });
  };

  const handleEditAdvocate = async () => {
    if (!editAdv) return;
    setEditSaving(true);
    try {
      const fd = new FormData();
      if (editForm.name) fd.append('name', editForm.name);
      if (editForm.email) fd.append('email', editForm.email);
      if (editForm.phone) fd.append('phone', editForm.phone);
      if (editForm.barCouncilId) fd.append('barCouncilId', editForm.barCouncilId);
      if (editForm.specializations) fd.append('specializations', editForm.specializations);
      if (editForm.city) fd.append('city', editForm.city);
      if (editForm.state) fd.append('state', editForm.state);
      if (editForm.street) fd.append('street', editForm.street);
      if (editForm.consultationFee !== '') fd.append('consultationFee', String(editForm.consultationFee));
      if (editForm.experience !== '') fd.append('experience', String(editForm.experience));
      if (editForm.bio !== undefined) fd.append('bio', editForm.bio);
      if (editAvatarFile) fd.append('avatar', editAvatarFile);
      await api.patch(`/admin/advocates/${editAdv._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditAdv(null);
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      fetchAdvocates();
    } catch (e: any) { alert(e?.response?.data?.message || 'Update failed.'); }
    finally { setEditSaving(false); }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Bar Council', 'Status', 'City', 'Fee', 'Rating']];
    advocates.forEach(a => rows.push([
      a.user?.name || 'Advocate', a.user?.email || 'N/A', a.barCouncilId || '',
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

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
        {[
          { key: '', label: 'All Advocates', count: total },
          { key: 'pending', label: 'Pending Approval', count: counts.pending, badge: 'bg-amber-500 text-white' },
          { key: 'under_review', label: 'Under Review', count: counts.under_review, badge: 'bg-blue-500 text-white' },
          { key: 'approved', label: 'Approved', count: counts.approved, badge: 'bg-emerald-500 text-white' },
          { key: 'suspended', label: 'Suspended' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab.badge || 'bg-gray-200 text-gray-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, bar council ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
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
                        {adv.user?.avatar ? (
                          <img src={adv.user.avatar} alt={adv.user?.name || 'Advocate'} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {adv.user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                          <div>
                            <p className="font-semibold text-gray-900">{adv.user?.name || 'Advocate'}</p>
                            <p className="text-xs text-gray-400">{adv.user?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-mono">{adv.barCouncilNumber || adv.barCouncilId || '—'}</td>
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
                          <button onClick={() => openEditAdv(adv)} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100" title="Edit Profile"><Edit2 className="w-3.5 h-3.5" /></button>
                          {adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? (
                            <>
                              <button onClick={() => handleVerify(adv._id, 'approve')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleVerify(adv._id, 'reject')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Reject"><XCircle className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSuspend(adv._id, adv.verificationStatus)}
                              title={adv.verificationStatus === 'suspended' ? 'Unsuspend Advocate' : 'Suspend Advocate'}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${
                                adv.verificationStatus === 'suspended'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              {adv.verificationStatus === 'suspended' ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unsuspend</>
                              ) : (
                                <><PauseCircle className="w-3.5 h-3.5 text-amber-600" /> Suspend</>
                              )}
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

      {/* Detail & Verification Review Modal */}
      <AnimatePresence>
        {selectedAdv && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Advocate Verification & Details</h3>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedAdv.verificationStatus]?.color || ''}`}>
                    {STATUS_CONFIG[selectedAdv.verificationStatus]?.icon} {STATUS_CONFIG[selectedAdv.verificationStatus]?.label}
                  </span>
                </div>
                <button onClick={() => setSelectedAdv(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                {selectedAdv.user?.avatar ? (
                  <img src={selectedAdv.user.avatar} alt={selectedAdv.user?.name || 'Advocate'} className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 flex-shrink-0 shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">{selectedAdv.user?.name?.[0] || 'A'}</div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-base">{selectedAdv.user?.name || 'Advocate'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> {selectedAdv.user?.email || '—'}</p>
                  {selectedAdv.user?.phone && <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {selectedAdv.user.phone}</p>}
                </div>
              </div>

              {/* Admin Rating Override Control */}
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Set Rating (Admin Control)</p>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">
                    Current: <span className="font-extrabold text-amber-800">⭐ {selectedAdv.rating?.average ? selectedAdv.rating.average.toFixed(1) : '0.0'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAdv.rating?.average || 5.0}
                    onChange={(e) => handleUpdateRating(selectedAdv._id, parseFloat(e.target.value))}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-extrabold text-amber-700 focus:outline-none shadow-sm cursor-pointer"
                  >
                    <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value="4.8">4.8 ⭐⭐⭐⭐★ (Very Good)</option>
                    <option value="4.5">4.5 ⭐⭐⭐⭐☆ (Good)</option>
                    <option value="4.0">4.0 ⭐⭐⭐⭐ (Average)</option>
                    <option value="3.5">3.5 ⭐⭐⭐ (Fair)</option>
                    <option value="3.0">3.0 ⭐⭐⭐ (Needs Improvement)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-5">
                {[
                  { label: 'Bar Council Number', value: selectedAdv.barCouncilNumber || selectedAdv.barCouncilId || '—' },
                  { label: 'Specializations', value: selectedAdv.specializations?.join(', ') || 'General Practice' },
                  { label: 'City & Address', value: selectedAdv.location?.address?.city ? `${selectedAdv.location.address.street || ''}, ${selectedAdv.location.address.city}, ${selectedAdv.location.address.state || ''}` : '—' },
                  { label: 'Consultation Fee', value: `₹${selectedAdv.consultationFee || 0}` },
                  { label: 'Experience', value: selectedAdv.experience ? `${selectedAdv.experience} years` : '—' },
                  { label: 'Registered On', value: new Date(selectedAdv.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 text-xs">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="font-bold text-gray-800 text-right max-w-[65%]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Documents Verification Section */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-5">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">Verification Documents</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'barCouncilCertificate', label: 'Bar Council Cert' },
                    { key: 'degreeDocument', label: 'LL.B Degree' },
                    { key: 'idProof', label: 'Govt ID Proof' },
                  ].map(doc => {
                    const url = selectedAdv.documents?.[doc.key as keyof typeof selectedAdv.documents];
                    return (
                      <a key={doc.key} href={url || '#'} target="_blank" rel="noopener noreferrer"
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          url ? 'bg-white border-amber-200 text-teal-700 hover:shadow-md cursor-pointer' : 'bg-gray-100 border-gray-200 text-gray-400 pointer-events-none'
                        }`}>
                        <Briefcase className="w-5 h-5 mb-1 text-amber-600" />
                        <span className="text-[11px] font-bold text-gray-800 leading-tight mb-1">{doc.label}</span>
                        {url ? <span className="text-[10px] text-teal-600 font-semibold underline">View File ↗</span> : <span className="text-[10px] text-gray-400">Not Uploaded</span>}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Approval / Rejection / Suspend Actions */}
              {(selectedAdv.verificationStatus === 'pending' || selectedAdv.verificationStatus === 'under_review') ? (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button onClick={() => handleVerify(selectedAdv._id, 'approve')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve Advocate Account
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                    <button onClick={() => handleVerify(selectedAdv._id, 'reject')} disabled={!rejectReason.trim()} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 disabled:opacity-40 flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {selectedAdv.verificationStatus === 'suspended' ? (
                    <button
                      onClick={() => handleSuspend(selectedAdv._id, selectedAdv.verificationStatus)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Unsuspend & Re-activate Advocate Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(selectedAdv._id, selectedAdv.verificationStatus)}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      <PauseCircle className="w-4 h-4" /> Suspend Advocate Account
                    </button>
                  )}
                  <button onClick={() => setSelectedAdv(null)} className="w-full py-2.5 bg-gray-100 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-200">Close Details</button>
                </div>
              )}
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
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Full Name *', key: 'name', placeholder: 'Advocate Name' },
                    { label: 'Email *', key: 'email', placeholder: 'adv@example.com' },
                    { label: 'Phone', key: 'phone', placeholder: '9876543210' },
                    { label: 'Password *', key: 'password', placeholder: 'Min 8 chars' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                      <input value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                        type={f.key === 'password' ? 'password' : 'text'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>

                {/* Professional */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bar Council Number *</label>
                  <input value={form.barCouncilNumber || ''} onChange={e => setForm((p: any) => ({ ...p, barCouncilNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="BAR/MP/2024/1234" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Consultation Fee (Rs.) *</label>
                    <input type="number" value={form.consultationFee || ''} onChange={e => setForm((p: any) => ({ ...p, consultationFee: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (years) *</label>
                    <input type="number" value={form.experience || ''} onChange={e => setForm((p: any) => ({ ...p, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="3" />
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Specializations * <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {SPECIALIZATION_OPTIONS.map(spec => (
                      <label key={spec} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
                        form.specializations?.includes(spec)
                          ? 'bg-teal-50 border-teal-400 text-teal-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}>
                        <input type="checkbox" checked={form.specializations?.includes(spec) || false}
                          onChange={e => {
                            const cur: string[] = form.specializations || [];
                            setForm((p: any) => ({
                              ...p,
                              specializations: e.target.checked ? [...cur, spec] : cur.filter((s: string) => s !== spec),
                            }));
                          }}
                          className="w-3 h-3 accent-teal-600" />
                        {spec}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input value={form.city || ''} onChange={e => setForm((p: any) => ({ ...p, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Bhopal" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                    <input value={form.state || ''} onChange={e => setForm((p: any) => ({ ...p, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Madhya Pradesh" />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
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

      {/* Edit Advocate Modal */}
      <AnimatePresence>
        {editAdv && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Edit Advocate Profile</h2>
                <button onClick={() => { setEditAdv(null); setEditAvatarFile(null); setEditAvatarPreview(null); }}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-2xl border border-teal-100">
                  <div className="relative flex-shrink-0">
                    {editAvatarPreview || editAdv.user?.avatar ? (
                      <img src={editAvatarPreview || editAdv.user?.avatar} alt="Avatar" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-teal-400 shadow-lg" />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {editAdv.user?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <button onClick={() => editAvatarRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 border-2 border-white">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{editAdv.user?.name || 'Advocate'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{editAdv.user?.email}</p>
                    <button onClick={() => editAvatarRef.current?.click()} className="mt-2 text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                      <Camera className="w-3 h-3" />{editAvatarFile ? `${editAvatarFile.name}` : 'Change Photo'}
                    </button>
                  </div>
                  <input ref={editAvatarRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) { setEditAvatarFile(f); setEditAvatarPreview(URL.createObjectURL(f)); } }}
                  />
                </div>

                {/* Personal */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-teal-500" /> Personal Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Full Name', key: 'name', placeholder: 'Adv. Name' },
                    { label: 'Phone', key: 'phone', placeholder: '9876543210' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                      <input value={editForm[f.key] || ''} onChange={e => setEditForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input value={editForm.email || ''} onChange={e => setEditForm((p: any) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="adv@example.com" />
                </div>

                {/* Professional */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Professional Details</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bar Council ID</label>
                  <input value={editForm.barCouncilId || ''} onChange={e => setEditForm((p: any) => ({ ...p, barCouncilId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="BAR/MP/2024/1234" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specializations (comma separated)</label>
                  <input value={editForm.specializations || ''} onChange={e => setEditForm((p: any) => ({ ...p, specializations: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Civil, Criminal, Family Law..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Consultation Fee (Rs.)</label>
                    <input type="number" value={editForm.consultationFee || ''} onChange={e => setEditForm((p: any) => ({ ...p, consultationFee: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (years)</label>
                    <input type="number" value={editForm.experience || ''} onChange={e => setEditForm((p: any) => ({ ...p, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="5" />
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Location</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'City', key: 'city', placeholder: 'Bhopal' },
                    { label: 'State', key: 'state', placeholder: 'Madhya Pradesh' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                      <input value={editForm[f.key] || ''} onChange={e => setEditForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street / Area</label>
                  <input value={editForm.street || ''} onChange={e => setEditForm((p: any) => ({ ...p, street: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Near High Court, Vijay Nagar..." />
                </div>

                {/* Bio */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Advocate Bio
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Professional Bio
                    <span className="ml-1 font-normal text-gray-400">({(editForm.bio || '').length}/500)</span>
                  </label>
                  <textarea
                    value={editForm.bio || ''}
                    onChange={e => setEditForm((p: any) => ({ ...p, bio: e.target.value.slice(0, 500) }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder="Write a short professional bio about this advocate — their expertise, experience, and approach to law practice..."
                  />
                  <p className="text-xs text-gray-400 mt-1">This bio is shown to clients browsing advocate profiles.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setEditAdv(null); setEditAvatarFile(null); setEditAvatarPreview(null); }}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleEditAdvocate} disabled={editSaving}
                    className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
