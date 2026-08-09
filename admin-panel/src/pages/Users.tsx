import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, X, RefreshCw,
  Eye, Download, ChevronLeft, ChevronRight,
  ShieldOff, Shield, Key, Mail, Phone, Calendar, Lock
} from 'lucide-react';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'advocate' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  address?: { city?: string; state?: string };
  createdAt: string;
  lastSeen?: string;
}

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'client' };
const EDIT_FORM = (u: User) => ({ name: u.name, email: u.email, phone: u.phone || '' });

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPw, setNewPw] = useState('');
  const [resetting, setResetting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active' ? 'true' : 'false';
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [page, roleFilter, statusFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return alert('Name, email, password required.');
    setSaving(true);
    try {
      await api.post('/admin/users', form);
      setShowCreate(false); setForm(EMPTY_FORM); fetchUsers();
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/users/${editUser!._id}`, form);
      setEditUser(null); fetchUsers();
    } catch (e: any) { console.error('Update failed:', e); }
    finally { setSaving(false); }
  };

  const handleToggleBan = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user._id}/toggle`);
      fetchUsers();
    } catch (e: any) { console.error('Toggle ban failed:', e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setDeleteId(null); fetchUsers();
    } catch (e: any) { console.error('Delete failed:', e); }
  };

  const handleResetPassword = async () => {
    if (!newPw || newPw.length < 8) return alert('Min 8 characters.');
    setResetting(true);
    try {
      await api.post(`/admin/users/${resetTarget!._id}/reset-password`, { password: newPw });
      setResetTarget(null); setNewPw('');
      alert('Password reset successfully!');
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed.'); }
    finally { setResetting(false); }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Role', 'Status', 'City', 'Joined']];
    users.forEach(u => rows.push([
      u.name, u.email, u.phone || '', u.role,
      u.isActive ? 'Active' : 'Banned',
      u.address?.city || '',
      new Date(u.createdAt).toLocaleDateString(),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total users on platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={fetchUsers} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setShowCreate(true); setForm(EMPTY_FORM); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Roles</option>
          <option value="client">Clients</option>
          <option value="advocate">Advocates</option>
          <option value="admin">Admins</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['User', 'Role', 'Status', 'Phone', 'City', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user.isActive ? 'bg-gradient-to-br from-indigo-400 to-teal-400' : 'bg-gray-300'}`}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-50 text-red-700' : user.role === 'advocate' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2 py-1 rounded-full ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{user.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{user.address?.city || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedUser(user)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="View"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setEditUser(user); setForm(EDIT_FORM(user)); }} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleToggleBan(user)} title={user.isActive ? 'Suspend' : 'Activate'}
                          className={`p-1.5 rounded-lg ${user.isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} hover:opacity-80`}>
                          {user.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => { setResetTarget(user); setNewPw(''); }} className="p-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100" title="Reset Password"><Key className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(user._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* View User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">User Profile</h3><button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <div className="flex items-center gap-3 mb-5">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 flex-shrink-0 shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">{selectedUser.name?.[0]}</div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Role', value: selectedUser.role },
                  { label: 'Status', value: selectedUser.isActive ? 'Active' : 'Suspended' },
                  { label: 'Verified', value: selectedUser.isVerified ? 'Yes' : 'No' },
                  { label: 'Phone', value: selectedUser.phone || '—' },
                  { label: 'City', value: selectedUser.address?.city || '—' },
                  { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString() },
                  { label: 'Last Seen', value: selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : 'Unknown' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedUser(null)} className="mt-5 w-full py-2.5 bg-gray-100 text-sm font-semibold rounded-xl hover:bg-gray-200">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      {(showCreate || editUser) && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold">{editUser ? 'Edit User' : 'Create New User'}</h2>
                <button onClick={() => { setShowCreate(false); setEditUser(null); }}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'User Name' },
                  { label: 'Email *', key: 'email', placeholder: 'user@example.com' },
                  { label: 'Phone', key: 'phone', placeholder: '9876543210' },
                  ...(!editUser ? [{ label: 'Password *', key: 'password', placeholder: 'Min 8 chars' }] : []),
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      type={f.key === 'password' ? 'password' : 'text'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={f.placeholder} />
                  </div>
                ))}
                {!editUser && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                    <select value={form.role} onChange={e => setForm((p: any) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      <option value="client">Client</option>
                      <option value="advocate">Advocate</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setShowCreate(false); setEditUser(null); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={editUser ? handleUpdate : handleCreate} disabled={saving} className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                    {saving ? 'Saving...' : editUser ? 'Update' : 'Create User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg">Delete User?</h3>
              <p className="text-sm text-gray-500 mt-1 mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Reset Password</h3><button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <p className="text-sm text-gray-500 mb-4">Resetting for <strong>{resetTarget.name}</strong></p>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="New password (min 8 chars)" />
                <button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? '🙈' : '👁'}</button>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setResetTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl">Cancel</button>
                <button onClick={handleResetPassword} disabled={resetting} className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50">{resetting ? 'Resetting...' : 'Reset'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
