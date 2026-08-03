import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Tag, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.data?.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code,
        discountType,
        discountValue: Number(discountValue),
        expiryDate: expiryDate || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        usageLimit: Number(usageLimit)
      });
      setIsModalOpen(false);
      setCode('');
      fetchCoupons();
    } catch (err) {
      alert('Failed to create coupon code');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon code?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert('Failed to delete coupon');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Promo Coupons & Discounts
          </h2>
          <p className="text-slate-500 text-sm mt-1">Create promotional discount codes for chat consultations and legal notice requests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">No promo coupons active. Click Create Coupon to add one.</div>
        ) : (
          coupons.map(cop => (
            <Card key={cop._id} className="p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono font-bold text-slate-900 text-lg tracking-wider bg-slate-100 px-3 py-1 rounded border border-slate-200">{cop.code}</span>
                  <span className="text-sm font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                    {cop.discountType === 'percentage' ? `${cop.discountValue}% OFF` : `₹${cop.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Usage Limit: {cop.usageCount || 0} / {cop.usageLimit || 100}</p>
                <p className="text-xs text-slate-400">Expires: {new Date(cop.expiryDate).toLocaleDateString()}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end mt-4">
                <Button onClick={() => handleDelete(cop._id)} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Coupon">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Code</label>
            <Input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. LEGALITT15" className="bg-slate-50 font-mono font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm font-medium">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Value</label>
              <Input type="number" required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="bg-slate-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usage Limit</label>
              <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} className="bg-slate-50" />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline">Cancel</Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
