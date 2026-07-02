import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { ShieldCheck, Check, X, Eye, FileText, Clock, Search as SearchIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Verification = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [allAdvocates, setAllAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await api.get('/admin/advocates?limit=100');
      setAllAdvocates(res.data.data);
      setVerifications(res.data.data.filter((v: any) => v.verificationStatus === 'pending' || v.verificationStatus === 'under_review'));
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id + status);
    try {
      await api.patch(`/admin/advocates/${id}/verify`, { status, note: `Admin ${status}` });
      setVerifications(prev => prev.filter(v => v._id !== id));
      setAllAdvocates(prev => prev.map(a => a._id === id ? { ...a, verificationStatus: status } : a));
    } catch (err) {
      alert('Failed to update verification status');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const pendingCount = allAdvocates.filter(a => a.verificationStatus === 'pending').length;
  const underReviewCount = allAdvocates.filter(a => a.verificationStatus === 'under_review').length;
  const approvedCount = allAdvocates.filter(a => a.verificationStatus === 'approved').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8 relative"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <Card className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{pendingCount}</h3>
            <p className="text-[11px] md:text-sm font-medium text-slate-400 mt-0.5">Pending</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <SearchIcon className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{underReviewCount}</h3>
            <p className="text-[11px] md:text-sm font-medium text-slate-400 mt-0.5">Reviewing</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-green-500" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{approvedCount}</h3>
            <p className="text-[11px] md:text-sm font-medium text-slate-400 mt-0.5">Approved</p>
          </div>
        </Card>
      </div>

      {/* Applications */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">Advocate Applications</h3>
            <p className="text-xs text-slate-400">Review credentials and approve or reject</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg font-medium">
            {verifications.length} pending
          </span>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-400">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-base font-medium text-white mb-1">No pending applications!</h3>
            <p className="text-sm text-center">You're all caught up.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800/50">
              {verifications.map((adv: any) => (
                <div key={adv._id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{adv.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{adv.user?.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${adv.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {adv.verificationStatus === 'pending' ? 'Pending' : 'Under Review'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {adv.documents && Object.keys(adv.documents).length > 0 ? (
                      <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {Object.keys(adv.documents).length} doc(s) uploaded
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">No documents</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleVerify(adv._id, 'approved')} 
                      size="sm" 
                      disabled={actionLoading === adv._id + 'approved'}
                      className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 h-8 text-xs font-medium"
                    >
                      {actionLoading === adv._id + 'approved' ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Check className="w-3.5 h-3.5 mr-1" /> Approve</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleVerify(adv._id, 'rejected')} 
                      variant="outline" size="sm" 
                      disabled={actionLoading === adv._id + 'rejected'}
                      className="flex-1 bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                    >
                      {actionLoading === adv._id + 'rejected' ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><X className="w-3.5 h-3.5 mr-1" /> Reject</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setSelectedDocs(adv)} 
                      variant="outline" size="sm" 
                      className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="p-4 font-medium w-12"></th>
                    <th className="p-4 font-medium">Advocate Name</th>
                    <th className="p-4 font-medium text-center">Documents</th>
                    <th className="p-4 font-medium text-center">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((adv: any) => (
                    <tr 
                      key={adv._id} 
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{adv.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{adv.user?.email}</p>
                      </td>
                      <td className="p-4 text-center">
                        {adv.documents && Object.keys(adv.documents).length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full text-xs font-medium">
                            <FileText className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${adv.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {adv.verificationStatus === 'pending' ? 'Pending' : 'Under Review'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleVerify(adv._id, 'approved')} 
                            size="sm" 
                            disabled={actionLoading === adv._id + 'approved'}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 h-8 text-xs"
                          >
                            {actionLoading === adv._id + 'approved' ? (
                              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><Check className="w-3.5 h-3.5 mr-1" /> Approve</>
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleVerify(adv._id, 'rejected')} 
                            variant="outline" size="sm" 
                            disabled={actionLoading === adv._id + 'rejected'}
                            className="bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                          >
                            {actionLoading === adv._id + 'rejected' ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><X className="w-3.5 h-3.5 mr-1" /> Reject</>
                            )}
                          </Button>
                          <Button 
                            onClick={() => setSelectedDocs(adv)} 
                            variant="outline" size="sm" 
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-8 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Document View Modal */}
      <AnimatePresence>
        {selectedDocs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDocs(null)}
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
              <Card className="w-full bg-slate-900 border-slate-700 shadow-2xl relative rounded-t-2xl md:rounded-2xl max-h-[80vh] overflow-y-auto">
                <button onClick={() => setSelectedDocs(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5 z-10 active:scale-95 transition-transform">
                  <X className="w-4 h-4" />
                </button>
                <div className="p-5 md:p-6">
                  <h2 className="text-lg font-bold text-white mb-1">Verification Documents</h2>
                  <p className="text-sm text-slate-400 mb-5">Submitted by {selectedDocs.user?.name}</p>
                  
                  <div className="space-y-2.5">
                    {selectedDocs.documents && Object.entries(selectedDocs.documents).map(([key, url]: [string, any], i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-slate-950/50 border border-slate-800 rounded-xl gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-teal-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{key}</p>
                            <p className="text-[11px] text-slate-500 truncate">{url ? 'Document available' : 'No URL'}</p>
                          </div>
                        </div>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 text-xs font-medium whitespace-nowrap bg-teal-500/10 px-3 py-1.5 rounded-lg transition-colors">
                            Open ↗
                          </a>
                        )}
                      </div>
                    ))}
                    {(!selectedDocs.documents || Object.keys(selectedDocs.documents).length === 0) && (
                      <div className="text-center py-8 text-slate-500 text-sm">No documents submitted.</div>
                    )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button onClick={() => setSelectedDocs(null)} className="flex-1 bg-slate-800 text-white hover:bg-slate-700 h-10">
                      Close
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

export default Verification;
