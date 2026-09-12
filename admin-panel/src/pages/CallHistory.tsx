import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Video, Clock, CheckCircle, XCircle, Search,
  RefreshCw, TrendingUp, Users, PhoneMissed, Timer,
} from 'lucide-react';
import api from '../lib/api';

interface CallRecord {
  _id: string;
  mode: 'video' | 'voice';
  status: 'completed' | 'missed' | 'rejected' | 'failed';
  duration: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  client:       { name: string; email?: string; avatar?: string };
  advocateUser: { name: string; email?: string; avatar?: string };
  booking?: { type?: string };
}

const MODE_CONFIG = {
  video: { label: 'Video', icon: Video,  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  voice: { label: 'Voice', icon: Phone,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

const STATUS_CONFIG = {
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  missed:    { label: 'Missed',    icon: PhoneMissed, color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  rejected:  { label: 'Rejected',  icon: XCircle,     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  failed:    { label: 'Failed',    icon: XCircle,     color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200' },
};

const formatDuration = (s: number) => {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const Avatar = ({ name, size = 'sm' }: { name?: string; size?: 'sm' | 'md' }) => {
  const initials = (name || '?')[0].toUpperCase();
  const dim = size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
  return (
    <div className={`${dim} rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
};

export default function CallHistory() {
  const [calls, setCalls]         = useState<CallRecord[]>([]);
  const [stats, setStats]         = useState({ totalToday: 0, missedCount: 0, avgDuration: 0 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'video' | 'voice'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'missed'>('all');

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterMode   !== 'all') params.mode   = filterMode;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/admin/call-history', { params });
      setCalls(data.data || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMode, filterStatus, search]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const totalCalls     = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const totalMinutes   = Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Call History</h1>
          <p className="text-slate-500 text-sm mt-0.5">All video & voice consultations across the platform</p>
        </div>
        <button onClick={fetchCalls}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls',   value: totalCalls,              icon: Phone,      grad: 'from-amber-500 to-orange-500' },
          { label: 'Completed',     value: completedCalls,          icon: CheckCircle, grad: 'from-emerald-500 to-teal-500' },
          { label: 'Missed Today',  value: stats.missedCount,       icon: PhoneMissed, grad: 'from-red-500 to-rose-500' },
          { label: 'Total Minutes', value: totalMinutes,            icon: Timer,       grad: 'from-blue-500 to-indigo-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by client or advocate name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
          />
        </div>
        {/* Mode filter */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['all', 'video', 'voice'] as const).map(m => (
            <button key={m} onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${filterMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {m}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['all', 'completed', 'missed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${filterStatus === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Call Records</span>
          <span className="text-xs text-slate-500">{calls.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Client', 'Advocate', 'Mode', 'Status', 'Duration', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : calls.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No call records found.</td></tr>
              ) : calls.map(call => {
                const modeCfg   = MODE_CONFIG[call.mode]   || MODE_CONFIG.video;
                const statusCfg = STATUS_CONFIG[call.status] || STATUS_CONFIG.failed;
                const ModeIcon   = modeCfg.icon;
                const StatusIcon = statusCfg.icon;
                return (
                  <motion.tr key={call._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={call.client?.name} />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{call.client?.name || '—'}</p>
                          <p className="text-xs text-slate-400">{call.client?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={call.advocateUser?.name} />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{call.advocateUser?.name || '—'}</p>
                          <p className="text-xs text-slate-400">{call.advocateUser?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${modeCfg.color} ${modeCfg.bg}`}>
                        <ModeIcon className="w-3 h-3" />{modeCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${statusCfg.color} ${statusCfg.bg}`}>
                        <StatusIcon className="w-3 h-3" />{statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDuration(call.duration)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(call.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <br />
                      <span className="text-[10px]">
                        {new Date(call.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
