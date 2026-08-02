import React from 'react';
import { Card } from '../ui/card';

const mockTasks = [
  { id: 1, title: 'Approve 5 Advocate Profiles', time: 'Overdue', urgent: true },
  { id: 2, title: 'Review Property Search Report #102', time: 'Today' },
  { id: 3, title: 'Process Pending Payouts', time: 'Today' },
  { id: 4, title: 'Check Support Escalations', time: 'Tomorrow' },
];

export const PendingTasks = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Pending Actions</h3>
      </div>
      
      <div className="space-y-3">
        {mockTasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <input type="checkbox" id={`task-${task.id}`} className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
            <div className="flex-1">
              <label 
                htmlFor={`task-${task.id}`}
                className="text-sm font-medium text-slate-700 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 leading-none"
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
        ))}
      </div>
    </Card>
  );
};
