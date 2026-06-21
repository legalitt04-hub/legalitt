import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { ShieldCheck, Search, Filter, Check, X, Eye } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Verification = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await api.get('/admin/advocates?verificationStatus=under_review');
      setVerifications(res.data.data);
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/advocates/${id}/verify`, { status, note: `Admin ${status}` });
      // Remove from list
      setVerifications(verifications.filter(v => v._id !== id));
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Verification Queue</h1>
          <p className="text-slate-400">Review and approve new advocate registrations.</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading queue...</div>
        ) : verifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
              <ShieldCheck className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
            <p className="max-w-sm text-center">There are currently no pending advocate verifications in the queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
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
                  <tr key={adv._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium">{adv.user?.name?.charAt(0) || '?'}</span>}
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
                      {adv.experienceYears ? `${adv.experienceYears} Years` : '—'}
                    </td>
                    <td className="p-4">
                      {adv.documents && adv.documents.length > 0 ? (
                        <div className="flex gap-2">
                          <Button onClick={() => alert(`Documents for ${adv.user?.name}:\n${adv.documents.map((d: any) => d.url || d.type).join(', ')}`)} variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-teal-400 hover:text-teal-300">
                            <Eye className="w-4 h-4 mr-1" /> View Docs
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No documents</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleVerify(adv._id, 'approved')} size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950">
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button onClick={() => handleVerify(adv._id, 'rejected')} variant="outline" size="sm" className="bg-slate-900 border-red-500/20 text-red-400 hover:bg-red-500/10">
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
    </div>
  );
};

export default Verification;
