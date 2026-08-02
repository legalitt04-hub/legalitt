import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const mockPipeline = [
  { id: 'REQ-802', client: 'Aman Sharma', service: 'Legal Notice', status: 'Pending Review', color: 'bg-amber-500' },
  { id: 'REQ-801', client: 'Priya Patel', service: 'Property Search', status: 'Payment Pending', color: 'bg-red-500' },
  { id: 'REQ-800', client: 'Rahul Verma', service: 'FIR Draft', status: 'In Progress', color: 'bg-blue-500' },
  { id: 'REQ-799', client: 'Neha Gupta', service: 'Legal Advice', status: 'Advocate Assigned', color: 'bg-indigo-500' },
];

export const CasePipeline = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Case Pipeline</h3>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">View Board</button>
      </div>
      
      <div className="space-y-3">
        {mockPipeline.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-amber-600 transition-colors">{item.id} • {item.client}</p>
                <p className="text-xs text-slate-500">{item.service}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white text-slate-600 font-medium whitespace-nowrap">
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
