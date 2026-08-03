import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Video, Phone, Users, MapPin } from 'lucide-react';
import api from '../../lib/api';

const getIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-teal-600" />;
    case 'phone': return <Phone className="w-4 h-4 text-amber-600" />;
    default: return <Users className="w-4 h-4 text-blue-600" />;
  }
};

export const TodaySchedule = () => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/admin/cases');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const items = res.data.data.slice(0, 3).map((c: any, index: number) => ({
            time: index === 0 ? '10:00 AM' : index === 1 ? '02:30 PM' : '04:45 PM',
            title: c.title || 'Legal Case Hearing',
            type: 'video',
            detail: c.assignedAdvocate?.name ? `Adv. ${c.assignedAdvocate.name}` : 'Client Review'
          }));
          setSchedule(items);
        }
      } catch (err) {
        console.error('Failed to load today schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-slate-900">Today's Schedule</h3>
        <a href="/calendar" className="text-sm text-teal-600 font-medium hover:text-teal-700">Open Calendar</a>
      </div>
      
      <div className="relative pl-3 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">Loading schedule...</p>
        ) : schedule.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No events scheduled for today</p>
        ) : (
          schedule.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs shrink-0">
                {getIcon(item.type)}
              </div>
              <div>
                <span className="text-xs font-semibold text-teal-600">{item.time}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
