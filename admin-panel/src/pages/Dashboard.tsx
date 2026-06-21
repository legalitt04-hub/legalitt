import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, CreditCard, CalendarCheck, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, revRes, regRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue?period=monthly'),
          api.get('/admin/recent-registrations')
        ]);

        setStats(statsRes.data.data);
        
        // Format revenue data for chart
        const formattedRev = revRes.data.data.map((d: any) => ({
          name: `${d._id.month}/${d._id.year}`,
          revenue: d.revenue
        }));
        setRevenueData(formattedRev);

        setRecentRegistrations(regRes.data.data.slice(0, 5));
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

  const kpis = [
    { 
      title: "Total Revenue", 
      value: formatCurrency(stats?.totalRevenue), 
      trend: "All time", 
      icon: CreditCard, 
      color: "from-blue-500 to-indigo-500" 
    },
    { 
      title: "Verified Advocates", 
      value: formatNumber(stats?.totalAdvocates), 
      trend: "Active on platform", 
      icon: UserCheck, 
      color: "from-teal-500 to-emerald-500" 
    },
    { 
      title: "Total Clients", 
      value: formatNumber(stats?.totalClients), 
      trend: `${stats?.userGrowth >= 0 ? '+' : ''}${stats?.userGrowth || 0}% this month`, 
      icon: Users, 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      title: "Total Bookings", 
      value: formatNumber(stats?.totalBookings), 
      trend: `${stats?.completionRate || 0}% completion`, 
      icon: CalendarCheck, 
      color: "from-amber-500 to-orange-500" 
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Here's what's happening on Legalitt today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${kpi.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            <Card className="relative p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden h-full rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${kpi.color} shadow-lg`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="flex items-center text-teal-400 font-medium bg-teal-400/10 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {kpi.trend}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Recent Registrations Feed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800 rounded-2xl h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                Recent Registrations
              </h3>
              <Link to="/users" className="text-teal-400 text-sm flex items-center hover:underline">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto hidden-scrollbar space-y-4">
              {recentRegistrations.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  No recent registrations.
                </div>
              ) : (
                recentRegistrations.map((user, i) => (
                  <div key={user._id || i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-slate-300 font-medium">{user.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'advocate' ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'}`}>
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
