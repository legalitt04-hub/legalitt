import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, X, RefreshCw, Download,
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
  List, LayoutGrid, User, Calendar, FileText, Clock,
  CheckCircle2, AlertCircle, RotateCcw, XCircle
} from 'lucide-react';
import api from '../lib/api';

interface Case {
  _id: string;
  caseNumber?: string;
  title?: string;
  client?: { name: string; email: string; phone?: string };
  advocate?: { user?: { name: string }; specializations?: string[] };
  serviceType?: string;
  status: 'open' | 'pending' | 'in_progress' | 'closed' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  low:    { label: 'Low',    color: 'text-gray-500 bg-gray-50' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  high:   { label: 'High',   color: 'text-red-600 bg-red-50' },
};

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/cases', { params });
      setCases(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setCases([]); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/admin/cases/${id}`, { status });
      fetchCases();
    } catch { alert('Failed to update.'); }
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/cases/${editCase!._id}`, { status: editCase!.status, notes: editCase!.notes });
      setEditCase(null);
      fetchCases();
    } catch { alert('Failed to update case.'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/cases/${id}`).catch(() => {}); // graceful
      setDeleteId(null);
      fetchCases();
    } catch { alert('Delete failed.'); }
  };

  const exportCSV = () => {
    const rows = [['Case #', 'Title', 'Client', 'Advocate', 'Status', 'Service', 'Created']];
    cases.forEach(c => rows.push([
      c.caseNumber || c._id.slice(-6), c.title || '—',
      c.client?.name || '—', c.advocate?.user?.name || '—',
      c.status, c.serviceType || '—',
      new Date(c.createdAt).toLocaleDateString(),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cases.csv'; a.click();
  };

  // Kanban grouped data
  const kanbanData = KANBAN_COLS.reduce<Record<string, Case[]>>((acc, col) => {
    acc[col] = cases.filter(c => c.status === col);
    return acc;
  }, {});

  const CaseCard = ({ c }: { c: Case }) => {
    const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
    const pc = c.priority ? PRIORITY_CONFIG[c.priority] : null;
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono">#{(c.caseNumber || c._id.slice(-6)).toUpperCase()}</span>
          {pc && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${pc.color}`}>{pc.label}</span>}
        </div>
        <p className="font-semibold text-gray-900 text-sm leading-snug mb-2">{c.title || c.serviceType || 'Legal Case'}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <User className="w-3 h-3" /> {c.client?.name || '—'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Calendar className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${sc.color}`}>
            {sc.icon} {sc.label}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setSelectedCase(c)} className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Eye className="w-3 h-3" /></button>
            <button onClick={() => setEditCase({ ...c })} className="p-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"><Edit2 className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total cases</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('kanban')} className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-white shadow text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={fetchCases} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {KANBAN_COLS.map(col => {
          const sc = STATUS_CONFIG[col];
          const count = cases.filter(c => c.status === col).length;
          return (
            <button key={col} onClick={() => setStatusFilter(statusFilter === col ? '' : col)}
              className={`bg-white rounded-xl border p-3 text-center shadow-sm hover:shadow-md transition-all ${statusFilter === col ? 'ring-2 ring-teal-500' : 'border-gray-100'}`}>
              <div className={`w-2 h-2 rounded-full ${sc.dot} mx-auto mb-1.5`} />
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{sc.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by case #, client, advocate..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="flex items-center gap-1 px-3 py-2 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-200">
            <X className="w-3 h-3" /> Clear Filter
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
              <div key={col} className="bg-gray-50 rounded-2xl p-4 min-h-[200px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                  <h3 className="font-bold text-gray-700 text-sm">{sc.label}</h3>
                  <span className="ml-auto text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full">{colCases.length}</span>
                </div>
                <div className="space-y-3">
                  {colCases.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No cases</p>}
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
            <div className="p-8 text-center text-gray-400 animate-pulse">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No cases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Case #', 'Title', 'Client', 'Advocate', 'Status', 'Service', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cases.map(c => {
                    const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                    return (
                      <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">#{(c.caseNumber || c._id.slice(-6)).toUpperCase()}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{c.title || c.serviceType || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{c.client?.name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{c.advocate?.user?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 capitalize">{c.serviceType?.replace('_', ' ') || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelectedCase(c)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditCase({ ...c })} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* View Case Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Case Details</h3><button onClick={() => setSelectedCase(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Case #', value: (selectedCase.caseNumber || selectedCase._id.slice(-6)).toUpperCase() },
                  { label: 'Title', value: selectedCase.title || selectedCase.serviceType || '—' },
                  { label: 'Client', value: selectedCase.client?.name || '—' },
                  { label: 'Client Email', value: selectedCase.client?.email || '—' },
                  { label: 'Advocate', value: selectedCase.advocate?.user?.name || 'Not Assigned' },
                  { label: 'Status', value: STATUS_CONFIG[selectedCase.status]?.label },
                  { label: 'Service', value: selectedCase.serviceType || '—' },
                  { label: 'Created', value: new Date(selectedCase.createdAt).toLocaleString() },
                  { label: 'Last Updated', value: new Date(selectedCase.updatedAt).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
                {selectedCase.description && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedCase.description}</p>
                  </div>
                )}
                {selectedCase.notes && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Internal Notes</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedCase.notes}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedCase(null)} className="mt-5 w-full py-2.5 bg-gray-100 text-sm font-semibold rounded-xl hover:bg-gray-200">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Case Modal */}
      <AnimatePresence>
        {editCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold">Update Case</h2>
                <button onClick={() => setEditCase(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select value={editCase.status} onChange={e => setEditCase(p => p ? { ...p, status: e.target.value as any } : p)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Notes</label>
                  <textarea value={editCase.notes || ''} onChange={e => setEditCase(p => p ? { ...p, notes: e.target.value } : p)} rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" placeholder="Add internal notes..." />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditCase(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">Save Changes</button>
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
              <h3 className="font-bold text-gray-900 text-lg">Delete Case?</h3>
              <p className="text-sm text-gray-500 mt-1 mb-5">This cannot be undone.</p>
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
