import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { ShieldCheck, Check, X, Eye, FileText, Search, Clock, Search as SearchIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Verification = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [allAdvocates, setAllAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<any>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      // Fetch all advocates to get stats for the cards
      const res = await api.get('/admin/advocates?limit=100');
      setAllAdvocates(res.data.data);
      
      // The table only shows those needing review
      setVerifications(res.data.data.filter((v: any) => v.verificationStatus === 'pending' || v.verificationStatus === 'under_review'));
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/advocates/${id}/verify`, { status, note: `Admin ${status}` });
      setVerifications(verifications.filter(v => v._id !== id));
      setAllAdvocates(allAdvocates.map(a => a._id === id ? { ...a, verificationStatus: status } : a));
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  const pendingCount = allAdvocates.filter(a => a.verificationStatus === 'pending').length;
  const underReviewCount = allAdvocates.filter(a => a.verificationStatus === 'under_review').length;
  const approvedCount = allAdvocates.filter(a => a.verificationStatus === 'approved').length;

  return (
    <div className="space-y-8 pb-8 relative">
      {/* Top Cards (Legacy Replication) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{pendingCount}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Pending Review</p>
            <div className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md ${pendingCount === 0 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {pendingCount === 0 ? '✓ All clear!' : 'Needs attention'}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <SearchIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{underReviewCount}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Under Review</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300">
              Being reviewed
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{approvedCount}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Total Approved</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-400">
              On platform
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Advocate Applications</h3>
            <p className="text-sm text-slate-400">Review credentials and approve or reject applications</p>
          </div>
          <select className="bg-slate-950/50 border border-slate-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="pending">⏳ Pending</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading queue...</div>
        ) : verifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-white mb-2">No pending applications!</h3>
            <p className="text-center">You're all caught up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">Advocate Name</th>
                  <th className="p-4 font-medium">Bar Council No.</th>
                  <th className="p-4 font-medium">Experience</th>
                  <th className="p-4 font-medium">Documents</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((adv: any) => (
                  <tr key={adv._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{adv.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{adv.user?.email}</p>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-300">
                      {adv.barCouncilNumber || '—'}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {adv.experience ? `${adv.experience} Years` : '—'}
                    </td>
                    <td className="p-4">
                      {adv.documents && Object.keys(adv.documents).length > 0 ? (
                        <div className="flex gap-2">
                          <Button onClick={() => setSelectedDocs(adv)} variant="outline" size="sm" className="bg-slate-900 border-teal-500/20 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10">
                            <Eye className="w-4 h-4 mr-1" /> View Docs
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No documents</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleVerify(adv._id, 'approved')} size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 h-8">
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button onClick={() => handleVerify(adv._id, 'rejected')} variant="outline" size="sm" className="bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10 h-8">
                          <X className="w-4 h-4 mr-1" /> Reject
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

      {/* Document View Modal */}
      {selectedDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl relative">
            <button onClick={() => setSelectedDocs(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">Verification Documents</h2>
              <p className="text-sm text-slate-400 mb-6">Submitted by {selectedDocs.user?.name}</p>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto hidden-scrollbar">
                {selectedDocs.documents && Object.entries(selectedDocs.documents).map(([key, url]: [string, any], i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-teal-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{key}</p>
                        <p className="text-xs text-slate-400 truncate">{url || 'No URL available'}</p>
                      </div>
                    </div>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 text-sm ml-4 whitespace-nowrap">
                        Open ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedDocs(null)} className="bg-slate-800 text-white hover:bg-slate-700 w-full">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Verification;
