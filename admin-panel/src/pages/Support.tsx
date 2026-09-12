import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy, Search, MessageSquare, AlertCircle, Clock,
  CheckCircle, Bug, Users, User, Send, X, RefreshCw, Filter,
} from 'lucide-react';
import api from '../lib/api';

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  user: { name: string; email?: string; avatar?: string; role?: string };
  messages: { message: string; isStaff: boolean; createdAt: string }[];
}

const PRIORITY_CFG = {
  low:    { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  medium: { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  high:   { color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  urgent: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

const STATUS_CFG = {
  open:         { color: 'text-red-700',     bg: 'bg-red-50 border-red-200',     dot: 'bg-red-500'     },
  'in-progress':{ color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500'   },
  resolved:     { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500'},
  closed:       { color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400'  },
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Avatar = ({ name }: { name?: string }) => (
  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function Support() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [stats, setStats]         = useState({ openCount: 0, bugCount: 0, resolvedToday: 0 });
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<'all' | 'client' | 'advocate' | 'bug'>('all');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [selected, setSelected]   = useState<Ticket | null>(null);
  const [reply, setReply]         = useState('');
  const [replying, setReplying]   = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (tab === 'bug') params.category = 'bug';
      else if (tab !== 'all') params.role = tab;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/admin/support-tickets', { params });
      setTickets(data.data || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setReplying(true);
    try {
      const { data } = await api.post(`/admin/support-tickets/${selected._id}/reply`, { message: reply });
      setSelected(data.data);
      setReply('');
      fetchTickets();
    } catch { alert('Failed to send reply.'); }
    finally { setReplying(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await api.put(`/admin/support-tickets/${id}`, { status });
      setSelected(data.data);
      fetchTickets();
    } catch { alert('Failed to update status.'); }
  };

  const TABS = [
    { key: 'all',      label: 'All Tickets', icon: LifeBuoy,  count: tickets.length },
    { key: 'client',   label: 'Clients',     icon: User,      count: tickets.filter(t => t.user?.role === 'client').length },
    { key: 'advocate', label: 'Advocates',   icon: Users,     count: tickets.filter(t => t.user?.role === 'advocate').length },
    { key: 'bug',      label: 'Bug Reports', icon: Bug,       count: stats.bugCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-rose-500" /> Support Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage client and advocate support tickets</p>
        </div>
        <button onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Tickets',   value: stats.openCount,    icon: AlertCircle, grad: 'from-rose-500 to-pink-500' },
          { label: 'Bug Reports',    value: stats.bugCount,     icon: Bug,         grad: 'from-orange-500 to-red-500' },
          { label: 'Resolved Today', value: stats.resolvedToday,icon: CheckCircle, grad: 'from-emerald-500 to-teal-500' },
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

      {/* Role Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search + Status Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Search by subject, name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700 bg-white">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tickets</span>
          <span className="text-xs text-slate-500">{tickets.length} total</span>
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No tickets found.</div>
          ) : tickets.map(ticket => {
            const sc = STATUS_CFG[ticket.status] || STATUS_CFG.open;
            const pc = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG.medium;
            const isBug = ticket.category === 'bug';
            return (
              <motion.div key={ticket._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelected(ticket)}
                className="p-4 hover:bg-slate-50/70 cursor-pointer transition-colors flex items-start gap-3">
                <Avatar name={ticket.user?.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {ticket.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${pc.bg} ${pc.color}`}>
                      {ticket.priority}
                    </span>
                    {isBug && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-1">
                        <Bug className="w-2.5 h-2.5" /> Bug
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                      {ticket.user?.role || 'user'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">{ticket.user?.name || '—'}</span>
                    <span>·</span>
                    <span>{timeAgo(ticket.createdAt)}</span>
                    {ticket.messages?.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-rose-500 flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" /> {ticket.messages.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>

              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.user?.name} />
                  <div>
                    <p className="font-bold text-slate-900">{selected.user?.name}</p>
                    <p className="text-xs text-slate-400">{selected.user?.email} · {selected.user?.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Subject + badges */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{selected.subject}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {[selected.status, selected.priority, selected.category].map(b => (
                      <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize border border-slate-200">{b}</span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                  {selected.description}
                </div>

                {/* Status control */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</label>
                  <select defaultValue={selected.status}
                    onChange={e => updateStatus(selected._id, e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700">
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Message thread */}
                {selected.messages?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversation</p>
                    {selected.messages.map((m, i) => (
                      <div key={i} className={`flex ${m.isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.isStaff
                            ? 'bg-rose-500 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                        }`}>
                          {m.isStaff && <p className="text-[10px] text-rose-100 mb-1 font-semibold">Support Team</p>}
                          <p>{m.message}</p>
                          <p className={`text-[10px] mt-1 ${m.isStaff ? 'text-rose-100' : 'text-slate-400'}`}>
                            {timeAgo(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Reply to user..."
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                />
                <button onClick={sendReply} disabled={replying || !reply.trim()}
                  className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-40">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
