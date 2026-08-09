import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, UserCheck, Clock, CheckCircle2, AlertTriangle,
  FileText, MessageSquare, Video, Phone, RefreshCw, X, ChevronDown,
  MapPin, Star, Eye, AlertCircle, Loader2, Users, ArrowRight,
  Download, Image as ImageIcon, Paperclip
} from 'lucide-react';
import api from '../lib/api';
import { connectAdminSocket, disconnectAdminSocket } from '../lib/socket';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Booking {
  _id: string;
  client: { _id: string; name: string; email: string; phone: string; avatar?: string; address?: any };
  advocate?: { _id: string; user?: { name: string; avatar?: string; phone?: string } };
  consultationMode: 'chat' | 'voice' | 'video';
  serviceType: string;
  issue: string;
  status: string;
  payment: { amount: number; status: string };
  documents: { url: string; name: string; type: string }[];
  clientCity?: string;
  assignmentDeadline: string;
  assignedAt?: string;
  assignedBy?: { name: string };
  chat?: string;
  videoRoomUrl?: string;
  sla?: { hoursRemaining: number; isOverdue: boolean; isUrgent: boolean };
  createdAt: string;
}

interface NearbyAdvocate {
  _id: string;
  user: { _id: string; name: string; avatar?: string; phone?: string; email?: string };
  specializations: string[];
  rating?: { average: number };
  consultationFee?: number;
  location?: { address?: { city?: string } };
  verificationStatus: string;
}

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  pending_assignment: { color: '#D97706', bg: '#FEF3C7', label: 'Awaiting Assignment', icon: <Clock size={13} /> },
  pending:           { color: '#7C3AED', bg: '#EDE9FE', label: 'Pending',              icon: <AlertCircle size={13} /> },
  confirmed:         { color: '#059669', bg: '#DCFCE7', label: 'Confirmed',            icon: <CheckCircle2 size={13} /> },
  in_progress:       { color: '#2563EB', bg: '#DBEAFE', label: 'In Progress',          icon: <Video size={13} /> },
  completed:         { color: '#0891B2', bg: '#E0F2FE', label: 'Completed',            icon: <CheckCircle2 size={13} /> },
  cancelled:         { color: '#DC2626', bg: '#FEE2E2', label: 'Cancelled',            icon: <X size={13} /> },
};

const MODE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  chat:  { icon: <MessageSquare size={14} />, label: 'Chat',       color: '#0891B2' },
  voice: { icon: <Phone size={14} />,         label: 'Voice Call', color: '#059669' },
  video: { icon: <Video size={14} />,         label: 'Video Call', color: '#7C3AED' },
};

const SERVICE_LABELS: Record<string, string> = {
  legal_advice:      'Legal Advice',
  legal_notice:      'Legal Notice',
  property_research: 'Property Research',
  fir_draft:         'FIR Draft',
  consultation:      'Consultation',
};

// ─── Countdown Component ──────────────────────────────────────────────────────
const SLABadge: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setIsOverdue(true); setTimeLeft('Overdue!'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setIsUrgent(h < 4);
      setTimeLeft(`${h}h ${m}m`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
      isOverdue ? 'bg-red-100 text-red-700' : isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      <Clock size={11} />
      {timeLeft}
    </span>
  );
};

// ─── Main Consultations Page ─────────────────────────────────────────────────
export default function Consultations() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending_assignment' | 'all'>('pending_assignment');
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [nearbyAdvocates, setNearbyAdvocates] = useState<NearbyAdvocate[]>([]);
  const [allAdvocates, setAllAdvocates] = useState<NearbyAdvocate[]>([]);
  const [advocateSearch, setAdvocateSearch] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);
  const [showAllAdvocates, setShowAllAdvocates] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const [newBookingAlert, setNewBookingAlert] = useState<{ clientName: string; serviceType: string } | null>(null);

  // ─── Fetch Bookings ──────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending_assignment' ? 'pending_assignment' : undefined;
      const res = await api.get('/admin/bookings', { params: { status, limit: 50 } });
      if (res.data?.success) setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ─── Real-time: Socket.io via admin_room ────────────────────────────────
  useEffect(() => {
    const socket = connectAdminSocket();
    if (!socket) {
      // Fallback: 30s poll if socket unavailable
      const poll = setInterval(() => {
        if (activeTab === 'pending_assignment') fetchBookings();
      }, 30000);
      return () => clearInterval(poll);
    }

    const handleNewBooking = (data: any) => {
      setNewBookingAlert({ clientName: data.clientName, serviceType: data.serviceType });
      setTimeout(() => setNewBookingAlert(null), 6000);
      fetchBookings(); // Refresh list immediately
    };

    const handlePaymentConfirmed = (data: any) => {
      fetchBookings(); // Refresh to show payment status update
    };

    socket.on('admin:new_booking',        handleNewBooking);
    socket.on('admin:payment_confirmed',  handlePaymentConfirmed);

    return () => {
      socket.off('admin:new_booking',       handleNewBooking);
      socket.off('admin:payment_confirmed', handlePaymentConfirmed);
    };
  }, [activeTab, fetchBookings]);

  // ─── Open assignment panel ───────────────────────────────────────────────
  const openPanel = async (booking: Booking) => {
    setSelectedBooking(booking);
    setPanelOpen(true);
    setShowAllAdvocates(false);
    setAdvocateSearch('');
    setLoadingNearby(true);
    try {
      const res = await api.get(`/admin/bookings/${booking._id}/nearby-advocates`);
      if (res.data?.success) {
        setNearbyAdvocates(res.data.data.nearbyAdvocates || []);
        setAllAdvocates(res.data.data.allAdvocates || []);
      }
    } catch (err) {
      console.error('Failed to fetch nearby advocates', err);
    } finally {
      setLoadingNearby(false);
    }
  };

  // ─── Assign Advocate ─────────────────────────────────────────────────────
  const handleAssign = async (advocateId: string, advocateName: string) => {
    if (!selectedBooking) return;
    if (!window.confirm(`Assign ${advocateName} to this case?`)) return;
    setAssigning(advocateId);
    try {
      const res = await api.post(`/admin/bookings/${selectedBooking._id}/assign`, {
        advocateId,
        sendWhatsApp: false, // Enable when WhatsApp Business account is ready
      });
      if (res.data?.success) {
        alert(`✅ ${advocateName} has been assigned successfully!\n\nClient and advocate have been notified via app.`);
        setPanelOpen(false);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      alert(`❌ Assignment failed: ${err?.response?.data?.message || 'Please try again.'}`);
    } finally {
      setAssigning(null);
    }
  };

  // ─── Update Status ───────────────────────────────────────────────────────
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // ─── Filtered Display ─────────────────────────────────────────────────────
  const filtered = bookings.filter(b => {
    const s = search.toLowerCase();
    const matchSearch = !s || b.client?.name?.toLowerCase().includes(s) ||
      b.issue?.toLowerCase().includes(s) || b._id.includes(s) || b.clientCity?.toLowerCase().includes(s);
    const matchService = !serviceFilter || b.serviceType === serviceFilter;
    return matchSearch && matchService;
  });

  const advocatesDisplay = (showAllAdvocates ? allAdvocates : nearbyAdvocates).filter(a => {
    if (!advocateSearch) return true;
    const q = advocateSearch.toLowerCase();
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q) ||
      a.location?.address?.city?.toLowerCase().includes(q) ||
      a.specializations?.some(s => s.toLowerCase().includes(q))
    );
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Real-time New Booking Toast ── */}
      <AnimatePresence>
        {newBookingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
          >
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-bold text-sm">New Booking Request!</p>
              <p className="text-xs text-emerald-100">
                {newBookingAlert.clientName} — {newBookingAlert.serviceType?.replace('_', ' ')}
              </p>
            </div>
            <button onClick={() => setNewBookingAlert(null)} className="ml-auto text-emerald-200 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage client legal advice & notice assignments</p>
          </div>
          <button onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'pending_assignment', label: 'Needs Assignment', urgentCount: bookings.filter(b => b.status === 'pending_assignment').length },
            { key: 'all', label: 'All Requests' }
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white shadow text-teal-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              {tab.urgentCount !== undefined && tab.urgentCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {tab.urgentCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search client, city, issue..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All Services</option>
          {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Stats row */}
      {activeTab === 'pending_assignment' && (
        <div className="px-6 mb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', count: bookings.filter(b => b.status === 'pending_assignment').length, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Urgent (<4h)', count: bookings.filter(b => b.sla?.isUrgent).length, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Overdue', count: bookings.filter(b => b.sla?.isOverdue).length, color: 'text-red-700', bg: 'bg-red-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
              <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Booking Cards Grid */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <span className="ml-3 text-gray-500">Loading requests...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {activeTab === 'pending_assignment' ? 'All requests have been assigned! 🎉' : 'No requests found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(booking => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const mode = MODE_CONFIG[booking.consultationMode] || MODE_CONFIG.chat;
              const isPending = booking.status === 'pending_assignment';

              return (
                <motion.div key={booking._id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-md cursor-pointer ${
                    isPending ? 'border-orange-200' : 'border-gray-100'
                  }`}
                  onClick={() => openPanel(booking)}>

                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                        style={{ color: mode.color }}>
                        {mode.icon} {mode.label}
                      </span>
                    </div>
                    {isPending && <SLABadge deadline={booking.assignmentDeadline} />}
                  </div>

                  {/* Client Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                        {booking.client?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{booking.client?.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {booking.clientCity && <><MapPin size={10} /> {booking.clientCity} · </>}
                          <span className="font-medium text-teal-600">{SERVICE_LABELS[booking.serviceType] || booking.serviceType}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                      {booking.issue}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`font-semibold ${booking.payment.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        ₹{booking.payment.amount} · {booking.payment.status === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                      {booking.documents?.length > 0 && (
                        <span className="flex items-center gap-1"><Paperclip size={11} /> {booking.documents.length} docs</span>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-4 pb-4">
                    {isPending ? (
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                        onClick={e => { e.stopPropagation(); openPanel(booking); }}>
                        <UserCheck size={15} /> Assign Advocate
                      </button>
                    ) : booking.advocate ? (
                      <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span className="text-xs text-green-700 font-medium">
                          Assigned to {booking.advocate.user?.name}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Assignment Side Panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && selectedBooking && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setPanelOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto">

              {/* Panel Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Assign Advocate</h2>
                    <p className="text-sm text-gray-500">
                      #{selectedBooking._id.slice(-8).toUpperCase()} · {SERVICE_LABELS[selectedBooking.serviceType]}
                    </p>
                  </div>
                  <button onClick={() => setPanelOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* ── Booking Details ── */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Request Details</h3>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Client</span><p className="font-semibold">{selectedBooking.client?.name}</p></div>
                    <div><span className="text-gray-500">Phone</span><p className="font-semibold">{selectedBooking.client?.phone || '—'}</p></div>
                    <div><span className="text-gray-500">City</span><p className="font-semibold">{selectedBooking.clientCity || '—'}</p></div>
                    <div><span className="text-gray-500">Mode</span>
                      <p className="font-semibold flex items-center gap-1" style={{ color: MODE_CONFIG[selectedBooking.consultationMode]?.color }}>
                        {MODE_CONFIG[selectedBooking.consultationMode]?.icon}
                        {MODE_CONFIG[selectedBooking.consultationMode]?.label}
                      </p>
                    </div>
                    <div><span className="text-gray-500">Amount</span><p className="font-semibold text-green-700">₹{selectedBooking.payment.amount}</p></div>
                    <div><span className="text-gray-500">SLA</span><SLABadge deadline={selectedBooking.assignmentDeadline} /></div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-gray-500 text-sm">Issue Description</span>
                    <p className="text-sm text-gray-800 mt-1 leading-relaxed">{selectedBooking.issue}</p>
                  </div>

                  {/* Documents */}
                  {selectedBooking.documents?.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <span className="text-gray-500 text-sm font-medium flex items-center gap-1 mb-2">
                        <Paperclip size={13} /> Documents ({selectedBooking.documents.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.documents.map((doc, i) => (
                          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            {doc.type === 'image' ? <ImageIcon size={12} /> : <FileText size={12} />}
                            {doc.name?.length > 20 ? doc.name.substring(0, 20) + '...' : doc.name || `Document ${i + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Status Actions ── */}
                {selectedBooking.status !== 'pending_assignment' && (
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {['confirmed', 'in_progress', 'completed', 'cancelled'].map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <button key={s}
                            onClick={() => handleUpdateStatus(selectedBooking._id, s)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-sm"
                            style={{ borderColor: cfg.color, color: cfg.color, backgroundColor: selectedBooking.status === s ? cfg.bg : 'white' }}>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Advocate Selection ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {showAllAdvocates ? (
                        <>All Advocates <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">{allAdvocates.length}</span></>
                      ) : (
                        <>
                          Nearby Advocates ({nearbyAdvocates.length})
                          {selectedBooking.clientCity && (
                            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                              in {selectedBooking.clientCity}
                            </span>
                          )}
                        </>
                      )}
                    </h3>
                    <button onClick={() => setShowAllAdvocates(v => !v)}
                      className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg">
                      {showAllAdvocates ? `Show Nearby (${nearbyAdvocates.length})` : `Show All (${allAdvocates.length})`}
                      <Users size={12} />
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={advocateSearch} onChange={e => setAdvocateSearch(e.target.value)}
                      placeholder="Search advocate by name, city, email, or specialization..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>

                  {loadingNearby ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-teal-500 mr-2" size={20} />
                      <span className="text-sm text-gray-500">Finding nearby advocates...</span>
                    </div>
                  ) : advocatesDisplay.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Users size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No advocates found.</p>
                      {!showAllAdvocates && (
                        <button onClick={() => setShowAllAdvocates(true)}
                          className="mt-2 text-teal-600 text-sm font-semibold hover:underline">
                          Show all advocates →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {advocatesDisplay.map(adv => (
                        <motion.div key={adv._id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl hover:border-teal-200 hover:bg-teal-50/30 transition-all">

                          <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                            {adv.user?.avatar ? (
                              <img src={adv.user.avatar} className="w-11 h-11 rounded-full object-cover" alt="" />
                            ) : (
                              adv.user?.name?.charAt(0)?.toUpperCase()
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{adv.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {adv.specializations?.slice(0, 2).join(', ') || 'General Practice'}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {adv.rating?.average && (
                                <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                                  <Star size={10} fill="currentColor" /> {adv.rating.average.toFixed(1)}
                                </span>
                              )}
                              {adv.consultationFee && (
                                <span className="text-xs text-green-600 font-medium">₹{adv.consultationFee}</span>
                              )}
                              {adv.location?.address?.city && (
                                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                  <MapPin size={9} /> {adv.location.address.city}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAssign(adv._id, adv.user?.name || 'Advocate')}
                            disabled={!!assigning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors whitespace-nowrap flex-shrink-0">
                            {assigning === adv._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                            Assign
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
