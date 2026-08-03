import React from 'react';
import { Card } from '../ui/card';
import { FileText, Map, ShieldCheck, HeartHandshake } from 'lucide-react';

const metrics = [
  { title: 'AI Drafts Generated', value: '1,248', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Properties Verified', value: '382', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { title: 'Documents Authenticated', value: '891', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { title: 'Court Marriages', value: '156', icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-100' },
];

export const ServiceMetrics = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-slate-900">Service Highlights</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">{m.title}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
