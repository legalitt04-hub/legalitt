import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { UserCheck, Search, ShieldCheck, X, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Advocates = () => {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedAdv, setSelectedAdv] = useState<any>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [verificationFilter]);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        queryParams.append('page', page.toString());
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (verificationFilter) queryParams.append('verificationStatus', verificationFilter);
        
        const res = await api.get(`/admin/advocates?${queryParams.toString()}`);
        setAdvocates(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages);
          setTotalItems(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to load advocates', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdvocates();
  }, [debouncedSearch, verificationFilter, page]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`, { reason: currentStatus ? 'Admin suspension' : 'Admin activation' });
      setAdvocates(advocates.map(a => a.user._id === id ? { ...a, user: { ...a.user, isActive: !currentStatus } } : a));
      if (selectedAdv && selectedAdv.advocate.user._id === id) {
        setSelectedAdv({ ...selectedAdv, advocate: { ...selectedAdv.advocate, user: { ...selectedAdv.advocate.user, isActive: !currentStatus } } });
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
              placeholder="Search by name or email..." 
              className="pl-9 bg-slate-950/50 border-slate-800 text-white w-full focus-visible:ring-amber-500/50"
            />
          </div>
          <div className="w-full md:w-auto">
            <select 
              value={verificationFilter} 
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-full md:w-48"
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
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : advocates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <UserCheck className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No advocates found</h3>
            <p className="max-w-sm text-center">There are no advocates matching your search criteria.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800/50 flex-1">
              {advocates.map((adv: any) => (
                <div key={adv._id} className="p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                          {adv.user?.name || 'Unknown'}
                          {!adv.user?.isActive && <Ban className="w-3 h-3 text-red-500" />}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{adv.user?.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${adv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {adv.verificationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-slate-500">Bar Council</p>
                      <p className="text-slate-300 mt-0.5 font-mono">{adv.barCouncilNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Fee</p>
                      <p className="text-amber-400 font-bold mt-0.5">₹{adv.consultationFee || 0}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleView(adv._id)} 
                    variant="outline" size="sm" 
                    className="w-full bg-slate-900 border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 text-xs"
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/30">
                    <th className="p-4 font-medium sticky left-0 bg-slate-900/95 backdrop-blur z-10">Advocate Details</th>
                    <th className="p-4 font-medium">Bar Council No.</th>
                    <th className="p-4 font-medium">Specialization</th>
                    <th className="p-4 font-medium">Experience</th>
                    <th className="p-4 font-medium">Fee</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right sticky right-0 bg-slate-900/95 backdrop-blur z-10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {advocates.map((adv: any, index: number) => (
                      <motion.tr 
                        key={adv._id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 flex items-center gap-3 sticky left-0 bg-slate-900/80 backdrop-blur z-10">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700">
                            {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                              {adv.user?.name || 'Unknown'}
                              {!adv.user?.isActive && <Ban className="w-3 h-3 text-red-500" />}
                            </p>
                            <p className="text-xs text-slate-400 truncate" title={adv.user?.email}>{adv.user?.email}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{adv.user?.phone || 'No phone'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-300 font-mono text-[13px]">{adv.barCouncilNumber || '—'}</td>
                        <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate">
                          {adv.specializations?.length ? (
                            <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">
                              {adv.specializations[0]} {adv.specializations.length > 1 && `+${adv.specializations.length - 1}`}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-4 text-sm text-slate-300">{adv.experience ? `${adv.experience} yrs` : '—'}</td>
                        <td className="p-4 text-sm font-bold text-amber-400">₹{adv.consultationFee || 0}</td>
                        <td className="p-4 text-sm text-slate-300 flex flex-col">
                          <span className="flex items-center text-amber-400 font-medium">⭐ {adv.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-slate-500">({adv.rating?.count || 0} reviews)</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${adv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            {adv.verificationStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right sticky right-0 bg-slate-900/80 backdrop-blur z-10">
                          <Button onClick={() => handleView(adv._id)} variant="outline" size="sm" className="bg-slate-900 border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-3">
                            View Profile
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="p-3 border-t border-slate-800 flex items-center justify-between mt-auto bg-slate-950/30">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
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
                    className="h-8 w-8 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Advocate Details Modal */}
      {selectedAdv && (
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
              className="w-full max-w-2xl"
            >
              <Card className="w-full bg-slate-900 border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
                <button onClick={() => setSelectedAdv(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10">
                  <X className="w-5 h-5" />
                </button>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-slate-700 flex-shrink-0">
                      {selectedAdv.advocate.user?.avatar ? <img src={selectedAdv.advocate.user.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-slate-300">{selectedAdv.advocate.user?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {selectedAdv.advocate.user?.name}
                        {selectedAdv.advocate.verificationStatus === 'approved' && <ShieldCheck className="w-5 h-5 text-amber-500" />}
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">{selectedAdv.advocate.user?.email}</p>
                      <p className="text-sm text-slate-400">{selectedAdv.advocate.user?.phone || 'No phone'}</p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.advocate.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          Verification: {selectedAdv.advocate.verificationStatus.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.advocate.user?.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {selectedAdv.advocate.user?.isActive ? 'Account Active' : 'Account Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Bar Council No.</p>
                        <p className="text-sm font-medium text-white mt-1 font-mono">{selectedAdv.advocate.barCouncilNumber || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Experience</p>
                        <p className="text-sm font-medium text-white mt-1">{selectedAdv.advocate.experience ? `${selectedAdv.advocate.experience} Years` : 'N/A'}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Consultation Fee</p>
                        <p className="text-sm font-medium text-amber-400 mt-1">₹{selectedAdv.advocate.consultationFee || 0}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase">Rating</p>
                        <p className="text-sm font-medium text-amber-400 mt-1 flex items-center">⭐ {selectedAdv.advocate.rating?.average?.toFixed(1) || '0.0'} <span className="text-slate-500 text-xs ml-1">({selectedAdv.advocate.rating?.count || 0})</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <p className="text-xs text-slate-500 uppercase mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAdv.advocate.specializations?.length ? selectedAdv.advocate.specializations.map((spec: string) => (
                          <span key={spec} className="px-2 py-1 bg-slate-800 rounded-md text-sm text-slate-300">{spec}</span>
                        )) : <span className="text-sm text-slate-500">None provided</span>}
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <p className="text-xs text-slate-500 uppercase mb-2">Bio / About</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedAdv.advocate.about || 'No bio provided.'}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-4">
                    <Button onClick={() => setSelectedAdv(null)} variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Close</Button>
                    <Button onClick={() => {
                      toggleUserStatus(selectedAdv.advocate.user._id, selectedAdv.advocate.user.isActive);
                    }} className={`${selectedAdv.advocate.user?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                      {selectedAdv.advocate.user?.isActive ? 'Suspend Advocate' : 'Activate Advocate'}
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

export default Advocates;
