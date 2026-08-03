import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { UserCheck, Search, ShieldCheck, X, Check, ChevronLeft, ChevronRight, Ban, Upload, FileText } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Advocates = () => {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedAdv, setSelectedAdv] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bulk Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{success: boolean, message: string, data?: any} | null>(null);
  
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
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to fetch advocate details');
    }
  };

  const handleBulkUpload = async () => {
    if (uploadFiles.length === 0) return alert('Please select at least one file');
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    
    let totalSuccessCount = 0;
    let totalSkippedCount = 0;
    let allErrors: string[] = [];
    let filesProcessed = 0;

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/admin/advocates/bulk-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const filePercent = (progressEvent.loaded * 100) / (progressEvent.total || 100);
            const overallPercent = Math.round(((filesProcessed * 100) + filePercent) / uploadFiles.length);
            setUploadProgress(overallPercent);
          }
        });
        
        filesProcessed++;
        
        if (res.data.success && res.data.data) {
          totalSuccessCount += res.data.data.successCount || 0;
          totalSkippedCount += res.data.data.skippedCount || 0;
          if (res.data.data.errors && res.data.data.errors.length > 0) {
            allErrors = [...allErrors, ...res.data.data.errors.map((e: string) => `[${file.name}] ${e}`)];
          }
        }
      }

      setUploadResult({
        success: true,
        message: `Processed ${uploadFiles.length} file(s) successfully.`,
        data: { successCount: totalSuccessCount, skippedCount: totalSkippedCount, errors: allErrors }
      });
      
      setPage(1);
      setTimeout(() => window.location.reload(), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed for one or more files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-8 relative"
    >
      <Card className="bg-white/50 border-slate-200 backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." 
              className="pl-9 bg-slate-50/50 border-slate-200 text-slate-900 w-full focus-visible:ring-amber-500/50"
            />
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <select 
              value={verificationFilter} 
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-slate-50/50 border border-slate-200 text-slate-900 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-full md:w-48"
            >
              <option value="">All Verifications</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <Button onClick={() => setIsUploadModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex gap-2">
              <Upload className="w-4 h-4" /> Import Data
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : advocates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-50/50 flex items-center justify-center mb-4 border border-slate-200">
              <UserCheck className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No advocates found</h3>
            <p className="max-w-sm text-center">There are no advocates matching your search criteria.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800/50 flex-1">
              {advocates.map((adv: any) => (
                <div key={adv._id} className="p-4 hover:bg-slate-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                        {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-600 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                          {adv.user?.name || 'Unknown'}
                          {!adv.user?.isActive && <Ban className="w-3 h-3 text-red-500" />}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{adv.user?.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${adv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {adv.verificationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-slate-500">Bar Council</p>
                      <p className="text-slate-600 mt-0.5 font-mono">{adv.barCouncilNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Fee</p>
                      <p className="text-amber-400 font-bold mt-0.5">₹{adv.consultationFee || 0}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleView(adv._id)} 
                    variant="outline" size="sm" 
                    className="w-full bg-white border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 text-xs"
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
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/30">
                    <th className="p-4 font-medium sticky left-0 bg-white/95 backdrop-blur z-10">Advocate Details</th>
                    <th className="p-4 font-medium">Bar Council No.</th>
                    <th className="p-4 font-medium">Specialization</th>
                    <th className="p-4 font-medium">Experience</th>
                    <th className="p-4 font-medium">Fee</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right sticky right-0 bg-white/95 backdrop-blur z-10">Actions</th>
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
                        className="border-b border-slate-200/50 hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="p-4 flex items-center gap-3 sticky left-0 bg-white/80 backdrop-blur z-10">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                            {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-600 font-medium text-sm">{adv.user?.name?.charAt(0) || '?'}</span>}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                              {adv.user?.name || 'Unknown'}
                              {!adv.user?.isActive && <Ban className="w-3 h-3 text-red-500" />}
                            </p>
                            <p className="text-xs text-slate-500 truncate" title={adv.user?.email}>{adv.user?.email}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{adv.user?.phone || 'No phone'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-mono text-[13px]">{adv.barCouncilNumber || '—'}</td>
                        <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate">
                          {adv.specializations?.length ? (
                            <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs">
                              {adv.specializations[0]} {adv.specializations.length > 1 && `+${adv.specializations.length - 1}`}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-4 text-sm text-slate-600">{adv.experience ? `${adv.experience} yrs` : '—'}</td>
                        <td className="p-4 text-sm font-bold text-amber-400">₹{adv.consultationFee || 0}</td>
                        <td className="p-4 text-sm text-slate-600 flex flex-col">
                          <span className="flex items-center text-amber-400 font-medium">⭐ {adv.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-slate-500">({adv.rating?.count || 0} reviews)</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${adv.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-400' : adv.verificationStatus === 'pending' || adv.verificationStatus === 'under_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            {adv.verificationStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right sticky right-0 bg-white/80 backdrop-blur z-10">
                          <Button onClick={() => handleView(adv._id)} variant="outline" size="sm" className="bg-white border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-3">
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
              <div className="p-3 border-t border-slate-200 flex items-center justify-between mt-auto bg-slate-50/30">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-3 text-sm text-slate-900 font-medium">
                    {page} <span className="text-slate-500 font-normal">/ {totalPages}</span>
                  </div>
                  <Button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white border-slate-200 text-slate-500 hover:text-slate-900"
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Advocate Profile" maxWidth="max-w-2xl">
        {selectedAdv && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border-2 border-slate-200 flex-shrink-0">
                {selectedAdv.advocate.user?.avatar ? (
                  <img src={selectedAdv.advocate.user.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-600">{selectedAdv.advocate.user?.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  {selectedAdv.advocate.user?.name}
                  {selectedAdv.advocate.verificationStatus === 'approved' && <ShieldCheck className="w-5 h-5 text-amber-500" />}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{selectedAdv.advocate.user?.email}</p>
                <p className="text-sm text-slate-500">{selectedAdv.advocate.user?.phone || 'No phone'}</p>
                
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.advocate.verificationStatus === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    Verification: {selectedAdv.advocate.verificationStatus.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAdv.advocate.user?.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {selectedAdv.advocate.user?.isActive ? 'Account Active' : 'Account Suspended'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase">Bar Council No.</p>
                  <p className="text-sm font-medium text-slate-900 mt-1 font-mono">{selectedAdv.advocate.barCouncilNumber || 'N/A'}</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase">Experience</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedAdv.advocate.experience ? `${selectedAdv.advocate.experience} Years` : 'N/A'}</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase">Fee</p>
                  <p className="text-sm font-medium text-amber-600 mt-1">₹{selectedAdv.advocate.consultationFee || 0}</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase">Rating</p>
                  <p className="text-sm font-medium text-amber-600 mt-1 flex items-center">
                    ⭐ {selectedAdv.advocate.rating?.average?.toFixed(1) || '0.0'} 
                    <span className="text-slate-500 text-xs ml-1">({selectedAdv.advocate.rating?.count || 0})</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAdv.advocate.specializations?.length ? selectedAdv.advocate.specializations.map((spec: string) => (
                    <span key={spec} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-sm text-slate-600">{spec}</span>
                  )) : <span className="text-sm text-slate-500">None provided</span>}
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase mb-2">Bio / About</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedAdv.advocate.about || 'No bio provided.'}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4">
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50">Close</Button>
              <Button onClick={() => {
                toggleUserStatus(selectedAdv.advocate.user._id, selectedAdv.advocate.user.isActive);
                setIsModalOpen(false);
              }} className={`${selectedAdv.advocate.user?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                {selectedAdv.advocate.user?.isActive ? 'Suspend Advocate' : 'Activate Advocate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => { setIsUploadModalOpen(false); setUploadResult(null); setUploadFiles([]); }} title="Bulk Import Advocates">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Supported Formats: CSV or Excel (.xlsx, .xls)</h4>
            <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
              <li><b>name</b>: Full name</li>
              <li><b>email</b>: Valid unique email</li>
              <li><b>phone</b>: Valid phone number</li>
              <li><b>barCouncilNumber</b>: Unique Bar Council ID</li>
              <li><b>experience</b>: Number of years</li>
              <li><b>consultationFee</b>: Amount in INR</li>
              <li><b>city</b>: City name</li>
              <li><b>specializations</b>: Comma-separated (e.g. Criminal Law, Family Law)</li>
            </ul>
            <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 inline-block px-2 py-1 rounded">Note: Default password will be set to Legalitt@123 for all imported advocates.</p>
          </div>

          {!uploadResult ? (
            <>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50 hover:bg-slate-50 transition-colors relative overflow-hidden">
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
                    <div className="w-64 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-sm font-medium text-slate-700">Uploading {uploadProgress}%...</p>
                  </div>
                )}
                
                <FileText className="w-10 h-10 text-slate-400 mb-3" />
                <input 
                  type="file" 
                  multiple
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {uploadFiles.length > 0 && (
                  <div className="mt-4 text-xs text-slate-600 font-medium">
                    {uploadFiles.length} file(s) selected
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleBulkUpload}
                  disabled={uploadFiles.length === 0 || uploading}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {uploading ? 'Processing...' : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </>
          ) : (
            <div className={`mt-2 p-5 rounded-xl border ${uploadResult.success ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 mt-1"><Check className="w-5 h-5" /></div>
                ) : (
                  <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1"><X className="w-5 h-5" /></div>
                )}
                <div className="flex-1">
                  <h4 className={`text-base font-bold ${uploadResult.success ? 'text-emerald-800' : 'text-red-800'}`}>{uploadResult.message}</h4>
                  
                  {uploadResult.data && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-4 text-sm font-medium">
                        <div className="bg-white px-3 py-2 rounded-lg border shadow-sm"><span className="text-emerald-600 mr-2">✓</span>Successfully Imported: <b>{uploadResult.data.successCount}</b></div>
                        <div className="bg-white px-3 py-2 rounded-lg border shadow-sm"><span className="text-amber-600 mr-2">⚠</span>Skipped (Duplicates): <b>{uploadResult.data.skippedCount}</b></div>
                      </div>

                      {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                        <div className="mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
                            Skipped Records Details
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">{uploadResult.data.errors.length} items</span>
                          </div>
                          <ul className="text-[11px] text-slate-600 p-3 max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
                            {uploadResult.data.errors.map((err: string, i: number) => (
                              <li key={i} className="flex gap-2 items-start p-1.5 hover:bg-slate-50 rounded">
                                <span className="text-amber-500 font-bold mt-0.5">•</span>
                                <span className="flex-1 font-mono">{err}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => { setIsUploadModalOpen(false); setUploadResult(null); }} className="bg-slate-900 text-white">Close</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </motion.div>
  );
};

export default Advocates;
