import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Users as UsersIcon, Search, Filter, Ban, Eye, X, Edit, Lock, Unlock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '50');
        if (search) queryParams.append('search', search);
        if (roleFilter) queryParams.append('role', roleFilter);
        
        const res = await api.get(`/admin/users?${queryParams.toString()}`);
        let fetchedUsers = res.data.data;
        
        if (statusFilter === 'active') fetchedUsers = fetchedUsers.filter((u: any) => u.isActive);
        if (statusFilter === 'banned') fetchedUsers = fetchedUsers.filter((u: any) => !u.isActive);

        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleViewUser = async (id: string) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      alert('Failed to load user details');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-8 relative"
    >
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..." 
              className="pl-9 bg-slate-950/50 border-slate-800 text-white w-full"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-full md:w-36"
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="advocate">Advocate</option>
              <option value="admin">Admin</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-full md:w-36"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <UsersIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="max-w-sm text-center">We couldn't find any users matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium sticky left-0 bg-slate-900/90 backdrop-blur z-10 w-[200px]">User ID / Name</th>
                  <th className="p-4 font-medium">Phone / Gender</th>
                  <th className="p-4 font-medium">City/State</th>
                  <th className="p-4 font-medium text-center">Totals (Bookings / Cases)</th>
                  <th className="p-4 font-medium text-right">Total Spent</th>
                  <th className="p-4 font-medium">Source / Device</th>
                  <th className="p-4 font-medium">Last Login</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right sticky right-0 bg-slate-900/90 backdrop-blur z-10 w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((user: any, index: number) => (
                    <motion.tr 
                      key={user._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 sticky left-0 bg-slate-900/50 backdrop-blur z-10">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-slate-500 mb-1">#{user._id.slice(-6).toUpperCase()}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-xs">{user.name?.charAt(0) || '?'}</span>}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-300">{user.phone || '—'}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{user.gender || 'Not specified'}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {user.address?.city ? `${user.address.city}, ${user.address.state || ''}` : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <span className="block text-sm font-bold text-white">{user.totalBookings || 0}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Bookings</span>
                          </div>
                          <div className="h-6 w-px bg-slate-700"></div>
                          <div className="text-center">
                            <span className="block text-sm font-bold text-white">{user.totalCases || 0}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cases</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-teal-400">
                        ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-300 capitalize">{user.registrationSource || 'Email'}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{user.device || 'Android'}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-right sticky right-0 bg-slate-900/50 backdrop-blur z-10">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-2" title="Edit User">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => toggleUserStatus(user._id, user.isActive)} variant="outline" size="sm" className={`h-8 px-2 ${user.isActive ? 'bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10' : 'bg-slate-900 border-green-500/20 text-green-400 hover:bg-green-500/10'}`} title={user.isActive ? 'Block User' : 'Unblock User'}>
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg"
            >
              <Card className="w-full bg-slate-900 border-slate-700 shadow-2xl relative">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-slate-700">
                      {selectedUser.user?.avatar ? <img src={selectedUser.user.avatar} className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-slate-300">{selectedUser.user?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedUser.user?.name}</h2>
                      <p className="text-sm text-slate-400">{selectedUser.user?.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedUser.user?.role === 'advocate' ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'}`}>{selectedUser.user?.role}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedUser.user?.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{selectedUser.user?.isActive ? 'Active' : 'Banned'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Phone</p>
                        <p className="text-sm font-medium text-white mt-1">{selectedUser.user?.phone || 'Not provided'}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Joined</p>
                        <p className="text-sm font-medium text-white mt-1">{new Date(selectedUser.user?.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {selectedUser.user?.isEmailVerified !== undefined && (
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Email Verified</p>
                        <p className={`text-sm font-medium mt-1 ${selectedUser.user?.isEmailVerified ? 'text-green-400' : 'text-amber-400'}`}>{selectedUser.user?.isEmailVerified ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <Button onClick={() => setSelectedUser(null)} variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Close</Button>
                    <Button onClick={() => {
                      toggleUserStatus(selectedUser.user?._id, selectedUser.user?.isActive);
                      setSelectedUser(null);
                    }} className={`${selectedUser.user?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                      {selectedUser.user?.isActive ? 'Ban User' : 'Activate User'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Users;
