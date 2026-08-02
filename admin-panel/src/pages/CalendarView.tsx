import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Video, MapPin } from 'lucide-react';

const MOCK_EVENTS = [
  { id: 1, title: 'Advocate Verification - Sameer Das', time: '09:00 AM - 09:30 AM', type: 'verification', location: 'Google Meet' },
  { id: 2, title: 'Client Escelation Review', time: '11:00 AM - 12:00 PM', type: 'support', location: 'Internal' },
  { id: 3, title: 'Property Docs Review', time: '02:00 PM - 03:00 PM', type: 'case', location: 'Office' },
  { id: 4, title: 'Platform Demo', time: '04:30 PM - 05:15 PM', type: 'meeting', location: 'Zoom' },
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" />
            Calendar & Schedule
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage hearings, meetings, and platform tasks.</p>
        </div>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Sidebar / Schedule */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          <Card className="bg-white border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-lg">August 2026</h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {days.map(d => <div key={d} className="text-xs font-semibold text-slate-400 py-1">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {[...Array(31)].map((_, i) => (
                <button 
                  key={i} 
                  className={`
                    h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${i + 1 === today ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4">Today's Schedule</h3>
            <div className="space-y-4 overflow-y-auto hidden-scrollbar pr-2 flex-1">
              {MOCK_EVENTS.map(event => (
                <div key={event.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors border-l-4 border-l-purple-500">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{event.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Video className="w-3 h-3"/> {event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Calendar View Area */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-slate-200 h-full min-h-[600px] flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">Detailed Day View</h3>
              <p className="text-slate-500 text-sm mt-1">Select a day from the mini-calendar to view details.</p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
