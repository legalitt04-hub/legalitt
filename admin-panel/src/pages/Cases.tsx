import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Filter, Briefcase, ChevronRight, FileText, Clock, User, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/input';

import api from '../lib/api';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Pending Review': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Hearing Scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function Cases() {
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/admin/cases');
        if (res.data.success) {
          setCases(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching cases', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c._id?.toLowerCase().includes(search.toLowerCase())
  );
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
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
            <Briefcase className="w-6 h-6 text-amber-500" />
            Case Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track and manage all active legal cases across the platform.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm transition-colors shadow-sm">
            New Case
          </button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search cases by ID, title, client, or advocate..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/50">
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending Review</option>
              <option value="hearing">Hearing Scheduled</option>
              <option value="closed">Closed</option>
            </select>
            <button className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Case List */}
        <div className="divide-y divide-slate-100">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No cases found.</div>
          ) : (
            filteredCases.map((kase) => (
              <div key={kase._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-4 group cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kase._id.substring(0, 12)}</span>
                    <Badge variant="outline" className={`${getStatusColor(kase.status)} text-[10px] font-semibold px-2 py-0.5`}>
                      {kase.status}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 text-[10px] font-semibold px-2 py-0.5">
                      {kase.type || 'General'}
                    </Badge>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {kase.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Client: <span className="font-medium text-slate-700">{kase.client?.name || 'Unknown'}</span></span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Adv: <span className="font-medium text-slate-700">{kase.assignedAdvocate?.name || 'Unassigned'}</span></span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {new Date(kase.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 md:pl-4 md:border-l border-slate-100 shrink-0">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
