import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { CreditCard, Download, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Earnings = () => {
  const [data, setData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const [earnRes, revRes] = await Promise.all([
          api.get('/admin/earnings'),
          api.get('/admin/revenue?period=monthly')
        ]);
        
        setData(earnRes.data.data);

        // Pad to always show last 6 months
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          last6Months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
        }
        
        const revMap: any = {};
        revRes.data.data.forEach((d: any) => {
          revMap[`${d._id.month}/${d._id.year}`] = { revenue: d.revenue, bookings: d.count };
        });

        const formattedRev = last6Months.map(m => {
          const key = `${m.month}/${m.year}`;
          const existing = revMap[key] || { revenue: 0, bookings: 0 };
          return {
            name: `${m.month}/${m.year}`,
            revenue: existing.revenue,
            bookings: existing.bookings
          };
        });
        setRevenueData(formattedRev);
      } catch (err) {
        console.error('Failed to load earnings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const avgBookingValue = data?.totalBookings > 0 ? Math.round((data?.totalRevenue || 0) / data.totalBookings) : 0;

  const handleExport = () => {
    if (!data?.topAdvocates) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Advocate Name,Email,Total Earned,Bookings\n"
      + data.topAdvocates.map((a: any) => `${a.user?.name},${a.user?.email},${a.totalEarned},${a.bookingCount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 p-6 backdrop-blur-sm relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Platform Revenue</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(data?.totalRevenue)}</p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="flex items-center text-teal-400 font-medium bg-teal-400/10 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 mr-1" /> All time
              </span>
              <span className="text-slate-500">{data?.totalBookings || 0} bookings</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 p-6 backdrop-blur-sm relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
            <h3 className="text-sm font-medium text-slate-400 mb-2">This Month's Revenue</h3>
            <p className="text-3xl font-bold text-teal-400">{formatCurrency(data?.thisMonthRevenue)}</p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-slate-500">{data?.thisMonthBookings || 0} bookings paid</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 p-6 backdrop-blur-sm relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
            <h3 className="text-sm font-medium text-slate-400 mb-2">Avg. Booking Value</h3>
            <p className="text-3xl font-bold text-amber-500">{formatCurrency(avgBookingValue)}</p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-slate-500">Per paid booking</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 p-6 backdrop-blur-sm relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
            <h3 className="text-sm font-medium text-slate-400 mb-2">Top Advocates Tracked</h3>
            <p className="text-3xl font-bold text-white">{data?.topAdvocates?.length || 0}</p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-slate-500">This period</span>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Revenue Timeline</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} width={80} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </motion.div>

      {/* Top Advocates Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Top Earning Advocates</h3>
          <p className="text-sm text-slate-400">Ranked by total earnings from paid bookings</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
                <th className="p-4 font-medium">Advocate</th>
                <th className="p-4 font-medium">Specializations</th>
                <th className="p-4 font-medium">Total Earned</th>
                <th className="p-4 font-medium">Bookings</th>
                <th className="p-4 font-medium">Avg / Booking</th>
              </tr>
            </thead>
            <tbody>
              {!data?.topAdvocates?.length ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-8 h-8 mb-2 opacity-50" />
                      <p>No earnings data yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {data.topAdvocates.map((adv: any, i: number) => (
                    <motion.tr 
                      key={adv._id || i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                              {adv.user?.avatar ? <img src={adv.user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300">{adv.user?.name?.charAt(0) || '?'}</span>}
                            </div>
                            {i < 3 && <span className="absolute -top-1 -right-1 text-xs">{['🥇','🥈','🥉'][i]}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{adv.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{adv.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {(adv.advocate?.specializations || []).slice(0, 2).join(', ') || '—'}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-teal-400">{formatCurrency(adv.totalEarned)}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-medium">
                          {adv.bookingCount}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-300">
                        {formatCurrency(adv.avgAmount || Math.round(adv.totalEarned / (adv.bookingCount || 1)))}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Earnings;
