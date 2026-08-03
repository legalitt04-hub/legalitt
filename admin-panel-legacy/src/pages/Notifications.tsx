import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Bell, Search, Filter, Send, MessageSquare, Mail, Smartphone, Edit2, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';

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

export default function Notifications() {
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/admin/notifications/templates');
        if (res.data.success) {
          setTemplates(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching templates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
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
            <Bell className="w-6 h-6 text-sky-500" />
            Notifications Hub
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage automated templates and send broadcast messages.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            New Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl"><Send className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sent Today</p>
              <p className="text-2xl font-bold text-slate-900">4,281</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Mail className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email Open Rate</p>
              <p className="text-2xl font-bold text-slate-900">42%</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Smartphone className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Push Delivery</p>
              <p className="text-2xl font-bold text-slate-900">98.5%</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><MessageSquare className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">WhatsApp ROI</p>
              <p className="text-2xl font-bold text-slate-900">High</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900">Notification Templates</h3>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-sky-500 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Template Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Channels</th>
                <th className="p-4">Last Triggered</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No notification templates found.</td></tr>
              ) : (
                filteredTemplates.map(template => (
                  <tr key={template._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900">{template.name}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{template._id.substring(0, 8)}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 capitalize">{template.targetAudience || 'All'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">
                          {template.channel || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{timeAgo(template.updatedAt)}</td>
                    <td className="p-4">
                      {template.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-sky-600 bg-white border border-slate-200 rounded-md shadow-sm transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-md shadow-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
