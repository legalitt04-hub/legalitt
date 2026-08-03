import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import { MessageSquare, Search, Filter, UserCheck, Paperclip, Send, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import api from '../lib/api';

export default function Consultations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [resConsults, resAdvs] = await Promise.all([
        api.get('/admin/cases'),
        api.get('/admin/advocates')
      ]);
      if (resConsults.data?.success) {
        setConsultations(resConsults.data.data);
      }
      if (resAdvs.data?.success) {
        setAdvocates(resAdvs.data.data);
      }
    } catch (err) {
      console.error('Failed to load consultations data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedConsultation) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/cases/${selectedConsultation._id}`, { status });
      setSelectedConsultation({ ...selectedConsultation, status });
      fetchData();
    } catch (err) {
      alert('Failed to update consultation status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAdvocate = async (advocateId: string) => {
    if (!selectedConsultation) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/cases/${selectedConsultation._id}`, { assignedAdvocate: advocateId });
      const adv = advocates.find(a => a._id === advocateId || a.user?._id === advocateId);
      setSelectedConsultation({ ...selectedConsultation, assignedAdvocate: adv ? { name: adv.user?.name || adv.name } : null });
      fetchData();
    } catch (err) {
      alert('Failed to assign advocate');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase()) || c._id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            Chat Consultations ⭐
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage all client-advocate chat requests, advocate assignments, and status lifecycles.</p>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by ID, Client, or Subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-amber-500 w-full"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Hearing Scheduled">Hearing Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </Card>

      {/* Consultations Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Consultation ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Service Category</th>
                <th className="p-4">Assigned Advocate</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading consultations...</td></tr>
              ) : filteredConsultations.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No chat consultations found.</td></tr>
              ) : (
                filteredConsultations.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-900">{c._id?.substring(0, 8)}</td>
                    <td className="p-4 font-semibold text-slate-900">{c.client?.name || 'Client'}</td>
                    <td className="p-4 text-slate-600">{c.title || c.type}</td>
                    <td className="p-4 font-medium text-slate-700">{c.assignedAdvocate?.name || 'Unassigned'}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize bg-amber-50 text-amber-700 border-amber-200">
                        {c.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button onClick={() => { setSelectedConsultation(c); setIsModalOpen(true); }} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                        Open Workspace
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Consultation Action Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Chat Consultation Workspace">
        {selectedConsultation && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-lg font-bold text-slate-900 mb-1">{selectedConsultation.title}</h4>
              <p className="text-xs text-slate-500 font-mono">ID: {selectedConsultation._id}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Client Name</p>
                  <p className="font-semibold text-slate-900">{selectedConsultation.client?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Current Advocate</p>
                  <p className="font-semibold text-slate-900">{selectedConsultation.assignedAdvocate?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            {/* Status & Re-assign Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Change Consultation Status</label>
                <select
                  value={selectedConsultation.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={actionLoading}
                  className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Assign / Change Advocate</label>
                <select
                  onChange={(e) => handleAssignAdvocate(e.target.value)}
                  disabled={actionLoading}
                  className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Advocate...</option>
                  {advocates.map(a => (
                    <option key={a._id} value={a._id}>{a.user?.name || a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulated Live Chat Messenger Area */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-white">
              <div className="p-3 bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>Live Consultation Transcript & Admin Relay</span>
                <span className="text-amber-400">Chat Active</span>
              </div>
              <div className="p-4 h-48 overflow-y-auto space-y-3 font-sans text-xs">
                <div className="bg-slate-800 p-2.5 rounded max-w-[80%]">
                  <span className="font-bold text-amber-400 block mb-0.5">{selectedConsultation.client?.name || 'Client'}</span>
                  <span>Hello Advocate, I need guidance regarding property title deed verification.</span>
                </div>
                <div className="bg-amber-600 p-2.5 rounded max-w-[80%] ml-auto text-white">
                  <span className="font-bold text-white block mb-0.5">{selectedConsultation.assignedAdvocate?.name || 'Advocate'}</span>
                  <span>Please share the sale deed PDF so I can review the clauses.</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800 border-t border-slate-700 flex gap-2">
                <Input
                  placeholder="Type an official admin message to relay into chat..."
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs"
                />
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="bg-white border-slate-200">
                Close Workspace
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
