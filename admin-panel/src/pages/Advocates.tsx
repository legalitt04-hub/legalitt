import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { UserCheck, Search, Filter, Ban, MoreVertical, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Advocates = () => {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const res = await api.get(`/admin/advocates?limit=50&search=${search}`);
        setAdvocates(res.data.data);
      } catch (err) {
        console.error('Failed to load advocates', err);
      } finally {
        setLoading(false);
      }
    };
    
    const delay = setTimeout(fetchAdvocates, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setAdvocates(advocates.map(a => a.user._id === id ? { ...a, user: { ...a.user, isActive: !currentStatus } } : a));
    } catch (err) {
      alert('Failed to update advocate status');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Advocates Directory</h1>
          <p className="text-slate-400">Manage approved lawyers and legal professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => alert('Advanced filtering coming soon.')} variant="outline" className="bg-slate-900 border-slate-800 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
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
              placeholder="Search advocates by name, bar council number..." 
              className="pl-9 bg-slate-950/50 border-slate-800 text-white"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading advocates...</div>
        ) : advocates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <UserCheck className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No advocates found</h3>
            <p className="max-w-sm text-center">There are no approved advocates matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">Advocate</th>
                  <th className="p-4 font-medium">Bar Council No.</th>
                  <th className="p-4 font-medium">Specializations</th>
                  <th className="p-4 font-medium">Verification</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advocates.map((adv: any) => (
                  <tr key={adv._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium">{adv.user?.name?.charAt(0) || '?'}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{adv.user?.name || 'Unknown'}</p>
                        {adv.isVerified && <ShieldCheck className="w-4 h-4 text-teal-500" />}
                      </div>
                      <p className="text-xs text-slate-400">{adv.user?.email}</p>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-300">
                      {adv.barCouncilNumber || '—'}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {(adv.specializations || []).slice(0, 2).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-800 rounded-full text-slate-300">{s}</span>
                        ))}
                        {(adv.specializations?.length > 2) && <span className="px-2 py-0.5 bg-slate-800 rounded-full text-slate-300">+{adv.specializations.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${adv.isVerified ? 'bg-teal-500/10 text-teal-400' : adv.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {adv.isVerified ? 'Verified' : adv.verificationStatus || 'Unverified'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${adv.user?.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {adv.user?.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => toggleUserStatus(adv.user._id, adv.user.isActive)} variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
                          <Ban className={`w-4 h-4 mr-2 ${adv.user?.isActive ? 'text-red-400' : 'text-green-400'}`} />
                          {adv.user?.isActive ? 'Suspend' : 'Activate'}
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

export default Advocates;
