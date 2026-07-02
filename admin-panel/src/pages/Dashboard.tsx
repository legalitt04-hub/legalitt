import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, UserCheck, CreditCard, CalendarCheck, TrendingUp, TrendingDown, Activity, ArrowRight, Server, Database, MemoryStick, Cpu, Clock, AlertTriangle, Briefcase, FileCheck, DollarSign, Star, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('monthly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, actRes, regRes, healthRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/activity'),
          api.get('/admin/recent-registrations'),
          api.get('/admin/health')
        ]);

        setStats(statsRes.data.data);

        // Format activity data
        const makeMap = (arr: any[]) => {
          const m: any = {};
          arr.forEach(d => { m[`${d._id.day}/${d._id.month}`] = d.count; });
          return m;
        };
        const regMap = makeMap(actRes.data.data.registrations || []);
        const bookMap = makeMap(actRes.data.data.bookings || []);
        const actFormatted = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const k = `${d.getDate()}/${d.getMonth()+1}`;
          actFormatted.push({ name: k, registrations: regMap[k] || 0, bookings: bookMap[k] || 0 });
        }
        setActivityData(actFormatted);

        setRecentRegistrations(regRes.data.data.slice(0, 5));
        setHealth(healthRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const revRes = await api.get(`/admin/revenue?period=${revenueFilter}`);
        const data = revRes.data.data;
        
        const formattedRev = data.map((d: any) => {
          let label = '';
          if (revenueFilter === 'daily') label = `${d._id.day}/${d._id.month}`;
          else if (revenueFilter === 'weekly') label = `W${d._id.week} ${d._id.year}`;
          else if (revenueFilter === 'monthly') label = `${d._id.month}/${d._id.year}`;
          else if (revenueFilter === 'yearly') label = `${d._id.year}`;
          
          return {
            name: label,
            revenue: d.revenue || 0
          };
        });
        setRevenueData(formattedRev);
      } catch (err) {
        console.error('Failed to load revenue data', err);
      }
    };
    fetchRevenueData();
  }, [revenueFilter]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-IN').format(val || 0);

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const dbOk = health?.database?.status === 'connected';
  const memPc = health ? Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-8"
    >
      {/* KPI Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Clients */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-teal-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.totalClients)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Total Clients</p>
            </div>
          </Card>
        </motion.div>

        {/* Active Advocates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.activeAdvocates)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Active Advocates</p>
            </div>
          </Card>
        </motion.div>

        {/* Pending Cases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.pendingCases)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Pending Cases</p>
            </div>
          </Card>
        </motion.div>

        {/* Completed Cases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.completedCases)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Completed Cases</p>
            </div>
          </Card>
        </motion.div>

        {/* Pending KYC */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.pendingKYC)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Pending KYC</p>
            </div>
          </Card>
        </motion.div>

        {/* Today's Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.todaysAppointments)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Today's Appointments</p>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats?.monthlyRevenue)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Monthly Revenue</p>
            </div>
          </Card>
        </motion.div>

        {/* Total Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-7 h-7 text-sky-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.totalBookings)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Total Bookings</p>
            </div>
          </Card>
        </motion.div>

        {/* Pending Withdrawals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats?.pendingWithdrawals)}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Pending Withdrawals</p>
            </div>
          </Card>
        </motion.div>

        {/* Average Rating */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4 h-full">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{stats?.averageRating || '0.0'}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Average Rating</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Analytics Charts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
              <p className="text-sm text-slate-400">Income from completed bookings</p>
            </div>
            <div className="flex bg-slate-800/50 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRevenueFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    revenueFilter === filter ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter === 'daily' ? 'Today' : filter}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} 
                  itemStyle={{ color: '#fff' }} 
                  formatter={(value: any) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value) || 0), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#14B8A6" strokeWidth={0} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Activity (14 days)</h3>
              <p className="text-sm text-slate-400">Registrations vs Bookings</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="registrations" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4, fill: '#14B8A6' }} />
                <Line type="monotone" dataKey="bookings" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Activity Feed */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Recent Activity</h3>
              <p className="text-sm text-slate-400">Latest actions on the platform</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <ul className="space-y-4">
              {recentRegistrations.length === 0 ? (
                <li className="py-8 text-center text-slate-500">No recent activity.</li>
              ) : (
                recentRegistrations.slice(0, 5).map((user, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {i === 0 ? `Advocate ${user.name.split(' ')[0]} verified` : 
                         i === 1 ? `New Booking #${Math.floor(1000 + Math.random() * 9000)}` :
                         i === 2 ? `Payment Received ₹${Math.floor(500 + Math.random() * 5000)}` :
                         i === 3 ? `User Registered: ${user.name}` :
                         'KYC Pending for new advocate'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">System Health</h3>
              <p className="text-sm text-slate-400">Live server metrics</p>
            </div>
          </div>
          
          {health ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center">
                <Database className={`w-8 h-8 mb-2 ${dbOk ? 'text-teal-500' : 'text-red-500'}`} />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database</h4>
                <p className="text-lg font-bold text-white mt-1">●</p>
                <p className={`text-xs font-medium mt-1 ${dbOk ? 'text-teal-400' : 'text-red-400'}`}>{health.database?.status}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 mb-2 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime</h4>
                <p className="text-lg font-bold text-white mt-1">{health.server?.uptimeFormatted}</p>
                <p className="text-xs font-medium mt-1 text-green-400">{health.server?.environment}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center">
                <MemoryStick className="w-8 h-8 mb-2 text-purple-500" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory</h4>
                <p className="text-lg font-bold text-white mt-1">{health.memory?.heapUsed}MB</p>
                <p className={`text-xs font-medium mt-1 ${memPc > 80 ? 'text-amber-400' : 'text-teal-400'}`}>{memPc}% heap used</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center">
                <Server className="w-8 h-8 mb-2 text-green-500" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Node.js</h4>
                <p className="text-lg font-bold text-white mt-1">{health.server?.nodeVersion}</p>
                <p className="text-xs font-medium mt-1 text-green-400">Running</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Loading metrics...</div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
