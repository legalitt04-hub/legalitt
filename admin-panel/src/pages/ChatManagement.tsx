import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Search, Download, RefreshCw,
  Users, MessageSquare, Eye, X, Send, Clock,
} from 'lucide-react';
import api from '../lib/api';

interface ChatSession {
  _id: string;
  participants: { _id: string; name: string; role: string; avatar?: string }[];
  lastMessage?: { content?: string; createdAt?: string };
  messageCount: number;
  unreadCount: number;
  updatedAt: string;
  booking?: { type?: string; status?: string; consultationMode?: string };
  isActive: boolean;
}

interface Message {
  _id: string;
  content?: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  sender: { name: string; role: string; avatar?: string };
}

const Avatar = ({ name, role }: { name?: string; role?: string }) => {
  const init = (name || '?')[0].toUpperCase();
  const isAdvocate = role === 'advocate';
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAdvocate ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
      {init}
    </div>
  );
};

export default function ChatManagement() {
  const [chats, setChats]       = useState<ChatSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/chat-history', { params });
      setChats(data.data || []);
    } catch (err) {
      console.error('Failed to load chats', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const openChat = async (chat: ChatSession) => {
    setSelected(chat);
    setMsgLoading(true);
    setMessages([]);
    try {
      const { data } = await api.get(`/admin/chat-history/${chat._id}/messages`);
      setMessages(data.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMsgLoading(false);
    }
  };

  const exportChat = (chat: ChatSession) => {
    const lines = [
      `Chat Transcript — Legalitt`,
      `Session: ${chat._id}`,
      `Participants: ${chat.participants.map(p => `${p.name} (${p.role})`).join(', ')}`,
      `Messages: ${chat.messageCount}`,
      `Date: ${new Date(chat.updatedAt).toLocaleString('en-IN')}`,
      '─'.repeat(60),
      ...messages.map(m =>
        `[${new Date(m.createdAt).toLocaleString('en-IN')}] ${m.sender.name} (${m.sender.role}):\n${m.content || `[${m.messageType}]${m.fileName ? ' ' + m.fileName : ''}`}`
      ),
    ].join('\n\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `chat-${chat._id.slice(-6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalChats    = chats.length;
  const totalMessages = chats.reduce((sum, c) => sum + c.messageCount, 0);
  const activeToday   = chats.filter(c => new Date(c.updatedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-amber-500" />
            Chat History
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Audit and export all chat transcripts</p>
        </div>
        <button onClick={fetchChats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', value: totalChats,    icon: MessageCircle, grad: 'from-amber-500 to-orange-500' },
          { label: 'Total Messages', value: totalMessages, icon: MessageSquare, grad: 'from-blue-500 to-indigo-500' },
          { label: 'Active Today',   value: activeToday,  icon: Users,         grad: 'from-emerald-500 to-teal-500' },
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

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          placeholder="Search by participant name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Chat List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sessions</span>
          <span className="text-xs text-slate-500">{chats.length} sessions</span>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading sessions...</div>
          ) : chats.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No chat sessions found.</div>
          ) : chats.map(chat => {
            const client   = chat.participants.find(p => p.role === 'client')   || chat.participants[0];
            const advocate = chat.participants.find(p => p.role === 'advocate') || chat.participants[1];

            return (
              <motion.div key={chat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatars */}
                  <div className="flex -space-x-2">
                    <Avatar name={client?.name}   role="client" />
                    <Avatar name={advocate?.name} role="advocate" />
                  </div>
                  {/* Meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {client?.name || '?'} ↔ {advocate?.name || '?'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {chat.lastMessage?.content
                        ? chat.lastMessage.content.substring(0, 60)
                        : 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{chat.messageCount} msgs
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(chat.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openChat(chat)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors font-medium">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => { setSelected(chat); exportChat(chat); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Message Viewer Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
              initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }}>

              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {selected.participants.slice(0, 2).map(p => (
                      <Avatar key={p._id} name={p.name} role={p.role} />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {selected.participants.map(p => p.name).join(' ↔ ')}
                    </p>
                    <p className="text-xs text-slate-400">{messages.length} messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportChat(selected)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {msgLoading ? (
                  <div className="text-center py-12 text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No messages in this chat.</div>
                ) : messages.map(msg => {
                  const isAdvocate = msg.sender.role === 'advocate';
                  return (
                    <div key={msg._id} className={`flex ${isAdvocate ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isAdvocate ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'}`}>
                        <p className={`text-[10px] font-semibold mb-1 ${isAdvocate ? 'text-amber-100' : 'text-slate-400'}`}>
                          {msg.sender.name} · {msg.sender.role}
                        </p>
                        {msg.messageType === 'text' ? (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        ) : (
                          <p className="text-sm italic flex items-center gap-1">
                            📎 {msg.fileName || 'Attachment'}
                          </p>
                        )}
                        <p className={`text-[10px] mt-1.5 ${isAdvocate ? 'text-amber-100' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
