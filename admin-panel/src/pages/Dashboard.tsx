import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, FileCheck, FileText, IndianRupee, Users } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { CasePipeline } from '../components/dashboard/CasePipeline';
import { ServiceDistribution } from '../components/dashboard/ServiceDistribution';
import { RecentRequestsTable } from '../components/dashboard/RecentRequestsTable';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { PendingTasks } from '../components/dashboard/PendingTasks';
import { RecentPaymentsTable } from '../components/dashboard/RecentPaymentsTable';
import { AdvocatePerformance } from '../components/dashboard/AdvocatePerformance';
import { ServiceMetrics } from '../components/dashboard/ServiceMetrics';
import api from '../lib/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // We'll keep the loading state true briefly to simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[120px] bg-slate-200/50 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[400px] bg-slate-200/50 rounded-xl lg:col-span-2" />
          <div className="h-[400px] bg-slate-200/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise Operations & Health</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Normal
          </span>
          <span className="px-3 py-1.5 bg-white text-slate-600 text-xs font-semibold rounded-full border border-slate-200 shadow-sm">
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Pending Reviews" value={12} icon={AlertCircle} colorClass="text-red-500" trend={{ value: 4, isPositive: false }} />
        <KPICard title="Documents Pending" value={45} icon={FileText} colorClass="text-amber-500" trend={{ value: 12, isPositive: false }} />
        <KPICard title="Draft Approvals" value={8} icon={FileCheck} colorClass="text-blue-500" trend={{ value: 2, isPositive: true }} />
        <KPICard title="Pending Payments" value="₹12.5k" icon={IndianRupee} colorClass="text-orange-500" />
        <KPICard title="Active Requests" value={156} icon={Clock} colorClass="text-teal-500" trend={{ value: 8, isPositive: true }} />
        <KPICard title="Cases In Progress" value={89} icon={Users} colorClass="text-indigo-500" trend={{ value: 15, isPositive: true }} />
      </div>

      {/* Main Grid - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CasePipeline />
          <RecentRequestsTable />
        </div>
        <div className="flex flex-col gap-6">
          <ServiceDistribution />
          <TodaySchedule />
        </div>
      </div>

      {/* Main Grid - Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RecentPaymentsTable />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdvocatePerformance />
            <ServiceMetrics />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <PendingTasks />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
