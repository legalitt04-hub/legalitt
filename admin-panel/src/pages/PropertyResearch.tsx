import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Eye, X, FileText, User,
  Upload, Download, CheckCircle2, Loader2, MapPin, Building
} from 'lucide-react';
import api from '../lib/api';

interface PropertyRequest {
  _id: string;
  client?: { _id: string; name: string; email: string; phone?: string };
  user?: { _id: string; name: string; email: string; phone?: string };
  propertyAddress?: string;
  propertyType?: string;
  surveyNumber?: string;
  registrationNumber?: string;
  district?: string;
  state?: string;
  purpose?: string;
  status: string;
  payment?: { amount: number; status: string };
  documents?: { url: string; name: string }[];
  adminDocuments?: { url: string; name: string; uploadedAt?: string }[];
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  processing: { color: '#2563EB', bg: '#DBEAFE', label: 'Processing' },
  completed:  { color: '#059669', bg: '#DCFCE7', label: 'Completed' },
  rejected:   { color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' },
};

export default function PropertyResearch() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PropertyRequest | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/admin/property-research');
      setRequests(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load property research:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleUpload = async (id: string, file: File) => {
    setUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append('document', file);
    try {
      await api.post(`/admin/property-research/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('✅ Report uploaded successfully!');
      fetchRequests();
    } catch (err: any) {
      setUploadStatus('❌ Upload failed. ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/property-research/${id}/status`, { status });
      fetchRequests();
      if (selected) setSelected({ ...selected, status });
    } catch (err) { console.error('Status update failed:', err); }
  };

  const filtered = requests.filter(r => {
    const client = r.client || r.user;
    const q = search.toLowerCase();
    return (
      client?.name?.toLowerCase().includes(q) ||
      client?.email?.toLowerCase().includes(q) ||
      r.propertyAddress?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Property Research</h1>
          <p className="text-slate-500 text-sm mt-1">{requests.length} total requests</p>
        </div>
        <button onClick={() => fetchRequests(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by client, address, district..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No property research requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Client', 'Property', 'District/State', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(req => {
                  const client = req.client || req.user;
                  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{client?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{client?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700 max-w-[180px] truncate">{req.propertyAddress || '—'}</div>
                        <div className="text-xs text-slate-400">{req.propertyType || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{[req.district, req.state].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-4 py-3">
                        {req.payment ? (
                          <div>
                            <div className="font-semibold text-slate-900">₹{req.payment.amount}</div>
                            <div className={`text-xs ${req.payment.status === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
                              {req.payment.status}
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setSelected(req); setUploadStatus(null); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-slate-900">Property Research Details</h2>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Client */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><User className="w-4 h-4" /> Client Info</h3>
                  <p className="font-semibold text-slate-900">{(selected.client || selected.user)?.name}</p>
                  <p className="text-sm text-slate-500">{(selected.client || selected.user)?.email}</p>
                </div>

                {/* Property Details */}
                <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Property Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Address:</span> <span className="font-semibold ml-1">{selected.propertyAddress || '—'}</span></div>
                    <div><span className="text-slate-500">Type:</span> <span className="font-semibold ml-1">{selected.propertyType || '—'}</span></div>
                    <div><span className="text-slate-500">Survey No:</span> <span className="font-semibold ml-1">{selected.surveyNumber || '—'}</span></div>
                    <div><span className="text-slate-500">Reg No:</span> <span className="font-semibold ml-1">{selected.registrationNumber || '—'}</span></div>
                    <div><span className="text-slate-500">District:</span> <span className="font-semibold ml-1">{selected.district || '—'}</span></div>
                    <div><span className="text-slate-500">State:</span> <span className="font-semibold ml-1">{selected.state || '—'}</span></div>
                  </div>
                  {selected.purpose && <div><span className="text-slate-500 text-sm">Purpose:</span> <span className="text-sm font-semibold ml-1">{selected.purpose}</span></div>}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-slate-700">Update Status:</label>
                  <select value={selected.status} onChange={e => handleStatusChange(selected._id, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                {/* Client Documents */}
                {selected.documents && selected.documents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Client Documents</h3>
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
                  <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Report to Client</h3>
                  <input type="file" id="prop-upload" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(selected._id, f); e.target.value = ''; }} />
                  <label htmlFor="prop-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Choose & Upload Report'}
                  </label>
                  {uploadStatus && <p className={`mt-2 text-sm text-center font-medium ${uploadStatus.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{uploadStatus}</p>}
                </div>

                {((selected.adminDocuments?.length || 0) + (selected.advocateDocuments?.length || 0)) > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Admin Uploaded Reports</h3>
                    <div className="space-y-2">
                      {[...(selected.adminDocuments || []), ...(selected.advocateDocuments || [])].map((doc, i) => (
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
