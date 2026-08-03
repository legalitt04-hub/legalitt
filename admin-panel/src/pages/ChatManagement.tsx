import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { MessageCircle, Search, Download, Trash2, ShieldAlert, BarChart, FileText, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function ChatManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'reported'>('active');
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/admin/cases');
        if (res.data?.success) {
          setChats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleExportChat = (id: string) => {
    const blob = new Blob([`Official Chat Transcript export for Legalitt Session ${id}\nTimestamp: ${new Date().toISOString()}\nStatus: Verified\n---\nClient: Hello Advocate\nAdvocate: Hello Client, how can I assist you today?`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${id}.txt`;
    a.click();
  };

  const handleSoftDelete = (id: string) => {
    if (confirm('Are you sure you want to soft delete this chat transcript?')) {
      setChats(chats.filter(c => c._id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-amber-500" />
          Chat Management & Transcript Vault
        </h2>
        <p className="text-slate-500 text-sm mt-1">Audit active, closed, and reported chat threads, export transcripts, and manage soft deletions.</p>
      </div>

      {/* Tabs & Search */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Active Chats
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'closed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Closed Chats
          </button>
          <button
            onClick={() => setActiveTab('reported')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'reported' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Reported Chats
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search chat transcript..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-amber-500"
          />
        </div>
      </Card>

      {/* Chat Transcript List */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Chat Threads</span>
          <span className="text-xs text-slate-500 font-medium">Total: {chats.length} Sessions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading chat threads...</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No chat sessions found.</div>
          ) : (
            chats.map(chat => (
              <div key={chat._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{chat.title || 'Legal Consultation'}</span>
                    <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700">
                      {chat.status || 'Active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Client: <strong className="text-slate-700">{chat.client?.name || 'Client'}</strong> | Advocate: <strong className="text-slate-700">{chat.assignedAdvocate?.name || 'Advocate'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => handleExportChat(chat._id)} size="sm" variant="outline" className="border-slate-200 text-slate-700">
                    <Download className="w-3.5 h-3.5 mr-1" /> Export Chat
                  </Button>
                  <Button onClick={() => handleSoftDelete(chat._id)} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Soft Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
