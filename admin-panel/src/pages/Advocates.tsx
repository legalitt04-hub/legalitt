import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { UserCheck, Search, Filter, Ban, ShieldCheck, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Advocates = () => {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedAdv, setSelectedAdv] = useState<any>(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '50');
        if (search) queryParams.append('search', search);
        if (verificationFilter) queryParams.append('verificationStatus', verificationFilter);
        
        const res = await api.get(`/admin/advocates?${queryParams.toString()}`);
        setAdvocates(res.data.data);
      } catch (err) {
        console.error('Failed to load advocates', err);
      } finally {
        setLoading(false);
      }
    };
    
    const delay = setTimeout(fetchAdvocates, 500);
    return () => clearTimeout(delay);
  }, [search, verificationFilter]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setAdvocates(advocates.map(a => a.user._id === id ? { ...a, user: { ...a.user, isActive: !currentStatus } } : a));
      if (selectedAdv && selectedAdv.user._id === id) {
        setSelectedAdv({ ...selectedAdv, user: { ...selectedAdv.user, isActive: !currentStatus } });
      }
    } catch (err) {
      alert('Failed to update advocate status');
    }
  };

  const handleView = async (id: string) => {
    try {
      const res = await api.get(`/admin/advocates/${id}`);
      setSelectedAdv(res.data.data);
    } catch (err) {
      alert('Failed to fetch advocate details');
    }
  };

  return (
    <div className="space-y-8 pb-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Advocate Management</h1>
          <p className="text-slate-400">View and manage advocate profiles.</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." 
              className="pl-9 bg-slate-950/50 border-slate-800 text-white w-full"
            />
          </div>
          <div className="w-full md:w-auto">
            <select 
              value={verificationFilter} 
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-full md:w-48"
            >
              <option value="">All Verifications</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
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
            <p className="max-w-sm text-center">There are no advocates matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Advocate</th>
                  <th className="p-4 font-medium">Bar Council No.</th>
                  <th className="p-4 font-medium">Specialization</th>
                  <th className="p-4 font-medium">Experience</th>
                  <th className="p-4 font-medium">Fee</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium">Verification</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advocates.map((adv: any) => (
                  <tr key={adv._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{adv.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{adv.user?.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{adv.barCouncilNumber || '—'}</td>
                    <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate">{(adv.specializations || []).slice(0, 2).join(', ') || '—'}</td>
                    <td className="p-4 text-sm text-slate-300">{adv.experience ? `${adv.experience} yrs` : '—'}</td>
                    <td className="p-4 text-sm font-bold text-slate-200">₹{adv.consultationFee || 0}</td>
                    <td className="p-4 text-sm text-slate-300 flex flex-col">
                      <span className="flex items-center text-amber-400 font-medium">⭐ {adv.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-slate-500">({adv.rating?.count || 0})</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${adv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {adv.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button onClick={() => handleView(adv._id)} variant="outline" size="sm" className="bg-slate-900 border-teal-500/20 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 h-8 px-3">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Advocate Details Modal */}
      {selectedAdv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
            <button onClick={() => setSelectedAdv(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-slate-700 flex-shrink-0">
                  {selectedAdv.user?.avatar ? <img src={selectedAdv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-slate-300">{selectedAdv.user?.name?.charAt(0) || '?'}</span>}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {selectedAdv.user?.name}
                    {selectedAdv.verificationStatus === 'approved' && <ShieldCheck className="w-5 h-5 text-teal-500" />}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">{selectedAdv.user?.email}</p>
                  <p className="text-sm text-slate-400">{selectedAdv.user?.phone || 'No phone'}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      Verification: {selectedAdv.verificationStatus}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.user?.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {selectedAdv.user?.isActive ? 'Account Active' : 'Account Suspended'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase">Bar Council No.</p>
                    <p className="text-sm font-medium text-white mt-1 font-mono">{selectedAdv.barCouncilNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase">Experience</p>
                    <p className="text-sm font-medium text-white mt-1">{selectedAdv.experience ? `${selectedAdv.experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase">Consultation Fee</p>
                    <p className="text-sm font-medium text-white mt-1">₹{selectedAdv.consultationFee || 0}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase">Rating</p>
                    <p className="text-sm font-medium text-amber-400 mt-1 flex items-center">⭐ {selectedAdv.rating?.average?.toFixed(1) || '0.0'} <span className="text-slate-500 text-xs ml-1">({selectedAdv.rating?.count || 0})</span></p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAdv.specializations?.length ? selectedAdv.specializations.map((spec: string) => (
                      <span key={spec} className="px-2 py-1 bg-slate-800 rounded-md text-sm text-slate-300">{spec}</span>
                    )) : <span className="text-sm text-slate-500">None provided</span>}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase mb-2">Bio / About</p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedAdv.about || 'No bio provided.'}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-4">
                <Button onClick={() => setSelectedAdv(null)} variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Close</Button>
                <Button onClick={() => {
                  toggleUserStatus(selectedAdv.user._id, selectedAdv.user.isActive);
                }} className={`${selectedAdv.user?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                  {selectedAdv.user?.isActive ? 'Suspend Advocate' : 'Activate Advocate'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Advocates;
