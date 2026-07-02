import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Users as UsersIcon, Search, X, Edit, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        queryParams.append('page', page.toString());
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (roleFilter) queryParams.append('role', roleFilter);
        if (statusFilter === 'active') queryParams.append('isActive', 'true');
        if (statusFilter === 'banned') queryParams.append('isActive', 'false');
        
        const res = await api.get(`/admin/users?${queryParams.toString()}`);
        setUsers(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages);
          setTotalUsers(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  const toggleUserStatus = useCallback(async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleViewUser = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      alert('Failed to load user details');
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8 relative"
    >
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..." 
              className="pl-9 h-9 bg-slate-950/50 border-slate-800 text-white w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 flex-1 sm:w-32"
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="advocate">Advocate</option>
              <option value="admin">Admin</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 flex-1 sm:w-32"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Blocked</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <UsersIcon className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-base font-medium text-white mb-1">No users found</h3>
            <p className="text-sm text-center max-w-xs">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-slate-800/50 flex-1">
              {users.map((user) => (
                <div key={user._id} className="p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{user.name?.charAt(0) || '?'}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <p className="text-slate-300 mt-0.5">{user.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Bookings</p>
                      <p className="text-white font-medium mt-0.5">{user.totalBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Spent</p>
                      <p className="text-teal-400 font-medium mt-0.5">₹{(user.totalSpent || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleViewUser(user._id)} 
                      variant="outline" size="sm" 
                      className="flex-1 bg-slate-900 border-slate-700 text-slate-300 hover:text-white h-8 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button 
                      onClick={() => toggleUserStatus(user._id, user.isActive)} 
                      variant="outline" size="sm" 
                      disabled={actionLoading === user._id}
                      className={`flex-1 h-8 text-xs ${user.isActive ? 'bg-slate-900 border-red-500/20 text-red-400' : 'bg-slate-900 border-green-500/20 text-green-400'}`}
                    >
                      {actionLoading === user._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : user.isActive ? (
                        <><Lock className="w-3.5 h-3.5 mr-1" /> Block</>
                      ) : (
                        <><Unlock className="w-3.5 h-3.5 mr-1" /> Unblock</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="p-3 lg:p-4 font-medium sticky left-0 bg-slate-900/95 backdrop-blur z-10 min-w-[200px]">User Details</th>
                    <th className="p-3 lg:p-4 font-medium">Contact Info</th>
                    <th className="p-3 lg:p-4 font-medium">City/State</th>
                    <th className="p-3 lg:p-4 font-medium text-center">Bookings / Cases</th>
                    <th className="p-3 lg:p-4 font-medium text-right">Total Spent</th>
                    <th className="p-3 lg:p-4 font-medium">Last Login</th>
                    <th className="p-3 lg:p-4 font-medium text-center">Status</th>
                    <th className="p-3 lg:p-4 font-medium text-right sticky right-0 bg-slate-900/95 backdrop-blur z-10 min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr 
                      key={user._id} 
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-3 lg:p-4 sticky left-0 bg-slate-900/80 backdrop-blur z-10">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700">
                              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{user.name?.charAt(0) || '?'}</span>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate max-w-[150px]">{user.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 capitalize">{user.role}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <p className="text-sm text-slate-300 truncate max-w-[180px]" title={user.email}>{user.email}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{user.phone || 'No phone'}</p>
                      </td>
                      <td className="p-3 lg:p-4 text-sm text-slate-300">
                        {user.address?.city ? `${user.address.city}, ${user.address.state || ''}` : '—'}
                      </td>
                      <td className="p-3 lg:p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-center">
                            <span className="block text-sm font-bold text-white">{user.totalBookings || 0}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Book</span>
                          </div>
                          <div className="h-5 w-px bg-slate-700/50"></div>
                          <div className="text-center">
                            <span className="block text-sm font-bold text-white">{user.totalCases || 0}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Cases</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4 text-right text-sm font-medium text-teal-400">
                        ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 lg:p-4 text-sm text-slate-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="p-3 lg:p-4 text-center">
                        <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-right sticky right-0 bg-slate-900/80 backdrop-blur z-10">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => handleViewUser(user._id)}
                            variant="outline" size="sm" 
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-7 w-7 p-0" 
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            onClick={() => toggleUserStatus(user._id, user.isActive)} 
                            variant="outline" size="sm" 
                            disabled={actionLoading === user._id}
                            className={`h-7 w-7 p-0 ${user.isActive ? 'bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10' : 'bg-slate-900 border-green-500/20 text-green-400 hover:bg-green-500/10'}`} 
                            title={user.isActive ? 'Block User' : 'Unblock User'}
                          >
                            {actionLoading === user._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.isActive ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
              <div className="p-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalUsers)} of {totalUsers}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="h-8 bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-3 text-sm text-white font-medium">
                    {page} <span className="text-slate-500 font-normal">/ {totalPages}</span>
                  </div>
                  <Button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-8 bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-lg"
            >
              <Card className="w-full bg-slate-900 border-slate-700 shadow-2xl relative rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5 z-10 active:scale-95 transition-transform">
                  <X className="w-4 h-4" />
                </button>
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-slate-700 flex-shrink-0">
                      {selectedUser.user?.avatar ? <img src={selectedUser.user.avatar} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-slate-300">{selectedUser.user?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">{selectedUser.user?.name}</h2>
                      <p className="text-sm text-slate-400 truncate">{selectedUser.user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedUser.user?.role === 'advocate' ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'}`}>{selectedUser.user?.role}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedUser.user?.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{selectedUser.user?.isActive ? 'Active' : 'Blocked'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Phone</p>
                        <p className="text-sm font-medium text-white mt-1">{selectedUser.user?.phone || 'Not provided'}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Joined</p>
                        <p className="text-sm font-medium text-white mt-1">{new Date(selectedUser.user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {selectedUser.user?.isEmailVerified !== undefined && (
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Email Verified</p>
                        <p className={`text-sm font-medium mt-1 ${selectedUser.user?.isEmailVerified ? 'text-green-400' : 'text-amber-400'}`}>{selectedUser.user?.isEmailVerified ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button onClick={() => setSelectedUser(null)} variant="outline" className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-10">Close</Button>
                    <Button onClick={() => {
                      toggleUserStatus(selectedUser.user?._id, selectedUser.user?.isActive);
                      setSelectedUser(null);
                    }} className={`flex-1 h-10 ${selectedUser.user?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                      {selectedUser.user?.isActive ? 'Block User' : 'Unblock User'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;
