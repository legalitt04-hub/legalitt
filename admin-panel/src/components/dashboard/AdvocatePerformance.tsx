import React from 'react';
import { Card } from '../ui/card';
import { Star, TrendingUp } from 'lucide-react';
import { Avatar } from '../ui/avatar';

const mockAdvocates = [
  { id: 1, name: 'Adv. Sameer Das', rating: 4.9, cases: 142, revenue: '₹4.2L', trend: '+12%' },
  { id: 2, name: 'Adv. Priya Sharma', rating: 4.8, cases: 118, revenue: '₹3.8L', trend: '+8%' },
  { id: 3, name: 'Adv. Rohan Gupta', rating: 4.7, cases: 95, revenue: '₹2.9L', trend: '+15%' },
  { id: 4, name: 'Adv. Neha Singh', rating: 4.9, cases: 82, revenue: '₹2.1L', trend: '+5%' },
];

export const AdvocatePerformance = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Top Advocates</h3>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">View Directory</button>
      </div>
      
      <div className="space-y-4 overflow-y-auto hidden-scrollbar flex-1">
        {mockAdvocates.map((adv) => (
          <div key={adv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                {adv.name.split(' ')[1]?.[0]}{adv.name.split(' ')[2]?.[0] || adv.name.split(' ')[1]?.[1]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{adv.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center text-amber-500 text-xs font-medium">
                    <Star className="w-3 h-3 fill-amber-500 mr-1" />
                    {adv.rating}
                  </div>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-slate-500 text-xs">{adv.cases} Cases</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{adv.revenue}</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                {adv.trend}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
