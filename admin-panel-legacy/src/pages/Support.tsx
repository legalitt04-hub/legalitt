import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LifeBuoy, Search, Filter, MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import api from '../lib/api';

const timeAgo = (dateStr: string) => {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export default function Support() {
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/admin/support-tickets');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdateLoading(true);
    try {
      await api.put(`/admin/support-tickets/${selectedTicket._id}`, { status: selectedTicket.status });
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket');
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-rose-500" />
            Support Center
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage client and advocate support tickets.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Open Live Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Open Tickets</p>
              <p className="text-2xl font-bold text-slate-900">24</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg Response</p>
              <p className="text-2xl font-bold text-slate-900">1.2 hrs</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved Today</p>
              <p className="text-2xl font-bold text-slate-900">18</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200 flex items-center justify-center">
           <button className="text-sm font-medium text-slate-600 hover:text-rose-600 underline">View Full Analytics</button>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search tickets by ID, subject, or user..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-rose-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/50">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <button className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No support tickets found.</div>
          ) : (
            filteredTickets.map(ticket => (
              <div key={ticket._id} onClick={() => { setSelectedTicket(ticket); setIsModalOpen(true); }} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                  {ticket.user?.name ? ticket.user.name.substring(0,2) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">{ticket._id.substring(0, 8)}</span>
                    <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} text-[10px] font-bold px-2 py-0 capitalize`}>
                      {ticket.priority || 'Medium'} Priority
                    </Badge>
                    {ticket.status === 'open' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{ticket.user?.name || 'Unknown User'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">{ticket.user?.role || 'User'}</span>
                    <span>•</span>
                    <span>{timeAgo(ticket.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <Badge variant="outline" className={`capitalize
                    ${ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                    ${ticket.status === 'open' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                    ${ticket.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  `}>
                    {ticket.status || 'open'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Support Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Support Ticket Details">
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h4>
                <Badge variant="outline" className={`${getPriorityColor(selectedTicket.priority)} text-[10px] font-bold px-2 py-0 capitalize`}>
                  {selectedTicket.priority || 'Medium'} Priority
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mb-4">Ticket ID: {selectedTicket._id}</p>
              
              <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                {selectedTicket.description || 'No description provided.'}
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{selectedTicket.user?.name || 'Unknown User'}</span>
                <span>•</span>
                <span>{timeAgo(selectedTicket.createdAt)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ticket Status</label>
              <select
                value={selectedTicket.status}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="bg-white border-slate-200">
                Close
              </Button>
              <Button type="submit" disabled={updateLoading} className="bg-rose-500 hover:bg-rose-600 text-white">
                {updateLoading ? 'Saving...' : 'Update Ticket'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}
