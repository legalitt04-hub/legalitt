import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Play, Pause, Eye, MousePointer,
  BarChart3, X, Upload, Calendar, Target, Megaphone, Image,
  Layout, RefreshCw, ChevronDown, Globe, Zap
} from 'lucide-react';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ad {
  _id: string;
  title: string;
  description?: string;
  adType: 'banner' | 'popup' | 'carousel' | 'interstitial' | 'native';
  placement: string;
  status: 'active' | 'paused' | 'scheduled' | 'completed' | 'draft';
  imageUrl?: string;
  ctaText: string;
  redirectUrl?: string;
  targetUserType: 'all' | 'client' | 'advocate';
  targetCities: string[];
  targetStates: string[];
  startDate: string;
  endDate?: string;
  frequencyCap: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  createdAt: string;
}

const EMPTY_FORM: Partial<Ad> = {
  title: '', description: '', adType: 'banner', placement: 'home',
  status: 'draft', ctaText: 'Learn More', redirectUrl: '',
  targetUserType: 'all', targetCities: [], targetStates: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: '', frequencyCap: 0, imageUrl: '',
};

const AD_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  banner:       { label: 'Banner',       color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    icon: <Image className="w-3 h-3" /> },
  popup:        { label: 'Popup',        color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200', icon: <Layout className="w-3 h-3" /> },
  carousel:     { label: 'Carousel',     color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200',     icon: <Globe className="w-3 h-3" /> },
  interstitial: { label: 'Interstitial', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   icon: <Zap className="w-3 h-3" /> },
  native:       { label: 'Native',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <Target className="w-3 h-3" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:    { label: 'Active',    color: 'text-emerald-700 bg-emerald-50',  dot: 'bg-emerald-500' },
  paused:    { label: 'Paused',    color: 'text-amber-700 bg-amber-50',      dot: 'bg-amber-500' },
  scheduled: { label: 'Scheduled', color: 'text-blue-700 bg-blue-50',        dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'text-gray-700 bg-gray-100',       dot: 'bg-gray-400' },
  draft:     { label: 'Draft',     color: 'text-slate-600 bg-slate-100',     dot: 'bg-slate-400' },
};

const PLACEMENTS = ['home', 'dashboard', 'ai_pages', 'consultation_pages', 'document_pages', 'all'];

export default function AdsManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [form, setForm] = useState<Partial<Ad>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.adType = typeFilter;
      const { data } = await api.get('/admin/ads', { params });
      setAds(data.data || []);
    } catch { setAds([]); }
    finally { setLoading(false); }
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const openCreate = () => { setEditAd(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (ad: Ad) => { setEditAd(ad); setForm(ad); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title?.trim()) return alert('Title is required.');
    setSaving(true);
    try {
      if (editAd) {
        await api.patch(`/admin/ads/${editAd._id}`, form);
      } else {
        await api.post('/admin/ads', form);
      }
      setShowForm(false);
      fetchAds();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save ad.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (ad: Ad) => {
    try {
      await api.patch(`/admin/ads/${ad._id}/toggle`);
      fetchAds();
    } catch { alert('Failed to toggle status.'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/ads/${id}`);
      setDeleteId(null);
      fetchAds();
    } catch { alert('Failed to delete ad.'); }
  };

  const filtered = ads.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.placement.includes(search.toLowerCase())
  );

  // Summary stats
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const avgCTR = ads.length ? (totalClicks / Math.max(1, totalImpressions) * 100).toFixed(2) : '0';
  const activeCount = ads.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage dynamic advertisements across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAds} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
            <Plus className="w-4 h-4" /> Create Ad
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Ads', value: ads.length, icon: <Megaphone className="w-5 h-5 text-white" />, bg: 'bg-teal-500' },
          { label: 'Active', value: activeCount, icon: <Play className="w-5 h-5 text-white" />, bg: 'bg-emerald-500' },
          { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: <Eye className="w-5 h-5 text-white" />, bg: 'bg-indigo-500' },
          { label: 'Avg CTR', value: `${avgCTR}%`, icon: <MousePointer className="w-5 h-5 text-white" />, bg: 'bg-violet-500' },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>{k.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ads..." className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Types</option>
          {Object.keys(AD_TYPE_CONFIG).map(t => <option key={t} value={t}>{AD_TYPE_CONFIG[t].label}</option>)}
        </select>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading ads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No ads found</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-teal-600 text-white text-sm rounded-xl font-semibold">Create First Ad</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Ad Title', 'Type', 'Placement', 'Status', 'Impressions', 'Clicks', 'CTR', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(ad => {
                  const typeConf = AD_TYPE_CONFIG[ad.adType];
                  const statusConf = STATUS_CONFIG[ad.status];
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0';
                  return (
                    <tr key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{ad.title}</p>
                          {ad.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{ad.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${typeConf?.bg} ${typeConf?.color}`}>
                          {typeConf?.icon} {typeConf?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 capitalize">{ad.placement.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConf?.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf?.dot}`} />
                          {statusConf?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{ad.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-indigo-600">{ad.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-teal-600">{ctr}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(ad)} title={ad.status === 'active' ? 'Pause' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${ad.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                            {ad.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openEdit(ad)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(ad._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{editAd ? 'Edit Advertisement' : 'Create New Advertisement'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                    <input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Get Legal Help Today - 50% Off" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ad Type</label>
                    <select value={form.adType} onChange={e => setForm(p => ({ ...p, adType: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      {Object.entries(AD_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Placement</label>
                    <select value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      {PLACEMENTS.map(pl => <option key={pl} value={pl}>{pl.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Users</label>
                    <select value={form.targetUserType} onChange={e => setForm(p => ({ ...p, targetUserType: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      <option value="all">All Users</option>
                      <option value="client">Clients Only</option>
                      <option value="advocate">Advocates Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                    <input value={form.imageUrl || ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">CTA Text</label>
                    <input value={form.ctaText || ''} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Learn More" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Redirect URL</label>
                    <input value={form.redirectUrl || ''} onChange={e => setForm(p => ({ ...p, redirectUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Cities (comma separated)</label>
                    <input value={(form.targetCities || []).join(', ')} onChange={e => setForm(p => ({ ...p, targetCities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Mumbai, Delhi, Bhopal" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target States (comma separated)</label>
                    <input value={(form.targetStates || []).join(', ')} onChange={e => setForm(p => ({ ...p, targetStates: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Maharashtra, MP" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={form.startDate?.split('T')[0] || ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                    <input type="date" value={form.endDate?.split('T')[0] || ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency Cap (0 = unlimited)</label>
                    <input type="number" min={0} value={form.frequencyCap || 0} onChange={e => setForm(p => ({ ...p, frequencyCap: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {saving ? 'Saving...' : editAd ? 'Update Ad' : 'Create Ad'}
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Delete Ad?</h3>
              <p className="text-sm text-gray-500 text-center mt-1">This cannot be undone.</p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(deleteId!)} className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
