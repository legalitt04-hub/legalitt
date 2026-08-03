import React from 'react';
import { Card } from '../ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CountUp } from '../ui/count-up';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
  prefix?: string;
}

export const KPICard = ({ title, value, icon: Icon, trend, colorClass = "text-amber-500", prefix = "" }: KPICardProps) => {
  return (
    <Card className="p-5 flex flex-col justify-between border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-1">
            {prefix && <span>{prefix}</span>}
            {typeof value === 'number' ? (
              <CountUp to={value} />
            ) : (
              <span>{value}</span>
            )}
          </div>
        </div>
        <div className={cn("p-2.5 rounded-xl bg-slate-50", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={cn(
            "font-medium px-2 py-0.5 rounded-full",
            trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-slate-400 ml-2">vs last month</span>
        </div>
      )}
    </Card>
  );
};
