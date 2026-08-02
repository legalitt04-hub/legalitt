import React from 'react';
import { Card } from '../ui/card';
import { Video, Phone, Users, MapPin } from 'lucide-react';

const mockSchedule = [
  { time: '09:00 AM', title: 'Advocate Verification Interview', type: 'video', detail: 'Adv. Sharma' },
  { time: '11:30 AM', title: 'Client Support Escalation', type: 'phone', detail: 'Ticket #4592' },
  { time: '02:00 PM', title: 'Property Docs Review', type: 'meeting', detail: 'Internal Team' },
  { time: '04:15 PM', title: 'Platform Demo', type: 'video', detail: 'Enterprise Client' },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-teal-600" />;
    case 'phone': return <Phone className="w-4 h-4 text-amber-600" />;
    default: return <Users className="w-4 h-4 text-blue-600" />;
  }
};

export const TodaySchedule = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-slate-900">Today's Schedule</h3>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">Open Calendar</button>
      </div>
      
      <div className="relative pl-3 space-y-6 before:absolute before:inset-0 before:ml-[17px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {mockSchedule.map((item, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 group-hover:bg-teal-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
              {getIcon(item.type)}
            </div>
            
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-slate-100 bg-slate-50 shadow-sm group-hover:border-teal-100 group-hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-teal-600">{item.time}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
