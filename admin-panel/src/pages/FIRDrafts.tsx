import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Eye, X, FileText, User, Calendar,
  Upload, Download, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, Loader2
} from 'lucide-react';
import api from '../lib/api';

interface FIRDraft {
  _id: string;
  userId?: { _id: string; name: string; email: string; phone?: string };
  user?: { _id: string; name: string; email: string; phone?: string };
  firType?: string;
  type?: string;
  content?: string;
  status: string;
  incidentDate?: string;
  incidentLocation?: string;
  complainantName?: string;
  documents?: { url: string; name: string; type?: string }[];
  adminDocuments?: { url: string; name: string; uploadedAt?: string }[];
  createdAt: string;
  updatedAt?: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft:     { color: '#D97706', bg: '#FEF3C7', label: 'Draft' },
  submitted: { color: '#2563EB', bg: '#DBEAFE', label: 'Submitted' },
  reviewed:  { color: '#7C3AED', bg: '#EDE9FE', label: 'Reviewed' },
  completed: { color: '#059669', bg: '#DCFCE7', label: 'Completed' },
};

export default function FIRDrafts() {
  const [drafts, setDrafts] = useState<FIRDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FIRDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fetchDrafts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/admin/fir-drafts');
      setDrafts(res.data?.data || res.data || []);
    } catch (err: any) {
      console.error('Failed to load FIR drafts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const handleUpload = async (draftId: string, file: File) => {
    setUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('draftId', draftId);
    try {
      await api.post(`/admin/fir-drafts/${draftId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('✅ Document uploaded successfully!');
      fetchDrafts();
      if (selected?._id === draftId) {
        const res = await api.get(`/admin/fir-drafts/${draftId}`);
        setSelected(res.data?.data || res.data);
      }
    } catch (err: any) {
      setUploadStatus('❌ Upload failed. ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (draftId: string, status: string) => {
    try {
      await api.put(`/admin/fir-drafts/${draftId}/status`, { status });
      fetchDrafts();
      if (selected) setSelected({ ...selected, status });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filtered = drafts.filter(d => {
    const client = d.userId || d.user;
    const name = client?.name?.toLowerCase() || '';
    const email = client?.email?.toLowerCase() || '';
    const type = (d.firType || d.type || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || type.includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FIR Drafts</h1>
          <p className="text-slate-500 text-sm mt-1">{drafts.length} total drafts from clients</p>
        </div>
        <button
          onClick={() => fetchDrafts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by client name, email or FIR type..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No FIR drafts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Client', 'FIR Type', 'Location', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(draft => {
                  const client = draft.userId || draft.user;
                  const cfg = STATUS_CONFIG[draft.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={draft._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{client?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{client?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">{draft.firType || draft.type || 'General'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{draft.incidentLocation || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(draft.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelected(draft); setUploadStatus(null); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-slate-900">FIR Draft Details</h2>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Client Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><User className="w-4 h-4" /> Client</h3>
                  <p className="font-semibold text-slate-900">{(selected.userId || selected.user)?.name}</p>
                  <p className="text-sm text-slate-500">{(selected.userId || selected.user)?.email}</p>
                  {(selected.userId || selected.user)?.phone && <p className="text-sm text-slate-500">{(selected.userId || selected.user)?.phone}</p>}
                </div>

                {/* FIR Details */}
                <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2"><FileText className="w-4 h-4" /> FIR Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Type:</span> <span className="font-semibold ml-1">{selected.firType || selected.type || '—'}</span></div>
                    <div><span className="text-slate-500">Location:</span> <span className="font-semibold ml-1">{selected.incidentLocation || '—'}</span></div>
                    <div><span className="text-slate-500">Incident Date:</span> <span className="font-semibold ml-1">{selected.incidentDate ? new Date(selected.incidentDate).toLocaleDateString('en-IN') : '—'}</span></div>
                    <div><span className="text-slate-500">Complainant:</span> <span className="font-semibold ml-1">{selected.complainantName || '—'}</span></div>
                  </div>
                  {selected.content && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">Content:</p>
                      <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-amber-200 max-h-40 overflow-y-auto whitespace-pre-wrap">{selected.content}</p>
                    </div>
                  )}
                </div>

                {/* Status Update */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-slate-700">Update Status:</label>
                  <select
                    value={selected.status}
                    onChange={e => handleStatusChange(selected._id, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Client Documents */}
                {selected.documents && selected.documents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Client Documents ({selected.documents.length})</h3>
                    <div className="space-y-2">
                      {selected.documents.map((doc, i) => (
                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                          <Download className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 flex-1 truncate">{doc.name || `Document ${i + 1}`}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Upload */}
                <div className="border-2 border-dashed border-amber-200 rounded-xl p-5 bg-amber-50">
                  <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Document to Client</h3>
                  <input
                    type="file"
                    id="fir-upload"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(selected._id, f);
                      e.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="fir-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Choose & Upload File'}
                  </label>
                  {uploadStatus && (
                    <p className={`mt-2 text-sm text-center font-medium ${uploadStatus.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{uploadStatus}</p>
                  )}
                </div>

                {/* Admin Uploaded Docs */}
                {selected.adminDocuments && selected.adminDocuments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Admin Uploaded Documents</h3>
                    <div className="space-y-2">
                      {selected.adminDocuments.map((doc, i) => (
                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700 flex-1 truncate">{doc.name}</span>
                        </a>
                      ))}
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
