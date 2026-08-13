import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, X, RefreshCw, Download,
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
  List, LayoutGrid, User, Calendar, FileText, Clock,
  CheckCircle2, AlertCircle, RotateCcw, XCircle,
  Paperclip, Upload, DollarSign, Filter, Shield
} from 'lucide-react';
import api from '../lib/api';

interface Case {
  _id: string;
  caseNumber?: string;
  title?: string;
  client?: { name: string; email: string; phone?: string };
  advocate?: { _id?: string; user?: { name: string; avatar?: string }; specializations?: string[] };
  serviceType?: string;
  status: 'open' | 'pending' | 'in_progress' | 'closed' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  payment?: { amount?: number; status?: 'paid' | 'pending' | 'failed' | 'partial' };
  description?: string;
  notes?: string;
  documents?: Array<{ url: string; name?: string; type?: string; uploadedAt?: string }>;
  createdAt: string;
  updatedAt: string;
}

interface AdvocateOption {
  _id: string;
  user?: { name: string; email: string; avatar?: string };
  specializations?: string[];
  location?: { address?: { city?: string } };
}

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'text-blue-700 bg-blue-50 border-blue-200',     icon: <AlertCircle className="w-3 h-3" />,  dot: 'bg-blue-500' },
  pending:     { label: 'Pending',     color: 'text-amber-700 bg-amber-50 border-amber-200',   icon: <Clock className="w-3 h-3" />,        dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', color: 'text-violet-700 bg-violet-50 border-violet-200',icon: <RotateCcw className="w-3 h-3" />,    dot: 'bg-violet-500' },
  closed:      { label: 'Closed',      color: 'text-gray-700 bg-gray-100 border-gray-200',     icon: <XCircle className="w-3 h-3" />,      dot: 'bg-gray-400' },
  resolved:    { label: 'Resolved',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, dot: 'bg-emerald-500' },
};

const KANBAN_COLS: (keyof typeof STATUS_CONFIG)[] = ['open', 'pending', 'in_progress', 'resolved', 'closed'];

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-gray-500 bg-gray-50 border-gray-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  high:   { label: 'High',   color: 'text-red-700 bg-red-50 border-red-200' },
};

const SERVICE_TYPES = [
  'legal_notice', 'legal_advice', 'fir_draft', 'property_dispute',
  'cheque_bounce', 'court_representation', 'general_consultation'
];

const fixCloudinaryPdfUrl = (url?: string) => {
  if (!url) return '#';
  if (url.includes('/image/upload/') && !url.includes('/fl_attachment/') && url.toLowerCase().includes('.pdf')) {
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }
  return url;
};

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [advocatesList, setAdvocatesList] = useState<AdvocateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadModalCase, setUploadModalCase] = useState<Case | null>(null);

  // Uploading state for doc modal
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Create Case Form State
  const [createForm, setCreateForm] = useState({
    clientPhone: '',
    clientName: '',
    clientEmail: '',
    issueTitle: '',
    issueCategory: 'property_dispute',
    issueDescription: '',
    consultationMode: 'chat',
    preferredSlot: 'Within 24 Hours',
    amount: '1499',
    assignedAdvocateId: '',
    priority: 'medium',
  });
  const [creatingCase, setCreatingCase] = useState(false);

  const LIMIT = 15;

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (serviceFilter) params.serviceType = serviceFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/cases', { params });
      setCases(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setCases([]); }
    finally { setLoading(false); }
  }, [page, statusFilter, serviceFilter, search]);

  const fetchAdvocates = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/advocates?limit=100');
      setAdvocatesList(data.data || []);
    } catch (e) {
      console.warn('Failed to fetch advocates for dropdown:', e);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    fetchAdvocates();
  }, [fetchCases, fetchAdvocates]);

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.clientPhone.trim()) return alert('Client phone number is required.');
    if (!createForm.issueTitle.trim()) return alert('Case title / issue is required.');

    setCreatingCase(true);
    try {
      const { data } = await api.post('/admin/create-case-for-client', {
        clientPhone: createForm.clientPhone.trim(),
        clientName: createForm.clientName.trim(),
        clientEmail: createForm.clientEmail.trim(),
        issueTitle: createForm.issueTitle.trim(),
        issueCategory: createForm.issueCategory,
        issueDescription: createForm.issueDescription.trim(),
        consultationMode: createForm.consultationMode,
        preferredSlot: createForm.preferredSlot,
        amount: Number(createForm.amount) || 1499,
        assignedAdvocateId: createForm.assignedAdvocateId || undefined,
        priority: createForm.priority,
      });

      alert(`✅ Case #${data.data?.caseNumber || 'Created'} successfully! Client account auto-registered.`);
      setShowCreateModal(false);
      setCreateForm({
        clientPhone: '', clientName: '', clientEmail: '',
        issueTitle: '', issueCategory: 'property_dispute',
        issueDescription: '', consultationMode: 'chat',
        preferredSlot: 'Within 24 Hours', amount: '1499',
        assignedAdvocateId: '', priority: 'medium',
      });
      fetchCases();
    } catch (err: any) {
      alert(`Failed to create case: ${err.response?.data?.message || err.message}`);
    } finally {
      setCreatingCase(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCase) return;
    try {
      await api.put(`/admin/cases/${editCase._id}`, {
        status: editCase.status,
        notes: editCase.notes,
        priority: editCase.priority,
        advocateId: editCase.advocate?._id,
        paymentStatus: editCase.payment?.status,
      });
      setEditCase(null);
      fetchCases();
    } catch { alert('Failed to update case.'); }
  };

  const handleUploadCaseDoc = async () => {
    if (!uploadModalCase || !uploadFile) return alert('Please select a file to upload.');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('bookingId', uploadModalCase._id);

      await api.post('/admin/upload-client-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('✔ Document attached to case successfully!');
      setUploadFile(null);
      setUploadModalCase(null);
      fetchCases();
    } catch (err: any) {
      alert(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/cases/${id}`);
      setDeleteId(null);
      fetchCases();
    } catch { alert('Delete failed.'); }
  };

  const exportCSV = () => {
    const rows = [['Case #', 'Title', 'Client Name', 'Client Phone', 'Advocate', 'Status', 'Priority', 'Amount', 'Created']];
    cases.forEach(c => rows.push([
      c.caseNumber || c._id.slice(-6),
      `"${c.title || c.serviceType || '—'}"`,
      c.client?.name || '—',
      c.client?.phone || '—',
      c.advocate?.user?.name || '—',
      c.status,
      c.priority || 'medium',
      String(c.payment?.amount || 0),
      new Date(c.createdAt).toLocaleDateString(),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cases.csv'; a.click();
  };

  // Filtered cases for view
  const filteredCases = cases.filter(c => {
    if (priorityFilter && c.priority !== priorityFilter) return false;
    return true;
  });

  const kanbanData = KANBAN_COLS.reduce<Record<string, Case[]>>((acc, col) => {
    acc[col] = filteredCases.filter(c => c.status === col);
    return acc;
  }, {});

  const CaseCard = ({ c }: { c: Case }) => {
    const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
    const pc = c.priority ? PRIORITY_CONFIG[c.priority] : PRIORITY_CONFIG.medium;
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono font-bold">#{(c.caseNumber || c._id.slice(-6)).toUpperCase()}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pc.color}`}>{pc.label}</span>
        </div>
        <p className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{c.title || c.serviceType || 'Legal Case'}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
          <User className="w-3 h-3 text-teal-600" /> {c.client?.name || '—'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <Shield className="w-3 h-3 text-indigo-500" /> {c.advocate?.user?.name || 'Unassigned'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Calendar className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold border px-2 py-0.5 rounded-full ${sc.color}`}>
            {sc.icon} {sc.label}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setSelectedCase(c)} title="View Details" className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditCase({ ...c })} title="Edit / Assign" className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => setUploadModalCase(c)} title="Attach File" className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Paperclip className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-teal-600" /> Case & Legal Notice Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total registered cases</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:from-teal-700 hover:to-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Case (Admin Side)
          </button>
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('kanban')} className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-white shadow text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={fetchCases} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {KANBAN_COLS.map(col => {
          const sc = STATUS_CONFIG[col];
          const count = cases.filter(c => c.status === col).length;
          return (
            <button
              key={col}
              onClick={() => setStatusFilter(statusFilter === col ? '' : col)}
              className={`bg-white rounded-2xl border p-3.5 text-center shadow-sm hover:shadow-md transition-all ${
                statusFilter === col ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20' : 'border-gray-100'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} mx-auto mb-1.5`} />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{sc.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by case #, client name, phone, advocate..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Service Type Filter */}
        <select
          value={serviceFilter}
          onChange={e => { setServiceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700"
        >
          <option value="">All Services</option>
          {SERVICE_TYPES.map(st => (
            <option key={st} value={st}>{st.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700"
        >
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {(statusFilter || serviceFilter || priorityFilter || search) && (
          <button
            onClick={() => { setStatusFilter(''); setServiceFilter(''); setPriorityFilter(''); setSearch(''); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-100"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_COLS.map(col => {
            const sc = STATUS_CONFIG[col];
            const colCases = kanbanData[col] || [];
            return (
              <div key={col} className="bg-gray-50/70 rounded-2xl p-4 min-h-[240px] border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                  <h3 className="font-bold text-gray-700 text-sm">{sc.label}</h3>
                  <span className="ml-auto text-xs font-bold text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">{colCases.length}</span>
                </div>
                <div className="space-y-3">
                  {colCases.length === 0 && <p className="text-xs text-gray-400 text-center py-8">No cases in this status</p>}
                  {colCases.map(c => <CaseCard key={c._id} c={c} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 animate-pulse font-medium">Loading case management database...</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No cases found matching query</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-3 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700">+ Create First Case</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {['Case #', 'Title', 'Client', 'Advocate', 'Status', 'Payment', 'Service', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCases.map(c => {
                    const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-gray-600">
                          #{(c.caseNumber || c._id.slice(-6)).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gray-900 max-w-[200px] truncate">
                          {c.title || c.serviceType || '—'}
                          {c.priority && (
                            <span className={`ml-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[c.priority]?.color}`}>
                              {c.priority.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <p className="font-semibold text-gray-800">{c.client?.name || '—'}</p>
                          <p className="text-[11px] text-gray-400">{c.client?.phone || c.client?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          {c.advocate?.user?.name ? (
                            <span className="font-semibold text-indigo-700 flex items-center gap-1">
                              <Shield size={12} className="text-indigo-500" /> {c.advocate.user.name}
                            </span>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <span className="font-bold text-emerald-700">₹{c.payment?.amount || 0}</span>
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            c.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.payment?.status?.toUpperCase() || 'PAID'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-medium capitalize">
                          {c.serviceType?.replace(/_/g, ' ') || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedCase(c)} title="View Case Details" className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditCase({ ...c })} title="Edit Status & Advocate" className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setUploadModalCase(c)} title="Upload Case File" className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Upload className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteId(c._id)} title="Delete Case" className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
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
      )}

      {/* ── CREATE CASE MODAL (ADMIN SIDE) ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-600" /> Create New Case for Client
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Admin side case creation with auto client registration & advocate assignment</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-200"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateCaseSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Client Mobile # *</label>
                      <input required type="text" value={createForm.clientPhone} onChange={e => setCreateForm(p => ({ ...p, clientPhone: e.target.value }))}
                        placeholder="e.g. 9876543210" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name</label>
                      <input type="text" value={createForm.clientName} onChange={e => setCreateForm(p => ({ ...p, clientName: e.target.value }))}
                        placeholder="Full Name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Client Email</label>
                      <input type="email" value={createForm.clientEmail} onChange={e => setCreateForm(p => ({ ...p, clientEmail: e.target.value }))}
                        placeholder="client@email.com" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Case Details</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Case Title / Issue *</label>
                    <input required type="text" value={createForm.issueTitle} onChange={e => setCreateForm(p => ({ ...p, issueTitle: e.target.value }))}
                      placeholder="e.g. Property Boundary Dispute Resolution" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Service Type</label>
                      <select value={createForm.issueCategory} onChange={e => setCreateForm(p => ({ ...p, issueCategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize">
                        {SERVICE_TYPES.map(st => (
                          <option key={st} value={st}>{st.replace(/_/g, ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                      <select value={createForm.priority} onChange={e => setCreateForm(p => ({ ...p, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="medium">Medium</option>
                        <option value="high">High Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                      <input type="number" value={createForm.amount} onChange={e => setCreateForm(p => ({ ...p, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-emerald-700" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Advocate (Optional)</label>
                    <select value={createForm.assignedAdvocateId} onChange={e => setCreateForm(p => ({ ...p, assignedAdvocateId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">-- Unassigned (Assign Later) --</option>
                      {advocatesList.map(a => (
                        <option key={a._id} value={a._id}>
                          Adv. {a.user?.name || 'Unknown'} ({a.specializations?.slice(0, 2).join(', ') || 'General'}) {a.location?.address?.city ? `- ${a.location.address.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Issue Description</label>
                    <textarea value={createForm.issueDescription} onChange={e => setCreateForm(p => ({ ...p, issueDescription: e.target.value }))} rows={3}
                      placeholder="Detail the case background, facts, and legal requirements..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={creatingCase} className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold text-sm rounded-xl hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50">
                    {creatingCase ? 'Creating Case...' : 'Create Case & Register Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW CASE DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs text-teal-600 font-mono font-bold">#{(selectedCase.caseNumber || selectedCase._id.slice(-6)).toUpperCase()}</span>
                  <h3 className="text-lg font-bold text-gray-900">{selectedCase.title || 'Case Overview'}</h3>
                </div>
                <button onClick={() => setSelectedCase(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: 'Client', value: `${selectedCase.client?.name || '—'} (${selectedCase.client?.phone || selectedCase.client?.email || 'N/A'})` },
                  { label: 'Advocate', value: selectedCase.advocate?.user?.name ? `Adv. ${selectedCase.advocate.user.name}` : 'Not Assigned' },
                  { label: 'Status', value: STATUS_CONFIG[selectedCase.status]?.label },
                  { label: 'Priority', value: selectedCase.priority?.toUpperCase() || 'MEDIUM' },
                  { label: 'Service Type', value: selectedCase.serviceType?.replace(/_/g, ' ').toUpperCase() || '—' },
                  { label: 'Payment', value: `₹${selectedCase.payment?.amount || 0} (${(selectedCase.payment?.status || 'PAID').toUpperCase()})` },
                  { label: 'Created At', value: new Date(selectedCase.createdAt).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="font-bold text-gray-800 text-right max-w-[65%]">{value}</span>
                  </div>
                ))}

                {selectedCase.description && (
                  <div className="pt-2 bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-1">Issue Description</p>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{selectedCase.description}</p>
                  </div>
                )}

                {/* Case Documents */}
                {selectedCase.documents && selectedCase.documents.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <Paperclip size={12} className="text-teal-600" /> Attached Documents ({selectedCase.documents.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.documents.map((doc, i) => (
                        <a key={i} href={fixCloudinaryPdfUrl(doc.url)} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100 border border-teal-200">
                          <FileText size={12} />
                          <span>{doc.name || `Document ${i + 1}`}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCase.notes && (
                  <div className="pt-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                    <p className="text-xs font-bold text-amber-900 mb-1">Internal Admin Notes</p>
                    <p className="text-xs text-amber-800 leading-relaxed">{selectedCase.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => { setEditCase({ ...selectedCase }); setSelectedCase(null); }} className="flex-1 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700">Edit / Assign Advocate</button>
                <button onClick={() => setSelectedCase(null)} className="py-2.5 px-4 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT CASE & ASSIGN ADVOCATE MODAL ── */}
      <AnimatePresence>
        {editCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
                <h2 className="text-lg font-bold text-gray-900">Update Case & Advocate</h2>
                <button onClick={() => setEditCase(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Case Status</label>
                  <select value={editCase.status} onChange={e => setEditCase(p => p ? { ...p, status: e.target.value as any } : p)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-semibold">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Advocate</label>
                  <select
                    value={editCase.advocate?._id || ''}
                    onChange={e => {
                      const selAdvId = e.target.value;
                      const selAdv = advocatesList.find(a => a._id === selAdvId);
                      setEditCase(p => p ? { ...p, advocate: selAdvId ? { _id: selAdvId, user: selAdv?.user } : undefined } : p);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-semibold text-indigo-700"
                  >
                    <option value="">-- Unassigned --</option>
                    {advocatesList.map(a => (
                      <option key={a._id} value={a._id}>Adv. {a.user?.name || 'Unknown'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select value={editCase.priority || 'medium'} onChange={e => setEditCase(p => p ? { ...p, priority: e.target.value as any } : p)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Internal Admin Notes</label>
                  <textarea value={editCase.notes || ''} onChange={e => setEditCase(p => p ? { ...p, notes: e.target.value } : p)} rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" placeholder="Add confidential internal case notes..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditCase(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UPLOAD CASE DOCUMENT MODAL ── */}
      <AnimatePresence>
        {uploadModalCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" /> Attach Document to Case
                </h3>
                <button onClick={() => setUploadModalCase(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Upload court notices, evidence, or agreements for <strong className="text-gray-800">#{(uploadModalCase.caseNumber || uploadModalCase._id.slice(-6)).toUpperCase()}</strong>.
                </p>

                <input
                  type="file"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setUploadModalCase(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl">Cancel</button>
                  <button onClick={handleUploadCaseDoc} disabled={isUploading || !uploadFile} className="flex-1 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Upload & Attach'}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg">Delete Case Record?</h3>
              <p className="text-xs text-gray-500 mt-1 mb-5">This action will remove the case permanently from admin records.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
