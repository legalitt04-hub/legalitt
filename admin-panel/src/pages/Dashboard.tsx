import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, UserCheck, CreditCard, CalendarCheck, TrendingUp, TrendingDown, Activity, ArrowRight, Server, Database, MemoryStick, Cpu, Clock, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, revRes, actRes, regRes, healthRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue?period=monthly'),
          api.get('/admin/activity'),
          api.get('/admin/recent-registrations'),
          api.get('/admin/health')
        ]);

        setStats(statsRes.data.data);
        
        const formattedRev = revRes.data.data.map((d: any) => ({
          name: `${d._id.year}-${String(d._id.month).padStart(2,'0')}`,
          revenue: d.revenue
        }));
        setRevenueData(formattedRev);

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

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-IN').format(val || 0);

  if (loading) {
    return <div className="text-white text-center py-20">Loading Dashboard...</div>;
  }

  const dbOk = health?.database?.status === 'connected';
  const memPc = health ? Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100) : 0;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview, analytics & system health</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Clients */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stats?.totalClients)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Total Clients</p>
            <div className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md ${stats?.userGrowth >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {stats?.userGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(stats?.userGrowth || 0)}% this month
            </div>
          </div>
        </Card>

        {/* Verified Advocates */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stats?.totalAdvocates)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Verified Advocates</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300">
              Active on platform
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(stats?.totalRevenue)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Total Revenue</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300">
              All time
            </div>
          </div>
        </Card>

        {/* Total Bookings */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stats?.totalBookings)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Total Bookings</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300">
              {stats?.completionRate || 0}% completion
            </div>
          </div>
        </Card>

        {/* Pending Verifications */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stats?.pendingVerifications)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Pending Verifications</p>
            <div className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md ${stats?.pendingVerifications > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
              {stats?.pendingVerifications > 0 ? '⚠️ Needs attention' : '✓ All clear'}
            </div>
          </div>
        </Card>

        {/* New Users This Month */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{formatNumber(stats?.newUsersThisMonth)}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">New Users This Month</p>
            <div className="mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-400">
              {stats?.newBookingsThisMonth || 0} bookings
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
              <p className="text-sm text-slate-400">Income from completed bookings</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
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
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="registrations" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4, fill: '#14B8A6' }} />
                <Line type="monotone" dataKey="bookings" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations Feed */}
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Recent Registrations</h3>
              <p className="text-sm text-slate-400">Newest users on the platform</p>
            </div>
            <Link to="/users" className="text-teal-400 text-sm flex items-center hover:underline bg-teal-500/10 px-3 py-1 rounded-lg">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">No recent registrations.</td></tr>
                ) : (
                  recentRegistrations.map((user, i) => (
                    <tr key={user._id || i} className="border-b border-slate-800/50">
                      <td className="py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-medium text-xs">{user.name?.charAt(0) || '?'}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'advocate' ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
      </div>
    </div>
  );
};

export default Dashboard;
