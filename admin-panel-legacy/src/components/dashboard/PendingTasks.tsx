import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import api from '../../lib/api';

export const PendingTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingActions = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/support-tickets')
        ]);
        
        const realTasks = [];
        const pendingVerifs = statsRes.data?.data?.pendingVerifications || 0;
        if (pendingVerifs > 0) {
          realTasks.push({ id: 'verif', title: `Review ${pendingVerifs} Advocate KYC Verifications`, time: 'Action Required', urgent: true });
        }

        const openCases = statsRes.data?.data?.pendingCases || 0;
        if (openCases > 0) {
          realTasks.push({ id: 'cases', title: `Review ${openCases} Pending Legal Cases`, time: 'High Priority', urgent: false });
        }

        if (Array.isArray(ticketsRes.data?.data)) {
          const openTickets = ticketsRes.data.data.filter((t: any) => t.status === 'open');
          if (openTickets.length > 0) {
            realTasks.push({ id: 'tickets', title: `Respond to ${openTickets.length} Open Support Tickets`, time: 'Today', urgent: true });
          }
        }

        if (realTasks.length === 0) {
          realTasks.push({ id: 'done', title: 'All platform tasks and reviews are clear!', time: 'Up to Date', urgent: false });
        }

        setTasks(realTasks);
      } catch (err) {
        console.error('Failed to load pending tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingActions();
  }, []);

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Pending Actions</h3>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">Checking pending actions...</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
              <input type="checkbox" id={`task-${task.id}`} className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
              <div className="flex-1">
                <label 
                  htmlFor={`task-${task.id}`}
                  className="text-sm font-medium text-slate-700 cursor-pointer leading-tight block"
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${task.urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {task.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
