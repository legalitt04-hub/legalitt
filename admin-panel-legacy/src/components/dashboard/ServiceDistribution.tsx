import React from 'react';
import { Card } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Legal Notice', value: 45 },
  { name: 'Legal Advice', value: 25 },
  { name: 'FIR Draft', value: 15 },
  { name: 'Property Search', value: 10 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#f59e0b', '#0f766e', '#3b82f6', '#8b5cf6', '#cbd5e1'];

export const ServiceDistribution = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white h-[350px] flex flex-col">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Service Distribution</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
