import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Users as UsersIcon, Search, Filter, Ban, MoreVertical, Eye } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/admin/users?role=client&limit=50&search=${search}`);
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search
    const delay = setTimeout(fetchUsers, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients Directory</h1>
          <p className="text-slate-400">Manage all registered clients on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => alert('Advanced filtering coming soon.')} variant="outline" className="bg-slate-900 border-slate-800 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => alert('Manual client creation is disabled for this environment.')} className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium">
            <UsersIcon className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name or email..." 
              className="pl-9 bg-slate-950/50 border-slate-800 text-white"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading clients...</div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <UsersIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
            <p className="max-w-sm text-center">We couldn't find any clients matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Joined Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium">{user.name?.charAt(0) || '?'}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => toggleUserStatus(user._id, user.isActive)} variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
                          <Ban className={`w-4 h-4 mr-2 ${user.isActive ? 'text-red-400' : 'text-green-400'}`} />
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Users;
