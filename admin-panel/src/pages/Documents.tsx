import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Search, Upload, Download, Eye, RefreshCw,
  ArrowRight, ArrowLeft, X, FileText, Image, File,
  Filter, ChevronLeft, ChevronRight, User, Briefcase,
  CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fileIcon = (name = '', type = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '') || type.includes('image'))
    return <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold"><Image className="w-4 h-4" /></div>;
  if (ext === 'pdf')
    return <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">PDF</div>;
  if (['doc', 'docx'].includes(ext || ''))
    return <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">DOC</div>;
  return <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><File className="w-4 h-4" /></div>;
};

const directionBadge: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  client_to_advocate: {
    label: 'Client → Advocate',
    cls: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: <ArrowRight className="w-3 h-3" />,
  },
  advocate_to_client: {
    label: 'Advocate → Client',
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: <ArrowLeft className="w-3 h-3" />,
  },
  standalone: {
    label: 'Direct Upload',
    cls: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: <Upload className="w-3 h-3" />,
  },
};

// ── Bookings selector for upload ─────────────────────────────────────────────
interface Booking { _id: string; client?: { name: string }; serviceType?: string; advocate?: { user?: { name: string } } }

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<any>({});
  const [preview, setPreview] = useState<any>(null);
  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSide, setUploadSide] = useState<'client' | 'advocate'>('advocate');
  const [bookingId, setBookingId] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 25;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (direction) params.direction = direction;
      if (search) params.search = search;
      const { data } = await api.get('/admin/documents', { params });
      setDocs(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
      setCounts(data.counts || {});
    } catch { setDocs([]); }
    finally { setLoading(false); }
  }, [page, direction, search]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // Fetch bookings for upload selector
  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/admin/consultations', { params: { limit: 100 } });
      setBookings(data.data || []);
    } catch { /* ignore */ }
  };

  const handleUpload = async () => {
    if (!uploadFile || !bookingId) {
      setUploadError('Please select a booking and a file.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('bookingId', bookingId);
      fd.append('side', uploadSide);
      await api.post('/admin/documents/upload-for-booking', fd);
      setUploadSuccess(`Document uploaded successfully on the ${uploadSide} side!`);
      setUploadFile(null);
      setBookingId('');
      if (fileRef.current) fileRef.current.value = '';
      fetchDocs();
    } catch (e: any) {
      setUploadError(e?.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const statCards = [
    { label: 'Total Documents', value: counts.total || total, icon: FolderOpen, bg: 'bg-slate-50', tc: 'text-slate-600' },
    { label: 'Client → Advocate', value: counts.clientToAdvocate || 0, icon: ArrowRight, bg: 'bg-teal-50', tc: 'text-teal-600' },
    { label: 'Advocate → Client', value: counts.advocateToClient || 0, icon: ArrowLeft, bg: 'bg-indigo-50', tc: 'text-indigo-600' },
    { label: 'Standalone', value: counts.standalone || 0, icon: Upload, bg: 'bg-amber-50', tc: 'text-amber-600' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-teal-600" /> Document Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View all docs shared between clients & advocates. Upload on behalf of any side.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDocs} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setShowUpload(true); fetchBookings(); setUploadSuccess(''); setUploadError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
            <Upload className="w-4 h-4" /> Upload Document
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
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Direction Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All Documents' },
          { value: 'client_to_advocate', label: 'Client → Advocate' },
          { value: 'advocate_to_client', label: 'Advocate → Client' },
          { value: 'standalone', label: 'Standalone' },
        ].map(t => (
          <button key={t.value} onClick={() => { setDirection(t.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              direction === t.value
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by file name, client name, advocate name..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading documents...</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No documents found</p>
            <p className="text-xs text-gray-400 mt-1">Documents uploaded in bookings will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['File', 'Direction', 'Uploaded By', 'Recipient', 'Service', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map((doc, idx) => {
                  const dir = directionBadge[doc.direction] || directionBadge.standalone;
                  return (
                    <tr key={doc._id || idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {fileIcon(doc.name, doc.type)}
                          <div>
                            <p className="font-semibold text-gray-900 max-w-[200px] truncate">{doc.name || 'Unnamed File'}</p>
                            {doc.source === 'booking' && (
                              <p className="text-xs text-gray-400">Booking doc</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${dir.cls}`}>
                          {dir.icon}{dir.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.uploadedBy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {doc.uploadedBy?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs text-gray-700">{doc.uploadedBy?.name || '—'}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {doc.recipient ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {doc.recipient?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs text-gray-700">{doc.recipient?.name || '—'}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold capitalize">
                          {doc.serviceType?.replace(/_/g, ' ') || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setPreview(doc)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="Preview">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100" title="Download">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
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

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Document Preview</h3>
                <button onClick={() => setPreview(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  {fileIcon(preview.name, preview.type)}
                  <div>
                    <p className="font-semibold text-gray-900">{preview.name}</p>
                    <p className="text-xs text-gray-500">{preview.type?.toUpperCase() || 'File'}</p>
                  </div>
                </div>
                {preview.url && (preview.type?.includes('image') || ['jpg','jpeg','png','webp'].includes(preview.name?.split('.').pop()?.toLowerCase() || '')) && (
                  <img src={preview.url} alt={preview.name} className="w-full rounded-xl border border-gray-200 max-h-64 object-contain" />
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Direction', value: directionBadge[preview.direction]?.label || '—' },
                    { label: 'Uploaded By', value: preview.uploadedBy?.name || '—' },
                    { label: 'Recipient', value: preview.recipient?.name || '—' },
                    { label: 'Service', value: preview.serviceType?.replace(/_/g, ' ') || '—' },
                    { label: 'Date', value: preview.uploadedAt ? new Date(preview.uploadedAt).toLocaleString('en-IN') : '—' },
                    { label: 'Source', value: preview.source === 'booking' ? 'Booking Document' : 'Direct Upload' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-semibold text-gray-800 text-sm capitalize">{value}</p>
                    </div>
                  ))}
                </div>
                {preview.url && (
                  <a href={preview.url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
                    <Download className="w-4 h-4" /> Open / Download File
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Upload Document</h3>
                <button onClick={() => setShowUpload(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Side selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Upload As</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['client', 'advocate'] as const).map(side => (
                      <button key={side} onClick={() => setUploadSide(side)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          uploadSide === side ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        {side === 'client' ? <User className="w-4 h-4 text-teal-600" /> : <Briefcase className="w-4 h-4 text-indigo-600" />}
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${uploadSide === side ? 'text-teal-700' : 'text-gray-700'}`}>
                            {side === 'client' ? 'Client Side' : 'Advocate Side'}
                          </p>
                          <p className="text-xs text-gray-400">{side === 'client' ? 'Client → Advocate' : 'Advocate → Client'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Booking / Case</label>
                  <select value={bookingId} onChange={e => setBookingId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">— Choose a booking —</option>
                    {bookings.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.client?.name || 'Unknown'} · {b.serviceType?.replace(/_/g, ' ')} · #{b._id.slice(-6).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select File</label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                    onClick={() => fileRef.current?.click()}>
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    {uploadFile ? (
                      <p className="text-sm font-semibold text-teal-700">{uploadFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-600">Click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG — max 10MB</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />{uploadSuccess}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowUpload(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleUpload} disabled={uploading || !uploadFile || !bookingId}
                    className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {uploading ? 'Uploading...' : `Upload as ${uploadSide === 'advocate' ? 'Advocate' : 'Client'}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
