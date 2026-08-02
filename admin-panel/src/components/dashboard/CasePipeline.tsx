import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import api from '../../lib/api';

export const CasePipeline = () => {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await api.get('/admin/cases');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setPipeline(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load case pipeline', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPipeline();
  }, []);

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Case Pipeline</h3>
        <a href="/cases" className="text-sm text-teal-600 font-medium hover:text-teal-700">View Board</a>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">Loading pipeline...</p>
        ) : pipeline.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No cases in pipeline</p>
        ) : (
          pipeline.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-amber-600 transition-colors">{(item._id || 'CASE').substring(0, 8)} • {item.client?.name || 'Client'}</p>
                  <p className="text-xs text-slate-500">{item.title || item.type}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white text-slate-600 font-medium whitespace-nowrap">
                {item.status || 'In Progress'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
